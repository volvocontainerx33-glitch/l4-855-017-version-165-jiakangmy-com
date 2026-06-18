
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function setupFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var search = document.querySelector('[data-filter-search]');
    var category = document.querySelector('[data-filter-category]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var count = document.querySelector('[data-result-count]');
    var clear = document.querySelector('[data-clear-filter]');

    if (!cards.length || !search) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      search.value = query;
    }

    function matches(card, key, expected) {
      if (!expected) {
        return true;
      }
      return normalize(card.getAttribute(key)) === normalize(expected);
    }

    function update() {
      var q = normalize(search.value);
      var c = category ? category.value : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchable = normalize(card.getAttribute('data-search'));
        var ok = (!q || searchable.indexOf(q) !== -1)
          && matches(card, 'data-category', c)
          && matches(card, 'data-region', r)
          && matches(card, 'data-type', t)
          && matches(card, 'data-year', y);
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible;
      }
    }

    [search, category, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', update);
        control.addEventListener('change', update);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        search.value = '';
        if (category && category.tagName === 'SELECT') {
          category.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        update();
      });
    }

    update();
  }

  function setupPlayer() {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
      return;
    }
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var attached = false;
    var hls = null;

    function attachStream() {
      if (attached || !stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        attached = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        attached = true;
        return;
      }
      video.src = stream;
      attached = true;
    }

    function play() {
      attachStream();
      button.classList.add('is-hidden');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (!attached) {
        play();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
