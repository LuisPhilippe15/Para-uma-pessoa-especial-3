const appState = {
  currentScreen: 'opening',
  isTransitioning: false,
  loadingTimer: null,
  scannerTimer: null,
  scannerNumberTimer: null,
  typewriterId: 0,
  invitationTypewriterId: 0,
  heartTimer: null,
  heartsCollected: 0,
  heartsGoal: 15,
  audioContext: null,
  noButtonClicks: 0,
  isNoButtonFleeing: false,
  selectedSoundtrack: 'none',
  music: null,
  isMusicPlaying: false,

  answers: {
    perguntas: {
      cafe: '',
      flores: '',
      surpresas: '',
    },
    flor: '',
    convite: '',
  },
};

const selectors = {
  screen: '[data-screen]',
  nextButton: '[data-next-screen]',
  previousButton: '[data-previous-screen]',
  flowerButton: '[data-choice]',
  answerButton: '[data-answer]',
  questionCard: '[data-question]',
  questionAnswer: '[data-question-answer]',
  soundtrackButton: '[data-soundtrack]',
  summaryList: '#summary-list',
  finalMessage: '#final-message',
  openingTypewriter: '#opening-typewriter',
  startButton: '.start-button',
  loadingProgress: '#loading-progress',
  loadingPercent: '#loading-percent',
  loadingPhrase: '#loading-phrase',
  loadingContinue: '.loading-continue',
  identityConfirmation: '#identity-confirmation',
  questionsContinue: '.questions-continue',
  flowerFeedback: '#flower-feedback',
  flowerThought: '#flower-thought',
  flowerSpecial: '#lily-special',
  flowerContinue: '.flower-continue',
  scanItem: '.scan-item',
  compatibilityNumber: '#compatibility-number',
  compatibilityMessage: '#compatibility-message',
  compatibilityContinue: '.compatibility-continue',
  compatibilityResult: '.compatibility-result',
  heartGame: '#heart-game',
  heartCurrent: '#heart-counter-current',
  heartTotal: '#heart-counter-total',
  heartSuccess: '#heart-success',
  minigameContinue: '.minigame-continue',
  invitationTypewriter: '#invitation-typewriter',
  invitationQuestion: '#invitation-question',
  soundToggle: '#sound-toggle',
  soundtrackFeedback: '#soundtrack-feedback',
  transitionNote: '#transition-note',
  timeCabin: '#time-cabin',
  easterEgg: '#easter-egg',
  secretMessage: '#secret-message',
};

const transitionDuration = {
  exit: 360,
  enter: 520,
};

const loadingPhrases = [
  'Inicializando...',
  'Carregando coragem...',
  'Calibrando espaço-tempo...',
  'Verificando linhas temporais...',
  'Calculando compatibilidade...',
  'Preparando surpresa...',
  'Organizando pensamentos...',
  'Destino encontrado.',
];

const transitionPhrases = [
  'Dizem que as melhores histórias começam de um jeito inesperado.',
  'Às vezes basta um pouco de coragem.',
  'Espero que você esteja gostando da experiência.',
  'Algumas perguntas merecem um pouco de suspense.',
  'Prometo que essa missão tem um bom motivo.',
];

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function getScreen(screenName) {
  return document.querySelector(`[data-screen="${screenName}"]`);
}

function getCurrentScreen() {
  return getScreen(appState.currentScreen);
}

function lockButton(button) {
  if (!button) return;
  button.disabled = true;
  button.classList.add('is-locked');
  button.classList.remove('is-ready');
}

function unlockButton(button) {
  if (!button) return;
  button.disabled = false;
  button.classList.remove('is-locked');
  button.classList.add('is-ready');
}

function resetScreenTransition(screen) {
  if (!screen) return;
  screen.classList.remove('is-active', 'is-entering', 'is-leaving', 'transition-back');
  screen.dataset.active = 'false';
}

function prepareEnteringScreen(screen, direction) {
  resetScreenTransition(screen);

  if (direction === 'back') {
    screen.classList.add('transition-back');
  }

  screen.classList.add('is-active', 'is-entering');
  screen.dataset.active = 'true';
}

function updateStage(screenName) {
  document.body.classList.remove('stage-opening', 'stage-middle', 'stage-final');

  if (screenName === 'opening' || screenName === 'loading' || screenName === 'soundtrack') {
    document.body.classList.add('stage-opening');
    return;
  }

  if (screenName === 'final') {
    document.body.classList.add('stage-final');
    return;
  }

  document.body.classList.add('stage-middle');
}

function showTransitionNote() {
  const note = document.querySelector(selectors.transitionNote);
  if (!note) return;

  const phrase = transitionPhrases[Math.floor(Math.random() * transitionPhrases.length)];

  note.textContent = phrase;
  note.classList.remove('is-visible');

  window.setTimeout(() => {
    note.classList.add('is-visible');
  }, 40);
}

function showTimeCabinEasterVisual() {
  const cabin = document.querySelector(selectors.timeCabin);
  if (!cabin) return;

  if (Math.random() > 0.42) return;

  cabin.classList.remove('is-visible');

  window.setTimeout(() => {
    cabin.classList.add('is-visible');
  }, 120);
}

function createLilyParticles() {
  if (appState.answers.flor !== 'Lírio') return;

  for (let i = 0; i < 8; i += 1) {
    const particle = document.createElement('span');
    particle.className = 'lily-particle';
    particle.textContent = '🌸';
    particle.style.setProperty('--x', `${Math.random() * 420 - 210}px`);
    particle.style.setProperty('--y', `${Math.random() * -240 - 60}px`);
    particle.style.left = `${40 + Math.random() * 20}%`;
    particle.style.top = `${54 + Math.random() * 12}%`;

    document.body.appendChild(particle);

    window.setTimeout(() => {
      particle.remove();
    }, 1900);
  }
}

async function enterScreen(screen) {
  await wait(20);
  screen.classList.remove('is-entering');
  await wait(transitionDuration.enter);
}

async function leaveScreen(screen, direction) {
  if (!screen) return;

  if (direction === 'back') {
    screen.classList.add('transition-back');
  }

  screen.classList.add('is-leaving');
  screen.classList.remove('is-active');
  screen.dataset.active = 'false';

  await wait(transitionDuration.exit);
  resetScreenTransition(screen);
}

async function changeScreen(targetScreenName, triggerType = 'next') {
  const targetScreen = getScreen(targetScreenName);
  const currentScreen = getCurrentScreen();
  const direction = triggerType === 'previous' ? 'back' : 'forward';

  if (!targetScreen || appState.isTransitioning) return;
  if (targetScreenName === appState.currentScreen) return;

  appState.isTransitioning = true;
  document.body.classList.add('is-transitioning');

  showTransitionNote();
  showTimeCabinEasterVisual();
  createLilyParticles();

  await leaveScreen(currentScreen, direction);

  appState.currentScreen = targetScreenName;
  updateStage(targetScreenName);
  prepareEnteringScreen(targetScreen, direction);
  runScreenEffects(targetScreenName);

  await enterScreen(targetScreen);

  targetScreen.classList.remove('transition-back');
  appState.isTransitioning = false;
  document.body.classList.remove('is-transitioning');
}

async function typeWriter({ container, lines, typingSpeed = 42, lineDelay = 520, startDelay = 450, lineClass = 'typewriter__line', onComplete }) {
  if (!container || !Array.isArray(lines)) return;

  appState.typewriterId += 1;
  const currentTypewriterId = appState.typewriterId;

  container.innerHTML = '';
  await wait(startDelay);

  for (const line of lines) {
    if (currentTypewriterId !== appState.typewriterId) return;

    const paragraph = document.createElement('p');
    const text = document.createElement('span');
    const cursor = document.createElement('span');

    paragraph.className = lineClass;
    cursor.className = 'typewriter__cursor';

    paragraph.appendChild(text);
    paragraph.appendChild(cursor);
    container.appendChild(paragraph);

    for (const character of line) {
      if (currentTypewriterId !== appState.typewriterId) return;
      text.textContent += character;
      await wait(typingSpeed);
    }

    cursor.remove();
    await wait(lineDelay);
  }

  if (typeof onComplete === 'function') {
    onComplete();
  }
}

function startOpeningTypewriter() {
  const container = document.querySelector(selectors.openingTypewriter);
  const startButton = document.querySelector(selectors.startButton);

  lockButton(startButton);

  typeWriter({
    container,
    lines: [
      'Oi 😊',
      'Pensei bastante antes de fazer isso.',
      'Tenho uma pequena missão para você.',
      'Prometo que leva menos de dois minutos.',
    ],
    typingSpeed: 42,
    lineDelay: 520,
    startDelay: 450,
    onComplete: () => unlockButton(startButton),
  });
}

function setupMusic() {
  if (appState.music) return appState.music;

  appState.music = new Audio('assets/sounds/mpb-suave.m4a');
  appState.music.loop = true;
  appState.music.volume = 0.32;

  appState.music.addEventListener('error', () => {
    const feedback = document.querySelector(selectors.soundtrackFeedback);
    if (feedback) {
      feedback.textContent = 'Arquivo de música não encontrado. Coloque em assets/sounds/mpb-suave.m4a.';
      feedback.classList.add('is-visible');
    }
  });

  return appState.music;
}

function updateSoundToggle() {
  const toggle = document.querySelector(selectors.soundToggle);
  if (!toggle) return;

  if (appState.selectedSoundtrack === 'mpb') {
    toggle.classList.remove('is-hidden');
  } else {
    toggle.classList.add('is-hidden');
  }

  toggle.classList.toggle('is-playing', appState.isMusicPlaying);
  toggle.textContent = appState.isMusicPlaying ? '♪' : '♫';
}

function selectSoundtrack(button) {
  const feedback = document.querySelector(selectors.soundtrackFeedback);
  const value = button.dataset.soundtrack;

  document.querySelectorAll(selectors.soundtrackButton).forEach((item) => {
    item.classList.remove('selected');
  });

  button.classList.add('selected');
  appState.selectedSoundtrack = value;

  if (value === 'mpb') {
    setupMusic();
    if (feedback) feedback.textContent = 'Trilha escolhida: MPB suave.';
  } else {
    pauseMusic();
    if (feedback) feedback.textContent = 'Trilha escolhida: sem música.';
  }

  if (feedback) {
    feedback.classList.remove('is-visible');
    window.setTimeout(() => feedback.classList.add('is-visible'), 30);
  }

  updateSoundToggle();
}

function playMusic() {
  if (appState.selectedSoundtrack !== 'mpb') return;

  const music = setupMusic();

  music.play()
    .then(() => {
      appState.isMusicPlaying = true;
      updateSoundToggle();
    })
    .catch(() => {
      appState.isMusicPlaying = false;
      updateSoundToggle();
    });
}

function pauseMusic() {
  if (appState.music) {
    appState.music.pause();
  }

  appState.isMusicPlaying = false;
  updateSoundToggle();
}

function toggleMusic() {
  if (appState.isMusicPlaying) {
    pauseMusic();
    return;
  }

  playMusic();
}

function setLoadingPhrase(text) {
  const phrase = document.querySelector(selectors.loadingPhrase);
  if (!phrase) return;

  phrase.classList.add('is-changing');

  window.setTimeout(() => {
    phrase.textContent = text;
    phrase.classList.remove('is-changing');
  }, 220);
}

function resetLoadingScreen() {
  const progress = document.querySelector(selectors.loadingProgress);
  const percent = document.querySelector(selectors.loadingPercent);
  const continueButton = document.querySelector(selectors.loadingContinue);

  if (appState.loadingTimer) {
    window.clearInterval(appState.loadingTimer);
    appState.loadingTimer = null;
  }

  if (progress) progress.style.width = '0%';
  if (percent) percent.textContent = '0%';

  setLoadingPhrase(loadingPhrases[0]);
  lockButton(continueButton);
}

function startPremiumLoading() {
  const progress = document.querySelector(selectors.loadingProgress);
  const percent = document.querySelector(selectors.loadingPercent);
  const continueButton = document.querySelector(selectors.loadingContinue);

  resetLoadingScreen();

  let value = 0;
  let phraseIndex = 0;

  appState.loadingTimer = window.setInterval(() => {
    value += Math.floor(Math.random() * 8) + 4;
    if (value >= 100) value = 100;

    if (progress) progress.style.width = `${value}%`;
    if (percent) percent.textContent = `${value}%`;

    const nextPhraseIndex = Math.min(Math.floor((value / 100) * loadingPhrases.length), loadingPhrases.length - 1);

    if (nextPhraseIndex !== phraseIndex) {
      phraseIndex = nextPhraseIndex;
      setLoadingPhrase(loadingPhrases[phraseIndex]);
    }

    if (value === 100) {
      window.clearInterval(appState.loadingTimer);
      appState.loadingTimer = null;
      setLoadingPhrase('Destino encontrado.');

      window.setTimeout(() => unlockButton(continueButton), 520);
    }
  }, 360);
}

function resetQuestionsScreen() {
  const questionCards = document.querySelectorAll(selectors.questionCard);
  const confirmation = document.querySelector(selectors.identityConfirmation);
  const continueButton = document.querySelector(selectors.questionsContinue);

  appState.answers.perguntas = {
    cafe: '',
    flores: '',
    surpresas: '',
  };

  questionCards.forEach((card) => {
    card.classList.remove('is-answered');

    card.querySelectorAll(selectors.questionAnswer).forEach((button) => {
      button.classList.remove('is-selected');
    });
  });

  if (confirmation) confirmation.classList.remove('is-visible');

  lockButton(continueButton);
}

function areAllQuestionsAnswered() {
  const answers = appState.answers.perguntas;
  return Boolean(answers.cafe && answers.flores && answers.surpresas);
}

function confirmIdentity() {
  const confirmation = document.querySelector(selectors.identityConfirmation);
  const continueButton = document.querySelector(selectors.questionsContinue);

  if (confirmation) {
    confirmation.classList.remove('is-visible');

    window.setTimeout(() => {
      confirmation.classList.add('is-visible');
    }, 40);
  }

  window.setTimeout(() => unlockButton(continueButton), 520);
}

function saveQuestionCardAnswer(answerButton) {
  const card = answerButton.closest(selectors.questionCard);
  if (!card) return;

  const questionName = card.dataset.question;
  const answerValue = answerButton.dataset.questionAnswer;

  card.querySelectorAll(selectors.questionAnswer).forEach((button) => {
    button.classList.remove('is-selected');
  });

  answerButton.classList.add('is-selected');
  card.classList.add('is-answered');
  appState.answers.perguntas[questionName] = answerValue;

  if (areAllQuestionsAnswered()) {
    confirmIdentity();
  }
}

function resetFlowerScreen() {
  const flowerButtons = document.querySelectorAll(selectors.flowerButton);
  const feedback = document.querySelector(selectors.flowerFeedback);
  const thought = document.querySelector(selectors.flowerThought);
  const special = document.querySelector(selectors.flowerSpecial);
  const continueButton = document.querySelector(selectors.flowerContinue);

  appState.answers.flor = '';
  document.body.classList.remove('lily-mode');

  flowerButtons.forEach((button) => {
    button.classList.remove('selected', 'is-picked');
  });

  if (feedback) feedback.classList.remove('is-visible');
  if (thought) thought.classList.remove('is-visible');
  if (special) special.classList.remove('is-visible');

  lockButton(continueButton);
}

function showFlowerFeedback(isLily) {
  const feedback = document.querySelector(selectors.flowerFeedback);
  const thought = document.querySelector(selectors.flowerThought);

  if (feedback) {
    feedback.classList.remove('is-visible');
    window.setTimeout(() => feedback.classList.add('is-visible'), 40);
  }

  if (thought) {
    thought.classList.remove('is-visible');

    if (isLily) {
      window.setTimeout(() => thought.classList.add('is-visible'), 520);
    }
  }
}

function showLilySpecialAnimation() {
  const special = document.querySelector(selectors.flowerSpecial);
  if (!special) return;

  special.classList.remove('is-visible');

  window.setTimeout(() => {
    special.classList.add('is-visible');
  }, 80);
}

function hideLilySpecialAnimation() {
  const special = document.querySelector(selectors.flowerSpecial);
  if (!special) return;

  special.classList.remove('is-visible');
}

function selectFlower(button) {
  const continueButton = document.querySelector(selectors.flowerContinue);
  const selectedFlower = button.dataset.choice;
  const isLily = selectedFlower === 'Lírio';

  document.querySelectorAll(selectors.flowerButton).forEach((item) => {
    item.classList.remove('selected', 'is-picked');
  });

  button.classList.add('selected');

  window.setTimeout(() => {
    button.classList.add('is-picked');
  }, 20);

  appState.answers.flor = selectedFlower;
  document.body.classList.toggle('lily-mode', isLily);

  showFlowerFeedback(isLily);

  if (isLily) {
    showLilySpecialAnimation();
    createLilyParticles();
  } else {
    hideLilySpecialAnimation();
  }

  unlockButton(continueButton);
}

function resetCompatibilityScanner() {
  const items = document.querySelectorAll(selectors.scanItem);
  const number = document.querySelector(selectors.compatibilityNumber);
  const message = document.querySelector(selectors.compatibilityMessage);
  const continueButton = document.querySelector(selectors.compatibilityContinue);
  const result = document.querySelector(selectors.compatibilityResult);

  if (appState.scannerTimer) window.clearTimeout(appState.scannerTimer);
  if (appState.scannerNumberTimer) window.clearInterval(appState.scannerNumberTimer);

  appState.scannerTimer = null;
  appState.scannerNumberTimer = null;

  items.forEach((item) => {
    const bar = item.querySelector('.scan-item__track span');
    const value = item.querySelector('.scan-item__top strong');

    if (bar) bar.style.width = '0%';
    if (value) value.textContent = '0%';
  });

  if (number) number.textContent = '0%';
  if (message) message.textContent = 'Analisando sinais promissores...';
  if (result) result.classList.remove('is-complete');

  lockButton(continueButton);
}

function animateScannerBars() {
  const items = Array.from(document.querySelectorAll(selectors.scanItem));

  items.forEach((item, index) => {
    window.setTimeout(() => {
      const target = Number(item.dataset.scanValue);
      const bar = item.querySelector('.scan-item__track span');
      const value = item.querySelector('.scan-item__top strong');

      if (bar) bar.style.width = `${target}%`;

      let current = 0;
      const timer = window.setInterval(() => {
        current += 4;

        if (current >= target) {
          current = target;
          window.clearInterval(timer);
        }

        if (value) value.textContent = `${current}%`;
      }, 24);
    }, index * 360);
  });
}

function animateCompatibilityNumber() {
  const number = document.querySelector(selectors.compatibilityNumber);
  const message = document.querySelector(selectors.compatibilityMessage);
  const continueButton = document.querySelector(selectors.compatibilityContinue);
  const result = document.querySelector(selectors.compatibilityResult);

  if (!number) return;

  let value = 0;

  appState.scannerNumberTimer = window.setInterval(() => {
    value += 1.37;

    if (value >= 99.98) {
      value = 99.98;
      window.clearInterval(appState.scannerNumberTimer);
      appState.scannerNumberTimer = null;

      if (message) message.textContent = 'Compatibilidade extremamente alta.';
      if (result) result.classList.add('is-complete');

      window.setTimeout(() => unlockButton(continueButton), 520);
    }

    number.textContent = `${value.toFixed(2).replace('.', ',')}%`;
  }, 34);
}

function startCompatibilityScanner() {
  resetCompatibilityScanner();
  animateScannerBars();

  appState.scannerTimer = window.setTimeout(() => {
    animateCompatibilityNumber();
  }, 2100);
}

function getAudioContext() {
  if (!appState.audioContext) {
    appState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  return appState.audioContext;
}

function playHeartSound() {
  const audio = getAudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(620, audio.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(980, audio.currentTime + 0.08);

  gain.gain.setValueAtTime(0.001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, audio.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.14);

  oscillator.connect(gain);
  gain.connect(audio.destination);

  oscillator.start();
  oscillator.stop(audio.currentTime + 0.15);
}

function resetMiniGame() {
  const game = document.querySelector(selectors.heartGame);
  const current = document.querySelector(selectors.heartCurrent);
  const total = document.querySelector(selectors.heartTotal);
  const success = document.querySelector(selectors.heartSuccess);
  const continueButton = document.querySelector(selectors.minigameContinue);

  if (appState.heartTimer) {
    window.clearInterval(appState.heartTimer);
    appState.heartTimer = null;
  }

  appState.heartsCollected = 0;

  if (game) {
    game.querySelectorAll('.heart-target, .heart-burst').forEach((item) => item.remove());
  }

  if (current) current.textContent = '0';
  if (total) total.textContent = String(appState.heartsGoal);
  if (success) success.classList.remove('is-visible');

  lockButton(continueButton);
}

function createHeart() {
  const game = document.querySelector(selectors.heartGame);
  if (!game || appState.heartsCollected >= appState.heartsGoal) return;

  const heart = document.createElement('button');
  const maxX = Math.max(game.clientWidth - 64, 0);
  const maxY = Math.max(game.clientHeight - 64, 0);

  heart.type = 'button';
  heart.className = 'heart-target';
  heart.textContent = '❤️';
  heart.style.left = `${Math.random() * maxX}px`;
  heart.style.top = `${Math.random() * maxY}px`;
  heart.style.animationDelay = `${Math.random() * 180}ms`;

  heart.addEventListener('click', () => collectHeart(heart), { once: true });
  game.appendChild(heart);

  window.setTimeout(() => {
    if (heart.isConnected && !heart.classList.contains('is-collected')) {
      heart.remove();
    }
  }, 1800);
}

function createHeartBurst(x, y) {
  const game = document.querySelector(selectors.heartGame);
  if (!game) return;

  for (let i = 0; i < 10; i += 1) {
    const particle = document.createElement('span');
    const angle = (Math.PI * 2 * i) / 10;
    const distance = 28 + Math.random() * 26;

    particle.className = 'heart-burst';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * distance}px`);

    game.appendChild(particle);
    window.setTimeout(() => particle.remove(), 560);
  }
}

function collectHeart(heart) {
  if (appState.heartsCollected >= appState.heartsGoal) return;

  const game = document.querySelector(selectors.heartGame);
  const current = document.querySelector(selectors.heartCurrent);

  const heartRect = heart.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();

  const x = heartRect.left - gameRect.left + heartRect.width / 2;
  const y = heartRect.top - gameRect.top + heartRect.height / 2;

  playHeartSound();
  createHeartBurst(x, y);

  heart.classList.add('is-collected');
  window.setTimeout(() => heart.remove(), 360);

  appState.heartsCollected += 1;

  if (current) current.textContent = String(appState.heartsCollected);

  if (appState.heartsCollected >= appState.heartsGoal) {
    finishMiniGame();
  }
}

function finishMiniGame() {
  const success = document.querySelector(selectors.heartSuccess);
  const continueButton = document.querySelector(selectors.minigameContinue);
  const game = document.querySelector(selectors.heartGame);

  if (appState.heartTimer) {
    window.clearInterval(appState.heartTimer);
    appState.heartTimer = null;
  }

  if (game) {
    game.querySelectorAll('.heart-target').forEach((heart) => heart.remove());
  }

  if (success) success.classList.add('is-visible');

  window.setTimeout(() => unlockButton(continueButton), 500);
}

function startMiniGame() {
  resetMiniGame();

  for (let i = 0; i < 4; i += 1) {
    window.setTimeout(createHeart, i * 260);
  }

  appState.heartTimer = window.setInterval(() => {
    const heartsOnScreen = document.querySelectorAll('.heart-target').length;

    if (heartsOnScreen < 5) {
      createHeart();
    }
  }, 520);
}

function prepareNoButton() {
  const noButton = document.querySelector('[data-answer="Não"]');

  if (!noButton) return;

  appState.noButtonClicks = 0;
  appState.isNoButtonFleeing = false;

  noButton.textContent = '🙈 Não';
  noButton.classList.add('no-button');
  noButton.classList.remove('is-teasing', 'is-swapped', 'is-small', 'is-random', 'is-fleeing', 'has-joke');
  noButton.removeAttribute('data-joke');
  noButton.style.cssText = '';
}

function startInvitationText() {
  const container = document.querySelector(selectors.invitationTypewriter);
  const question = document.querySelector(selectors.invitationQuestion);

  prepareNoButton();

  if (question) question.classList.remove('is-visible');

  invitationTypeWriter({
    container,
    lines: [
      'Se eu tivesse uma máquina do tempo,',
      'talvez eu escolhesse exatamente este momento',
      'para fazer essa pergunta.',
    ],
    onComplete: () => {
      if (question) question.classList.add('is-visible');
    },
  });
}

function invitationTypeWriter({ container, lines, onComplete }) {
  if (!container || !Array.isArray(lines)) return;

  appState.invitationTypewriterId += 1;
  const currentId = appState.invitationTypewriterId;

  container.innerHTML = '';

  wait(420).then(async () => {
    for (const line of lines) {
      if (currentId !== appState.invitationTypewriterId) return;

      const paragraph = document.createElement('p');
      const text = document.createElement('span');
      const cursor = document.createElement('span');

      paragraph.className = 'invitation-typewriter__line';
      cursor.className = 'typewriter__cursor';

      paragraph.appendChild(text);
      paragraph.appendChild(cursor);
      container.appendChild(paragraph);

      for (const character of line) {
        if (currentId !== appState.invitationTypewriterId) return;
        text.textContent += character;
        await wait(48);
      }

      cursor.remove();
      await wait(560);
    }

    if (typeof onComplete === 'function') onComplete();
  });
}

function showNoButtonJoke(button, text) {
  button.dataset.joke = text;
  button.classList.add('has-joke', 'is-teasing');
  window.setTimeout(() => button.classList.remove('is-teasing'), 430);
}

function randomizeNoButton(button) {
  button.style.setProperty('--random-x', `${Math.round(Math.random() * 140 - 70)}px`);
  button.style.setProperty('--random-y', `${Math.round(Math.random() * 70 - 35)}px`);
  button.style.setProperty('--random-rotate', `${Math.round(Math.random() * 18 - 9)}deg`);
  button.classList.add('is-random');
}

function moveNoButtonAway(button, event) {
  if (!appState.isNoButtonFleeing) return;

  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const directionX = centerX >= event.clientX ? 1 : -1;
  const directionY = centerY >= event.clientY ? 1 : -1;

  button.style.setProperty('--flee-x', `${directionX * (34 + Math.random() * 42)}px`);
  button.style.setProperty('--flee-y', `${directionY * (18 + Math.random() * 34)}px`);
  button.style.setProperty('--flee-rotate', `${directionX * (8 + Math.random() * 8)}deg`);
  button.classList.add('is-fleeing');
}

function handleNoButtonClick(button) {
  appState.noButtonClicks += 1;

  if (appState.noButtonClicks === 1) {
    button.textContent = '🙈 Tem certeza?';
    showNoButtonJoke(button, 'Pensa com carinho...');
    return;
  }

  if (appState.noButtonClicks === 2) {
    button.textContent = '🙈 Pensa mais um pouquinho...';
    showNoButtonJoke(button, 'Só mais um pouquinho.');
    return;
  }

  if (appState.noButtonClicks === 3) {
    button.textContent = '🙈 Eu demorei bastante...';
    showNoButtonJoke(button, 'Foi feito com cuidado.');
    return;
  }

  if (appState.noButtonClicks === 4) {
    button.textContent = '🥺';
    showNoButtonJoke(button, 'Apelando para o emocional.');
    return;
  }

  if (appState.noButtonClicks === 5) {
    button.classList.add('is-swapped');
    randomizeNoButton(button);
    showNoButtonJoke(button, 'Troquei de posição.');
    return;
  }

  if (appState.noButtonClicks === 6) {
    button.classList.add('is-small');
    showNoButtonJoke(button, 'Fiquei menorzinho.');
    return;
  }

  if (appState.noButtonClicks === 7) {
    appState.isNoButtonFleeing = true;
    showNoButtonJoke(button, 'Agora eu fujo, mas dá pra clicar.');
    return;
  }

  appState.answers.convite = 'Não';
  changeScreen('final', 'next');
}

function createCelebrationPiece(type) {
  const piece = document.createElement('span');
  const colors = ['#d64f73', '#ff8aaa', '#ffd0dc', '#b83c5d', '#ffffff'];

  piece.className = type === 'heart'
    ? 'celebration-heart'
    : type === 'lantern'
      ? 'celebration-lantern'
      : 'celebration-piece';

  if (type === 'heart') {
    piece.textContent = Math.random() > 0.5 ? '❤️' : '💕';
    piece.style.setProperty('--size', `${18 + Math.random() * 24}px`);
  }

  if (type === 'confetti') {
    piece.style.setProperty('--piece-color', colors[Math.floor(Math.random() * colors.length)]);
    piece.style.setProperty('--rotate', `${Math.random() * 180}deg`);
  }

  piece.style.setProperty('--x', `${Math.random() * 100}%`);
  piece.style.setProperty('--drift', `${Math.random() * 220 - 110}px`);
  piece.style.setProperty('--duration', `${2.2 + Math.random() * 2.4}s`);
  piece.style.setProperty('--delay', `${Math.random() * 0.8}s`);

  return piece;
}

function runYesCelebration() {
  const existingOverlay = document.querySelector('.celebration-overlay');

  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement('div');
  const message = document.createElement('div');

  overlay.className = 'celebration-overlay';
  message.className = 'celebration-message';
  message.innerHTML = '<small id="celebration-status">Salvando resposta...</small><strong>Você acabou de desbloquear um encontro ❤️</strong>';

  for (let i = 0; i < 46; i += 1) overlay.appendChild(createCelebrationPiece('confetti'));
  for (let i = 0; i < 34; i += 1) overlay.appendChild(createCelebrationPiece('heart'));
  for (let i = 0; i < 12; i += 1) overlay.appendChild(createCelebrationPiece('lantern'));

  overlay.appendChild(message);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => overlay.classList.add('is-active'));

  window.setTimeout(() => {
    const status = document.querySelector('#celebration-status');
    if (status) status.textContent = 'Preparando próximo capítulo...';
  }, 1000);

  window.setTimeout(() => changeScreen('final', 'next'), 2600);
  window.setTimeout(() => overlay.remove(), 3600);
}

function saveInviteAnswer(button) {
  appState.answers.convite = button.dataset.answer || '';
}

function renderFinalSummary() {
  const summaryList = document.querySelector(selectors.summaryList);
  if (!summaryList) return;

  summaryList.innerHTML = `
    <li>Café: ${appState.answers.perguntas.cafe || 'não respondido'}</li>
    <li>Flores: ${appState.answers.perguntas.flores || 'não respondido'}</li>
    <li>Surpresas: ${appState.answers.perguntas.surpresas || 'não respondido'}</li>
    <li>Flor escolhida: ${appState.answers.flor || 'não escolhida'}</li>
    <li>Trilha: ${appState.selectedSoundtrack === 'mpb' ? 'MPB suave' : 'sem música'}</li>
    <li>Corações coletados: ${appState.heartsCollected}/${appState.heartsGoal}</li>
    <li>Resposta ao convite: ${appState.answers.convite || 'não respondida'}</li>
  `;
}

function renderFinalMessage() {
  const finalMessage = document.querySelector(selectors.finalMessage);
  if (!finalMessage) return;

  if (appState.answers.convite === 'Não') {
    finalMessage.textContent = 'Tudo bem. Só de você ter chegado até aqui, a missão já valeu a pena.';
    return;
  }

  finalMessage.textContent = 'Obrigado por aceitar.';
}

function toggleSecretMessage() {
  const message = document.querySelector(selectors.secretMessage);
  if (!message) return;

  message.classList.toggle('is-visible');
}

function runScreenEffects(screenName) {
  if (screenName === 'opening') startOpeningTypewriter();
  if (screenName === 'loading') startPremiumLoading();
  if (screenName === 'questions') resetQuestionsScreen();
  if (screenName === 'flower') resetFlowerScreen();
  if (screenName === 'compatibility') startCompatibilityScanner();
  if (screenName === 'minigame') startMiniGame();
  if (screenName === 'invitation') startInvitationText();

  if (screenName === 'final') {
    renderFinalSummary();
    renderFinalMessage();
  }
}

function handleAppClick(event) {
  const nextButton = event.target.closest(selectors.nextButton);
  const previousButton = event.target.closest(selectors.previousButton);
  const flowerButton = event.target.closest(selectors.flowerButton);
  const answerButton = event.target.closest(selectors.answerButton);
  const questionAnswerButton = event.target.closest(selectors.questionAnswer);
  const soundtrackButton = event.target.closest(selectors.soundtrackButton);
  const soundToggle = event.target.closest(selectors.soundToggle);
  const easterEgg = event.target.closest(selectors.easterEgg);

  if (soundToggle) {
    toggleMusic();
    return;
  }

  if (easterEgg) {
    toggleSecretMessage();
    return;
  }

  if (appState.isTransitioning) return;

  if (soundtrackButton) {
    selectSoundtrack(soundtrackButton);
    return;
  }

  if (questionAnswerButton) {
    saveQuestionCardAnswer(questionAnswerButton);
    return;
  }

  if (flowerButton) {
    selectFlower(flowerButton);
    return;
  }

  if (answerButton && answerButton.dataset.answer === 'Não') {
    handleNoButtonClick(answerButton);
    return;
  }

  if (answerButton && answerButton.dataset.answer === 'Sim') {
    saveInviteAnswer(answerButton);
    runYesCelebration();
    return;
  }

  if (nextButton) changeScreen(nextButton.dataset.nextScreen, 'next');
  if (previousButton) changeScreen(previousButton.dataset.previousScreen, 'previous');
}

function handleAppPointerMove(event) {
  const noButton = document.querySelector('[data-answer="Não"]');

  if (!noButton || !appState.isNoButtonFleeing) return;

  const rect = noButton.getBoundingClientRect();
  const distanceX = event.clientX - (rect.left + rect.width / 2);
  const distanceY = event.clientY - (rect.top + rect.height / 2);
  const distance = Math.hypot(distanceX, distanceY);

  if (distance < 130) moveNoButtonAway(noButton, event);
}

function initApp() {
  const screens = document.querySelectorAll(selectors.screen);
  const initialScreen = getScreen(appState.currentScreen);

  screens.forEach(resetScreenTransition);

  if (initialScreen) {
    initialScreen.classList.add('is-active');
    initialScreen.dataset.active = 'true';
  }

  updateStage(appState.currentScreen);
  document.addEventListener('click', handleAppClick);
  document.addEventListener('mousemove', handleAppPointerMove);
  startOpeningTypewriter();
}

document.addEventListener('DOMContentLoaded', initApp);
/* =========================================================
   CENA CINEMATOGRÁFICA APÓS O "SIM"
   - Tela preta
   - Silêncio
   - Texto emocional
   - Lanternas desenhadas em Canvas
   - Algumas atrás e outras na frente
========================================================= */

(function () {
  "use strict";

  const cinematicScene = document.getElementById("cinematicScene");
  const cinematicLine = document.getElementById("cinematicLine");
  const canvasBack = document.getElementById("lanternCanvasBack");
  const canvasFront = document.getElementById("lanternCanvasFront");

  if (!cinematicScene || !cinematicLine || !canvasBack || !canvasFront) {
    return;
  }

  const ctxBack = canvasBack.getContext("2d");
  const ctxFront = canvasFront.getContext("2d");

  let lanternsBack = [];
  let lanternsFront = [];
  let lanternAnimationId = null;
  let lanternSpawnTimer = null;
  let cinematicAlreadyStarted = false;

  const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

  function resizeLanternCanvas() {
    const ratio = window.devicePixelRatio || 1;

    [canvasBack, canvasFront].forEach((canvas) => {
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    });

    [ctxBack, ctxFront].forEach((ctx) => {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    });
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createLantern(layer) {
    const isFront = layer === "front";

    return {
      x: randomBetween(40, window.innerWidth - 40),
      y: window.innerHeight + randomBetween(40, 220),
      size: isFront ? randomBetween(30, 58) : randomBetween(18, 38),
      speed: isFront ? randomBetween(0.34, 0.72) : randomBetween(0.22, 0.46),
      sway: randomBetween(18, 62),
      phase: randomBetween(0, Math.PI * 2),
      rotation: randomBetween(-0.08, 0.08),
      opacity: isFront ? randomBetween(0.62, 0.95) : randomBetween(0.26, 0.58),
      glow: isFront ? randomBetween(0.9, 1.45) : randomBetween(0.45, 0.85),
      age: 0
    };
  }

  function drawRoundedLantern(ctx, x, y, width, height, radius) {
    const right = x + width;
    const bottom = y + height;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(right - radius, y);
    ctx.quadraticCurveTo(right, y, right, y + radius);
    ctx.lineTo(right, bottom - radius);
    ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
    ctx.lineTo(x + radius, bottom);
    ctx.quadraticCurveTo(x, bottom, x, bottom - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawLantern(ctx, lantern) {
    const swayX = Math.sin(lantern.age * 0.018 + lantern.phase) * lantern.sway;
    const pulse = 1 + Math.sin(lantern.age * 0.035 + lantern.phase) * 0.05;

    const x = lantern.x + swayX;
    const y = lantern.y;
    const size = lantern.size * pulse;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lantern.rotation + Math.sin(lantern.age * 0.015) * 0.05);
    ctx.globalAlpha = lantern.opacity;

    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 2.4);
    glow.addColorStop(0, `rgba(255, 213, 132, ${0.42 * lantern.glow})`);
    glow.addColorStop(0.34, `rgba(255, 173, 87, ${0.2 * lantern.glow})`);
    glow.addColorStop(1, "rgba(255, 173, 87, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 2.4, 0, Math.PI * 2);
    ctx.fill();

    const bodyWidth = size * 0.76;
    const bodyHeight = size * 1.08;

    const bodyGradient = ctx.createLinearGradient(0, -bodyHeight / 2, 0, bodyHeight / 2);
    bodyGradient.addColorStop(0, "rgba(255, 237, 186, 0.95)");
    bodyGradient.addColorStop(0.48, "rgba(255, 190, 104, 0.9)");
    bodyGradient.addColorStop(1, "rgba(218, 103, 67, 0.62)");

    drawRoundedLantern(ctx, -bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight, size * 0.22);
    ctx.fillStyle = bodyGradient;
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 243, 214, 0.55)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.35, -bodyHeight * 0.48);
    ctx.quadraticCurveTo(0, -bodyHeight * 0.78, bodyWidth * 0.35, -bodyHeight * 0.48);
    ctx.strokeStyle = "rgba(255, 230, 178, 0.5)";
    ctx.stroke();

    const flame = ctx.createRadialGradient(0, bodyHeight * 0.2, 1, 0, bodyHeight * 0.2, size * 0.26);
    flame.addColorStop(0, "rgba(255, 255, 220, 1)");
    flame.addColorStop(0.45, "rgba(255, 190, 76, 0.88)");
    flame.addColorStop(1, "rgba(255, 109, 66, 0)");

    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.arc(0, bodyHeight * 0.18, size * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function updateLanterns(list) {
    return list
      .map((lantern) => ({
        ...lantern,
        y: lantern.y - lantern.speed,
        age: lantern.age + 1,
        opacity: lantern.y < 120 ? lantern.opacity * 0.992 : lantern.opacity
      }))
      .filter((lantern) => lantern.y > -180 && lantern.opacity > 0.03);
  }

  function animateLanterns() {
    ctxBack.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctxFront.clearRect(0, 0, window.innerWidth, window.innerHeight);

    lanternsBack = updateLanterns(lanternsBack);
    lanternsFront = updateLanterns(lanternsFront);

    lanternsBack.forEach((lantern) => drawLantern(ctxBack, lantern));
    lanternsFront.forEach((lantern) => drawLantern(ctxFront, lantern));

    lanternAnimationId = requestAnimationFrame(animateLanterns);
  }

  function startLanternCanvas() {
    resizeLanternCanvas();

    lanternsBack = Array.from({ length: 12 }, () => createLantern("back"));
    lanternsFront = Array.from({ length: 7 }, () => createLantern("front"));

    lanternsBack.forEach((lantern, index) => {
      lantern.y = window.innerHeight - index * 90 + randomBetween(0, 80);
    });

    lanternsFront.forEach((lantern, index) => {
      lantern.y = window.innerHeight - index * 140 + randomBetween(0, 120);
    });

    if (!lanternAnimationId) {
      animateLanterns();
    }

    clearInterval(lanternSpawnTimer);
    lanternSpawnTimer = setInterval(() => {
      lanternsBack.push(createLantern("back"));

      if (Math.random() > 0.36) {
        lanternsFront.push(createLantern("front"));
      }
    }, 1200);
  }

  function fadeAudioTo(targetVolume, duration = 1800) {
    const audio =
      document.querySelector("audio") ||
      document.getElementById("backgroundMusic") ||
      window.backgroundMusic ||
      window.missionAudio;

    if (!audio || typeof audio.volume !== "number") {
      return;
    }

    const startVolume = audio.volume;
    const startedAt = performance.now();

    function step(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  async function showCinematicLine(text, options = {}) {
    const speed = options.speed || 46;

    cinematicLine.textContent = "";
    cinematicLine.classList.remove("is-showing", "is-soft");

    if (options.soft) {
      cinematicLine.classList.add("is-soft");
    }

    await wait(180);
    cinematicLine.classList.add("is-showing");

    for (let index = 0; index < text.length; index += 1) {
      cinematicLine.textContent += text[index];
      await wait(speed + Math.random() * 18);
    }
  }

  function goToFinalScreen() {
    document.body.classList.remove("cinematic-lock");
    document.body.classList.add("stage-final");

    cinematicScene.classList.remove("is-visible");
    cinematicScene.setAttribute("aria-hidden", "true");

    if (typeof window.showScreen === "function") {
      window.showScreen("final");
      return;
    }

    const screens = document.querySelectorAll("[data-screen]");
    const finalScreen = document.querySelector('[data-screen="final"]');

    screens.forEach((screen) => {
      screen.classList.remove("active", "is-active");
      screen.setAttribute("data-active", "false");
      screen.hidden = true;
    });

    if (finalScreen) {
      finalScreen.hidden = false;
      finalScreen.classList.add("active", "is-active");
      finalScreen.setAttribute("data-active", "true");
    }
  }

  async function runCinematicYesScene() {
    if (cinematicAlreadyStarted) {
      return;
    }

    cinematicAlreadyStarted = true;

    document.body.classList.add("cinematic-lock");

    cinematicScene.classList.add("is-visible");
    cinematicScene.setAttribute("aria-hidden", "false");

    fadeAudioTo(0, 900);

    await wait(1100);

    await showCinematicLine("Na verdade...", { speed: 58 });
    await wait(1700);

    cinematicLine.classList.remove("is-showing");
    await wait(900);

    await showCinematicLine("esse site nunca foi sobre programação.", { speed: 48 });
    await wait(1800);

    cinematicLine.classList.remove("is-showing");
    await wait(900);

    await showCinematicLine("Foi só a maneira mais bonita\nque eu encontrei\npara criar coragem\nde te fazer essa pergunta.", {
      speed: 42,
      soft: true
    });

    await wait(2200);

    startLanternCanvas();

    await wait(1900);

    fadeAudioTo(0.58, 3200);

    cinematicLine.classList.remove("is-showing");
    await wait(800);

    await showCinematicLine("Obrigado por chegar até aqui.", {
      speed: 62,
      soft: true
    });

    await wait(2600);

    goToFinalScreen();
  }

  function findYesButtons() {
    const directSelectors = [
      "#yesButton",
      "#yes-button",
      ".yes-button",
      ".button--yes",
      "[data-answer='yes']",
      "[data-choice='yes']",
      "[data-response='yes']"
    ];

    const directButtons = directSelectors
      .flatMap((selector) => Array.from(document.querySelectorAll(selector)));

    const textButtons = Array.from(document.querySelectorAll("button"))
      .filter((button) => button.textContent.trim().toLowerCase().includes("sim"));

    return [...new Set([...directButtons, ...textButtons])];
  }

  function bindYesButton() {
    const yesButtons = findYesButtons();

    yesButtons.forEach((button) => {
      if (button.dataset.cinematicBound === "true") {
        return;
      }

      button.dataset.cinematicBound = "true";

      button.addEventListener(
        "click",
        (event) => {
          const isFinalRestart = button.textContent.toLowerCase().includes("recomeçar");

          if (isFinalRestart) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          runCinematicYesScene();
        },
        true
      );
    });
  }

  window.addEventListener("resize", resizeLanternCanvas);
  document.addEventListener("DOMContentLoaded", bindYesButton);

  bindYesButton();
})();
/* =========================================================
   CORRECAO DO AUDIO MPB
   Tenta tocar assets/sounds/mpb-suave.m4a e, se falhar,
   tenta assets/sounds/mpb-suave.mp3.
========================================================= */

(function () {
  "use strict";

  const AUDIO_PATHS = [
    "assets/sounds/mpb-suave.m4a",
    "assets/sounds/mpb-suave.mp3"
  ];

  let missionMusic = null;
  let selectedMusic = false;
  let currentPathIndex = 0;

  function createMusic() {
    if (missionMusic) {
      return missionMusic;
    }

    missionMusic = new Audio(AUDIO_PATHS[currentPathIndex]);
    missionMusic.loop = true;
    missionMusic.volume = 0.35;
    missionMusic.preload = "auto";

    window.missionAudio = missionMusic;
    window.backgroundMusic = missionMusic;

    return missionMusic;
  }

  function tryPlayMusic() {
    if (!selectedMusic) {
      return;
    }

    const music = createMusic();

    music.play().catch(() => {
      currentPathIndex += 1;

      if (currentPathIndex < AUDIO_PATHS.length) {
        missionMusic = null;
        tryPlayMusic();
      } else {
        console.log("Nao foi possivel tocar a musica. Confira o arquivo em assets/sounds.");
      }
    });
  }

  function selectMpbOption() {
    selectedMusic = true;
    createMusic();

    const warning = document.querySelector(".music-warning, .sound-warning, [data-audio-warning]");
    if (warning) {
      warning.textContent = "Trilha selecionada. A musica comeca ao continuar.";
    }
  }

  function selectSilentOption() {
    selectedMusic = false;

    if (missionMusic) {
      missionMusic.pause();
      missionMusic.currentTime = 0;
    }
  }

  function bindMusicButtons() {
    const allButtonsAndCards = Array.from(document.querySelectorAll("button, .choice-card, .option-card, [data-music]"));

    allButtonsAndCards.forEach((element) => {
      const text = element.textContent.trim().toLowerCase();

      if (text.includes("mpb suave")) {
        element.addEventListener("click", selectMpbOption);
      }

      if (text.includes("sem musica") || text.includes("sem música")) {
        element.addEventListener("click", selectSilentOption);
      }

      if (text.includes("continuar")) {
        element.addEventListener("click", () => {
          setTimeout(tryPlayMusic, 120);
        });
      }
    });

    const soundToggle = document.querySelector(".sound-toggle");

    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        selectedMusic = true;
        tryPlayMusic();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", bindMusicButtons);
  bindMusicButtons();
})();
/* =========================================================
   AUDIO DEFINITIVO - MPB SUAVE
========================================================= */

(function () {
  "use strict";

  const music = document.getElementById("missionMusic");
  let mpbSelected = false;
  let musicStarted = false;

  if (!music) {
    console.log("Audio nao encontrado no HTML.");
    return;
  }

  music.volume = 0.35;
  window.missionAudio = music;
  window.backgroundMusic = music;

  function showAudioMessage(text) {
    let message = document.querySelector(".audio-status-message");

    if (!message) {
      message = document.createElement("div");
      message.className = "audio-status-message";
      message.style.position = "fixed";
      message.style.left = "50%";
      message.style.bottom = "24px";
      message.style.transform = "translateX(-50%)";
      message.style.zIndex = "99999";
      message.style.padding = "14px 18px";
      message.style.borderRadius = "999px";
      message.style.background = "rgba(255, 255, 255, 0.9)";
      message.style.color = "#2b1f25";
      message.style.fontWeight = "700";
      message.style.boxShadow = "0 18px 50px rgba(0,0,0,0.18)";
      document.body.appendChild(message);
    }

    message.textContent = text;

    setTimeout(() => {
      message.remove();
    }, 3500);
  }

  async function playMusic() {
    if (!mpbSelected) {
      return;
    }

    try {
      await music.play();
      musicStarted = true;
      showAudioMessage("Trilha sonora ativada.");
    } catch (error) {
      showAudioMessage("Clique no botao de musica para ativar o som.");
      console.log("Erro ao tocar audio:", error);
    }
  }

  function pauseMusic() {
    music.pause();
    musicStarted = false;
    showAudioMessage("Som pausado.");
  }

  function bindAudioControls() {
    const clickableElements = Array.from(
      document.querySelectorAll("button, .choice-card, .option-card, .sound-option, [data-music]")
    );

    clickableElements.forEach((element) => {
      const text = element.textContent.trim().toLowerCase();

      if (text.includes("mpb suave")) {
        element.addEventListener("click", () => {
          mpbSelected = true;
          music.load();
          showAudioMessage("MPB suave selecionada.");
        });
      }

      if (text.includes("sem música") || text.includes("sem musica")) {
        element.addEventListener("click", () => {
          mpbSelected = false;
          pauseMusic();
        });
      }

      if (text.includes("continuar")) {
        element.addEventListener("click", () => {
          setTimeout(playMusic, 250);
        });
      }
    });

    const soundButton = document.querySelector(".sound-toggle");

    if (soundButton) {
      soundButton.addEventListener("click", () => {
        mpbSelected = true;

        if (musicStarted && !music.paused) {
          pauseMusic();
        } else {
          playMusic();
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", bindAudioControls);
  bindAudioControls();
})();