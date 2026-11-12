/* =========================================================
   Tema claro/escuro
   ========================================================= */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('tg');
  var MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      btn.innerHTML = SUN;
    } else {
      root.setAttribute('data-theme', 'light');
      btn.innerHTML = MOON;
    }
  }

  setTheme('light');

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

    if (reduce.matches) {
      setTheme(next);
      return;
    }

    if (document.startViewTransition) {
      var rc = btn.getBoundingClientRect();
      var x = rc.left + rc.width / 2;
      var y = rc.top + rc.height / 2;
      var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var vt = document.startViewTransition(function () { setTheme(next); });
      vt.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 700, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
        );
      });
    } else {
      root.classList.add('tt');
      setTheme(next);
      setTimeout(function () { root.classList.remove('tt'); }, 600);
    }
  });
})();

/* =========================================================
   Carrossel infinito (usado em "Sobre nós" e "Depoimentos")
   Clona os itens antes e depois do original. Quando o scroll termina
   em um clone, pulamos (sem animação) para o item original igual,
   então o carrossel nunca chega ao fim nem "rebobina".
   ========================================================= */
function makeInfinite(track, onChange) {
  var items = [].slice.call(track.children);
  var n = items.length;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var step = 0;
  var base = 0;
  var idx = 0;
  var touching = false;
  var settleTimer;

  function copy(el) {
    var c = el.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.setAttribute('data-clone', '');
    return c;
  }

  var head = document.createDocumentFragment();
  var tail = document.createDocumentFragment();
  items.forEach(function (el) {
    head.appendChild(copy(el));
    tail.appendChild(copy(el));
  });
  track.insertBefore(head, track.firstChild);
  track.appendChild(tail);

  /* step = distância entre dois itens; base = posição do 1º item no scroll */
  function measure() {
    var a = track.children[0].getBoundingClientRect();
    var b = track.children[1].getBoundingClientRect();
    var t = track.getBoundingClientRect();
    step = b.left - a.left;
    base = a.left - t.left + track.scrollLeft;
  }

  function glob() {
    return step ? Math.round((track.scrollLeft - base) / step) : 0;
  }

  function logical() {
    return ((glob() % n) + n) % n;
  }

  function jump(left) {
    var snap = track.style.scrollSnapType;
    track.style.scrollSnapType = 'none';
    track.scrollLeft = left;
    void track.offsetWidth;
    track.style.scrollSnapType = snap;
  }

  function report() {
    var c = logical();
    if (c !== idx) {
      idx = c;
      if (onChange) onChange(c);
    }
  }

  function settle() {
    if (touching || !step) return;
    var g = glob();
    if (g < n) jump(track.scrollLeft + n * step);
    else if (g >= 2 * n) jump(track.scrollLeft - n * step);
    report();
  }

  function goTo(g) {
    track.scrollTo({ left: base + g * step, behavior: reduce.matches ? 'auto' : 'smooth' });
  }

  function next() { goTo(glob() + 1); }
  function prev() { goTo(glob() - 1); }

  /* vai para o item i pelo caminho mais curto */
  function go(i) {
    var d = (((i - logical()) % n) + n) % n;
    if (d > n / 2) d -= n;
    goTo(glob() + d);
  }

  function place() {
    measure();
    jump(base + (n + idx) * step);
  }

  track.addEventListener('scroll', function () {
    report();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 120);
  }, { passive: true });

  track.addEventListener('touchstart', function () { touching = true; }, { passive: true });
  ['touchend', 'touchcancel'].forEach(function (e) {
    track.addEventListener(e, function () {
      touching = false;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 160);
    }, { passive: true });
  });

  window.addEventListener('resize', place);

  place();
  if (onChange) onChange(0);

  return { next: next, prev: prev, go: go, refresh: place };
}

/* =========================================================
   Carrossel "Sobre nós" + menu mobile
   ========================================================= */
(function () {
  var track = document.getElementById('trk');
  var dots = document.getElementById('dots');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var count = track.children.length;
  var html = '';
  var timer;

  for (var k = 0; k < count; k++) {
    html += '<i></i>';
  }
  dots.innerHTML = html;

  var car = makeInfinite(track, function (i) {
    [].forEach.call(dots.children, function (el, j) {
      el.className = j === i ? 'on' : '';
    });
  });

  document.getElementById('pv').onclick = car.prev;
  document.getElementById('nx').onclick = car.next;

  function stop() {
    clearInterval(timer);
  }

  function play() {
    stop();
    if (reduce.matches) return;
    timer = setInterval(car.next, 5000);
  }

  var box = track.parentNode;
  ['mouseenter', 'focusin', 'touchstart'].forEach(function (e) {
    box.addEventListener(e, stop, { passive: true });
  });
  ['mouseleave', 'focusout', 'touchend'].forEach(function (e) {
    box.addEventListener(e, play, { passive: true });
  });
  play();

  /* menu mobile */
  var nav = document.querySelector('nav');
  var hamburger = document.getElementById('hb');

  function closeNav() {
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.onclick = function () {
    var open = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  };

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      closeNav();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeNav();
    }
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      closeNav();
    }
  });
})();

/* =========================================================
   Depoimentos (carrossel infinito)
   Edite aqui: nome, texto e nota (1 a 5).
   "when" é opcional (ex.: "há 2 semanas").
   ========================================================= */
(function () {
  var REVIEWS = (window.SITE_CONTENT && window.SITE_CONTENT.reviews) || [
    { n: 'Cliente 1', t: 'Atendimento maravilhoso e unhas perfeitas!', s: 5 },
    { n: 'Cliente 2', t: 'Ambiente lindo e super acolhedor. Voltarei sempre.', s: 5 },
    { n: 'Cliente 3', t: 'Duração incrível da esmaltação. Recomendo!', s: 5 },
    { n: 'Cliente 4', t: 'O spa dos pés é um mimo. Saí leve e com os pés lindos.', s: 5 },
    { n: 'Cliente 5', t: 'Equipe atenciosa e pontual. Atendimento de primeira.', s: 5 },
    { n: 'Cliente 6', t: 'Minhas unhas de gel ficaram naturais e resistentes.', s: 5 }
  ];

  var COLORS = ['#b8742c', '#6b3f1d', '#8e5a2b', '#a0522d', '#7a5230', '#c08a3e'];

  var GOOGLE_ICON = '<svg class="rv-g" viewBox="0 0 48 48" aria-label="Google"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';

  var track = document.getElementById('rvTrk');
  var dots = document.getElementById('rvDots');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var html = '';
  var timer;

  REVIEWS.forEach(function (r, i) {
    var stars = '';
    for (var k = 1; k <= 5; k++) {
      stars += k <= r.s ? '★' : '<span class="off">★</span>';
    }
    html +=
      '<article class="rv-card">' +
        '<div class="rv-top">' +
          '<div class="rv-av" style="background:' + COLORS[i % COLORS.length] + '">' + r.n.charAt(0).toUpperCase() + '</div>' +
          '<div class="rv-who"><b>' + r.n + '</b><span>' + (r.when || 'Cliente do Studio Day Lima') + '</span></div>' +
        '</div>' +
        '<div class="rv-st" role="img" aria-label="' + r.s + ' de 5 estrelas">' + stars + '</div>' +
        '<p class="rv-tx">' + r.t + '</p>' +
      '</article>';
  });

  track.innerHTML = html;

  var d = '';
  for (var k = 0; k < REVIEWS.length; k++) {
    d += '<button aria-label="Ir para depoimento ' + (k + 1) + '"></button>';
  }
  dots.innerHTML = d;

  var car = makeInfinite(track, function (i) {
    [].forEach.call(dots.children, function (b, k) {
      b.className = k === i ? 'on' : '';
    });
  });

  [].forEach.call(dots.children, function (b, k) {
    b.onclick = function () { car.go(k); };
  });

  document.getElementById('rvPv').onclick = car.prev;
  document.getElementById('rvNx').onclick = car.next;

  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); car.next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); car.prev(); }
  });

  function stop() {
    clearInterval(timer);
  }

  function play() {
    stop();
    if (reduce.matches) return;
    timer = setInterval(car.next, 6000);
  }

  ['mouseenter', 'focusin', 'touchstart'].forEach(function (e) {
    track.addEventListener(e, stop, { passive: true });
  });
  ['mouseleave', 'focusout', 'touchend'].forEach(function (e) {
    track.addEventListener(e, play, { passive: true });
  });

  play();
})();

/* =========================================================
   Animação ao rolar (fade-in)
   ========================================================= */
(function () {
  var selector = '.sec-h, .card, .sv, .gal div, .rv-wrap, .rv-sum, .map, details, .job, .loc dl, .cta .wrap > *, .about .wrap > .car, .about .wrap > div:not(.car), .foot > div';
  var elements = [].slice.call(document.querySelectorAll(selector)).filter(function (el) {
    return !el.closest('.hero');
  });

  if (!('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      el.classList.add('in');
      setTimeout(function () {
        el.classList.remove('fx', 'in');
        el.style.transitionDelay = '';
      }, 1100);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(function (el) {
    var sibling = [].indexOf.call(el.parentNode.children, el);
    el.style.transitionDelay = Math.min(sibling, 5) * 70 + 'ms';
    el.classList.add('fx');
    io.observe(el);
  });
})();

/* =========================================================
   Carrossel automático das fotos de cada serviço
   (já é infinito: depois da última foto volta à primeira com fade)
   Para usar fotos reais, troque o texto de cada .sv-s
   por <img src="..." alt="...">
   ========================================================= */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  [].forEach.call(document.querySelectorAll('.sv-ph'), function (box, n) {
    var slides = box.querySelectorAll('.sv-s');
    var dotBox = box.querySelector('.sv-dots');
    var index = 0;
    var timer;

    /* com uma única foto não há o que girar */
    if (slides.length < 2) {
      slides[0].classList.add('on');
      dotBox.style.display = 'none';
      return;
    }

    for (var k = 0; k < slides.length; k++) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Foto ' + (k + 1));
      (function (k) {
        b.onclick = function () { show(k); play(); };
      })(k);
      dotBox.appendChild(b);
    }

    function show(x) {
      index = (x + slides.length) % slides.length;
      [].forEach.call(slides, function (el, k) {
        el.classList.toggle('on', k === index);
      });
      [].forEach.call(dotBox.children, function (el, k) {
        el.classList.toggle('on', k === index);
      });
    }

    function play() {
      clearInterval(timer);
      if (reduce) return;
      timer = setInterval(function () { show(index + 1); }, 4000 + n * 400);
    }

    function stop() {
      clearInterval(timer);
    }

    var prev = box.querySelector('.ar.l');
    var next = box.querySelector('.ar.r');
    prev.onclick = function () { show(index - 1); play(); };
    next.onclick = function () { show(index + 1); play(); };

    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', play);

    show(0);
    play();
  });
})();

/* =========================================================
   Hero: parallax suave ao rolar (foto desce mais devagar,
   texto sobe e some). Só o texto muda de opacidade, para não
   quebrar o efeito de vidro da busca e dos chips.
   ========================================================= */
(function () {
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var bg = hero.querySelector('.hero-bg');
  var copy = hero.querySelector('.hero-copy');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ticking = false;

  if (!bg || !copy || reduce.matches) return;

  function update() {
    ticking = false;
    var h = hero.offsetHeight;
    var y = Math.min(Math.max(window.scrollY, 0), h);
    var p = y / h;
    bg.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0) scale(' + (1 + p * 0.05).toFixed(4) + ')';
    copy.style.transform = 'translate3d(0,' + (-y * 0.1).toFixed(1) + 'px,0)';
    copy.style.opacity = Math.max(0, 1 - p * 1.5).toFixed(3);
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
})();

/* =========================================================
   Chip "Aberto agora" do hero
   Horários (em horário de Brasília). Ajuste aqui se mudar:
   0 = domingo ... 6 = sábado, [abre, fecha] ou null (fechado).
   ========================================================= */
(function () {
  var el = document.getElementById('openNow');
  if (!el) return;

  var HOURS = { 0: null, 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 16] };
  var DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function now() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return { day: WEEK.indexOf(o.weekday), h: (+o.hour % 24) + (+o.minute) / 60 };
  }

  function update() {
    var t = now();
    var today = HOURS[t.day];
    var open = false;
    var label = '';

    if (today && t.h >= today[0] && t.h < today[1]) {
      open = true;
      label = 'Aberto agora, até ' + today[1] + 'h';
    } else if (today && t.h < today[0]) {
      label = 'Fechado, abre hoje às ' + today[0] + 'h';
    } else {
      for (var i = 1; i <= 7; i++) {
        var d = (t.day + i) % 7;
        if (HOURS[d]) {
          label = 'Fechado, abre ' + (i === 1 ? 'amanhã' : DAYS[d]) + ' às ' + HOURS[d][0] + 'h';
          break;
        }
      }
    }

    el.classList.toggle('open', open);
    el.lastElementChild.textContent = label;
  }

  try {
    update();
    setInterval(update, 60000);
  } catch (e) { /* mantém o texto padrão do HTML */ }
})();

/* =========================================================
   Busca estilo Spotlight
   Abre pelo ícone do cabeçalho, pela barra do hero, por Ctrl/⌘ + K
   ou pela tecla "/". Lê o conteúdo da própria página (procedimentos,
   informações, dúvidas, seções e depoimentos), então qualquer texto
   que você editar no HTML já passa a ser encontrado.
   ========================================================= */
(function () {
  var root = document.getElementById('sp');
  if (!root) return;

  var input = document.getElementById('spq');
  var list = document.getElementById('spl');
  var live = document.getElementById('spst');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var index = [];
  var rows = [];
  var entries = [];
  var sel = -1;
  var opener = null;
  var isOpen = false;

  function svg(inner) {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  var ICONS = {
    spark: svg('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    pin: svg('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
    chat: svg('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
    help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8"/><path d="M12 17h.01"/>'),
    page: svg('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>'),
    star: svg('<path d="M12 3.5l2.5 5.3 5.7.7-4.2 4 1.1 5.7L12 16.4 6.9 19.2 8 13.5 3.8 9.5l5.7-.7z"/>')
  };

  var TAGS = { service: 'Procedimento', info: 'Informação', faq: 'Dúvida', section: 'Seção', review: 'Depoimento' };
  var RANK = { service: 4, info: 3, faq: 2, section: 2, review: 1 };

  var SERVICE_KW = [
    [/unhas de gel/, 'alongamento unha gel'],
    [/esmalta/, 'esmalte unha cor brilho gel'],
    [/spa/, 'pe pes hidratacao esfoliacao pedicure relaxar'],
    [/banho/, 'fortalecer unha natural gel'],
    [/manicure/, 'cuticula mao maos pe pes unha'],
    [/cilios/, 'cilio olhos olhar volume'],
    [/sobrancelha/, 'design sobrancelhas olhar']
  ];

  var SECTIONS = [
    ['sobre', 'Quem somos', 'Conheça o Studio Day Lima e a nossa equipe', 'sobre nos historia equipe'],
    ['servicos', 'Procedimentos', 'Todos os serviços do estúdio', 'servicos tratamentos'],
    ['galeria', 'Galeria', 'Fotos dos nossos trabalhos', 'fotos portfolio unhas'],
    ['depoimentos', 'Depoimentos', 'O que dizem nossas clientes', 'avaliacoes google opinioes'],
    ['trabalhe', 'Trabalhe conosco', 'Envie seu interesse em fazer parte da equipe', 'vaga emprego curriculo recepcao tecnica comercial'],
    ['localizacao', 'Localização', 'Endereço, horários e mapa', 'mapa como chegar'],
    ['faq', 'Perguntas frequentes', 'Respostas para as dúvidas mais comuns', 'duvidas ajuda']
  ];

  var QUICK_SECTIONS = { galeria: 1, trabalhe: 1 };

  function norm(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function clean(s) {
    return s.replace(/\s+/g, ' ').trim();
  }

  function stem(t) {
    return t.length > 3 && t.charAt(t.length - 1) === 's' ? t.slice(0, -1) : t;
  }

  function lines(el) {
    var c = el.cloneNode(true);
    [].forEach.call(c.querySelectorAll('br'), function (b) {
      b.parentNode.replaceChild(document.createTextNode('\n'), b);
    });
    return c.textContent.split('\n').map(clean).filter(Boolean);
  }

  function lowerTail(s, i) {
    return i ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  }

  function add(o) {
    o.nt = norm(o.title);
    o.nk = norm(o.kw || '');
    o.nx = norm(o.text || '');
    index.push(o);
  }

  function build() {
    index = [];
    var waEl = document.querySelector('.wa');
    var wa = waEl ? waEl.href : '';

    [].forEach.call(document.querySelectorAll('.sv'), function (sv) {
      var h = sv.querySelector('h3');
      if (!h) return;
      var p = sv.querySelector('.sv-d p');
      var b = sv.querySelector('.sv-b');
      var title = clean(h.textContent);
      var kw = '';
      SERVICE_KW.forEach(function (pair) {
        if (pair[0].test(norm(title))) kw = pair[1];
      });
      add({
        type: 'service', icon: 'spark', title: title, text: p ? clean(p.textContent) : '', kw: kw,
        el: sv, block: 'center', flash: true, action: b ? b.href : '', actionLabel: 'Agendar'
      });
    });

    var dl = document.querySelector('.loc dl');
    if (dl) {
      [].forEach.call(dl.querySelectorAll('dt'), function (dt) {
        var dd = dt.nextElementSibling;
        if (!dd || dd.tagName !== 'DD') return;
        var t = clean(dt.textContent);
        var isAddr = /endere/i.test(t);
        var isWa = /whats/i.test(t);
        var l = lines(dd);
        add({
          type: 'info', icon: isAddr ? 'pin' : (isWa ? 'chat' : 'clock'), title: t,
          text: isAddr ? l.join(', ') : l.map(lowerTail).join(' e '),
          kw: isAddr ? 'onde fica rua mapa como chegar suzano' : (isWa ? 'telefone contato falar agendar celular zap' : 'horario horarios hora horas abre fecha funcionamento dias sabado domingo atendimento'),
          el: document.getElementById('localizacao'), href: isWa ? wa : '', quick: true
        });
      });
    }

    [].forEach.call(document.querySelectorAll('details'), function (d) {
      var s = d.querySelector('summary');
      var p = d.querySelector('p');
      if (!s) return;
      add({ type: 'faq', icon: 'help', title: clean(s.textContent), text: p ? clean(p.textContent) : '', el: d, block: 'center', flash: true });
    });

    SECTIONS.forEach(function (s) {
      var el = document.getElementById(s[0]);
      if (!el) return;
      add({ type: 'section', icon: 'page', title: s[1], text: s[2], kw: s[3], el: el, quick: !!QUICK_SECTIONS[s[0]] });
    });

    [].forEach.call(document.querySelectorAll('.rv-card:not([data-clone])'), function (c) {
      var n = c.querySelector('.rv-who b');
      var t = c.querySelector('.rv-tx');
      if (!t) return;
      add({ type: 'review', icon: 'star', title: clean(t.textContent), text: n ? clean(n.textContent) : '', el: document.getElementById('depoimentos') });
    });
  }

  function score(e, toks) {
    var s = 0;
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (e.nt.indexOf(t) > -1) s += 30;
      else if (e.nk.indexOf(t) > -1) s += 12;
      else if (e.nx.indexOf(t) > -1) s += 6;
      else return 0;
    }
    if (e.nt.indexOf(toks.join(' ')) === 0) s += 20;
    if (e.type === 'review') s *= 0.35;
    return s * 10 + RANK[e.type];
  }

  /* escreve o texto marcando os trechos que casam (ignorando acentos) */
  function highlight(parent, str, toks) {
    var ns = norm(str);
    var marks = [];
    if (toks.length && ns.length === str.length) {
      toks.forEach(function (t) {
        var i = ns.indexOf(t);
        while (i > -1) {
          marks.push([i, i + t.length]);
          i = ns.indexOf(t, i + t.length);
        }
      });
    }
    if (!marks.length) {
      parent.appendChild(document.createTextNode(str));
      return;
    }
    marks.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [marks[0]];
    for (var i = 1; i < marks.length; i++) {
      var last = merged[merged.length - 1];
      if (marks[i][0] <= last[1]) last[1] = Math.max(last[1], marks[i][1]);
      else merged.push(marks[i]);
    }
    var pos = 0;
    merged.forEach(function (m) {
      if (m[0] > pos) parent.appendChild(document.createTextNode(str.slice(pos, m[0])));
      var mk = document.createElement('mark');
      mk.textContent = str.slice(m[0], m[1]);
      parent.appendChild(mk);
      pos = m[1];
    });
    if (pos < str.length) parent.appendChild(document.createTextNode(str.slice(pos)));
  }

  /* recorta o trecho do texto ao redor do primeiro termo encontrado */
  function snippet(e, toks) {
    var text = e.text;
    if (!text) return '';
    var ns = norm(text);
    var at = -1;
    if (ns.length === text.length) {
      for (var i = 0; i < toks.length; i++) {
        var p = ns.indexOf(toks[i]);
        if (p > -1 && (at < 0 || p < at)) at = p;
      }
    }
    var start = at > 40 ? at - 30 : 0;
    var out = text.slice(start, start + 120);
    return (start > 0 ? '…' : '') + out + (start + 120 < text.length ? '…' : '');
  }

  function makeRow(e, toks, i) {
    var row = document.createElement('div');
    row.className = 'sp-i';
    row.id = 'sp-o' + i;
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', 'false');

    var ic = document.createElement('span');
    ic.className = 'sp-ic';
    ic.innerHTML = ICONS[e.icon];
    row.appendChild(ic);

    var tx = document.createElement('span');
    tx.className = 'sp-t';
    var b = document.createElement('b');
    highlight(b, e.title, toks);
    tx.appendChild(b);
    var sn = snippet(e, toks);
    if (sn) {
      var sp = document.createElement('span');
      highlight(sp, sn, toks);
      tx.appendChild(sp);
    }
    row.appendChild(tx);

    if (e.action) {
      var a = document.createElement('a');
      a.className = 'sp-go';
      a.href = e.action;
      a.target = '_blank';
      a.rel = 'noopener';
      a.tabIndex = -1;
      a.textContent = e.actionLabel;
      a.addEventListener('click', function (ev) {
        ev.stopPropagation();
        close(true);
      });
      row.appendChild(a);
    } else {
      var tag = document.createElement('span');
      tag.className = 'sp-tag';
      tag.textContent = TAGS[e.type];
      row.appendChild(tag);
    }

    row.addEventListener('mousemove', function () {
      if (sel !== i) select(i, false);
    });
    row.addEventListener('click', function () { activate(e); });
    return row;
  }

  function heading(text) {
    var h = document.createElement('div');
    h.className = 'sp-h';
    h.setAttribute('role', 'presentation');
    h.textContent = text;
    return h;
  }

  function select(i, scroll) {
    if (!rows.length) return;
    i = (i + rows.length) % rows.length;
    if (rows[sel]) rows[sel].setAttribute('aria-selected', 'false');
    sel = i;
    rows[i].setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', rows[i].id);
    if (scroll !== false) rows[i].scrollIntoView({ block: 'nearest' });
  }

  function update() {
    var toks = norm(input.value).split(/\s+/).filter(Boolean).map(stem);
    var groups;

    list.innerHTML = '';
    rows = [];
    entries = [];
    sel = -1;
    input.removeAttribute('aria-activedescendant');

    if (!toks.length) {
      groups = [
        ['Procedimentos', index.filter(function (e) { return e.type === 'service'; })],
        ['Atalhos', index.filter(function (e) { return e.quick; })]
      ];
    } else {
      var res = index
        .map(function (e) { return { e: e, s: score(e, toks) }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, 10)
        .map(function (r) { return r.e; });
      groups = res.length ? [[null, res]] : [];
    }

    if (!groups.length) {
      var q = input.value.trim();
      var box = document.createElement('div');
      box.className = 'sp-empty';
      var t1 = document.createElement('b');
      t1.textContent = 'Nada encontrado para “' + q + '”';
      var t2 = document.createElement('span');
      t2.textContent = 'Tente “unhas”, “cílios” ou “horário”, ou pergunte direto pelo WhatsApp.';
      var a = document.createElement('a');
      a.className = 'sp-go';
      var waEl = document.querySelector('.wa');
      a.href = (waEl ? waEl.href : 'https://wa.me/') + '?text=' + encodeURIComponent('Olá! Vim do site e procurei por “' + q + '”. Pode me ajudar?');
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Perguntar no WhatsApp';
      a.addEventListener('click', function () { close(true); });
      box.appendChild(t1);
      box.appendChild(t2);
      box.appendChild(a);
      list.appendChild(box);
      live.textContent = 'Nenhum resultado';
      return;
    }

    groups.forEach(function (g) {
      if (g[0] && g[1].length) list.appendChild(heading(g[0]));
      g[1].forEach(function (e) {
        var row = makeRow(e, toks, rows.length);
        rows.push(row);
        entries.push(e);
        list.appendChild(row);
      });
    });

    list.scrollTop = 0;
    select(0, false);
    live.textContent = toks.length ? entries.length + (entries.length === 1 ? ' resultado' : ' resultados') : '';
  }

  function activate(e) {
    close(true);
    if (e.href) {
      window.open(e.href, '_blank', 'noopener');
      return;
    }
    requestAnimationFrame(function () {
      var t = e.el;
      if (!t) return;
      if (t.tagName === 'DETAILS') t.open = true;
      t.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: e.block || 'start' });
      if (e.flash) {
        t.classList.remove('flash');
        void t.offsetWidth;
        t.classList.add('flash');
        setTimeout(function () { t.classList.remove('flash'); }, 1700);
      }
    });
  }

  function open(from) {
    if (isOpen) return;
    isOpen = true;
    opener = from || document.activeElement;
    build();
    var gap = window.innerWidth - document.documentElement.clientWidth;
    root.hidden = false;
    document.documentElement.style.paddingRight = gap + 'px';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    input.value = '';
    update();
    input.focus();
  }

  function close(skipFocus) {
    if (!isOpen) return;
    isOpen = false;
    root.hidden = true;
    document.documentElement.style.overflow = '';
    document.documentElement.style.paddingRight = '';
    document.body.style.overflow = '';
    if (!skipFocus && opener && opener.focus) opener.focus();
  }

  [].forEach.call(document.querySelectorAll('[data-search]'), function (b) {
    b.addEventListener('click', function () { open(b); });
  });

  root.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) close();
  });

  input.addEventListener('input', update);

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isOpen) close(); else open();
      return;
    }
    if (!isOpen) {
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        open();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      select(sel + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      select(sel - 1);
    } else if (e.key === 'Enter') {
      if (entries[sel]) {
        e.preventDefault();
        activate(entries[sel]);
      }
    } else if (e.key === 'Tab') {
      /* mantém o foco dentro da janela */
      e.preventDefault();
      var cancel = root.querySelector('.sp-x');
      if (document.activeElement === input) cancel.focus(); else input.focus();
    }
  });

  /* dica de atalho conforme o sistema */
  var isApple = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  [].forEach.call(document.querySelectorAll('.kbd-hint'), function (k) {
    k.textContent = isApple ? '⌘K' : 'Ctrl K';
  });
})();

/* =========================================================
   Cabeçalho compacto ao rolar
   Liga em 140px e desliga abaixo de 60px (evita piscar).
   ========================================================= */
(function () {
  var header = document.querySelector('header');
  if (!header) return;
  var compact = false;

  function update() {
    var y = window.scrollY;
    if (!compact && y > 140) {
      compact = true;
      header.classList.add('is-compact');
    } else if (compact && y < 60) {
      compact = false;
      header.classList.remove('is-compact');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* =========================================================
   Galeria: toque numa linha pausa/retoma; toque numa foto
   amplia a imagem na tela
   ========================================================= */
(function () {
  var rows = document.querySelectorAll('.gal-row');
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  if (!rows.length || !lb) return;

  rows.forEach(function (row) {
    row.addEventListener('click', function (e) {
      var img = e.target.closest('img');
      if (img) {
        e.stopPropagation();
        row.classList.add('paused');
        lbImg.src = img.getAttribute('data-full') || img.src;
        lbImg.alt = img.alt;
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        return;
      }
      row.classList.toggle('paused');
    });
  });

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
  }

  lbClose.addEventListener('click', close);
  lb.addEventListener('click', function (e) {
    if (e.target === lb) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
})();
