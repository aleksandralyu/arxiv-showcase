import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useInView } from '../../hooks/useinview'

const tokens = [
  { id: 1, text: "A", clean: "a", type: "word", hasCase: false },
  { id: 2, text: "Fully", clean: "fully", type: "word", hasCase: true },
  { id: 3, text: "Differential", clean: "differential", type: "word", hasCase: true },
  { id: 4, text: "calculation", clean: "calculation", type: "word", hasCase: false },
  { id: 5, text: "in", clean: "in", type: "word", hasCase: false },
  { id: 6, text: "perturbative", clean: "perturbative", type: "word", hasCase: false },
  { id: 7, text: "quantum", clean: "quantum", type: "word", hasCase: false },
  { id: 8, text: "chromodynamics", clean: "chromodynamics", type: "word", hasCase: false },
  { id: 9, text: "is", clean: "is", type: "word", hasCase: false },
  { id: 10, text: "presented", clean: "presented", type: "word", hasCase: false },
  { id: 11, text: "for", clean: "for", type: "word", hasCase: false },
  { id: 12, text: "the", clean: "the", type: "word", hasCase: false },
  { id: 13, text: "production", clean: "production", type: "word", hasCase: false },
  { id: 14, text: "of", clean: "of", type: "word", hasCase: false },
  { id: 15, text: "massive", clean: "massive", type: "word", hasCase: false },
  { id: 16, text: "photon", clean: "photon", type: "word", hasCase: false },
  { id: 17, text: "pairs", clean: "pairs", type: "word", hasCase: false },
  { id: 18, text: "at", clean: "at", type: "word", hasCase: false },
  { id: 19, text: "hadron", clean: "hadron", type: "word", hasCase: false },
  { id: 20, text: "colliders", clean: "colliders", type: "word", hasCase: false },
  { id: 21, text: ".", clean: null, type: "punctuation" },
  { id: 22, text: "All", clean: "all", type: "word", hasCase: true },
  { id: 23, text: "next", clean: "next", type: "word", hasCase: false },
  { id: 24, text: "-", clean: null, type: "punctuation" },
  { id: 25, text: "to", clean: "to", type: "word", hasCase: false },
  { id: 26, text: "-", clean: null, type: "punctuation" },
  { id: 27, text: "leading", clean: "leading", type: "word", hasCase: false },
  { id: 28, text: "order", clean: "order", type: "word", hasCase: false },
  { id: 29, text: "perturbative", clean: "perturbative", type: "word", hasCase: false },
  { id: 30, text: "contributions", clean: "contributions", type: "word", hasCase: false },
  { id: 31, text: "from", clean: "from", type: "word", hasCase: false },
  { id: 32, text: "quark", clean: "quark", type: "word", hasCase: false },
  { id: 33, text: "-", clean: null, type: "punctuation" },
  { id: 34, text: "antiquark", clean: "antiquark", type: "word", hasCase: false },
  { id: 35, text: ",", clean: null, type: "punctuation" },
  { id: 36, text: "gluon", clean: "gluon", type: "word", hasCase: false },
  { id: 37, text: "-", clean: null, type: "punctuation" },
  { id: 38, text: "(", clean: null, type: "punctuation" },
  { id: 39, text: "anti", clean: "anti", type: "word", hasCase: false },
  { id: 40, text: ")", clean: null, type: "punctuation" },
  { id: 41, text: "quark", clean: "quark", type: "word", hasCase: false },
  { id: 42, text: "...", clean: null, type: "punctuation" },
]

export function TextCleaningVisual({ stage = "dirty" }) {
  const { ref, hasBeenInView } = useInView(0.3)
  const isClean = stage === "clean"

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

      {/* Content - only render tokens after component has been in view */}
      <div className="p-6">
        {hasBeenInView ? (
          <LayoutGroup>
            <motion.div 
              layout
              className="font-mono text-sm leading-loose flex flex-wrap gap-x-2 gap-y-1"
            >
              <AnimatePresence mode="popLayout">
                {tokens.map((token) => {
                  if (isClean && token.type === "punctuation") {
                    return null
                  }

                  if (token.hasCase) {
                    if (isClean) {
                      return (
                        <motion.span
                          key={`${token.id}-clean`}
                          layoutId={`token-${token.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            layout: { duration: 2.0, ease: "easeInOut" },
                            opacity: { duration: 1.5, delay: 1.5 }
                          }}
                          className="text-emerald-400"
                        >
                          {token.clean}
                        </motion.span>
                      )
                    } else {
                      return (
                        <motion.span
                          key={`${token.id}-dirty`}
                          layoutId={`token-${token.id}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 1.5, delay: 0.5 } }}
                          transition={{
                            layout: { duration: 2.0, ease: "easeInOut" },
                            opacity: { duration: 1.0 }
                          }}
                          className="text-amber-400 bg-amber-400/15 rounded px-0.5"
                        >
                          {token.text}
                        </motion.span>
                      )
                    }
                  }

                  if (token.type === "punctuation") {
                    return (
                      <motion.span
                        key={token.id}
                        layoutId={`token-${token.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 1.3, delay: 0.2 } }}
                        transition={{
                          layout: { duration: 2.0, ease: "easeInOut" },
                          opacity: { duration: 1.0 }
                        }}
                        className="text-purple-400 bg-purple-400/15 rounded px-0.5"
                      >
                        {token.text}
                      </motion.span>
                    )
                  }

                  return (
                    <motion.span
                      key={token.id}
                      layoutId={`token-${token.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        layout: { duration: 2.0, ease: "easeInOut" },
                        opacity: { duration: 1.5 }
                      }}
                      className={isClean ? "text-emerald-400" : "text-gray-300"}
                    >
                      {isClean ? token.clean : token.text}
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
                className="flex items-center justify-between text-xs"
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-400/20 border border-amber-400/50"></span>
                    <span className="text-gray-400">Inconsistent case</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-purple-400/20 border border-purple-400/50"></span>
                    <span className="text-gray-400">Punctuation to remove</span>
                  </div>
                </div>
                <div className="text-red-400">Needs processing</div>
              </motion.div>
            ) : (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-between text-xs"
              >
                <div className="text-gray-400">Lowercase · No punctuation · Normalized</div>
                <div className="text-emerald-400">Ready for TF-IDF →</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}