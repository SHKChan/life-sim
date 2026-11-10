/* 由 share/tools/tr.js 从 data/events.js 和 lang/en/tr/events.json 生成，不要手改。 */
/* 十四亿分之一 · 意外、新闻、闲笔
 * 意外（JY.addEncounters，id 以 e_ 开头）：任何年龄都可能碰上，选择用 g.remember 记下（键名以 ev 开头），
 *   几年后由下面的回响意外（auto + always）兑现。
 * 新闻（JY.addEvents）：2026–2120 年的民生新闻，按 docs/SPEC.md 的时间线写。
 * 闲笔（JY.addFlavor）：没有大事的年份里每年抽 1–2 句。
 *   写“你吃了……”“你学会了……”“你骑车……”的，一律写成 { t, minAge, maxAge }；
 *   地区、省份、城市等级的闲笔用 RG / PV / TIER 生成，默认 minAge 6。
 *   提到家里人先看人在不在、住没住在一起（has、CN.livesWith、CN.alone），称呼用 CN.who(g, id, true)。
 * 钱：成年后是真金白银（元）。新写的花钱、进账用 CN.pay / CN.earn，文字里写出金额，按 CN.income、CN.cash 定数。
 */
(function () {
  'use strict';
  const JY = window.JY;
  const CN = JY.CN;
  const Y = [2026, 2130];
  const job = (g) => g.recall('job');
  const tier = (g) => g.recall('tier') || 5;
  const big = (g) => tier(g) <= 2;
  const married = (g) => g.recall('love') === 'married';

  /* ---------- 读状态的小工具 ---------- */
  const has = (g, id) => !!JY.byId[id] && g.alive(id);
  const kids = (g) => ['k1', 'k2', 'k3'].filter((id) => has(g, id));
  const gks = (g) => ['gk1', 'gk2', 'gk3'].filter((id) => has(g, id));
  const spOk = (g) => married(g) && has(g, 'sp');
  const spRel = (g) => g.knows('sp') || 'spouse';
  const parentsAlive = (g) => has(g, 'fa') || has(g, 'mo');
  const parentsWord = (g) => (has(g, 'fa') && has(g, 'mo') ? 'Mom and Dad' : has(g, 'fa') ? 'Dad' : 'Mom');
  const withParents = (g) => CN.livesWith(g, 'fa') || CN.livesWith(g, 'mo');
  const money = (g) => !!g.recall('money0');
  const cash = (g) => CN.cash(g);
  const inc = (g) => Number(g.recall('income')) || 60000;
  const round = (x, step) => Math.max(step, Math.round(x / step) * step);
  const fmt = (x) => CN.fmt(x);
  const working = (g) => { const j = job(g); return !!j && j !== 'none' && j !== 'retired' && !g.recall('retired'); };
  const ta = (g, id) => (JY.byId[id] && JY.byId[id].sex === '女' ? 'her' : 'him');
  const olderSib = (g) => ['sib0', 'sib1'].find((id) => has(g, id) && g.ageOf(id) > g.age);

  /* ---------- 留下的痕迹（墓志页“你留下的痕迹”） ---------- */
  JY.addFlags({
    evSavedLife: 'You saved a stranger’s life on the subway.',
    evFoundKid: 'You helped a lost child find the way home.',
    evVillageShop: 'You helped the folks back in your home village sell their produce all over the country.',
    evVolunteer: 'You volunteered for many years.',
    evWitness: 'You testified in court about a car crash and helped the injured family get justice.',
  });

  /* ---------- 金额（按这个人的家底定数） ---------- */
  const loanAmt = (g) => round(Math.min(100000, Math.max(10000, inc(g) * 0.2)), 5000);
  const tipAmt = (g) => round(Math.min(200000, cash(g) * 0.3), 5000);
  const highAmt = (g) => round(Math.min(100000, cash(g) * 0.2), 5000);
  const carPrice = (g) => (tier(g) <= 2 ? 200000 : 120000);
  const premium = (g) => round(Math.min(15000, Math.max(3000, inc(g) * 0.05)), 500);
  const offerPrice = (g) => Math.round(CN.price(g) * 0.9);
  const offerDown = (g) => offerPrice(g) * 0.3 * 1e4;

  /* ---------- 意外 ---------- */
  JY.addEncounters([
    // —— 童年、学生 ——
    { id: 'e_stray_dog', y: Y, minAge: 6, maxAge: 14, t: 'Stray puppy', text: 'On the way home from school, a scruffy little stray dog followed you for two blocks. It was very thin and limped a little on one back leg.',
      choices: [
        { t: 'Give it half of your steamed bun', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evDog', 'fed'); }, res: 'It finished the bun and followed you all the way to your door before it left.' },
        { t: 'Carry it home and beg the grown-ups to keep it', dev: 15, fx: (g) => { g.stat('心情', 4); g.stat('人缘', 1); g.remember('evDog', 'kept'); },
          res: (g) => (g.recall('leftBehind') ? 'Grandma grumbled about the trouble, but that evening she mixed up some leftovers and carried them outside.' : g.recall('hukou') === 'rural' ? 'Your family said a dog in the yard would be good for guarding the gate.' : 'Mom frowned for a long time, then went downstairs to buy dog food.') },
        { t: 'Hurry away', dev: 0, fx: (g) => g.stat('心情', -1), res: 'You looked back once. It was still standing at the corner, not moving.' },
      ] },
    { id: 'e_found_wallet', y: Y, minAge: 8, maxAge: 16, t: 'Wallet', text: 'You found a wallet by the playground. Inside were about $60 in cash and an ID card.',
      choices: [
        { t: 'Hand it to your teacher', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evWallet', 'returned'); }, res: 'Your teacher praised you in class meeting. You felt a little embarrassed.' },
        { t: 'Take the money and toss the wallet back where it was', dev: 20, fx: (g) => { g.stat('心情', -2); g.remember('evWallet', 'kept'); }, res: 'You didn’t sleep well that night. You never dared spend a single yuan of it.' },
      ] },
    { id: 'e_ai_homework', y: Y, minAge: 8, maxAge: 15, t: 'Homework', text: 'The AI assistant at home says it could finish your homework in three seconds, even in handwriting that looks like yours.',
      choices: [
        { t: 'Write it yourself and only ask it for hints when you’re stuck', canon: true, fx: (g) => { g.stat('学识', 2); g.remember('evAiHw', 'learn'); }, res: 'You wrote until ten. On the last problem, one hint from it finally made things click.' },
        { t: 'Let it do it', dev: 15, fx: (g) => { g.stat('心情', 2); g.remember('evAiHw', 'copy'); }, res: 'You watched cartoons all evening. The next day your workbook was full of check marks.' },
        { t: 'Switch it off and don’t ask it a single word', dev: 20, fx: (g) => { g.stat('学识', 1); g.stat('心情', -1); g.remember('evAiHw', 'self'); }, res: 'You got three problems wrong, but every one of those mistakes was your own.' },
      ] },
    { id: 'e_game_night', y: Y, minAge: 11, maxAge: 17, t: 'Game', text: 'A classmate talks you into a new game. You win your first round, then glance at the clock: it’s already 11:30.',
      choices: [
        { t: 'One more round, then sleep', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evGame', 'some'); }, res: 'You played three more rounds. At morning study hall the next day you couldn’t stop yawning.' },
        { t: 'Play all night', dev: 20, fx: (g) => { g.stat('心情', 3); g.stat('健康', -2); g.remember('evGame', 'hooked'); }, res: 'By dawn you had climbed into the top hundred on the server.' },
        { t: 'Quit and uninstall it', dev: 15, fx: (g) => { g.stat('学识', 1); g.remember('evGame', 'quit'); }, res: 'Your classmate said you were no fun. You ignored him.' },
      ] },
    { id: 'e_bully_seen', y: Y, minAge: 9, maxAge: 16, t: 'The bathroom door', text: 'A few older boys have cornered a small, skinny classmate by the bathroom door and are taking his pocket money.',
      choices: [
        { t: 'Run and tell a teacher', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evBully', 'told'); }, res: 'The teacher came and they scattered. The kid they’d been bullying gave you a nod.' },
        { t: 'Rush in and pull them off him', dev: 25, check: ['健康', 60], fx: (g) => { g.stat('人缘', 3); g.remember('evBully', 'stood'); }, res: 'They never expected anyone to step in. They swore and walked off.',
          fail: { fx: (g) => { g.stat('健康', -4); g.remember('evBully', 'stood'); }, res: 'You took a punch to the face, but that kid’s money was safe.' } },
        { t: 'Keep your head down and walk past', dev: 0, fx: (g) => { g.stat('心情', -2); g.remember('evBully', 'passed'); }, res: 'You walked fast. You remembered the look in that kid’s eyes for a long time.' },
      ] },
    { id: 'e_talent_show', y: Y, minAge: 8, maxAge: 17, t: 'Talent show', text: 'The school is putting on a talent show, and your homeroom teacher asks who wants to perform. Nobody in the classroom raises a hand.',
      choices: [
        { t: 'Keep your head down and wait for someone else', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evStage', 'shy'); }, res: 'In the end the class monitor went up and sang a song.' },
        { t: 'Raise your hand and offer to do a comic dialogue', dev: 20, check: ['人缘', 45], fx: (g) => { g.stat('心情', 4); g.stat('人缘', 3); g.remember('evStage', 'hit'); }, res: 'The whole hall laughed three times. Your legs were still shaking when you came off the stage.',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('evStage', 'flop'); }, res: 'You forgot your lines and froze on stage. Some people in the audience were laughing, and it wasn’t at the jokes.' } },
      ] },
    { id: 'e_idol_concert', y: Y, minAge: 14, maxAge: 35, t: 'Concert', text: 'A singer you’ve loved for years is giving a concert in a nearby city. The cheapest ticket is about $85.',
      choices: [
        { t: 'Forget it, watch the livestream', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evConcert', 'online'); }, res: 'The comments scrolled by so fast you couldn’t even see the person on stage.' },
        { t: 'Save up, buy a ticket and take the night train', dev: 15, fx: (g) => { g.stat('心情', 5); CN.pay(g, 1500); g.remember('evConcert', 'went'); },
          res: (g) => (money(g) ? 'Ticket and train fare came to ' + fmt(1500) + '.' : '') + 'When it ended, you and the stranger next to you cried together. You added each other as friends.' },
      ] },

    // —— 青年、成年 ——
    { id: 'e_part_time_scam', y: Y, minAge: 16, maxAge: 30, t: 'Side job', text: 'A stranger pulls you into a group chat and says you can earn money just by liking posts and boosting orders. The first three orders really paid out. The fourth asks you to put up $300 first.',
      choices: [
        { t: 'Front the money, thinking you’ll quit after this one', canon: true, fx: (g) => { CN.pay(g, 2000); g.stat('心情', -3); g.remember('evScam', 'lost'); },
          res: (g) => (money(g) ? '' : 'That was your New Year money, saved up over two years.') + 'You sent the money and the group was dissolved.' },
        { t: 'Leave the group and block them', dev: 10, fx: (g) => { g.stat('学识', 1); g.remember('evScam', 'spotted'); }, res: 'You took screenshots of the chat and posted them in the family group to warn everyone.' },
        { t: 'Report it and give the group ID to the police', dev: 20, fx: (g) => { g.stat('人缘', 2); g.remember('evScam', 'reported'); }, res: 'The officer said this group had already cheated dozens of students. They took down your phone number.' },
      ] },
    { id: 'e_friend_borrow', y: Y, minAge: 20, maxAge: 65, t: 'A loan', cond: (g) => money(g),
      text: (g) => 'A friend of many years calls in the middle of the night. Something urgent has happened at home and he needs to borrow ' + fmt(loanAmt(g)) + '. His voice shakes a little.',
      choices: [
        { t: 'Lend it', canon: true, cond: (g) => cash(g) >= loanAmt(g), fx: (g) => { const a = loanAmt(g); CN.pay(g, a); g.stat('人缘', 2); g.remember('evLoan', 'lent'); g.remember('evLoanAmt', a); }, res: 'You sent the money. He said he’d pay it back within six months.' },
        { t: 'Lend half, say that’s all you have on hand', dev: 10, cond: (g) => cash(g) >= loanAmt(g) / 2, fx: (g) => { const a = loanAmt(g) / 2; CN.pay(g, a); g.remember('evLoan', 'half'); g.remember('evLoanAmt', a); }, res: (g) => 'You sent ' + fmt(g.recall('evLoanAmt')) + '. He was quiet for two seconds, then said that was enough and thanked you.' },
        { t: 'You’re short on cash, so go help him find another way', dev: 15, cond: (g) => cash(g) < loanAmt(g) / 2, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); g.remember('evLoan', 'helped'); }, res: 'Early the next morning you went with him to three banks and then helped him make a round of phone calls.' },
        { t: 'Say money is tight for you too', dev: 15, fx: (g) => { g.stat('人缘', -2); g.remember('evLoan', 'refused'); }, res: 'He said it was fine, he understood. He hung up fast.' },
      ] },
    { id: 'e_class_reunion', y: Y, minAge: 25, maxAge: 65, t: 'Class reunion', text: (g) => (['bachelor', 'master', 'phd'].includes(g.recall('edu')) ? 'The college class monitor posted in the group chat: old classmates, let’s get together one weekend.' : 'The middle school class monitor posted in the group chat: old classmates, let’s get together back in our hometown.'),
      choices: [
        { t: 'Go', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evReunion', 'went'); }, res: 'Some had gained weight, some had lost their hair, some didn’t show up. As the night ended you all promised to meet again next year.' },
        { t: 'Find an excuse not to go', dev: 10, fx: (g) => { g.stat('心情', 1); g.remember('evReunion', 'skip'); }, res: 'That night you scrolled past their group photo. You searched for yourself in it, and of course you weren’t there.' },
      ] },
    { id: 'e_viral_video', y: Y, minAge: 18, maxAge: 60, t: 'Gone viral', text: 'A video you casually shot got over five million views overnight. Your phone won’t stop buzzing.',
      choices: [
        { t: 'Reply to a few comments and carry on as usual', canon: true, fx: (g) => { g.stat('心情', 2); g.remember('evViral', 'ignored'); }, res: 'A week later, nobody remembered the video.' },
        { t: 'Strike while it’s hot: start livestreaming and take ads', dev: 25, fx: (g) => { CN.earn(g, 8000); g.stat('事业', 2); g.info('Side hustle', 'Blogger'); g.remember('evViral', 'ride'); }, res: (g) => 'Your first livestream drew twenty thousand viewers. Your first ad paid ' + fmt(8000) + '. Your palms were soaked with sweat as you talked.' },
        { t: 'Delete it and turn off comments', dev: 15, fx: (g) => { g.stat('心情', 1); g.remember('evViral', 'deleted'); }, res: 'Someone took screenshots and reshared them for a few rounds. Slowly, people stopped bringing it up.' },
      ] },
    { id: 'e_subway_faint', y: Y, minAge: 16, maxAge: 72, t: 'The man who collapsed', cond: (g) => tier(g) <= 3,
      text: (g) => pk(g, ['On the subway at morning rush hour', 'On the subway at evening rush hour', 'On the subway on a weekend'], 88) + ', a ' + pk(g, ['middle-aged man', 'man in work overalls', 'young man carrying a laptop bag'], 89) + ' suddenly collapses at your feet, his face turning blue. Everyone in the car backs away.',
      choices: [
        { t: 'Shout for help and call an ambulance', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evFaint', 'called'); }, res: 'The train pulled in and the emergency crew rushed aboard. As they lifted him onto the stretcher, his fingers twitched.' },
        { t: 'Kneel down and give him CPR', dev: 30, check: ['学识', 45], fx: (g) => { g.stat('人缘', 4); g.set('evSavedLife'); g.remember('evFaint', 'cpr'); }, res: 'On the third round of compressions he coughed and opened his eyes.',
          fail: { fx: (g) => { g.stat('心情', -4); g.remember('evFaint', 'tried'); }, res: 'You kept pressing until the medics took over. Afterwards you never found out whether he lived.' } },
        { t: 'Look at your phone and wait for someone else to deal with it', dev: 0, fx: (g) => { g.stat('心情', -2); g.remember('evFaint', 'away'); }, res: 'At the next stop you moved to a different car.' },
      ] },
    { id: 'e_lottery', y: Y, minAge: 18, maxAge: 85, t: 'Lottery', cond: (g) => money(g), text: (g) => pk(g, ['The owner of the lottery shop downstairs says they sold a second prize here just yesterday.', 'A new lottery shop has opened below your office, with a red banner on the door: second prize won here.', 'You’re in line at the convenience store and the old man ahead of you buys twenty tickets in one go.', 'Someone in the family group chat posts a lottery ticket and says the numbers came to them in a dream.'], 80),
      choices: [
        { t: 'Don’t buy, just leave', canon: true, fx: (g) => { g.remember('evLottery', 'never'); }, res: 'You bought a bottle of water and left.' },
        { t: 'Buy two tickets, just for something to look forward to', dev: 10, fx: (g) => { if (g.rnd() < 0.03) { CN.earn(g, 160000); g.stat('心情', 8); g.remember('evLottery', 'won'); } else { CN.pay(g, 4); g.remember('evLottery', 'habit'); } },
          res: (g) => (g.recall('evLottery') === 'won' ? 'On draw day you checked the numbers seven times. You’d won, and after tax it came to ' + fmt(160000) + '.' : 'Fifty cents, no win. But from then on you bought two tickets every week.') },
      ] },
    { id: 'e_rain_rider', y: Y, minAge: 18, maxAge: 60, t: 'Downpour', cond: (g) => job(g) === 'rider' || job(g) === 'driver',
      text: 'A downpour. You still have seven orders to deliver, and the app warns that late deliveries will be fined. The water on the road is already over your ankles.',
      choices: [
        { t: 'Grit your teeth and ride out', canon: true, fx: (g) => { CN.earn(g, 300); g.stat('健康', -3); g.remember('evRain', 'rushed'); }, res: 'All seven orders arrived and you made about $40 extra. You wiped out at one intersection: the food box survived, your knee didn’t.' },
        { t: 'Wait under an awning until the rain eases', dev: 10, fx: (g) => { CN.pay(g, 90); g.remember('evRain', 'waited'); }, res: 'You were fined about $13. You smoked a cigarette under the awning, and when the rain stopped a bit of light showed at the edge of the sky.' },
        { t: 'First help the old woman stuck in the water onto the steps', dev: 25, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 60); g.remember('evRain', 'helped'); }, res: 'Fined about $9 for lateness. The old woman kept asking your name. You said never mind and rode off.' },
      ] },
    { id: 'e_headhunter', y: Y, minAge: 24, maxAge: 50, t: 'Headhunter', cond: (g) => ['tech', 'office', 'sales'].includes(job(g)),
      text: 'A headhunter invites you for coffee and says another company will pay you 40% more, but you’d be working a lot of overtime.',
      choices: [
        { t: 'Thanks, not interested', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evHop', 'stayed'); }, res: 'You went back to your desk and your chair felt a bit more comfortable than usual.' },
        { t: 'Take the job', dev: 20, fx: (g) => { g.stat('事业', 4); g.stat('健康', -2); g.remember('evHop', 'hopped'); }, res: 'The new badge was black, nicer than the old one. You read your first pay slip twice.' },
        { t: 'Take the offer to your boss and ask for a raise', dev: 15, check: ['事业', 45], fx: (g) => { g.stat('事业', 2); g.remember('evHop', 'raise'); }, res: 'Your boss looked at you for a long while and gave you a 20% raise.',
          fail: { fx: (g) => { g.stat('心情', -3); g.remember('evHop', 'cold'); }, res: 'Your boss said he wouldn’t stop you if you wanted to go. You stayed, but from then on he looked at you differently.' } },
      ] },
    { id: 'e_rent_up', y: Y, minAge: 20, maxAge: 50, t: 'Landlord', cond: (g) => money(g) && !withParents(g) && (g.recall('house') === 'rent' || (g.recall('house') == null && g.age >= 22 && tier(g) <= 3)),
      text: 'Your landlord messages: starting next month, rent goes up about $70 a month.',
      choices: [
        { t: 'Put up with it and keep living there', canon: true, fx: (g) => { CN.pay(g, 6000); g.remember('evRent', 'paid'); }, res: (g) => 'You’ll pay ' + fmt(6000) + ' extra over the year. You gave up your daily coffee and started making tea at home.' },
        { t: 'Move somewhere farther out', dev: 10, fx: (g) => { g.stat('健康', -1); g.remember('evRent', 'moved'); }, res: 'The commute is forty minutes longer, the place is a bit bigger, and you can see a vegetable patch from the window.' },
        { t: 'Visit the landlord and talk it over', dev: 10, check: ['人缘', 50], fx: (g) => { CN.pay(g, 2400); g.remember('evRent', 'haggled'); }, res: 'Your landlord is a retired teacher. In the end the rise was only about $30, and she gave you a bag of tangerines.',
          fail: { fx: (g) => { CN.pay(g, 6000); g.stat('心情', -2); g.remember('evRent', 'paid'); }, res: 'Your landlord said plenty of people would rent it if you wouldn’t.' } },
      ] },
    { id: 'e_red_envelope', y: Y, minAge: 22, maxAge: 55, t: 'Wedding gift money', cond: (g) => money(g), text: 'You got three wedding invitations this month. One is from a coworker whose name you can barely remember.',
      choices: [
        { t: 'Give the usual amount for each', canon: true, fx: (g) => { CN.pay(g, big(g) ? 2400 : 1500); g.remember('evGift', 'normal'); }, res: (g) => 'Three gifts, ' + fmt(big(g) ? 2400 : 1500) + ' in total. Money is a bit tight this month.' },
        { t: 'Give a big red envelope to your close friend and skip the others', dev: 15, fx: (g) => { CN.pay(g, 2000); g.stat('人缘', 1); g.remember('evGift', 'close'); }, res: (g) => 'You put ' + fmt(2000) + ' in an envelope. The groom hugged you and said you were his best friend.' },
        { t: 'Skip them all and say you’re away on a business trip', dev: 15, fx: (g) => { g.stat('人缘', -2); g.remember('evGift', 'skip'); }, res: 'Later someone mentioned you in the group chat and said you’d been so busy lately.' },
      ] },
    { id: 'e_relative_kid', y: Y, minAge: 32, maxAge: 62, t: 'A relative’s kid', cond: (g) => g.s('事业') >= 35 && working(g),
      text: 'Your cousin calls to say her kid just graduated and wants an internship where you work. Could you put in a word?',
      choices: [
        { t: 'Ask around for her', canon: true, fx: (g) => { g.stat('人缘', 2); g.remember('evNephew', 'helped'); }, res: 'The kid came, quick on the uptake, and brought you breakfast on the very first day.' },
        { t: 'Politely turn her down', dev: 10, fx: (g) => { g.stat('人缘', -1); g.remember('evNephew', 'declined'); }, res: 'Your cousin said it was fine. At New Year she spoke to you a bit less.' },
      ] },
    { id: 'e_checkup', y: Y, minAge: 30, maxAge: 75, t: 'Checkup report', text: (g) => (working(g) ? 'On your work checkup report' : 'On your free community checkup report') + ', one line is in bold: further examination recommended.',
      choices: [
        { t: 'Go to the hospital for a follow-up', canon: true, fx: (g) => { g.stat('健康', 2); g.remember('evCheck', 'checked'); }, res: 'The doctor said it was caught early, no big deal, just take your medicine on time. You left the hospital and bought yourself a bowl of hot soup.' },
        { t: 'Deal with it after this busy stretch', dev: 15, fx: (g) => { g.stat('心情', 1); g.remember('evCheck', 'ignored'); }, res: 'This busy stretch lasted two years.' },
      ] },
    { id: 'e_marathon', y: Y, minAge: 20, maxAge: 62, t: 'Marathon', text: 'Registration for the city marathon is open. A friend says he’s running the half and asks if you’re in.',
      choices: [
        { t: 'Run', dev: 15, check: ['健康', 55], fx: (g) => { g.stat('健康', 3); g.stat('心情', 3); g.remember('evRun', 'ran'); }, res: 'When you crossed the finish line your legs didn’t feel like yours. But you wanted to run again.',
          fail: { fx: (g) => { g.stat('健康', -2); g.remember('evRun', 'quit'); }, res: 'At twelve kilometers you climbed into the sweeper van. Someone on board gave you a banana.' } },
        { t: 'Cheer him on from the roadside', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evRun', 'cheered'); }, res: 'As he ran past, he gave you a thumbs-up.' },
      ] },
    { id: 'e_side_stall', y: Y, minAge: 20, maxAge: 55, t: 'Night market stall', cond: (g) => money(g), text: 'A friend says a night market stall costs only a few dozen dollars a month and asks if you want to sell grilled sausages together.',
      choices: [
        { t: 'Nah, after work all you want is to lie down', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evStall', 'no'); }, res: 'You scrolled past a video he posted, with a line queued up at his stall.' },
        { t: 'Do it', dev: 20, fx: (g) => { CN.pay(g, 3000); g.stat('健康', -1); g.remember('evStall', g.rnd() < 0.55 ? 'good' : 'bad'); }, res: (g) => 'Buying a grill and stock cost ' + fmt(3000) + ' at first. The first night you sold a hundred and twenty sausages. Your back ached too much to straighten, yet you smiled the whole way home.' },
      ] },
    { id: 'e_invest', y: Y, minAge: 25, maxAge: 68, t: 'Investing', cond: (g) => money(g) && cash(g) >= 20000,
      text: (g) => 'Your coworkers are all talking about one fund, saying it rose 30% in a month. Your ' + fmt(cash(g)) + ' in savings is sitting in the bank earning pitiful interest.',
      choices: [
        { t: 'Just keep it in the bank', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evInvest', 'saved'); }, res: 'You slept soundly.' },
        { t: 'Put half your savings in and chase it', dev: 20, fx: (g) => { const a = CN.invest(g, round(cash(g) / 2, 1000), 'stock'); g.stat('心情', 2); g.remember('evInvest', 'chased'); g.remember('evInvestAmt', a); }, res: (g) => 'You bought in with ' + fmt(g.recall('evInvestAmt')) + '. The next day it rose two points, and you checked your phone thirty times that night.' },
        { t: 'Put in a little every month and don’t look for ten years', dev: 15, fx: (g) => { const a = CN.invest(g, round(cash(g) * 0.2, 1000), 'fund'); g.remember('evInvest', 'dca'); g.remember('evInvestAmt', a); }, res: 'You set up automatic deductions and then uninstalled the app.' },
      ] },
    { id: 'e_cat_adopt', y: Y, minAge: 20, maxAge: 80, t: 'Stray cats', cond: (g) => !CN.pet(g), text: (g) => pk(g, ['In the bike shed of your complex', 'Behind the boiler room at your workplace', 'In the bushes downstairs'], 81) + ', a stray cat has had a litter of kittens.' + pk(g, [' The property office has posted a notice: they’ll all be cleared out next week.', 'Someone in the residents’ chat says they’re too noisy and should be gotten rid of.', 'It’s getting colder, and at night you can hear them crying.'], 82),
      choices: [
        { t: 'Adopt one', dev: 15, fx: (g) => { g.stat('心情', 4); g.remember('evCat', 'adopted'); }, res: 'It’s a calico, and on the very first day it burrowed into your bed.' },
        { t: 'Help find them homes in the residents’ chat', dev: 10, fx: (g) => { g.stat('人缘', 2); g.remember('evCat', 'rehomed'); }, res: 'All five kittens were taken within three days.' },
        { t: 'Look for a moment and walk on like everyone else', canon: true, fx: (g) => g.stat('心情', -1), res: 'The next week, the cats’ nest was empty.' },
      ] },
    { id: 'e_neighbor', y: Y, minAge: 22, maxAge: 80, t: 'Upstairs', cond: (g) => tier(g) <= 4, text: (g) => 'A new family has moved in upstairs, ' + ['and every night at eleven they start dragging chairs.', 'and there are thumps in the middle of the night, again and again.', 'and they play the piano every night until eleven.'][Math.floor(rr(g, 84) * 3)],
      choices: [
        { t: 'Put up with it and buy earplugs', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evNeighbor', 'endured'); }, res: 'The earplugs worked well. The only problem is you can’t hear your morning alarm either.' },
        { t: 'Bring a bag of fruit and go talk to them', dev: 15, fx: (g) => { g.stat('人缘', 3); g.remember('evNeighbor', 'friend'); }, res: (g) => ['An old woman opened the door and said her legs are bad, so she drags the chair along to walk. She made you a cup of tea.', 'An old woman opened the door and said her grandson practices jump rope at home in the evenings. She made you a cup of tea.', 'A young girl opened the door and said she has a piano exam next month. Her mother made you a cup of tea and promised they’d stop at nine from now on.'][Math.floor(rr(g, 84) * 3)] },
        { t: 'Bang on the ceiling with a broom handle', dev: 15, fx: (g) => { g.stat('心情', 1); g.stat('人缘', -2); g.remember('evNeighbor', 'feud'); }, res: 'Upstairs went quiet. When you meet in the elevator, neither of you looks at the other.' },
      ] },
    { id: 'e_witness', y: Y, minAge: 20, maxAge: 72, t: 'Car crash', text: 'A car runs a red light at the intersection and knocks down a man on an electric scooter. The driver gets out, takes a look, and says the other guy darted out. You saw it all clearly.',
      choices: [
        { t: 'Leave your number and offer to testify', dev: 25, fx: (g) => { g.stat('人缘', 2); g.stat('心情', -1); g.remember('evWitness', 'testified'); }, res: 'The traffic officer wrote down what you said. The rider lying on the ground nodded at you.' },
        { t: 'Help call the ambulance but say little', canon: true, fx: (g) => { g.remember('evWitness', 'quiet'); }, res: 'The ambulance came and you left.' },
      ] },
    { id: 'e_volunteer', y: Y, minAge: 16, maxAge: 78, t: 'Volunteer', text: 'The community is recruiting volunteers to chat with elderly people who live alone, two hours a week.',
      choices: [
        { t: 'Sign up', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); g.remember('evVol', 'yes'); }, res: 'The old man you were matched with is a retired fitter. At your first meeting he spent two hours telling you about his younger days.' },
        { t: 'Too busy, maybe next time', canon: true, fx: (g) => { g.remember('evVol', 'no'); }, res: 'The poster stayed on the notice board for a month.' },
      ] },
    { id: 'e_classmate_ill', y: Y, minAge: 30, maxAge: 68, t: 'Crowdfunding', text: 'Someone in the old classmates’ group chat shared a crowdfunding link. The person who’s sick is your desk mate from middle school.',
      choices: [
        { t: 'Donate $30 and share it', canon: true, fx: (g) => { CN.pay(g, 200); g.remember('evIll', 'shared'); }, res: 'The comments under the link kept piling up.' },
        { t: 'Take time off and visit him at the hospital', dev: 20, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 2000); g.remember('evIll', 'visited'); }, res: (g) => 'You pressed a ' + fmt(2000) + ' red envelope into his hand. He’d grown so thin you hardly recognized him. You talked about the silkworms you once secretly raised in your desks in middle school.' },
      ] },
    { id: 'e_lost_child', y: Y, minAge: 16, maxAge: 78, t: 'The lost child', text: (g) => pk(g, ['At the mall entrance', 'At the subway exit', 'By the lake in the park', 'Next to the supermarket checkout'], 83) + ', a boy of four or five is standing there crying. He says he can’t find his mom.',
      choices: [
        { t: 'Take him to find security guards or the police', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evKid', 'police'); }, res: 'The announcement played twice, then his mother came running and hugged him, crying.' },
        { t: 'Wait with him where he is and post a photo in the local group chat', dev: 20, fx: (g) => { g.stat('人缘', 3); g.set('evFoundKid'); g.remember('evKid', 'waited'); }, res: 'Twenty minutes later, his mother saw the photo in the group and came. She wanted to give you money, but you refused.' },
      ] },
    { id: 'e_village_live', y: Y, minAge: 20, maxAge: 60, t: 'Hometown fruit', cond: (g) => g.recall('hukou') === 'rural',
      text: 'This year your home village’s fruit harvest is huge, but buyers are pushing the price way down. The village Party secretary calls and asks if you can help sell it online.',
      choices: [
        { t: 'Share it on your social feed and ask around', canon: true, fx: (g) => { g.stat('人缘', 1); g.remember('evVillage', 'shared'); }, res: 'Dozens of boxes sold. The secretary said, thank you for still remembering the village.' },
        { t: 'Take a few days off, go back and sell it on livestream', dev: 25, fx: (g) => { g.stat('人缘', 3); CN.pay(g, 1500); g.set('evVillageShop'); g.remember('evVillage', 'live'); }, res: 'On the first day you sold three thousand boxes. Your second uncle hauled boxes behind the camera, grinning from ear to ear.' },
      ] },
    { id: 'e_old_teacher', y: Y, minAge: 25, maxAge: 72, t: 'Teacher', text: 'You hear that your old homeroom teacher is in the hospital. She taught you for three years and always said your handwriting was too messy.',
      choices: [
        { t: 'Call and say hello', canon: true, fx: (g) => { g.remember('evTeacher', 'called'); }, res: 'Her voice on the phone was weak, but she still knew your name right away.' },
        { t: 'Bring flowers and visit her at the hospital', dev: 15, fx: (g) => { g.stat('人缘', 2); g.remember('evTeacher', 'visited'); }, res: 'She held your hand and said your handwriting is much nicer now.' },
      ] },
    { id: 'e_friend_divorce', y: Y, minAge: 30, maxAge: 62, t: 'Drinks', text: 'A good friend asks you out for drinks. Around the third bottle, he says he’s getting a divorce.',
      choices: [
        { t: 'Urge him to think again, for the kid’s sake', canon: true, fx: (g) => { g.remember('evFriendDiv', 'persuade'); }, res: 'He nodded, then shook his head.' },
        { t: 'Say nothing, just keep him company until dawn', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('evFriendDiv', 'listened'); }, res: 'At dawn he said thanks for not trying to talk him out of it.' },
      ] },
    { id: 'e_typhoon', y: Y, minAge: 10, maxAge: 80, t: 'Typhoon', cond: (g) => g.recall('region') === '华南' || g.recall('region') === '华东',
      text: 'A typhoon is about to make landfall. The bread shelves at the supermarket are empty and windows are taped with big X’s.',
      choices: [
        { t: 'Close up the windows and stay in', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evStorm', 'home'); }, res: 'The wind blew all night and two trees downstairs came down.' },
        { t: 'Help the elderly neighbor downstairs who lives alone reinforce her windows', dev: 20, fx: (g) => { g.stat('人缘', 3); g.remember('evStorm', 'helped'); }, res: 'You nailed up the last board just as the rain came crashing down. The old lady cooked you a bowl of sweet soup.' },
        { t: 'Go to the seafront to photograph the waves', dev: 25, cond: (g) => g.age <= 55, check: ['健康', 50], fx: (g) => { g.stat('心情', 3); g.remember('evStorm', 'reckless'); }, res: 'You got a shot of waves taller than the buildings, and it was shared ten thousand times.',
          fail: { fx: (g) => { g.stat('健康', -10); g.remember('evStorm', 'hurt'); }, res: 'A wave slammed you against the railing. You spent half a month in the hospital.' } },
      ] },
    { id: 'e_snowstorm', y: Y, minAge: 8, maxAge: 80, t: 'Heavy snow', cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')),
      text: 'A night of heavy snow, and in the morning you can’t push the door open. The snow in the yard is above your knees.',
      choices: [
        { t: 'Shovel your own doorway', canon: true, fx: (g) => g.stat('健康', 1), res: 'By the time you finished you were drenched in sweat and your face was red from the cold.' },
        { t: 'Clear the entrance to the whole building while you’re at it', dev: 15, fx: (g) => { g.stat('人缘', 3); g.stat('健康', -1); g.remember('evSnow', 'swept'); }, res: 'The old man upstairs watched you from behind his window for a long time, and the next day he brought you a bag of frozen pears.' },
        { t: 'Build a snowman first', dev: 10, fx: (g) => { g.stat('心情', 4); g.remember('evSnow', 'fun'); }, res: 'The snowman’s nose was a carrot. You took a photo and kept it for many years.' },
      ] },
    { id: 'e_ai_layoff', y: [2044, 2080], minAge: 22, maxAge: 60, t: 'New system', cond: (g) => ['office', 'worker', 'driver', 'sales', 'shop'].includes(job(g)),
      text: 'Your company has rolled out a new AI system. At the department meeting they say next year 30% of positions will be “optimized.”',
      choices: [
        { t: 'Keep your head down and see what happens', canon: true, fx: (g) => { g.stat('心情', -2); g.remember('evAiCut', 'stay'); }, res: 'During that period you sat in the back row at every meeting.' },
        { t: 'Study at night how to manage these systems', dev: 20, fx: (g) => { g.stat('学识', 3); g.stat('健康', -1); g.remember('evAiCut', 'reskill'); }, res: 'The course was hard. In the first month you fell asleep in class three times.' },
        { t: 'Strike first and find your own way out', dev: 25, fx: (g) => { CN.setJob(g, 'freelance', 'Freelancer'); g.remember('evAiCut', 'left'); }, res: 'You handed in your resignation. When you walked out of the office tower, the sky was especially blue.' },
      ] },
    { id: 'e_robot_buy', y: [2060, 2130], minAge: 35, t: 'Robot', cond: (g) => g.recall('robot') == null && money(g),
      text: (g) => 'The appliance mall is running a promotion: a household robot for ' + fmt(36000) + ', in 24 interest-free installments. The salesperson says it can cook, mop, and play chess with the elderly.',
      choices: [
        { t: 'Too expensive, wait a bit', canon: true, fx: (g) => { g.remember('evRobot', 'waited'); }, res: 'You stood in front of it for ten minutes and touched its hand.' },
        { t: 'Buy one on installments', dev: 15, fx: (g) => { CN.pay(g, 36000); g.stat('健康', 1); g.remember('evRobot', 'bought'); }, res: 'On its first day home it sorted your socks by color.' },
      ] },
    { id: 'e_hometown_newyear', y: Y, minAge: 18, maxAge: 60, t: 'New Year',
      cond: (g) => !!g.recall('workCity') && g.recall('workCity') !== g.recall('city') && parentsAlive(g) && !withParents(g) && g.recall('parentsCare') !== 'nursing',
      text: 'On the twentieth of the twelfth lunar month, the ticket-grabbing app ran all night and your ticket home is still on the waitlist.',
      choices: [
        { t: 'Pay extra for a standing ticket and go home anyway', canon: true, fx: (g) => { CN.pay(g, 2000); g.stat('人缘', 2); g.stat('健康', -1); g.remember('evNewYear', 'home'); }, res: 'You stood for nine hours. When you pushed open the door, your favorite dishes were laid out on the table.' },
        { t: 'Don’t go back this year, do a video call greeting', dev: 15, fx: (g) => { g.stat('心情', -1); g.remember('evNewYear', 'stay'); }, res: (g) => (has(g, 'mo') ? 'On the video call, Mom says it’s okay, it’s okay, and asks if you’re having dumplings over there.' : 'On the video call, Dad says it’s okay and tells you to remember to have one good meal.') },
        { t: (g) => 'Bring ' + parentsWord(g) + ' over for New Year', dev: 20, fx: (g) => { CN.pay(g, 8000); g.stat('人缘', 3); g.remember('evNewYear', 'brought'); },
          res: (g) => (has(g, 'fa') && has(g, 'mo') ? 'They' : parentsWord(g)) + ' saw the city’s fireworks for the first time, kept saying it was too expensive, and kept taking photos. Train tickets, food and lodging came to ' + fmt(8000) + '.' },
      ] },
    { id: 'e_health_lecture', y: Y, minAge: 60, t: 'Lecture', text: 'They’re handing out eggs at the gate of your complex: sit through a “health lecture” and you get a box. The person at the podium says their supplements cure everything.',
      choices: [
        { t: 'Take the eggs and leave', canon: true, fx: (g) => g.stat('心情', 1), res: 'Two of the eggs were cracked.' },
        { t: 'Buy a course of treatment', dev: 15, fx: (g) => { CN.pay(g, 8800); g.remember('evLecture', 'bought'); }, res: 'One course costs $1,260. They say the second course is 20% off.' },
        { t: 'Stand up and ask him: do you have an approval certificate?', dev: 20, fx: (g) => { g.stat('人缘', 2); g.remember('evLecture', 'exposed'); }, res: 'The man at the podium froze. A few old neighbors walked out with you.' },
      ] },
    { id: 'e_square_dance', y: Y, minAge: 55, maxAge: 82, t: 'The square', text: (g) => pk(g, ['At dusk in the square', 'On the open ground in your complex', 'By the pavilion in the park'], 85) + ', a group of people is ' + pk(g, ['dancing to the music', 'doing aerobics to the music', 'doing tai chi to the music'], 86) + '. The lead ' + pk(g, ['auntie', 'uncle'], 87) + ' waves you over.',
      choices: [
        { t: 'Just watch from the side', canon: true, fx: (g) => { g.stat('心情', 1); g.remember('evDance', 'watched'); }, res: 'The music was loud, and you tapped your knee along to the beat.' },
        { t: 'Join in', dev: 15, fx: (g) => { g.stat('健康', 2); g.stat('人缘', 2); g.remember('evDance', 'joined'); }, res: 'You missed a few beats and nobody laughed. When it broke up, someone pressed a bottle of water into your hand.' },
      ] },
    { id: 'e_tech_class', y: Y, minAge: 66, t: 'New gadget', cond: (g) => kids(g).length > 0,
      text: (g) => (gks(g).length ? 'Your grandkids' : 'Your kids') + ' give you a pair of new glasses, saying you can video chat with them and enlarge the text. You can’t make sense of the manual.',
      choices: [
        { t: 'Put it in a drawer, the old phone is fine', canon: true, fx: (g) => { g.remember('evTech', 'drawer'); }, res: 'The old phone’s screen has a crack running across it.' },
        { t: 'Go to the community class for seniors to learn how to use it', dev: 15, fx: (g) => { g.stat('学识', 2); g.remember('evTech', 'learned'); }, res: 'The teacher was a college student, very patient. You filled three whole pages of your notebook.' },
      ] },

    // —— 钱 ——
    { id: 'e_tip_stock', y: Y, minAge: 25, maxAge: 70, t: 'Inside tip', cond: (g) => money(g) && cash(g) >= 30000,
      text: 'At the holiday dinner table, a distant great-uncle lowers his voice: a friend of his works at a company that has big news next month. Buy the stock now and it’ll at least double.',
      choices: [
        { t: 'Smile and don’t take it seriously', canon: true, fx: (g) => { g.remember('evTip', 'no'); }, res: 'You poured your great-uncle a cup of tea and changed the subject.' },
        { t: (g) => 'Put ' + fmt(tipAmt(g)) + ' into it', dev: 20, fx: (g) => { const a = tipAmt(g); CN.pay(g, a); g.stat('心情', 2); g.remember('evTip', 'in'); g.remember('evTipAmt', a); }, res: (g) => 'You moved ' + fmt(g.recall('evTipAmt')) + ' into your stock account. That night you dreamed the numbers kept climbing.' },
        { t: 'Try with just a small amount', dev: 10, fx: (g) => { const a = round(tipAmt(g) / 5, 1000); CN.pay(g, a); g.remember('evTip', 'little'); g.remember('evTipAmt', a); }, res: (g) => 'You bought ' + fmt(g.recall('evTipAmt')) + ', telling yourself that if you lose it, it’s tuition.' },
      ] },
    { id: 'e_high_yield', y: Y, minAge: 40, maxAge: 85, t: 'Financial advisor', cond: (g) => money(g) && cash(g) >= 20000,
      text: 'Someone calling himself a financial advisor adds you as a friend. He says he has a product with a 15% annual return, principal and interest guaranteed. Lots of people have bought it, and opening an account even gets you a jug of cooking oil.',
      choices: [
        { t: 'Don’t believe it, delete him', canon: true, fx: (g) => { g.remember('evHigh', 'no'); }, res: 'He added you again from another account. You deleted him again.' },
        { t: (g) => 'Start with ' + fmt(highAmt(g)) + ' as a trial', dev: 15, fx: (g) => { const a = highAmt(g); CN.pay(g, a); g.remember('evHigh', 'in'); g.remember('evHighAmt', a); }, res: 'The first month, the interest really arrived. The jug of oil was delivered to your door too.' },
        { t: (g) => (kids(g).some((id) => g.ageOf(id) >= 20) ? 'Ask your kids first' : 'Ask a bank teller first'), dev: 10, fx: (g) => { g.stat('学识', 1); g.remember('evHigh', 'asked'); },
          res: (g) => (kids(g).some((id) => g.ageOf(id) >= 20) ? 'Your child panicked on the phone: that’s a scam. In the end you let ' + ta(g, 'k1') + ' block that person for you.' : 'The teller took one look and said that of ten products guaranteeing a 15% return, ten are scams.') },
      ] },
    { id: 'e_net_loan', y: Y, minAge: 18, maxAge: 32, t: 'Online loan', cond: (g) => money(g) && cash(g) < 10000,
      text: 'An ad pops up on your phone: borrow up to $7,000 with just your ID, instant deposit, interest-free for the first thirty days. This month you really are a bit short.',
      choices: [
        { t: 'Don’t tap it, tighten your belt this month', canon: true, fx: (g) => { g.stat('心情', -1); g.remember('evNetLoan', 'no'); }, res: 'You uninstalled the food delivery app and cooked noodles at home every day.' },
        { t: 'Borrow $2,900 for the emergency', dev: 15, fx: (g) => { CN.earn(g, 20000); g.remember('debt', (Number(g.recall('debt')) || 0) + 2.6); g.remember('evNetLoan', 'took'); }, res: (g) => 'In ten seconds, ' + fmt(20000) + ' hit your account. The contract was twenty pages long and you didn’t read a single one.' },
        { t: (g) => 'Ask ' + parentsWord(g) + ' for help', dev: 10, cond: (g) => parentsAlive(g), fx: (g) => { CN.earn(g, 5000); g.remember('evNetLoan', 'family'); }, res: (g) => 'You stammered on the phone. The next day your card had ' + fmt(5000) + ' more, with a note that said: eat well.' },
      ] },
    { id: 'e_windfall', y: Y, minAge: 22, maxAge: 64, t: 'Company party', cond: (g) => money(g) && working(g) && job(g) !== 'farmer',
      text: (g) => (['rider', 'driver', 'worker'].includes(job(g)) ? 'At the year-end dinner raffle' : 'At the company party raffle') + ', the host calls your name: first prize, cash ' + fmt(20000) + '.',
      choices: [
        { t: 'Save it', canon: true, fx: (g) => { CN.earn(g, 20000); g.remember('evWindfall', 'saved'); }, res: 'You moved the money into savings and felt a little more at ease.' },
        { t: (g) => (CN.alone(g) ? 'Give yourself a holiday and go on a trip' : 'Take the family on a trip'), dev: 15, fx: (g) => { CN.earn(g, 2000); g.stat('心情', 5); g.remember('evWindfall', 'trip'); },
          res: (g) => (CN.alone(g) ? 'You went to the seaside alone and stayed five days, spending it down to the last $300.' : 'The whole family went to the seaside and stayed five days, spending it down to the last $300.') },
        { t: (g) => 'Give it all to ' + parentsWord(g), dev: 15, cond: (g) => parentsAlive(g), fx: (g) => { g.stat('人缘', 3); g.remember('evWindfall', 'parents'); }, res: (g) => parentsWord(g) + ' kept refusing on the phone, and finally said: all right, we’ll just keep it for you for now.' },
      ] },
    { id: 'e_car', y: Y, minAge: 24, maxAge: 60, t: 'Buying a car', cond: (g) => money(g) && cash(g) >= 60000,
      text: (g) => 'On the weekend you wandered around a car show. The salesman says this electric model is cheaper this year, ' + fmt(carPrice(g)) + ', with only 20% down.',
      choices: [
        { t: 'Wait a while, taking taxis is fine too', canon: true, fx: (g) => { g.remember('evCar', 'no'); }, res: 'You sat in the car for five minutes, and when you got out you touched the steering wheel.' },
        { t: 'Buy a new one on installments', dev: 15, fx: (g) => { const p = carPrice(g); CN.pay(g, p * 0.2); g.remember('debt', (Number(g.recall('debt')) || 0) + p * 0.8 / 1e4); g.remember('evCar', 'new'); g.stat('心情', 3); }, res: (g) => 'Down payment ' + fmt(carPrice(g) * 0.2) + ', with the rest paid off over three years. On pickup day you sat in the car a long time before driving away.' },
        { t: 'Buy a used car', dev: 10, fx: (g) => { CN.pay(g, 50000); g.remember('evCar', 'used'); g.stat('心情', 2); }, res: (g) => 'A car that’s five years old, ' + fmt(50000) + '. There were still stickers on the seat from the previous owner’s kid.' },
      ] },
    { id: 'e_insurance', y: Y, minAge: 28, maxAge: 55, t: 'Insurance', cond: (g) => money(g) && working(g),
      text: (g) => 'An old classmate went into insurance and invites you for tea. He works out the numbers: a critical illness policy, paying ' + fmt(premium(g)) + ' a year for twenty years.',
      choices: [
        { t: 'Say you’ll think about it', canon: true, fx: (g) => { g.remember('evIns', 'no'); }, res: 'When the tea was finished, he said there was no rush and to call him any time.' },
        { t: 'Buy it', dev: 10, fx: (g) => { const p = premium(g); CN.pay(g, p); g.remember('evIns', 'bought'); g.remember('evInsAmt', p); }, res: (g) => 'You signed, and paid ' + fmt(g.recall('evInsAmt')) + ' for the first year. He said it’s best if you never end up needing it.' },
        { t: 'Buy just a basic medical policy that costs a few dozen dollars', dev: 10, fx: (g) => { CN.pay(g, 600); g.remember('evIns', 'cheap'); }, res: '$85 a year. The old classmate was a little disappointed, but set it up for you anyway.' },
      ] },
  ]);

  JY.addEncounters([
    { id: 'e_rent_offer', y: Y, minAge: 22, maxAge: 60, t: 'Landlord’s offer', cond: (g) => g.recall('evRentOffer') === true && !['own', 'mortgage'].includes(g.recall('house')) && money(g),
      text: (g) => 'Your retired-teacher landlord asks again: she’d sell you the place for ' + fmt(offerPrice(g) * 1e4) + '; that’s 10% below the market price, and you can pay the down payment over two years.',
      choices: [
        { t: 'Buy it and take on a mortgage', dev: 15, cond: (g) => cash(g) >= offerDown(g), fx: (g) => { CN.buyHouse(g, { price: offerPrice(g), down: 0.3 }); g.remember('evRentOffer', 'bought'); g.stat('心情', 4); },
          res: (g) => 'Down payment ' + fmt(offerDown(g)) + '. On contract day the landlord handed you a bunch of keys and told you to remember to water the flowers on the balcony.' },
        { t: 'Scrape the money together and borrow for the down payment', dev: 20, cond: (g) => cash(g) < offerDown(g), fx: (g) => { const short = Math.max(0, offerDown(g) - Math.max(0, cash(g))); CN.earn(g, short); CN.buyHouse(g, { price: offerPrice(g), down: 0.3 }); g.remember('debt', (Number(g.recall('debt')) || 0) + short / 1e4); g.remember('evRentOffer', 'bought'); g.stat('心情', 2); },
          res: 'You made a round of phone calls and got the down payment together. On contract day the landlord handed you a bunch of keys and told you to remember to water the flowers on the balcony.' },
        { t: 'Thank her and keep renting', canon: true, fx: (g) => { g.remember('evRentOffer', 'declined'); }, res: 'The place was sold to someone else. On the day you moved out, the teacher wrote you a card.' },
      ] },
  ]);

  /* ---------- 回响：几年后读到上面那些选择 ---------- */
  // read 返回 [当年的选择, 过了几年]，写成字面的 g.recall('键')，检查工具才认得
  const echo = (id, read, t, years, minAge, map) => ({
    id, y: Y, minAge, t, auto: true, always: true, kind: 'echo',
    cond: (g) => { const [v, n] = read(g); return !!map[v] && n >= years; },
    fx: (g) => { const m = map[read(g)[0]]; if (m.fx) m.fx(g); },
    text: (g) => { const m = map[read(g)[0]]; return m ? JY.val(m.t) : ''; },
  });
  JY.addEncounters([
    echo('e_echo_dog', (g) => [g.recall('evDog'), g.since('evDog')], 'Stray puppy', 4, 10, {
      kept: { t: 'The limping puppy grew into a big yellow dog. Every day after school it crouched at the corner waiting for you.', fx: (g) => g.stat('心情', 3) },
      fed: { t: 'The limping dog at the corner was adopted by a family that sells breakfast. Every day you passed, it wagged its tail at you.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_dog2', (g) => [g.recall('evDog'), g.since('evDog')], 'Old dog', 13, 18, {
      kept: { t: 'Big Yellow has grown old and can’t walk anymore. The day you came home, it was lying by the door. It waited until you stroked its head, then closed its eyes.', fx: (g) => g.stat('心情', -4) },
    }),
    echo('e_echo_wallet', (g) => [g.recall('evWallet'), g.since('evWallet')], 'Wallet', 1, 9, {
      returned: { t: 'The wallet’s owner was a delivery rider, and that cash was half a month of his meals. He sent the school a silk banner with your name on it.', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 2); } },
      kept: { t: 'A lost-and-found notice was posted on the school bulletin board: delivery rider, lost wallet, half a month’s food money inside. You stood in front of it for a long time.', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_aihw', (g) => [g.recall('evAiHw'), g.since('evAiHw')], 'Exam', 1, 9, {
      copy: { t: 'Midterm exam. There was no AI in the exam hall. You stared at the paper and found you could barely understand the questions.', fx: (g) => { g.stat('学识', -3); g.stat('心情', -2); } },
      learn: { t: 'Midterm exam. You solved the last big problem, using the kind of method the AI hinted at that night.', fx: (g) => g.stat('学识', 2) },
      self: { t: 'Midterm exam. Your score wasn’t the highest, but your teacher said your working was the cleanest in the class.', fx: (g) => { g.stat('学识', 2); g.stat('心情', 1); } },
    }),
    echo('e_echo_game', (g) => [g.recall('evGame'), g.since('evGame')], 'Account', 2, 13, {
      hooked: { t: 'Your game account kept climbing in the rankings while your grades kept sinking. After the parent-teacher meeting, your family pulled out the internet cable.', fx: (g) => { g.stat('学识', -3); g.stat('人缘', -1); } },
      quit: { t: 'Your classmates are still talking about that game and you can’t join in anymore. But you’ve finished two more books.', fx: (g) => { g.stat('学识', 2); g.stat('人缘', -1); } },
    }),
    echo('e_echo_bully', (g) => [g.recall('evBully'), g.since('evBully')], 'That classmate', 8, 18, {
      stood: { t: 'The classmate who was cornered by the bathroom door all those years ago added you as a friend. He said he’s a police officer now, and he has always remembered that day.', fx: (g) => { g.stat('人缘', 3); g.rel('old classmate', 'the classmate who was bullied back then', 'later became a police officer'); } },
      told: { t: 'You ran into the classmate who was bullied back then on the street. He treated you to a bowl of noodles and thanked you for fetching the teacher that day.', fx: (g) => g.stat('人缘', 1) },
      passed: { t: 'At the class reunion, the classmate who was bullied back then sat in a corner. When he saw you he smiled politely and said nothing.', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_stage', (g) => [g.recall('evStage'), g.since('evStage')], 'The stage', 3, 12, {
      hit: { t: 'After that comic dialogue, the school asked you on stage for every event. You weren’t afraid of crowds anymore.', fx: (g) => { g.stat('人缘', 2); g.stat('事业', 1); } },
      shy: { t: 'The class monitor who sang on stage that time later became the school’s emcee. Every time you saw her up there, you wondered what would have happened if you’d raised your hand.', fx: (g) => g.stat('心情', -1) },
      flop: { t: 'Everyone else forgot about you blanking on your lines long ago. Only you remember. Since then, whenever you have to speak in public, you write a script beforehand.', fx: (g) => g.stat('学识', 1) },
    }),
    echo('e_echo_concert', (g) => [g.recall('evConcert'), g.since('evConcert')], 'The friend after the show', 3, 17, {
      online: { t: 'The singer announced retirement. You still watched the last concert online.', fx: (g) => g.stat('心情', -2) },
      went: { t: 'The person you met at the concert later became the friend you chat with most. You promised to go to the next show together.', fx: (g) => { g.stat('人缘', 2); g.rel('online friend', 'a friend you met at a concert'); } },
    }),
    echo('e_echo_scam', (g) => [g.recall('evScam'), g.since('evScam')], 'Anti-scam', 1, 17, {
      lost: { t: 'On an anti-fraud display board you saw the name of that group. The board said: over $280,000 involved, victims mostly students.', fx: (g) => { g.stat('学识', 2); g.stat('心情', -1); } },
      reported: { t: 'The police station called: the order-boosting gang was caught, and the lead you gave helped. Most of the money cheated from the students was recovered.', fx: (g) => { g.stat('人缘', 2); g.stat('心情', 3); } },
      spotted: { t: 'In the family group chat, your great-aunt said she almost got cheated by an order-boosting group, but remembered the screenshots you posted.', fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_loan', (g) => [g.recall('evLoan'), g.since('evLoan')], 'The money you lent', 2, 22, {
      lent: { t: (g) => (g.recall('evLoanBack') ? 'Your friend paid back ' + fmt(g.recall('evLoanAmt')) + ' and sent $300 extra as interest. The trouble at his home is behind him now.' : 'The ' + fmt(g.recall('evLoanAmt')) + ' you lent was never paid back. Later his profile picture turned gray.'),
        fx: (g) => { const back = g.rnd() < 0.6; g.remember('evLoanBack', back); if (back) { CN.earn(g, (Number(g.recall('evLoanAmt')) || 0) + 2000); g.stat('人缘', 2); } else { g.stat('心情', -3); } } },
      half: { t: (g) => 'Your friend paid back the ' + fmt(g.recall('evLoanAmt')) + ' you lent him, saying the other half was borrowed from someone else. He never contacted you again, and you never contacted him.', fx: (g) => { CN.earn(g, Number(g.recall('evLoanAmt')) || 0); g.stat('人缘', -1); } },
      helped: { t: 'Your friend’s family trouble was weathered. He said that going to the banks with him that day meant more than the loan would have. Now every New Year he’s the first to call you.', fx: (g) => g.stat('人缘', 3) },
      refused: { t: 'You heard that another friend helped your friend through his family trouble in the end. They often drink together now.', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_reunion', (g) => [g.recall('evReunion'), g.since('evReunion')], 'old classmate', 2, 27, {
      went: { t: (g) => (working(g) ? 'An old classmate you reconnected with at the reunion introduced you to a deal, and you earned ' + fmt(10000) + '. You agreed to keep in touch.' : 'An old classmate you reconnected with at the reunion invites you to go fishing by the river every weekend. You agreed to keep in touch.'),
        fx: (g) => { if (working(g)) CN.earn(g, 10000); g.stat('人缘', 2); g.rel('old classmate', 'an old classmate you met again at the reunion'); } },
      skip: { t: 'You heard through others that one of your old classmates has passed away. That reunion was his last appearance.', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_viral', (g) => [g.recall('evViral'), g.since('evViral')], 'Followers', 2, 20, {
      ride: { t: (g) => (g.recall('evViralEarn') ? 'Your account took off. Ad income alone brought in ' + fmt(g.recall('evViralEarn')) + '.' : 'Your follower count rose to a certain number and then stopped moving. Every day you talk to the camera, knowing less and less what to say.'),
        fx: (g) => { const up = g.s('事业') >= 40; const e = up ? round(inc(g) * 0.4, 1000) : 0; g.remember('evViralEarn', e); if (up) CN.earn(g, e); else g.stat('心情', -3); } },
      deleted: { t: 'A stranger sent you a message saying he saved that video back then and watched it many times. He asked why you deleted it.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_faint', (g) => [g.recall('evFaint'), g.since('evFaint')], 'That person', 1, 17, {
      cpr: { t: 'An unknown number called. It was the man who collapsed on the subway, and his daughter had just been admitted to university. He said that without you he wouldn’t have seen this day.', fx: (g) => { g.stat('心情', 5); g.stat('人缘', 3); } },
      tried: { t: 'You saw in the news that the man who collapsed on the subway that day had been saved. The report said a passenger had done CPR first.', fx: (g) => g.stat('心情', 4) },
      called: { t: 'The subway station posted a thank-you letter: thanks to the passenger who was first to shout for help and call an ambulance during that morning rush. You stood in front of it for a while.', fx: (g) => g.stat('心情', 2) },
      away: { t: 'You never rode in that car again.', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_lottery', (g) => [g.recall('evLottery'), g.since('evLottery')], 'Lottery', 1, 19, {
      won: { t: 'The news of your win got out. This year you gained a lot of relatives.', fx: (g) => { g.stat('人缘', -2); g.stat('心情', -1); } },
      never: { t: 'The lottery shop downstairs sold a big prize, and the winning numbers were exactly your birthday. You stood at the door looking at the red board for a long time, smiled, and went home to cook.', fx: (g) => g.stat('心情', -1) },
      habit: { t: 'Two lottery tickets a week, and you kept it up for many years. You never won a big prize, but every draw night you had something to look forward to.', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_rain', (g) => [g.recall('evRain'), g.since('evRain')], 'Silk banner', 1, 19, {
      helped: { t: (g) => 'The delivery station received a silk banner looking for the rider who helped an old woman on a stormy day. The station manager checked the footage and it was you. That month you won the station’s top review award, with a bonus of ' + fmt(1000) + '.', fx: (g) => { g.stat('人缘', 3); CN.earn(g, 1000); } },
      rushed: { t: 'The knee you hurt in that fall aches whenever it rains.', fx: (g) => g.stat('健康', -2) },
    }),
    echo('e_echo_hop', (g) => [g.recall('evHop'), g.since('evHop')], 'That job switch', 2, 26, {
      hopped: { t: (g) => (g.recall('evHopLuck') ? 'The company you jumped to went public. Your stock options turned into ' + fmt(round(CN.price(g) * 0.2 * 1e4, 10000)) + ', enough for a down payment on an apartment.' : 'The company you jumped to had layoffs and you were on the list. Luckily the severance was generous: you took two months off, then found your next job.'),
        fx: (g) => { const up = g.rnd() < 0.4; g.remember('evHopLuck', up); if (up) CN.earn(g, round(CN.price(g) * 0.2 * 1e4, 10000)); else { g.stat('事业', -3); g.stat('心情', -3); } } },
      raise: { t: 'Your boss was promoted and recommended you to his successor before leaving.', fx: (g) => g.stat('事业', 4) },
      cold: { t: 'After that raise talk, your projects dried up. At year-end you left on your own. Your new coworkers were all easy to get along with.', fx: (g) => { g.stat('事业', -3); g.stat('心情', -1); } },
    }),
    echo('e_echo_rent', (g) => [g.recall('evRent'), g.since('evRent')], 'After moving', 2, 22, {
      moved: { t: 'The vegetable patch below your new place is tended by an old man. He often hangs vegetables he can’t finish on your door handle.', fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); } },
      haggled: { t: 'Your retired-teacher landlord says she’s selling and asks if you’d like to buy it. The price is negotiable.', fx: (g) => { g.stat('心情', 2); g.remember('evRentOffer', true); } },
    }),
    echo('e_echo_rentoffer', (g) => [g.recall('evRentOffer'), g.since('evRentOffer')], 'Balcony flowers', 2, 24, {
      bought: { t: 'The flowers your old landlord left on the balcony bloomed. You sent her a photo and she replied with a big smiley face.', fx: (g) => g.stat('心情', 3) },
      declined: { t: 'You passed that building and glanced up. Someone else’s flowers were on the balcony now, blooming just as well.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_gift', (g) => [g.recall('evGift'), g.since('evGift')], 'Favors', 3, 25, {
      close: { t: 'On the day something happened at your home, the first to arrive was the friend you’d given the big red envelope. He asked nothing and just rolled up his sleeves to help.', fx: (g) => g.stat('人缘', 3) },
      skip: { t: 'You needed help, and went through your whole contact list without knowing who to call.', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_nephew', (g) => [g.recall('evNephew'), g.since('evNephew')], 'Cousin’s kid', 3, 35, {
      helped: { t: 'Your cousin’s kid was hired full-time at your place and was later promoted to team lead. At New Year, your cousin grabbed your hand and insisted you have one more drink.', fx: (g) => { g.stat('人缘', 3); g.rel('nephew', 'Cousin’s kid', 'interned at your place'); } },
      declined: { t: 'Your cousin’s kid found a job on their own and is doing well. When your cousin talks about it, there’s something in her tone.', fx: (g) => g.stat('人缘', -1) },
    }),
    echo('e_echo_check', (g) => [g.recall('evCheck'), g.since('evCheck')], 'Follow-up', 2, 32, {
      ignored: { t: 'This year you always felt tired. When you finally went back to the hospital, the doctor looked at the scan and asked why you hadn’t come sooner.', fx: (g) => { g.stat('健康', -12); g.stat('心情', -4); } },
      checked: { t: 'Regular follow-ups kept your numbers steady. The doctor said you were the most obedient patient she’d ever seen.', fx: (g) => g.stat('健康', 2) },
    }),
    echo('e_echo_run', (g) => [g.recall('evRun'), g.since('evRun')], 'Running', 2, 22, {
      cheered: { t: 'The friend who ran the marathon came to ask you again: run together next year. You thought about it, then bought a pair of running shoes.', fx: (g) => g.stat('健康', 2) },
      ran: { t: 'Running became your habit, three times a week, rain or shine. At a checkup, the doctor said your heart and lungs were ten years younger than your age.', fx: (g) => { g.stat('健康', 5); g.stat('心情', 2); } },
    }),
    echo('e_echo_stall', (g) => [g.recall('evStall'), g.since('evStall')], 'Night market', 1, 21, {
      good: { t: (g) => 'Your night market stall got smoother with practice, and this year you earned ' + fmt(15000) + '. You gave the stall a name and hung up a small lit sign.', fx: (g) => { CN.earn(g, 15000); g.stat('健康', -1); } },
      no: { t: 'The friend who ran a stall saved up enough to open a little shop. On opening day he treated you to a meal and said it would’ve been great if you’d joined him back then.', fx: (g) => g.stat('人缘', 1) },
      bad: { t: 'The night market was cleaned up and your stall couldn’t stay. You ate the two remaining boxes of sausages for a month.', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_invest', (g) => [g.recall('evInvest'), g.since('evInvest')], 'That fund', 2, 27, {
      chased: { t: (g) => { const got = Number(g.recall('evInvestGot')) || 0, amt = Number(g.recall('evInvestAmt')) || 0;
        if (!got) return 'You pulled that money out long ago. You never looked at how the fund did after that.';
        return got >= amt ? 'The fund went up and down. After one big rally you sold it all: put in ' + fmt(amt) + ', took out ' + fmt(got) + ', and you felt great for days.' : 'The fund stumbled along. You couldn’t take it and sold everything: put in ' + fmt(amt) + ', only ' + fmt(got) + ' left. You uninstalled the app, reinstalled it, and uninstalled it again.'; },
        fx: (g) => { const cur = Number(g.recall('invest')) || 0; g.remember('evInvestGot', cur); if (cur > 0) CN.withdraw(g); } },
      dca: { t: (g) => ((Number(g.recall('invest')) || 0) > 0 ? 'You reinstalled the app and looked at your investment account: ' + fmt(g.recall('invest')) + '. Not much, but a good bit more than the bank would have paid.' : 'You reinstalled the app and only then remembered you’d withdrawn the savings plan money long ago.'), fx: (g) => g.stat('心情', 1) },
      saved: { t: 'The fund your coworkers chased dropped by half, and nobody mentions it at lunch anymore. Your money is still in the bank, not a cent less.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_cat', (g) => [g.recall('evCat'), g.since('evCat')], 'The calico', 12, 32, {
      adopted: { t: 'The calico kept you company for twelve years. In its last few days, it always lay on your slippers.', fx: (g) => g.stat('心情', -3) },
    }),
    echo('e_echo_cat2', (g) => [g.recall('evCat'), g.since('evCat')], 'cat', 2, 22, {
      adopted: { t: 'The calico has put on weight and waits at the door every evening for you to come home. The moment you open it, it flops down and shows its belly.', fx: (g) => g.stat('心情', 2) },
      rehomed: { t: 'In the residents’ chat, the families who took the kittens often post photos. All five kittens have grown up, and one even became the “manager” of a little corner shop.', fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); } },
    }),
    echo('e_echo_neighbor', (g) => [g.recall('evNeighbor'), g.since('evNeighbor')], 'neighbour', 2, 24, {
      friend: { t: 'The old lady upstairs became a regular at your home. When you were away, she took in your parcels and watered your balcony flowers too.', fx: (g) => { g.stat('人缘', 2); g.rel('neighbour', 'the old lady upstairs'); } },
      feud: { t: 'Your water pipe leaked and the water seeped down to the floor below. The person who came knocking was the family upstairs. They gave you a look, then helped you shut off the main valve.', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_witness', (g) => [g.recall('evWitness'), g.since('evWitness')], 'Testimony', 1, 21, {
      testified: { t: 'The verdict came in on that car crash. The judge accepted your testimony and the injured man received compensation. His family mailed you a box of apples from their hometown.', fx: (g) => { g.stat('人缘', 3); g.set('evWitness'); } },
    }),
    echo('e_echo_vol', (g) => [g.recall('evVol'), g.since('evVol')], 'Volunteer', 4, 20, {
      no: { t: 'The retired fitter from the community is now accompanied by a college student. You saw them playing chess downstairs, the old man laughing loudly.', fx: (g) => g.stat('心情', 1) },
      yes: { t: 'Two hours a week, and you kept it up for years. The community gave you a little certificate, and you tucked it into a photo album.', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); g.set('evVolunteer'); } },
    }),
    echo('e_echo_ill', (g) => [g.recall('evIll'), g.since('evIll')], 'Desk mate', 1, 31, {
      visited: { t: 'Your middle school desk mate recovered. He mailed you a box of silkworm cocoons with a note: this time they made it.', fx: (g) => { g.stat('心情', 4); g.rel('old classmate', 'your middle school desk mate'); } },
      shared: { t: 'You heard your middle school desk mate got better. You never deleted the crowdfunding link.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_kid', (g) => [g.recall('evKid'), g.since('evKid')], 'That child', 12, 28, {
      waited: { t: 'A high school student stopped you on the street. He said he was the kid who got lost at the mall entrance back then, and his mom still keeps that photo.', fx: (g) => { g.stat('心情', 5); g.stat('人缘', 2); } },
    }),
    echo('e_echo_village', (g) => [g.recall('evVillage'), g.since('evVillage')], 'Hometown', 2, 22, {
      live: { t: 'Your hometown’s fruit now has its own brand, the village built a cold storage house, and a few young people came back. The road at the village entrance was newly paved this year.', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); } },
      shared: { t: 'Your hometown’s fruit still doesn’t fetch a good price. The village secretary called, didn’t mention it, and just asked when you’d be coming back.', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_teacher', (g) => [g.recall('evTeacher'), g.since('evTeacher')], 'Teacher', 1, 26, {
      visited: { t: 'Your homeroom teacher passed away. Going through her things, her family found a stack of old essay notebooks, one of them yours, her red-pen comments still clear.', fx: (g) => { g.stat('心情', -2); g.stat('学识', 1); } },
      called: { t: 'You heard your homeroom teacher passed away. That phone call was the last time you spoke.', fx: (g) => g.stat('心情', -2) },
    }),
    echo('e_echo_frienddiv', (g) => [g.recall('evFriendDiv'), g.since('evFriendDiv')], 'Friend', 2, 32, {
      listened: { t: 'The friend who got divorced started a new family. At the wedding he seated you at the first table.', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 2); } },
      persuade: { t: 'That friend divorced in the end. He said you were right to urge him, but he couldn’t do it.', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_storm', (g) => [g.recall('evStorm'), g.since('evStorm')], 'After the typhoon', 1, 11, {
      helped: { t: 'The old lady downstairs tells everyone you’re the one who nailed up her windows on typhoon day. Everyone in the building is polite to you now.', fx: (g) => g.stat('人缘', 3) },
      home: { t: 'Saplings were planted where the two trees fell in the typhoon. This spring they put out new leaves.', fx: (g) => g.stat('心情', 1) },
      reckless: { t: 'A magazine bought your photo of waves taller than the buildings for its cover and paid you a fee. You had the photo printed and hung it on your wall.', fx: (g) => { g.stat('心情', 2); CN.earn(g, 3000); } },
      hurt: { t: 'The shoulder hurt by that wave left an old injury. Whenever you reach for something high, you have to pause first.', fx: (g) => g.stat('健康', -2) },
    }),
    echo('e_echo_snow', (g) => [g.recall('evSnow'), g.since('evSnow')], 'Frozen pears', 1, 9, {
      swept: { t: 'This winter the old man upstairs sent you another bag of frozen pears. He says he’ll remember the year you shoveled snow for the rest of his life.', fx: (g) => g.stat('人缘', 2) },
      fun: { t: 'You came across that snowman photo, the carrot nose already crooked. You laughed for a long time.', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_aicut', (g) => [g.recall('evAiCut'), g.since('evAiCut')], 'That round of cuts', 1, 23, {
      reskill: { t: 'The cut list came out and you weren’t on it. The new system broke down, and you were the only one in the department who could read the alarms.', fx: (g) => g.stat('事业', 5) },
      stay: { t: 'The cut list came out. You weren’t laid off but were moved to a marginal role at 20% less pay.', fx: (g) => { g.stat('事业', -4); g.stat('心情', -3); } },
      left: { t: 'In your second year of taking on work yourself, your income finally caught up with your old salary. The time is yours now, and so is the anxiety.', fx: (g) => { g.stat('事业', 2); g.stat('心情', 1); } },
    }),
    echo('e_echo_robot', (g) => [g.recall('evRobot'), g.since('evRobot')], 'Robot', 3, 38, {
      waited: { t: 'Robots dropped by half in price. You went to the appliance mall again, and the model whose hand you touched had been discontinued.', fx: (g) => g.stat('心情', -1) },
      bought: { t: (g) => (has(g, 'mo') ? 'The robot at home learned to cook your mom’s signature dish. You filmed it and sent it to her, and she said there was too much salt.' : 'The robot at home followed your instructions and made Mom’s old signature dish. When it was first served, you froze for a moment.'), fx: (g) => { g.stat('心情', 2); g.stat('健康', 1); } },
    }),
    echo('e_echo_newyear', (g) => [g.recall('evNewYear'), g.since('evNewYear')], 'New Year', 1, 19, {
      stay: { t: (g) => (has(g, 'fa') && has(g, 'mo') ? 'New Year is near again. Mom says on the phone that Dad butchered a chicken specially this year and is saving it for you.' : has(g, 'mo') ? 'New Year is near again. Mom says on the phone that she made a long string of sausages this year and is saving them for you.' : has(g, 'fa') ? 'New Year is near again. Dad says on the phone that he butchered a chicken specially this year and is saving it for you.' : 'New Year is near again. You called relatives back home one by one, and everyone asked whether you’re coming back this year.'),
        fx: (g) => g.stat('心情', -1) },
      home: { t: 'It’s the twelfth lunar month again, and you booked your ticket home early. This time you got a seat and slept all the way to your stop.', fx: (g) => g.stat('心情', 2) },
      brought: { t: (g) => (parentsAlive(g) ? parentsWord(g) + ' went back home and told everyone about the city’s fireworks. The photo from that day was printed and hung on the wall back home.' : 'You found the photo from the year you brought your parents over for New Year, both of them squinting with smiles under the fireworks.'), fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_lecture', (g) => [g.recall('evLecture'), g.since('evLecture')], 'Supplements', 1, 61, {
      bought: { t: 'That supplement company was investigated, and the news said it cheated the elderly. Your family threw out the drawer full of pills.', fx: (g) => { g.stat('心情', -3); g.stat('人缘', 1); } },
      exposed: { t: 'Nobody hands out eggs at the gate of your complex anymore. The neighbors say your shout scared them off.', fx: (g) => g.stat('人缘', 2) },
    }),
    echo('e_echo_dance', (g) => [g.recall('evDance'), g.since('evDance')], 'Dusk', 3, 58, {
      watched: { t: (g) => (g.age >= 85 ? 'In the evening you still go sit on that open ground. When the music starts, your hand taps time on your knee.' : 'The group who dance at dusk has changed again and again. You’re still on that bench, and you know every song.'), fx: (g) => g.stat('心情', 1) },
      joined: { t: (g) => (g.age < 80 ? 'You became the lead dancer of the square dance team. Every day at 6:30 in the evening, when the music starts, you’re the liveliest one there.' : g.age < 85 ? 'You can’t manage the fast dances anymore, so you stand in the back row and move slowly. Everyone on the team calls you teacher.' : 'You can’t dance anymore, but you still go to that open ground at dusk. When they finish, someone always comes to chat with you and then walks you home.'),
        fx: (g) => { g.stat('健康', g.age < 80 ? 3 : 1); g.stat('人缘', 2); } },
    }),
    echo('e_echo_tech', (g) => [g.recall('evTech'), g.since('evTech')], 'Video call', 1, 67, {
      drawer: { t: (g) => (gks(g).length ? 'Your grandkids' : 'Your kids') + ' called on video, but your old phone couldn’t pick it up. By the time you found the glasses, the call had ended.', fx: (g) => g.stat('心情', -2) },
      learned: { t: (g) => 'You put on the glasses. ' + (gks(g).length ? 'Your grandkids' : 'Your kids') + '’ faces were right there in front of you. You video chat twice a week, and you learned to send emoji.', fx: (g) => { g.stat('心情', 3); g.stat('人缘', 2); } },
    }),

    // —— 钱的回响 ——
    echo('e_echo_tip', (g) => [g.recall('evTip'), g.since('evTip')], 'That stock', 2, 27, {
      in: { t: (g) => (g.recall('evTipUp') ? 'The stock your great-uncle mentioned really did rise. When you sold, ' + fmt(g.recall('evTipAmt')) + ' became ' + fmt(Number(g.recall('evTipAmt')) * 1.8) + '. Your great-uncle talked about it all night at the dinner table.' : 'The big news your great-uncle talked about never came, and the stock fell by more than half. You sold at a loss, and ' + fmt(g.recall('evTipAmt')) + ' brought back only ' + fmt(Number(g.recall('evTipAmt')) * 0.4) + '. When you saw your great-uncle again at New Year, he didn’t bring it up.'),
        fx: (g) => { const up = g.rnd() < 0.3; g.remember('evTipUp', up); const a = Number(g.recall('evTipAmt')) || 0; CN.earn(g, a * (up ? 1.8 : 0.4)); g.stat('心情', up ? 3 : -3); } },
      little: { t: (g) => 'The stock fell by more than half. Your ' + fmt(g.recall('evTipAmt')) + ' was reduced to pocket change, though at least it was a small amount. You learned your lesson: news from the dinner table is for listening only.', fx: (g) => { CN.earn(g, (Number(g.recall('evTipAmt')) || 0) * 0.4); g.stat('学识', 1); } },
      no: { t: 'The stock your great-uncle mentioned later fell by more than half. Nobody brought it up at the dinner table again.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_high', (g) => [g.recall('evHigh'), g.since('evHigh')], 'That investment product', 1, 41, {
      in: { t: (g) => 'The group for that investment product was dissolved overnight. The police said the platform ran off with hundreds of millions of yuan. Of your ' + fmt(g.recall('evHighAmt')) + ', only a tenth was recovered.', fx: (g) => { CN.earn(g, (Number(g.recall('evHighAmt')) || 0) * 0.1); g.stat('心情', -4); } },
      asked: { t: 'Several old neighbors in your complex bought that product, and their money is gone. You sat with them downstairs all afternoon, glad you’d asked first.', fx: (g) => { g.stat('心情', 1); g.stat('人缘', 1); } },
      no: { t: 'The news said an investment platform promising “15% annual returns” ran off. You thought of the person you’d deleted and shared the news in the family group chat.', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_netloan', (g) => [g.recall('evNetLoan'), g.since('evNetLoan')], 'Online loan', 2, 20, {
      took: { t: (g) => 'That online loan piled interest on interest, and $2,900 rolled up to ' + fmt(26000) + '. The debt collectors called your friends. You gritted your teeth and paid it off over more than a year, and deleted that app.', fx: (g) => { g.stat('心情', -3); g.stat('人缘', -1); } },
      family: { t: (g) => 'You paid back the ' + fmt(5000) + ' you borrowed from your family, and bought two extra boxes of fruit. ' + (parentsAlive(g) ? parentsWord(g) + ' said you were being too formal, and gave the fruit away to the neighbors the same day.' : ''), fx: (g) => { CN.pay(g, 5000); g.stat('心情', 2); } },
      no: { t: 'That month you cooked noodles at home every day. When payday came, you added a chicken drumstick for yourself, and it smelled better than anything.', fx: (g) => g.stat('心情', 2) },
    }),
    echo('e_echo_windfall', (g) => [g.recall('evWindfall'), g.since('evWindfall')], 'That prize money', 2, 24, {
      saved: { t: 'That prize money was never touched. Later, when your family urgently needed money, it covered it just in time.', fx: (g) => g.stat('心情', 2) },
      trip: { t: (g) => (CN.alone(g) ? 'You came across photos from that trip, the sea wind blowing your hair into a mess. You made one your phone wallpaper.' : 'You came across photos from that trip, the whole family squeezed into the frame, everyone grinning like fools. You made it your phone wallpaper.'), fx: (g) => g.stat('心情', 3) },
      parents: { t: (g) => (parentsAlive(g) ? parentsWord(g) + ' used that money to buy a new fridge, with your childhood photo on its door. They said the rest is being kept for you.' : 'You were sorting through the cupboard back home and found an envelope with that money in it, not a cent touched, your name written on it.'), fx: (g) => { g.stat('心情', 2); g.stat('人缘', 1); } },
    }),
    echo('e_echo_car', (g) => [g.recall('evCar'), g.since('evCar')], 'Car', 2, 26, {
      new: { t: (g) => (parentsAlive(g) ? 'This year you drove ' + parentsWord(g) + ' back to your hometown, the trunk stuffed with food. All the way there, they kept praising how steady your driving was.' : kids(g).length ? 'On the weekend you drove the kids to the countryside, and songs rang out from the back seat the whole way.' : 'You drove to a faraway seaside, playing the songs you loved when you were young all the way.'), fx: (g) => { g.stat('心情', 3); g.stat('人缘', 1); } },
      used: { t: 'The used car had constant small problems, and the owner of the repair shop knew you by name. But it never once left you stranded on the road.', fx: (g) => g.stat('心情', 2) },
      no: { t: 'On the night of the downpour, you waited forty minutes by the roadside for a taxi. The driver was a talkative man who told you all the way about his daughter getting into university.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_ins', (g) => [g.recall('evIns'), g.since('evIns')], 'The policy', 8, 36, {
      bought: { t: (g) => (g.recall('evInsHit') ? 'You had surgery in the hospital. The insurance company paid out ' + fmt(300000) + '; from your hospital bed you dug out that old classmate’s phone number and said thank you.' : 'You paid the policy for eight years and never used it once. You said that was the best outcome.'),
        fx: (g) => { const hit = g.s('健康') < 60; g.remember('evInsHit', hit); if (hit) CN.earn(g, 300000); else CN.pay(g, (Number(g.recall('evInsAmt')) || 3000) * 2); } },
      cheap: { t: (g) => (g.s('健康') < 70 ? 'That year in hospital, the basic medical policy that cost a few dozen dollars paid out ' + fmt(20000) + '; you said that $85 was money well spent.' : 'You renewed that basic medical policy every year and never used it.'), fx: (g) => { if (g.s('健康') < 70) CN.earn(g, 20000); } },
      no: { t: (g) => (g.s('健康') < 60 ? 'You had a hospital stay that cost ' + fmt(80000) + ', all out of your own pocket. On the day you were discharged, you thought of that tea.' : 'The old classmate who sold insurance changed careers and opened a teahouse. You’ve been twice, and both times he wouldn’t take your money.'), fx: (g) => { if (g.s('健康') < 60) CN.pay(g, 80000); g.stat('人缘', 1); } },
    }),
  ]);

  /* ---------- 宠物、日子里的小事：每一世读到的细节不一样 ----------
   * pk(g, [...], 盐) 在同一年里固定、换一世就变，所以正文和结果读到的是同一个名字、同一个数。
   * 回响里要用到的细节（名字、金额、种类），在选项里 remember 下来（键名都以 ev 开头）。 */
  const seedOf = (g) => { const c = JY.byId[g.me]; const s = ((c && c.name) || '') + (g.recall('city') || ''); let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003; return h; };
  const rr = (g, salt) => { const x = Math.sin(g.Y * 12.9898 + salt * 78.233 + seedOf(g) * 0.0137) * 43758.5453; return x - Math.floor(x); };
  const pk = (g, arr, salt) => arr[Math.floor(rr(g, salt) * arr.length)];
  const hiEdu = (g) => ['bachelor', 'master', 'phd'].includes(g.recall('edu'));
  const pet = (g) => CN.pet(g);
  const petName = (g) => (pet(g) ? pet(g).name : 'It');
  const PET_W = { dog: 'dog', cat: 'cat', bird: 'bird', fish: 'fish', rabbit: 'rabbit' };
  // 宠物店里的品种：[种类, 价格]
  const BREED = { 'Ragdoll cat': ['cat', 8000], 'British Shorthair': ['cat', 3000], 'Siamese cat': ['cat', 4000], 'Corgi': ['dog', 6000], 'Shiba Inu': ['dog', 7000], 'Bichon Frise': ['dog', 3000], 'Golden Retriever': ['dog', 4000] };
  const breed = (g) => pk(g, Object.keys(BREED), 41);
  const petYear = (g, kind) => round((kind === 'dog' ? 6000 : 4000) * (tier(g) <= 1 ? 1.3 : 1), 500);
  const crop = (g) => pk(g, { 西南: ['kiwi fruit', 'tea', 'Sichuan pepper'], 华南: ['lychee', 'passion fruit', 'tea'], 华东: ['strawberry', 'tea', 'blueberry'], 华中: ['crawfish', 'navel orange', 'lotus root'], 华北: ['apple', 'millet', 'greenhouse vegetable'], 东北: ['rice', 'wood ear mushroom', 'blueberry'], 西北: ['apple', 'goji berry', 'beef and lamb'] }[g.recall('region')] || ['greenhouse vegetable', 'fruit'], 42);
  const myPay = (g) => (CN.jobPay && job(g) ? CN.jobPay(g, job(g)) : round(inc(g) / 12, 100));
  const DEPOSIT = { 1: 10000, 2: 5000, 3: 3000, 4: 2000, 5: 1000 };
  const stakeAmt = (g) => round(Math.min(100000, cash(g) * 0.25), 10000);
  const roadAmt = (g) => round(Math.min(20000, Math.max(1000, cash(g) * 0.03)), 1000);
  const vetBill = (g) => round((tier(g) <= 2 ? 6000 : tier(g) === 3 ? 3000 : 1500) * (1 + rr(g, 47)), 500);

  JY.addEncounters([
    // —— 宠物：住在哪儿、有没有钱，碰到的不一样 ——
    { id: 'e_pet_shop', y: Y, minAge: 22, maxAge: 60, t: 'Pet shop',
      cond: (g) => money(g) && !pet(g) && (big(g) || g.recall('family') === 'rich') && g.recall('hhPlace') !== 'dorm',
      text: (g) => { const b = breed(g), k = BREED[b]; return pk(g, ['On your way home from work you pass a pet shop. ', 'Wandering the mall on the weekend, you pass a pet shop. ', 'A new pet shop has opened at the gate of your complex. '], 43) + 'Behind the glass sits a ' + b + ', priced at ' + fmt(k[1]) + 'The clerk says shots and deworming cost extra, and a year of food and vet bills runs about ' + fmt(petYear(g, k[0])) + ' or so. ' + (CN.alone(g) ? 'You live alone, and nobody talks to you when you get home at night.' : ''); },
      choices: [
        { t: (g) => 'Buy this ' + breed(g) + ' (' + fmt(BREED[breed(g)][1] + 1500) + ', shots and carrier included)', dev: 15, cond: (g) => cash(g) >= BREED[breed(g)][1] * 3,
          fx: (g) => { const b = breed(g), k = BREED[b]; CN.pay(g, k[1] + 1500); CN.adoptPet(g, k[0], pk(g, k[0] === 'cat' ? ['Toffee', 'Pudding', 'Cola', 'Sesame'] : ['Cola', 'Bun', 'Ingot', 'Lele'], 44)); g.remember('evPetGet', 'bought'); g.stat('心情', 4); },
          res: (g) => 'You named it ' + petName(g) + '. In total it cost ' + fmt(BREED[breed(g)][1] + 1500) + '. On the way home it cried the whole way in its carrier.' },
        { t: 'Adopt one from a rescue center (vaccines and neutering about $110)', dev: 10,
          fx: (g) => { const k = BREED[breed(g)][0]; CN.pay(g, 800); CN.adoptPet(g, k, pk(g, ['Dusty', 'Bun', 'Erya', 'Afu', 'Inky'], 45)); g.remember('evPetGet', 'shelter'); g.stat('心情', 3); g.stat('人缘', 1); },
          res: (g) => 'A rescue center volunteer visited your home once before letting you take ' + petName(g) + ' home. It’s a ' + PET_W[pet(g).kind] + ', with a small piece missing from its left ear. Vaccines and neutering cost $110.' },
        { t: 'Never mind, no time, and afraid you’d do it badly', canon: true, fx: (g) => { g.remember('evPetGet', 'no'); }, res: 'You looked at it through the glass for a while, then left.' },
      ] },
    { id: 'e_pet_village', y: Y, minAge: 12, maxAge: 70, t: 'Puppies',
      cond: (g) => tier(g) >= 4 && !pet(g) && g.recall('liveWith') !== 'nursing' && g.recall('hhPlace') !== 'dorm',
      text: (g) => pk(g, ['The neighbors’ big yellow dog had a litter, and they ask if you want one.', 'A skinny dog showed up at your gate. You shooed it away twice, but it came back and sits there looking at you.', 'Chickens have gone missing in the village twice lately, and your neighbor says it’s time you got a guard dog.'], 46),
      choices: [
        { t: 'Bring one home to guard the place', canon: true, fx: (g) => { CN.adoptPet(g, 'dog', pk(g, ['Big Yellow', 'Blackie', 'Little Tiger', 'Lucky', 'Fortune'], 48)); g.remember('evPup', 'dog'); g.stat('心情', 3); },
          res: (g) => 'You named it ' + petName(g) + ', and put a cardboard box by the door for a bed. The first night it whimpered for half the night.' },
        { t: 'Take a cat to catch mice', dev: 10, fx: (g) => { CN.adoptPet(g, 'cat', pk(g, ['Patches', 'Tiger', 'Kitty', 'Smokey'], 49)); g.remember('evPup', 'cat'); g.stat('心情', 2); },
          res: (g) => 'The neighbors happened to have a litter of kittens. You picked the skinniest one and called it ' + petName(g) + '.' },
        { t: 'No, you can’t manage it', dev: 10, fx: (g) => { g.remember('evPup', 'no'); }, res: 'A few days later all those puppies had been taken.' },
      ] },
    { id: 'e_pet_old', y: Y, minAge: 66, maxAge: 86, t: 'Some company',
      cond: (g) => !pet(g) && !g.recall('pet') && g.recall('liveWith') !== 'nursing',
      text: (g) => [
        'The community is running a stray adoption drive, and a nine-year-old dog is lying by the cage, looking at you the whole time.',
        (kids(g).length ? g.name(kids(g)[0]) + ' calls to say they bought you a parrot that can say “Have you eaten yet?” and asks if you want it.' : 'At the senior center, someone’s parrot hatched chicks, and they ask if you want one.'),
        'Your old neighbor from downstairs has moved into a care home and asks you to look after the cat he’s kept for years.',
      ][Math.floor(rr(g, 50) * 3)],
      choices: [
        { t: (g) => ['Take it home for company', 'Take it and hang it on the balcony', 'Agree and bring it over'][Math.floor(rr(g, 50) * 3)], dev: 10,
          fx: (g) => { const v = Math.floor(rr(g, 50) * 3); CN.adoptPet(g, ['dog', 'bird', 'cat'][v], ['Old Blackie', 'Myna', 'Old Kitty'][v]); g.remember('evOldPet', 'yes'); g.stat('心情', 4); g.stat('健康', 1); },
          res: (g) => ({ dog: 'The old dog walks slowly, and so do you. Every evening you circle the complex together, and it’s just right.', bird: 'For the first month the parrot didn’t say a word. One morning you opened the window and it suddenly said: have you eaten yet?', cat: 'The old cat was shy of strangers and stayed on top of the cabinet for three days. On the fourth day it came down and rubbed against your trouser leg.' }[pet(g).kind]) },
        { t: 'No, you’re afraid you’d go before it does', canon: true, fx: (g) => { g.remember('evOldPet', 'no'); }, res: 'You said thanks, went home and watered all the flowers on your balcony.' },
      ] },
    { id: 'e_pet_vet', y: Y, minAge: 18, maxAge: 92, t: 'Animal hospital',
      cond: (g) => money(g) && !!pet(g) && ['dog', 'cat', 'rabbit'].includes(pet(g).kind) && g.Y - pet(g).y >= 2,
      text: (g) => petName(g) + pk(g, ['ate something bad and threw up all night', 'has gone lame and yelps at the slightest touch', 'hasn’t eaten for days and lies there listless'], 51) + '. The animal hospital says it needs ' + pk(g, ['a small operation', 'a few days in the hospital', 'a full set of tests'], 52) + ', and wants ' + fmt(vetBill(g)) + '.',
      choices: [
        { t: (g) => 'Treat it, pay ' + fmt(vetBill(g)), canon: true, cond: (g) => cash(g) >= vetBill(g), fx: (g) => { CN.pay(g, vetBill(g)); g.remember('evVet', 'cure'); g.stat('心情', -1); },
          res: (g) => 'You paid ' + fmt(vetBill(g)) + '. The vet said you’d come just in time. ' + petName(g) + ' went home wearing a cone collar, sulking for days.' },
        { t: (g) => 'Put it on your credit card and treat it (' + fmt(vetBill(g)) + ')', dev: 15, cond: (g) => cash(g) < vetBill(g), fx: (g) => { CN.pay(g, vetBill(g)); g.remember('evVet', 'cure'); g.stat('心情', -2); },
          res: (g) => 'You paid by card. ' + petName(g) + ' stayed in for a few days and rubbed against your hand all day when it came home. It took you several months of installments to pay it off.' },
        { t: (g) => 'Get some medicine and nurse it at home (about ' + fmt(round(vetBill(g) * 0.2, 100)) + ')', dev: 10, fx: (g) => { CN.pay(g, round(vetBill(g) * 0.2, 100)); g.remember('evVet', 'basic'); g.stat('心情', -2); },
          res: 'You took the medicine and pried its mouth open to feed it every day. It refused to swallow, so you wrapped the pill in meat.' },
      ] },

    // —— 上班的人 ——
    { id: 'e_layoff_rumor', y: Y, minAge: 26, maxAge: 52, t: 'Rumor', cond: (g) => working(g) && ['office', 'tech', 'sales'].includes(job(g)),
      text: (g) => pk(g, ['In the break room someone whispers', 'The work chat suddenly goes quiet, and someone says privately', 'Over lunch downstairs, someone from the next department says'], 53) + ', the company will cut ' + pk(g, ['20%', '30%', 'an entire department'], 54) + ' of its staff next month. You currently make about ' + fmt(myPay(g)) + '.',
      choices: [
        { t: 'Work as usual, don’t overthink it', canon: true, fx: (g) => { g.remember('evRumor', 'calm'); }, res: 'You handed in the report you’d been working on and left on time.' },
        { t: 'Quietly send out résumés and line up a next job', dev: 10, fx: (g) => { g.remember('evRumor', 'hunt'); g.stat('心情', -1); }, res: 'You updated your résumé during lunch break with the screen dimmed.' },
        { t: 'Volunteer for the busiest project team', dev: 15, fx: (g) => { g.remember('evRumor', 'busy'); g.stat('健康', -2); g.stat('事业', 2); }, res: 'The new project team’s lights were on until eleven every night. You got to know a few capable people there.' },
      ] },
    { id: 'e_wage_owed', y: Y, minAge: 18, maxAge: 60, t: 'Unpaid wages', cond: (g) => working(g) && ['worker', 'driver', 'freelance'].includes(job(g)) && money(g),
      text: (g) => 'Your boss is two months late paying your wages, ' + fmt(round(myPay(g) * 2, 100)) + '.' + pk(g, ['He says he’ll pay as soon as the project payment comes in.', 'He can’t be found and won’t answer the phone.', 'He says the company has cash flow problems and writes you an IOU.'], 55),
      choices: [
        { t: 'Go to the labor inspection office and file for arbitration', dev: 15, fx: (g) => { g.remember('evWageAmt', round(myPay(g) * 2, 100)); g.remember('evWage', 'sue'); g.stat('心情', -1); }, res: 'You printed out your work badge, chat records and attendance screenshots and put them in a kraft paper envelope.' },
        { t: 'Go with a few coworkers to confront him', dev: 10, fx: (g) => { g.remember('evWageAmt', round(myPay(g) * 2, 100)); g.remember('evWage', 'group'); g.stat('人缘', 2); }, res: 'The five of you waited at his office door all afternoon. He finally came out and said he’d definitely pay next month.' },
        { t: 'Accept it and work somewhere else', canon: true, fx: (g) => { g.remember('evWageAmt', round(myPay(g) * 2, 100)); g.remember('evWage', 'quit'); g.stat('心情', -3); }, res: 'You packed your things and started at a new place the next day.' },
      ] },
    { id: 'e_partner_stake', y: Y, minAge: 28, maxAge: 55, t: 'Buying in', cond: (g) => money(g) && cash(g) >= 50000,
      text: (g) => 'old classmate' + pk(g, [' Big Liu', ' Ajie', ' Xiaofang', ' Old Zhou', ' Fatty', ' Yanzi'], 56) + ' is opening a ' + pk(g, ['barbecue place', 'B&B', 'bubble tea shop', 'car wash', 'murder mystery game parlor'], 57) + ' and wants you to invest, asking for ' + fmt(stakeAmt(g)) + ', saying you’d get a 20% payout every year.',
      choices: [
        { t: (g) => 'Invest ' + fmt(stakeAmt(g)) + ' (if it works, dividends every year; if it fails, you lose everything)', dev: 15,
          fx: (g) => { const a = stakeAmt(g); CN.pay(g, a); g.remember('evStakeAmt', a); g.remember('evStakeWho', pk(g, [' Big Liu', ' Ajie', ' Xiaofang', ' Old Zhou', ' Fatty', ' Yanzi'], 56)); g.remember('evStakeKind', pk(g, ['barbecue place', 'B&B', 'bubble tea shop', 'car wash', 'murder mystery game parlor'], 57)); g.remember('evStake', 'in'); },
          res: 'You sent the money and he sent a photo of the partnership agreement. The print was tiny and you didn’t read it closely.' },
        { t: (g) => 'Put in less, just a token (' + fmt(round(stakeAmt(g) / 4, 5000)) + ')', dev: 10,
          fx: (g) => { const a = round(stakeAmt(g) / 4, 5000); CN.pay(g, a); g.remember('evStakeAmt', a); g.remember('evStakeWho', pk(g, [' Big Liu', ' Ajie', ' Xiaofang', ' Old Zhou', ' Fatty', ' Yanzi'], 56)); g.remember('evStakeKind', pk(g, ['barbecue place', 'B&B', 'bubble tea shop', 'car wash', 'murder mystery game parlor'], 57)); g.remember('evStake', 'part'); },
          res: 'You said money was tight and sent a small amount. He said that was generous of you.' },
        { t: 'Don’t invest, keep the money', canon: true, fx: (g) => { g.remember('evStake', 'no'); g.remember('evStakeKind', pk(g, ['barbecue place', 'B&B', 'bubble tea shop', 'car wash', 'murder mystery game parlor'], 57)); }, res: 'You said you’d think about it. He said he understood, and on opening day he still sent you an invitation.' },
      ] },
    { id: 'e_village_coop', y: Y, minAge: 24, maxAge: 45, t: 'Call from the village', cond: (g) => g.recall('hukou') === 'rural' && working(g) && tier(g) <= 3 && job(g) !== 'boss' && !!g.recall('homeCap'),
      text: (g) => 'The village secretary back home posted a long message in the group chat: the village wants to start a co-op in the ' + crop(g) + ' business, ' + pk(g, ['with county subsidies', 'with a company guaranteeing to buy the harvest', 'with the road into the village finished'], 58) + ', and he wants the young people working away to come back and take the lead. He called you separately.',
      choices: [
        { t: (g) => 'Go back and take the lead (' + CN.jobRisk('boss') + ')', dev: 25, check: ['人缘', 50],
          fx: (g) => { const c = crop(g); CN.goHome(g); g.remember('tier', 5); g.remember('workCity', g.recall('homeCap')); g.info('住处', g.recall('homeCap')); CN.setJob(g, 'boss', c + ' co-op leader'); g.remember('evCoopCrop', c); g.remember('evCoop', 'back'); g.stat('人缘', 4); },
          res: (g) => 'You went back to the village. In the first year, the ' + g.recall('evCoopCrop') + ' co-op took over about 30 acres of leased land, and every day you ran between the fields and the county town.',
          fail: { fx: (g) => { const c = crop(g); CN.goHome(g); g.remember('tier', 5); g.remember('workCity', g.recall('homeCap')); g.info('住处', g.recall('homeCap')); CN.setJob(g, 'farmer', 'Back farming at home'); g.remember('evCoopCrop', c); g.remember('evCoop', 'backFail'); g.stat('心情', -3); },
            res: 'You went back, but a few of the bigger families wouldn’t lease out their land, and the co-op never got off the ground. You stayed in the village and farmed your own few plots.' } },
        { t: 'Put up some money but don’t go back ($2,900)', dev: 10, cond: (g) => cash(g) >= 30000, fx: (g) => { CN.pay(g, 20000); g.remember('evCoopCrop', crop(g)); g.remember('evCoop', 'money'); g.stat('人缘', 2); }, res: 'You sent $2,900, and the secretary named you in the group chat.' },
        { t: 'Don’t go back, life is fine out here', canon: true, fx: (g) => { g.remember('evCoopCrop', crop(g)); g.remember('evCoop', 'no'); }, res: 'You replied “Count me in,” and sent a red envelope.' },
      ] },
    { id: 'e_deposit', y: Y, minAge: 20, maxAge: 42, t: 'Deposit', cond: (g) => g.recall('house') === 'rent' && money(g),
      text: (g) => 'On the day you moved out, your landlord ' + pk(g, ['said there were a few nail holes in the wall', 'said there was a stain on the sofa', 'said the toilet had to be replaced'], 59) + ', so he’ll refund only half of the ' + fmt(DEPOSIT[tier(g)] || 3000) + ' deposit.',
      choices: [
        { t: 'Dig out the photos from move-in day and give no ground', dev: 10, fx: (g) => { g.remember('evDepositAmt', DEPOSIT[tier(g)] || 3000); g.remember('evDeposit', 'fight'); }, res: 'You swiped through the photos on your phone one by one and showed him. He didn’t look pleased.' },
        { t: 'Complain to the agency and the platform', dev: 10, fx: (g) => { g.remember('evDepositAmt', DEPOSIT[tier(g)] || 3000); g.remember('evDeposit', 'report'); }, res: 'You called customer service three times, explaining everything from the start each time.' },
        { t: 'Accept it, you don’t want a fight', canon: true, fx: (g) => { g.remember('evDepositAmt', DEPOSIT[tier(g)] || 3000); g.remember('evDeposit', 'let'); g.stat('心情', -2); }, res: 'You put the keys on the table and dragged your suitcase downstairs.' },
      ] },

    // —— 邻里、路上 ——
    { id: 'e_lost_phone', y: Y, minAge: 16, maxAge: 78, t: 'Phone', cond: (g) => money(g),
      text: (g) => 'You left your phone ' + pk(g, ['in the back seat of a taxi', 'on a subway seat', 'on a park bench', 'on a restaurant table'], 60) + ', and didn’t notice until you were far away.',
      choices: [
        { t: 'Borrow someone’s phone and keep calling', canon: true, fx: (g) => { g.remember('evPhone', 'call'); }, res: 'On the sixth call, someone picked up.' },
        { t: 'Report it at the police station', dev: 10, fx: (g) => { g.remember('evPhone', 'police'); }, res: 'The officer registered it and told you to go home and wait for news.' },
        { t: 'Accept it and buy a new one ($430)', dev: 10, fx: (g) => { CN.pay(g, 3000); g.remember('evPhone', 'new'); g.stat('心情', -2); }, res: 'A new phone, $430. When you logged in, you found years of photos had never been backed up.' },
      ] },
    { id: 'e_umbrella', y: Y, minAge: 16, maxAge: 72, t: 'An umbrella',
      text: (g) => 'Heavy rain. ' + pk(g, ['At the bus stop', 'At the subway entrance', 'In front of the convenience store'], 61) + ' there’s a ' + pk(g, ['woman holding a child', 'old person with a cane', 'student in a school uniform'], 62) + ' who has no umbrella and is staring at the rain, worried. You only have one umbrella.',
      choices: [
        { t: 'Press your umbrella into their hands and run home', dev: 10, fx: (g) => { g.remember('evUmb', 'gave'); g.stat('健康', -1); g.stat('心情', 2); }, res: 'You ran all the way back with your shoes full of water.' },
        { t: 'Share the umbrella and walk them part of the way', canon: true, fx: (g) => { g.remember('evUmb', 'walk'); g.stat('人缘', 1); }, res: 'You tilted the umbrella toward them and soaked one of your shoulders.' },
        { t: 'Keep your head down and walk past', dev: 5, fx: (g) => { g.remember('evUmb', 'no'); }, res: 'You went a few steps, then looked back.' },
      ] },
    { id: 'e_tutor_kid', y: Y, minAge: 30, maxAge: 75, t: 'Tutoring', cond: (g) => hiEdu(g),
      text: (g) => 'Downstairs, ' + pk(g, ['Sister Zhang', 'Old Li', 'Auntie Wang', 'Little Chen'], 63) + '’s kid can’t keep up in ' + pk(g, ['math', 'English', 'composition'], 64) + ', so they’re asking if you could help out on weekends.',
      choices: [
        { t: 'Agree, free of charge', canon: true, fx: (g) => { g.remember('evTutor', 'free'); g.stat('人缘', 3); }, res: 'Every Saturday afternoon, the kid came knocking on your door with a workbook.' },
        { t: 'Agree, charge the going rate ($30 a session)', dev: 10, fx: (g) => { CN.earn(g, 6000); g.remember('evTutor', 'paid'); g.stat('人缘', 1); }, res: 'Over the term you collected $860. The red X’s on the kid’s papers were cut by half.' },
        { t: 'Decline, you really have no time', dev: 10, fx: (g) => { g.remember('evTutor', 'no'); }, res: 'You said you’d been too busy lately. They said it was fine, but their steps going downstairs were a little slow.' },
      ] },
    { id: 'e_hometown_road', y: Y, minAge: 35, maxAge: 80, t: 'Road project', cond: (g) => g.recall('hukou') === 'rural' && money(g) && cash(g) >= 10000,
      text: (g) => 'Back home they’re going to ' + pk(g, ['pave the dirt road into the village with concrete', 'put up a row of streetlights in the village', 'build a bridge over the river'], 65) + ', and people living away are invited to chip in. Names will be carved on the stone tablet at the village entrance.',
      choices: [
        { t: (g) => 'Give ' + fmt(roadAmt(g)), canon: true, fx: (g) => { const a = roadAmt(g); CN.pay(g, a); g.remember('evRoadAmt', a); g.remember('evRoad', 'gave'); g.stat('人缘', 2); }, res: 'You added your name to the pledge list in the group chat.' },
        { t: (g) => 'Give more: ' + fmt(roadAmt(g) * 3), dev: 15, cond: (g) => cash(g) >= roadAmt(g) * 10,
          fx: (g) => { const a = roadAmt(g) * 3; CN.pay(g, a); g.remember('evRoadAmt', a); g.remember('evRoad', 'big'); g.stat('人缘', 4); }, res: 'The secretary called and thanked you several times.' },
        { t: 'Don’t give, you haven’t been back much', dev: 10, fx: (g) => { g.remember('evRoad', 'no'); g.stat('人缘', -2); }, res: 'The list reached more than a hundred names, and yours wasn’t among them.' },
      ] },
    { id: 'e_group_buy', y: Y, minAge: 35, maxAge: 78, t: 'Group-buy leader', cond: (g) => tier(g) <= 4 && money(g) && g.recall('liveWith') !== 'nursing',
      text: (g) => 'The group-buy chat for your complex needs a leader. ' + pk(g, ['The property manager', 'The owner of the supermarket downstairs', 'The group admin'], 66) + ' asks if you’d do it: collect and hand out vegetables for everyone, with a small commission on each order.',
      choices: [
        { t: 'Do it, a way to get to know the neighbors', dev: 10, fx: (g) => { g.remember('evTuan', 'yes'); g.stat('人缘', 3); }, res: 'A folding table appeared at your door. Every evening the people in the building came to pick up their vegetables and chat a bit.' },
        { t: 'Don’t, it’s too fiddly', canon: true, fx: (g) => { g.remember('evTuan', 'no'); }, res: 'You recommended an auntie upstairs in the group chat.' },
      ] },
    { id: 'e_hospital_number', y: Y, minAge: 35, maxAge: 85, t: 'The appointment', loc: 'hospital', cond: (g) => tier(g) <= 3,
      text: (g) => 'You queued all morning and got ' + pk(g, ['the last specialist slot of the day', 'the last slot of the afternoon'], 67) + '. Next to you, ' + pk(g, ['an old man who came from the county', 'a young mother holding a feverish child'], 68) + ' didn’t get one and is crying with anxiety.',
      choices: [
        { t: 'Give your slot to them', dev: 15, fx: (g) => { g.remember('evHosp', 'gave'); g.stat('人缘', 2); g.stat('健康', -1); }, res: 'They were stunned for a moment, then kept saying thank you. You moved your own appointment to next week.' },
        { t: 'Go with them to the triage desk to find a way', dev: 10, fx: (g) => { g.remember('evHosp', 'help'); g.stat('人缘', 1); }, res: 'The triage nurse managed to add a slot. By the time you got back, your own number was just being called.' },
        { t: 'Sigh and see to your own illness', canon: true, fx: (g) => { g.remember('evHosp', 'kept'); }, res: 'When you came out from your appointment, that person was gone.' },
      ] },
  ]);

  /* 上面这些的回响 */
  JY.addEncounters([
    // 宠物老了：还在世的宠物，离它的寿数还有两年
    { id: 'e_echo_petage', y: Y, minAge: 10, t: 'Getting old', auto: true, always: true, kind: 'echo',
      cond: (g) => !!pet(g) && ['dog', 'cat'].includes(pet(g).kind) && g.Y - pet(g).y >= Math.max(6, pet(g).life - 2),
      text: (g) => petName(g) + ' is getting old.' + (pet(g).kind === 'dog' ? ' It has to be carried down stairs now, and its hearing is going: you have to call several times before it turns around.' : ' It can’t jump onto the windowsill anymore and sleeps all day beside the radiator.') + ' You switched it to softer food.' },
    echo('e_echo_petget', (g) => [g.recall('evPetGet'), g.since('evPetGet')], 'It', 3, 25, {
      bought: { t: (g) => (pet(g) ? petName(g) + ' has grown up. ' + (pet(g).kind === 'dog' ? 'Every day when the time comes, it waits by the door with its leash in its mouth.' : 'Its favorite spot is your keyboard.') + ' These past few years, food, supplies and vet bills have added up to ' + fmt(petYear(g, pet(g).kind) * 3) + '.' : 'The little one you bought got sick after just a few years. You never went back to a pet shop.'), fx: (g) => { if (pet(g)) CN.pay(g, petYear(g, pet(g).kind) * 3); g.stat('心情', 2); } },
      shelter: { t: (g) => (pet(g) ? 'The rescue center sent a follow-up message asking how ' + petName(g) + ' is doing. You sent a photo of it sleeping on its back with its paws in the air.' : 'The rescue center sent a follow-up message. You dug out its photo and looked at it for a long time.'), fx: (g) => g.stat('心情', 2) },
      no: { t: 'You often went to a coworker’s home afterward and sat holding his cat all afternoon. He said you should just get one of your own.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_pup', (g) => [g.recall('evPup'), g.since('evPup')], 'In the yard', 2, 14, {
      dog: { t: (g) => (pet(g) && pet(g).kind === 'dog' ? petName(g) + ' grew into a big dog. One night it barked nonstop. ' + CN.pick(['It turned out someone outside the wall was prying open the neighbor’s door.', 'It turned out the stove in the kitchen hadn’t been banked properly and was giving off smoke.', 'It turned out a weasel had slipped into the chicken coop.']) : 'The guard dog later ran off and got lost. You searched for it for days.'), fx: (g) => g.stat('心情', 2) },
      cat: { t: (g) => (pet(g) && pet(g).kind === 'cat' ? petName(g) + ' left a mouse at your door first thing in the morning and crouched next to it, waiting for you to praise it.' : 'That cat later went off with the neighbors, whose fish tasted better.'), fx: (g) => g.stat('心情', 1) },
      no: { t: 'The sturdiest of that litter of puppies was taken in by the shop at the village entrance. Every time you go to buy something, it wags its tail at you.' },
    }),
    echo('e_echo_oldpet', (g) => [g.recall('evOldPet'), g.since('evOldPet')], 'Old companion', 2, 68, {
      yes: { t: (g) => (pet(g) ? 'With ' + petName(g) + ' around, you have something to do every day: ' + ({ dog: 'two walks, morning and evening', bird: 'changing its water, adding food, teaching it to talk', cat: 'scooping the litter, brushing, and talking to it' }[pet(g).kind] || 'feeding it') + '.' + (CN.alone(g) ? ' The house has sounds in it again.' : ' Your family says you talk more now.') : 'It kept you company for a few years, then it was gone. You put its things away, leaving one item on the windowsill.'), fx: (g) => { g.stat('心情', 3); g.stat('健康', 1); } },
      no: { t: 'Afterwards you often sat at the community adoption point, bringing food for the cats and dogs there. The staff all know you.', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_vet', (g) => [g.recall('evVet'), g.since('evVet')], 'Better', 1, 19, {
      cure: { t: (g) => (pet(g) ? petName(g) + ' is completely better and back to romping all over the house, ' + CN.pick(['chewing up a slipper.', 'ripping a gash in the sofa.', 'tipping the trash can upside down.']) : 'You don’t regret the money you spent that time at all.'), fx: (g) => g.stat('心情', 2) },
      basic: { t: (g) => (pet(g) ? petName(g) + 'slowly got better, only a bit thinner than before and not as fast when it runs.' : 'You didn’t want to spend more that time. After it was gone, you felt sick for a good while whenever you thought of it.'), fx: (g) => g.stat('心情', pet(g) ? 1 : -3) },
    }),
    echo('e_echo_rumor', (g) => [g.recall('evRumor'), g.since('evRumor')], 'The list', 1, 27, {
      calm: { t: (g) => (g.recall('evRumorCut') ? 'The list came out and you were on it. Severance: ' + fmt(round(myPay(g) * 6, 1000)) + '; you took two months off and found a new job, for a bit less pay.' : 'The rumor didn’t come true; only a few contractors were let go. You carried on as usual, and the pothos on your desk grew another stretch.'),
        fx: (g) => { const cut = g.rnd() < 0.4; g.remember('evRumorCut', cut); if (cut) { CN.earn(g, round(myPay(g) * 6, 1000)); g.stat('事业', -3); g.stat('心情', -3); } } },
      hunt: { t: (g) => 'You jumped to a new company, with a monthly salary higher by ' + fmt(round(myPay(g) * 0.15, 100)) + '; the old company really did lay people off later, and former coworkers said in the group chat that you left just in time.', fx: (g) => { g.stat('事业', 3); g.stat('心情', 2); } },
      busy: { t: 'Your team wasn’t on the layoff list. At year-end the project launched, and the leader read out your name at the big meeting.', fx: (g) => { g.stat('事业', 4); } },
    }),
    echo('e_echo_wage', (g) => [g.recall('evWage'), g.since('evWage')], 'Recovered', 1, 19, {
      sue: { t: (g) => 'The arbitration ruling came through. The ' + fmt(g.recall('evWageAmt')) + ' owed to you arrived in your account in full, plus a little interest. You gave the staff member who helped you with the paperwork a silk banner.', fx: (g) => { CN.earn(g, Number(g.recall('evWageAmt')) || 0); g.stat('心情', 3); } },
      group: { t: (g) => (g.recall('evWageBack') ? 'After dragging on for most of a year, the ' + fmt(g.recall('evWageAmt')) + ' was finally paid in full in three installments.' : 'In the end the boss paid only half. The rest, your coworkers said forget it, and so did you.'),
        fx: (g) => { const back = g.rnd() < 0.5; g.remember('evWageBack', back); CN.earn(g, (Number(g.recall('evWageAmt')) || 0) * (back ? 1 : 0.5)); } },
      quit: { t: 'Later you heard the boss skipped town, owing money to more than a hundred people. You work steadily at your new place, and pay arrives on time on the tenth of every month.', fx: (g) => g.stat('心情', 1) },
    }),
    echo('e_echo_stake', (g) => [g.recall('evStake'), g.since('evStake')], 'That shop', 2, 30, {
      in: { t: (g) => (g.recall('evStakeOk') ? g.recall('evStakeWho') + '’s ' + g.recall('evStakeKind') + ' became a hit, with lines on holidays. Two years of dividends added up to ' + fmt((Number(g.recall('evStakeAmt')) || 0) * 0.6) + '.' : g.recall('evStakeWho') + '’s ' + g.recall('evStakeKind') + ' lasted a year and a half, then closed. Your ' + fmt(g.recall('evStakeAmt')) + ' investment is gone. He said sorry, and you said that’s how business goes.'),
        fx: (g) => { const ok = g.rnd() < 0.45; g.remember('evStakeOk', ok); if (ok) CN.earn(g, (Number(g.recall('evStakeAmt')) || 0) * 0.6); else g.stat('心情', -3); } },
      part: { t: (g) => (g.recall('evStakeOk') ? g.recall('evStakeWho') + '’s shop took off, and at year end he sent you a dividend of ' + fmt((Number(g.recall('evStakeAmt')) || 0) * 0.5) + '; you regretted a little not investing more.' : g.recall('evStakeWho') + '’s shop didn’t make it. The little you put in, call it treating him to a few meals.'),
        fx: (g) => { const ok = g.rnd() < 0.45; g.remember('evStakeOk', ok); if (ok) CN.earn(g, (Number(g.recall('evStakeAmt')) || 0) * 0.5); } },
      no: { t: (g) => 'That ' + g.recall('evStakeKind') + ' you went to twice; business was so-so. Your old classmate always gave you an extra dish.' },
    }),
    echo('e_echo_coop', (g) => [g.recall('evCoop'), g.since('evCoop')], 'The co-op', 3, 27, {
      back: { t: (g) => g.recall('evCoopCrop') + ' co-op took off, and last year it sold ' + fmt(300000 + Math.round(rr(g, 69) * 40) * 10000) + '. More than forty families in the village work at the co-op, including ' + (has(g, 'fa') || has(g, 'mo') ? parentsWord(g) + ' included, ' : '') + 'and at year end every household got a share.', fx: (g) => { CN.earn(g, 60000); g.stat('事业', 6); g.stat('人缘', 3); } },
      backFail: { t: 'The co-op never got going. You farmed in the village for three years and also drove a combine harvester for others. You didn’t earn much, but dinner was always hot.', fx: (g) => g.stat('心情', 1) },
      money: { t: (g) => 'The co-op’s first ' + g.recall('evCoopCrop') + 'harvest is in, and the secretary mailed a box to everyone who’d contributed. You shared yours with coworkers, and everyone said it was delicious.', fx: (g) => g.stat('人缘', 2) },
      no: { t: (g) => 'Back in the village for New Year, there was a new row of ' + g.recall('evCoopCrop') + ' greenhouses at the village entrance. The man who took the lead is a few years younger than you, and he politely calls you elder brother.' },
    }),
    echo('e_echo_deposit', (g) => [g.recall('evDeposit'), g.since('evDeposit')], 'Deposit', 1, 21, {
      fight: { t: (g) => (g.recall('evDepositBack') ? 'In the end your landlord refunded the whole deposit, ' + fmt(g.recall('evDepositAmt')) + '; from then on, wherever you moved in, you photographed everything first.' : 'The landlord still kept half. You wrote a long review on the rental platform, and several people later messaged to thank you.'),
        fx: (g) => { const back = g.rnd() < 0.6; g.remember('evDepositBack', back); if (back) CN.earn(g, (Number(g.recall('evDepositAmt')) || 0) / 2); } },
      report: { t: (g) => 'The agency stepped in to mediate and returned the withheld ' + fmt((Number(g.recall('evDepositAmt')) || 0) / 2) + '; customer service even called you back for a follow-up in the end.', fx: (g) => CN.earn(g, (Number(g.recall('evDepositAmt')) || 0) / 2) },
      let: { t: 'You still felt a bit angry when you thought of that withheld deposit. The next time you rented, you photographed every wall the moment you walked in.' },
    }),
    echo('e_echo_phone', (g) => [g.recall('evPhone'), g.since('evPhone')], 'Found again', 1, 17, {
      call: { t: (g) => 'The one who answered was a ' + CN.pick(['delivery rider', 'college student', 'street sweeper', 'taxi driver']) + ', who brought your phone back. You offered money, and they would take only a bottle of water. Since then, whenever you find something, you wait for its owner to come looking.', fx: (g) => g.stat('心情', 2) },
      police: { t: 'A week later the police station called to say your phone had been found. An old man had picked it up and handed it in. When you went to collect it, the officer said the old man hadn’t left his name.', fx: (g) => g.stat('人缘', 1) },
      new: { t: 'The old phone never turned up. Among the photos you hadn’t backed up was one you really loved. You started backing up once a month.', fx: (g) => g.stat('学识', 1) },
    }),
    echo('e_echo_umbrella', (g) => [g.recall('evUmb'), g.since('evUmb')], 'Bumping Into Them Again', 1, 17, {
      gave: { t: 'A while later you ran into that person at the same spot. They recognized you and insisted on pressing a bag of homemade buns on you.', fx: (g) => { g.stat('心情', 3); g.stat('人缘', 1); } },
      walk: { t: 'You walked them to the intersection, and they said it was just ahead. Since then, when it rains, you always keep a folding umbrella in your bag.', fx: (g) => g.stat('人缘', 1) },
      no: { t: 'More heavy rain came after that. Every time you stood under an awning, you thought of that person staring at the rain, worried.', fx: (g) => g.stat('心情', -1) },
    }),
    echo('e_echo_tutor', (g) => [g.recall('evTutor'), g.since('evTutor')], 'That child', 3, 33, {
      free: { t: (g) => 'The kid from downstairs got into ' + CN.pick(['a top high school in the city', 'a good university', 'the teachers’ college they had their heart set on']) + ', and came to your door with a box of fruit, saying you were the one who had taught ' + CN.pick(['him', 'her']) + ' how to read the questions.', fx: (g) => { g.stat('人缘', 3); g.stat('心情', 3); } },
      paid: { t: 'The kid’s grades went up, and the parents sent two more kids your way. You said you wanted to rest on weekends and didn’t take them.', fx: (g) => g.stat('人缘', 1) },
      no: { t: 'You run into the kid in the elevator. He has grown taller and wears headphones, and he gives you a nod.' },
    }),
    echo('e_echo_road', (g) => [g.recall('evRoad'), g.since('evRoad')], 'At the Village Gate', 2, 37, {
      gave: { t: (g) => 'On that trip back to your home village, you found your name on the stone at the village gate, with ' + fmt(g.recall('evRoadAmt')) + ' written beside it. The car drove all the way to your door.', fx: (g) => g.stat('心情', 2) },
      big: { t: (g) => 'Your name was near the top of the stone, with ' + fmt(g.recall('evRoadAmt')) + ' written beside it. The village kids pointed at the stone and sounded out the names, and when they got to yours, they read it out loud.', fx: (g) => { g.stat('心情', 3); g.stat('人缘', 2); } },
      no: { t: 'On that trip home, the newly built road ran all the way into the village. You drove down it very slowly.' },
    }),
    echo('e_echo_tuan', (g) => [g.recall('evTuan'), g.since('evTuan')], 'Group-buy leader', 2, 37, {
      yes: { t: (g) => 'In your two years as the building’s group-buy leader, the commissions added up to ' + fmt(round(3000 + rr(g, 70) * 9000, 100)) + '. You knew before anyone else whose kid had gotten into school and whose parents had been taken to the hospital.', fx: (g) => { CN.earn(g, round(3000 + rr(g, 70) * 9000, 100)); g.stat('人缘', 3); } },
      no: { t: 'The group-buy leader changed three times. The last one was the lady upstairs, who always saved you the freshest bunch of greens.', fx: (g) => g.stat('人缘', 1) },
    }),
    echo('e_echo_hosp', (g) => [g.recall('evHosp'), g.since('evHosp')], 'A Box of Local Produce', 2, 37, {
      gave: { t: (g) => 'A parcel arrived for you, a box of ' + CN.pick(['free-range eggs', 'millet', 'cured pork', 'freshly picked tangerines']) + ', with a note tucked inside: thanks for the slot that day.', fx: (g) => { g.stat('心情', 3); } },
      help: { t: 'Later you volunteered at the hospital a few times, standing by the registration machines to help old people tap the screen.', fx: (g) => g.stat('人缘', 2) },
      kept: { t: 'Later the hospital brought in an AI triage guide, and getting an appointment got much easier. Sometimes you still think of the person who was crying.' },
    }),
  ]);

  /* ---------- 新闻：2026–2120 ---------- */
  const NEWS = [
    [2026, 'About nine million babies are born nationwide this year. “Mu,” “Xi” and “Chen” are the most popular characters in newborns’ names.'],
    [2026, 'Some cities start giving families with newborns a child-rearing subsidy of a few dozen dollars a month.'],
    [2027, 'Summer is hotter than usual, and many places in the south break temperature records. Air conditioners sell out.'],
    [2027, 'Home AI assistants fall in price to less than a fridge.'],
    [2028, 'A few more high-speed rail lines open. From a county town to the provincial capital takes as little as an hour.'],
    [2028, 'Some kindergartens can’t fill their classes and turn into daycare centers.'],
    [2029, 'AI assistants enter more and more homes. They tell stories, help with homework and remind old people to take their pills.'],
    [2029, 'Sales of new-energy vehicles beat gas cars for the first time.'],
    [2030, 'Delayed retirement plans keep rolling out across the country, and the retirement age creeps up every few months.'],
    [2030, 'Supermarkets let you pay with your face, and the checkout counters are half as many.'],
    [2031, 'A new flu vaccine comes out, and one shot lasts two years.'],
    [2031, 'On a short-video platform, an old village woman who speaks in dialect passes ten million followers.'],
    [2032, 'This year’s first-graders are thirty percent fewer than ten years ago. Many village primary schools merge, and the kids board at schools in town.'],
    [2032, 'In big cities, takeout begins to arrive by drone, and rooftops sprout little landing pads.'],
    [2033, 'The national population keeps slowly shrinking, and people over sixty make up a quarter of it.'],
    [2033, 'Some cities offer “second and third child” home-buying discounts, and a few more people go to look at apartments.'],
    [2034, 'A heavy snow in the north shuts schools for two days, and the kids have a two-day snowball fight.'],
    [2035, 'Big cities get driverless taxis. The starting fare is a little cheaper than one with a driver.'],
    [2035, 'In hospitals, AI helps doctors read scans, and the wait to see a doctor gets a little shorter.'],
    [2036, 'A film about left-behind children does very well at the box office, and many people cry watching it.'],
    [2037, 'In summer vacation, study-tour groups pack museums everywhere.'],
    [2037, 'Some county towns start giving subsidies to young people who come home to start businesses.'],
    [2038, 'This year’s middle-school entrants are fewer again, and some city middle schools turn empty classrooms into labs.'],
    [2039, 'Battery-swap stations for electric scooters reach the townships. A new battery takes five minutes.'],
    [2040, 'Household robots start selling to ordinary families, still at a high price.'],
    [2040, 'Average life expectancy in China passes eighty.'],
    [2041, 'The number of students taking the zhongkao (high school entrance exam) is the lowest in thirty years. Academic high schools and vocational schools each take about half.'],
    [2041, 'Vocational schools open new programs such as “smart device repair” and “elder care,” and plenty of students sign up.'],
    [2042, 'The summer rains are especially heavy, and flood-control news from the middle and lower Yangtze runs for days.'],
    [2043, 'A big company announces a four-day work week, and the internet argues about it endlessly.'],
    [2044, 'The number of gaokao (college entrance exam) registrants is a third smaller than in your parents’ generation, and the university admission rate hits a new high. Getting into a good one is still just as hard.'],
    [2044, 'The gaokao essay prompt is “My AI Deskmate.”'],
    [2045, 'In universities, many basic courses are led by AI teaching assistants, and teachers spend more time leading discussions.'],
    [2046, 'Housing prices in some cities haven’t risen for several years, and more people rent than buy.'],
    [2047, 'In the countryside, driverless vans start delivering parcels to the village gate.'],
    [2048, 'Many of this year’s graduates take jobs that didn’t exist five years ago: AI trainer, companion-robot repairer, digital estate organizer.'],
    [2048, 'Many entry-level jobs are replaced by AI, and people line up to sign up for job training classes.'],
    [2049, 'Nursing homes everywhere are short of beds, with a wait of a year or two.'],
    [2050, 'Remote work becomes the norm, and many people move back to their hometown county towns and work for big cities from home.'],
    [2050, 'The national population falls to just over 1.3 billion.'],
    [2051, 'A new treatment for one kind of cancer is added to national health insurance, and the cost falls by ninety percent.'],
    [2052, 'The average age at marriage passes thirty-two.'],
    [2053, 'Driverless trucks run in convoys on the highways, and long-haul drivers get fewer and fewer.'],
    [2054, 'Elevator retrofits in older residential complexes are mostly finished in many cities.'],
    [2055, 'In summer a river in the north runs dry for a month, then flows again in autumn.'],
    [2056, 'The price of household robots halves, and many young couples add one to the “big three” wedding purchases.'],
    [2057, 'The gap between big-city and small-city housing prices keeps widening, and in many cities below the provincial capital there are more homes than buyers.'],
    [2058, 'A new generation of artificial heart valves comes out, and the surgery no longer requires opening the chest.'],
    [2059, 'Some universities merge for lack of students. The names change, but the campuses are still there.'],
    [2060, 'People over sixty-five make up a third of the population. Every family has an old person to look after.'],
    [2060, 'Neighborhoods open many “day care centers” for old people, who are looked after during the day and taken home in the evening.'],
    [2061, 'Silver-hair tour groups pack scenic spots everywhere, with young people and robots as guides.'],
    [2062, 'An early screening test for Alzheimer’s joins the standard checkup package.'],
    [2063, 'City primary schools add a social practice class called “Spending Time with Grandpa and Grandma.”'],
    [2064, 'Electric air taxis begin trial runs in a few big cities, taking fifteen minutes from the suburbs to downtown.'],
    [2065, 'This year, the country is still millions of elder-care workers short, and robot caregivers start work.'],
    [2066, 'A documentary about caring for the old in the “only-child generation” sparks much discussion.'],
    [2067, 'Sign-ups for senior universities everywhere sell out in a few seconds on phones.'],
    [2068, 'A rare winter cold snap in the south freezes a big stretch of banana orchards.'],
    [2069, 'Artificial kidneys start clinical use in major hospitals.'],
    [2070, 'Robots doing housework and keeping old people company is already common, and in neighborhoods you can see robots pushing wheelchairs on walks.'],
    [2071, 'Average life expectancy approaches eighty-three.'],
    [2072, 'Many villages become retirement villages, and empty houses are turned into wellness homes.'],
    [2073, 'Handwritten letters become fashionable among young people, and stationery shops sell out of letter paper.'],
    [2074, 'A new drug helps elderly people recover faster from fractures and is added to health insurance.'],
    [2075, 'Almost all taxis in cities are driverless now.'],
    [2076, 'Some cities pilot a “time bank”: you save up hours by caring for old people when you’re young, and exchange them for care when you’re old.'],
    [2077, 'At Spring Festival, the number of video reunions for “empty-nest elders” hits a record.'],
    [2078, 'Older residential complexes are renovated into elder-friendly neighborhoods, with handrails along every hallway.'],
    [2079, 'Home medical robots can do simple checkups, measuring blood pressure and sending the data straight to the doctor.'],
    [2080, 'This year, the number of elder-care robots passes the number of human caregivers.'],
    [2081, 'A woman of 112 celebrates her birthday at home. She is one of the oldest people in the country.'],
    [2082, 'Cemeteries everywhere promote tree burials and sea burials, and more and more people choose not to have a headstone.'],
    [2083, 'A memory aid device comes out that helps old people recall what they just said.'],
    [2084, 'The number of births this year recovers slightly from last year, and the news calls it “young people’s willingness to have children is warming up.”'],
    [2085, 'Organizing digital legacies becomes a real business, and many old people start writing wills for their photos and videos.'],
    [2086, 'County-town movie theaters turn into immersive theaters, and the audiences are mostly old people.'],
    [2087, 'One city pilots fully automated community clinics, with a “doctor” on duty even at night.'],
    [2088, 'Average life expectancy passes eighty-four.'],
    [2089, 'Registrations of remarriage among old people have doubled in ten years.'],
    [2090, 'Senior canteens everywhere serve a meal for a dollar or two, and many are cooked by robots.'],
    [2091, 'The legal retirement age this year is around sixty-five. The generation born in 2026 begins to retire, one by one.'],
    [2091, 'Pension accounts become valid nationwide, so retirees can collect in whatever city they live in.'],
    [2092, 'Many people born in 2026 post their retirement certificates on social media, captioned “Finally.”'],
    [2093, 'A TV drama about childhood in the 2030s is a hit, with actors carrying the schoolbags of that era.'],
    [2094, 'New anti-aging drugs enter clinical trials, and old people line up to sign up.'],
    [2095, 'The summer heat is a degree or two above the late twentieth-century average, and many city parks add misting sprays.'],
    [2096, 'A survey says that more than half of seventy-year-olds talk to robots more than to people every day.'],
    [2097, '“Memory classes” become popular in nursing homes: robots help old people turn the photos of a lifetime into an album.'],
    [2098, 'Average life expectancy passes eighty-five. There are several times as many centenarians as twenty years ago.'],
    [2099, 'On the last day of the year, many old people stay up watching TV to ring in the new year, saying this is the second turn of a century they have seen.'],
    [2100, 'The first day of the twenty-second century. Fireworks light up the sky over every city at once.'],
    [2101, 'In cities, there are now more parks for old people than for children.'],
    [2103, 'A gene therapy that slows aging is approved, still at a high price.'],
    [2105, 'County hospitals now have surgical robots too, so serious illness no longer means a trip to the provincial capital.'],
    [2108, 'Among the last of those born in the 2020s, the oldest is already past eighty.'],
    [2110, 'The number of centenarians passes one million.'],
    [2113, 'An old man born in 2026 posts about his hundredth birthday online, saying he has seen so many “firsts” in his life.'],
    [2116, 'Elder-care robots can now play xiangqi (Chinese chess) with old people, and sometimes lose a game on purpose.'],
    [2027, 'Subways in some cities open night service, with trains still running at one in the morning.'],
    [2030, 'This year at the Spring Festival travel rush, more people go home by high-speed rail than by plane and bus combined for the first time.'],
    [2034, 'Village doctors start using remote diagnosis equipment, seeing county-hospital doctors by video from the village clinic.'],
    [2036, 'All primary and secondary schools get AI teaching assistants, and some parents worry the kids won’t learn to think for themselves.'],
    [2039, 'Some big cities pilot after-school care for primary students, so children have somewhere to go until parents finish work.'],
    [2042, 'The employment rate of vocational-school graduates is, for the first time, about the same as that of regular university graduates.'],
    [2046, 'The number of people registering for the postgraduate entrance exam keeps falling for several years, while plenty still sit the civil-service exam.'],
    [2049, 'County towns open “returning youth startup parks,” turning empty factory buildings into studios.'],
    [2052, 'An earpiece that translates dialects into Mandarin sells well, mostly bought for old people.'],
    [2055, 'A new sea-crossing bridge opens, and driving from the island to the mainland takes twenty minutes.'],
    [2058, 'Births in many cities recover slightly from ten years ago, and the maternity wards have lines again.'],
    [2063, 'A new blood pressure drug needs only one pill a week and is added to health insurance.'],
    [2067, 'Delivery robots can ride the elevator up by themselves.'],
    [2072, 'In county-town cinemas, there are more screenings of old films than new ones.'],
    [2076, 'The first “robot nursing homes” open, with one caregiver for every twenty old people.'],
    [2079, 'Smart hearing aids fall to a few dozen dollars, and many old people can finally hear their grandchildren.'],
    [2084, 'Places begin giving free home medical robots to everyone over eighty.'],
    [2087, 'A survey says that the generation born in the 2020s has changed jobs five times on average.'],
    [2096, '“Intergenerational lunches” catch on in nursing homes: kids from a nearby primary school come every week to eat with the old people.'],
    [2104, 'An old man born in 2026 publishes a memoir called “Our Generation.”'],
    [2120, 'This year, most of those born in 2026 have passed away.'],
    // 平淡的好消息
    [2031, 'Many neighborhoods build “shared kitchens,” where young people working late can go downstairs and cook a hot meal.'],
    [2033, 'An eye-protecting desk lamp spreads through parents’ chat groups, said to keep kids from getting nearsighted while doing homework.'],
    [2038, 'Bus stops in many cities are replaced by little air-conditioned kiosks, so waiting in summer no longer means baking in the sun.'],
    [2043, 'An animated film about a panda going home for the New Year opens during Spring Festival, and adults and kids both love it.'],
    [2045, 'Night markets get lively again, with grilled skewers and dessert-soup stalls open until midnight.'],
    [2047, '“Neighborhood supper tables” become popular in some cities: neighbors take turns cooking and eat together.'],
    [2051, 'High-speed rail tickets get a round of discounts, and more young people go home on weekends.'],
    [2054, 'A few cities turn abandoned railways into walking paths, and they are full of strollers on weekends.'],
    [2057, 'Gene testing is added to routine checkups, and the price drops to a few dozen dollars.'],
    [2061, 'Farmers’ markets everywhere finish renovations: clean, bright, and every stallholder uses an electronic scale.'],
    [2066, 'A show about ordinary people cooking home dishes takes off, starring a retired chef.'],
    [2069, 'Many parks open a “silver canteen” next to them: two meat dishes and one vegetable for about a dollar and a half.'],
    [2074, 'City buses are all low-floor now, so wheelchairs can roll straight on.'],
    [2083, '“Old-friend house shares” catch on: a few old friends share an apartment and look after each other.'],
    [2093, 'A survey says that among people around seventy, those who go out for a walk every day are fifty percent more than ten years ago.'],
    [2102, 'Many families hold a “retirement ceremony” for a robot that has served twenty years, and the old robots they replace go to museums.'],
    [2107, 'A new drug lets old people taste food again, and many go back to eating the dishes they loved when young.'],
  ].map(([y, t]) => ({ y, t }));
  // 和你的生活有关的新闻
  NEWS.push(
    { y: 2032, t: 'Several village primary schools in your home area merge into one, and the school bus leaves at six-thirty every morning.', cond: (g) => g.recall('hukou') === 'rural' },
    { y: 2044, t: 'Your province publishes the gaokao score cutoffs, and the parents’ chat groups explode.', cond: (g) => g.recall('edu') === 'senior' },
    { y: 2060, t: (g) => g.recall('city') + ': news reports say the city now has more old people than children.', cond: (g) => !!g.recall('city') },
    { y: 2070, t: (g) => g.recall('prov') + '’s rural nursing homes begin to get robot caregivers.', cond: (g) => g.recall('hukou') !== 'city' },
    { y: 2052, t: (g) => g.recall('workCity') + '’s metro opens two more lines, and your commute to work is a bit shorter.', cond: (g) => !!g.recall('workCity') && tier(g) <= 2 && working(g) },
    { y: 2058, t: (g) => g.recall('prov') + ': your home county town gets a high-speed rail line, and the trip home drops from six hours to two.', cond: (g) => g.recall('hukou') !== 'city' && !!g.recall('prov') },
  );
  JY.addEvents(NEWS);

  /* ---------- 闲笔 ---------- */
  // 熬过婴儿期的头几年（重心“懵懂”，0–5 岁）
  JY.addFlavor('focus:懵懂', [
    { t: 'The day you first laughed out loud, the whole family gathered around you and played with you all evening.', maxAge: 0 },
    { t: 'When you sleep you always clench your tiny fists, and the grown-ups can’t pry them open.', maxAge: 0 },
    { t: 'You woke three times in the night, and the family took turns getting up to hold you.', maxAge: 1 },
    { t: 'This year you grew your first tooth, and you wanted to bite everything you saw.', maxAge: 1 },
    { t: 'You cried hard at your vaccination, then laughed as soon as you got a balloon outside.', maxAge: 3 },
    { t: 'Bath time was your favorite. You slapped the water and soaked the grown-up.', maxAge: 2 },
    { t: 'On nice days you were carried downstairs to sit in the sun, staring at everyone you saw.', maxAge: 1 },
    { t: 'You could crawl now, and you looked for places to squeeze into all over the house. Under the table was your favorite.', minAge: 1, maxAge: 1 },
    { t: 'You rode the slide in the neighborhood all afternoon and refused to go home.', minAge: 2, maxAge: 5 },
    { t: 'You picked the carrots out of your bowl one by one and lined them up on the table.', minAge: 2, maxAge: 5 },
    { t: 'You pestered the grown-ups for stories, and fell asleep only after the third telling.', minAge: 2, maxAge: 5 },
    { t: 'You made faces at the mirror and cracked yourself up.', minAge: 1, maxAge: 4 },
  ]);
  JY.addFlavor('age:child', [
    { t: 'You learned to walk, and your first step landed you in a grown-up’s arms.', minAge: 1, maxAge: 1 },
    { t: 'The first time you said “Dad,” Dad recorded a video and sent it to the family group chat.', minAge: 1, maxAge: 2, cond: (g) => has(g, 'fa') },
    { t: 'You stacked blocks taller than yourself, then knocked them down with one swat.', minAge: 2 },
    'You ran a high fever and were carried to the hospital in the middle of the night. You got a shot and cried so loud the whole corridor could hear.',
    { t: 'You liked to lie on the windowsill and watch the cars below, and could name several kinds.', minAge: 3 },
    { t: 'The first time you saw rain, you reached out to catch it and said the sky was crying.', minAge: 2 },
    { t: 'The AI speaker at home told you the same story a hundred times, and you still wanted to hear it.', minAge: 2 },
    { t: 'You deleted half the photos on the phone. Nobody knew it was you.', minAge: 3 },
    { t: 'You learned to count, and stopped at ten.', minAge: 3 },
    { t: 'You made your first best friend at kindergarten, fell out the next day, and made up the day after.', minAge: 3 },
    { t: 'You were afraid of thunder and burrowed under the covers every time.', minAge: 2 },
    { t: 'You drew on the wall with crayons: a family holding hands.', minAge: 2 },
    { t: 'You lost your first tooth, put it under the pillow, and waited all night.', minAge: 5 },
    { t: 'You started asking “why.” When the grown-ups couldn’t answer, they said “go ask the AI.”', minAge: 3 },
    { t: 'You finished a whole bowl of rice by yourself for the first time, and the grown-ups all clapped.', minAge: 2 },
    { t: 'You lay on the supermarket floor and refused to move because you wanted a talking toy.', minAge: 2 },
    { t: 'You could recite your first old poem, “Moonlight before my bed,” and got stuck at the third line.', minAge: 3 },
    { t: 'Your favorite cartoon was about a panda who flew a spaceship.', minAge: 2 },
    { t: 'You secretly ate a whole bag of candy, and cried that night with a toothache.', minAge: 3 },
    { t: 'Your kindergarten teacher said you had good ideas in your drawings, and you came home and repeated it five times.', minAge: 3 },
    { t: 'You rode a train for the first time and spent the whole trip pressed to the window without sleeping.', minAge: 2 },
    { t: 'You lined up all the slippers in the house in a row and said it was a train.', minAge: 2 },
    { t: 'You could put on your own shoes now, except they were always on the wrong feet.', minAge: 3 },
    { t: 'The first time you saw the sea, a wave knocked you over, and you sat on the sand in a daze for a long time.', minAge: 3 },
    { t: 'You learned to ride a bike with training wheels and circled the neighborhood all afternoon.', minAge: 3 },
    { t: 'You told the grown-ups your dream was to become a person who could fly.', minAge: 4 },
    { t: (g) => CN.who(g, olderSib(g), true) + ' came home from school, peeled the little red-flower stickers off a homework book and stuck them on your forehead.', minAge: 2, cond: (g) => !!olderSib(g) && g.ageOf(olderSib(g)) >= 7 },
    { t: (g) => CN.who(g, 'gm', true) + ' sewed you a cloth tiger, and you slept hugging it for years.', minAge: 1, cond: (g) => has(g, 'gm') && CN.livesWith(g, 'gm') },
  ]);
  JY.addFlavor('age:young', [
    'You and your deskmate drew a line down the middle of the desk. Whoever crossed it was a puppy.',
    'You scored a hundred for the first time and stuck the test paper on the fridge.',
    { t: 'You learned to swim and soaked in the pool until your lips turned purple.', minAge: 7 },
    { t: 'You secretly changed a mark on your homework with one stroke of the pen, and you remembered it for years.', minAge: 8 },
    { t: 'You fell in love with a novel and finished it under the covers by flashlight, long past bedtime.', minAge: 9 },
    { t: 'You rode a bus alone for the first time, so nervous you stood up three stops early.', minAge: 8 },
    'A new classmate joined, speaking with an accent you couldn’t understand. You became good friends.',
    { t: 'You started to care about what you wore, and stood in front of the mirror for a long time every morning.', minAge: 11 },
    'You came third at sports day, and the prize was a notebook.',
    'You filled the blank margins of your textbooks with little people.',
    { t: 'You got your own phone for the first time, set a password, and told no one.', minAge: 10 },
    { t: 'You grew too fast, and your legs ached at night. The grown-ups said it was just you growing taller.', minAge: 10 },
    { t: 'You had a fight with your family and slammed the door. Hungry in the middle of the night, you came out and found a meal left on the table.', minAge: 11, cond: (g) => !CN.alone(g) },
    { t: 'You started a diary, quit after three days, and picked it up again years later.', minAge: 9 },
    { t: 'You sang at karaoke for the first time, cracked on a high note, and everyone laughed for a long time.', minAge: 10 },
    { t: 'You secretly liked someone in your class, and left the classroom a little late every day so you could walk the same way for a stretch.', minAge: 12 },
    { t: 'You spent a month in the countryside over the summer and learned to catch cicadas.', cond: (g) => g.recall('hukou') !== 'rural' },
    'You got hooked on a sci-fi story and swore you would go to space someday.',
    { t: 'Your nearsightedness got worse, and you switched to thicker glasses.', minAge: 8 },
    { t: 'You realized for the first time that grown-ups aren’t always right.', minAge: 10 },
    { t: 'Before final exams, the whole class stayed up late. You counted the stars outside the window under your desk lamp.', minAge: 12 },
    { t: 'You and your best friend promised to take the exam for the same high school.', minAge: 13 },
    'You got a whole chicken drumstick in the canteen and were happy all afternoon.',
    { t: 'You asked the AI assistant a question you didn’t dare ask the grown-ups.', minAge: 10 },
    { t: 'You saved a whole term’s allowance for a pair of sneakers, and couldn’t bear to wear them.', minAge: 10 },
    { t: 'Your homeroom teacher said you were “smart, but lazy.” Many people have said the same thing to you since.', minAge: 8 },
    { t: 'On the way home from school, you split a popsicle with a classmate, one bite each.', minAge: 6 },
    { t: 'You explained a problem to your deskmate, and he bought you a bottle of soda.', minAge: 8 },
    { t: 'A heavy snow fell, and school let out for half a day. The playground was full of snowball fights.', cond: (g) => ['东北', '华北', '西北'].includes(g.recall('region')) },
    { t: (g) => CN.who(g, olderSib(g), true) + ' slipped you a red envelope in secret, saying not to tell your parents and to go buy a book you like.', minAge: 8, cond: (g) => !!olderSib(g) && g.ageOf(olderSib(g)) >= 18 },
    { t: (g) => CN.who(g, 'gp', true) + ' taught you xiangqi (Chinese chess), always giving you a rook as a handicap, and still beat you every time.', minAge: 7, cond: (g) => has(g, 'gp') },
    { t: (g) => 'Every day before you left the house, ' + CN.who(g, 'gm') + ' tucked a boiled egg into your schoolbag.', cond: (g) => has(g, 'gm') && CN.livesWith(g, 'gm') },
  ]);
  JY.addFlavor('age:adult', [
    { t: 'Evening study at high school ran until nine-thirty. On the way home you bought a roasted sweet potato and held it to keep your hands warm.', minAge: 16, maxAge: 18, cond: (g) => !working(g) },
    { t: 'You taped a countdown to the corner of your desk, and the number got smaller every day.', minAge: 16, maxAge: 18, cond: (g) => !working(g) },
    { t: 'Nothing much happened this year. You learned to make red-braised pork.', minAge: 18 },
    { t: 'You fell asleep on the subway and went three stops too far.', minAge: 16, cond: (g) => tier(g) <= 3 },
    { t: 'You got a new phone and moved the photos over from the old one, one by one.', minAge: 18 },
    { t: 'In a late-night convenience store you ate a bowl of oden and thought life was going all right.', minAge: 18 },
    { t: 'You started to care about the numbers on your checkup report.', minAge: 30 },
    { t: 'You caught yourself saying “young people these days.”', minAge: 32 },
    { t: 'After five years eating at the noodle shop downstairs, the owner finally remembered you don’t want cilantro.', minAge: 22 },
    { t: 'You joined a running group, went three times, and stopped.', minAge: 20 },
    { t: 'On your birthday, half the good wishes you got were sent automatically by apps.', minAge: 18 },
    { t: 'You planted a pot of mint on the balcony, and it lived longer than you expected.', minAge: 18 },
    { t: 'You bought your parents a massage chair. They said it was a waste of money and sat in it every day.', minAge: 24, cond: (g) => has(g, 'fa') && has(g, 'mo') && money(g) },
    { t: 'You deleted the contact of someone you hadn’t spoken to in years, then regretted it.', minAge: 18 },
    { t: 'Your hair began to thin, and you didn’t quite dare look at the drain when you washed it.', minAge: 30 },
    { t: 'An old friend got married, and at the wedding you drank too much and sang an old song.', minAge: 22 },
    { t: 'You traveled alone for the first time, got lost in an unfamiliar city, and had a great time.', minAge: 18, maxAge: 35 },
    { t: (g) => 'This year you paid off another stretch of the mortgage. You still owe ' + fmt((Number(g.recall('debt')) || 0) * 1e4) + '.', cond: (g) => g.recall('house') === 'mortgage' && (Number(g.recall('debt')) || 0) > 0 },
    { t: 'On the way home from working late, you saw a beautiful sunset and forgot to take a picture.', minAge: 20, maxAge: 64, cond: working },
    { t: 'You made yourself a spreadsheet for tracking spending and stuck with it for most of a year.', minAge: 20, cond: money },
    { t: 'You learned to say nothing in meetings.', minAge: 24, maxAge: 64, cond: (g) => ['office', 'tech', 'civil', 'sales', 'teacher'].includes(job(g)) },
    { t: 'You found a photo from when you were small and didn’t recognize the person in it.', minAge: 18 },
    { t: 'You stood in the supermarket comparing two soy sauces for a long time, and ended up buying the pricier one.', minAge: 20 },
    { t: 'You quit smoking for a while, then started again.', minAge: 22, sex: '男' },
    { t: 'You started having trouble sleeping, staring at the ceiling at three in the morning, thinking.', minAge: 28 },
    { t: 'A little kid in the elevator called you “Uncle,” and it took you a moment to answer.', minAge: 26, sex: '男' },
    { t: 'A little kid in the elevator called you “Auntie,” and it took you a moment to answer.', minAge: 26, sex: '女' },
    { t: 'You had a meal with a friend of many years and found you had both changed, and also hadn’t changed at all.', minAge: 25 },
    { t: 'You spent a weekend cleaning your place and threw out three big bags of stuff.', minAge: 18 },
    { t: 'On payday you treated yourself to a nicer lunch.', minAge: 18, maxAge: 64, cond: working },
    { t: 'You found a shortcut to work that gave you ten extra minutes of sleep every day.', minAge: 20, maxAge: 64, cond: working },
    { t: 'You learned to cook a home-style dish, and it came out perfectly the first time.', minAge: 18 },
    { t: 'At a secondhand book stall you found a book you had read as a kid, for less than a dollar.', minAge: 18 },
    { t: 'You received a parcel with hometown specialties from a friend you hadn’t been in touch with for a long time.', minAge: 22 },
    { t: 'The flower you’d been growing bloomed for the first time this year.', minAge: 20 },
    { t: 'Your savings grew a little. Looking at the number, you felt a bit more at ease.', minAge: 22, cond: (g) => money(g) && cash(g) >= 50000 },
    { t: 'After living alone for so long, you learned to cook for one, no more and no less.', minAge: 20, cond: (g) => CN.alone(g) },
    { t: 'On the weekend you went to a movie alone, and when it ended, a light rain had just started outside.', minAge: 18, cond: (g) => CN.alone(g) },
    { t: (g) => 'After dinner, you and your ' + spRel(g) + ' went downstairs for a walk, three laps around the complex.', minAge: 22, cond: spOk },
    { t: (g) => 'You got home after a whole day of work, and your ' + spRel(g) + ' had left you a bowl of soup, still hot.', minAge: 22, cond: (g) => spOk(g) && CN.livesWith(g, 'sp') },
    { t: (g) => CN.who(g, 'k1', true) + ' drew a family portrait at kindergarten. In the picture, you were taller than the house.', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 3 && g.ageOf('k1') <= 6 },
    { t: (g) => CN.who(g, 'k1', true) + ' tied a shoelace knot alone for the first time and ran over to show you.', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 4 && g.ageOf('k1') <= 7 },
    { t: (g) => CN.who(g, 'k1', true) + ' is shooting up fast, and the pencil line marking height has moved up another notch.', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 9 && g.ageOf('k1') <= 16 },
    { t: (g) => CN.who(g, 'mo') + ' called, with nothing in particular to say, just to ask if you’d eaten.', minAge: 18, cond: (g) => has(g, 'mo') && !CN.livesWith(g, 'mo') },
    { t: (g) => CN.who(g, 'fa', true) + ' learned to send voice messages on the phone, and sends you the weather forecast every morning.', minAge: 20, cond: (g) => has(g, 'fa') && !CN.livesWith(g, 'fa') },
    { t: 'You got up in the morning and there was already hot congee in the kitchen. Mom said, drink it while it’s hot.', minAge: 18, cond: (g) => CN.livesWith(g, 'mo') },
  ]);
  JY.addFlavor('age:old', [
    { t: 'You woke at five in the morning and couldn’t get back to sleep.', minAge: 60 },
    { t: 'You watched people play chess in the park all afternoon, and couldn’t help butting in with a remark.', minAge: 60 },
    { t: 'You can never remember where you put your reading glasses and spend a long time looking.', minAge: 50 },
    { t: 'You learned to send voice messages, and a single one can run three minutes.', minAge: 58 },
    { t: (g) => 'You set ' + CN.who(g, gks(g)[0]) + '’s photo as your phone wallpaper and show it to everyone you meet.', cond: (g) => gks(g).length > 0 },
    { t: 'At the market you haggled with a vendor for ten minutes and got a few cents off in the end.', minAge: 55 },
    { t: 'You dug out the clothes of your youth. They don’t fit anymore, and you still couldn’t bear to throw them away.', minAge: 50 },
    { t: 'Another old classmate is gone. You sent a candle in the group chat.', minAge: 65 },
    { t: 'You started taking your blood pressure every day and writing the numbers in a little notebook.', minAge: 55 },
    { t: 'You made a new friend in the neighborhood, and the two of you take a walk together every day.', minAge: 60 },
    'You watched an old movie you had seen when you were young, and cried.',
    { t: 'You knitted yourself a scarf. It came out crooked, and you wear it every day anyway.', minAge: 55 },
    { t: 'You learned to chat with the robot at home. Its memory is better than yours.', minAge: 60 },
    { t: 'On rainy days, your legs start to ache.', minAge: 60 },
    { t: (g) => 'For ' + CN.who(g, gks(g)[0]) + ', you told stories about when you were little, and the child thought you were making them up.', cond: (g) => gks(g).length > 0 && g.ageOf(gks(g)[0]) >= 4 },
    { t: 'You put your savings passbook and your will in the same drawer.', minAge: 70 },
    { t: 'You started forgetting things. You’d say something and forget it a moment later.', minAge: 75 },
    { t: 'You sat in the sun on the balcony and fell asleep.', minAge: 65 },
    { t: 'You learned to see a doctor by phone, and the doctor on the screen said you had kept yourself in good shape.', minAge: 60 },
    { t: (g) => 'You and your ' + (g.knows('sp') === 'husband' ? 'late-life partner' : 'late-life partner') + ' had a spat, and half an hour later went out together to buy groceries.', minAge: 55, cond: spOk },
    { t: (g) => 'Your spouse peeled you a tangerine and handed you the segments one by one.', minAge: 62, cond: spOk },
    { t: 'You went to an old classmate’s funeral and said not a word on the way back.', minAge: 65 },
    { t: 'You ate less and less, and the food got blander and blander.', minAge: 75 },
    { t: 'You put the photos of a lifetime into an album and wrote your own name on the title page.', minAge: 65 },
    'In spring, you spent an afternoon downstairs looking at flowers.',
    { t: 'You spoke more and more slowly, but when you told stories of your youth, you didn’t miss a single detail.', minAge: 75 },
    { t: 'Someone asked how old you were, and you had to think a moment before you could say.', minAge: 80 },
    { t: (g) => (gks(g).length ? 'Your grandkids' : 'Your kids') + ' called on video, insisting on showing you a newly grown tooth.', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 1 && g.ageOf(id) <= 7) },
    { t: (g) => 'For ' + CN.who(g, kids(g)[0], true) + ', you made a video call, saw the light on over there, and stopped worrying.', minAge: 55, cond: (g) => kids(g).length > 0 && !CN.livesWith(g, kids(g)[0]) && g.ageOf(kids(g)[0]) >= 20 },
    { t: 'The owner of the breakfast shop downstairs knows what you like: soy milk with little sugar, and a crispy fried dough stick.', minAge: 55 },
    { t: 'You signed up for a calligraphy class at the senior university. Your deskmate was an eighty-year-old woman whose handwriting was better than yours.', minAge: 62, maxAge: 85 },
    { t: 'On nice days, a few old neighbors carry little stools downstairs and sit chatting all morning.', minAge: 62 },
    { t: 'Even eating alone, you set out a bowl and chopsticks, stir-fry a dish and simmer a soup.', minAge: 60, cond: (g) => CN.alone(g) },
    { t: (g) => CN.who(g, kids(g)[0]) + ' sent a box of fruit, saying it was a specialty from where they live. You shared half with the neighbors.', minAge: 60, cond: (g) => kids(g).length > 0 && !CN.livesWith(g, kids(g)[0]) },
  ]);

  /* 地点 */
  JY.addFlavor('loc:village_n', [
    'The corn harvest was in, and the yard was heaped with a little golden mountain.',
    'The loudspeaker at the village entrance announced that the power would be cut tomorrow.',
    { t: 'In winter the kang (heated brick bed) burned hot, and the whole family squeezed onto it to watch TV.', cond: (g) => !CN.alone(g) },
    'The wheat turned yellow, and a combine harvester could finish a whole village in a day.',
    'On the red-brick house walls, slogans painted decades ago were still there, too faded to read.',
    'Most of the village’s young people had left. They came back only at New Year, driving cars of all sorts of brands.',
    { t: 'The jujube tree in the yard bore fruit. You climbed up to pick some and got scolded down by Grandma.', minAge: 6, maxAge: 13, cond: (g) => has(g, 'gm') },
    'The evening wind smelled of burning straw.',
    'In the village square at night, people did square dancing, with music playing until nine.',
    'When a family had a wedding, the banquet ran from noon to dark, and half the village came to help.',
    { t: 'You bought a popsicle at the village shop, and the owner’s wife threw in a candy.', minAge: 4, maxAge: 14 },
  ]);
  JY.addFlavor('loc:village_s', [
    'The tea on the mountain was ready to pick, and people climbed up before dawn.',
    'In the plum rain season, moss grew in the corners of the walls, and laundry took a week to dry.',
    'The village ancestral hall was renovated, and everyone who worked away donated money.',
    'The frogs in the rice paddies croaked all night.',
    'The path behind the bamboo grove was too slippery to stand on in the rain.',
    'The old house had been empty for years, and the couplets on the door had faded to white.',
    'On market day the town was packed with people selling everything.',
    'At the Dragon Boat Festival, dragon boats raced on the river, and the drums could be heard across several mountains.',
    'The mist on the mountain did not clear until noon.',
    { t: 'You went to the stream with the grown-ups to wash vegetables, your feet in the water so cold you kept flinching.', minAge: 4, maxAge: 14 },
    'When a family slaughtered the new-year pig, they invited half the village to eat.',
  ]);
  JY.addFlavor('loc:village_w', [
    'When the wind and sand were heavy, the sky turned yellow, and you had to cover your face to go out.',
    'The flock came down from the hillside, raising dust all the way.',
    'At night there were so many stars it was almost frightening.',
    'Mud-brick houses in the village were fewer each year, and the newly built brick houses had white-painted walls.',
    'The sun was fierce at noon and the cold came as soon as the afternoon passed, so you could go through four seasons in a day.',
    'The distant snow mountain was white all year round.',
    'Solar panels covered a big stretch of the village, glittering in the sun.',
    { t: 'The water you drank was piped in from far away. When it came out of the tap, Grandma would still say a word of thanks.', cond: (g) => has(g, 'gm') },
    'In autumn, golden corn and red chili peppers dried on every family’s roof.',
  ]);
  JY.addFlavor('loc:county', [
    { t: 'Another bubble tea shop opened on the county town’s main street, with a line out the door.', minAge: 3 },
    { t: 'The county town is small. Walking down the street, three in ten people you meet know you.', minAge: 10 },
    'The stationery shop outside No. 1 County High School has been open thirty years.',
    'At night in the square, dancers, stall vendors and parents walking toddlers all squeezed together.',
    'The county built a new park with a lake and walking paths, busy on weekends.',
    { t: 'The breakfast shop below the building still sells soy milk at about twenty cents a bowl.', minAge: 3 },
    'Homes in the county town aren’t expensive, but there are fewer and fewer young people.',
    'At New Year, traffic in the county town jams like a provincial capital.',
    'The county hospital built a new inpatient building, twice as tall as the old one.',
    { t: 'At night in the county town, the streets empty out after nine, and only the barbecue stalls are still lit.', minAge: 3 },
    'Relatives all lived close by, and when one family stewed meat, half the street knew.',
  ]);
  JY.addFlavor('loc:city', [
    'The city’s buses have been replaced with electric ones that run without a sound.',
    'Half the lanes in the old town have been torn down, and the other half have become influencer hot spots.',
    'At the mall on weekends there are more people than goods.',
    'In rush hour it takes three red lights to cross one intersection.',
    'A community canteen opened at the entrance of the neighborhood, with very cheap meals.',
    'The riverside walking path was finished, and many people stroll there in the evening.',
    'Housing prices in the city haven’t moved much in recent years, and everyone is waiting.',
    'The summer night market stays open until after midnight.',
    { t: 'After living in this city for so long, you started to tell the neighborhoods apart by their smells.', minAge: 12 },
    'The osmanthus in the neighborhood bloomed, and the whole building smelled sweet.',
  ]);
  JY.addFlavor('loc:metro', [
    { t: 'On the morning subway, your face was pressed against someone’s backpack.', minAge: 6, maxAge: 70 },
    'In the office towers, most of the lights were still on in the middle of the night.',
    { t: 'You have lived in this city for a long time and still can’t say your next-door neighbor’s name.', minAge: 12 },
    'On weekends the park is full of people walking dogs and people with kids.',
    'Delivery riders lined up downstairs waiting for the elevator.',
    { t: 'You watched the traffic from a footbridge for a while, like a glowing river.', minAge: 6 },
    { t: 'The rent went up again. You worked it out: a third of a month’s pay goes to the landlord.', minAge: 22, maxAge: 60, cond: (g) => g.recall('house') === 'rent' && working(g) },
    { t: 'At two in the morning, there were still people running in the street.', maxAge: 84 },
    'Driverless taxis waited by the roadside for customers, with nobody inside.',
    'It doesn’t snow in this city in winter, but the wind is cold.',
    'On weekends, lines form at the art museum, and many in line are with kids.',
    { t: 'On a street corner you found a little noodle shop that has been open twenty years, and from then on you had your own “canteen.”', minAge: 18 },
  ]);
  JY.addFlavor('loc:school', [
    'During the ten-minute break between classes, the corridor was full of people running around.',
    'At the flag-raising ceremony, you yawned in line and the homeroom teacher saw it.',
    'On the blackboard at the back of the classroom, this issue’s theme was “My Hometown.”',
    'The power went out during evening study, and the whole class cheered.',
    'You found an unsigned note in your desk drawer.',
    'The math teacher borrowed the PE class.',
    'The scrambled eggs with tomato in the school canteen is the dish everybody agrees is best.',
    'The day before final exams, the classroom was so quiet you could only hear pages turning.',
    'On the spring outing, your bag was full of snacks and not a single book.',
  ]);
  JY.addFlavor('loc:campus', [
    'People saving seats at the library lined up at seven in the morning.',
    'Lights out at eleven in the dorm, and you chatted in the dark until two.',
    'You ate the spicy hot pot at the canteen’s third floor for four years.',
    'You picked an easy elective, got hooked on it, and went to every class.',
    'At club recruitment, the playground was full of booths.',
    'In finals week, every table in the library had someone asleep on it.',
    'There were more cats than students on campus, and every one had a name.',
    'In the summer before graduation, everywhere you looked people were taking photos.',
    'On a rainy day, your roommate brought a spare umbrella and waited for you at the door of the classroom building.',
  ]);
  JY.addFlavor('loc:factory', [
    { t: 'The assembly line never stopped, and you could do your task with your eyes closed.', maxAge: 70 },
    'More and more machines in the workshop, fewer and fewer people.',
    { t: 'Coming off the night shift, it was just getting light, and the bun shop at the factory gate was opening.', maxAge: 70 },
    { t: 'Eight people in the dorm, from five provinces, each with a different accent.', maxAge: 50 },
    'On payday, the little restaurants outside the factory gate did great business.',
    'On lunch break the workers scrolled through short videos, laughter rising here and there.',
    { t: 'A layer of calluses had formed on your hands that wouldn’t wash off.', maxAge: 70 },
    'The shop-floor supervisor said new equipment was coming next month, and half of them would have to learn something new.',
    { t: 'On a coworker’s birthday, everyone chipped in for a cake and shared it outside the workshop door.', maxAge: 70 },
  ]);
  JY.addFlavor('loc:office', [
    { t: 'The pothos on your desk has died for the third time.', maxAge: 70 },
    'In the break room, everyone was talking about who was going to quit.',
    { t: 'You sat through a three-hour meeting in the conference room, and nothing was decided.', maxAge: 70 },
    'At three in the afternoon, the whole floor orders bubble tea.',
    { t: 'You gave the AI assistant a task and it did better than you expected, which left you with mixed feelings.', maxAge: 70 },
    { t: 'You met the boss in the elevator and chatted for twenty seconds about the weather.', maxAge: 70 },
    { t: 'It took three days to write the year-end summary, and the last line was “keep working hard.”', maxAge: 70 },
    { t: 'The photo on your work badge is still the one taken when you joined.', maxAge: 70 },
    { t: 'A coworker brought back a box of local specialties from home and passed them around every desk.', maxAge: 70 },
  ]);
  JY.addFlavor('loc:hospital', [
    'On the benches in the hospital corridor sat people waiting for their numbers to be called.',
    'Outside the ward window was a tree, its leaves turning yellow one by one.',
    'A new batch of young nurses had come in, all of them gentle when they spoke.',
    'The flower shop at the hospital entrance always does good business.',
    'The smell of disinfectant stayed on your clothes for days.',
    'The old man in the same ward had visitors every day, and you watched them talk.',
    'The ward was quiet at night, with only the occasional beep of a machine.',
    'A robot pushed a medicine cart down the corridor and said, “Excuse me.”',
    'On the day the person in the next bed was discharged, they left you a bag of tangerines they hadn’t finished.',
  ]);
  JY.addFlavor('loc:home', [
    'The parcel lockers downstairs were full again.',
    'Every evening there was a line at the electric scooter chargers downstairs.',
    'The neighbor’s kid was practicing piano, playing the same piece for a month.',
    'In the neighborhood owners’ group chat, they argued all night about parking spaces.',
    { t: 'You were hanging laundry on the balcony and saw someone in the building across hanging laundry too.', minAge: 10 },
    'The old man downstairs sat on the bench every afternoon, waiting for his grandson to come out of school.',
    { t: 'The courier knew you and could tell what floor you lived on without looking at the label.', minAge: 18 },
    'At dusk, the smells of different families cooking drifted out of the kitchens.',
    { t: 'The neighbors made dumplings and brought over a plate, saying eat them while they’re hot.', minAge: 3 },
  ]);
  JY.addFlavor('loc:coast', [
    'The sea breeze was salty, and clothes smelled damp even after drying.',
    'At low tide, the mudflats were full of people gathering shellfish.',
    'The fishing boats came back to port, and the dock rang with shouting.',
    'At dusk by the sea, someone was flying a kite.',
    'After the typhoon, lots of shells washed up on the beach.',
    { t: 'You bought a plate of stir-fried clams by the sea and ate it sitting on the rocks.', minAge: 6 },
    'The lighthouse out at sea flashed once every few seconds.',
    'At the beach in summer, it was people shoulder to shoulder.',
  ]);
  JY.addFlavor('loc:road', [
    'The highway service area was full of people on the road.',
    'Scenery slid backward past the car window, and you fell asleep in the car.',
    'A long line at the toll plaza, and New Year traffic stretching out of sight.',
    { t: 'You ate an overpriced bowl of instant noodles at a service area and thought it tasted especially good.', minAge: 6 },
    'The mountains by the road got taller and the signal got weaker.',
    'An old song played in the car and you hummed along the whole way.',
    'It got dark, and the cars ahead formed a line of lights.',
    { t: 'You stopped in a little town you’d never heard of and bought a bag of local specialties.', minAge: 16 },
  ]);

  /* 年度重心 */
  JY.addFlavor('focus:用功读书', [
    'Your wrong-answer notebook filled up, and you started another.',
    'You did your homework under the desk lamp until your eyes ached.',
    { t: 'You memorized vocabulary until midnight and spelled words in your dreams.', minAge: 10 },
    { t: (g) => 'You made the top fifty in your grade, and ' + (has(g, 'mo') ? 'Mom' : 'your family') + ' was so pleased that two extra dishes got cooked.', minAge: 10 },
    'You thought about one hard problem for three days, and when it finally clicked, you slapped the desk in excitement.',
    'Your notes were borrowed by classmates and photocopied again and again.',
  ]);
  JY.addFlavor('focus:贪玩', [
    'You played by the river with friends all afternoon, and your shoes got soaked.',
    { t: 'You saved up for a new game and played it the whole weekend.', minAge: 9 },
    'You made a group of new friends in the neighborhood, and met up to play after school every day.',
    { t: 'You sneaked out to see a movie and lied about it when you got home.', minAge: 11 },
    { t: 'You learned to play basketball and got a shade darker from the sun.', minAge: 8 },
    'You didn’t finish your homework and were made to stand for a whole class.',
  ]);
  JY.addFlavor('focus:帮家里干活', [
    { t: 'You minded the shop for your family, learned to do the accounts, and learned to haggle.', cond: (g) => g.recall('family') === 'smallbiz' },
    { t: 'After school you went home and fed the chickens first, then did your homework.', cond: (g) => g.recall('hukou') === 'rural' },
    { t: (g) => 'You helped ' + (has(g, 'mo') && CN.livesWith(g, 'mo') ? 'Mom' : 'the family') + ' cook. The first dish you stir-fried was so salty it was inedible, and the grown-ups ate every bite.' },
    { t: 'At harvest time you worked in the fields all day, and by evening you couldn’t lift your hands.', cond: (g) => g.recall('hukou') !== 'city' },
    'You could now wash the whole family’s laundry.',
    { t: (g) => 'You took care of ' + CN.who(g, 'gm') + ', who was sick, feeding her her medicine more carefully than the grown-ups did.', cond: (g) => has(g, 'gm') },
    'You mopped the floor until it shone. When the grown-ups got home and praised it, you were happy all evening.',
  ]);
  JY.addFlavor('focus:学个特长', [
    'You practiced piano until your fingers grew calluses.',
    'Your painting was hung in the school corridor.',
    'After a year of calligraphy, your characters finally stopped slanting.',
    { t: 'You entered a programming contest and won third prize.', minAge: 9 },
    'You learned to swim, going from afraid of water to swimming a thousand meters.',
    'You danced until you sprained your ankle, rested two weeks, and went back.',
  ]);
  JY.addFlavor('focus:埋头工作', [
    { t: 'You worked overtime for a whole month, and on weekends all you wanted was sleep.', maxAge: 65 },
    { t: 'Your project shipped, and the team had hot pot together.', maxAge: 70 },
    { t: 'You were named excellent employee in the year-end review. The bonus was small, but you felt full.', maxAge: 70 },
    { t: 'You started losing sleep, your head full of unfinished work.', minAge: 22, maxAge: 70 },
    { t: 'You trained a new hire, and the questions they asked reminded you of yourself when you first started out.', minAge: 25, maxAge: 70 },
    { t: 'You got promoted and moved to a slightly bigger desk.', minAge: 24, maxAge: 60, cond: (g) => ['office', 'tech', 'civil', 'sales', 'teacher', 'doctor', 'nurse'].includes(job(g)) },
    { t: 'You did your work fast and well. The old master nodded and said nothing.', maxAge: 60, cond: (g) => ['worker', 'farmer', 'rider', 'driver', 'shop'].includes(job(g)) },
    { t: 'You didn’t take a single day off this year. At the year-end tally, you had saved a little more.', minAge: 18, maxAge: 70 },
  ]);
  JY.addFlavor('focus:学习充电', [
    { t: 'You signed up for an evening class, two nights a week.', maxAge: 70 },
    { t: 'You passed a certification exam and hung the certificate on the wall.', maxAge: 70 },
    'You started learning a foreign language, memorizing twenty words every morning.',
    'You finished a very thick book and wrote the date on the last page.',
    { t: 'You learned a new technology with the help of AI, used it at work for the first time, and it worked very well.', maxAge: 70, cond: working },
    { t: 'At the senior university you learned to edit videos on a computer and made one for your own birthday.', minAge: 60 },
  ]);
  JY.addFlavor('focus:搞副业', [
    { t: 'After work you took a little side job and stayed up until midnight to hand it in.', maxAge: 70 },
    { t: 'Your side hustle earned a little money, and you bought yourself something you had wanted for a long time.', maxAge: 75 },
    { t: 'Your side hustle lost a bit of money, and you told yourself it was tuition.', maxAge: 75 },
    { t: 'On weekends you shot wedding videos for people, and were so tired you couldn’t straighten your back.', maxAge: 60 },
    { t: 'You opened an online shop, and the first order was from your mom.', maxAge: 70, cond: (g) => has(g, 'mo') },
    { t: 'You opened an online shop, and the first order came from an old classmate, who left a five-star review.', maxAge: 70, cond: (g) => !has(g, 'mo') },
  ]);
  JY.addFlavor('focus:陪伴家人', [
    { t: 'You took your parents on a trip to a place they had been to when they were young.', maxAge: 75, cond: (g) => has(g, 'fa') && has(g, 'mo') },
    { t: (g) => 'Every weekend you went home for dinner, and ' + CN.who(g, 'mo') + ' cooked a whole table of dishes every time.', maxAge: 70, cond: (g) => has(g, 'mo') && !CN.livesWith(g, 'mo') },
    { t: 'You and the family made dumplings together, and they came out in all sorts of strange shapes.', cond: (g) => !CN.alone(g) },
    { t: (g) => 'You hung out with ' + CN.who(g, 'k1', true) + ', building blocks all afternoon and listening to ' + ta(g, 'k1') + ' tell a story with no ending.', cond: (g) => has(g, 'k1') && g.ageOf('k1') >= 3 && g.ageOf('k1') <= 10 },
    { t: (g) => 'For ' + CN.who(g, 'fa', true) + ', you bought a new phone and spent an afternoon teaching him how to use it.', cond: (g) => has(g, 'fa') },
    { t: 'The whole family went on a picnic in the countryside and spent the day in the sun.', cond: (g) => !CN.alone(g) },
    { t: 'You had a very long phone call home and told them everything that had happened that year.', cond: (g) => CN.alone(g) && (parentsAlive(g) || kids(g).length > 0 || has(g, 'sib0')) },
    'You dug out old photos and posted them one by one in the family group chat, which was lively all evening.',
    { t: (g) => 'You hung out with ' + CN.who(g, olderSib(g) || 'sib0', true) + ', drinking tea all evening and talking about fighting over the remote as kids, laughing so hard you pounded the table.', minAge: 25, cond: (g) => has(g, 'sib0') },
  ]);
  JY.addFlavor('focus:锻炼身体', [
    { t: 'Every morning you ran five kilometers, and afterward felt completely awake.', maxAge: 70 },
    { t: 'You bought a gym membership, and this time you actually stuck with it.', maxAge: 75 },
    { t: 'You learned to swim and went twice a week.', maxAge: 80 },
    { t: 'You quit midnight snacks and lost about five pounds.', maxAge: 70 },
    { t: 'You climbed a mountain and watched a sunrise from the top.', maxAge: 75 },
    'At the checkup, the doctor said all your numbers looked good.',
    { t: 'Every morning in the park you did a round of tai chi and felt warm all over afterward.', minAge: 50 },
    { t: 'After every meal you walked slowly twice around the complex, and the neighbors all knew you.', minAge: 60 },
  ]);
  JY.addFlavor('focus:躺平休息', [
    'You lay at home all weekend and finished a very long series.',
    { t: 'You turned off the work group chat notifications, and the world suddenly went quiet.', maxAge: 70, cond: working },
    'You slept until noon, with sunlight on the quilt.',
    'You did nothing at all, just sat on the balcony drinking tea.',
    'You found that days of doing nothing were pretty good too.',
  ]);
  JY.addFlavor('focus:出去走走', [
    'You went to a city you had never been to and ate the local snacks that residents recommended.',
    'You stayed a few days in an old town, sleeping until you woke naturally every day.',
    { t: 'You went up a snow mountain alone and had altitude sickness before even reaching the foot.', maxAge: 65 },
    'You met someone on a train and talked the whole way.',
    'You went to see the sea and sat on the beach until dark.',
    'You lost a bag on the trip, and a kind stranger sent it back.',
    { t: 'You joined a seniors’ tour group to the south. The youngest in the group was sixty-five, the oldest eighty-two.', minAge: 62 },
  ]);
  JY.addFlavor('focus:含饴弄孙', [
    { t: (g) => 'Every day you took ' + CN.who(g, gks(g)[0]) + ' to and from school, chatting with the other old folks at the school gate.', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) <= 12) },
    { t: (g) => CN.who(g, gks(g)[0]) + ' learned to call out to you, and you were happy for days.', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 1 && g.ageOf(id) <= 2) },
    { t: 'You told stories to your grandchildren, and halfway through you were the one who fell asleep.', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 2 && g.ageOf(id) <= 9) },
    { t: 'The grandchildren were naughty and hid your reading glasses. You looked for them all afternoon.', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 3 && g.ageOf(id) <= 10) },
    { t: 'You taught your grandchild xiangqi (Chinese chess), and when the child beat you for the first time, fair and square, you hadn’t let them.', cond: (g) => gks(g).some((id) => g.ageOf(id) >= 6) },
    { t: 'You didn’t have grandchildren yet. You often went to the neighborhood center and helped neighbors’ kids with their homework.', cond: (g) => !gks(g).length },
    { t: 'The grandchildren grew up and no longer needed you to look after them. You washed their old toys and put them in the cupboard.', cond: (g) => gks(g).length > 0 && gks(g).every((id) => g.ageOf(id) >= 13) },
  ]);

  /* 地区、省份、城市等级：默认六岁以后才有（小孩子不吃火锅、不说方言） */
  const wrap = (test) => (x) => {
    const o = typeof x === 'string' ? { t: x } : Object.assign({}, x);
    const c = o.cond;
    return Object.assign({ minAge: 6 }, o, { cond: (g) => test(g) && (!c || c(g)) });
  };
  const RG = (r, list) => list.map(wrap((g) => g.recall('region') === r));
  const PV = (ps, list) => list.map(wrap((g) => ps.includes(g.recall('prov'))));
  const TIER = (ts, list) => list.map(wrap((g) => ts.includes(tier(g))));
  JY.addFlavor('any', [].concat(
    RG('东北', ['Winter heating was strong, so you could wear short sleeves indoors, while frost flowers grew on the windows.', { t: 'You slid on the ice and fell flat on your back.', maxAge: 50 }, 'At the New Year table there is always a dish of pickled cabbage stewed with glass noodles.', 'Winter in the northeast, and it gets dark by four in the afternoon.', 'You sound more like your dad every day, with three “gaha”s (Northeastern for “what are you up to”) in a single sentence.', 'The old lady selling frozen pears at the neighborhood gate only sets up her stall for the winter months.', 'You learned to wear long underwear, and once you started you wore it for half the year.', 'At the barbecue stall, the skewer sticks piled up into a little mountain.', 'On summer evenings, when the cool breeze came, the whole city was out eating barbecue.', 'In your family’s old house, the radiators had been painted with silver paint layer after layer.', 'When the snow melted, the roads were all mud.', { t: 'You soaked in the bathhouse with friends all afternoon, then went out for a bowl of cold noodles.', minAge: 14 }, 'At the morning market, an old lady pressed a bag of sticky bean buns into your hands, saying she had steamed them herself.', 'In winter the balcony is the fridge, with frozen dumplings, frozen pears and frozen persimmons lined up in a row.', 'When you put up the New Year couplets, the paste froze on the door.']),
    RG('华北', ['Winter smog is much less than when you were small, and there are more and more blue skies.', 'In spring the willow catkins drift everywhere, and you kept sneezing.', 'Dumplings are the staple all year round: you make them at New Year, at the winter solstice, and when guests come.', 'In summer watermelon is about fifteen cents a pound, and you could eat half of one by yourself.', 'Autumn in the north is short, and in a blink the leaves have all fallen.', { t: 'You learned to make baozi (steamed buns), and your pleats were prettier than your mom’s.', minAge: 12 }, 'At the New Year temple fair, the crowd was so thick you couldn’t walk.', 'You ate a bowl of zhajiangmian (noodles with fried bean sauce), with seven or eight kinds of toppings.', 'When the wind was strong, you had to squint to walk outside.', 'On the day the heating came on, the whole building breathed a sigh of relief.', 'In autumn, persimmons hang on the bare trees, red as lanterns.']),
    PV(['Beijing'], ['At the breakfast shops, lines formed at the stalls selling douzhi (fermented mung bean drink) and jiaoquan (fried rings).', 'In the hutongs at night, some people played chess and some cooled off in the breeze.', 'The old people in your family go to the park every morning to walk their birds.']),
    PV(['Tianjin'], ['For breakfast, a jianbing guozi (savory crepe), with an extra crispy cracker.', 'Tianjin people talk like they have a punchline ready. Even buying vegetables sounds like listening to crosstalk.']),
    PV(['Shanxi'], ['Shanxi people feel uneasy if they go a meal without noodles. Knife-cut noodles, cat-ear noodles, and chopped-sprout noodles: they switch it up.', 'Vinegar is always on every table.']),
    PV(['Inner Mongolia'], ['On the grasslands in summer, the sky is bright blue, and the flocks of sheep look like white clouds scattered over the slopes.', 'A bowl of milk tea with a plate of hand-held mutton is the proper way to treat guests.']),
    RG('华东', ['In the plum rain season, mold spots grew in the corners of your home’s walls, and the clothes never dried.', 'In spring in Jiangnan (south of the Yangtze), there are rapeseed flowers everywhere.', 'In summer afternoons, thunderstorms come out of nowhere.', 'At New Year there is always a fish on the table, a wish for abundance every year.', 'After the rainy season ends, you take the quilts out to dry in the sun, and they come back smelling of sunshine.', 'Qingtuan (green rice dumplings) came into season, and you ate three in one go.']),
    PV(['Shanghai', 'Jiangsu', 'Zhejiang'], ['At breakfast, the soup in the xiaolongbao (soup dumpling) burned your tongue.', 'The old woman downstairs spoke soft, sticky Wu dialect, and it took you a long time to understand.', 'In the alley, old people fanned themselves and cooled off at their doors.']),
    PV(['Shanghai'], ['You ate shengjian (pan-fried buns), with a bowl of curry beef soup.']),
    PV(['Zhejiang'], ['You walked along West Lake for an afternoon and saw lots of people taking wedding photos.']),
    PV(['Jiangsu'], ['In autumn you eat hairy crab, and the family can spend a whole afternoon cracking them.', 'A bowl of duck blood vermicelli soup costs about a dollar and warms you down to your stomach.']),
    PV(['Shandong'], ['At a Shandong dinner table, who takes the seat of honor takes three rounds of polite refusing.', 'Scallions dipped in bean paste, and a flatbread to wrap everything in.', 'When visiting relatives at New Year, you kowtow as soon as you step in the door, and the New Year greetings go on all day.']),
    PV(['Fujian'], ['The grown-ups drink tea from tiny cups, one brew lasting all afternoon.', 'A bowl of shacha noodles, the broth so rich it could melt.']),
    PV(['Anhui', 'Jiangxi'], ['A bowl of rice noodles in the morning, with chili poured on top, and you have energy for the whole day.', 'The old Huizhou-style houses in the mountains, with white walls and black tiles, look like a painting in the rain.']),
    RG('华中', ['Summer is hot as a steamer, and your family’s air conditioner runs from May to October.', 'At New Year, every family is smoking cured meat and stuffing sausages.', 'You ate a plate of crayfish and broke into a sweat from the spice.', 'No heating in winter, and the cold bites to the bone, so you wear a down jacket even at home.', 'When the rapeseed flowers bloom, the fields turn all golden.', 'At the Dragon Boat Festival, you eat zongzi, watch dragon boats, and the streets are lively.', 'You learned to say a few phrases in the local dialect, and the moment you opened your mouth the locals knew you were an outsider.']),
    PV(['Hubei'], ['In the morning, a bowl of hot-dry noodles, the sesame paste stirred in evenly.', 'The night view along the Yangtze is beautiful, and the ferries are full of people looking at the lights.']),
    PV(['Hunan'], ['Along the Xiang River, someone is winter swimming.', 'The rice noodle shop by your door has been open twenty years.', 'At a stall downstairs you ate a bowl of stinky tofu: it smells bad and tastes great.']),
    PV(['Henan'], ['A bowl of huimian (wide braised noodles), the noodles as wide as belts.', 'Spicy hu la soup with fried dough sticks is your family’s breakfast.', 'When Henan people talk, one “zhong” (OK) says it all.']),
    RG('华南', ['During the damp spell of spring, there are water beads on the walls and floors, and clothes are always damp.', 'You can wear short sleeves all four seasons, and winter is only cold for a few days.', 'On typhoon days, school is canceled, and you stayed home the whole day.', 'The banyan tree downstairs has aerial roots hanging long like an old man’s beard.', 'In summer the cockroaches can fly, and you jumped on the bed in fright.', 'Rain starts and stops without warning, and when the sun comes out, white steam rises from the ground.']),
    PV(['Guangdong'], ['In the morning you go for morning tea: one pot, two dim sum, sitting there the whole morning.', 'You learned to say “m goi” (thanks) and “dak haan yam cha” (let’s have tea when we’re free).', 'The dessert-soup shop on the street stays open until two in the morning.', 'At the New Year flower market, there’s a sea of people, and you bought a potted kumquat tree home.', 'You ate a plate of rice noodle rolls with a cup of herbal tea so bitter you frowned.']),
    PV(['Guangxi'], ['A bowl of luosifen (river snail rice noodles), and the whole floor knows what you’re eating.', 'On the Third of March festival, people sang folk songs back and forth on the street, and you hummed along.']),
    PV(['Hainan'], ['Coconuts fall by the roadside, and nobody picks them up.', 'The sun in Hainan is fierce, and you’ll never get any paler.', 'You ate a seafood meal by the sea, half the price of inland.']),
    RG('西南', ['On market day, the town had more people than at New Year.', 'The rainy season came, and once it started, it rained for half a month.', 'At New Year, the family cures meat and stuffs sausages, hanging them all over the balcony.', 'The mountain road twisted and turned, and the car ride made people dizzy.']),
    PV(['Sichuan', 'Chongqing'], [{ t: 'You ate in the hot pot place until late at night, and your clothes smelled of beef tallow.', minAge: 12 }, 'In the teahouse in the afternoon, the old folks were playing mahjong, one game lasting all afternoon.', 'You learned to say “bashi” (great), and called every good thing “bashi de ban.”']),
    PV(['Chongqing'], ['The roads in the mountain city go up and down, and even the navigation gets lost.', 'When the fog was thick, you couldn’t see the building across the street.', { t: 'You ate a bowl of hot-and-sour noodles, and your lips went numb from the spice.', minAge: 10 }]),
    PV(['Guizhou', 'Sichuan', 'Yunnan'], ['You learned to eat zheergen (fish mint root). At first it seemed strange, then you couldn’t do without it.']),
    PV(['Yunnan'], ['The rice noodle shop below your building: a bowl of noodles with three small side dishes.', { t: 'You cycled to the lake, and the wind felt lovely.', maxAge: 75 }, 'In the rainy season, wild mushrooms came to market, every family was frying them, and the grown-ups said they must be cooked through.']),
    PV(['Guizhou'], ['A bowl of sour soup fish, so sour you squinted, and you still couldn’t help having another bowl.']),
    PV(['Tibet'], ['Once you’re used to butter tea, you miss it terribly when you’re away.', 'An old pilgrim walked past you, muttering prayers.', 'The sun is close, the sky very blue, and your face got two red patches.']),
    RG('西北', ['When the wind and sand blew hard, your mouth was full of sand.', 'At the night market in the evening, the smell of grilled meat drifted for several streets.', 'The winter wind cuts like a knife, and you have to bundle up tightly to go out.', 'On your windowsill there is always a row of wind-dried chili peppers.', 'The sky is high and the clouds low, as if you could reach out and touch them.', 'At New Year, the family deep-fried a big pot of flatbread.']),
    PV(['Gansu', 'Qinghai', 'Ningxia'], ['A morning bowl of beef noodles: clear broth, white radish, red chili oil, green cilantro.', 'You learned to sing a hua’er (folk song), pitched so high you couldn’t reach it.']),
    PV(['Shaanxi'], ['You ate a bowl of yangrou paomo (lamb and bread soup), where the smaller you tear the bread, the better it tastes.', 'You ate a bowl of liangpi (cold skin noodles) with a roujiamo (meat sandwich).', 'A bowl of oil-splashed noodles: pour the hot oil over the chili, it sizzles, and the whole room smells wonderful.']),
    PV(['Xinjiang'], ['Summer fruit is especially sweet, and you ate half a Hami melon by yourself.', 'In autumn the poplar forest is yellow as if on fire.', 'At ten at night it is still light, and the grown-ups eat and chat under the grape trellis.']),
    TIER([1], [{ t: 'On the weekend you went to see an exhibition, waited in line an hour and saw it for twenty minutes.', minAge: 10 }, 'The convenience store downstairs has its lights on twenty-four hours.', { t: 'Changing subway lines means a ten-minute walk, and you walk faster than anyone.', minAge: 18, maxAge: 70 }]),
    TIER([2, 3], ['A new library opened in the city, and on weekends you have to fight for seats.', 'The light show on the river draws a crowd every weekend.']),
    TIER([4], ['The county town’s produce market is liveliest in the morning, and most of the sellers are from nearby villages.', 'Weddings in the county town run three days with the banquet, and invitations go out to half the street.']),
    TIER([5], ['The village shop can handle parcels now too.', 'At dusk, whichever family’s chimney smokes first is the first to sit down to eat.', 'The village built a concrete road, and the streetlights stay lit all the way to the end of the village.']),
    [
      { t: 'Someone on the subway recognized you as the one who helped back then. You waved a hand and said it wasn’t you.', cond: (g) => g.f('evSavedLife') },
      { t: 'The mother of the lost child sends you a New Year greeting every year.', cond: (g) => g.f('evFoundKid') },
      { t: 'A box of this year’s new fruit arrived from home, with the village’s brand printed on the box.', cond: (g) => g.f('evVillageShop') },
      { t: 'On the wall of the neighborhood activity room, you saw a photo of yourself from your volunteer days.', cond: (g) => g.f('evVolunteer') },
      { t: 'You walked past that intersection, where a new camera had been installed beside the traffic light. You remembered the accident.', cond: (g) => g.f('evWitness') },
      // 温暖的日常，不分地区
      { t: 'After a rain, a rainbow hung on the horizon, and lots of people on the road stopped to take photos.', minAge: 3 },
      { t: 'The first snow of winter came down, and you stood at the window watching for a long time.', minAge: 3, cond: (g) => !['华南'].includes(g.recall('region')) },
      { t: 'A new bakery opened downstairs, with discounts in the evening, and you bought a bag.', minAge: 10 },
      { t: 'The breakfast stall by the road gave you an extra fried dough stick, saying business was good today.', minAge: 8 },
      { t: 'This summer you took a long nap on a bamboo mat, and when you woke, cicadas were calling outside the window.', minAge: 4 },
      { t: 'You watched an old movie with your family and laughed until you rolled.', minAge: 6, cond: (g) => !CN.alone(g) },
      { t: 'On Mid-Autumn night the moon was very round. You ate half a mooncake and saved the other half for the next day.', minAge: 4 },
      { t: 'At New Year’s Eve vigil, at midnight, the fireworks outside all lit up at once.', minAge: 4 },
    ],
  ));
})();
