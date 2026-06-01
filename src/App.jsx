import SectionNav from './components/ui/sectionnav'
import ScrollProgress from './components/ui/scrollprogress'
import Hero from './components/sections/hero'
import LibraryExplorer from './components/sections/libraryexplorer'
import Introduction from './components/sections/introduction'
import DataOverview from './components/sections/dataoverview'
import TextPreprocessing from './components/sections/textpreprocessing'
import TfIdf from './components/sections/tfidf'
import DimensionalityReduction from './components/sections/dimensionalityreduction'
import Clustering from './components/sections/clustering'
import Results from './components/sections/results'
import ClusterMap from './components/sections/clustermap'

function App() {
  return (
    <main>
      <ScrollProgress />
      <SectionNav />
      <Hero />
      <LibraryExplorer />
      <Introduction />
      <DataOverview />
      <TextPreprocessing />
      <TfIdf />
      <DimensionalityReduction />
      <Clustering />
      <Results />
      <ClusterMap />
    </main>
  )
}

export default App