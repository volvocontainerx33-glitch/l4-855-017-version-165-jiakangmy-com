(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === active);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
      });
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        showSlide(position);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var regionSelect = scope.querySelector('[data-filter-region]');
    var typeSelect = scope.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var emptyState = scope.querySelector('[data-empty-state]');

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' '));
        var regionMatch = !region || card.getAttribute('data-region') === region;
        var typeMatch = !type || card.getAttribute('data-type') === type;
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var matched = regionMatch && typeMatch && keywordMatch;

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play-button]');
    var source = video ? video.getAttribute('data-stream') : '';
    var started = false;
    var hlsInstance = null;

    function startPlayback() {
      if (!video || !source) {
        return;
      }

      if (!started) {
        started = true;
        shell.classList.add('is-playing');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    shell.addEventListener('click', function (event) {
      if (event.target === shell || event.target === video || event.target.closest('.player-cover')) {
        startPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
