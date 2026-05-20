import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis,
  AreaChart, Area, Legend, CartesianGrid,
} from 'recharts'

import MethodologyCallout from '../ui/methodologycallout'
import q1Data from '../../data/q1termstability.json'
import q2Data from '../../data/q2bridgeareas.json'
import q3Data from '../../data/q3categoryalignment.json'
import q4Data from '../../data/q4growingniches.json'
import clusterData from '../../data/clusterexploration.json'

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_NAMES = {
  'hep-ph': 'High Energy Physics', 'hep-th': 'Theoretical Physics',
  'astro-ph': 'Astrophysics', 'astro-ph.GA': 'Galaxies',
  'astro-ph.CO': 'Cosmology', 'astro-ph.SR': 'Stars',
  'astro-ph.HE': 'High Energy Astro', 'astro-ph.EP': 'Exoplanets',
  'cond-mat': 'Condensed Matter', 'cond-mat.mes-hall': 'Mesoscale Physics',
  'cond-mat.mtrl-sci': 'Materials Science', 'quant-ph': 'Quantum Physics',
  'gr-qc': 'General Relativity', 'math.AG': 'Algebraic Geometry',
  'math.NT': 'Number Theory', 'math.CO': 'Combinatorics',
  'math.GR': 'Group Theory', 'math.GT': 'Topology',
  'math.DG': 'Differential Geometry', 'math.AP': 'PDEs',
  'math.PR': 'Probability', 'math.NA': 'Numerical Analysis',
  'cs.LG': 'Machine Learning', 'cs.CV': 'Computer Vision',
  'cs.CL': 'NLP', 'cs.AI': 'Artificial Intelligence',
  'cs.NE': 'Neural Networks', 'cs.CR': 'Cryptography',
  'cs.IT': 'Information Theory', 'cs.RO': 'Robotics',
  'stat.ML': 'Statistical ML', 'eess.SP': 'Signal Processing',
  'eess.AS': 'Audio & Speech', 'q-bio': 'Quantitative Biology',
}

const DOMAIN_NAMES = {
  'cs': 'Computer Science', 'math': 'Mathematics', 'physics': 'Physics',
  'stat': 'Statistics', 'hep-ph': 'High Energy Physics',
  'hep-th': 'Theoretical Physics', 'astro-ph': 'Astrophysics',
  'cond-mat': 'Condensed Matter', 'quant-ph': 'Quantum Physics',
  'gr-qc': 'Relativity', 'eess': 'Electrical Engineering',
  'q-bio': 'Biology', 'q-fin': 'Finance', 'nlin': 'Nonlinear Science',
  'nucl-th': 'Nuclear Physics', 'math-ph': 'Mathematical Physics',
}

// Explicit per-domain color map — no dynamic Tailwind strings
const DOMAIN_COLORS = {
  'cs':       '#10b981',
  'math':     '#a855f7',
  'hep-ph':   '#3b82f6',
  'hep-th':   '#3b82f6',
  'astro-ph': '#f59e0b',
  'cond-mat': '#6366f1',
  'quant-ph': '#60a5fa',
  'gr-qc':    '#6b7280',
  'stat':     '#14b8a6',
  'eess':     '#f97316',
  'q-bio':    '#84cc16',
  'math-ph':  '#a855f7',
  'nucl-th':  '#3b82f6',
  'nlin':     '#ec4899',
}

// Explicit color class sets for MetricExplainer — no dynamic string interpolation
const METRIC_COLOR_CLASSES = {
  blue:    { bg: 'bg-blue-500/5',    border: 'border-blue-500/20',    title: 'text-blue-400'    },
  emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', title: 'text-emerald-400' },
  purple:  { bg: 'bg-purple-500/5',  border: 'border-purple-500/20',  title: 'text-purple-400'  },
  amber:   { bg: 'bg-amber-500/5',   border: 'border-amber-500/20',   title: 'text-amber-400'   },
}

// ============================================================================
// HELPERS
// ============================================================================

function getCategoryName(code) {
  return CATEGORY_NAMES[code] || code
}

function getDomainName(code) {
  return DOMAIN_NAMES[code] || code
}

function getDomainColor(domain) {
  if (!domain) return '#6b7280'
  const key = domain.split('.')[0]
  return DOMAIN_COLORS[key] || DOMAIN_COLORS[domain] || '#6b7280'
}

// Normalize topTerms — can be string[] (q1/q2/q3/q4 data) or {term,score}[] (clusterexploration)
function getTermStrings(topTerms) {
  if (!topTerms) return []
  return topTerms.map(t => (typeof t === 'string' ? t : t.term)).filter(Boolean)
}

function getClusterName(cluster) {
  const terms = getTermStrings(cluster.topTerms)
  const id = cluster.clusterId ?? cluster.id
  const valid = terms.filter(t =>
    !t.startsWith('math') && !t.startsWith('frac') &&
    !t.includes('\\') && t.length > 2
  )
  if (valid.length >= 2) {
    return valid.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ')
  }
  return `Cluster ${id}`
}

function getShortName(cluster) {
  const terms = getTermStrings(cluster.topTerms)
  const id = cluster.clusterId ?? cluster.id
  const valid = terms.filter(t =>
    !t.startsWith('math') && !t.startsWith('frac') && t.length > 2
  )
  if (valid.length >= 1) {
    return valid[0].charAt(0).toUpperCase() + valid[0].slice(1)
  }
  return `C${id}`
}

// Formats a growth rate multiplier (where 1.0 = no change) for display
function formatGrowthRate(rate) {
  if (rate === undefined || rate === null) return '—'
  if (rate > 1000) return `${(rate / 1000).toFixed(0)}k×`
  if (rate > 10)   return `${rate.toFixed(0)}×`
  if (rate >= 1)   return `+${(rate * 100).toFixed(0)}%`
  return `+${(rate * 100).toFixed(0)}%`
}

// Formats a plain-percentage growth rate (clusterexploration.json stores e.g. 1230350.0)
function formatPctGrowth(pct) {
  if (pct === undefined || pct === null) return '—'
  if (pct >= 100000) return `${(pct / 1000).toFixed(0)}k×`
  if (pct >= 1000)   return `${(pct / 1000).toFixed(1)}k%`
  return `+${pct.toFixed(0)}%`
}

function isMeaningfulTerm(term) {
  if (!term || typeof term !== 'string') return false
  return (
    !term.startsWith('math') &&
    !term.startsWith('frac') &&
    !term.includes('\\') &&
    term.length > 2
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Results() {
  const [activeTab, setActiveTab] = useState('q1')
  const [expandedChart, setExpandedChart] = useState(null)

  const tabs = [
    { id: 'q1',      label: 'Term Stability',     color: '#3b82f6' },
    { id: 'q2',      label: 'Bridge Areas',        color: '#10b981' },
    { id: 'q3',      label: 'Category Alignment',  color: '#a855f7' },
    { id: 'q4',      label: 'Growing Niches',      color: '#f59e0b' },
    { id: 'explore', label: 'Explore Clusters',    color: '#6366f1' },
  ]

  return (
    <section id="results" data-section="results" className="min-h-screen py-24 px-6 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Research Findings</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore the key discoveries from analyzing 2.4 million scientific papers.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  isActive
                    ? 'border-current'
                    : 'bg-gray-800/50 text-gray-400 border-transparent hover:border-gray-600'
                }`}
                style={isActive ? {
                  backgroundColor: `${tab.color}18`,
                  color: tab.color,
                  borderColor: `${tab.color}45`,
                } : {}}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-4">
              <MethodologyCallout
                step="Pipeline Output"
                title="K-Means Clustering (k=50)"
                input="500-dim SVD vectors, 2.4M papers"
                output="50 cluster assignments"
                note="k selected via elbow method + silhouette analysis across k=20–80"
              />
            </div>
            {activeTab === 'q1'      && <TermStabilityTab     setExpandedChart={setExpandedChart} />}
            {activeTab === 'q2'      && <BridgeAreasTab        setExpandedChart={setExpandedChart} />}
            {activeTab === 'q3'      && <CategoryAlignmentTab  setExpandedChart={setExpandedChart} />}
            {activeTab === 'q4'      && <GrowingNichesTab      setExpandedChart={setExpandedChart} />}
            {activeTab === 'explore' && <ClusterExplorationTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Expanded chart modal — AnimatePresence wraps the conditional */}
      <ExpandedChartModal expandedChart={expandedChart} setExpandedChart={setExpandedChart} />
    </section>
  )
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function ExpandedChartModal({ expandedChart, setExpandedChart }) {
  return (
    <AnimatePresence>
      {expandedChart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setExpandedChart(null)}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">{expandedChart.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{expandedChart.description}</p>
              </div>
              <button onClick={() => setExpandedChart(null)} className="text-gray-400 hover:text-white p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="min-h-[500px]">{expandedChart.content}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ExpandableChart({ title, description, children, expandedContent, setExpandedChart, methodology }) {
  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-medium">{title}</h4>
        <button
          onClick={() => setExpandedChart({ title, description, content: expandedContent })}
          className="text-gray-500 hover:text-blue-400 p-1 transition-colors"
          title="Expand for full dataset"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
      {children}
      {methodology && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-gray-600 text-xs text-center">{methodology}</p>
        </div>
      )}
    </div>
  )
}

function MetricExplainer({ metric, color = 'blue' }) {
  const explanations = {
    jaccard: {
      name: 'Jaccard Similarity',
      formula: '|A ∩ B| / |A ∪ B|',
      meaning: 'Measures overlap between two sets. 0 = no overlap, 1 = identical sets.',
      context: 'We compare top-20 terms between time periods.',
    },
    shannon: {
      name: 'Shannon Entropy',
      formula: '-Σ p(x) log p(x)',
      meaning: 'Measures diversity/uncertainty. Higher = more evenly distributed across categories.',
      context: 'Max entropy ≈ 2.0 for 4 domains with equal papers.',
    },
    nmi: {
      name: 'Normalized Mutual Information',
      formula: 'I(X;Y) / √(H(X)·H(Y))',
      meaning: 'How much knowing cluster tells you about category. 0 = independent, 1 = perfect prediction.',
      context: 'Standard metric for comparing clusterings.',
    },
    purity: {
      name: 'Cluster Purity',
      formula: 'max_category / cluster_size',
      meaning: 'Fraction of papers from the dominant category. Higher = more homogeneous.',
      context: 'Low purity often indicates interdisciplinary clusters.',
    },
  }

  const info = explanations[metric]
  if (!info) return null

  // Use explicit class sets — no dynamic Tailwind string interpolation
  const cls = METRIC_COLOR_CLASSES[color] || METRIC_COLOR_CLASSES.blue

  return (
    <div className={`${cls.bg} border ${cls.border} rounded-lg p-3 text-xs`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`${cls.title} font-medium`}>{info.name}</span>
        <code className="text-gray-500 bg-gray-800 px-1 rounded">{info.formula}</code>
      </div>
      <p className="text-gray-400">{info.meaning}</p>
      <p className="text-gray-500 mt-1 italic">{info.context}</p>
    </div>
  )
}

function FullClusterTable({ data, valueKey, valueLabel, color, ascending = false, showGrowth = false, extraColumns = [] }) {
  const sorted = ascending ? [...data].sort((a, b) => a[valueKey] - b[valueKey]) : data
  return (
    <div className="overflow-auto max-h-[500px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-900">
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Cluster</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">{valueLabel}</th>
            {showGrowth && <th className="text-left py-3 px-4 text-gray-400 font-medium">Growth</th>}
            {extraColumns.map(col => (
              <th key={col.key} className="text-left py-3 px-4 text-gray-400 font-medium">{col.label}</th>
            ))}
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Papers</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Keywords</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((cluster, index) => (
            <tr key={cluster.clusterId} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="py-3 px-4 text-gray-500">{index + 1}</td>
              <td className="py-3 px-4">
                <div className="text-white font-medium">{getClusterName(cluster)}</div>
                <div className="text-gray-500 text-xs">C{cluster.clusterId}</div>
              </td>
              <td className="py-3 px-4" style={{ color }}>{(cluster[valueKey] * 100).toFixed(1)}%</td>
              {showGrowth && (
                <td className={`py-3 px-4 ${cluster.growthRate > 0.5 ? 'text-emerald-400' : cluster.growthRate > 0 ? 'text-gray-400' : 'text-amber-400'}`}>
                  {formatGrowthRate(cluster.growthRate)}
                </td>
              )}
              {extraColumns.map(col => (
                <td key={col.key} className="py-3 px-4 text-gray-400">{col.render(cluster)}</td>
              ))}
              <td className="py-3 px-4 text-gray-400">{cluster.size?.toLocaleString()}</td>
              <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate">
                {getTermStrings(cluster.topTerms).filter(t => !t.startsWith('math') && t.length > 2).slice(0, 5).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Q1 — STABILITY SCATTER (NEW)
// All 50 clusters: x=stability, y=size, color=domain
// ============================================================================

function StabilityScatterChart({ data, setExpandedChart }) {
  const scatterPoints = data.map(c => ({
    x: parseFloat((c.stability * 100).toFixed(1)),
    y: c.size,
    id: c.clusterId,
    name: getClusterName(c),
    domain: c.domain,
    topTerms: c.topTerms,
    stability: c.stability,
    size: c.size,
    color: getDomainColor(c.domain),
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-white font-medium text-sm">{d.name}</p>
        <p className="text-gray-500 text-xs mb-1">Cluster {d.id}</p>
        <p className="text-sm" style={{ color: d.color }}>
          {getDomainName(d.domain)}
        </p>
        <p className="text-blue-400 text-sm">Stability: {(d.stability * 100).toFixed(1)}%</p>
        <p className="text-gray-400 text-sm">{d.size.toLocaleString()} papers</p>
        <p className="text-gray-500 text-xs mt-1 truncate max-w-[180px]">
          {getTermStrings(d.topTerms).filter(isMeaningfulTerm).slice(0, 4).join(', ')}
        </p>
      </div>
    )
  }

  // Domain legend entries (deduplicated)
  const legendDomains = [...new Set(data.map(c => c.domain))]
    .map(d => ({ domain: d, color: getDomainColor(d), name: getDomainName(d) }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const expandedContent = (
    <div className="space-y-4">
      <div className="h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              type="number" dataKey="x" name="Stability" domain={[0, 100]}
              stroke="#4b5563"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              label={{ value: 'Vocabulary Stability (%)', position: 'bottom', fill: '#6b7280', offset: 20, fontSize: 12 }}
            />
            <YAxis
              type="number" dataKey="y" name="Papers"
              stroke="#4b5563"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              label={{ value: 'Cluster Size', angle: -90, position: 'insideLeft', fill: '#6b7280', offset: -10, fontSize: 12 }}
            />
            <ZAxis range={[40, 40]} />
            <Tooltip content={<CustomTooltip />} />
            {legendDomains.map(({ domain, color }) => (
              <Scatter
                key={domain}
                data={scatterPoints.filter(p => p.domain === domain)}
                fill={color}
                fillOpacity={0.75}
                name={getDomainName(domain)}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {legendDomains.map(({ domain, color, name }) => (
          <div key={domain} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <ExpandableChart
      title="Stability by Cluster — All 50"
      description="Each dot is one cluster. X-axis: vocabulary stability. Y-axis: number of papers. Color: research domain."
      methodology="Jaccard similarity of top-20 TF-IDF terms across three time windows"
      setExpandedChart={setExpandedChart}
      expandedContent={expandedContent}
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis
              type="number" dataKey="x" name="Stability" domain={[0, 100]}
              stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10 }}
            />
            <YAxis
              type="number" dataKey="y" name="Papers"
              stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10 }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            />
            <ZAxis range={[28, 28]} />
            <Tooltip content={<CustomTooltip />} />
            {legendDomains.map(({ domain, color }) => (
              <Scatter
                key={domain}
                data={scatterPoints.filter(p => p.domain === domain)}
                fill={color}
                fillOpacity={0.7}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/* Mini legend */}
      <div className="flex flex-wrap gap-2 mt-2">
        {legendDomains.slice(0, 6).map(({ domain, color, name }) => (
          <div key={domain} className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </div>
        ))}
      </div>
    </ExpandableChart>
  )
}

// ============================================================================
// Q1: TERM STABILITY TAB
// ============================================================================

function TermStabilityTab({ setExpandedChart }) {
  const { previewData, fullData, evolvingClusters, distribution, byDomain, summary } = q1Data

  const StabilityTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-white font-medium">{getClusterName(d)}</p>
        <p className="text-gray-500 text-xs mb-1">Cluster {d.clusterId}</p>
        <p className="text-blue-400 text-sm">Stability: {(d.stability * 100).toFixed(1)}%</p>
        <p className="text-gray-400 text-sm">{d.size?.toLocaleString()} papers</p>
        <p className="text-gray-400 text-sm">Domain: {getDomainName(d.domain)}</p>
      </div>
    )
  }

  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q1: Which fields have stable vs. evolving vocabulary?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          We measured terminology consistency by comparing the top-20 terms in each cluster across three
          time periods (1996–2005, 2006–2015, 2016–2024). High stability means the same concepts dominate
          throughout; low stability indicates rapid emergence of new terminology.
        </p>
        <MetricExplainer metric="jaccard" color="blue" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{(summary.meanStability500 * 100).toFixed(0)}%</p>
            <p className="text-gray-500 text-sm">Mean Stability</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.stableCount500}</p>
            <p className="text-gray-500 text-sm">Stable (&gt;70%)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{summary.evolvingCount500}</p>
            <p className="text-gray-500 text-sm">Evolving (&lt;30%)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300">{summary.totalClusters}</p>
            <p className="text-gray-500 text-sm">Total Clusters</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Most Stable — bar chart */}
        <ExpandableChart
          title="Most Stable Clusters"
          description="Fields with consistent terminology over decades — mature areas with established vocabulary."
          methodology="Jaccard similarity of top-20 TF-IDF terms between consecutive periods"
          setExpandedChart={setExpandedChart}
          expandedContent={<FullClusterTable data={fullData} valueKey="stability" valueLabel="Stability" color="#3b82f6" />}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={80} stroke="#374151" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<StabilityTooltip />} />
                <Bar dataKey="stability" radius={[0, 3, 3, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.stability > 0.8 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        {/* All clusters scatter — NEW */}
        <StabilityScatterChart data={fullData} setExpandedChart={setExpandedChart} />

        {/* Domain averages */}
        <ExpandableChart
          title="Stability by Research Domain"
          description="Which domains have the most / least stable terminology?"
          methodology="Averaged Jaccard score across all clusters in each domain"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDomain.map(d => ({ ...d, domainName: getDomainName(d.domain) }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis type="category" dataKey="domainName" width={130} stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip formatter={v => [`${(v * 100).toFixed(1)}%`, 'Avg Stability']} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                  <Bar dataKey="meanStability" radius={[0, 3, 3, 0]}>
                    {byDomain.map((d, i) => (
                      <Cell key={i} fill={getDomainColor(d.domain)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDomain.slice(0, 7).map(d => ({ ...d, domainName: getDomainName(d.domain) }))} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="domainName" width={80} stroke="#374151" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip formatter={v => [`${(v * 100).toFixed(1)}%`, 'Stability']} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="meanStability" radius={[0, 3, 3, 0]}>
                  {byDomain.slice(0, 7).map((d, i) => (
                    <Cell key={i} fill={getDomainColor(d.domain)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        {/* Distribution histogram */}
        <ExpandableChart
          title="Stability Distribution"
          description="How are clusters distributed across stability levels?"
          methodology="Histogram of Jaccard stability scores across all clusters"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="range" stroke="#374151" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#374151" tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <XAxis dataKey="range" stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis stroke="#374151" tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>
      </div>

      <div className="bg-blue-500/8 border border-blue-500/25 rounded-xl p-6">
        <h4 className="text-blue-400 font-medium mb-2">Key Finding</h4>
        <p className="text-gray-300">
          Mathematics and physics show the highest vocabulary stability (&gt;80%), reflecting
          mature fields with established concepts. CS clusters — especially ML/AI — show the lowest
          stability (&lt;30%), with terms like "transformer" and "diffusion" emerging rapidly.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Q2: BRIDGE AREAS TAB
// ============================================================================

function BridgeAreasTab({ setExpandedChart }) {
  const { previewData, fullData, focusedClusters, scatterData, distribution, summary } = q2Data

  const BridgeTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    const domains = d.topDomains?.map(getDomainName).join(' ↔ ') || 'Multiple'
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-white font-medium">{getClusterName(d)}</p>
        <p className="text-gray-500 text-xs mb-1">Cluster {d.clusterId}</p>
        <p className="text-emerald-400 text-sm">Bridge Score: {(d.bridgeScore * 100).toFixed(1)}%</p>
        <p className="text-blue-400 text-sm">{domains}</p>
        <p className="text-gray-400 text-sm">{d.nDomains} domains · {d.size?.toLocaleString()} papers</p>
      </div>
    )
  }

  // Rich scatter tooltip for the preview version
  const ScatterTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-white font-medium text-sm">{d.name}</p>
        <p className="text-gray-500 text-xs mb-1">C{d.clusterId}</p>
        <p className="text-emerald-400 text-sm">Bridge: {(d.y * 100).toFixed(1)}%</p>
        <p className="text-blue-400 text-sm">Diversity: {d.x.toFixed(2)}</p>
        <p className="text-gray-400 text-sm">{d.size?.toLocaleString()} papers</p>
      </div>
    )
  }

  const chartData    = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const focusedData  = focusedClusters.map(d => ({ ...d, name: getShortName(d) }))

  // Growth advantage display — the raw ratio can be astronomical, show a clean version
  const growthAdvantageDisplay = summary.growthAdvantage > 1000
    ? `${(summary.growthAdvantage / 100).toFixed(0)}×`
    : `${summary.growthAdvantage?.toFixed(0)}%`

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q2: What are the interdisciplinary bridge areas?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          Bridge clusters span multiple traditional domains. We score them based on how evenly
          papers are distributed across domains, the rate of multi-category submissions, and
          recent growth patterns.
        </p>
        <MetricExplainer metric="shannon" color="emerald" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.totalBridges500}</p>
            <p className="text-gray-500 text-sm">Bridge Clusters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{growthAdvantageDisplay}</p>
            <p className="text-gray-500 text-sm">Growth Advantage</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{(summary.meanBridgeScore500 * 100).toFixed(0)}%</p>
            <p className="text-gray-500 text-sm">Avg Bridge Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300">{summary.totalClusters}</p>
            <p className="text-gray-500 text-sm">Total Clusters</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ExpandableChart
          title="Top Interdisciplinary Bridges"
          description="Clusters spanning multiple domains with balanced representation."
          methodology="Bridge = diversity × balance × growth × recency"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable
              data={fullData} valueKey="bridgeScore" valueLabel="Bridge Score" color="#10b981"
              extraColumns={[{
                key: 'domains', label: 'Domains Bridged',
                render: c => c.topDomains?.slice(0, 2).map(getDomainName).join(' ↔ ') || '—'
              }]}
            />
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={80} stroke="#374151" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<BridgeTooltip />} />
                <Bar dataKey="bridgeScore" fill="#10b981" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Single-Domain Specialists"
          description="Focused clusters within traditional boundaries — concentrated, not interdisciplinary."
          methodology="Low bridge score = concentrated in one domain"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable
              data={[...fullData].sort((a, b) => a.bridgeScore - b.bridgeScore)}
              valueKey="bridgeScore" valueLabel="Bridge Score" color="#6366f1" ascending
              extraColumns={[{
                key: 'domain', label: 'Primary Domain',
                render: c => getDomainName(c.topDomains?.[0] || c.topCategory?.split('.')[0])
              }]}
            />
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusedData} layout="vertical">
                <XAxis type="number" domain={[0, 0.6]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={80} stroke="#374151" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<BridgeTooltip />} />
                <Bar dataKey="bridgeScore" fill="#6366f1" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        {/* Scatter with fixed tooltip */}
        <ExpandableChart
          title="Diversity vs Bridge Score — All 50"
          description="Domain diversity (Shannon entropy) is the primary driver of bridge score."
          methodology="X: Shannon entropy of domains · Y: composite bridge score · dot size: paper count"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis type="number" dataKey="x" name="Diversity" stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 11 }}
                    label={{ value: 'Domain Diversity (Shannon Entropy)', position: 'bottom', fill: '#6b7280', offset: 20, fontSize: 12 }} />
                  <YAxis type="number" dataKey="y" name="Bridge Score" stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                  <ZAxis type="number" dataKey="size" range={[40, 400]} />
                  <Tooltip content={<ScatterTooltip />} />
                  <Scatter data={scatterData} fill="#10b981" fillOpacity={0.65} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis type="number" dataKey="x" stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10 }}
                  label={{ value: 'Domain Diversity', position: 'insideBottomRight', fill: '#4b5563', fontSize: 10, offset: -5 }} />
                <YAxis type="number" dataKey="y" stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <ZAxis type="number" dataKey="size" range={[24, 180]} />
                <Tooltip content={<ScatterTooltip />} />
                <Scatter data={scatterData} fill="#10b981" fillOpacity={0.65} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Bridge Score Distribution"
          description="Most clusters have moderate bridge scores — few are pure specialists or true bridges."
          methodology="30% entropy + 20% multi-category + 15% recency + 10% growth + 15% n_domains + 10% balance"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="range" stroke="#374151" tick={{ fill: '#9ca3af' }} />
                    <YAxis stroke="#374151" tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm font-medium mb-2">Bridge Score Components</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div><span className="text-emerald-400">30%</span> Domain diversity (entropy)</div>
                  <div><span className="text-emerald-400">20%</span> Multi-category submissions</div>
                  <div><span className="text-emerald-400">15%</span> Recent paper ratio</div>
                  <div><span className="text-emerald-400">10%</span> Growth rate</div>
                  <div><span className="text-emerald-400">15%</span> Number of domains</div>
                  <div><span className="text-emerald-400">10%</span> Domain balance</div>
                </div>
              </div>
            </div>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <XAxis dataKey="range" stroke="#374151" tick={{ fontSize: 9, fill: '#6b7280' }} />
                <YAxis stroke="#374151" tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>
      </div>

      <div className="bg-emerald-500/8 border border-emerald-500/25 rounded-xl p-6">
        <h4 className="text-emerald-400 font-medium mb-2">Key Finding</h4>
        <p className="text-gray-300">
          Interdisciplinary bridges grow significantly faster than single-domain clusters.
          Innovation increasingly happens at boundaries — areas like computational biology
          and quantum ML attract researchers from multiple fields.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Q3 — PURITY SCATTER (NEW)
// All 50 clusters: x=cluster size, y=purity, color=dominant category domain
// ============================================================================

function PurityScatterChart({ scatterData, setExpandedChart }) {
  const points = scatterData.map(d => {
    const domain = d.category?.split('.')?.[0] || d.category || 'other'
    return {
      ...d,
      name: getCategoryName(d.category),
      domain,
      color: getDomainColor(domain),
      pct: parseFloat((d.y * 100).toFixed(1)),
    }
  })

  const PurityTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium text-sm">Cluster {d.clusterId}</p>
        <p className="text-gray-500 text-xs mb-1">Dominant: {d.name}</p>
        <p className="text-purple-400 text-sm">Purity: {d.pct}%</p>
        <p className="text-gray-400 text-sm">{d.x.toLocaleString()} papers</p>
      </div>
    )
  }

  const domains = [...new Set(points.map(p => p.domain))]
    .map(d => ({ domain: d, color: getDomainColor(d), name: getDomainName(d) }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const expandedContent = (
    <div className="space-y-4">
      <div className="h-[480px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis type="number" dataKey="x" name="Size" stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              label={{ value: 'Cluster Size (papers)', position: 'bottom', fill: '#6b7280', offset: 30, fontSize: 12 }} />
            <YAxis type="number" dataKey="y" name="Purity" domain={[0, 1]} stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              label={{ value: 'Purity', angle: -90, position: 'insideLeft', fill: '#6b7280', offset: -5, fontSize: 12 }} />
            <ZAxis range={[40, 40]} />
            <Tooltip content={<PurityTooltip />} />
            {domains.map(({ domain, color }) => (
              <Scatter key={domain} data={points.filter(p => p.domain === domain)} fill={color} fillOpacity={0.72} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {domains.map(({ domain, color, name }) => (
          <div key={domain} className="flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <ExpandableChart
      title="Purity vs Size — All 50 Clusters"
      description="Each dot is one cluster. X-axis: paper count. Y-axis: purity score. Color: dominant ArXiv domain."
      methodology="Purity = papers in dominant category / total cluster size"
      setExpandedChart={setExpandedChart}
      expandedContent={expandedContent}
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 5, bottom: 10, left: 5 }}>
            <XAxis type="number" dataKey="x" name="Size" stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10 }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="number" dataKey="y" name="Purity" domain={[0, 1]} stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10 }}
              tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
            <ZAxis range={[26, 26]} />
            <Tooltip content={<PurityTooltip />} />
            {domains.map(({ domain, color }) => (
              <Scatter key={domain} data={points.filter(p => p.domain === domain)} fill={color} fillOpacity={0.7} />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {domains.slice(0, 6).map(({ domain, color, name }) => (
          <div key={domain} className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            {name}
          </div>
        ))}
      </div>
    </ExpandableChart>
  )
}

// ============================================================================
// Q3: CATEGORY ALIGNMENT TAB
// ============================================================================

function CategoryAlignmentTab({ setExpandedChart }) {
  const { previewData, fullData, misalignedClusters, metrics, purityDistribution, scatterData, summary } = q3Data

  const PurityTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-white font-medium">{getClusterName(d)}</p>
        <p className="text-gray-500 text-xs mb-1">Cluster {d.clusterId}</p>
        <p className="text-purple-400 text-sm">Purity: {(d.purity * 100).toFixed(1)}%</p>
        <p className="text-gray-400 text-sm">Dominant: {getCategoryName(d.dominantCategory)}</p>
        <p className="text-gray-400 text-sm">Spans {d.nCategories} categories</p>
      </div>
    )
  }

  const chartData        = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const misalignedData   = misalignedClusters.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q3: How well do clusters match ArXiv categories?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          We compare content-based clusters against ArXiv's human-curated categories. Partial alignment
          is expected — and informative. Low-purity clusters often represent genuinely interdisciplinary
          areas that don't fit neatly into existing categories.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <MetricExplainer metric="nmi" color="purple" />
          <MetricExplainer metric="purity" color="purple" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{(summary.nmi500 * 100).toFixed(0)}%</p>
            <p className="text-gray-500 text-sm">NMI Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{(summary.avgPurity500 * 100).toFixed(0)}%</p>
            <p className="text-gray-500 text-sm">Avg Purity</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.highPurityCount500}</p>
            <p className="text-gray-500 text-sm">High Purity (&gt;50%)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{summary.lowPurityCount500}</p>
            <p className="text-gray-500 text-sm">Low Purity (&lt;20%)</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Best aligned */}
        <ExpandableChart
          title="Best Aligned — Highest Purity"
          description="These clusters map cleanly to single ArXiv categories — traditional, well-defined fields."
          methodology="Purity = papers in dominant category / total papers"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable
              data={fullData} valueKey="purity" valueLabel="Purity" color="#a855f7"
              extraColumns={[{ key: 'category', label: 'Dominant Category', render: c => getCategoryName(c.dominantCategory) }]}
            />
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={80} stroke="#374151" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<PurityTooltip />} />
                <Bar dataKey="purity" fill="#a855f7" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        {/* Purity scatter — NEW (replaces least aligned bar) */}
        <PurityScatterChart scatterData={scatterData} setExpandedChart={setExpandedChart} />

        {/* Alignment metrics */}
        <ExpandableChart
          title="Alignment Metrics"
          description="Standard clustering evaluation metrics comparing content clusters to ground-truth labels."
          methodology="Higher = better alignment with ArXiv categories"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="space-y-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis type="number" domain={[0, 0.5]} stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis type="category" dataKey="metric" width={100} stroke="#374151" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                    <Bar dataKey="score500" fill="#a855f7" name="Score" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-xs text-gray-400 space-y-2">
                <p><span className="text-purple-400 font-medium">NMI:</span> How much knowing cluster predicts category (0–1)</p>
                <p><span className="text-purple-400 font-medium">ARI:</span> Agreement adjusted for chance (0 = random, 1 = identical)</p>
                <p><span className="text-purple-400 font-medium">V-measure:</span> Balance of homogeneity and completeness</p>
              </div>
            </div>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics} layout="vertical">
                <XAxis type="number" domain={[0, 0.5]} stroke="#374151" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis type="category" dataKey="metric" width={80} stroke="#374151" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="score500" fill="#a855f7" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        {/* Purity distribution */}
        <ExpandableChart
          title="Purity Distribution"
          description="Most clusters have moderate purity — few are pure or completely mixed."
          methodology="Purity = max(category count) / cluster size"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="range" stroke="#374151" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#374151" tick={{ fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purityDistribution}>
                <XAxis dataKey="range" stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis stroke="#374151" tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>
      </div>

      <div className="bg-purple-500/8 border border-purple-500/25 rounded-xl p-6">
        <h4 className="text-purple-400 font-medium mb-2">Key Finding</h4>
        <p className="text-gray-300">
          Moderate NMI (~{(summary.nmi500 * 100).toFixed(0)}%) shows content clusters capture different
          structure than human categorization. Low-purity clusters aren't errors — they reveal interdisciplinary
          areas where content similarity crosses traditional ArXiv boundaries.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Q4 — RACING BAR CHART (NEW)
// Animated cumulative paper count per cluster over years 2007–2025
// ============================================================================

function RacingBarsChart({ fullData }) {
  const YEARS = useMemo(() => Array.from({ length: 19 }, (_, i) => 2007 + i), [])
  const TOP_N = 8

  // Pre-compute cumulative counts for every cluster at every year
  const cumulativeData = useMemo(() => {
    return fullData.map(cluster => {
      let cum = 0
      const byYear = {}
      YEARS.forEach(yr => {
        cum += cluster.yearlyCounts?.[String(yr)] || 0
        byYear[yr] = cum
      })
      return {
        id: cluster.clusterId,
        label: getClusterName(cluster),
        domain: cluster.topCategory?.split('.')?.[0] || 'other',
        byYear,
      }
    })
  }, [fullData, YEARS])

  const [yearIdx, setYearIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef(null)

  const stopPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsPlaying(false)
  }, [])

  const startPlay = useCallback(() => {
    if (yearIdx >= YEARS.length - 1) setYearIdx(0) // restart if at end
    setIsPlaying(true)
  }, [yearIdx, YEARS.length])

  useEffect(() => {
    if (!isPlaying) return
    intervalRef.current = setInterval(() => {
      setYearIdx(prev => {
        if (prev >= YEARS.length - 1) {
          stopPlay()
          return prev
        }
        return prev + 1
      })
    }, 300)
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, stopPlay, YEARS.length])

  const currentYear = YEARS[yearIdx]

  const sortedBars = useMemo(() => {
    return cumulativeData
      .map(c => ({ ...c, count: c.byYear[currentYear] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_N)
  }, [cumulativeData, currentYear])

  const maxCount = sortedBars[0]?.count || 1

  return (
    <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-medium">Cumulative Papers by Cluster</h4>
        <div className="flex items-center gap-3">
          <span className="text-4xl font-bold tabular-nums" style={{ color: '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>
            {currentYear}
          </span>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-2 mb-4">
        {sortedBars.map((bar, rank) => {
          const pct = (bar.count / maxCount) * 100
          const color = getDomainColor(bar.domain)
          return (
            <motion.div
              key={bar.id}
              layout
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-2"
            >
              {/* Rank */}
              <span className="text-gray-600 text-xs w-4 text-right flex-shrink-0">{rank + 1}</span>

              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-gray-300 text-xs truncate pr-2" style={{ maxWidth: '55%' }}>{bar.label}</span>
                  <span className="text-gray-400 text-xs tabular-nums flex-shrink-0">{bar.count.toLocaleString()}</span>
                </div>
                <div className="h-5 bg-gray-800 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                      opacity: 0.75,
                      transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  />
                </div>
              </div>

              {/* Domain dot */}
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            </motion.div>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-700/50">
        <button
          onClick={isPlaying ? stopPlay : startPlay}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700/60 hover:bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 transition-colors"
        >
          {isPlaying ? (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Play
            </>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={YEARS.length - 1}
          value={yearIdx}
          onChange={e => { stopPlay(); setYearIdx(Number(e.target.value)) }}
          className="flex-1 accent-amber-500 h-1 rounded cursor-pointer"
        />

        <span className="text-gray-500 text-xs w-16 text-right flex-shrink-0">
          {YEARS[0]} → {YEARS[YEARS.length - 1]}
        </span>
      </div>

      <p className="text-gray-600 text-xs mt-2">Top {TOP_N} clusters by cumulative paper count · color = domain</p>
    </div>
  )
}

// ============================================================================
// Q4: GROWING NICHES TAB
// ============================================================================

function GrowingNichesTab({ setExpandedChart }) {
  const { previewData, fullData, decliningClusters, trajectories, trajectoryNames, nicheDistribution, growthDistribution, summary } = q4Data

  const NicheTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
        <p className="text-white font-medium">{getClusterName(d)}</p>
        <p className="text-gray-500 text-xs mb-1">Cluster {d.clusterId}</p>
        <p className="text-amber-400 text-sm">Niche Score: {(d.nicheScore * 100).toFixed(1)}%</p>
        <p className="text-emerald-400 text-sm">Growth: {formatGrowthRate(d.growthRate)}</p>
        <p className="text-gray-400 text-sm">{d.size?.toLocaleString()} papers</p>
        <p className="text-gray-400 text-sm">Median year: {d.medianYear}</p>
      </div>
    )
  }

  const chartData      = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const slowGrowthData = decliningClusters.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q4: What are the fastest-growing research niches?</h3>
        <p className="text-gray-400 leading-relaxed mb-3">
          We identify clusters with strong recent momentum using a composite "niche score" that
          weighs growth rate, recency concentration, and acceleration. We also flag slower-growing
          areas that may be mature or underexplored.
        </p>
        <p className="text-gray-500 text-xs border-l-2 border-amber-500/40 pl-3 mb-4">
          <span className="text-amber-400/80 font-medium">Note on growth rates:</span> Since papers are never removed from ArXiv,
          all clusters technically grow. "Growth rate" compares recent publication volume (2020+) to earlier periods.
          "Slow growth" means growing slower than average, not shrinking.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{formatGrowthRate(summary.fastestGrowthRate)}</p>
            <p className="text-gray-500 text-sm">Fastest Growth</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.medianYearTop5}</p>
            <p className="text-gray-500 text-sm">Median Year (Top 5)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{fullData.filter(c => c.growthRate < 0.2).length}</p>
            <p className="text-gray-500 text-sm">Slow Growth (&lt;20%)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300">{summary.totalClusters}</p>
            <p className="text-gray-500 text-sm">Total Clusters</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fastest niches bar */}
        <ExpandableChart
          title="Fastest Growing Niches"
          description="Hot areas with explosive recent growth — often AI/ML and emerging interdisciplinary fields."
          methodology="Niche Score: 30% growth + 25% recency + 15% acceleration + 15% size + 10% distinctiveness + 5% coherence"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable
              data={fullData} valueKey="nicheScore" valueLabel="Niche Score" color="#f59e0b" showGrowth
              extraColumns={[
                { key: 'medianYear', label: 'Median Year', render: c => c.medianYear },
                { key: 'recency', label: 'Recent %', render: c => `${(c.recentRatio * 100).toFixed(0)}%` },
              ]}
            />
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={v => `${(v * 100).toFixed(0)}%`} stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={80} stroke="#374151" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<NicheTooltip />} />
                <Bar dataKey="nicheScore" fill="#f59e0b" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        {/* Slower growing bar */}
        <ExpandableChart
          title="Slower Growing Areas"
          description="Mature or potentially overlooked fields — growing, but slower than average."
          methodology="Sorted by growth rate (lowest first)"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable
              data={[...fullData].sort((a, b) => a.growthRate - b.growthRate)}
              valueKey="growthRate" valueLabel="Growth" color="#6b7280" ascending showGrowth
              extraColumns={[{ key: 'domain', label: 'Domain', render: c => getDomainName(c.topCategory?.split('.')[0]) }]}
            />
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slowGrowthData} layout="vertical">
                <XAxis type="number" domain={[0, 0.6]} tickFormatter={v => `+${(v * 100).toFixed(0)}%`} stroke="#374151" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={80} stroke="#374151" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<NicheTooltip />} />
                <Bar dataKey="growthRate" fill="#6b7280" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        {/* Racing bar chart — NEW */}
        <RacingBarsChart fullData={fullData} />

        {/* Growth rate distribution */}
        <ExpandableChart
          title="Growth Rate Distribution"
          description="Most clusters show moderate growth; a few are exploding."
          methodology="Growth = (recent papers / older papers) — 1"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="range" stroke="#374151" angle={-35} textAnchor="end" height={70} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis stroke="#374151" tick={{ fill: '#9ca3af' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm font-medium mb-2">Niche Score Components</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div><span className="text-amber-400">30%</span> Growth rate</div>
                  <div><span className="text-amber-400">25%</span> Recency (2020+ ratio)</div>
                  <div><span className="text-amber-400">15%</span> Acceleration</div>
                  <div><span className="text-amber-400">15%</span> Small size (niche-like)</div>
                  <div><span className="text-amber-400">10%</span> Distinctiveness</div>
                  <div><span className="text-amber-400">5%</span> Topic coherence</div>
                </div>
              </div>
            </div>
          }
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthDistribution}>
                <XAxis dataKey="range" stroke="#374151" tick={{ fontSize: 8, fill: '#6b7280' }} />
                <YAxis stroke="#374151" tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>
      </div>

      <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl p-6">
        <h4 className="text-amber-400 font-medium mb-2">Key Finding</h4>
        <p className="text-gray-300">
          AI/ML clusters dominate the fastest-growing list — LLMs, generative AI, and domain adaptation
          have exploded since 2020. Slower-growing areas tend to be mature physics and math fields
          with established researcher communities. Both extremes offer opportunities: fast growth
          signals momentum, slow growth may indicate underexplored gaps.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// CLUSTER EXPLORATION TAB
// ============================================================================

function ClusterExplorationTab() {
  const { clusters, summary } = clusterData
  const [sortBy, setSortBy] = useState('size')
  const [filterDomain, setFilterDomain] = useState('all')
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [showOnlyMeaningful, setShowOnlyMeaningful] = useState(false)

  const badgeColors = {
    hot:     'bg-red-500/20 text-red-400 border-red-500/30',
    rising:  'bg-amber-500/20 text-amber-400 border-amber-500/30',
    stable:  'bg-gray-500/20 text-gray-400 border-gray-500/30',
    new:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
    bridge:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    large:   'bg-purple-500/20 text-purple-400 border-purple-500/30',
    niche:   'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }

  const domains = [...new Set(clusters.flatMap(c => c.domainDistribution?.map(d => d.code) || []))]

  const filteredClusters = clusters
    .filter(c => filterDomain === 'all' || c.domainDistribution?.some(d => d.code === filterDomain))
    .filter(c => !showOnlyMeaningful || c.hasMeaningfulTerms)
    .sort((a, b) => {
      switch (sortBy) {
        case 'size':      return b.size - a.size
        case 'growth':    return b.growthRate - a.growthRate
        case 'recency':   return b.medianYear - a.medianYear
        case 'diversity': return b.domainDiversity - a.domainDiversity
        case 'purity':    return b.categoryPurity - a.categoryPurity
        default:          return 0
      }
    })

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Explore All 50 Clusters</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          Browse, filter, and explore the full landscape of research clusters. Each cluster represents
          a coherent group of papers identified by shared vocabulary patterns.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-400">{summary.totalClusters}</p>
            <p className="text-gray-500 text-sm">Clusters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{(summary.totalPapers / 1_000_000).toFixed(1)}M</p>
            <p className="text-gray-500 text-sm">Papers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.highGrowthCount}</p>
            <p className="text-gray-500 text-sm">High Growth</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{summary.latexHeavyCount || 0}</p>
            <p className="text-gray-500 text-sm">LaTeX-Heavy</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Sort:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white">
            <option value="size">Size</option>
            <option value="growth">Growth Rate</option>
            <option value="recency">Recency</option>
            <option value="diversity">Domain Diversity</option>
            <option value="purity">Category Purity</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Domain:</label>
          <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white">
            <option value="all">All</option>
            {domains.map(d => <option key={d} value={d}>{getDomainName(d)}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input type="checkbox" checked={showOnlyMeaningful} onChange={e => setShowOnlyMeaningful(e.target.checked)} className="rounded border-gray-600" />
          Hide LaTeX-heavy
        </label>
        <span className="text-gray-500 text-sm ml-auto">
          {filteredClusters.length} / {clusters.length} clusters
        </span>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClusters.map(cluster => (
          <ClusterCard key={cluster.id} cluster={cluster} badgeColors={badgeColors} onClick={() => setSelectedCluster(cluster)} />
        ))}
      </div>

      {/* Detail modal — wrapped in AnimatePresence for proper exit animation */}
      <AnimatePresence>
        {selectedCluster && (
          <ClusterDetailModal
            key={selectedCluster.id}
            cluster={selectedCluster}
            badgeColors={badgeColors}
            onClose={() => setSelectedCluster(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ClusterCard({ cluster, badgeColors, onClick }) {
  const displayName = cluster.displayTerms?.length >= 2
    ? cluster.displayTerms.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ')
    : `Cluster ${cluster.id}`

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      onClick={onClick}
      className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 cursor-pointer hover:border-indigo-500/40 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white font-medium">{displayName}</h4>
          <p className="text-gray-500 text-xs">C{cluster.id} · {cluster.size.toLocaleString()} papers</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${cluster.growthRate > 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
          {formatPctGrowth(cluster.growthRate)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {cluster.badges?.slice(0, 3).map((badge, i) => (
          <span key={i} className={`text-xs px-2 py-0.5 rounded border ${badgeColors[badge.type]}`}>
            {badge.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Domain</p>
          <p className="text-gray-300">{cluster.primaryDomain?.name || '—'}</p>
        </div>
        <div>
          <p className="text-gray-500">Median</p>
          <p className="text-gray-300">{cluster.medianYear}</p>
        </div>
        <div>
          <p className="text-gray-500">Purity</p>
          <p className="text-gray-300">{cluster.categoryPurity}%</p>
        </div>
      </div>

      <p className="text-gray-500 text-xs mt-3 truncate">
        {cluster.displayTerms?.join(', ') || cluster.topTerms?.slice(0, 5).map(t => t.term).join(', ')}
      </p>
    </motion.div>
  )
}

function ClusterDetailModal({ cluster, badgeColors, onClose }) {
  const displayName = cluster.displayTerms?.length >= 2
    ? cluster.displayTerms.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ')
    : `Cluster ${cluster.id}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">{displayName}</h3>
            <p className="text-gray-400">Cluster {cluster.id} · {cluster.size.toLocaleString()} papers ({cluster.sizePercentage}%)</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {cluster.badges?.map((badge, i) => (
            <div key={i} className={`px-3 py-1 rounded-lg border ${badgeColors[badge.type]}`}>
              <span className="font-medium">{badge.label}</span>
              <span className="text-xs ml-2 opacity-60">{badge.description}</span>
            </div>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{formatPctGrowth(cluster.growthRate)}</p>
            <p className="text-gray-500 text-xs">Growth Rate</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{cluster.medianYear}</p>
            <p className="text-gray-500 text-xs">Median Year</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{cluster.categoryPurity}%</p>
            <p className="text-gray-500 text-xs">Purity</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{cluster.domainDiversity.toFixed(2)}</p>
            <p className="text-gray-500 text-xs">Domain Diversity</p>
          </div>
        </div>

        {/* Top Terms */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Top Terms (TF-IDF)</h4>
          <div className="flex flex-wrap gap-2">
            {cluster.topTerms?.slice(0, 15).map((term, i) => {
              const meaningful = isMeaningfulTerm(term.term)
              return (
                <span
                  key={i}
                  className={`px-2 py-1 rounded text-sm ${
                    meaningful
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                  }`}
                >
                  {term.term}
                  <span className="text-xs ml-1 opacity-40">({(term.score * 100).toFixed(1)})</span>
                </span>
              )
            })}
          </div>
          <p className="text-gray-600 text-xs mt-2">Dimmed terms are LaTeX notation or very short</p>
        </div>

        {/* Category Distribution */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Category Distribution</h4>
          <div className="space-y-2">
            {cluster.topCategories?.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-28 text-gray-400 text-sm truncate">{cat.name}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
                <div className="w-14 text-right text-gray-400 text-sm">{cat.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Distribution */}
        <div>
          <h4 className="text-white font-medium mb-3">Domain Distribution</h4>
          <div className="space-y-2">
            {cluster.domainDistribution?.map((domain, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-32 text-gray-400 text-sm">{domain.name}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${domain.percentage}%` }} />
                </div>
                <div className="w-24 text-right text-gray-400 text-sm">
                  {domain.count.toLocaleString()} ({domain.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ArXiv paper deep links — no paper IDs present in clusterexploration.json data;
            fields checked: examplePapers, topPapers, paperIds, examples — none found.
            Links would be rendered as: https://arxiv.org/abs/{id} if data were available. */}

        {/* Temporal */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Year Range</p>
              <p className="text-white">{cluster.yearRange?.[0]} — {cluster.yearRange?.[1]}</p>
            </div>
            <div>
              <p className="text-gray-500">Recent (2020+)</p>
              <p className="text-white">{cluster.recentRatio}%</p>
            </div>
            <div>
              <p className="text-gray-500">Multi-Category Rate</p>
              <p className="text-white">{cluster.multiCategoryRate}%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
