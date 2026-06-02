# Improvements Backlog

Collected from review session — June 2026.
Each item is fully specced and ready to execute in a fresh session.

---

## 1. ClusterMap — "About this map" block below the graph

**Current:** The interpretive text ("Dense clusters in the center…", "Math sits between CS and physics…") appears in a sidebar to the right of the graph, below the legend.

**Change:** Move the entire block to below the graph, full-width, after the `NodeDetail` panel. The graph gets the full column width at all times, even when a node is selected. The about text becomes a footer annotation to the map rather than a sidebar competing with the node detail.

**Why:** When a node is selected, the current layout splits left (graph) / right (detail). The about text then gets pushed down or competes for space. Below-the-graph placement is always correct regardless of selection state.

**Implementation:**
- In `clustermap.jsx`, move the about block `<div className="mt-6 ...">` from inside the right-column layout to after the graph + detail panel section, full width under the `max-w-screen-xl` container.
- No data changes needed.

---

## 2. ClusterMap — Cluster evolution timeline in node detail panel

**Current:** Node detail panel shows: cluster name, domain/quadrant badges, size, top terms, description. No temporal view.

**Change:** Add a small sparkline bar chart showing papers published per year for the selected cluster. Appears below the top terms, above the description.

**Data:** `clustersizes.json` already has `papersByYear: [{year, count}]` for all 50 clusters. It is NOT currently loaded in `clustermap.jsx` — need to import it.

**Implementation:**
- Import `clustersizes` from `../../data/clustersizes.json` in `clustermap.jsx`
- Build a lookup: `const sizeByCluster = Object.fromEntries(clusterSizes.map(c => [c.id, c.papersByYear]))`
- In `NodeDetail`, receive `papersByYear` prop and render a mini bar chart using `recharts` `<BarChart>` or a custom SVG sparkline (prefer custom SVG — no extra recharts import, lighter, matches existing style)
- Bar chart spec:
  - Width: 100%, height: 60px
  - X axis: years 2007–2024, no labels (too cramped) — just the shape
  - Y axis: no labels
  - Bar color: matches cluster's `color` prop, opacity 0.6
  - Hover on bar: show `year: count` tooltip
  - The LLM cluster (C28) will show a hockey-stick shape — this is visually striking and tells the story
- Add a one-line annotation below: `"Growth: ${growthRate}× since 2020"` or the quadrant label

---

## 3. ClusterMap — Top cited papers per cluster (Semantic Scholar)

**What:** Show top 5 most-cited papers within each cluster in the node detail panel — "landmark papers" that define the cluster. Two modes: globally most cited (landmark papers), and most cited within the cluster (representative papers).

**Why it's interesting:** For CS/LLM clusters you'd see "Attention Is All You Need", "BERT", "GPT" — immediately recognizable. For physics you'd see foundational papers. It grounds the cluster in real research the user may know.

**API:** Semantic Scholar — free, no API key needed for basic use. Supports ArXiv ID lookup.
- Endpoint: `https://api.semanticscholar.org/graph/v1/paper/arXiv:{id}?fields=title,citationCount,authors,year`
- Rate limit: ~100 req/s without key, 1 req/s is safe for a one-time script
- Response includes: `title`, `citationCount`, `authors[].name`, `year`

**Data we have:** `arxiv_metadata_features.pkl` has all ArXiv IDs with `cluster_id` from `cluster_labels_500d.pkl`. Can join them.

**One-time Python script** (`generate_cited_papers.py`):
```
1. Load cluster_labels_500d.pkl → {arxiv_id: cluster_id}
2. Load arxiv_metadata_features.pkl → {arxiv_id: title, abstract}
3. For each cluster (0–49):
   a. Get all paper IDs in that cluster
   b. Sample 200 candidates (random or by recentRatio to bias toward established papers)
   c. Call S2 API for each: GET /paper/arXiv:{id}?fields=title,citationCount,year
   d. Sort by citationCount desc, take top 5
   e. Store: {id, title, year, citationCount, authors (first 2)}
4. Output: cited_papers.json → {clusterId: [{id, title, year, citations, authors}] × 5}
```

**Total API calls:** 50 clusters × 200 candidates = 10,000 calls at 1 req/s = ~3 hours.
**Optimization:** Only call S2 for papers from high-citation-probability years (post-2015 for most, post-2018 for CS). Reduces to ~50 clusters × 50 candidates = 2,500 calls → ~45 minutes. Or use S2 bulk API (batch endpoint supports 500 IDs/request → 5 batch calls, seconds).

**S2 Bulk endpoint:**
`POST https://api.semanticscholar.org/graph/v1/paper/batch`
Body: `{"ids": ["arXiv:1706.03762", ...], "fields": "title,citationCount,year,authors"}`
500 IDs per request. Total: 50 clusters × 50 candidates = 2500 IDs → 5 batch requests. Done in seconds.

**Output file:** `cited_papers.json` — ~50KB. Add to `cluster_graph.json` nodes or keep separate.

**UI in NodeDetail:** Below top terms, new subsection "Landmark papers":
- 5 rows: citation count badge (gray) + title (truncated to 60 chars) + year
- Title is a link to `https://arxiv.org/abs/{id}`
- Opens in new tab
- Small and readable — not the focus, just enrichment

---

## 4. LibraryExplorer — Windowed card view (clipped to filter panel height)

**Current:** Card grid extends to full height, scrolls with the page.

**Change:** The right panel (card grid) is clipped to the same height as the left filter panel. Cards overflow downward but are hidden below the fold. Scrolling within the card grid (not the page) reveals more. Top cards disappear as you scroll up — creates a "window into a library" feeling. No bottom edge.

**Why:** Makes the library feel boundless in both directions. The clip reinforces that you're only seeing a slice.

**Implementation:**
- Left panel height is determined by its content (domain list). It varies with screen size.
- Match heights with a shared ref: `const filterRef = useRef()` on the left panel, read `filterRef.current.offsetHeight`, set `maxHeight` on the card container.
- Or simpler: use CSS `align-items: stretch` on the flex parent + `overflow-y: scroll` on the right panel, with both panels having `height: 100%`. The left panel defines the height naturally.
- Apply `overflow-y: scroll` + `scroll-behavior: smooth` to the card grid container.
- Remove the bottom `motion.p` note (the "even with filters…" text) — it's outside the windowed area and breaks the effect. The estimated count in the left panel already delivers that message.
- Add a subtle gradient mask at the bottom of the card container (`background: linear-gradient(to bottom, transparent 85%, #030712)`) so cards fade out rather than hard-clip.

**Note:** The page should not scroll while user scrolls inside the card window. Add `onWheel={e => e.stopPropagation()}` on the card container — or just rely on the browser's natural behavior (scrollable child captures wheel events when focused/hovered, which is standard).

---

## 5. LibraryExplorer — Fix empty filter results (resample to domain×year stratified)

**Current problem:** 896 papers sampled proportionally by domain only. No year stratification. Result: `Math 2009-2013` returns 0 papers because the sample happened to include no Math papers from those years.

**Root cause:** The sampling script did `subset.sample(n=56, random_state=42)` per domain without weighting by year. Early years of small domains got zero coverage.

**Fix:** Resample with domain × year-bucket stratification.

**Year buckets (9 buckets, 2 years each):**
`2007-08, 09-10, 11-12, 13-14, 15-16, 17-18, 19-20, 21-22, 23-25`

**Sampling:** 16 domains × 9 buckets × 20 papers = 2,880 papers max. Some buckets will have fewer (e.g., Economics didn't exist on ArXiv before 2017). Fill what's available, skip empty buckets.

**Output:** ~2,500–2,800 papers, ~1.1MB file — replaces current `abstract_sample.json`.

**Display cap:** Increase from 48 → 100. With proper stratification, most domain+year combos will return 20–100 papers in the sample, giving a realistic feel of density without loading everything.

**Python script changes** (update `generate_abstract_sample.py`):
```python
year_buckets = [(2007,2008),(2009,2010),(2011,2012),(2013,2014),
                (2015,2016),(2017,2018),(2019,2020),(2021,2022),(2023,2025)]
PER_BUCKET = 20

for domain in domains:
    for (y1, y2) in year_buckets:
        subset = df_valid[(df_valid['domain']==domain) & 
                          (df_valid['year'].between(y1, y2))]
        n = min(PER_BUCKET, len(subset))
        if n > 0:
            samples.append(subset.sample(n=n, random_state=42))
```

---

## 6. Animation audit — Uniformity + fast-scroll visibility

**Current state (from audit):**
- `duration: 0.6` — 16 occurrences (most common)
- `duration: 0.3` — 15 occurrences  
- `duration: 1.0–1.5` — 12 occurrences (too slow)
- `duration: 0.2–0.25` — 7 occurrences
- Stacked delays in Introduction: 0.3s, 0.5s, 1.0s — last element takes 1.6s to appear
- No `threshold` overrides — all use Framer Motion default (`0.1` amount), fine

**Problems:**
1. Long-duration (1.0–1.5s) elements feel slow on a deliberate read, invisible on fast scroll
2. Stacked delays in Introduction (0.3 → 0.5 → 1.0) means the CTA button never appears for fast scrollers
3. Inconsistency: some sections snap in (0.2s), others drift in (0.8s) — no logic to the variation

**Proposed standard:**
- **Section headings / primary text:** `duration: 0.5` — visible, not sluggish
- **Secondary content blocks (cards, callouts):** `duration: 0.4`
- **UI elements (buttons, chips, badges):** `duration: 0.25`
- **Charts / visualizations:** `duration: 0.6` — slightly longer gives them weight
- **Stacked delays:** max delay `0.2s` for fast-scroll safety. Current `delay: 1.0` in Introduction must go.
- **K-means animation steps:** Keep at 2s each — this is intentional pacing, not a page scroll animation.

**Files to audit and update:**
- `introduction.jsx` — delays 0.3, 0.5, 1.0 → reduce to 0.1, 0.15, 0.2
- `hero.jsx` — delays 0.6, 1.0 → reduce to 0.2, 0.4
- `conclusion.jsx` (dead file — delete)
- All `sections/*.jsx` — sweep for `duration > 0.6` and cut to 0.5

**Also:** Add `viewport={{ once: true, amount: 0.05 }}` globally as a pattern. `amount: 0.05` means the animation triggers as soon as 5% of the element enters the viewport — much more responsive to fast scrolling. Currently most use default (which Framer sets to `0`) but explicit is better.

---

## Priority order for next session

| # | Item | Effort | Impact |
|---|------|--------|--------|
| 1 | Fix LibraryExplorer resample (domain×year stratified, display 100) | Medium — 1 Python script | High — fixes broken filters |
| 2 | ClusterMap timeline in node detail | Low — data is ready in clustersizes.json | High — brings cluster to life |
| 3 | Animation uniformity sweep | Low — find/replace + judgement | Medium — polish |
| 4 | LibraryExplorer windowed card view | Low — CSS + one ref | Medium — UX refinement |
| 5 | Move "About this map" below graph | Trivial — JSX restructure | Low — layout cleanup |
| 6 | Cited papers (Semantic Scholar batch) | Medium — Python script + new UI section | High — makes clusters tangible |

---

## Notes on cited papers API approach

Semantic Scholar batch API is the right call. Single POST with up to 500 ArXiv IDs, get back citation counts in one round trip. Total for 50 clusters at 50 candidates each = 5 batch requests. Whole script runs in under 10 seconds.

Fields to store per paper: `arxivId`, `title`, `year`, `citationCount`, `authors` (first 2 names only). Truncate title to 100 chars. No abstracts needed.

Output: `cited_papers.json` — key by cluster ID, value array of 5 papers sorted by citation count desc.

The "most cited globally vs most cited within cluster" distinction is worth keeping in the UI. Globally most cited = landmark papers (everyone has heard of them). Within-cluster most cited = representative of that specific community. For LLM cluster these will mostly overlap. For niche physics clusters they'll diverge interestingly.
