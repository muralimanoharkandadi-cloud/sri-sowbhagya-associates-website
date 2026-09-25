/* Shared helpers for Sri Sowbhagya Associates planning tools. */
(function () {
  var WA_NUMBER = '919246582445';

  function inr(n) {
    n = Math.max(0, Math.round(n || 0));
    return '\u20B9' + n.toLocaleString('en-IN');
  }

  function words(n) {
    n = Math.round(n || 0);
    if (n >= 10000000) return '\u20B9' + trim(n / 10000000) + ' crore';
    if (n >= 100000) return '\u20B9' + trim(n / 100000) + ' lakh';
    if (n >= 1000) return '\u20B9' + trim(n / 1000) + ' thousand';
    return inr(n);
  }

  function trim(x) {
    return (Math.round(x * 100) / 100).toString();
  }

  function num(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(String(el.value).replace(/,/g, ''));
    return isNaN(v) || v < 0 ? 0 : v;
  }

  function radio(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  function roundUpTo(n, step) {
    return Math.ceil(n / step) * step;
  }

  /* Show "₹12 lakh" under every money input as the visitor types */
  function bindMoneyWords() {
    document.querySelectorAll('.money input').forEach(function (input) {
      var out = input.parentNode.parentNode.querySelector('.amount-words');
      if (!out) return;
      var update = function () {
        var v = parseFloat(input.value);
        out.textContent = v > 0 ? words(v) : '';
      };
      input.addEventListener('input', update);
      update();
    });
  }

  /* Remember where the visitor came from (ad campaign tags) for lead attribution */
  function captureSource() {
    var params = new URLSearchParams(window.location.search);
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid', 'gclid'];
    var found = [];
    keys.forEach(function (k) {
      if (params.get(k)) found.push(k + '=' + params.get(k).slice(0, 80));
    });
    var value = found.join('&');
    try {
      if (value) sessionStorage.setItem('ssa_source', value);
      else value = sessionStorage.getItem('ssa_source') || '';
    } catch (e) { /* storage unavailable, keep going */ }
    document.querySelectorAll('input[name="source"]').forEach(function (f) {
      f.value = value || 'direct';
    });
  }

  var current = { tool: '', summary: '' };

  /* Called by each tool whenever its result changes */
  function setResult(tool, summary) {
    current.tool = tool;
    current.summary = summary;
    document.querySelectorAll('input[name="tool"]').forEach(function (f) { f.value = tool; });
    document.querySelectorAll('input[name="summary"]').forEach(function (f) { f.value = summary; });
    document.querySelectorAll('.js-wa-result').forEach(function (a) {
      a.href = waLink('Hello Sri Sowbhagya Associates, I used your ' + tool + ' on the website.\n\n' + summary + '\n\nPlease help me review this.');
    });
    updatePeek();
    if (window.SSA_WA) window.SSA_WA.setMessage('Hello, I used the ' + tool + ' on your website. ' + summary.split('\n')[0]);
  }

  /* Mobile: the result card sits below a long form, so show a small pill that jumps to it */
  var peek, cardVisible = false;
  function updatePeek() {
    var fig = document.getElementById('r-figure');
    var card = document.querySelector('.result-card');
    if (!fig || !card) return;
    if (!peek) {
      peek = document.createElement('a');
      peek.className = 'result-peek';
      peek.href = '#';
      peek.addEventListener('click', function (e) {
        e.preventDefault();
        card.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      });
      document.body.appendChild(peek);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          cardVisible = entries[0].isIntersecting;
          peek.classList.toggle('hide', cardVisible);
        }).observe(card);
      }
    }
    var label = document.querySelector('.result-card .r-label');
    peek.innerHTML = '<span>' + (label ? label.textContent : 'Your result') + '</span><strong>' + fig.textContent + '</strong>';
  }

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* Lead form: require a valid mobile number and consent before posting to Netlify */
  function bindLeadForms() {
    document.querySelectorAll('form.js-lead').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        var ok = true;
        var phone = form.querySelector('input[name="phone"]');
        var phoneErr = form.querySelector('.js-phone-error');
        var digits = phone ? phone.value.replace(/\D/g, '') : '';
        if (digits.length > 10 && digits.indexOf('91') === 0) digits = digits.slice(2);
        if (!/^[6-9]\d{9}$/.test(digits)) {
          ok = false;
          if (phoneErr) phoneErr.classList.add('show');
        } else if (phoneErr) {
          phoneErr.classList.remove('show');
        }
        var name = form.querySelector('input[name="name"]');
        var nameErr = form.querySelector('.js-name-error');
        if (name && name.value.trim().length < 2) {
          ok = false;
          if (nameErr) nameErr.classList.add('show');
        } else if (nameErr) {
          nameErr.classList.remove('show');
        }
        var consent = form.querySelector('input[name="consent"]');
        var consentErr = form.querySelector('.js-consent-error');
        if (consent && !consent.checked) {
          ok = false;
          if (consentErr) consentErr.classList.add('show');
        } else if (consentErr) {
          consentErr.classList.remove('show');
        }
        if (!ok) {
          e.preventDefault();
          var firstErr = form.querySelector('.form-error.show');
          var target = firstErr ? firstErr.parentNode.querySelector('input') : null;
          if (target) target.focus();
        }
      });
      form.querySelectorAll('input').forEach(function (input) {
        input.addEventListener('input', function () {
          var err = input.closest('.field, .check-wrap');
          if (err) {
            var msg = err.querySelector('.form-error');
            if (msg) msg.classList.remove('show');
          }
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMoneyWords();
    captureSource();
    bindLeadForms();
  });

  window.SSA = {
    inr: inr,
    words: words,
    num: num,
    radio: radio,
    roundUpTo: roundUpTo,
    setResult: setResult,
    waLink: waLink
  };
})();
