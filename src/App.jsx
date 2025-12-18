import SectionNav from './components/ui/sectionnav'
import Hero from './components/sections/hero'
import Introduction from './components/sections/introduction'
import DataOverview from './components/sections/dataoverview'
import TextPreprocessing from './components/sections/textpreprocessing'
import TfIdf from './components/sections/tfidf'
import DimensionalityReduction from './components/sections/dimensionalityreduction'
import Clustering from './components/sections/clustering'
import Results from './components/sections/results'
import Conclusion from './components/sections/conclusion'

function App() {
  return (
    <main>
      <SectionNav />
      <Hero />
      <Introduction />
      <DataOverview />
      <TextPreprocessing />
      <TfIdf />
      <DimensionalityReduction />
      <Clustering />
      <Results />
      <Conclusion />
    </main>
  )
}

export default App