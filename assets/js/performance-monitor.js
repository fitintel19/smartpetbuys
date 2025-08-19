/**
 * Performance Monitor for SmartPetBuys
 * Comprehensive performance tracking and optimization monitoring
 * Tracks Core Web Vitals, loading metrics, and mobile-specific performance
 * Version: 1.0
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.observers = [];
        this.startTime = performance.now();
        this.connectionInfo = this.getConnectionInfo();
        
        this.init();
    }

    /**
     * Initialize performance monitoring
     */
    init() {
        this.setupCoreWebVitalsMonitoring();
        this.setupResourceTimingMonitoring();
        this.setupUserTimingMonitoring();
        this.setupNavigationMonitoring();
        this.setupErrorMonitoring();
        this.setupMobileSpecificMonitoring();
        
        // Report metrics periodically
        this.scheduleReporting();
    }

    /**
     * Get connection information
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType || 'unknown',
                downlink: conn.downlink || 0,
                rtt: conn.rtt || 0,
                saveData: conn.saveData || false
            };
        }
        return null;
    }

    /**
     * Setup Core Web Vitals monitoring (LCP, FID, CLS)
     */
    setupCoreWebVitalsMonitoring() {
        if (!('PerformanceObserver' in window)) return;

        // Largest Contentful Paint (LCP)
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.lcp = {
                    value: lastEntry.startTime,
                    timestamp: Date.now(),
                    element: lastEntry.element?.tagName || 'unknown',
                    url: lastEntry.url || window.location.href
                };
                
                this.reportMetric('lcp', this.metrics.lcp.value);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(lcpObserver);
        } catch (error) {
            console.warn('LCP monitoring failed:', error);
        }

        // First Input Delay (FID)
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const fidValue = entry.processingStart - entry.startTime;
                    
                    this.metrics.fid = {
                        value: fidValue,
                        timestamp: Date.now(),
                        eventType: entry.name
                    };
                    
                    this.reportMetric('fid', fidValue);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.push(fidObserver);
        } catch (error) {
            console.warn('FID monitoring failed:', error);
        }

        // Cumulative Layout Shift (CLS)
        try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.metrics.cls = {
                    value: clsValue,
                    timestamp: Date.now()
                };
                
                this.reportMetric('cls', clsValue);
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(clsObserver);
        } catch (error) {
            console.warn('CLS monitoring failed:', error);
        }
    }

    /**
     * Setup resource timing monitoring
     */
    setupResourceTimingMonitoring() {
        if (!('PerformanceObserver' in window)) return;

        try {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.analyzeResourceTiming(entry);
                });
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
            this.observers.push(resourceObserver);
        } catch (error) {
            console.warn('Resource timing monitoring failed:', error);
        }
    }

    /**
     * Analyze resource timing entry
     */
    analyzeResourceTiming(entry) {
        const url = new URL(entry.name);
        const resourceType = this.getResourceType(entry);
        
        const timing = {
            name: entry.name,
            type: resourceType,
            duration: entry.duration,
            transferSize: entry.transferSize || 0,
            encodedBodySize: entry.encodedBodySize || 0,
            decodedBodySize: entry.decodedBodySize || 0,
            domainLookupTime: entry.domainLookupEnd - entry.domainLookupStart,
            connectTime: entry.connectEnd - entry.connectStart,
            requestTime: entry.responseStart - entry.requestStart,
            responseTime: entry.responseEnd - entry.responseStart,
            timestamp: Date.now()
        };

        // Store slow resources
        if (timing.duration > 1000) { // Resources taking more than 1 second
            this.metrics.slowResources = this.metrics.slowResources || [];
            this.metrics.slowResources.push(timing);
        }

        // Track font loading specifically
        if (resourceType === 'font') {
            this.metrics.fontLoadTime = this.metrics.fontLoadTime || [];
            this.metrics.fontLoadTime.push({
                url: entry.name,
                duration: timing.duration,
                timestamp: Date.now()
            });
        }

        // Track image loading
        if (resourceType === 'image') {
            this.metrics.imageLoadTime = this.metrics.imageLoadTime || [];
            this.metrics.imageLoadTime.push({
                url: entry.name,
                duration: timing.duration,
                size: timing.transferSize,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Get resource type from performance entry
     */
    getResourceType(entry) {
        if (entry.initiatorType) return entry.initiatorType;
        
        const url = entry.name.toLowerCase();
        if (url.includes('.css')) return 'css';
        if (url.includes('.js')) return 'script';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
        
        return 'other';
    }

    /**
     * Setup user timing monitoring
     */
    setupUserTimingMonitoring() {
        // Mark critical loading milestones
        this.markMilestone('dom-content-loaded');
        
        document.addEventListener('DOMContentLoaded', () => {
            this.markMilestone('dom-content-loaded-complete');
        });
        
        window.addEventListener('load', () => {
            this.markMilestone('window-load-complete');
            this.calculateLoadingMetrics();
        });
    }

    /**
     * Mark performance milestone
     */
    markMilestone(name) {
        if ('performance' in window && performance.mark) {
            try {
                performance.mark(name);
                
                this.metrics.milestones = this.metrics.milestones || {};
                this.metrics.milestones[name] = performance.now();
            } catch (error) {
                console.warn('Failed to mark milestone:', name, error);
            }
        }
    }

    /**
     * Calculate loading metrics
     */
    calculateLoadingMetrics() {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (!navTiming) return;

        this.metrics.loadingTimes = {
            ttfb: navTiming.responseStart - navTiming.requestStart,
            domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.navigationStart,
            windowLoad: navTiming.loadEventEnd - navTiming.navigationStart,
            totalPageLoad: performance.now() - this.startTime,
            timestamp: Date.now()
        };

        // Report critical metrics
        this.reportMetric('ttfb', this.metrics.loadingTimes.ttfb);
        this.reportMetric('dom_content_loaded', this.metrics.loadingTimes.domContentLoaded);
        this.reportMetric('window_load', this.metrics.loadingTimes.windowLoad);
    }

    /**
     * Setup navigation monitoring
     */
    setupNavigationMonitoring() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.metrics.visibilityChanges = this.metrics.visibilityChanges || [];
            this.metrics.visibilityChanges.push({
                hidden: document.hidden,
                timestamp: Date.now()
            });
        });

        // Track scroll depth
        this.setupScrollTracking();
    }

    /**
     * Setup scroll tracking for engagement
     */
    setupScrollTracking() {
        let maxScroll = 0;
        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.metrics.maxScrollDepth = maxScroll;
            }
        };

        window.addEventListener('scroll', trackScroll, { passive: true });
        window.addEventListener('beforeunload', () => {
            this.reportMetric('scroll_depth', maxScroll);
        });
    }

    /**
     * Setup error monitoring
     */
    setupErrorMonitoring() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.metrics.jsErrors = this.metrics.jsErrors || [];
            this.metrics.jsErrors.push({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                timestamp: Date.now()
            });
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.promiseRejections = this.metrics.promiseRejections || [];
            this.metrics.promiseRejections.push({
                reason: event.reason?.toString() || 'Unknown promise rejection',
                timestamp: Date.now()
            });
        });

        // Resource loading errors
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.metrics.resourceErrors = this.metrics.resourceErrors || [];
                this.metrics.resourceErrors.push({
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    /**
     * Setup mobile-specific monitoring
     */
    setupMobileSpecificMonitoring() {
        // Monitor device memory (if available)
        if ('deviceMemory' in navigator) {
            this.metrics.deviceMemory = navigator.deviceMemory;
        }

        // Monitor connection changes
        if (this.connectionInfo && 'connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                const newConnection = this.getConnectionInfo();
                this.metrics.connectionChanges = this.metrics.connectionChanges || [];
                this.metrics.connectionChanges.push({
                    from: this.connectionInfo,
                    to: newConnection,
                    timestamp: Date.now()
                });
                this.connectionInfo = newConnection;
            });
        }

        // Monitor orientation changes
        window.addEventListener('orientationchange', () => {
            this.metrics.orientationChanges = this.metrics.orientationChanges || [];
            this.metrics.orientationChanges.push({
                orientation: screen.orientation?.angle || window.orientation || 0,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Report metric to analytics
     */
    reportMetric(name, value) {
        // Send to Google Analytics if available
        if (window.gtag) {
            gtag('event', name, {
                custom_map: { metric_value: value },
                value: Math.round(value),
                connection_type: this.connectionInfo?.effectiveType || 'unknown',
                device_memory: navigator.deviceMemory || 'unknown'
            });
        }

        // Log for debugging in development
        if (!window.location.href.includes('localhost')) return;
        console.log(`Performance Metric - ${name}:`, value, 'ms');
    }

    /**
     * Schedule periodic reporting
     */
    scheduleReporting() {
        // Report summary every 30 seconds
        setInterval(() => {
            this.reportSummary();
        }, 30000);

        // Report on page unload
        window.addEventListener('beforeunload', () => {
            this.reportFinalMetrics();
        });
    }

    /**
     * Report performance summary
     */
    reportSummary() {
        const summary = {
            lcp: this.metrics.lcp?.value || 0,
            fid: this.metrics.fid?.value || 0,
            cls: this.metrics.cls?.value || 0,
            slowResourcesCount: this.metrics.slowResources?.length || 0,
            jsErrorsCount: this.metrics.jsErrors?.length || 0,
            maxScrollDepth: this.metrics.maxScrollDepth || 0,
            connectionType: this.connectionInfo?.effectiveType || 'unknown',
            timestamp: Date.now()
        };

        // Send summary to analytics
        if (window.gtag) {
            gtag('event', 'performance_summary', {
                custom_map: summary,
                value: 1
            });
        }
    }

    /**
     * Report final metrics on page unload
     */
    reportFinalMetrics() {
        const finalMetrics = {
            totalTime: performance.now() - this.startTime,
            metrics: this.metrics,
            connectionInfo: this.connectionInfo,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        };

        // Use sendBeacon for reliable delivery
        if (navigator.sendBeacon && window.gtag) {
            const data = JSON.stringify(finalMetrics);
            navigator.sendBeacon('/analytics/performance', data);
        }
    }

    /**
     * Get current performance summary
     */
    getPerformanceSummary() {
        return {
            coreWebVitals: {
                lcp: this.metrics.lcp?.value || 'Not measured',
                fid: this.metrics.fid?.value || 'Not measured',
                cls: this.metrics.cls?.value || 'Not measured'
            },
            loadingTimes: this.metrics.loadingTimes || {},
            resourceCounts: {
                slow: this.metrics.slowResources?.length || 0,
                errors: this.metrics.resourceErrors?.length || 0
            },
            engagement: {
                maxScrollDepth: this.metrics.maxScrollDepth || 0,
                visibilityChanges: this.metrics.visibilityChanges?.length || 0
            },
            connection: this.connectionInfo,
            errors: {
                js: this.metrics.jsErrors?.length || 0,
                promises: this.metrics.promiseRejections?.length || 0
            }
        };
    }

    /**
     * Cleanup observers
     */
    cleanup() {
        this.observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (error) {
                console.warn('Failed to disconnect observer:', error);
            }
        });
        this.observers = [];
    }
}

// Initialize performance monitor
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceMonitor = new PerformanceMonitor();
    });
} else {
    window.performanceMonitor = new PerformanceMonitor();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.performanceMonitor) {
        window.performanceMonitor.cleanup();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}