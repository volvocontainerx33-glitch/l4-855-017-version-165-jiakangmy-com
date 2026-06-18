(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-main-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const root = document.querySelector("[data-hero-root]");

    if (!root) {
      return;
    }

    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const prev = root.querySelector("[data-hero-prev]");
    const next = root.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    restart();
  }

  function setupFilters() {
    const roots = Array.from(document.querySelectorAll("[data-filter-root]"));

    roots.forEach(function (root) {
      const keywordInput = root.querySelector("[data-filter-keyword]");
      const yearSelect = root.querySelector("[data-filter-year]");
      const typeSelect = root.querySelector("[data-filter-type]");
      const regionSelect = root.querySelector("[data-filter-region]");
      const cards = Array.from(document.querySelectorAll("[data-filter-card]"));

      if (root.dataset.queryFromUrl === "true" && keywordInput) {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        if (query) {
          keywordInput.value = query;
        }
      }

      function apply() {
        const keyword = normalize(keywordInput ? keywordInput.value : "");
        const year = normalize(yearSelect ? yearSelect.value : "");
        const type = normalize(typeSelect ? typeSelect.value : "");
        const region = normalize(regionSelect ? regionSelect.value : "");

        cards.forEach(function (card) {
          const combined = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          const matchesKeyword = !keyword || combined.indexOf(keyword) !== -1;
          const matchesYear = !year || normalize(card.dataset.year) === year;
          const matchesType = !type || normalize(card.dataset.type) === type;
          const matchesRegion = !region || normalize(card.dataset.region) === region;
          card.classList.toggle("is-hidden", !(matchesKeyword && matchesYear && matchesType && matchesRegion));
        });
      }

      [keywordInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
