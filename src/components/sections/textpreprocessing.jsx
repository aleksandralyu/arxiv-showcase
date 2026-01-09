import ScrollSection from '../ui/scrollsection'
import ImplementationToggle from '../ui/implementationtoggle'
import { TextCleaningVisual } from '../visualizations/textcleaningvisual'

const steps = [
  {
    visual: <TextCleaningVisual stage="dirty" />,
    text: (
      <>
        <p className="mb-4">
          Raw abstracts contain noise that would pollute our analysis: inconsistent 
          capitalization, LaTeX math notation, punctuation, and generic academic 
          phrases that appear in every paper but carry no distinguishing meaning.
        </p>
        <p>
          "Quantum" and "quantum" would be counted as different words. LaTeX artifacts 
          like "mathbb" and "frac" would appear as top terms. Phrases like "in this paper 
          we propose" add nothing distinctive. We need to clean systematically.
        </p>
      </>
    )
  },
  {
    visual: <TextCleaningVisual stage="clean" />,
    text: (
      <>
        <p className="mb-4">
          After cleaning: lowercase, no punctuation, no LaTeX artifacts, no boilerplate 
          phrases. We also <em>lemmatize</em>—reducing words to their base form so 
          "networks," "networking," and "networked" all become "network."
        </p>
        <p className="font-medium text-white">
          The result is clean, normalized text where vocabulary reflects actual 
          scientific concepts, not formatting noise.
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
            <div className="space-y-4">
              
              {/* Pipeline Steps */}
              <div className="pb-4 border-b border-gray-700">
                <div className="text-gray-300 mb-3 font-medium">Cleaning Pipeline</div>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-mono w-4">1.</span>
                    <div>
                      <span className="text-gray-200">Lowercase conversion</span>
                      <span className="text-gray-500 ml-2">— "Quantum" → "quantum"</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-mono w-4">2.</span>
                    <div>
                      <span className="text-gray-200">Remove special characters</span>
                      <span className="text-gray-500 ml-2">— keep only letters and spaces</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-mono w-4">3.</span>
                    <div>
                      <span className="text-gray-200">Normalize whitespace</span>
                      <span className="text-gray-500 ml-2">— collapse multiple spaces</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-mono w-4">4.</span>
                    <div>
                      <span className="text-gray-200">Tokenize</span>
                      <span className="text-gray-500 ml-2">— split into individual words</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-mono w-4">5. </span>
                    <div>
                      <span className="text-gray-200">Remove stopwords</span>
                      <span className="text-gray-500 ml-2">— NLTK defaults + custom scientific terms</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-mono w-4">6.</span>
                    <div>
                      <span className="text-gray-200">Remove short words</span>
                      <span className="text-gray-500 ml-2">— filter tokens &lt; 3 characters</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-mono w-4">7.</span>
                    <div>
                      <span className="text-gray-200">Remove LaTeX artifacts</span>
                      <span className="text-gray-500 ml-2">— mathbb, frac, textit, etc.</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-400 font-mono w-4">8.</span>
                    <div>
                      <span className="text-gray-200">Lemmatize</span>
                      <span className="text-gray-500 ml-2">— "networks" → "network", "computed" → "compute"</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Stopwords */}
              <div className="pb-4 border-b border-gray-700">
                <div className="text-gray-300 mb-2 font-medium">Custom Stopwords (60+ terms)</div>
                <div className="text-xs text-gray-400 mb-2">
                  Beyond NLTK defaults, we remove academic boilerplate that appears across all fields:
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">paper</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">study</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">propose</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">present</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">result</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">show</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">method</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">approach</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-red-400">mathbb</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-red-400">frac</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-red-400">infty</code>
                  <code className="bg-gray-800 px-2 py-0.5 rounded text-gray-500">+ 50 more...</code>
                </div>
              </div>

              {/* Lemmatization */}
              <div className="pb-4 border-b border-gray-700">
                <div className="text-gray-300 mb-2 font-medium">Why Lemmatization?</div>
                <div className="text-xs text-gray-400 space-y-2">
                  <p>
                    We use NLTK's WordNetLemmatizer with a two-pass approach: first as noun 
                    (handles plurals like "objects" → "object"), then as verb (handles tenses 
                    like "computed" → "compute").
                  </p>
                  <p>
                    Unlike aggressive stemming (Porter/Snowball), lemmatization preserves 
                    word integrity—"quantum" stays "quantum," not "quantu." This matters 
                    for scientific text where precise terminology is meaningful.
                  </p>
                </div>
              </div>

              {/* Code snippet */}
              <div className="pb-4 border-b border-gray-700">
                <div className="text-gray-300 mb-2 font-medium">Implementation</div>
                <pre className="text-xs bg-gray-800/50 p-3 rounded-lg overflow-x-auto">
                  <code className="text-gray-300">{`from nltk.stem import WordNetLemmatizer
lemmatizer = WordNetLemmatizer()

# Two-pass lemmatization
lemma_noun = lemmatizer.lemmatize(word, pos='n')
lemma_verb = lemmatizer.lemmatize(lemma_noun, pos='v')`}</code>
                </pre>
              </div>

              {/* Results */}
              <div>
                <div className="text-gray-300 mb-2 font-medium">Results</div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-gray-800/30 p-3 rounded">
                    <div className="text-gray-500 mb-1">Before</div>
                    <div className="text-white">~1,020 chars avg</div>
                    <div className="text-gray-400 text-[10px] mt-1">Raw abstract with all tokens</div>
                  </div>
                  <div className="bg-gray-800/30 p-3 rounded">
                    <div className="text-gray-500 mb-1">After</div>
                    <div className="text-white">~450 chars avg</div>
                    <div className="text-gray-400 text-[10px] mt-1">Clean, lemmatized tokens only</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  ~56% reduction in text length, but 100% of meaningful scientific vocabulary preserved.
                </div>
              </div>
            </div>
          </ImplementationToggle>
        </div>
      </div>

      {/* Divider after toggle */}
      <div className="border-t border-gray-800 mx-auto max-w-6xl" />
    </>
  )
}

export default TextPreprocessing