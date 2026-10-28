#!/usr/bin/env python3
"""Build frame-by-frame animation assets from the original four Cozy Arena heroes.
The source PNGs are never overwritten. This is cutout animation (not redrawn art).
Run: python -m pip install Pillow && python scripts/generate_hero_frames.py
"""
from pathlib import Path
import json
import math
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
HEROES = ("knight", "archer", "mage", "healer")
SRC = ROOT / "assets" / "heroes"
DST = SRC / "frames"

# (image, offset X/Y as a fraction of original canvas, angle, scale X/Y)
# Changes are deliberately modest so the original costume, face and weapon
# look exactly the same from one frame to the next.
CYCLES = {
    "idle": [
        ("idle",  0.000,  0.000,  0, 1.000, 1.000),
        ("idle",  0.000, -0.004,  0, 1.007, 1.013),
        ("idle",  0.001, -0.007,  1, 1.012, 1.022),
        ("idle",  0.000, -0.004,  0, 1.007, 1.013),
        ("idle", -0.001,  0.000, -1, 1.000, 1.000),
        ("idle",  0.000,  0.002,  0, 0.996, 0.995),
    ],
    "attack": [
        ("idle",   -0.014,  0.015,  -4, 0.962, 0.953),
        ("attack", -0.025,  0.010, -10, 0.970, 0.975),
        ("attack",  0.006, -0.008,  -2, 1.022, 1.020),
        ("attack",  0.046, -0.019,   7, 1.055, 1.010),
        ("attack",  0.054, -0.015,   8, 1.045, 0.995),
        ("attack",  0.026, -0.006,   3, 1.020, 1.000),
        ("idle",    0.004,  0.004,  -3, 0.985, 0.985),
        ("idle",    0.000,  0.000,   0, 1.000, 1.000),
    ],
}
FPS = {"idle": 8, "attack": 14}

def load_art(path):
    if not path.is_file():
        raise FileNotFoundError("Missing source image: " + str(path))
    im = Image.open(path).convert("RGBA")
    # Some older generated PNGs have pure-green chroma-key instead of alpha.
    corners = [im.getpixel(pos) for pos in ((0, 0), (im.width - 1, 0),
                                               (0, im.height - 1), (im.width - 1, im.height - 1))]
    if all(a == 255 and g > 245 and r < 20 and b < 20 for r, g, b, a in corners):
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                if g > 215 and g > max(r, b) * 1.8:
                    px[x, y] = (r, g, b, 0)
    return im

def move_art(im, foot, spec):
    _, ox, oy, angle, sx, sy = spec
    if ox == oy == angle == 0 and sx == sy == 1:
        return im.copy()
    ax, ay = foot
    theta = math.radians(angle)
    ca, sa = math.cos(theta), math.sin(theta)
    a, b = ca / sx, sa / sx
    d, e = -sa / sy, ca / sy
    tx, ty = ox * im.width, oy * im.height
    c = ax - a * (ax + tx) - b * (ay + ty)
    f = ay - d * (ax + tx) - e * (ay + ty)
    return im.transform(im.size, Image.Transform.AFFINE, (a, b, c, d, e, f),
                        resample=Image.Resampling.BICUBIC, fillcolor=(0, 0, 0, 0))

def make():
    DST.mkdir(parents=True, exist_ok=True)
    manifest = {"format": "PNG", "mode": "RGBA",
                "source": "Original assets/heroes/{hero}_idle.png and {hero}_attack.png",
                "note": "Same dimensions as original source PNG; original images unchanged.",
                "heroes": {}}
    preview = Image.new("RGB", (8 * 138, 4 * 174), (35, 45, 54))
    draw = ImageDraw.Draw(preview)
    for row, hero in enumerate(HEROES):
        art = {pose: load_art(SRC / f"{hero}_{pose}.png") for pose in ("idle", "attack")}
        if art["idle"].size != art["attack"].size:
            raise ValueError(f"Input dimensions disagree for {hero}: "
                             f"{art['idle'].size} / {art['attack'].size}")
        w, h = art["idle"].size
        bbox = art["idle"].getchannel("A").getbbox() or (0, 0, w, h)
        foot = ((bbox[0] + bbox[2]) / 2, bbox[3] - 2)
        info = {"width": w, "height": h, "animations": {}}
        for cycle, poses in CYCLES.items():
            folder = DST / hero / cycle
            folder.mkdir(parents=True, exist_ok=True)
            for old in folder.glob("*.png"):
                old.unlink()
            paths = []
            for i, spec in enumerate(poses):
                frame = move_art(art[spec[0]], foot, spec)
                out = folder / f"{i:02d}.png"
                frame.save(out, "PNG", optimize=True, compress_level=9)
                paths.append(str(out.relative_to(ROOT)).replace("\\", "/"))
                assert Image.open(out).size == (w, h)
                if cycle == "attack":
                    thumb = frame.copy()
                    thumb.thumbnail((130, 138), Image.Resampling.LANCZOS)
                    x = i * 138 + (138 - thumb.width) // 2
                    y = row * 174 + 18 + (146 - thumb.height) // 2
                    preview.paste(thumb, (x, y), thumb)
            info["animations"][cycle] = {"frames": len(poses),
                                           "fps": FPS[cycle], "loop": cycle == "idle",
                                           "files": paths}
        manifest["heroes"][hero] = info
        draw.text((row * 0 + 8, row * 174 + 6), hero.upper(), fill=(255, 255, 255))
        print(hero, w, h, sum(len(v) for v in CYCLES.values()), "frames")
    (DST / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    preview.save(DST / "preview.png", optimize=True)
    (DST / "README.md").write_text(
        "# Cozy Arena original-character animation frames\n\n"
        "Four heroes: knight, archer, mage, healer. Each has 6 idle PNG frames "
        "and 8 attack PNG frames, all transparent RGBA at exactly the same pixel "
        "dimensions as the original source PNGs. Source files remain unchanged.\n\n"
        "View preview.png to compare the attack frames side by side. "
        "Animation FPS and file paths are in manifest.json.\n\n"
        "These are cutout/transform frames from the original idle and attack poses, "
        "not individually redrawn limb animations. The live game currently uses "
        "its old two-pose system until an animation loader is integrated.\n",
        encoding="utf-8")
    print("Done", DST)

if __name__ == "__main__":
    make()
