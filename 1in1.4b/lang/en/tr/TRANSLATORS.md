# Translating 1 in 1.4 Billion (十四亿分之一) into English

The game: a browser life simulator. The player is born at random somewhere in China in 2026 and lives a whole life year by year (school, work, money, marriage, children, parents, old age). Chinese source files in `1in1.4b/data/*.js` are the single source of truth. Translations are **string tables**: `1in1.4b/lang/en/tr/<file>.json` maps each Chinese string literal (exactly as it appears between quotes in the source) to its English text. `node share/tools/tr.js 1in1.4b en <file>` swaps the strings and writes `lang/en/<file>.js`. Code is never changed.

## Your job

Fill in every empty value (`""`) in your assigned JSON file. Do not edit any other file.

## How to read a key

Many keys are **fragments** joined with code at runtime, e.g.

```js
text: (g) => '你在' + here(g) + '待了好几年，' + payWord(g) + '。'
```

has keys `你在`, `待了好几年，`, `。`. Before translating, open the source file and look at how each fragment is used (search for it). Translate so the joined English sentence reads naturally. Put spaces at fragment edges where English needs them (Chinese has none). Word order can only change *inside* a fragment, so sometimes you need to restructure across fragments (e.g. `'你在' → 'You spent a few years in '`, `'待了好几年，' → ', '`). Values inserted by code may be: city names (already English, e.g. "Chengdu"), people's names ("Wang Jianguo"), money (already formatted like "$4,300"), relation words (already English: "your father Wang Jianguo (56)"), job titles or other strings from the same file (translated by you).

A key that appears several times in the file gets one translation everywhere. Pick a translation that works in all places (check them). Punctuation-only keys like `，` `。` `、` `：` should usually become `, ` `. ` `, ` `: `.

## Do NOT translate (add to `"__keep"` array instead)

Strings that the code uses as **internal values**, not display text:
- strings compared with `===`, `!==`, `case`, `.includes(...)`, or used as object keys / lookup keys
- strings passed to `g.stat('…')`, `check: ['…', n]`, `g.s('…')`, `g.info('KEY', …)` (the KEY, not the value), focus names, region names (华北 etc.), sex `'男'`/`'女'`
- memory values that are Chinese and compared elsewhere

`_common.json` (do not edit) already covers stats, info keys, sex, regions, focus names, provinces, cities, majors and relation words. Those are applied automatically; ignore them if they show up. If you are unsure whether something is compared somewhere, search the other files in `1in1.4b/data/` for it.

`g.info('学历', '本科')` → keep the key `学历` untranslated, but **do** translate the value `本科` (it is shown to the player).

## Style

- Second person, present or past tense consistent with the surrounding text (the source mostly narrates in a simple past/present, “You…”). Short, plain, concrete sentences. Warm, a little wry, never preachy. No em dashes.
- Readers are young Western players curious about everyday life in China. Keep Chinese specifics and explain lightly when needed: “the gaokao (college entrance exam)”, “hukou (household registration)”, “bride price”, “tier-1 city”, “red envelope”, “WeChat”-like apps stay generic (“a chat app”) because the source avoids brand names.
- Money: `¥` amounts written in the text → US dollars at ¥7 = $1, rounded sensibly (`¥7,000` → `$1,000`; `¥8 万` = ¥80,000 → `$11,000`; `¥5,000/月` → `$700 a month`). Amounts produced by code (`CN.fmt`) are already converted; don't touch them.
- Ages, years and numbers: keep.
- Keep HTML tags, `{placeholders}`, `\n`, quotes inside text as curly quotes “ ” / ’.
- Chinese names of people written literally in text: use pinyin, surname first (“Wang Jianguo”). Nicknames: translate meaningfully or pinyin.

## When done

Make sure the JSON is valid and no value is empty, then run `node share/tools/tr.js 1in1.4b en <file>` from the repo root (for split parts, see your prompt) and `node --check 1in1.4b/lang/en/<file>.js`. Report how many strings you translated and anything you were unsure about (especially strings you put in `__keep`).
