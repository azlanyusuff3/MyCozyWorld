import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sprites = HERE / 'cozy-chess-work' / 'cozy-chess' / 'sprites'
names = json.loads((sprites / 'list.json').read_text())
assert len(names) == len(set(names)) == 36
preview = Image.new('RGB', (1080, 1152), '#e7dfe9')
draw = ImageDraw.Draw(preview)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
total = 0
for i, name in enumerate(names):
    image = Image.open(sprites / name).convert('RGBA')
    assert image.size == (512, 512), name
    alpha = image.getchannel('A')
    assert alpha.getextrema() == (0, 255), name
    bounds = alpha.getbbox()
    assert bounds and bounds[0] >= 12 and bounds[1] >= 12 and bounds[2] <= 500 and bounds[3] <= 500, (name, bounds)
    x, y = (i % 6) * 180, (i // 6) * 192
    draw.rectangle((x, y, x+179, y+191), fill=('#f8f3e9' if name.startswith('white') else '#d6cadd'))
    image.thumbnail((168, 168), Image.Resampling.LANCZOS)
    preview.paste(image, (x+6, y+2), image)
    draw.text((x+6, y+173), name.replace('.webp',''), fill='#32233e', font=font)
    total += (sprites / name).stat().st_size
preview.save(HERE / 'cozy-chess-preview.jpg', quality=95)
print(f'PASS: 36 RGBA WebP files, all 512x512, transparent safe margins. Total {total/1024/1024:.2f} MiB.')
