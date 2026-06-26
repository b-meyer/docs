# Dao Primer — Content Research & File Map

## Purpose

This is the content blueprint for the Dao primer app (`apps/dao/`). It enumerates every page the app should contain, grouped into the sidebar sections that will appear in `vite.config.ts`. One row in the inventory tables below equals one markdown file in `apps/dao/src/`. Use this document to author the pages, populate the `sidebar` array, and write `index.md`.

This is a reference file, not a published page. It is exempt from the AGENTS.md content-writing rules (§1–§40) — those apply to the `src/*.md` pages it describes.

The subject is **Daoism (Taoism)**: its core concepts, foundational texts, key figures, organized schools, cosmology, practices, ethics, and history. The primer targets curious newcomers and general educated adults — philosophy-first, with practices framed conceptually (what neidan _is_, not a how-to).

The inventory is split into two tiers. **Core** is the primer's main path — the philosophical material a newcomer actually came for. **Additional Reading** is optional depth on organized religion, the pantheon, practice, and history. The split follows the Daojia (philosophy) / Daojiao (religion) line the primer itself teaches. The sidebar lists every Core group first, then the Additional Reading groups, so the intended reading order falls out of the ordering. Detail pages have been merged into their nearest neighbour to keep the set near ~37 rather than ~50.

## Conventions (carried from `apps/tcm/` and `apps/8fold/`)

- **Filenames**: PascalCase, no spaces or hyphens. Pinyin where the term is Chinese (`WuWei.md`, `YinYang.md`), English where natural (`Meditation.md`).
- **Cross-links**: write `[Display](Other.md)` — the framework resolves it to `/Other`. Never hardcode `/Other`.
- **Mermaid is on** for this app (`markdown.mermaid: true` in `vite.config.ts`, unlike tcm/8fold). Use diagrams for the cosmogony unfolding (Dao → ten thousand things), the Wu Xing generating/controlling cycles, and the schools/history timeline.
- **Theme**: `brandHue: 300`, `themeControls: true` are already set.
- **Page shape**: each page is a focused topic with an H1 title matching the sidebar title, a short framing paragraph, then sections. Mirror the density and tone of `apps/8fold/src/EightFoldPath.md`.

Type column: **Overview** = foundational page a newcomer reads first; **Detail** = sub-topic that assumes the overviews.

---

## File inventory

Two tiers. Type column: **Overview** = read-first; **Detail** = assumes the overviews. Where a page was merged in during trimming, the absorbed topic is noted in its scope.

## Core

The primer's main path — read top to bottom.

### Foundation

| Filename           | Page Title           | Type     | Scope                                                                                                                                                                    |
| ------------------ | -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DaojiaDaojiao.md` | Daojia and Daojiao   | Overview | The philosophical/religious distinction at the center of Daoism studies; why modern scholarship blurs the line and why that matters for reading every page that follows. |
| `Cosmogony.md`     | The Dao and Creation | Overview | Dao → One → Two → Three → ten thousand things; Wuji and Taiji as the ground of manifestation.                                                                            |

### Core Concepts

| Filename            | Page Title          | Type     | Scope                                                                           |
| ------------------- | ------------------- | -------- | ------------------------------------------------------------------------------- |
| `Dao.md`            | The Dao             | Overview | The Way: the ineffable source and pattern underlying all reality.               |
| `De.md`             | De                  | Overview | Virtue/power: the capacity to embody and express the Dao.                       |
| `WuWei.md`          | Wu Wei              | Overview | Effortless, non-coercive action in harmony with natural flow.                   |
| `Ziran.md`          | Ziran               | Detail   | Naturalness; the self-so spontaneity of things being as they are.               |
| `Pu.md`             | Pu                  | Detail   | The uncarved block; original, undifferentiated simplicity.                      |
| `YinYang.md`        | Yin and Yang        | Overview | Complementary, interdependent polarities; includes Taiji, the Supreme Ultimate. |
| `Qi.md`             | Qi                  | Overview | Vital energy animating and connecting all things.                               |
| `WuXing.md`         | Wu Xing             | Detail   | The five phases (wood, fire, earth, metal, water) and their cycles.             |
| `ThreeTreasures.md` | The Three Treasures | Detail   | The ethical treasures of the Daodejing: compassion, frugality, humility.        |
| `JingQiShen.md`     | Jing, Qi, Shen      | Detail   | The energetic triad — essence, energy, spirit — cultivated in practice.         |

### Texts & Teachers

| Filename        | Page Title        | Type     | Scope                                                                                            |
| --------------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `Daodejing.md`  | The Daodejing     | Overview | The 81-chapter classic; Dao, De, and governance.                                                 |
| `Laozi.md`      | Laozi             | Overview | The legendary "Old Master"; attributed author of the Daodejing, later deified.                   |
| `Zhuangzi.md`   | The Zhuangzi      | Overview | The book and its author Zhuang Zhou; relativism, transformation, freedom.                        |
| `Liezi.md`      | The Liezi         | Detail   | The book and Lie Yukou; unity with the Dao, perception, transcendence.                           |
| `EarlyTexts.md` | Other Early Texts | Detail   | The Neiye ("Inner Cultivation," in the Guanzi) and the Huainanzi (Han cosmology and statecraft). |

### Ethics & Society

| Filename        | Page Title          | Type     | Scope                                                                    |
| --------------- | ------------------- | -------- | ------------------------------------------------------------------------ |
| `Ethics.md`     | Daoist Ethics       | Overview | Virtue cultivated through alignment with the Dao, not imposed rules.     |
| `Governance.md` | Governing by Wu Wei | Detail   | Rule through minimal intervention; letting natural order prevail.        |
| `SanJiao.md`    | The Three Teachings | Overview | San Jiao; Daoism alongside Confucianism and Buddhism in Chinese culture. |

## Additional Reading

Optional depth on organized religion, the pantheon, practice, and history. In the sidebar these groups come after the Core groups and carry `extra: true` (the flag `apps/tcm/` uses for supplementary sections).

### Schools & Movements

| Filename              | Page Title            | Type   | Scope                                                                                                                                           |
| --------------------- | --------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `HuangLao.md`         | Huang-Lao             | Detail | The Han-era synthesis of Laozi statecraft; folds in the Yellow Emperor (Huangdi) as figurehead.                                                 |
| `CelestialMasters.md` | The Celestial Masters | Detail | Tianshi Dao, the first organized movement; folds in its founder Zhang Daoling.                                                                  |
| `ShangqingLingbao.md` | Shangqing and Lingbao | Detail | The medieval revelation schools: Highest Clarity (visualization, the body as sacred space) and Numinous Treasure (communal liturgy, talismans). |
| `Zhengyi.md`          | Zhengyi               | Detail | Orthodox Unity; non-monastic ritual specialists.                                                                                                |
| `Quanzhen.md`         | Quanzhen              | Detail | Complete Perfection; the monastic, internal-alchemy reform.                                                                                     |
| `Daozang.md`          | The Daozang           | Detail | The Daoist Canon and the Three Caverns scheme that organizes it.                                                                                |

### Cosmology & Pantheon

| Filename         | Page Title          | Type     | Scope                                                                                       |
| ---------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------- |
| `SanQing.md`     | The Three Pure Ones | Overview | Sanqing; the supreme trinity embodying aspects of the Dao.                                  |
| `JadeEmperor.md` | The Jade Emperor    | Detail   | Yu Huang and the celestial bureaucracy he administers.                                      |
| `Xian.md`        | Immortals (Xian)    | Overview | Transcendence as goal, physical vs spiritual readings, and the Eight Immortals of folklore. |

### Practice & Cultivation

| Filename            | Page Title               | Type     | Scope                                                                                   |
| ------------------- | ------------------------ | -------- | --------------------------------------------------------------------------------------- |
| `Meditation.md`     | Daoist Meditation        | Overview | Cultivating stillness, clarity, and union with the Dao.                                 |
| `Neidan.md`         | Alchemy: Neidan & Waidan | Overview | Internal alchemy (refining jing, qi, shen) and the earlier external/laboratory alchemy. |
| `Qigong.md`         | Qigong                   | Overview | Breath, movement, and intent to circulate and strengthen qi.                            |
| `Taijiquan.md`      | Taijiquan                | Detail   | Tai chi as embodied yin-yang principle and qi cultivation.                              |
| `OtherPractices.md` | Daoyin, Bigu, and More   | Detail   | Daoyin (guiding-and-stretching gymnastics) and Bigu (grain-avoidance fasting).          |
| `FengShui.md`       | Feng Shui                | Detail   | Geomancy; aligning buildings and landscape with qi flow.                                |
| `Ritual.md`         | Ritual and Liturgy       | Detail   | Ceremony, offerings, and ordination in organized Daoism.                                |

### History

| Filename     | Page Title          | Type     | Scope                                                                                                                          |
| ------------ | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `History.md` | A History of Daoism | Overview | Warring States origins through Han statecraft, the medieval schools, and into the modern revival in China, Taiwan, and beyond. |

> **Naming note:** `Zhuangzi.md` and `Liezi.md` each cover both the text and its author, so they sit in **Texts & Teachers** beside `Laozi.md`. Merged pages keep the lead topic's filename — `YinYang` absorbs Taiji, `HuangLao` absorbs Huangdi, `CelestialMasters` absorbs Zhang Daoling, `Xian` absorbs immortality and the Eight Immortals, `JadeEmperor` absorbs the celestial bureaucracy, `Neidan` absorbs Waidan, `OtherPractices` absorbs Daoyin and Bigu, `History` absorbs modern Daoism, `EarlyTexts` covers Neiye and Huainanzi. Every filename is unique.

**Total: 37 content pages + `index.md`** — 20 Core, 17 Additional Reading.

---

## Proposed `vite.config.ts` sidebar

Paste into `apps/dao/vite.config.ts`, replacing `sidebar: []`. Every `path` matches a filename above (no `.md`, no leading slash). Core groups come first; the Additional Reading groups carry `extra: true` — the same flag `apps/tcm/` uses to mark supplementary sidebar groups.

```ts
sidebar: [
  // --- Core ---
  {
    group: 'Foundation',
    items: [
      { path: 'DaojiaDaojiao', title: 'Daojia and Daojiao' },
      { path: 'Cosmogony', title: 'The Dao and Creation' },
    ],
  },
  {
    group: 'Core Concepts',
    items: [
      { path: 'Dao', title: 'The Dao' },
      { path: 'De', title: 'De' },
      { path: 'WuWei', title: 'Wu Wei' },
      { path: 'Ziran', title: 'Ziran' },
      { path: 'Pu', title: 'Pu' },
      { path: 'YinYang', title: 'Yin and Yang' },
      { path: 'Qi', title: 'Qi' },
      { path: 'WuXing', title: 'Wu Xing' },
      { path: 'ThreeTreasures', title: 'The Three Treasures' },
      { path: 'JingQiShen', title: 'Jing, Qi, Shen' },
    ],
  },
  {
    group: 'Texts & Teachers',
    items: [
      { path: 'Daodejing', title: 'The Daodejing' },
      { path: 'Laozi', title: 'Laozi' },
      { path: 'Zhuangzi', title: 'The Zhuangzi' },
      { path: 'Liezi', title: 'The Liezi' },
      { path: 'EarlyTexts', title: 'Other Early Texts' },
    ],
  },
  {
    group: 'Ethics & Society',
    items: [
      { path: 'Ethics', title: 'Daoist Ethics' },
      { path: 'Governance', title: 'Governing by Wu Wei' },
      { path: 'SanJiao', title: 'The Three Teachings' },
    ],
  },
  // --- Additional Reading (extra: true) ---
  {
    group: 'Schools & Movements',
    extra: true,
    items: [
      { path: 'HuangLao', title: 'Huang-Lao' },
      { path: 'CelestialMasters', title: 'The Celestial Masters' },
      { path: 'ShangqingLingbao', title: 'Shangqing and Lingbao' },
      { path: 'Zhengyi', title: 'Zhengyi' },
      { path: 'Quanzhen', title: 'Quanzhen' },
      { path: 'Daozang', title: 'The Daozang' },
    ],
  },
  {
    group: 'Cosmology & Pantheon',
    extra: true,
    items: [
      { path: 'SanQing', title: 'The Three Pure Ones' },
      { path: 'JadeEmperor', title: 'The Jade Emperor' },
      { path: 'Xian', title: 'Immortals (Xian)' },
    ],
  },
  {
    group: 'Practice & Cultivation',
    extra: true,
    items: [
      { path: 'Meditation', title: 'Daoist Meditation' },
      { path: 'Neidan', title: 'Alchemy: Neidan & Waidan' },
      { path: 'Qigong', title: 'Qigong' },
      { path: 'Taijiquan', title: 'Taijiquan' },
      { path: 'OtherPractices', title: 'Daoyin, Bigu, and More' },
      { path: 'FengShui', title: 'Feng Shui' },
      { path: 'Ritual', title: 'Ritual and Liturgy' },
    ],
  },
  {
    group: 'History',
    extra: true,
    items: [{ path: 'History', title: 'A History of Daoism' }],
  },
],
```

---

## `index.md` outline

Mirror `apps/8fold/src/index.md`. Sections in order:

1. **Frontmatter** — `title` and `description`.
2. **H1 + framing paragraph** — what the collection is and who it is for.
3. **AI-assistance disclaimer** — same note 8fold carries: generated with AI assistance as a synthesis of classical sources, edited for consistency; a study aid, not a primary source.
4. **How to Read This Collection** — present the Core path first (Foundation → Core Concepts → Texts & Teachers → Ethics & Society), then point to Additional Reading (Schools, Cosmology & Pantheon, Practice, History) as optional depth. Link the Overview pages with `[Dao.md](Dao.md)`-style cross-links.
5. **Working Vocabulary** — a definition list of recurring terms: Dao, De, Wu Wei, Ziran, Qi, Yin-Yang, Wu Xing, Xian, Neidan, Daojia/Daojiao. Format as `**Term** - definition` (AGENTS.md §16).
6. **Sources & Acknowledgements** — the authoritative references below, framed as the scholarly basis for the synthesis.

---

## Sources

Scholarly references only — every URL below was checked and loads real content (Britannica blocks automated fetches but the pages are live for readers). The division is deliberate: **SEP and IEP** have peer-reviewed entries for the _philosophical_ concepts, texts, and thinkers; the _religious_ schools, pantheon, and practices have no dedicated SEP/IEP entry, so those lean on **Britannica** topic pages, **Pregadio's Golden Elixir** (the standard scholarly site for Daoist alchemy), and the print **Encyclopedia of Taoism**. Prefer these over Wikipedia when authoring; use them to anchor claims, not to copy.

### Stanford Encyclopedia of Philosophy (peer-reviewed)

- Daoism (philosophical overview; Dao, De, Wu Wei, Ziran, cosmogony): https://plato.stanford.edu/entries/daoism/
- Religious Daoism (schools, pantheon, ritual, canon, alchemy, immortality): https://plato.stanford.edu/entries/daoism-religion/
- Laozi (the figure and the Daodejing): https://plato.stanford.edu/entries/laozi/
- Zhuangzi (the figure and the book): https://plato.stanford.edu/entries/zhuangzi/
- Neo-Daoism / Xuanxue (medieval philosophy; Wang Bi, Guo Xiang): https://plato.stanford.edu/entries/neo-daoism/

### Internet Encyclopedia of Philosophy (peer-reviewed)

- Daoist Philosophy (Daojia/Daojiao, core concepts, history): https://iep.utm.edu/daoismdaoist-philosophy/
- Laozi: https://iep.utm.edu/laozi/
- Zhuangzi: https://iep.utm.edu/zhuangzi/
- Liezi: https://iep.utm.edu/liezi/

### Britannica (editorially reviewed topic entries)

- Taoism (overview, origin, beliefs): https://www.britannica.com/topic/Taoism
- China — Daoism (historical development): https://www.britannica.com/place/China/Daoism
- Dao (the concept): https://www.britannica.com/topic/dao
- Shangqing (Highest Clarity school): https://www.britannica.com/topic/Shangqing
- Baxian (the Eight Immortals): https://www.britannica.com/topic/Baxian
- Qigong: https://www.britannica.com/topic/qigong
- Tai chi chuan: https://www.britannica.com/sports/tai-chi-chuan
- Feng shui: https://www.britannica.com/art/fengshui

### Daoist alchemy & practice (Golden Elixir — Fabrizio Pregadio)

- Taoist Alchemy: Neidan and Waidan (hub for internal/external alchemy): https://www.goldenelixir.com/jindan.html

### Teaching introduction

- Introduction to Daoism — Asia for Educators, Columbia University: https://afe.easia.columbia.edu/special/china_1000bce_daoism.htm

### Print reference

- Fabrizio Pregadio (ed.), _The Encyclopedia of Taoism_, 2 vols. (Routledge, 2008) — the standard scholarly reference for schools, deities, texts, and practices that have no dedicated online entry (Daozang, Lingbao, Zhengyi, Quanzhen, Sanqing, Jade Emperor, Huangdi, Zhang Daoling, Bigu, Daoyin, Neiye, Huainanzi).
