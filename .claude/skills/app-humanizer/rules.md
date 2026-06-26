## Rules

Each row is a pattern category. The quoted strings are common examples, not a complete list — flag anything that fits the category even if the exact wording differs.

§1  Significance inflation    "vital role" / "underscores its significance" / "pivotal" / "stands as a testament"  →  drop sentence; state what it does
§3  Participial padding       trailing "symbolizing…" / "reflecting…" / "contributing to…"                         →  cut; state the fact directly
§4  Promotional adjectives    remarkable, profound, vibrant, breathtaking, groundbreaking, stunning                 →  cut or reword
§7  AI vocabulary             delve, tapestry (abstract), testament, showcase (v), pivotal, intricacies,            →  cut
                              interplay, fostering, garner, landscape (abstract), enduring, crucial
§8  Copula avoidance          "serves as" / "stands as" / "marks a" / "represents a"                               →  is / are / has
§9  Negative parallelism      "not merely X; it is Y" / "not just X, but Y"                                        →  state Y directly
§14 Structural punctuation    — – : ; in prose                                                                     →  rewrite naturally; do not swap one for another
    Leave unchanged:          ✓/— table absence markers | fenced code blocks | blockquote citations (line starts >)
    Convert to - (hyphen):    headings (# ## ### etc.) | frontmatter title: and description: values
    All other contexts:       rewrite as natural prose — do not substitute punctuation
    Acceptable rewrites:      split into two sentences (always valid) | participial phrase ("treating it as…") | subordinate clause ("since / because / where / when…")
    Never do:                 swap — for : or ; or , in the same structural slot — all four marks are equally forbidden in prose
§15 Boldface overuse          bold on non-essential phrases                                                         →  remove bold
§16 Inline-header lists       **Term:** or **Term.** in any list item (ul or ol)                                  →  **Term** - desc  (never colon, never period inside bold)
§17 Title-case headings       H2+ not in title case                                                                 →  capitalize every significant word
    Lowercase these:          a an the and but or for nor of in to at by (unless first or last word)
§23 Filler phrases            "In order to" / "Due to the fact that" / "It is important to note that"               →  cut or compress
§24 Excessive hedging         "could potentially possibly be argued"                                                →  direct claim or "may"
§25 Generic conclusions       "The future looks bright" / "Exciting times lie ahead"                                →  end on a specific fact
§27 Authority tropes          "at its core" / "what really matters" / "fundamentally"                              →  cut
§28 Signposting               "Let's dive in" / "Let's explore" / "Here's what you need to know"                   →  cut
§29 Fragmented headers        generic warm-up sentence after a heading that only restates it                        →  cut
§31 Staccato drama            3+ short declarative fragments in a row for emphasis                                  →  rewrite as varied prose
§34 Temporal framing          "In today's rapidly evolving X" / "In a world where"                                  →  state the claim directly
§35 Vague attribution         "experts argue" / "some critics contend" / "research suggests" / "industry reports show"  →  name the source, or state the claim directly
§36 Additive transitions      "Additionally," / "Furthermore," / "Moreover," / "In addition,"                          →  connect ideas through sentence structure; cut the connector
§37 Triadic padding           adj, adj, and adj  stacked purely for completeness ("warm, accessible, and grounding")   →  state what is specific; cut the list
§38 Elegant variation         synonym-swapping to avoid repeating a word ("constraints / norms / confines")            →  repeat the right word
§39 Challenges boilerplate    "Despite its X, [subject] faces challenges including Y" + speculative positive outlook   →  state challenges directly, no setup formula

## Preserve

- Frontmatter keys: verbatim. title: values — swap — to -. description: values are prose; rewrite, never swap.
- Code: fenced ``` blocks, indented code, inline `code` spans — never modify.
- Cross-links: [Display](Other.md) format — never hardcode paths.
- Blockquotes that are external citations — leave unchanged.
- Technical terms, proper nouns, API names — preserve exactly.
