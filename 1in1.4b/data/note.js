/* 临终留言只存本机的这一世记录；分享链接仍然只带出生种子。 */
(function () {
  'use strict';
  const JY = window.JY, G = JY.GAME;
  G.share.badgeLimit = 5;
  G.endNote = {
    max: 30,
    clean: (value) => Array.from(String(value || '').replace(/<[^>]*>/g, '').replace(/[<>\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, '')).slice(0, 30).join(''),
    options: (life) => {
      const out = ['辛苦了。', '这辈子，值。', '下辈子，换个活法。', '谢谢你们。', '没什么遗憾。', '早点歇一歇就好了。'];
      if (life.snap && life.snap.kids > 0) out.push('你们好好吃饭，好好过日子。');
      if (/过劳/.test(life.cause || '')) out.push('下辈子，给自己多留点时间。');
      else if (life.wish && life.wish.every((w) => w.ok)) out.push('想做的事，都认真做过了。');
      else if (life.to - life.born >= 90) out.push('看过这么多春天，够了。');
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
