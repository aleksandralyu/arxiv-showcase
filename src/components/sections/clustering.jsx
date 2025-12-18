import ScrollSection from '../ui/scrollsection'
import ImplementationToggle from '../ui/implementationtoggle'
import { 
  KMeansAnimation, 
  EvaluationChart, 
  ClusterOverview, 
  ClusterExamples 
} from '../visualizations/clusteringvisuals'

const steps = [
  {
    visual: <KMeansAnimation />,
    text: (
      <>
        <p className="mb-4">
          K-means finds natural groupings by iteratively refining cluster assignments.
        </p>
        <p className="mb-4">
          The algorithm starts with random centroids, then repeats two steps: 
          assign each point to its nearest centroid, then move centroids to the 
          center of their assigned points.
        </p>
        <p>
          Watch as scattered points organize into distinct clusters. The centroids 
          shift until assignments stabilize—this is convergence.
        </p>
      </>
    )
  },
  {
    visual: <EvaluationChart />,
    text: (
      <>
        <p className="mb-4">
          How many clusters? Too few misses structure. Too many overfits noise.
        </p>
        <p className="mb-4">
          We evaluated three metrics across k=10 to k=50: <em>Silhouette</em> (cohesion vs separation), 
          <em>Davies-Bouldin</em> (cluster compactness), and <em>Calinski-Harabasz</em> (variance ratio).
        </p>
        <p>
          At <em>k</em>=50, Silhouette and Davies-Bouldin both optimize, suggesting 
          well-separated, compact clusters. Manual inspection confirmed interpretable groupings.
        </p>
      </>
    )
  },
  {
    visual: <ClusterOverview />,
    text: (
      <>
        <p className="mb-4">
          50 clusters emerged from 2.4 million papers. Each represents a distinct 
          topical community within scientific literature.
        </p>
        <p className="mb-4">
          Cluster sizes vary dramatically—from broad fields like "Theoretical Physics" 
          with nearly 200,000 papers to specialized niches like "Tau Physics" with under 7,000.
        </p>
        <p>
          The distribution reveals the structure of scientific knowledge: a few 
          dominant paradigms surrounded by many specialized subfields.
        </p>
      </>
    )
  },
  {
    visual: <ClusterExamples />,
    text: (
      <>
        <p className="mb-4">
          Each cluster has a signature—the terms that distinguish it from others.
        </p>
        <p className="mb-4">
          Some clusters show explosive growth: LLMs grew 991% since 2020. Others reveal 
          interdisciplinary bridges like "Graph Theory & Networks" spanning math and CS.
        </p>
        <p>
          These bridges are where innovation often happens: methods from one field 
          applied to problems in another.
        </p>
      </>
    )
  }
]

function Clustering() {
  return (
    <>
      <ScrollSection
        id="clustering"
        title="Clustering"
        subtitle="Finding natural groupings in 2.4 million papers"
        steps={steps}
        backgroundColor="bg-gray-900"
      />
      
      {/* Implementation Details - Full width at section end */}
      <div className="bg-gray-900 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <ImplementationToggle title="Clustering Implementation Details">
            <div className="space-y-3">
              
              {/* Algorithm Choice */}
              <div className="pb-3 border-b border-gray-700">
                <div className="text-gray-300 mb-2">Why K-Means?</div>
                <div className="text-xs text-gray-400 space-y-2">
                  <div>
                    <span className="text-white">Scalability:</span> Linear time complexity O(n·k·t) handles 2.4M documents
                  </div>
                  <div>
                    <span className="text-white">Interpretability:</span> Cluster centroids provide clear topic signatures via top TF-IDF terms
                  </div>
                  <div>
                    <span className="text-white">Reproducibility:</span> Deterministic with fixed random_state
                  </div>
                  <div>
                    <span className="text-gray-500">Alternatives considered:</span> Hierarchical (too slow at scale), DBSCAN (density-based, 
                    less interpretable), Gaussian Mixture (probabilistic but added complexity)
                  </div>
                </div>
              </div>

              {/* Finding k */}
              <div className="pb-3 border-b border-gray-700">
                <div className="text-gray-300 mb-2">Finding optimal k:</div>
                <div className="text-xs text-gray-400 space-y-2">
                  <div>
                    <span className="text-white">Range tested:</span> k = 10 to 50 in increments of 5
                  </div>
                  <div>
                    <span className="text-white">Metrics evaluated:</span>
                  </div>
                  <div className="pl-4 space-y-1">
                    <div><span className="text-blue-400">Silhouette:</span> Best at k=50 (0.0206) — measures cohesion vs separation</div>
                    <div><span className="text-emerald-400">Davies-Bouldin:</span> Best at k=45-50 (3.99-4.12) — lower is better, measures compactness</div>
                    <div><span className="text-purple-400">Calinski-Harabasz:</span> Best at k=10 (13,915) — but oversimplifies structure</div>
                  </div>
                  <div>
                    <span className="text-emerald-400">Decision:</span> k=50 optimizes both separation and compactness while maintaining interpretable clusters
                  </div>
                  <div>
                    <span className="text-white">Validation:</span> Manual inspection confirmed coherent, meaningful topic groupings
                  </div>
                </div>
              </div>

              {/* Technical Configuration */}
              <div>
                <div className="text-gray-300 mb-2">Technical configuration:</div>
                <div className="space-y-1 text-xs">
                  <div><span className="text-blue-400">algorithm:</span> 'lloyd' <span className="text-gray-600"># classic k-means</span></div>
                  <div><span className="text-blue-400">n_init:</span> 10 <span className="text-gray-600"># runs with different seeds</span></div>
                  <div><span className="text-blue-400">max_iter:</span> 300 <span className="text-gray-600"># convergence iterations</span></div>
                  <div><span className="text-blue-400">random_state:</span> 42 <span className="text-gray-600"># reproducibility</span></div>
                  <div className="pt-2"><span className="text-blue-400">n_clusters:</span> 50</div>
                  <div><span className="text-blue-400">input_dimensions:</span> 500 (from TruncatedSVD)</div>
                  <div><span className="text-blue-400">n_samples:</span> 2,384,622 papers</div>
                  <div><span className="text-blue-400">k_selection_time:</span> ~1.3 minutes total</div>
                </div>
              </div>
            </div>
          </ImplementationToggle>
        </div>
      </div>
    </>
  )
}

export default Clustering