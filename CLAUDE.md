# CLAUDE.md — Project context for AI sessions

## What this is

ArXiv Research Trends — a React scrollytelling site visualising unsupervised ML analysis of 2.4M scientific papers.

**Live site:** https://arxiv-showcase-live-w99p.vercel.app  
**Always push to both remotes after committing:**
```bash
git push live main && git push origin main
```
`live` = `arxiv-showcase-live` (Vercel watches this)  
`origin` = `arxiv-showcase` (backup/dev)

---

## Dev server

```bash
npm run dev -- --port 5181
```
Configured in `.claude/launch.json`. Build: `npm run build` → `dist/`.

---

## Tech stack

- React 18 + Vite
- Tailwind CSS v4 (use `className`, not inline styles for layout)
- Framer Motion (scroll animations — `whileInView`, `viewport={{ once: true, amount: 0.05 }}`)
- Recharts (charts inside Results tabs)
- Custom SVG force layout in ClusterMap (no D3, no react-force-graph)

---

## Architecture

```
src/
├── components/
│   ├── sections/        # One component per page section
│   │   ├── hero.jsx
│   │   ├── libraryexplorer.jsx   # NEW — paper browser intro
│   │   ├── introduction.jsx
│   │   ├── dataoverview.jsx
│   │   ├── textpreprocessing.jsx
│   │   ├── tfidf.jsx
│   │   ├── dimensionalityreduction.jsx
│   │   ├── clustering.jsx
│   │   ├── results.jsx           # 5 analysis tabs
│   │   └── clustermap.jsx        # NEW — force graph conclusion
│   ├── ui/              # ScrollSection, SectionNav, ImplementationToggle, etc.
│   └── visualizations/  # KMeansAnimation, EvaluationChart, etc.
└── data/                # All static JSON — see README for key files
```

Page order in `App.jsx`:
`Hero → LibraryExplorer → Introduction → DataOverview → TextPreprocessing → TfIdf → DimensionalityReduction → Clustering → Results → ClusterMap`

---

## Data pipeline (Python, separate repo area)

Notebooks live in `../arxiv_case_study 2.0/`.  
Processed data: `../arxiv_case_study 2.0/data/processed/*.pkl`  
Key files: `kmeans_model_500d.pkl` (load with `joblib`, not `pickle`), `cluster_labels_500d.pkl`, `arxiv_metadata_features.pkl`, `clustersizes.json`.

Export scripts: any new analysis exports JSON directly to `src/data/`.

---

## Important conventions

- `cluster_graph.json` nodes: `domain` is a plain string (`"Computer Science"`, not an object)
- `clusterexploration.json`: `primaryDomain` is an object `{code, name}` — use `.name` when needed
- Growth rates in `clusterexploration.json` are stored as raw percentages (e.g. `1230350` = 12,303×)
- Year extraction: always use `versions[0].created`, never `update_date` (causes 2015 spike artefact)
- Animation standard: `duration: 0.5` for content, `0.25` for UI, max `delay: 0.2` — see IMPROVEMENTS.md

---

## Current backlog

See `IMPROVEMENTS.md` — 6 items, prioritised, fully specced.  
Start with **Item 1** (LibraryExplorer stratified resample) then **Item 2** (cluster timeline).
