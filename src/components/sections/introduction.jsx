import { motion } from 'framer-motion'

// ============================================================================
// INTRODUCTION SECTION
// Sets context for why analyzing research trends matters
// ============================================================================

export default function Introduction() {
  return (
    <section 
      id="introduction" 
      data-section="introduction"
      className="min-h-screen flex items-center py-24 px-6 bg-gray-950"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Understanding the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Evolution of Science
            </span>
          </h1>

          {/* Opening paragraph */}
          <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
            <p>
              Every year, researchers around the world publish hundreds of scientific papers. 
              Hidden within this torrent of knowledge are patterns—emerging fields gaining momentum, 
              established disciplines with stable vocabularies, and interdisciplinary bridges where 
              innovation happens fastest.
            </p>

            <p>
              Researchers these days struggle to stay up to date in their own fields. Keeping track
              of the growing body of research isn't feasible for a human.
            </p>

            <p className="text-white font-medium">
              In this case study, we apply unsupervised machine learning to a large dataset of 
              scientific papers. It's our humble attempt to understand a bit more of the research 
              landscape in STEM today.
            </p>
          </div>

          {/* Who cares section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 p-6 bg-gray-800/50 border border-gray-700 rounded-xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Why does this matter?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-gray-400">
              <div>
                <h4 className="text-blue-400 font-medium mb-2">For Researchers</h4>
                <p className="text-sm leading-relaxed">
                  Discover emerging niches before they become crowded. Find interdisciplinary 
                  opportunities where your skills could transfer. Understand which areas have 
                  slowing momentum and may have saturated.
                </p>
              </div>
              
              <div>
                <h4 className="text-emerald-400 font-medium mb-2">For Investors & Funders</h4>
                <p className="text-sm leading-relaxed">
                  Identify research areas with explosive growth trajectories. Spot 
                  interdisciplinary bridges that often precede commercial breakthroughs. 
                  Evaluate the momentum behind specific technology domains.
                </p>
              </div>
              
              <div>
                <h4 className="text-purple-400 font-medium mb-2">For Educators</h4>
                <p className="text-sm leading-relaxed">
                  Track how terminology evolves across fields. Identify stable foundational 
                  areas vs. rapidly changing frontiers. Understand how disciplines relate 
                  and overlap.
                </p>
              </div>
              
              <div>
                <h4 className="text-amber-400 font-medium mb-2">For Policy Makers</h4>
                <p className="text-sm leading-relaxed">
                  Visualize the research landscape at scale. Identify gaps between official 
                  categorization and actual research content. Track the rise of new fields 
                  before they get official recognition.
                </p>
              </div>
            </div>
          </motion.div>

          {/* The approach */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              The Approach
            </h3>
            
            <p className="text-gray-400 leading-relaxed mb-4">
              We analyzed a dataset of <strong className="text-white">2,384,622 papers</strong> from 
              ArXiv spanning 1991 to 2024. Using TF-IDF vectorization and dimensionality reduction, 
              we transformed each abstract into a point in high-dimensional space where similar papers 
              cluster together naturally.
            </p>
            
            <p className="text-gray-400 leading-relaxed">
              K-means clustering then identified <strong className="text-white">50 distinct research clusters</strong>—not 
              based on what category authors selected, but on the actual content of their abstracts. 
            </p>
          </motion.div>

          {/* Scroll indicator + Jump to results */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-16 flex flex-row items-center justify-center gap-6"
          >
            {/* Scroll to methodology */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-3">Explore methodology</p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </div>
            
            {/* Jump to results button */}
            <button
              onClick={() => {
                const resultsSection = document.getElementById('results')
                if (resultsSection) {
                  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className="px-6 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300 flex items-center gap-2"
            >
              <span>or jump to results</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}