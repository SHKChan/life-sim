/* P0：实际引擎中的自动选择、明确决定和旧档边界。 */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert/strict');
const root = path.join(__dirname, '..');
const files = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => !s.startsWith('/') && !/(ui|pixel|sharecard|scenes)\.js$/.test(s));
const store = {}, math = Object.create(Math);
const ctx = { console, Math: math, JSON, Date, localStorage: {getItem:k => store[k] || null,setItem:(k,v) => {store[k]=v;},removeItem:k => {delete store[k];}} };
ctx.window=ctx; vm.createContext(ctx); files.forEach(s => vm.runInContext(fs.readFileSync(path.join(root,s),'utf8'),ctx));
const J=ctx.JY,E=J.engine; E.startRandom(); const g=E.G;
const node=id => J.LIFE_NODES.concat(J.ENCOUNTERS).find(n => n.id===id);
function history(rows) { E.get().L.picks=rows.map(([id, extra])=>Object.assign({id,auto:false,ok:true},extra)); }
function age(a) {const {L,W}=E.get();L.year=J.byId[L.cid].born+a;W.year=L.year;}
age(50);
const hook=J.GAME.engine.autoChoice;
const family=node('e_family_partner'),work=node('m_58_work');
g.remember('fight','talk');g.remember('marriage','cold');g.remember('career42','steady');g.remember('ai47','learn');
history([['y_crisis31'],['m_42_stable']]);
assert.equal(E.autoIndex(family),0,'职业求稳不覆盖家庭沟通');
assert.equal(E.autoIndex(work),1,'职业按本领域的明确选择');
history([['m_42_stable'],['m_47_ai']]);assert.equal(E.autoIndex(work),2,'近期职业选择优先');
history([['y_crisis31'],['m_38_marriage']]);assert.equal(E.autoIndex(family),2,'后来改主意优先');
history([['y_crisis31'],['m_38_marriage',{auto:true}]]);assert.equal(E.autoIndex(family),0,'自动经历不作为明确选择');
history([['m_38_marriage',{check:true,ok:false}]]);assert.equal(hook(family,g,E.choices(family)),undefined,'沟通失败不能被解释为主动冷落');
history([]);assert.equal(hook(family,g,E.choices(family)),undefined,'无历史回退');
history([['m_47_ai']]);assert.equal(hook(work,g,E.choices(work).filter(o=>o.i!==2)),undefined,'不可见选项不被选择');
const before=JSON.stringify(E.get().L.mem);let randomCalls=0;const original=math.random;math.random=()=>{randomCalls++;return .4;};
E.choices(work);E.choices(work);assert.equal(randomCalls,0,'预览不抽签');assert.equal(JSON.stringify(E.get().L.mem),before,'预览不改记忆');
assert.equal(E.autoIndex(work),2);assert.equal(randomCalls,0,'有明确依据不额外抽签');
// 无钩子保持原有默认算法：相同随机输入得到相同输出与随机调用次数。
history([]);randomCalls=0;const fallback=E.autoIndex(work),calls=randomCalls;J.GAME.engine.autoChoice=undefined;randomCalls=0;
assert.equal(E.autoIndex(work),fallback);assert.equal(randomCalls,calls);J.GAME.engine.autoChoice=hook;
const oldHook=J.GAME.engine.autoChoice;
J.GAME.engine.autoChoice=()=>999;assert(E.choices(work).some(o=>o.i===E.autoIndex(work)),'无效下标回退');
const sample={id:'p0_test',choices:[{t:'致命',fatal:true},{t:'安全',canon:true}]};J.GAME.engine.autoChoice=()=>0;
assert.equal(E.isMinor(sample),false,'致命风险始终停问');assert.equal(E.autoIndex(sample),1,'钩子不能指定致命选项');
J.GAME.engine.autoChoice=oldHook;math.random=original;
for(const id of ['y_kid31','y_marry27','y_single32','y_steady24','o_after_retire','e_m_kid_city','e_m_kid_wed','e_invest','e_family_no_wedding','e_o_last_hospital','y_credit22','o_grandcare'])assert.equal(E.isMinor(node(id)),false,id+'必须亲选');
const body=node('m_40_body');g.remember('cash',10000000);assert.equal(E.isMinor(body),false,'大额买车必须停问');g.remember('cash',0);assert.equal(E.isMinor(body),true,'普通生日仍可自动');
J.CN.marry(g);g.remember('kids',0);g.remember('kidPlan','dink');assert.equal(node('m_40_nokid').cond(g),false,'丁克不再被通用节点推翻');
g.remember('kidPlan','wait');assert.equal(node('m_40_nokid').cond(g),true,'等一等仍有机会');
E.save();E.load();assert.equal(g.recall('kidPlan'),'wait','不新增必需存档字段');
assert(!('autoChoice' in JSON.parse(store['1in1.4b.save.v2'])),'行为钩子不进入存档');
console.log('P0 rules: PASS（跨领域、近期选择、条件过滤、失败意图、预览、回退、致命保护、丁克与存档）');
