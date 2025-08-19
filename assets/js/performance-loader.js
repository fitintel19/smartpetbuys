/**
 * Advanced Performance Loader - Mobile-First Loading Strategies
 * Implements Intersection Observer-based lazy loading, connection-aware loading,
 * and progressive enhancement for optimal mobile performance
 * Version: 1.0
 */

class PerformanceLoader {
    constructor() {
        this.connection = this.getConnectionInfo();
        this.isReducedMotion = this.prefersReducedMotion();
        this.loadedResources = new Set();
        this.observerOptions = {
            root: null,
            rootMargin: '50px 0px',
            threshold: 0.1
        };
        
        this.init();
    }

    /**
     * Initialize the performance loader
     */
    init() {
        this.setupIntersectionObserver();
        this.setupConnectionAwareLoading();
        this.lazyLoadImages();
        this.lazyLoadIframes();
        this.preloadCriticalResources();
        this.optimizeThirdPartyScripts();
        this.setupPerformanceMonitoring();
    }

    /**
     * Get connection information for adaptive loading
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                effectiveType: conn.effectiveType || '4g',
                downlink: conn.downlink || 10,
                saveData: conn.saveData || false,
                rtt: conn.rtt || 100
            };
        }
        return { effectiveType: '4g', downlink: 10, saveData: false, rtt: 100 };
    }

    /**
     * Check if user prefers reduced motion
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Setup Intersection Observer for efficient lazy loading
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without Intersection Observer
            this.loadAllImagesImmediately();
            return;
        }

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        this.contentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadContent(entry.target);
                    this.contentObserver.unobserve(entry.target);
                }
            });
        }, {
            ...this.observerOptions,
            rootMargin: '100px 0px' // Load content slightly earlier
        });
    }

    /**
     * Setup connection-aware loading strategies
     */
    setupConnectionAwareLoading() {
        const isSlowConnection = this.connection.effectiveType === 'slow-2g' || 
                                this.connection.effectiveType === '2g' ||
                                this.connection.saveData;

        if (isSlowConnection) {
            // Reduce loading for slow connections
            this.observerOptions.rootMargin = '20px 0px'; // Smaller margin
            this.disableNonEssentialAnimations();
            this.prioritizeTextContent();
        } else if (this.connection.effectiveType === '4g' && this.connection.downlink > 5) {
            // Aggressive preloading for fast connections
            this.preloadNextPageResources();
        }
    }

    /**
     * Lazy load images with progressive enhancement
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        
        images.forEach(img => {
            // Create placeholder to prevent layout shift
            if (!img.style.aspectRatio && img.dataset.aspectRatio) {
                img.style.aspectRatio = img.dataset.aspectRatio;
            }

            // Add to observer
            if (this.imageObserver) {
                this.imageObserver.observe(img);
            } else {
                this.loadImage(img);
            }
        });
    }

    /**
     * Load individual image with optimizations
     */
    loadImage(img) {
        return new Promise((resolve, reject) => {
            const src = img.dataset.src || img.src;
            if (!src || this.loadedResources.has(src)) {
                resolve();
                return;
            }

            // Create new image element for loading
            const newImg = new Image();
            
            newImg.onload = () => {
                // Update the actual image
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Add loaded class for CSS transitions
                img.classList.add('loaded');
                this.loadedResources.add(src);
                
                // Trigger fade-in animation if not reduced motion
                if (!this.isReducedMotion) {
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease-in-out';
                    requestAnimationFrame(() => {
                        img.style.opacity = '1';
                    });
                }
                
                resolve();
            };

            newImg.onerror = () => {
                // Fallback handling
                img.classList.add('error');
                reject(new Error(`Failed to load image: ${src}`));
            };

            newImg.src = src;
        });
    }

    /**
     * Lazy load iframes (YouTube, maps, etc.)
     */
    lazyLoadIframes() {
        const iframes = document.querySelectorAll('iframe[data-src]');
        
        iframes.forEach(iframe => {
            if (this.contentObserver) {
                this.contentObserver.observe(iframe);
            } else {
                this.loadContent(iframe);
            }
        });
    }

    /**
     * Load iframe content
     */
    loadContent(element) {
        if (element.tagName === 'IFRAME' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
        
        // Load any other lazy content
        if (element.dataset.lazyLoad) {
            element.classList.add('load-content');
        }
    }

    /**
     * Preload critical resources based on priority
     */
    preloadCriticalResources() {
        // Preload critical images for fast connections
        if (this.connection.effectiveType === '4g') {
            const criticalImages = document.querySelectorAll('img[data-priority="high"]');
            criticalImages.forEach(img => this.loadImage(img));
        }

        // Preload fonts if not already done
        this.preloadFonts();
        
        // Preload critical CSS if needed
        this.preloadCriticalCSS();
    }

    /**
     * Preload web fonts with fallback
     */
    preloadFonts() {
        const fonts = [
            { family: 'Montserrat', weight: '600', display: 'swap' },
            { family: 'Open Sans', weight: '400', display: 'swap' }
        ];

        fonts.forEach(font => {
            if (document.fonts && document.fonts.load) {
                document.fonts.load(`${font.weight} 16px ${font.family}`)
                    .then(() => {
                        document.documentElement.classList.add(`${font.family.toLowerCase()}-loaded`);
                    })
                    .catch(() => {
                        console.warn(`Failed to load font: ${font.family}`);
                    });
            }
        });
    }

    /**
     * Preload critical CSS for faster subsequent page loads
     */
    preloadCriticalCSS() {
        const criticalCSS = document.querySelector('link[rel*="preload"][as="style"]');
        if (criticalCSS && !criticalCSS.dataset.loaded) {
            criticalCSS.dataset.loaded = 'true';
        }
    }

    /**
     * Optimize third-party script loading
     */
    optimizeThirdPartyScripts() {
        // Delay non-critical third-party scripts
        const delayScripts = () => {
            this.loadDelayedScripts();
        };

        // Load on user interaction or after delay
        ['mousedown', 'touchstart', 'keydown', 'scroll'].forEach(event => {
            document.addEventListener(event, delayScripts, { once: true, passive: true });
        });

        // Fallback: load after 3 seconds
        setTimeout(delayScripts, 3000);
    }

    /**
     * Load delayed third-party scripts
     */
    loadDelayedScripts() {
        const delayedScripts = document.querySelectorAll('script[data-delay]');
        
        delayedScripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.dataset.delay;
            newScript.async = true;
            
            // Copy attributes
            Array.from(script.attributes).forEach(attr => {
                if (attr.name !== 'data-delay') {
                    newScript.setAttribute(attr.name, attr.value);
                }
            });
            
            document.head.appendChild(newScript);
            script.remove();
        });
    }

    /**
     * Preload resources for next page (for fast connections)
     */
    preloadNextPageResources() {
        const links = document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]');
        
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.preloadPage(link.href);
            }, { once: true, passive: true });
        });
    }

    /**
     * Preload a page's critical resources
     */
    preloadPage(url) {
        if (this.loadedResources.has(url)) return;
        
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
        
        this.loadedResources.add(url);
    }

    /**
     * Disable non-essential animations for slow connections
     */
    disableNonEssentialAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            .reduce-animations * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
        document.documentElement.classList.add('reduce-animations');
    }

    /**
     * Prioritize text content for slow connections
     */
    prioritizeTextContent() {
        document.documentElement.classList.add('text-priority');
    }

    /**
     * Fallback for browsers without Intersection Observer
     */
    loadAllImagesImmediately() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint
            this.observeLCP();
            
            // Monitor First Input Delay
            this.observeFID();
            
            // Monitor Cumulative Layout Shift
            this.observeCLS();
        }

        // Monitor resource loading
        this.monitorResourceLoading();
    }

    /**
     * Observe Largest Contentful Paint
     */
    observeLCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (lastEntry && window.gtag) {
                gtag('event', 'lcp', {
                    custom_map: { metric_value: lastEntry.startTime },
                    value: Math.round(lastEntry.startTime)
                });
            }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    /**
     * Observe First Input Delay
     */
    observeFID() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (window.gtag) {
                    gtag('event', 'fid', {
                        custom_map: { metric_value: entry.processingStart - entry.startTime },
                        value: Math.round(entry.processingStart - entry.startTime)
                    });
                }
            });
        });
        
        observer.observe({ entryTypes: ['first-input'] });
    }

    /**
     * Observe Cumulative Layout Shift
     */
    observeCLS() {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            
            if (window.gtag) {
                gtag('event', 'cls', {
                    custom_map: { metric_value: clsValue },
                    value: Math.round(clsValue * 1000)
                });
            }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
    }

    /**
     * Monitor resource loading performance
     */
    monitorResourceLoading() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            
            if (perfData && window.gtag) {
                gtag('event', 'page_load_time', {
                    custom_map: { metric_value: perfData.loadEventEnd - perfData.fetchStart },
                    value: Math.round(perfData.loadEventEnd - perfData.fetchStart)
                });
            }
        });
    }
}

// Initialize performance loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceLoader = new PerformanceLoader();
    });
} else {
    window.performanceLoader = new PerformanceLoader();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceLoader;
}