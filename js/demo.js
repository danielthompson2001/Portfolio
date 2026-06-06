/**
 * Particleground init
 * @author Jonathan Nicol - @mrjnicol
 */

document.addEventListener('DOMContentLoaded', function () {
  var particles = document.getElementById('particles');
  if (particles) {
    particleground(particles, {
      dotColor: '#5eead4',
      lineColor: '#5eead4',
      particleRadius: 4,
      proximity: 90
    });
  }
});
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
