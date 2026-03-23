/**
 * Portfolio - main script
 */

document.addEventListener('DOMContentLoaded', function () {

  // Initialize particle background on hero section
  particleground(document.getElementById('particles'), {
    dotColor: '#5cbdaa',
    lineColor: '#5cbdaa'
  });

  // ===== NAVBAR =====

  var navbar = document.getElementById('navbar');

  // Add scrolled class for solid background after scrolling
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveNav();
  });

  // Mobile nav toggle
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');

  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // ===== SMOOTH SCROLL =====

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===== ACTIVE NAV HIGHLIGHTING =====

  function updateActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      var link = document.querySelector('.nav-links a[href="#' + id + '"]');

      if (link && scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-links a').forEach(function (l) {
          l.classList.remove('active');
        });
        link.classList.add('active');
      }
    });
  }

  // ===== SCROLL FADE-IN ANIMATION =====

  var fadeTargets = document.querySelectorAll(
    '.skill-card, .project-card, .about-text, .contact-text, .contact-links'
  );

  fadeTargets.forEach(function (el) {
    el.classList.add('fade-in');
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    fadeTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    fadeTargets.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // Set initial active nav state
  updateActiveNav();

});
