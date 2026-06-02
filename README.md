# ArXiv Research Trends

Interactive scrollytelling website — unsupervised ML analysis of 2.4 million ArXiv papers.

**Live:** https://arxiv-showcase-live-w99p.vercel.app  
**Repo (deploy):** https://github.com/aleksandralyu/arxiv-showcase-live  
**Repo (dev):** https://github.com/aleksandralyu/arxiv-showcase

---

## What it is

A scroll-driven data story applying K-Means clustering to discover hidden structure in scientific literature.

Key findings:
- **50 clusters** from 2.4M papers — grouped by abstract content, not ArXiv categories
- **LLM cluster** grew 12,303× since 2020 — a field that barely existed before 2022
- **34 of 50 clusters** span multiple research domains (interdisciplinary bridges)
- **Math clusters** show 50–56% cross-domain migration — mathematical vocabulary is universal

---

## Site sections

| Section | What it shows |
|---------|--------------|
| Hero | Animated paper constellation |
| Library Explorer | 2.4M papers browsable by field + year — visceral scale problem |
| Introduction | Project framing |
| Data → Clustering | Full ML pipeline: preprocessing, TF-IDF, SVD, K-Means |
| Results | 5 tabs: Term Stability · Bridge Areas · Category Alignment · Growing Niches · Field Lifecycles |
| Cluster Map | Force-directed graph of all 50 clusters — pan/zoom/explore — serves as conclusion |

---

## Stack

React 18 + Vite · Tailwind CSS v4 · Framer Motion · Recharts · Vercel

```bash
npm install && npm run dev   # :5181
npm run build                # → dist/
```

**Deploy:** Vercel watches `arxiv-showcase-live` main — auto-deploys on push.  
**Always push to both remotes:**
```bash
git push live main && git push origin main
```

---

## Key data files

| File | Contents |
|------|----------|
| `clusterexploration.json` | 50 clusters — labels, terms, domain, growth, temporalCohesion |
| `clustersizes.json` | Sizes + `papersByYear` time series per cluster |
| `cluster_graph.json` | 50 nodes + 207 cosine-similarity edges |
| `abstract_sample.json` | 896 real papers for Library Explorer |
| `temporal_cohesion.json` | IQR + emergence quadrant per cluster (NB 9f) |
| `q5_misalignments.json` | Cross-domain migration rates (NB 9e) |

---

## Roadmap & backlog

`ROADMAP.md` — planned sessions  
`IMPROVEMENTS.md` — immediate backlog, fully specced, start here next session
