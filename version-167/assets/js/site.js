(function () {
  var ready = function (fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  };

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (!slides.length) return;
    var index = 0;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupGridFilter() {
    var input = document.querySelector('.grid-search');
    var year = document.querySelector('.filter-year');
    var type = document.querySelector('.filter-type');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));
    if (!cards.length) return;
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      cards.forEach(function (card) {
        var okText = !q || (card.getAttribute('data-search') || '').indexOf(q) !== -1;
        var okYear = !y || card.getAttribute('data-year') === y;
        var okType = !t || card.getAttribute('data-type') === t;
        card.hidden = !(okText && okYear && okType);
      });
    };
    [input, year, type].forEach(function (el) {
      if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
    });
  }

  function makeSearchCard(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="' + item.url + '">',
      '<img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shadow"></span>',
      '<span class="play-hover" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg></span>',
      '<span class="year-chip">' + item.year + '</span>',
      '</a>',
      '<div class="card-info">',
      '<div class="meta-row"><span>' + escapeHtml(item.genre) + '</span><em>' + escapeHtml(item.region) + '</em></div>',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
    });
  }

  function setupSearchPage() {
    if (!document.body.hasAttribute('data-search-page')) return;
    var data = window.SEARCH_INDEX || [];
    var input = document.getElementById('search-page-input');
    var year = document.getElementById('search-page-year');
    var type = document.getElementById('search-page-type');
    var results = document.getElementById('search-results');
    if (!input || !results) return;
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    var render = function () {
      var q = input.value.trim().toLowerCase();
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var matches = data.filter(function (item) {
        var okText = !q || item.search.indexOf(q) !== -1;
        var okYear = !y || String(item.year) === y;
        var okType = !t || item.type === t;
        return okText && okYear && okType;
      }).slice(0, 120);
      results.innerHTML = matches.length ? matches.map(makeSearchCard).join('') : '<div class="empty-state">暂无匹配内容</div>';
    };
    [input, year, type].forEach(function (el) {
      if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', render);
    });
    render();
  }

  window.initializeVideo = function (source) {
    var video = document.getElementById('movie-player');
    var button = document.getElementById('play-button');
    if (!video || !button || !source) return;
    var box = video.closest('.player-box');
    var prepared = false;
    var hls = null;
    var prepare = function () {
      if (prepared) return;
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    var start = function () {
      prepare();
      if (box) box.classList.add('playing');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (box) box.classList.remove('playing');
        });
      }
    };
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) start();
    });
    video.addEventListener('play', function () {
      if (box) box.classList.add('playing');
    });
    video.addEventListener('pause', function () {
      if (box) box.classList.remove('playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupGridFilter();
    setupSearchPage();
  });
})();
