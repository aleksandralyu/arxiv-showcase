import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useInView } from '../../hooks/useinview'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts'

import varianceData from '../../data/cumulativevariance.json'

// ============================================================================
// VISUAL 1: 3D Cube → 2D Square (Smooth Morph)
// ============================================================================

export function ThreeDToTwoD() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [morphProgress, setMorphProgress] = useState(0) // 0 = 3D cube, 1 = 2D square
  const hasAnimatedRef = useRef(false)

  const cubeSize = 60
  const depth = 30

  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    // Reduced delay: wait 0.8s (match SVD formula), then morph over 2s
    setTimeout(() => {
      const startTime = Date.now()
      const morphDuration = 2000
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / morphDuration, 1)
        // Ease out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3)
        setMorphProgress(eased)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }, 800)
  }, [hasBeenInView])

  // Rotation angles DECREASE during morph (cube flattens to face-on)
  const angleX = 20 * (1 - morphProgress)
  const angleY = 30 * (1 - morphProgress)
  
  const rotatePoint = (x, y, z) => {
    const radX = (angleX * Math.PI) / 180
    const radY = (angleY * Math.PI) / 180
    
    const y1 = y * Math.cos(radX) - z * Math.sin(radX)
    const z1 = y * Math.sin(radX) + z * Math.cos(radX)
    const x2 = x * Math.cos(radY) - z1 * Math.sin(radY)
    
    return { x: x2, y: y1 }
  }

  // Current depth shrinks during morph (both faces converge)
  const currentDepth = depth * (1 - morphProgress)

  // Back face vertices
  const backVertices = [
    rotatePoint(-cubeSize, -cubeSize, -currentDepth),
    rotatePoint(cubeSize, -cubeSize, -currentDepth),
    rotatePoint(cubeSize, cubeSize, -currentDepth),
    rotatePoint(-cubeSize, cubeSize, -currentDepth),
  ]
  
  // Front face vertices
  const frontVertices = [
    rotatePoint(-cubeSize, -cubeSize, currentDepth),
    rotatePoint(cubeSize, -cubeSize, currentDepth),
    rotatePoint(cubeSize, cubeSize, currentDepth),
    rotatePoint(-cubeSize, cubeSize, currentDepth),
  ]

  const isFlat = morphProgress > 0.95

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasBeenInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          Dimensionality Reduction
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="relative w-full mx-auto" style={{ height: '320px' }}>
          <svg width="100%" height="100%" viewBox="-150 -130 300 280">
            
            {/* Back face - always visible, becomes the final 2D square */}
            <polygon
              points={backVertices.map(v => `${v.x},${v.y}`).join(' ')}
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="2"
              opacity={0.8}
            />

            {/* Connecting edges - shrink and fade as faces converge */}
            {backVertices.map((backVertex, i) => {
              const frontVertex = frontVertices[i]
              const edgeLength = Math.sqrt(
                Math.pow(frontVertex.x - backVertex.x, 2) + 
                Math.pow(frontVertex.y - backVertex.y, 2)
              )
              const opacity = Math.min(edgeLength / 15, 1) * 0.5
              
              return edgeLength > 2 ? (
                <line
                  key={`connect-${i}`}
                  x1={backVertex.x}
                  y1={backVertex.y}
                  x2={frontVertex.x}
                  y2={frontVertex.y}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity={opacity}
                />
              ) : null
            })}

            {/* Front face - fades as it merges with back */}
            {!isFlat && (
              <polygon
                points={frontVertices.map(v => `${v.x},${v.y}`).join(' ')}
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="2"
                opacity={0.9 * (1 - morphProgress)}
              />
            )}
          </svg>

          {/* Fixed axis arrows - bottom left corner */}
          <div className="absolute bottom-4 left-4">
            <svg width="80" height="80" viewBox="0 0 80 80">
              {/* X axis */}
              <g opacity={1}>
                <line x1="10" y1="60" x2="55" y2="60" stroke="#3b82f6" strokeWidth="1.5" />
                <polygon points="55,60 50,57 50,63" fill="#3b82f6" />
                <text x="60" y="64" fill="#3b82f6" fontSize="12" fontWeight="bold">X</text>
              </g>

              {/* Y axis */}
              <g opacity={1}>
                <line x1="10" y1="60" x2="10" y2="15" stroke="#10b981" strokeWidth="1.5" />
                <polygon points="10,15 7,20 13,20" fill="#10b981" />
                <text x="5" y="10" fill="#10b981" fontSize="12" fontWeight="bold">Y</text>
              </g>

              {/* Z axis - fades during morph */}
              <g opacity={1 - morphProgress}>
                <line x1="10" y1="60" x2="40" y2="75" stroke="#a855f7" strokeWidth="1.5" />
                <polygon points="40,75 34,73 36,68" fill="#a855f7" />
                <text x="43" y="78" fill="#a855f7" fontSize="12" fontWeight="bold">Z</text>
              </g>
            </svg>
          </div>

          {/* Dimension label - top right */}
          <div className="absolute top-2 right-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={isFlat ? '2d' : '3d'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isFlat 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {isFlat ? '2D' : '3D'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// VISUAL 2: Cluster Discovery - Same cube morph, subtle point shifts
// ============================================================================

export function ClusterDiscovery() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [morphProgress, setMorphProgress] = useState(0) // 0 = 3D, 1 = 2D
  const hasAnimatedRef = useRef(false)

  const cubeSize = 60
  const depth = 30
  const clusterColors = ['#3b82f6', '#10b981', '#a855f7']

  // Generate points - loosely grouped in 3D, slightly tighter in 2D
  const points = useMemo(() => {
    const result = []
    
    const clusters = [
      { 
        color: '#3b82f6',
        region3D: { cx: -22, cy: -22, cz: -10 },
        target2D: { cx: -28, cy: -25 }
      },
      { 
        color: '#10b981',
        region3D: { cx: 22, cy: -18, cz: 10 },
        target2D: { cx: 28, cy: -22 }
      },
      { 
        color: '#a855f7',
        region3D: { cx: 0, cy: 25, cz: 0 },
        target2D: { cx: 0, cy: 32 }
      },
    ]
    
    clusters.forEach((cluster, clusterId) => {
      for (let i = 0; i < 16; i++) {
        // 3D: loosely grouped with overlap (spread = 26)
        const spread3D = 26
        const x3d = cluster.region3D.cx + (Math.random() - 0.5) * spread3D * 2
        const y3d = cluster.region3D.cy + (Math.random() - 0.5) * spread3D * 2
        const z3d = cluster.region3D.cz + (Math.random() - 0.5) * spread3D
        
        // 2D: BARELY tighter (spread = 24) - very subtle difference!
        // Points move just a tiny bit, not into tight clusters
        const spread2D = 24
        const x2d = cluster.target2D.cx + (Math.random() - 0.5) * spread2D * 2
        const y2d = cluster.target2D.cy + (Math.random() - 0.5) * spread2D * 2
        
        result.push({
          id: `${clusterId}-${i}`,
          cluster: clusterId,
          color: cluster.color,
          x3d, y3d, z3d,
          x2d, y2d
        })
      }
    })
    return result
  }, [])

  // Rotation angles that DECREASE during morph (cube flattens)
  const angleX = 20 * (1 - morphProgress)
  const angleY = 30 * (1 - morphProgress)
  
  const rotatePoint = (x, y, z) => {
    const radX = (angleX * Math.PI) / 180
    const radY = (angleY * Math.PI) / 180
    
    const y1 = y * Math.cos(radX) - z * Math.sin(radX)
    const z1 = y * Math.sin(radX) + z * Math.cos(radX)
    const x2 = x * Math.cos(radY) - z1 * Math.sin(radY)
    
    return { x: x2, y: y1 }
  }

  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    // Reduced delay: wait 0.8s (match SVD formula), then morph over 2s
    setTimeout(() => {
      const startTime = Date.now()
      const morphDuration = 2000
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / morphDuration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setMorphProgress(eased)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }, 800)
  }, [hasBeenInView])

  // Current depth shrinks during morph (both faces converge to center)
  const currentDepth = depth * (1 - morphProgress)

  // Cube vertices - both faces morph toward center plane (z=0)
  const backVertices = [
    rotatePoint(-cubeSize, -cubeSize, -currentDepth),
    rotatePoint(cubeSize, -cubeSize, -currentDepth),
    rotatePoint(cubeSize, cubeSize, -currentDepth),
    rotatePoint(-cubeSize, cubeSize, -currentDepth),
  ]
  
  const frontVertices = [
    rotatePoint(-cubeSize, -cubeSize, currentDepth),
    rotatePoint(cubeSize, -cubeSize, currentDepth),
    rotatePoint(cubeSize, cubeSize, currentDepth),
    rotatePoint(-cubeSize, cubeSize, currentDepth),
  ]

  const isFlat = morphProgress > 0.95

  // Sort points by z for proper 3D rendering (only matters when not flat)
  const sortedPoints = useMemo(() => {
    if (morphProgress > 0.5) return points // No need to sort when mostly flat
    return [...points].sort((a, b) => {
      return a.z3d - b.z3d
    })
  }, [points, morphProgress])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasBeenInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          Revealing Hidden Structure
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="relative w-full mx-auto" style={{ height: '320px' }}>
          <svg width="100%" height="100%" viewBox="-100 -100 200 200">
            
            {/* Cube wireframe - converges to single square */}
            <g>
              {/* Back face - always visible, becomes the final 2D square */}
              {backVertices.map((vertex, i) => {
                const nextVertex = backVertices[(i + 1) % 4]
                return (
                  <line
                    key={`back-${i}`}
                    x1={vertex.x}
                    y1={vertex.y}
                    x2={nextVertex.x}
                    y2={nextVertex.y}
                    stroke="#6b7280"
                    strokeWidth="1.5"
                    opacity={0.6}
                  />
                )
              })}
              
              {/* Connecting edges - shrink and fade as faces converge */}
              {backVertices.map((backVertex, i) => {
                const frontVertex = frontVertices[i]
                const edgeLength = Math.sqrt(
                  Math.pow(frontVertex.x - backVertex.x, 2) + 
                  Math.pow(frontVertex.y - backVertex.y, 2)
                )
                // Fade based on how short the edge is getting
                const opacity = Math.min(edgeLength / 15, 1) * 0.4
                
                return edgeLength > 2 ? (
                  <line
                    key={`connect-${i}`}
                    x1={backVertex.x}
                    y1={backVertex.y}
                    x2={frontVertex.x}
                    y2={frontVertex.y}
                    stroke="#6b7280"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity={opacity}
                  />
                ) : null
              })}
              
              {/* Front face - fades as it merges with back */}
              {!isFlat && frontVertices.map((vertex, i) => {
                const nextVertex = frontVertices[(i + 1) % 4]
                return (
                  <line
                    key={`front-${i}`}
                    x1={vertex.x}
                    y1={vertex.y}
                    x2={nextVertex.x}
                    y2={nextVertex.y}
                    stroke="#6b7280"
                    strokeWidth="1"
                    opacity={0.4 * (1 - morphProgress)}
                  />
                )
              })}
            </g>

            {/* Data points - interpolate between 3D and 2D positions */}
            {sortedPoints.map((point) => {
              const pos3D = rotatePoint(point.x3d, point.y3d, point.z3d)
              
              // Interpolate position based on morph progress
              const x = pos3D.x + (point.x2d - pos3D.x) * morphProgress
              const y = pos3D.y + (point.y2d - pos3D.y) * morphProgress
              
              // Opacity: depth-based in 3D, uniform in 2D
              const depthOpacity = 0.5 + (point.z3d + 30) / 60 * 0.4
              const opacity = depthOpacity + (0.85 - depthOpacity) * morphProgress
              
              return (
                <circle
                  key={point.id}
                  cx={x}
                  cy={y}
                  r={4}
                  fill={point.color}
                  opacity={opacity}
                />
              )
            })}
          </svg>

          {/* Status label - RED for high-dim, GREEN for lower-dim */}
          <div className="absolute top-2 right-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={isFlat ? 'flat' : '3d'}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isFlat 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {isFlat ? 'Lower dimensions' : 'High-dimensional'}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// VISUAL 3: SVD Formula - Restored from original with proper timing
// ============================================================================

export function SVDFormula() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [activeHighlight, setActiveHighlight] = useState(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    // Original timing: 800ms between steps
    setTimeout(() => setActiveHighlight('u'), 800)
    setTimeout(() => setActiveHighlight('sigma'), 1600)
    setTimeout(() => setActiveHighlight('vt'), 2400)
    setTimeout(() => setActiveHighlight('truncated'), 3200)
    setTimeout(() => setActiveHighlight('all'), 4500)
  }, [hasBeenInView])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasBeenInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          Matrix Decomposition
        </div>
      </div>

      {/* Main formula */}
      <div className="px-6 py-8">
        <div className="text-center mb-6">
          <div className="text-2xl md:text-3xl text-white font-serif">
            <span className="italic">X</span>
            
            {/* Show k subscript when truncated is active */}
            <AnimatePresence>
              {(activeHighlight === 'truncated' || activeHighlight === 'all') && (
                <motion.sub
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.4 }}
                  className="text-base text-emerald-400"
                >
                  k
                </motion.sub>
              )}
            </AnimatePresence>
            
            <span className="mx-3">=</span>
            
            {/* U with optional k subscript */}
            <span className={`transition-all duration-300 ${
              activeHighlight === 'u' || activeHighlight === 'all'
                ? 'text-blue-400 scale-110 inline-block' 
                : 'text-blue-400'
            }`}>
              <span className="italic">U</span>
              <AnimatePresence>
                {(activeHighlight === 'truncated' || activeHighlight === 'all') && (
                  <motion.sub
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-emerald-400"
                  >
                    k
                  </motion.sub>
                )}
              </AnimatePresence>
            </span>
            
            <span className="mx-2">·</span>
            
            {/* Σ with optional k subscript */}
            <span className={`transition-all duration-300 ${
              activeHighlight === 'sigma' || activeHighlight === 'all'
                ? 'text-blue-400 scale-110 inline-block' 
                : 'text-blue-400'
            }`}>
              <span className="italic">Σ</span>
              <AnimatePresence>
                {(activeHighlight === 'truncated' || activeHighlight === 'all') && (
                  <motion.sub
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-emerald-400"
                  >
                    k
                  </motion.sub>
                )}
              </AnimatePresence>
            </span>
            
            <span className="mx-2">·</span>
            
            {/* V^T with optional k subscript */}
            <span className={`transition-all duration-300 ${
              activeHighlight === 'vt' || activeHighlight === 'all'
                ? 'text-blue-400 scale-110 inline-block' 
                : 'text-blue-400'
            }`}>
              <span className="italic">V</span>
              <AnimatePresence>
                {(activeHighlight === 'truncated' || activeHighlight === 'all') && (
                  <motion.sub
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.4 }}
                    className="text-base text-emerald-400"
                  >
                    k
                  </motion.sub>
                )}
              </AnimatePresence>
              <sup className="text-sm">T</sup>
            </span>
          </div>
        </div>

        {/* Breakdown boxes */}
        <div className="space-y-3">
          {/* U box */}
          <motion.div
            animate={{ 
              opacity: (activeHighlight === 'u' || activeHighlight === 'all') ? 1 : 0.3,
              scale: activeHighlight === 'u' ? 1 : 0.98
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-blue-400 font-serif italic">U:</span>
            </div>
            <div className="text-sm text-gray-300">
              Document space
            </div>
          </motion.div>

          {/* Σ box */}
          <motion.div
            animate={{ 
              opacity: (activeHighlight === 'sigma' || activeHighlight === 'all') ? 1 : 0.3,
              scale: activeHighlight === 'sigma' ? 1 : 0.98
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-blue-400 font-serif italic">Σ:</span>
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-blue-400/80">Singular values</span>
              {" (importance of each direction)"}
            </div>
          </motion.div>

          {/* V^T box */}
          <motion.div
            animate={{ 
              opacity: (activeHighlight === 'vt' || activeHighlight === 'all') ? 1 : 0.3,
              scale: activeHighlight === 'vt' ? 1 : 0.98
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="text-blue-400 font-serif italic">V<sup className="text-xs">T</sup>:</span>
            </div>
            <div className="text-sm text-gray-300">
              Term space
            </div>
          </motion.div>

          {/* Truncated explanation box */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: (activeHighlight === 'truncated' || activeHighlight === 'all') ? 1 : 0,
              height: (activeHighlight === 'truncated' || activeHighlight === 'all') ? 'auto' : 0
            }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-gray-700">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                <div className="text-sm text-gray-300">
                  Keeping top <span className="text-emerald-400 italic font-serif">k</span> components
                  <span className="text-gray-500"> → </span>
                  <span className="text-emerald-400 font-medium">best k-dimensional approximation</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// VISUAL 4: Variance Chart - Restored from original (dots, 50% line, no summary)
// ============================================================================

export function VarianceChart() {
  const { ref, hasBeenInView } = useInView(0.3)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-medium">{payload[0].payload.components} components</p>
          <p className="text-blue-400 text-sm">{payload[0].value.toFixed(1)}% variance</p>
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
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          Cumulative Variance Explained
        </div>
      </div>

      <div className="px-6 py-6">
        {!varianceData || varianceData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
            Loading variance data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={varianceData}>
              <XAxis 
                dataKey="components"
                type="number"
                scale="linear"
                domain={[0, 500]}
                ticks={[1, 50, 100, 200, 300, 400, 500]}
                stroke="#6b7280"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference line at 50% */}
              <ReferenceLine 
                y={50} 
                stroke="#6b7280" 
                strokeDasharray="3 3"
                strokeWidth={1}
              >
                <Label 
                  value="50% variance" 
                  position="insideTopLeft" 
                  fill="#9ca3af" 
                  fontSize={11}
                />
              </ReferenceLine>
              
              {/* Reference line at 500 components */}
              <ReferenceLine 
                x={500} 
                stroke="#3b82f6" 
                strokeDasharray="3 3"
                strokeWidth={1}
              >
                <Label 
                  value="500" 
                  position="top" 
                  fill="#3b82f6" 
                  fontSize={12}
                />
              </ReferenceLine>
              
              {/* Main line with dots */}
              <Line 
                type="monotone" 
                dataKey="cumulative_variance" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  )
}