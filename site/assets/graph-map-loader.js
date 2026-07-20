const desktopGraph = window.matchMedia('(min-width: 1025px)');
const main = document.querySelector('.graph-map-page .map-main');

if (main && desktopGraph.matches) {
  void import('./graph-map.js');
} else if (main) {
  const fallback = main.dataset.mobileFallback;
  main.remove();
  if (fallback && window.location.pathname.endsWith('/graph/')) window.location.replace(fallback);
}

desktopGraph.addEventListener('change', (event) => {
  if (!event.matches) document.querySelector('.graph-map-page .map-main')?.remove();
});
