(function () {
  'use strict';

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');

  var BASE_W = 400;
  var BASE_H = 600;

  var startOverlay = document.getElementById('start-overlay');
  var gameoverOverlay = document.getElementById('gameover-overlay');
  var startBtn = document.getElementById('start-btn');
  var retryBtn = document.getElementById('retry-btn');
  var hudScore = document.getElementById('hud-score');
  var finalScoreEl = document.getElementById('final-score');
  var bestScoreEl = document.getElementById('best-score');

  var STORAGE_KEY = 'flappy-bird-best-score';

  var STATE = { READY: 'ready', PLAYING: 'playing', OVER: 'over' };
  var state = STATE.READY;

  var bird, pipes, score, frame, scale;

  var GRAVITY = 0.45;
  var FLAP_VELOCITY = -8;
  var PIPE_GAP = 160;
  var PIPE_WIDTH = 64;
  var PIPE_SPACING = 220;
  var PIPE_SPEED = 2.6;
  var BIRD_RADIUS = 14;
  var GROUND_HEIGHT = 0; // sky-only background, ground is implicit at canvas bottom

  function getBestScore() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
    } catch (e) {
      return 0;
    }
  }

  function setBestScore(value) {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch (e) { /* storage unavailable */ }
  }

  function resizeCanvas() {
    var maxWidth = canvas.parentElement.clientWidth;
    scale = Math.min(1, maxWidth / BASE_W);
    canvas.style.width = (BASE_W * scale) + 'px';
    canvas.style.height = (BASE_H * scale) + 'px';
  }

  function resetGame() {
    bird = {
      x: BASE_W * 0.3,
      y: BASE_H / 2,
      velocity: 0
    };
    pipes = [];
    score = 0;
    frame = 0;
    hudScore.textContent = '0';
    spawnPipe(BASE_W + 80);
    spawnPipe(BASE_W + 80 + PIPE_SPACING);
    spawnPipe(BASE_W + 80 + PIPE_SPACING * 2);
  }

  function spawnPipe(x) {
    var margin = 70;
    var top = margin + Math.random() * (BASE_H - PIPE_GAP - margin * 2);
    pipes.push({ x: x, top: top, passed: false });
  }

  function flap() {
    if (state === STATE.READY) {
      startGame();
    }
    if (state === STATE.PLAYING) {
      bird.velocity = FLAP_VELOCITY;
    }
  }

  function startGame() {
    state = STATE.PLAYING;
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    resetGame();
    bird.velocity = FLAP_VELOCITY;
  }

  function endGame() {
    state = STATE.OVER;
    var best = getBestScore();
    if (score > best) {
      best = score;
      setBestScore(best);
    }
    finalScoreEl.textContent = String(score);
    bestScoreEl.textContent = String(best);
    gameoverOverlay.classList.remove('hidden');
  }

  function update() {
    if (state !== STATE.PLAYING) return;

    frame++;
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Ceiling / floor collision
    if (bird.y - BIRD_RADIUS <= 0) {
      bird.y = BIRD_RADIUS;
      bird.velocity = 0;
    }
    if (bird.y + BIRD_RADIUS >= BASE_H) {
      bird.y = BASE_H - BIRD_RADIUS;
      endGame();
      return;
    }

    pipes.forEach(function (pipe) {
      pipe.x -= PIPE_SPEED;

      // Scoring
      if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
        pipe.passed = true;
        score++;
        hudScore.textContent = String(score);
      }

      // Collision with pipe
      var withinX = bird.x + BIRD_RADIUS > pipe.x && bird.x - BIRD_RADIUS < pipe.x + PIPE_WIDTH;
      var hitsTop = bird.y - BIRD_RADIUS < pipe.top;
      var hitsBottom = bird.y + BIRD_RADIUS > pipe.top + PIPE_GAP;
      if (withinX && (hitsTop || hitsBottom)) {
        endGame();
      }
    });

    // Recycle off-screen pipes
    if (pipes.length && pipes[0].x + PIPE_WIDTH < -10) {
      pipes.shift();
      var lastX = pipes[pipes.length - 1].x;
      spawnPipe(lastX + PIPE_SPACING);
    }
  }

  function drawBackground() {
    var grad = ctx.createLinearGradient(0, 0, 0, BASE_H);
    grad.addColorStop(0, '#1b2a4a');
    grad.addColorStop(0.7, '#0d1426');
    grad.addColorStop(1, '#080812');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, BASE_W, BASE_H);

    // Soft parallax "stars"
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (var i = 0; i < 18; i++) {
      var sx = (i * 53 + frame * 0.15) % BASE_W;
      var sy = (i * 97) % (BASE_H * 0.6);
      ctx.beginPath();
      ctx.arc(sx, sy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPipes() {
    pipes.forEach(function (pipe) {
      var grad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      grad.addColorStop(0, '#3fcdb7');
      grad.addColorStop(1, '#5eead4');
      ctx.fillStyle = grad;

      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
      ctx.fillRect(pipe.x - 4, pipe.top - 18, PIPE_WIDTH + 8, 18);

      // Bottom pipe
      var bottomY = pipe.top + PIPE_GAP;
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, BASE_H - bottomY);
      ctx.fillRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 18);
    });
  }

  function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    var angle = Math.max(-0.5, Math.min(0.9, bird.velocity / 10));
    ctx.rotate(angle);

    // Body
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(-3, 4, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(6, -4, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.moveTo(BIRD_RADIUS - 2, -2);
    ctx.lineTo(BIRD_RADIUS + 7, 1);
    ctx.lineTo(BIRD_RADIUS - 2, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function render() {
    drawBackground();
    drawPipes();
    drawBird();
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  // ===== INPUT =====

  function handlePointer(e) {
    e.preventDefault();
    flap();
  }

  canvas.addEventListener('mousedown', handlePointer);
  canvas.addEventListener('touchstart', handlePointer, { passive: false });

  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      flap();
    }
  });

  startBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    startGame();
  });

  retryBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    startGame();
  });

  window.addEventListener('resize', resizeCanvas);

  // ===== INIT =====
  bestScoreEl.textContent = String(getBestScore());
  resizeCanvas();
  resetGame();
  render();
  requestAnimationFrame(loop);

})();
