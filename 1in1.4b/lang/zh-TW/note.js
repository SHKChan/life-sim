/* 由 share/tools/tw.py 从简体版生成（OpenCC s2twp），不要手改。 */
/* 临终留言只存本机的这一世记录；分享链接仍然只带出生种子。 */
(function () {
  'use strict';
  const JY = window.JY, G = JY.GAME;
  G.share.badgeLimit = 5;
  G.endNote = {
    max: 30,
    clean: (value) => Array.from(String(value || '').replace(/<[^>]*>/g, '').replace(/[<>\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, '')).slice(0, 30).join(''),
    options: (life) => {
      const out = ['辛苦了。', '這輩子，值。', '下輩子，換個活法。', '謝謝你們。', '沒什麼遺憾。', '早點歇一歇就好了。'];
      if (life.snap && life.snap.kids > 0) out.push('你們好好吃飯，好好過日子。');
      if (/过劳/.test(life.cause || '')) out.push('下輩子，給自己多留點時間。');
      else if (life.wish && life.wish.every((w) => w.ok)) out.push('想做的事，都認真做過了。');
      else if (life.to - life.born >= 90) out.push('看過這麼多春天，夠了。');
      return out;
    },
  };
  const badges = G.share.badges;
  G.share.badges = (life) => {
    const out = badges ? badges(life) : [];
    // 分享卡增加到五行，保留已有信息；30字留言可在一行容纳。
    if (life.note) out.unshift('留言：' + G.endNote.clean(life.note));
    return out;
  };
})();
