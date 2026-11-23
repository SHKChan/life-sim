/* D01-D03：真实经历的长回响、同行边界与纯文字变体。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),repo=path.dirname(root);
const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('/')&&!/(ui|pixel|sharecard|scenes)\.js$/.test(s));
const sources=files.map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]);
const owned=['data/daily.js','data/travel.js','data/pets.js','data/tech.js'];
const previous=sources.map(([f,s])=>[f,owned.includes(f)?cp.execFileSync('git',['show','HEAD:1in1.4b/'+f],{cwd:repo,encoding:'utf8'}):s]);
function context(src,seed=17001){const math=Object.create(Math),store={};math.random=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,seed|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};const ctx={console,Math:math,JSON,Date:class extends Date{static now(){return 1800000000000;}},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]}};ctx.window=ctx;vm.createContext(ctx);for(const[f,s]of src)vm.runInContext(s,ctx,{filename:f});return ctx.JY;}
const J=context(sources),E=J.engine;E.startRandom();const g=E.G,L=E.get().L;L.year=J.byId[L.cid].born+41;E.get().W.year=L.year;
const n=id=>J.LIFE_NODES.concat(J.ENCOUNTERS).find(x=>x.id===id),text=id=>typeof n(id).text==='function'?n(id).text(g):n(id).text;
g.remember('kindness','friend');assert(text('y_offer_echo').includes('互教老家话'));assert(!text('y_offer_echo').includes('当年发来'));
L.done.e_c_kindness_echo=1;assert(text('y_offer_echo').includes('照片'));assert(text('o_look_back_edu').includes('近况已经不清楚'));
g.remember('kindness',null);g.remember('craft','cook');assert(text('y_offer_echo').includes('师傅'));assert(text('o_look_back_edu').includes('切坏'));
g.remember('craft','electric');assert(text('y_offer_echo').includes('村里叔叔'));assert(text('o_look_back_edu').includes('工具箱'));
g.remember('askedMom','home');assert(text('y_offer_echo').includes('视频电话'));assert(text('o_look_back_edu').includes('视频电话'));
g.remember('family','farmer');const poor=text('m_43_career_echo');g.remember('family','rich');assert.notEqual(text('m_43_career_echo'),poor);
g.remember('region','西南');g.remember('city','成都');g.remember('homeCap','成都');g.remember('workCity','成都');assert(text('e_daily_11').includes('熟悉的地方'));g.remember('workCity','上海');assert(text('e_daily_11').includes('想起老家'));assert(text('o_hometown_echo').includes('小时候留下'));
g.remember('familyTrip','sea');J.CN.marry(g);assert(text('t_echo41').includes('和伴侣'));g.kill('sp','测试',true);assert(!text('t_echo41').includes('和伴侣'));
g.remember('adultPet',{way:'adopt',name:'小豆',y:g.Y-20,life:10});g.remember('petNow',null);assert(n('e_pet_farewell').cond(g));assert(text('e_pet_farewell').includes('慢慢改掉'));assert(!text('t_echo41').includes('核对了小豆'));
g.remember('job','restaurant');assert(text('e_t_robot_cook').includes('后厨'));g.remember('job','farmer');assert(!text('e_t_robot_cook').includes('公司楼下'));
g.remember('job','nurse');assert(text('e_t_smart_hosp').includes('坐在候诊椅'));g.remember('job','driver');assert(text('e_t_robotaxi').includes('自己每天跑'));
const state=JSON.stringify(L.mem),stats=JSON.stringify(L.st);for(const id of ['y_offer_echo','m_43_career_echo','e_daily_11','o_look_back_edu','o_hometown_echo','t_echo41','e_pet_farewell','e_t_robotaxi','e_t_smart_hosp'])text(id);assert.equal(JSON.stringify(L.mem),state);assert.equal(JSON.stringify(L.st),stats);
function life(src,seed){const j=context(src,seed),e=j.engine;e.startRandom();let r=e.peek(),guard=0;const picks=[];while(r.type!=='death'&&guard++<1000){if(r.type==='node'){const opts=e.choices(r.node),p=opts.find(x=>x.ch.canon&&!x.ch.fatal)||opts.find(x=>!x.ch.fatal)||opts[0];picks.push([e.G.age,r.node.id,p.i]);e.choose(p.i);r=e.flush();}else r=e.nextYear();}assert(guard<1000);const l=e.finish('x');return JSON.parse(JSON.stringify({picks,st:l.st,snap:l.snap,age:l.to-l.born,cause:l.cause}));}
for(let seed=17001;seed<17009;seed++)assert.deepEqual(life(sources,seed),life(previous,seed),'生活文字变体不增加操作/数值/随机消费 '+seed);
console.log('生活差异通过：童年跨阶段、两类旧识、出身地域、伴侣存活、宠物送别、科技职业、8世配对无操作/数值变化。');
