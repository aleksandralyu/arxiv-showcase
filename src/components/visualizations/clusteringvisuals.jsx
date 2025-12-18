import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useInView } from '../../hooks/useinview'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, Label, BarChart, Bar, Cell
} from 'recharts'

import evaluationMetrics from '../../data/evaluationmetrics.json'
import clusterSizes from '../../data/clustersizes.json'
import clusterExamples from '../../data/clusterexamples.json'

// ============================================================================
// VISUAL 1: K-Means Animation with REAL math and replay capability
// ============================================================================

export function KMeansAnimation() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [step, setStep] = useState(0)
  const [animationKey, setAnimationKey] = useState(0) // For replay
  const [isComplete, setIsComplete] = useState(false)
  const hasAnimatedRef = useRef(false)
  const timeoutsRef = useRef([])

  const clusterColors = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b']

  // Fixed point positions - designed so reassignments WILL happen
  const points = useMemo(() => [
    // Blue cluster region (top-left) - 6 points
    { id: 'b1', x: -62, y: -52 },
    { id: 'b2', x: -55, y: -58 },
    { id: 'b3', x: -68, y: -48 },
    { id: 'b4', x: -52, y: -50 },
    { id: 'b5', x: -60, y: -42 },
    { id: 'b6', x: -48, y: -56 },
    
    // Green cluster region (top-right) - 6 points
    { id: 'g1', x: 62, y: -52 },
    { id: 'g2', x: 55, y: -58 },
    { id: 'g3', x: 68, y: -48 },
    { id: 'g4', x: 52, y: -50 },
    { id: 'g5', x: 60, y: -42 },
    { id: 'g6', x: 48, y: -56 },
    
    // Purple cluster region (bottom-left) - 6 points
    { id: 'p1', x: -62, y: 52 },
    { id: 'p2', x: -55, y: 58 },
    { id: 'p3', x: -68, y: 48 },
    { id: 'p4', x: -52, y: 50 },
    { id: 'p5', x: -60, y: 42 },
    { id: 'p6', x: -48, y: 56 },
    
    // Orange cluster region (bottom-right) - 6 points
    { id: 'o1', x: 62, y: 52 },
    { id: 'o2', x: 55, y: 58 },
    { id: 'o3', x: 68, y: 48 },
    { id: 'o4', x: 52, y: 50 },
    { id: 'o5', x: 60, y: 42 },
    { id: 'o6', x: 48, y: 56 },
    
    // AMBIGUOUS POINTS - these will change assignment!
    { id: 'm1', x: -25, y: -20 },  // Between blue and center
    { id: 'm2', x: 20, y: -25 },   // Between green and center
    { id: 'm3', x: -20, y: 25 },   // Between purple and center
    { id: 'm4', x: 25, y: 20 },    // Between orange and center
    { id: 'm5', x: 5, y: -5 },     // Center
    { id: 'm6', x: -8, y: 8 },     // Center
  ], [])

  // Distance calculation
  const dist = useCallback((p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
  }, [])

  // Find nearest centroid index
  const nearest = useCallback((point, centroids) => {
    let minDist = Infinity
    let minIdx = 0
    centroids.forEach((c, i) => {
      const d = dist(point, c)
      if (d < minDist) {
        minDist = d
        minIdx = i
      }
    })
    return minIdx
  }, [dist])

  // Compute centroid as mean of assigned points
  const computeCentroid = useCallback((pts, assignments, clusterId) => {
    const assigned = pts.filter((_, i) => assignments[i] === clusterId)
    if (assigned.length === 0) return { x: 0, y: 0 }
    const sumX = assigned.reduce((s, p) => s + p.x, 0)
    const sumY = assigned.reduce((s, p) => s + p.y, 0)
    return { x: sumX / assigned.length, y: sumY / assigned.length }
  }, [])

  // Pre-compute ALL stages of k-means
  const { centroidHistory, assignmentHistory, changeHistory } = useMemo(() => {
    const centroidHist = []
    const assignHist = []
    const changeHist = []
    
    // Stage 0: Initial random centroids - VERY asymmetric to cause real reassignments
    const initialCentroids = [
      { x: -55, y: -10 },  // Blue starts near left edge (will grab purple points initially!)
      { x: 40, y: -55 },   // Green starts in top-right corner (good for green)
      { x: 5, y: 5 },      // Purple starts dead center (will grab middle points)
      { x: 30, y: 60 },    // Orange starts bottom-right but offset
    ]
    centroidHist.push(initialCentroids)
    
    // Initial assignments based on these bad centroids
    const assign0 = points.map(p => nearest(p, initialCentroids))
    assignHist.push(assign0)
    changeHist.push(0) // No changes yet
    
    // Iterate k-means
    let currentCentroids = initialCentroids
    let currentAssignments = assign0
    
    for (let iter = 0; iter < 4; iter++) {
      // Update centroids
      const newCentroids = [0, 1, 2, 3].map(i => 
        computeCentroid(points, currentAssignments, i)
      )
      centroidHist.push(newCentroids)
      
      // Reassign points
      const newAssignments = points.map(p => nearest(p, newCentroids))
      
      // Count changes
      let changes = 0
      for (let i = 0; i < points.length; i++) {
        if (newAssignments[i] !== currentAssignments[i]) changes++
      }
      changeHist.push(changes)
      assignHist.push(newAssignments)
      
      currentCentroids = newCentroids
      currentAssignments = newAssignments
      
      // Stop if converged
      if (changes === 0) break
    }
    
    return { 
      centroidHistory: centroidHist, 
      assignmentHistory: assignHist,
      changeHistory: changeHist
    }
  }, [points, nearest, computeCentroid])

  // Animation steps: init, assign1, update1, assign2, update2, assign3, converge
  // Maps to centroid/assignment history indices
  const getStage = useCallback(() => {
    if (step <= 1) return 0
    if (step === 2) return 1
    if (step === 3) return 1
    if (step === 4) return 2
    if (step === 5) return 2
    return Math.min(centroidHistory.length - 1, 3)
  }, [step, centroidHistory.length])

  const currentCentroids = centroidHistory[getStage()] || centroidHistory[0]
  const currentAssignments = assignmentHistory[getStage()] || assignmentHistory[0]
  const prevAssignments = getStage() > 0 ? assignmentHistory[getStage() - 1] : currentAssignments
  
  // Count actual changes at this step
  const changesAtStep = useMemo(() => {
    if (step <= 1) return 0
    let count = 0
    for (let i = 0; i < points.length; i++) {
      if (currentAssignments[i] !== prevAssignments[i]) count++
    }
    return count
  }, [step, currentAssignments, prevAssignments, points.length])

  // Clear timeouts helper
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
  }, [])

  // Run animation
  const runAnimation = useCallback(() => {
    clearAllTimeouts()
    setStep(0)
    setIsComplete(false)
    
    const timeline = [
      { step: 1, delay: 1500 },   // First assign
      { step: 2, delay: 3500 },   // First update
      { step: 3, delay: 5500 },   // Second assign
      { step: 4, delay: 7500 },   // Second update
      { step: 5, delay: 9500 },   // Third assign
      { step: 6, delay: 11500 },  // Converged
    ]
    
    timeline.forEach(({ step: s, delay }) => {
      const t = setTimeout(() => {
        setStep(s)
        if (s === 6) setIsComplete(true)
      }, delay)
      timeoutsRef.current.push(t)
    })
  }, [clearAllTimeouts])

  // Initial animation
  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true
    runAnimation()
    
    return () => clearAllTimeouts()
  }, [hasBeenInView, runAnimation, clearAllTimeouts])

  // Replay handler
  const handleReplay = useCallback(() => {
    hasAnimatedRef.current = false
    setAnimationKey(k => k + 1)
    runAnimation()
  }, [runAnimation])

  const showColors = step >= 1
  
  const getIteration = () => {
    if (step <= 2) return 1
    if (step <= 4) return 2
    return 3
  }

  const stepInfo = [
    { num: 1, label: 'Initialize', active: step === 0 },
    { num: 2, label: 'Assign', active: step === 1 || step === 3 || step === 5, repeats: true },
    { num: 3, label: 'Update', active: step === 2 || step === 4, repeats: true },
    { num: 4, label: 'Converge', active: step === 6 },
  ]

  const getCurrentStepIndex = () => {
    if (step === 0) return 0
    if (step === 1 || step === 3 || step === 5) return 1
    if (step === 2 || step === 4) return 2
    return 3
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasBeenInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          K-Means Algorithm
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-4">
          {/* Side step indicators */}
          <div className="flex flex-col gap-2 min-w-[110px]">
            {stepInfo.map((info, i) => {
              const isActive = getCurrentStepIndex() === i
              const isPast = getCurrentStepIndex() > i
              const isFirst = i === 0
              
              return (
                <button
                  key={info.num}
                  onClick={isFirst && isComplete ? handleReplay : undefined}
                  disabled={!isFirst || !isComplete}
                  className={`flex items-start gap-2 transition-all duration-300 text-left ${
                    isActive ? 'opacity-100' : isPast ? 'opacity-50' : 'opacity-30'
                  } ${isFirst && isComplete ? 'cursor-pointer hover:opacity-80' : ''}`}
                  style={isFirst && isComplete ? {
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '6px',
                    padding: '4px 6px',
                    margin: '-4px -6px'
                  } : {}}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    isActive 
                      ? 'bg-blue-500 text-white' 
                      : isPast 
                        ? 'bg-blue-500/30 text-blue-400'
                        : 'bg-gray-700 text-gray-500'
                  }`}>
                    {info.num}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-medium ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                      {info.label}
                    </span>
                    {info.repeats && isActive && step < 6 && (
                      <span className="text-[10px] text-gray-500">
                        iter {getIteration()}/3
                      </span>
                    )}
                    {isFirst && isComplete && (
                      <span className="text-[10px] text-blue-400/70">
                        click to replay
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Visualization area */}
          <div className="flex-1 relative" style={{ height: '280px' }}>
            <svg key={animationKey} width="100%" height="100%" viewBox="-100 -100 200 200">
              {/* Data points */}
              {points.map((point, idx) => {
                const assignment = currentAssignments[idx]
                const prevAssignment = prevAssignments[idx]
                const justChanged = step > 1 && assignment !== prevAssignment
                
                return (
                  <motion.circle
                    key={point.id}
                    cx={point.x}
                    cy={point.y}
                    initial={{ opacity: 0, r: 0 }}
                    animate={{ 
                      opacity: 1,
                      r: justChanged ? 5.5 : 4,
                      fill: showColors ? clusterColors[assignment] : '#6b7280'
                    }}
                    transition={{ 
                      duration: 0.5,
                      fill: { duration: 0.4 }
                    }}
                    style={{
                      filter: justChanged ? 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' : 'none'
                    }}
                  />
                )
              })}
              
              {/* Centroids */}
              {currentCentroids.map((centroid, i) => (
                <motion.path
                  key={`centroid-${i}`}
                  d="M0,-9 L9,0 L0,9 L-9,0 Z"
                  fill={clusterColors[i]}
                  stroke="white"
                  strokeWidth={2}
                  initial={{ 
                    x: centroidHistory[0][i].x,
                    y: centroidHistory[0][i].y,
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{ 
                    x: centroid.x, 
                    y: centroid.y,
                    opacity: 1,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 1.0,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Status text */}
        <div className="text-center mt-4 h-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-gray-400"
            >
              {step === 0 && "Random centroids placed (notice positions!)"}
              {step === 1 && "Assigning points to nearest centroid..."}
              {step === 2 && "Moving centroids to cluster means..."}
              {step === 3 && (
                <span>
                  Reassigning... <span className={changesAtStep > 0 ? "text-amber-400" : "text-gray-400"}>
                    {changesAtStep} point{changesAtStep !== 1 ? 's' : ''} changed
                  </span>
                </span>
              )}
              {step === 4 && "Moving centroids to new means..."}
              {step === 5 && (
                <span>
                  Reassigning... <span className={changesAtStep > 0 ? "text-amber-400" : "text-emerald-400"}>
                    {changesAtStep === 0 ? 'no changes!' : `${changesAtStep} point${changesAtStep !== 1 ? 's' : ''} changed`}
                  </span>
                </span>
              )}
              {step === 6 && (
                <span className="text-emerald-400">
                  ✓ Converged — assignments stable
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// VISUAL 2: Multi-Metric Evaluation Chart
// ============================================================================

export function EvaluationChart() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [activeMetric, setActiveMetric] = useState('silhouette')

  const metrics = {
    silhouette: {
      label: 'Silhouette',
      color: '#3b82f6',
      description: 'Cluster cohesion & separation',
      higherBetter: true,
      format: (v) => v.toFixed(4)
    },
    daviesBouldin: {
      label: 'Davies-Bouldin',
      color: '#10b981',
      description: 'Cluster compactness ratio',
      higherBetter: false,
      format: (v) => v.toFixed(2)
    },
    calinskiHarabasz: {
      label: 'Calinski-Harabasz',
      color: '#a855f7',
      description: 'Between/within variance ratio',
      higherBetter: true,
      format: (v) => v.toLocaleString()
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm font-medium">k = {data.k}</p>
          <p style={{ color: metrics[activeMetric].color }} className="text-sm">
            {metrics[activeMetric].label}: {metrics[activeMetric].format(data[activeMetric])}
          </p>
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
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          Cluster Evaluation Metrics
        </div>
      </div>

      <div className="p-6">
        {/* Metric selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(metrics).map(([key, metric]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-300 ${
                activeMetric === key 
                  ? 'border' 
                  : 'bg-gray-700/50 text-gray-400 border border-transparent hover:border-gray-600'
              }`}
              style={activeMetric === key ? { 
                backgroundColor: `${metric.color}20`,
                color: metric.color,
                borderColor: `${metric.color}50`
              } : {}}
            >
              {metric.label}
            </button>
          ))}
        </div>

        {!evaluationMetrics || evaluationMetrics.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
            Loading metrics...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={evaluationMetrics}>
              <XAxis 
                dataKey="k"
                type="number"
                scale="linear"
                domain={[10, 50]}
                ticks={[10, 20, 30, 40, 50]}
                stroke="#6b7280"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(v) => activeMetric === 'calinskiHarabasz' ? `${(v/1000).toFixed(0)}k` : v.toFixed(2)}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine 
                x={50} 
                stroke={metrics[activeMetric].color}
                strokeDasharray="3 3"
                strokeWidth={2}
              >
                <Label 
                  value="k=50" 
                  position="top" 
                  fill={metrics[activeMetric].color}
                  fontSize={12}
                  fontWeight="bold"
                />
              </ReferenceLine>
              
              <Line 
                type="monotone" 
                dataKey={activeMetric}
                stroke={metrics[activeMetric].color}
                strokeWidth={2}
                dot={{ fill: metrics[activeMetric].color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Metric explanation */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500">
            {metrics[activeMetric].description}
            {' • '}
            {metrics[activeMetric].higherBetter ? 'Higher is better' : 'Lower is better'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// VISUAL 3: Cluster Overview - Bar chart of all 50 clusters
// ============================================================================

export function ClusterOverview() {
  const { ref, hasBeenInView } = useInView(0.3)

  const sortedClusters = useMemo(() => {
    if (!clusterSizes || clusterSizes.length === 0) return []
    return [...clusterSizes].sort((a, b) => b.size - a.size).slice(0, 25)
  }, [])

  const domainColors = {
    'Physics': '#3b82f6',
    'Computer Science': '#10b981', 
    'Mathematics': '#a855f7',
    'Astrophysics': '#f59e0b',
    'Interdisciplinary': '#ec4899'
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasBeenInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          50 Clusters by Size (Top 25 shown)
        </div>
      </div>

      <div className="p-6">
        {!clusterSizes || clusterSizes.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm">
            Loading cluster data...
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sortedClusters} layout="horizontal">
                <XAxis 
                  type="category" 
                  dataKey="id"
                  tick={false}
                  axisLine={{ stroke: '#374151' }}
                />
                <YAxis 
                  type="number"
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                          <p className="text-white text-sm font-medium">{data.name}</p>
                          <p className="text-blue-400 text-sm">{data.size.toLocaleString()} papers</p>
                          <p className="text-gray-400 text-xs">{data.domain} • {data.purity}% purity</p>
                          <p className="text-emerald-400 text-xs">+{data.growthRate}% growth</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="size" radius={[2, 2, 0, 0]}>
                  {sortedClusters.map((cluster, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={domainColors[cluster.domain] || '#6b7280'}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {Object.entries(domainColors).map(([domain, color]) => (
                <div key={domain} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="text-gray-400">{domain}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ============================================================================
// VISUAL 4: Cluster Examples - Interactive highlights with timer reset
// ============================================================================

export function ClusterExamples() {
  const { ref, hasBeenInView } = useInView(0.3)
  const [activeCluster, setActiveCluster] = useState(0)
  const hasAnimatedRef = useRef(false)
  const intervalRef = useRef(null)

  // Start or restart the auto-cycle timer
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveCluster(prev => (prev + 1) % (clusterExamples?.length || 5))
    }, 3000) // 3 seconds
  }, [])

  useEffect(() => {
    if (!hasBeenInView || hasAnimatedRef.current) return
    hasAnimatedRef.current = true
    startTimer()
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [hasBeenInView, startTimer])

  // Handle manual cluster selection - reset timer
  const handleClusterClick = useCallback((index) => {
    setActiveCluster(index)
    startTimer() // Reset the timer
  }, [startTimer])

  const examples = clusterExamples || []

  const domainColors = {
    'Physics': '#3b82f6',
    'Computer Science': '#10b981', 
    'Mathematics': '#a855f7',
    'Astrophysics': '#f59e0b',
    'Interdisciplinary': '#ec4899'
  }

  if (examples.length === 0) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="text-gray-400 text-sm">Loading examples...</div>
      </div>
    )
  }

  const current = examples[activeCluster]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: hasBeenInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden"
    >
      <div className="px-6 py-3 bg-gray-800/80 border-b border-gray-700">
        <div className="text-xs uppercase tracking-widest text-gray-400">
          Cluster Highlights
        </div>
      </div>

      <div className="p-6">
        {/* Cluster tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
          {examples.map((cluster, i) => (
            <button
              key={cluster.id}
              onClick={() => handleClusterClick(i)}
              className={`text-xs px-2.5 py-1.5 rounded-lg transition-all duration-300 whitespace-nowrap ${
                activeCluster === i 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-700/50 text-gray-400 border border-transparent hover:border-gray-600'
              }`}
            >
              {cluster.name.length > 15 ? cluster.name.slice(0, 15) + '...' : cluster.name}
            </button>
          ))}
        </div>

        {/* Active cluster details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCluster}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-white font-medium">{current.name}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {current.size.toLocaleString()} papers • Median year: {current.medianYear}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div 
                  className="text-xs px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: `${domainColors[current.domain]}20`,
                    color: domainColors[current.domain]
                  }}
                >
                  {current.domain}
                </div>
                {current.isBridge && (
                  <div className="text-xs px-2 py-0.5 rounded bg-pink-500/20 text-pink-400">
                    Bridge
                  </div>
                )}
              </div>
            </div>

            {/* Top terms */}
            <div>
              <div className="text-xs text-gray-500 mb-2">Top terms:</div>
              <div className="flex flex-wrap gap-1.5">
                {current.topTerms.slice(0, 6).map((term, i) => (
                  <motion.span
                    key={term}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-300 border border-gray-600"
                  >
                    {term}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-gray-500">Growth: </span>
                <span className="text-emerald-400">+{current.growthRate}%</span>
              </div>
              <div>
                <span className="text-gray-500">Purity: </span>
                <span className="text-blue-400">{current.purity}%</span>
              </div>
              <div>
                <span className="text-gray-500">Recent: </span>
                <span className="text-gray-300">{current.recentPapers}%</span>
              </div>
            </div>

            {/* Stats explanations */}
            <div className="text-[10px] text-gray-600 leading-relaxed">
              Growth = increase since 2020 • Purity = % in dominant category • Recent = papers from last 3 years
            </div>

            {/* Insight */}
            <div className="text-xs text-gray-400 italic border-l-2 border-blue-500/50 pl-3">
              {current.insight}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}