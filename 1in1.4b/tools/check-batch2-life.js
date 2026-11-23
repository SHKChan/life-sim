/* 第二批住房与生活习惯：真实状态、旧档和无新增操作。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.join(__dirname,'..'),store={};
const ctx={console,Math:Object.create(Math),JSON,Date,localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}}};
ctx.window=ctx;vm.createContext(ctx);
const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('/')&&!/(ui|pixel|sharecard|scenes)\.js$/.test(s));
for(const s of files)vm.runInContext(fs.readFileSync(path.join(root,s),'utf8'),ctx);
const J=ctx.JY,E=J.engine;E.startRandom();const g=E.G,L=E.get().L;
const node=id=>J.LIFE_NODES.concat(J.ENCOUNTERS).find(n=>n.id===id);
const age=a=>{L.year=J.byId[L.cid].born+a;E.get().W.year=L.year;};
age(40);J.CN.moveOut(g,['fa','mo']);g.remember('hhPlace','');g.remember('backHome',null);g.remember('liveWith','alone');
const cases=[['rent',1,'房租'],['own',4,'小城'],['hometown',5,'老家']];
for(const [house,tier,word] of cases){
  g.remember('house',house);g.remember('tier',tier);
  assert(J.CN.homeLifeContext(g).includes(word));
  for(const id of ['m_46_house_echo','m_52_care_echo','m_61_plan_echo']){
    const n=node(id);assert(n.auto);assert(n.text(g).includes(word),id+'读取住所');
  }
}
g.remember('parentsCare','self');J.CN.liveWith(g,['fa']);assert(J.CN.homeLifeContext(g).includes('老人'));
g.remember('hhPlace','nursing');assert(J.CN.homeLifeContext(g).includes('养老社区'),'养老院读取实际住所');g.remember('hhPlace','');
for(const focus of ['埋头工作','陪伴家人','锻炼身体','躺平休息']){
  age(40);L.focus=focus;delete L.mem.focusRun;assert.equal(J.CN.focusMemory(g),'','旧档无历史不补造');
  for(let a=40;a<=42;a++){age(a);L.st['健康']=100;J.ECON.yearEnd(g,a);}
  assert.equal(g.recall('focusRun').n,3);assert(J.CN.focusMemory(g));
  const run=JSON.stringify(g.recall('focusRun'));J.ECON.yearEnd(g,42);assert.equal(JSON.stringify(g.recall('focusRun')),run,'同年不重复累计');
  L.focus='学习充电';assert.equal(J.CN.focusMemory(g),'','切换后不冒称仍持续原重心');
  age(43);J.ECON.yearEnd(g,43);assert.equal(g.recall('focusRun').n,1);
}
g.remember('fatigueWarn','ignore');g.remember('fatigue',0);const improved=node('e_h_overwork_echo').text(g);g.remember('fatigue',8);assert.notEqual(node('e_h_overwork_echo').text(g),improved);
const snapshot=JSON.stringify(L.mem);for(let i=0;i<3;i++){J.CN.homeLifeContext(g);J.CN.focusMemory(g);}assert.equal(JSON.stringify(L.mem),snapshot,'读取反馈无消费或副作用');
E.save();E.load();assert.equal(g.recall('focusRun').n,1,'可选习惯记录可存取');
console.log('第二批生活通过：四类住所×三个原节点、四种重心、逐年记录/旧档/切换/存档、疲劳变化与纯读取。');
