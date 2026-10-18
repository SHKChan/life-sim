/* 群侠 · 对手
 * hp、atk、def、agi：气血、攻击、防御、身法。moves：[[招式名, 倍数, 特效]]，特效同武功的 sp。
 * xp：赢了给多少历练；silver：[少, 多] 两银子；drops：[[物品, 几率]]。
 * scale：带这个数的对手会按玩家强弱伸缩（路上的强盗跟着你一起变强）。 */
(function () {
  'use strict';
  const QX = window.QX;
  QX.addEnemies({
    dipi: { name: '地痞', hp: 45, atk: 10, def: 2, agi: 8, moves: [['乱拳', 1], ['抄板凳', 1.2]], xp: 6, silver: [2, 8], scale: 22 },
    shanzei: { name: '山贼', hp: 60, atk: 13, def: 3, agi: 10, moves: [['砍刀', 1], ['横扫', 1.15]], xp: 9, silver: [4, 12], scale: 26, drops: [['jinchuang', 0.15]] },
    zeitou: { name: '山贼头目', hp: 120, atk: 18, def: 6, agi: 12, moves: [['鬼头刀', 1.1], ['力劈华山', 1.3]], xp: 22, silver: [15, 40], scale: 34, drops: [['jinchuang', 0.4]] },
    yuanbing: { name: '元兵', hp: 70, atk: 15, def: 5, agi: 9, moves: [['弯刀', 1], ['马鞭', 0.9]], xp: 10, silver: [4, 10], scale: 30 },
    baihu: { name: '元军百夫长', hp: 160, atk: 24, def: 10, agi: 12, moves: [['狼牙棒', 1.2], ['蒙古摔跤', 1.1]], xp: 30, silver: [15, 45], scale: 45 },
    jianke: { name: '背剑的年轻人', hp: 110, atk: 18, def: 6, agi: 18, moves: [['刺', 1], ['回身剑', 1.2]], xp: 20, silver: [0, 0], scale: 32 },
    lang: { name: '野狼', hp: 40, atk: 12, def: 2, agi: 18, moves: [['扑咬', 1], ['撕扯', 1.2]], xp: 6, silver: [0, 0], scale: 24 },
    dushe: { name: '毒蛇', hp: 30, atk: 10, def: 1, agi: 22, moves: [['咬', 1, 'poison']], xp: 5, silver: [0, 0], scale: 24 },
    egai: { name: '污衣帮众', hp: 90, atk: 16, def: 5, agi: 14, moves: [['打狗棍', 1], ['莲花掌', 1.1]], xp: 14, silver: [2, 8], scale: 32 },
    mjdizi: { name: '明教教众', hp: 120, atk: 20, def: 8, agi: 12, moves: [['烈火刀', 1.1], ['弯刀', 1]], xp: 18, silver: [5, 15] },
    emdizi: { name: '峨嵋弟子', hp: 110, atk: 20, def: 8, agi: 16, moves: [['峨嵋剑法', 1.1], ['金顶绵掌', 1]], xp: 18, silver: [3, 10] },
    qzdaoshi: { name: '全真道士', hp: 110, atk: 18, def: 9, agi: 13, moves: [['全真剑法', 1.1], ['三花聚顶掌', 1]], xp: 18, silver: [3, 10] },
    slwuseng: { name: '少林武僧', hp: 160, atk: 22, def: 12, agi: 10, moves: [['罗汉拳', 1.1], ['韦陀棍', 1.2]], xp: 24, silver: [0, 5] },
    wddizi: { name: '武当弟子', hp: 150, atk: 24, def: 12, agi: 16, moves: [['绕指柔剑', 1.1], ['武当长拳', 1]], xp: 24, silver: [0, 5] },
    wfwushi: { name: '王府武士', hp: 130, atk: 24, def: 10, agi: 14, moves: [['弯刀', 1.1], ['套索', 1]], xp: 20, silver: [8, 20], scale: 40 },
    fanseng: { name: '西域番僧', hp: 240, atk: 32, def: 15, agi: 12, moves: [['大手印', 1.2], ['金刚杵', 1.1]], xp: 40, silver: [10, 30] },
    shenjian: { name: '神箭八雄', hp: 160, atk: 30, def: 10, agi: 20, moves: [['连珠箭', 1.2], ['短刀', 1]], xp: 30, silver: [10, 20] },
    gbzhanglao: { name: '丐帮长老', hp: 320, atk: 38, def: 18, agi: 18, moves: [['降龙掌', 1.2], ['竹棒', 1.05]], xp: 60, silver: [5, 20] },
    jiabangzhu: { name: '丐帮帮主“史火龙”', hp: 420, atk: 44, def: 20, agi: 14, moves: [['降龙十八掌', 1.25], ['蛮力', 1.1]], xp: 80, silver: [20, 60] },
    chenyouliang: { name: '陈友谅', hp: 280, atk: 36, def: 14, agi: 22, moves: [['擒拿手', 1.1], ['冷刀', 1.25]], xp: 50, silver: [20, 50] },
    lu: { name: '鹿杖客', hp: 620, atk: 58, def: 26, agi: 24, moves: [['玄冥神掌', 1.2, 'poison'], ['鹿杖', 1.1]], xp: 120, silver: [30, 80] },
    he: { name: '鹤笔翁', hp: 600, atk: 56, def: 26, agi: 26, moves: [['玄冥神掌', 1.2, 'poison'], ['鹤笔', 1.1]], xp: 120, silver: [30, 80] },
    asan: { name: '阿三', hp: 460, atk: 56, def: 28, agi: 16, moves: [['大力金刚指', 1.3], ['金刚掌', 1.1]], xp: 100, silver: [20, 60] },
    miejue: { name: '灭绝师太', hp: 950, atk: 72, def: 34, agi: 30, moves: [['倚天剑', 1.35, 'crit'], ['截手九式', 1.1], ['佛光普照', 1.5]], xp: 200, silver: [0, 0] },
    zhouzhiruo: { name: '周芷若', hp: 820, atk: 74, def: 30, agi: 42, moves: [['九阴白骨爪', 1.35, 'crit'], ['白蟒鞭', 1.15]], xp: 200, silver: [0, 0] },
    xiexun: { name: '谢逊', hp: 1100, atk: 78, def: 38, agi: 22, moves: [['七伤拳', 1.35], ['狮子吼', 1.2], ['屠龙刀', 1.4]], xp: 240, silver: [0, 0] },
    bosi1: { name: '流云使', hp: 420, atk: 50, def: 22, agi: 34, moves: [['圣火令', 1.25, 'crit'], ['怪招', 1.1]], xp: 90, silver: [10, 30] },
    bosi2: { name: '妙风使', hp: 420, atk: 50, def: 22, agi: 36, moves: [['圣火令', 1.25, 'crit'], ['倒翻', 1.1]], xp: 90, silver: [10, 30] },
    bosi3: { name: '辉月使', hp: 420, atk: 52, def: 22, agi: 34, moves: [['圣火令', 1.25, 'crit'], ['滚地', 1.1]], xp: 90, silver: [10, 30] },
    chengkun: { name: '成昆', hp: 1300, atk: 82, def: 40, agi: 30, moves: [['幻阴指', 1.3, 'freeze'], ['混元霹雳手', 1.4], ['龙爪手', 1.15]], xp: 300, silver: [0, 0] },
    yangxiao: { name: '杨逍', hp: 900, atk: 68, def: 34, agi: 34, moves: [['弹指神通', 1.2], ['乾坤一掷', 1.3]], xp: 180, silver: [0, 0] },
    jinhua: { name: '金花婆婆', hp: 620, atk: 54, def: 24, agi: 32, moves: [['金花', 1.2, 'poison'], ['拐杖', 1.1]], xp: 120, silver: [10, 40] },
    weiyixiao: { name: '韦一笑', hp: 700, atk: 60, def: 26, agi: 60, moves: [['寒冰绵掌', 1.25, 'freeze'], ['吸血', 1.1, 'drain']], xp: 150, silver: [0, 0] },
    sandu: { name: '少林三渡', hp: 1500, atk: 70, def: 44, agi: 20, moves: [['金刚伏魔圈', 1.3], ['长索', 1.15]], xp: 300, silver: [0, 0] },
    tianlong_e: { name: '强占寺田的恶霸', hp: 140, atk: 20, def: 8, agi: 12, moves: [['铁尺', 1.1], ['黑虎掏心', 1.2]], xp: 24, silver: [20, 40], scale: 36 },
  });
})();
