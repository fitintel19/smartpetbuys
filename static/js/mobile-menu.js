/**
 * SmartPetBuys Mobile Menu
 * Handles responsive navigation menu functionality
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    initMobileMenu();
  }

  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuItems = document.querySelectorAll('.mobile-menu a');
    const body = document.body;

    // Create mobile menu if it doesn't exist
    if (!mobileMenu && menuToggle) {
      createMobileMenu();
    }

    // Add click event to menu toggle
    if (menuToggle) {
      menuToggle.addEventListener('click', toggleMobileMenu);
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-controls', 'mobile-menu');
      menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    }

    // Add click events to menu items to close menu
    menuItems.forEach(function(item) {
      item.addEventListener('click', closeMobileMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (mobileMenu && 
          !mobileMenu.contains(e.target) && 
          !menuToggle.contains(e.target) && 
          mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
        menuToggle.focus();
      }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768 && mobileMenu && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    function createMobileMenu() {
      const header = document.querySelector('.header');
      const desktopMenu = document.querySelector('#menu');
      
      if (!header || !desktopMenu) return;

      // Create mobile menu structure
      const mobileMenuDiv = document.createElement('div');
      mobileMenuDiv.className = 'mobile-menu';
      mobileMenuDiv.id = 'mobile-menu';
      
      const mobileMenuUl = document.createElement('ul');
      
      // Clone desktop menu items
      const desktopItems = desktopMenu.querySelectorAll('li');
      desktopItems.forEach(function(item) {
        const clonedItem = item.cloneNode(true);
        mobileMenuUl.appendChild(clonedItem);
      });
      
      mobileMenuDiv.appendChild(mobileMenuUl);
      header.appendChild(mobileMenuDiv);
    }

    function toggleMobileMenu() {
      const mobileMenu = document.querySelector('.mobile-menu');
      if (!mobileMenu) return;

      const isOpen = mobileMenu.classList.contains('active');
      
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    }

    function openMobileMenu() {
      const mobileMenu = document.querySelector('.mobile-menu');
      const menuToggle = document.querySelector('.menu-toggle');
      
      if (mobileMenu) {
        mobileMenu.classList.add('active');
        body.style.overflow = 'hidden'; // Prevent background scrolling
      }
      
      if (menuToggle) {
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
      }
    }

    function closeMobileMenu() {
      const mobileMenu = document.querySelector('.mobile-menu');
      const menuToggle = document.querySelector('.menu-toggle');
      
      if (mobileMenu) {
        mobileMenu.classList.remove('active');
        body.style.overflow = ''; // Restore scrolling
      }
      
      if (menuToggle) {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  }
})();