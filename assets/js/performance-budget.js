/**
 * Performance Budget Monitor for SmartPetBuys
 * Mobile-first performance budget enforcement and alerting system
 * Monitors Core Web Vitals, resource sizes, and performance thresholds
 * Version: 1.0
 */

class PerformanceBudgetMonitor {
    constructor() {
        this.budgets = this.getMobileBudgets();
        this.violations = [];
        this.metrics = {
            coreWebVitals: {},
            resources: {},
            timing: {}
        };
        
        this.isMobile = this.detectMobile();
        this.isProduction = !window.location.hostname.includes('localhost');
        
        this.init();
    }

    /**
     * Initialize performance budget monitoring
     */
    init() {
        this.setupBudgetMonitoring();
        this.setupResourceMonitoring();
        this.setupCoreWebVitalsMonitoring();
        this.setupAlertSystem();
        this.scheduleReporting();
        
        console.log('📊 Performance Budget Monitor initialized', {
            budgets: this.budgets,
            mobile: this.isMobile,
            production: this.isProduction
        });
    }

    /**
     * Get mobile-optimized performance budgets
     */
    getMobileBudgets() {
        const isMobile = this.detectMobile();
        
        return {
            // Core Web Vitals thresholds (Google "Good" ratings)
            coreWebVitals: {
                lcp: 2500,  // Largest Contentful Paint: 2.5s
                fid: 100,   // First Input Delay: 100ms
                cls: 0.1,   // Cumulative Layout Shift: 0.1
                inp: 200    // Interaction to Next Paint: 200ms (future CWV)
            },
            
            // Resource size budgets (mobile-first)
            resources: {
                totalPageSize: isMobile ? 1000000 : 2000000,      // 1MB mobile, 2MB desktop
                totalJavaScript: isMobile ? 300000 : 500000,      // 300KB mobile, 500KB desktop
                totalCSS: isMobile ? 100000 : 200000,             // 100KB mobile, 200KB desktop
                totalImages: isMobile ? 500000 : 1000000,         // 500KB mobile, 1MB desktop
                totalFonts: isMobile ? 100000 : 200000,           // 100KB mobile, 200KB desktop
                maxSingleResource: isMobile ? 200000 : 300000,    // 200KB mobile, 300KB desktop
                maxImageSize: isMobile ? 150000 : 250000          // 150KB mobile, 250KB desktop
            },
            
            // Timing budgets
            timing: {
                domContentLoaded: isMobile ? 2000 : 1500,         // 2s mobile, 1.5s desktop
                windowLoad: isMobile ? 4000 : 3000,               // 4s mobile, 3s desktop
                timeToFirstByte: 800,                             // 800ms TTFB
                firstContentfulPaint: 1800,                       // 1.8s FCP
                timeToInteractive: isMobile ? 5000 : 3500         // 5s mobile, 3.5s desktop
            },
            
            // Network and performance thresholds
            network: {
                maxRequests: isMobile ? 50 : 75,                  // Max HTTP requests
                maxDomains: 10,                                   // Max external domains
                maxRedirects: 3                                   // Max redirect chain length
            }
        };
    }

    /**
     * Detect mobile device
     */
    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Setup comprehensive budget monitoring
     */
    setupBudgetMonitoring() {
        // Monitor page load completion
        if (document.readyState === 'complete') {
            this.checkInitialBudgets();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.checkInitialBudgets(), 1000);
            });
        }

        // Monitor throughout session
        setInterval(() => {
            this.checkContinuousBudgets();
        }, 30000); // Check every 30 seconds

        // Final check on page unload
        window.addEventListener('beforeunload', () => {
            this.generateFinalReport();
        });
    }

    /**
     * Setup resource monitoring
     */
    setupResourceMonitoring() {
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.analyzeResourceEntry(entry);
                });
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
        }
    }

    /**
     * Setup Core Web Vitals monitoring
     */
    setupCoreWebVitalsMonitoring() {
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.checkCoreWebVital('lcp', lastEntry.startTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const fidValue = entry.processingStart - entry.startTime;
                    this.checkCoreWebVital('fid', fidValue);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.checkCoreWebVital('cls', clsValue);
                    }
                });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    /**
     * Analyze resource performance entry
     */
    analyzeResourceEntry(entry) {
        const resourceData = {
            name: entry.name,
            type: this.getResourceType(entry),
            size: entry.transferSize || 0,
            duration: entry.duration || 0,
            startTime: entry.startTime || 0
        };

        // Update resource totals
        this.updateResourceTotals(resourceData);

        // Check individual resource size
        this.checkResourceSize(resourceData);

        // Check resource loading time
        this.checkResourceTiming(resourceData);
    }

    /**
     * Get resource type from performance entry
     */
    getResourceType(entry) {
        if (entry.initiatorType) return entry.initiatorType;
        
        const url = entry.name.toLowerCase();
        if (url.includes('.js')) return 'script';
        if (url.includes('.css')) return 'stylesheet';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
        return 'other';
    }

    /**
     * Update resource totals
     */
    updateResourceTotals(resourceData) {
        if (!this.metrics.resources.totals) {
            this.metrics.resources.totals = {
                totalPageSize: 0,
                totalJavaScript: 0,
                totalCSS: 0,
                totalImages: 0,
                totalFonts: 0,
                requestCount: 0,
                domains: new Set()
            };
        }

        const totals = this.metrics.resources.totals;
        const { type, size, name } = resourceData;

        totals.totalPageSize += size;
        totals.requestCount++;
        
        try {
            const domain = new URL(name).hostname;
            totals.domains.add(domain);
        } catch (e) {
            // Invalid URL, skip domain tracking
        }

        switch (type) {
            case 'script':
                totals.totalJavaScript += size;
                break;
            case 'stylesheet':
                totals.totalCSS += size;
                break;
            case 'image':
                totals.totalImages += size;
                break;
            case 'font':
                totals.totalFonts += size;
                break;
        }

        // Check totals against budgets
        this.checkResourceTotals();
    }

    /**
     * Check resource totals against budgets
     */
    checkResourceTotals() {
        const totals = this.metrics.resources.totals;
        const budgets = this.budgets.resources;

        // Check each total against budget
        Object.keys(budgets).forEach(budgetKey => {
            if (budgetKey === 'maxSingleResource' || budgetKey === 'maxImageSize') return;
            
            let actualValue = totals[budgetKey];
            if (budgetKey === 'maxDomains') {
                actualValue = totals.domains.size;
            } else if (budgetKey === 'maxRequests') {
                actualValue = totals.requestCount;
            }

            if (actualValue > budgets[budgetKey]) {
                this.reportBudgetViolation('resource_total', {
                    type: budgetKey,
                    actual: actualValue,
                    budget: budgets[budgetKey],
                    overagePercentage: Math.round(((actualValue - budgets[budgetKey]) / budgets[budgetKey]) * 100)
                });
            }
        });
    }

    /**
     * Check individual resource size
     */
    checkResourceSize(resourceData) {
        const { type, size, name } = resourceData;
        const budgets = this.budgets.resources;

        // Check max single resource size
        if (size > budgets.maxSingleResource) {
            this.reportBudgetViolation('single_resource', {
                type: 'large_resource',
                resource: name,
                resourceType: type,
                actual: size,
                budget: budgets.maxSingleResource,
                overageBytes: size - budgets.maxSingleResource
            });
        }

        // Check max image size
        if (type === 'image' && size > budgets.maxImageSize) {
            this.reportBudgetViolation('single_resource', {
                type: 'large_image',
                resource: name,
                actual: size,
                budget: budgets.maxImageSize,
                overageBytes: size - budgets.maxImageSize
            });
        }
    }

    /**
     * Check resource loading timing
     */
    checkResourceTiming(resourceData) {
        const { duration, name, type } = resourceData;
        
        // Define timing thresholds by resource type
        const timingThresholds = {
            script: this.isMobile ? 3000 : 2000,
            stylesheet: this.isMobile ? 2000 : 1000,
            image: this.isMobile ? 5000 : 3000,
            font: this.isMobile ? 3000 : 2000
        };

        const threshold = timingThresholds[type];
        if (threshold && duration > threshold) {
            this.reportBudgetViolation('resource_timing', {
                type: 'slow_resource',
                resource: name,
                resourceType: type,
                actual: duration,
                threshold: threshold,
                slowness: duration - threshold
            });
        }
    }

    /**
     * Check Core Web Vital against budget
     */
    checkCoreWebVital(metric, value) {
        this.metrics.coreWebVitals[metric] = value;
        const budget = this.budgets.coreWebVitals[metric];

        if (value > budget) {
            this.reportBudgetViolation('core_web_vital', {
                metric: metric.toUpperCase(),
                actual: value,
                budget: budget,
                rating: this.getCoreWebVitalRating(metric, value),
                overagePercentage: Math.round(((value - budget) / budget) * 100)
            });
        }
    }

    /**
     * Get Core Web Vital rating
     */
    getCoreWebVitalRating(metric, value) {
        const thresholds = {
            lcp: { good: 2500, needsImprovement: 4000 },
            fid: { good: 100, needsImprovement: 300 },
            cls: { good: 0.1, needsImprovement: 0.25 },
            inp: { good: 200, needsImprovement: 500 }
        };

        const threshold = thresholds[metric];
        if (!threshold) return 'unknown';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Check initial budgets after page load
     */
    checkInitialBudgets() {
        this.checkNavigationTiming();
        this.checkInitialResourceMetrics();
        this.generateInitialReport();
    }

    /**
     * Check navigation timing against budgets
     */
    checkNavigationTiming() {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (!navTiming) return;

        const timingMetrics = {
            timeToFirstByte: navTiming.responseStart - navTiming.requestStart,
            domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.navigationStart,
            windowLoad: navTiming.loadEventEnd - navTiming.navigationStart
        };

        // Get paint timing
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
                timingMetrics.firstContentfulPaint = entry.startTime;
            }
        });

        // Check each timing against budget
        Object.keys(timingMetrics).forEach(metric => {
            const value = timingMetrics[metric];
            const budget = this.budgets.timing[metric];
            
            if (budget && value > budget) {
                this.reportBudgetViolation('timing', {
                    metric: metric,
                    actual: value,
                    budget: budget,
                    overageMs: value - budget
                });
            }
        });

        this.metrics.timing = timingMetrics;
    }

    /**
     * Check initial resource metrics
     */
    checkInitialResourceMetrics() {
        const resources = performance.getEntriesByType('resource');
        
        // Analyze all resources loaded so far
        resources.forEach(entry => {
            this.analyzeResourceEntry(entry);
        });
    }

    /**
     * Check continuous budgets during session
     */
    checkContinuousBudgets() {
        // Check memory usage if available
        this.checkMemoryUsage();
        
        // Check for performance degradation
        this.checkPerformanceDegradation();
    }

    /**
     * Check memory usage against thresholds
     */
    checkMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
            
            // Alert if using more than 75% of available memory
            if (usageRatio > 0.75) {
                this.reportBudgetViolation('memory', {
                    type: 'high_memory_usage',
                    usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                    totalMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
                    usagePercentage: Math.round(usageRatio * 100)
                });
            }
        }
    }

    /**
     * Check for performance degradation over time
     */
    checkPerformanceDegradation() {
        // Monitor frame rate drops
        this.checkFrameRate();
        
        // Monitor long tasks
        this.checkLongTasks();
    }

    /**
     * Check frame rate for smooth interactions
     */
    checkFrameRate() {
        let lastTime = performance.now();
        let frameCount = 0;
        let lowFrameRateCount = 0;

        const checkFrame = (currentTime) => {
            const deltaTime = currentTime - lastTime;
            frameCount++;
            
            // Calculate FPS
            const fps = 1000 / deltaTime;
            
            // Count frames below 30 FPS as poor performance
            if (fps < 30) {
                lowFrameRateCount++;
            }
            
            // Report if more than 10% of frames are low FPS
            if (frameCount >= 100) {
                const lowFrameRatePercentage = (lowFrameRateCount / frameCount) * 100;
                if (lowFrameRatePercentage > 10) {
                    this.reportBudgetViolation('performance', {
                        type: 'low_frame_rate',
                        averageFPS: Math.round(1000 / (deltaTime / frameCount)),
                        lowFrameRatePercentage: Math.round(lowFrameRatePercentage)
                    });
                }
                
                // Reset counters
                frameCount = 0;
                lowFrameRateCount = 0;
            }
            
            lastTime = currentTime;
            requestAnimationFrame(checkFrame);
        };

        requestAnimationFrame(checkFrame);
    }

    /**
     * Check for long tasks that block the main thread
     */
    checkLongTasks() {
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.reportBudgetViolation('performance', {
                            type: 'long_task',
                            duration: entry.duration,
                            startTime: entry.startTime,
                            attribution: entry.attribution || []
                        });
                    });
                });
                
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (error) {
                // Long task API not supported, silently continue
            }
        }
    }

    /**
     * Report budget violation
     */
    reportBudgetViolation(category, details) {
        const violation = {
            id: `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            category: category,
            details: details,
            deviceInfo: {
                isMobile: this.isMobile,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                userAgent: navigator.userAgent,
                connection: this.getConnectionInfo()
            }
        };

        this.violations.push(violation);

        // Log violation
        console.warn(`🚨 Performance Budget Violation [${category}]:`, details);

        // Send to analytics if in production
        if (this.isProduction && window.gtag) {
            gtag('event', 'performance_budget_violation', {
                violation_category: category,
                violation_type: details.type || 'unknown',
                custom_map: details,
                value: details.actual || 1
            });
        }

        // Show visual alert in development
        if (!this.isProduction) {
            this.showDevelopmentAlert(violation);
        }

        // Trigger alerts if severity is high
        this.checkViolationSeverity(violation);
    }

    /**
     * Get connection information
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType || 'unknown',
                downlink: conn.downlink || 'unknown',
                rtt: conn.rtt || 'unknown',
                saveData: conn.saveData || false
            };
        }
        return null;
    }

    /**
     * Show development alert for budget violations
     */
    showDevelopmentAlert(violation) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'performance-budget-alert';
        alertDiv.innerHTML = `
            <strong>Performance Budget Violation</strong><br>
            ${violation.category}: ${violation.details.type || 'Unknown'}<br>
            <small>${JSON.stringify(violation.details, null, 2)}</small>
        `;
        
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
            font-family: monospace;
            z-index: 10000;
            max-width: 300px;
            word-break: break-word;
        `;

        document.body.appendChild(alertDiv);

        // Remove after 10 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 10000);
    }

    /**
     * Check violation severity and trigger appropriate alerts
     */
    checkViolationSeverity(violation) {
        const severity = this.calculateViolationSeverity(violation);
        
        if (severity === 'high') {
            this.triggerHighSeverityAlert(violation);
        } else if (severity === 'medium') {
            this.triggerMediumSeverityAlert(violation);
        }
    }

    /**
     * Calculate violation severity
     */
    calculateViolationSeverity(violation) {
        const { category, details } = violation;
        
        // High severity criteria
        if (category === 'core_web_vital' && details.rating === 'poor') return 'high';
        if (category === 'timing' && details.overageMs > 2000) return 'high';
        if (category === 'single_resource' && details.overageBytes > 500000) return 'high';
        if (category === 'memory' && details.usagePercentage > 90) return 'high';
        
        // Medium severity criteria
        if (category === 'core_web_vital' && details.rating === 'needs-improvement') return 'medium';
        if (category === 'resource_total' && details.overagePercentage > 50) return 'medium';
        if (category === 'performance' && details.type === 'long_task') return 'medium';
        
        return 'low';
    }

    /**
     * Trigger high severity alert
     */
    triggerHighSeverityAlert(violation) {
        // Send immediate alert to monitoring system
        if (this.isProduction) {
            this.sendAlertToMonitoring('high', violation);
        }
        
        // Log critical performance issue
        console.error('🔥 CRITICAL Performance Issue:', violation);
    }

    /**
     * Trigger medium severity alert
     */
    triggerMediumSeverityAlert(violation) {
        // Log warning
        console.warn('⚠️ Performance Warning:', violation);
        
        // Track in analytics
        if (window.gtag) {
            gtag('event', 'performance_warning', {
                warning_type: violation.details.type,
                severity: 'medium'
            });
        }
    }

    /**
     * Setup alert system
     */
    setupAlertSystem() {
        // Configure alert thresholds
        this.alertThresholds = {
            maxViolationsPerMinute: 5,
            maxCriticalViolations: 3,
            maxTotalViolations: 20
        };
        
        // Monitor violation frequency
        setInterval(() => {
            this.checkViolationFrequency();
        }, 60000); // Check every minute
    }

    /**
     * Check violation frequency and trigger alerts
     */
    checkViolationFrequency() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        // Count recent violations
        const recentViolations = this.violations.filter(v => v.timestamp > oneMinuteAgo);
        const criticalViolations = this.violations.filter(v => 
            this.calculateViolationSeverity(v) === 'high'
        );
        
        // Check thresholds
        if (recentViolations.length > this.alertThresholds.maxViolationsPerMinute) {
            this.triggerFrequencyAlert('high_violation_rate', {
                violationsPerMinute: recentViolations.length,
                threshold: this.alertThresholds.maxViolationsPerMinute
            });
        }
        
        if (criticalViolations.length > this.alertThresholds.maxCriticalViolations) {
            this.triggerFrequencyAlert('too_many_critical_violations', {
                criticalViolations: criticalViolations.length,
                threshold: this.alertThresholds.maxCriticalViolations
            });
        }
        
        if (this.violations.length > this.alertThresholds.maxTotalViolations) {
            this.triggerFrequencyAlert('excessive_total_violations', {
                totalViolations: this.violations.length,
                threshold: this.alertThresholds.maxTotalViolations
            });
        }
    }

    /**
     * Trigger frequency-based alert
     */
    triggerFrequencyAlert(type, data) {
        console.error(`🚨 Performance Alert [${type}]:`, data);
        
        if (this.isProduction) {
            this.sendAlertToMonitoring('critical', { type, data, violations: this.violations });
        }
    }

    /**
     * Send alert to monitoring system
     */
    sendAlertToMonitoring(severity, data) {
        // In a real implementation, this would send to your monitoring service
        // For now, we'll use a placeholder endpoint
        if (navigator.sendBeacon) {
            const alertData = JSON.stringify({
                severity,
                data,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            });
            
            navigator.sendBeacon('/api/performance-alerts', alertData);
        }
    }

    /**
     * Schedule regular reporting
     */
    scheduleReporting() {
        // Send periodic reports
        setInterval(() => {
            this.generatePeriodicReport();
        }, 300000); // Every 5 minutes

        // Send session summary on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.generateSessionSummary();
            }
        });
    }

    /**
     * Generate initial report after page load
     */
    generateInitialReport() {
        const report = {
            type: 'initial_load',
            timestamp: Date.now(),
            budgets: this.budgets,
            metrics: this.metrics,
            violations: this.violations.filter(v => v.timestamp > Date.now() - 10000), // Last 10 seconds
            deviceInfo: {
                isMobile: this.isMobile,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                connection: this.getConnectionInfo()
            }
        };

        this.sendReport(report);
    }

    /**
     * Generate periodic report
     */
    generatePeriodicReport() {
        const now = Date.now();
        const fiveMinutesAgo = now - 300000;
        
        const report = {
            type: 'periodic',
            timestamp: now,
            timeRange: { start: fiveMinutesAgo, end: now },
            metrics: this.metrics,
            violations: this.violations.filter(v => v.timestamp > fiveMinutesAgo),
            summary: this.generatePerformanceSummary()
        };

        this.sendReport(report);
    }

    /**
     * Generate session summary
     */
    generateSessionSummary() {
        const report = {
            type: 'session_summary',
            timestamp: Date.now(),
            sessionDuration: Date.now() - (this.sessionStart || Date.now()),
            totalViolations: this.violations.length,
            violationsByCategory: this.getViolationsByCategory(),
            performanceScore: this.calculatePerformanceScore(),
            recommendations: this.generateRecommendations()
        };

        this.sendReport(report);
    }

    /**
     * Generate final report on page unload
     */
    generateFinalReport() {
        const report = {
            type: 'final',
            timestamp: Date.now(),
            sessionSummary: this.generateSessionSummary(),
            allViolations: this.violations,
            finalMetrics: this.metrics,
            performanceGrade: this.calculatePerformanceGrade()
        };

        this.sendReport(report);
    }

    /**
     * Generate performance summary
     */
    generatePerformanceSummary() {
        return {
            budgetCompliance: this.calculateBudgetCompliance(),
            coreWebVitalsScore: this.calculateCoreWebVitalsScore(),
            resourceEfficiency: this.calculateResourceEfficiency(),
            overallHealth: this.calculateOverallHealth()
        };
    }

    /**
     * Calculate budget compliance percentage
     */
    calculateBudgetCompliance() {
        const totalBudgets = Object.keys(this.budgets.coreWebVitals).length +
                           Object.keys(this.budgets.timing).length +
                           Object.keys(this.budgets.resources).length;
        
        const violatedBudgets = new Set();
        this.violations.forEach(v => {
            if (v.details.metric || v.details.type) {
                violatedBudgets.add(v.details.metric || v.details.type);
            }
        });

        const complianceRate = Math.max(0, (totalBudgets - violatedBudgets.size) / totalBudgets);
        return Math.round(complianceRate * 100);
    }

    /**
     * Calculate Core Web Vitals score
     */
    calculateCoreWebVitalsScore() {
        const cwvMetrics = ['lcp', 'fid', 'cls'];
        let score = 0;
        let measuredMetrics = 0;

        cwvMetrics.forEach(metric => {
            const value = this.metrics.coreWebVitals[metric];
            if (value !== undefined) {
                measuredMetrics++;
                const rating = this.getCoreWebVitalRating(metric, value);
                if (rating === 'good') score += 100;
                else if (rating === 'needs-improvement') score += 50;
                else score += 0;
            }
        });

        return measuredMetrics > 0 ? Math.round(score / measuredMetrics) : 0;
    }

    /**
     * Calculate resource efficiency score
     */
    calculateResourceEfficiency() {
        if (!this.metrics.resources.totals) return 100;

        const totals = this.metrics.resources.totals;
        const budgets = this.budgets.resources;
        
        let efficiencyScore = 100;
        
        // Penalize for exceeding budgets
        if (totals.totalPageSize > budgets.totalPageSize) {
            efficiencyScore -= 20;
        }
        if (totals.totalJavaScript > budgets.totalJavaScript) {
            efficiencyScore -= 15;
        }
        if (totals.totalImages > budgets.totalImages) {
            efficiencyScore -= 15;
        }
        if (totals.requestCount > budgets.maxRequests) {
            efficiencyScore -= 10;
        }

        return Math.max(0, efficiencyScore);
    }

    /**
     * Calculate overall health score
     */
    calculateOverallHealth() {
        const budgetCompliance = this.calculateBudgetCompliance();
        const cwvScore = this.calculateCoreWebVitalsScore();
        const resourceEfficiency = this.calculateResourceEfficiency();
        
        return Math.round((budgetCompliance + cwvScore + resourceEfficiency) / 3);
    }

    /**
     * Get violations by category
     */
    getViolationsByCategory() {
        const categories = {};
        this.violations.forEach(v => {
            categories[v.category] = (categories[v.category] || 0) + 1;
        });
        return categories;
    }

    /**
     * Calculate performance score (0-100)
     */
    calculatePerformanceScore() {
        const overallHealth = this.calculateOverallHealth();
        const violationPenalty = Math.min(30, this.violations.length * 2);
        
        return Math.max(0, overallHealth - violationPenalty);
    }

    /**
     * Calculate performance grade (A-F)
     */
    calculatePerformanceGrade() {
        const score = this.calculatePerformanceScore();
        
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Generate performance recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        const violationTypes = new Set(this.violations.map(v => v.details.type));

        // Core Web Vitals recommendations
        if (violationTypes.has('lcp')) {
            recommendations.push('Optimize Largest Contentful Paint: preload hero images, optimize fonts, reduce server response time');
        }
        if (violationTypes.has('cls')) {
            recommendations.push('Reduce Cumulative Layout Shift: add image dimensions, reserve space for dynamic content');
        }
        if (violationTypes.has('fid')) {
            recommendations.push('Improve First Input Delay: reduce JavaScript execution time, use code splitting');
        }

        // Resource recommendations
        if (violationTypes.has('large_resource')) {
            recommendations.push('Reduce large resource sizes: compress images, minify JavaScript/CSS, use modern formats');
        }
        if (violationTypes.has('slow_resource')) {
            recommendations.push('Improve resource loading speed: use CDN, optimize server performance, implement caching');
        }

        // Performance recommendations
        if (violationTypes.has('long_task')) {
            recommendations.push('Break up long JavaScript tasks: use time slicing, web workers, or code splitting');
        }
        if (violationTypes.has('high_memory_usage')) {
            recommendations.push('Reduce memory usage: cleanup event listeners, optimize images, limit concurrent operations');
        }

        return recommendations;
    }

    /**
     * Send report to analytics and monitoring
     */
    sendReport(report) {
        // Send to Google Analytics
        if (window.gtag) {
            gtag('event', 'performance_budget_report', {
                report_type: report.type,
                performance_score: this.calculatePerformanceScore(),
                violations_count: this.violations.length,
                custom_map: {
                    budget_compliance: this.calculateBudgetCompliance(),
                    cwv_score: this.calculateCoreWebVitalsScore()
                }
            });
        }

        // Send detailed report to monitoring endpoint
        if (this.isProduction && navigator.sendBeacon) {
            const reportData = JSON.stringify(report);
            navigator.sendBeacon('/api/performance-reports', reportData);
        }

        // Log report in development
        if (!this.isProduction) {
            console.log('📊 Performance Budget Report:', report);
        }
    }

    /**
     * Get current budget status
     */
    getBudgetStatus() {
        return {
            budgets: this.budgets,
            metrics: this.metrics,
            violations: this.violations,
            summary: this.generatePerformanceSummary(),
            recommendations: this.generateRecommendations(),
            score: this.calculatePerformanceScore(),
            grade: this.calculatePerformanceGrade()
        };
    }
}

// Initialize Performance Budget Monitor
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceBudgetMonitor = new PerformanceBudgetMonitor();
    });
} else {
    window.performanceBudgetMonitor = new PerformanceBudgetMonitor();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceBudgetMonitor;
}