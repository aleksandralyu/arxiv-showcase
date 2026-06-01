import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import sampleData from '../../data/abstract_sample.json'

// ============================================================================
// LIBRARY EXPLORER
// Interactive split-panel section showing the scale of the raw problem:
// filter papers by domain + year, see how much remains even after filtering.
// Placed between Hero and Introduction.
// ============================================================================

const YEAR_MIN = 2007
const YEAR_MAX = 2025

// Domain display order and colors
const DOMAIN_CONFIG = [
  { key: 'Computer Science',      color: '#10b981', short: 'CS' },
  { key: 'Mathematics',           color: '#a855f7', short: 'Math' },
  { key: 'Physics',               color: '#3b82f6', short: 'Physics' },
  { key: 'Astrophysics',          color: '#06b6d4', short: 'Astro' },
  { key: 'Condensed Matter',      color: '#8b5cf6', short: 'Cond. Matter' },
  { key: 'High Energy Physics',   color: '#f59e0b', short: 'HEP' },
  { key: 'Quantum Physics',       color: '#ec4899', short: 'Quantum' },
  { key: 'Electrical Engineering',color: '#14b8a6', short: 'EESS' },
  { key: 'Statistics',            color: '#84cc16', short: 'Stat' },
  { key: 'General Relativity',    color: '#f97316', short: 'GR' },
  { key: 'Mathematical Physics',  color: '#e879f9', short: 'Math-Ph' },
  { key: 'Nuclear Physics',       color: '#64748b', short: 'Nuclear' },
  { key: 'Quantitative Biology',  color: '#34d399', short: 'q-bio' },
  { key: 'Quantitative Finance',  color: '#fbbf24', short: 'q-fin' },
  { key: 'Nonlinear Sciences',    color: '#fb7185', short: 'nlin' },
  { key: 'Economics',             color: '#a3e635', short: 'Econ' },
]

const DOMAIN_COLOR = Object.fromEntries(DOMAIN_CONFIG.map(d => [d.key, d.color]))

// Map domain totals from sample data to display-friendly estimated counts
const DOMAIN_TOTALS = sampleData.domainTotals || {}
const TOTAL_PAPERS = sampleData.total || 2384622

function estimatedCount(domains, yearMin, yearMax) {
  // Rough estimate: sum domain totals × year fraction
  const yearFraction = (yearMax - yearMin + 1) / (YEAR_MAX - YEAR_MIN + 1)
  if (domains.length === 0) {
    return Math.round(TOTAL_PAPERS * yearFraction)
  }
  const domainTotal = domains.reduce((sum, d) => sum + (DOMAIN_TOTALS[d] || 0), 0)
  return Math.round(domainTotal * yearFraction)
}

function PaperCard({ paper, domainColor, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.018, 0.3) }}
      className="p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
          style={{ backgroundColor: domainColor }}
        />
        <div className="min-w-0">
          <p className="text-sm text-gray-100 font-medium leading-snug mb-1 line-clamp-2">
            {paper.title}
          </p>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
            {paper.abstract}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-600">{paper.category}</span>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-gray-600">{paper.year}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function YearRangeSlider({ value, onChange }) {
  const [min, max] = value
  const trackRef = useRef(null)

  function getPercent(val) {
    return ((val - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100
  }

  function handleTrackClick(e) {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const year = Math.round(YEAR_MIN + pct * (YEAR_MAX - YEAR_MIN))
    const clampedYear = Math.max(YEAR_MIN, Math.min(YEAR_MAX, year))
    // Move nearest handle
    if (Math.abs(clampedYear - min) < Math.abs(clampedYear - max)) {
      onChange([Math.min(clampedYear, max), max])
    } else {
      onChange([min, Math.max(clampedYear, min)])
    }
  }

  return (
    <div className="px-1">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>{min}</span>
        <span className="text-gray-400">{min === max ? `${min}` : `${min} – ${max}`}</span>
        <span>{max}</span>
      </div>
      <div
        ref={trackRef}
        className="relative h-1.5 rounded-full cursor-pointer"
        style={{ background: '#374151' }}
        onClick={handleTrackClick}
      >
        {/* Active range fill */}
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${getPercent(min)}%`,
            width: `${getPercent(max) - getPercent(min)}%`,
            backgroundColor: '#3b82f6',
          }}
        />
        {/* Min handle — raise z-index when handles overlap so it stays reachable */}
        <input
          type="range"
          min={YEAR_MIN}
          max={YEAR_MAX}
          value={min}
          onChange={e => onChange([Math.min(Number(e.target.value), max), max])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: min === max ? 4 : 2 }}
        />
        {/* Max handle */}
        <input
          type="range"
          min={YEAR_MIN}
          max={YEAR_MAX}
          value={max}
          onChange={e => onChange([min, Math.max(Number(e.target.value), min)])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 3 }}
        />
        {/* Visual handles */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 border-blue-400 bg-gray-950 -translate-y-1/2 top-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${getPercent(min)}%` }}
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 border-blue-400 bg-gray-950 -translate-y-1/2 top-1/2 -translate-x-1/2 pointer-events-none"
          style={{ left: `${getPercent(max)}%` }}
        />
      </div>
    </div>
  )
}

export default function LibraryExplorer() {
  const [selectedDomains, setSelectedDomains] = useState([])
  const [yearRange, setYearRange] = useState([YEAR_MIN, YEAR_MAX])

  const allPapers = sampleData.papers

  // Filtered papers (from sample)
  const filtered = useMemo(() => {
    return allPapers.filter(p => {
      const domainOk = selectedDomains.length === 0 || selectedDomains.includes(p.domain)
      const yearOk = p.year >= yearRange[0] && p.year <= yearRange[1]
      return domainOk && yearOk
    })
  }, [selectedDomains, yearRange])

  // Show at most 48 cards
  const displayed = filtered.slice(0, 48)

  // Estimated real count
  const estimated = estimatedCount(selectedDomains, yearRange[0], yearRange[1])

  function toggleDomain(key) {
    setSelectedDomains(prev =>
      prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]
    )
  }

  function clearFilters() {
    setSelectedDomains([])
    setYearRange([YEAR_MIN, YEAR_MAX])
  }

  const hasFilters = selectedDomains.length > 0 || yearRange[0] !== YEAR_MIN || yearRange[1] !== YEAR_MAX

  return (
    <section
      id="library-explorer"
      data-section="library-explorer"
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
          <p className="text-xs text-blue-500 font-medium tracking-widest uppercase mb-3">
            The Problem
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            2.4 million papers. Where do you start?
          </h2>
          <p className="text-gray-400 text-base max-w-2xl">
            Use the filters to narrow by field and year. Watch how many remain.
          </p>
        </motion.div>
      </div>

      {/* Split panel */}
      <div className="max-w-screen-xl mx-auto px-6 pb-16 flex flex-col lg:flex-row gap-6">

        {/* ── Left panel: filters ── */}
        <div className="lg:w-72 flex-shrink-0 space-y-6">

          {/* Estimated count */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Matching papers</p>
            <motion.p
              key={estimated}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-white tabular-nums"
            >
              ~{estimated.toLocaleString()}
            </motion.p>
            {hasFilters && (
              <p className="text-xs text-gray-600 mt-1">
                of {TOTAL_PAPERS.toLocaleString()} total
              </p>
            )}
          </div>

          {/* Year range */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Year range</p>
            <YearRangeSlider value={yearRange} onChange={setYearRange} />
          </div>

          {/* Domain filter */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Field</p>
              {selectedDomains.length > 0 && (
                <button
                  onClick={() => setSelectedDomains([])}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  clear
                </button>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              {DOMAIN_CONFIG.map(({ key, color, short }) => {
                const active = selectedDomains.includes(key)
                const count = DOMAIN_TOTALS[key]?.toLocaleString() || ''
                return (
                  <button
                    key={key}
                    onClick={() => toggleDomain(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                      active
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: active ? color : '#4b5563' }}
                    />
                    <span className="flex-1 text-xs">{key}</span>
                    {count && (
                      <span className="text-xs text-gray-600 tabular-nums">{count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors py-2"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* ── Right panel: paper cards ── */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {filtered.length === 0
                ? 'No papers match these filters'
                : <>
                    Showing {displayed.length} papers
                    {selectedDomains.length > 0 && (
                      <span className="text-gray-600">
                        {' '}in {selectedDomains.length === 1 ? selectedDomains[0] : `${selectedDomains.length} fields`}
                      </span>
                    )}
                    {(yearRange[0] !== YEAR_MIN || yearRange[1] !== YEAR_MAX) && (
                      <span className="text-gray-600"> · {yearRange[0]}–{yearRange[1]}</span>
                    )}
                    <span className="text-gray-700"> — ~{estimated.toLocaleString()} exist</span>
                  </>
              }
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
              No papers match the current filters
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {displayed.map((paper, i) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  index={i}
                  domainColor={DOMAIN_COLOR[paper.domain] || '#6b7280'}
                />
              ))}
            </div>
          )}

          {/* Bottom note */}
          {estimated > 1000 && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 text-center text-sm text-gray-600 max-w-xl mx-auto"
            >
              {hasFilters
                ? `Even with these filters, there are an estimated ${estimated.toLocaleString()} papers. These are the ones this project set out to navigate.`
                : `${TOTAL_PAPERS.toLocaleString()} papers spanning 18 years. No human reads through all of them. That's the problem unsupervised learning solves.`
              }
            </motion.p>
          )}
        </div>
      </div>
    </section>
  )
}
