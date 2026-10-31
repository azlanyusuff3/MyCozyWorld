"""Process hub art: assets/hub/sheets/*.png -> assets/hub/*.webp + list.json. Run from repo root."""
import json, os, sys
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'salon', 'sprites'))
from process import key  # magenta keying
H = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(H, 'sheets'); names = []
def find(n):
    for ext in ('.png', '.jpg', '.jpeg', '.webp'):
        f = os.path.join(S, n + ext)
        if os.path.exists(f):
            try:
                Image.open(f).load(); return f
            except Exception:
                print('SKIP rosak:', f)
    return None
for k in ['arena', 'salon', 'chess']:
    f = find(f'card_{k}')
    if f:
        im = Image.open(f).convert('RGB'); im.thumbnail((900, 900), Image.LANCZOS); im.save(os.path.join(H, f'card_{k}.webp'), 'WEBP', quality=85); names.append('card_' + k)
f = find('logo_chess')
if f:
    im = key(Image.open(f)); im = im.crop(im.getbbox()); im.thumbnail((800, 400), Image.LANCZOS); im.save(os.path.join(H, 'logo_chess.webp'), 'WEBP', quality=90); names.append('logo_chess')
json.dump(names, open(os.path.join(H, 'list.json'), 'w')); print(names)
