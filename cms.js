/* =========================================================
   CMS leve: preenche o site com os dados de content.js
   Elementos com data-cms="caminho.do.campo" recebem o texto.
   ========================================================= */
(function () {
  var C = window.SITE_CONTENT;
  if (!C) return;

  function resolve(obj, path) {
    return path.split('.').reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, obj);
  }

  function fill(el, value) {
    if (Array.isArray(value)) {
      el.textContent = '';
      value.forEach(function (line, i) {
        if (i > 0) el.appendChild(document.createElement('br'));
        el.appendChild(document.createTextNode(line));
      });
    } else {
      el.textContent = value;
    }
  }

  document.querySelectorAll('[data-cms]').forEach(function (el) {
    var value = resolve(C, el.getAttribute('data-cms'));
    if (value != null) fill(el, value);
  });

  if (C.whatsapp) {
    document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
      a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + C.whatsapp);
    });
  }

  if (C.instagram) {
    document.querySelectorAll('a[href^="https://instagram.com"]').forEach(function (a) {
      a.href = C.instagram;
    });
  }
})();
