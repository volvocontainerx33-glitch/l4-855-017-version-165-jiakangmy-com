(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function showSlide(index) {
    var slides = qsa('[data-hero-slide]');
    var thumbs = qsa('[data-hero-thumb]');
    if (!slides.length) {
      return;
    }
    var safeIndex = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === safeIndex);
    });
    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('active', i === safeIndex);
    });
    document.documentElement.dataset.heroIndex = String(safeIndex);
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    if (!slides.length) {
      return;
    }
    showSlide(0);
    qsa('[data-hero-thumb]').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        showSlide(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      });
    });
    window.setInterval(function () {
      var current = Number(document.documentElement.dataset.heroIndex || '0');
      showSlide(current + 1);
    }, 5000);
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var menu = qs('[data-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-year') || ''
    ].join(' ').toLowerCase();
  }

  function initFilters() {
    var input = qs('[data-search]');
    var buttons = qsa('[data-filter]');
    var cards = qsa('.movie-card');
    if (!cards.length) {
      return;
    }
    var active = 'all';
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var content = textOf(card);
        var matchQuery = !query || content.indexOf(query) !== -1;
        var matchFilter = active === 'all' || content.indexOf(active.toLowerCase()) !== -1;
        card.style.display = matchQuery && matchFilter ? '' : 'none';
      });
    }
    if (input) {
      input.addEventListener('input', apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        active = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  }

  function loadVideo(video) {
    if (!video) {
      return Promise.resolve();
    }
    var src = video.getAttribute('data-video');
    if (!src) {
      return Promise.resolve();
    }
    if (video.dataset.ready === '1') {
      return video.play().catch(function () {});
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.dataset.ready = '1';
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
          resolve();
        });
      });
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.ready = '1';
      return video.play().catch(function () {});
    }
    video.src = src;
    video.dataset.ready = '1';
    return video.play().catch(function () {});
  }

  function initPlayer() {
    qsa('[data-play-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        var video = document.getElementById(button.getAttribute('data-play-target'));
        loadVideo(video).then(function () {
          button.classList.add('hide');
        });
      });
    });
    qsa('.movie-video').forEach(function (video) {
      video.addEventListener('play', function () {
        var overlay = qs('[data-play-target="' + video.id + '"]');
        if (overlay) {
          overlay.classList.add('hide');
        }
      });
      video.addEventListener('click', function () {
        if (!video.dataset.ready) {
          loadVideo(video);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initMenu();
    initFilters();
    initPlayer();
  });
})();
