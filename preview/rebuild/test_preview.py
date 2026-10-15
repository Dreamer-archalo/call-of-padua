"""CALL OF PADUA preview/rebuild basic browser regression checks.
Run: pip install playwright && playwright install chromium
     python preview/rebuild/test_preview.py
Tests run a local HTTP server and need CDN access for Three.js.
"""
import http.server
import pathlib
import socketserver
import threading
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
class QuietServer(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

def main():
    with socketserver.TCPServer(("127.0.0.1", 0), lambda *args, **kw: QuietServer(*args, directory=str(ROOT), **kw)) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/preview/rebuild/"
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"])
            page = browser.new_page(viewport={"width": 1280, "height": 720})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(url, wait_until="networkidle", timeout=30000)
            assert page.locator("#start").is_enabled(), "Three.js did not load"
            page.locator("#start").click()
            assert page.locator("#hud").is_visible(), "Game HUD not active"
            assert page.locator("#hp").inner_text() == "100"
            assert page.locator("#ammo").inner_text() == "30"
            page.keyboard.down("KeyW")
            page.wait_for_timeout(200)
            page.keyboard.up("KeyW")
            page.keyboard.press("KeyR")
            page.locator("#pause").click(force=True)
            assert page.locator("#pause").inner_text() == "▶"
            page.locator("#pause").click(force=True)
            assert page.locator("#pause").inner_text() != "▶"
            assert not errors, errors
            browser.close()
        print("Preview startup / HUD / move / reload / pause: PASS")

if __name__ == "__main__": main()
