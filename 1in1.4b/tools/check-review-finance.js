'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('/')&&!/(ui|pixel|sharecard|scenes)\.js$/.test(s));
const store={},ctx={console,Math:Object.create(Math),JSON,Date,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}}};ctx.window=ctx;vm.createContext(ctx);for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const J=ctx.JY,E=J.engine;E.startRandom();const g=E.G,L=E.get().L;
const age=a=>{L.year=J.byId[L.cid].born+a;E.get().W.year=L.year;};
age(31);J.CN.marry(g);g.remember('money0',true);g.remember('cash',100000);g.remember('job','office');g.remember('income',120000);g.remember('expense',60000);g.remember('debt',0);
assert(J.CN.moneyRoom(g,6000).includes('2 个月'));g.remember('debt',5);assert(J.CN.moneyRoom(g,6000).includes('还款'));g.remember('debt',0);g.remember('cash',2000);assert(J.CN.moneyRoom(g,6000).includes('不够'));
g.remember('cash',100000);g.remember('job','freelance');assert(!J.CN.moneyRoom(g,6000).includes('个月'));g.remember('retired',true);assert(J.CN.moneyRoom(g,6000).includes('照护'));g.remember('retired',false);
const mem=JSON.stringify(L.mem);J.CN.moneyRoom(g,3000);assert.equal(JSON.stringify(L.mem),mem,'预算预览不消费');
g.remember('echoCarry','home');L.queue=['y_crisis31'];const repair=E.choices(E.node('y_crisis31')).find(x=>x.ch.echo==='home');assert(repair);E.choose(repair.i);
assert.equal(g.recall('echoUse').id,'y_crisis31');assert.equal(g.recall('echoUse').age,31);
age(48);L.queue=['e_family_partner'];E.choose(0);age(50);L.queue=['e_family_partner_echo'];E.flush();L.death='寿终正寝';const life=E.finish('认真过了。');
assert.equal(life.echo.at.id,'y_crisis31');assert.equal(life.echo.used,true);
assert(life.reviewLinks.some(x=>x.id==='e_family_partner'&&x.echoId==='e_family_partner_echo'),JSON.stringify({links:life.reviewLinks,log:L.log.filter(e=>e.k==='echo'),done:L.done}));
assert(![].concat(J.LIFE_NODES.find(n=>n.id==='m_37_crisis_echo').echoOf).includes('y_crisis31'),'职业危机不错误归因到夫妻争执');
for(const x of life.reviewLinks){assert(life.picks.some(p=>p.id===x.id&&!p.auto));assert(L.done[x.echoId]);assert(L.log.some(e=>e.a===x.echoAge&&e.t.includes(x.result)));}
const u={esc:s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])),card:(a,b,c)=>c};
const html=J.GAME.endCards(life,u);assert(html.includes('那些选择'));assert(html.includes('前世那句话'));
const old=JSON.parse(JSON.stringify(life));delete old.reviewLinks;delete old.echo;delete old.wishChange;assert.doesNotThrow(()=>J.GAME.endCards(old,u),'旧结算不补造记录');
assert.equal(J.GAME.share.story(life).badges.length,0,'分享卡不塞额外回顾');
for (const scenario of [
  { name:'稳定工作',job:'office',age:80 },{ name:'转行',job:'freelance',age:80 },
  { name:'独身',love:'single',age:80 },{ name:'丁克',love:'married',kidPlan:'dink',age:80 },
  { name:'离婚',love:'divorced',age:80 },{ name:'改命失败',rewrite:{k:'remote',ok:false,age:34},age:80 },
  { name:'早逝',age:20 },{ name:'负债',debt:30,cash:-5000,age:80 },{ name:'普通长寿',age:96 },
]) {
  E.startRandom();const state=E.get().L;state.year=J.byId[state.cid].born+scenario.age;E.get().W.year=state.year;
  for(const [k,v] of Object.entries(scenario))if(!['name','age'].includes(k))g.remember(k,v);
  state.death='寿终正寝';const item=E.finish('认真生活');
  assert.equal(item.reviewLinks.length,0,scenario.name+'没有真实选择与回响时不补造连接');
  assert.doesNotThrow(()=>J.GAME.endCards(item,u),scenario.name+'可结算');
}
console.log('回顾与财务通过：真实选择/回响链、残响使用位置、旧结算、预算四处境及只读、分享限制。');
