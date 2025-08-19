/**
 * Real User Monitoring (RUM) System for SmartPetBuys
 * Task 14: Final Performance Measurement & Monitoring
 * Comprehensive production-ready performance tracking and alerting
 * Version: 1.0
 */

class RealUserMonitoringSystem {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = this.generateUserId();
        this.startTime = performance.now();
        this.metrics = {
            coreWebVitals: {},
            userBehavior: {},
            performance: {},
            errors: [],
            deviceInfo: {},
            networkInfo: {}
        };
        
        this.thresholds = {
            lcp: { good: 2500, needsImprovement: 4000 },
            fid: { good: 100, needsImprovement: 300 },
            cls: { good: 0.1, needsImprovement: 0.25 },
            inp: { good: 200, needsImprovement: 500 },
            ttfb: { good: 800, needsImprovement: 1800 }
        };
        
        this.init();
    }

    /**
     * Initialize RUM system
     */
    init() {
        console.log('🔍 Real User Monitoring System Initialized', {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        });
        
        this.collectDeviceInfo();
        this.collectNetworkInfo();
        this.setupCoreWebVitalsTracking();
        this.setupUserBehaviorTracking();
        this.setupPerformanceTracking();
        this.setupErrorTracking();
        this.setupDataCollection();
        this.scheduleReporting();
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'rum_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate or retrieve user ID
     */
    generateUserId() {
        let userId = localStorage.getItem('rum_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('rum_user_id', userId);
        }
        return userId;
    }

    /**
     * Collect comprehensive device information
     */
    collectDeviceInfo() {
        this.metrics.deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            
            // Screen information
            screenWidth: screen.width,
            screenHeight: screen.height,
            screenColorDepth: screen.colorDepth,
            screenPixelDepth: screen.pixelDepth,
            
            // Viewport information
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            
            // Device capabilities
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            
            // Mobile detection
            isMobile: this.detectMobileDevice(),
            isTablet: this.detectTabletDevice(),
            touchSupported: 'ontouchstart' in window,
            
            // Browser features
            serviceWorkerSupported: 'serviceWorker' in navigator,
            webpSupported: this.detectWebpSupport(),
            intersectionObserverSupported: 'IntersectionObserver' in window,
            
            timestamp: Date.now()
        };
    }

    /**
     * Collect network information
     */
    collectNetworkInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.metrics.networkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
                type: connection.type || 'unknown',
                timestamp: Date.now()
            };
            
            // Monitor connection changes
            connection.addEventListener('change', () => {
                this.updateNetworkInfo();
                this.reportNetworkChange();
            });
        } else {
            this.metrics.networkInfo = {
                effectiveType: 'unknown',
                downlink: 'unknown',
                rtt: 'unknown',
                saveData: false,
                type: 'unknown',
                timestamp: Date.now()
            };
        }
    }

    /**
     * Update network information on change
     */
    updateNetworkInfo() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const newNetworkInfo = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
                type: connection.type || 'unknown',
                timestamp: Date.now()
            };
            
            // Track network change
            this.metrics.networkInfo.changes = this.metrics.networkInfo.changes || [];
            this.metrics.networkInfo.changes.push({
                from: { ...this.metrics.networkInfo },
                to: newNetworkInfo,
                timestamp: Date.now()
            });
            
            this.metrics.networkInfo = { ...this.metrics.networkInfo, ...newNetworkInfo };
        }
    }

    /**
     * Setup Core Web Vitals tracking
     */
    setupCoreWebVitalsTracking() {
        if ('PerformanceObserver' in window) {
            this.trackLCP();
            this.trackFID();
            this.trackCLS();
            this.trackTTFB();
        }
    }

    /**
     * Track Largest Contentful Paint (LCP)
     */
    trackLCP() {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.coreWebVitals.lcp = {
                    value: lastEntry.startTime,
                    element: lastEntry.element?.tagName || 'unknown',
                    elementId: lastEntry.element?.id || 'no-id',
                    url: lastEntry.url || window.location.href,
                    rating: this.rateCoreWebVital('lcp', lastEntry.startTime),
                    timestamp: Date.now()
                };
                
                // Send real-time data for critical metrics
                if (this.metrics.coreWebVitals.lcp.rating === 'poor') {
                    this.sendCriticalMetricAlert('lcp', this.metrics.coreWebVitals.lcp);
                }
                
                this.reportMetric('lcp', this.metrics.coreWebVitals.lcp);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
            console.warn('LCP tracking failed:', error);
        }
    }

    /**
     * Track First Input Delay (FID)
     */
    trackFID() {
        try {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const fidValue = entry.processingStart - entry.startTime;
                    
                    this.metrics.coreWebVitals.fid = {
                        value: fidValue,
                        eventType: entry.name,
                        target: entry.target?.tagName || 'unknown',
                        rating: this.rateCoreWebVital('fid', fidValue),
                        timestamp: Date.now()
                    };
                    
                    this.reportMetric('fid', this.metrics.coreWebVitals.fid);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
            console.warn('FID tracking failed:', error);
        }
    }

    /**
     * Track Cumulative Layout Shift (CLS)
     */
    trackCLS() {
        try {
            let clsValue = 0;
            let clsEntries = [];
            
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push({
                            value: entry.value,
                            sources: entry.sources?.map(source => ({
                                element: source.node?.tagName || 'unknown',
                                elementId: source.node?.id || 'no-id'
                            })) || [],
                            timestamp: Date.now()
                        });
                    }
                });
                
                this.metrics.coreWebVitals.cls = {
                    value: clsValue,
                    rating: this.rateCoreWebVital('cls', clsValue),
                    entries: clsEntries,
                    timestamp: Date.now()
                };
                
                this.reportMetric('cls', this.metrics.coreWebVitals.cls);
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
            console.warn('CLS tracking failed:', error);
        }
    }

    /**
     * Track Time to First Byte (TTFB)
     */
    trackTTFB() {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            const ttfbValue = navTiming.responseStart - navTiming.requestStart;
            
            this.metrics.coreWebVitals.ttfb = {
                value: ttfbValue,
                rating: this.rateCoreWebVital('ttfb', ttfbValue),
                timestamp: Date.now()
            };
            
            this.reportMetric('ttfb', this.metrics.coreWebVitals.ttfb);
        }
    }

    /**
     * Setup user behavior tracking
     */
    setupUserBehaviorTracking() {
        this.trackPageVisibility();
        this.trackScrollBehavior();
        this.trackClickPatterns();
        this.trackFormInteractions();
        this.trackPageTiming();
    }

    /**
     * Track page visibility and focus
     */
    trackPageVisibility() {
        let visibilityChanges = [];
        let focusTime = Date.now();
        let totalEngagementTime = 0;
        
        document.addEventListener('visibilitychange', () => {
            const now = Date.now();
            const change = {
                hidden: document.hidden,
                timestamp: now
            };
            
            if (document.hidden) {
                totalEngagementTime += now - focusTime;
            } else {
                focusTime = now;
            }
            
            visibilityChanges.push(change);
            
            this.metrics.userBehavior.visibility = {
                changes: visibilityChanges,
                totalEngagementTime: totalEngagementTime,
                currentlyHidden: document.hidden,
                timestamp: now
            };
        });
        
        // Track page unload engagement time
        window.addEventListener('beforeunload', () => {
            if (!document.hidden) {
                totalEngagementTime += Date.now() - focusTime;
            }
            
            this.metrics.userBehavior.finalEngagementTime = totalEngagementTime;
        });
    }

    /**
     * Track scroll behavior and depth
     */
    trackScrollBehavior() {
        let maxScrollDepth = 0;
        let scrollEvents = 0;
        let lastScrollTime = 0;
        
        const trackScroll = () => {
            scrollEvents++;
            lastScrollTime = Date.now();
            
            const scrollPercent = Math.round(
                (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
            );
            
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
            }
            
            this.metrics.userBehavior.scroll = {
                maxDepth: maxScrollDepth,
                events: scrollEvents,
                lastScrollTime: lastScrollTime,
                timestamp: Date.now()
            };
        };
        
        // Throttled scroll tracking
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScroll, 100);
        }, { passive: true });
    }

    /**
     * Track click patterns and interactions
     */
    trackClickPatterns() {
        let clicks = [];
        let totalClicks = 0;
        
        document.addEventListener('click', (event) => {
            totalClicks++;
            const clickData = {
                element: event.target.tagName,
                elementId: event.target.id || 'no-id',
                className: event.target.className || 'no-class',
                x: event.clientX,
                y: event.clientY,
                timestamp: Date.now()
            };
            
            clicks.push(clickData);
            
            // Keep only last 50 clicks to prevent memory issues
            if (clicks.length > 50) {
                clicks = clicks.slice(-50);
            }
            
            this.metrics.userBehavior.clicks = {
                total: totalClicks,
                recent: clicks,
                timestamp: Date.now()
            };
        });
    }

    /**
     * Track form interactions
     */
    trackFormInteractions() {
        let formInteractions = [];
        
        document.addEventListener('input', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                formInteractions.push({
                    type: 'input',
                    element: event.target.tagName,
                    inputType: event.target.type || 'unknown',
                    elementId: event.target.id || 'no-id',
                    timestamp: Date.now()
                });
            }
        });
        
        document.addEventListener('submit', (event) => {
            formInteractions.push({
                type: 'submit',
                formId: event.target.id || 'no-id',
                formAction: event.target.action || 'no-action',
                timestamp: Date.now()
            });
        });
        
        this.metrics.userBehavior.forms = formInteractions;
    }

    /**
     * Track page timing metrics
     */
    trackPageTiming() {
        window.addEventListener('load', () => {
            const navTiming = performance.getEntriesByType('navigation')[0];
            const paintTiming = performance.getEntriesByType('paint');
            
            if (navTiming) {
                this.metrics.performance.timing = {
                    navigationStart: navTiming.navigationStart,
                    domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.navigationStart,
                    windowLoad: navTiming.loadEventEnd - navTiming.navigationStart,
                    domComplete: navTiming.domComplete - navTiming.navigationStart,
                    timestamp: Date.now()
                };
                
                // Add paint timing if available
                paintTiming.forEach(paint => {
                    if (paint.name === 'first-contentful-paint') {
                        this.metrics.performance.timing.firstContentfulPaint = paint.startTime;
                    }
                    if (paint.name === 'first-paint') {
                        this.metrics.performance.timing.firstPaint = paint.startTime;
                    }
                });
            }
        });
    }

    /**
     * Setup comprehensive error tracking
     */
    setupErrorTracking() {
        // JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack || 'No stack trace',
                timestamp: Date.now()
            });
        });
        
        // Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise_rejection',
                reason: event.reason?.toString() || 'Unknown promise rejection',
                timestamp: Date.now()
            });
        });
        
        // Resource loading errors
        document.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href || 'unknown',
                    timestamp: Date.now()
                });
            }
        }, true);
    }

    /**
     * Log error with context
     */
    logError(errorInfo) {
        this.metrics.errors.push({
            ...errorInfo,
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.sessionId
        });
        
        // Keep only last 20 errors to prevent memory issues
        if (this.metrics.errors.length > 20) {
            this.metrics.errors = this.metrics.errors.slice(-20);
        }
        
        // Send critical errors immediately
        this.sendErrorReport(errorInfo);
    }

    /**
     * Setup data collection and batching
     */
    setupDataCollection() {
        // Collect resource timing
        this.collectResourceTiming();
        
        // Setup periodic data collection
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 30000); // Every 30 seconds
    }

    /**
     * Collect resource timing data
     */
    collectResourceTiming() {
        const resources = performance.getEntriesByType('resource');
        const resourceMetrics = {
            total: resources.length,
            byType: {},
            slowResources: [],
            largeResources: [],
            timestamp: Date.now()
        };
        
        resources.forEach(resource => {
            const type = resource.initiatorType || 'unknown';
            resourceMetrics.byType[type] = (resourceMetrics.byType[type] || 0) + 1;
            
            // Track slow resources (>2s)
            if (resource.duration > 2000) {
                resourceMetrics.slowResources.push({
                    name: resource.name,
                    type: type,
                    duration: resource.duration,
                    size: resource.transferSize || 0
                });
            }
            
            // Track large resources (>1MB)
            if (resource.transferSize > 1024 * 1024) {
                resourceMetrics.largeResources.push({
                    name: resource.name,
                    type: type,
                    size: resource.transferSize
                });
            }
        });
        
        this.metrics.performance.resources = resourceMetrics;
    }

    /**
     * Collect current performance metrics
     */
    collectPerformanceMetrics() {
        // Memory usage
        if ('memory' in performance) {
            this.metrics.performance.memory = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };
        }
        
        // Connection info
        this.collectNetworkInfo();
    }

    /**
     * Rate Core Web Vital metric
     */
    rateCoreWebVital(metric, value) {
        const threshold = this.thresholds[metric];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Detect mobile device
     */
    detectMobileDevice() {
        return window.innerWidth <= 768 || 
               /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Detect tablet device
     */
    detectTabletDevice() {
        return /iPad|Android.*Tablet|Windows.*Touch/i.test(navigator.userAgent) && 
               window.innerWidth >= 768;
    }

    /**
     * Detect WebP support
     */
    detectWebpSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('webp') !== -1;
    }

    /**
     * Schedule regular reporting
     */
    scheduleReporting() {
        // Send data every 5 minutes
        setInterval(() => {
            this.sendPerformanceReport();
        }, 5 * 60 * 1000);
        
        // Send final report on page unload
        window.addEventListener('beforeunload', () => {
            this.sendFinalReport();
        });
        
        // Send report on visibility change (going to background)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.sendPerformanceReport();
            }
        });
    }

    /**
     * Report individual metric
     */
    reportMetric(metricName, metricData) {
        // Send to Google Analytics if available
        if (window.gtag) {
            gtag('event', 'rum_metric', {
                metric_name: metricName,
                metric_value: metricData.value,
                metric_rating: metricData.rating,
                session_id: this.sessionId,
                device_type: this.metrics.deviceInfo.isMobile ? 'mobile' : 'desktop',
                connection_type: this.metrics.networkInfo.effectiveType
            });
        }
    }

    /**
     * Send critical metric alert
     */
    sendCriticalMetricAlert(metric, data) {
        const alertData = {
            type: 'critical_performance',
            metric: metric,
            data: data,
            sessionInfo: {
                sessionId: this.sessionId,
                userId: this.userId,
                url: window.location.href,
                deviceInfo: this.metrics.deviceInfo,
                networkInfo: this.metrics.networkInfo
            },
            timestamp: Date.now()
        };
        
        // Send immediately
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/rum/alerts', JSON.stringify(alertData));
        }
        
        console.warn(`🚨 Critical Performance Alert [${metric}]:`, data);
    }

    /**
     * Send error report
     */
    sendErrorReport(errorInfo) {
        const errorReport = {
            type: 'error',
            error: errorInfo,
            sessionInfo: {
                sessionId: this.sessionId,
                userId: this.userId,
                url: window.location.href,
                deviceInfo: this.metrics.deviceInfo,
                networkInfo: this.metrics.networkInfo
            },
            timestamp: Date.now()
        };
        
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/rum/errors', JSON.stringify(errorReport));
        }
    }

    /**
     * Send comprehensive performance report
     */
    sendPerformanceReport() {
        const report = {
            type: 'performance_report',
            sessionId: this.sessionId,
            userId: this.userId,
            metrics: this.metrics,
            reportTimestamp: Date.now(),
            sessionDuration: Date.now() - this.startTime
        };
        
        // Send to analytics
        if (window.gtag) {
            gtag('event', 'rum_report', {
                session_id: this.sessionId,
                session_duration: report.sessionDuration,
                lcp_value: this.metrics.coreWebVitals.lcp?.value || 0,
                cls_value: this.metrics.coreWebVitals.cls?.value || 0,
                fid_value: this.metrics.coreWebVitals.fid?.value || 0,
                errors_count: this.metrics.errors.length,
                device_type: this.metrics.deviceInfo.isMobile ? 'mobile' : 'desktop'
            });
        }
        
        // Send detailed report
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/rum/reports', JSON.stringify(report));
        }
        
        console.log('📊 RUM Performance Report Sent:', {
            sessionId: this.sessionId,
            duration: report.sessionDuration,
            metrics: Object.keys(this.metrics)
        });
    }

    /**
     * Send final session report
     */
    sendFinalReport() {
        const finalReport = {
            type: 'session_end',
            sessionId: this.sessionId,
            userId: this.userId,
            finalMetrics: this.metrics,
            sessionDuration: Date.now() - this.startTime,
            timestamp: Date.now()
        };
        
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/rum/session-end', JSON.stringify(finalReport));
        }
    }

    /**
     * Report network change
     */
    reportNetworkChange() {
        if (this.metrics.networkInfo.changes && this.metrics.networkInfo.changes.length > 0) {
            const latestChange = this.metrics.networkInfo.changes[this.metrics.networkInfo.changes.length - 1];
            
            if (window.gtag) {
                gtag('event', 'network_change', {
                    from_type: latestChange.from.effectiveType,
                    to_type: latestChange.to.effectiveType,
                    session_id: this.sessionId
                });
            }
        }
    }

    /**
     * Get current performance summary
     */
    getPerformanceSummary() {
        return {
            sessionId: this.sessionId,
            sessionDuration: Date.now() - this.startTime,
            coreWebVitals: this.metrics.coreWebVitals,
            deviceInfo: this.metrics.deviceInfo,
            networkInfo: this.metrics.networkInfo,
            errors: this.metrics.errors.length,
            userBehavior: {
                maxScrollDepth: this.metrics.userBehavior.scroll?.maxDepth || 0,
                totalClicks: this.metrics.userBehavior.clicks?.total || 0,
                engagementTime: this.metrics.userBehavior.visibility?.totalEngagementTime || 0
            }
        };
    }
}

// Initialize Real User Monitoring
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.rumSystem = new RealUserMonitoringSystem();
    });
} else {
    window.rumSystem = new RealUserMonitoringSystem();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealUserMonitoringSystem;
}