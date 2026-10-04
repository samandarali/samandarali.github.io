/**
 * Commercial Credit Risk Analysis — platform interactions
 * Works with existing cra_scripts.js (calculators, glossary, assessment nav).
 */
(function () {
  'use strict';

  const PROGRESS_KEY = 'ccra-platform-progress-v1';
  const SECTION_KEYS = [
    'introduction',
    'commercial-banking',
    'financial-statements',
    'financial-ratios',
    'credit-assessment',
    'practice'
  ];

  function sectionIdToDom(key) {
    const map = {
      introduction: 'introduction-section',
      'commercial-banking': 'commercial-banking-section',
      'financial-statements': 'financial-statements-section',
      'financial-ratios': 'financial-ratios-section',
      'credit-assessment': 'credit-assessment-section',
      practice: 'practice-section'
    };
    return map[key] || key;
  }

  /* ---- Fixed header + unified nav ---- */
  function initHeaderNav() {
    const headerLinks = Array.from(document.querySelectorAll('.platform-nav a[data-nav-section]'));
    const journeyLinks = Array.from(document.querySelectorAll('.journey-step[data-nav-section]'));
    const allLinks = [...headerLinks, ...journeyLinks];

    const sections = SECTION_KEYS.map(id => document.getElementById(sectionIdToDom(id))).filter(Boolean);

    function setActive(sectionKey) {
      allLinks.forEach(link => {
        const active = link.dataset.navSection === sectionKey;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    allLinks.forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        const target = href ? document.querySelector(href) : null;
        if (!target) return;
        e.preventDefault();
        target.setAttribute('open', '');
        const summary = target.querySelector(':scope > .learning-summary');
        if (summary) summary.setAttribute('aria-expanded', 'true');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(link.dataset.navSection);
        markSectionVisited(link.dataset.navSection);
      });
    });

    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver(
        entries => {
          const visible = entries
            .filter(e => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible) return;
          const id = visible.target.id;
          const key = id.replace('-section', '').replace('financial-', 'financial-');
          const normalized = id === 'introduction-section' ? 'introduction'
            : id === 'commercial-banking-section' ? 'commercial-banking'
            : id === 'financial-statements-section' ? 'financial-statements'
            : id === 'financial-ratios-section' ? 'financial-ratios'
            : id === 'credit-assessment-section' ? 'credit-assessment'
            : id === 'practice-section' ? 'practice' : null;
          if (normalized) setActive(normalized);
        },
        { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.12, 0.25] }
      );
      sections.forEach(s => observer.observe(s));
    }

    setActive('introduction');
  }

  /* ---- Course progress ---- */
  function loadVisited() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveVisited(v) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(v));
    } catch { /* ignore */ }
  }

  let visited = loadVisited();

  function markSectionVisited(key) {
    if (!key) return;
    visited[key] = true;
    saveVisited(visited);
    updateProgressBar();
    updateJourneyComplete();
  }

  function updateProgressBar() {
    const fill = document.getElementById('course-progress-fill');
    const pctEl = document.getElementById('course-progress-pct');
    if (!fill || !pctEl) return;
    const count = SECTION_KEYS.filter(k => visited[k]).length;
    const pct = Math.round((count / SECTION_KEYS.length) * 100);
    fill.style.width = `${pct}%`;
    pctEl.textContent = `${pct}%`;
    const bar = document.getElementById('course-progress-bar');
    if (bar) bar.setAttribute('aria-valuenow', String(pct));
  }

  function updateJourneyComplete() {
    document.querySelectorAll('.journey-step[data-nav-section]').forEach(step => {
      const done = visited[step.dataset.navSection];
      step.classList.toggle('is-complete', !!done);
    });
  }

  function watchSectionOpens() {
    SECTION_KEYS.forEach(key => {
      const el = document.getElementById(
        key === 'introduction' ? 'introduction-section'
          : key === 'commercial-banking' ? 'commercial-banking-section'
          : key === 'financial-statements' ? 'financial-statements-section'
          : key === 'financial-ratios' ? 'financial-ratios-section'
          : key === 'credit-assessment' ? 'credit-assessment-section'
          : 'practice-section'
      );
      if (!el) return;
      el.addEventListener('toggle', () => {
        if (el.open) markSectionVisited(key);
      });
      if (el.open) markSectionVisited(key);
    });

    document.querySelectorAll('.learning-section[data-section]').forEach(section => {
      section.addEventListener('toggle', () => {
        if (section.open) {
          const sub = section.dataset.section;
          if (sub) {
            visited[`sub:${sub}`] = true;
            saveVisited(visited);
          }
        }
      });
    });
  }

  /* ---- Five Cs tab explorer (content mirrors existing list) ---- */
  function initFiveCsExplorer() {
    const root = document.getElementById('five-cs-explorer');
    if (!root) return;

    const tabs = root.querySelectorAll('.five-c-tab');
    const panels = root.querySelectorAll('.five-c-panel');

    function show(id) {
      tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.panel === id ? 'true' : 'false'));
      panels.forEach(p => p.classList.toggle('is-visible', p.id === id));
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => show(tab.dataset.panel));
      tab.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          show(tab.dataset.panel);
        }
      });
    });

    show(panels[0]?.id);
  }

  /* ---- Mini quiz ---- */
  function initQuiz() {
    const root = document.getElementById('platform-quiz-5cs');
    if (!root) return;

    const answers = {
      q1: 'capacity',
      q2: 'character',
      q3: 'collateral'
    };

    root.querySelectorAll('.quiz-item').forEach(item => {
      const qId = item.dataset.question;
      const feedback = item.querySelector('.quiz-feedback');

      item.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          item.querySelectorAll('.quiz-option').forEach(b => {
            b.classList.remove('is-correct', 'is-wrong');
            b.disabled = true;
          });
          const chosen = btn.dataset.value;
          const correct = answers[qId];
          if (chosen === correct) {
            btn.classList.add('is-correct');
            item.dataset.answeredCorrect = '1';
            feedback.textContent = btn.dataset.correctMsg || 'Correct.';
          } else {
            btn.classList.add('is-wrong');
            item.dataset.answeredCorrect = '0';
            const correctBtn = item.querySelector(`[data-value="${correct}"]`);
            if (correctBtn) correctBtn.classList.add('is-correct');
            feedback.textContent = btn.dataset.wrongMsg || 'Review the 5 Cs definitions above and try again on the next question.';
          }
          updateQuizScore(root);
        });
      });
    });
  }

  function updateQuizScore(root) {
    const scoreEl = root.querySelector('.quiz-score');
    if (!scoreEl) return;
    const items = root.querySelectorAll('.quiz-item');
    const correct = [...items].filter(item => item.dataset.answeredCorrect === '1').length;
    scoreEl.textContent = `Score: ${correct} of ${items.length} correct — continue with the 12-step assessment to apply these concepts in context.`;
  }

  /* ---- DSCR sensitivity lab ---- */
  function initDscrLab() {
    const root = document.getElementById('dscr-sensitivity-lab');
    if (!root) return;

    const cashSlider = root.querySelector('#dscr-cash-slider');
    const debtSlider = root.querySelector('#dscr-debt-slider');
    const cashVal = root.querySelector('#dscr-cash-val');
    const debtVal = root.querySelector('#dscr-debt-val');
    const dscrEl = root.querySelector('#dscr-live-value');
    const bandEl = root.querySelector('#dscr-live-band');
    const card = root.querySelector('.dscr-result-card');

    function fmt(n) {
      return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n);
    }

    function recalc() {
      const cash = Number(cashSlider.value);
      const debt = Number(debtSlider.value);
      cashVal.textContent = fmt(cash);
      debtVal.textContent = fmt(debt);
      const dscr = debt > 0 ? cash / debt : null;
      if (dscr === null) {
        dscrEl.textContent = '—';
        bandEl.textContent = 'Set debt service above zero';
        card.classList.remove('is-weak', 'is-strong');
        return;
      }
      dscrEl.textContent = dscr.toFixed(2) + '×';
      if (dscr < 1) {
        bandEl.textContent = 'Below 1.0× — insufficient coverage';
        card.classList.add('is-weak');
        card.classList.remove('is-strong');
      } else if (dscr >= 1.25) {
        bandEl.textContent = '1.25×+ — often viewed more comfortably in many commercial contexts';
        card.classList.add('is-strong');
        card.classList.remove('is-weak');
      } else {
        bandEl.textContent = '1.0–1.25× — marginal; structure and covenants matter';
        card.classList.remove('is-weak', 'is-strong');
      }
    }

    cashSlider.addEventListener('input', recalc);
    debtSlider.addEventListener('input', recalc);
    recalc();
  }

  /* ---- Credit decision workshop ---- */
  function initDecisionWorkshop() {
    const root = document.getElementById('credit-decision-workshop');
    if (!root) return;

    const output = root.querySelector('.decision-output');
    let selected = null;

    root.querySelectorAll('.decision-choice').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.decision-choice').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selected = btn.dataset.decision;
        renderDecisionOutput();
      });
    });

    root.querySelectorAll('.decision-checklist input').forEach(cb => {
      cb.addEventListener('change', renderDecisionOutput);
    });

    function renderDecisionOutput() {
      const checks = [...root.querySelectorAll('.decision-checklist input:checked')].map(i => i.value);
      if (!selected) {
        output.textContent = 'Select a recommendation type, then tick the evidence you would cite in a real credit memo.';
        return;
      }

      const base = {
        approve: 'An approval recommendation should show stable repayment capacity, acceptable residual risk, and alignment between structure and cash flow.',
        conditional: 'Approve-with-conditions is appropriate when repayment is plausible but specific mitigants (amount, collateral, covenants, guarantees, reporting) are required before risk is acceptable.',
        decline: 'A decline should explain why repayment capacity or risk remains unacceptable after reasonable structural alternatives, not based on a single ratio in isolation.'
      }[selected];

      const evidence = checks.length
        ? `Evidence you selected: ${checks.join('; ')}. In a full report, each point would tie to numbers, qualitative findings, and the proposed facility structure.`
        : 'Add checklist items to mirror how you would support the recommendation in a credit report.';

      output.innerHTML = `<strong>${selected === 'approve' ? 'Approve' : selected === 'conditional' ? 'Approve with conditions' : 'Decline'}:</strong> ${base}<br><br>${evidence}`;
    }

    renderDecisionOutput();
  }

  /* ---- Ratio category chips: active state ---- */
  function initRatioChips() {
    document.querySelectorAll('.chip[data-jump-section]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip[data-jump-section]').forEach(c => c.classList.remove('is-active-chip'));
        chip.classList.add('is-active-chip');
      });
    });
  }

  function init() {
    initHeaderNav();
    watchSectionOpens();
    updateProgressBar();
    updateJourneyComplete();
    initFiveCsExplorer();
    initQuiz();
    initDscrLab();
    initDecisionWorkshop();
    initRatioChips();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
