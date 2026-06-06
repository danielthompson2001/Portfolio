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
