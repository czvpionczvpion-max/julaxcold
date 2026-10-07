(() => {
  const canvas = document.getElementById("bg-anim");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let t = 0;
  let raf = 0;
  let running = true;

  const blobs = [
    { x: 0.78, y: 0.18, r: 0.42, a: 0.2, s: 0.35, p: 0 },
    { x: 0.18, y: 0.72, r: 0.34, a: 0.13, s: 0.28, p: 1.7 },
    { x: 0.62, y: 0.82, r: 0.26, a: 0.1, s: 0.42, p: 3.1 },
    { x: 0.4, y: 0.22, r: 0.18, a: 0.08, s: 0.5, p: 4.4 },
  ];

  const flakes = Array.from({ length: 46 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.35 + Math.random() * 0.65,
    tw: Math.random() * Math.PI * 2,
    sp: 0.08 + Math.random() * 0.16,
    kind: i % 5 === 0 ? "heart" : "spark",
  }));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function blob(x, y, r, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255, 143, 208, ${alpha})`);
    g.addColorStop(0.45, `rgba(226, 61, 140, ${alpha * 0.5})`);
    g.addColorStop(1, "rgba(255, 143, 208, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function heart(x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.6 + x) * 0.25);
    ctx.scale(size / 16, size / 16);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffd0ea";
    ctx.shadowColor = "rgba(255, 143, 208, 0.95)";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-14, -4, -7, -14, 0, -7);
    ctx.bezierCurveTo(7, -14, 14, -4, 0, 5);
    ctx.fill();
    ctx.restore();
  }

  function spark(x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.35);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#fff0f8";
    ctx.shadowColor = "rgba(255, 182, 220, 0.95)";
    ctx.shadowBlur = 10;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.moveTo(-size * 0.72, 0);
    ctx.lineTo(size * 0.72, 0);
    ctx.stroke();
    ctx.restore();
  }

  function frame() {
    if (!running) return;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    blobs.forEach((b, i) => {
      const nx = (b.x + Math.sin(t * b.s + b.p) * 0.08) * w;
      const ny = (b.y + Math.cos(t * b.s * 0.85 + b.p) * 0.07) * h;
      const nr = Math.min(w, h) * b.r * (0.9 + Math.sin(t * 0.4 + i) * 0.08);
      blob(nx, ny, nr, b.a);
    });

    flakes.forEach((s) => {
      s.y -= s.sp * 0.0011;
      s.tw += 0.018;
      if (s.y < -0.06) {
        s.y = 1.06;
        s.x = Math.random();
      }
      const x = s.x * w + Math.sin(s.tw) * 18;
      const y = s.y * h;
      const pulse = 0.32 + (Math.sin(s.tw * 1.4) + 1) * 0.28;
      if (s.kind === "heart") {
        heart(x, y, 7 + s.z * 8, pulse * 0.7);
      } else {
        spark(x, y, 2.2 + s.z * 2.4, pulse * 0.65);
      }
    });

    ctx.globalCompositeOperation = "source-over";
    t += 0.012;
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running && !reduce) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    }
  });

  resize();
  if (reduce) {
    blobs.forEach((b) => {
      blob(b.x * w, b.y * h, Math.min(w, h) * b.r, b.a);
    });
  } else {
    raf = requestAnimationFrame(frame);
  }
})();
