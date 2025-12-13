// Performance monitoring utilities
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

// Send metrics to analytics or console
function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify(metric);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('📊 Web Vital:', metric.name, metric.value);
  }
  
  // In production, send to your analytics endpoint
  if (import.meta.env.PROD) {
    // Example: Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
    
    // Or send to your own endpoint
    const url = '/api/analytics';
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { body, method: 'POST', keepalive: true });
    }
  }
}

// Initialize web vitals monitoring
export function initPerformanceMonitoring() {
  onCLS(sendToAnalytics);  // Cumulative Layout Shift
  onFID(sendToAnalytics);  // First Input Delay
  onFCP(sendToAnalytics);  // First Contentful Paint
  onLCP(sendToAnalytics);  // Largest Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}

// Custom performance markers
export const performanceMarkers = {
  markStart: (name: string) => {
    performance.mark(`${name}-start`);
  },
  
  markEnd: (name: string) => {
    performance.mark(`${name}-end`);
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name)[0];
      if (import.meta.env.DEV) {
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
      }
    } catch (e) {
      // Ignore errors
    }
  },
  
  // Measure component render time
  measureRender: (componentName: string, callback: () => void) => {
    performanceMarkers.markStart(componentName);
    callback();
    performanceMarkers.markEnd(componentName);
  }
};

// Monitor long tasks
export function monitorLongTasks() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('⚠️ Long task detected:', entry.duration.toFixed(2), 'ms');
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Long task API not supported
    }
  }
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}


