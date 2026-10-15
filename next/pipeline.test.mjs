import assert from 'node:assert/strict';
import { AssetPipeline, validateManifest } from './asset-pipeline.mjs';

const manifest = {version:1,assets:[{
 id:'citizen-a',url:'./assets/characters/citizen-a.glb',role:'character',
 animations:['idle','walk','run','aim'],license:'CC0',credit:'TEST ONLY'
}],scenes:[{id:'square',instances:[{asset:'citizen-a',position:[1,0,2]}]}]};
assert.equal(validateManifest(manifest),true);
assert.throws(()=>validateManifest({...manifest,assets:[{...manifest.assets[0],animations:['idle']}]}),/idle\/walk\/run/);
assert.throws(()=>validateManifest({...manifest,assets:[{...manifest.assets[0],url:'../secret.glb'}]}),/local/);
let calls=0;const nodes=[];
const scene={add:n=>nodes.push(n),remove:n=>nodes.splice(nodes.indexOf(n),1)};
const loader=async()=>({scene:{clone:()=>({position:{set(){}},rotation:{},scale:{set(){}},userData:{}})}});
const pipeline = new AssetPipeline({loader:async x=>{calls++;return loader(x)},scene});
pipeline.manifest=manifest;
await pipeline.loadScene('square');
assert.equal(calls,1);assert.equal(nodes.length,1);
pipeline.unloadScene('square');
assert.equal(nodes.length,0);
console.log('asset pipeline checks OK');
