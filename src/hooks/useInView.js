import { useState, useEffect, useRef } from 'react'

export function useInView(ref, threshold = 0.12) {
  const [inView, setInView] = useState(false)
  const thresholdRef = useRef(threshold)

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: thresholdRef.current }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  return inView
}
