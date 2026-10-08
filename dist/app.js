import {destination,circleRing,insertVertex,clampRadius,restoreShapes,rotatePolygon,selectionCandidates} from './geometry.js';
const $=id=>document.getElementById(id), KEY='cesium-advanced-controls-v1';
let C,viewer,mode='select',selected=null,draft=null,drag=null,gesture=null,suppressUntil=0,toastTimer;
let shapes=[],handles=[],visuals=new Map(),meta=new Map();
const ui={circle:'Click the globe to place the circle centre.',polygon:'Click to add vertices. Double-click or press Enter to finish.',select:'Select a shape to edit. Drag empty globe to orbit; scroll to zoom.'};
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
function save(){try{localStorage.setItem(KEY,JSON.stringify({version:1,shapes}));$('saved').textContent='SAVED ON THIS DEVICE';}catch{$('saved').textContent='LOCAL SAVE UNAVAILABLE';}}
const uid=()=>crypto.randomUUID();
const selectedShape=()=>shapes.find(s=>s.id===selected);
function cart(p){return C.Cartesian3.fromRadians(p.lon,p.lat,0);}
function geo(p){const c=C.Cartographic.fromCartesian(p);return{lon:c.longitude,lat:c.latitude};}
function geodesic(a,b){return new C.EllipsoidGeodesic(new C.Cartographic(a.lon,a.lat),new C.Cartographic(b.lon,b.lat));}
function midpoint(a,b){try{const p=geodesic(a,b).interpolateUsingFraction(.5);return{lon:p.longitude,lat:p.latitude};}catch{return destination(a,0,10);}}
function screen(e){const r=viewer.canvas.getBoundingClientRect();return new C.Cartesian2(e.clientX-r.left,e.clientY-r.top);}
function onGlobe(p){const ray=viewer.camera.getPickRay(p);if(!ray)return null;const hit=viewer.scene.globe.pick(ray,viewer.scene);return hit?geo(hit):null;}
function pickAll(p){return viewer.scene.drillPick(p,undefined,12,12).map(h=>meta.get(h.id?.id)).filter(Boolean);}
function pick(p){const hits=pickAll(p);return hits.find(h=>h.kind!=='shape')||hits[0];}
function closeSelectionMenu(){const menu=$('selectionMenu');const hadFocus=menu.contains(document.activeElement);menu.hidden=true;menu.replaceChildren();if(hadFocus)viewer.canvas.focus({preventScroll:true});}
function chooseAt(position,event){
 const ids=selectionCandidates(pickAll(position),shapes);
 closeSelectionMenu();
 if(ids.length<2){select(ids[0]||null);return;}
 const menu=$('selectionMenu');
 const title=document.createElement('div');title.className='menu-heading';title.textContent=`${ids.length} overlapping shapes`;menu.append(title);
 for(const id of ids){const s=shapes.find(s=>s.id===id),button=document.createElement('button');button.type='button';button.setAttribute('role','menuitemradio');button.setAttribute('aria-checked',String(selected===id));
 const name=document.createElement('span');name.textContent=`${s.type==='circle'?'Circle':'Polygon'} ${String(shapes.indexOf(s)+1).padStart(2,'0')}`;
 const detail=document.createElement('small');detail.textContent=(s.type==='circle'?`${(s.radius/1000).toFixed(1)} km radius`:`${s.vertices.length} vertices`)+(selected===id?' · selected':'');
 button.append(name,detail);button.onclick=()=>{select(id);toast('Shape selected. Drag its handles'+(s.type==='polygon'?' or its interior to move it.':'.'));};menu.append(button);}
 menu.hidden=false;
 menu.style.left=`${Math.max(8,Math.min(event.clientX+12,innerWidth-menu.offsetWidth-8))}px`;
 menu.style.top=`${Math.max(8,Math.min(event.clientY+12,innerHeight-menu.offsetHeight-8))}px`;
 menu.querySelector('button').focus({preventScroll:true});
}

function entity(options,data){const e=viewer.entities.add(options);meta.set(e.id,data);return e;}
function remove(e){if(!e)return;meta.delete(e.id);viewer.entities.remove(e);}
function removeVisual(id){const v=visuals.get(id);if(v){remove(v.fill);remove(v.line);visuals.delete(id);}}
function renderShape(s,isDraft=false){
 const vertices=s.type==='circle'?circleRing(s):s.vertices;
 let v=visuals.get(s.id);if(!v){v={};visuals.set(s.id,v);}
 const active=s.id===selected||isDraft,color=C.Color.fromCssColorString(active?'#adf0d0':'#70b5d7');
 const points=vertices.map(cart);
 if(points.length>=3){const hierarchy=new C.PolygonHierarchy(points);if(!v.fill)v.fill=entity({polygon:{hierarchy,material:color.withAlpha(.23),perPositionHeight:false,classificationType:C.ClassificationType.TERRAIN,zIndex:active?2:1,arcType:C.ArcType.GEODESIC}},{kind:'shape',id:s.id});else{v.fill.polygon.hierarchy=hierarchy;v.fill.polygon.material=color.withAlpha(.23);v.fill.polygon.zIndex=active?2:1;}}
 else if(v.fill){remove(v.fill);v.fill=null;}
 if(points.length>=2){const closed=points.length>=3?[...points,points[0]]:points; if(!v.line)v.line=entity({polyline:{positions:closed,width:2,material:color,clampToGround:true,classificationType:C.ClassificationType.TERRAIN,zIndex:active?3:1,arcType:C.ArcType.GEODESIC}},{kind:'shape',id:s.id});else{v.line.polyline.positions=closed;v.line.polyline.material=color;}}
 else if(v.line){remove(v.line);v.line=null;}
 viewer.scene.requestRender();
}
function handlePoint(p,data,hollow=false){return entity({position:cart(p),point:{pixelSize:hollow?10:13,color:C.Color.fromCssColorString(hollow?'#142921':'#dbffed'),outlineColor:C.Color.fromCssColorString(hollow?'#adf0d0':'#315b48'),outlineWidth:hollow?2:3,heightReference:C.HeightReference.CLAMP_TO_GROUND,disableDepthTestDistance:0}},{...data,point:p});}
function clearHandles(){handles.forEach(remove);handles=[];}
function renderHandles(){clearHandles();const s=draft||selectedShape();if(!s)return;
 if(s.type==='circle'){handles.push(handlePoint(s.center,{kind:'center',id:s.id}));handles.push(handlePoint(destination(s.center,s.bearing,s.radius),{kind:'radius',id:s.id}));}
 else {s.vertices.forEach((p,i)=>handles.push(handlePoint(p,{kind:'vertex',id:s.id,index:i})));if(!draft)s.vertices.forEach((p,i)=>handles.push(handlePoint(midpoint(p,s.vertices[(i+1)%s.vertices.length]),{kind:'midpoint',id:s.id,index:i},true)));}
 viewer.scene.requestRender();
}
function updateUI(){const s=selectedShape();$('inspector').hidden=!s||!!draft;$('drawing').hidden=mode!=='polygon';$('shapeCount').textContent=`${shapes.length} SHAPE${shapes.length===1?'':'S'}`;
 for(const t of ['select','circle','polygon']){$(t+'Tool').classList.toggle('active',t===mode);$(t+'Tool').setAttribute('aria-pressed',String(t===mode));}
 $('hintText').textContent=s&&mode==='select'?(s.type==='circle'?'Drag the centre to move. Drag the edge handle to resize.':'Drag inside the selected polygon to move it. Use handles to edit vertices.'):ui[mode];
 $('drawingCount').textContent=`${draft?.vertices.length||0} points`;$('finishPolygon').disabled=!draft||draft.vertices.length<3;$('undoPoint').disabled=!draft?.vertices.length;
 if(s){$('shapeType').textContent=s.type.toUpperCase();$('shapeName').textContent=`${s.type==='circle'?'Circle':'Polygon'} ${String(shapes.indexOf(s)+1).padStart(2,'0')}`;$('circleFields').hidden=s.type!=='circle';$('polygonFields').hidden=s.type!=='polygon';if(s.type==='circle'){if(document.activeElement!==$('radiusInput'))$('radiusInput').value=(s.radius/1000).toFixed(3);$('centreValue').textContent=`${C.Math.toDegrees(s.center.lat).toFixed(3)}°, ${C.Math.toDegrees(s.center.lon).toFixed(3)}°`;}else $('vertexCount').textContent=s.vertices.length;}
 viewer.canvas.style.cursor=mode==='select'?'grab':'crosshair';
}
function select(id){closeSelectionMenu();const old=selected;selected=id;if(old){const s=shapes.find(x=>x.id===old);if(s)renderShape(s);}if(id){const s=selectedShape();if(s)renderShape(s);}renderHandles();updateUI();}
function stopDrag(){if(drag){drag=null;viewer.scene.screenSpaceCameraController.enableInputs=true;save();}}
function setMode(next){closeSelectionMenu();stopDrag();if(draft){removeVisual(draft.id);draft=null;}mode=next;select(null);}
function finishPolygon(){if(!draft||draft.vertices.length<3){toast('Add at least three vertices first.');return;}if(!validEdge(draft.vertices.at(-1),draft.vertices[0])){toast('The closing edge needs distinct, non-antipodal endpoints.');return;}const s=draft;shapes.push(s);draft=null;mode='select';select(s.id);save();toast('Polygon closed. Drag its interior to move, or use handles to edit.');}
function addVertex(p){if(!draft){draft={id:uid(),type:'polygon',vertices:[]};}const last=draft.vertices.at(-1);if(last&&C.Cartesian3.distance(cart(last),cart(p))<Math.max(1,viewer.camera.positionCartographic.height*.000001))return;if(draft.vertices.length>=500){toast('Maximum 500 vertices per polygon.');return;}draft.vertices.push(p);renderShape(draft,true);renderHandles();updateUI();}
function deleteSelected(){if(!selected)return;removeVisual(selected);shapes=shapes.filter(s=>s.id!==selected);select(null);save();}
function validEdge(a,b){return C.Cartesian3.distance(cart(a),cart(b))>1&&C.Cartesian3.angleBetween(cart(a),cart(b))<Math.PI-.02;}
function applyDrag(p){const s=selectedShape();if(!s||!drag)return;if(drag.kind==='polygon'){s.vertices=rotatePolygon(drag.original,drag.anchor,p);}else if(drag.kind==='center'){s.center=p;}else if(drag.kind==='radius'){try{const line=geodesic(s.center,p);s.radius=clampRadius(line.surfaceDistance);s.bearing=line.startHeading;}catch{return;}}else if(drag.kind==='vertex'){const prev=s.vertices[(drag.index+s.vertices.length-1)%s.vertices.length],next=s.vertices[(drag.index+1)%s.vertices.length];if(!validEdge(prev,p)||!validEdge(p,next))return;s.vertices[drag.index]=p;}renderShape(s);renderHandles();updateUI();viewer.canvas.style.cursor='grabbing';}
function bind(){const canvas=viewer.canvas;canvas.style.touchAction='none';canvas.tabIndex=0;
 document.addEventListener('pointerdown',e=>{if(!$('selectionMenu').contains(e.target))closeSelectionMenu();},true);
 $('selectionMenu').addEventListener('keydown',e=>{
  const buttons=[...$('selectionMenu').querySelectorAll('button')],i=buttons.indexOf(document.activeElement);
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeSelectionMenu();}
  else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length;buttons[next]?.focus();}
 });
 addEventListener('resize',closeSelectionMenu);viewer.camera.moveStart.addEventListener(closeSelectionMenu);

 canvas.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;
  closeSelectionMenu();gesture={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
  if(mode!=='select')return;
  const position=screen(e),hits=pickAll(position),handle=hits.find(h=>h.kind!=='shape');
  const active=selectedShape();let data;
  if(handle){
   const s=shapes.find(s=>s.id===handle.id);if(!s)return;
   selected=s.id;data={...handle};
   if(handle.kind==='midpoint'){
    if(s.vertices.length>=500){toast('Maximum 500 vertices per polygon.');return;}
    s.vertices=insertVertex(s.vertices,handle.index,handle.point);data={kind:'vertex',id:s.id,index:handle.index+1};renderShape(s);renderHandles();updateUI();save();
   }
  }else if(active?.type==='polygon'&&hits.some(h=>h.id===active.id)){
   const anchor=onGlobe(position);if(!anchor)return;
   data={kind:'polygon',id:active.id,anchor,original:active.vertices.map(p=>({...p}))};
  }else return;
  drag=data;viewer.scene.screenSpaceCameraController.enableInputs=false;
  canvas.setPointerCapture(e.pointerId);e.preventDefault();e.stopImmediatePropagation();canvas.style.cursor='grabbing';
 },true);
 canvas.addEventListener('pointermove',e=>{if(gesture&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>5)gesture.moved=true;const pos=screen(e),p=onGlobe(pos);if(p)$('coordinates').textContent=`${C.Math.toDegrees(p.lat).toFixed(3)}°  ${C.Math.toDegrees(p.lon).toFixed(3)}°`;
 if(drag){if(p&&(drag.kind!=='polygon'||gesture?.moved))applyDrag(p);e.preventDefault();e.stopImmediatePropagation();}else if(mode==='select'&&!gesture){const h=pick(pos);canvas.style.cursor=h?(h.kind==='midpoint'?'copy':h.kind==='shape'?(h.id===selected&&selectedShape()?.type==='polygon'?'grab':'pointer'):'grab'):'grab';}
 },true);
 canvas.addEventListener('pointerup',e=>{
  if(gesture?.id!==e.pointerId)return;
  const captured=!!drag,moved=gesture.moved,bodyClick=drag?.kind==='polygon'&&!moved;
  if(captured||moved)suppressUntil=performance.now()+150;
  stopDrag();gesture=null;
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  if(captured){e.preventDefault();e.stopImmediatePropagation();}
  updateUI();
  // A click on a selected polygon must still offer overlapping shapes;
  // only an actual movement starts a whole-polygon translation.
  if(bodyClick)chooseAt(screen(e),e);
 },true);
 canvas.addEventListener('pointercancel',()=>{stopDrag();gesture=null;suppressUntil=performance.now()+150;});canvas.addEventListener('lostpointercapture',()=>{stopDrag();gesture=null;});addEventListener('blur',()=>{stopDrag();gesture=null;});
 canvas.addEventListener('click',e=>{if(performance.now()<suppressUntil||e.detail>1)return;const position=screen(e),p=onGlobe(position);if(mode==='circle'){if(!p)return;if(shapes.length>=200){toast('Maximum 200 shapes. Delete a shape first.');return;}const s={id:uid(),type:'circle',center:p,radius:clampRadius(viewer.camera.positionCartographic.height*.055),bearing:Math.PI/2};shapes.push(s);mode='select';select(s.id);save();}
 else if(mode==='polygon'){if(!p)return;if(shapes.length>=200)return toast('Maximum 200 shapes.');if(draft?.vertices.length&&!validEdge(draft.vertices.at(-1),p))return toast('Choose a distinct point less than halfway around the globe.');addVertex(p);}
 else{chooseAt(position,e);}
 });
 canvas.addEventListener('dblclick',e=>{e.preventDefault();if(mode==='polygon')finishPolygon();});
 for(const t of ['select','circle','polygon'])$(t+'Tool').onclick=()=>setMode(t);
 $('finishPolygon').onclick=finishPolygon;$('cancelDrawing').onclick=()=>setMode('select');$('undoPoint').onclick=()=>{if(draft){draft.vertices.pop();renderShape(draft,true);renderHandles();updateUI();}};
 $('deleteShape').onclick=deleteSelected;$('closeInspector').onclick=()=>select(null);
 $('radiusInput').onchange=()=>{const s=selectedShape(),value=Number($('radiusInput').value)*1000;if(!s||s.type!=='circle')return;if(!Number.isFinite(value)||value<10||value>5000000){toast('Enter a radius between 0.01 and 5,000 km.');$('radiusInput').value=(s.radius/1000).toFixed(3);return;}s.radius=value;renderShape(s);renderHandles();save();};
 $('aboutButton').onclick=()=>$('about').showModal();$('closeAbout').onclick=()=>$('about').close();
 addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)||$('about').open||!$('selectionMenu').hidden)return;const k=e.key.toLowerCase();if(k==='escape'){setMode('select');return;}if(k==='enter'&&mode==='polygon'){e.preventDefault();finishPolygon();}else if(k==='delete'||k==='backspace'){e.preventDefault();if(mode==='polygon')$('undoPoint').click();else deleteSelected();}else if(k==='v')setMode('select');else if(k==='c')setMode('circle');else if(k==='p')setMode('polygon');});
 addEventListener('pagehide',save);
}
async function init(){
 // The classic Cesium script is deferred; wait for all deferred scripts to finish.
 if(document.readyState==='loading')await new Promise(resolve=>addEventListener('DOMContentLoaded',resolve,{once:true}));
 if(!window.Cesium)throw new Error('Cesium could not load. Check your connection and reload.');C=window.Cesium;
 viewer=new C.Viewer('globe',{baseLayer:false,animation:false,timeline:false,baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,navigationInstructionsInitiallyVisible:false,fullscreenButton:false,vrButton:false,infoBox:false,selectionIndicator:false,skyBox:false,skyAtmosphere:false,scene3DOnly:true,shouldAnimate:false,requestRenderMode:true,maximumRenderTimeChange:Infinity,terrainProvider:new C.EllipsoidTerrainProvider(),creditContainer:$('cesiumCredits')});
 viewer.scene.backgroundColor=C.Color.BLACK;viewer.scene.globe.baseColor=C.Color.fromCssColorString('#173345');viewer.scene.globe.enableLighting=false;viewer.scene.globe.showGroundAtmosphere=false;viewer.scene.fog.enabled=false;viewer.scene.screenSpaceCameraController.minimumZoomDistance=100;viewer.scene.screenSpaceCameraController.maximumZoomDistance=60000000;
 viewer.screenSpaceEventHandler.removeInputAction(C.ScreenSpaceEventType.LEFT_CLICK);viewer.screenSpaceEventHandler.removeInputAction(C.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
 const imagery=new C.UrlTemplateImageryProvider({url:C.buildModuleUrl('Assets/Textures/NaturalEarthII')+'/{z}/{x}/{reverseY}.jpg',tilingScheme:new C.GeographicTilingScheme(),maximumLevel:2,hasAlphaChannel:false,credit:new C.Credit('Natural Earth II')});
 viewer.imageryLayers.addImageryProvider(imagery);let imageryWarned=false;imagery.errorEvent.addEventListener(()=>{if(!imageryWarned){imageryWarned=true;toast('Imagery could not load. Check your internet connection.');}});
 viewer.camera.setView({destination:C.Cartesian3.fromDegrees(8,25,19500000)});
 try{shapes=restoreShapes(JSON.parse(localStorage.getItem(KEY)));}catch{shapes=[];}
 for(const s of shapes)renderShape(s);bind();updateUI();$('loading').hidden=true;
 viewer.scene.renderError.addEventListener((_scene,error)=>{console.error(error);toast('The globe renderer stopped. Reload to recover your saved drawings.');});
}
init().catch(error=>{console.error(error);$('loading').replaceChildren();const p=document.createElement('p');p.textContent=error.message;$('loading').append(p);});
