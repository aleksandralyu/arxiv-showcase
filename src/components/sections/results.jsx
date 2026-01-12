import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis,
  AreaChart, Area, Legend, CartesianGrid
} from 'recharts'



import q1Data from '../../data/q1termstability.json'
import q2Data from '../../data/q2bridgeareas.json'
import q3Data from '../../data/q3categoryalignment.json'
import q4Data from '../../data/q4growingniches.json'
import clusterData from '../../data/clustersizes.json'

const CATEGORY_NAMES = {
  // Physics
  'astro-ph': 'Astrophysics',
  'astro-ph.CO': 'Cosmology and Nongalactic Astrophysics',
  'astro-ph.EP': 'Earth and Planetary Astrophysics',
  'astro-ph.GA': 'Astrophysics of Galaxies',
  'astro-ph.HE': 'High Energy Astrophysical Phenomena',
  'astro-ph.IM': 'Instrumentation and Methods for Astrophysics',
  'astro-ph.SR': 'Solar and Stellar Astrophysics',
  'cond-mat.dis-nn': 'Disordered Systems and Neural Networks',
  'cond-mat.mes-hall': 'Mesoscale and Nanoscale Physics',
  'cond-mat.mtrl-sci': 'Materials Science',
  'cond-mat.other': 'Other Condensed Matter',
  'cond-mat.quant-gas': 'Quantum Gases',
  'cond-mat.soft': 'Soft Condensed Matter',
  'cond-mat.stat-mech': 'Statistical Mechanics',
  'cond-mat.str-el': 'Strongly Correlated Electrons',
  'cond-mat.supr-con': 'Superconductivity',
  'gr-qc': 'General Relativity and Quantum Cosmology',
  'hep-ex': 'High Energy Physics - Experiment',
  'hep-lat': 'High Energy Physics - Lattice',
  'hep-ph': 'High Energy Physics - Phenomenology',
  'hep-th': 'High Energy Physics - Theory',
  'math-ph': 'Mathematical Physics',
  'nlin.AO': 'Adaptation and Self-Organizing Systems',
  'nlin.CD': 'Chaotic Dynamics',
  'nlin.CG': 'Cellular Automata and Lattice Gases',
  'nlin.PS': 'Pattern Formation and Solitons',
  'nlin.SI': 'Exactly Solvable and Integrable Systems',
  'nucl-ex': 'Nuclear Experiment',
  'nucl-th': 'Nuclear Theory',
  'physics.acc-ph': 'Accelerator Physics',
  'physics.ao-ph': 'Atmospheric and Oceanic Physics',
  'physics.app-ph': 'Applied Physics',
  'physics.atm-clus': 'Atomic and Molecular Clusters',
  'physics.atom-ph': 'Atomic Physics',
  'physics.bio-ph': 'Biological Physics',
  'physics.chem-ph': 'Chemical Physics',
  'physics.class-ph': 'Classical Physics',
  'physics.comp-ph': 'Computational Physics',
  'physics.data-an': 'Data Analysis, Statistics and Probability',
  'physics.flu-dyn': 'Fluid Dynamics',
  'physics.gen-ph': 'General Physics',
  'physics.geo-ph': 'Geophysics',
  'physics.hist-ph': 'History and Philosophy of Physics',
  'physics.ins-det': 'Instrumentation and Detectors',
  'physics.med-ph': 'Medical Physics',
  'physics.optics': 'Optics',
  'physics.plasm-ph': 'Plasma Physics',
  'physics.pop-ph': 'Popular Physics',
  'physics.soc-ph': 'Physics and Society',
  'physics.space-ph': 'Space Physics',
  'quant-ph': 'Quantum Physics',
  
  // Mathematics
  'math.AC': 'Commutative Algebra',
  'math.AG': 'Algebraic Geometry',
  'math.AP': 'Analysis of PDEs',
  'math.AT': 'Algebraic Topology',
  'math.CA': 'Classical Analysis and ODEs',
  'math.CO': 'Combinatorics',
  'math.CT': 'Category Theory',
  'math.CV': 'Complex Variables',
  'math.DG': 'Differential Geometry',
  'math.DS': 'Dynamical Systems',
  'math.FA': 'Functional Analysis',
  'math.GM': 'General Mathematics',
  'math.GN': 'General Topology',
  'math.GR': 'Group Theory',
  'math.GT': 'Geometric Topology',
  'math.HO': 'History and Overview',
  'math.IT': 'Information Theory',
  'math.KT': 'K-Theory and Homology',
  'math.LO': 'Logic',
  'math.MG': 'Metric Geometry',
  'math.MP': 'Mathematical Physics',
  'math.NA': 'Numerical Analysis',
  'math.NT': 'Number Theory',
  'math.OA': 'Operator Algebras',
  'math.OC': 'Optimization and Control',
  'math.PR': 'Probability',
  'math.QA': 'Quantum Algebra',
  'math.RA': 'Rings and Algebras',
  'math.RT': 'Representation Theory',
  'math.SG': 'Symplectic Geometry',
  'math.SP': 'Spectral Theory',
  'math.ST': 'Statistics Theory',
  
  // Computer Science
  'cs.AI': 'Artificial Intelligence',
  'cs.AR': 'Hardware Architecture',
  'cs.CC': 'Computational Complexity',
  'cs.CE': 'Computational Engineering, Finance, and Science',
  'cs.CG': 'Computational Geometry',
  'cs.CL': 'Computation and Language',
  'cs.CR': 'Cryptography and Security',
  'cs.CV': 'Computer Vision and Pattern Recognition',
  'cs.CY': 'Computers and Society',
  'cs.DB': 'Databases',
  'cs.DC': 'Distributed, Parallel, and Cluster Computing',
  'cs.DL': 'Digital Libraries',
  'cs.DM': 'Discrete Mathematics',
  'cs.DS': 'Data Structures and Algorithms',
  'cs.ET': 'Emerging Technologies',
  'cs.FL': 'Formal Languages and Automata Theory',
  'cs.GL': 'General Literature',
  'cs.GR': 'Graphics',
  'cs.GT': 'Computer Science and Game Theory',
  'cs.HC': 'Human-Computer Interaction',
  'cs.IR': 'Information Retrieval',
  'cs.IT': 'Information Theory',
  'cs.LG': 'Machine Learning',
  'cs.LO': 'Logic in Computer Science',
  'cs.MA': 'Multiagent Systems',
  'cs.MM': 'Multimedia',
  'cs.MS': 'Mathematical Software',
  'cs.NA': 'Numerical Analysis',
  'cs.NE': 'Neural and Evolutionary Computing',
  'cs.NI': 'Networking and Internet Architecture',
  'cs.OH': 'Other Computer Science',
  'cs.OS': 'Operating Systems',
  'cs.PF': 'Performance',
  'cs.PL': 'Programming Languages',
  'cs.RO': 'Robotics',
  'cs.SC': 'Symbolic Computation',
  'cs.SD': 'Sound',
  'cs.SE': 'Software Engineering',
  'cs.SI': 'Social and Information Networks',
  'cs.SY': 'Systems and Control',
  
  // Quantitative Biology
  'q-bio.BM': 'Biomolecules',
  'q-bio.CB': 'Cell Behavior',
  'q-bio.GN': 'Genomics',
  'q-bio.MN': 'Molecular Networks',
  'q-bio.NC': 'Neurons and Cognition',
  'q-bio.OT': 'Other Quantitative Biology',
  'q-bio.PE': 'Populations and Evolution',
  'q-bio.QM': 'Quantitative Methods',
  'q-bio.SC': 'Subcellular Processes',
  'q-bio.TO': 'Tissues and Organs',
  
  // Quantitative Finance
  'q-fin.CP': 'Computational Finance',
  'q-fin.EC': 'Economics',
  'q-fin.GN': 'General Finance',
  'q-fin.MF': 'Mathematical Finance',
  'q-fin.PM': 'Portfolio Management',
  'q-fin.PR': 'Pricing of Securities',
  'q-fin.RM': 'Risk Management',
  'q-fin.ST': 'Statistical Finance',
  'q-fin.TR': 'Trading and Market Microstructure',
  
  // Statistics
  'stat.AP': 'Applications',
  'stat.CO': 'Computation',
  'stat.ME': 'Methodology',
  'stat.ML': 'Machine Learning',
  'stat.OT': 'Other Statistics',
  'stat.TH': 'Statistics Theory',
  
  // Electrical Engineering and Systems Science
  'eess.AS': 'Audio and Speech Processing',
  'eess.IV': 'Image and Video Processing',
  'eess.SP': 'Signal Processing',
  'eess.SY': 'Systems and Control',
  
  // Economics
  'econ.EM': 'Econometrics',
  'econ.GN': 'General Economics',
  'econ.TH': 'Theoretical Economics'
}

const DOMAIN_NAMES = {
  'cs': 'Computer Science', 'math': 'Mathematics', 'physics': 'Physics', 'stat': 'Statistics',
  'hep-ph': 'High Energy Physics', 'hep-th': 'Theoretical Physics', 'astro-ph': 'Astrophysics',
  'cond-mat': 'Condensed Matter', 'quant-ph': 'Quantum Physics', 'gr-qc': 'Relativity',
  'eess': 'Electrical Engineering', 'q-bio': 'Biology', 'q-fin': 'Finance', 'nlin': 'Nonlinear Science',
  'nucl-th': 'Nuclear Physics', 'math-ph': 'Mathematical Physics',
}

function getCategoryName(code) { return CATEGORY_NAMES[code] || code }
function getDomainName(code) { return DOMAIN_NAMES[code] || code }

function getClusterName(cluster) {
  if (!cluster.topTerms) return `Cluster ${cluster.clusterId}`
  const validTerms = cluster.topTerms.filter(t => !t.startsWith('math') && !t.startsWith('frac') && !t.includes('\\') && t.length > 2)
  if (validTerms.length >= 2) return validTerms.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' & ')
  return `Cluster ${cluster.clusterId}`
}

function getShortName(cluster) {
  if (!cluster.topTerms) return `C${cluster.clusterId}`
  const validTerms = cluster.topTerms.filter(t => !t.startsWith('math') && !t.startsWith('frac') && t.length > 2)
  if (validTerms.length >= 1) return validTerms[0].charAt(0).toUpperCase() + validTerms[0].slice(1)
  return `C${cluster.clusterId}`
}

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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Research Findings</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Explore the key discoveries from analyzing 2.4 million scientific papers.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 mb-8 text-sm">
          <p className="text-gray-400"><span className="text-gray-300 font-medium">A note on methodology:</span> After preprocessing improvements (lemmatization, custom stopwords, LaTeX removal), cluster quality has significantly improved. Clusters are named by their top TF-IDF terms.</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id ? 'border' : 'bg-gray-800/50 text-gray-400 border border-transparent hover:border-gray-600'}`}
              style={activeTab === tab.id ? { backgroundColor: `${tab.color}20`, color: tab.color, borderColor: `${tab.color}50` } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
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


function ExpandedChartModal({ expandedChart, setExpandedChart }) {
  if (!expandedChart) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8" onClick={() => setExpandedChart(null)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-6">
            <div><h3 className="text-xl font-semibold text-white">{expandedChart.title}</h3><p className="text-gray-400 text-sm mt-1">{expandedChart.description}</p></div>
            <button onClick={() => setExpandedChart(null)} className="text-gray-400 hover:text-white p-2"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
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
        <button onClick={() => setExpandedChart({ title, description, content: expandedContent })} className="text-gray-400 hover:text-blue-400 p-1 transition-colors" title="Expand"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
      </div>
      {children}
      {methodology && <div className="mt-3 pt-3 border-t border-gray-700/50"><p className="text-gray-500 text-xs text-center">{methodology}</p></div>}
    </div>
  )
}

function MetricExplainer({ metric, color = 'blue' }) {
  const explanations = {
    'jaccard': { name: 'Jaccard Similarity', formula: '|A ∩ B| / |A ∪ B|', meaning: 'Measures overlap between two sets.', context: 'We compare top-20 terms between time periods.' },
    'shannon': { name: 'Shannon Entropy', formula: '-Σ p(x) log p(x)', meaning: 'Measures diversity/uncertainty.', context: 'Max entropy for 4 equal domains ≈ 2.0.' },
    'nmi': { name: 'NMI', formula: 'I(X;Y) / √(H(X)·H(Y))', meaning: 'How much cluster tells you about category.', context: 'Standard clustering comparison metric.' },
    'purity': { name: 'Purity', formula: 'max_cat / size', meaning: 'Fraction from dominant category.', context: 'Low purity = interdisciplinary.' },
  }
  const info = explanations[metric]
  if (!info) return null
  const colorClasses = { blue: 'bg-blue-500/5 border-blue-500/20 text-blue-400', emerald: 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400', purple: 'bg-purple-500/5 border-purple-500/20 text-purple-400', amber: 'bg-amber-500/5 border-amber-500/20 text-amber-400' }
  return (<div className={`${colorClasses[color]} border rounded-lg p-3 text-xs`}><div className="flex items-center gap-2 mb-1"><span className="font-medium">{info.name}</span><code className="text-gray-500 bg-gray-800 px-1 rounded">{info.formula}</code></div><p className="text-gray-400">{info.meaning}</p></div>)
}

function FullClusterTable({ data, valueKey, valueLabel, color, ascending = false, showGrowth = false, extraColumns = [] }) {
  if (!data || data.length === 0) return <div className="text-gray-500 text-center py-8">No data available</div>
  const sortedData = ascending ? [...data].sort((a, b) => a[valueKey] - b[valueKey]) : data
  return (
    <div className="overflow-auto max-h-[500px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-gray-900"><tr className="border-b border-gray-700">
          <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
          <th className="text-left py-3 px-4 text-gray-400 font-medium">Cluster</th>
          <th className="text-left py-3 px-4 text-gray-400 font-medium">{valueLabel}</th>
          {showGrowth && <th className="text-left py-3 px-4 text-gray-400 font-medium">Growth</th>}
          {extraColumns.map(col => <th key={col.key} className="text-left py-3 px-4 text-gray-400 font-medium">{col.label}</th>)}
          <th className="text-left py-3 px-4 text-gray-400 font-medium">Papers</th>
          <th className="text-left py-3 px-4 text-gray-400 font-medium">Keywords</th>
        </tr></thead>
        <tbody>
          {sortedData.map((cluster, index) => (
            <tr key={cluster.clusterId} className="border-b border-gray-800 hover:bg-gray-800/50">
              <td className="py-3 px-4 text-gray-500">{index + 1}</td>
              <td className="py-3 px-4"><div className="text-white font-medium">{getClusterName(cluster)}</div><div className="text-gray-500 text-xs">C{cluster.clusterId}</div></td>
              <td className="py-3 px-4" style={{ color }}>{(cluster[valueKey] * 100).toFixed(1)}%</td>
              {showGrowth && <td className={`py-3 px-4 ${cluster.growthRate > 0.5 ? 'text-emerald-400' : 'text-gray-400'}`}>+{(cluster.growthRate * 100).toFixed(0)}%</td>}
              {extraColumns.map(col => <td key={col.key} className="py-3 px-4 text-gray-400">{col.render(cluster)}</td>)}
              <td className="py-3 px-4 text-gray-400">{cluster.size?.toLocaleString()}</td>
              <td className="py-3 px-4 text-gray-500 text-xs max-w-xs truncate">{cluster.topTerms?.filter(t => !t.startsWith('math') && t.length > 2).slice(0, 5).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TermStabilityTab({ setExpandedChart }) {
  console.log('q1Data:', q1Data)
  console.log('previewData:', q1Data.previewData)
  console.log('Is array?:', Array.isArray(q1Data.previewData))
  // ... rest of function
  const previewData = q1Data.previewData || [], fullData = q1Data.fullData || [], evolvingClusters = q1Data.evolvingClusters || []
  const distribution = q1Data.distribution || [], byDomain = q1Data.byDomain || [], summary = q1Data.summary || {}
  const StabilityTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (<div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs"><p className="text-white font-medium">{getClusterName(d)}</p><p className="text-blue-400 text-sm">Stability: {(d.stability * 100).toFixed(1)}%</p><p className="text-gray-400 text-sm">{d.size?.toLocaleString()} papers</p></div>)
    }
    return null
  }
  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const evolvingChartData = evolvingClusters.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q1: Which fields have stable vs. evolving vocabulary?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">We compared top-20 terms across time periods. High stability = same concepts dominate; low = rapid new terminology.</p>
        <MetricExplainer metric="jaccard" color="blue" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center"><p className="text-2xl font-bold text-blue-400">{((summary.meanStability500 || 0) * 100).toFixed(0)}%</p><p className="text-gray-500 text-sm">Mean Stability</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-emerald-400">{summary.stableCount500 || 0}</p><p className="text-gray-500 text-sm">Stable (&gt;70%)</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-400">{summary.evolvingCount500 || 0}</p><p className="text-gray-500 text-sm">Evolving (&lt;30%)</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-gray-300">{summary.totalClusters || 0}</p><p className="text-gray-500 text-sm">Total Clusters</p></div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <ExpandableChart title="Most Stable Clusters" description="Mature areas with established vocabulary." methodology="Jaccard similarity of top-20 TF-IDF terms" setExpandedChart={setExpandedChart} expandedContent={<FullClusterTable data={fullData} valueKey="stability" valueLabel="Stability" color="#3b82f6" />}>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical"><XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} /><Tooltip content={<StabilityTooltip />} /><Bar dataKey="stability" fill="#3b82f6" radius={[0, 4, 4, 0]}>{chartData.map((e, i) => <Cell key={i} fill={e.stability > 0.8 ? '#10b981' : '#3b82f6'} />)}</Bar></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Most Evolving Clusters" description="Fast-moving fields with rapid terminology change." methodology="Low Jaccard = less than 30% term overlap" setExpandedChart={setExpandedChart} expandedContent={<FullClusterTable data={[...fullData].sort((a, b) => a.stability - b.stability)} valueKey="stability" valueLabel="Stability" color="#f59e0b" ascending={true} />}>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={evolvingChartData} layout="vertical"><XAxis type="number" domain={[0, 0.5]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} /><Tooltip content={<StabilityTooltip />} /><Bar dataKey="stability" fill="#f59e0b" radius={[0, 4, 4, 0]}>{evolvingChartData.map((e, i) => <Cell key={i} fill={e.stability < 0.25 ? '#ef4444' : '#f59e0b'} />)}</Bar></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Stability by Domain" description="Which fields have most/least stable vocabulary?" methodology="Averaged across all clusters in each domain" setExpandedChart={setExpandedChart} expandedContent={<div className="h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={byDomain.map(d => ({ ...d, domainName: getDomainName(d.domain) }))} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="domainName" width={120} stroke="#6b7280" /><Tooltip formatter={(value) => [`${(value*100).toFixed(1)}%`, 'Stability']} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="meanStability" fill="#3b82f6" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>}>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={byDomain.slice(0, 6).map(d => ({ ...d, domainName: getDomainName(d.domain) }))} layout="vertical"><XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="domainName" width={80} stroke="#6b7280" tick={{ fontSize: 10 }} /><Tooltip formatter={(value) => [`${(value*100).toFixed(1)}%`, 'Stability']} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="meanStability" fill="#3b82f6" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Stability Distribution" description="Distribution across stability levels" methodology="Histogram of Jaccard scores across 50 clusters" setExpandedChart={setExpandedChart} expandedContent={<div className="h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="range" stroke="#6b7280" /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution}><XAxis dataKey="range" stroke="#6b7280" tick={{ fontSize: 10 }} /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"><h4 className="text-blue-400 font-medium mb-2">Key Finding</h4><p className="text-gray-300">Math and physics show highest stability (&gt;80%). CS clusters—especially ML/AI—show lowest stability (&lt;30%), with terms like "transformer" and "diffusion" emerging rapidly.</p></div>
    </div>
  )
}

function BridgeAreasTab({ setExpandedChart }) {
  const previewData = q2Data.previewData || [], fullData = q2Data.fullData || [], focusedClusters = q2Data.focusedClusters || []
  const scatterData = q2Data.scatterData || [], distribution = q2Data.distribution || [], summary = q2Data.summary || {}
  const BridgeTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (<div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs"><p className="text-white font-medium">{getClusterName(d)}</p><p className="text-emerald-400 text-sm">Bridge: {(d.bridgeScore * 100).toFixed(1)}%</p><p className="text-gray-400 text-sm">{d.nDomains} domains</p></div>)
    }
    return null
  }
  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const focusedChartData = focusedClusters.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q2: What are the interdisciplinary bridge areas?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">Bridge clusters span multiple domains. We score based on distribution, multi-category rate, and growth.</p>
        <MetricExplainer metric="shannon" color="emerald" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center"><p className="text-2xl font-bold text-emerald-400">{summary.totalBridges500 || 0}</p><p className="text-gray-500 text-sm">Bridge Clusters</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-blue-400">+{(summary.growthAdvantage || 30).toFixed(0)}%</p><p className="text-gray-500 text-sm">Faster Growth</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-400">{((summary.meanBridgeScore500 || 0) * 100).toFixed(0)}%</p><p className="text-gray-500 text-sm">Avg Bridge Score</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-gray-300">{summary.totalClusters || 0}</p><p className="text-gray-500 text-sm">Total Clusters</p></div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <ExpandableChart title="Top Bridges" description="Clusters spanning multiple domains." methodology="Bridge = diversity × balance × growth × recency" setExpandedChart={setExpandedChart} expandedContent={<FullClusterTable data={fullData} valueKey="bridgeScore" valueLabel="Bridge Score" color="#10b981" extraColumns={[{ key: 'domains', label: 'Bridges', render: (c) => c.topDomains?.slice(0,2).map(d => getDomainName(d)).join(' ↔ ') || '-' }]} />}>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical"><XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} /><Tooltip content={<BridgeTooltip />} /><Bar dataKey="bridgeScore" fill="#10b981" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Single-Domain Specialists" description="Focused clusters within traditional boundaries." methodology="Low bridge score = concentrated in one domain" setExpandedChart={setExpandedChart} expandedContent={<FullClusterTable data={[...fullData].sort((a, b) => a.bridgeScore - b.bridgeScore)} valueKey="bridgeScore" valueLabel="Bridge Score" color="#6366f1" ascending={true} extraColumns={[{ key: 'domain', label: 'Domain', render: (c) => getDomainName(c.topDomains?.[0] || '') }]} />}>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={focusedChartData} layout="vertical"><XAxis type="number" domain={[0, 0.6]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} /><Tooltip content={<BridgeTooltip />} /><Bar dataKey="bridgeScore" fill="#6366f1" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Diversity vs Bridge Score" description="Domain diversity predicts bridge score." methodology="X: Shannon entropy • Y: composite score • Size: papers" setExpandedChart={setExpandedChart} expandedContent={<div className="h-96"><ResponsiveContainer width="100%" height="100%"><ScatterChart><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis type="number" dataKey="x" stroke="#6b7280" /><YAxis type="number" dataKey="y" stroke="#6b7280" tickFormatter={(v) => `${(v*100).toFixed(0)}%`} /><ZAxis type="number" dataKey="size" range={[50, 400]} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Scatter data={scatterData} fill="#10b981" fillOpacity={0.7} /></ScatterChart></ResponsiveContainer></div>}>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><ScatterChart><XAxis type="number" dataKey="x" stroke="#6b7280" /><YAxis type="number" dataKey="y" stroke="#6b7280" tickFormatter={(v) => `${(v*100).toFixed(0)}%`} /><ZAxis type="number" dataKey="size" range={[30, 200]} /><Scatter data={scatterData} fill="#10b981" fillOpacity={0.7} /></ScatterChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Bridge Score Distribution" description="Most clusters have moderate bridge scores." methodology="Weighted composite score" setExpandedChart={setExpandedChart} expandedContent={<div className="h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="range" stroke="#6b7280" /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={distribution}><XAxis dataKey="range" stroke="#6b7280" tick={{ fontSize: 9 }} /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6"><h4 className="text-emerald-400 font-medium mb-2">Key Finding</h4><p className="text-gray-300">Interdisciplinary bridges grow {(summary.growthAdvantage || 30).toFixed(0)}% faster than single-domain clusters. Innovation happens at boundaries.</p></div>
    </div>
  )
}

function CategoryAlignmentTab({ setExpandedChart }) {
  const previewData = q3Data.previewData || [], fullData = q3Data.fullData || [], misalignedClusters = q3Data.misalignedClusters || []
  const metrics = q3Data.metrics || [], purityDistribution = q3Data.purityDistribution || [], summary = q3Data.summary || {}
  const PurityTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (<div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs"><p className="text-white font-medium">{getClusterName(d)}</p><p className="text-purple-400 text-sm">Purity: {(d.purity * 100).toFixed(1)}%</p><p className="text-gray-400 text-sm">{d.nCategories} categories</p></div>)
    }
    return null
  }
  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const misalignedChartData = misalignedClusters.map(d => ({ ...d, name: getShortName(d) }))

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q3: How well do clusters match ArXiv categories?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">We compare content-based clusters against ArXiv's human-curated categories. Low-purity clusters often represent interdisciplinary areas.</p>
        <div className="grid md:grid-cols-2 gap-4 mb-4"><MetricExplainer metric="nmi" color="purple" /><MetricExplainer metric="purity" color="purple" /></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center"><p className="text-2xl font-bold text-purple-400">{((summary.nmi500 || 0) * 100).toFixed(0)}%</p><p className="text-gray-500 text-sm">NMI Score</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-blue-400">{((summary.avgPurity500 || 0) * 100).toFixed(0)}%</p><p className="text-gray-500 text-sm">Avg Purity</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-emerald-400">{summary.highPurityCount500 || 0}</p><p className="text-gray-500 text-sm">High Purity (&gt;50%)</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-amber-400">{summary.lowPurityCount500 || 0}</p><p className="text-gray-500 text-sm">Low Purity (&lt;20%)</p></div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <ExpandableChart title="Best Aligned (High Purity)" description="Traditional, well-defined fields." methodology="Purity = dominant category / cluster size" setExpandedChart={setExpandedChart} expandedContent={<FullClusterTable data={fullData} valueKey="purity" valueLabel="Purity" color="#a855f7" extraColumns={[{ key: 'cat', label: 'Category', render: (c) => getCategoryName(c.dominantCategory) }]} />}>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical"><XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} /><Tooltip content={<PurityTooltip />} /><Bar dataKey="purity" fill="#a855f7" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Least Aligned (Low Purity)" description="Interdisciplinary or emerging areas." methodology="Low purity = spans many categories" setExpandedChart={setExpandedChart} expandedContent={<FullClusterTable data={[...fullData].sort((a, b) => a.purity - b.purity)} valueKey="purity" valueLabel="Purity" color="#ef4444" ascending={true} extraColumns={[{ key: 'cat', label: 'Category', render: (c) => getCategoryName(c.dominantCategory) }, { key: 'n', label: '#Cats', render: (c) => c.nCategories }]} />}>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={misalignedChartData} layout="vertical"><XAxis type="number" domain={[0, 0.5]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} /><Tooltip content={<PurityTooltip />} /><Bar dataKey="purity" fill="#ef4444" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Alignment Metrics" description="Standard clustering evaluation." methodology="Higher = better alignment" setExpandedChart={setExpandedChart} expandedContent={<div className="h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={metrics} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis type="number" domain={[0, 0.5]} stroke="#6b7280" /><YAxis type="category" dataKey="metric" width={100} stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="score500" fill="#a855f7" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>}>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={metrics} layout="vertical"><XAxis type="number" domain={[0, 0.5]} stroke="#6b7280" /><YAxis type="category" dataKey="metric" width={80} stroke="#6b7280" tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="score500" fill="#a855f7" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Purity Distribution" description="Distribution across purity levels." methodology="Purity = max(category) / size" setExpandedChart={setExpandedChart} expandedContent={<div className="h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={purityDistribution}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="range" stroke="#6b7280" /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={purityDistribution}><XAxis dataKey="range" stroke="#6b7280" tick={{ fontSize: 10 }} /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
      </div>
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6"><h4 className="text-purple-400 font-medium mb-2">Key Finding</h4><p className="text-gray-300">Moderate NMI (~{((summary.nmi500 || 0) * 100).toFixed(0)}%) shows content clusters capture different structure than human categorization. Low-purity clusters reveal interdisciplinary areas.</p></div>
    </div>
  )
}

function GrowingNichesTab({ setExpandedChart }) {
  const previewData = q4Data.previewData || [], fullData = q4Data.fullData || [], decliningClusters = q4Data.decliningClusters || []
  const trajectories = q4Data.trajectories || [], trajectoryNames = q4Data.trajectoryNames || []
  const growthDistribution = q4Data.growthDistribution || [], summary = q4Data.summary || {}
  const NicheTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload
      return (<div className="bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs"><p className="text-white font-medium">{getClusterName(d)}</p><p className="text-amber-400 text-sm">Niche: {(d.nicheScore * 100).toFixed(1)}%</p><p className="text-emerald-400 text-sm">Growth: +{(d.growthRate * 100).toFixed(0)}%</p><p className="text-gray-400 text-sm">{d.size?.toLocaleString()} papers</p></div>)
    }
    return null
  }
  const chartData = previewData.map(d => ({ ...d, name: getShortName(d) }))
  const slowGrowthData = decliningClusters.map(d => ({ ...d, name: getShortName(d) }))
  const trajectoryColors = ['#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ef4444']
  const slowGrowthCount = fullData.filter(c => c.growthRate < 0.2).length

  return (
    <div className="space-y-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Q4: What are the fastest-growing research niches?</h3>
        <p className="text-gray-400 leading-relaxed mb-4">Clusters with strong recent momentum using niche score: growth rate, recency, acceleration.</p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-gray-400 mb-4"><span className="text-amber-400 font-medium">Note:</span> "Growth rate" compares recent (2020+) to earlier periods. "Slow growth" means slower than average, not shrinking.</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center"><p className="text-2xl font-bold text-amber-400">+{((summary.fastestGrowthRate || 0) * 100).toFixed(0)}%</p><p className="text-gray-500 text-sm">Fastest Growth</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-emerald-400">{summary.medianYearTop5 || 2023}</p><p className="text-gray-500 text-sm">Median Year (Top 5)</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-blue-400">{slowGrowthCount}</p><p className="text-gray-500 text-sm">Slow Growth (&lt;20%)</p></div>
          <div className="text-center"><p className="text-2xl font-bold text-gray-300">{summary.totalClusters || 0}</p><p className="text-gray-500 text-sm">Total Clusters</p></div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <ExpandableChart title="Fastest Growing Niches" description="Hot areas with explosive growth." methodology="Niche = 30% growth + 25% recency + 15% acceleration" setExpandedChart={setExpandedChart} expandedContent={<FullClusterTable data={fullData} valueKey="nicheScore" valueLabel="Niche Score" color="#f59e0b" showGrowth={true} extraColumns={[{ key: 'year', label: 'Median Year', render: (c) => c.medianYear }, { key: 'rec', label: 'Recent %', render: (c) => `${(c.recentRatio * 100).toFixed(0)}%` }]} />}>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical"><XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} /><Tooltip content={<NicheTooltip />} /><Bar dataKey="nicheScore" fill="#f59e0b" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Slower Growing Areas" description="Mature or overlooked fields." methodology="Sorted by growth rate (lowest first)" setExpandedChart={setExpandedChart} expandedContent={<FullClusterTable data={[...fullData].sort((a, b) => a.growthRate - b.growthRate)} valueKey="growthRate" valueLabel="Growth" color="#6b7280" ascending={true} showGrowth={true} extraColumns={[{ key: 'dom', label: 'Domain', render: (c) => getDomainName(c.topCategory?.split('.')[0]) }]} />}>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={slowGrowthData} layout="vertical"><XAxis type="number" domain={[0, 0.6]} tickFormatter={(v) => `+${(v*100).toFixed(0)}%`} stroke="#6b7280" /><YAxis type="category" dataKey="name" width={80} stroke="#6b7280" tick={{ fontSize: 11 }} /><Tooltip content={<NicheTooltip />} /><Bar dataKey="growthRate" fill="#6b7280" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Growth Trajectories" description="Publication volume over time." methodology="Stacked area chart of yearly counts" setExpandedChart={setExpandedChart} expandedContent={<div className="h-96"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trajectories}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="year" stroke="#6b7280" /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Legend />{trajectoryNames?.map((name, i) => <Area key={name} type="monotone" dataKey={name} stackId="1" stroke={trajectoryColors[i]} fill={trajectoryColors[i]} fillOpacity={0.6} />)}</AreaChart></ResponsiveContainer></div>}>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trajectories?.filter(t => t.year >= 2015)}><XAxis dataKey="year" stroke="#6b7280" tick={{ fontSize: 10 }} /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />{trajectoryNames?.slice(0, 3).map((name, i) => <Area key={name} type="monotone" dataKey={name} stackId="1" stroke={trajectoryColors[i]} fill={trajectoryColors[i]} fillOpacity={0.6} />)}</AreaChart></ResponsiveContainer></div>
        </ExpandableChart>
        <ExpandableChart title="Growth Rate Distribution" description="Most clusters grow moderately; a few explode." methodology="Growth = (recent / older) - 1" setExpandedChart={setExpandedChart} expandedContent={<div className="h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={growthDistribution}><CartesianGrid strokeDasharray="3 3" stroke="#374151" /><XAxis dataKey="range" stroke="#6b7280" angle={-45} textAnchor="end" height={80} /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}>
          <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={growthDistribution}><XAxis dataKey="range" stroke="#6b7280" tick={{ fontSize: 8 }} /><YAxis stroke="#6b7280" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} /><Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </ExpandableChart>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6"><h4 className="text-amber-400 font-medium mb-2">Key Finding</h4><p className="text-gray-300">AI/ML clusters dominate fastest-growing—LLMs, generative AI exploded since 2020. Slower areas tend to be mature physics/math fields.</p></div>
    </div>
  )
}

// ============================================================================
// CLUSTER EXPLORATION TAB - Full Featured Version
// ============================================================================
// 
// REQUIRED: Enhanced clustersizes.json with these fields:
// - topTerms: [{term, score}, ...]
// - topCategories: [{code, pct}, ...]  
// - topDomains: [{code, name, pct}, ...]
// - papersByYear: [{year, count}, ...]
// - medianYear, recentRatio


function ClusterExplorationTab() {
  const [sortBy, setSortBy] = useState('size')
  const [selectedCluster, setSelectedCluster] = useState(null)

  const clusters = clusterData || []

  // Summary stats
  const summary = {
    totalClusters: clusters.length,
    totalPapers: clusters.reduce((sum, c) => sum + c.size, 0),
    avgGrowth: clusters.length > 0 ? clusters.reduce((sum, c) => sum + c.growthRate, 0) / clusters.length : 0,
    highGrowthCount: clusters.filter(c => c.growthRate > 100).length,
  }

  // Assign badges (no emojis)
  const getBadges = (cluster) => {
    const badges = []
    if (cluster.growthRate > 500) badges.push({ label: 'Explosive Growth', color: 'red' })
    else if (cluster.growthRate > 100) badges.push({ label: 'Fast Growing', color: 'amber' })
    else if (cluster.growthRate < 30) badges.push({ label: 'Stable', color: 'gray' })
    
    if (cluster.purity > 60) badges.push({ label: 'Focused', color: 'blue' })
    else if (cluster.purity < 15) badges.push({ label: 'Interdisciplinary', color: 'emerald' })
    
    if (cluster.size > 100000) badges.push({ label: 'Large Field', color: 'purple' })
    else if (cluster.size < 10000) badges.push({ label: 'Niche', color: 'cyan' })
    
    return badges
  }

  // Sort clusters
  const sortedClusters = [...clusters].sort((a, b) => {
    switch (sortBy) {
      case 'size': return b.size - a.size
      case 'growth': return b.growthRate - a.growthRate
      case 'purity': return b.purity - a.purity
      case 'name': return a.name.localeCompare(b.name)
      default: return 0
    }
  })

  const badgeColors = {
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  }

  const domainColors = {
    'Physics': '#3b82f6',
    'Computer Science': '#10b981',
    'Mathematics': '#a855f7',
    'Astrophysics': '#f59e0b',
    'Interdisciplinary': '#ec4899',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-3">Explore All 50 Clusters</h3>
        <p className="text-gray-400 leading-relaxed mb-4">
          Browse the complete landscape of research clusters discovered through unsupervised learning 
          on 2.4 million scientific abstracts. Click any cluster to explore its characteristics.
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
            <p className="text-gray-500 text-sm">Fast Growing</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{summary.avgGrowth.toFixed(0)}%</p>
            <p className="text-gray-500 text-sm">Avg Growth</p>
          </div>
        </div>
      </div>

      {/* Sort Control */}
      <div className="flex items-center gap-3">
        <label className="text-gray-400 text-sm">Sort by:</label>
        <div className="flex gap-1">
          {[
            { key: 'size', label: 'Size' },
            { key: 'growth', label: 'Growth' },
            { key: 'purity', label: 'Purity' },
            { key: 'name', label: 'Name' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                sortBy === opt.key
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-gray-800/50 text-gray-400 border border-transparent hover:border-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-gray-500 text-sm ml-auto">{sortedClusters.length} clusters</span>
      </div>

      {/* Cluster Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {sortedClusters.map(cluster => {
          const badges = getBadges(cluster)
          // Handle both old format (string[]) and new format ({term, score}[])
          const terms = cluster.topTerms || []
          const termStrings = terms.length > 0 && typeof terms[0] === 'object' 
            ? terms.map(t => t.term) 
            : terms
          // Handle both old format (missing) and new format ({code, name, pct}[])
          const domains = cluster.topDomains || []
          
          return (
            <motion.div
              key={cluster.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedCluster(cluster)}
              className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 transition-all"
            >
              {/* Header row */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium">{cluster.name}</h4>
                  <p className="text-gray-500 text-xs">{cluster.size.toLocaleString()} papers</p>
                </div>
                <span 
                  className={`text-xs px-2 py-0.5 rounded ml-2 shrink-0 ${
                    cluster.growthRate > 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  +{cluster.growthRate.toFixed(0)}%
                </span>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-1 mb-3">
                {badges.slice(0, 2).map((badge, i) => (
                  <span key={i} className={`text-xs px-2 py-0.5 rounded border ${badgeColors[badge.color]}`}>
                    {badge.label}
                  </span>
                ))}
              </div>
              
              {/* Top 5 Terms */}
              {termStrings.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {termStrings.slice(0, 5).map((term, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-700/50 text-gray-300">
                      {term}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Top 3 Domains */}
              {domains.length > 0 ? (
                <div className="text-xs text-gray-400 mb-2">
                  {domains.slice(0, 3).map((d, i) => (
                    <span key={i}>
                      <span className="text-gray-300">{d.name}</span>
                      <span className="text-gray-500"> {d.pct}%</span>
                      {i < Math.min(2, domains.length - 1) && <span className="text-gray-600"> · </span>}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-400 mb-2">
                  <span className="text-gray-300">{cluster.domain}</span>
                  <span className="text-gray-500"> · {cluster.topCategory}</span>
                </div>
              )}

              {/* Stats row */}
              <div className="flex gap-4 text-xs pt-2 border-t border-gray-700/50">
                <div>
                  <span className="text-gray-500">Purity </span>
                  <span className="text-gray-300">{cluster.purity}%</span>
                </div>
                {cluster.medianYear && (
                  <div>
                    <span className="text-gray-500">Median </span>
                    <span className="text-gray-300">{cluster.medianYear}</span>
                  </div>
                )}
                {cluster.recentRatio !== undefined && (
                  <div>
                    <span className="text-gray-500">Recent </span>
                    <span className="text-gray-300">{cluster.recentRatio}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Cluster Detail Modal */}
      {selectedCluster && (
        <ClusterDetailModal 
          cluster={selectedCluster}
          badges={getBadges(selectedCluster)}
          badgeColors={badgeColors}
          domainColors={domainColors}
          allClusters={clusters}
          onClose={() => setSelectedCluster(null)} 
        />
      )}

      {/* Footer insight */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
        <h4 className="text-indigo-400 font-medium mb-2">The Shape of Science</h4>
        <p className="text-gray-300">
          These 50 clusters reveal how scientific knowledge organizes itself: massive foundational 
          fields like Theoretical Physics (195K papers) anchor entire disciplines, while explosive 
          newcomers like LLMs (+991% growth) reshape the landscape.
        </p>
      </div>
    </div>
  )
}

function ClusterDetailModal({ cluster, badges, badgeColors, domainColors, allClusters, onClose }) {
  // Calculate ranks
  const sizeRank = [...allClusters].sort((a, b) => b.size - a.size).findIndex(c => c.id === cluster.id) + 1
  const growthRank = [...allClusters].sort((a, b) => b.growthRate - a.growthRate).findIndex(c => c.id === cluster.id) + 1

  // Handle both formats for terms
  const terms = cluster.topTerms || []
  const termsWithScores = terms.length > 0 && typeof terms[0] === 'object'
    ? terms
    : terms.map(t => ({ term: t, score: null }))
  
  // Handle domains
  const domains = cluster.topDomains || []
  
  // Handle categories  
  const categories = cluster.topCategories || []
  
  // Timeline data
  const timelineData = cluster.papersByYear || []

  // Category name mapping
  const getCategoryName = (code) => {
    const names = {
      'cs.CV': 'Computer Vision', 'cs.LG': 'Machine Learning', 'cs.CL': 'Computational Linguistics',
      'cs.AI': 'Artificial Intelligence', 'cs.NI': 'Networking', 'cs.IT': 'Information Theory',
      'math.CO': 'Combinatorics', 'math.AG': 'Algebraic Geometry', 'math.NT': 'Number Theory',
      'math.AP': 'PDEs', 'math.RT': 'Representation Theory', 'math.OC': 'Optimization',
      'math.GR': 'Group Theory', 'math.RA': 'Rings & Algebras',
      'hep-ph': 'HEP Phenomenology', 'hep-th': 'HEP Theory', 'hep-ex': 'HEP Experiment',
      'cond-mat.mes-hall': 'Mesoscale Physics', 'cond-mat.mtrl-sci': 'Materials Science',
      'cond-mat.str-el': 'Strongly Correlated', 'quant-ph': 'Quantum Physics',
      'gr-qc': 'General Relativity', 'astro-ph.GA': 'Galaxies', 'astro-ph.HE': 'High Energy Astro',
      'astro-ph.SR': 'Solar & Stellar', 'astro-ph.CO': 'Cosmology',
      'eess.AS': 'Audio & Speech', 'eess.SP': 'Signal Processing',
    }
    return names[code] || code
  }

  // Use the expert-written description from cluster data
const getDescription = () => {
  if (cluster.description) {
    return cluster.description
  }
  
  // Fallback to generated description if none exists (shouldn't happen)
  const termList = termsWithScores.slice(0, 4).map(t => t.term).join(', ')
  const sizeDesc = cluster.size > 100000 ? 'one of the largest research areas' : 
                   cluster.size > 50000 ? 'a major research area' : 
                   cluster.size > 20000 ? 'a substantial research field' : 'a specialized research niche'
  
  return `This cluster represents research centered on ${termList}. It's ${sizeDesc} with ${cluster.size.toLocaleString()} papers.`
}

return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{cluster.name}</h3>
          <p className="text-gray-400 text-sm">{cluster.size.toLocaleString()} papers · Cluster #{cluster.id}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span 
          className="px-3 py-1 rounded text-sm"
          style={{ 
            backgroundColor: `${domainColors[cluster.domain] || '#6b7280'}20`,
            color: domainColors[cluster.domain] || '#9ca3af'
          }}
        >
          {cluster.domain}
        </span>
        {badges.map((badge, i) => (
          <span key={i} className={`px-3 py-1 rounded border text-sm ${badgeColors[badge.color]}`}>
            {badge.label}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-5 border border-gray-700/50">
        <p className="text-gray-300 text-sm leading-relaxed">
          {getDescription()}
        </p>
      </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">+{cluster.growthRate.toFixed(0)}%</p>
            <p className="text-gray-500 text-xs">Growth</p>
            <p className="text-gray-600 text-xs">#{growthRank}</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-blue-400">{cluster.purity}%</p>
            <p className="text-gray-500 text-xs">Purity</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-purple-400">#{sizeRank}</p>
            <p className="text-gray-500 text-xs">Size Rank</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-amber-400">{cluster.medianYear || '—'}</p>
            <p className="text-gray-500 text-xs">Median Year</p>
          </div>
        </div>

        {/* Papers Over Time Chart */}
        {timelineData.length > 0 && (
          <div className="mb-5">
            <h4 className="text-gray-300 text-sm font-medium mb-2">Papers Over Time</h4>
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="year" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                    width={35}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [value.toLocaleString(), 'Papers']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* All Top Terms with scores */}
        <div className="mb-5">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Top Terms (TF-IDF)</h4>
          <div className="flex flex-wrap gap-2">
            {termsWithScores.slice(0, 10).map((t, i) => (
              <span 
                key={i} 
                className="text-sm px-3 py-1 rounded bg-gray-800/50 border border-gray-700/50"
                style={{
                  borderColor: i < 3 ? '#6366f150' : undefined,
                  color: i < 3 ? '#a5b4fc' : '#d1d5db'
                }}
              >
                {t.term}
                {t.score && <span className="text-gray-500 text-xs ml-1">({t.score.toFixed(3)})</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Domain Distribution */}
        {domains.length > 0 && (
          <div className="mb-5">
            <h4 className="text-gray-300 text-sm font-medium mb-2">Domain Distribution</h4>
            <div className="space-y-2">
              {domains.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-400 truncate">{d.name}</div>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${d.pct}%`,
                        backgroundColor: domainColors[d.name] || '#6b7280'
                      }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm text-gray-400">{d.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {categories.length > 0 && (
          <div className="mb-5">
            <h4 className="text-gray-300 text-sm font-medium mb-2">ArXiv Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((cat, i) => (
                <span 
                  key={i}
                  className="text-xs px-2 py-1 rounded bg-gray-800/50 text-gray-300 border border-gray-700/50"
                >
                  {CATEGORY_NAMES[cat.code] || cat.code}
                  <span className="text-gray-500 ml-1">{cat.pct}%</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer stats */}
        <div className="pt-4 border-t border-gray-700/50 text-xs text-gray-500 flex justify-between">
          <span>Share of total: {((cluster.size / 2400000) * 100).toFixed(2)}%</span>
          {cluster.recentRatio !== undefined && (
            <span>Papers since 2020: {cluster.recentRatio}%</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}