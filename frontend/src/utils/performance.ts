/**
 * Performance Monitoring & Optimization Utilities
 * Provides tools for tracking app performance metrics
 */

import React from 'react';

interface PerformanceMetrics {
  route: string;
  component: string;
  renderTime: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;
  private enabled = process.env.NODE_ENV === 'development';

  markStart(component: string): number | undefined {
    if (!this.enabled) return undefined;
    return performance.now();
  }

  markEnd(component: string, startTime: number, route: string = window.location.pathname) {
    if (!this.enabled) return;
    
    const renderTime = performance.now() - startTime;
    
    if (renderTime > 50) {
      this.logMetric({ route, component, renderTime, timestamp: Date.now() });
    }
  }

  private logMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    if (metric.renderTime > 100) {
      console.warn(
        `⚠️ Slow render: ${metric.component} (${metric.renderTime.toFixed(2)}ms) at ${metric.route}`
      );
    }
  }

  getMetrics() {
    return [...this.metrics];
  }

  clear() {
    this.metrics = [];
  }

  getAverageRenderTime(component: string): number {
    const componentMetrics = this.metrics.filter(m => m.component === component);
    if (componentMetrics.length === 0) return 0;
    
    const total = componentMetrics.reduce((sum, m) => sum + m.renderTime, 0);
    return total / componentMetrics.length;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Custom hook to measure component render time
 */
export const useRenderTime = (componentName: string) => {
  const startTimeRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    startTimeRef.current = performanceMonitor.markStart(componentName);
    
    return () => {
      if (startTimeRef.current !== undefined) {
        performanceMonitor.markEnd(componentName, startTimeRef.current);
      }
    };
  }, [componentName]);
};

/**
 * Debounce hook for expensive operations
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement | null>,
  threshold = 0.1
) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold]);

  return isVisible;
};
