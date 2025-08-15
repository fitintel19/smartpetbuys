// PurgeCSS Configuration for SmartPetBuys
// This removes unused CSS to reduce bundle size

module.exports = {
  content: [
    './layouts/**/*.html',
    './content/**/*.md',
    './static/js/**/*.js',
    './themes/PaperMod/layouts/**/*.html',
    // Include Hugo's generated files
    './public/**/*.html'
  ],
  css: [
    './assets/css/extended/**/*.css',
    './public/assets/css/**/*.css'
  ],
  defaultExtractor: content => {
    // Enhanced extraction for Hugo templates and dynamic classes
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
    const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
    return broadMatches.concat(innerMatches);
  },
  safelist: [
    // Critical navigation classes
    'nav', 'nav-wrapper', 'nav-links', 'nav-link',
    'logo', 'mobile-menu-toggle', 'mobile-nav',
    
    // Layout classes
    'main', 'header', 'footer', 'site-footer',
    'page-header', 'post-header', 'post-content',
    
    // Component classes
    'btn', 'button', 'post-card', 'post-meta',
    'home-content', 'page-content',
    
    // State classes
    'active', 'show', 'hide', 'open', 'closed',
    
    // MailerLite classes (dynamically injected)
    /^ml-/, /^mailerlite-/, /^formkit-/,
    
    // PaperMod theme classes
    /^post-/, /^entry-/, /^archive-/,
    
    // Responsive classes
    /^mobile-/, /^desktop-/, /^tablet-/,
    
    // Utility classes
    /^text-/, /^bg-/, /^border-/, /^p-/, /^m-/, /^w-/, /^h-/,
    
    // Animation classes
    /^fade/, /^slide/, /^bounce/,
    
    // Hugo generated classes
    'highlight', 'chroma',
    
    // Schema.org microdata classes
    /^schema-/, /^microdata-/
  ],
  blocklist: [
    // Remove unused theme variants
    'dark-theme-variant-2',
    'light-theme-variant-2',
    
    // Remove unused social icons
    'fa-', 'fab-', 'fas-', // Font Awesome (if not used)
    
    // Remove unused PaperMod features
    'profile-mode', 'search-results', 'terms-list'
  ],
  keyframes: true, // Keep animations
  fontFace: true,  // Keep font declarations
  variables: true, // Keep CSS custom properties
  
  // Performance optimizations
  rejected: false,  // Don't output rejected selectors (faster)
  
  // Whitespace optimization
  whitelistPatterns: [
    // Keep dynamic classes that might be added by JS
    /^js-/,
    /^is-/,
    /^has-/,
    /^dynamic-/
  ],
  
  // File-specific configurations
  whitelistPatternsChildren: [
    // Keep children of these patterns
    /^post-content/,
    /^main-content/,
    /^article/
  ]
};