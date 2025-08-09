// Performance monitoring utilities
import React from 'react';

export interface PerformanceMetrics {
  pageLoadTime: number;
  timeToFirstByte: number;
  timeToInteractive: number;
  bundleSize: number;
  memoryUsage: number;
  renderTime: number;
}

export interface ComponentMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordNavigationMetrics(navEntry);
          }
        });
      });

      try {
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);
      } catch (error) {
        console.warn('Navigation timing not supported:', error);
      }

      // Monitor paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'paint') {
            this.recordPaintMetrics(entry);
          }
        });
      });

      try {
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.warn('Paint timing not supported:', error);
      }
    }
  }

  private recordNavigationMetrics(navEntry: PerformanceNavigationTiming) {
    const metrics = {
      pageLoadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
      timeToFirstByte: navEntry.responseStart - navEntry.requestStart,
      timeToInteractive: navEntry.domInteractive - navEntry.fetchStart,
      bundleSize: this.getBundleSize(),
      memoryUsage: this.getMemoryUsage(),
      renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
    };

    console.log('Navigation Performance Metrics:', metrics);
    this.sendMetricsToAnalytics(metrics);
  }

  private recordPaintMetrics(paintEntry: PerformanceEntry) {
    console.log('Paint Performance:', {
      name: paintEntry.name,
      startTime: paintEntry.startTime,
      duration: paintEntry.duration,
    });
  }

  private getBundleSize(): number {
    // This would be calculated based on actual bundle analysis
    // For now, return an estimated size
    return 779; // KB (from our build output)
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  private sendMetricsToAnalytics(metrics: PerformanceMetrics) {
    // In production, send to analytics service
    // Example: Analytics.track('performance_metrics', metrics);
    console.log('Sending performance metrics to analytics:', metrics);
  }

  // Component performance tracking
  trackComponent(componentName: string, renderTime: number, mountTime: number) {
    const existing = this.metrics.get(componentName) || {
      componentName,
      renderTime: 0,
      mountTime: 0,
      updateCount: 0,
    };

    existing.renderTime = Math.max(existing.renderTime, renderTime);
    existing.mountTime = Math.max(existing.mountTime, mountTime);
    existing.updateCount++;

    this.metrics.set(componentName, existing);

    // Log slow components
    if (renderTime > 16) { // 60fps threshold
      console.warn(`Slow component detected: ${componentName} took ${renderTime}ms to render`);
    }
  }

  // Get performance report
  getPerformanceReport(): ComponentMetrics[] {
    return Array.from(this.metrics.values());
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React performance hooks
export const usePerformanceTracking = (componentName: string) => {
  const startTime = performance.now();

  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    const mountTime = endTime - startTime;

    performanceMonitor.trackComponent(componentName, renderTime, mountTime);
  });

  return {
    trackRender: () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceMonitor.trackComponent(componentName, renderTime, 0);
    },
  };
};

// Bundle size monitoring
export const getBundleSize = (): number => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && resource.name.includes('index-')
    );
    
    return jsResources.reduce((total, resource) => {
      return total + ((resource as any).transferSize || 0);
    }, 0) / 1024; // Convert to KB
  }
  
  return 0;
};

// Memory usage monitoring
export const getMemoryUsage = (): {
  used: number;
  total: number;
  limit: number;
} => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize / 1024 / 1024, // MB
      total: memory.totalJSHeapSize / 1024 / 1024, // MB
      limit: memory.jsHeapSizeLimit / 1024 / 1024, // MB
    };
  }
  
  return { used: 0, total: 0, limit: 0 };
};

// Network performance monitoring
export const getNetworkInfo = (): {
  effectiveType: string;
  downlink: number;
  rtt: number;
} => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
    };
  }
  
  return { effectiveType: 'unknown', downlink: 0, rtt: 0 };
};

// Performance budget checking
export const checkPerformanceBudget = (metrics: PerformanceMetrics): {
  passed: boolean;
  violations: string[];
} => {
  const violations: string[] = [];
  
  if (metrics.pageLoadTime > 3000) {
    violations.push('Page load time exceeds 3s budget');
  }
  
  if (metrics.timeToFirstByte > 600) {
    violations.push('Time to first byte exceeds 600ms budget');
  }
  
  if (metrics.bundleSize > 500) {
    violations.push('Bundle size exceeds 500KB budget');
  }
  
  if (metrics.memoryUsage > 50) {
    violations.push('Memory usage exceeds 50MB budget');
  }
  
  return {
    passed: violations.length === 0,
    violations,
  };
}; 