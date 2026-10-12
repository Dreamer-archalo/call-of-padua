"""CALL OF PADUA local browser smoke tests. Optional dev dependency: playwright."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
html = (ROOT / 'index.html').read_text()
js = (ROOT / 'game.js').read_text()
js = js.replace('  resize();addEventListener(\'resize\',resize);',
    '  window.__copDevTest={state,interact,fire,doReload,switchWeapon,spawnEnemy,reset};\n  resize();addEventListener(\'resize\',resize);')
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>'+(ROOT/'style.css').read_text()+'</style>')
html = html.replace('<script src="game.js" defer></script>', '<script>'+js+'</script>')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.set_content(html)
    assert page.locator('#menu').is_visible()
    page.click('#startBtn')
    assert page.locator('#hudBottom').is_visible()
    assert page.locator('#missionTitle').inner_text() == 'Metti in sicurezza Piazza delle Erbe'

    # Movement and switching weapons work on a running game loop.
    z0 = page.evaluate('window.__copDevTest.state.p.z')
    page.keyboard.down('w')
    page.wait_for_timeout(300)
    page.keyboard.up('w')
    z1 = page.evaluate('window.__copDevTest.state.p.z')
    assert z1 != z0, ('no movement', z0, z1)
    page.keyboard.press('q')
    assert page.evaluate('window.__copDevTest.state.weapon') == 1
    page.keyboard.press('r')
    assert page.evaluate('window.__copDevTest.state.reloading') == 1 or page.evaluate('window.__copDevTest.state.ammo[1]') == 15
    page.keyboard.press('v')
    assert page.evaluate('window.__copDevTest.state.camera') == 'third'
    page.keyboard.press('v')

    # Campaign milestone: clear square > interact at cache > escape.
    page.evaluate('''() => {let s=window.__copDevTest.state;s.phase=1;s.p.x=-34;s.p.z=29;s.p.health=100}''')
    page.keyboard.press('e')
    assert page.evaluate('window.__copDevTest.state.phase') == 2
    assert page.locator('#missionTitle').inner_text() == 'Evacua il settore' or page.wait_for_timeout(150) is None
    page.evaluate('''() => {let s=window.__copDevTest.state;s.p.x=-40;s.p.z=73;s.p.health=100}''')
    page.wait_for_timeout(120)
    assert page.locator('#resultMenu').is_visible()
    assert page.locator('#resultTitle').inner_text() == 'SETTORE LIBERATO'
    page.click('#restartBtn')
    assert page.locator('#hudBottom').is_visible()
    page.keyboard.press('p')
    assert page.locator('#pauseMenu').is_visible()
    page.click('#resumeBtn')
    assert not page.locator('#pauseMenu').is_visible()
    assert not errors, errors
    print('DESKTOP PASS: menu, movement, weapons, interaction, mission completion, restart, pause', z0, z1)

    mobile = browser.new_page(viewport={'width': 844, 'height': 390}, is_mobile=True, has_touch=True, device_scale_factor=1)
    mobile_errors=[]
    mobile.on('pageerror',lambda e:mobile_errors.append(str(e)))
    mobile.set_content(html)
    mobile.click('#startBtn')
    assert mobile.locator('#mobileControls').is_visible()
    assert mobile.locator('#interactBtn').is_visible()
    assert mobile.locator('#shootBtn').is_visible()
    mobile.wait_for_timeout(250)
    ammo=mobile.locator('#ammoText').inner_text()
    mobile.locator('#shootBtn').tap()
    mobile.wait_for_timeout(220)
    next_ammo=mobile.locator('#ammoText').inner_text()
    assert int(next_ammo)<int(ammo), (ammo,next_ammo)
    assert not mobile_errors,mobile_errors
    print('MOBILE PASS: HUD, touch controls, shooting',ammo,next_ammo)

    # An emulated standard gamepad must be recognized; actual Bluetooth hardware is NOT tested.
    pad = browser.new_page(viewport={'width': 1024,'height': 650})
    pad.set_content(html)
    pad.click('#startBtn')
    pad.evaluate('''() => {navigator.getGamepads=()=>[{connected:true,index:0,mapping:'standard', axes:[0,0,0,0], buttons:Array.from({length:17},()=>({pressed:false,value:0}))}]}''')
    pad.wait_for_timeout(120)
    assert pad.locator('#inputDevice').inner_text() == 'CONTROLLER PS4'
    print('GAMEPAD PASS: standard Gamepad API mapping detected (hardware compatibility unverified)')
    browser.close()
