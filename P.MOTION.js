(() => {
  // Helpers
  const $ = id => document.getElementById(id);

  // Elements
  const canvas = $('simCanvas');
  const ctx = canvas.getContext('2d');
  const angleRange = $('angleRange');
  const angleNum = $('angleNum');
  const speedRange = $('speedRange');
  const speedNum = $('speedNum');
  const gravityRange = $('gravityRange');
  const gravityNum = $('gravityNum');
  const launchBtn = $('launchBtn');
  const pauseBtn = $('pauseBtn');
  const resetBtn = $('resetBtn');
  const timeOut = $('time');
  const rangeOut = $('range');
  const heightOut = $('height');
  const velocityOut = $('velocity');

  // Canvas resolution handling
  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawScene();
  }

  window.addEventListener('resize', resizeCanvas);

  // Simulation state
  let running = false;
  let paused = false;
  let t = 0; // seconds
  let lastTimestamp = null;
  let path = [];

  // Physical parameters
  function getParams() {
    return {
      angle: Number(angleNum.value) * Math.PI / 180,
      speed: Number(speedNum.value),
      g: Number(gravityNum.value)
    };
  }

  // Sync range + number inputs
  function syncInputs(range, num) {
    range.addEventListener('input', () => { num.value = range.value; });
    num.addEventListener('input', () => { range.value = num.value; });
  }

  syncInputs(angleRange, angleNum);
  syncInputs(speedRange, speedNum);
  syncInputs(gravityRange, gravityNum);

  // Presets
  document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      angleRange.value = btn.dataset.angle;
      angleNum.value = btn.dataset.angle;
      speedRange.value = btn.dataset.speed;
      speedNum.value = btn.dataset.speed;
    });
  });

  // Advanced UI elements
  const autoScale = document.getElementById('autoScale');
  const fixedScale = document.getElementById('fixedScale');
  const showGrid = document.getElementById('showGrid');
  const showPrediction = document.getElementById('showPrediction');
  const showTrail = document.getElementById('showTrail');
  const showVelocity = document.getElementById('showVelocity');
  const showTicks = document.getElementById('showTicks');
  const timeSlider = document.getElementById('timeSlider');
  const exportBtn = document.getElementById('exportBtn');
  const toggleFull = document.getElementById('toggleFull');
  const tooltip = document.getElementById('tooltip');

  // full width toggle
  toggleFull.addEventListener('change', () => {
    if (toggleFull.checked) document.querySelector('.canvas-wrap').style.width = '100%';
    else document.querySelector('.canvas-wrap').style.width = '';
    resizeCanvas();
  });

  // Time slider: scrub through simulation when paused or not running
  timeSlider.addEventListener('input', () => {
    const params = getParams();
    const vy = params.speed * Math.sin(params.angle);
    const Tmax = (2 * vy) / params.g;
    const val = Number(timeSlider.value);
    t = Math.min(val, Tmax);
    path = [];
    // when scrubbing, record intermediate points up to t for trail
    const steps = Math.max(5, Math.floor(t / Math.max(0.01, Tmax) * 100));
    for (let i = 0; i <= steps; i++) {
      const tt = (i / steps) * t;
      const p = positionAt(tt, params);
      if (p.y >= 0) path.push(p);
    }
    drawScene(); updateOutputs();
  });

  // Export CSV
  exportBtn.addEventListener('click', () => {
    const params = getParams();
    const vy = params.speed * Math.sin(params.angle);
    const Tmax = (2 * vy) / params.g;
    const rows = ['t,x,y,vx,vy'];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const tt = (i / steps) * Tmax;
      const p = positionAt(tt, params);
      rows.push([tt.toFixed(4), p.x.toFixed(4), p.y.toFixed(4), p.vx.toFixed(4), p.vy.toFixed(4)].join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'trajectory.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  // Tooltip follow
  canvas.addEventListener('mousemove', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    // compute nearest path point
    let nearest = null; let nd = Infinity;
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      const px = metersToPixels(p.x);
      const py = canvas.clientHeight - 24 - metersToPixels(p.y);
      const d = Math.hypot(mx - px, my - py);
      if (d < nd) { nd = d; nearest = p; }
    }
    if (nearest && nd < 30) {
      tooltip.style.display = 'block';
      tooltip.style.left = (rect.left + mx + 12) + 'px';
      tooltip.style.top = (rect.top + my + 12) + 'px';
      tooltip.innerText = `x=${nearest.x.toFixed(2)} m\ny=${nearest.y.toFixed(2)} m`;
    } else { tooltip.style.display = 'none'; }
  });

  canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });

  // Physics helpers
  function positionAt(t, params) {
    const vx = params.speed * Math.cos(params.angle);
    const vy = params.speed * Math.sin(params.angle);
    const x = vx * t;
    const y = vy * t - 0.5 * params.g * t * t;
    return { x, y, vx, vy: vy - params.g * t };
  }

  // Scaling: determine meters -> pixels using canvas width
  function metersToPixels(meters) {
    // Choose scale so that typical range fits comfortably
    // Estimate range at current speed/angle: R = v^2 * sin(2a)/g
    const params = getParams();
    const estRange = (params.speed * params.speed * Math.sin(2 * params.angle)) / Math.max(0.1, params.g);
    // target to occupy ~80% of canvas width
    const margin = 40; // px
    const targetPixels = Math.max(200, canvas.clientWidth - margin);
    let scale;
    if (!autoScale.checked) {
      scale = Number(fixedScale.value) || 6;
    } else {
      scale = estRange > 0 ? targetPixels / estRange : 4;
    }
    return meters * scale;
  }

  // Draw background grid and scene with enhanced graphics
  function drawScene() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // subtle radial background glow
    const bgGrad = ctx.createRadialGradient(w * 0.15, h * 0.25, 10, w * 0.5, h * 0.5, Math.max(w, h));
    bgGrad.addColorStop(0, 'rgba(6,182,212,0.06)');
    bgGrad.addColorStop(1, 'rgba(7,20,40,0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // gridlines (meters-based) optionally
    if (showGrid.checked) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      const meter = Math.max(1, Math.round(1));
      const spacingPx = metersToPixels(meter);
      const spacing = Math.max(20, spacingPx); // px spacing
      for (let x = 0; x < w; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h - 24); ctx.stroke();
      }
      for (let y = 0; y < h; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke();
      }
      ctx.restore();
    }

    // ground
    ctx.fillStyle = 'rgba(4,18,30,0.9)';
    ctx.fillRect(0, h - 24, w, 24);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.moveTo(0, h - 24); ctx.lineTo(w, h - 24); ctx.stroke();

    // predicted (dashed) full trajectory based on current params
    const params = getParams();
    const vx = params.speed * Math.cos(params.angle);
    const vy = params.speed * Math.sin(params.angle);
    const Tmax = (2 * vy) / params.g;
    if (showPrediction.checked) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(124,58,237,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const steps = 160;
      for (let i = 0; i <= steps; i++) {
        const tt = (i / steps) * Tmax;
        const p = positionAt(tt, params);
        const px = metersToPixels(p.x);
        const py = h - 24 - metersToPixels(p.y);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // fading trail for recorded path (optional)
    if (showTrail.checked && path.length) {
      for (let i = 0; i < path.length; i++) {
        const p = path[i];
        const px = metersToPixels(p.x);
        const py = h - 24 - metersToPixels(p.y);
        const age = (path.length - i) / path.length;
        ctx.beginPath();
        ctx.fillStyle = `rgba(6,182,212,${0.12 + 0.7 * age})`;
        ctx.arc(px, py, 2 + 4 * age, 0, Math.PI * 2);
        ctx.fill();
      }
      // connect with a smooth path
      ctx.strokeStyle = 'rgba(6,182,212,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const p = path[i];
        const px = metersToPixels(p.x);
        const py = h - 24 - metersToPixels(p.y);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // draw projectile with radial gradient
    if ((running || path.length) && showVelocity.checked) {
      const cur = positionAt(t, params);
      const px = metersToPixels(cur.x);
      const py = h - 24 - metersToPixels(cur.y);

      const r = 8;
      const g = ctx.createRadialGradient(px - r / 3, py - r / 3, 1, px, py, r);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.25, 'rgba(124,58,237,0.95)');
      g.addColorStop(1, 'rgba(6,182,212,0.9)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();

      // velocity vector
  const velScale = 20; // pixels per m/s for arrow length
      const vxCur = cur.vx;
      const vyCur = cur.vy;
      const ax = px + vxCur * velScale;
      const ay = py - vyCur * velScale;
      // arrow line
      ctx.strokeStyle = 'rgba(255,209,102,0.95)';
      ctx.fillStyle = 'rgba(255,209,102,0.95)';
      ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ax, ay); ctx.stroke();
      // arrowhead
      const angle = Math.atan2(ay - py, ax - px);
      const ah = 8;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - ah * Math.cos(angle - Math.PI / 6), ay - ah * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ax - ah * Math.cos(angle + Math.PI / 6), ay - ah * Math.sin(angle + Math.PI / 6));
      ctx.closePath(); ctx.fill();
  }

  // markers for max height and range (based on current params)
    const vy0 = vy;
    const Tmax2 = (2 * vy0) / params.g;
    const R = vx * Tmax2;
    const H = (vy0 * vy0) / (2 * params.g);
    // range marker
    const rx = metersToPixels(R);
  ctx.fillStyle = 'rgba(124,58,237,0.85)';
    ctx.beginPath(); ctx.arc(rx, h - 24, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = '12px Segoe UI';
    ctx.fillText(`Range: ${R.toFixed(1)} m`, Math.min(rx + 6, w - 120), h - 28);

    // max height marker
    const hx = metersToPixels((vx * (vy0 / params.g))); // x at apex = vx * vy/g
    const hy = h - 24 - metersToPixels(H);
  ctx.fillStyle = 'rgba(6,182,212,0.95)';
    ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(`H: ${H.toFixed(1)} m`, Math.min(hx + 6, w - 80), Math.max(hy - 6, 12));

    // axes label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '12px Segoe UI';
    ctx.fillText('Ground', 8, h - 6);
  }

  // Update outputs
  function updateOutputs() {
    const params = getParams();
    const vx = params.speed * Math.cos(params.angle);
    const vy = params.speed * Math.sin(params.angle);
    const Tmax = (2 * vy) / params.g;
    const R = vx * Tmax;
    const H = (vy * vy) / (2 * params.g);
    timeOut.textContent = t.toFixed(2);
    rangeOut.textContent = (R >= 0 ? R : 0).toFixed(2);
    heightOut.textContent = H.toFixed(2);
    const cur = positionAt(t, params);
    velocityOut.textContent = cur.vx.toFixed(2) + ', ' + cur.vy.toFixed(2);
  }

  // Simulation loop
  function step(timestamp) {
    if (!running) return;
    if (paused) { lastTimestamp = timestamp; requestAnimationFrame(step); return; }

    if (lastTimestamp == null) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000; // seconds
    lastTimestamp = timestamp;
    // advance time at normal speed
    t += dt;

    // record path point
    const params = getParams();
    const p = positionAt(t, params);
    if (p.y >= 0) path.push(p);

    // stop when projectile hits ground
    if (p.y <= 0 && t > 0) {
      running = false;
      pauseBtn.disabled = true;
    }

    drawScene();
    updateOutputs();

    if (running) requestAnimationFrame(step);
  }

  // Controls
  launchBtn.addEventListener('click', () => {
    // reset
    t = 0; path = [];
    running = true; paused = false; lastTimestamp = null;
    pauseBtn.disabled = false;
    requestAnimationFrame(step);
  });

  pauseBtn.addEventListener('click', () => {
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if (!paused) lastTimestamp = null;
  });

  resetBtn.addEventListener('click', () => {
    running = false; paused = false; t = 0; path = [];
    pauseBtn.textContent = 'Pause';
    pauseBtn.disabled = true;
    drawScene(); updateOutputs();
  });

  // initialize
  pauseBtn.disabled = true;
  resizeCanvas();
  updateOutputs();
})();
