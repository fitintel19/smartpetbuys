/*
 * MailerLite Mobile Form Enhancements
 * SmartPetBuys - Task 8: Mobile Keyboard Support
 * 
 * Enhances MailerLite embedded forms with proper mobile keyboard support
 * and accessibility improvements.
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // Selectors for MailerLite forms
        selectors: {
            embeddedForms: '.ml-embedded',
            emailInputs: 'input[type="email"], input[data-inputmask*="email"]',
            textInputs: 'input[type="text"]:not([data-inputmask*="email"])',
            submitButtons: 'button[type="submit"], input[type="submit"]',
            formElements: 'input, button, textarea, select'
        },
        
        // Mobile keyboard attributes
        mobileAttributes: {
            email: {
                'autocomplete': 'email',
                'autocapitalize': 'none',
                'autocorrect': 'off',
                'spellcheck': 'false',
                'inputmode': 'email'
            },
            text: {
                'autocapitalize': 'words',
                'autocorrect': 'on',
                'spellcheck': 'true'
            },
            general: {
                'style': 'font-size: 16px !important;' // Prevent iOS zoom
            }
        },
        
        // Accessibility attributes
        a11yAttributes: {
            emailInput: {
                'aria-label': 'Email address',
                'aria-describedby': 'email-help',
                'role': 'textbox',
                'aria-required': 'true'
            },
            submitButton: {
                'aria-label': 'Subscribe to newsletter'
            }
        }
    };
    
    /**
     * Enhance a single input element with mobile keyboard support
     * @param {HTMLElement} input - The input element to enhance
     * @param {string} inputType - The type of input (email, text, etc.)
     */
    function enhanceInput(input, inputType) {
        if (!input) return;
        
        // Set font size to prevent iOS zoom
        const currentStyle = input.getAttribute('style') || '';
        if (!currentStyle.includes('font-size')) {
            input.setAttribute('style', currentStyle + '; font-size: 16px !important;');
        }
        
        // Apply mobile-specific attributes
        const attributes = CONFIG.mobileAttributes[inputType] || {};
        Object.entries(attributes).forEach(([attr, value]) => {
            if (attr !== 'style') {
                input.setAttribute(attr, value);
            }
        });
        
        // Apply accessibility attributes
        if (inputType === 'email') {
            const a11yAttrs = CONFIG.a11yAttributes.emailInput;
            Object.entries(a11yAttrs).forEach(([attr, value]) => {
                if (!input.getAttribute(attr)) {
                    input.setAttribute(attr, value);
                }
            });
        }
        
        // Add touch optimization
        input.style.touchAction = 'manipulation';
        input.style.webkitTapHighlightColor = 'rgba(37, 99, 235, 0.3)';
        
        console.log(`Enhanced ${inputType} input:`, input);
    }
    
    /**
     * Enhance submit buttons with better mobile interaction
     * @param {HTMLElement} button - The button element to enhance
     */
    function enhanceSubmitButton(button) {
        if (!button) return;
        
        // Set font size to prevent iOS zoom
        const currentStyle = button.getAttribute('style') || '';
        if (!currentStyle.includes('font-size')) {
            button.setAttribute('style', currentStyle + '; font-size: 16px !important;');
        }
        
        // Apply accessibility attributes
        const a11yAttrs = CONFIG.a11yAttributes.submitButton;
        Object.entries(a11yAttrs).forEach(([attr, value]) => {
            if (!button.getAttribute(attr)) {
                button.setAttribute(attr, value);
            }
        });
        
        // Ensure minimum touch target size
        button.style.minHeight = '48px';
        button.style.minWidth = '48px';
        button.style.touchAction = 'manipulation';
        button.style.webkitTapHighlightColor = 'rgba(255, 127, 50, 0.3)';
        
        console.log('Enhanced submit button:', button);
    }
    
    /**
     * Add helpful text for screen readers and mobile users
     * @param {HTMLElement} form - The form container
     */
    function addHelpText(form) {
        // Check if help text already exists
        if (form.querySelector('.email-help')) return;
        
        const emailInput = form.querySelector(CONFIG.selectors.emailInputs);
        if (!emailInput) return;
        
        // Create help text element
        const helpText = document.createElement('div');
        helpText.id = 'email-help';
        helpText.className = 'email-help sr-only';
        helpText.textContent = 'Enter your email address to receive our newsletter';
        
        // Insert help text after the input
        emailInput.parentNode.insertBefore(helpText, emailInput.nextSibling);
        
        // Update input's aria-describedby
        emailInput.setAttribute('aria-describedby', 'email-help');
    }
    
    /**
     * Enhance keyboard navigation within a form
     * @param {HTMLElement} form - The form container
     */
    function enhanceKeyboardNavigation(form) {
        const formElements = form.querySelectorAll(CONFIG.selectors.formElements);
        
        formElements.forEach((element, index) => {
            // Add tab index for proper navigation order
            if (!element.getAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            
            // Add keyboard event listeners
            element.addEventListener('keydown', function(e) {
                // Handle Enter key on non-button elements
                if (e.key === 'Enter' && element.tagName !== 'BUTTON' && element.type !== 'submit') {
                    const nextElement = formElements[index + 1];
                    if (nextElement) {
                        nextElement.focus();
                    } else {
                        // Focus submit button if it's the last element
                        const submitBtn = form.querySelector(CONFIG.selectors.submitButtons);
                        if (submitBtn) {
                            submitBtn.focus();
                        }
                    }
                }
                
                // Handle Escape key to blur focus
                if (e.key === 'Escape') {
                    element.blur();
                }
            });
        });
    }
    
    /**
     * Enhance a single MailerLite form
     * @param {HTMLElement} form - The form container element
     */
    function enhanceMailerLiteForm(form) {
        console.log('Enhancing MailerLite form:', form);
        
        // Enhance email inputs
        const emailInputs = form.querySelectorAll(CONFIG.selectors.emailInputs);
        emailInputs.forEach(input => enhanceInput(input, 'email'));
        
        // Enhance text inputs
        const textInputs = form.querySelectorAll(CONFIG.selectors.textInputs);
        textInputs.forEach(input => enhanceInput(input, 'text'));
        
        // Enhance submit buttons
        const submitButtons = form.querySelectorAll(CONFIG.selectors.submitButtons);
        submitButtons.forEach(button => enhanceSubmitButton(button));
        
        // Add help text and improve accessibility
        addHelpText(form);
        
        // Enhance keyboard navigation
        enhanceKeyboardNavigation(form);
        
        // Mark form as enhanced to avoid duplicate processing
        form.setAttribute('data-mobile-enhanced', 'true');
    }
    
    /**
     * Find and enhance all MailerLite forms on the page
     */
    function enhanceAllForms() {
        const forms = document.querySelectorAll(CONFIG.selectors.embeddedForms + ':not([data-mobile-enhanced])');
        
        if (forms.length === 0) {
            console.log('No MailerLite forms found to enhance');
            return;
        }
        
        console.log(`Found ${forms.length} MailerLite form(s) to enhance`);
        forms.forEach(enhanceMailerLiteForm);
    }
    
    /**
     * Initialize the enhancement system
     */
    function init() {
        console.log('Initializing MailerLite mobile enhancements...');
        
        // Enhance existing forms
        enhanceAllForms();
        
        // Watch for dynamically loaded MailerLite forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a MailerLite form
                        if (node.matches && node.matches(CONFIG.selectors.embeddedForms)) {
                            enhanceMailerLiteForm(node);
                        }
                        
                        // Check for MailerLite forms within the added node
                        const childForms = node.querySelectorAll && node.querySelectorAll(CONFIG.selectors.embeddedForms + ':not([data-mobile-enhanced])');
                        if (childForms && childForms.length > 0) {
                            childForms.forEach(enhanceMailerLiteForm);
                        }
                    }
                });
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Re-enhance forms after a delay to catch slow-loading MailerLite scripts
        setTimeout(enhanceAllForms, 2000);
        setTimeout(enhanceAllForms, 5000);
        
        console.log('MailerLite mobile enhancements initialized');
    }
    
    /**
     * Handle mobile keyboard visibility changes
     */
    function handleMobileKeyboard() {
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', function() {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            // If height decreased significantly, keyboard is likely visible
            if (heightDifference > 150) {
                document.body.classList.add('mobile-keyboard-visible');
                
                // Scroll focused input into view
                const focused = document.activeElement;
                if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) {
                    setTimeout(() => {
                        focused.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            } else {
                document.body.classList.remove('mobile-keyboard-visible');
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Initialize mobile keyboard handling
    handleMobileKeyboard();
    
    // Expose for debugging
    window.MailerLiteMobileEnhancements = {
        enhanceAllForms,
        enhanceMailerLiteForm,
        CONFIG
    };
    
})();