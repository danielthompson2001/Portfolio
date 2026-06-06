(function () {
  'use strict';

  // ---- Simulated metric streams -------------------------------------------
  // Each metric is a random walk constrained to a realistic range, redrawn
  // on a small canvas "sparkline" and reflected in the headline value.

  var METRICS = {
    temp: {
      valueEl: document.getElementById('temp-value'),
      canvas: document.getElementById('temp-chart'),
      value: 22.4,
      min: 16,
      max: 30,
      step: 0.6,
      decimals: 1,
      color: '#5eead4',
      history: []
    },
    humidity: {
      valueEl: document.getElementById('humidity-value'),
      canvas: document.getElementById('humidity-chart'),
      value: 48,
      min: 30,
      max: 75,
      step: 1.5,
      decimals: 0,
      color: '#7dd3fc',
      history: []
    },
    aqi: {
      valueEl: document.getElementById('aqi-value'),
      canvas: document.getElementById('aqi-chart'),
      value: 42,
      min: 15,
      max: 120,
      step: 4,
      decimals: 0,
      color: '#facc15',
      history: []
    }
  };

  var HISTORY_LENGTH = 40;

  function step(metric) {
    var delta = (Math.random() - 0.5) * 2 * metric.step;
    var next = metric.value + delta;
    next = Math.max(metric.min, Math.min(metric.max, next));
    metric.value = next;
    metric.history.push(next);
    if (metric.history.length > HISTORY_LENGTH) {
      metric.history.shift();
    }
    return next;
  }

  function drawSparkline(metric) {
    var canvas = metric.canvas;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var data = metric.history;

    ctx.clearRect(0, 0, w, h);
    if (data.length < 2) return;

    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = (max - min) || 1;
    var pad = 6;

    function pointAt(i) {
      var x = pad + (i / (HISTORY_LENGTH - 1)) * (w - pad * 2);
      var y = h - pad - ((data[i] - min) / range) * (h - pad * 2);
      return [x, y];
    }

    // Filled area
    ctx.beginPath();
    var first = pointAt(0);
    ctx.moveTo(first[0], first[1]);
    for (var i = 1; i < data.length; i++) {
      var p = pointAt(i);
      ctx.lineTo(p[0], p[1]);
    }
    var lastPoint = pointAt(data.length - 1);
    ctx.lineTo(lastPoint[0], h);
    ctx.lineTo(first[0], h);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, hexToRgba(metric.color, 0.22));
    grad.addColorStop(1, hexToRgba(metric.color, 0));
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(first[0], first[1]);
    for (var j = 1; j < data.length; j++) {
      var pt = pointAt(j);
      ctx.lineTo(pt[0], pt[1]);
    }
    ctx.strokeStyle = metric.color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Dot at latest point
    ctx.beginPath();
    ctx.arc(lastPoint[0], lastPoint[1], 3, 0, Math.PI * 2);
    ctx.fillStyle = metric.color;
    ctx.fill();
  }

  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  }

  function seedHistory(metric) {
    for (var i = 0; i < HISTORY_LENGTH; i++) {
      step(metric);
    }
  }

  function tickMetrics() {
    Object.keys(METRICS).forEach(function (key) {
      var metric = METRICS[key];
      var value = step(metric);
      metric.valueEl.textContent = value.toFixed(metric.decimals);
      drawSparkline(metric);
    });
  }

  // ---- Device list ---------------------------------------------------------

  var DEVICES = [
    { name: 'sensor-01', meta: 'greenhouse · temperature', status: 'online' },
    { name: 'sensor-02', meta: 'greenhouse · humidity', status: 'online' },
    { name: 'sensor-03', meta: 'workshop · air quality', status: 'online' },
    { name: 'sensor-04', meta: 'garage · motion', status: 'online' },
    { name: 'sensor-05', meta: 'roof · solar output', status: 'warning' },
    { name: 'sensor-06', meta: 'cellar · humidity', status: 'offline' }
  ];

  var deviceList = document.getElementById('device-list');
  var deviceCount = document.getElementById('device-count');

  function renderDevices() {
    deviceList.innerHTML = '';
    var onlineCount = 0;

    DEVICES.forEach(function (device) {
      if (device.status === 'online') onlineCount++;

      var li = document.createElement('li');

      var info = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'device-name';
      name.textContent = device.name;
      var meta = document.createElement('div');
      meta.className = 'device-meta';
      meta.textContent = device.meta;
      info.appendChild(name);
      info.appendChild(meta);

      var status = document.createElement('span');
      status.className = 'device-status ' + device.status;
      var dot = document.createElement('span');
      dot.className = 'dot';
      status.appendChild(dot);
      status.appendChild(document.createTextNode(device.status));

      li.appendChild(info);
      li.appendChild(status);
      deviceList.appendChild(li);
    });

    deviceCount.textContent = onlineCount + ' / ' + DEVICES.length + ' online';
  }

  // Occasionally flip a device's status to simulate real fleet behaviour
  function jitterDevices() {
    var idx = Math.floor(Math.random() * DEVICES.length);
    var device = DEVICES[idx];
    var roll = Math.random();

    if (device.status === 'online' && roll < 0.12) {
      device.status = 'warning';
      logEvent(device.name + ' reported a sensor anomaly');
    } else if (device.status === 'warning' && roll < 0.5) {
      device.status = 'online';
      logEvent(device.name + ' recovered — back to normal');
    } else if (device.status === 'offline' && roll < 0.2) {
      device.status = 'online';
      logEvent(device.name + ' reconnected to the network');
    } else if (device.status === 'online' && roll > 0.93) {
      device.status = 'offline';
      logEvent(device.name + ' went offline — connection lost');
    }

    renderDevices();
  }

  // ---- Ingestion log --------------------------------------------------------

  var logList = document.getElementById('log-list');
  var MAX_LOG_ENTRIES = 30;

  var LOG_TEMPLATES = [
    'Ingested batch from {device} ({n} readings)',
    'Stored payload for {device} in time-series store',
    'Validated schema for {device} — OK',
    'Aggregated 1m rollup for {device}',
    'Published {device} reading to subscribers'
  ];

  function logEvent(message) {
    appendLogEntry(message);
  }

  function logIngestion() {
    var device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    if (device.status === 'offline') return;

    var template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
    var message = template
      .replace('{device}', device.name)
      .replace('{n}', String(Math.floor(Math.random() * 12) + 1));

    appendLogEntry(message);
  }

  function appendLogEntry(message) {
    var li = document.createElement('li');

    var time = document.createElement('span');
    time.className = 'log-time';
    time.textContent = formatTime(new Date());

    var text = document.createElement('span');
    text.textContent = message;

    li.appendChild(time);
    li.appendChild(text);
    logList.appendChild(li);

    while (logList.children.length > MAX_LOG_ENTRIES) {
      logList.removeChild(logList.firstChild);
    }

    logList.scrollTop = logList.scrollHeight;
  }

  function formatTime(date) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  // ---- Init & loops ---------------------------------------------------------

  Object.keys(METRICS).forEach(function (key) {
    seedHistory(METRICS[key]);
  });

  renderDevices();
  tickMetrics();
  for (var seedLogs = 0; seedLogs < 5; seedLogs++) {
    logIngestion();
  }

  setInterval(tickMetrics, 1800);
  setInterval(logIngestion, 2600);
  setInterval(jitterDevices, 6000);

})();
