/* =============================================================================
   FORGE — Main JavaScript
   Scroll observer, counter animation, timeline, header, accordion, lightbox,
   animated SVG elements
   ============================================================================= */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================================================
  // Header scroll behavior
  // =========================================================================
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
      });

      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileNav.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  // =========================================================================
  // Scroll reveal (Intersection Observer)
  // =========================================================================
  function initScrollReveal() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
      observer.observe(el);
    });
  }

  // =========================================================================
  // Counter animation
  // =========================================================================
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic-out
      const current = Math.round(target * eased);

      el.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    if (prefersReducedMotion) {
      counters.forEach(el => {
        const target = parseFloat(el.dataset.target);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        el.textContent = prefix + target.toLocaleString() + suffix;
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(el => observer.observe(el));
  }

  // =========================================================================
  // Timeline fill animation
  // =========================================================================
  function initTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    const fill = timeline.querySelector('.timeline-fill');
    const nodes = timeline.querySelectorAll('.timeline-node');

    if (prefersReducedMotion) {
      if (fill) fill.style.height = '100%';
      nodes.forEach(n => n.classList.add('active'));
      return;
    }

    function updateTimeline() {
      const rect = timeline.getBoundingClientRect();
      const timelineTop = rect.top;
      const timelineHeight = rect.height;
      const viewportHeight = window.innerHeight;

      const progress = Math.max(0, Math.min(1,
        (viewportHeight - timelineTop) / (timelineHeight + viewportHeight * 0.5)
      ));

      if (fill) fill.style.height = (progress * 100) + '%';

      nodes.forEach(node => {
        const nodeRect = node.getBoundingClientRect();
        if (nodeRect.top < viewportHeight * 0.8) {
          node.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();
  }

  // =========================================================================
  // Accordion
  // =========================================================================
  function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const expanded = header.getAttribute('aria-expanded') === 'true';
        const body = document.getElementById(header.getAttribute('aria-controls'));

        header.setAttribute('aria-expanded', !expanded);

        if (!expanded) {
          body.style.maxHeight = body.scrollHeight + 'px';
        } else {
          body.style.maxHeight = '0';
        }
      });
    });
  }

  // =========================================================================
  // Lightbox
  // =========================================================================
  function initLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('.gallery-grid img, [data-lightbox]').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // =========================================================================
  // Animated background elements
  // =========================================================================

  // Three-phase sine wave animation (for data center / electrical pages)
  function initSineWave(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#ff6b1a', '#10b981', '#3b82f6'];
    let t = 0;

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.4;
        ctx.lineWidth = 2;

        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin((x / w) * Math.PI * 4 + t + (i * Math.PI * 2 / 3)) * (h * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      t += 0.02;
      requestAnimationFrame(draw);
    }
    draw();
  }

  // Network topology animation
  function initNetworkAnim(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener('resize', resize);

    // Create network nodes
    const nodes = [];
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    for (let i = 0; i < 34; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.43,
        vy: (Math.random() - 0.5) * 0.43,
        r: Math.random() * 2 + 1
      });
    }

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Update positions
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 107, 26, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 107, 26, 0.6)';
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  // Code rain / development animation
  function initCodeRain(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789{}[]();=<>/.#include void int return const auto'.split('');
    const columns = Math.floor(canvas.offsetWidth / 14);
    const drops = Array(columns).fill(0);

    function draw() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 107, 26, 0.15)';
      ctx.font = '12px "Space Mono", monospace';

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 14, y * 14);

        if (y * 14 > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      });

      setTimeout(() => requestAnimationFrame(draw), 50);
    }
    draw();
  }

  // Growth chart animation
  function initGrowthChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();

    const dataPoints = [7, 15, 30, 50, 80, 100, 140, 180, 220, 280, 340, 400, 450];
    const years = ['02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'];
    const maxVal = 500;
    let progress = 0;
    let hoveredPoint = -1;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    // Hover interaction
    canvas.addEventListener('mousemove', function(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const padLeft = 50;
      const padRight = 20;
      const padTop = 40;
      const padBottom = 50;
      const stepX = (w - padLeft - padRight) / (dataPoints.length - 1);
      let closest = -1;
      let closestDist = 20;
      for (let i = 0; i < dataPoints.length; i++) {
        const px = padLeft + i * stepX;
        const dist = Math.abs(mx - px);
        if (dist < closestDist) { closest = i; closestDist = dist; }
      }
      if (hoveredPoint !== closest) {
        hoveredPoint = closest;
        if (progress >= 1) drawFrame(w, h, dataPoints.length);
      }
    });
    canvas.addEventListener('mouseleave', function() {
      hoveredPoint = -1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (progress >= 1) drawFrame(w, h, dataPoints.length);
    });
    canvas.style.cursor = 'crosshair';

    function drawFrame(w, h, pointsToDraw) {
      const padLeft = 50;
      const padRight = 20;
      const padTop = 40;
      const padBottom = 50;
      const chartW = w - padLeft - padRight;
      const chartH = h - padTop - padBottom;

      ctx.clearRect(0, 0, w, h);

      // Title
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px "Space Mono", monospace';
      ctx.textAlign = 'left';
      ctx.letterSpacing = '1px';
      ctx.fillText('// EMPLOYEE GROWTH', padLeft, 20);

      // Y-axis grid lines and labels
      const yTicks = [0, 100, 200, 300, 400, 500];
      for (let i = 0; i < yTicks.length; i++) {
        const y = padTop + chartH * (1 - yTicks[i] / maxVal);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - padRight, y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = '10px "Space Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(yTicks[i], padLeft - 8, y + 4);
      }

      // X-axis labels (years)
      const stepX = chartW / (dataPoints.length - 1);
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '10px "Space Mono", monospace';
      for (let i = 0; i < years.length; i++) {
        const x = padLeft + i * stepX;
        ctx.fillText("'" + years[i], x, h - padBottom + 20);
      }

      // X-axis line
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop + chartH);
      ctx.lineTo(w - padRight, padTop + chartH);
      ctx.stroke();

      if (pointsToDraw < 2) return;

      // Filled area
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop + chartH);
      for (let i = 0; i < pointsToDraw; i++) {
        const x = padLeft + i * stepX;
        const y = padTop + chartH - (dataPoints[i] / maxVal) * chartH;
        ctx.lineTo(x, y);
      }
      const lastX = padLeft + (pointsToDraw - 1) * stepX;
      ctx.lineTo(lastX, padTop + chartH);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
      gradient.addColorStop(0, 'rgba(255, 107, 26, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 107, 26, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line
      ctx.beginPath();
      for (let i = 0; i < pointsToDraw; i++) {
        const x = padLeft + i * stepX;
        const y = padTop + chartH - (dataPoints[i] / maxVal) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#ff6b1a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dots
      for (let i = 0; i < pointsToDraw; i++) {
        const x = padLeft + i * stepX;
        const y = padTop + chartH - (dataPoints[i] / maxVal) * chartH;
        const isHovered = (i === hoveredPoint);
        ctx.beginPath();
        ctx.arc(x, y, isHovered ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b1a';
        ctx.fill();
        if (isHovered) {
          ctx.strokeStyle = 'rgba(255, 107, 26, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Hover tooltip
      if (hoveredPoint >= 0 && hoveredPoint < pointsToDraw) {
        const x = padLeft + hoveredPoint * stepX;
        const y = padTop + chartH - (dataPoints[hoveredPoint] / maxVal) * chartH;

        // Vertical guide line
        ctx.strokeStyle = 'rgba(255, 107, 26, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x, padTop + chartH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        const label = dataPoints[hoveredPoint] + ' employees';
        ctx.font = '11px "Space Mono", monospace';
        const tw = ctx.measureText(label).width;
        const lx = Math.min(Math.max(x - tw / 2 - 8, 4), w - tw - 20);
        const ly = y - 24;

        ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
        ctx.fillRect(lx, ly, tw + 16, 22);
        ctx.strokeStyle = 'rgba(255, 107, 26, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(lx, ly, tw + 16, 22);

        ctx.fillStyle = '#ff6b1a';
        ctx.textAlign = 'left';
        ctx.fillText(label, lx + 8, ly + 15);
      }

      // Start/end annotations
      if (pointsToDraw >= dataPoints.length) {
        ctx.font = '10px "Space Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'left';
        const startY = padTop + chartH - (dataPoints[0] / maxVal) * chartH;
        ctx.fillText('7 employees', padLeft + 8, startY + 14);
        ctx.textAlign = 'right';
        const endY = padTop + chartH - (dataPoints[dataPoints.length - 1] / maxVal) * chartH;
        ctx.fillText('450 employees', w - padRight - 4, endY - 10);
      }
    }

    function animate() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const pointsToDraw = Math.floor(progress * dataPoints.length);

      drawFrame(w, h, pointsToDraw);

      progress += 0.02;
      if (progress < 1) requestAnimationFrame(animate);
      else drawFrame(w, h, dataPoints.length);
    }

    observer.observe(canvas);
  }

  // =========================================================================
  // Hero entrance animation
  // =========================================================================
  function initHeroAnimation() {
    if (prefersReducedMotion) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    const elements = hero.querySelectorAll('[data-hero-delay]');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(15px)';
    });

    // Trigger after small delay to let page render
    setTimeout(() => {
      elements.forEach(el => {
        const delay = parseInt(el.dataset.heroDelay);
        setTimeout(() => {
          el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
      });
    }, 100);
  }

  // =========================================================================
  // Initialize everything
  // =========================================================================
  function init() {
    initHeader();
    initScrollReveal();
    initCounters();
    initTimeline();
    initAccordions();
    initLightbox();
    initHeroAnimation();

    // Initialize any canvases present on the page
    if (document.getElementById('sine-wave')) initSineWave('sine-wave');
    if (document.getElementById('network-anim')) initNetworkAnim('network-anim');
    if (document.getElementById('code-rain')) initCodeRain('code-rain');
    if (document.getElementById('growth-chart')) initGrowthChart('growth-chart');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for pages that need to call these directly
  window.FORGE = {
    initSineWave,
    initNetworkAnim,
    initCodeRain,
    initGrowthChart,
    animateCounter
  };
})();
