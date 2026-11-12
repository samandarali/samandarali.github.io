/* ─────────────────────────────────────────────────────────────
   My Journey — a runway of career "cards" standing in a line.
   The most recent role stands in front; every drag, scroll or
   arrow key brings the next (older) one forward out of the haze.
   The rail on the right shows that role's details, and the
   timeline ribbon underneath shows which roles overlapped.

   To edit the content, change the JOURNEY list below.
   start / end are [year, month]; end: null means "Present".
   approx: true means the exact months are unknown; the years still show,
   with the 'during' label underneath (used for the typist job).
   ───────────────────────────────────────────────────────────── */
(function () {
  const JOURNEY = [
    {
      id: 'pratech', type: 'work', glyph: 'spark', now: true,
      role: 'Independent Researcher and Data Science Consultant', short: 'PraTech',
      org: 'PraTech Digital (self-employed)', url: 'https://pratechdigital.com/',
      place: 'Remote, Canada', start: [2025, 10], end: null,
      points: [
        'Scope and deliver data projects for clients, from defining the question to presenting the results.',
        'Built an object-oriented Python application that automates KPI monitoring and data-quality checks and sends email alerts, cutting manual review time by about 50%.',
        'Created Excel dashboards and reports on school environmental-monitoring data for school decision-makers.',
        'Design websites, lightweight data tools and digital content that help small businesses streamline simple workflows.'
      ],
      tags: ['Python', 'SQL', 'Excel', 'Power BI', 'Automation', 'Websites']
    },
    {
      id: 'iehps', type: 'teach', glyph: 'pipeline',
      role: 'Data Analytics Lead Facilitator', short: 'IEHPs-CAN',
      org: 'IEHPs-CAN, Internationally Educated Health Professionals', place: 'Canada',
      start: [2026, 3], end: [2026, 4],
      points: [
        'Delivered a 9-week healthcare analytics program for internationally educated health professionals using SQL, Excel and Power BI.',
        'Taught participants to extract, validate, analyze and report on CIHI, Statistics Canada and PHAC data.',
        'Built an automated Python + Selenium pipeline that collects and validates Statistics Canada health tables by geography, age and demographic group.'
      ],
      tags: ['SQL', 'Power BI', 'Python ETL', 'Healthcare data'],
      links: [['GitHub pipeline', 'https://github.com/samandarali/statcan-health-data-pipeline']]
    },
    {
      id: 'spirit', type: 'teach', glyph: 'board',
      role: 'Mathematics Teacher', short: 'Spirit of Math',
      org: 'Spirit of Math Schools', place: 'Markham, ON', start: [2025, 8], end: [2026, 7],
      points: [
        'Taught accelerated mathematics to Grades 1–2 and explained student progress clearly to parents.',
        'Designed an Excel system that tracks results by student, skill and question, with a question-difficulty index that flags learning gaps.'
      ],
      tags: ['Teaching', 'Excel analytics']
    },
    {
      id: 'dollarama', type: 'work', glyph: 'store',
      role: 'Assistant Team Leader', short: 'Dollarama',
      org: 'Dollarama', place: 'Ontario, Canada', start: [2023, 10], end: [2025, 6],
      points: [
        'Supported daily operations and customer service in a high-volume retail store, resolving customer concerns and coordinating priorities with the team.',
        'Helped with staff supervision, task allocation, inventory control and cash handling while keeping accuracy and compliance.'
      ],
      tags: ['Team leadership', 'Operations', 'Customer service']
    },
    {
      id: 'trent', type: 'study', glyph: 'cap',
      role: 'M.Sc., Big Data Analytics', short: 'Trent M.Sc.',
      org: 'Trent University', place: 'Peterborough, ON', start: [2023, 1], end: [2024, 5],
      points: [
        'Applied Modelling and Quantitative Methods — GPA 91.33.',
        'Project: the labour market for economics graduates in Canada. Analyzed 996 job postings with web scraping, NLP and statistics; published in Canadian Public Policy (2025).'
      ],
      tags: ['Machine learning', 'NLP', 'Python', 'R'],
      links: [['Read the article', 'https://doi.org/10.3138/cpp.2024-023']]
    },
    {
      id: 'wageningen', type: 'work', glyph: 'globe', approx: true, during: 'Research affiliate',
      role: 'Research Affiliate', short: 'Wageningen',
      org: 'Wageningen University, Business Management & Organisation group', place: 'Wageningen, Netherlands (remote)',
      start: [2022, 1], end: [2022, 12],
      points: [
        'Collaborated on research on IoT use in the agri-food industry and on a paper about grassroots innovation.',
        'Prepared a joint proposal on the role of context in innovation ecosystems.',
        'Ran a workshop on scientometrics and bibliometrics in social science (June 2022).'
      ],
      tags: ['Scientometrics', 'Innovation ecosystems']
    },
    {
      id: 'head', type: 'lead', glyph: 'compass',
      role: 'Department Head, Policy Evaluation and STI Monitoring', short: 'Head of Dept.',
      org: 'National Research Institute for Science Policy (NRISP)', place: 'Tehran, Iran',
      start: [2020, 11], end: [2021, 11],
      points: [
        'Appointed by senior leadership to redesign the department’s structure as part of an organization-wide transformation.',
        'Redefined the department’s mission and strategy, and aligned several research groups behind new objectives.',
        'Contributed to strategic decisions as a member of the institute’s Central Council.'
      ],
      tags: ['Leadership', 'Strategy', 'Change management']
    },
    {
      id: 'nrisp', type: 'work', glyph: 'research',
      role: 'Research Faculty Member', short: 'NRISP',
      org: 'National Research Institute for Science Policy (NRISP)', place: 'Tehran, Iran',
      start: [2018, 11], end: [2022, 12],
      points: [
        'Principal investigator on a Ministry of Science project on entrepreneurial universities; the findings informed two national policy documents.',
        'Wrote proposals and secured funding for four research projects, then led them from scoping to final report.',
        'Built a 17-country dataset (World Bank, UNESCO, WIPO, ILOSTAT) and used efficiency analysis and regression to assess national innovation systems.',
        'Analyzed 100,000+ retail transactions for an industry partner, pointing to a projected 10–15% cut in spoilage.',
        'Facilitated 5+ national workshops and focus groups with university leaders, ministries and industry.'
      ],
      tags: ['Econometrics', 'R', 'Python', 'SQL', 'Policy research']
    },
    {
      id: 'lecturer', type: 'teach', glyph: 'board',
      role: 'University Lecturer', short: 'Lecturer',
      org: 'Allameh Tabataba’i, Amirkabir & Alzahra Universities', place: 'Tehran, Iran',
      start: [2017, 12], end: [2022, 11],
      points: [
        'Taught 11 Master’s and PhD courses in the economics of innovation and supervised 6 graduate research projects.',
        'Courses included Economics of Innovation (MBA), foundations of economic thought on technology development (PhD) and Consumer & Innovation (international winter school).'
      ],
      tags: ['Teaching', 'Economics of innovation']
    },
    {
      id: 'elites', type: 'work', glyph: 'research',
      role: 'Senior Researcher and Policy Analyst', short: 'Elites Foundation',
      org: 'Iran’s National Elites Foundation', place: 'Tehran, Iran',
      start: [2016, 12], end: [2017, 12],
      points: [
        'Analyzed large socioeconomic datasets on how income is shared between labour and capital, and wrote reports for national labour and social policy.',
        'Designed and analyzed an online innovation survey of SMEs, recruiting respondents at a national SME exhibition.'
      ],
      tags: ['Survey design', 'Labour economics']
    },
    {
      id: 'jofreh', type: 'work', glyph: 'chart',
      role: 'Market Analyst', short: 'Jofreh',
      org: 'Jofreh United Industries', place: 'Tehran, Iran', start: [2015, 9], end: [2016, 11],
      points: [
        'Completed 7 market studies with forecasting models in R and Excel.',
        'Evaluated pricing and competition with regression analysis.',
        'Built 10+ management dashboards, making the reporting cycle 15% more efficient.'
      ],
      tags: ['Forecasting', 'R', 'Excel dashboards']
    },
    {
      id: 'phd', type: 'study', glyph: 'cap',
      role: 'Ph.D., Economics', short: 'Ph.D.',
      org: 'Sant’Anna School of Advanced Studies', place: 'Pisa, Italy', start: [2011, 10], end: [2015, 5],
      points: [
        'Full scholarship, plus an Erasmus scholarship (2014). Thesis: Essays in Economics of Innovation.',
        'Time Series Analysis at CIDE, University of Torino (2012); Best Paper Award, International Conference on Management of Technology (2015).',
        'Alongside the PhD, taught Principles of Economics to bachelor students in Tehran (2012–2013).'
      ],
      tags: ['Econometrics', 'Innovation economics', 'Stata']
    },
    {
      id: 'tehranfanavari', type: 'work', glyph: 'briefcase',
      role: 'Commercial Manager', short: 'Tehran Fanavari',
      org: 'Tehran Fanavari Trading Co.', place: 'Tehran, Iran', start: [2011, 4], end: [2011, 7],
      points: [
        'Managed the company’s commercial activities between finishing my M.Sc. in Sweden and starting my PhD in Italy.'
      ],
      tags: ['Commercial management']
    },
    {
      id: 'gothenburg', type: 'study', glyph: 'cap',
      role: 'M.Sc., Industrial Economics', short: 'Gothenburg M.Sc.',
      org: 'University of Gothenburg', place: 'Gothenburg, Sweden', start: [2008, 10], end: [2011, 5],
      points: [
        'Thesis: Corporate Governance and Default Risk — a bridge from my credit-risk work into research.',
        'Max Planck Institute of Economics, IMPRS Uncertainty School (Jena, Germany, 2011).'
      ],
      tags: ['Industrial economics', 'Default risk']
    },
    {
      id: 'leasing', type: 'work', glyph: 'bank',
      role: 'Credit Risk Analyst', short: 'Leasing Iran',
      org: 'Leasing Iran Public Company', place: 'Tehran, Iran', start: [2006, 5], end: [2008, 5],
      points: [
        'Assessed about 200 corporate and individual leasing applications by analyzing financial statements, cash flow, ratios, repayment capacity, credit history and collateral.',
        'Weighed market and industry risk, collateral coverage and technical feasibility to recommend approval, approval with conditions, or decline.',
        'Built a standardized credit-reporting template that the team adopted, and presented completed analyses to the credit committee.'
      ],
      tags: ['Commercial credit', 'Financial statements', 'Collateral']
    },
    {
      id: 'alzahra', type: 'study', glyph: 'cap',
      role: 'M.Sc., Economics', short: 'Alzahra M.Sc.',
      org: 'Alzahra University', place: 'Tehran, Iran', start: [2003, 9], end: [2006, 12],
      points: [
        'Thesis: Moral Hazard as a Structural Flaw in Cooperatives (supervisor: Hossein Raghfar).'
      ],
      tags: ['Economics', 'Cooperatives']
    },
    {
      id: 'research-assistant', type: 'work', glyph: 'research', approx: true, during: 'During my M.Sc.',
      role: 'Research Assistant & Excel Instructor', short: 'Research Asst. & Excel',
      org: 'Alzahra University', place: 'Tehran, Iran', start: [2003, 9], end: [2006, 12],
      points: [
        'Worked as a research assistant while studying for my M.Sc. in Economics.',
        'Taught Excel classes.'
      ],
      tags: ['Research', 'Excel', 'Teaching']
    },
    {
      id: 'council-secretary', type: 'lead', glyph: 'people',
      role: 'Secretary, Economy Scientific Council', short: 'Council Secretary',
      org: 'Alzahra University', place: 'Tehran, Iran', start: [2003, 9], end: [2005, 6],
      points: [
        'Served as secretary of the economics scientific council while studying for my M.Sc.'
      ],
      tags: ['Leadership', 'Organizing']
    },
    {
      id: 'council-member', type: 'lead', glyph: 'people',
      role: 'Member, Economy Scientific Council', short: 'Council Member',
      org: 'Allameh Tabataba’i University', place: 'Tehran, Iran', start: [2002, 9], end: [2003, 6],
      points: [
        'Member of the economics scientific council in the final year of my B.A.'
      ],
      tags: ['Student leadership']
    },
    {
      id: 'ba', type: 'study', glyph: 'cap',
      role: 'B.A., Business Economics', short: 'B.A.',
      org: 'Allameh Tabataba’i University', place: 'Tehran, Iran', start: [1999, 9], end: [2003, 7],
      points: [
        'Where it started: economics, business and my first quantitative courses.',
        'Graduated in July 2003, majoring in Business Economics.'
      ],
      tags: ['Economics', 'Business']
    },
    {
      id: 'typist', type: 'work', glyph: 'keys', approx: true, during: 'During my B.A.',
      role: 'Typist & Excel Data Analyst', short: 'Typist & Excel',
      org: 'Part-time job while studying', place: 'Tehran, Iran', start: [1999, 9], end: [2003, 7],
      points: [
        'My very first job, alongside my B.A.: typing documents quickly and accurately.',
        'Entered, organized and analyzed data in Excel — my first hands-on data analysis work.'
      ],
      tags: ['First job', 'Excel', 'Data entry', 'Data analysis']
    }
  ];

  const TYPE = { work: 'Work', lead: 'Leadership', teach: 'Teaching', study: 'Study' };
  const GLYPH = {
    spark: '<path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/><circle cx="19" cy="6" r="1.4"/><path d="M5 20v-2M9 20v-4M13 20v-3M17 20v-6"/>',
    pipeline: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 8l5 8M18 8l-5 8"/>',
    board: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20l4-4 4 4M7 9h6M7 12h9"/>',
    store: '<path d="M4 9h16l-1.5-4h-13z"/><path d="M5 9v11h14V9M10 20v-5h4v5"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2.2 9 2.2 12 0v-5M22 9v6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    research: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20M7.5 12V10M10 12V8M12.5 12v-3"/>',
    chart: '<path d="M3 20h18M5 20V12M10 20V8M15 20v-5M20 20V5"/>',
    bank: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',
    people: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 1.8 6 5"/>',
    keys: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'
  };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date(), NOW = [today.getFullYear(), today.getMonth() + 1];
  // today as a decimal year, including how far through the month we are
  const TODAY = NOW[0] + (NOW[1] - 1 + (today.getDate() - 1) / new Date(NOW[0], NOW[1], 0).getDate()) / 12;

  const $ = id => document.getElementById(id);
  const stage = $('jr-stage'), line = $('jr-line'), rail = $('jr-rail'), roll = $('jr-roll'),
    ring = $('jr-ring'), ribbon = $('jr-ribbon'), ribScroll = $('jr-ribbon-scroll'), idxEl = $('jr-idx');
  if (!stage || !line || !rail) return;

  const N = JOURNEY.length;
  const pad = n => String(n).padStart(2, '0');
  if ($('jr-total')) $('jr-total').textContent = pad(N);
  const t = ([y, m]) => y + (m - 1) / 12;               // [year, month] -> decimal year
  const endOf = e => e.end || NOW;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function range(e, long) {
    if (e.approx) {
      const yrs = e.start[0] === e.end[0] ? `${e.start[0]}` : `${e.start[0]} — ${e.end[0]}`;
      return long ? `${e.during} (${yrs})` : yrs;
    }
    const f = ([y, m]) => long ? `${MONTHS[m - 1]} ${y}` : `${y}`;
    const a = f(e.start), b = e.end ? f(e.end) : (long ? 'Present' : 'Now');
    return a === b ? a : `${a} — ${b}`;
  }
  // small line under the big year on each card, e.g. "Oct 2025 → Now"
  function monthSpan(e) {
    const f = ([y, m]) => `${MONTHS[m - 1]} ${y}`;
    if (e.end && e.end[0] === e.start[0] && e.end[1] === e.start[1]) return f(e.start);
    return `${f(e.start)} → ${e.end ? f(e.end) : 'Now'}`;
  }
  function duration(e) {
    if (e.approx) return '';
    const [ey, em] = endOf(e), months = (ey * 12 + em) - (e.start[0] * 12 + e.start[1]) + 1;
    const y = Math.floor(months / 12), m = months % 12, out = [];
    if (y) out.push(y + (y > 1 ? ' yrs' : ' yr'));
    if (m) out.push(m + (m > 1 ? ' mos' : ' mo'));
    return out.join(' ');
  }
  // which other entries ran at the same time (more than a month of overlap)
  const overlaps = JOURNEY.map(a => JOURNEY
    .map((b, j) => ({ b, j }))
    .filter(({ b }) => b !== a && Math.min(t(endOf(a)), t(endOf(b))) + 1 / 12 - Math.max(t(a.start), t(b.start)) > 1 / 24));

  // ── the runway cards ──
  const svgIcon = g => `<svg viewBox="0 0 24 24" aria-hidden="true">${GLYPH[g] || GLYPH.chart}</svg>`;
  // card colours: work roles step through a blue range, education through a teal
  // range, so each card has its own shade but the two groups stay easy to tell apart
  const isEdu = e => e.type === 'study';
  const shade = (() => {
    const groups = { work: JOURNEY.filter(e => !isEdu(e)), edu: JOURNEY.filter(isEdu) };
    const RANGE = {                     // [hue, saturation, lightness] at the two ends of each range
      work: [[218, 62, 16], [203, 58, 31]],
      edu: [[182, 70, 13], [162, 52, 28]]
    };
    return e => {
      const g = isEdu(e) ? 'edu' : 'work', list = groups[g], k = list.length > 1 ? list.indexOf(e) / (list.length - 1) : 0;
      const [[h0, s0, l0], [h1, s1, l1]] = RANGE[g];
      const h = h0 + (h1 - h0) * k, sat = s0 + (s1 - s0) * k, l = l0 + (l1 - l0) * k;
      const c = dl => `hsl(${h.toFixed(0)} ${sat.toFixed(0)}% ${(l + dl).toFixed(1)}%)`;
      return `--c1:${c(-6)};--c2:${c(4)};--c3:${c(18)}`;
    };
  })();
  const people = JOURNEY.map((e, i) => {
    const el = document.createElement('div');
    el.className = 'jr-m';
    el.dataset.i = i;
    el.innerHTML = `
      <div class="jr-card t-${e.type}${e.now ? ' is-now' : ''}" style="${shade(e)}">
        <div class="jr-c-grid" aria-hidden="true"></div>
        <div class="jr-c-top wide"><span>${pad(i + 1)}</span><span>${e.now ? '<i class="jr-dot"></i>Current' : TYPE[e.type]}</span></div>
        <div class="jr-c-year wide">
          <b>${e.start[0]}</b>
          <span>${e.approx ? esc(e.during) : monthSpan(e)}</span>
        </div>
        <div class="jr-c-glyph">${svgIcon(e.glyph)}</div>
        <div class="jr-c-foot">
          <h3>${esc(e.role)}</h3>
          <p>${esc(e.org)}</p>
          <p class="jr-c-place">${esc(e.place)}</p>
        </div>
      </div>`;
    line.append(el);
    return { el, f: '', o: '', v: '' };
  });

  // ── the detail panels in the rail ──
  const panels = JOURNEY.map((e, i) => {
    const el = document.createElement('article');
    el.className = 'jr-panel' + (i % 2 ? ' alt' : '');
    el.setAttribute('aria-label', `${e.role}, ${e.org}`);
    const along = overlaps[i];
    const dur = duration(e);
    el.innerHTML = `
      <p class="jr-p-kicker wide">${pad(i + 1)} · ${e.now ? 'Current' : TYPE[e.type]}</p>
      <h3>${esc(e.role)}</h3>
      <p class="jr-p-org">${e.url ? `<a href="${e.url}" target="_blank" rel="noopener">${esc(e.org)} ↗</a>` : esc(e.org)}</p>
      <p class="jr-p-meta">${range(e, true)}${dur ? ' · ' + dur : ''} · ${esc(e.place)}</p>
      <ul>${e.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul>
      ${e.tags ? `<div class="jr-chips">${e.tags.map(x => `<span>${esc(x)}</span>`).join('')}</div>` : ''}
      ${along.length ? `<div class="jr-along"><span class="wide">At the same time</span>${along.map(({ b, j }) =>
        `<button type="button" data-go="${j}">${esc(b.short)}</button>`).join('')}</div>` : ''}
      ${e.links ? `<p class="jr-links">${e.links.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join('')}</p>` : ''}`;
    rail.append(el);
    return el;
  });

  // ── rolling date label (like a counter that rolls between values) ──
  JOURNEY.forEach(e => { const b = document.createElement('b'); b.textContent = range(e, false); roll.append(b); });

  // ── timeline ribbon: oldest on the left, newest on the right ──
  // Laid out in pixels (re-run on resize) so every bar keeps a readable
  // label: inside the bar when it fits, just after it when it doesn't.
  const T0 = Math.min(...JOURNEY.map(e => e.start[0])), T1 = NOW[0] + 1, span = T1 - T0;
  const fmt = ([y, m]) => `${MONTHS[m - 1]} ${y}`;
  let LANE_H = 24, LANE_GAP = 6;
  const TOP = 26, AXIS_H = 40;
  const bars = JOURNEY.map((e, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    const kind = e.type === 'study' ? ' edu' : ' job';
    el.className = 'jr-bar' + kind + (e.approx ? ' approx' : '');
    el.dataset.go = i;
    el.title = `${e.role} — ${e.org}\n${e.approx ? range(e, true) : fmt(e.start) + ' – ' + (e.end ? fmt(e.end) : 'Present')}`;
    el.setAttribute('aria-label', `${e.short}, ${range(e, true)}`);
    const label = document.createElement('span');
    label.className = 'jr-bar-label' + kind;
    label.textContent = e.short;
    // a current role runs up to today's date, not to the end of this month
    const b = e.end ? t(e.end) + 1 / 12 : TODAY;
    return { el, label, a: t(e.start), b, x0: 0, x1: 0, mid: 0, end: 0 };
  });
  const axis = document.createElement('div');
  axis.className = 'jr-axis';
  const flagA = document.createElement('span'), flagB = document.createElement('span');
  flagA.className = 'jr-flag a'; flagB.className = 'jr-flag b';
  const span0 = document.createElement('div');
  span0.className = 'jr-span';                       // amber band on the axis for the selected role
  const cursor = document.createElement('div');
  cursor.className = 'jr-cursor';
  const cursorLabel = document.createElement('b');
  cursor.append(cursorLabel);
  cursor.tabIndex = 0;
  cursor.setAttribute('role', 'slider');
  cursor.setAttribute('aria-label', 'Timeline position. Drag, or use the arrow keys, to move through the roles.');
  ribbon.append(axis, span0, flagA, flagB, ...bars.flatMap(r => [r.el, r.label]), cursor);

  const measure = document.createElement('canvas').getContext('2d');
  let ribW = 0, pxYear = 0;
  function layoutRibbon() {
    const avail = ribScroll.clientWidth;
    if (!avail) return;
    ribW = Math.max(avail - 1, innerWidth <= 820 ? 1500 : 980);
    // shorter windows get slimmer rows so cards + timeline still fit together
    const compact = innerHeight < 820 && innerWidth > 820;
    LANE_H = compact ? 19 : 24; LANE_GAP = compact ? 4 : 6;
    ribbon.style.setProperty('--lane-h', LANE_H + 'px');
    pxYear = ribW / span;
    ribbon.style.width = ribW + 'px';
    const fs = getComputedStyle(bars[0].el).fontSize || '11px';
    measure.font = `600 ${fs} Inter, system-ui, sans-serif`;
    const X = yr => (yr - T0) * pxYear;
    // pack bars into lanes, reserving room for labels that sit outside their bar
    const lanes = [];
    const order = bars.map((r, i) => i).sort((i, j) => bars[i].a - bars[j].a || bars[j].b - bars[i].b);
    order.forEach(i => {
      const r = bars[i];
      r.x0 = X(r.a); r.x1 = Math.max(X(r.b), r.x0 + 6);
      const lw = measure.measureText(JOURNEY[i].short).width + 16;
      r.inside = lw <= r.x1 - r.x0;
      // near the right edge, an outside label goes before the bar instead of after it
      r.before = !r.inside && r.x1 + lw + 2 > ribW;
      const start = r.before ? r.x0 - lw - 2 : r.x0;
      const end = r.inside || r.before ? r.x1 : r.x1 + lw + 2;
      let lane = lanes.findIndex(l => l <= start - 4);
      if (lane < 0) { lane = lanes.length; lanes.push(0); }
      lanes[lane] = end;
      r.lane = lane;
      r.mid = (r.x0 + r.x1) / 2;
      r.end = r.x1;                                   // the timeline line marks where each role ends
      const top = TOP + lane * (LANE_H + LANE_GAP);
      Object.assign(r.el.style, { left: r.x0 + 'px', width: (r.x1 - r.x0) + 'px', top: top + 'px' });
      Object.assign(r.label.style, { left: (r.inside ? r.x0 : r.before ? r.x0 - lw + 6 : r.x1 + 4) + 'px', top: top + 'px' });
      r.label.classList.toggle('outside', !r.inside);
    });
    const h = TOP + lanes.length * (LANE_H + LANE_GAP) + AXIS_H;
    ribbon.style.height = h + 'px';
    axis.style.top = (h - AXIS_H + 4) + 'px';
    // axis: a tick for every month, a longer one + label for every year
    const showMonths = pxYear / 12 >= 3, every = pxYear >= 44 ? 1 : 2;
    let html = '';
    for (let y = T0; y <= T1; y++) {
      html += `<i class="yr" style="left:${X(y)}px"></i>`;
      if (y < T1 && (y - T0) % every === 0) html += `<span style="left:${X(y + .5)}px">${y}</span>`;
      if (y < T1 && showMonths) for (let m = 1; m < 12; m++) html += `<i style="left:${X(y + m / 12)}px"></i>`;
    }
    axis.innerHTML = html;
    if (active >= 0) {
      setActive(active, true);
      if (ribScroll.scrollWidth > ribScroll.clientWidth + 2) ribScroll.scrollLeft = bars[active].mid - ribScroll.clientWidth / 2;
    }
    fit();
    dirty = true;
  }

  // size the cards area so it and the timeline fit in one window together
  const nav = document.querySelector('body > nav'), ribWrap = ribScroll.closest('.jr-ribbon-wrap');
  const navH = () => (nav && getComputedStyle(nav).position === 'sticky' ? nav.offsetHeight : 0);
  function fit() {
    const main = stage.parentElement;
    if (innerWidth <= 820) { main.style.height = ''; return; }
    const h = innerHeight - navH() - ribWrap.offsetHeight - 30;
    main.style.height = Math.round(Math.min(720, Math.max(340, h))) + 'px';
  }
  addEventListener('resize', fit);
  // opening the tab lines the whole journey up under the tab bar
  const tabBtn = $('tab-journey');
  if (tabBtn) tabBtn.addEventListener('click', () => requestAnimationFrame(() => {
    if (innerWidth <= 820) return;
    const frame = stage.closest('.jr-frame');
    scrollTo({ top: frame.getBoundingClientRect().top + scrollY - navH() - 12, behavior: calm ? 'auto' : 'smooth' });
  }));
  new ResizeObserver(layoutRibbon).observe(ribScroll);

  // ── motion ──
  // depth stops from d = -1 (leaving past the rail) to d = 5 (arriving out of the haze)
  const KX = [1.6, .74, .5, .35, .24, .15, .08],
    KF = [1.12, .9, .8, .73, .68, .645, .62],
    KH = [1.12, .84, .58, .44, .34, .26, .19],
    KB = [0, 0, 1.5, 4, 8, 12, 17],
    KO = [1, 1, 1, 1, .86, .5, 0];
  const RATIO = .64;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  let W = 0, H = 0, base = 0, small = false, dirty = true, p = 0, target = 0, last = 0, active = -1;

  function size() {
    W = stage.clientWidth; H = stage.clientHeight;
    if (!W || !H) return;
    small = innerWidth <= 820;
    base = H * 1.2;
    const w = base * RATIO;
    people.forEach(m => {
      m.el.style.width = w + 'px';
      m.el.style.height = base + 'px';
      m.el.style.fontSize = (base / 38).toFixed(2) + 'px';
    });
    dirty = true;
  }
  new ResizeObserver(size).observe(stage);
  addEventListener('resize', size);

  function paint() {
    if (!W) return;
    people.forEach((m, i) => {
      const d = i - p;
      const k = clamp(d + 1, 0, 6), a = Math.floor(k), b = Math.min(6, a + 1), f = k - a,
        mix = A => A[a] + (A[b] - A[a]) * f;
      // phones: smaller cards that stop above the date label
      const h = mix(KH) * H * (small ? .76 : 1), s = h / base, w = h * RATIO;
      const xs = small ? mix(KX) * .78 + .08 + Math.max(0, -d) * .6 : mix(KX);
      const x = xs * W - w / 2, y = mix(KF) * H * (small ? .86 : 1) - h;
      m.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
      const bl = mix(KB) / s, fs = bl < .2 ? 'none' : `blur(${bl.toFixed(1)}px)`,
        o = (d > 5 ? 0 : d < -1 ? 0 : mix(KO)).toFixed(3);
      if (fs !== m.f) { m.f = fs; m.el.style.filter = fs; }
      if (o !== m.o) { m.o = o; m.el.style.opacity = o; }
      const v = o === '0.000' ? 'hidden' : 'visible';
      if (v !== m.v) { m.v = v; m.el.style.visibility = v; }
      m.el.style.zIndex = 100 - Math.round(d * 10);
    });
    // rail panels slide up in step with the runway
    if (!small) {
      const rh = rail.clientHeight;
      panels.forEach((el, i) => { el.style.transform = `translate3d(0,${((i - p) * rh).toFixed(1)}px,0)`; });
    }
    const rh = roll.firstChild ? roll.firstChild.offsetHeight : 0;
    roll.style.transform = `translate3d(0,${(-p * rh).toFixed(1)}px,0)`;
    // ribbon cursor glides between the entries
    const a = Math.floor(clamp(p, 0, N - 1)), b = Math.min(N - 1, a + 1), f = clamp(p, 0, N - 1) - a;
    if (!scrubbing) cursor.style.left = (bars[a].end + (bars[b].end - bars[a].end) * f).toFixed(1) + 'px';
    const now = clamp(Math.round(p), 0, N - 1);
    if (now !== active) setActive(now);
  }

  function setActive(i, quiet) {
    active = i;
    idxEl.textContent = pad(i + 1);
    panels.forEach((el, j) => {
      el.classList.toggle('on', j === i);
      el.setAttribute('aria-hidden', j === i ? 'false' : 'true');
      el.inert = j !== i;
    });
    bars.forEach((r, j) => {
      const on = j === i, along = overlaps[i].some(o => o.j === j);
      [r.el, r.label].forEach(x => { x.classList.toggle('on', on); x.classList.toggle('along', along); });
    });
    const e = JOURNEY[i], r = bars[i];
    cursorLabel.innerHTML = `${esc(e.short)}<small>${e.approx ? range(e, true) : fmt(e.start) + ' – ' + (e.end ? fmt(e.end) : 'Present')}</small>`;
    cursor.style.setProperty('--shift', r.end < 140 ? '-6px' : r.end > ribW - 140 ? 'calc(-100% + 6px)' : '-50%');
    // amber band + month flags under the selected bar
    Object.assign(span0.style, { left: r.x0 + 'px', width: (r.x1 - r.x0) + 'px', top: axis.style.top });
    const showFlags = !e.approx;
    flagA.hidden = flagB.hidden = !showFlags;
    if (showFlags) {
      flagA.textContent = fmt(e.start);
      flagB.textContent = e.end ? fmt(e.end) : 'Now';
      const same = e.end && e.end[0] === e.start[0] && e.end[1] === e.start[1];
      flagB.hidden = same;
      const top = (parseFloat(axis.style.top) || 0) + 20 + 'px';
      // centre each flag under its end of the bar, but keep both readable and inside the timeline
      const wA = flagA.offsetWidth, wB = flagB.hidden ? 0 : flagB.offsetWidth;
      let la = r.x0 - wA / 2, lb = r.x1 - wB / 2;
      if (!flagB.hidden && la + wA + 4 > lb) { la = r.x0 - wA - 2; lb = r.x1 + 2; }
      lb = Math.min(Math.max(0, lb), ribW - wB);
      la = Math.min(Math.max(0, la), ribW - wA);
      if (!flagB.hidden && la + wA + 4 > lb) la = lb - wA - 4;
      Object.assign(flagA.style, { left: la + 'px', top });
      Object.assign(flagB.style, { left: lb + 'px', top });
    }
    if (quiet) return;
    $('jr-live').textContent = `${e.role}, ${e.org}, ${range(e, true)}`;
    $('jr-prev').disabled = i === 0;
    $('jr-next').disabled = i === N - 1;
    // keep the selected bar in view when the timeline scrolls sideways
    if (ribScroll.scrollWidth > ribScroll.clientWidth + 2) {
      ribScroll.scrollTo({ left: r.mid - ribScroll.clientWidth / 2, behavior: calm ? 'auto' : 'smooth' });
    }
  }

  function frame(ts) {
    const dt = Math.min(50, ts - last) || 16; last = ts;
    const was = p;
    if (calm) p = target; else p += (target - p) * (1 - Math.exp(-dt * .0072));
    if (Math.abs(target - p) < .0004) p = target;
    if (p !== was || dirty) { dirty = false; paint(); }
    cx += (mx - cx) * .32; cy += (my - cy) * .32;
    ring.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    requestAnimationFrame(frame);
  }

  const go = i => { target = clamp(Math.round(i), 0, N - 1); };

  // ── dragging the orange line along the timeline ──
  // The line follows the pointer; the role under it (or the one ending nearest)
  // is brought to the front, and on release the line settles on that role's end.
  let scrubbing = false;
  function roleAt(x) {
    const near = (list) => list.reduce((best, k) => Math.abs(bars[k].end - x) < Math.abs(bars[best].end - x) ? k : best, list[0]);
    const all = bars.map((r, k) => k);
    const covering = all.filter(k => bars[k].x0 - 2 <= x && x <= bars[k].x1 + 2);
    return near(covering.length ? covering : all);
  }
  function scrubTo(clientX) {
    const x = clamp(clientX - ribbon.getBoundingClientRect().left, 0, ribW);
    cursor.style.left = x.toFixed(1) + 'px';
    go(roleAt(x));
  }
  cursor.addEventListener('pointerdown', e => {
    e.preventDefault();
    scrubbing = true;
    try { cursor.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    cursor.classList.add('dragging');
    scrubTo(e.clientX);
  });
  cursor.addEventListener('pointermove', e => { if (scrubbing) scrubTo(e.clientX); });
  const endScrub = () => { if (!scrubbing) return; scrubbing = false; cursor.classList.remove('dragging'); dirty = true; };
  cursor.addEventListener('pointerup', endScrub);
  cursor.addEventListener('pointercancel', endScrub);
  cursor.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.stopPropagation();
    // left = earlier in time = further down the list of cards
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) + 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) - 1); }
  });

  // ── input: drag, click, wheel, keys ──
  let mx = 0, my = 0, cx = 0, cy = 0, down = false, sx = 0, st = 0, moved = 0, wheelT = 0;
  const PULL = () => Math.max(150, W * .22);
  stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') ring.classList.add('show'); });
  stage.addEventListener('pointerleave', () => ring.classList.remove('show'));
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
    if (!down) return;
    const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
    target = clamp(st + dx / PULL(), -.35, N - .65);
  });
  stage.addEventListener('pointerdown', e => {
    if (e.target.closest('a,button')) return;
    down = true; sx = e.clientX; st = target; moved = 0;
    stage.setPointerCapture(e.pointerId); ring.classList.add('drag');
  });
  function release(e) {
    if (!down) return; down = false; ring.classList.remove('drag');
    if (moved < 6) {
      const hit = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.classList && x.classList.contains('jr-m'));
      if (hit) go(+hit.dataset.i);
    } else go(target);
  }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('wheel', e => {
    const dir = Math.sign(e.deltaY + e.deltaX);
    // at either end, let the page scroll on instead of trapping the wheel
    if ((dir < 0 && target <= 0) || (dir > 0 && target >= N - 1)) return;
    e.preventDefault();
    target = clamp(target + clamp(e.deltaY + e.deltaX, -120, 120) / 420, 0, N - 1);
    clearTimeout(wheelT); wheelT = setTimeout(() => go(target), 150);
  }, { passive: false });
  addEventListener('keydown', e => {
    const sec = $('content-journey');
    if (!sec || sec.classList.contains('hidden')) return;
    if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
    if (['ArrowRight', 'ArrowDown'].includes(e.key) && (e.key === 'ArrowRight' || stage.contains(document.activeElement))) { e.preventDefault(); go(Math.round(target) + 1); }
    if (['ArrowLeft', 'ArrowUp'].includes(e.key) && (e.key === 'ArrowLeft' || stage.contains(document.activeElement))) { e.preventDefault(); go(Math.round(target) - 1); }
  });
  $('jr-prev').addEventListener('click', () => go(Math.round(target) - 1));
  $('jr-next').addEventListener('click', () => go(Math.round(target) + 1));
  document.getElementById('content-journey').addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) go(+b.dataset.go);
  });

  size();
  requestAnimationFrame(frame);
})();
