/**
 * Core Web Vitals Optimizer for SmartPetBuys
 * Comprehensive optimization system for LCP, CLS, and FID on mobile devices
 * Focuses on meeting Google's "Good" thresholds: LCP < 2.5s, FID < 100ms, CLS < 0.1
 * Version: 1.0
 */

class CoreWebVitalsOptimizer {
    constructor() {
        this.metrics = {
            lcp: null,
            fid: null,
            cls: 0,
            inp: null // Interaction to Next Paint (future Core Web Vital)
        };
        
        this.thresholds = {
            lcp: { good: 2500, needsImprovement: 4000 },
            fid: { good: 100, needsImprovement: 300 },
            cls: { good: 0.1, needsImprovement: 0.25 },
            inp: { good: 200, needsImprovement: 500 }
        };
        
        this.optimizations = {
            lcpOptimized: false,
            clsPreventionActive: false,
            fidOptimized: false
        };
        
        this.isMobile = this.detectMobile();
        this.init();
    }

    /**
     * Initialize Core Web Vitals optimization
     */
    init() {
        this.setupLCPOptimization();
        this.setupCLSPrevention();
        this.setupFIDOptimization();
        this.setupRealUserMonitoring();
        this.setupPerformanceBudget();
        
        console.log('🚀 Core Web Vitals Optimizer initialized for mobile performance');
    }

    /**
     * Detect if user is on mobile device
     */
    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Setup Largest Contentful Paint (LCP) optimization
     */
    setupLCPOptimization() {
        // Preload critical above-the-fold images immediately
        this.preloadCriticalImages();
        
        // Optimize font loading for faster text rendering
        this.optimizeFontLoading();
        
        // Implement resource priority hints
        this.implementResourcePriority();
        
        // Remove render-blocking resources
        this.optimizeRenderBlocking();
        
        this.optimizations.lcpOptimized = true;
        
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.lcp = lastEntry.startTime;
                this.assessLCPPerformance(lastEntry.startTime);
                this.reportCoreWebVital('LCP', lastEntry.startTime);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    /**
     * Preload critical images for LCP optimization
     */
    preloadCriticalImages() {
        // Preload hero images if not already preloaded
        const heroImages = document.querySelectorAll('.post-featured-image, .hero-image');
        heroImages.forEach((hero, index) => {
            if (index === 0) { // Only preload the first hero image for LCP
                const bgImage = window.getComputedStyle(hero).backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    const imageUrl = bgImage.slice(5, -2); // Remove url(" and ")
                    this.preloadImage(imageUrl, 'high');
                }
            }
        });

        // Preload product images in viewport
        this.preloadViewportImages();
    }

    /**
     * Preload image with priority
     */
    preloadImage(src, priority = 'auto') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.fetchPriority = priority;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    /**
     * Preload images in initial viewport
     */
    preloadViewportImages() {
        const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        const viewportHeight = window.innerHeight;
        
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            // Preload images in viewport or close to viewport (within 200px)
            if (rect.top < viewportHeight + 200) {
                const src = img.dataset.src || img.src;
                if (src) {
                    this.preloadImage(src, 'high');
                }
            }
        });
    }

    /**
     * Optimize font loading for LCP
     */
    optimizeFontLoading() {
        // Preload critical font subsets
        const criticalFonts = [
            'https://fonts.gstatic.com/s/montserrat/v25/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2',
            'https://fonts.gstatic.com/s/opensans/v34/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4taVQUwaEQbjwN71k.woff2'
        ];

        criticalFonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.href = fontUrl;
            link.crossOrigin = 'anonymous';
            link.fetchPriority = 'high';
            document.head.appendChild(link);
        });

        // Use font-display: swap for all fonts
        this.injectFontDisplaySwap();
    }

    /**
     * Inject font-display: swap for better LCP
     */
    injectFontDisplaySwap() {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Montserrat';
                font-display: swap;
            }
            @font-face {
                font-family: 'Open Sans';
                font-display: swap;
            }
            /* System font fallback during load */
            .font-loading * {
                font-family: system-ui, -apple-system, 'Segoe UI', sans-serif !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Implement resource priority hints
     */
    implementResourcePriority() {
        // Set fetchpriority for critical resources
        const criticalImages = document.querySelectorAll('.post-featured-image img, .hero-image img');
        criticalImages.forEach(img => {
            img.fetchPriority = 'high';
            img.loading = 'eager';
        });

        // Lower priority for below-the-fold content
        const belowFoldImages = document.querySelectorAll('.product-card img, .content img');
        belowFoldImages.forEach(img => {
            if (img.getBoundingClientRect().top > window.innerHeight) {
                img.fetchPriority = 'low';
                img.loading = 'lazy';
            }
        });
    }

    /**
     * Optimize render-blocking resources
     */
    optimizeRenderBlocking() {
        // Defer non-critical JavaScript
        const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
        scripts.forEach(script => {
            if (!this.isCriticalScript(script.src)) {
                script.defer = true;
            }
        });

        // Preload non-critical CSS
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        nonCriticalCSS.forEach(link => {
            if (!this.isCriticalCSS(link.href)) {
                link.rel = 'preload';
                link.as = 'style';
                link.onload = function() {
                    this.onload = null;
                    this.rel = 'stylesheet';
                };
            }
        });
    }

    /**
     * Check if script is critical for initial render
     */
    isCriticalScript(src) {
        const criticalScripts = [
            '/js/mobile-menu.js',
            '/js/critical.js'
        ];
        return criticalScripts.some(critical => src.includes(critical));
    }

    /**
     * Check if CSS is critical for initial render
     */
    isCriticalCSS(href) {
        const criticalCSS = [
            'critical.css',
            'above-fold.css'
        ];
        return criticalCSS.some(critical => href.includes(critical));
    }

    /**
     * Setup Cumulative Layout Shift (CLS) prevention
     */
    setupCLSPrevention() {
        // Reserve space for images with aspect ratio
        this.implementImageAspectRatios();
        
        // Prevent dynamic content insertion shifts
        this.preventDynamicContentShifts();
        
        // Optimize font loading to prevent text shifts
        this.preventFontShifts();
        
        // Handle ad and embed content properly
        this.handleDynamicContent();
        
        this.optimizations.clsPreventionActive = true;
        
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.cls = clsValue;
                        this.assessCLSPerformance(clsValue);
                        this.reportCoreWebVital('CLS', clsValue);
                    }
                });
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    /**
     * Implement image aspect ratios to prevent CLS
     */
    implementImageAspectRatios() {
        const images = document.querySelectorAll('img:not([width]):not([height])');
        images.forEach(img => {
            // Set default aspect ratio for images without dimensions
            if (!img.style.aspectRatio) {
                // Assume common aspect ratios based on image type
                if (img.closest('.product-card')) {
                    img.style.aspectRatio = '1 / 1'; // Square for products
                } else if (img.closest('.post-featured-image, .hero-image')) {
                    img.style.aspectRatio = '16 / 9'; // Widescreen for hero images
                } else {
                    img.style.aspectRatio = '4 / 3'; // Default ratio
                }
                img.style.width = '100%';
                img.style.height = 'auto';
            }
        });

        // Handle background images in CSS
        this.addBackgroundImageAspectRatios();
    }

    /**
     * Add aspect ratios for background images
     */
    addBackgroundImageAspectRatios() {
        const style = document.createElement('style');
        style.textContent = `
            /* Prevent CLS for hero background images */
            .post-featured-image, .hero-image {
                aspect-ratio: 16 / 9;
                min-height: 200px;
            }
            
            /* Mobile aspect ratio adjustments */
            @media (max-width: 768px) {
                .post-featured-image, .hero-image {
                    aspect-ratio: 4 / 3;
                    min-height: 150px;
                }
            }
            
            /* Product card consistency */
            .product-card .product-image {
                aspect-ratio: 1 / 1;
                min-height: 150px;
            }
            
            /* Ensure stable layouts */
            .product-card {
                min-height: 400px;
            }
            
            @media (max-width: 768px) {
                .product-card {
                    min-height: 350px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Prevent dynamic content insertion shifts
     */
    preventDynamicContentShifts() {
        // Reserve space for MailerLite forms
        const formContainers = document.querySelectorAll('.ml-form-embedContainer');
        formContainers.forEach(container => {
            if (!container.style.minHeight) {
                container.style.minHeight = this.isMobile ? '120px' : '80px';
            }
        });

        // Handle lazy-loaded content with placeholders
        this.implementContentPlaceholders();
    }

    /**
     * Implement content placeholders to prevent CLS
     */
    implementContentPlaceholders() {
        const lazyContent = document.querySelectorAll('[data-lazy], .lazy-content');
        lazyContent.forEach(element => {
            if (!element.style.minHeight) {
                // Set minimum heights based on content type
                if (element.classList.contains('product-card')) {
                    element.style.minHeight = this.isMobile ? '350px' : '400px';
                } else if (element.classList.contains('content-section')) {
                    element.style.minHeight = '200px';
                } else {
                    element.style.minHeight = '100px';
                }
            }
        });
    }

    /**
     * Prevent font loading shifts
     */
    preventFontShifts() {
        // Add font loading classes for graceful transitions
        document.documentElement.classList.add('font-loading');
        
        // Remove font loading class when fonts are ready
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                document.documentElement.classList.remove('font-loading');
                document.documentElement.classList.add('fonts-loaded');
            });
        }
    }

    /**
     * Handle dynamic content (ads, embeds) properly
     */
    handleDynamicContent() {
        // Reserve space for potential ad slots
        const adSlots = document.querySelectorAll('.ad-slot, [data-ad]');
        adSlots.forEach(slot => {
            if (!slot.style.minHeight) {
                slot.style.minHeight = this.isMobile ? '250px' : '300px';
            }
        });

        // Handle embedded content
        this.handleEmbeddedContent();
    }

    /**
     * Handle embedded content to prevent CLS
     */
    handleEmbeddedContent() {
        const embeds = document.querySelectorAll('iframe, .embed-container');
        embeds.forEach(embed => {
            if (embed.tagName === 'IFRAME' && !embed.style.aspectRatio) {
                // Set aspect ratio for embedded content
                const width = embed.width || 560;
                const height = embed.height || 315;
                embed.style.aspectRatio = `${width} / ${height}`;
                embed.style.width = '100%';
                embed.style.height = 'auto';
            }
        });
    }

    /**
     * Setup First Input Delay (FID) optimization
     */
    setupFIDOptimization() {
        // Optimize JavaScript execution
        this.optimizeJavaScriptExecution();
        
        // Implement input delay optimization
        this.optimizeInputHandling();
        
        // Break up long tasks
        this.breakUpLongTasks();
        
        // Implement code splitting
        this.implementCodeSplitting();
        
        this.optimizations.fidOptimized = true;
        
        if ('PerformanceObserver' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    const fidValue = entry.processingStart - entry.startTime;
                    this.metrics.fid = fidValue;
                    this.assessFIDPerformance(fidValue);
                    this.reportCoreWebVital('FID', fidValue);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
        }
    }

    /**
     * Optimize JavaScript execution for better FID
     */
    optimizeJavaScriptExecution() {
        // Defer non-critical JavaScript
        this.deferNonCriticalJS();
        
        // Use requestIdleCallback for non-urgent tasks
        this.scheduleIdleTasks();
        
        // Implement progressive enhancement
        this.implementProgressiveEnhancement();
    }

    /**
     * Defer non-critical JavaScript
     */
    deferNonCriticalJS() {
        const nonCriticalJS = [
            'analytics',
            'tracking',
            'social',
            'comments',
            'chat'
        ];

        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (nonCriticalJS.some(keyword => script.src.includes(keyword))) {
                this.loadScriptOnInteraction(script.src);
                script.remove();
            }
        });
    }

    /**
     * Load script on user interaction
     */
    loadScriptOnInteraction(scriptSrc) {
        const events = ['mousedown', 'touchstart', 'keydown'];
        const loadScript = () => {
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            document.head.appendChild(script);
            
            events.forEach(event => {
                document.removeEventListener(event, loadScript);
            });
        };

        events.forEach(event => {
            document.addEventListener(event, loadScript, { once: true, passive: true });
        });
    }

    /**
     * Schedule non-urgent tasks during idle time
     */
    scheduleIdleTasks() {
        const idleTasks = [];
        
        // Add tasks to be executed during idle time
        idleTasks.push(() => this.preloadBelowFoldContent());
        idleTasks.push(() => this.initializeAnalytics());
        idleTasks.push(() => this.setupBackgroundSync());

        if ('requestIdleCallback' in window) {
            idleTasks.forEach(task => {
                requestIdleCallback(task, { timeout: 2000 });
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                idleTasks.forEach(task => task());
            }, 1000);
        }
    }

    /**
     * Implement progressive enhancement for better FID
     */
    implementProgressiveEnhancement() {
        // Start with basic functionality, enhance progressively
        document.documentElement.classList.add('js-enabled');
        
        // Enable advanced features after initial interaction
        const enableAdvancedFeatures = () => {
            document.documentElement.classList.add('interaction-ready');
            this.loadAdvancedFeatures();
        };

        ['mousedown', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, enableAdvancedFeatures, { once: true, passive: true });
        });
    }

    /**
     * Load advanced features after interaction
     */
    loadAdvancedFeatures() {
        // Load non-critical scripts
        this.loadNonCriticalScripts();
        
        // Initialize complex widgets
        this.initializeComplexWidgets();
        
        // Enable advanced animations
        this.enableAdvancedAnimations();
    }

    /**
     * Load non-critical scripts
     */
    loadNonCriticalScripts() {
        const scripts = [
            '/js/social-sharing.js',
            '/js/advanced-analytics.js',
            '/js/chat-widget.js'
        ];

        scripts.forEach(scriptSrc => {
            if (document.querySelector(`script[src="${scriptSrc}"]`)) return;
            
            const script = document.createElement('script');
            script.src = scriptSrc;
            script.async = true;
            document.head.appendChild(script);
        });
    }

    /**
     * Initialize complex widgets after interaction
     */
    initializeComplexWidgets() {
        // Initialize MailerLite forms
        if (window.ml && typeof window.ml === 'function') {
            this.initializeMailerLiteWidgets();
        }

        // Initialize product comparison tools
        this.initializeProductComparison();
    }

    /**
     * Enable advanced animations after interaction
     */
    enableAdvancedAnimations() {
        document.documentElement.classList.add('animations-enabled');
    }

    /**
     * Optimize input handling for better FID
     */
    optimizeInputHandling() {
        // Debounce input events
        this.debounceInputEvents();
        
        // Use passive event listeners where possible
        this.optimizeEventListeners();
        
        // Implement input throttling for scroll events
        this.throttleScrollEvents();
    }

    /**
     * Debounce input events to improve responsiveness
     */
    debounceInputEvents() {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.debounce(input, 'input', 150);
            this.debounce(input, 'keyup', 150);
        });
    }

    /**
     * Debounce function
     */
    debounce(element, event, delay) {
        let timeoutId;
        element.addEventListener(event, (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                // Process the event
                this.processInputEvent(e);
            }, delay);
        });
    }

    /**
     * Process input events efficiently
     */
    processInputEvent(event) {
        // Handle form validation, search, etc.
        if (event.target.matches('[data-validate]')) {
            this.validateInput(event.target);
        }
        
        if (event.target.matches('[data-search]')) {
            this.performSearch(event.target.value);
        }
    }

    /**
     * Optimize event listeners for better performance
     */
    optimizeEventListeners() {
        // Use passive listeners for scroll and touch events
        const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
        passiveEvents.forEach(eventType => {
            const elements = document.querySelectorAll(`[data-${eventType}]`);
            elements.forEach(element => {
                element.addEventListener(eventType, this.handlePassiveEvent.bind(this), { passive: true });
            });
        });
    }

    /**
     * Handle passive events efficiently
     */
    handlePassiveEvent(event) {
        // Process passive events without blocking
        requestAnimationFrame(() => {
            // Handle the event in the next frame
            this.processPassiveEvent(event);
        });
    }

    /**
     * Process passive events
     */
    processPassiveEvent(event) {
        // Handle scroll, touch events efficiently
        if (event.type === 'scroll') {
            this.handleScrollEvent(event);
        }
    }

    /**
     * Handle scroll events with throttling
     */
    handleScrollEvent(event) {
        // Throttled scroll handling for performance
        this.updateScrollPosition();
        this.checkElementsInViewport();
    }

    /**
     * Throttle scroll events
     */
    throttleScrollEvents() {
        let scrollTimeout;
        let lastScrollTime = 0;
        
        window.addEventListener('scroll', () => {
            const now = Date.now();
            if (now - lastScrollTime > 16) { // ~60fps
                lastScrollTime = now;
                this.handleScrollEvent();
            }
        }, { passive: true });
    }

    /**
     * Break up long tasks for better FID
     */
    breakUpLongTasks() {
        // Identify and break up long-running operations
        this.scheduleWorkInChunks();
        
        // Use time slicing for heavy computations
        this.implementTimeSlicing();
    }

    /**
     * Schedule work in chunks to avoid blocking main thread
     */
    scheduleWorkInChunks() {
        const heavyTasks = this.getHeavyTasks();
        
        const processChunk = (tasks, index = 0) => {
            const chunkSize = 5; // Process 5 tasks at a time
            const chunk = tasks.slice(index, index + chunkSize);
            
            chunk.forEach(task => task());
            
            if (index + chunkSize < tasks.length) {
                // Schedule next chunk
                setTimeout(() => processChunk(tasks, index + chunkSize), 0);
            }
        };

        if (heavyTasks.length > 0) {
            processChunk(heavyTasks);
        }
    }

    /**
     * Get list of heavy tasks that should be chunked
     */
    getHeavyTasks() {
        return [
            () => this.initializeProductFilters(),
            () => this.setupImageLazyLoading(),
            () => this.initializeRecommendationEngine(),
            () => this.setupA11yEnhancements(),
            () => this.initializeSearchIndex()
        ];
    }

    /**
     * Implement time slicing for heavy computations
     */
    implementTimeSlicing() {
        const timeSlice = (fn, thisArg, argsArray) => {
            return new Promise((resolve) => {
                const start = performance.now();
                const result = fn.apply(thisArg, argsArray);
                const duration = performance.now() - start;
                
                if (duration > 5) { // If task took more than 5ms
                    setTimeout(() => resolve(result), 0);
                } else {
                    resolve(result);
                }
            });
        };

        // Make timeSlice available globally for heavy operations
        window.timeSlice = timeSlice;
    }

    /**
     * Implement code splitting for better loading performance
     */
    implementCodeSplitting() {
        // Load route-specific code only when needed
        this.loadRouteSpecificCode();
        
        // Load feature-specific code on demand
        this.loadFeatureSpecificCode();
    }

    /**
     * Load route-specific code
     */
    loadRouteSpecificCode() {
        const route = window.location.pathname;
        
        const routeModules = {
            '/posts/': '/js/modules/blog.js',
            '/products/': '/js/modules/products.js',
            '/about/': '/js/modules/about.js'
        };

        Object.keys(routeModules).forEach(routePath => {
            if (route.includes(routePath)) {
                this.loadModule(routeModules[routePath]);
            }
        });
    }

    /**
     * Load feature-specific code on demand
     */
    loadFeatureSpecificCode() {
        // Load modules when specific elements are present
        const featureMap = {
            '.product-comparison': '/js/modules/comparison.js',
            '.search-container': '/js/modules/search.js',
            '.newsletter-signup': '/js/modules/newsletter.js',
            '.social-sharing': '/js/modules/social.js'
        };

        Object.keys(featureMap).forEach(selector => {
            if (document.querySelector(selector)) {
                this.loadModule(featureMap[selector]);
            }
        });
    }

    /**
     * Load JavaScript module dynamically
     */
    async loadModule(modulePath) {
        try {
            if ('import' in window && typeof window.import === 'function') {
                await import(modulePath);
            } else {
                // Fallback for older browsers
                const script = document.createElement('script');
                script.src = modulePath;
                script.async = true;
                document.head.appendChild(script);
            }
        } catch (error) {
            console.warn(`Failed to load module: ${modulePath}`, error);
        }
    }

    /**
     * Setup Real User Monitoring for Core Web Vitals
     */
    setupRealUserMonitoring() {
        // Enhanced monitoring with mobile-specific insights
        this.setupMobileSpecificMonitoring();
        
        // Track performance over time
        this.setupPerformanceTracking();
        
        // Monitor user interactions and their performance impact
        this.setupInteractionMonitoring();
    }

    /**
     * Setup mobile-specific monitoring
     */
    setupMobileSpecificMonitoring() {
        const deviceInfo = {
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            deviceMemory: navigator.deviceMemory || 'unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            connection: this.getConnectionInfo(),
            isMobile: this.isMobile,
            touchSupported: 'ontouchstart' in window
        };

        // Send device info with metrics
        this.deviceInfo = deviceInfo;

        // Monitor touch events for mobile interaction
        if ('ontouchstart' in window) {
            this.setupTouchMonitoring();
        }

        // Monitor viewport changes for mobile
        this.setupViewportMonitoring();

        // Monitor device orientation
        this.setupOrientationMonitoring();

        // Monitor connection changes
        this.setupConnectionMonitoring();
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
     * Setup performance tracking over time
     */
    setupPerformanceTracking() {
        // Track performance trends
        this.performanceHistory = [];
        
        // Store metrics periodically
        setInterval(() => {
            this.recordPerformanceSnapshot();
        }, 30000); // Every 30 seconds

        // Send final metrics on page unload
        window.addEventListener('beforeunload', () => {
            this.sendFinalMetrics();
        });
    }

    /**
     * Record performance snapshot
     */
    recordPerformanceSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            metrics: { ...this.metrics },
            deviceInfo: this.deviceInfo,
            optimizations: { ...this.optimizations },
            pageLoadTime: performance.now(),
            memoryUsage: this.getMemoryUsage()
        };

        this.performanceHistory.push(snapshot);
        
        // Keep only last 10 snapshots
        if (this.performanceHistory.length > 10) {
            this.performanceHistory.shift();
        }
    }

    /**
     * Get memory usage information
     */
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * Setup interaction monitoring
     */
    setupInteractionMonitoring() {
        // Track interaction responsiveness
        const interactions = ['click', 'keydown', 'touchstart'];
        
        interactions.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.trackInteractionPerformance(event);
            }, { passive: true });
        });
    }

    /**
     * Track interaction performance
     */
    trackInteractionPerformance(event) {
        const startTime = performance.now();
        
        requestAnimationFrame(() => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Track slow interactions
            if (duration > 50) { // Longer than 50ms
                this.reportSlowInteraction({
                    type: event.type,
                    target: event.target.tagName,
                    duration: duration,
                    timestamp: Date.now()
                });
            }
        });
    }

    /**
     * Setup performance budget monitoring
     */
    setupPerformanceBudget() {
        const budgets = {
            lcp: 2500, // 2.5 seconds for mobile
            fid: 100,  // 100ms
            cls: 0.1,  // 0.1
            totalPageSize: this.isMobile ? 1000000 : 2000000, // 1MB mobile, 2MB desktop
            scriptSize: this.isMobile ? 300000 : 500000, // 300KB mobile, 500KB desktop
            imageSize: this.isMobile ? 500000 : 1000000  // 500KB mobile, 1MB desktop
        };

        this.performanceBudget = budgets;
        this.monitorBudgetCompliance();
    }

    /**
     * Monitor performance budget compliance
     */
    monitorBudgetCompliance() {
        // Check resource sizes
        this.checkResourceBudgets();
        
        // Monitor Core Web Vitals budgets
        this.monitorMetricsBudgets();
        
        // Report budget violations
        setInterval(() => {
            this.reportBudgetStatus();
        }, 60000); // Check every minute
    }

    /**
     * Check resource size budgets
     */
    checkResourceBudgets() {
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.checkResourceSize(entry);
                });
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
        }
    }

    /**
     * Check individual resource size against budget
     */
    checkResourceSize(entry) {
        const size = entry.transferSize || 0;
        const resourceType = this.getResourceType(entry);
        
        let budget;
        switch (resourceType) {
            case 'script':
                budget = this.performanceBudget.scriptSize;
                break;
            case 'image':
                budget = this.performanceBudget.imageSize;
                break;
            default:
                return; // No budget for this resource type
        }

        if (size > budget) {
            this.reportBudgetViolation('resource', {
                type: resourceType,
                url: entry.name,
                size: size,
                budget: budget,
                violation: size - budget
            });
        }
    }

    /**
     * Get resource type from performance entry
     */
    getResourceType(entry) {
        if (entry.initiatorType) return entry.initiatorType;
        
        const url = entry.name.toLowerCase();
        if (url.includes('.js')) return 'script';
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
        if (url.includes('.css')) return 'stylesheet';
        return 'other';
    }

    /**
     * Monitor Core Web Vitals against budgets
     */
    monitorMetricsBudgets() {
        Object.keys(this.performanceBudget).forEach(metric => {
            if (this.metrics[metric] !== null && this.metrics[metric] > this.performanceBudget[metric]) {
                this.reportBudgetViolation('metric', {
                    metric: metric,
                    value: this.metrics[metric],
                    budget: this.performanceBudget[metric],
                    violation: this.metrics[metric] - this.performanceBudget[metric]
                });
            }
        });
    }

    /**
     * Report budget violation
     */
    reportBudgetViolation(type, details) {
        console.warn(`🚨 Performance Budget Violation (${type}):`, details);
        
        // Send to analytics
        if (window.gtag) {
            gtag('event', 'performance_budget_violation', {
                violation_type: type,
                custom_map: details,
                value: details.violation
            });
        }
    }

    /**
     * Report performance budget status
     */
    reportBudgetStatus() {
        const status = {
            lcp: this.getBudgetStatus('lcp'),
            fid: this.getBudgetStatus('fid'),
            cls: this.getBudgetStatus('cls'),
            overallCompliance: this.calculateOverallCompliance()
        };

        if (window.gtag) {
            gtag('event', 'performance_budget_status', {
                custom_map: status,
                value: status.overallCompliance
            });
        }
    }

    /**
     * Get budget status for a metric
     */
    getBudgetStatus(metric) {
        if (this.metrics[metric] === null) return 'not_measured';
        
        const value = this.metrics[metric];
        const budget = this.performanceBudget[metric];
        
        if (value <= budget) return 'passing';
        if (value <= budget * 1.2) return 'warning';
        return 'failing';
    }

    /**
     * Calculate overall compliance percentage
     */
    calculateOverallCompliance() {
        const metrics = ['lcp', 'fid', 'cls'];
        let passingMetrics = 0;
        let totalMetrics = 0;

        metrics.forEach(metric => {
            if (this.metrics[metric] !== null) {
                totalMetrics++;
                if (this.metrics[metric] <= this.performanceBudget[metric]) {
                    passingMetrics++;
                }
            }
        });

        return totalMetrics > 0 ? Math.round((passingMetrics / totalMetrics) * 100) : 0;
    }

    /**
     * Assess LCP performance and provide recommendations
     */
    assessLCPPerformance(value) {
        const assessment = {
            value: value,
            rating: this.getRating('lcp', value),
            recommendations: []
        };

        if (value > this.thresholds.lcp.good) {
            assessment.recommendations.push('Optimize hero image loading');
            assessment.recommendations.push('Preload critical fonts');
            assessment.recommendations.push('Reduce server response time');
            assessment.recommendations.push('Minimize render-blocking resources');
        }

        if (this.isMobile && value > 2000) {
            assessment.recommendations.push('Implement mobile-specific image optimization');
            assessment.recommendations.push('Use connection-aware loading');
        }

        return assessment;
    }

    /**
     * Assess CLS performance and provide recommendations
     */
    assessCLSPerformance(value) {
        const assessment = {
            value: value,
            rating: this.getRating('cls', value),
            recommendations: []
        };

        if (value > this.thresholds.cls.good) {
            assessment.recommendations.push('Add image dimensions or aspect ratios');
            assessment.recommendations.push('Reserve space for dynamic content');
            assessment.recommendations.push('Use font-display: swap');
            assessment.recommendations.push('Avoid inserting content above existing content');
        }

        return assessment;
    }

    /**
     * Assess FID performance and provide recommendations
     */
    assessFIDPerformance(value) {
        const assessment = {
            value: value,
            rating: this.getRating('fid', value),
            recommendations: []
        };

        if (value > this.thresholds.fid.good) {
            assessment.recommendations.push('Break up long JavaScript tasks');
            assessment.recommendations.push('Use code splitting');
            assessment.recommendations.push('Defer non-critical JavaScript');
            assessment.recommendations.push('Use web workers for heavy computations');
        }

        return assessment;
    }

    /**
     * Get performance rating for a metric
     */
    getRating(metric, value) {
        const thresholds = this.thresholds[metric];
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.needsImprovement) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Report Core Web Vital metric
     */
    reportCoreWebVital(metric, value) {
        const rating = this.getRating(metric.toLowerCase(), value);
        
        console.log(`📊 Core Web Vital - ${metric}: ${Math.round(value)}${metric === 'CLS' ? '' : 'ms'} (${rating})`);

        // Send to Google Analytics
        if (window.gtag) {
            gtag('event', 'core_web_vital', {
                metric_name: metric,
                metric_value: Math.round(value),
                metric_rating: rating,
                device_type: this.isMobile ? 'mobile' : 'desktop',
                connection_type: this.deviceInfo?.connection?.effectiveType || 'unknown'
            });
        }
    }

    /**
     * Report slow interaction
     */
    reportSlowInteraction(interactionData) {
        console.warn('🐌 Slow Interaction:', interactionData);

        if (window.gtag) {
            gtag('event', 'slow_interaction', {
                interaction_type: interactionData.type,
                target_element: interactionData.target,
                duration: Math.round(interactionData.duration),
                device_type: this.isMobile ? 'mobile' : 'desktop'
            });
        }
    }

    /**
     * Send final metrics on page unload
     */
    sendFinalMetrics() {
        const finalReport = {
            metrics: this.metrics,
            deviceInfo: this.deviceInfo,
            optimizations: this.optimizations,
            performanceHistory: this.performanceHistory,
            budgetCompliance: this.calculateOverallCompliance(),
            recommendations: this.generateRecommendations()
        };

        // Use sendBeacon for reliable delivery
        if (navigator.sendBeacon) {
            const data = JSON.stringify(finalReport);
            navigator.sendBeacon('/api/performance-metrics', data);
        }
    }

    /**
     * Generate performance recommendations
     */
    generateRecommendations() {
        const recommendations = [];

        // LCP recommendations
        if (this.metrics.lcp > this.thresholds.lcp.good) {
            recommendations.push(...this.assessLCPPerformance(this.metrics.lcp).recommendations);
        }

        // CLS recommendations
        if (this.metrics.cls > this.thresholds.cls.good) {
            recommendations.push(...this.assessCLSPerformance(this.metrics.cls).recommendations);
        }

        // FID recommendations
        if (this.metrics.fid > this.thresholds.fid.good) {
            recommendations.push(...this.assessFIDPerformance(this.metrics.fid).recommendations);
        }

        return [...new Set(recommendations)]; // Remove duplicates
    }

    /**
     * Get current optimization status
     */
    getOptimizationStatus() {
        return {
            metrics: this.metrics,
            optimizations: this.optimizations,
            budgetCompliance: this.calculateOverallCompliance(),
            deviceInfo: this.deviceInfo,
            recommendations: this.generateRecommendations()
        };
    }

    // Helper methods for mobile monitoring
    setupTouchMonitoring() {
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartTime = performance.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            const touchDuration = performance.now() - touchStartTime;
            if (touchDuration > 100) { // Long touch
                this.metrics.longTouches = (this.metrics.longTouches || 0) + 1;
            }
        }, { passive: true });
    }

    setupViewportMonitoring() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.metrics.viewportChanges = this.metrics.viewportChanges || [];
                this.metrics.viewportChanges.push({
                    viewport: `${window.innerWidth}x${window.innerHeight}`,
                    timestamp: Date.now()
                });
            }, 150);
        });
    }

    setupOrientationMonitoring() {
        window.addEventListener('orientationchange', () => {
            this.metrics.orientationChanges = this.metrics.orientationChanges || [];
            this.metrics.orientationChanges.push({
                orientation: screen.orientation?.angle || window.orientation || 0,
                timestamp: Date.now()
            });
        });
    }

    setupConnectionMonitoring() {
        if ('connection' in navigator && navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.metrics.connectionChanges = this.metrics.connectionChanges || [];
                this.metrics.connectionChanges.push({
                    connection: this.getConnectionInfo(),
                    timestamp: Date.now()
                });
            });
        }
    }

    // Helper methods for initialization tasks
    initializeProductFilters() { /* Implementation */ }
    setupImageLazyLoading() { /* Implementation */ }
    initializeRecommendationEngine() { /* Implementation */ }
    setupA11yEnhancements() { /* Implementation */ }
    initializeSearchIndex() { /* Implementation */ }
    initializeMailerLiteWidgets() { /* Implementation */ }
    initializeProductComparison() { /* Implementation */ }
    validateInput(input) { /* Implementation */ }
    performSearch(query) { /* Implementation */ }
    updateScrollPosition() { /* Implementation */ }
    checkElementsInViewport() { /* Implementation */ }
    preloadBelowFoldContent() { /* Implementation */ }
    initializeAnalytics() { /* Implementation */ }
    setupBackgroundSync() { /* Implementation */ }
}

// Initialize Core Web Vitals optimizer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.coreWebVitalsOptimizer = new CoreWebVitalsOptimizer();
    });
} else {
    window.coreWebVitalsOptimizer = new CoreWebVitalsOptimizer();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreWebVitalsOptimizer;
}