"""Regression tests for CALL OF PADUA 0.7 (mock GPU; not a visual test)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).parent
html=(R/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+(R/'style.css').read_text()+'</style>').replace('<link rel="stylesheet" href="cinematic.css">','<style>'+(R/'cinematic.css').read_text()+'</style>')
for f in ('director.js','scenery.js','landmarks.js','vehicles.js','game.js'):
 html=html.replace('<script src="'+f+'" defer></script>','')
mock="""new Proxy({}, {get(_target,key){
 if(key==='getShaderParameter'||key==='getProgramParameter')return ()=>true;
 if(key==='getAttribLocation')return ()=>0;
 if(key==='createShader'||key==='createProgram'||key==='createTexture'||key==='createBuffer')return ()=>({});
 if(key==='getShaderInfoLog'||key==='getProgramInfoLog')return ()=>'';
 if(key==='getUniformLocation')return ()=>({});
 if(typeof key==='string'&&key===key.toUpperCase())return 0;
 return ()=>{};
}})"""
js=(R/'game.js').read_text().replace("cv.getContext('webgl', { antialias: false, alpha: false, depth: true, powerPreference: 'default' })",mock).replace('render();frameCounter++;','frameCounter++;')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':960,'height':720});errors=[]
 page.on('pageerror',lambda err:errors.append(str(err)))
 page.set_content(html)
 page.evaluate('Object.defineProperty(window,"localStorage",{value:{s:{},getItem(k){return this.s[k]||null},setItem(k,v){this.s[k]=v}}})')
 for name in ('director.js','scenery.js','landmarks.js','vehicles.js'):
  page.add_script_tag(content=(R/name).read_text())
 page.add_script_tag(content=js)
 state=lambda:page.evaluate('COP_DEBUG.state')
 assert state()['drawnTriangles']<36000,state()
 assert len(state()['landmarks'])==5,state()
 assert state()['blockedObjectives']==[],state()
 assert state()['nearbyCivilians']>=4,state()
 page.click('#newBtn');page.click('[data-char="lea"]');page.click('#beginBtn');page.click('#introNext')
 assert state()['mode']=='play'
 page.evaluate('window.testPad={connected:true,axes:[0,0,0,0],buttons:Array.from({length:18},()=>({pressed:false}))};Object.defineProperty(navigator,"getGamepads",{configurable:true,value:()=>[null,window.testPad]});')
 start=(state()['x'],state()['z'])
 page.evaluate('testPad.axes[1]=-0.9');page.wait_for_timeout(250)
 end=(state()['x'],state()['z'])
 assert abs(end[0]-start[0])+abs(end[1]-start[1])>.05,(start,end)
 page.evaluate('testPad.axes[1]=0;testPad.buttons[3].pressed=true');page.wait_for_timeout(70)
 assert state()['weapon']!=3,state()
 page.evaluate('testPad.buttons[3].pressed=false');page.wait_for_timeout(50)
 page.evaluate('testPad.buttons[12].pressed=true');page.wait_for_timeout(90)
 assert state()['mode']=='map'
 page.evaluate('testPad.buttons[12].pressed=false');page.wait_for_timeout(60)
 page.evaluate('testPad.buttons[12].pressed=true');page.wait_for_timeout(90)
 assert state()['mode']=='play'
 page.evaluate('testPad.buttons[12].pressed=false');page.wait_for_timeout(50)
 page.evaluate('testPad.buttons[13].pressed=true');page.wait_for_timeout(90)
 assert state()['mode']=='journal'
 page.evaluate('testPad.buttons[13].pressed=false');page.wait_for_timeout(50)
 page.evaluate('testPad.buttons[1].pressed=true');page.wait_for_timeout(90)
 assert state()['mode']=='play'
 page.evaluate('testPad.buttons[1].pressed=false');page.wait_for_timeout(50)
 page.evaluate('testPad.buttons[9].pressed=true');page.wait_for_timeout(90)
 assert state()['mode']=='pause'
 page.evaluate('testPad.buttons[9].pressed=false');page.wait_for_timeout(50)
 page.evaluate('testPad.buttons[9].pressed=true');page.wait_for_timeout(90)
 assert state()['mode']=='play'
 assert not errors,errors
 print('PASS: geometry, collision-free quest targets, survivors, gamepad movement, weapons, map, journal and pause')
 browser.close()
