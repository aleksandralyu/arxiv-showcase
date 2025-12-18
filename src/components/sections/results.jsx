import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis,
  AreaChart, Area, Legend, CartesianGrid, PieChart, Pie
} from 'recharts'

// Import actual data from JSON files
import q1Data from '../../data/q1termstability.json'
import q2Data from '../../data/q2bridgeareas.json'
import q3Data from '../../data/q3categoryalignment.json'
import q4Data from '../../data/q4growingniches.json'
import clusterData from '../../data/clusterexploration.json'

// ============================================================================
// ARXIV CATEGORY MAPPINGS
// ============================================================================
const CATEGORY_NAMES = {
  'hep-ph': 'High Energy Physics',
  'hep-th': 'Theoretical Physics',
  'astro-ph': 'Astrophysics',
  'astro-ph.GA': 'Galaxies',
  'astro-ph.CO': 'Cosmology',
  'astro-ph.SR': 'Stars',
  'astro-ph.HE': 'High Energy Astro',
  'cond-mat': 'Condensed Matter',
  'cond-mat.mes-hall': 'Mesoscale Physics',
  'cond-mat.mtrl-sci': 'Materials Science',
  'quant-ph': 'Quantum Physics',
  'gr-qc': 'General Relativity',
  'math.AG': 'Algebraic Geometry',
  'math.NT': 'Number Theory',
  'math.CO': 'Combinatorics',
  'math.GR': 'Group Theory',
  'math.GT': 'Topology',
  'math.DG': 'Differential Geometry',
  'math.AP': 'PDEs',
  'cs.LG': 'Machine Learning',
  'cs.CV': 'Computer Vision',
  'cs.CL': 'NLP',
  'cs.AI': 'Artificial Intelligence',
  'cs.NE': 'Neural Networks',
  'cs.CR': 'Cryptography',
  'cs.IT': 'Information Theory',
  'stat.ML': 'Statistical ML',
  'eess.SP': 'Signal Processing',
  'q-bio': 'Quantitative Biology',
}

const DOMAIN_NAMES = {
  'cs': 'Computer Science',
  'math': 'Mathematics',
  'physics': 'Physics',
  'stat': 'Statistics',
  'hep-ph': 'High Energy Physics',
  'hep-th': 'Theoretical Physics',
  'astro-ph': 'Astrophysics',
  'cond-mat': 'Condensed Matter',
  'quant-ph': 'Quantum Physics',
  'gr-qc': 'Relativity',
  'eess': 'Electrical Engineering',
  'q-bio': 'Biology',
  'q-fin': 'Finance',
  'nlin': 'Nonlinear Science',
  'nucl-th': 'Nuclear Physics',
  'math-ph': 'Mathematical Physics',
}

function getCategoryName(code) {
  return CATEGORY_NAMES[code] || code
}

function getDomainName(code) {
  return DOMAIN_NAMES[code] || code
}

// Helper to generate cluster name from top terms (filtering LaTeX artifacts)
function getClusterName(cluster) {
  if (!cluster.topTerms) return `Cluster ${cluster.clusterId}`
  
  // Filter out LaTeX artifacts and short terms
  const validTerms = cluster.topTerms.filter(t => {
    const term = typeof t === 'string' ? t : t
    return !term.startsWith('math') && 
           !term.startsWith('frac') && 
           !term.includes('\\') &&
           term.length > 2
  })
  
  if (validTerms.length >= 2) {
    return validTerms.slice(0, 2).map(t => 
      t.charAt(0).toUpperCase() + t.slice(1)
    ).join(' & ')
  }
  return `Cluster ${cluster.clusterId}`
}

function getShortName(cluster) {
  if (!cluster.topTerms) return `C${cluster.clusterId}`
  const validTerms = cluster.topTerms.filter(t => 
    !t.startsWith('math') && !t.startsWith('frac') && t.length > 2
  )
  if (validTerms.length >= 1) {
    const term = validTerms[0]
    return term.charAt(0).toUpperCase() + term.slice(1)
  }
  return `C${cluster.clusterId}`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Results() {
  const [activeTab, setActiveTab] = useState('q1')
  const [expandedChart, setExpandedChart] = useState(null)

  const tabs = [
    { id: 'q1', label: 'Term Stability', color: '#3b82f6' },
    { id: 'q2', label: 'Bridge Areas', color: '#10b981' },
    { id: 'q3', label: 'Category Alignment', color: '#a855f7' },
    { id: 'q4', label: 'Growing Niches', color: '#f59e0b' },
    { id: 'explore', label: 'Explore Clusters', color: '#6366f1' },
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

        {/* Methodology Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 mb-8 text-sm"
        >
          <p className="text-gray-400">
            <span className="text-gray-300 font-medium">A note on cluster names:</span>{' '}
            Clusters are named by their top TF-IDF terms. Some clusters capture LaTeX notation 
            (like "mathbb") or very general terms rather than meaningful concepts. This is a known 
            limitation of unsupervised text clustering. Explore the data to find the genuinely 
            interesting patterns—and consider what preprocessing improvements could help in future iterations.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id ? 'border' : 'bg-gray-800/50 text-gray-400 border border-transparent hover:border-gray-600'
              }`}
              style={activeTab === tab.id ? { backgroundColor: `${tab.color}20`, color: tab.color, borderColor: `${tab.color}50` } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'q1' && <TermStabilityTab setExpandedChart={setExpandedChart} />}
            {activeTab === 'q2' && <BridgeAreasTab setExpandedChart={setExpandedChart} />}
            {activeTab === 'q3' && <CategoryAlignmentTab setExpandedChart={setExpandedChart} />}
            {activeTab === 'q4' && <GrowingNichesTab setExpandedChart={setExpandedChart} />}
            {activeTab === 'explore' && <ClusterExplorationTab />}
          </motion.div>
        </AnimatePresence>
      </div>
      <ExpandedChartModal expandedChart={expandedChart} setExpandedChart={setExpandedChart} />
    </section>
  )
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function ExpandedChartModal({ expandedChart, setExpandedChart }) {
  if (!expandedChart) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        onClick={() => setExpandedChart(null)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
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
          className="text-gray-400 hover:text-blue-400 p-1 transition-colors"
          title="Expand for full dataset"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
      {children}
      {methodology && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-gray-500 text-xs text-center">{methodology}</p>
        </div>
      )}
    </div>
  )
}

// Metric explanation component
function MetricExplainer({ metric, color = 'blue' }) {
  const explanations = {
    'jaccard': {
      name: 'Jaccard Similarity',
      formula: '|A ∩ B| / |A ∪ B|',
      meaning: 'Measures overlap between two sets. 0 = no overlap, 1 = identical sets.',
      context: 'We compare top-20 terms between time periods.'
    },
    'shannon': {
      name: 'Shannon Entropy',
      formula: '-Σ p(x) log p(x)',
      meaning: 'Measures diversity/uncertainty. Higher = more evenly distributed across categories.',
      context: 'Max entropy ≈ 2.0 for 4 domains with equal papers.'
    },
    'nmi': {
      name: 'Normalized Mutual Information',
      formula: 'I(X;Y) / √(H(X)·H(Y))',
      meaning: 'How much knowing cluster tells you about category. 0 = independent, 1 = perfect prediction.',
      context: 'Standard metric for comparing clusterings.'
    },
    'purity': {
      name: 'Cluster Purity',
      formula: 'max_category / cluster_size',
      meaning: 'Fraction of papers from the dominant category. Higher = more homogeneous.',
      context: 'Low purity often indicates interdisciplinary clusters.'
    },
  }
  
  const info = explanations[metric]
  if (!info) return null
  
  return (
    <div className={`bg-${color}-500/5 border border-${color}-500/20 rounded-lg p-3 text-xs`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-${color}-400 font-medium`}>{info.name}</span>
        <code className="text-gray-500 bg-gray-800 px-1 rounded">{info.formula}</code>
      </div>
      <p className="text-gray-400">{info.meaning}</p>
      <p className="text-gray-500 mt-1 italic">{info.context}</p>
    </div>
  )
}

function FullClusterTable({ data, valueKey, valueLabel, color, ascending = false, showGrowth = false, extraColumns = [] }) {
  const sortedData = ascending ? [...data].sort((a, b) => a[valueKey] - b[valueKey]) : data
  
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
          {sortedData.map((cluster, index) => (
            <tr key={cluster.clusterId} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="py-3 px-4 text-gray-500">{index + 1}</td>
              <td className="py-3 px-4">
                <div className="text-white font-medium">{getClusterName(cluster)}</div>
                <div className="text-gray-500 text-xs">C{cluster.clusterId}</div>
              </td>
              <td className="py-3 px-4" style={{ color }}>{(cluster[valueKey] * 100).toFixed(1)}%</td>
              {showGrowth && (
                <td className={`py-3 px-4 ${cluster.growthRate > 0.5 ? 'text-emerald-400' : cluster.growthRate > 0 ? 'text-gray-400' : 'text-amber-400'}`}>
                  +{(cluster.growthRate * 100).toFixed(0)}%
                </td>
              )}
              {extraColumns.map(col => (
                <td key={col.key} className="py-3 px-4 text-gray-400">{col.render(cluster)}</td>
              ))}
              <td className="py-3 px-4 text-gray-400">{cluster.size?.toLocaleString()}</td>
              <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate">
                {cluster.topTerms?.filter(t => !t.startsWith('math') && t.length > 2).slice(0, 5).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================================================
// Q1: TERM STABILITY TAB
// ============================================================================
function TermStabilityTab({ setExpandedChart }) {
  const { previewData, fullData, evolvingClusters, distribution, byDomain, summary } = q1Data

  const StabilityTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
          <p className="text-white font-medium">{getClusterName(data)}</p>
          <p className="text-gray-500 text-xs mb-2">Cluster {data.clusterId}</p>
          <p className="text-blue-400 text-sm">Stability: {(data.stability * 100).toFixed(1)}%</p>
          <p className="text-gray-400 text-sm">{data.size?.toLocaleString()} papers</p>
          <p className="text-gray-400 text-sm">Domain: {getDomainName(data.domain)}</p>
        </div>
      )
    }
    return null
  }

  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const evolvingChartData = evolvingClusters.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q1: Which fields have stable vs. evolving vocabulary?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          We measured terminology consistency by comparing the top-20 terms in each cluster across three 
          time periods (1996-2005, 2006-2015, 2016-2024). High stability means the same concepts dominate 
          throughout; low stability indicates rapid emergence of new terminology.
        </p>
        
        {/* Metric explanation */}
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
        <ExpandableChart
          title="Most Stable Clusters"
          description="Fields with consistent terminology over decades—mature areas with established vocabulary."
          methodology="Jaccard similarity of top-20 TF-IDF terms between consecutive periods"
          setExpandedChart={setExpandedChart}
          expandedContent={<FullClusterTable data={fullData} valueKey="stability" valueLabel="Stability" color="#3b82f6" />}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<StabilityTooltip />} />
                <Bar dataKey="stability" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.stability > 0.8 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Most Evolving Clusters"
          description="Fast-moving fields where terminology changes rapidly—often AI/ML related."
          methodology="Low Jaccard = less than 30% term overlap between periods"
          setExpandedChart={setExpandedChart}
          expandedContent={<FullClusterTable data={[...fullData].sort((a, b) => a.stability - b.stability)} valueKey="stability" valueLabel="Stability" color="#f59e0b" ascending={true} />}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolvingChartData} layout="vertical">
                <XAxis type="number" domain={[0, 0.5]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<StabilityTooltip />} />
                <Bar dataKey="stability" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                  {evolvingChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.stability < 0.25 ? '#ef4444' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Stability by Research Domain"
          description="Which fields have the most/least stable terminology?"
          methodology="Averaged across all clusters in each domain"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDomain.map(d => ({ ...d, domainName: getDomainName(d.domain) }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                  <YAxis type="category" dataKey="domainName" width={120} stroke="#6b7280" />
                  <Tooltip formatter={(value) => [`${(value*100).toFixed(1)}%`, 'Avg Stability']} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Bar dataKey="meanStability" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDomain.slice(0, 6).map(d => ({ ...d, domainName: getDomainName(d.domain) }))} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="domainName" width={80} stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`${(value*100).toFixed(1)}%`, 'Stability']} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="meanStability" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Stability Distribution"
          description="How are clusters distributed across stability levels?"
          methodology="Histogram of Jaccard stability scores across 50 clusters"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <XAxis dataKey="range" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>
      </div>

      {/* Key Insight */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h4 className="text-blue-400 font-medium mb-2">Key Finding</h4>
        <p className="text-gray-300">
          Mathematics and physics show the highest vocabulary stability (&gt;80%), reflecting 
          mature fields with established concepts. CS clusters—especially ML/AI—show the lowest 
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
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const domains = data.topDomains?.map(d => getDomainName(d)).join(' ↔ ') || 'Multiple'
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
          <p className="text-white font-medium">{getClusterName(data)}</p>
          <p className="text-gray-500 text-xs mb-2">Cluster {data.clusterId}</p>
          <p className="text-emerald-400 text-sm">Bridge Score: {(data.bridgeScore * 100).toFixed(1)}%</p>
          <p className="text-blue-400 text-sm">Bridges: {domains}</p>
          <p className="text-gray-400 text-sm">{data.nDomains} domains represented</p>
          <p className="text-gray-400 text-sm">Growth: +{(data.growthRate * 100).toFixed(0)}%</p>
        </div>
      )
    }
    return null
  }

  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const focusedChartData = focusedClusters.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q2: What are the interdisciplinary bridge areas?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          Bridge clusters span multiple traditional domains. We score them based on how evenly 
          papers are distributed across domains, the rate of multi-category submissions, and 
          recent growth patterns.
        </p>
        
        {/* Metric explanation */}
        <MetricExplainer metric="shannon" color="emerald" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.totalBridges500}</p>
            <p className="text-gray-500 text-sm">Bridge Clusters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">+{summary.growthAdvantage?.toFixed(0) || 30}%</p>
            <p className="text-gray-500 text-sm">Faster Growth</p>
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
              data={fullData} 
              valueKey="bridgeScore" 
              valueLabel="Bridge Score" 
              color="#10b981"
              extraColumns={[
                { key: 'domains', label: 'Domains Bridged', render: (c) => c.topDomains?.slice(0,2).map(d => getDomainName(d)).join(' ↔ ') || '-' },
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<BridgeTooltip />} />
                <Bar dataKey="bridgeScore" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Single-Domain Specialists"
          description="Focused clusters within traditional boundaries—specialized but not interdisciplinary."
          methodology="Low bridge score = concentrated in one domain"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable 
              data={[...fullData].sort((a, b) => a.bridgeScore - b.bridgeScore)} 
              valueKey="bridgeScore" 
              valueLabel="Bridge Score" 
              color="#6366f1" 
              ascending={true}
              extraColumns={[
                { key: 'domain', label: 'Primary Domain', render: (c) => getDomainName(c.topDomains?.[0] || c.topCategory?.split('.')[0]) }
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusedChartData} layout="vertical">
                <XAxis type="number" domain={[0, 0.6]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<BridgeTooltip />} />
                <Bar dataKey="bridgeScore" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Diversity vs Bridge Score"
          description="Domain diversity (entropy) strongly predicts overall bridge score."
          methodology="X: Shannon entropy of domains • Y: composite score • Size: paper count"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" dataKey="x" name="Diversity" stroke="#6b7280" label={{ value: 'Domain Diversity (Shannon Entropy)', position: 'bottom', fill: '#9ca3af', offset: -5 }} />
                  <YAxis type="number" dataKey="y" name="Bridge Score" stroke="#6b7280" tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                  <ZAxis type="number" dataKey="size" range={[50, 400]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Scatter data={scatterData} fill="#10b981" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis type="number" dataKey="x" stroke="#6b7280" />
                <YAxis type="number" dataKey="y" stroke="#6b7280" tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                <ZAxis type="number" dataKey="size" range={[30, 200]} />
                <Scatter data={scatterData} fill="#10b981" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Bridge Score Distribution"
          description="Most clusters have moderate bridge scores—few are pure specialists or bridges."
          methodology="30% entropy + 20% multi-category + 15% recency + 10% growth + 15% n_domains + 10% balance"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm font-medium mb-2">Bridge Score Components:</p>
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
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution}>
                <XAxis dataKey="range" stroke="#6b7280" tick={{ fontSize: 9 }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
        <h4 className="text-emerald-400 font-medium mb-2">Key Finding</h4>
        <p className="text-gray-300">
          Interdisciplinary bridges grow {summary.growthAdvantage?.toFixed(0) || '30-50'}% faster than 
          single-domain clusters. Innovation increasingly happens at boundaries—areas like computational 
          biology and quantum ML attract researchers from multiple fields.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Q3: CATEGORY ALIGNMENT TAB  
// ============================================================================
function CategoryAlignmentTab({ setExpandedChart }) {
  const { previewData, fullData, misalignedClusters, metrics, purityDistribution, summary } = q3Data

  const PurityTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
          <p className="text-white font-medium">{getClusterName(data)}</p>
          <p className="text-gray-500 text-xs mb-2">Cluster {data.clusterId}</p>
          <p className="text-purple-400 text-sm">Purity: {(data.purity * 100).toFixed(1)}%</p>
          <p className="text-gray-400 text-sm">Dominant: {getCategoryName(data.dominantCategory)}</p>
          <p className="text-gray-400 text-sm">Spans {data.nCategories} categories</p>
        </div>
      )
    }
    return null
  }

  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const misalignedChartData = misalignedClusters.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q3: How well do clusters match ArXiv categories?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          We compare content-based clusters against ArXiv's human-curated categories. Partial alignment 
          is expected—and informative. Low-purity clusters often represent genuinely interdisciplinary 
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
        <ExpandableChart
          title="Best Aligned (Highest Purity)"
          description="These clusters map cleanly to single ArXiv categories—traditional, well-defined fields."
          methodology="Purity = papers in dominant category / total papers"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable 
              data={fullData} 
              valueKey="purity" 
              valueLabel="Purity" 
              color="#a855f7"
              extraColumns={[
                { key: 'category', label: 'Dominant Category', render: (c) => getCategoryName(c.dominantCategory) },
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<PurityTooltip />} />
                <Bar dataKey="purity" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Least Aligned (Lowest Purity)"
          description="These clusters span many categories—often genuinely interdisciplinary or emerging areas."
          methodology="Low purity indicates content spanning traditional boundaries"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable 
              data={[...fullData].sort((a, b) => a.purity - b.purity)} 
              valueKey="purity" 
              valueLabel="Purity" 
              color="#ef4444" 
              ascending={true}
              extraColumns={[
                { key: 'category', label: 'Top Category', render: (c) => getCategoryName(c.dominantCategory) },
                { key: 'nCats', label: 'Categories', render: (c) => c.nCategories }
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={misalignedChartData} layout="vertical">
                <XAxis type="number" domain={[0, 0.5]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<PurityTooltip />} />
                <Bar dataKey="purity" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Alignment Metrics"
          description="Standard clustering evaluation metrics for comparing to ground truth labels."
          methodology="Higher = better alignment with ArXiv categories"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="space-y-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 0.5]} stroke="#6b7280" />
                    <YAxis type="category" dataKey="metric" width={100} stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="score500" fill="#a855f7" name="Score" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-xs text-gray-400 space-y-2">
                <p><span className="text-purple-400 font-medium">NMI:</span> How much knowing cluster tells you about category (0-1)</p>
                <p><span className="text-purple-400 font-medium">ARI:</span> Agreement adjusted for chance (0 = random, 1 = identical)</p>
                <p><span className="text-purple-400 font-medium">V-measure:</span> Balance of homogeneity and completeness</p>
              </div>
            </div>
          }
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics} layout="vertical">
                <XAxis type="number" domain={[0, 0.5]} stroke="#6b7280" />
                <YAxis type="category" dataKey="metric" width={80} stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="score500" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Purity Distribution"
          description="Most clusters have moderate purity—few are pure or completely mixed."
          methodology="Purity = max(category count) / cluster size"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={purityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={purityDistribution}>
                <XAxis dataKey="range" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
        <h4 className="text-purple-400 font-medium mb-2">Key Finding</h4>
        <p className="text-gray-300">
          Moderate NMI (~{(summary.nmi500 * 100).toFixed(0)}%) shows content clusters capture different 
          structure than human categorization. Low-purity clusters aren't errors—they reveal interdisciplinary 
          areas where content similarity crosses traditional ArXiv boundaries.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// Q4: GROWING NICHES TAB
// ============================================================================
function GrowingNichesTab({ setExpandedChart }) {
  const { previewData, fullData, decliningClusters, trajectories, trajectoryNames, nicheDistribution, growthDistribution, summary } = q4Data

  // Note: "Declining" means slower growth, not fewer papers
  // Papers are never removed from ArXiv, so all clusters technically grow
  // We're measuring relative growth rate compared to baseline

  const NicheTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const growthLabel = data.growthRate > 1 ? 'Explosive' : data.growthRate > 0.5 ? 'Fast' : data.growthRate > 0.2 ? 'Moderate' : 'Slow'
      return (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
          <p className="text-white font-medium">{getClusterName(data)}</p>
          <p className="text-gray-500 text-xs mb-2">Cluster {data.clusterId}</p>
          <p className="text-amber-400 text-sm">Niche Score: {(data.nicheScore * 100).toFixed(1)}%</p>
          <p className="text-emerald-400 text-sm">Growth: +{(data.growthRate * 100).toFixed(0)}% ({growthLabel})</p>
          <p className="text-gray-400 text-sm">{data.size?.toLocaleString()} papers</p>
          <p className="text-gray-400 text-sm">Median year: {data.medianYear}</p>
        </div>
      )
    }
    return null
  }

  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const slowGrowthData = decliningClusters.map(d => ({ ...d, name: getShortName(d) }))
  const trajectoryColors = ['#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ef4444']

  // Reframe "declining" as "slower growing"
  const slowGrowthCount = fullData.filter(c => c.growthRate < 0.2).length

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q4: What are the fastest-growing research niches?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          We identify clusters with strong recent momentum using a composite "niche score" that 
          weighs growth rate, recency concentration, and acceleration. We also flag slower-growing 
          areas that may be mature or underexplored.
        </p>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-gray-400 mb-4">
          <span className="text-amber-400 font-medium">Note on "growth":</span> Since papers are never removed from ArXiv, 
          all clusters technically grow over time. "Growth rate" here compares recent publication volume (2020+) 
          to earlier periods. "Slow growth" means growing slower than average, not shrinking.
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">+{(summary.fastestGrowthRate * 100).toFixed(0)}%</p>
            <p className="text-gray-500 text-sm">Fastest Growth</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">{summary.medianYearTop5}</p>
            <p className="text-gray-500 text-sm">Median Year (Top 5)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{slowGrowthCount}</p>
            <p className="text-gray-500 text-sm">Slow Growth (&lt;20%)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300">{summary.totalClusters}</p>
            <p className="text-gray-500 text-sm">Total Clusters</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ExpandableChart
          title="Fastest Growing Niches"
          description="Hot areas with explosive recent growth—often AI/ML and emerging interdisciplinary fields."
          methodology="Niche Score: 30% growth + 25% recency + 15% acceleration + 15% size + 10% distinctiveness + 5% coherence"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable 
              data={fullData} 
              valueKey="nicheScore" 
              valueLabel="Niche Score" 
              color="#f59e0b" 
              showGrowth={true}
              extraColumns={[
                { key: 'medianYear', label: 'Median Year', render: (c) => c.medianYear },
                { key: 'recency', label: 'Recent %', render: (c) => `${(c.recentRatio * 100).toFixed(0)}%` }
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<NicheTooltip />} />
                <Bar dataKey="nicheScore" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Slower Growing Areas"
          description="Mature or potentially overlooked fields—growing, but slower than average."
          methodology="Sorted by growth rate (lowest first)"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <FullClusterTable 
              data={[...fullData].sort((a, b) => a.growthRate - b.growthRate)} 
              valueKey="growthRate" 
              valueLabel="Growth" 
              color="#6b7280" 
              ascending={true} 
              showGrowth={true}
              extraColumns={[
                { key: 'domain', label: 'Domain', render: (c) => getDomainName(c.topCategory?.split('.')[0]) }
              ]}
            />
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slowGrowthData} layout="vertical">
                <XAxis type="number" domain={[0, 0.6]} tickFormatter={(v) => `+${(v*100).toFixed(0)}%`} stroke="#6b7280" />
                <YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip content={<NicheTooltip />} />
                <Bar dataKey="growthRate" fill="#6b7280" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Growth Trajectories"
          description="Publication volume over time for the hottest clusters."
          methodology="Stacked area chart of yearly paper counts"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Legend />
                  {trajectoryNames?.map((name, i) => (
                    <Area key={name} type="monotone" dataKey={name} stackId="1" stroke={trajectoryColors[i]} fill={trajectoryColors[i]} fillOpacity={0.6} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          }
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectories?.filter(t => t.year >= 2015)}>
                <XAxis dataKey="year" stroke="#6b7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                {trajectoryNames?.slice(0, 3).map((name, i) => (
                  <Area key={name} type="monotone" dataKey={name} stackId="1" stroke={trajectoryColors[i]} fill={trajectoryColors[i]} fillOpacity={0.6} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>

        <ExpandableChart
          title="Growth Rate Distribution"
          description="Most clusters show moderate growth; a few are exploding."
          methodology="Growth = (recent papers / older papers) - 1"
          setExpandedChart={setExpandedChart}
          expandedContent={
            <div className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm font-medium mb-2">Niche Score Components:</p>
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
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthDistribution}>
                <XAxis dataKey="range" stroke="#6b7280" tick={{ fontSize: 8 }} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ExpandableChart>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
        <h4 className="text-amber-400 font-medium mb-2">Key Finding</h4>
        <p className="text-gray-300">
          AI/ML clusters dominate the fastest-growing list—LLMs, generative AI, and domain adaptation 
          have exploded since 2020. Slower-growing areas tend to be mature physics and math fields 
          with established researcher communities. Both extremes offer opportunities: fast growth 
          signals momentum, slow growth may indicate underexplored gaps.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// CLUSTER EXPLORATION TAB (enable when cluster_exploration.json is ready)
// ============================================================================



function ClusterExplorationTab() {
  const { clusters, summary } = clusterData
  const [sortBy, setSortBy] = useState('size')
  const [filterDomain, setFilterDomain] = useState('all')
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [showOnlyMeaningful, setShowOnlyMeaningful] = useState(false)

  // Badge color mapping
  const badgeColors = {
    'hot': 'bg-red-500/20 text-red-400 border-red-500/30',
    'rising': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'stable': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'new': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'bridge': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'large': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'niche': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'warning': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }

  // Get unique domains for filter
  const domains = [...new Set(clusters.flatMap(c => c.domainDistribution?.map(d => d.code) || []))]

  // Filter and sort clusters
  const filteredClusters = clusters
    .filter(c => filterDomain === 'all' || c.domainDistribution?.some(d => d.code === filterDomain))
    .filter(c => !showOnlyMeaningful || c.hasMeaningfulTerms)
    .sort((a, b) => {
      switch (sortBy) {
        case 'size': return b.size - a.size
        case 'growth': return b.growthRate - a.growthRate
        case 'recency': return b.medianYear - a.medianYear
        case 'diversity': return b.domainDiversity - a.domainDiversity
        case 'purity': return b.categoryPurity - a.categoryPurity
        default: return 0
      }
    })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Explore All 50 Clusters</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          Browse, filter, and explore the full landscape of research clusters. Each cluster represents
          a coherent group of papers identified by shared vocabulary patterns.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-400">{summary.totalClusters}</p>
            <p className="text-gray-500 text-sm">Clusters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{(summary.totalPapers / 1000000).toFixed(1)}M</p>
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
          <label className="text-gray-400 text-sm">Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="size">Size (papers)</option>
            <option value="growth">Growth Rate</option>
            <option value="recency">Recency</option>
            <option value="diversity">Domain Diversity</option>
            <option value="purity">Category Purity</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Domain:</label>
          <select 
            value={filterDomain} 
            onChange={(e) => setFilterDomain(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            <option value="all">All Domains</option>
            {domains.map(d => (
              <option key={d} value={d}>{getDomainName(d)}</option>
            ))}
          </select>
        </div>
        
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showOnlyMeaningful}
            onChange={(e) => setShowOnlyMeaningful(e.target.checked)}
            className="rounded border-gray-600"
          />
          Hide LaTeX-heavy clusters
        </label>
        
        <span className="text-gray-500 text-sm ml-auto">
          Showing {filteredClusters.length} of {clusters.length} clusters
        </span>
      </div>

      {/* Cluster Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClusters.map(cluster => (
          <ClusterCard 
            key={cluster.id} 
            cluster={cluster} 
            badgeColors={badgeColors}
            onClick={() => setSelectedCluster(cluster)}
          />
        ))}
      </div>

      {/* Cluster Detail Modal */}
      {selectedCluster && (
        <ClusterDetailModal 
          cluster={selectedCluster} 
          badgeColors={badgeColors}
          onClose={() => setSelectedCluster(null)} 
        />
      )}
    </div>
  )
}

function ClusterCard({ cluster, badgeColors, onClick }) {
  const displayName = cluster.displayTerms?.length >= 2 
    ? cluster.displayTerms.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ')
    : `Cluster ${cluster.id}`

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 transition-colors"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="text-white font-medium">{displayName}</h4>
          <p className="text-gray-500 text-xs">C{cluster.id} • {cluster.size.toLocaleString()} papers</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${cluster.growthRate > 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
          +{cluster.growthRate.toFixed(0)}%
        </span>
      </div>
      
      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-3">
        {cluster.badges?.slice(0, 3).map((badge, i) => (
          <span 
            key={i} 
            className={`text-xs px-2 py-0.5 rounded border ${badgeColors[badge.type]}`}
          >
            {badge.label}
          </span>
        ))}
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Domain</p>
          <p className="text-gray-300">{cluster.primaryDomain?.name || '-'}</p>
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
      
      {/* Keywords preview */}
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">{displayName}</h3>
            <p className="text-gray-400">Cluster {cluster.id} • {cluster.size.toLocaleString()} papers ({cluster.sizePercentage}%)</p>
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
            <div 
              key={i} 
              className={`px-3 py-1 rounded-lg border ${badgeColors[badge.type]}`}
            >
              <span className="font-medium">{badge.label}</span>
              <span className="text-xs ml-2 opacity-70">{badge.description}</span>
            </div>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">+{cluster.growthRate}%</p>
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
              const isMeaningful = is_meaningful_term ? is_meaningful_term(term.term) : !term.term.startsWith('math')
              return (
                <span 
                  key={i}
                  className={`px-2 py-1 rounded text-sm ${
                    isMeaningful 
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                  }`}
                >
                  {term.term}
                  <span className="text-xs ml-1 opacity-50">({(term.score * 100).toFixed(1)})</span>
                </span>
              )
            })}
          </div>
          <p className="text-gray-500 text-xs mt-2">Gray terms are LaTeX notation or very short</p>
        </div>

        {/* Category Distribution */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Category Distribution</h4>
          <div className="space-y-2">
            {cluster.topCategories?.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-24 text-gray-400 text-sm truncate">{cat.name}</div>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <div className="w-16 text-right text-gray-400 text-sm">{cat.percentage.toFixed(1)}%</div>
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
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${domain.percentage}%` }}
                  />
                </div>
                <div className="w-20 text-right text-gray-400 text-sm">
                  {domain.count.toLocaleString()} ({domain.percentage.toFixed(1)}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Temporal Info */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Year Range</p>
              <p className="text-white">{cluster.yearRange?.[0]} - {cluster.yearRange?.[1]}</p>
            </div>
            <div>
              <p className="text-gray-500">Recent Papers (2020+)</p>
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