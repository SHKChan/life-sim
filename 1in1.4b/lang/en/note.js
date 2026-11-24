/* 由 share/tools/tr.js 从 data/note.js 和 lang/en/tr/note.json 生成，不要手改。 */
/* 临终留言只存本机的这一世记录；分享链接仍然只带出生种子。 */
(function () {
  'use strict';
  const JY = window.JY, G = JY.GAME;
  G.share.badgeLimit = 5;
  G.endNote = {
    max: 30,
    clean: (value) => Array.from(String(value || '').replace(/<[^>]*>/g, '').replace(/[<>\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, '')).slice(0, 30).join(''),
    options: (life) => {
      const out = ['It was hard work.', 'This life was worth it.', 'Next life, live differently.', 'Thank you all.', 'No regrets.', 'I should have rested earlier.'];
      if (life.snap && life.snap.kids > 0) out.push('Eat well and live well.');
      if (/过劳/.test(life.cause || '')) out.push('Next life, leave more time for myself.');
      else if (life.wish && life.wish.every((w) => w.ok)) out.push('I did everything I wanted to do, and did it properly.');
      else if (life.to - life.born >= 90) out.push('I\'ve seen so many springs. That\'s enough.');
      return out;
    },
  };
  const badges = G.share.badges;
  G.share.badges = (life) => {
    const out = badges ? badges(life) : [];
    // 分享卡增加到五行，保留已有信息；30字留言可在一行容纳。
    if (life.note) out.unshift('Last words: ' + G.endNote.clean(life.note));
    return out;
  };
})();
