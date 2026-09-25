/* Floating "Chat on WhatsApp" button. Include on every page:
   <script src="/assets/js/whatsapp.js" defer></script>
   A page can set its own opening message with <body data-wa-message="...">. */
(function () {
  var NUMBER = '919246582445';

  var byPath = [
    ['/insurance/careers', 'Hello, I would like to know more about becoming an insurance advisor with Sri Sowbhagya Associates.'],
    ['/insurance/life', 'Hello, I would like guidance on life / term insurance.'],
    ['/insurance/health', 'Hello, I would like guidance on health insurance.'],
    ['/insurance/motor', 'Hello, I would like guidance on motor insurance.'],
    ['/insurance/property', 'Hello, I would like guidance on home / property insurance.'],
    ['/insurance', 'Hello, I would like guidance on insurance.'],
    ['/mutual-funds', 'Hello, I would like to know about mutual funds and SIPs.'],
    ['/gold-investments', 'Hello, I would like to know about gold investment options.'],
    ['/bni', 'Hello, I am from the BNI network and would like to connect.'],
    ['/tools', 'Hello, I used a calculator on your website and would like help.']
  ];

  var message = 'Hello Sri Sowbhagya Associates, I would like to know more.';

  function pick() {
    var custom = document.body.getAttribute('data-wa-message');
    if (custom) return custom;
    var p = window.location.pathname;
    for (var i = 0; i < byPath.length; i++) {
      if (p.indexOf(byPath[i][0]) === 0) return byPath[i][1];
    }
    return message;
  }

  function link(text) {
    return 'https://wa.me/' + NUMBER + '?text=' + encodeURIComponent(text);
  }

  function build() {
    if (document.querySelector('.wa-float')) return;
    message = pick();

    var style = document.createElement('style');
    style.textContent =
      '.wa-float{position:fixed;right:18px;bottom:18px;z-index:1002;display:inline-flex;align-items:center;gap:.55rem;' +
      'background:#1F9D55;color:#fff;font-weight:700;font-size:.95rem;padding:.75rem 1.1rem .75rem .9rem;border-radius:999px;' +
      'box-shadow:0 8px 22px rgba(15,23,42,.28);text-decoration:none;font-family:var(--font-sans,sans-serif)}' +
      '.wa-float:hover,.wa-float:focus{background:#17864A;color:#fff;text-decoration:none}' +
      '.wa-float svg{width:22px;height:22px;flex:none}' +
      '.wa-float.raised{bottom:86px}' +
      '@media (max-width:560px){.wa-float{padding:.8rem;right:14px;bottom:14px}.wa-float .wa-text{display:none}.wa-float.raised{bottom:82px}}' +
      '@media print{.wa-float{display:none}}';
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.className = 'wa-float';
    a.href = link(message);
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Chat with us on WhatsApp');
    a.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z"/>' +
      '<path d="M8.5 10.5h7M8.5 13.5h4.5"/></svg><span class="wa-text">WhatsApp us</span>';

    /* Pages with their own fixed bottom bar (e.g. /bni/ on mobile) need the button lifted */
    var bar = document.querySelector('.bni-bar');
    if (bar && window.getComputedStyle(bar).position === 'fixed') a.classList.add('raised');

    a.addEventListener('click', function () {
      if (typeof window.gtag === 'function') window.gtag('event', 'whatsapp_click', { page: location.pathname });
      if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { method: 'whatsapp' });
    });

    document.body.appendChild(a);
  }

  window.SSA_WA = {
    setMessage: function (text) {
      message = text;
      var a = document.querySelector('.wa-float');
      if (a) a.href = link(text);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
