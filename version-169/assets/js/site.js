(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === index);
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
            }
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var form = document.querySelector("[data-filter-form]");
        var list = document.querySelector("[data-filter-list]");
        if (!form || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var queryInput = form.querySelector("[data-filter-query]");
        var categorySelect = form.querySelector("[data-filter-category]");
        var typeSelect = form.querySelector("[data-filter-type]");
        var regionSelect = form.querySelector("[data-filter-region]");
        var yearSelect = form.querySelector("[data-filter-year]");
        var clearButton = form.querySelector("[data-filter-clear]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (queryInput && initialQuery) {
            queryInput.value = initialQuery;
        }

        function matches(card) {
            var text = normalize(card.getAttribute("data-search"));
            var title = normalize(card.getAttribute("data-title"));
            var query = normalize(queryInput ? queryInput.value : "");
            var category = normalize(categorySelect ? categorySelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var okQuery = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
            var okCategory = !category || normalize(card.getAttribute("data-category")) === category;
            var okType = !type || normalize(card.getAttribute("data-type")) === type;
            var okRegion = !region || normalize(card.getAttribute("data-region")) === region;
            var okYear = !year || normalize(card.getAttribute("data-year")) === year;
            return okQuery && okCategory && okType && okRegion && okYear;
        }

        function apply() {
            var visible = 0;
            cards.forEach(function (card) {
                var keep = matches(card);
                card.classList.toggle("hidden-card", !keep);
                if (keep) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("visible", visible === 0);
            }
        }

        [queryInput, categorySelect, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
        });

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                [queryInput, categorySelect, typeSelect, regionSelect, yearSelect].forEach(function (control) {
                    if (control) {
                        control.value = "";
                    }
                });
                apply();
            });
        }

        apply();
    }

    window.initMoviePlayer = function (id, source) {
        ready(function () {
            var shell = document.getElementById(id);
            if (!shell) {
                return;
            }
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            var started = false;
            var hlsInstance = null;

            function attach() {
                if (started || !video) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                if (cover) {
                    cover.classList.add("hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        if (cover) {
                            cover.classList.remove("hidden");
                        }
                    });
                }
            }

            if (cover) {
                cover.addEventListener("click", attach);
            }
            video.addEventListener("click", function () {
                if (!started) {
                    attach();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
