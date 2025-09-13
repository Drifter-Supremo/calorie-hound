// Mobile Visual Viewport Helpers
// Sets --vvh to the current visual viewport height in px.
(function () {
  function setVH() {
    var h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    document.documentElement.style.setProperty('--vvh', h + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setVH, { passive: true });
  }
  // Handle bfcache restores
  window.addEventListener('pageshow', function (e) { if (e.persisted) setVH(); });

  // Optional: start at top to avoid initial scroll jumps on iOS
  window.addEventListener('load', function () {
    requestAnimationFrame(function () { window.scrollTo(0, 0); });
  });
})();

