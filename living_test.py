"""Living City 0.8 regression: uses WebGL mock, not a physical GPU."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).parent
html=(root/'index.html').read_text()
for f in ['style.css','cinematic.css']:
    html=html.replace(f'<link rel="stylesheet" href="{f}">',f'<style>{(root/f).read_text()}</style>')
scripts=['director.js','scenery.js','landmarks.js','vehicles.js','living_city.js','game.js']
for f in scripts:
    html=html.replace(f'<script src="{f}" defer></script>','')
mock="""new Proxy({}, {get(_target,key){
 if(key==='getShaderParameter'||key==='getProgramParameter')return ()=>true;
 if(key==='getAttribLocation')return ()=>0;
 if(key==='createShader'||key==='createProgram'||key==='createTexture'||key==='createBuffer')return ()=>({});
 if(key==='getShaderInfoLog'||key==='getProgramInfoLog')return ()=>' ';
 if(key==='getUniformLocation')return ()=>({});
 if(typeof key==='string'&&key===key.toUpperCase())return 0;
 return ()=>{}; }})"""
js=(root/'game.js').read_text().replace("cv.getContext('webgl', { antialias: false, alpha: false, depth: true, powerPreference: 'default' })",mock).replace('render();frameCounter++;','frameCounter++;')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html)
 for f in scripts[:-1]:page.add_script_tag(content=(root/f).read_text())
 page.add_script_tag(content=js)
 get=lambda:page.evaluate('COP_DEBUG.state')
 assert get()['livingCity'] and get()['localConversations']==5 and get()['patrolGuards']==3,get()
 assert get()['blockedObjectives']==[]
 page.click('#newBtn');page.click('[data-char="lea"]');page.click('#beginBtn');page.click('#introNext')
 assert get()['mode']=='play'
 page.evaluate('COP_DEBUG.setPosition(0,63)');page.wait_for_timeout(300)
 old=get()['z'];page.keyboard.down('w');page.wait_for_timeout(650);page.keyboard.up('w');walk=abs(get()['z']-old)
 page.evaluate('COP_DEBUG.setPosition(0,63)');page.wait_for_timeout(200)
 old=get()['z'];page.keyboard.down('Shift');page.keyboard.down('w');page.wait_for_timeout(650);page.keyboard.up('w');page.keyboard.up('Shift');run=abs(get()['z']-old)
 assert run>walk*1.15,(walk,run)
 page.evaluate('COP_DEBUG.setPosition(-111,6)');page.wait_for_timeout(110)
 assert 'OMAR' in page.locator('#interactName').inner_text()
 page.keyboard.press('e');assert get()['mode']=='dialogue'
 page.keyboard.press('e');page.keyboard.press('e')
 assert get()['mode']=='play'
 page.evaluate('COP_DEBUG.setPosition(-135,-7)')
 before=get()['patrolPositions'];page.wait_for_timeout(3600);after=get()['patrolPositions']
 delta=sum(abs(a['x']-b['x'])+abs(a['z']-b['z']) for a,b in zip(after,before))
 assert delta>.05,(before,after)
 assert not errors,errors
 print(f'PASS sprint {walk:.2f}/{run:.2f}, NPC talks, patrols delta={delta:.2f}, no JS exceptions')
 browser.close()
