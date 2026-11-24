/* 由 share/tools/tr.js 从 data/daily.js 和 lang/en/tr/daily.json 生成，不要手改。 */
/* 非科技的生活背景：预写文案；每个场景一生一次，不停下来问。 */
(function () {
  'use strict';
  const JY = window.JY;
  const days = [
    [6, 'The Little Eraser', 'You spend ages choosing at the stationery shop and finally buy a little cat-shaped eraser. At home you can\'t bear to use it and set it right in the middle of your pencil case.'],
    [12, 'After the Rain', 'The downpour has stopped, but there\'s still water by the roadside. You and a friend fold paper boats and crouch on the steps watching them drift away.'],
    [17, 'The Second-hand Bookshop', 'The summer is long. You spend a whole afternoon browsing in the aisles of a second-hand bookshop, and the owner gives you a faded bookmark.'],
    [19, 'A Basin of Bed Sheets', 'The line for drying sheets isn\'t long enough, and you struggle with it for ages. A neighbour passes you two clips and says pinning both ends will keep it from falling.'],
    [23, 'Evening Market', 'You find that greens are one yuan cheaper just before the stalls close in the evening. Seeing you come often, the vegetable seller adds a bunch of spring onions.'],
    [27, 'The Old Wall', 'Passing through the old street, you see workers patching a red-brick wall. Beneath the peeling plaster appears the sign of a grain shop that closed long ago.'],
    [31, 'Dinner on a Hot Day', 'It\'s too muggy to eat. You toss a bowl of cold noodles with extra vinegar, and afterwards cut half a watermelon.'],
    [35, 'Neighbourhood Ball Game', 'A small neighbourhood ball game kicks off. You watch from the side, and the breakfast vendor from next door scores a great goal; everyone cheers.'],
    [38, 'Binge-watching', 'You follow a family drama series. The next day at the market, the stallholder is talking about last night\'s episode too, and the two of you argue for ages over who was right.'],
    [42, 'The Balcony', 'You clear a corner of the balcony and bring in two evergreen plants. While watering them you notice the cat downstairs is also tilting its head up to bask in the sun.'],
    [45, 'Winter Solstice', 'On the winter solstice, a neighbour brings a small bowl of dumplings. You send back a dish of pickled radish, and the two empty bowls get swapped back in the stairwell.'],
    [48, 'Bricks in the Rain', 'It rains for days and water pools at the compound gate. Someone brings a few bricks and lays a crooked path, and later a handrail is added.'],
    [52, 'The Old Magazine', 'You buy a lifestyle magazine at a second-hand stall. The fashionable clothes on the cover look a lot like one that\'s been sitting at the bottom of your wardrobe for years.'],
    [55, 'Spring Bamboo Shoots', 'Spring bamboo shoots cost two yuan more than last year. You pick two, peel a whole basin of husks at home, and end up with only a small plate in the pot.'],
    [58, 'Life in the Square', 'The neighbourhood holds an evening party. Someone sings off-key, the audience laughs and applauds, and when there aren\'t enough seats people bring stools from home.'],
    [60, 'A Pot of Tea', 'You buy a small pack of new tea. The first time the water is too hot; the second time you wait patiently and finally taste a hint of sweetness.'],
    [62, 'Mid-Autumn', 'On Mid-Autumn night, you sit at the window cracking walnuts. Laughter from next door guessing lantern riddles drifts over; you solve one too, but feel too shy to shout it out.'],
    [64, 'Flower and Bird Market', 'A few new stalls have opened at the flower and bird market. After asking the price of a potted flower, you stand a while listening to the birds, and end up buying only a packet of seeds.'],
    [66, 'Painting Bamboo', 'At the community activity room you try painting bamboo. The first stroke has too much water and blurs into a blot; the teacher says to keep it and look again in a while.'],
    [69, 'Sheltering in the Pavilion', 'You and an old neighbour shelter from the rain in a pavilion. You talk about how the row of trees by the gate was only as thick as a wrist when planted, and now shades half the road.'],
    [72, 'The Shoe Repair Stall', 'You take your worn shoes to have the soles replaced. The repairman says they\'re well made and still good to wear, and mends the loose stitching while he\'s at it.'],
    [75, 'First Day of Winter', 'On the first day of winter, you cook yourself a pot of hot soup. The window glass fogs over, the lid rattles softly, and the room warms up.'],
    [78, 'Market at Dawn', 'You sit on a roadside bench and watch the morning market open. The tofu seller lifts the white cloth, and the steam disperses at once into the cool breeze.'],
    [80, 'A Bag of Rice', 'A neighbour helps carry a bag of rice into your home. You take a pack of sesame candy from the cupboard and press it on them, saying don\'t mind that it\'s so little.'],
    [82, 'The Pocket Garden', 'You sit for a while in the small garden downstairs. Sparrows land to peck at grass seeds, and one hops up beside your shoe before quickly flying off.'],
    [84, 'Airing a Sweater', 'The weather clears, and you spread an old sweater by the window. Sunlight falls on the fine fuzz, and you recognise the darned stitches at the cuff.'],
    [86, 'Morning Light', 'Early in the morning a shaft of light falls on the corner of the quilt. You reach out and touch it, still cool, and slowly pull your hand back under the covers.'],
    [88, 'Listening to the Wind', 'Wind passes through the leaves outside the window. You sit and listen for a while; far off someone is hawking goods, in a voice just like many years ago.'],
    [89, 'Old Letters', 'You dig out a bundle of old letters. Some of the words are no longer legible, but the leaf pressed between the pages still shows its fine veins.'],
    [90, 'New Year Festival', 'On the first day of the New Year, people in the stairwell exchange greetings. You smooth the red paper at your door and hear a child counting the sweets he\'s been given.'],
  ];
  JY.addEncounters(days.map((d, i) => ({ id: 'e_daily_' + i, y: [2026 + d[0], 2029 + d[0]], minAge: d[0], maxAge: d[0] + 3, t: d[1], text: d[2], auto: true, always: true })));
  JY.addEvents([
    { y: 2033, t: 'The festival market is set up again by the river, with a long queue in front of the dough-figurine stall.' },
    { y: 2042, t: 'This summer got hot early, and the mung-bean soup stalls on the street opened earlier than usual.' },
    { y: 2054, t: 'Vegetable prices have risen for several weeks, and more people at the evening market ask the price before buying.' },
    { y: 2063, t: 'A short drama series is a hit, and when neighbours meet they first ask which episode the other has reached.' },
    { y: 2074, t: 'Many old compounds have had their leaking roofs repaired, and the stairwells are full of old quilts hung out to air.' },
    { y: 2087, t: 'On the day of the local league final, many small restaurants push their tables together so people can eat while watching the match.' },
    { y: 2098, t: 'The city has added several pocket parks, so you no longer always need a mall to rest in the afternoon.' },
    { y: 2108, t: 'The weather is clear this Mid-Autumn, and after packing up, the mooncake stallholders bring stools out to sit at their doors.' },
  ]);

  // 旧识只回看已经发生的交集，不把随机同代人当作同学，也不假定旧人仍健在。
  const childhood = (g) => {
    if (g.recall('askedMom')) return 'You remember that video call from childhood, and when later arranging trips home, you first ask which days each of you is free.';
    if (g.recall('cityKid') === 'shop') return 'You still remember the table where you did homework in the little shop as a child, and when people talk about how hard running a business is, you listen a bit longer.';
    if (g.recall('cityKid') === 'class') return 'You still remember the workbook from the free after-school care as a child, and when you meet a question you\'re unsure of, you\'re willing to ask someone.';
    if (g.recall('talent')) return 'The skill you practised as a child may not have become a career, but the feeling of having practised it seriously is still with you.';
    return '';
  };
  const oldAcquaintance = (g, late) => {
    if (g.recall('kindness') === 'friend' && !JY.engine.get().L.done.e_c_kindness_echo) return 'You think of that transfer student, and still remember playing hopscotch together at break and teaching each other your hometown dialects.';
    if (g.recall('kindness') === 'friend') return late ? 'You come across the high school photo that transfer student sent you back then, and recall the breaks spent teaching each other your hometown dialects. You no longer know how they are now, but the photo is still kept.' : 'Tidying old things, you see again the photo that transfer student sent, and remember those breaks playing hopscotch together.';
    if (g.recall('craft') === 'cook') return late ? 'You think of the potatoes you ruined cutting when you first learned to cook, and still remember the extra bowl of rice the master served you back then.' : 'When work gets hard, you recall the scolding you got while learning to cook, and also the extra bowl of rice the master served after closing.';
    if (['tile', 'electric', 'weld'].includes(g.recall('craft'))) return late ? 'You remember the alleys you walked behind the village uncle back then; to this day you still arrange your toolbox the way you first learned.' : 'Sorting your tools, you recall the days learning the trade from the village uncle, when even slow work had to be checked clearly.';
    return '';
  };
  const background = (g) => {
    const family = g.recall('family');
    if (['farmer', 'migrant', 'worker'].includes(family)) return 'As a child your family had to count every coin, and these years when discussing things, you also make a habit of stating first what you can afford right now.';
    if (family === 'rich') return 'Your family arranged many things for you as a child, and now you have to decide how to live your own days, one thing at a time.';
    if (['civil', 'white'].includes(family)) return 'As a child you were used to adults going to and from work on the dot, and now it\'s your turn to arrange the household schedule slowly yourself.';
    if (family === 'smallbiz') return 'As a child you saw your family bustling in and out, and now when you do the daily accounts, you leave a little room for the things that can\'t all get done.';
    return '';
  };
  const regionMemory = (g) => {
    const food = { 东北: 'the warmth of the heating indoors in winter', 华北: 'steaming hot noodles in the morning', 华东: 'the steam from the breakfast stall at the street corner', 华中: 'hot soup carried home on a rainy day', 华南: 'the steam of morning tea', 西南: 'the spicy fragrance drifting from the old street', 西北: 'the aroma of a bowl of noodles set on the table' }[g.recall('region')];
    if (!food) return '';
    const home = [g.recall('city'), g.recall('homeCap')].includes(g.recall('workCity'));
    return (home ? 'Still living in a familiar place, you sometimes think of ' : 'Where you live now, you sometimes think of your hometown and ') + food + ', a memory left from childhood.';
  };
  const tails = {
    y_offer_echo: (g) => childhood(g) + oldAcquaintance(g, false),
    m_43_career_echo: (g) => background(g),
    e_daily_11: (g) => regionMemory(g),
    o_look_back_edu: (g) => childhood(g) + oldAcquaintance(g, true),
    o_hometown_echo: (g) => regionMemory(g),
  };
  Object.entries(tails).forEach(([id, tail]) => {
    const n = JY.LIFE_NODES.concat(JY.ENCOUNTERS).find((x) => x.id === id);
    if (!n) return;
    const text = n.text;
    n.text = (g) => (typeof text === 'function' ? text(g) : text || '') + tail(g);
  });
})();
