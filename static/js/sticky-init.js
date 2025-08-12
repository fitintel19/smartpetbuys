document.addEventListener('DOMContentLoaded', function () {
  // Elements
  const sidebarEl = document.querySelector('.post-sidebar');
  const innerEl = document.querySelector('.post-sidebar .sidebar__inner');
  const containerEl = document.querySelector('.post-layout');

  // Guards
  if (!sidebarEl || !innerEl || !containerEl) return;
  if (typeof StickySidebar === 'undefined') return;

  // Initialize with explicit selectors to avoid calculation glitches
  new StickySidebar('.post-sidebar', {
    topSpacing: 20,
    bottomSpacing: 20,
    containerSelector: '.post-layout',
    innerWrapperSelector: '.sidebar__inner',
    resizeSensor: true,
    minWidth: 1024
  });
});
