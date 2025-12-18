import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useInView } from '../../hooks/useinview'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { getCategoryLabel } from '../../data/arxivcategories'

import papersOverTime from '../../data/papersovertime.json'
import topCategories from '../../data/topcategories.json'
import samplePaper from '../../data/samplepaper.json'

// ============================================================================
// STEP 1: Paper Mockup
// ============================================================================

export function PaperMockup() {
  const { ref, hasBeenInView } = useInView(0.3)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: hasBeenInView ? 1 : 0, y: hasBeenInView ? 0 : 20 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-gray-800 shadow-2xl rounded-sm aspect-[1/1.414] p-8 relative overflow-hidden border border-gray-700">
        
        <div className="absolute top-4 left-4 font-mono text-xs text-gray-500">
          arXiv:{samplePaper.id}
        </div>

        <div className="mt-8 mb-3 text-center">
          <h3 className="text-white font-bold text-lg leading-tight">
            {samplePaper.title}
          </h3>
        </div>

        <div className="text-center text-sm text-gray-400 mb-2">
          {samplePaper.authors}
        </div>

        <div className="text-center mb-4">
          <div className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
            {samplePaper.update_date}
          </div>
        </div>

        <div className="border-t border-gray-600 my-4"></div>

        <div className="mb-4">
          <div className="font-bold text-white text-sm mb-2">Abstract</div>
          <div className="text-gray-300 text-xs leading-relaxed">
            {samplePaper.abstract.substring(0, 280)}...
          </div>
        </div>

        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="h-2 bg-gray-600 rounded"
              style={{ width: i === 7 ? '60%' : '100%' }}
            />
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/30">
            {samplePaper.categories}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// STEP 2: Data Extraction
// ============================================================================

export function DataExtraction() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [phase, setPhase] = useState('paper')
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    setTimeout(() => setPhase('grey'), 800)
    setTimeout(() => setPhase('extracting'), 1200)
  }, [hasBeenInView])

  return (
    <motion.div ref={ref} className="relative min-h-[600px]">
      <motion.div
        animate={{ 
          opacity: phase === 'paper' ? 1 : 0.15,
          scale: phase === 'paper' ? 1 : 0.95
        }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-gray-800 shadow-2xl rounded-sm aspect-[1/1.414] p-8 relative overflow-hidden border border-gray-700">
          <div className="absolute top-4 left-4 font-mono text-xs text-gray-500">
            arXiv:{samplePaper.id}
          </div>

          <motion.div 
            className="mt-8 mb-3 text-center"
            animate={{
              scale: phase === 'extracting' ? 1.03 : 1,
              filter: phase === 'extracting' ? 'brightness(1.5)' : 'brightness(1)'
            }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-white font-bold text-lg leading-tight">
              {samplePaper.title}
            </h3>
          </motion.div>

          <div className="text-center text-sm text-gray-400 mb-2">
            {samplePaper.authors}
          </div>

          <motion.div 
            className="text-center mb-4"
            animate={{
              scale: phase === 'extracting' ? 1.03 : 1,
              filter: phase === 'extracting' ? 'brightness(1.5)' : 'brightness(1)'
            }}
            transition={{ duration: 0.3, delay: 2.4 }}
          >
            <div className="text-xs text-gray-500" style={{ fontFamily: 'Georgia, serif' }}>
              {samplePaper.update_date}
            </div>
          </motion.div>

          <div className="border-t border-gray-600 my-4"></div>

          <motion.div 
            className="mb-4"
            animate={{
              scale: phase === 'extracting' ? 1.03 : 1,
              filter: phase === 'extracting' ? 'brightness(1.5)' : 'brightness(1)'
            }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <div className="font-bold text-white text-sm mb-2">Abstract</div>
            <div className="text-gray-300 text-xs leading-relaxed">
              {samplePaper.abstract.substring(0, 280)}...
            </div>
          </motion.div>

          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="h-2 bg-gray-600 rounded"
                style={{ width: i === 7 ? '60%' : '100%' }}
              />
            ))}
          </div>

          <motion.div 
            className="absolute bottom-4 left-4 right-4"
            animate={{
              scale: phase === 'extracting' ? 1.03 : 1,
              filter: phase === 'extracting' ? 'brightness(1.5)' : 'brightness(1)'
            }}
            transition={{ duration: 0.3, delay: 1.6 }}
          >
            <div className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/30">
              {samplePaper.categories}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {phase === 'extracting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-end pr-0 md:pr-8"
          >
            <div className="space-y-3 w-full md:w-auto md:min-w-[300px]">
              
              <motion.div
                initial={{ opacity: 0, x: -200, y: -100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
                className="bg-gray-800/80 border border-gray-700 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white font-mono">title</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-gray-300 text-xs truncate">
                    {samplePaper.title.substring(0, 30)}...
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -200, y: -50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.4, duration: 1, ease: 'easeOut' }}
                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-400 font-mono">abstract</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-gray-300 text-xs truncate">
                    A fully differential calculation...
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -200, y: 50 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 2.2, duration: 1, ease: 'easeOut' }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-400 font-mono">categories</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-gray-300 text-xs">
                    primary_category: {samplePaper.categories}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -200, y: 100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 3, duration: 1, ease: 'easeOut' }}
                className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-400 font-mono">update_date</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-gray-300 text-xs">
                    year: {samplePaper.year}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -200, y: 150 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 3.8, duration: 1, ease: 'easeOut' }}
                className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-purple-400 font-mono">is_multi_category</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-gray-300 text-xs">false</span>
                  <span className="text-xs text-gray-500 ml-auto">(derived)</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// STEP 3: Scale - A4 Page + Progressive Thin Bars
// ============================================================================

export function ScaleVisualization() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [count, setCount] = useState(1)
  const [progress, setProgress] = useState(0) // 0 to 1 for bar animation
  const [showStats, setShowStats] = useState(false)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    let startTime
    const targetCount = 2384622
    const duration = 5000 // Same duration for counter AND bars

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const rawProgress = Math.min((timestamp - startTime) / duration, 1)
      
      // Counter easing (slow start, then fast)
      let easeProgress
      if (rawProgress < 0.2) {
        easeProgress = rawProgress * 0.2
      } else {
        const adjustedProgress = (rawProgress - 0.2) / 0.8
        easeProgress = 0.2 + (adjustedProgress * adjustedProgress * adjustedProgress * 0.8)
      }
      
      setCount(Math.floor(easeProgress * targetCount))
      setProgress(rawProgress) // Linear progress for bars
      
      if (rawProgress < 1) {
        requestAnimationFrame(animate)
      } else {
        setShowStats(true)
      }
    }
    
    requestAnimationFrame(animate)
  }, [hasBeenInView])

  // Calculate how many bars to show (based on linear progress)
  const totalBars = 50 // Total bars to fill width
  const visibleBars = Math.floor(progress * totalBars)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-8"
    >
      <div className="text-center mb-8 relative z-10">
        <motion.div className="text-5xl md:text-6xl font-bold text-white mb-2">
          {count.toLocaleString()}
        </motion.div>
        <div className="text-gray-400 text-sm">papers</div>
      </div>

      {/* A4 Page on left + thin bars filling right */}
      <div className="flex justify-center items-center mb-8" style={{ minHeight: '180px' }}>
        <div className="flex items-center gap-2">
          
          {/* A4 Paper - Always visible on LEFT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="border-2 border-blue-500 bg-gray-700 rounded-sm shadow-xl flex-shrink-0"
            style={{
              width: '100px',
              height: '141px'
            }}
          >
            {/* Horizontal lines showing it's a page */}
            <div className="p-2 space-y-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="h-1 bg-blue-400/30 rounded" 
                  style={{ width: i === 9 ? '50%' : '100%' }} 
                />
              ))}
            </div>
          </motion.div>

          {/* Thin bars representing papers - progressively appear */}
          <div className="flex items-center gap-1" style={{ height: '141px' }}>
            {Array.from({ length: totalBars }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ 
                  opacity: i < visibleBars ? 1 : 0,
                  scaleY: i < visibleBars ? 1 : 0
                }}
                transition={{ 
                  duration: 0.1,
                  delay: 0
                }}
                className="bg-blue-500/70 rounded-sm"
                style={{
                  width: '3px',
                  height: '141px',
                  transformOrigin: 'center'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-700"
          >
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">2.4M</div>
              <div className="text-xs text-gray-400">papers</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">153</div>
              <div className="text-xs text-gray-400">categories</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">50.2%</div>
              <div className="text-xs text-gray-400">multi-category</div>
            </div>
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">19 years</div>
              <div className="text-xs text-gray-400">2007-2025</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// STEP 4: Interactive Charts
// ============================================================================

export function InteractiveCharts() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [activeChart, setActiveChart] = useState('time')

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const category = payload[0].payload.category
      const fullLabel = category ? getCategoryLabel(category) : null
      
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-medium">
            {payload[0].payload.year || payload[0].payload.category}
          </p>
          <p className="text-blue-400 text-sm">
            {payload[0].value?.toLocaleString()} papers
          </p>
          {fullLabel && (
            <p className="text-gray-400 text-xs mt-1">
              {fullLabel}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasBeenInView ? 1 : 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      <div className="px-6 py-4 bg-gray-800/80 border-b border-gray-700 flex justify-center gap-2">
        <button
          onClick={() => setActiveChart('time')}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
            activeChart === 'time'
              ? 'bg-blue-500 text-white scale-105 shadow-lg'
              : 'bg-gray-700/50 text-gray-400 hover:text-gray-300 hover:bg-gray-700'
          }`}
        >
          Papers Over Time
        </button>
        <button
          onClick={() => setActiveChart('categories')}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
            activeChart === 'categories'
              ? 'bg-blue-500 text-white scale-105 shadow-lg'
              : 'bg-gray-700/50 text-gray-400 hover:text-gray-300 hover:bg-gray-700'
          }`}
        >
          Top Categories
        </button>
      </div>

      <div className="p-6" style={{ height: '400px' }}>
        <AnimatePresence mode="wait">
          {activeChart === 'time' && (
            <motion.div
              key="time"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={papersOverTime}>
                  <XAxis 
                    dataKey="year" 
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeChart === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCategories} layout="vertical">
                  <XAxis 
                    type="number"
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="category" 
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ============================================================================
// STEP 5: Chaos to Structure
// ============================================================================

export function ChaosToStructure() {
  const { ref, hasBeenInView } = useInView(0.3)
  const hasAnimatedRef = useRef(false)
  const [organized, setOrganized] = useState(false)

  const clusters = [
    { x: 100, y: 90, xSpread: 80, ySpread: 60, dotCount: 100, color: '#3b82f6' },
    { x: 370, y: 80, xSpread: 60, ySpread: 80, dotCount: 80, color: '#10b981' },
    { x: 240, y: 200, xSpread: 90, ySpread: 70, dotCount: 110, color: '#a855f7' },
    { x: 90, y: 310, xSpread: 50, ySpread: 50, dotCount: 50, color: '#f59e0b' },
    { x: 360, y: 290, xSpread: 70, ySpread: 55, dotCount: 70, color: '#ec4899' },
    { x: 200, y: 350, xSpread: 40, ySpread: 60, dotCount: 40, color: '#06b6d4' },
    { x: 320, y: 180, xSpread: 45, ySpread: 45, dotCount: 45, color: '#8b5cf6' }
  ]

  const dots = []
  let dotId = 0
  clusters.forEach((cluster) => {
    for (let i = 0; i < cluster.dotCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.sqrt(Math.random())
      const finalX = cluster.x + Math.cos(angle) * radius * cluster.xSpread
      const finalY = cluster.y + Math.sin(angle) * radius * cluster.ySpread

      dots.push({
        id: dotId++,
        initialX: Math.random() * 450,
        initialY: Math.random() * 380,
        finalX,
        finalY,
        color: cluster.color
      })
    }
  })

  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true
    setTimeout(() => setOrganized(true), 500)
  }, [hasBeenInView])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl p-8"
    >
      <div className="relative w-full mx-auto" style={{ height: '400px', maxWidth: '450px' }}>
        <svg width="100%" height="100%" viewBox="0 0 450 380">
          {dots.map((dot) => (
            <motion.circle
              key={dot.id}
              r="2.5"
              initial={{ 
                cx: dot.initialX, 
                cy: dot.initialY,
                fill: '#6b7280' 
              }}
              animate={{ 
                cx: organized ? dot.finalX : dot.initialX,
                cy: organized ? dot.finalY : dot.initialY,
                fill: organized ? dot.color : '#6b7280'
              }}
              transition={{
                type: 'spring',
                stiffness: 50,
                damping: 15,
                delay: Math.random() * 0.5
              }}
            />
          ))}
        </svg>

        {!organized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-2 left-2 text-xs text-gray-400"
          >
            Unstructured data
          </motion.div>
        )}
        
        {organized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute top-2 left-2 text-xs text-blue-400"
          >
            Discovered clusters
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}