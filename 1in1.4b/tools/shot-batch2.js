/* Chrome独立存档：真实引擎回响在桌面/手机与三主题下可读。 */
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');
const job=process.argv[2]||'restaurant',route=process.argv[3]||'rest';
if(!/^[a-z]+$/.test(job)||!['steady','learn','rest'].includes(route))throw Error('职业或路线参数无效');
const dir=path.resolve(__dirname,'..'),out=path.join(dir,'docs/validation/batch2',job+'-'+route);fs.mkdirSync(out,{recursive:true});
const chrome=process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe';
if(!fs.existsSync(chrome)||/msedge/i.test(chrome))throw Error('需要Chrome');
for(const width of [1440,390])for(const theme of ['dark','gray','light']){
  const file=path.join(dir,'_batch2-shot.html'),phone=path.join(dir,'_batch2-phone.html');
  const before=`<script>localStorage.clear();localStorage.setItem('vibe.lang','zh');window.batchErrors=[];addEventListener('error',e=>batchErrors.push(e.message));</script>`;
  const setup=`<script>{const E=JY.engine;E.startRandom();const L=E.get().L,g=E.G;L.year=JY.byId[L.cid].born+79;E.get().W.year=L.year;L.st['健康']=100;L.focus='锻炼身体';g.spawn({id:'k1',name:'小秋',sex:'女',born:L.year-46});g.remember('kids',1);g.remember('liveWith','alone');g.remember('familyWork','budget');g.remember('career50',{job:'${job}',route:'${route}'});window.batchMemory=JY.CN.careerMemory(g);g.remember('focusRun',{name:'锻炼身体',n:4,y:L.year-1});L.queue=['o_look_back_work','o_care_echo'];E.flush();L.log=L.log.filter(e=>e.k==='echo'||e.t.includes(window.batchMemory));E.save();document.documentElement.dataset.theme='${theme}';}</script>`;
  const driver=`<script>try{document.documentElement.dataset.theme='${theme}';document.getElementById('h-resume').click();const p=document.getElementById('c-pause');if(p)p.click();const text=document.body.textContent;if(!window.batchMemory||!text.includes(window.batchMemory)||!text.includes('第一份工资'))throw Error('真实回响没有进入生平');if(document.documentElement.scrollWidth>innerWidth)throw Error('横向溢出');if(batchErrors.length)throw Error(batchErrors.join(','));document.documentElement.dataset.batchCheck='PASS';}catch(e){document.documentElement.dataset.batchCheck='FAIL';document.body.append(e.stack);}</script>`;
  fs.writeFileSync(file,fs.readFileSync(path.join(dir,'index.html'),'utf8').replace('<script src="config.js"></script>',before+'<script src="config.js"></script>').replace('<script src="../share/ui.js"></script>',setup+'<script src="../share/ui.js"></script>').replace('</body>',driver+'</body>'));
  let target=file;
  if(width===390){fs.writeFileSync(phone,`<!doctype html><style>body{margin:0}iframe{border:0;width:390px;height:1400px}</style><iframe src="_batch2-shot.html" onload="document.documentElement.dataset.batchCheck=this.contentDocument.documentElement.dataset.batchCheck"></iframe>`);target=phone;}
  try{
    const dom=cp.execFileSync(chrome,['--headless=new','--disable-gpu','--allow-file-access-from-files','--hide-scrollbars','--window-size='+Math.max(520,width)+',1400','--virtual-time-budget=1500','--user-data-dir='+path.join(os.tmpdir(),'life-batch2-'+width+theme),'--screenshot='+path.join(out,theme+'-'+width+'.png'),'--dump-dom','file:///'+target.replace(/\\/g,'/')],{encoding:'utf8',timeout:60000,maxBuffer:12e6,stdio:['ignore','pipe','pipe']});
    if(!dom.includes('data-batch-check="PASS"'))throw Error(dom.slice(-2500));
    console.log('PASS '+theme+' '+width);
  }finally{fs.rmSync(file,{force:true});fs.rmSync(phone,{force:true});}
}
