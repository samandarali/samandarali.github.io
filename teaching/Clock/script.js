/* ==========================================================================
   CLOCK PRACTICE — SCRIPT
   A single-page state machine: Home -> Practice -> Results.
   No backend. All state lives in the `state` object so a future save/login
   feature could simply persist/restore this object.
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------------------------------------------ *
   *  CONSTANTS
   * ------------------------------------------------------------------ */

  // Which minute values are allowed to be *asked* / *snapped to* per level.
  const LEVEL_MINUTES = {
    1: [0],
    2: [0, 30],
    3: [0, 15, 30, 45],
    4: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
  };

  // Tolerance (in degrees) allowed when checking a dragged hand position.
  const MINUTE_TOLERANCE_DEG = 7;
  const HOUR_TOLERANCE_DEG = 9;

  const STORAGE_NOT_USED = true; // placeholder flag: no backend in v1

  // --- Time Challenge (3rd activity) constants -----------------------
  // Level 1: single simple duration to add.
  const CHALLENGE_L1_DURATIONS = [15, 30, 45];
  // Level 2: combined hour+minute durations, [hours, minutes].
  const CHALLENGE_L2_DURATIONS = [
    [1, 20], [1, 40],
    [2, 15], [2, 30], [2, 40], [2, 50],
    [3, 15], [3, 25],
  ];
  // Level 3: pool of plausible segment durations (minutes) for word
  // problems; each story picks 2-4 of these per template.
  const CHALLENGE_DURATION_POOL = [
    15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
    70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
  ];
  const CHALLENGE_NAMES = [
    "Emma", "Liam", "Sophia", "Noah", "Ava", "Mason",
    "Mia", "Lucas", "Zoey", "Ethan", "Grace", "Oliver",
  ];

  /* ------------------------------------------------------------------ *
   *  STATE
   * ------------------------------------------------------------------ */

  const state = {
    currentActivity: "set",       // 'set' | 'tell' | 'challenge'
    difficultyLevel: 1,           // 1-4, used by 'set' and 'tell'
    challengeLevel: 1,            // 1-3, used only by 'challenge'
    answerAmPm: null,             // 'AM' | 'PM' | null — Time Challenge Level 3 answer
    totalQuestions: 10,
    currentQuestionIndex: 0,      // 0-based
    correctAnswers: 0,            // questions completed correctly
    firstTryCorrect: 0,
    attemptsForCurrentQuestion: 0,
    hintsUsed: 0,
    hintsShownForCurrentQuestion: 0,
    questions: [],                // [{hour, minute}, ...]
    currentQuestion: null,        // {hour, minute}
    soundOn: true,
    showMinuteHelpers: false,
    showHandHelper: true,
    answeredCorrectly: false,

    // Live hand position while the child drags (Activity 1 only)
    handHour: 12,
    handMinute: 0,

    // Drag bookkeeping
    activeHand: null,             // 'hour' | 'minute' | null
    clockRect: null,
  };

  /* ------------------------------------------------------------------ *
   *  DOM REFERENCES
   * ------------------------------------------------------------------ */

  const el = {};
  function cacheDom() {
    [
      "screen-home", "screen-practice", "screen-results",
      "choice-set", "choice-tell", "choice-challenge",
      "level-group", "level-group-challenge",
      "setup-group-standard-levels", "setup-group-challenge-levels",
      "count-group",
      "btn-start", "btn-sound",
      "btn-home", "question-counter", "score-display",
      "progress-bar-track", "progress-bar-fill", "practice-instruction",
      "clock-stage", "clock-face", "clock-ticks", "clock-numbers", "clock-minute-helpers",
      "hour-hand", "minute-hand", "hour-grabber", "minute-grabber",
      "hand-helper", "btn-toggle-helper", "btn-minute-helpers",
      "story-card", "story-text", "starting-time-text",
      "answer-card", "tell-time-form", "time-input", "ampm-toggle",
      "feedback-message", "hint-message",
      "btn-hint", "btn-check", "btn-next", "celebration",
      "screen-results", "results-stars", "results-summary",
      "stat-completed", "stat-firsttry", "stat-hints",
      "btn-again", "btn-home2", "sr-live",
    ].forEach((id) => {
      el[toCamel(id)] = document.getElementById(id);
    });
  }
  function toCamel(id) {
    return id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  }

  /* ------------------------------------------------------------------ *
   *  UTILITIES
   * ------------------------------------------------------------------ */

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pad2(n) {
    return n.toString().padStart(2, "0");
  }

  function formatTime(hour, minute) {
    return `${hour}:${pad2(minute)}`;
  }

  // Shortest distance between two angles on a 0-360 circle.
  function circularDiff(a, b) {
    const diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
  }

  function announce(msg) {
    if (el.srLive) el.srLive.textContent = msg;
  }

  /* ------------------------------------------------------------------ *
   *  CLOCK MATH
   *  minuteAngle = minutes * 6           (360 / 60 = 6 deg per minute)
   *  hourAngle   = (hour % 12) * 30 + minutes * 0.5
   *                (30 deg per hour, plus 0.5 deg per minute so the hour
   *                 hand creeps smoothly toward the next number)
   * ------------------------------------------------------------------ */

  function minuteAngleFor(minute) {
    return minute * 6;
  }
  function hourAngleFor(hour, minute) {
    return (hour % 12) * 30 + minute * 0.5;
  }

  /* ------------------------------------------------------------------ *
   *  TIME CHALLENGE — ELAPSED-TIME ARITHMETIC
   *  All duration math is done in minutes (either a 0-719 "12-hour clock
   *  face" basis for Levels 1-2, which don't need AM/PM, or a 0-1439
   *  "minutes since midnight" basis for Level 3, which does). We never
   *  add/subtract on the displayed "H:MM" strings directly.
   * ------------------------------------------------------------------ */

  // 12-hour face basis (no AM/PM): hour 1-12, minute 0-59 -> 0-719.
  function to12HourTotal(hour, minute) {
    return (hour % 12) * 60 + minute;
  }
  function from12HourTotal(total) {
    const t = ((total % 720) + 720) % 720;
    let hour = Math.floor(t / 60);
    const minute = t % 60;
    if (hour === 0) hour = 12;
    return { hour, minute };
  }

  // Full-day basis (with AM/PM): hour 1-12 + isPM, minute 0-59 -> 0-1439.
  function to24HourTotal(hour12, minute, isPM) {
    let hour24 = hour12 % 12;
    if (isPM) hour24 += 12;
    return hour24 * 60 + minute;
  }
  function from24HourTotal(total) {
    const t = ((total % 1440) + 1440) % 1440;
    const hour24 = Math.floor(t / 60);
    const minute = t % 60;
    const isPM = hour24 >= 12;
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour: hour12, minute, isPM };
  }

  function formatTimeAmPm(hour, minute, isPM) {
    return `${formatTime(hour, minute)} ${isPM ? "PM" : "AM"}`;
  }

  // "2 h 40 min" / "45 min" / "2 h" — used in question and hint text.
  function formatDuration(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  }

  /* ------------------------------------------------------------------ *
   *  BUILDING THE STATIC CLOCK FACE (numbers, ticks, minute helper labels)
   *  Positions are stored as PERCENTAGES of the (always-square) clock
   *  face, so they stay correctly placed at any screen size without
   *  recalculating on resize.
   * ------------------------------------------------------------------ */

  function buildClockFace() {
    const numbersLayer = el.clockNumbers;
    const ticksLayer = el.clockTicks;
    const helpersLayer = el.clockMinuteHelpers;
    numbersLayer.innerHTML = "";
    ticksLayer.innerHTML = "";
    helpersLayer.innerHTML = "";

    // 12 big hour numbers
    for (let i = 1; i <= 12; i++) {
      const angleDeg = i * 30; // 12 -> 360/0, at top
      const rad = (angleDeg * Math.PI) / 180;
      const radius = 38; // % from center
      const x = 50 + radius * Math.sin(rad);
      const y = 50 - radius * Math.cos(rad);
      const span = document.createElement("span");
      span.textContent = i;
      span.setAttribute("role", "listitem");
      span.style.left = x + "%";
      span.style.top = y + "%";
      numbersLayer.appendChild(span);

      // Minute helper label (e.g. "05" near the "1")
      const minuteValue = (i % 12) * 5;
      const hx = 50 + 46 * Math.sin(rad);
      const hy = 50 - 46 * Math.cos(rad);
      const hspan = document.createElement("span");
      hspan.textContent = pad2(minuteValue === 60 ? 0 : minuteValue);
      hspan.style.left = hx + "%";
      hspan.style.top = hy + "%";
      helpersLayer.appendChild(hspan);
    }

    // 60 minute ticks (every 5th is a bold hour tick)
    for (let m = 0; m < 60; m++) {
      const angleDeg = m * 6;
      const rad = (angleDeg * Math.PI) / 180;
      const isMajor = m % 5 === 0;
      const radius = 45;
      const x = 50 + radius * Math.sin(rad);
      const y = 50 - radius * Math.cos(rad);
      const tick = document.createElement("span");
      tick.className = isMajor ? "tick tick-major" : "tick";
      tick.style.left = x + "%";
      tick.style.top = y + "%";
      tick.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
      ticksLayer.appendChild(tick);
    }
  }

  /* ------------------------------------------------------------------ *
   *  DRAWING / UPDATING HANDS
   * ------------------------------------------------------------------ */

  function drawClock(hourAngle, minuteAngle) {
    const hourRot = `translate(-50%, -100%) rotate(${hourAngle}deg)`;
    const minuteRot = `translate(-50%, -100%) rotate(${minuteAngle}deg)`;
    el.hourHand.style.transform = hourRot;
    el.minuteHand.style.transform = minuteRot;
    el.hourGrabber.style.transform = hourRot;
    el.minuteGrabber.style.transform = minuteRot;
    el.hourGrabber.setAttribute("aria-valuenow", String(state.handHour));
    el.minuteGrabber.setAttribute("aria-valuenow", String(state.handMinute));
  }

  // Set the clock to an exact hour/minute (used for Tell-the-Time display,
  // and to initialize Set-the-Clock's starting hand position).
  function setClockTime(hour, minute) {
    state.handHour = hour;
    state.handMinute = minute;
    drawClock(hourAngleFor(hour, minute), minuteAngleFor(minute));
  }

  // Recompute hand angles from current handHour/handMinute state and redraw.
  // Called continuously while the child drags a hand.
  function updateClockHands() {
    drawClock(
      hourAngleFor(state.handHour, state.handMinute),
      minuteAngleFor(state.handMinute)
    );
  }

  /* ------------------------------------------------------------------ *
   *  DRAGGING THE HANDS (Pointer Events -> works for mouse, touch, pen)
   * ------------------------------------------------------------------ */

  function angleFromCenter(clientX, clientY, rect) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    // atan2(dx, -dy): 0deg straight up, increases clockwise, matches our
    // clock-angle convention directly.
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  }

  // Snap a raw minute angle to the nearest of the 60 individual minute
  // positions (0-59), 6deg apart. Dragging the minute hand is always
  // free at one-minute resolution in every difficulty level — the level
  // only controls which times are *asked* (see LEVEL_MINUTES usage in
  // question generation), not how finely the hand can be moved.
  function snapMinute(rawMinute) {
    let m = Math.round(rawMinute) % 60;
    if (m < 0) m += 60;
    return m;
  }

  // When the minute hand crosses the 12 o'clock mark, roll the hour hand
  // forward or backward by exactly one hour. This is driven by comparing
  // the previous and new minute values (not recomputed from the raw
  // pointer angle), which is what lets the hour hand keep advancing to
  // the *next* hour every time the minute hand completes a clockwise
  // rotation, instead of snapping back toward the current/previous hour.
  function advanceHourOnMinuteWrap(oldMinute, newMinute) {
    const delta = newMinute - oldMinute;
    if (delta > 30) {
      // Large jump downward-in-angle-terms actually means we wrapped
      // backwards past 0 (e.g. 2 -> 58 while dragging counterclockwise):
      // the hour should decrease.
      state.handHour = ((state.handHour - 2 + 12) % 12) + 1;
    } else if (delta < -30) {
      // Wrapped forward past 59 back to 0 (e.g. 58 -> 2 while dragging
      // clockwise): the hour should advance to the next hour.
      state.handHour = (state.handHour % 12) + 1;
    }
  }

  function handleHandDrag(clientX, clientY) {
    if (!state.activeHand || !state.clockRect) return;
    const angle = angleFromCenter(clientX, clientY, state.clockRect);

    if (state.activeHand === "minute") {
      const rawMinute = angle / 6; // 0-60, each tick = 1 minute = 6deg
      const newMinute = snapMinute(rawMinute);
      if (newMinute !== state.handMinute) {
        advanceHourOnMinuteWrap(state.handMinute, newMinute);
        state.handMinute = newMinute;
      }
    } else if (state.activeHand === "hour") {
      // Remove the "creep" caused by the current minute value before
      // figuring out which hour number the child is pointing at.
      const minuteOffset = state.handMinute * 0.5;
      let rawHour = Math.round((angle - minuteOffset) / 30) % 12;
      if (rawHour <= 0) rawHour += 12;
      state.handHour = rawHour;
    }
    updateClockHands();
  }

  function startDrag(hand, pointerId, target) {
    state.activeHand = hand;
    state.clockRect = el.clockFace.getBoundingClientRect();
    target.classList.add("dragging");
    try {
      target.setPointerCapture(pointerId);
    } catch (err) {
      /* ignore unsupported */
    }
  }

  function endDrag(target) {
    state.activeHand = null;
    if (target) target.classList.remove("dragging");
  }

  function initDragHandlers() {
    const hourGrabber = el.hourGrabber;
    const minuteGrabber = el.minuteGrabber;

    function onPointerDown(hand, grabber) {
      return (e) => {
        if (!el.clockFace.classList.contains("interactive")) return;
        e.preventDefault();
        startDrag(hand, e.pointerId, grabber);
        handleHandDrag(e.clientX, e.clientY);
      };
    }

    hourGrabber.addEventListener("pointerdown", onPointerDown("hour", hourGrabber));
    minuteGrabber.addEventListener("pointerdown", onPointerDown("minute", minuteGrabber));

    [hourGrabber, minuteGrabber].forEach((grabber) => {
      grabber.addEventListener("pointermove", (e) => {
        if (state.activeHand === null) return;
        e.preventDefault();
        handleHandDrag(e.clientX, e.clientY);
      });
      grabber.addEventListener("pointerup", (e) => {
        e.preventDefault();
        endDrag(grabber);
      });
      grabber.addEventListener("pointercancel", () => endDrag(grabber));
    });

    // Also allow dragging to continue even if the pointer briefly leaves
    // the small grabber strip, by listening on the whole clock face too.
    el.clockFace.addEventListener("pointermove", (e) => {
      if (state.activeHand === null) return;
      e.preventDefault();
      handleHandDrag(e.clientX, e.clientY);
    });
    el.clockFace.addEventListener("pointerup", () => {
      if (state.activeHand === "hour") endDrag(hourGrabber);
      if (state.activeHand === "minute") endDrag(minuteGrabber);
    });
    el.clockFace.addEventListener("pointercancel", () => {
      endDrag(hourGrabber);
      endDrag(minuteGrabber);
    });

    // Keyboard support: arrow keys nudge each hand by one snap step.
    hourGrabber.addEventListener("keydown", (e) => onHandKeydown(e, "hour"));
    minuteGrabber.addEventListener("keydown", (e) => onHandKeydown(e, "minute"));
  }

  function onHandKeydown(e, hand) {
    if (!el.clockFace.classList.contains("interactive")) return;
    let handled = true;
    if (hand === "minute") {
      const oldMinute = state.handMinute;
      let newMinute = oldMinute;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        newMinute = (oldMinute + 1) % 60;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        newMinute = (oldMinute - 1 + 60) % 60;
      } else {
        handled = false;
      }
      if (handled) {
        advanceHourOnMinuteWrap(oldMinute, newMinute);
        state.handMinute = newMinute;
      }
    } else {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        state.handHour = (state.handHour % 12) + 1;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        state.handHour = ((state.handHour - 2 + 12) % 12) + 1;
      } else {
        handled = false;
      }
    }
    if (handled) {
      e.preventDefault();
      updateClockHands();
    }
  }

  /* ------------------------------------------------------------------ *
   *  QUESTION GENERATION
   * ------------------------------------------------------------------ */

  function generateRandomTime(level) {
    const minutes = LEVEL_MINUTES[level];
    const hour = randInt(1, 12);
    const minute = minutes[randInt(0, minutes.length - 1)];
    return { hour, minute };
  }

  // Builds `count` questions for the session, avoiding duplicates while
  // enough unique hour/minute combinations remain.
  function generateQuestionSet(count, level) {
    const minutes = LEVEL_MINUTES[level];
    const pool = [];
    for (let h = 1; h <= 12; h++) {
      minutes.forEach((m) => pool.push({ hour: h, minute: m }));
    }
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const result = [];
    if (count <= pool.length) {
      result.push(...pool.slice(0, count));
    } else {
      result.push(...pool);
      let last = pool[pool.length - 1];
      while (result.length < count) {
        let next = generateRandomTime(level);
        // avoid repeating the immediately preceding question when possible
        let guard = 0;
        while (next.hour === last.hour && next.minute === last.minute && guard < 10) {
          next = generateRandomTime(level);
          guard++;
        }
        result.push(next);
        last = next;
      }
    }
    return result;
  }

  /* ------------------------------------------------------------------ *
   *  TIME CHALLENGE — QUESTION GENERATORS
   *  Each generator returns a question object carrying enough info to
   *  determine the starting time, duration(s), correct ending time, and
   *  (for hints) the intermediate steps — never just the final answer.
   * ------------------------------------------------------------------ */

  // Level 1: single 15/30/45-minute add. No AM/PM needed.
  function generateChallengeLevel1() {
    const startHour = randInt(1, 12);
    const startMinute = randInt(0, 59);
    const duration = CHALLENGE_L1_DURATIONS[randInt(0, CHALLENGE_L1_DURATIONS.length - 1)];

    const startTotal = to12HourTotal(startHour, startMinute);
    const { hour: correctHour, minute: correctMinute } = from12HourTotal(startTotal + duration);

    return {
      activity: "challenge",
      level: 1,
      startHour,
      startMinute,
      durationMinutes: duration,
      correctHour,
      correctMinute,
      questionText: `It is ${formatTime(startHour, startMinute)}. What time will it be after ${duration} minutes?`,
    };
  }

  // Level 2: combined hour(s) + minutes add. No AM/PM needed.
  function generateChallengeLevel2() {
    const startHour = randInt(1, 12);
    const startMinute = randInt(0, 59);
    const [durationHours, durationMins] = CHALLENGE_L2_DURATIONS[randInt(0, CHALLENGE_L2_DURATIONS.length - 1)];
    const duration = durationHours * 60 + durationMins;

    const startTotal = to12HourTotal(startHour, startMinute);
    const { hour: correctHour, minute: correctMinute } = from12HourTotal(startTotal + duration);

    return {
      activity: "challenge",
      level: 2,
      startHour,
      startMinute,
      durationHours,
      durationMins,
      durationMinutes: duration,
      correctHour,
      correctMinute,
      questionText: `It is ${formatTime(startHour, startMinute)}. What time will it be after ${formatDuration(duration)}?`,
    };
  }

  // Level 3 story templates. Each `build` receives the character's name,
  // the formatted starting-time label, and an array of {minutes, label}
  // duration objects (one per segment required by the template), and
  // returns the story text plus a short label per segment for hints.
  const CHALLENGE_TEMPLATES = [
    { // driving / travel
      segments: 3,
      build: (name, startLabel, d) => ({
        text: `${name} left home at ${startLabel} to drive and visit family. ${name} drove for ${d[0].label}, stopped for a ${d[1].label} break at a rest stop, then drove another ${d[2].label} to arrive. What time did ${name} arrive?`,
        labels: ["driving before the stop", "the rest stop break", "driving the rest of the way"],
      }),
    },
    { // school
      segments: 2,
      build: (name, startLabel, d) => ({
        text: `${name} started morning class at ${startLabel}. Class lasted ${d[0].label}, then there was a ${d[1].label} recess before the next class began. What time did the next class start?`,
        labels: ["the first class", "recess"],
      }),
    },
    { // sports
      segments: 3,
      build: (name, startLabel, d) => ({
        text: `${name}'s soccer practice began at ${startLabel}. The team warmed up for ${d[0].label}, played a scrimmage for ${d[1].label}, then cooled down for ${d[2].label}. What time did practice end?`,
        labels: ["the warm-up", "the scrimmage", "the cool-down"],
      }),
    },
    { // visiting family
      segments: 3,
      build: (name, startLabel, d) => ({
        text: `${name} arrived at grandma's house at ${startLabel}. They chatted for ${d[0].label}, baked cookies together for ${d[1].label}, and then played a board game for ${d[2].label}. What time did the game end?`,
        labels: ["chatting", "baking cookies", "the board game"],
      }),
    },
    { // shopping
      segments: 2,
      build: (name, startLabel, d) => ({
        text: `${name} started shopping at the mall at ${startLabel}. They browsed the toy store for ${d[0].label}, then tried on shoes at the shoe store for ${d[1].label}. What time did they finish?`,
        labels: ["the toy store", "the shoe store"],
      }),
    },
    { // movies
      segments: 2,
      build: (name, startLabel, d) => ({
        text: `${name} arrived at the movie theater at ${startLabel}. Previews and ads played for ${d[0].label}, then the movie played for ${d[1].label}. What time did the movie end?`,
        labels: ["the previews", "the movie"],
      }),
    },
    { // parties
      segments: 4,
      build: (name, startLabel, d) => ({
        text: `${name}'s birthday party started at ${startLabel}. Guests played games for ${d[0].label}, ate lunch for ${d[1].label}, watched ${name} open presents for ${d[2].label}, and finished with cake for ${d[3].label}. What time did the party end?`,
        labels: ["games", "lunch", "opening presents", "cake time"],
      }),
    },
    { // cooking / baking
      segments: 3,
      build: (name, startLabel, d) => ({
        text: `${name} began baking bread at ${startLabel}. Mixing the dough took ${d[0].label}, letting it rise took ${d[1].label}, and baking it in the oven took ${d[2].label}. What time was the bread ready?`,
        labels: ["mixing the dough", "letting it rise", "baking"],
      }),
    },
    { // library
      segments: 2,
      build: (name, startLabel, d) => ({
        text: `${name} got to the library at ${startLabel}. They read quietly for ${d[0].label}, then joined story time for ${d[1].label}. What time did story time end?`,
        labels: ["reading", "story time"],
      }),
    },
    { // trip with stops
      segments: 4,
      build: (name, startLabel, d) => ({
        text: `${name} took a train trip that started at ${startLabel}. The train rode for ${d[0].label}, stopped at a station for ${d[1].label}, rode again for ${d[2].label}, then stopped once more for ${d[3].label} before reaching the final stop. What time did the train arrive?`,
        labels: ["the first leg", "the station stop", "the second leg", "the last stop"],
      }),
    },
  ];

  const CHALLENGE_START_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Level 3: multi-step word problem. Uses the full-day (AM/PM) basis
  // since stories can cross noon or move from morning into the afternoon.
  function generateChallengeLevel3() {
    const template = CHALLENGE_TEMPLATES[randInt(0, CHALLENGE_TEMPLATES.length - 1)];
    const name = CHALLENGE_NAMES[randInt(0, CHALLENGE_NAMES.length - 1)];

    const startHour = randInt(1, 12);
    const startMinute = CHALLENGE_START_MINUTES[randInt(0, CHALLENGE_START_MINUTES.length - 1)];
    const startIsPM = Math.random() < 0.5;
    const startLabel = formatTimeAmPm(startHour, startMinute, startIsPM);

    const durMinutesList = [];
    for (let i = 0; i < template.segments; i++) {
      durMinutesList.push(CHALLENGE_DURATION_POOL[randInt(0, CHALLENGE_DURATION_POOL.length - 1)]);
    }
    const durLabels = durMinutesList.map((m) => ({ minutes: m, label: formatDuration(m) }));

    const { text: storyText, labels: segmentLabels } = template.build(name, startLabel, durLabels);

    // Walk through each segment, tracking the running total in minutes
    // since midnight so hour/AM-PM boundaries are handled automatically.
    let runningTotal = to24HourTotal(startHour, startMinute, startIsPM);
    const steps = [];
    durMinutesList.forEach((mins, idx) => {
      runningTotal += mins;
      const t = from24HourTotal(runningTotal);
      steps.push({
        durationMinutes: mins,
        durationLabel: durLabels[idx].label,
        segmentLabel: segmentLabels[idx],
        resultHour: t.hour,
        resultMinute: t.minute,
        resultIsPM: t.isPM,
        resultLabel: formatTimeAmPm(t.hour, t.minute, t.isPM),
      });
    });

    const final = steps[steps.length - 1];

    return {
      activity: "challenge",
      level: 3,
      startHour,
      startMinute,
      startIsPM,
      startLabel,
      storyText,
      steps,
      correctHour: final.resultHour,
      correctMinute: final.resultMinute,
      correctIsPM: final.resultIsPM,
    };
  }

  // Builds `count` Time Challenge questions for the chosen level, guarding
  // (best-effort) against the exact same question appearing twice in a row.
  function generateChallengeQuestionSet(count, level) {
    const generator =
      level === 1 ? generateChallengeLevel1 :
      level === 2 ? generateChallengeLevel2 :
      generateChallengeLevel3;

    const result = [];
    let last = null;
    for (let i = 0; i < count; i++) {
      let q = generator();
      let guard = 0;
      while (last && challengeQuestionsEqual(q, last) && guard < 10) {
        q = generator();
        guard++;
      }
      result.push(q);
      last = q;
    }
    return result;
  }

  function challengeQuestionsEqual(a, b) {
    if (a.level !== b.level) return false;
    if (a.level === 3) return a.storyText === b.storyText;
    return (
      a.startHour === b.startHour &&
      a.startMinute === b.startMinute &&
      a.durationMinutes === b.durationMinutes
    );
  }

  /* ------------------------------------------------------------------ *
   *  SESSION FLOW
   * ------------------------------------------------------------------ */

  function startSession() {
    state.questions =
      state.currentActivity === "challenge"
        ? generateChallengeQuestionSet(state.totalQuestions, state.challengeLevel)
        : generateQuestionSet(state.totalQuestions, state.difficultyLevel);
    state.currentQuestionIndex = 0;
    state.correctAnswers = 0;
    state.firstTryCorrect = 0;
    state.hintsUsed = 0;

    showScreen("practice");
    setupPracticeUiForActivity();
    generateQuestion();
  }

  function resetSession() {
    state.questions = [];
    state.currentQuestionIndex = 0;
    state.correctAnswers = 0;
    state.firstTryCorrect = 0;
    state.hintsUsed = 0;
    state.currentQuestion = null;
    state.answerAmPm = null;
  }

  function setupPracticeUiForActivity() {
    const activity = state.currentActivity;
    const isSet = activity === "set";
    const isTell = activity === "tell";
    const isChallenge = activity === "challenge";
    const isChallengeStory = isChallenge && state.challengeLevel === 3;
    const isChallengeClockLevel = isChallenge && !isChallengeStory;

    // The answer card (label + input) is a single visual unit for
    // Activities 2 & 3. Toggling the wrapper — not just the inner
    // <form> — guarantees the whole card appears/disappears together.
    el.answerCard.hidden = isSet;
    el.handHelper.hidden = !isSet || !state.showHandHelper;
    el.btnMinuteHelpers.hidden = !isTell; // minute helpers only meaningful in tell-the-time reading
    el.clockFace.classList.toggle("interactive", isSet);
    el.screenPractice.classList.toggle("activity-set", isSet);
    el.screenPractice.classList.toggle("activity-tell", isTell);
    el.screenPractice.classList.toggle("activity-challenge", isChallenge);

    // Level 3 word problems put the story front and center; the clock is
    // hidden so it doesn't compete for attention. Levels 1-2 show the
    // clock (display-only) plus a text label of the starting time.
    el.storyCard.hidden = !isChallengeStory;
    el.startingTimeText.hidden = !isChallengeClockLevel;
    el.clockStage.hidden = isChallengeStory;

    // AM/PM answer selector only matters for Level 3 word problems.
    el.ampmToggle.hidden = !isChallengeStory;
  }

  function generateQuestion() {
    state.currentQuestion = state.questions[state.currentQuestionIndex];
    state.attemptsForCurrentQuestion = 0;
    state.hintsShownForCurrentQuestion = 0;
    state.answeredCorrectly = false;
    resetAmPmAnswer();

    el.feedbackMessage.textContent = "";
    el.feedbackMessage.classList.remove("is-error");
    el.hintMessage.textContent = "";
    el.btnNext.hidden = true;
    el.btnCheck.hidden = false;
    el.btnCheck.disabled = false;
    el.btnHint.disabled = false;
    el.timeInput.value = "";
    el.timeInput.disabled = false;

    const q = state.currentQuestion;

    if (state.currentActivity === "set") {
      const { hour, minute } = q;
      el.practiceInstruction.textContent = `Show ${formatTime(hour, minute)} on the clock.`;
      // Start the hands somewhere clearly different from the target so
      // the child has to actually move them.
      let startHour = randInt(1, 12);
      let startMinute = LEVEL_MINUTES[state.difficultyLevel][0];
      if (startHour === hour && startMinute === minute) {
        startHour = ((hour + 5) % 12) + 1;
      }
      setClockTime(startHour, startMinute);
    } else if (state.currentActivity === "tell") {
      const { hour, minute } = q;
      el.practiceInstruction.textContent = "What time is it?";
      setClockTime(hour, minute);
      setTimeout(() => el.timeInput.focus(), 50);
    } else {
      setupChallengeQuestion(q);
    }

    updateMinuteHelperVisibility();
    updateProgress();
    updateScore();
  }

  // Populates the instruction, story card / starting-time text, and
  // display-only clock for a Time Challenge question.
  function setupChallengeQuestion(q) {
    if (q.level === 3) {
      el.practiceInstruction.textContent = "Read the story and work out the time.";
      el.storyText.textContent = q.storyText;
    } else {
      el.practiceInstruction.textContent = q.questionText;
      el.startingTimeText.textContent = `Starting time: ${formatTime(q.startHour, q.startMinute)}`;
      setClockTime(q.startHour, q.startMinute);
    }
    setTimeout(() => el.timeInput.focus(), 50);
  }

  function nextQuestion() {
    state.currentQuestionIndex++;
    if (state.currentQuestionIndex >= state.totalQuestions) {
      endSession();
    } else {
      generateQuestion();
    }
  }

  function endSession() {
    showScreen("results");

    const pct = state.totalQuestions > 0 ? state.firstTryCorrect / state.totalQuestions : 0;
    let stars = "⭐";
    if (pct >= 0.9) stars = "⭐⭐⭐";
    else if (pct >= 0.6) stars = "⭐⭐";

    const activityLabel = state.currentActivity === "challenge" ? "time challenge" : "clock";
    el.resultsStars.textContent = stars;
    el.resultsSummary.textContent = `You completed ${state.totalQuestions} ${activityLabel} question${state.totalQuestions === 1 ? "" : "s"}!`;
    el.statCompleted.textContent = String(state.correctAnswers);
    el.statFirsttry.textContent = `${state.firstTryCorrect} / ${state.totalQuestions}`;
    el.statHints.textContent = String(state.hintsUsed);
  }

  /* ------------------------------------------------------------------ *
   *  SCORING / PROGRESS UI
   * ------------------------------------------------------------------ */

  function updateScore() {
    el.scoreDisplay.textContent = `⭐ Score: ${state.correctAnswers} / ${state.totalQuestions}`;
  }

  function updateProgress() {
    const questionNum = state.currentQuestionIndex + 1;
    el.questionCounter.textContent = `Question ${questionNum} of ${state.totalQuestions}`;
    const pct = Math.round((state.currentQuestionIndex / state.totalQuestions) * 100);
    el.progressBarFill.style.width = pct + "%";
    el.progressBarTrack.setAttribute("aria-valuenow", String(pct));
  }

  /* ------------------------------------------------------------------ *
   *  ANSWER CHECKING
   * ------------------------------------------------------------------ */

  function checkAnswer() {
    if (state.answeredCorrectly) return;
    state.attemptsForCurrentQuestion++;

    let correct;
    if (state.currentActivity === "set") {
      correct = checkHandPosition();
    } else if (state.currentActivity === "tell") {
      correct = checkTypedTime();
    } else {
      correct = checkChallengeAnswer();
    }

    if (correct) {
      state.answeredCorrectly = true;
      state.correctAnswers++;
      if (state.attemptsForCurrentQuestion === 1) state.firstTryCorrect++;
      updateScore();
      showCorrectFeedback();
    } else {
      showTryAgainFeedback();
    }
  }

  // Compares the child's dragged hand angles with the target time's
  // angles, using circular angle difference so positions near 0deg/360deg
  // (e.g. right around 12) are correctly recognized as close together.
  function checkHandPosition() {
    const { hour, minute } = state.currentQuestion;
    const targetMinuteAngle = minuteAngleFor(minute);
    const targetHourAngle = hourAngleFor(hour, minute);
    const currentMinuteAngle = minuteAngleFor(state.handMinute);
    const currentHourAngle = hourAngleFor(state.handHour, state.handMinute);

    const minuteOk = circularDiff(currentMinuteAngle, targetMinuteAngle) <= MINUTE_TOLERANCE_DEG;
    const hourOk = circularDiff(currentHourAngle, targetHourAngle) <= HOUR_TOLERANCE_DEG;

    return minuteOk && hourOk;
  }

  // Parses formats like "3:30", "03:30", "3 : 30", "3:5" -> {hour, minute}
  function parseTypedTime(raw) {
    const cleaned = raw.replace(/\s+/g, "");
    const match = cleaned.match(/^(\d{1,2}):(\d{1,2})$/);
    if (!match) return null;
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    if (hour < 1 || hour > 12) return null;
    if (minute < 0 || minute > 59) return null;
    return { hour, minute };
  }

  function checkTypedTime() {
    const parsed = parseTypedTime(el.timeInput.value);
    if (!parsed) return false;
    const { hour, minute } = state.currentQuestion;
    return parsed.hour === hour && parsed.minute === minute;
  }

  // Time Challenge answer check. Levels 1-2 compare hour/minute only
  // (no AM/PM needed); Level 3 also requires the student to pick AM/PM,
  // since word problems can cross from morning into afternoon/evening.
  function checkChallengeAnswer() {
    const parsed = parseTypedTime(el.timeInput.value);
    if (!parsed) return false;
    const q = state.currentQuestion;

    if (q.level === 3) {
      if (!state.answerAmPm) return false;
      const isPM = state.answerAmPm === "PM";
      return (
        parsed.hour === q.correctHour &&
        parsed.minute === q.correctMinute &&
        isPM === q.correctIsPM
      );
    }
    return parsed.hour === q.correctHour && parsed.minute === q.correctMinute;
  }

  /* ------------------------------------------------------------------ *
   *  FEEDBACK
   * ------------------------------------------------------------------ */

  const CORRECT_MESSAGES = ["🎉 Hooray! You got it!", "⭐ Great job!", "🎉 Fantastic!"];
  const TRYAGAIN_MESSAGES = ["🙂 Almost! Try again.", "😕 Almost! Look at the clock again."];

  function showCorrectFeedback() {
    const q = state.currentQuestion;
    let msg;
    if (state.currentActivity === "tell") {
      msg = `🎉 Great job! ${formatTime(q.hour, q.minute)} is correct!`;
    } else if (state.currentActivity === "challenge") {
      const timeStr =
        q.level === 3
          ? formatTimeAmPm(q.correctHour, q.correctMinute, q.correctIsPM)
          : formatTime(q.correctHour, q.correctMinute);
      msg = `🎉 Great job! ${timeStr} is correct!`;
    } else {
      msg = CORRECT_MESSAGES[randInt(0, CORRECT_MESSAGES.length - 1)];
    }

    el.feedbackMessage.textContent = msg;
    el.feedbackMessage.classList.remove("is-error");
    el.hintMessage.textContent = "";
    el.btnCheck.hidden = true;
    el.btnHint.disabled = true;
    el.btnNext.hidden = false;
    el.timeInput.disabled = true;
    el.btnNext.focus();

    playSound("correct");
    celebrate();
    announce(msg);
  }

  function showTryAgainFeedback() {
    let msg;
    if (state.currentActivity === "tell") {
      msg = "🙂 Almost! Look carefully at both hands and try again.";
    } else if (state.currentActivity === "challenge") {
      const q = state.currentQuestion;
      msg =
        q.level === 3 && !state.answerAmPm
          ? "🙂 Almost! Don't forget to pick AM or PM too."
          : "🙂 Almost! Check your math and try again.";
    } else {
      msg = TRYAGAIN_MESSAGES[randInt(0, TRYAGAIN_MESSAGES.length - 1)];
    }
    el.feedbackMessage.textContent = msg;
    el.feedbackMessage.classList.add("is-error");
    playSound("tryagain");
    announce(msg);
  }

  function celebrate() {
    const container = el.celebration;
    container.innerHTML = "";

    const colors = ["#ffc93c", "#ff6f59", "#3dcb6c", "#8b7fd6", "#4fb3ff"];
    const pieces = 22;
    for (let i = 0; i < pieces; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = randInt(2, 98) + "vw";
      piece.style.background = colors[randInt(0, colors.length - 1)];
      piece.style.animationDelay = randInt(0, 200) + "ms";
      piece.style.animationDuration = 1000 + randInt(0, 500) + "ms";
      container.appendChild(piece);
    }

    const mascot = document.createElement("div");
    mascot.className = "mascot-star";
    mascot.textContent = "🌟";
    container.appendChild(mascot);

    setTimeout(() => {
      container.innerHTML = "";
    }, 1600);
  }

  /* ------------------------------------------------------------------ *
   *  HINTS
   * ------------------------------------------------------------------ */

  function minuteHintPhrase(minute) {
    if (minute === 0) return "00 minutes means the long hand points to 12.";
    const pointsTo = minute / 5;
    const isWhole = Number.isInteger(pointsTo);
    if (isWhole) {
      return `${pad2(minute)} minutes means the long hand points to ${pointsTo === 0 ? 12 : pointsTo}.`;
    }
    return `Count by 5s around the clock to find ${pad2(minute)} minutes.`;
  }

  function countBy5sPhrase(minute) {
    const steps = [];
    for (let m = 5; m <= minute; m += 5) steps.push(m);
    if (steps.length === 0) return "Count by 5s: 5, 10, 15...";
    return `Count by 5s: ${steps.join(", ")}.`;
  }

  function buildSetClockHints(hour, minute) {
    const hints = [`💡 ${minuteHintPhrase(minute)}`];
    const nextHour = (hour % 12) + 1;
    if (minute === 0) {
      hints.push(`💡 The short hand should point right at the ${hour}.`);
    } else {
      hints.push(`💡 The short hand should be between ${hour} and ${nextHour}.`);
    }
    if (state.difficultyLevel === 4 && minute % 5 === 0 && minute !== 0) {
      hints.push(`💡 ${countBy5sPhrase(minute)}`);
    }
    return hints;
  }

  function buildTellTimeHints(hour, minute) {
    const hints = ["💡 The short hand tells the hour. The long hand tells the minutes."];
    if (minute === 0) {
      hints.push("💡 The long hand is pointing straight up to 12. That means 00 minutes.");
    } else {
      const pointsTo = minute / 5;
      if (Number.isInteger(pointsTo)) {
        hints.push(`💡 The long hand is pointing to ${pointsTo}. Count by 5s to find the minutes.`);
        hints.push(`💡 ${countBy5sPhrase(minute)} That means ${pad2(minute)} minutes.`);
      } else {
        hints.push(`💡 ${countBy5sPhrase(minute)}`);
      }
    }
    hints.push(`💡 The short hand is near the ${hour}, so the hour is ${hour}.`);
    return hints;
  }

  // Time Challenge Level 1: if the add crosses the next hour, suggest
  // splitting it at the hour boundary (never states the final answer).
  function buildChallengeLevel1Hints(q) {
    const minutesToNextHour = (60 - q.startMinute) % 60;
    const nextHour = (q.startHour % 12) + 1;
    const hints = [];

    if (minutesToNextHour > 0 && q.durationMinutes > minutesToNextHour) {
      const remain = q.durationMinutes - minutesToNextHour;
      hints.push(`💡 First add ${minutesToNextHour} minutes to reach ${nextHour}:00. You still have ${remain} minutes left to add.`);
      hints.push(`💡 Once you reach ${nextHour}:00, count on ${remain} more minutes to land on the answer.`);
    } else {
      hints.push(`💡 Count on ${q.durationMinutes} minutes from ${formatTime(q.startHour, q.startMinute)}, a little at a time.`);
      hints.push(`💡 Try counting on by 5s or 10s from ${formatTime(q.startHour, q.startMinute)} until you've added ${q.durationMinutes} minutes in total.`);
    }
    return hints;
  }

  // Time Challenge Level 2: suggest adding the hour(s) first, then the
  // minutes; a second hint (if needed) reveals that intermediate step.
  function buildChallengeLevel2Hints(q) {
    const hourWord = q.durationHours === 1 ? "hour" : "hours";
    const hints = [
      `💡 Try adding the ${q.durationHours} ${hourWord} first, then add the ${q.durationMins} minutes.`,
    ];
    const afterHourTotal = to12HourTotal(q.startHour, q.startMinute) + q.durationHours * 60;
    const afterHour = from12HourTotal(afterHourTotal);
    hints.push(`💡 After adding the ${hourWord}, you're at ${formatTime(afterHour.hour, afterHour.minute)}. Now add the ${q.durationMins} minutes.`);
    return hints;
  }

  // Time Challenge Level 3: break the story into steps, revealing one
  // more step of the *operation* each time — never the running total or
  // the final answer.
  function buildChallengeLevel3Hints(q) {
    const hints = [];
    const n = q.steps.length;
    for (let i = 0; i < n - 1; i++) {
      if (i === 0) {
        hints.push(`💡 Step 1: Start at ${q.startLabel} and add the first ${q.steps[0].durationLabel} (${q.steps[0].segmentLabel}).`);
      } else {
        hints.push(`💡 Step ${i + 1}: Add the ${q.steps[i].durationLabel} (${q.steps[i].segmentLabel}) to your new time from Step ${i}.`);
      }
    }
    if (hints.length === 0) {
      hints.push(`💡 Add ${q.steps[0].durationLabel} to ${q.startLabel} to find the answer.`);
    }
    return hints;
  }

  function buildChallengeHints(q) {
    if (q.level === 1) return buildChallengeLevel1Hints(q);
    if (q.level === 2) return buildChallengeLevel2Hints(q);
    return buildChallengeLevel3Hints(q);
  }

  function showHint() {
    if (!state.currentQuestion) return;
    const q = state.currentQuestion;
    let hints;
    if (state.currentActivity === "set") {
      hints = buildSetClockHints(q.hour, q.minute);
    } else if (state.currentActivity === "tell") {
      hints = buildTellTimeHints(q.hour, q.minute);
    } else {
      hints = buildChallengeHints(q);
    }

    const idx = Math.min(state.hintsShownForCurrentQuestion, hints.length - 1);
    el.hintMessage.textContent = hints[idx];
    if (state.hintsShownForCurrentQuestion < hints.length - 1) {
      state.hintsShownForCurrentQuestion++;
    }
    state.hintsUsed++;
    announce(hints[idx]);
  }

  /* ------------------------------------------------------------------ *
   *  MINUTE HELPER TOGGLE
   * ------------------------------------------------------------------ */

  function updateMinuteHelperVisibility() {
    const relevant = state.currentActivity === "tell";
    el.btnMinuteHelpers.hidden = !relevant;
    el.clockMinuteHelpers.hidden = !(relevant && state.showMinuteHelpers);
    el.btnMinuteHelpers.textContent = state.showMinuteHelpers
      ? "Hide Minute Helpers"
      : "Show Minute Helpers";
  }

  /* ------------------------------------------------------------------ *
   *  SOUND (optional, gentle, Web Audio — no external files needed)
   * ------------------------------------------------------------------ */

  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!state.soundOn) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const notes = type === "correct" ? [523.25, 659.25, 783.99] : [392, 349.23];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.1;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  /* ------------------------------------------------------------------ *
   *  SCREEN NAVIGATION
   * ------------------------------------------------------------------ */

  function showScreen(name) {
    ["home", "practice", "results"].forEach((s) => {
      const screenEl = el["screen" + s.charAt(0).toUpperCase() + s.slice(1)];
      screenEl.classList.toggle("active-screen", s === name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ------------------------------------------------------------------ *
   *  HOME SCREEN CONTROLS
   * ------------------------------------------------------------------ */

  function setActivity(activity) {
    state.currentActivity = activity;
    el.choiceSet.setAttribute("aria-pressed", String(activity === "set"));
    el.choiceTell.setAttribute("aria-pressed", String(activity === "tell"));
    el.choiceChallenge.setAttribute("aria-pressed", String(activity === "challenge"));
    updateLevelPanelVisibility();
  }

  // Swaps which difficulty-level panel is shown on the home screen:
  // the standard 4-level panel (Set/Tell) or the 3-level Time Challenge
  // panel. Switching back and forth preserves each activity's own level.
  function updateLevelPanelVisibility() {
    const isChallenge = state.currentActivity === "challenge";
    el.setupGroupStandardLevels.hidden = isChallenge;
    el.setupGroupChallengeLevels.hidden = !isChallenge;
  }

  function setLevel(level) {
    state.difficultyLevel = level;
    document.querySelectorAll("#level-group .pill").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(Number(btn.dataset.level) === level));
    });
  }

  function setChallengeLevel(level) {
    state.challengeLevel = level;
    document.querySelectorAll("#level-group-challenge .pill").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(Number(btn.dataset.clevel) === level));
    });
  }

  // Time Challenge Level 3's AM/PM answer selector.
  function resetAmPmAnswer() {
    state.answerAmPm = null;
    document.querySelectorAll("#ampm-toggle .ampm-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", "false");
    });
  }

  function setAnswerAmPm(value) {
    state.answerAmPm = value;
    document.querySelectorAll("#ampm-toggle .ampm-btn").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.ampm === value));
    });
  }

  function setCount(count) {
    state.totalQuestions = count;
    document.querySelectorAll("#count-group .pill").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(Number(btn.dataset.count) === count));
    });
  }

  function toggleSound() {
    state.soundOn = !state.soundOn;
    el.btnSound.setAttribute("aria-pressed", String(state.soundOn));
    el.btnSound.querySelector(".sound-icon").textContent = state.soundOn ? "🔊" : "🔇";
    el.btnSound.querySelector(".sound-text").textContent = state.soundOn ? "Sound On" : "Sound Off";
  }

  /* ------------------------------------------------------------------ *
   *  EVENT WIRING
   * ------------------------------------------------------------------ */

  function initEventListeners() {
    el.choiceSet.addEventListener("click", () => setActivity("set"));
    el.choiceTell.addEventListener("click", () => setActivity("tell"));
    el.choiceChallenge.addEventListener("click", () => setActivity("challenge"));

    document.querySelectorAll("#level-group .pill").forEach((btn) => {
      btn.addEventListener("click", () => setLevel(Number(btn.dataset.level)));
    });
    document.querySelectorAll("#level-group-challenge .pill").forEach((btn) => {
      btn.addEventListener("click", () => setChallengeLevel(Number(btn.dataset.clevel)));
    });
    document.querySelectorAll("#ampm-toggle .ampm-btn").forEach((btn) => {
      btn.addEventListener("click", () => setAnswerAmPm(btn.dataset.ampm));
    });
    document.querySelectorAll("#count-group .pill").forEach((btn) => {
      btn.addEventListener("click", () => setCount(Number(btn.dataset.count)));
    });

    el.btnSound.addEventListener("click", toggleSound);
    el.btnStart.addEventListener("click", startSession);

    el.btnHome.addEventListener("click", () => {
      // Only ask for confirmation if the child is mid-session (has
      // answered at least one question) so there's real progress at risk.
      const hasProgress = state.currentQuestionIndex > 0 || state.attemptsForCurrentQuestion > 0;
      if (hasProgress && !window.confirm("Leave practice and go back to the home screen? Your progress on this session will be lost.")) {
        return;
      }
      endDrag(el.hourGrabber);
      endDrag(el.minuteGrabber);
      resetSession();
      showScreen("home");
    });
    el.btnHome2.addEventListener("click", () => {
      resetSession();
      showScreen("home");
    });

    el.btnCheck.addEventListener("click", checkAnswer);
    el.btnNext.addEventListener("click", nextQuestion);
    el.btnHint.addEventListener("click", showHint);
    el.btnAgain.addEventListener("click", startSession);

    el.tellTimeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      checkAnswer();
    });

    el.btnToggleHelper.addEventListener("click", () => {
      state.showHandHelper = !state.showHandHelper;
      el.handHelper.hidden = !state.showHandHelper;
      el.btnToggleHelper.textContent = state.showHandHelper ? "Hide this" : "Show this";
    });

    el.btnMinuteHelpers.addEventListener("click", () => {
      state.showMinuteHelpers = !state.showMinuteHelpers;
      updateMinuteHelperVisibility();
    });

    initDragHandlers();

    // Escape key is a quick, discoverable way to back out of a session.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.screenPractice.classList.contains("active-screen")) {
        el.btnHome.click();
      }
    });
  }


  
  /* ------------------------------------------------------------------ *
   *  INIT
   * ------------------------------------------------------------------ */

  function init() {
    cacheDom();
    buildClockFace();
    setActivity(state.currentActivity);
    setLevel(state.difficultyLevel);
    setChallengeLevel(state.challengeLevel);
    setCount(state.totalQuestions);
    updateMinuteHelperVisibility();
    setClockTime(12, 0);
    initEventListeners();
  }

  document.addEventListener("DOMContentLoaded", init);
})();



const timeInput = document.getElementById("time-input");

timeInput.addEventListener("input", function () {
    // Keep numbers only
    let digits = this.value.replace(/\D/g, "");

    // Maximum 4 digits: HHMM
    digits = digits.slice(0, 4);

    // Automatically add ":" after 2 digits
    if (digits.length > 2) {
        this.value = digits.slice(0, 2) + ":" + digits.slice(2);
    } else {
        this.value = digits;
    }
});