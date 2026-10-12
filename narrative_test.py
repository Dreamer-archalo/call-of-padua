"""Verify narrative integration with a mocked WebGL context (not a GPU rendering test)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text()
for asset in ('style.css','cinematic.css'):
    html=html.replace(f'<link rel="stylesheet" href="{asset}">','<style>'+(ROOT/asset).read_text()+'</style>')
for asset in ('director.js','scenery.js','game.js'):
    html=html.replace(f'<script src="{asset}" defer></script>','')
mock="""new Proxy({}, {get(_target,key){
 if(key==='getShaderParameter'||key==='getProgramParameter')return ()=>true;
 if(key==='getAttribLocation')return ()=>0;
 if(key==='createShader'||key==='createProgram'||key==='createTexture'||key==='createBuffer')return ()=>({});
 if(key==='getShaderInfoLog'||key==='getProgramInfoLog')return ()=>'';
 if(key==='getUniformLocation')return ()=>({});
 if(typeof key==='string' && key===key.toUpperCase())return 0;
 return ()=>{};
}})"""
game=(ROOT/'game.js').read_text().replace("cv.getContext('webgl', { antialias: false, alpha: false, depth: true, powerPreference: 'default' })",mock).replace('render();frameCounter++;','/* rendering disabled in logic smoke */frameCounter++;')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1024,'height':720})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='domcontentloaded')
 for f in ('director.js','scenery.js'):page.add_script_tag(content=(ROOT/f).read_text())
 page.add_script_tag(content=game)
 assert page.locator('#newBtn').is_visible()
 page.click('#newBtn');page.click('[data-char="lea"]');page.click('#beginBtn');page.click('#introNext')
 assert page.evaluate('COP_DEBUG.state.mode')=='play'
 assert page.locator('#storyCaption.visible').count()==1
 assert page.evaluate('COP_DEBUG.triangles')>300
 x=page.evaluate('COP_DEBUG.state.x')
 page.keyboard.down('d');page.wait_for_timeout(350);page.keyboard.up('d')
 assert abs(page.evaluate('COP_DEBUG.state.x')-x)>.01
 page.evaluate('COP_DEBUG.setQuest(4)');page.evaluate('COP_DEBUG.advance()')
 assert page.evaluate('COP_DEBUG.state.mode')=='brief'
 assert 'QUELLO CHE RESTA' in page.locator('#briefTitle').inner_text()
 assert 'LA FREQUENZA MORTA' in page.locator('#chapterNext').inner_text()
 assert page.locator('#chapterOutcome').inner_text()
 page.click('#briefNext');assert page.evaluate('COP_DEBUG.state.mode')=='play'
 page.evaluate('COP_DEBUG.setPosition(15,52)');page.wait_for_timeout(120)
 assert page.locator('#storyLocation').count()==1
 assert not errors,errors
 print('PASS: start, movement, geometry generation, subtitles, chapter transition/report, no page errors')
 browser.close()