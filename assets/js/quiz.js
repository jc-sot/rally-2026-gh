// JSON-driven quiz single-page app
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(document.location.search);
  const grade = Number(params.get("g"));
  const questionNumber = Number(params.get("q")) - 1;

// Config

  const DATA_URL_GH = "https://github.com/jc-sot/rally-2026-gh/tree/main/assets/data";
  const DATA_URL_PATH = `/assets/data/g${grade}.json`;
  let DATA_URL;

  if (window.location.hostname.includes("github")) {
    DATA_URL = `${DATA_URL_GH}/${DATA_URL_PATH}`;
  } else {
    DATA_URL = `.${DATA_URL_PATH}`;
  }

  const STORAGE_KEY = 'quiz_app_state_v1';
  const MODAL_DURATION_MS = 1200;

  // Elements
  const gradeEl = document.getElementById('grade');
  const qNumEl = document.getElementById('questionNumber');
  const qTextEl = document.getElementById('questionText');
  const answerInput = document.getElementById('answerInput');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');

  const responseModalEl = document.getElementById('responseModal');
  const modalMessage = document.getElementById('modalMessage');
  const modalIcon = document.getElementById('modalIcon');
  const responseModal = new bootstrap.Modal(responseModalEl, { backdrop: true, keyboard: false });

  // State
  let questions = [];
  let state = {
    currentIndex: 0,
    answers: {}, // id -> { value, correct }
    score: 0
  };

  // Load saved state
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          state = Object.assign(state, parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load state', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save state', e);
    }
  }

  // Fetch questions JSON
  async function loadQuestions() {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load questions');
    questions = await res.json();
  }

  // Render current question
  function render() {
    if (!questions.length) return;

    const q = questions[questionNumber];
    gradeEl.textContent = grade;
    qNumEl.textContent = q.id;
    qTextEl.innerHTML = `<p>${q.text}</p>`;

    // Populate answer if saved
    const saved = state.answers[q.id];
    answerInput.value = saved ? saved.value : '';
    hljs.highlightAll();
  }

  // Simple HTML escape
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // Normalize answer for comparison
  function normalizeAnswer(s) {
    return String(s || '').trim().toLowerCase().replace(/[.,!?;:]+$/g, '');
  }

  // Show modal feedback
  function showModal(correct) {
    if (correct) {
      modalIcon.innerHTML = '<svg width="36" height="36" viewBox="0 0 16 16" fill="#198754" xmlns="http://www.w3.org/2000/svg"><path d="M13.485 1.929a1 1 0 0 1 0 1.414L6.414 10.414a1 1 0 0 1-1.414 0L2.515 7.93a1 1 0 1 1 1.414-1.414L6 8.586l6.071-6.071a1 1 0 0 1 1.414 0z"/></svg>';
      modalMessage.textContent = 'Correct!';
    } else {
      modalIcon.innerHTML = '<svg width="36" height="36" viewBox="0 0 16 16" fill="#dc3545" xmlns="http://www.w3.org/2000/svg"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';
      modalMessage.textContent = 'Not quite. Try again.';
    }
    responseModal.show();
    setTimeout(() => responseModal.hide(), MODAL_DURATION_MS);
  }

  // Evaluate answer for current question
  function evaluateCurrent() {
    const q = questions[questionNumber];
    const raw = answerInput.value || '';
    const normalized = normalizeAnswer(raw);

    // Accept any of the answers in the array
    const correct = (q.answers || []).some(a => normalizeAnswer(a) === normalized);

    // Update state
    const prev = state.answers[q.id];
    if (!prev || prev.correct !== correct) {
      // adjust score
      if (correct && (!prev || !prev.correct)) state.score += 1;
      if (!correct && prev && prev.correct) state.score -= 1;
    }

    state.answers[q.id] = { value: raw, correct };
    saveState();
    render();
    showModal(correct);
  }

  // Clear current answer
  function clearCurrent() {
    const q = questions[state.currentIndex];
    answerInput.value = '';
    if (state.answers[q.id]) {
      // if previously correct, decrement score
      if (state.answers[q.id].correct) state.score = Math.max(0, state.score - 1);
      delete state.answers[q.id];
      saveState();
      render();
    }
    answerInput.focus();
  }

  // Initialize app
  async function init() {
    try {
      loadState();
      await loadQuestions();

      // If saved index out of range, reset
      if (state.currentIndex >= questions.length) state.currentIndex = 0;

      render();

      // Event listeners
      submitBtn.addEventListener('click', evaluateCurrent);
      clearBtn.addEventListener('click', clearCurrent);

      // Allow Enter+Ctrl inside textarea to submit
      answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          submitBtn.click();
        }
      });

    } catch (err) {
      qTextEl.innerHTML = `<p class="text-danger">Error loading quiz: ${escapeHtml(err.message)}</p>`;
    }
  }

  init();
});
