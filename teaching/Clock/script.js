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

  /* ------------------------------------------------------------------ *
   *  STATE
   * ------------------------------------------------------------------ */

  const state = {
    currentActivity: "set",       // 'set' | 'tell'
    difficultyLevel: 1,           // 1-4
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
      "choice-set", "choice-tell", "level-group", "count-group",
      "btn-start", "btn-sound",
      "btn-home", "question-counter", "score-display",
      "progress-bar-track", "progress-bar-fill", "practice-instruction",
      "clock-face", "clock-ticks", "clock-numbers", "clock-minute-helpers",
      "hour-hand", "minute-hand", "hour-grabber", "minute-grabber",
      "hand-helper", "btn-toggle-helper", "btn-minute-helpers",
      "answer-card", "tell-time-form", "time-input",
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

  // Snap a raw minute angle to the nearest allowed minute value for the
  // current difficulty level (so young children don't need pixel-perfect
  // accuracy), using circular (wrap-around) nearest-neighbor matching.
  function snapMinute(rawMinute) {
    const allowed = LEVEL_MINUTES[state.difficultyLevel];
    let best = allowed[0];
    let bestDiff = Infinity;
    allowed.forEach((m) => {
      const diff = circularDiff(m * 6, rawMinute * 6);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = m;
      }
    });
    return best;
  }

  function handleHandDrag(clientX, clientY) {
    if (!state.activeHand || !state.clockRect) return;
    const angle = angleFromCenter(clientX, clientY, state.clockRect);

    if (state.activeHand === "minute") {
      const rawMinute = angle / 6; // 0-60
      state.handMinute = snapMinute(Math.round(rawMinute) % 60);
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
      const allowed = LEVEL_MINUTES[state.difficultyLevel];
      const idx = allowed.indexOf(state.handMinute);
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        state.handMinute = allowed[(idx + 1 + allowed.length) % allowed.length];
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        state.handMinute = allowed[(idx - 1 + allowed.length) % allowed.length];
      } else {
        handled = false;
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
   *  SESSION FLOW
   * ------------------------------------------------------------------ */

  function startSession() {
    state.questions = generateQuestionSet(state.totalQuestions, state.difficultyLevel);
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
  }

  function setupPracticeUiForActivity() {
    const isSet = state.currentActivity === "set";
    // The answer card (label + input) is a single visual unit for Activity 2.
    // Toggling the wrapper — not just the inner <form> — guarantees the
    // whole card (including its heading and example text) appears or
    // disappears together, with no leftover empty box in Activity 1.
    el.answerCard.hidden = isSet;
    el.handHelper.hidden = !isSet || !state.showHandHelper;
    el.btnMinuteHelpers.hidden = isSet; // minute helpers only meaningful in tell-the-time reading
    el.clockFace.classList.toggle("interactive", isSet);
    el.screenPractice.classList.toggle("activity-set", isSet);
    el.screenPractice.classList.toggle("activity-tell", !isSet);
  }

  function generateQuestion() {
    state.currentQuestion = state.questions[state.currentQuestionIndex];
    state.attemptsForCurrentQuestion = 0;
    state.hintsShownForCurrentQuestion = 0;
    state.answeredCorrectly = false;

    el.feedbackMessage.textContent = "";
    el.feedbackMessage.classList.remove("is-error");
    el.hintMessage.textContent = "";
    el.btnNext.hidden = true;
    el.btnCheck.hidden = false;
    el.btnCheck.disabled = false;
    el.btnHint.disabled = false;
    el.timeInput.value = "";
    el.timeInput.disabled = false;

    const { hour, minute } = state.currentQuestion;

    if (state.currentActivity === "set") {
      el.practiceInstruction.textContent = `Show ${formatTime(hour, minute)} on the clock.`;
      // Start the hands somewhere clearly different from the target so
      // the child has to actually move them.
      let startHour = randInt(1, 12);
      let startMinute = LEVEL_MINUTES[state.difficultyLevel][0];
      if (startHour === hour && startMinute === minute) {
        startHour = ((hour + 5) % 12) + 1;
      }
      setClockTime(startHour, startMinute);
    } else {
      el.practiceInstruction.textContent = "What time is it?";
      setClockTime(hour, minute);
      setTimeout(() => el.timeInput.focus(), 50);
    }

    updateMinuteHelperVisibility();
    updateProgress();
    updateScore();
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

    el.resultsStars.textContent = stars;
    el.resultsSummary.textContent = `You completed ${state.totalQuestions} clock question${state.totalQuestions === 1 ? "" : "s"}!`;
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

    const correct =
      state.currentActivity === "set" ? checkHandPosition() : checkTypedTime();

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

  /* ------------------------------------------------------------------ *
   *  FEEDBACK
   * ------------------------------------------------------------------ */

  const CORRECT_MESSAGES = ["🎉 Hooray! You got it!", "⭐ Great job!", "🎉 Fantastic!"];
  const TRYAGAIN_MESSAGES = ["🙂 Almost! Try again.", "😕 Almost! Look at the clock again."];

  function showCorrectFeedback() {
    const { hour, minute } = state.currentQuestion;
    const msg =
      state.currentActivity === "tell"
        ? `🎉 Great job! ${formatTime(hour, minute)} is correct!`
        : CORRECT_MESSAGES[randInt(0, CORRECT_MESSAGES.length - 1)];

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
    const msg =
      state.currentActivity === "tell"
        ? "🙂 Almost! Look carefully at both hands and try again."
        : TRYAGAIN_MESSAGES[randInt(0, TRYAGAIN_MESSAGES.length - 1)];
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

  function showHint() {
    if (!state.currentQuestion) return;
    const { hour, minute } = state.currentQuestion;
    const hints =
      state.currentActivity === "set"
        ? buildSetClockHints(hour, minute)
        : buildTellTimeHints(hour, minute);

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
  }

  function setLevel(level) {
    state.difficultyLevel = level;
    document.querySelectorAll("#level-group .pill").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(Number(btn.dataset.level) === level));
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

    document.querySelectorAll("#level-group .pill").forEach((btn) => {
      btn.addEventListener("click", () => setLevel(Number(btn.dataset.level)));
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
    setCount(state.totalQuestions);
    updateMinuteHelperVisibility();
    setClockTime(12, 0);
    initEventListeners();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
