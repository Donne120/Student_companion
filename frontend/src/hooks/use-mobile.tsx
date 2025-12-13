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
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange)
    } else {
      // For older browsers
      mql.addListener(handleChange as (e: MediaQueryList) => void)
    }
    
    // Set initial value
    handleChange(mql)
    
    // Clean up
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleChange)
      } else {
        // For older browsers
        mql.removeListener(handleChange as (e: MediaQueryList) => void)
      }
    }
  }, [])

  // Return false as fallback during SSR instead of undefined
  return isMobile === null ? false : isMobile
}
