import ScrollSection from '../ui/scrollsection'
import ImplementationToggle from '../ui/implementationtoggle'
import { TfIdfFormula, SparseMatrixVisual } from '../visualizations/formulavisuals'

const steps = [
  {
    visual: <TfIdfFormula />,
    text: (
      <>
        <p className="mb-4">
          Computers can't read words. They need numbers.
        </p>
        <p className="mb-4">
          TF-IDF converts each abstract into a vector of numbers, one for each term 
          in our vocabulary. The score captures something intuitive: words that appear 
          often in <em>this</em> paper but rarely in <em>others</em> are the most distinctive.
        </p>
        <p className="mb-4">
          A paper about "quantum entanglement" will score high on those terms precisely 
          because most papers don't mention them.
        </p>
        <p className="text-gray-400 text-sm">
          We calculate TF-IDF scores for every term in each paper. Then we identify 
          the 1,000 most frequent terms across the entire corpus—these become our 
          vocabulary. Each paper gets scored on these specific 1,000 terms, creating 
          a 1,000-dimensional vector representation.
        </p>
      </>
    )
  },
  {
    visual: <SparseMatrixVisual highlightSparsity={true} />,
    text: (
      <>
        <p className="mb-4">
          Each paper is now a vector of 1,000 numbers. When we stack all 2.4 million 
          vectors together, we get a matrix: 2.4M rows (papers) × 1,000 columns (terms).
        </p>
        <p className="mb-4">
          Most papers don't contain most terms, so most cells are zero. The matrix 
          is 99.34% sparse—only 0.66% of cells have non-zero values. This isn't a 
          problem, it's a signature. Each paper's pattern of non-zero scores captures 
          exactly which distinctive terms it uses.
        </p>
        <p className="font-medium text-white">
          Now we have numbers. Time to find patterns.
        </p>
      </>
    )
  }
]

function TfIdf() {
  return (
    <>
      <ScrollSection
        id="tfidf"
        title="TF-IDF Vectorization"
        subtitle="Converting words into numbers"
        steps={steps}
        backgroundColor="bg-gray-900"
      />
      
      {/* Implementation Details - Full width at section end */}
      <div className="bg-gray-900 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <ImplementationToggle title="TF-IDF Implementation Details">
            <div className="space-y-3">
              {/* The iteration story */}
              <div className="pb-3 border-b border-gray-700">
                <div className="text-gray-300 mb-2">Finding the right vocabulary size:</div>
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-red-400">10,000 features</span>
                    <span className="text-gray-500"> → 99.3% sparse → too many rare terms</span>
                  </div>
                  <div>
                    <span className="text-amber-400">3,000 features</span>
                    <span className="text-gray-500"> → 98% sparse → still too noisy</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">1,000 features</span>
                    <span className="text-gray-500"> → 99.34% sparse → good balance ✓</span>
                  </div>
                </div>
              </div>

              {/* Final parameters */}
              <div className="space-y-1">
                <div className="text-gray-300 mb-2">Final parameters:</div>
                <div><span className="text-blue-400">max_features</span> = 1000</div>
                <div><span className="text-blue-400">min_df</span> = 10 <span className="text-gray-600"># ignore terms in &lt;10 docs</span></div>
                <div><span className="text-blue-400">max_df</span> = 0.7 <span className="text-gray-600"># ignore terms in &gt;70% of docs</span></div>
                <div><span className="text-blue-400">ngram_range</span> = (1, 2) <span className="text-gray-600"># words + two-word phrases</span></div>
              </div>

              {/* Result stats */}
              <div className="pt-3 border-t border-gray-700 text-xs">
                <div>Matrix: 2,439,566 × 1,000</div>
                <div>Non-zero entries: ~87.5M</div>
                <div>Storage: Sparse CSR format</div>
              </div>
            </div>
          </ImplementationToggle>
        </div>
      </div>
    </>
  )
}

export default TfIdf