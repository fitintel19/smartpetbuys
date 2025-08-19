/*
 * Mobile Form Validation System
 * SmartPetBuys - Task 8: Mobile Form Usability
 * 
 * Provides mobile-optimized form validation with:
 * - Real-time validation with mobile-friendly error messages
 * - Touch-friendly error indication
 * - Accessibility improvements for mobile screen readers
 * - Smooth animations and transitions
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        // Validation rules
        rules: {
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            required: {
                message: 'This field is required'
            },
            minLength: {
                message: 'Please enter at least {min} characters'
            },
            maxLength: {
                message: 'Please enter no more than {max} characters'
            }
        },
        
        // CSS classes
        classes: {
            error: 'has-error',
            success: 'has-success',
            errorMessage: 'field-error-message',
            successMessage: 'field-success-message',
            errorIcon: 'error-icon',
            successIcon: 'success-icon'
        },
        
        // Selectors
        selectors: {
            forms: 'form, .ml-embedded, .email-signup, .newsletter-form',
            inputs: 'input[type="email"], input[type="text"], input[type="tel"], input[type="url"], textarea',
            submitButtons: 'button[type="submit"], input[type="submit"]'
        },
        
        // Mobile-specific settings
        mobile: {
            vibrate: 200, // Vibration duration for errors on mobile
            scrollOffset: 80, // Offset when scrolling to error fields
            debounceDelay: 500 // Delay before validation after typing
        }
    };
    
    /**
     * Check if device supports vibration
     * @returns {boolean}
     */
    function supportsVibration() {
        return 'vibrate' in navigator;
    }
    
    /**
     * Check if device is mobile/touch device
     * @returns {boolean}
     */
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               'ontouchstart' in window ||
               navigator.maxTouchPoints > 0;
    }
    
    /**
     * Create error/success message element
     * @param {string} message - The message to display
     * @param {string} type - 'error' or 'success'
     * @returns {HTMLElement}
     */
    function createMessageElement(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = type === 'error' ? CONFIG.classes.errorMessage : CONFIG.classes.successMessage;
        messageEl.setAttribute('role', 'alert');
        messageEl.setAttribute('aria-live', 'polite');
        
        // Add icon for better visual feedback
        const icon = document.createElement('span');
        icon.className = type === 'error' ? CONFIG.classes.errorIcon : CONFIG.classes.successIcon;
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = type === 'error' ? '⚠️' : '✅';
        
        const text = document.createElement('span');
        text.textContent = message;
        
        messageEl.appendChild(icon);
        messageEl.appendChild(text);
        
        return messageEl;
    }
    
    /**
     * Remove existing validation messages
     * @param {HTMLElement} field - The input field
     */
    function clearValidationMessages(field) {
        const container = field.closest('.form-group, .form-field, .ml-form-fieldWrapper') || field.parentNode;
        
        // Remove existing messages
        const existingMessages = container.querySelectorAll(`.${CONFIG.classes.errorMessage}, .${CONFIG.classes.successMessage}`);
        existingMessages.forEach(msg => msg.remove());
        
        // Remove validation classes
        field.classList.remove(CONFIG.classes.error, CONFIG.classes.success);
        container.classList.remove(CONFIG.classes.error, CONFIG.classes.success);
    }
    
    /**
     * Display validation message
     * @param {HTMLElement} field - The input field
     * @param {string} message - The message to display
     * @param {string} type - 'error' or 'success'
     */
    function showValidationMessage(field, message, type) {
        clearValidationMessages(field);
        
        const container = field.closest('.form-group, .form-field, .ml-form-fieldWrapper') || field.parentNode;
        const messageEl = createMessageElement(message, type);
        
        // Add validation classes
        field.classList.add(type === 'error' ? CONFIG.classes.error : CONFIG.classes.success);
        container.classList.add(type === 'error' ? CONFIG.classes.error : CONFIG.classes.success);
        
        // Insert message after the field
        field.parentNode.insertBefore(messageEl, field.nextSibling);
        
        // Smooth animation
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(-10px)';
        messageEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Trigger animation
        setTimeout(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        }, 10);
        
        // Mobile haptic feedback for errors
        if (type === 'error' && isMobileDevice() && supportsVibration()) {
            navigator.vibrate(CONFIG.mobile.vibrate);
        }
        
        // Update field's aria-describedby
        const messageId = `validation-${Date.now()}`;
        messageEl.id = messageId;
        const currentDescribedBy = field.getAttribute('aria-describedby') || '';
        field.setAttribute('aria-describedby', currentDescribedBy ? `${currentDescribedBy} ${messageId}` : messageId);
    }
    
    /**
     * Validate an email field
     * @param {HTMLElement} field - The email input field
     * @returns {boolean}
     */
    function validateEmail(field) {
        const value = field.value.trim();
        
        if (!value) {
            if (field.hasAttribute('required')) {
                showValidationMessage(field, CONFIG.rules.required.message, 'error');
                return false;
            }
            clearValidationMessages(field);
            return true;
        }
        
        if (!CONFIG.rules.email.pattern.test(value)) {
            showValidationMessage(field, CONFIG.rules.email.message, 'error');
            return false;
        }
        
        showValidationMessage(field, 'Email address looks good!', 'success');
        return true;
    }
    
    /**
     * Validate a text field
     * @param {HTMLElement} field - The text input field
     * @returns {boolean}
     */
    function validateTextField(field) {
        const value = field.value.trim();
        const minLength = parseInt(field.getAttribute('minlength')) || 0;
        const maxLength = parseInt(field.getAttribute('maxlength')) || Infinity;
        
        if (!value) {
            if (field.hasAttribute('required')) {
                showValidationMessage(field, CONFIG.rules.required.message, 'error');
                return false;
            }
            clearValidationMessages(field);
            return true;
        }
        
        if (value.length < minLength) {
            const message = CONFIG.rules.minLength.message.replace('{min}', minLength);
            showValidationMessage(field, message, 'error');
            return false;
        }
        
        if (value.length > maxLength) {
            const message = CONFIG.rules.maxLength.message.replace('{max}', maxLength);
            showValidationMessage(field, message, 'error');
            return false;
        }
        
        clearValidationMessages(field);
        return true;
    }
    
    /**
     * Validate a single field
     * @param {HTMLElement} field - The input field to validate
     * @returns {boolean}
     */
    function validateField(field) {
        const fieldType = field.type || field.getAttribute('type') || 'text';
        
        switch (fieldType) {
            case 'email':
                return validateEmail(field);
            case 'text':
            case 'tel':
            case 'url':
                return validateTextField(field);
            default:
                return true;
        }
    }
    
    /**
     * Validate an entire form
     * @param {HTMLElement} form - The form to validate
     * @returns {boolean}
     */
    function validateForm(form) {
        const fields = form.querySelectorAll(CONFIG.selectors.inputs);
        let isValid = true;
        let firstErrorField = null;
        
        fields.forEach(field => {
            const fieldValid = validateField(field);
            if (!fieldValid) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = field;
                }
            }
        });
        
        // Scroll to first error field on mobile
        if (!isValid && firstErrorField && isMobileDevice()) {
            setTimeout(() => {
                const rect = firstErrorField.getBoundingClientRect();
                const scrollTop = window.pageYOffset + rect.top - CONFIG.mobile.scrollOffset;
                window.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                });
                firstErrorField.focus();
            }, 100);
        }
        
        return isValid;
    }
    
    /**
     * Add real-time validation to a field
     * @param {HTMLElement} field - The input field
     */
    function addRealTimeValidation(field) {
        let timeout;
        
        // Validation on input (debounced)
        field.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                validateField(field);
            }, CONFIG.mobile.debounceDelay);
        });
        
        // Immediate validation on blur
        field.addEventListener('blur', function() {
            clearTimeout(timeout);
            validateField(field);
        });
        
        // Clear validation on focus (for better UX)
        field.addEventListener('focus', function() {
            // Only clear error states, keep success states
            if (field.classList.contains(CONFIG.classes.error)) {
                clearValidationMessages(field);
            }
        });
    }
    
    /**
     * Enhance a form with mobile validation
     * @param {HTMLElement} form - The form to enhance
     */
    function enhanceForm(form) {
        console.log('Enhancing form with mobile validation:', form);
        
        // Add validation to all input fields
        const fields = form.querySelectorAll(CONFIG.selectors.inputs);
        fields.forEach(addRealTimeValidation);
        
        // Handle form submission
        const submitButtons = form.querySelectorAll(CONFIG.selectors.submitButtons);
        submitButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                // For MailerLite forms, we can't prevent default easily,
                // so we'll validate and show errors but let the form submit
                const isValid = validateForm(form);
                
                if (!isValid) {
                    console.log('Form validation failed');
                    // Don't prevent default for MailerLite forms
                    // as they handle submission differently
                    if (!form.classList.contains('ml-embedded')) {
                        e.preventDefault();
                    }
                }
            });
        });
        
        // Handle form submission event
        if (form.tagName === 'FORM') {
            form.addEventListener('submit', function(e) {
                const isValid = validateForm(form);
                if (!isValid) {
                    e.preventDefault();
                    console.log('Form submission prevented due to validation errors');
                }
            });
        }
        
        // Mark as enhanced
        form.setAttribute('data-validation-enhanced', 'true');
    }
    
    /**
     * Find and enhance all forms on the page
     */
    function enhanceAllForms() {
        const forms = document.querySelectorAll(CONFIG.selectors.forms + ':not([data-validation-enhanced])');
        
        if (forms.length === 0) {
            console.log('No forms found to enhance with validation');
            return;
        }
        
        console.log(`Found ${forms.length} form(s) to enhance with validation`);
        forms.forEach(enhanceForm);
    }
    
    /**
     * Add mobile-specific styles for validation
     */
    function addMobileValidationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Mobile Validation Styles */
            .field-error-message,
            .field-success-message {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.4;
            }
            
            .field-error-message {
                background-color: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            
            .field-success-message {
                background-color: #f0fdf4;
                color: #059669;
                border: 1px solid #bbf7d0;
            }
            
            .error-icon,
            .success-icon {
                font-size: 16px;
                line-height: 1;
            }
            
            /* Enhanced error states for mobile */
            .has-error input,
            .has-error textarea {
                border-color: #dc2626 !important;
                box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
            }
            
            .has-success input,
            .has-success textarea {
                border-color: #059669 !important;
                box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1) !important;
            }
            
            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .field-error-message {
                    background-color: #450a0a;
                    color: #fca5a5;
                    border-color: #991b1b;
                }
                
                .field-success-message {
                    background-color: #064e3b;
                    color: #6ee7b7;
                    border-color: #047857;
                }
            }
            
            /* Mobile responsiveness */
            @media (max-width: 767px) {
                .field-error-message,
                .field-success-message {
                    font-size: 13px;
                    padding: 6px 10px;
                    margin-top: 6px;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .field-error-message,
                .field-success-message {
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Initialize the validation system
     */
    function init() {
        console.log('Initializing mobile form validation system...');
        
        // Add mobile validation styles
        addMobileValidationStyles();
        
        // Enhance existing forms
        enhanceAllForms();
        
        // Watch for dynamically added forms
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node is a form
                        if (node.matches && node.matches(CONFIG.selectors.forms)) {
                            enhanceForm(node);
                        }
                        
                        // Check for forms within the added node
                        const childForms = node.querySelectorAll && node.querySelectorAll(CONFIG.selectors.forms + ':not([data-validation-enhanced])');
                        if (childForms && childForms.length > 0) {
                            childForms.forEach(enhanceForm);
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
        
        // Re-enhance forms after delays to catch slow-loading content
        setTimeout(enhanceAllForms, 2000);
        setTimeout(enhanceAllForms, 5000);
        
        console.log('Mobile form validation system initialized');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose for debugging
    window.MobileFormValidation = {
        enhanceAllForms,
        enhanceForm,
        validateForm,
        validateField,
        CONFIG
    };
    
})();