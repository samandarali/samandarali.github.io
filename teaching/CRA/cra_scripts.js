
(function () {
  const viewers = new Map();

  function measureNaturalDocument(viewer) {
    const doc = viewer.doc;
    // Temporarily remove transform so offset dimensions are natural dimensions.
    const previous = doc.style.transform;
    doc.style.transform = 'scale(1)';
    const width = doc.offsetWidth;
    const height = doc.offsetHeight;
    doc.style.transform = previous;
    return { width, height };
  }

  function calculateFitScale(viewer) {
    const availableWidth = Math.max(1, viewer.stage.clientWidth - 24);
    const natural = measureNaturalDocument(viewer);
    return Math.min(1, availableWidth / natural.width);
  }

  function renderViewer(viewer) {
    const natural = measureNaturalDocument(viewer);
    const scale = viewer.scale;

    viewer.doc.style.transform = `scale(${scale})`;
    viewer.scaler.style.width = `${natural.width * scale}px`;
    viewer.scaler.style.height = `${natural.height * scale}px`;

    const fitScale = calculateFitScale(viewer);
    const isFit = Math.abs(scale - fitScale) < 0.005;

    viewer.stage.classList.toggle('is-zoomed', !isFit);

    if (isFit) {
      viewer.stage.style.height = 'auto';
      viewer.stage.scrollTop = 0;
      viewer.stage.scrollLeft = 0;
      viewer.readout.textContent = 'Fit';
    } else {
      viewer.readout.textContent = `${Math.round(scale * 100)}%`;
    }
  }

  function fitViewer(viewer) {
    viewer.scale = calculateFitScale(viewer);
    renderViewer(viewer);
  }

  function changeZoom(viewer, delta) {
    const fitScale = calculateFitScale(viewer);
    const minScale = Math.max(0.25, fitScale * 0.65);
    const maxScale = 1.6;

    viewer.scale = Math.min(maxScale, Math.max(minScale, viewer.scale + delta));
    renderViewer(viewer);
  }

  document.querySelectorAll('.statement-card').forEach(card => {
    const viewer = {
      card,
      stage: card.querySelector('.document-stage'),
      scaler: card.querySelector('.document-scaler'),
      doc: card.querySelector('.financial-document'),
      readout: card.querySelector('.zoom-readout'),
      scale: 1
    };

    viewers.set(card.dataset.viewer, viewer);

    card.querySelector('[data-action="in"]').addEventListener('click', () => {
      changeZoom(viewer, 0.10);
    });

    card.querySelector('[data-action="out"]').addEventListener('click', () => {
      changeZoom(viewer, -0.10);
    });

    card.querySelector('[data-action="fit"]').addEventListener('click', () => {
      fitViewer(viewer);
    });
  });

  // Cross-statement highlighting.
  document.querySelectorAll('tr.linked').forEach(row => {
    row.addEventListener('click', () => {
      const key = row.dataset.link;
      const wasActive = row.classList.contains('active');

      document.querySelectorAll('tr.linked').forEach(r => r.classList.remove('active'));

      if (!wasActive) {
        document.querySelectorAll(`tr.linked[data-link="${key}"]`).forEach(r => {
          r.classList.add('active');
        });
      }
    });
  });

  // Initial full-document fit.
  function fitAll() {
    viewers.forEach(viewer => fitViewer(viewer));
  }

  window.addEventListener('load', fitAll);

  // Re-fit only viewers currently in Fit mode when the window/card size changes.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      viewers.forEach(viewer => {
        const oldFit = Math.abs(viewer.scale - calculateFitScale(viewer)) < 0.03 ||
          viewer.readout.textContent === 'Fit';
        if (oldFit) {
          fitViewer(viewer);
        } else {
          renderViewer(viewer);
        }
      });
    }, 100);
  });
})();

// !-- =====================================================================
//      SECTION 4–7 SCRIPT: glossary tooltips, collapsible learning sections,
//      formula ↔ statement highlighting, Expected Loss calculator, and the
//      Financial Ratio calculator. Kept separate from the original script
//      above so the existing zoom / fit / cross-statement logic is untouched.
//      ===================================================================== --
(function () {

  /* -----------------------------------------------------------------
     1. GLOSSARY TOOLTIPS
     ----------------------------------------------------------------- */
  const GLOSSARY = {
    revenue: { title: 'Revenue / Net Sales', def: 'Revenue generated from the company’s normal business activities.', rel: 'Lenders examine the size, growth, stability, diversification, and recurrence of revenue.', watch: 'Declining sales, high customer concentration, or growth that is not producing cash.' },
    cogs: { title: 'Cost of Goods Sold / Cost of Sales', def: 'Direct costs associated with producing or acquiring the products or services sold.', rel: 'Changes in COGS affect gross margin and can show cost pressure.', watch: 'COGS increasing faster than revenue.' },
    grossProfit: { title: 'Gross Profit', def: 'Gross Profit = Revenue − COGS.', rel: 'Shows how much earnings remain after direct production costs, before operating expenses.', watch: 'Declining gross margins.' },
    opex: { title: 'Operating Expenses', def: 'Costs required to operate the business, such as selling, administrative, and research expenses.', rel: 'Reflects the cost structure required to support revenue generation.', watch: 'Operating expenses growing faster than revenue.' },
    ebit: { title: 'EBIT / Operating Income', def: 'Earnings Before Interest and Taxes. Operating income is generally EBIT when no significant classification differences exist.', rel: 'Important because interest coverage ratios often use EBIT.', watch: 'EBIT declining while interest expense rises.' },
    interestExpense: { title: 'Interest Expense', def: 'Cost of borrowed money.', rel: 'Higher interest expense reduces cash and earnings available to service debt.', watch: 'Interest expense increasing faster than EBIT.' },
    netIncome: { title: 'Net Income', def: 'Profit remaining after all expenses, interest, and taxes.', rel: 'Shows bottom-line profitability.', watch: 'Net income is not the same as cash flow — a profitable company can still face repayment problems.' },
    cash: { title: 'Cash and Cash Equivalents', def: 'Highly liquid funds available immediately or almost immediately.', rel: 'Provides direct short-term repayment capacity.', watch: 'A sustained decline in cash reserves relative to obligations.' },
    marketableSecurities: { title: 'Marketable Securities', def: 'Liquid investments that can generally be sold relatively quickly.', rel: 'Market value and liquidity still matter — not all marketable securities convert to cash at book value equally fast.', watch: 'A large share tied up in less-liquid or volatile securities.' },
    receivables: { title: 'Accounts Receivable', def: 'Money owed by customers.', rel: 'Receivables may provide liquidity, but the lender should consider aging, concentration, collectability, bad debts, and customer quality.', watch: 'Receivables growing much faster than sales.' },
    inventory: { title: 'Inventory', def: 'Goods held for sale or production. Inventory is normally less liquid than cash or receivables.', rel: 'Indicates how much capital is tied up in unsold goods.', watch: 'Slow-moving inventory, obsolete inventory, or inventory growing faster than sales.' },
    currentAssets: { title: 'Current Assets', def: 'Assets expected to be converted into cash, sold, or consumed within approximately one year.', rel: 'Connects directly to the Current Ratio and Working Capital.', watch: 'Current assets composed mainly of slow-moving items rather than cash-like assets.' },
    ppe: { title: 'Property, Plant and Equipment', def: 'Long-term tangible operating assets.', rel: 'Book value is not necessarily equal to liquidation or collateral value.', watch: 'Heavy reliance on PP&E as collateral without independent valuation.' },
    currentLiabilities: { title: 'Current Liabilities', def: 'Obligations generally due within approximately one year.', rel: 'Connects with the Current Ratio, Quick Ratio, and Working Capital.', watch: 'Current liabilities rising faster than current assets.' },
    payables: { title: 'Accounts Payable', def: 'Amounts owed to suppliers.', rel: 'A normal part of operating liquidity management.', watch: 'Unusually increasing payables can sometimes indicate cash-flow pressure.' },
    commercialPaper: { title: 'Commercial Paper', def: 'Short-term unsecured borrowing.', rel: 'A source of short-term funding that must be regularly refinanced.', watch: 'Refinancing and liquidity risk if market access tightens.' },
    termDebt: { title: 'Term Debt', def: 'Longer-term interest-bearing borrowing.', rel: 'Connects with leverage and debt-service analysis.', watch: 'Maturities concentrated in a short window, creating refinancing risk.' },
    equity: { title: 'Shareholders’ Equity', def: 'Residual owners’ interest after liabilities are deducted from assets (Assets = Liabilities + Shareholders’ Equity).', rel: 'Equity provides a financial cushion to creditors.', watch: 'A shrinking equity base relative to total liabilities.' },
    totalAssets: { title: 'Total Assets', def: 'The sum of all current and non-current assets owned by the company.', rel: 'The denominator for asset-based efficiency and leverage measures.', watch: 'Asset growth not matched by earnings or cash flow growth.' },
    totalLiabilities: { title: 'Total Liabilities', def: 'All obligations of the company, including interest-bearing debt and operating liabilities such as payables and accrued expenses.', rel: 'Used in broader solvency measures such as Total Liabilities-to-Equity.', watch: 'Total liabilities growing faster than assets or equity.' },
    ocf: { title: 'Operating Cash Flow', def: 'Cash generated or consumed by normal business operations.', rel: 'One of the most important areas for evaluating repayment capacity.', watch: 'Operating cash flow persistently below net income.' },
    icf: { title: 'Investing Cash Flow', def: 'Cash flows related to investments and long-term assets.', rel: 'Shows how much cash is being deployed into or generated from long-term investments.', watch: 'Investing inflows driven by asset sales rather than normal portfolio activity.' },
    capex: { title: 'Capital Expenditures', def: 'Purchases of property, plant, and equipment.', rel: 'Capital expenditure consumes cash and may affect the cash available for debt repayment.', watch: 'Capex materially exceeding operating cash flow for a sustained period.' },
    financingCF: { title: 'Financing Cash Flow', def: 'Cash flows from borrowing, repaying debt, issuing shares, repurchasing shares, and paying dividends.', rel: 'Shows how the company is funding itself and returning capital to investors and creditors.', watch: 'Heavy reliance on new borrowing to fund shareholder returns.' },
    debtIssuance: { title: 'Debt Issuance', def: 'New borrowing raised during the period.', rel: 'Cash Flow Statement → financing cash inflow; Balance Sheet → debt liability increases.', watch: 'Repeated issuance used to cover operating shortfalls.' },
    debtRepayment: { title: 'Debt Repayment', def: 'Principal repaid during the period.', rel: 'Cash Flow Statement → financing cash outflow; Balance Sheet → debt liability decreases.', watch: 'Repayments funded by new borrowing rather than operating cash flow.' },
    dividends: { title: 'Dividends', def: 'Cash distributed to shareholders.', rel: 'Dividends transfer cash to shareholders and reduce cash retained in the business.', watch: 'Dividends maintained despite declining operating cash flow.' },
    endingCash: { title: 'Ending Cash', def: 'Cash and cash equivalents at period end.', rel: 'Connects directly with cash on the Balance Sheet.', watch: 'A declining ending cash balance across periods.' },
    beginningEquity: { title: 'Beginning Equity', def: 'Total shareholders’ equity at the start of the period.', rel: 'The starting point for reconciling changes in the owners’ interest.', watch: 'N/A — used as a reference point for the period’s equity roll-forward.' },
    commonStock: { title: 'Common Stock / Additional Paid-In Capital', def: 'Capital contributed by shareholders through share issuance, net of amounts withheld for share settlements.', rel: 'Reflects new equity capital raised from owners.', watch: 'Heavy reliance on new share issuance to fund operations.' },
    shareRepurchases: { title: 'Share Repurchases', def: 'Company purchases of its own shares.', rel: 'Share repurchases generally reduce shareholders’ equity and cash.', watch: 'Large repurchases funded by debt rather than free cash flow.' },
    oci: { title: 'Other Comprehensive Income', def: 'Gains and losses not included in net income, such as certain foreign currency and investment adjustments.', rel: 'Affects total equity without passing through the income statement.', watch: 'Persistent negative OCI eroding the equity cushion.' },
    endingEquity: { title: 'Ending Equity', def: 'Total shareholders’ equity at period end.', rel: 'Connects directly to shareholders’ equity on the Balance Sheet.', watch: 'A declining trend in ending equity over multiple periods.' }
  };

  const tooltipEl = document.createElement('div');
  tooltipEl.id = 'glossary-tooltip';
  tooltipEl.setAttribute('role', 'tooltip');
  tooltipEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tooltipEl);

  let activeTermEl = null;

  function buildTooltipHTML(key) {
    const g = GLOSSARY[key];
    if (!g) return null;
    return '<p class="tt-title">' + g.title + '</p>' +
      '<div class="tt-row"><span class="tt-label">Definition</span>' + g.def + '</div>' +
      '<div class="tt-row"><span class="tt-label">Why it matters in credit analysis</span>' + g.rel + '</div>' +
      '<div class="tt-row"><span class="tt-label">Watch for</span>' + g.watch + '</div>';
  }

  function positionTooltip(el) {
    const rect = el.getBoundingClientRect();
    tooltipEl.style.left = '0px';
    tooltipEl.style.top = '0px';
    const ttRect = tooltipEl.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + 8;

    // Keep within viewport horizontally.
    const maxLeft = window.innerWidth - ttRect.width - 10;
    if (left > maxLeft) left = Math.max(10, maxLeft);
    if (left < 10) left = 10;

    // Flip above if there isn't room below.
    if (top + ttRect.height > window.innerHeight - 10) {
      top = rect.top - ttRect.height - 8;
      if (top < 10) top = 10;
    }

    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';
  }

  function showTooltip(el) {
    const key = el.dataset.term;
    const html = buildTooltipHTML(key);
    if (!html) return;
    tooltipEl.innerHTML = html;
    tooltipEl.classList.add('visible');
    tooltipEl.setAttribute('aria-hidden', 'false');
    if (activeTermEl) activeTermEl.classList.remove('term-open');
    activeTermEl = el;
    el.classList.add('term-open');
    positionTooltip(el);
  }

  function hideTooltip() {
    tooltipEl.classList.remove('visible');
    tooltipEl.setAttribute('aria-hidden', 'true');
    if (activeTermEl) activeTermEl.classList.remove('term-open');
    activeTermEl = null;
  }

  document.querySelectorAll('.term[data-term]').forEach(el => {
    el.addEventListener('mouseenter', () => showTooltip(el));
    el.addEventListener('mouseleave', () => { if (!el.matches(':focus')) hideTooltip(); });
    el.addEventListener('focus', () => showTooltip(el));
    el.addEventListener('blur', hideTooltip);
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeTermEl === el) { hideTooltip(); } else { showTooltip(el); }
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideTooltip();
    });
  });

  document.addEventListener('click', () => hideTooltip());
  window.addEventListener('scroll', () => { if (activeTermEl) positionTooltip(activeTermEl); }, true);
  window.addEventListener('resize', () => { if (activeTermEl) positionTooltip(activeTermEl); });

  /* -----------------------------------------------------------------
     2. FORMULA ↔ STATEMENT HIGHLIGHTING
     ----------------------------------------------------------------- */
  document.querySelectorAll('.fterm[data-jump]').forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('click', () => jumpToStatementItem(el.dataset.jump));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jumpToStatementItem(el.dataset.jump); }
    });
  });

  function jumpToStatementItem(key) {
    const targets = document.querySelectorAll('.term[data-term="' + key + '"]');
    if (!targets.length) return;
    const firstRow = targets[0].closest('tr');
    if (firstRow) {
      firstRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    targets.forEach(t => {
      const row = t.closest('tr');
      if (!row) return;
      row.classList.add('flash-highlight');
      setTimeout(() => row.classList.remove('flash-highlight'), 1600);
    });
  }

  /* -----------------------------------------------------------------
     3. COLLAPSIBLE LEARNING SECTIONS + localStorage state
     ----------------------------------------------------------------- */
  const learningSections = Array.from(document.querySelectorAll('.learning-section[data-section]'));
  const STORAGE_PREFIX = 'ccra-section-';
  const PROGRESS_KEY = 'ccra-progress';

  function loadProgress() {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveProgress(p) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (e) { }
  }

  let progress = loadProgress();

  const progressGroups = {
    statements: ['financial-statements'],
    ratios: ['financial-ratios'],
    assessment: ['credit-assessment'],
    practice: ['practice']
  };

  function updateProgressUI() {
    const items = document.querySelectorAll('.progress-item');
    if (items.length < 4) return;

    function groupState(keys) {
      const viewedCount = keys.filter(k => progress[k]).length;
      if (viewedCount === 0) return 'none';
      if (viewedCount === keys.length) return 'full';
      return 'partial';
    }

    function applyState(item, state) {
      item.classList.remove('active', 'in-progress', 'reviewed');
      if (state === 'full') item.classList.add('reviewed');
      else if (state === 'partial') item.classList.add('in-progress');
    }

    applyState(items[0], groupState(progressGroups.statements));
    applyState(items[1], groupState(progressGroups.ratios));
    applyState(items[2], groupState(progressGroups.assessment));
    applyState(items[3], groupState(progressGroups.practice));
  }

  learningSections.forEach(section => {
    const key = section.dataset.section;
    const summary = section.querySelector('.learning-summary');

    // Restore saved open/closed state (statements defaults to open, others closed).
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (saved === 'open') section.setAttribute('open', '');
    else if (saved === 'closed') section.removeAttribute('open');

    if (summary) summary.setAttribute('aria-expanded', section.hasAttribute('open') ? 'true' : 'false');

    section.addEventListener('toggle', () => {
      const isOpen = section.hasAttribute('open');
      if (summary) summary.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      localStorage.setItem(STORAGE_PREFIX + key, isOpen ? 'open' : 'closed');
      if (isOpen) {
        progress[key] = true;
        saveProgress(progress);
        updateProgressUI();
      }
    });
  });

  updateProgressUI();

  const expandAllBtn = document.getElementById('expand-all-btn');
  const collapseAllBtn = document.getElementById('collapse-all-btn');

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      learningSections.forEach(s => { if (!s.hasAttribute('open')) s.setAttribute('open', ''); });
    });
  }
  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      learningSections.forEach(s => s.removeAttribute('open'));
    });
  }

  /* -----------------------------------------------------------------
     4. RATIO CATEGORY CHIPS
     ----------------------------------------------------------------- */
  document.querySelectorAll('.chip[data-jump-section]').forEach(chip => {
    chip.addEventListener('click', () => {
      const target = document.querySelector('.learning-section[data-section="' + chip.dataset.jumpSection + '"]');
      if (!target) return;
      target.setAttribute('open', '');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* -----------------------------------------------------------------
     5. EXPECTED LOSS CALCULATOR
     ----------------------------------------------------------------- */
  const elCalcBtn = document.getElementById('el-calc-btn');
  const elClearBtn = document.getElementById('el-clear-btn');
  const elResult = document.getElementById('el-result');

  if (elCalcBtn) {
    elCalcBtn.addEventListener('click', () => {
      const pd = parseFloat(document.getElementById('el-pd').value);
      const lgd = parseFloat(document.getElementById('el-lgd').value);
      const ead = parseFloat(document.getElementById('el-ead').value);

      if (isNaN(pd) || isNaN(lgd) || isNaN(ead)) {
        elResult.classList.add('visible');
        document.getElementById('el-result-value').textContent = 'Enter PD, LGD, and EAD to calculate.';
        document.getElementById('el-result-pct').textContent = '';
        return;
      }

      const expectedLoss = (pd / 100) * (lgd / 100) * ead;
      const pctOfExposure = ead !== 0 ? (expectedLoss / ead) * 100 : null;

      document.getElementById('el-result-value').textContent =
        'Expected Loss = $' + expectedLoss.toLocaleString(undefined, { maximumFractionDigits: 2 });
      document.getElementById('el-result-pct').textContent =
        pctOfExposure !== null
          ? 'Expected Loss as % of Exposure = ' + pctOfExposure.toFixed(2) + '%'
          : 'Not meaningful — exposure is zero.';
      elResult.classList.add('visible');
    });
  }

  if (elClearBtn) {
    elClearBtn.addEventListener('click', () => {
      ['el-pd', 'el-lgd', 'el-ead'].forEach(id => { document.getElementById(id).value = ''; });
      elResult.classList.remove('visible');
    });
  }

  /* -----------------------------------------------------------------
     6. FINANCIAL RATIO CALCULATOR
     ----------------------------------------------------------------- */
  function num(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const v = el.value.trim();
    if (v === '') return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function safeDiv(numerator, denominator) {
    if (numerator === null || denominator === null) return undefined; // missing data
    if (denominator === 0) return null; // not meaningful
    return numerator / denominator;
  }

  function fmt(v, suffix) {
    if (v === null) return 'Not meaningful — denominator is zero.';
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 }) + (suffix || '');
  }

  function buildRatios() {
    const v = {
      revenue: num('in-revenue'), cogs: num('in-cogs'), ebit: num('in-ebit'),
      ebitda: num('in-ebitda'), netIncome: num('in-netincome'), interest: num('in-interest'),
      currentAssets: num('in-currentassets'), cash: num('in-cash'), stInv: num('in-shortterminv'),
      ar: num('in-ar'), inventory: num('in-inventory'), currentLiab: num('in-currentliab'),
      totalAssets: num('in-totalassets'), totalDebt: num('in-totaldebt'), totalLiab: num('in-totalliab'),
      equity: num('in-equity'), avgInv: num('in-avginv'), avgAr: num('in-avgar'), avgAp: num('in-avgap'),
      avgAssets: num('in-avgassets'), avgEquity: num('in-avgequity'),
      interest2: num('in-interest2') !== null ? num('in-interest2') : num('in-interest'),
      principal: num('in-principal'), cashAvail: num('in-cashavail')
    };

    const groups = {
      Liquidity: [
        {
          name: 'Current Ratio', value: safeDiv(v.currentAssets, v.currentLiab), suffix: 'x',
          meaning: 'Current assets available relative to current obligations.', note: 'Requires historical and industry comparison.'
        },
        {
          name: 'Quick Ratio', value: (v.cash === null || v.stInv === null || v.ar === null || v.currentLiab === null) ? undefined : safeDiv(v.cash + v.stInv + v.ar, v.currentLiab), suffix: 'x',
          meaning: 'Immediate liquidity excluding inventory and prepaid items.', note: 'Investigate trend versus current ratio.'
        },
        {
          name: 'Working Capital', value: (v.currentAssets === null || v.currentLiab === null) ? undefined : v.currentAssets - v.currentLiab, suffix: '',
          meaning: 'Dollar cushion of current assets over current liabilities.', note: 'Liquidity cushion increased/decreased if comparative data exist.', dollar: true
        }
      ],
      Leverage: [
        {
          name: 'Debt-to-Equity', value: safeDiv(v.totalDebt, v.equity), suffix: 'x',
          meaning: 'Interest-bearing debt relative to shareholders’ equity.', note: 'Leverage should be assessed with repayment capacity.'
        },
        {
          name: 'Debt-to-Assets', value: safeDiv(v.totalDebt, v.totalAssets), suffix: 'x',
          meaning: 'Share of total assets financed with interest-bearing debt.', note: 'Requires industry comparison.'
        },
        {
          name: 'Total Liabilities-to-Equity', value: safeDiv(v.totalLiab, v.equity), suffix: 'x',
          meaning: 'All obligations relative to the equity cushion.', note: 'Requires historical comparison.'
        }
      ],
      Profitability: [
        {
          name: 'Gross Profit Margin', value: (v.revenue === null || v.cogs === null) ? undefined : safeDiv(v.revenue - v.cogs, v.revenue) * 100, suffix: '%',
          meaning: 'Earnings remaining after direct production costs.', note: 'Investigate trend.'
        },
        {
          name: 'Operating Profit Margin', value: (function () { const r = safeDiv(v.ebit, v.revenue); return r === undefined || r === null ? r : r * 100; })(), suffix: '%',
          meaning: 'Profitability from core operations.', note: 'Requires industry comparison.'
        },
        {
          name: 'Net Profit Margin', value: (function () { const r = safeDiv(v.netIncome, v.revenue); return r === undefined || r === null ? r : r * 100; })(), suffix: '%',
          meaning: 'Bottom-line profitability as a share of revenue.', note: 'Net income is not the same as cash flow.'
        }
      ],
      Returns: [
        {
          name: 'Return on Assets (ROA)', value: (function () { const r = safeDiv(v.netIncome, v.avgAssets); return r === undefined || r === null ? r : r * 100; })(), suffix: '%',
          meaning: 'Profit generated relative to average total assets.', note: 'Review asset quality alongside this result.'
        },
        {
          name: 'Return on Equity (ROE)', value: (function () { const r = safeDiv(v.netIncome, v.avgEquity); return r === undefined || r === null ? r : r * 100; })(), suffix: '%',
          meaning: 'Profit generated relative to average shareholders’ equity.', note: 'A high ROE can also reflect a small equity base or high leverage.'
        },
        {
          name: 'Return on Capital Employed (ROCE)', value: (function () {
            if (v.totalAssets === null || v.currentLiab === null) return undefined;
            const capEmployed = v.totalAssets - v.currentLiab;
            const r = safeDiv(v.ebit, capEmployed);
            return r === undefined || r === null ? r : r * 100;
          })(), suffix: '%',
          meaning: 'Operating profit generated per dollar of long-term capital employed.', note: 'Compare with historical ROCE and industry peers.'
        }
      ],
      Coverage: [
        {
          name: 'Interest Coverage', value: safeDiv(v.ebit, v.interest), suffix: 'x',
          meaning: 'Number of times EBIT covers interest expense.', note: 'Investigate trend in coverage.'
        },
        {
          name: 'EBITDA Interest Coverage', value: safeDiv(v.ebitda, v.interest), suffix: 'x',
          meaning: 'Pre-interest, pre-tax operating performance relative to interest expense.', note: 'EBITDA is not the same as cash flow.'
        },
        {
          name: 'Debt Service Coverage Ratio (DSCR)', value: (v.principal === null || v.interest2 === null) ? undefined : safeDiv(v.cashAvail, v.interest2 + v.principal), suffix: 'x',
          meaning: 'Cash available for debt service relative to scheduled interest and principal.', note: 'No fixed DSCR level is universally acceptable — check the applicable credit agreement definition.'
        }
      ],
      Efficiency: [
        {
          name: 'Inventory Turnover', value: safeDiv(v.cogs, v.avgInv), suffix: 'x',
          meaning: 'How many times inventory is sold and replaced in the period.', note: 'Review for slow-moving or obsolete inventory.'
        },
        {
          name: 'Days Inventory Outstanding (DIO)', value: (function () { const r = safeDiv(v.avgInv, v.cogs); return r === undefined || r === null ? r : r * 365; })(), suffix: ' days',
          meaning: 'Approximate days inventory remains before sale or use.', note: 'Investigate trend.'
        },
        {
          name: 'Accounts Receivable Turnover', value: safeDiv(v.revenue, v.avgAr), suffix: 'x',
          meaning: 'How many times receivables are collected in the period (uses revenue as a proxy for net credit sales).', note: 'Review asset quality of receivables.'
        },
        {
          name: 'Days Sales Outstanding (DSO)', value: (function () { const r = safeDiv(v.avgAr, v.revenue); return r === undefined || r === null ? r : r * 365; })(), suffix: ' days',
          meaning: 'Approximate days to collect receivables (uses revenue as a proxy for net credit sales).', note: 'Investigate trend and payment terms before concluding.'
        },
        {
          name: 'Accounts Payable Turnover', value: safeDiv(v.cogs, v.avgAp), suffix: 'x',
          meaning: 'Approximated using COGS in place of purchases.', note: 'Not identical to a purchases-based calculation.'
        },
        {
          name: 'Asset Turnover', value: safeDiv(v.revenue, v.avgAssets), suffix: 'x',
          meaning: 'Revenue generated per dollar of average total assets.', note: 'Requires industry comparison.'
        },
        {
          name: 'Sales-to-Equity', value: safeDiv(v.revenue, v.avgEquity), suffix: 'x',
          meaning: 'Revenue generated per dollar of average shareholders’ equity.', note: 'Should be interpreted together with leverage ratios.'
        }
      ]
    };

    return groups;
  }

  function renderRatioResults() {
    const container = document.getElementById('ratio-results');
    if (!container) return;
    container.innerHTML = '';
    const groups = buildRatios();
    let anyResult = false;

    Object.keys(groups).forEach(groupName => {
      const rows = groups[groupName].filter(r => r.value !== undefined);
      if (!rows.length) return;
      anyResult = true;

      const groupEl = document.createElement('div');
      groupEl.className = 'result-group';
      const h4 = document.createElement('h4');
      h4.textContent = groupName;
      groupEl.appendChild(h4);

      const cardsEl = document.createElement('div');
      cardsEl.className = 'result-cards';

      rows.forEach(r => {
        const card = document.createElement('div');
        card.className = 'result-card';
        const valueText = r.value === null ? 'Not meaningful — denominator is zero.' : fmt(r.value, r.suffix);
        card.innerHTML =
          '<div class="rc-name">' + r.name + '</div>' +
          '<div class="rc-value">' + (r.dollar && r.value !== null ? '$' + r.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : valueText) + '</div>' +
          '<div class="rc-meaning">' + r.meaning + '</div>' +
          '<div class="rc-note">' + r.note + '</div>';
        cardsEl.appendChild(card);
      });

      groupEl.appendChild(cardsEl);
      container.appendChild(groupEl);
    });

    if (!anyResult) {
      const empty = document.createElement('p');
      empty.className = 'empty-note';
      empty.textContent = 'Enter at least the inputs needed for one ratio, then select Calculate Ratios.';
      container.appendChild(empty);
    }
  }

  const ratioCalcBtn = document.getElementById('ratio-calc-btn');
  const ratioClearBtn = document.getElementById('ratio-clear-btn');

  if (ratioCalcBtn) {
    ratioCalcBtn.addEventListener('click', renderRatioResults);
  }
  if (ratioClearBtn) {
    ratioClearBtn.addEventListener('click', () => {
      document.querySelectorAll('.ratio-input-groups input').forEach(inp => inp.value = '');
      const container = document.getElementById('ratio-results');
      if (container) container.innerHTML = '';
    });
  }

  /* =========================================================
   RWA & REGULATORY CAPITAL CALCULATOR
   ========================================================= */

  const rwaExposureInput = document.getElementById("rwa-exposure");
  const rwaWeightInput = document.getElementById("rwa-weight");
  const rwaCapitalInput = document.getElementById("rwa-capital");

  const rwaCalcBtn = document.getElementById("rwa-calc-btn");
  const rwaClearBtn = document.getElementById("rwa-clear-btn");

  const rwaResultValue = document.getElementById("rwa-result-value");
  const capitalRatioResult = document.getElementById("capital-ratio-result");
  const rwaResultNote = document.getElementById("rwa-result-note");


  function formatCurrency(value) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0
    }).format(value);
  }


  function calculateRWA() {

    const exposure = parseFloat(rwaExposureInput.value);
    const riskWeight = parseFloat(rwaWeightInput.value);
    const regulatoryCapital = parseFloat(rwaCapitalInput.value);


    /* ---------- Validation ---------- */

    if (
      Number.isNaN(exposure) ||
      Number.isNaN(riskWeight) ||
      Number.isNaN(regulatoryCapital)
    ) {

      rwaResultValue.textContent = "—";
      capitalRatioResult.textContent = "—";

      rwaResultNote.textContent =
        "Please enter Exposure, Risk Weight, and Regulatory Capital.";

      return;
    }


    if (
      exposure < 0 ||
      riskWeight < 0 ||
      regulatoryCapital < 0
    ) {

      rwaResultValue.textContent = "—";
      capitalRatioResult.textContent = "—";

      rwaResultNote.textContent =
        "Values cannot be negative.";

      return;
    }


    /* ---------- Calculations ---------- */

    const riskWeightDecimal = riskWeight / 100;

    const rwa = exposure * riskWeightDecimal;


    if (rwa === 0) {

      rwaResultValue.textContent = formatCurrency(rwa);
      capitalRatioResult.textContent = "N/A";

      rwaResultNote.textContent =
        "Capital ratio cannot be calculated when RWA is zero.";

      return;
    }


    const capitalRatio =
      (regulatoryCapital / rwa) * 100;


    /* ---------- Display ---------- */

    rwaResultValue.textContent =
      formatCurrency(rwa);

    capitalRatioResult.textContent =
      capitalRatio.toFixed(2) + "%";


    rwaResultNote.innerHTML =
      `
      Simplified calculation:<br>
      RWA = ${formatCurrency(exposure)}
      × ${riskWeight.toFixed(2)}%
      = <strong>${formatCurrency(rwa)}</strong><br>

      Capital Ratio =
      ${formatCurrency(regulatoryCapital)}
      ÷ ${formatCurrency(rwa)}
      = <strong>${capitalRatio.toFixed(2)}%</strong>
    `;

  }


  /* ---------- Calculate button ---------- */

  if (rwaCalcBtn) {

    rwaCalcBtn.addEventListener(
      "click",
      calculateRWA
    );

  }


  /* ---------- Clear button ---------- */

  if (rwaClearBtn) {

    rwaClearBtn.addEventListener(
      "click",
      function () {

        rwaExposureInput.value = "";
        rwaWeightInput.value = "";
        rwaCapitalInput.value = "";

        rwaResultValue.textContent = "—";
        capitalRatioResult.textContent = "—";

        rwaResultNote.textContent =
          "Enter the three values above and select Calculate.";

        rwaExposureInput.focus();

      }
    );

  }

  /* -----------------------------------------------------------------
     COMMERCIAL CREDIT ASSESSMENT FLOW NAVIGATION
     ----------------------------------------------------------------- */

  document.querySelectorAll('.assessment-flow-item[data-assessment-jump]')
    .forEach(item => {

      function goToAssessmentStep() {
        const targetId = item.dataset.assessmentJump;
        const target = document.getElementById(targetId);

        if (!target) return;

        /* Open the selected collapsible section */
        target.setAttribute('open', '');

        const summary = target.querySelector('.learning-summary');
        if (summary) {
          summary.setAttribute('aria-expanded', 'true');
        }

        /* Smooth scroll */
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 80);

        /* Brief visual highlight */
        target.classList.add('assessment-target-highlight');

        setTimeout(() => {
          target.classList.remove('assessment-target-highlight');
        }, 1800);
      }

      item.addEventListener('click', goToAssessmentStep);

      /* Keyboard accessibility */
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToAssessmentStep();
        }
      });

    });

})();

/* -----------------------------------------------------------------
   MAJOR SECTION NAVIGATION
   ----------------------------------------------------------------- */
(function () {
  const links = Array.from(document.querySelectorAll('.section-nav a[data-nav-section]'));
  if (!links.length) return;

  const sections = links
    .map(link => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  function setActive(sectionId) {
    links.forEach(link => {
      const isActive = link.getAttribute('href') === `#${sectionId}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  links.forEach(link => {
    link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      target.setAttribute('open', '');
      const summary = target.querySelector(':scope > .learning-summary');
      if (summary) summary.setAttribute('aria-expanded', 'true');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(target.id);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) setActive(visible.target.id);
    }, {
      rootMargin: '-18% 0px -68% 0px',
      threshold: [0, 0.1, 0.25]
    });

    sections.forEach(section => observer.observe(section));
  }

  setActive(sections[0]?.id || 'introduction-section');
})();


//////////////////////////////
// For collateral //////////////////
////////////////////////

  const collateralTerms = {
    appraisal: {
      title: "Property Appraisal",
      definition:
        "An independent estimate of a property's value used to assess collateral coverage and calculate the loan-to-value ratio."
    },

    "phase-one": {
      title: "Phase I Environmental Assessment",
      definition:
        "A review of the property's history, records and physical condition to identify possible environmental contamination. It normally does not include physical testing."
    },

    "phase-two": {
      title: "Phase II Environmental Assessment",
      definition:
        "A detailed investigation involving tests of soil, groundwater or building materials when a potential environmental concern has been identified."
    },

    "sub-search": {
      title: "Sub-search",
      definition:
        "An updated legal search conducted around the funding date to identify new liens, registrations or competing claims against the borrower or collateral."
    },

    slo: {
      title: "Solicitor's Letter of Opinion (SLO)",
      definition:
        "A legal opinion addressing matters such as the validity of the loan documents and the registration and enforceability of the lender's security. Its precise scope may differ by lender."
    },

    "regulatory-due-diligence": {
      title: "Regulatory Due Diligence",
      definition:
        "Verification that the borrower, property and proposed activities comply with relevant zoning, permits, licences, environmental rules and other legal requirements."
    }
  };

  const termDialog = document.getElementById("term-dialog");
  const termDialogTitle = document.getElementById("term-dialog-title");
  const termDialogDefinition = document.getElementById(
    "term-dialog-definition"
  );

  document.querySelectorAll(".term-button").forEach((button) => {
    button.addEventListener("click", () => {
      const term = collateralTerms[button.dataset.term];

      termDialogTitle.textContent = term.title;
      termDialogDefinition.textContent = term.definition;
      termDialog.showModal();
    });
  });

  document
    .querySelector(".term-dialog-close")
    .addEventListener("click", () => termDialog.close());

  termDialog.addEventListener("click", (event) => {
    if (event.target === termDialog) {
      termDialog.close();
    }
  });


  