/* Homepage video windows (.vid-card in the Explore section).
   - Before playing, and again after a video ends, the banner image (the video's poster) is shown
     with a big play button on it.
   - Only one video plays at a time: starting one pauses the other.
   - Nothing is downloaded until a visitor presses play (preload="none"), which keeps the page fast.
   If this script does not run, the plain browser video controls still work. */
(function () {
  'use strict';

  var cards = Array.prototype.slice.call(document.querySelectorAll('.vid-card'));
  if (!cards.length) return;

  var players = [];

  function pauseOthers(current) {
    players.forEach(function (p) {
      if (p.video !== current) p.video.pause();
    });
  }

  cards.forEach(function (card) {
    var frame = card.querySelector('.vid-frame');
    var video = card.querySelector('video');
    if (!frame || !video) return;

    var title = card.getAttribute('data-title') || 'video';

    function showBanner() {
      video.controls = false;
      card.classList.remove('is-playing');
      card.classList.add('is-idle');
    }

    function showPlayer() {
      video.controls = true;
      card.classList.remove('is-idle');
      card.classList.add('is-playing');
    }

    /* Swap the browser's own controls for one big play button until the visitor starts the video */
    video.removeAttribute('controls');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'vid-play';
    button.setAttribute('aria-label', 'Play video: ' + title);
    var circle = document.createElement('span');
    circle.className = 'circle';
    circle.setAttribute('aria-hidden', 'true');
    button.appendChild(circle);
    frame.appendChild(button);
    card.classList.add('is-idle');

    button.addEventListener('click', function () {
      pauseOthers(video);
      showPlayer();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () { showBanner(); }); /* browser refused to play: back to the banner */
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'home_video_play', { video_title: title });
      }
    });

    /* Playback started some other way (e.g. the native controls): keep the page state in step */
    video.addEventListener('play', function () {
      pauseOthers(video);
      showPlayer();
    });

    /* Finished: go back to the banner and the play button */
    video.addEventListener('ended', function () {
      showBanner();
      video.load(); /* resets the player so the banner shows again */
    });

    players.push({ video: video, card: card });
  });
})();
