/**
 * Mobile-Optimized Sticky Elements Enhancement
 * Handles mobile-specific sticky element behaviors and interactions
 * 
 * Features:
 * - Keyboard visibility detection and handling
 * - iOS Safari viewport height fixes
 * - Touch interaction optimizations
 * - Performance monitoring for sticky elements
 * - Safe area inset detection
 */

class StickyMobileHandler {
  constructor() {
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    this.stickyElements = {
      header: document.querySelector('.header'),
      stickyBar: document.querySelector('.formkit-sticky-bar'),
      mobileNav: document.querySelector('.mobile-nav'),
      sidebar: document.querySelector('.post-sidebar')
    };
    
    this.keyboardVisible = false;
    this.lastViewportHeight = window.innerHeight;
    this.resizeTimeout = null;
    
    this.init();
  }
  
  init() {
    this.setupViewportHandler();
    this.setupKeyboardDetection();
    this.setupSafeAreaDetection();
    this.setupTouchOptimizations();
    this.setupPerformanceOptimizations();
    this.setupAccessibilityEnhancements();
    
    console.log('StickyMobileHandler initialized', {
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      isSafari: this.isSafari,
      elements: Object.keys(this.stickyElements).filter(key => this.stickyElements[key])
    });
  }
  
  /**
   * Handle viewport changes for mobile browsers
   */
  setupViewportHandler() {
    const setViewportHeight = () => {
      // Use dynamic viewport height for iOS Safari compatibility
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Update custom viewport height for better mobile handling
      document.documentElement.style.setProperty('--mobile-vh', `${window.innerHeight}px`);
    };
    
    setViewportHeight();
    
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(setViewportHeight, 100);
    });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 500);
    });
  }
  
  /**
   * Detect keyboard visibility on mobile devices
   */
  setupKeyboardDetection() {
    let initialViewportHeight = window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialViewportHeight - currentHeight;
      const threshold = 150; // Minimum height difference to consider keyboard visible
      
      const wasKeyboardVisible = this.keyboardVisible;
      this.keyboardVisible = heightDiff > threshold;
      
      if (wasKeyboardVisible !== this.keyboardVisible) {
        this.handleKeyboardToggle();
      }
    };
    
    // Use visualViewport API if available (modern mobile browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleViewportChange);
    }
    
    // Handle focus events on form inputs
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('input, textarea, select')) {
        setTimeout(() => {
          this.keyboardVisible = true;
          this.handleKeyboardToggle();
        }, 300);
      }
    });
    
    document.addEventListener('focusout', (e) => {
      setTimeout(() => {
        if (!document.activeElement.matches('input, textarea, select')) {
          this.keyboardVisible = false;
          this.handleKeyboardToggle();
        }
      }, 300);
    });
  }
  
  /**
   * Handle keyboard visibility changes
   */
  handleKeyboardToggle() {
    const { stickyBar } = this.stickyElements;
    
    if (stickyBar) {
      if (this.keyboardVisible) {
        stickyBar.classList.add('keyboard-visible');
        // Optionally hide sticky bar when keyboard is visible
        if (window.innerHeight < 500) {
          stickyBar.style.transform = 'translateY(100%)';
        }
      } else {
        stickyBar.classList.remove('keyboard-visible');
        stickyBar.style.transform = '';
      }
    }
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('keyboardToggle', {
      detail: { visible: this.keyboardVisible }
    }));
  }
  
  /**
   * Detect and handle safe area insets
   */
  setupSafeAreaDetection() {
    // Check if device supports safe area insets
    const testDiv = document.createElement('div');
    testDiv.style.paddingTop = 'env(safe-area-inset-top)';
    document.body.appendChild(testDiv);
    const supportsSafeArea = getComputedStyle(testDiv).paddingTop !== '0px';
    document.body.removeChild(testDiv);
    
    if (supportsSafeArea) {
      document.documentElement.classList.add('has-safe-area');
    }
    
    // Set safe area CSS custom properties as fallback
    const computedStyle = getComputedStyle(document.documentElement);
    const safeAreaTop = computedStyle.getPropertyValue('--safe-area-inset-top') || '0px';
    const safeAreaBottom = computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0px';
    
    if (safeAreaTop === '0px' && window.innerHeight !== screen.height) {
      // Estimate safe areas for devices without proper support
      if (this.isIOS && window.innerHeight < screen.height - 100) {
        document.documentElement.style.setProperty('--safe-area-inset-top', '44px');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', '34px');
      }
    }
  }
  
  /**
   * Optimize touch interactions for sticky elements
   */
  setupTouchOptimizations() {
    // Add touch feedback to sticky elements
    const touchTargets = document.querySelectorAll(`
      .formkit-sticky-bar button,
      .formkit-sticky-bar input,
      .mobile-menu-toggle,
      .nav-link
    `);
    
    touchTargets.forEach(element => {
      // Prevent 300ms click delay on mobile
      element.style.touchAction = 'manipulation';
      
      // Add visual touch feedback
      element.addEventListener('touchstart', (e) => {
        element.classList.add('touch-active');
      }, { passive: true });
      
      element.addEventListener('touchend', (e) => {
        setTimeout(() => element.classList.remove('touch-active'), 150);
      }, { passive: true });
      
      element.addEventListener('touchcancel', (e) => {
        element.classList.remove('touch-active');
      }, { passive: true });
    });
    
    // Optimize form inputs in sticky bar
    const stickyInputs = document.querySelectorAll('.formkit-sticky-bar input');
    stickyInputs.forEach(input => {
      // Prevent zoom on iOS when focusing
      if (this.isIOS) {
        input.style.fontSize = '16px';
      }
    });
  }
  
  /**
   * Performance optimizations for sticky elements
   */
  setupPerformanceOptimizations() {
    // Use Intersection Observer to optimize sticky element rendering
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const element = entry.target;
          if (entry.isIntersecting) {
            element.classList.add('is-visible');
          } else {
            element.classList.remove('is-visible');
          }
        });
      }, {
        threshold: [0, 0.1, 0.9, 1]
      });
      
      Object.values(this.stickyElements).forEach(element => {
        if (element) observer.observe(element);
      });
    }
    
    // Optimize scroll performance for sticky elements
    let scrollTimeout;
    let lastScrollY = window.scrollY;
    
    const optimizedScrollHandler = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      
      document.documentElement.setAttribute('data-scroll-direction', scrollDirection);
      lastScrollY = currentScrollY;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.documentElement.removeAttribute('data-scroll-direction');
      }, 150);
    };
    
    window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
  }
  
  /**
   * Accessibility enhancements for mobile
   */
  setupAccessibilityEnhancements() {
    // Ensure sticky elements are properly announced to screen readers
    const announceSticky = (element, message) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.position = 'absolute';
      announcement.style.left = '-10000px';
      announcement.style.width = '1px';
      announcement.style.height = '1px';
      announcement.style.overflow = 'hidden';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    };
    
    // Handle reduced motion preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduced-motion');
      
      // Disable animations on sticky elements
      Object.values(this.stickyElements).forEach(element => {
        if (element) {
          element.style.transition = 'none';
          element.style.animation = 'none';
        }
      });
    }
    
    // Ensure focus management for mobile navigation
    const mobileNav = this.stickyElements.mobileNav;
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileNav && mobileToggle) {
      const trapFocus = (e) => {
        if (!mobileNav.classList.contains('is-open')) return;
        
        const focusableElements = mobileNav.querySelectorAll(`
          a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])
        `);
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
        
        if (e.key === 'Escape') {
          mobileToggle.click();
          mobileToggle.focus();
        }
      };
      
      document.addEventListener('keydown', trapFocus);
    }
  }
  
  /**
   * Debug method for development
   */
  debug() {
    return {
      keyboardVisible: this.keyboardVisible,
      viewportHeight: window.innerHeight,
      safeAreas: {
        top: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top'),
        bottom: getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')
      },
      elements: Object.keys(this.stickyElements).map(key => ({
        name: key,
        exists: !!this.stickyElements[key],
        visible: this.stickyElements[key]?.classList.contains('is-visible')
      }))
    };
  }
}

// CSS for touch feedback
const touchFeedbackCSS = `
.touch-active {
  transform: scale(0.98) !important;
  opacity: 0.8 !important;
  transition: transform 0.1s ease, opacity 0.1s ease !important;
}

.reduced-motion * {
  transition: none !important;
  animation: none !important;
}

.has-safe-area .header {
  top: var(--safe-area-inset-top);
}

.has-safe-area .formkit-sticky-bar {
  bottom: var(--safe-area-inset-bottom);
}

/* Dynamic viewport height support */
.mobile-nav {
  height: calc(var(--vh, 1vh) * 100);
  height: var(--mobile-vh, 100vh);
}

/* Scroll direction based optimizations */
[data-scroll-direction="down"] .header {
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

[data-scroll-direction="up"] .header {
  transform: translateY(0);
  transition: transform 0.3s ease;
}

/* Visibility-based optimizations */
.sticky-element:not(.is-visible) {
  will-change: auto;
}

.sticky-element.is-visible {
  will-change: transform;
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = touchFeedbackCSS;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.stickyMobileHandler = new StickyMobileHandler();
  });
} else {
  window.stickyMobileHandler = new StickyMobileHandler();
}

// Export for debugging
window.debugStickyMobile = () => window.stickyMobileHandler?.debug();