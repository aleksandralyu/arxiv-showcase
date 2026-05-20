import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Domain colors for constellation dots
const DOMAIN_COLORS = {
  cs:      '#10b981',
  math:    '#a855f7',
  physics: '#3b82f6',
  stat:    '#14b8a6',
  other:   '#6b7280',
}

// Weighted random domain assignment
function randomDomain() {
  const r = Math.random()
  if (r < 0.25) return 'cs'
  if (r < 0.45) return 'math'
  if (r < 0.75) return 'physics'
  if (r < 0.90) return 'stat'
  return 'other'
}

const TARGET_COUNT = 2384622
const COUNT_DURATION = 1500 // ms

function useCountUp(target, duration) {
  const [count, setCount] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    const startTime = performance.now()

    function step(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        done.current = true
      }
    }

    requestAnimationFrame(step)
  }, [target, duration])

  return count
}

function Constellation() {
  const svgRef = useRef(null)
  const dotsRef = useRef([])
  const rafRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const w = svg.clientWidth || window.innerWidth
    const h = svg.clientHeight || window.innerHeight

    // Generate dots
    dotsRef.current = Array.from({ length: 120 }, () => {
      const domain = randomDomain()
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1 + 2,
        opacity: Math.random() * 0.4 + 0.3,
        color: DOMAIN_COLORS[domain],
      }
    })

    setReady(true)

    function animate() {
      const dots = dotsRef.current
      const W = svg.clientWidth || w
      const H = svg.clientHeight || h

      // Update positions
      dots.forEach(d => {
        d.x += d.vx
        d.y += d.vy
        if (d.x < 0) d.x += W
        if (d.x > W) d.x -= W
        if (d.y < 0) d.y += H
        if (d.y > H) d.y -= H
      })

      // Build lines
      const lines = []
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.08
            lines.push({ x1: dots[i].x, y1: dots[i].y, x2: dots[j].x, y2: dots[j].y, opacity })
          }
        }
      }

      // Clear and repopulate SVG
      while (svg.firstChild) svg.removeChild(svg.firstChild)

      // Draw lines
      lines.forEach(l => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        el.setAttribute('x1', l.x1)
        el.setAttribute('y1', l.y1)
        el.setAttribute('x2', l.x2)
        el.setAttribute('y2', l.y2)
        el.setAttribute('stroke', '#94a3b8')
        el.setAttribute('stroke-opacity', l.opacity)
        el.setAttribute('stroke-width', '1')
        svg.appendChild(el)
      })

      // Draw dots
      dots.forEach(d => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        el.setAttribute('cx', d.x)
        el.setAttribute('cy', d.y)
        el.setAttribute('r', d.r)
        el.setAttribute('fill', d.color)
        el.setAttribute('fill-opacity', d.opacity)
        svg.appendChild(el)
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        opacity: ready ? 1 : 0,
        transition: 'opacity 1.2s ease-out',
      }}
      aria-hidden="true"
    />
  )
}

function Hero() {
  const count = useCountUp(TARGET_COUNT, COUNT_DURATION)

  return (
    <section id="hero" data-section="hero" className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Constellation background */}
      <Constellation />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4 relative z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Mapping {count.toLocaleString()}
          <span className="block text-blue-500">Scientific Papers</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-8">
          An interactive journey through unsupervised machine learning,
          from raw text to hidden research patterns.
        </p>

        <p className="text-sm text-gray-500 mb-10">
          A case study in clustering, dimensionality reduction, and discovery.
        </p>

        {/* Headline findings strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <div className="bg-gray-900/70 border border-emerald-500/30 rounded-xl px-6 py-4 text-center min-w-[160px]">
            <p className="text-3xl font-bold text-emerald-400">~0 → 9,600</p>
            <p className="text-gray-400 text-xs mt-1">LLM papers/year</p>
            <p className="text-gray-600 text-xs">2021 → 2024</p>
          </div>
          <div className="bg-gray-900/70 border border-blue-500/30 rounded-xl px-6 py-4 text-center min-w-[160px]">
            <p className="text-3xl font-bold text-blue-400">421×</p>
            <p className="text-gray-400 text-xs mt-1">avg. bridge area growth rate</p>
            <p className="text-gray-600 text-xs">vs. single-domain clusters</p>
          </div>
          <div className="bg-gray-900/70 border border-purple-500/30 rounded-xl px-6 py-4 text-center min-w-[160px]">
            <p className="text-3xl font-bold text-purple-400">50</p>
            <p className="text-gray-400 text-xs mt-1">research communities</p>
            <p className="text-gray-600 text-xs">discovered unsupervised</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center z-10"
      >
        <span className="text-gray-500 text-sm mb-2">Scroll to explore</span>
        {/* Pill container — static */}
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          {/* Dot bounces inside the pill */}
          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-1.5 h-3 bg-gray-500 rounded-full mt-1"
          />
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
