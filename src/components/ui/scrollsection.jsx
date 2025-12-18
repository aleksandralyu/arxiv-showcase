import { Scrollama, Step } from 'react-scrollama'
import React, { useState } from 'react'

function ScrollSection({ 
  id,
  title, 
  subtitle,
  steps,
  backgroundColor = 'bg-gray-900' 
}) {
  const [currentStep, setCurrentStep] = useState(0)

  const onStepEnter = ({ data }) => {
    setCurrentStep(data)
  }

  return (
    <section id={id} className={`${backgroundColor} text-white`}>
      {/* Section header */}
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
        {subtitle && (
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>

      {/* Scrollytelling container */}
      <div className="flex">
        
        {/* LEFT: Sticky visual */}
        <div className="hidden md:flex w-1/2 sticky top-0 h-screen items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-lg">
            {steps[currentStep]?.visual}
          </div>
        </div>

        {/* RIGHT: Scrolling text steps */}
        <div className="w-full md:w-1/2">
          <Scrollama onStepEnter={onStepEnter} offset={0.5}>
            {steps.map((step, index) => (
              <Step data={index} key={index}>
                <div className="min-h-screen flex items-center px-6 md:px-10 lg:px-14">
                  <div 
                    className={`w-full max-w-md mx-auto transition-all duration-500 ${
                      currentStep === index 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-15 translate-y-4'
                    }`}
                  >
                    {/* Mobile: show visual above text */}
                    <div className="md:hidden mb-8">
                      {step.visual}
                    </div>
                    
                    {/* Step text content */}
                    <div className="text-lg leading-relaxed text-gray-300">
                      {step.text}
                    </div>
                  </div>
                </div>
              </Step>
            ))}
          </Scrollama>
        </div>
      </div>
    </section>
  )
}

export default ScrollSection