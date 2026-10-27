# Canva から取りこんだ写真（public/img/p-<名前>.jpg）を、サイトで使う WebP 2つ（640・1200）にして、JPG は消す
# 使い方：python3 art/photo/webp.py（Pillow が要る。このリポジトリの依存には入れない）
import glob, os
from PIL import Image
for f in sorted(glob.glob('public/img/p-*.jpg')):
    k = os.path.basename(f)[2:-4]
    im = Image.open(f).convert('RGB')
    for w, q in ((1200, 76), (640, 74)):
        im.resize((w, round(w * 9 / 16)), Image.LANCZOS).save(f'public/img/photo/{k}-{w}.webp', 'WEBP', quality=q, method=6)
    os.remove(f)
    print(k, os.path.getsize(f'public/img/photo/{k}-1200.webp') // 1024, 'KB')
