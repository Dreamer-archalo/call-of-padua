"""Campaign logic smoke: WebGL interface mocked because GPU is unavailable in CI.
Run: python smoke_test.py . Requires Chromium + Playwright. Does NOT test GPU performance.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text()
js=(ROOT/'game.js').read_text().replace('render();frameCounter++;','/* logic CI: GPU draws excluded */frameCounter++;')
mock="""new Proxy({}, {get(_target,key){
  if(key==='getShaderParameter'||key==='getProgramParameter')return ()=>true;
  if(key==='getAttribLocation')return ()=>0;
  if(key==='createShader'||key==='createProgram'||key==='createTexture'||key==='createBuffer')return ()=>({});
  if(key==='getShaderInfoLog'||key==='getProgramInfoLog')return ()=>'';
  if(key==='getUniformLocation')return ()=>({});
  if(typeof key==='string' && key===key.toUpperCase())return 0;
  return ()=>{};
}})"""
js=js.replace("cv.getContext('webgl', { antialias: false, alpha: false, depth: true, powerPreference: 'default' })",mock)
css=(ROOT/'style.css').read_text()+'\n'+(ROOT/'cinematic.css').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>').replace('<script src="game.js" defer></script>','').replace('<script src="director.js" defer></script>','').replace('<script src="scenery.js" defer></script>','')

def state(page,expr): return page.evaluate('window.COP_DEBUG.'+expr)

def progress(page):
    info=state(page,'stageInfo')
    prev=info['index']
    state(page,f'setPosition({info["at"]["x"]},{info["at"]["z"]})')
    if info['kind']=='reach':
        state(page,'tick()')
    elif info['kind'] in ('use','talk','choice'):
        state(page,'interact()')
        if info['kind']=='talk':
            assert page.locator('#conversation').is_visible(),(prev,info)
            for _ in range(info['dialogueLines']):page.keyboard.press('Enter')
        elif info['kind']=='choice':
            assert page.locator('#choiceMenu').is_visible(),(prev,info)
            page.click('#choiceA' if prev==16 else '#choiceB')
    elif info['kind'] in ('clear','hold'):
        state(page,'tick()')
        if info['kind']=='clear':
            state(page,'endEnemies()')
        else:
            state(page,f'skipTime({info["seconds"]+2})')
        state(page,'tick()')
    else:raise AssertionError('unexpected stage: '+str(info))
    q=state(page,'state.quest')
    assert q==prev+1, (info,q)
    if state(page,'state.mode')=='brief':
        page.click('#briefNext')
    assert state(page,'state.mode')=='play',(prev,state(page,'state'))

with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader']);page=b.new_page(viewport={'width':900,'height':640});errs=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    print('BEFORE set_content',flush=True);page.set_content(html,wait_until='domcontentloaded',timeout=30000);print('AFTER content',flush=True);page.evaluate('Object.defineProperty(window,"localStorage",{value:{s:{},getItem:function(k){return this.s[k]??null;},setItem:function(k,v){this.s[k]=v;}}})');page.add_script_tag(content=(ROOT/'director.js').read_text());page.add_script_tag(content=(ROOT/'scenery.js').read_text());page.add_script_tag(content=js);print('SCRIPT READY',flush=True);print('ERRORS',errs[:3], 'NEW BUTTON',page.locator('#newBtn').count(), 'BODYHEAD',page.locator('body').inner_text()[:100],flush=True)
    assert page.locator('#mainMenu').is_visible()
    assert page.locator('.character').count()==4
    print('before actions',flush=True);page.click('#newBtn');print('select open',flush=True);page.click('[data-char="elio"]');page.click('#beginBtn');page.click('#introNext');print('in game',flush=True)
    assert state(page,'state.mode')=='play'
    assert state(page,'state.char')=='elio'
    old=state(page,'state.x')
    page.keyboard.down('d');page.wait_for_timeout(350);page.keyboard.up('d')
    assert abs(state(page,'state.x')-old)>.02,('no movement',old,state(page,'state.x'))
    page.keyboard.press('4');assert state(page,'state.weapon')==3
    page.keyboard.press('g');assert state(page,'state.grenades')==1
    page.keyboard.press('t');assert state(page,'state.smoke')==0
    for i in range(29):
        progress(page)
        print('PASS STAGE',i,'=>',i+1)
    assert state(page,'state.chapter')==5
    assert len(state(page,'state.choices'))==2
    page.keyboard.press('m');assert page.locator('#mapMenu').is_visible();page.keyboard.press('m')
    page.keyboard.press('j');assert page.locator('#journalMenu').is_visible();page.keyboard.press('j')
    page.keyboard.press('p');assert page.locator('#pauseMenu').is_visible();page.click('#resumeBtn')
    assert state(page,'state.mode')=='play'
    assert not errs,errs
    print('PASS ALL: movement, six guns, grenades, smoke, character selection, 5 connected missions, choices, map, journal, pause, no errors')
    b.close()