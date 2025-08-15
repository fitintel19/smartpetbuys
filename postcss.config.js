module.exports = {
  plugins: [
    require('autoprefixer')({
      // Add vendor prefixes for last 2 versions of all browsers
      overrideBrowserslist: ['last 2 versions', '> 1%', 'IE 11']
    }),
    require('@fullhuman/postcss-purgecss')({
      // Paths to analyze for used CSS classes
      content: [
        './layouts/**/*.html',
        './content/**/*.md',
        './static/js/**/*.js',
        './themes/PaperMod/layouts/**/*.html'
      ],
      // CSS files to purge
      css: ['./assets/css/**/*.css'],
      // Safelist - classes to never remove
      safelist: [
        // Dynamic classes that might be added by JavaScript
        /^ml-/,           // MailerLite classes
        /^formkit-/,      // FormKit classes
        /^gtag/,          // Google Analytics classes
        /^ga-/,           // Google Analytics classes
        // State classes
        'active',
        'open',
        'closed',
        'loading',
        'loaded',
        // Mobile menu classes
        'mobile-nav-open',
        'nav-open',
        // Common utility classes that might be used dynamically
        'hidden',
        'show',
        'fade',
        'slide',
        // PaperMod theme classes that might be dynamic
        /^post-/,
        /^entry-/,
        /^nav-/,
        /^header-/,
        /^footer-/,
        // Responsive classes
        /^sm:/,
        /^md:/,
        /^lg:/,
        /^xl:/
      ],
      // Default extractors
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    }),
    require('cssnano')({
      // CSS minification options
      preset: ['default', {
        discardComments: {
          removeAll: true
        },
        normalizeWhitespace: true,
        colormin: true,
        convertValues: true,
        discardDuplicates: true,
        discardEmpty: true,
        mergeIdents: true,
        minifyFontValues: true,
        minifyParams: true,
        minifySelectors: true,
        reduceIdents: true,
        svgo: true,
        uniqueSelectors: true
      }]
    })
  ]
};