import ScrollSection from '../ui/scrollsection'
import ImplementationToggle from '../ui/implementationtoggle'
import { TextCleaningVisual } from '../visualizations/textcleaningvisual'

const steps = [
  {
    visual: <TextCleaningVisual stage="dirty" />,
    text: (
      <>
        <p className="mb-4">
          Raw abstracts aren't ready for analysis. They contain inconsistent 
          capitalization, punctuation that adds no meaning, and extra whitespace 
          from copy-paste formatting issues.
        </p>
        <p>
          "Quantum" and "quantum" are the same word, but without normalization, 
          they're two separate vocabulary entries. Standardization reduces 
          spurious dimensionality before vectorization.
        </p>
      </>
    )
  },
  {
    visual: <TextCleaningVisual stage="clean" />,
    text: (
      <>
        <p className="mb-4">
          After cleaning, the text is all lowercase, punctuation removed, whitespace normalized. 
          The vocabulary now reflects actual term usage, not formatting artifacts.
        </p>
        <p className="font-medium text-white">
          Clean text is now ready for vectorization.
        </p>
      </>
    )
  }
]

function TextPreprocessing() {
  return (
    <>
      <ScrollSection
        id="text-preprocessing"
        title="Text Preprocessing"
        subtitle="Preparing 2.4 million abstracts for analysis"
        steps={steps}
        backgroundColor="bg-gray-950"
      />
      
      {/* Implementation Details - Full width at section end */}
      <div className="bg-gray-950 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <ImplementationToggle title="Text Preprocessing Implementation Details">
            <div className="space-y-3">
              {/* Why no stemming */}
              <div className="pb-3 border-b border-gray-700">
                <div className="text-gray-300 mb-2">Why no stemming/lemmatization?</div>
                <div className="text-xs text-gray-400">
                  TF-IDF followed by SVD captures semantic relationships between 
                  word variants through co-occurrence patterns. Explicit stemming 
                  adds computational overhead with marginal benefit for clustering 
                  tasks, and risks conflating distinct technical terms 
                  (e.g., "quantum" and "quantize" share a stem but differ in meaning).
                </div>
              </div>

              {/* Pipeline */}
              <div className="pb-3 border-b border-gray-700">
                <div className="text-gray-300 mb-2">Cleaning pipeline:</div>
                <div className="space-y-1 text-xs">
                  <div><span className="text-blue-400">1.</span> Lowercase conversion</div>
                  <div><span className="text-blue-400">2.</span> Remove special characters</div>
                  <div><span className="text-blue-400">3.</span> Normalize whitespace</div>
                  <div><span className="text-blue-400">4.</span> Strip leading/trailing spaces</div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <div className="text-gray-300 mb-2">Results:</div>
                <div className="space-y-1 text-xs">
                  <div>Average length before: <span className="text-white">1,020 chars</span></div>
                  <div>Average length after: <span className="text-white">983 chars</span></div>
                  <div>Reduction: <span className="text-emerald-400">~3.6%</span> (minimal, as intended)</div>
                </div>
              </div>
            </div>
          </ImplementationToggle>
        </div>
      </div>
    </>
  )
}

export default TextPreprocessing