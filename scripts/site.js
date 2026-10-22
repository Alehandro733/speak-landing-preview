/* Speak landing v2: navigation, mini-challenge, and decorative UI. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const nav = $('main-nav');
  const toggle = $('nav-toggle');
  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });
  document.addEventListener('pointerdown', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeNav();
  });

  const exercises = [
    { language:'SPANISH', prompt:'I would like a coffee, please.', answer:'Quisiera un caf\u00e9, por favor.', locale:'es-ES' },
    { language:'FRENCH', prompt:'I have never been here.', answer:'Je ne suis jamais venu ici.', locale:'fr-FR' },
    { language:'GERMAN', prompt:'Where is the train station?', answer:'Wo ist der Bahnhof?', locale:'de-DE' },
  ];
  let current = 0;
  let revealed = false;
  const answer = $('challenge-words');
  const answerButton = $('challenge-reveal');
  const answerButtonText = answerButton.querySelector('span');

  function renderWords(value, show) {
    const fragment = document.createDocumentFragment();
    for (const word of value.trim().split(/\s+/)) {
      const token = document.createElement('span');
      token.className = 'challenge-token' + (show ? ' is-revealed' : '');
      for (const char of Array.from(word)) {
        const span = document.createElement('span');
        if (/[\p{L}\p{N}]/u.test(char)) {
          span.className = 'challenge-letter';
          span.textContent = show ? char : '\u00b7';
        } else {
          span.className = 'punct';
          span.textContent = char;
        }
        token.appendChild(span);
      }
      fragment.appendChild(token);
    }
    answer.replaceChildren(fragment);
  }

  function renderChallenge() {
    const ex = exercises[current];
    $('challenge-index').textContent = String(current + 1).padStart(2, '0') + ' / ' + String(exercises.length).padStart(2, '0');
    $('challenge-language').textContent = 'SAY THIS IN ' + ex.language;
    $('challenge-prompt').textContent = ex.prompt;
    renderWords(ex.answer, revealed);
    answerButtonText.textContent = revealed ? 'Hide phrase' : 'Show phrase';
    answerButton.setAttribute('aria-pressed', String(revealed));
  }

  answerButton.addEventListener('click', () => {
    revealed = !revealed;
    renderChallenge();
  });
  $('challenge-next').addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    current = (current + 1) % exercises.length;
    revealed = false;
    renderChallenge();
  });
  $('challenge-listen').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      $('challenge-listen').querySelector('span').textContent = 'Not available';
      return;
    }
    const ex = exercises[current];
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ex.answer);
    utterance.lang = ex.locale;
    utterance.rate = .88;
    window.speechSynthesis.speak(utterance);
  });
  renderChallenge();

  [1, 2].forEach((num) => {
    const target = $('sound-bars-' + (num === 1 ? 'one' : 'two'));
    if (!target) return;
    const bars = document.createDocumentFragment();
    for (let i = 0; i < 24; i++) {
      const bar = document.createElement('span');
      const height = 5 + Math.round(20 * Math.abs(Math.sin((i + 1) * (num === 1 ? .65 : .83)) * Math.cos(i * .22)));
      bar.style.height = height + 'px';
      bars.appendChild(bar);
    }
    target.appendChild(bars);
  });
})();