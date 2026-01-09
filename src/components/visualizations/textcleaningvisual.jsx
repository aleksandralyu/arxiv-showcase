import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useInView } from '../../hooks/useinview'

// Example abstract snippet that showcases all our preprocessing steps:
// - Capitalization issues (Fully, Differential, All)
// - Punctuation (., -, etc.)
// - LaTeX artifacts (mathbb, frac)
// - Stopwords/boilerplate (we, propose, this, paper, study)
// - Lemmatization candidates (networks → network, computed → compute)

const tokens = [
  // "We propose a study of neural networks using $\mathbb{R}$ spaces."
  { id: 1, text: "We", clean: null, type: "stopword" },
  { id: 2, text: "propose", clean: null, type: "stopword" },
  { id: 3, text: "a", clean: null, type: "stopword" },
  { id: 4, text: "study", clean: null, type: "stopword" },
  { id: 5, text: "of", clean: null, type: "stopword" },
  { id: 6, text: "Neural", clean: "neural", type: "word", hasCase: true },
  { id: 7, text: "networks", clean: "network", type: "lemma", lemmaFrom: "networks" },
  { id: 8, text: "using", clean: null, type: "stopword" },
  { id: 9, text: "mathbb", clean: null, type: "latex" },
  { id: 10, text: "R", clean: null, type: "short" },
  { id: 11, text: "spaces", clean: "space", type: "lemma", lemmaFrom: "spaces" },
  { id: 12, text: ".", clean: null, type: "punctuation" },
  
  // "The computed results show improved performance on classification tasks."
  { id: 13, text: "The", clean: null, type: "stopword" },
  { id: 14, text: "computed", clean: "compute", type: "lemma", lemmaFrom: "computed" },
  { id: 15, text: "results", clean: null, type: "stopword" },
  { id: 16, text: "show", clean: null, type: "stopword" },
  { id: 17, text: "improved", clean: "improve", type: "lemma", lemmaFrom: "improved" },
  { id: 18, text: "performance", clean: "performance", type: "word", hasCase: false },
  { id: 19, text: "on", clean: null, type: "stopword" },
  { id: 20, text: "Classification", clean: "classification", type: "word", hasCase: true },
  { id: 21, text: "tasks", clean: "task", type: "lemma", lemmaFrom: "tasks" },
  { id: 22, text: ".", clean: null, type: "punctuation" },
  
  // "Our method uses frac{1}{n} normalization and achieves state-of-the-art accuracy."
  { id: 23, text: "Our", clean: null, type: "stopword" },
  { id: 24, text: "method", clean: null, type: "stopword" },
  { id: 25, text: "uses", clean: null, type: "stopword" },
  { id: 26, text: "frac", clean: null, type: "latex" },
  { id: 27, text: "normalization", clean: "normalization", type: "word", hasCase: false },
  { id: 28, text: "and", clean: null, type: "stopword" },
  { id: 29, text: "achieves", clean: "achieve", type: "lemma", lemmaFrom: "achieves" },
  { id: 30, text: "state", clean: "state", type: "word", hasCase: false },
  { id: 31, text: "-", clean: null, type: "punctuation" },
  { id: 32, text: "of", clean: null, type: "stopword" },
  { id: 33, text: "-", clean: null, type: "punctuation" },
  { id: 34, text: "the", clean: null, type: "stopword" },
  { id: 35, text: "-", clean: null, type: "punctuation" },
  { id: 36, text: "art", clean: "art", type: "word", hasCase: false },
  { id: 37, text: "accuracy", clean: "accuracy", type: "word", hasCase: false },
  { id: 38, text: ".", clean: null, type: "punctuation" },
]

// Color scheme for different token types
const getTokenStyle = (token, isClean) => {
  if (isClean) {
    return "text-emerald-400"
  }
  
  switch (token.type) {
    case "latex":
      return "text-red-400 bg-red-400/15 rounded px-0.5"
    case "stopword":
      return "text-amber-400 bg-amber-400/10 rounded px-0.5"
    case "punctuation":
      return "text-purple-400 bg-purple-400/15 rounded px-0.5"
    case "lemma":
      return "text-blue-400 bg-blue-400/10 rounded px-0.5"
    case "short":
      return "text-gray-500 bg-gray-500/15 rounded px-0.5"
    case "word":
      return token.hasCase 
        ? "text-cyan-400 bg-cyan-400/10 rounded px-0.5" 
        : "text-gray-300"
    default:
      return "text-gray-300"
  }
}

export function TextCleaningVisual({ stage = "dirty" }) {
  const { ref, hasBeenInView } = useInView(0.3)
  const isClean = stage === "clean"

  // Filter tokens for clean view - only keep words that survive preprocessing
  const visibleTokens = isClean 
    ? tokens.filter(t => t.clean !== null)
    : tokens

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          {isClean ? "Cleaned Abstract" : "Raw Abstract"}
        </div>
        <motion.div 
          layout
          className={`text-xs px-2 py-1 rounded ${
            isClean 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isClean ? "After" : "Before"}
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        {hasBeenInView ? (
          <LayoutGroup>
            <motion.div 
              layout
              className="font-mono text-sm leading-loose flex flex-wrap gap-x-2 gap-y-1"
            >
              <AnimatePresence mode="popLayout">
                {visibleTokens.map((token) => {
                  const displayText = isClean ? token.clean : token.text
                  
                  // Determine exit delay based on type (staggered removal)
                  const getExitDelay = () => {
                    switch (token.type) {
                      case "punctuation": return 0.1
                      case "latex": return 0.3
                      case "short": return 0.4
                      case "stopword": return 0.6
                      default: return 0.8
                    }
                  }

                  return (
                    <motion.span
                      key={`${token.id}-${isClean ? 'clean' : 'dirty'}`}
                      layoutId={`token-${token.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.8, 
                        transition: { duration: 0.8, delay: getExitDelay() } 
                      }}
                      transition={{
                        layout: { duration: 1.5, ease: "easeInOut" },
                        opacity: { duration: 0.8, delay: isClean ? 1.2 : 0 }
                      }}
                      className={getTokenStyle(token, isClean)}
                    >
                      {displayText}
                    </motion.span>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        ) : (
          <div className="min-h-[120px]" /> 
        )}

        {/* Legend */}
        <motion.div layout className="mt-6 pt-4 border-t border-gray-700">
          <AnimatePresence mode="wait">
            {!isClean ? (
              <motion.div
                key="legend"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-red-400/20 border border-red-400/50"></span>
                    <span className="text-gray-400">LaTeX artifacts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-400/20 border border-amber-400/50"></span>
                    <span className="text-gray-400">Stopwords</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-purple-400/20 border border-purple-400/50"></span>
                    <span className="text-gray-400">Punctuation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-400/20 border border-blue-400/50"></span>
                    <span className="text-gray-400">To lemmatize</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-cyan-400/20 border border-cyan-400/50"></span>
                    <span className="text-gray-400">Case issues</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-red-400 text-xs">Needs processing</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  <span>✓ Lowercase</span>
                  <span>✓ No punctuation</span>
                  <span>✓ No LaTeX</span>
                  <span>✓ No stopwords</span>
                  <span>✓ Lemmatized</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    38 tokens → 14 tokens <span className="text-emerald-400">(63% reduction)</span>
                  </div>
                  <div className="text-emerald-400 text-xs">Ready for TF-IDF →</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}