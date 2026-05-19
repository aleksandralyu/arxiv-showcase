// ============================================================================
// SHARED CONSTANTS & HELPERS — used by all results tab components
// ============================================================================

export const CATEGORY_NAMES = {
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

export const DOMAIN_NAMES = {
  'cs': 'Computer Science', 'math': 'Mathematics', 'physics': 'Physics',
  'stat': 'Statistics', 'hep-ph': 'High Energy Physics',
  'hep-th': 'Theoretical Physics', 'astro-ph': 'Astrophysics',
  'cond-mat': 'Condensed Matter', 'quant-ph': 'Quantum Physics',
  'gr-qc': 'Relativity', 'eess': 'Electrical Engineering',
  'q-bio': 'Biology', 'q-fin': 'Finance', 'nlin': 'Nonlinear Science',
  'nucl-th': 'Nuclear Physics', 'math-ph': 'Mathematical Physics',
}

export const DOMAIN_COLORS = {
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

// Explicit color class sets — no dynamic Tailwind string interpolation
export const METRIC_COLOR_CLASSES = {
  blue:    { bg: 'bg-blue-500/5',    border: 'border-blue-500/20',    title: 'text-blue-400'    },
  emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', title: 'text-emerald-400' },
  purple:  { bg: 'bg-purple-500/5',  border: 'border-purple-500/20',  title: 'text-purple-400'  },
  amber:   { bg: 'bg-amber-500/5',   border: 'border-amber-500/20',   title: 'text-amber-400'   },
}

export function getCategoryName(code) {
  return CATEGORY_NAMES[code] || code
}

export function getDomainName(code) {
  return DOMAIN_NAMES[code] || code
}

export function getDomainColor(domain) {
  if (!domain) return '#6b7280'
  const key = domain.split('.')[0]
  return DOMAIN_COLORS[key] || DOMAIN_COLORS[domain] || '#6b7280'
}

// Normalize topTerms — string[] (q1/q2/q3/q4) or {term,score}[] (clusterexploration)
export function getTermStrings(topTerms) {
  if (!topTerms) return []
  return topTerms.map(t => (typeof t === 'string' ? t : t.term)).filter(Boolean)
}

export function getClusterName(cluster) {
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

export function getShortName(cluster) {
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

export function formatGrowthRate(rate) {
  if (rate === undefined || rate === null) return '—'
  if (rate > 1000) return `${(rate / 1000).toFixed(0)}k×`
  if (rate > 10)   return `${rate.toFixed(0)}×`
  if (rate >= 1)   return `+${(rate * 100).toFixed(0)}%`
  return `+${(rate * 100).toFixed(0)}%`
}

export function isMeaningfulTerm(term) {
  if (!term || typeof term !== 'string') return false
  return (
    !term.startsWith('math') &&
    !term.startsWith('frac') &&
    !term.includes('\\') &&
    term.length > 2
  )
}
