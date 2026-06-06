document.addEventListener('DOMContentLoaded', function () {

  // ===== HEADER SCROLL STATE =====
  var header = document.querySelector('.site-header');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveNav();
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  // ===== MOBILE NAV TOGGLE =====
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    });
  });

  // ===== ACTIVE NAV LINK ON SCROLL =====
  var navLinks = nav.querySelectorAll('a[href^="#"]');
  var sections = Array.from(navLinks)
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  function updateActiveNav() {
    var scrollPos = window.scrollY + 140;
    var current = null;

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        current = section;
      }
    });

    navLinks.forEach(function (link) {
      var match = current && link.getAttribute('href') === '#' + current.id;
      link.classList.toggle('active', !!match);
    });
  }

  // ===== SCROLL REVEAL ANIMATIONS =====
  var revealTargets = document.querySelectorAll(
    '.about-grid > p, .about-highlights li, .project-card, .skill-group, .contact-panel'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ===== FOOTER YEAR =====
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

});
(function () {
  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var year = document.getElementById('year');
  var navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function closeNav() {
    if (!nav || !navToggle) {
      return;
    }
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('scroll', function () {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }, { passive: true });

  var sections = document.querySelectorAll('section[id]');
  if (sections.length && navLinks.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          var isActive = link.getAttribute('href') === '#' + id;
          link.style.color = isActive ? 'var(--text)' : '';
        });
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
})();
