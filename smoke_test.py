"""CALL OF PADUA 0.3 deterministic browser logic smoke test.
Run: xvfb-run -a python smoke_test.py (requires Chromium and Playwright).
In-browser rendering is disabled *only in this logic suite* to keep software GPU CI fast.
A real WebGL draw can be tested by enabling `render()` in the loop.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text()
js=(ROOT/'game.js').read_text().replace('advance(dt);render();requestAnimationFrame(step);','advance(dt);requestAnimationFrame(step);')
css=(ROOT/'style.css').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script src="game.js" defer></script>','<script>Object.defineProperty(window,"localStorage",{value:{getItem:function(){return this.s||null},setItem:function(k,v){this.s=v}}});</script><script>'+js+'</script>')

def finish_dialogue(page, n):
    assert page.locator('#conversation').is_visible(), 'dialogue not opened'
    for _ in range(n):
        page.keyboard.press('Enter')
        page.wait_for_timeout(60)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
    page=browser.new_page(viewport={'width':920,'height':580})
    errors=[]
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content(html,wait_until='domcontentloaded',timeout=30000)
    assert page.locator('#mainMenu').is_visible()
    assert page.evaluate('window.COP_DEBUG.state.webgl')
    page.click('#newBtn')
    assert page.locator('#selectMenu').is_visible()
    page.click('[data-char="nico"]')
    page.click('#beginBtn')
    assert page.locator('#introMenu').is_visible()
    page.click('#introNext')
    assert page.evaluate('window.COP_DEBUG.state.char')=='nico'
    assert page.evaluate('window.COP_DEBUG.state.health')==120
    page.keyboard.press('m');assert page.locator('#mapMenu').is_visible();page.keyboard.press('m')
    page.keyboard.press('j');assert page.locator('#journalMenu').is_visible();page.keyboard.press('j')
    # First safehouse dialogue.
    page.evaluate('window.COP_DEBUG.setPosition(-165,81);window.COP_DEBUG.interact()')
    finish_dialogue(page,3)
    assert page.evaluate('window.COP_DEBUG.state.quest')==1,'prologue stuck'
    page.evaluate('window.COP_DEBUG.setPosition(-113,12);window.COP_DEBUG.interact()')
    assert page.evaluate('window.COP_DEBUG.state.quest')==2,'medicine pickup stuck'
    page.evaluate('window.COP_DEBUG.setPosition(-165,81);window.COP_DEBUG.interact()')
    finish_dialogue(page,3)
    assert page.evaluate('window.COP_DEBUG.state.quest')==3,'medicine delivery stuck'
    page.evaluate('window.COP_DEBUG.setPosition(13,58);window.COP_DEBUG.interact()')
    assert page.evaluate('window.COP_DEBUG.state.quest')==4,'radio interaction stuck'
    page.evaluate('window.COP_DEBUG.endEnemies()')
    page.wait_for_timeout(200)
    assert page.evaluate('window.COP_DEBUG.state.quest')==5,'radio defense stuck'
    finish_dialogue(page,2)
    page.evaluate('window.COP_DEBUG.setPosition(135,179);window.COP_DEBUG.interact()')
    finish_dialogue(page,3)
    assert page.evaluate('window.COP_DEBUG.state.quest')==6,'escort dialogue stuck'
    page.evaluate('window.COP_DEBUG.setPosition(-165,81)')
    page.wait_for_timeout(150)
    page.evaluate('window.COP_DEBUG.interact()')
    finish_dialogue(page,3)
    assert page.evaluate('window.COP_DEBUG.state.quest')==7,'story completion stuck'
    page.keyboard.press('p');assert page.locator('#pauseMenu').is_visible();page.click('#resumeBtn')
    assert page.evaluate('window.COP_DEBUG.state.mode')=='play'
    assert not errors, errors
    print('PASS: WebGL initialization, menu, character select, intro, map, journal, NPC dialogue, medicine, radio, defense, rescue, escort, epilogue, pause; no JS exceptions')
    browser.close()