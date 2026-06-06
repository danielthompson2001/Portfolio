document.addEventListener('DOMContentLoaded', function () {
  var particles = document.getElementById('particles');
  if (!particles || typeof particleground !== 'function') {
    return;
  }

  particleground(particles, {
    dotColor: '#e83951',
    lineColor: 'rgba(232, 57, 81, 0.18)',
    density: 12000,
    parallax: true,
    parallaxMultiplier: 5
  });
}, false);
