/**
 * Service Worker Registration with Mobile-First Performance Optimizations
 * Handles registration, updates, and communication with service worker
 * Version: 1.0
 */

class ServiceWorkerManager {
    constructor() {
        this.swPath = '/sw.js';
        this.registration = null;
        this.isUpdateAvailable = false;
        
        this.init();
    }

    /**
     * Initialize service worker registration
     */
    async init() {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers not supported in this browser');
            return;
        }

        try {
            await this.registerServiceWorker();
            this.setupUpdateHandling();
            this.setupCommunication();
            this.setupPerformanceOptimizations();
        } catch (error) {
            console.error('Service Worker initialization failed:', error);
        }
    }

    /**
     * Register the service worker
     */
    async registerServiceWorker() {
        try {
            this.registration = await navigator.serviceWorker.register(this.swPath, {
                scope: '/',
                updateViaCache: 'none' // Always check for updates
            });

            console.log('Service Worker registered successfully:', this.registration);

            // Handle different registration states
            if (this.registration.installing) {
                console.log('Service Worker installing...');
                this.trackInstallProgress(this.registration.installing);
            } else if (this.registration.waiting) {
                console.log('Service Worker waiting to activate...');
                this.handleUpdateAvailable();
            } else if (this.registration.active) {
                console.log('Service Worker active and ready');
                this.handleServiceWorkerReady();
            }

        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    /**
     * Track service worker installation progress
     */
    trackInstallProgress(worker) {
        worker.addEventListener('statechange', () => {
            console.log('Service Worker state changed:', worker.state);
            
            switch (worker.state) {
                case 'installed':
                    if (navigator.serviceWorker.controller) {
                        // New worker installed while old one is still controlling
                        this.handleUpdateAvailable();
                    } else {
                        // First time installation
                        this.handleFirstInstall();
                    }
                    break;
                case 'activated':
                    this.handleServiceWorkerReady();
                    break;
                case 'redundant':
                    console.warn('Service Worker became redundant');
                    break;
            }
        });
    }

    /**
     * Setup update handling
     */
    setupUpdateHandling() {
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
            const newWorker = this.registration.installing;
            if (newWorker) {
                this.trackInstallProgress(newWorker);
            }
        });

        // Listen for controller change (new service worker activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker controller changed');
            
            // Only reload if this wasn't the initial registration
            if (this.isUpdateAvailable) {
                this.handleControllerChange();
            }
        });

        // Periodically check for updates
        setInterval(() => {
            this.checkForUpdates();
        }, 60000); // Check every minute
    }

    /**
     * Handle when update is available
     */
    handleUpdateAvailable() {
        this.isUpdateAvailable = true;
        console.log('Service Worker update available');
        
        // For mobile-first approach, auto-update for better performance
        // In production, you might want to show a user prompt
        if (this.shouldAutoUpdate()) {
            this.applyUpdate();
        } else {
            this.showUpdateNotification();
        }
    }

    /**
     * Determine if auto-update should be applied
     */
    shouldAutoUpdate() {
        // Auto-update for critical performance improvements
        // You can customize this logic based on your needs
        return !document.hidden && navigator.onLine;
    }

    /**
     * Apply service worker update
     */
    applyUpdate() {
        if (this.registration.waiting) {
            console.log('Applying Service Worker update...');
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    /**
     * Show update notification to user
     */
    showUpdateNotification() {
        // Create a subtle notification for updates
        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <div class="sw-update-content">
                <span>New version available!</span>
                <button onclick="window.swManager.applyUpdate()">Update</button>
                <button onclick="this.parentElement.parentElement.remove()">Later</button>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#sw-update-styles')) {
            const styles = document.createElement('style');
            styles.id = 'sw-update-styles';
            styles.textContent = `
                .sw-update-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--primary-color, #FF7F32);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    max-width: 300px;
                    font-size: 14px;
                }
                .sw-update-content button {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 5px 10px;
                    margin-left: 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .sw-update-content button:hover {
                    background: rgba(255,255,255,0.3);
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    /**
     * Handle controller change (new SW activated)
     */
    handleControllerChange() {
        console.log('Reloading page for Service Worker update...');
        window.location.reload();
    }

    /**
     * Handle first installation
     */
    handleFirstInstall() {
        console.log('Service Worker installed for the first time');
        
        // Show installation success (optional)
        if (window.gtag) {
            gtag('event', 'sw_installed', {
                event_category: 'performance',
                event_label: 'first_install'
            });
        }
    }

    /**
     * Handle service worker ready
     */
    handleServiceWorkerReady() {
        console.log('Service Worker ready to serve requests');
        
        // Notify main application
        document.dispatchEvent(new CustomEvent('sw-ready'));
        
        // Start background optimizations
        this.startBackgroundOptimizations();
    }

    /**
     * Setup communication with service worker
     */
    setupCommunication() {
        navigator.serviceWorker.addEventListener('message', event => {
            const { type, data } = event.data;
            
            switch (type) {
                case 'CACHE_UPDATED':
                    console.log('Cache updated:', data);
                    break;
                case 'OFFLINE_READY':
                    console.log('App ready for offline use');
                    this.handleOfflineReady();
                    break;
                default:
                    console.log('SW message:', type, data);
            }
        });
    }

    /**
     * Setup performance optimizations
     */
    setupPerformanceOptimizations() {
        // Preload critical pages in background
        this.preloadCriticalPages();
        
        // Setup network status monitoring
        this.setupNetworkMonitoring();
        
        // Setup visibility change handling
        this.setupVisibilityHandling();
    }

    /**
     * Preload critical pages
     */
    preloadCriticalPages() {
        if (!navigator.serviceWorker.controller) return;
        
        const criticalPages = [
            '/',
            '/posts/',
            '/about/'
        ];
        
        // Preload after a delay to not interfere with current page
        setTimeout(() => {
            criticalPages.forEach(page => {
                fetch(page, { mode: 'no-cors' }).catch(() => {
                    // Ignore errors - this is just preloading
                });
            });
        }, 2000);
    }

    /**
     * Setup network status monitoring
     */
    setupNetworkMonitoring() {
        const updateOnlineStatus = () => {
            const status = navigator.onLine ? 'online' : 'offline';
            console.log('Network status:', status);
            
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'NETWORK_STATUS',
                    status: status
                });
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }

    /**
     * Setup visibility change handling
     */
    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page became visible - check for updates
                this.checkForUpdates();
            }
        });
    }

    /**
     * Check for service worker updates
     */
    async checkForUpdates() {
        if (!this.registration) return;
        
        try {
            await this.registration.update();
        } catch (error) {
            console.warn('Failed to check for Service Worker updates:', error);
        }
    }

    /**
     * Handle offline ready state
     */
    handleOfflineReady() {
        // Add offline indicator
        document.documentElement.classList.add('offline-ready');
        
        // Track offline capability
        if (window.gtag) {
            gtag('event', 'offline_ready', {
                event_category: 'performance',
                event_label: 'sw_cached'
            });
        }
    }

    /**
     * Start background optimizations
     */
    startBackgroundOptimizations() {
        // Request idle callback for non-critical optimizations
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.performIdleOptimizations();
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                this.performIdleOptimizations();
            }, 1000);
        }
    }

    /**
     * Perform optimizations during idle time
     */
    performIdleOptimizations() {
        // Warm up critical caches
        this.warmUpCaches();
        
        // Clean up old data
        this.cleanupOldData();
    }

    /**
     * Warm up critical caches
     */
    warmUpCaches() {
        const criticalResources = [
            '/css/extended/critical.css',
            '/js/performance-loader.js',
            '/images/smartpetbuys_logo.png'
        ];
        
        criticalResources.forEach(resource => {
            fetch(resource, { mode: 'no-cors' }).catch(() => {
                // Ignore errors
            });
        });
    }

    /**
     * Clean up old data
     */
    cleanupOldData() {
        // Clean up localStorage if needed
        try {
            const threshold = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('smartpetbuys_temp_')) {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    if (data.timestamp && data.timestamp < threshold) {
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.warn('Failed to cleanup localStorage:', error);
        }
    }

    /**
     * Get service worker status
     */
    getStatus() {
        return {
            supported: 'serviceWorker' in navigator,
            registered: !!this.registration,
            active: !!navigator.serviceWorker.controller,
            updateAvailable: this.isUpdateAvailable
        };
    }
}

// Initialize service worker when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.swManager = new ServiceWorkerManager();
    });
} else {
    window.swManager = new ServiceWorkerManager();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServiceWorkerManager;
}