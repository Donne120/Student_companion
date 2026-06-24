import { useState, useEffect, useLayoutEffect } from "react"

const MOBILE_BREAKPOINT = 768

// Use this to avoid SSR issues with window
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function useIsMobile() {
  // Start with undefined to prevent incorrect initial renders
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useIsomorphicLayoutEffect(() => {
    // Handle SSR case
    if (typeof window === 'undefined') return

    // Create the media query list
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Use the matches property from the media query
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
    }
    
    // Add event listener using the correct approach based on browser support
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', listener)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener('change', listener)
  }, [])

  // Return false as fallback during SSR instead of undefined
  return isMobile === null ? false : isMobile
}
