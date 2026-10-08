import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
import {rotatePolygon,selectionCandidates} from '../dist/geometry.js';
const unit=p=>[Math.cos(p.lat)*Math.cos(p.lon),Math.cos(p.lat)*Math.sin(p.lon),Math.sin(p.lat)];
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} differs from ${b}`);
test('whole-polygon movement carries the anchor and preserves angular shape across date line and poles',()=>{
 const vertices=[{lon:3.12,lat:.5},{lon:-3.12,lat:.55},{lon:3.1,lat:.6}],original=structuredClone(vertices),from=vertices[0];
 for(const to of [{lon:-3.1,lat:.6},{lon:.9,lat:Math.PI/2-.001},{lon:-1.3,lat:-1.5}]){const result=rotatePolygon(vertices,from,to);close(result[0].lon,to.lon);close(result[0].lat,to.lat);
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)close(dot(unit(vertices[i]),unit(vertices[j])),dot(unit(result[i]),unit(result[j])));
 assert.ok(result.every(p=>Number.isFinite(p.lon)&&Number.isFinite(p.lat)&&Math.abs(p.lon)<=Math.PI&&Math.abs(p.lat)<=Math.PI/2));}
 assert.deepEqual(vertices,original);
});
test('zero motion and antipodal transport stay finite; roundtrip restores all vertices',()=>{const p=[{lon:0,lat:0},{lon:.1,lat:.1},{lon:.2,lat:0}],from={lon:0,lat:0},to={lon:3.14,lat:1};assert.deepEqual(rotatePolygon(p,from,from),p);const back=rotatePolygon(rotatePolygon(p,from,to),to,from);back.forEach((x,i)=>{close(x.lon,p[i].lon);close(x.lat,p[i].lat);});assert.ok(rotatePolygon(p,from,{lon:Math.PI,lat:0}).every(x=>Number.isFinite(x.lon)&&Number.isFinite(x.lat)));});
test('overlap candidates deduplicate fill/outline/handles and ignore deleted or draft shapes',()=>{const shapes=[{id:'a'},{id:'b'}];assert.deepEqual(selectionCandidates([{id:'b',kind:'shape'},{id:'a',kind:'shape'},{id:'b',kind:'shape'},{id:'a',kind:'vertex'},{id:'draft'},null],shapes),['b','a']);});
const source=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const bindSource=source.slice(source.indexOf('function bind(){'),source.indexOf('\nasync function init()'));
function harness(){const handlers={},elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,{hidden:true,style:{},addEventListener(){},contains(){return false;},querySelectorAll(){return[];}});return elements.get(id);};
 const canvas={style:{},addEventListener(type,fn){handlers[type]=fn;},setPointerCapture(){},hasPointerCapture(){return true;},releasePointerCapture(){}};
 const polygon={id:'a',type:'polygon',vertices:[{lon:0,lat:0},{lon:.1,lat:0},{lon:0,lat:.1}]};let menuCalls=0,moves=0,saves=0;
 const c={viewer:{canvas,scene:{screenSpaceCameraController:{enableInputs:true}},camera:{moveStart:{addEventListener(){}}}},document:{addEventListener(){},activeElement:null},addEventListener(){},$:element,mode:'select',gesture:null,drag:null,selected:'a',shapes:[polygon],suppressUntil:0,
 performance:{now:()=>1000},closeSelectionMenu(){},selectedShape:()=>polygon,pickAll:()=>[{kind:'shape',id:'b'},{kind:'shape',id:'a'}],screen:e=>({x:e.clientX,y:e.clientY}),onGlobe:p=>({lon:p.x/100,lat:p.y/100}),
 stopDrag(){c.drag=null;c.viewer.scene.screenSpaceCameraController.enableInputs=true;saves++;},applyDrag(p){polygon.vertices=rotatePolygon(c.drag.original,c.drag.anchor,p);moves++;},updateUI(){},chooseAt(){menuCalls++;},pick(){},select(){},renderShape(){},renderHandles(){},save(){},toast(){},setMode(){},finishPolygon(){},deleteSelected(){},C:{Math:{toDegrees:x=>x*180/Math.PI}},insertVertex(){}};
 vm.runInNewContext(bindSource+'\nbind();',c);
 const event=(x,y)=>({isPrimary:true,button:0,pointerId:1,clientX:x,clientY:y,preventDefault(){},stopImmediatePropagation(){}});
 return{handlers,c,event,polygon,counts:()=>({menuCalls,moves,saves})};}
test('clicking a selected polygon in overlap opens chooser without moving it',()=>{const h=harness(),original=structuredClone(h.polygon.vertices);h.handlers.pointerdown(h.event(0,0));assert.equal(h.c.drag.kind,'polygon');assert.equal(h.c.viewer.scene.screenSpaceCameraController.enableInputs,false);h.handlers.pointermove(h.event(2,1));h.handlers.pointerup(h.event(2,1));assert.deepEqual(h.polygon.vertices,original);assert.equal(h.counts().menuCalls,1);assert.equal(h.c.viewer.scene.screenSpaceCameraController.enableInputs,true);});
test('dragging selected polygon moves all vertices, saves and restores camera without opening chooser',()=>{const h=harness();h.handlers.pointerdown(h.event(0,0));h.handlers.pointermove(h.event(20,10));assert.equal(h.counts().moves,1);h.handlers.pointerup(h.event(20,10));close(h.polygon.vertices[0].lon,.2);close(h.polygon.vertices[0].lat,.1);assert.equal(h.counts().menuCalls,0);assert.equal(h.counts().saves,1);assert.equal(h.c.viewer.scene.screenSpaceCameraController.enableInputs,true);assert.equal(h.c.drag,null);});
