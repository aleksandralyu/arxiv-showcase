import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useInView } from '../../hooks/useinview'

export function TfIdfFormula() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [activeHighlight, setActiveHighlight] = useState(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return

    hasAnimatedRef.current = true
    const sequence = ['tf', 'idf', 'result', 'all']
    let index = 0

    setActiveHighlight(sequence[0])

    const interval = setInterval(() => {
      index = index + 1
      if (index < sequence.length) {
        setActiveHighlight(sequence[index])
      } else {
        clearInterval(interval)
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [hasBeenInView])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          Term Frequency–Inverse Document Frequency
        </div>
      </div>

      {/* Main formula */}
      <div className="px-6 py-8">
        <div className="text-center mb-6">
          <div className="text-2xl md:text-3xl text-white font-serif">
            <span className={`transition-all duration-300 ${
              activeHighlight === 'result' 
                ? 'text-blue-400 scale-110 inline-block' 
                : activeHighlight === 'all'
                ? 'text-blue-400'
                : ''
            }`}>
              <span className="italic">w</span>
              <sub className="text-base text-gray-400">t,d</sub>
            </span>
            <span className="mx-3">=</span>
            
            <span className={`transition-all duration-300 ${
              activeHighlight === 'tf' 
                ? 'text-emerald-400 scale-110 inline-block' 
                : activeHighlight === 'all'
                ? 'text-emerald-400'
                : ''
            }`}>
              <span className="italic">tf</span>
              <sub className="text-base text-gray-400">t,d</sub>
            </span>
            
            <span className="mx-2">×</span>
            
            <span className={`transition-all duration-300 inline-flex items-center ${
              activeHighlight === 'idf' 
                ? 'text-amber-400' 
                : activeHighlight === 'all'
                ? 'text-amber-400'
                : ''
            }`}>
              <span>log</span>
              <span className="text-lg mx-0.5">(</span>
              <span className="inline-flex flex-col items-center mx-1">
                <span className="text-lg leading-tight">N</span>
                <span className="w-full h-px bg-current"></span>
                <span className="text-lg leading-tight">
                  df<sub className="text-sm">t</sub>
                </span>
              </span>
              <span className="text-lg mx-0.5">)</span>
            </span>
          </div>
        </div>

        {/* Breakdown boxes */}
        <div className="space-y-3 min-h-[140px] flex flex-col items-center">
          <motion.div
            initial={false}
            animate={{ 
              opacity: (activeHighlight === 'tf' || activeHighlight === 'all') ? 1 : 0.3,
              scale: activeHighlight === 'tf' ? 1 : 0.98
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg w-full"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-emerald-400 font-serif italic">tf</span>
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-emerald-400/80">Term Frequency</span>
              {" = how often this word appears in this document"}
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ 
              opacity: (activeHighlight === 'idf' || activeHighlight === 'all') ? 1 : 0.3,
              scale: activeHighlight === 'idf' ? 1 : 0.98
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg w-full"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-amber-400 font-serif italic">idf</span>
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-amber-400/80">Inverse Doc Frequency</span>
              {" = how rare this word is across all documents"}
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ 
              opacity: (activeHighlight === 'result' || activeHighlight === 'all') ? 1 : 0.3,
              scale: activeHighlight === 'result' ? 1 : 0.98
            }}
            transition={{ duration: 0.3 }}
            className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center w-full"
          >
            <div className="text-sm">
              <span className="text-emerald-400">frequent here</span>
              {" × "}
              <span className="text-amber-400">rare elsewhere</span>
              {" = "}
              <span className="text-blue-400 font-medium">distinctive term</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export function SparseMatrixVisual({ highlightSparsity = false }) {
  const rows = 10
  const cols = 12
  const cells = []
  
  const highlightRow = 4
  const highlightCol = 4
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hash = (r * 17 + c * 31) % 100
      const isActive = hash < 4
      const isHighlighted = (r === highlightRow && c === highlightCol)
      cells.push({ row: r, col: c, isActive: isActive || isHighlighted, isHighlighted })
    }
  }

  const colPercent = ((highlightCol + 0.5) / cols) * 100
  const rowPercent = ((highlightRow + 0.5) / rows) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.3 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
    >
      <div className="text-right text-xs text-gray-500 mb-2">
        1,000 terms (columns) →
      </div>

      <div className="flex">
        <div className="flex items-right justify-center pr-3">
          <div 
            className="text-xs text-gray-500 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            ← 2.4M papers (rows)
          </div>
        </div>

        <div className="flex-1 relative">
          <div 
            className="absolute -top-8 transform -translate-x-1/2 text-xs text-blue-400 flex flex-col items-center"
            style={{ left: `${colPercent}%` }}
          >
            <span className="bg-gray-900/90 px-2 py-0.5 rounded whitespace-nowrap">"neural"</span>
            <div className="w-px h-4 bg-blue-400/50"></div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-400/50"></div>
          </div>

          <div 
            className="grid gap-1 mt-6"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cells.map((cell, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`
                  aspect-square rounded-sm
                  ${cell.isHighlighted 
                    ? 'bg-blue-400 ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-800' 
                    : cell.isActive 
                      ? 'bg-blue-500/80' 
                      : 'bg-gray-700/40'
                  }
                `}
              />
            ))}
          </div>

          <div 
            className="absolute -right-4 transform -translate-y-1/2 translate-x-full text-xs text-blue-400 flex items-center"
            style={{ top: `calc(${rowPercent}% + 1.5rem)` }}
          >
            <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-400/50"></div>
            <div className="w-4 h-px bg-blue-400/50"></div>
            <span className="bg-gray-900/90 px-2 py-0.5 rounded whitespace-nowrap ml-1">Paper #1.8M</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-700 flex justify-between items-center">
        <motion.div 
          className={`text-xs px-2 py-1 rounded transition-all duration-300 ${
            highlightSparsity ? 'text-blue-400 bg-blue-400/10 font-medium' : 'text-gray-500'
          }`}
          animate={highlightSparsity ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5, repeat: highlightSparsity ? 2 : 0 }}
        >
          96.4% zeros
        </motion.div>
        <div className="text-xs text-gray-500">~87.5M non-zero values</div>
      </div>

      {highlightSparsity && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-xs text-blue-400/70 text-center"
        >
          Sparse TF-IDF matrix
        </motion.div>
      )}
    </motion.div>
  )
}