import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import graphData from '../../data/cluster_graph.json'

// ============================================================================
// CLUSTER MAP — Conclusion section
// Force-directed graph of 50 clusters, sized by paper count, colored by
// domain, edges weighted by centroid cosine similarity.
// Click a node to explore: top terms, quadrant badge, growth rate, description.
// ============================================================================

const QUADRANT_COLORS = {
  rocket:  '#10b981',  // tight IQR + high emergence = fast-growing new field
  classic: '#3b82f6',  // wide IQR + high emergence = reinvigorated established
  niche:   '#f59e0b',  // tight IQR + low emergence = specialized, static
  stable:  '#6b7280',  // wide IQR + low emergence = broad, mature
}

const QUADRANT_LABELS = {
  rocket:  'Rocket',
  classic: 'Classic',
  niche:   'Niche',
  stable:  'Stable',
}

const DOMAIN_COLORS = {
  'Computer Science':       '#10b981',
  'Mathematics':            '#a855f7',
  'Physics':                '#3b82f6',
  'Astrophysics':           '#06b6d4',
  'Condensed Matter':       '#8b5cf6',
  'High Energy Physics':    '#f59e0b',
  'Quantum Physics':        '#ec4899',
  'Electrical Engineering': '#14b8a6',
  'Statistics':             '#84cc16',
  'General Relativity':     '#f97316',
  'Mathematical Physics':   '#e879f9',
  'Nuclear Physics':        '#64748b',
  'Quantitative Biology':   '#34d399',
  'Quantitative Finance':   '#fbbf24',
  'Nonlinear Sciences':     '#fb7185',
  'Economics':              '#a3e635',
}

function domainColor(domain) {
  return DOMAIN_COLORS[domain] || '#6b7280'
}

// Map node size (paper count) to visual radius
function nodeRadius(size) {
  const min = 5, max = 22
  const sizeMin = 5000, sizeMax = 200000
  const t = Math.max(0, Math.min(1, (size - sizeMin) / (sizeMax - sizeMin)))
  return min + Math.sqrt(t) * (max - min)
}

// Simple force-directed layout using requestAnimationFrame
function useForceLayout(nodes, edges, width, height) {
  const [positions, setPositions] = useState(null)
  const simRef = useRef(null)

  useEffect(() => {
    if (!width || !height || nodes.length === 0) return

    // Initialize positions in a circle
    const n = nodes.length
    const cx = width / 2, cy = height / 2
    const r = Math.min(width, height) * 0.35

    const pos = nodes.map((node, i) => ({
      x: cx + r * Math.cos((2 * Math.PI * i) / n),
      y: cy + r * Math.sin((2 * Math.PI * i) / n),
      vx: 0,
      vy: 0,
    }))

    // Build adjacency for spring forces
    const edgeMap = new Map()
    edges.forEach(e => {
      const key = `${e.source}-${e.target}`
      edgeMap.set(key, e.weight)
      edgeMap.set(`${e.target}-${e.source}`, e.weight)
    })

    let frame = 0
    const MAX_FRAMES = 300
    const ALPHA_DECAY = 0.015

    function tick() {
      const alpha = Math.max(0, 1 - (frame * ALPHA_DECAY))
      if (frame > MAX_FRAMES) {
        setPositions(pos.map(p => ({ x: p.x, y: p.y })))
        return
      }

      // Repulsion: all pairs
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = pos[j].x - pos[i].x
          const dy = pos[j].y - pos[i].y
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
          const strength = (10000 / (dist * dist)) * alpha
          const fx = (dx / dist) * strength
          const fy = (dy / dist) * strength
          pos[i].vx -= fx; pos[i].vy -= fy
          pos[j].vx += fx; pos[j].vy += fy
        }
      }

      // Spring attraction for connected nodes
      edges.forEach(e => {
        const i = e.source, j = e.target
        const dx = pos[j].x - pos[i].x
        const dy = pos[j].y - pos[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
        const restLen = 80 + (1 - e.weight) * 100
        const stretch = (dist - restLen) / dist
        const strength = stretch * 0.4 * alpha * e.weight
        const fx = dx * strength, fy = dy * strength
        pos[i].vx += fx; pos[i].vy += fy
        pos[j].vx -= fx; pos[j].vy -= fy
      })

      // Center gravity
      for (let i = 0; i < n; i++) {
        pos[i].vx += (cx - pos[i].x) * 0.008 * alpha
        pos[i].vy += (cy - pos[i].y) * 0.008 * alpha
      }

      // Apply velocity + damping + boundary
      const pad = 40
      for (let i = 0; i < n; i++) {
        pos[i].vx *= 0.85
        pos[i].vy *= 0.85
        pos[i].x = Math.max(pad, Math.min(width - pad, pos[i].x + pos[i].vx))
        pos[i].y = Math.max(pad, Math.min(height - pad, pos[i].y + pos[i].vy))
      }

      frame++
      if (frame % 10 === 0) {
        setPositions(pos.map(p => ({ x: p.x, y: p.y })))
      }
      simRef.current = requestAnimationFrame(tick)
    }

    simRef.current = requestAnimationFrame(tick)
    return () => { if (simRef.current) cancelAnimationFrame(simRef.current) }
  }, [width, height, nodes.length])

  return positions
}

function NodeDetail({ node, onClose }) {
  if (!node) return null
  const color = domainColor(node.domain)
  const qColor = QUADRANT_COLORS[node.quadrant] || '#6b7280'
  const qLabel = QUADRANT_LABELS[node.quadrant] || node.quadrant

  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 border border-gray-700 rounded-xl p-5 relative"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-400 text-sm transition-colors"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4 pr-6">
        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: color }} />
        <div>
          <p className="text-white font-semibold text-base leading-snug">{node.label}</p>
          <p className="text-gray-500 text-xs mt-0.5">{node.domain}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-white tabular-nums">{node.size.toLocaleString()}</p>
          <p className="text-xs text-gray-500">papers</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold tabular-nums" style={{ color: qColor }}>{qLabel}</p>
          <p className="text-xs text-gray-500">lifecycle</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white tabular-nums">
            {node.growthRate > 0 ? `${node.growthRate > 999 ? '>999' : node.growthRate}%` : '—'}
          </p>
          <p className="text-xs text-gray-500">growth</p>
        </div>
      </div>

      {/* Top terms */}
      {node.topTerms?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Key terms</p>
          <div className="flex flex-wrap gap-1.5">
            {node.topTerms.map(term => (
              <span
                key={term}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {node.description && (
        <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-gray-700 pl-3">
          {node.description.length > 240
            ? node.description.slice(0, 240).trimEnd() + '…'
            : node.description}
        </p>
      )}
    </motion.div>
  )
}

const ZOOM_MIN = 0.25
const ZOOM_MAX = 5

function ClusterGraph({ nodes, edges, onSelectNode, selectedId, colorBy }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const [hoveredId, setHoveredId] = useState(null)

  // Viewport state: pan offset + scale
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 })

  // Drag tracking — stored in ref to avoid stale closures in event handlers
  const dragRef = useRef({ active: false, startX: 0, startY: 0, originVx: 0, originVy: 0, moved: false })

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDims({ w: entry.contentRect.width, h: entry.contentRect.height })
      }
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const positions = useForceLayout(nodes, edges, dims.w, dims.h)

  // ── Wheel: zoom around cursor ──
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const factor = e.deltaY < 0 ? 1.12 : 0.89
    setViewport(vp => {
      const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, vp.scale * factor))
      const ratio = newScale / vp.scale
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      return {
        scale: newScale,
        x: mouseX - ratio * (mouseX - vp.x),
        y: mouseY - ratio * (mouseY - vp.y),
      }
    })
  }, [])

  // Attach wheel with { passive: false } so preventDefault works
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // ── Mouse drag: pan ──
  const handleMouseDown = useCallback((e) => {
    // Only pan on background (node clicks handled by their own onClick)
    if (e.target !== svgRef.current && e.target.closest('g[data-node]')) return
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originVx: viewport.x,
      originVy: viewport.y,
      moved: false,
    }
  }, [viewport.x, viewport.y])

  const handleMouseMove = useCallback((e) => {
    const d = dragRef.current
    if (!d.active) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) d.moved = true
    setViewport(vp => ({ ...vp, x: d.originVx + dx, y: d.originVy + dy }))
  }, [])

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false
    // Reset moved flag so the next mousedown → click distinction is fresh
    dragRef.current.moved = false
  }, [])

  // ── Touch: single-finger pan + two-finger pinch ──
  const touchRef = useRef({ touches: [], vx: 0, vy: 0, scale: 1 })

  const handleTouchStart = useCallback((e) => {
    const touches = Array.from(e.touches)
    touchRef.current = {
      touches,
      vx: viewport.x,
      vy: viewport.y,
      scale: viewport.scale,
    }
  }, [viewport])

  const handleTouchMove = useCallback((e) => {
    e.preventDefault()
    const prev = touchRef.current
    const cur = Array.from(e.touches)
    if (cur.length === 1 && prev.touches.length === 1) {
      // Pan
      const dx = cur[0].clientX - prev.touches[0].clientX
      const dy = cur[0].clientY - prev.touches[0].clientY
      setViewport(vp => ({ ...vp, x: vp.x + dx, y: vp.y + dy }))
      touchRef.current.touches = cur
    } else if (cur.length === 2 && prev.touches.length >= 2) {
      // Pinch zoom
      const prevDist = Math.hypot(
        prev.touches[0].clientX - prev.touches[1].clientX,
        prev.touches[0].clientY - prev.touches[1].clientY
      )
      const curDist = Math.hypot(
        cur[0].clientX - cur[1].clientX,
        cur[0].clientY - cur[1].clientY
      )
      const factor = curDist / (prevDist || 1)
      const midX = (cur[0].clientX + cur[1].clientX) / 2
      const midY = (cur[0].clientY + cur[1].clientY) / 2
      const rect = svgRef.current?.getBoundingClientRect()
      if (rect) {
        const mx = midX - rect.left
        const my = midY - rect.top
        setViewport(vp => {
          const newScale = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, vp.scale * factor))
          const ratio = newScale / vp.scale
          return { scale: newScale, x: mx - ratio * (mx - vp.x), y: my - ratio * (my - vp.y) }
        })
      }
      touchRef.current.touches = cur
    }
  }, [])

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', handleTouchMove)
  }, [handleTouchMove])

  // ── Reset to fit ──
  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 })
  }, [])

  const zoomIn = useCallback(() => {
    setViewport(vp => {
      const newScale = Math.min(ZOOM_MAX, vp.scale * 1.3)
      const ratio = newScale / vp.scale
      const cx = dims.w / 2, cy = dims.h / 2
      return { scale: newScale, x: cx - ratio * (cx - vp.x), y: cy - ratio * (cy - vp.y) }
    })
  }, [dims])

  const zoomOut = useCallback(() => {
    setViewport(vp => {
      const newScale = Math.max(ZOOM_MIN, vp.scale / 1.3)
      const ratio = newScale / vp.scale
      const cx = dims.w / 2, cy = dims.h / 2
      return { scale: newScale, x: cx - ratio * (cx - vp.x), y: cy - ratio * (cy - vp.y) }
    })
  }, [dims])

  // Label visibility: always show large clusters; show all at zoom ≥ 1.5
  const shouldLabel = useCallback((node) => {
    return node.size > 40000 || viewport.scale >= 1.5 || node.id === hoveredId || node.id === selectedId
  }, [hoveredId, selectedId, viewport.scale])

  const isDragging = dragRef.current.active && dragRef.current.moved

  return (
    <div ref={containerRef} className="w-full h-full relative select-none">
      {/* Loading state */}
      {!positions && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-sm">
          Laying out graph…
        </div>
      )}

      {positions && (
        <>
          <svg
            ref={svgRef}
            width={dims.w}
            height={dims.h}
            className="w-full h-full"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onDoubleClick={resetView}
          >
            {/* All content inside a single transformed group */}
            <g transform={`translate(${viewport.x},${viewport.y}) scale(${viewport.scale})`}>
              {/* Edges */}
              {edges.map((e, i) => {
                const src = positions[e.source]
                const tgt = positions[e.target]
                if (!src || !tgt) return null
                const opacity = 0.06 + e.weight * 0.2
                const isHighlighted =
                  e.source === selectedId || e.target === selectedId ||
                  e.source === hoveredId || e.target === hoveredId
                return (
                  <line
                    key={i}
                    x1={src.x} y1={src.y}
                    x2={tgt.x} y2={tgt.y}
                    stroke={isHighlighted ? '#6b7280' : '#374151'}
                    strokeOpacity={isHighlighted ? 0.5 : opacity}
                    strokeWidth={isHighlighted ? 1.5 / viewport.scale : 1 / viewport.scale}
                  />
                )
              })}

              {/* Nodes */}
              {nodes.map((node, i) => {
                const pos = positions[i]
                if (!pos) return null
                const r = nodeRadius(node.size)
                const color = colorBy === 'quadrant'
                  ? (QUADRANT_COLORS[node.quadrant] || '#6b7280')
                  : domainColor(node.domain)
                const isSelected = node.id === selectedId
                const isHovered = node.id === hoveredId
                const label = shouldLabel(node)

                return (
                  <g
                    key={node.id}
                    data-node="true"
                    transform={`translate(${pos.x},${pos.y})`}
                    onClick={(e) => {
                      // Don't select if this was the end of a pan drag
                      if (dragRef.current.moved) return
                      onSelectNode(isSelected ? null : node)
                    }}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isSelected && (
                      <circle
                        r={r + 6}
                        fill="none"
                        stroke={color}
                        strokeOpacity={0.35}
                        strokeWidth={2 / viewport.scale}
                      />
                    )}
                    <circle
                      r={r}
                      fill={color}
                      fillOpacity={isSelected ? 0.9 : isHovered ? 0.75 : 0.55}
                      stroke={color}
                      strokeWidth={(isSelected || isHovered ? 2 : 1) / viewport.scale}
                      strokeOpacity={0.8}
                      style={{ transition: 'fill-opacity 0.15s' }}
                    />
                    {label && (
                      <text
                        y={r + 10 / viewport.scale}
                        textAnchor="middle"
                        fontSize={10 / viewport.scale}
                        fill="#9ca3af"
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {node.label.length > 22 ? node.label.slice(0, 20) + '…' : node.label}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
            <button
              onClick={zoomIn}
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center text-base leading-none"
              title="Zoom in"
            >+</button>
            <button
              onClick={zoomOut}
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center text-base leading-none"
              title="Zoom out"
            >−</button>
            <button
              onClick={resetView}
              className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center"
              title="Reset view"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M1 1h5v2H3v3H1V1zm9 0h5v5h-2V3h-3V1zM1 10h2v3h3v2H1v-5zm12 3h-3v2h5v-5h-2v3z"/>
              </svg>
            </button>
          </div>

          {/* Hint shown only at default zoom */}
          {viewport.scale === 1 && viewport.x === 0 && viewport.y === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-700 pointer-events-none">
              Scroll to zoom · drag to pan · click a node to explore
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function ClusterMap() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [colorBy, setColorBy] = useState('domain') // 'domain' | 'quadrant'

  const { nodes, edges } = graphData

  // Only show legend entries for domains/quadrants that actually appear in data
  const activeDomains = [...new Set(nodes.map(n => n.domain))].sort()
  const activeQuadrants = [...new Set(nodes.map(n => n.quadrant))].sort()

  return (
    <section
      id="conclusion"
      data-section="conclusion"
      className="bg-gray-950 border-t border-gray-800"
      style={{ minHeight: '100vh' }}
    >
      {/* Header */}
      <div className="px-6 pt-16 pb-6 max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs text-emerald-500 font-medium tracking-widest uppercase mb-3">
            The Map
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            50 communities in 2.4 million papers
          </h2>
          <p className="text-gray-400 text-base max-w-2xl">
            Each node is a cluster. Size = paper count. Edges connect clusters with similar vocabulary —
            cosine similarity of TF-IDF centroids. Click any node to explore.
          </p>
        </motion.div>
      </div>

      {/* Main layout: graph + sidebar */}
      <div className="max-w-screen-xl mx-auto px-6 pb-16 flex flex-col lg:flex-row gap-6">

        {/* Graph */}
        <div className="flex-1 min-w-0">
          {/* Controls */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs text-gray-500">Color by:</span>
            {['domain', 'quadrant'].map(mode => (
              <button
                key={mode}
                onClick={() => setColorBy(mode)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  colorBy === mode
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-400'
                }`}
              >
                {mode === 'domain' ? 'Research field' : 'Lifecycle stage'}
              </button>
            ))}
          </div>

          {/* Graph canvas */}
          <div
            className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden"
            style={{ height: 520 }}
          >
            <ClusterGraph
              nodes={nodes}
              edges={edges}
              onSelectNode={setSelectedNode}
              selectedId={selectedNode?.id}
              colorBy={colorBy}
            />
          </div>

          {/* Legend — only entries that appear in the data */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {colorBy === 'domain' ? (
              activeDomains.map(domain => (
                <div key={domain} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[domain] || '#6b7280' }} />
                  <span className="text-xs text-gray-500">{domain}</span>
                </div>
              ))
            ) : (
              activeQuadrants.map(q => (
                <div key={q} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: QUADRANT_COLORS[q] || '#6b7280' }} />
                  <span className="text-xs text-gray-500">{QUADRANT_LABELS[q] || q}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: node detail + key findings */}
        <div className="lg:w-80 flex-shrink-0 flex flex-col gap-4">

          {/* Node detail panel */}
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <NodeDetail
                key={selectedNode.id}
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center"
              >
                <p className="text-gray-600 text-sm">
                  Click a node to explore a research community
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Key findings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">What the map shows</p>

            <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
              <p>
                <span className="text-white font-medium">Dense clusters</span> in the center are
                methodologically general — ML, statistics, optimization. They connect to almost everything.
              </p>
              <p>
                <span className="text-white font-medium">Peripheral nodes</span> are domain-specific:
                tau physics, nuclear structure, quantitative finance. High vocabulary purity,
                low connectivity to the rest.
              </p>
              <p>
                <span className="text-white font-medium">Math sits between</span> CS and physics —
                the highest cross-domain migration rate in the dataset (50–56%), because mathematical
                vocabulary is shared substrate across fields.
              </p>
              <p>
                <span className="text-emerald-400 font-medium">LLM cluster (C28)</span> is an extreme
                outlier: IQR = 1 year, emergence = 100%, growth = 12,303×. A field that materialized
                from nothing after 2022.
              </p>
            </div>
          </div>

          {/* Methodological note */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide">About this map</p>
            <div className="text-xs text-gray-500 space-y-2 leading-relaxed">
              <p>Edge weights = cosine similarity between cluster centroids (TF-IDF, 500d SVD).</p>
              <p>Layout: force-directed. Node size ∝ paper count.</p>
              <p>No position is hand-tuned — spatial proximity reflects vocabulary similarity.</p>
            </div>
            <p className="text-xs text-gray-600 pt-1">
              2,384,622 papers · k=50 clusters · K-Means (lloyd, n_init=10)
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
