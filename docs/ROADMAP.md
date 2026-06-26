---
purpose: 'Backlog of prospective content apps — scope sketches that precede a per-app RESEARCH.md.'
scope: 'Cross-app content ideas only. A per-app page inventory lives in a temporary apps/<app>/RESEARCH.md during authoring; workspace topology in STRUCTURE; framework design in ARCHITECTURE.'
audience: 'Maintainers deciding what to build next; agents scoping a new app before drafting its RESEARCH.md.'
summary: 'One section per candidate app: working name, scope, why it is its own app vs. a section of an existing one, and overlap/cross-link notes. An idea graduates once its app is authored, after which its entry shrinks to a pointer to apps/<app>/. RESEARCH.md is a temporary authoring scaffold, removed once the content exists.'
---

# Roadmap

Candidate content apps that may earn a place in `apps/`. Each entry is a scope sketch, not a commitment and not a page inventory.

## How this file relates to RESEARCH.md

- **This file** — "what apps might exist, and why." Cross-app, a paragraph or two per idea. Persistent.
- **`apps/<app>/RESEARCH.md`** — "every page this one app will contain." A **temporary authoring scaffold** that drives the `src/*.md` files, the `vite.config.ts` sidebar, and `index.md`. It is removed once the content is authored — treat it as throwaway, not a durable record.

An idea graduates once its app is authored. At that point its entry here shrinks to a one-line pointer to the app itself (`apps/<app>/`) — not to its RESEARCH.md, which is gone by then.

## Deciding whether an idea is its own app

Existing apps sit at two different grains, and the grain matters:

- **Tradition-level** (`tcm`, `dao`) — a whole domain with a conceptual core and a long tail of specialist material. These earn a core / `extra: true` sidebar split because the tail is real and would otherwise bury the core.
- **Framework-level** (`8fold`) — a single bounded framework inside a tradition. The structure is fixed by the subject (eight factors, four truths, three trainings), so there is no long tail to demote and no `extra` tier.

A new idea is its own app when it has a distinct audience and a self-contained body of content. It is instead a _section of an existing app_ when it only deepens material that app already owns. When two apps would cover overlapping ground, prefer **hub-and-spoke**: a broad hub app owns breadth and gives each deep topic a single overview page that cross-links into the focused spoke app, rather than re-authoring it.

## Candidates

### buddhism — broad Buddhism primer (hub)

**Scope.** A tradition-level primer covering Buddhism as a whole, organized around the three vehicles (Theravāda, Mahāyāna, Vajrayāna). Sketch of sections:

- **Foundations** — life of the Buddha, the three marks of existence, dependent origination (_paṭicca-samuppāda_), karma and rebirth, saṃsāra and nibbāna, cosmology (the realms).
- **The vehicles** — Theravāda / Mahāyāna / Vajrayāna as the organizing frame.
- **Mahāyāna core** — emptiness (_śūnyatā_), the bodhisattva ideal, the six pāramitās, Buddha-nature, the two-truths doctrine.
- **Mahāyāna schools** — Madhyamaka, Yogācāra.
- **Regional forms** — Chan / Zen, Pure Land, Tibetan / Vajrayāna, Nichiren.
- **Texts & history** — the Pāli Canon vs. the Mahāyāna sūtras, the councils, the spread across Asia.

This is a tradition-level app, so it would carry a core / `extra: true` split like `dao` and `tcm`.

**Why its own app, not a section.** `8fold` is framework-level and Theravāda-leaning (Pāli throughout; the teachers it credits are insight-lineage). It is "the Eightfold Path app," not "the Buddhism app with gaps." The breadth above — most of all of Mahāyāna — has no home today. It is too large to bolt onto `8fold` without destroying what `8fold` does well: present one complete, self-contained framework.

**Overlap / cross-link note.** The Four Noble Truths and the Noble Eightfold Path already live in `8fold` with real depth. The hub must **defer to `8fold`**, not re-author it: give the Path a single overview page in the hub that cross-links into `8fold`'s pages. Hub owns breadth; `8fold` owns the deep dive.

**Status.** Idea only. No `RESEARCH.md` yet.

### ayurveda — Ayurveda primer

**Scope.** A tradition-level primer covering Ayurveda as a complete system of medicine and philosophy. Sketch of sections:

- **Foundations** — origins and the Vedic context, the three principal texts (_Caraka Saṃhitā_, _Suśruta Saṃhitā_, _Aṣṭāṅga Hṛdayam_), the five elements (_pañcamahābhūta_).
- **Core framework** — the three doṣas (Vāta, Pitta, Kapha), _prakṛti_ (constitutional type) and _vikṛti_ (current imbalance), the seven _dhātus_ (tissues), _agni_ (digestive fire), _āma_ (toxins).
- **Diagnosis and assessment** — pulse diagnosis (_nāḍī parīkṣā_), the eight-fold examination, doṣa assessment.
- **Therapeutics** — diet and lifestyle by doṣa, _pañcakarma_ (the five cleansing treatments), herbal medicine (_dravyaguṇa_), _rasāyana_ (rejuvenation).
- **Mind and consciousness** — the three _guṇas_ (sattva, rajas, tamas), _manas_ (mind), the relationship to yoga and meditation.
- **History and spread** — classical period, influence on Tibetan and Unani medicine, modern integrative practice.

This is a tradition-level app and would carry a core / `extra: true` sidebar split.

**Why its own app, not a section.** Ayurveda is a complete philosophical and clinical system, not a subtopic of any existing app. While TCM shares structural parallels (elemental theory, constitution types, pulse diagnosis), the two systems are doctrinally independent — covering Ayurveda inside `tcm` would misrepresent both. The scope is too large for a spoke; it anchors its own hub.

**Scope note.** `tcm` is a fully built tradition-level app at the same grain — it demonstrates what this app type looks like when complete. Ayurveda should be researched and structured on its own terms; the parallel is an existence proof, not a template.

**Status.** Idea only. No `RESEARCH.md` yet.

### christianity — broad Christianity primer (hub)

**Scope.** A tradition-level primer covering Christianity as a whole, organized around the three major branches (Catholic, Eastern Orthodox, Protestant). Sketch of sections:

- **Foundations** — the life of Jesus, the Trinity, the incarnation, crucifixion and resurrection, sin and grace, salvation, the kingdom of God.
- **Scripture** — Old and New Testament, the Gospels, the Pauline epistles, formation of the canon.
- **The branches** — Catholic, Eastern Orthodox, Protestant as the organizing frame, with Oriental Orthodoxy and the Anglican middle ground.
- **Doctrine and creeds** — the Nicene and Apostles' creeds, christology, the ecumenical councils, soteriology, eschatology.
- **Practice** — the sacraments, liturgy and worship, prayer, the liturgical year.
- **Mysticism** (`extra: true`) — the contemplative tradition across its three streams: Hesychasm and the Jesus Prayer (Orthodox), Rhineland and apophatic mysticism (Eckhart, _The Cloud of Unknowing_), and the Spanish Carmelites (Teresa of Ávila, John of the Cross).
- **History** — the early church, the Great Schism, the Reformation, the spread of Christianity.

This is a tradition-level app, so it would carry a core / `extra: true` split like `dao` and `tcm`.

**Why its own app, not a section.** Christianity is a complete tradition with no home in the existing apps. The breadth above — three doctrinally distinct branches and two millennia of history — anchors its own hub rather than deepening any current app.

**Overlap / cross-link note.** No spoke exists yet, and mysticism is the reason to flag the contrast with `judaism`/`islam`: Christian mysticism has no single fixed framework like the sefirot or the tariqa. It is three independent streams (Hesychasm, Rhineland, Carmelite), so it stays an `extra: true` section inside the hub rather than becoming a focused spoke. If some bounded framework inside the tradition later earns its own app, the containment rule applies: the hub defers to it with one overview page that cross-links out.

**Status.** Idea only. No `RESEARCH.md` yet.

### platonism — Platonism primer

**Scope.** A tradition-level primer covering Platonism as a philosophical tradition, from Plato through its later schools. Sketch of sections:

- **Foundations** — Socrates and the dialogues, the theory of Forms, the allegory of the cave, the divided line, recollection (_anamnesis_), the tripartite soul.
- **Metaphysics and epistemology** — Forms and particulars, the Form of the Good, knowledge versus opinion (_doxa_), the immortality of the soul.
- **Ethics and politics** — the just soul and the just city (the _Republic_), the philosopher-king, the virtues.
- **The dialogues** — the early, middle, and late groupings, with the central texts (_Republic_, _Phaedo_, _Symposium_, _Timaeus_, _Phaedrus_).
- **Later Platonism** — the Academy, Middle Platonism, Neoplatonism (Plotinus, the One and emanation), Porphyry, Proclus.
- **Influence** — on Aristotle, Augustine and Christian theology, Islamic philosophy, the Renaissance.

This is a tradition-level app and would carry a core / `extra: true` sidebar split.

**Why its own app, not a section.** Platonism is a complete philosophical tradition with no home in the existing apps. The long tail — the dialogues, the late antique schools, the reception history — is exactly the kind of specialist material the core / `extra: true` split exists to hold.

**Overlap / cross-link note.** Platonism shaped later Christian theology (Augustine, the Neoplatonic background of the Trinity debates), but that relationship is **parallel**, not containment: each tradition's treatment of the shared concepts is self-contained within its own doctrine. Like `dao` and `tcm`, the two stay standalone and do not cross-link.

**Status.** Idea only. No `RESEARCH.md` yet.

### judaism — broad Judaism primer (hub)

**Scope.** A tradition-level primer covering Judaism as a whole, organized around the major movements (Orthodox, Conservative, Reform). Sketch of sections:

- **Foundations** — covenant and monotheism, the patriarchs, the Exodus, the giving of the Torah at Sinai, chosenness.
- **Scripture and text** — the Tanakh (Torah, Nevi'im, Ketuvim), the Oral Torah, the Mishnah and Talmud, midrash.
- **Law and practice** — halakhah, the 613 mitzvot, Shabbat, kashrut, the festivals and the liturgical year, life-cycle rituals.
- **The movements** — Orthodox, Conservative, Reform, and Reconstructionist as the organizing frame, with Hasidic and Haredi streams.
- **Thought and mysticism** — medieval philosophy (Maimonides), the mussar ethical tradition, and a single overview of Kabbalah that links out to the `kabbalah` spoke.
- **History** — the First and Second Temple, the diaspora, rabbinic Judaism, the medieval expulsions, the Holocaust, Zionism and modern Israel.

This is a tradition-level app, so it would carry a core / `extra: true` split like `dao` and `tcm`.

**Why its own app, not a section.** Judaism is a complete tradition with no home in the existing apps. The breadth above — text, law, the movements, mysticism, and a long history — anchors its own hub rather than deepening any current app.

**Overlap / cross-link note.** `kabbalah` is a planned focused spoke (see below). This is containment, so the hub **defers to it**: the mysticism section gives Kabbalah one overview page that cross-links into the spoke rather than re-authoring the sefirot, the four worlds, and Lurianic theory at depth. Hub owns breadth; `kabbalah` owns the deep dive — the same split as `buddhism` → `8fold`.

**Status.** Idea only. No `RESEARCH.md` yet.

### kabbalah — Jewish mysticism (focused spoke of `judaism`)

**Scope.** A framework-level primer on Kabbalah, the Jewish mystical tradition. The structure is fixed by the subject, so there is no long tail to demote and no `extra` tier. Sketch of sections:

- **Foundations** — Ein Sof (the infinite), the problem of creation, _tzimtzum_ (divine contraction), emanation.
- **The sefirot** — the ten sefirot and the Tree of Life, the three pillars, the four worlds (_Atzilut_, _Beriah_, _Yetzirah_, _Asiyah_).
- **Core texts** — the _Sefer Yetzirah_, the _Bahir_, the _Zohar_.
- **Lurianic Kabbalah** — Isaac Luria, the breaking of the vessels (_shevirat ha-kelim_), repair (_tikkun_), reincarnation (_gilgul_).
- **Practice and reception** — _devekut_ (cleaving to God), _kavvanot_ (mystical intentions), the influence on Hasidism, modern reception.

**Why its own app, not a section.** Kabbalah is a bounded framework with fixed internal structure — the right grain for a focused spoke, like `8fold`. It is too large for the `judaism` hub to author at depth without burying the rest of the tradition, and self-contained enough to stand on its own.

**Overlap / cross-link note.** This is the spoke in a containment pair: `judaism` is the hub. The hub keeps one Kabbalah overview page that cross-links here; this app owns the deep treatment. Apps deploy as separate sites, so that hub link is a cross-site link, not the intra-app `[Display](Other.md)` form.

**Status.** Idea only. No `RESEARCH.md` yet.

### islam — broad Islam primer (hub)

**Scope.** A tradition-level primer covering Islam as a whole, organized around the major branches (Sunni and Shia). Sketch of sections:

- **Foundations** — _tawhid_ (the oneness of God), the prophethood of Muhammad, the Quran as revelation, the day of judgment.
- **Scripture and text** — the Quran, the hadith, the sunnah, _tafsir_ (exegesis).
- **Law and practice** — _sharia_ and _fiqh_, the five pillars (_shahada_, _salah_, _zakat_, _sawm_, _hajj_), the schools of jurisprudence (_madhhabs_).
- **The branches** — Sunni and Shia as the organizing frame, with the Ibadi and the major Shia subgroups.
- **Thought and mysticism** — _kalam_ (theology), _falsafa_ (philosophy: al-Ghazali, Ibn Rushd), and a single overview of Sufism that links out to the `sufism` spoke.
- **History** — Muhammad and the Rashidun caliphs, the Umayyad and Abbasid caliphates, the spread, the classical golden age, modern movements.

This is a tradition-level app, so it would carry a core / `extra: true` split like `dao` and `tcm`.

**Why its own app, not a section.** Islam is a complete tradition with no home in the existing apps. The breadth above — text, law, the branches, theology, and a long history — anchors its own hub rather than deepening any current app.

**Overlap / cross-link note.** `sufism` is a planned focused spoke (see below). This is containment, so the hub **defers to it**: the mysticism section gives Sufism one overview page that cross-links into the spoke rather than re-authoring the orders, the stations, and Ibn Arabi at depth. Hub owns breadth; `sufism` owns the deep dive — the same split as `judaism` → `kabbalah` and `buddhism` → `8fold`.

**Status.** Idea only. No `RESEARCH.md` yet.

### sufism — Islamic mysticism (focused spoke of `islam`)

**Scope.** A framework-level primer on Sufism (_tasawwuf_), the mystical path of Islam. The structure is fixed by the subject, so there is no long tail to demote and no `extra` tier. Sketch of sections:

- **Foundations** — _tasawwuf_ and the inner path (_tariqa_), purification of the heart (_tazkiyah_), the stations and states (_maqamat_ and _ahwal_).
- **The path** — the shaykh and _murid_ relationship, _dhikr_ (remembrance of God), _sama_ (spiritual audition), _fana_ (annihilation of the self) and _baqa_ (subsistence in God).
- **The orders** — the major _tariqas_ (Qadiri, Naqshbandi, Chishti, Mevlevi).
- **Key figures and texts** — al-Junayd, al-Hallaj, al-Ghazali, Ibn Arabi (_wahdat al-wujud_), Rumi (the _Masnavi_).
- **Practice and reception** — devotional poetry, music and the whirling _sama_, the relationship to orthodox Islam, modern reception.

**Why its own app, not a section.** Sufism is a bounded framework with fixed internal structure — the right grain for a focused spoke, like `8fold` and `kabbalah`. It is too large for the `islam` hub to author at depth without burying the rest of the tradition, and self-contained enough to stand on its own.

**Overlap / cross-link note.** This is the spoke in a containment pair: `islam` is the hub. The hub keeps one Sufism overview page that cross-links here; this app owns the deep treatment. Apps deploy as separate sites, so that hub link is a cross-site link, not the intra-app `[Display](Other.md)` form.

**Status.** Idea only. No `RESEARCH.md` yet.

### hinduism — broad Hinduism primer (hub)

**Scope.** A tradition-level primer covering Hinduism as a whole, organized around the major denominations (Vaishnavism, Shaivism, Shaktism, Smartism). Sketch of sections:

- **Foundations** — Brahman and _atman_, _dharma_, _karma_ and _samsara_, _moksha_, the _trimurti_ (Brahma, Vishnu, Shiva).
- **Scripture and text** — the Vedas, the Upanishads, the epics (_Mahabharata_, _Ramayana_), the _Bhagavad Gita_, the Puranas.
- **The denominations** — Vaishnavism, Shaivism, Shaktism, and Smartism as the organizing frame.
- **Philosophy** — the six _darshanas_ (Nyaya, Vaisheshika, Samkhya, Yoga, Mimamsa, Vedanta), the schools of Vedanta (Advaita, Vishishtadvaita, Dvaita).
- **Practice** — the four aims (_purusharthas_), the four stages of life (_ashramas_), _puja_ and temple worship, the paths of yoga (_bhakti_, _jnana_, _karma_), the festivals.
- **History** — the Vedic period, the classical synthesis, the bhakti movements, modern Hinduism and reform.

This is a tradition-level app, so it would carry a core / `extra: true` split like `dao` and `tcm`.

**Why its own app, not a section.** Hinduism is a complete tradition with no home in the existing apps. The breadth above — text, the denominations, six schools of philosophy, and a long history — anchors its own hub rather than deepening any current app.

**Overlap / cross-link note.** No spoke exists yet, so the hub owns all of this material itself. If a bounded framework inside the tradition later earns its own focused app, the containment rule applies: the hub defers to it with one overview page that cross-links out, rather than a re-authored deep dive.

**Status.** Idea only. No `RESEARCH.md` yet.
