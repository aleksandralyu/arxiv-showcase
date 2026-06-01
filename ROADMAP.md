# Website Roadmap

## Status: Post-Session 4 (May–June 2026)

### What's live
- Hero (constellation, count-up)
- LibraryExplorer — interactive paper browser, split panel, 896 real papers, domain + year filters
- Introduction (needs rewrite — see Session 2)
- Data Overview, Text Preprocessing, TF-IDF, Dimensionality Reduction (viz improvement pending — see Session 3)
- Clustering — K-means animation (assign/update decoupled fix applied), evaluation chart, cluster overview, cluster examples with descriptions
- Results — 6 tabs: Vocabulary Stability (Q1), Bridge Areas (Q2), Category Alignment (Q3 + Q5 migration), Growing Niches (Q4), Field Lifecycles (Q6), Explore Clusters
- ClusterMap — force-directed conclusion, 50 nodes, 207 real cosine similarity edges, color by domain/quadrant toggle, node detail panel

---

## Session 1 — Visual Verification + Critical Fixes
**Goal:** See everything, fix what's broken before writing anything

### LibraryExplorer
- [ ] Verify year slider two-handle UX — fix z-index when min=max
- [ ] Stagger card animation on first load (delay: i * 0.02, cap at 0.3s)
- [ ] Fix wording: "sample papers" → just show estimated real count
- [ ] Check estimated count logic feels honest (linear year fraction is a rough approx)

### ClusterMap
- [ ] Verify force layout converges to something readable (may need physics tuning)
- [ ] Add pan/zoom/navigate — full spec in session notes (no new library, ~120 lines)
  - Wheel = zoom around cursor, drag background = pan, double-click = reset
  - Labels appear at zoom ≥ 1.5 for all clusters
  - Touch support (pinch + single-finger pan)
  - +/−/reset UI controls bottom-right
- [ ] Verify color toggle domain/quadrant works correctly (fixed in audit)

### Results
- [ ] Remove Explore tab — redundant with ClusterMap, cuts tabs from 7 to 6
- [ ] Verify Q6 Field Lifecycles chart readability
- [ ] Verify Q5 migration bar chart labels

### K-means animation
- [ ] Verify assign/update decoupling looks correct at actual playback speed

---

## Session 2 — Introduction Rewrite + Narrative Bridge
**Goal:** Connect LibraryExplorer → Introduction → methodology in a way that earns each section

### Introduction rewrite
- Three options drafted (see session notes). Recommendation: Option C (researcher mirror)
- Cut: "Why does this matter?" audience grid — too generic
- Cut: "humble attempt" framing — undersells
- Keep: "Jump to results" escape hatch
- Keep: The Approach paragraph (factually solid, just needs to follow better setup)

### Cluster descriptions review
- 6 clusters still flagged `review: true`: C02, C05, C17, C31, C44, C49
- Check descriptions in clusterexploration.json, revise with user

### LibraryExplorer → Introduction transition
- LibraryExplorer ends with a note about scale
- Introduction should open by acknowledging the experience, not re-explaining it
- One sentence bridge: something the user recognizes from what they just did

---

## Session 3 — Dimensionality Reduction Visualization
**Goal:** Replace abstract cube animation with something that shows actual data

### Current state
- 3D cube → 2D square morph (geometric illustration, not real data)
- SVD formula display
- Variance explained chart (static recharts line)

### Proposed: 2D scatter of actual SVD-projected data
- Load a sample of real papers from svd_reduced_500d.pkl, project to 2D with another SVD pass
- ~500 point sample, colored by cluster assignment
- Show before-state (random/PCA mess) and after-state (SVD structure)
- This is the only place in the site where the user sees actual paper positions in space
- Bridges directly into clustering — the scatter becomes the input to K-means

### Python work needed
- Extract 500 random papers per cluster → 25,000 points total is too many
- Better: 20 papers per cluster × 50 clusters = 1,000 points
- Project SVD-500d coords to 2D (t-SNE or further SVD)
- Export as scatter_2d.json: [{x, y, cluster, domain}]

---

## Session 4 — Mobile + Performance
**Goal:** Functional on tablet/phone, faster load

### Performance
- Code-split Results section with React.lazy (heaviest component)
- Lazy-load LibraryExplorer and ClusterMap (together ~370KB data JSON)
- Remove react-force-graph-2d from node_modules if it wasn't actually used (installed but custom force sim was used instead)
- Target: first meaningful paint under 2s on 4G

### Mobile
- LibraryExplorer: filters above, cards below (already has flex-col on small screens — verify)
- ClusterMap: tap = select (hover doesn't work on touch), pinch zoom (covered in Session 1 spec)
- Results tabs: horizontal scroll on mobile
- Clustering section scroll steps: verify swipe behavior

---

## Session 5 — Analysis Completion (conditional)
**Goal:** Run notebooks 9g/9h, add to site only if findings are strong

### Notebooks
- 9g: Emergence detection (skeleton written, not executed)
- 9h: Term migration across time (skeleton written, not executed)

### Decision gate
- Run both, review outputs
- Only add to site if finding is genuinely new (not already captured by Q4/Q6)
- If new: likely extends Q4 Growing Niches tab or becomes a 7th tab

---

## Deployment
**When:** After Session 4
**Options:**
- Vercel (recommended) — zero config, SPA routing, free, custom domain
- GitHub Pages — requires hash routing or 404 redirect trick
- Netlify — same as Vercel, either works

**Steps:**
1. `npm run build` → verify dist/
2. Push to GitHub
3. Connect repo to Vercel → auto-deploys on push
4. Set custom domain if desired

---

## Known debt
- `conclusion.jsx` — dead file, not imported, can be deleted
- `react-force-graph-2d` installed in node_modules but not used (custom force sim was written instead) — can be removed with `npm uninstall react-force-graph-2d`
- `samplepaper.json` — may be stale/unused, verify
- Notebooks 9g, 9h — skeleton only, not executed
