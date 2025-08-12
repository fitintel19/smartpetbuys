document.addEventListener('DOMContentLoaded', function () {
  // Ensure required elements exist
  const sidebar = document.querySelector('.post-sidebar .sidebar__inner');
  const container = document.querySelector('.post-layout');
  if (!sidebar || !container || typeof StickySidebar === 'undefined') return;

  // Initialize StickySidebar
  // parent container: .post-sidebar; inner: .sidebar__inner
  new StickySidebar('.post-sidebar .sidebar__inner', {
    topSpacing: 20,
    bottomSpacing: 20,
    containerSelector: '.post-layout',
    innerWrapperSelector: '.sidebar__inner',
    resizeSensor: true,
    minWidth: 1024
  });
});
