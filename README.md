# ArXiv Research Trends: An Unsupervised ML Analysis

An interactive scrollytelling website showcasing unsupervised machine learning analysis of 2.4 million scientific papers from ArXiv.

**[Live Demo](https://arxiv-showcase-live-w99p.vercel.app)**

---

## Project Overview

This project applies unsupervised learning techniques to discover hidden patterns in scientific research:

- **2,384,622 papers** analyzed from ArXiv (2007–2025)
- **50 research clusters** discovered through K-Means clustering
- **4 research questions** explored through interactive visualizations
- Year extracted from **v1 submission date** (not update_date — see Data Notes)

### Research Questions

1. **Term Stability** — Which fields have stable vs. evolving vocabulary? (Jaccard similarity across three time windows)
2. **Interdisciplinary Bridges** — Where do research domains intersect, and do they grow faster?
3. **Category Alignment** — How well do content-based clusters match ArXiv's own categorization? (NMI, ARI, purity)
4. **Growing Niches** — Which research areas are experiencing explosive growth? (LLM cluster: 12,303×)

---

## Key Findings

| Finding | Value |
|---------|-------|
| Fastest growing cluster | LLM & Language — **12,303×** growth |
| Interdisciplinary bridges | **34 of 50** clusters span multiple domains |
| Bridge area growth advantage | **421×** faster than single-domain clusters |
| Most stable domain | Theoretical Physics (hep-th) |
| Most evolving domain | Computer Science |
| Mean vocabulary stability | **66.4%** (Jaccard across time windows) |
| Category alignment (NMI) | **0.34** — partial alignment, expected for cross-disciplinary content |

---

## Technical Pipeline

| Stage | Method | Key Parameters |
|-------|--------|---------------|
| **Data** | ArXiv metadata (Kaggle) | 2,384,622 papers, year from versions[0].created |
| **Preprocessing** | NLTK WordNetLemmatizer | Custom stopwords, LaTeX removal, lemmatization |
| **Vectorization** | TF-IDF | 1,000 features, unigrams + bigrams |
| **Dim. Reduction** | TruncatedSVD | 500 components, 73% variance explained |
| **Clustering** | K-Means (L2-normalized) | k=50, selected via elbow + silhouette across k=10–50 |

**Note on silhouette scores:** Scores of 0.01–0.03 are normal for high-dimensional sparse text representations — this is well-documented behaviour for TF-IDF/SVD data, not an indicator of poor clustering quality. Manual inspection confirmed semantically coherent groupings.

---

## Site Architecture

### Sections
The site is a scroll-driven narrative with 9 sections:

1. **Hero** — animated paper constellation, live paper count
2. **Introduction** — project context and research questions
3. **Data Overview** — dataset characteristics, papers over time
4. **Text Preprocessing** — lemmatization pipeline walkthrough
5. **TF-IDF** — vectorization and feature selection
6. **Dimensionality Reduction** — SVD vs PCA comparison
7. **Clustering** — k selection, K-Means result
8. **Results** — 4 interactive research question tabs + cluster explorer
9. **Conclusion** — summary findings

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── components/
│   ├── sections/           # One file per page section
│   │   ├── hero.jsx
│   │   ├── introduction.jsx
│   │   ├── dataoverview.jsx
│   │   ├── textpreprocessing.jsx
│   │   ├── tfidf.jsx
│   │   ├── dimensionalityreduction.jsx
│   │   ├── clustering.jsx
│   │   ├── results.jsx
│   │   └── conclusion.jsx
│   ├── results/
│   │   └── shared.js       # Shared constants & helpers for results tabs
│   ├── ui/                 # Reusable UI components
│   │   ├── sectionnav.jsx
│   │   ├── scrollprogress.jsx
│   │   ├── methodologycallout.jsx
│   │   ├── implementationtoggle.jsx
│   │   └── scrollsection.jsx
│   └── visualizations/     # Animation components (K-Means, SVD, etc.)
├── data/                   # Exported JSON from pipeline
│   ├── papersovertime.json
│   ├── clusterexploration.json
│   ├── q1termstability.json
│   ├── q2bridgeareas.json
│   ├── q3categoryalignment.json
│   └── q4growingniches.json
└── App.jsx
```

---

## Data Notes

### Year Extraction Bug (Fixed)
Early versions used `update_date` for paper year, causing a massive artificial spike in 2015 (199k papers) due to a bulk ArXiv metadata migration. Fixed by extracting year from `versions[0].created` (original v1 submission date). All temporal data recomputed from the raw dataset.

### Cluster Growth Rates
Growth rates in `clusterexploration.json` are stored as plain percentages (e.g. `1230350.0` = 1,230,350% = ~12,303×). Growth rates in `q4growingniches.json` are stored as multipliers. Both are handled by format helpers in the site code.

---

## Getting Started

```bash
git clone https://github.com/aleksandralyu/arxiv-showcase-live.git
cd arxiv-showcase-live
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

---

## Author

**Aleksandra Lyubarskaja**
- GitHub: [@aleksandralyu](https://github.com/aleksandralyu)
- Academic context: Unsupervised Learning coursework, IU International University

## Acknowledgments

- ArXiv / Kaggle for open access to paper metadata
- IU International University for the Unsupervised Learning curriculum
