/* Speak landing v2 - small, accessible, illustrative feature reel.
 * All staged states are visual mockups, not speech recognition or server calls.
 */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const showcase = $('hero-showcase');
  if (!showcase) return;

  const scenes = Array.from(showcase.querySelectorAll('.mock-scene'));
  const tabs = Array.from(showcase.querySelectorAll('[data-slide-to]'));
  const location = $('showcase-location');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 11800;
  const sceneNames = ['Practice', 'Word hints', 'Create exercise', 'My phrases'];
  const targetWords = ['Nunca', 'he', 'estado', 'aqu\u00ed', 'antes.'];
  const state = { index: 0, elapsed: 0, lastTime: 0, fired: new Set(), statuses: Array(5).fill('hidden') };
  const firstNode = (id) => $(id).firstChild;
  const builderText = firstNode('builder-typing');
  const personalText = firstNode('personal-entry');
  const topic = 'Practice common phrasal verbs';
  const phrase = 'Could you say that again?';
  const clickableAudio = Array.from(showcase.querySelectorAll('[data-speak]'));
  const audioTranscript = $('hint-transcript');

  function wordToken(word, status) {
    const token = document.createElement('span');
    token.className = 'hero-token';
    if (status === 'close') token.classList.add('is-close');
    if (status === 'correct') token.classList.add('is-correct');
    const knownCount = status === 'close' ? Math.min(4, word.length - 1) : status === 'correct' ? word.length : 0;
    let letterIndex = 0;
    for (const ch of Array.from(word)) {
      if (!/[\p{L}\p{N}]/u.test(ch)) {
        const mark = document.createElement('span');
        mark.className = 'punct-mark';
        mark.textContent = ch;
        token.appendChild(mark);
        continue;
      }
      const char = document.createElement('span');
      if (letterIndex < knownCount) {
        char.className = 'known';
        char.textContent = ch;
      } else {
        char.textContent = '\u00b7';
      }
      token.appendChild(char);
      letterIndex++;
    }
    return token;
  }

  function renderRecall() {
    const root = $('recall-words');
    root.replaceChildren(...targetWords.map((word, i) => wordToken(word, state.statuses[i])));
    const matched = state.statuses.filter((value) => value === 'correct').length;
    $('matched-count').textContent = matched + ' of ' + targetWords.length;
  }

  function setWord(index, status) {
    state.statuses[index] = status;
    renderRecall();
  }

  function animateText(t, element, value, start, end) {
    if (t < start) return;
    const length = Math.round((Math.min(end, t) - start) / (end - start) * value.length);
    element.nodeValue = value.slice(0, length);
  }

  function resetScene(index) {
    if (index === 0) {
      state.statuses = Array(5).fill('hidden');
      renderRecall();
      $('recall-feedback').classList.remove('is-visible');
      $('mock-mic').classList.remove('is-listening');
      $('mic-status').classList.remove('is-listening');
      $('mic-status').textContent = 'Speak the phrase';
      $('recall-feedback-text').textContent = 'Close match: finish the word to unlock it.';
    }
    if (index === 1) {
      $('hint-card').classList.remove('is-open');
      $('hint-selected-word').classList.remove('is-tapped');
      $('hint-foot').textContent = 'Tap a word for audio and examples.';
      audioTranscript.classList.remove('is-visible');
      audioTranscript.textContent = '';
      clickableAudio.forEach((btn) => btn.classList.remove('is-playing'));
    }
    if (index === 2) {
      builderText.nodeValue = '';
      $('builder-button').classList.remove('is-clicked', 'is-loading');
      $('builder-button-text').textContent = 'Create practice';
      $('builder-result').classList.remove('is-visible');
    }
    if (index === 3) {
      personalText.nodeValue = '';
      $('personal-add').classList.remove('is-clicked');
      $('personal-saved').classList.remove('is-visible');
    }
  }

  function goTo(next) {
    const index = (next + scenes.length) % scenes.length;
    state.index = index;
    state.elapsed = 0;
    state.fired.clear();
    scenes.forEach((scene, i) => {
      const active = i === index;
      scene.classList.toggle('is-active', active);
      scene.setAttribute('aria-hidden', String(!active));
      scene.inert = !active;
    });
    tabs.forEach((tab, i) => {
      tab.classList.toggle('is-active', i === index);
      tab.style.setProperty('--progress', '0');
      if (i === index) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
    });
    const navItems = Array.from(showcase.querySelectorAll('.mock-sidebar span'));
    navItems.forEach((item, i) => item.classList.toggle('selected', i === (index < 2 ? 0 : 1)));
    location.textContent = sceneNames[index];
    resetScene(index);
    if (prefersReducedMotion) renderReducedMotion(index);
  }

  function once(label, threshold, callback) {
    if (state.elapsed >= threshold && !state.fired.has(label)) {
      state.fired.add(label);
      callback();
    }
  }

  function stage(t) {
    switch (state.index) {
      case 0:
        once('mic-start', 700, () => {
          $('mock-mic').classList.add('is-listening');
          $('mic-status').classList.add('is-listening');
          $('mic-status').textContent = 'Listening...';
        });
        once('w0', 1800, () => setWord(0, 'correct'));
        once('w1', 2950, () => setWord(1, 'correct'));
        once('close', 4300, () => {
          setWord(2, 'close');
          $('recall-feedback').classList.add('is-visible');
          $('mic-status').textContent = 'Almost there...';
        });
        once('resolved', 6600, () => {
          setWord(2, 'correct');
          $('recall-feedback').classList.remove('is-visible');
        });
        once('w3', 7900, () => setWord(3, 'correct'));
        once('w4', 9200, () => setWord(4, 'correct'));
        once('mic-stop', 10100, () => {
          $('mock-mic').classList.remove('is-listening');
          $('mic-status').textContent = 'Great! All 5 words.';
        });
        break;
      case 1:
        once('select', 800, () => {
          $('hint-selected-word').classList.add('is-tapped');
          $('hint-foot').textContent = 'Word selected';
        });
        once('open', 1700, () => {
          $('hint-card').classList.add('is-open');
          $('hint-foot').textContent = 'Listen to the word or an example.';
        });
        once('word-audio', 3350, () => {
          clickableAudio[0].classList.add('is-playing');
          audioTranscript.textContent = 'Word audio: "tomar"';
          audioTranscript.classList.add('is-visible');
        });
        once('word-finish', 4850, () => clickableAudio[0].classList.remove('is-playing'));
        once('example-audio', 6250, () => {
          clickableAudio[1].classList.add('is-playing');
          audioTranscript.textContent = 'Example: "Tengo que tomar una decisi\u00f3n."';
        });
        once('example-finish', 9000, () => clickableAudio[1].classList.remove('is-playing'));
        break;
      case 2:
        animateText(t, builderText, topic, 600, 4000);
        once('generate-click', 5050, () => $('builder-button').classList.add('is-clicked'));
        once('generate-loading', 5550, () => {
          $('builder-button').classList.remove('is-clicked');
          $('builder-button').classList.add('is-loading');
          $('builder-button-text').textContent = 'Creating...';
        });
        once('generate-result', 7250, () => {
          $('builder-button').classList.remove('is-loading');
          $('builder-button-text').textContent = 'Create practice';
          $('builder-result').classList.add('is-visible');
        });
        break;
      case 3:
        animateText(t, personalText, phrase, 650, 4400);
        once('save-click', 5600, () => $('personal-add').classList.add('is-clicked'));
        once('save-end', 6550, () => {
          $('personal-add').classList.remove('is-clicked');
          $('personal-saved').classList.add('is-visible');
        });
        break;
      default:
        break;
    }
  }

  function renderReducedMotion(index) {
    state.elapsed = 11000;
    stage(11000);
    tabs[index].style.setProperty('--progress', '1');
  }

  showcase.querySelector('#slide-prev').addEventListener('click', () => goTo(state.index - 1));
  showcase.querySelector('#slide-next').addEventListener('click', () => goTo(state.index + 1));
  tabs.forEach((tab) => tab.addEventListener('click', () => goTo(Number(tab.dataset.slideTo))));
  showcase.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(state.index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(state.index - 1);
    }
  });

  clickableAudio.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) {
        audioTranscript.textContent = 'Audio is unavailable on this browser.';
        audioTranscript.classList.add('is-visible');
        return;
      }
      window.speechSynthesis.cancel();
      clickableAudio.forEach((item) => item.classList.remove('is-playing'));
      btn.classList.add('is-playing');
      const utterance = new SpeechSynthesisUtterance(btn.dataset.speak || '');
      utterance.lang = btn.dataset.lang || 'es-ES';
      utterance.rate = .88;
      const stop = () => btn.classList.remove('is-playing');
      utterance.onend = stop;
      utterance.onerror = stop;
      window.speechSynthesis.speak(utterance);
      audioTranscript.textContent = btn.dataset.speak || '';
      audioTranscript.classList.add('is-visible');
    });
  });

  goTo(0);
  if (prefersReducedMotion) return;
  function tick(now) {
    const delta = Math.min(100, Math.max(0, now - (state.lastTime || now)));
    state.lastTime = now;
    if (!document.hidden) {
      const atEnd = state.elapsed >= duration;
      const interacting = showcase.matches(':hover') || showcase.contains(document.activeElement);
      if (atEnd && !interacting) goTo(state.index + 1);
      else if (!atEnd) {
        state.elapsed = Math.min(duration, state.elapsed + delta);
        stage(state.elapsed);
        tabs[state.index].style.setProperty('--progress', String(state.elapsed / duration));
      }
    }
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
})();