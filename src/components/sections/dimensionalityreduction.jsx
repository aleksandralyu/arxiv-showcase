import ScrollSection from '../ui/scrollsection'
import ImplementationToggle from '../ui/implementationtoggle'
import { 
  ThreeDToTwoD, 
  ClusterDiscovery, 
  SVDFormula, 
  VarianceChart
} from '../visualizations/dimredvisuals'

const steps = [
  {
    visual: <ThreeDToTwoD />,
    text: (
      <>
        <p className="mb-4">
          Dimensionality reduction preserves structure while using fewer dimensions.
        </p>
        <p className="mb-4">
          Here, a three-dimensional cube flattens into a two-dimensional square. 
          The structure remains—edges, corners, relationships—but one dimension disappears.
        </p>
        <p>
          This is what we'll do with our data, just with many more dimensions.
        </p>
      </>
    )
  },
  {
    visual: <ClusterDiscovery />,
    text: (
      <>
        <p className="mb-4">
          Remember our 1,000-column sparse matrix? Each paper exists as a point in 
          1,000-dimensional space.
        </p>
        <p className="mb-4">
          Here's the challenge: in very high dimensions, everything becomes far apart. 
          Distances lose meaning. Clusters become impossible to detect. This is the 
          curse of dimensionality.
        </p>
        <p className="mb-4">
          Watch as dimensionality reduction reveals the hidden structure. What appears 
          as random scatter in high dimensions transforms into clear, distinct clusters.
        </p>
        <p>
          This is why we reduce dimensions—not just to save space, but to make patterns discoverable.
        </p>
      </>
    )
  },
  {
    visual: <SVDFormula />,
    text: (
      <>
        <p className="mb-4">
          SVD finds the directions of maximum variation in the data. Think of it as 
          finding the best angles to view a complex 3D object.
        </p>
        <p className="mb-4">
          The first component captures the most variation, the second captures the 
          next-most, and so on. By keeping only the top components, we get the best 
          possible lower-dimensional approximation.
        </p>
        <p>
          Truncated SVD keeps the top <em>k</em> components, giving us a compressed 
          representation that preserves the most important structure.
        </p>
      </>
    )
  },
  {
    visual: <VarianceChart />,
    text: (
      <>
        <p className="mb-4">
          We've reduced from 1,000 dimensions down to 500. The chart shows why this works.
        </p>
        <p className="mb-4">
          At 500 components, we've captured 71% of the variance—the meaningful patterns 
          in our data. The remaining 29% is mostly noise and rare term combinations.
        </p>
        <p>
          This compressed representation is now ready for clustering. We've preserved 
          the semantic structure while making the data computationally tractable.
        </p>
      </>
    )
  }
]

function DimensionalityReduction() {
  return (
    <>
      <ScrollSection
        id="dimensionality-reduction"
        title="Dimensionality Reduction"
        subtitle="From 1,000 dimensions to something manageable"
        steps={steps}
        backgroundColor="bg-gray-950"
      />
      
      {/* Implementation Details - Full width at section end */}
      <div className="bg-gray-950 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <ImplementationToggle title="Dimensionality Reduction Implementation Details">
            <div className="space-y-3">
              
              {/* PCA vs TruncatedSVD */}
              <div className="pb-3 border-b border-gray-700">
                <div className="text-gray-300 mb-2">PCA vs TruncatedSVD:</div>
                <div className="text-xs text-gray-400 space-y-2">
                  <div>
                    <span className="text-red-400">Initial attempt:</span> PCA with 100 components → 11% variance explained
                  </div>
                  <div>
                    <span className="text-white">Problem:</span> PCA centers data (X - mean), destroying 99.34% sparsity.
                    Sparse matrix became dense, information lost in transformation.
                  </div>
                  <div>
                    <span className="text-emerald-400">Solution:</span> TruncatedSVD operates on sparse matrices directly.
                    Result: 53-71% variance (6.5x improvement). Standard for text (Latent Semantic Analysis).
                  </div>
                </div>
              </div>

              {/* Dual-Path Experiment */}
              <div className="pb-3 border-b border-gray-700">
                <div className="text-gray-300 mb-2">Dual-path experiment:</div>
                <div className="text-xs text-gray-400 space-y-2">
                  <div>
                    <span className="text-white">Question:</span> 300 or 500 components?
                  </div>
                  <div className="space-y-1">
                    <div><span className="text-emerald-400">Path A (300d):</span> 53% variance, 3.3x compression</div>
                    <div><span className="text-blue-400">Path B (500d):</span> 71% variance, 2x compression</div>
                  </div>
                  <div>
                    <span className="text-white">Initial uncertainty:</span> Is the extra 18% variance meaningful or just noise?
                  </div>
                  <div>
                    <span className="text-white">Approach:</span> Process both paths through full pipeline, compare downstream results.
                  </div>
                  <div>
                    <span className="text-emerald-400">Outcome:</span> 500d superior across all research questions—better 
                    temporal patterns, more bridges identified, improved category alignment, finer cluster distinctions.
                  </div>
                  <div>
                    <span className="text-white">Conclusion:</span> Additional variance captures meaningful semantic nuance, not noise.
                    Trade-offs negligible (12 min vs 8 min processing, similar clustering performance).
                    All results presented from 500d path.
                  </div>
                </div>
              </div>

              {/* Technical Configuration */}
              <div>
                <div className="text-gray-300 mb-2">Technical configuration:</div>
                <div className="space-y-1 text-xs">
                  <div><span className="text-blue-400">algorithm:</span> 'randomized' <span className="text-gray-600"># fast for large sparse</span></div>
                  <div><span className="text-blue-400">n_iter:</span> 7 <span className="text-gray-600"># convergence iterations</span></div>
                  <div><span className="text-blue-400">random_state:</span> 42 <span className="text-gray-600"># reproducibility</span></div>
                  <div className="pt-2"><span className="text-blue-400">n_components:</span> 500</div>
                  <div><span className="text-blue-400">variance_explained:</span> 71.28%</div>
                  <div><span className="text-blue-400">compression:</span> 1000 → 500 (2x)</div>
                  <div><span className="text-blue-400">processing_time:</span> ~12 minutes</div>
                </div>
              </div>
            </div>
          </ImplementationToggle>
        </div>
      </div>
    </>
  )
}

export default DimensionalityReduction