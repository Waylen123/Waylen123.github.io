/* =========================================================
   韦人仁 Waylen · 个人主页
   原生 JS，无依赖。
   交互：顶栏 / 移动菜单 / 滚动入场 / 视差 / 图墙联动 /
        环形卡片 / 手风琴 / 跑马灯 / 表单 / 导航高亮
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- 1. 顶栏 ---------- */
  var header = document.getElementById('siteHeader');
  function onHeader() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 40);
  }

  /* ---------- 2. 移动菜单 ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  function closeMenu() {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      if (open) { closeMenu(); return; }
      burger.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- 3. 滚动入场 ---------- */
  var revealEls = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = parseInt(en.target.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { en.target.classList.add('is-in'); }, d);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 4. 手风琴（同时只开一个） ---------- */
  var acc = document.getElementById('accordion');
  if (acc) {
    acc.addEventListener('click', function (e) {
      var btn = e.target.closest('.acc__btn');
      if (!btn) return;
      var open = btn.getAttribute('aria-expanded') === 'true';
      acc.querySelectorAll('.acc__btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      if (!open) btn.setAttribute('aria-expanded', 'true');
    });
  }

  /* ---------- 5. 跑马灯：克隆一份实现无缝循环 ---------- */
  var track = document.getElementById('marqueeTrack');
  if (track) {
    [].slice.call(track.children).forEach(function (c) {
      var clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  /* ---------- 6. 导航高亮 ---------- */
  var navLinks = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var navMap = navLinks.map(function (a) {
    return { link: a, sec: document.querySelector(a.getAttribute('href')) };
  }).filter(function (x) { return x.sec; });
  if (navMap.length && 'IntersectionObserver' in window) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navMap.forEach(function (m) { m.link.classList.toggle('is-active', m.sec === en.target); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navMap.forEach(function (m) { navIo.observe(m.sec); });
  }

  /* ---------- 8. 视差 / 图墙 / 环形卡片：一个 rAF 循环搞定 ---------- */
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var wallRows = [].slice.call(document.querySelectorAll('.wall__row'));
  var wallSection = document.querySelector('.wall');
  var orbit = document.getElementById('orbit');
  var orbitCards = [].slice.call(document.querySelectorAll('.card3d'));
  var orbitIndexEl = document.getElementById('orbitIndex');

  function frame() {
    var vh = window.innerHeight;
    var sy = window.scrollY;

    /* 视差 */
    if (!reduce) {
      parallaxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-mid * speed).toFixed(2) + 'px,0)';
      });
    }

    /* 图墙：两排反向平移 */
    if (wallRows.length && wallSection) {
      var wr = wallSection.getBoundingClientRect();
      var p = clamp((vh - wr.top) / (vh + wr.height), 0, 1);   // 0→1 随滚动
      wallRows.forEach(function (row, i) {
        var dir = i === 0 ? -1 : 1;
        var base = i === 0 ? 0 : -6;                            // 第二排初始偏移见 CSS
        var shift = base + dir * p * 10;                        // 最多再动 10%
        row.style.transform = 'translate3d(' + shift.toFixed(2) + '%,0,0)';
      });
    }

    /* 环形卡片 */
    if (orbit && orbitCards.length) {
      var orect = orbit.getBoundingClientRect();
      var total = orbit.offsetHeight - vh;
      var prog = total > 0 ? clamp((-orect.top) / total, 0, 1) : 0;
      var n = orbitCards.length;
      var t = prog * (n - 1);
      var vw = window.innerWidth;
      var unit = vw < 760 ? Math.min(vw * 0.82, 340) : Math.min(vw * 0.34, 380);  // 卡片间距

      orbitCards.forEach(function (card, i) {
        var off = i - t;
        var abs = Math.abs(off);
        var x = off * unit;
        var z = -abs * 160;
        var rotY = -off * 17;
        var scale = 1 - Math.min(abs, 1) * 0.12;
        var op = abs > 1.6 ? 0 : 1 - abs * 0.4;
        card.style.transform =
          'translate(-50%,-50%) translateX(' + x.toFixed(1) + 'px) translateZ(' + z.toFixed(0) + 'px)' +
          ' rotateY(' + rotY.toFixed(1) + 'deg) scale(' + scale.toFixed(3) + ')';
        card.style.opacity = op.toFixed(3);
        card.style.zIndex = String(50 - Math.round(abs * 10));
        card.style.pointerEvents = abs < 0.5 ? 'auto' : 'none';
      });

      if (orbitIndexEl) {
        orbitIndexEl.textContent = ('0' + (Math.round(t) + 1)).slice(-2);
      }
    }
  }

  var scheduled = false;
  function onScroll() {
    onHeader();
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () { scheduled = false; frame(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { frame(); }, { passive: true });
  onScroll();
  frame();
})();
