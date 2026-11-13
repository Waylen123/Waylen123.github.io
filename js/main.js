/* =========================================================
   韦人仁 Waylen · 个人主页
   原生 JS，无依赖。功能：顶栏状态、移动菜单、滚动入场、
   手风琴、跑马灯无缝循环、表单兜底、导航高亮。
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 顶栏：滚动后变实底 ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. 移动端菜单 ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');

  function closeMenu() {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', '打开菜单');
    menu.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function toggleMenu() {
    if (!burger || !menu) return;
    var open = burger.getAttribute('aria-expanded') === 'true';
    if (open) {
      closeMenu();
    } else {
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', '关闭菜单');
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }
  if (burger) burger.addEventListener('click', toggleMenu);
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- 3. 滚动入场 ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- 4. 手风琴（同时只开一个） ---------- */
  var acc = document.getElementById('accordion');
  if (acc) {
    acc.addEventListener('click', function (e) {
      var btn = e.target.closest('.acc__btn');
      if (!btn || !acc.contains(btn)) return;
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      acc.querySelectorAll('.acc__btn').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) btn.setAttribute('aria-expanded', 'true');
    });
  }

  /* ---------- 5. 跑马灯：克隆一份实现无缝循环 ---------- */
  var track = document.getElementById('marqueeTrack');
  if (track) {
    var cards = Array.prototype.slice.call(track.children);
    cards.forEach(function (c) {
      var clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  /* ---------- 6. 表单：有 endpoint 就 POST，否则 mailto 兜底 ---------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var endpoint = form.getAttribute('data-endpoint');

      if (endpoint) {
        fetch(endpoint, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' }
        }).then(function (r) {
          if (note) note.textContent = r.ok ? '已发送，我会尽快回你。' : '发送失败，请直接发邮件。';
          if (r.ok) form.reset();
        }).catch(function () {
          if (note) note.textContent = '网络异常，请直接发邮件。';
        });
        return;
      }

      var subject = '来自网站的留言：' + (data.get('name') || '');
      var body = (data.get('message') || '') + '\n\n回信邮箱：' + (data.get('email') || '');
      window.location.href = 'mailto:WRR520.COM?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (note) note.textContent = '已打开本机邮件客户端；想直接用表单收件，请填写 data-endpoint。';
    });
  }

  /* ---------- 7. 导航高亮当前区块 ---------- */
  var links = document.querySelectorAll('.nav a[href^="#"]');
  var sections = [];
  links.forEach(function (a) {
    var sec = document.querySelector(a.getAttribute('href'));
    if (sec) sections.push({ link: a, sec: sec });
  });
  if (sections.length && 'IntersectionObserver' in window) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        sections.forEach(function (s) {
          s.link.classList.toggle('is-active', s.sec === en.target);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navIo.observe(s.sec); });
  }
})();
