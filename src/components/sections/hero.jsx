import { motion } from 'framer-motion'

function Hero() {
  return (
    <section className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center relative">
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Mapping 2.4 Million
          <span className="block text-blue-500">Scientific Papers</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-8">
          An interactive journey through unsupervised machine learning,
          from raw text to hidden research patterns.
        </p>

        <p className="text-sm text-gray-500 mb-12">
          A case study in clustering, dimensionality reduction, and discovery.
        </p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center"
      >
        <span className="text-gray-500 text-sm mb-2">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center"
        >
          <motion.div className="w-1.5 h-3 bg-gray-500 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero