(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === activeSlide);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterInput = document.querySelector('[data-filter-input]');
    var filterCategory = document.querySelector('[data-filter-category]');
    var filterYear = document.querySelector('[data-filter-year]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var noResults = document.querySelector('[data-no-results]');

    function readQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
        if (!filterCards.length) {
            return;
        }

        var keyword = normalize(filterInput ? filterInput.value : '');
        var category = filterCategory ? normalize(filterCategory.value) : '';
        var year = filterYear ? normalize(filterYear.value) : '';
        var visible = 0;

        filterCards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category'),
                card.getAttribute('data-year')
            ].join(' '));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matchKeyword = !keyword || haystack.indexOf(keyword) >= 0;
            var matchCategory = !category || cardCategory === category;
            var matchYear = !year || cardYear === year;
            var show = matchKeyword && matchCategory && matchYear;

            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });

        if (noResults) {
            noResults.style.display = visible ? 'none' : 'block';
        }
    }

    if (filterInput) {
        var initialQuery = readQueryParam('q');
        if (initialQuery) {
            filterInput.value = initialQuery;
        }
        filterInput.addEventListener('input', applyFilter);
    }

    if (filterCategory) {
        filterCategory.addEventListener('change', applyFilter);
    }

    if (filterYear) {
        filterYear.addEventListener('change', applyFilter);
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });
        applyFilter();
    }
})();

function setupPlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var streamUrl = config.url;
    var loaded = false;
    var hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function attachStream() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        loaded = true;
    }

    function playVideo() {
        attachStream();
        overlay.classList.add('is-hidden');
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });

    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
