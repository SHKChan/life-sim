/* 四职业试点：路线、实际经历和晚年回顾，不加载界面。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const nodes=[],mem={},stats={}; let cash=100000;
const g={recall:k=>mem[k],remember:(k,v)=>{mem[k]=v;},stat:(k,v)=>{stats[k]=(stats[k]||0)+v;},log:()=>{}};
const CN={cash:()=>cash,pay:(_,v)=>{cash-=v;},earn:(_,v)=>{cash+=v;}};
const ctx={window:{JY:{CN,addLifeNodes:ns=>nodes.push(...ns)}}};vm.createContext(ctx);
for(const file of ['careers-small','careers-service','careers-land'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../data',file+'.js'),'utf8'),ctx);
const get=(job,age)=>nodes.find(n=>n.id===`i_${job}_${age}`);
assert.equal(CN.careerMemory(g),'','旧档不补造职业经历');
for(const [job,key,routes] of [['restaurant','trade30',['steady','learn','rest']],['mechanic','trade30',['steady','learn','rest']],['teacher','service30',['steady','learn']],['construction','land30',['steady','learn']]]){
  const middle=[],late=[],retired=[];
  for(const route of routes){
    for(const k of Object.keys(mem))delete mem[k];cash=100000;
    mem.job=job;
    const n30=get(job,30),index=routes.indexOf(route);
    const beforeCash=cash;
    n30.choices[index].fx(g);
    if (['restaurant','mechanic'].includes(job)) assert.equal(beforeCash-cash,route==='learn'?(job==='restaurant'?8000:12000):0,'原培训费用只扣一次');
    assert.equal(mem[key].route,route);
    assert.equal(mem.career50,undefined,'仅30岁选择不冒称50岁经历');
    const n40=get(job,40),n50=get(job,50);
    assert(n40.auto&&n50.auto,'远期节点不新增停问');
    assert(n40.cond(g)&&n50.cond(g));middle.push(n40.text(g));late.push(n50.text(g));n50.fx(g);
    assert.equal(mem.career50.job,job);assert.equal(mem.career50.route,route);
    retired.push(CN.careerMemory(g));assert(retired.at(-1).includes('五十岁时'));
    mem.job='office';assert.equal(n40.cond(g),false);assert.equal(n50.cond(g),false,'转行不播放持续从业回响');
    assert.equal(CN.careerMemory(g),retired.at(-1),'转行仍可回顾真实50岁经历');
    assert(!/老板|自己的店|开了.*店/.test(retired.at(-1)),'晚年不把雇员变成老板');
    mem.tradeOwn=false;assert.equal(CN.careerMemory(g),retired.at(-1));
  }
  assert.equal(new Set(middle).size,routes.length,job+'40岁路线独立');
  assert.equal(new Set(late).size,routes.length,job+'50岁路线独立');
  assert.equal(new Set(retired).size,routes.length,job+'晚年活动独立');
}
mem.career50={job:'unknown',route:'steady'};assert.equal(CN.careerMemory(g),'');
mem.career50={job:'teacher',route:'unknown'};assert.equal(CN.careerMemory(g),'');
cash=1000;assert.equal(get('restaurant',30).choices[1].cond(g),false);assert.equal(get('mechanic',30).choices[1].cond(g),false);
mem.tradeOwn=false;assert(get('restaurant',30).choices[1].t(g).includes('学团餐'));mem.tradeOwn=true;assert(get('restaurant',30).choices[1].t(g).includes('改厨房'));
console.log('第二批四职业试点通过：10条路线、40/50岁独立反馈、晚年活动、旧档、转行与雇员边界。');
