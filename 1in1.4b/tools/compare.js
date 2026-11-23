/* 同一批出生、固定随机种子比较选法和重心。node 1in1.4b/tools/compare.js [80] [输出.json] */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..');
const cp=require('child_process'), crypto=require('crypto');
const git=args=>{try{return cp.execFileSync('git',args,{cwd:dir,encoding:'utf8'}).trim();}catch{return null;}};
const startedAt=new Date().toISOString(), commit=git(['rev-parse','HEAD']), workingTree=git(['status','--porcelain']);
const toolHash=crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
const scripts = [...fs.readFileSync(path.join(dir, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => !/^(https?:|\/)/.test(s) && !/(ui|pixel|sharecard|scenes)\.js$/.test(s));
const sources=scripts.map(s=>({path:s,source:fs.readFileSync(path.join(dir,s),'utf8')}));
const sourceHashes=sources.map(s=>({path:s.path,sha256:crypto.createHash('sha256').update(s.source).digest('hex')}));
const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ seed >>> 15, seed | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
function context(seed) {
  const store = {}, math = Object.create(Math); math.random = rng(seed);
  const ctx = { console, Math: math, JSON, Date: class extends Date { static now() { return 1800000000000; } }, localStorage: { getItem: k => store[k] || null, setItem: (k,v) => { store[k] = v; }, removeItem: k => { delete store[k]; } } }; ctx.window = ctx;
  vm.createContext(ctx); sources.forEach(s => vm.runInContext(s.source, ctx, {filename:s.path}));
  return ctx.JY;
}
const N = Number(process.argv[2]) || 80;
if (!Number.isInteger(N) || N < 1) throw Error('样本数必须为正整数');
const ageBand = age => age < 18 ? '0-17' : age < 35 ? '18-34' : age < 65 ? '35-64' : '65+';
const rows = [], modes = {def:null, work:'埋头工作', rest:'躺平休息', gym:'锻炼身体'};
const median = a => { a = a.slice().sort((a,b)=>a-b); return a.length ? a[Math.floor(a.length / 2)] : null; };
const quantile=(a,p)=>{a=a.slice().sort((a,b)=>a-b);return a.length?a[Math.floor((a.length-1)*p)]:null;};
for (const choice of (process.env.COMPARE_STYLE === 'auto' ? ['auto'] : ['canon','odd'])) for (const [focus,name] of Object.entries(modes)) {
  if (process.env.COMPARE_FILTER && !process.env.COMPARE_FILTER.split(',').includes(choice + ':' + focus)) continue;
  const lives = [];
  for (let i=0; i<N; i++) {
    const JY = context(17001+i), E=JY.engine;
    let autoMajorCalls=0; const baseAuto=E.autoIndex;
    if(choice==='auto') E.autoIndex=(n)=>{if(!E.isMinor(n))autoMajorCalls++;return baseAuto(n);};
    E.startRandom();
    let r = E.peek(), health45 = null, knowledge60 = null, asked=0, guard=0;
    const askedByAge = {'0-17':0,'18-34':0,'35-64':0,'65+':0}, askedByYear = {}, askedNodes = {};
    while (r.type !== 'death' && guard++ < 1000) {
      const {L} = E.get(), age=L.year-JY.byId[L.cid].born;
      if (r.type === 'node') {
        asked++; askedByAge[ageBand(age)]++; askedByYear[age]=(askedByYear[age]||0)+1; askedNodes[r.node.id]=(askedNodes[r.node.id]||0)+1; const opts=E.choices(r.node), pool=opts.filter(o => choice==='canon' ? o.ch.canon : !o.ch.canon && !o.ch.fatal);
        const warnIndex = {rest:0, change:1, ignore:2}[process.env.COMPARE_WARN];
        const forced = r.node.id === 'e_h_overwork_warn' && warnIndex != null ? opts.find(o=>o.i===warnIndex) : null;
        const automaticIndex = choice === 'auto' ? E.autoIndex(r.node) : null;
        const automatic = choice === 'auto' ? opts.find(o=>o.i===automaticIndex) : null;
        const p=forced || automatic || pool[0] || opts.find(o=>o.ch.canon) || opts[0]; E.choose(p.i); r=E.flush();
      } else {
        if (age===45) health45=L.st['健康']; if (age===60) knowledge60=L.st['学识'];
        if (name) { const opts=E.focusOptions(age+1); L.focus=opts.some(o=>o.name===name) ? name : E.defaultFocus(JY.byId[L.cid],age+1); L.mem.focusManual={v:name,y:L.year}; }
        // 默认组每年采用阶段默认；显式重心只在对应年龄可选时使用。
        else L.focus=E.defaultFocus(JY.byId[L.cid],age+1);
        r=E.nextYear();
      }
    }
    if (guard>=1000) throw Error('人生未结束');
    if(choice==='auto' && autoMajorCalls!==asked) throw Error('每个大抉择必须只抽签一次');
    const state=E.get().L, autoPicks=state.picks.filter(p=>p.auto).length;
    const echoes=state.log.filter(e=>e.k==='echo').length;
    const echoFromChoice=Object.keys(state.done).filter(id=>{const node=E.node(id);return node && node.echoOf && [].concat(node.echoOf).some(src=>state.pickBy && state.pickBy[src]);}).length;
    const l=E.finish('x'); lives.push({aim:l.aim&&l.aim.k,cause:l.cause,age:l.to-l.born,health45,knowledge60,career:l.st['事业'],knowledgeEnd:l.st['学识'],net:l.snap.net,asked,askedByAge,askedByYear,askedNodes,autoPicks,echoes,echoFromChoice,wishes:(l.wish||[]).filter(w=>w.ok).length});
  }
  const pct = fn => Math.round(lives.filter(fn).length/N*1000)/10;
  const earlyCauses = {}; lives.filter(l=>l.age<60).forEach(l=>{earlyCauses[l.cause]=(earlyCauses[l.cause]||0)+1;});
  const wishByAim={}; for(const aim of ['rich','proud','free','none']) { const a=lives.filter(l=>l.aim===aim); if(a.length) wishByAim[aim]={n:a.length,two:Math.round(a.filter(l=>l.wishes>=2).length/a.length*1000)/10,three:Math.round(a.filter(l=>l.wishes===3).length/a.length*1000)/10}; }
  const avg = fn => Math.round(lives.reduce((sum,l)=>sum+fn(l),0)/N*100)/100;
  const complete=lives.filter(l=>l.age>=80);
  const pace={askedMedian:median(lives.map(l=>l.asked)),askedP90:quantile(lives.map(l=>l.asked),0.9),askedByAge:Object.fromEntries(Object.keys(lives[0].askedByAge).map(k=>[k,avg(l=>l.askedByAge[k])])),sameYearMax:Math.max(...lives.map(l=>Math.max(0,...Object.values(l.askedByYear)))),yearsWithTwo:avg(l=>Object.values(l.askedByYear).filter(n=>n===2).length),yearsWithThreePlus:avg(l=>Object.values(l.askedByYear).filter(n=>n>=3).length),autoPicks:avg(l=>l.autoPicks),echoLogs:avg(l=>l.echoes),echoesWithChoiceSource:avg(l=>l.echoFromChoice),completeLives:{n:complete.length,askedMean:complete.length?Math.round(complete.reduce((sum,l)=>sum+l.asked,0)/complete.length*100)/100:null,askedMedian:median(complete.map(l=>l.asked)),askedP90:quantile(complete.map(l=>l.asked),0.9)},askedNodes:lives.reduce((out,l)=>{for(const [id,n] of Object.entries(l.askedNodes))out[id]=(out[id]||0)+n;return out;},{})};
  rows.push({choice,focus,n:N,pace,wishByAim,...(process.env.COMPARE_WARN ? {warning:process.env.COMPARE_WARN} : {}),earlyCauses,age:median(lives.map(l=>l.age)),early:pct(l=>l.age<60),health45:median(lives.map(l=>l.health45).filter(x=>x!=null)),knowledge60:median(lives.map(l=>l.knowledge60).filter(x=>x!=null)),knowledge60p10:quantile(lives.map(l=>l.knowledge60).filter(x=>x!=null),0.1),knowledge60p90:quantile(lives.map(l=>l.knowledge60).filter(x=>x!=null),0.9),knowledgeEnd:median(lives.map(l=>l.knowledgeEnd)),career:median(lives.map(l=>l.career)),net:median(lives.map(l=>l.net)),asked:Math.round(lives.reduce((s,l)=>s+l.asked,0)/N*100)/100,wishes:Math.round(lives.reduce((s,l)=>s+l.wishes,0)/N*100)/100,wish2:pct(l=>l.wishes>=2),wish3:pct(l=>l.wishes===3)});
  console.log(JSON.stringify(rows[rows.length-1]));
}
if (process.argv[3]) {
  fs.writeFileSync(process.argv[3], JSON.stringify(rows,null,2)+'\n');
  fs.writeFileSync(process.argv[3]+'.meta.json',JSON.stringify({generatedAt:new Date().toISOString(),startedAt,commit,workingTree,samplesPerGroup:N,seedStart:17001,seedEnd:17000+N,environment:Object.fromEntries(['COMPARE_STYLE','COMPARE_FILTER','COMPARE_WARN'].map(k=>[k,process.env[k]||null])),node:process.version,toolHash,scripts:sourceHashes,definitions:{completeLife:'age >= 80',echoLogs:'log kind echo; may lack a choice source',echoesWithChoiceSource:'completed echoOf nodes with at least one recorded source choice',sameYear:'all stopped choices in one age year, including life pauses'}},null,2)+'\n');
}
