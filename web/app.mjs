import {by,el,choices,cards,row,csv} from './common.mjs';
import {visitDates,fields,atDepth,format} from './model.mjs';
let data;
function station(){return data.stations.find(s=>s.code===by('station').value)}
function visits(){
  const days=visitDates(station().values), both=days.map(v=>[v,v]);
  choices('earlier',both,days.includes('2023-04-18')?'2023-04-18':days[0]);
  choices('later',both,days.find(x=>x.startsWith('2023-08'))??days.at(-1));depths();
}
function depths(){
  const days=[by('earlier').value,by('later').value];
  const available=[...new Set(station().values.filter(r=>days.includes(r[0])).map(r=>r[1]))].sort((a,b)=>a-b);
  const target=station().code==='BAN_SD'?'10':'6',old=by('depth').value;
  choices('depth',available.map(v=>[String(v),v===0?'Surface (0 m)':v+' m']),available.includes(Number(old)) && old && by('depth').dataset.code===station().code?old:target);
  by('depth').dataset.code=station().code;render();
}
function chart(records,metric,first,second){
  const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 660 300');svg.setAttribute('role','img');svg.setAttribute('aria-label',metric.name+' by measured depth. All plotted readings are available in the table.');
  function draw(tag,attrs,text){const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!=null)n.textContent=text;svg.append(n);return n}
  const points=records.filter(r=>Number.isFinite(r[metric.index]));
  if(!points.length){by('chart').replaceChildren(el('p','No measured values for these dates.'));return}
  const maxDepth=Math.max(1,...records.map(r=>r[1])),upper=Math.ceil(Math.max(1,...points.map(r=>r[metric.index]))),lower=Math.floor(Math.min(0,...points.map(r=>r[metric.index])));
  const X=v=>78+(v-lower)/(upper-lower)*530,Y=d=>40+d/maxDepth*210;
  for(let i=0;i<=4;i++){const y=40+i*52.5;draw('line',{x1:78,x2:608,y1:y,y2:y,stroke:'#d4e1dd'});draw('text',{x:66,y:y+4,'text-anchor':'end',fill:'#30494f'},format(maxDepth*i/4)+' m');const val=lower+(upper-lower)*i/4;draw('text',{x:X(val),y:276,'text-anchor':'middle',fill:'#30494f'},format(val))}
  draw('text',{x:78,y:21,fill:'#30494f'},'Surface ↓ depth');draw('text',{x:605,y:295,'text-anchor':'end',fill:'#30494f'},metric.name+' ('+metric.unit+')');
  for(const [day,color,shape] of [[first,'#036a78','circle'],[second,'#a9502f','square']]){
    for(const r of points.filter(r=>r[0]===day)){const x=X(r[metric.index]),y=Y(r[1]);
      const n=shape==='circle'?draw('circle',{cx:x,cy:y,r:5,fill:color}):draw('rect',{x:x-3.5,y:y-3.5,width:7,height:7,fill:color});
      const tip=document.createElementNS(ns,'title');tip.textContent=day+' · '+r[1]+' m · '+format(r[metric.index])+' '+metric.unit;n.append(tip)}
  }
  by('chart').replaceChildren(svg);
}
function render(){
  const s=station(), first=by('earlier').value,second=by('later').value,m=fields[by('metric').value],depth=Number(by('depth').value);
  const a=atDepth(s.values,first,depth,m.index),b=atDepth(s.values,second,depth,m.index);
  const label=v=>v.length?v.map(format).join(' / ')+' '+m.unit:'Unavailable';
  const delta=a.length===1&&b.length===1?b[0]-a[0]:null;
  cards([[first,label(a),m.name+' at '+depth+' m'],[second,label(b),m.name+' at '+depth+' m'],['Change',delta===null?'—':(delta>0?'+':'')+format(delta)+' '+m.unit,delta===null?'Requires one reading for each visit at this depth.':'Second visit minus first at '+depth+' m']]);
  const rec=s.values.filter(r=>r[0]===first||r[0]===second);
  by('legend').textContent='Teal circles · '+first+'   /   Rust squares · '+second;
  chart(rec,m,first,second);by('rows').replaceChildren(...rec.map(r=>row(r.map(x=>x??'Unreported'))));
  by('csv').onclick=()=>csv('lake-profiles-'+s.code+'.csv',[['station','visit','depth_m','oxygen_mg_L','temperature_C','instrument','retrieved'],...rec.map(r=>[s.code,...r,data.retrieved])]);
}
try{
  const res=await fetch('./data/profiles.json');if(!res.ok)throw Error();data=await res.json();
  by('meta').textContent=data.count+' readings · '+data.start+' to '+data.end+' · Retrieved '+data.retrieved+' UTC';
  choices('station',data.stations.map(s=>[s.code,s.name]),'BAN_SD');choices('metric',Object.entries(fields).map(([k,v])=>[k,v.name]),'oxygen');
  by('station').onchange=visits;by('metric').onchange=render;by('depth').onchange=render;
  by('earlier').onchange=depths;by('later').onchange=depths;visits();by('work').hidden=false;
}catch{by('meta').textContent='The lake snapshot could not load. Open the municipal source below or reload.'}
