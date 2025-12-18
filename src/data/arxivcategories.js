// Comprehensive ArXiv category to natural language mapping
// Includes main field and subdomain for consistency

export const ARXIV_CATEGORY_LABELS = {
  // Computer Science
  'cs.AI': 'Computer Science (Artificial Intelligence)',
  'cs.AR': 'Computer Science (Hardware Architecture)',
  'cs.CC': 'Computer Science (Computational Complexity)',
  'cs.CE': 'Computer Science (Computational Engineering)',
  'cs.CG': 'Computer Science (Computational Geometry)',
  'cs.CL': 'Computer Science (Computation and Language)',
  'cs.CR': 'Computer Science (Cryptography and Security)',
  'cs.CV': 'Computer Science (Computer Vision)',
  'cs.CY': 'Computer Science (Computers and Society)',
  'cs.DB': 'Computer Science (Databases)',
  'cs.DC': 'Computer Science (Distributed Computing)',
  'cs.DL': 'Computer Science (Digital Libraries)',
  'cs.DM': 'Computer Science (Discrete Mathematics)',
  'cs.DS': 'Computer Science (Data Structures and Algorithms)',
  'cs.ET': 'Computer Science (Emerging Technologies)',
  'cs.FL': 'Computer Science (Formal Languages)',
  'cs.GL': 'Computer Science (General Literature)',
  'cs.GR': 'Computer Science (Graphics)',
  'cs.GT': 'Computer Science (Computer Science and Game Theory)',
  'cs.HC': 'Computer Science (Human-Computer Interaction)',
  'cs.IR': 'Computer Science (Information Retrieval)',
  'cs.IT': 'Computer Science (Information Theory)',
  'cs.LG': 'Computer Science (Machine Learning)',
  'cs.LO': 'Computer Science (Logic in Computer Science)',
  'cs.MA': 'Computer Science (Multiagent Systems)',
  'cs.MM': 'Computer Science (Multimedia)',
  'cs.MS': 'Computer Science (Mathematical Software)',
  'cs.NA': 'Computer Science (Numerical Analysis)',
  'cs.NE': 'Computer Science (Neural and Evolutionary Computing)',
  'cs.NI': 'Computer Science (Networking and Internet)',
  'cs.OH': 'Computer Science (Other Computer Science)',
  'cs.OS': 'Computer Science (Operating Systems)',
  'cs.PF': 'Computer Science (Performance)',
  'cs.PL': 'Computer Science (Programming Languages)',
  'cs.RO': 'Computer Science (Robotics)',
  'cs.SC': 'Computer Science (Symbolic Computation)',
  'cs.SD': 'Computer Science (Sound)',
  'cs.SE': 'Computer Science (Software Engineering)',
  'cs.SI': 'Computer Science (Social and Information Networks)',
  'cs.SY': 'Computer Science (Systems and Control)',

  // Physics - High Energy Physics
  'hep-ex': 'High Energy Physics (Experiment)',
  'hep-lat': 'High Energy Physics (Lattice)',
  'hep-ph': 'High Energy Physics (Phenomenology)',
  'hep-th': 'High Energy Physics (Theory)',

  // Physics - Astrophysics
  'astro-ph': 'Astrophysics',
  'astro-ph.CO': 'Astrophysics (Cosmology and Nongalactic)',
  'astro-ph.EP': 'Astrophysics (Earth and Planetary)',
  'astro-ph.GA': 'Astrophysics (Galaxies)',
  'astro-ph.HE': 'Astrophysics (High Energy Phenomena)',
  'astro-ph.IM': 'Astrophysics (Instrumentation and Methods)',
  'astro-ph.SR': 'Astrophysics (Solar and Stellar)',

  // Physics - Condensed Matter
  'cond-mat.dis-nn': 'Condensed Matter (Disordered Systems)',
  'cond-mat.mes-hall': 'Condensed Matter (Mesoscale and Nanoscale)',
  'cond-mat.mtrl-sci': 'Condensed Matter (Materials Science)',
  'cond-mat.other': 'Condensed Matter (Other)',
  'cond-mat.quant-gas': 'Condensed Matter (Quantum Gases)',
  'cond-mat.soft': 'Condensed Matter (Soft Condensed Matter)',
  'cond-mat.stat-mech': 'Condensed Matter (Statistical Mechanics)',
  'cond-mat.str-el': 'Condensed Matter (Strongly Correlated Electrons)',
  'cond-mat.supr-con': 'Condensed Matter (Superconductivity)',

  // Physics - General Relativity and Quantum Cosmology
  'gr-qc': 'General Relativity and Quantum Cosmology',

  // Physics - Nuclear
  'nucl-ex': 'Nuclear Physics (Experiment)',
  'nucl-th': 'Nuclear Physics (Theory)',

  // Physics - Quantum Physics
  'quant-ph': 'Quantum Physics',

  // Mathematics
  'math.AC': 'Mathematics (Commutative Algebra)',
  'math.AG': 'Mathematics (Algebraic Geometry)',
  'math.AP': 'Mathematics (Analysis of PDEs)',
  'math.AT': 'Mathematics (Algebraic Topology)',
  'math.CA': 'Mathematics (Classical Analysis and ODEs)',
  'math.CO': 'Mathematics (Combinatorics)',
  'math.CT': 'Mathematics (Category Theory)',
  'math.CV': 'Mathematics (Complex Variables)',
  'math.DG': 'Mathematics (Differential Geometry)',
  'math.DS': 'Mathematics (Dynamical Systems)',
  'math.FA': 'Mathematics (Functional Analysis)',
  'math.GM': 'Mathematics (General Mathematics)',
  'math.GN': 'Mathematics (General Topology)',
  'math.GR': 'Mathematics (Group Theory)',
  'math.GT': 'Mathematics (Geometric Topology)',
  'math.HO': 'Mathematics (History and Overview)',
  'math.IT': 'Mathematics (Information Theory)',
  'math.KT': 'Mathematics (K-Theory and Homology)',
  'math.LO': 'Mathematics (Logic)',
  'math.MG': 'Mathematics (Metric Geometry)',
  'math.MP': 'Mathematics (Mathematical Physics)',
  'math.NA': 'Mathematics (Numerical Analysis)',
  'math.NT': 'Mathematics (Number Theory)',
  'math.OA': 'Mathematics (Operator Algebras)',
  'math.OC': 'Mathematics (Optimization and Control)',
  'math.PR': 'Mathematics (Probability)',
  'math.QA': 'Mathematics (Quantum Algebra)',
  'math.RA': 'Mathematics (Rings and Algebras)',
  'math.RT': 'Mathematics (Representation Theory)',
  'math.SG': 'Mathematics (Symplectic Geometry)',
  'math.SP': 'Mathematics (Spectral Theory)',
  'math.ST': 'Mathematics (Statistics Theory)',

  // Nonlinear Sciences
  'nlin.AO': 'Nonlinear Sciences (Adaptation and Self-Organizing Systems)',
  'nlin.CD': 'Nonlinear Sciences (Chaotic Dynamics)',
  'nlin.CG': 'Nonlinear Sciences (Cellular Automata)',
  'nlin.PS': 'Nonlinear Sciences (Pattern Formation)',
  'nlin.SI': 'Nonlinear Sciences (Exactly Solvable Systems)',

  // Quantitative Biology
  'q-bio.BM': 'Quantitative Biology (Biomolecules)',
  'q-bio.CB': 'Quantitative Biology (Cell Behavior)',
  'q-bio.GN': 'Quantitative Biology (Genomics)',
  'q-bio.MN': 'Quantitative Biology (Molecular Networks)',
  'q-bio.NC': 'Quantitative Biology (Neurons and Cognition)',
  'q-bio.OT': 'Quantitative Biology (Other)',
  'q-bio.PE': 'Quantitative Biology (Populations and Evolution)',
  'q-bio.QM': 'Quantitative Biology (Quantitative Methods)',
  'q-bio.SC': 'Quantitative Biology (Subcellular Processes)',
  'q-bio.TO': 'Quantitative Biology (Tissues and Organs)',

  // Quantitative Finance
  'q-fin.CP': 'Quantitative Finance (Computational Finance)',
  'q-fin.EC': 'Quantitative Finance (Economics)',
  'q-fin.GN': 'Quantitative Finance (General Finance)',
  'q-fin.MF': 'Quantitative Finance (Mathematical Finance)',
  'q-fin.PM': 'Quantitative Finance (Portfolio Management)',
  'q-fin.PR': 'Quantitative Finance (Pricing of Securities)',
  'q-fin.RM': 'Quantitative Finance (Risk Management)',
  'q-fin.ST': 'Quantitative Finance (Statistical Finance)',
  'q-fin.TR': 'Quantitative Finance (Trading and Market Microstructure)',

  // Statistics
  'stat.AP': 'Statistics (Applications)',
  'stat.CO': 'Statistics (Computation)',
  'stat.ME': 'Statistics (Methodology)',
  'stat.ML': 'Statistics (Machine Learning)',
  'stat.OT': 'Statistics (Other)',
  'stat.TH': 'Statistics (Theory)',

  // Electrical Engineering and Systems Science
  'eess.AS': 'Electrical Engineering (Audio and Speech Processing)',
  'eess.IV': 'Electrical Engineering (Image and Video Processing)',
  'eess.SP': 'Electrical Engineering (Signal Processing)',
  'eess.SY': 'Electrical Engineering (Systems and Control)',

  // Economics
  'econ.EM': 'Economics (Econometrics)',
  'econ.GN': 'Economics (General Economics)',
  'econ.TH': 'Economics (Theoretical Economics)',
}

// Helper function to get full label
export function getCategoryLabel(category) {
  return ARXIV_CATEGORY_LABELS[category] || category
}