import { useState, useEffect } from 'react'

export default function ScrollProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      const scrolled = el.scrollTop || document.body.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? (scrolled / total) * 100 : 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-50 h-0.5"
      style={{
        width: `${pct}%`,
        background: 'linear-gradient(to right, #3b82f6, #10b981)',
        transition: 'width 0.1s ease-out',
      }}
      aria-hidden="true"
    />
  )
}
