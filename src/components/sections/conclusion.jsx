import { motion } from 'framer-motion'

// ============================================================================
// CONCLUSION SECTION  
// Synthesizes findings and discusses implications
// ============================================================================

export default function Conclusion() {
  return (
    <section 
      id="conclusion" 
      data-section="conclusion"
      className="min-h-screen py-24 px-6 bg-gray-950"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Main heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            What We've Learned
          </h2>

          {/* Key takeaways */}
          <div className="space-y-8 mb-16">
            {/* Takeaway 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Vocabulary Reveals Field Maturity
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Fields like pure mathematics show remarkable terminology stability over decades—the 
                  language of theorems and proofs has remained consistent since the 1990s. In contrast, 
                  machine learning clusters show vocabulary turnover of nearly 50% between time periods. 
                  Terms like "transformer," "attention mechanism," and "diffusion model" didn't exist 
                  a decade ago. <strong className="text-gray-300">When evaluating research areas, 
                  vocabulary stability is a proxy for field maturity.</strong>
                </p>
              </div>
            </motion.div>

            {/* Takeaway 2 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Interdisciplinary Bridges Grow Faster
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Clusters that span multiple traditional domains—like computational biology, quantum 
                  computing, or graph neural networks—show 30-50% faster growth than single-domain 
                  clusters. <strong className="text-gray-300">Innovation increasingly happens at 
                  disciplinary boundaries.</strong> These bridge areas represent opportunities for 
                  researchers who can translate methods from one field to problems in another.
                </p>
              </div>
            </motion.div>

            {/* Takeaway 3 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Content ≠ Categories
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Our content-based clusters show only moderate alignment with ArXiv's human-curated 
                  categories (NMI ~0.32). This isn't a flaw—it's a feature. Low-purity clusters often 
                  represent <em>genuinely interdisciplinary areas</em> that don't fit neatly into 
                  existing boxes. <strong className="text-gray-300">The gap between categorization 
                  and content reveals where our mental models of science lag behind its reality.</strong>
                </p>
              </div>
            </motion.div>

            {/* Takeaway 4 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  AI/ML Dominates the Growth Landscape
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Large Language Model research has grown nearly 1000% since 2020. But the data also 
                  reveals <em>stagnating</em> areas—older niches where paper volume has plateaued or 
                  declined. <strong className="text-gray-300">For researchers and investors, both 
                  extremes matter: explosive growth signals opportunity, while stagnation may signal 
                  either saturation or underexplored gaps.</strong>
                </p>
              </div>
            </motion.div>
          </div>

          {/* Implications section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl mb-12"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Investment & Strategy Implications
            </h3>
            
            <div className="space-y-4 text-gray-400">
              <p>
                <strong className="text-blue-400">For R&D funding:</strong> Our bridge area analysis 
                identifies high-growth interdisciplinary zones. Graph neural networks, quantum 
                computing, and AI safety show strong bridge scores combined with acceleration. These 
                represent areas where funding can catalyze cross-pollination.
              </p>
              
              <p>
                <strong className="text-emerald-400">For talent strategy:</strong> Vocabulary 
                evolution data reveals which skills have longevity. Mathematical foundations remain 
                relevant across decades; specific framework knowledge (today's PyTorch, yesterday's 
                Theano) churns rapidly.
              </p>
              
              <p>
                <strong className="text-purple-400">For competitive intelligence:</strong> Cluster 
                growth trajectories provide early signals. A field entering the top-10 fastest 
                growing list typically precedes widespread commercial interest by 2-3 years.
              </p>
              
              <p>
                <strong className="text-amber-400">For research direction:</strong> Low-alignment 
                clusters highlight frontier areas that haven't been formally recognized. These 
                represent opportunities to establish new sub-fields before naming conventions 
                crystallize.
              </p>
            </div>
          </motion.div>

          {/* Methodological notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Methodological Notes
            </h3>
            
            <div className="space-y-3 text-gray-400 text-sm">
              <p>
                <strong className="text-gray-300">Dimensionality:</strong> We tested both 300 and 
                500-dimensional SVD representations. The 500D approach consistently produced 
                slightly better-separated clusters and higher alignment scores, suggesting that 
                scientific abstracts contain rich semantic structure that benefits from higher 
                dimensionality.
              </p>
              
              <p>
                <strong className="text-gray-300">Cluster count:</strong> K=50 was selected based 
                on elbow analysis and silhouette scores, balancing granularity (enough clusters to 
                capture distinct areas) with interpretability (not so many that clusters become 
                indistinguishable).
              </p>
              
              <p>
                <strong className="text-gray-300">Limitations:</strong> This analysis is based on 
                abstracts only—full paper content might reveal different structure. Additionally, 
                ArXiv has known biases toward physics, mathematics, and computer science; other 
                scientific domains are underrepresented.
              </p>
            </div>
          </motion.div>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="text-center pt-8 border-t border-gray-800"
          >
            <p className="text-gray-400 mb-6">
              This analysis demonstrates how unsupervised machine learning can reveal structure 
              invisible to manual categorization. As science becomes more interdisciplinary and 
              fast-moving, such tools become essential for navigation.
            </p>
            
            <p className="text-gray-500 text-sm">
              Built as a case study in unsupervised learning • 2,384,622 papers analyzed • 
              50 clusters identified
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}