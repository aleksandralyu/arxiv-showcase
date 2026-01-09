# ArXiv Research Trends: An Unsupervised ML Analysis

An interactive scrollytelling website showcasing unsupervised machine learning analysis of 2.4 million scientific papers from ArXiv.

**[Live Demo](https://arxiv-showcase-live-w99p.vercel.app)**

---

## 📊 Project Overview

This project applies unsupervised learning techniques to discover hidden patterns in scientific research:

- **2,384,622 papers** analyzed from ArXiv (1991-2024)
- **50 research clusters** discovered through K-Means clustering
- **4 research questions** explored through interactive visualizations

### Research Questions

1. **Term Stability** — Which fields have stable vs. evolving vocabulary?
2. **Interdisciplinary Bridges** — Where do research domains intersect?
3. **Category Alignment** — How well do content-based clusters match ArXiv's categories?
4. **Growing Niches** — Which research areas are experiencing explosive growth?

---

## Technical Pipeline

| Stage | Method | Details |
|-------|--------|---------|
| **Preprocessing** | NLTK WordNetLemmatizer | Custom stopwords, LaTeX removal, lemmatization |
| **Vectorization** | TF-IDF | 1,000 features, unigrams + bigrams |
| **Dimensionality Reduction** | TruncatedSVD | 500 components (73% variance explained) |
| **Clustering** | K-Means | k=50, L2 normalization |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/aleksandralyu/arxiv-showcase-live.git
cd arxiv-showcase-live

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── sections/          # Main content sections
│   │   ├── Hero.jsx
│   │   ├── Introduction.jsx
│   │   ├── DataOverview.jsx
│   │   ├── TextPreprocessing.jsx
│   │   ├── TfIdf.jsx
│   │   ├── DimensionalityReduction.jsx
│   │   ├── Clustering.jsx
│   │   ├── Results.jsx
│   │   └── Conclusion.jsx
│   ├── ui/                # Reusable components
│   └── visualizations/    # Chart and animation components
├── data/                  # JSON data files
├── hooks/                 # Custom React hooks
└── App.jsx
```

---

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Deployment:** Vercel

---

## Key Findings

- **LLMs & Neural Networks** — Fastest growing cluster with 990%+ growth rate
- **28 Interdisciplinary Bridges** — Growing 30-50% faster than single-domain areas
- **Vocabulary Evolution** — Math fields show stability while ML terminology evolves rapidly
- **Category Misalignment** — Content-based clustering reveals structure invisible to traditional categorization

---

## License

This project is part of an academic case study for unsupervised learning coursework.

---

## Author

**Aleksandra Lyubarskaja**

- GitHub: [@aleksandralyu](https://github.com/aleksandralyu)

---

## Acknowledgments

- ArXiv for providing open access to scientific paper metadata and dataset from Kaggle
- IU International University for the Unsupervised Learning curriculum