function ready(fn) {
    if (document.readyState !== "loading") {
        fn();
        return;
    }
    document.addEventListener("DOMContentLoaded", fn);
}

function bindMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
        return;
    }
    toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;
    function show(next) {
        if (!slides.length) {
            return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === index);
        });
    }
    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            var next = Number(dot.getAttribute("data-hero-dot"));
            show(next);
        });
    });
    window.setInterval(function () {
        show(index + 1);
    }, 5800);
}

function bindSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll("[data-site-search]")).forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var target = form.getAttribute("data-search-url") || "./search.html";
            if (query) {
                window.location.href = target + "?q=" + encodeURIComponent(query);
            } else {
                window.location.href = target;
            }
        });
    });
}

function bindFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    if (!panels.length) {
        return;
    }
    var params = new URLSearchParams(window.location.search);
    panels.forEach(function (panel) {
        var root = panel.parentElement || document;
        var input = panel.querySelector("[data-filter-text]");
        var category = panel.querySelector("[data-filter-category]");
        var type = panel.querySelector("[data-filter-type]");
        var region = panel.querySelector("[data-filter-region]");
        var year = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
        var initialQuery = params.get("q") || "";
        if (input && initialQuery) {
            input.value = initialQuery;
        }
        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }
        function filter() {
            var q = valueOf(input);
            var c = valueOf(category);
            var t = valueOf(type);
            var r = valueOf(region);
            var y = valueOf(year);
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" ").toLowerCase();
                var visible = true;
                if (q && haystack.indexOf(q) === -1) {
                    visible = false;
                }
                if (c && (card.getAttribute("data-category") || "").toLowerCase() !== c) {
                    visible = false;
                }
                if (t && (card.getAttribute("data-type") || "").toLowerCase() !== t) {
                    visible = false;
                }
                if (r && (card.getAttribute("data-region") || "").toLowerCase() !== r) {
                    visible = false;
                }
                if (y && (card.getAttribute("data-year") || "").toLowerCase() !== y) {
                    visible = false;
                }
                card.classList.toggle("is-hidden", !visible);
            });
        }
        [input, category, type, region, year].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener("input", filter);
            element.addEventListener("change", filter);
        });
        filter();
    });
}

function initMoviePlayer(playerId, playlistUrl) {
    var video = document.getElementById(playerId);
    if (!video) {
        return;
    }
    var shell = video.closest(".player-shell");
    var button = shell ? shell.querySelector(".play-layer") : null;
    var loaded = false;
    var hlsInstance = null;
    function load() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playlistUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(playlistUrl);
            hlsInstance.attachMedia(video);
            return;
        }
        video.src = playlistUrl;
    }
    function play() {
        load();
        if (button) {
            button.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }
    }
    if (button) {
        button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });
    video.addEventListener("ended", function () {
        if (button) {
            button.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

ready(function () {
    bindMenu();
    bindHero();
    bindSearchForms();
    bindFilters();
});
