'use strict';
const assert = require('assert/strict'), fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..'), store = {};
const ctx = { console, Math: Object.create(Math), JSON, Date, localStorage: { getItem: k => store[k] || null, setItem: (k,v) => { store[k]=v; }, removeItem: k => { delete store[k]; } } }; ctx.window=ctx;
vm.createContext(ctx);
const files=[...fs.readFileSync(path.join(dir,'index.html'),'utf8').matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]).filter(s=>!/^(https?:|\/)/.test(s)&&!/(ui|pixel|sharecard|scenes)\.js$/.test(s));
files.forEach(s=>vm.runInContext(fs.readFileSync(path.join(dir,s),'utf8'),ctx,{filename:s}));
const {JY}=ctx, E=JY.engine, G=JY.G;
E.startRandom(); let L=E.get().L; const c=JY.byId[L.cid];
const counts={6:3,7:3,8:4,15:4,16:5,17:5,18:6,22:6,23:7,39:7,40:6,49:6,50:5,54:5,55:5,69:5,70:4,84:4,85:3};
Object.entries(counts).forEach(([age,n])=>assert.equal(E.focusOptions(Number(age)).length,n,'重心边界 '+age));
const setAge=age=>{L.year=c.born+age; E.get().W.year=L.year;};
setAge(40); G.remember('job','office'); G.remember('kids',1);
G.spawn({id:'k1',name:'测试孩子',sex:'女',born:L.year-8,origin:'孩子'});
assert.equal(E.defaultFocus(c,40),'陪伴家人');
assert.notEqual(E.defaultFocus(c,55),'锻炼身体','v2.1.11 起 55 岁后不再默认锻炼，锻炼要自己选');
setAge(55); G.spawn({id:'k2',name:'晚育的孩子',sex:'男',born:L.year-5,origin:'孩子'});
assert.equal(E.defaultFocus(c,55),'陪伴家人','在职且仍有未成年孩子优先陪伴');
setAge(62); G.remember('job','retired');
assert.equal(E.defaultFocus(c,62),'陪伴家人','60 岁后没有工作的人默认陪伴家人');
setAge(55); G.remember('job','office');
setAge(54); L.focus='埋头工作'; JY.GAME.engine.onFocus(G,'埋头工作'); JY.GAME.engine.yearEnd(G,54);
assert.equal(L.focus,'埋头工作','阶段切换不覆盖手选重心'); setAge(40);
const defaultHook=JY.GAME.engine.defaultFocus; JY.GAME.engine.defaultFocus=()=> '不存在的重心';
assert.equal(E.defaultFocus(c,40),E.focusOptions(40)[0].name); JY.GAME.engine.defaultFocus=defaultHook;
// 旧存档没有新增字段，年终和存取仍可运行。
delete L.mem.fatigue; delete L.mem.workStrain; delete L.mem.focusManual;
L.focus='锻炼身体'; JY.ECON.yearEnd(G,40); assert.equal(G.recall('fatigue'),0);
E.save(); E.load(); L=E.get().L; assert.equal(L.cid,c.id);
if (JY.GAME.endNote) {
  const clean=JY.GAME.endNote.clean;
  assert.equal(clean('<img src=x onerror=alert(1)>你好\x00\n'),'你好');
  assert.equal(Array.from(clean('🙂'.repeat(40))).length,30);
  assert.equal(clean(undefined),'');
  const sample={seed:123,name:'样例',snap:{kids:1},cause:'过劳猝死',born:2026,to:2070,words:'x',picks:[],info:{}};
  const url=JY.GAME.share.url(sample); sample.note='只留在本机'; assert.equal(JY.GAME.share.url(sample),url);
  assert.ok(JY.GAME.share.badges(sample).some(t=>t.includes('只留在本机')));
}
// 每种新增工种的收入表、月薪提示和图鉴名称必须接得上。
for (const job of (JY.CN.TRADE_JOBS || [])) {
  setAge(40); G.remember('love','single'); G.remember('side',null); G.remember('rental',0); G.remember('fatigue',0); G.remember('lightDuty',false); G.remember('retired',false); G.remember('tier',2); G.setStat('事业',50); JY.CN.setJob(G,job,job);
  const annual=JY.CN.income(G), monthly=JY.CN.jobPay(G,job);
  assert.ok(annual>0 && Math.abs(annual-monthly*12)<=601,job+' 收入表一致');
  assert.ok(JY.JOB_T[job],job+' 图鉴名称');
  for (const age of [30,40,50]) assert.ok(E.node('i_'+job+'_'+age),job+' 行业节点 '+age);
  const start=E.node('i_'+job+'_30'), echo=E.node('i_'+job+'_40');
  setAge(30); JY.CN.earn(G,50000); start.choices[0].fx(G); const first=JY.val(echo.text);
  start.choices[1].fx(G); assert.notEqual(JY.val(echo.text),first,job+' 两条路有不同回响');
}
if (E.node('y_startup').choices.length >= 3 && E.node('i_entry_echo')) {
  setAge(27); E.node('y_startup').choices[2].fx(G); assert.equal(G.recall('tradeOwn'),true,'创业记录经营者');
  JY.CN.setJob(G,'office','公司职员'); assert.equal(G.recall('tradeOwn'),false,'换成雇员后清除经营身份');
}
// 已在跑夜车、没有房贷却有创业债，也必须有两条可选的路。
for(const house of ['rent','own','mortgage']) for(const side of [null,'drive']) {
  G.remember('debt',80); G.remember('house',house); G.remember('side',side);
  const count=E.choices(E.node('y_debt33')).length; assert.ok(count>=2&&count<=4,'还债选项边界 '+house+'/'+side);
}
// 所有分支可见选项都至少两个；范围节点及工种不依赖新存档字段。
const ids=JY.LIFE_NODES.concat(JY.ENCOUNTERS).map(n=>n.id); assert.equal(ids.length,new Set(ids).size);
if (JY.LIFE_NODES.some(n=>n.id==='t_dispatch')) {
  const n=E.node('t_dispatch'); setAge(36); G.remember('job','worker'); G.remember('abroadStay',false);
  assert.ok(n.cond(G)); n.choices[0].fx(G); assert.equal(G.recall('abroadStay'),false); assert.equal(G.recall('dispatch'),'half');
}
setAge(40); L.focus='埋头工作'; G.remember('fatigue',12); G.remember('fatigueWarn','ignore');
const rnd=G.rnd; G.rnd=()=>0; JY.ECON.yearEnd(G,40); G.rnd=rnd;
assert.equal(L.death,'过劳猝死','忽视预警的死亡链'); assert.equal(JY.GAME.engine.hookDeathFirst,true,'保留钩子死因');
const background={tech:JY.ENCOUNTERS.filter(n=>/^e_t_/.test(n.id)).length,daily:JY.ENCOUNTERS.filter(n=>/^e_daily_/.test(n.id)).length};
if (background.daily) { assert.ok(background.daily>=30); assert.ok(background.tech/(background.tech+background.daily)<=0.34); }
console.log('背景亲历池：'+JSON.stringify(background));
console.log('更新自检通过：重心年龄边界、默认回退、旧存档、留言安全、短期外派、节点唯一。');
