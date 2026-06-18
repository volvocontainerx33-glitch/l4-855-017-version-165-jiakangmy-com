/* Clear site interactions: mobile navigation, hero carousel and static DOM filtering. */

(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        const button = document.querySelector('[data-menu-toggle]');
        const menu = document.querySelector('[data-mobile-menu]');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHeroCarousel() {
        const hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const previous = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMovieFilter() {
        const filter = document.querySelector('[data-movie-filter]');

        if (!filter) {
            return;
        }

        const keywordInput = filter.querySelector('[data-filter-keyword]');
        const categorySelect = filter.querySelector('[data-filter-category]');
        const typeSelect = filter.querySelector('[data-filter-type]');
        const yearSelect = filter.querySelector('[data-filter-year]');
        const countOutput = document.querySelector('[data-filter-count]');
        const noResults = document.querySelector('[data-no-results]');
        const cards = Array.from(document.querySelectorAll('[data-title]'));

        function cardMatches(card) {
            const keyword = normalize(keywordInput ? keywordInput.value : '');
            const category = normalize(categorySelect ? categorySelect.value : '');
            const type = normalize(typeSelect ? typeSelect.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.category
            ].join(' '));

            if (keyword && !haystack.includes(keyword)) {
                return false;
            }

            if (category && normalize(card.dataset.category) !== category) {
                return false;
            }

            if (type && !normalize(card.dataset.type).includes(type)) {
                return false;
            }

            if (year && !normalize(card.dataset.year).includes(year)) {
                return false;
            }

            return true;
        }

        function applyFilter() {
            let visible = 0;

            cards.forEach(function (card) {
                const matched = cardMatches(card);
                card.classList.toggle('hidden-by-filter', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (countOutput) {
                countOutput.textContent = '当前显示 ' + visible + ' 部 / 共 ' + cards.length + ' 部';
            }

            if (noResults) {
                noResults.style.display = visible === 0 ? 'block' : 'none';
            }
        }

        [keywordInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupMovieFilter();
    });
})();
