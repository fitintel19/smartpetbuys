document.addEventListener('DOMContentLoaded', function () {
  if (typeof gtag !== 'function') return;

  function sendEvent(name, params) {
    try { gtag('event', name, params || {}); } catch (e) {}
  }

  // Affiliate links: Amazon + any CTA button in product boxes
  const affiliateSelectors = [
    'a.cta-button',
    'a[href*="amzn.to"]',
    'a[href*="amazon.com"]'
  ];

  document.body.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;

    const href = a.getAttribute('href') || '';

    // Affiliate click
    if (affiliateSelectors.some(sel => a.matches(sel))) {
      sendEvent('affiliate_click', {
        link_url: href,
        link_text: (a.textContent || '').trim(),
        page_location: location.href
      });
      return;
    }

    // Generic outbound click (non-internal)
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) {
        sendEvent('outbound_click', {
          link_url: url.href,
          link_text: (a.textContent || '').trim(),
          page_location: location.href
        });
      }
    } catch (_) {}
  }, true);
});
