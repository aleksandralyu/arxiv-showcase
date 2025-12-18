import ScrollSection from '../ui/scrollsection'
import ImplementationToggle from '../ui/implementationtoggle'
import { 
  PaperMockup, 
  DataExtraction, 
  ScaleVisualization,
  InteractiveCharts,
  ChaosToStructure 
} from '../visualizations/datavisuals'

const step1 = {
  visual: <PaperMockup />,
  text: (
    <>
      <p className="mb-4">
        ArXiv is an open repository of scientific preprints spanning physics, 
        mathematics, computer science, biology, and more.
      </p>
      <p className="mb-4">
        Each paper includes structured metadata and an abstract—typically 
        150-200 words summarizing the research contribution.
      </p>
      <p>
        For this analysis, we're working with the dataset made available by Cornell on Kaggle, 
        2.4 million papers published between 2007 and 2025.
      </p>
    </>
  )
}

const step2 = {
  visual: <DataExtraction />,
  text: (
    <>
      <p className="mb-4">
        From each paper we extract key fields that capture both content 
        and context.
      </p>
      <p className="mb-4">
        Some fields are used directly. Others are transformed into features 
        that better represent the underlying signal. Dates become years, 
        category lists become flags.
      </p>
      <p>
        This is what we call feature engineering, extracting raw data 
        and converting it into meaningful inputs for analysis.
      </p>
    </>
  )
}

const step3 = {
  visual: <ScaleVisualization />,
  text: (
    <>
      <p className="mb-4">
        Reading one abstract per minute, 8 hours daily, would take 
        25 years to complete the dataset.
      </p>
      <p className="mb-4">
        No human can process this volume. Pattern detection at this scale 
        requires computational methods.
      </p>
      <p>
        With millions of papers, manual pattern identification isn't feasible. 
      </p>
    </>
  )
}

const step4 = {
  visual: <InteractiveCharts />,
  text: (
    <>
      <p className="mb-4">
        With our dataset cleaned and loaded, we can explore its characteristics.
      </p>
      <p className="mb-4">
        We take into account sizes, categories, and structure of the data to inform 
        our selected methods and research questions.
      </p>
      <p>
        These patterns provide context for the analysis ahead.
      </p>
    </>
  )
}

const step5 = {
  visual: <ChaosToStructure />,
  text: (
    <>
      <p className="mb-4">
        Statistics can help us make sense of explicit variables we have, but 
        algorithms can discover hidden patterns in the data itself.
      </p>
      <p className="mb-4">
        We will use unsupervised learning to group similar papers based on their abstracts
        and reveal relationships without predefined categories.
      </p>
      <p>
        Let's transform this textual data into features our algorithms can process.
      </p>
    </>
  )
}

const steps = [step1, step2, step3, step4, step5]

function DataOverview() {
  return (
    <>
      <ScrollSection
        id="data-overview"
        title="The Dataset"
        subtitle="From one paper to 2.4 million"
        steps={steps}
        backgroundColor="bg-gray-900"
      />
      
      {/* Implementation Details - Tighter spacing with visual connection */}
      <div className="bg-gray-900 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <ImplementationToggle title="Feature Engineering Implementation Details">
            <div className="space-y-4">
              <div>
                <div className="text-gray-300 mb-2">Temporal features:</div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-amber-400">year</span>
                    <span className="text-gray-500"> = extract from update_date</span>
                  </div>
                  <div className="text-xs text-gray-400 ml-4">
                    Enables time-series analysis and trend detection
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <div className="text-gray-300 mb-2">Category features:</div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-emerald-400">primary_category</span>
                    <span className="text-gray-500"> = first category in list</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">num_categories</span>
                    <span className="text-gray-500"> = count of categories</span>
                  </div>
                  <div>
                    <span className="text-emerald-400">is_multi_category</span>
                    <span className="text-gray-500"> = num_categories &gt; 1</span>
                  </div>
                  <div className="text-xs text-gray-400 ml-4 mt-1">
                    Multi-category papers signal interdisciplinary research
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <div className="text-gray-300 mb-2">Why these features matter:</div>
                <div className="text-xs text-gray-400 space-y-2">
                  <div>
                    <span className="text-white">Year</span> lets us track how research 
                    topics evolve and identify emerging fields
                  </div>
                  <div>
                    <span className="text-white">Categories</span> provide ground truth 
                    labels for validating our unsupervised clustering
                  </div>
                  <div>
                    <span className="text-white">Multi-category flag</span> helps identify 
                    interdisciplinary bridge areas where fields intersect
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <div className="text-gray-300 mb-2">What we didn't use:</div>
                <div className="text-xs text-gray-400">
                  Title, authors, and journal fields weren't included in the analysis. 
                  While informative, they don't contribute to content-based similarity 
                  or temporal patterns. The abstract text contains the semantic 
                  information we need.
                </div>
              </div>
            </div>
          </ImplementationToggle>
        </div>
      </div>
    </>
  )
}

export default DataOverview