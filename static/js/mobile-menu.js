/**
 * Mobile Navigation Menu
 * SmartPetBuys - Mobile menu functionality with accessibility support
 */

class MobileMenu {
    constructor() {
        this.menuToggle = null;
        this.mobileNav = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.menuToggle = document.getElementById('mobile-menu-toggle');
        this.mobileNav = document.getElementById('mobile-nav');
        
        if (!this.menuToggle || !this.mobileNav) {
            console.warn('Mobile menu elements not found');
            return;
        }

        this.bindEvents();
        this.setupKeyboardNavigation();
    }

    bindEvents() {
        // Toggle button click
        this.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.mobileNav.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.close();
            }
        });

        // Close menu on window resize if screen gets larger
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                this.close();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
                this.menuToggle.focus();
            }
        });
    }

    setupKeyboardNavigation() {
        const menuLinks = this.mobileNav.querySelectorAll('a, button');
        
        menuLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    // If this is the last link and we're tabbing forward, or first link and tabbing backward
                    if ((index === menuLinks.length - 1 && !e.shiftKey) || 
                        (index === 0 && e.shiftKey)) {
                        e.preventDefault();
                        this.close();
                        this.menuToggle.focus();
                    }
                }
            });
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.mobileNav.classList.add('is-open');
        this.menuToggle.classList.add('is-active');
        this.menuToggle.setAttribute('aria-expanded', 'true');
        this.menuToggle.setAttribute('aria-label', 'Close mobile navigation menu');
        this.mobileNav.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
        
        // Announce menu opening to screen readers
        this.announceToScreenReader('Mobile navigation menu opened');
        
        // Focus first menu item
        const firstMenuItem = this.mobileNav.querySelector('a');
        if (firstMenuItem) {
            firstMenuItem.focus();
        }
        
        // Add animation delay for better UX
        setTimeout(() => {
            this.mobileNav.classList.add('is-animated');
        }, 10);
    }

    close() {
        this.isOpen = false;
        this.mobileNav.classList.remove('is-open', 'is-animated');
        this.menuToggle.classList.remove('is-active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        this.menuToggle.setAttribute('aria-label', 'Open mobile navigation menu');
        this.mobileNav.setAttribute('aria-hidden', 'true');
        
        // Announce menu closing to screen readers
        this.announceToScreenReader('Mobile navigation menu closed');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

    // Announce changes to screen readers
    announceToScreenReader(message) {
        const announcements = document.getElementById('announcements');
        if (announcements) {
            announcements.textContent = message;
            // Clear the announcement after a brief delay
            setTimeout(() => {
                announcements.textContent = '';
            }, 1000);
        }
    }

    // Enhanced keyboard navigation
    handleKeyNavigation(e) {
        if (!this.isOpen) return;

        const menuLinks = Array.from(this.mobileNav.querySelectorAll('a, button'));
        const currentIndex = menuLinks.indexOf(document.activeElement);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                const nextIndex = currentIndex < menuLinks.length - 1 ? currentIndex + 1 : 0;
                menuLinks[nextIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuLinks.length - 1;
                menuLinks[prevIndex].focus();
                break;
            case 'Home':
                e.preventDefault();
                menuLinks[0].focus();
                break;
            case 'End':
                e.preventDefault();
                menuLinks[menuLinks.length - 1].focus();
                break;
        }
    }
}

// Initialize mobile menu when DOM is ready
const mobileMenu = new MobileMenu();

// Add enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
    if (mobileMenu.isOpen) {
        mobileMenu.handleKeyNavigation(e);
    }
});

// Expose to global scope for debugging
window.SmartPetBuys = window.SmartPetBuys || {};
window.SmartPetBuys.mobileMenu = mobileMenu;