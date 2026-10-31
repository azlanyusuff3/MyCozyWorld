"""Cut ChatGPT sheets (salon/sprites/sheets/*.png, 3x2 grid, magenta bg) into game sprites.
Usage: python3 salon/sprites/process.py   (run from repo root; needs Pillow + numpy)
Every pose of one character gets the same scale and a bottom-centred baseline, so walking doesn't wobble."""
import json, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SHEETS = os.path.join(HERE, 'sheets')
OUT = 256  # output square size

WALK = [['front_idle', 'front_walk1', 'front_walk2'], ['back_idle', 'back_walk1', 'back_walk2']]
MIRA_SIDE = [['side_idle', 'side_walk1', 'side_walk2'], ['cut', 'wash', 'happy']]
GUEST_POSE = [['side_walk1', 'side_walk2', 'after'], ['sit', 'angry', 'chair']]
ICONS = {'icons_a': [['ic_wash', 'ic_cut', 'ic_color'], ['ic_style', 'ic_pay', 'ic_coffee']],
         'icons_b': [['ic_coin', 'ic_star', 'ic_heart'], ['ic_heartbroken', 'ic_wait', 'ic_crown']],
         'icons_c': [['ic_camera', 'ic_bolt', 'ic_lock'], ['ic_sparkle', 'ic_angry', 'ic_love']]}
STATIONS = [['st_wash', 'st_cut', 'st_color'], ['st_style', 'st_pay', 'st_coffee']]


def key(cell):
    a = np.asarray(cell.convert('RGB')).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(r, b) - g                      # how "magenta" a pixel is
    alpha = np.clip(1 - (m - 60) / 110, 0, 1)
    alpha[(r > 200) & (b > 200) & (g < 90)] = 0
    # despill: pull magenta fringe toward neutral
    lim = g + (np.maximum(r, b) - g) * alpha
    r2, b2 = np.minimum(r, lim), np.minimum(b, lim)
    out = np.dstack([r2, g, b2, alpha * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def cells(path, names):
    sheet = Image.open(path)
    w, h = sheet.size[0] // 3, sheet.size[1] // 2
    res = {}
    for ry, row in enumerate(names):
        for cx, n in enumerate(row):
            if not n:
                continue
            c = key(sheet.crop((cx * w, ry * h, cx * w + w, ry * h + h)))
            a = np.asarray(c)[..., 3]
            a2 = a > 40
            # drop tiny specks: keep bbox of reasonably dense rows/cols
            ys, xs = np.where(a2)
            if not len(ys):
                continue
            res[n] = c.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    return res


def save_group(prefix, imgs, out_names):
    if not imgs:
        return
    biggest = max(max(i.size) for i in imgs.values())
    s = (OUT - 8) / biggest
    for n, im in imgs.items():
        im = im.resize((max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))), Image.LANCZOS)
        can = Image.new('RGBA', (OUT, OUT), (0, 0, 0, 0))
        can.paste(im, ((OUT - im.size[0]) // 2, OUT - 4 - im.size[1]), im)
        name = prefix + n
        can.save(os.path.join(HERE, name + '.webp'), 'WEBP', quality=88, method=6)
        out_names.add(name)


def main():
    names = set()
    p = lambda f: os.path.join(SHEETS, f + '.png')
    if os.path.exists(p('mira_walk')):
        g = cells(p('mira_walk'), WALK)
        if os.path.exists(p('mira_side')):
            g.update(cells(p('mira_side'), MIRA_SIDE))
        save_group('mira_', g, names)
    for who, row2 in [('aiman', ['wash', 'coffee', 'happy']), ('lina', ['pay', 'wave', 'happy'])]:
        if os.path.exists(p(who + '_walk')):
            g = cells(p(who + '_walk'), WALK)
            if os.path.exists(p(who + '_side')):
                g.update(cells(p(who + '_side'), [['side_idle', 'side_walk1', 'side_walk2'], row2]))
            save_group(who + '_', g, names)
    for t in ['biasa', 'makcik', 'remaja', 'vip', 'seleb']:
        if not os.path.exists(p(f'guest_{t}_walk')):
            continue
        g = cells(p(f'guest_{t}_walk'), WALK)
        if os.path.exists(p(f'guest_{t}_pose')):
            g.update(cells(p(f'guest_{t}_pose'), GUEST_POSE))
        save_group(f'guest_{t}_', g, names)
    if os.path.exists(p('stations')):
        for n, im in cells(p('stations'), STATIONS).items():
            save_group('', {n: im}, names)
    for suf in ['pro', 'gold']:
        if os.path.exists(p('stations_' + suf)):
            grid = [[n + '_' + suf for n in row] for row in STATIONS]
            for n, im in cells(p('stations_' + suf), grid).items():
                save_group('', {n: im}, names)
    if os.path.exists(p('decor')):
        grid = [['deco_aquarium', 'deco_tv', 'deco_chandelier'], ['deco_jukebox', 'deco_flowers', 'deco_neon']]
        for n, im in cells(p('decor'), grid).items():
            save_group('', {n: im}, names)
    for sh, grid in ICONS.items():
        if os.path.exists(p(sh)):
            for n, im in cells(p(sh), grid).items():
                save_group('', {n: im}, names)
    if os.path.exists(p('logo')):
        im = key(Image.open(p('logo')))
        im = im.crop(im.getbbox())
        im.thumbnail((800, 400), Image.LANCZOS)
        im.save(os.path.join(HERE, 'logo.webp'), 'WEBP', quality=90)
        names.add('logo')
    if os.path.exists(p('sofas')):
        grid = [['sofa_kampung', 'sofa_mall', 'sofa_resort'], ['sofa_seleb', 'deco_magazine', 'deco_plant']]
        for n, im in cells(p('sofas'), grid).items():
            if n.startswith('sofa_'):
                im.thumbnail((640, 640), Image.LANCZOS)
                im.save(os.path.join(HERE, n + '.webp'), 'WEBP', quality=88)
                names.add(n)
            else:
                save_group('', {n: im}, names)
    if os.path.exists(p('dock')):
        for n, im in cells(p('dock'), [['dock_shop', 'dock_missions', 'dock_map'], ['dock_help', 'dock_music', 'dock_sound']]).items():
            save_group('', {n: im}, names)
    if os.path.exists(p('locs')):
        for n, im in cells(p('locs'), [['loc_kampung', 'loc_mall', 'loc_resort'], ['loc_seleb', None, None]]).items():
            save_group('', {n: im}, names)
    if os.path.exists(p('menu_bg')):
        Image.open(p('menu_bg')).convert('RGB').resize((720, 900), Image.LANCZOS).save(os.path.join(HERE, 'menu_bg.webp'), 'WEBP', quality=85)
        names.add('menu_bg')
    for loc in ['kampung', 'mall', 'resort', 'seleb']:
        if os.path.exists(p('bg_' + loc)):
            Image.open(p('bg_' + loc)).convert('RGB').resize((720, 960), Image.LANCZOS).save(os.path.join(HERE, 'bg_' + loc + '.webp'), 'WEBP', quality=85)
            names.add('bg_' + loc)
    with open(os.path.join(HERE, 'list.json'), 'w') as f:
        json.dump(sorted(names), f, indent=0)
    print(len(names), 'sprites')


if __name__ == '__main__':
    main()
