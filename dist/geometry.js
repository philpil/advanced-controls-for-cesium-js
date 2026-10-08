// WGS 84 direct geodesic (Vincenty). Angles are radians, distances are metres.
export const A=6378137,F=1/298.257223563,B=A*(1-F),MAX_RADIUS=5_000_000,MIN_RADIUS=10;
export const clampRadius=r=>Math.min(MAX_RADIUS,Math.max(MIN_RADIUS,r));
export const wrapLongitude=x=>((x+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
export function destination(origin,bearing,distance){
 const U1=Math.atan((1-F)*Math.tan(origin.lat)),sU1=Math.sin(U1),cU1=Math.cos(U1),sb=Math.sin(bearing),cb=Math.cos(bearing);
 const sigma1=Math.atan2(Math.tan(U1),cb),sinAlpha=cU1*sb,cosSqAlpha=1-sinAlpha*sinAlpha;
 const uSq=cosSqAlpha*(A*A-B*B)/(B*B),ka=1+uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq))),kb=uSq/1024*(256+uSq*(-128+uSq*(74-47*uSq)));
 let sigma=distance/(B*ka);
 for(let i=0;i<50;i++){const c2=Math.cos(2*sigma1+sigma),ss=Math.sin(sigma),cs=Math.cos(sigma),delta=kb*ss*(c2+kb/4*(cs*(-1+2*c2*c2)-kb/6*c2*(-3+4*ss*ss)*(-3+4*c2*c2)));let next=distance/(B*ka)+delta;if(Math.abs(next-sigma)<1e-12){sigma=next;break;}sigma=next;}
 const ss=Math.sin(sigma),cs=Math.cos(sigma),c2=Math.cos(2*sigma1+sigma),tmp=sU1*ss-cU1*cs*cb;
 const lat=Math.atan2(sU1*cs+cU1*ss*cb,(1-F)*Math.sqrt(sinAlpha*sinAlpha+tmp*tmp));
 const lambda=Math.atan2(ss*sb,cU1*cs-sU1*ss*cb),kc=F/16*cosSqAlpha*(4+F*(4-3*cosSqAlpha));
 const L=lambda-(1-kc)*F*sinAlpha*(sigma+kc*ss*(c2+kc*cs*(-1+2*c2*c2)));
 return {lon:wrapLongitude(origin.lon+L),lat};
}
export function circleRing(shape,count=160){return Array.from({length:count},(_,i)=>destination(shape.center,i/count*2*Math.PI,shape.radius));}
export function insertVertex(vertices,edge,point){const result=vertices.map(p=>({...p}));result.splice(edge+1,0,{...point});return result;}
export function validPoint(p){return p&&Number.isFinite(p.lon)&&Number.isFinite(p.lat)&&Math.abs(p.lon)<=Math.PI&&Math.abs(p.lat)<=Math.PI/2;}
export function restoreShapes(raw){if(!raw||raw.version!==1||!Array.isArray(raw.shapes))return[];const ids=new Set();return raw.shapes.slice(0,200).filter(s=>{if(!s||typeof s.id!=='string'||ids.has(s.id))return false;const okay=s.type==='circle'?validPoint(s.center)&&Number.isFinite(s.radius)&&s.radius>=MIN_RADIUS&&s.radius<=MAX_RADIUS:s.type==='polygon'&&Array.isArray(s.vertices)&&s.vertices.length>=3&&s.vertices.length<=500&&s.vertices.every(validPoint);if(okay)ids.add(s.id);return okay;}).map(s=>s.type==='circle'?{id:s.id,type:s.type,center:{...s.center},radius:s.radius,bearing:Number.isFinite(s.bearing)?s.bearing:Math.PI/2}:{id:s.id,type:s.type,vertices:s.vertices.map(p=>({...p}))});}
