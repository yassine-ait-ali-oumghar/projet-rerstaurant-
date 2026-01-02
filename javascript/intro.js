(function(){
  const KEY = 'dt_intro_played_session';
  const overlay = document.getElementById('introOverlay');
  const video = document.getElementById('introVideo');

  if (!overlay || !video) return;

  const lockClass = 'intro-playing';
  document.body.classList.add(lockClass);

  function stopEvent(e){
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  function onWheel(e){
    return stopEvent(e);
  }

  function onTouchMove(e){
    return stopEvent(e);
  }

  function onContextMenu(e){
    return stopEvent(e);
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('contextmenu', onContextMenu);

  function unlock(){
    document.body.classList.remove(lockClass);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('contextmenu', onContextMenu);
  }

  function markPlayed(){
    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
  }

  function hideOverlay(){
    try {
      overlay.classList.add('intro-hidden');
      overlay.remove();
    } catch (_) {
      // ignore
    }
    unlock();
  }

  function fadeThenHide(){
    overlay.classList.add('intro-flash');
    window.setTimeout(() => {
      overlay.classList.add('intro-fade-out');
      window.setTimeout(hideOverlay, 800);
    }, 160);
  }

  const alreadyPlayed = sessionStorage.getItem(KEY) === '1';
  if (alreadyPlayed) {
    hideOverlay();
    return;
  }

  let didFinish = false;
  let transitionStarted = false;

  let hasStartedPlaying = false;
  let fallbackTimer = null;
  let transitionTimer = null;

  function clearFallback(){
    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }

  function clearTransitionTimer(){
    if (transitionTimer) {
      window.clearTimeout(transitionTimer);
      transitionTimer = null;
    }
  }

  function startTransition(){
    if (transitionStarted) return;
    transitionStarted = true;
    didFinish = true;
    clearFallback();
    clearTransitionTimer();
    markPlayed();
    try { video.pause(); } catch (_) {}
    fadeThenHide();
  }

  video.controls = false;
  video.muted = true;
  video.volume = 0;

  video.addEventListener('ended', () => {
    startTransition();
  });

  video.addEventListener('error', () => {
    startTransition();
  });

  video.addEventListener('playing', () => {
    hasStartedPlaying = true;
    clearFallback();
    transitionTimer = window.setTimeout(startTransition, 7000);
  }, { once: true });

  fallbackTimer = window.setTimeout(() => {
    if (didFinish || hasStartedPlaying) return;
    startTransition();
  }, 2000);

  async function start(){
    try {
      await video.play();
    } catch (_) {
      // Autoplay can be blocked even when muted; fallback will reveal the site.
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
})();
