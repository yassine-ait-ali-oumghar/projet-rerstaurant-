

(function(){
  const KEY = 'dt_intro_played_session';//session storage key to track if intro was played this session
  const overlay = document.getElementById('introOverlay');//Gets the intro overlay and video from HTML
  const video = document.getElementById('introVideo');

  if (!overlay || !video) return;//if one of them is missing stop the script

  const lockClass = 'intro-playing';
  document.body.classList.add(lockClass);//prevents scrolling and right-clicking during intro


  //blocks user action 
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
//Disables scrolling and right-click while intro is active
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('contextmenu', onContextMenu);

  
  // Clean up event listeners when intro ends
  function unlock(){
    document.body.classList.remove(lockClass);
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('contextmenu', onContextMenu);
  }


  //Saves that intro was already shown in this session.
  function markPlayed(){
    try { sessionStorage.setItem(KEY, '1'); } catch (_) {}
  }
//Hides and removes the intro overlay and unlocks the page.
  function hideOverlay(){
    try {
      overlay.classList.add('intro-hidden');
      overlay.remove();
    } catch (_) {
      // ignore
    }
    unlock();
  }
//Plays a flash → fade animation → hides overlay.
  function fadeThenHide(){
    overlay.classList.add('intro-flash');
    window.setTimeout(() => {
      overlay.classList.add('intro-fade-out');
      window.setTimeout(hideOverlay, 800);
    }, 160);
  }
//If intro was already shown, skip everything.
  const alreadyPlayed = sessionStorage.getItem(KEY) === '1';
  if (alreadyPlayed) {
    hideOverlay();
    return;
  }
//Prevents multiple transitions.
  let didFinish = false;
  let transitionStarted = false;

//Used for safety timers if video fails.
  let hasStartedPlaying = false;
  let fallbackTimer = null;
  let transitionTimer = null;
//Stops fallback timer.
  function clearFallback(){
    if (fallbackTimer) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }
//Stops transition timer.
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