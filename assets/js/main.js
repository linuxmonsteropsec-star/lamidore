/* La Mi Do Ré — main.js
   Shared behaviour for every page: nav, reveals, counters,
   accordions, sliders, forms, filters, footer year. */

(function () {
  'use strict';

  var body = document.body;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    initYear();
    initNavbar();
    initMobileNav();
    initReveal();
    initCounters();
    initAccordions();
    initSliders();
    initForms();
    initBlogFilter();
    initActiveNav();
  });

  /* ---------- Footer year ---------- */
  function initYear() {
    var els = document.querySelectorAll('[data-year]');
    var y = String(new Date().getFullYear());
    for (var i = 0; i < els.length; i++) els[i].textContent = y;
  }

  /* ---------- Sticky nav elevation ---------- */
  function initNavbar() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    var onScroll = function () {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  function initMobileNav() {
    var toggle = document.querySelector('.nav__toggle');
    var drawer = document.querySelector('.nav__drawer');
    if (!toggle || !drawer) return;

    var close = function () {
      drawer.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('nav-locked');
    };

    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.classList.toggle('is-active', open);
      toggle.setAttribute('aria-expanded', String(open));
      body.classList.toggle('nav-locked', open);
    });

    // Close when a link is tapped inside the drawer
    var links = drawer.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', close);
    }
    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1600;
        var start = null;
        var step = function (now) {
          if (start === null) start = now;
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString('fr-FR') + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = Math.round(target).toLocaleString('fr-FR') + suffix;
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
  }

  /* ---------- Accordion ---------- */
  function initAccordions() {
    var groups = document.querySelectorAll('[data-accordion]');
    for (var g = 0; g < groups.length; g++) {
      (function (group) {
        var items = group.querySelectorAll('.accordion__item');
        for (var i = 0; i < items.length; i++) {
          (function (item) {
            var btn = item.querySelector('.accordion__btn');
            var panel = item.querySelector('.accordion__panel');
            if (!btn || !panel) return;
            btn.addEventListener('click', function () {
              var willOpen = !item.classList.contains('is-open');
              // close every item in this group first
              for (var j = 0; j < items.length; j++) {
                items[j].classList.remove('is-open');
                items[j].querySelector('.accordion__panel').style.maxHeight = null;
                items[j].querySelector('.accordion__btn').setAttribute('aria-expanded', 'false');
              }
              if (willOpen) {
                item.classList.add('is-open');
                panel.style.maxHeight = panel.scrollHeight + 'px';
                btn.setAttribute('aria-expanded', 'true');
              }
            });
          })(items[i]);
        }
      })(groups[g]);
    }
  }

  /* ---------- Testimonial slider ---------- */
  function initSliders() {
    var sliders = document.querySelectorAll('[data-slider]');
    for (var s = 0; s < sliders.length; s++) {
      (function (slider) {
        var track = slider.querySelector('.slider__track');
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.slider__slide'));
        var prev = slider.querySelector('[data-slider-prev]');
        var next = slider.querySelector('[data-slider-next]');
        var dotsWrap = slider.querySelector('.slider__dots');
        if (!track || slides.length < 2) return;
        var idx = 0;

        slides.forEach(function (_, i) {
          var dot = document.createElement('button');
          dot.className = 'slider__dot';
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Aller à l\'avis ' + (i + 1));
          dot.addEventListener('click', function () { go(i); });
          dotsWrap.appendChild(dot);
        });

        var dots = function () {
          return Array.prototype.slice.call(slider.querySelectorAll('.slider__dot'));
        };

        var update = function () {
          track.style.transform = 'translateX(-' + idx * 100 + '%)';
          var allDots = dots();
          for (var i = 0; i < allDots.length; i++) {
            allDots[i].classList.toggle('is-active', i === idx);
          }
          if (prev) prev.disabled = idx === 0;
          if (next) next.disabled = idx === slides.length - 1;
        };

        var go = function (i) {
          if (i < 0 || i > slides.length - 1) return;
          idx = i;
          update();
        };

        if (prev) prev.addEventListener('click', function () { go(idx - 1); });
        if (next) next.addEventListener('click', function () { go(idx + 1); });
        update();
      })(sliders[s]);
    }
  }

  /* ---------- Forms (demo) ---------- */
  function initForms() {
    var forms = document.querySelectorAll('[data-form]');
    for (var i = 0; i < forms.length; i++) {
      (function (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          form.classList.add('was-validated');
          if (!form.checkValidity()) return;

          var btn = form.querySelector('button[type="submit"]');
          if (btn) {
            btn.disabled = true;
            var original = btn.textContent;
            btn.textContent = 'Envoi…';
            window.setTimeout(function () {
              btn.disabled = false;
              btn.textContent = original;
            }, 1400);
          }
          var msg = form.querySelector('[data-form-msg]');
          if (msg) {
            msg.hidden = false;
            msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          form.reset();
          form.classList.remove('was-validated');
        });
      })(forms[i]);
    }
  }

  /* ---------- Blog category filter ---------- */
  function initBlogFilter() {
    var filter = document.querySelector('[data-blog-filter]');
    var posts = document.querySelectorAll('[data-post]');
    if (!filter || !posts.length) return;
    filter.addEventListener('change', function () {
      var v = filter.value;
      for (var i = 0; i < posts.length; i++) {
        posts[i].hidden = v !== 'all' && posts[i].getAttribute('data-category') !== v;
      }
    });
  }

  /* ---------- Active nav link ---------- */
  function initActiveNav() {
    var page = body.getAttribute('data-page');
    if (!page) return;
    var links = document.querySelectorAll('.nav__link');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '';
      var file = href.split('#')[0].split('?')[0] || 'index.html';
      if (file === page) { links[i].classList.add('is-active'); links[i].setAttribute('aria-current', 'page'); }
    }
  }
})();
