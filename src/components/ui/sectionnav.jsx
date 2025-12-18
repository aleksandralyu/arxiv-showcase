import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Section Navigation Dots - Shows progress through the page
// Hidden during Hero, visible for all other sections

export default function SectionNav() {
  const [currentSection, setCurrentSection] = useState(0)
  const [sections, setSections] = useState([])
  const [isVisible, setIsVisible] = useState(false)  // Start hidden
  const observerRef = useRef(null)
  const heroObserverRef = useRef(null)

  // Section definitions matching App.jsx order
  const sectionConfig = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'data-overview', label: 'Data Overview' },
    { id: 'text-preprocessing', label: 'Preprocessing' },
    { id: 'tfidf', label: 'TF-IDF' },
    { id: 'dimensionality-reduction', label: 'Dim Reduction' },
    { id: 'clustering', label: 'Clustering' },
    { id: 'results', label: 'Results' },
    { id: 'conclusion', label: 'Conclusion' },
  ]

  useEffect(() => {
    // Watch hero section to hide/show nav
    const heroElement = document.getElementById('hero') || 
                        document.querySelector('[data-section="hero"]') ||
                        document.querySelector('section:first-of-type')
    
    if (heroElement) {
      heroObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            // Hide nav when hero is more than 50% visible
            setIsVisible(!entry.isIntersecting || entry.intersectionRatio < 0.5)
          })
        },
        { threshold: [0, 0.5, 1] }
      )
      heroObserverRef.current.observe(heroElement)
    }

    // Find all sections in the DOM
    const sectionElements = sectionConfig
      .map(config => {
        const el = document.getElementById(config.id) || 
                   document.querySelector(`[data-section="${config.id}"]`)
        return el ? { ...config, element: el } : null
      })
      .filter(Boolean)

    setSections(sectionElements)

    if (sectionElements.length === 0) return

    // Set up intersection observer for sections
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let bestIndex = currentSection
        let bestScore = -1

        sectionElements.forEach((section, index) => {
          const rect = section.element.getBoundingClientRect()
          const viewportHeight = window.innerHeight
          
          const visibleTop = Math.max(0, rect.top)
          const visibleBottom = Math.min(viewportHeight, rect.bottom)
          const visibleHeight = Math.max(0, visibleBottom - visibleTop)
          
          const topProximity = rect.top >= -100 && rect.top < viewportHeight * 0.5
          const score = visibleHeight + (topProximity ? 1000 : 0)
          
          if (score > bestScore && visibleHeight > 50) {
            bestScore = score
            bestIndex = index
          }
        })

        setCurrentSection(bestIndex)
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px 0px -20% 0px'
      }
    )

    sectionElements.forEach(section => {
      observerRef.current.observe(section.element)
    })

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
      if (heroObserverRef.current) heroObserverRef.current.disconnect()
    }
  }, [])

  const handleDotClick = (index) => {
    if (sections[index]?.element) {
      sections[index].element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // Don't render if no sections found
  if (sections.length === 0) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed right-8 top-1/4 z-50 flex flex-col items-end gap-3"
        >
          {sectionConfig.map((section, index) => {
            const sectionExists = sections.some(s => s.id === section.id)
            if (!sectionExists) return null
            
            const actualIndex = sections.findIndex(s => s.id === section.id)
            const isActive = actualIndex === currentSection
            const isPast = actualIndex < currentSection
            
            return (
              <button
                key={section.id}
                onClick={() => handleDotClick(actualIndex)}
                className="flex items-center gap-3 group"
                aria-label={`Go to ${section.label}`}
              >
                {/* Label */}
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0,
                    x: isActive ? 0 : 10
                  }}
                  className="text-xs text-gray-400 font-medium whitespace-nowrap pointer-events-none group-hover:opacity-100"
                >
                  {section.label}
                </motion.span>

                {/* Dot */}
                <motion.div
                  animate={{
                    width: isActive ? 12 : 8,
                    height: isActive ? 12 : 8,
                    backgroundColor: isActive 
                      ? '#3b82f6' 
                      : isPast 
                        ? '#6b7280' 
                        : '#374151'
                  }}
                  transition={{ duration: 0.2 }}
                  className="rounded-full cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    boxShadow: isActive ? '0 0 8px rgba(59, 130, 246, 0.5)' : 'none'
                  }}
                />
              </button>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  )
}