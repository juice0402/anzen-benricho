# ホーム画面に追加したときのアイコン（manifest の 192・512 の PNG）を public/favicon.svg から作る
# 使い方：python3 art/icon/render.py（Playwright の Chromium で SVG をそのまま絵にする）
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
svg = (ROOT / 'public/favicon.svg').read_text()
with sync_playwright() as p:
    b = p.chromium.launch()
    for n in (192, 512):
        pg = b.new_page(viewport={'width': n, 'height': n})
        pg.set_content(f'<style>html,body{{margin:0;background:transparent}}svg{{display:block;width:{n}px;height:{n}px}}</style>{svg}')
        pg.screenshot(path=str(ROOT / f'public/icon-{n}.png'), omit_background=True)
    b.close()
