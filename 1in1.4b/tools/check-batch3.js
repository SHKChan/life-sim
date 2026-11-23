/* 全行业覆盖及生活场景；与已提交版本配对验证操作、数值和随机序列。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),cp=require('child_process'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'..');
const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('/')&&!/(ui|pixel|sharecard|scenes)\.js$/.test(s));
const current=files.map(file=>[file,fs.readFileSync(path.join(root,file),'utf8')]);
const baseline=current.map(([file])=>[file,cp.execFileSync('git',['show','HEAD:'+path.relative(repo,path.join(root,file)).replace(/\\/g,'/')],{cwd:repo,encoding:'utf8',maxBuffer:5e6})]);
function context(sources,seed){
  const math=Object.create(Math),store={};math.random=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,seed|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
  const ctx={console,Math:math,JSON,Date:class extends Date{static now(){return 1800000000000;}},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;},removeItem:k=>{delete store[k];}}};ctx.window=ctx;vm.createContext(ctx);
  for(const [file,source]of sources)vm.runInContext(source,ctx,{filename:file});return ctx.JY;
}
const J=context(current,17001),E=J.engine;E.startRandom();const g=E.G,L=E.get().L;
const node=id=>J.LIFE_NODES.concat(J.ENCOUNTERS).find(n=>n.id===id);
const entries=J.LIFE_NODES.filter(n=>/^i_.*_30$/.test(n.id));assert.equal(entries.length,22);
let count=0;
for(const n of entries){
  const job=n.id.slice(2,-3),key=['trade30','service30','land30'].find(k=>n.choices[0].fx.toString().includes(k));
  assert(key);const texts=[new Set(),new Set(),new Set()];
  for(let i=0;i<n.choices.length;i++){
    g.remember('job',job);g.remember('cash',100000);delete L.mem.career50;g.remember('tradeOwn',false);
    n.choices[i].fx(g);assert.equal(g.recall('career50'),undefined);
    const route=g.recall(key).route;
    for(const [age,index]of [[40,0],[50,1]]){
      const echo=node(`i_${job}_${age}`);assert(echo.auto&&echo.cond(g));texts[index].add(echo.text(g));if(echo.fx)echo.fx(g);
    }
    assert.equal(g.recall('career50').route,route);const memory=J.CN.careerMemory(g);assert(memory.includes('五十岁时'));texts[2].add(memory);
    assert.equal(node('o_look_back_work').text(g),memory,'实际晚年节点接入');
    g.remember('job','none');assert.equal(node(`i_${job}_50`).cond(g),false,'转行不播放原职业现状');assert.equal(J.CN.careerMemory(g),memory,'保留真实已历经的回忆');count++;
  }
  for(const set of texts)assert.equal(set.size,n.choices.length,job+'各阶段路线独立');
}
assert.equal(count,52);
g.remember('career50',null);assert.equal(J.CN.careerMemory(g),'','旧档不补职业史');
L.year=J.byId[L.cid].born+50;E.get().W.year=L.year;J.CN.moveOut(g,['fa','mo','k1','k2','k3']);g.remember('liveWith','alone');g.remember('backHome',null);g.remember('hhPlace','');
for(const [house,tier,word]of [['rent',1,'房租'],['rent',4,'续租'],['own',1,'城市'],['mortgage',1,'还款'],['own',4,'小城'],['hometown',5,'老家']]){
  g.remember('house',house);g.remember('tier',tier);
  for(const id of ['m_43_career_echo','m_46_house_echo','m_52_care_echo','m_54_nest_echo','m_61_plan_echo','e_family_partner_echo','e_family_work_echo','o_first_morning','o_care_echo'])assert(node(id).text(g).includes(word),id+'住房反馈');
}
g.remember('hhPlace','dorm');assert(J.CN.homeLifeContext(g).includes('宿舍'));g.remember('hhPlace','nursing');assert(J.CN.homeLifeContext(g).includes('养老社区'));g.remember('hhPlace','');
g.spawn({id:'k1',name:'测试孩子',sex:'女',born:g.Y-25});J.CN.liveWith(g,['k1']);g.remember('liveWith','kids');assert(J.CN.homeLifeContext(g).includes('孩子家'));g.kill('k1','测试',true);assert(!J.CN.homeLifeContext(g).includes('孩子家'));
g.spawn({id:'gk1',name:'测试孙辈',sex:'女',born:g.Y-5});
for(const f of J.FOCUS.filter(f=>f.name!=='懵懂')){
  L.focus=f.name;g.remember('focusRun',{name:f.name,n:3,y:g.Y});assert(J.CN.focusMemory(g),f.name+'有反馈');
  for(const id of ['m_43_career_echo','m_48_check_echo','e_h_injury_echo','e_family_partner_echo','o_first_morning','o_hobby_echo','o_chronic_echo'])assert(node(id).text(g).includes(J.CN.focusMemory(g)),id+'重心读取');
}
function life(sources,seed){const j=context(sources,seed),e=j.engine;e.startRandom();let r=e.peek(),guard=0;const picks=[];while(r.type!=='death'&&guard++<1000){if(r.type==='node'){const p=e.choices(r.node).find(x=>x.ch.canon&&!x.ch.fatal)||e.choices(r.node).find(x=>!x.ch.fatal)||e.choices(r.node)[0];picks.push([e.G.age,r.node.id,p.i]);e.choose(p.i);r=e.flush();}else r=e.nextYear();}assert(guard<1000);const l=e.finish('test');return JSON.parse(JSON.stringify({picks,st:l.st,snap:l.snap,age:l.to-l.born,cause:l.cause}));}
for(let seed=17001;seed<17017;seed++)assert.deepEqual(life(current,seed),life(baseline,seed),'配对人生不增加操作/数值/随机漂移，种子'+seed);
console.log('第三批通过：22职业52路线、住房×9节点、12重心×7节点、16世与HEAD配对数值及停问一致。');
