"""Package generated RGBA sprites at the resolution required by PROMPTS.md."""
import json
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
DEST = HERE / 'cozy-chess-work' / 'cozy-chess' / 'sprites'
records = json.loads((HERE / 'cozy-chess-generation.json').read_text(encoding='utf-8'))
DEST.mkdir(parents=True, exist_ok=True)
for item in records:
    with Image.open(item['path']) as source:
        assert 'A' in source.getbands(), item['key']
        image = source.convert('RGBA')
        assert image.getchannel('A').getextrema() == (0, 255), item['key']
        # Fit the whole original canvas into a square; preserve all generated alpha.
        image.thumbnail((480, 480), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (512, 512))
        canvas.alpha_composite(image, ((512-image.width)//2, 496-image.height))
        canvas.save(DEST / (item['key'] + '.webp'), quality=90, method=6)
        with Image.open(DEST / (item['key'] + '.webp')) as encoded:
            assert encoded.getchannel('A').tobytes() == canvas.getchannel('A').tobytes()
names = [item['key'] + '.webp' for item in records]
(DEST / 'list.json').write_text(json.dumps(names, indent=2) + '\n', encoding='utf-8')
print(f'Packaged {len(names)} transparent 512x512 sprites')
