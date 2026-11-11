/* ==========================================================================
   TIKI — the little owl who can't read clocks (yet!)
   An original character drawn as inline SVG and animated with CSS classes.

   Moods (set with Tiki.setMood(el, mood)):
     confused  head sways, "?" bubble, wing scratches head   (waiting)
     watching  eyes look up at the clock                        (child dragging)
     oops      little shake, worried brows, sweat drop          (wrong answer)
     hint      wing points up, light bulb                       (giving a hint)
     happy     hops, flaps, happy eyes, open beak               (correct!)
     walking   bobs along on alternating feet                   (going to the activity)
     activity  happy sway at the activity                       (arrived)
     wave      waves hello                                      (home screen)
     proud     dances with sparkles                             (results screen)
   ========================================================================== */

(function () {
  "use strict";

  const MOODS = ["confused", "watching", "oops", "hint", "happy", "walking", "activity", "wave", "proud"];

  let uidCounter = 0;

  // Each Tiki gets its own gradient ids: a url(#id) that points into a
  // hidden screen (display:none) would not paint in Chrome.
  function svg() {
    const u = "tk" + (++uidCounter);
    return `
<svg class="tiki-svg" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${u}-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ab9ff6" />
      <stop offset="1" stop-color="#7b6ce0" />
    </linearGradient>
    <linearGradient id="${u}-wing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7b6ce0" />
      <stop offset="1" stop-color="#5f50c9" />
    </linearGradient>
  </defs>
  <g class="tk-all">
    <ellipse class="tk-shadow" cx="60" cy="134" rx="30" ry="4.5" />
    <g class="tk-feet">
      <ellipse class="tk-foot tk-foot-l" cx="48" cy="127" rx="9" ry="5" />
      <ellipse class="tk-foot tk-foot-r" cx="72" cy="127" rx="9" ry="5" />
    </g>
    <g class="tk-bodygrp">
      <g class="tk-wing tk-wing-l"><path fill="url(#${u}-wing)" d="M26 70 C11 82 12 104 27 113 C31 100 33 86 31 72 Z" /></g>
      <g class="tk-wing tk-wing-r"><path fill="url(#${u}-wing)" d="M94 70 C109 82 108 104 93 113 C89 100 87 86 89 72 Z" /></g>
      <path class="tk-tuft" d="M33 42 L27 17 L49 33 Z" />
      <path class="tk-tuft" d="M87 42 L93 17 L71 33 Z" />
      <path class="tk-body" fill="url(#${u}-body)" d="M60 27 C88 27 100 52 100 82 C100 110 84 126 60 126 C36 126 20 110 20 82 C20 52 32 27 60 27 Z" />
      <path class="tk-belly" d="M60 72 C77 72 85 88 84 104 C82 118 72 122 60 122 C48 122 38 118 36 104 C35 88 43 72 60 72 Z" />
      <path class="tk-feathers" d="M44 94 q4 4 8 0 M56 94 q4 4 8 0 M68 94 q4 4 8 0 M50 104 q4 4 8 0 M62 104 q4 4 8 0 M56 113 q4 4 8 0" />
      <ellipse class="tk-cheek" cx="31" cy="69" rx="6" ry="3.5" />
      <ellipse class="tk-cheek" cx="89" cy="69" rx="6" ry="3.5" />
      <g class="tk-eyes">
        <circle class="tk-eye-white" cx="45" cy="54" r="15" />
        <circle class="tk-eye-white" cx="75" cy="54" r="15" />
        <g class="tk-pupils">
          <circle class="tk-pupil" cx="45" cy="56" r="7.5" />
          <circle class="tk-pupil" cx="75" cy="56" r="7.5" />
          <circle class="tk-glint" cx="47.6" cy="53" r="2.5" />
          <circle class="tk-glint" cx="77.6" cy="53" r="2.5" />
        </g>
      </g>
      <path class="tk-happy-eyes" d="M34 58 q11 -13 22 0 M64 58 q11 -13 22 0" />
      <path class="tk-brows" d="M33 35 L54 39 M87 33 L67 38" />
      <path class="tk-beak" d="M53.5 66 Q60 63.5 66.5 66 Q63 74 60 77 Q57 74 53.5 66 Z" />
      <path class="tk-mouth-open" d="M53 67 Q60 84 67 67 Q60 70 53 67 Z" />
    </g>
    <g class="tk-q">
      <circle cx="104" cy="21" r="13" />
      <text x="104" y="27.5" text-anchor="middle">?</text>
    </g>
    <g class="tk-bulb">
      <circle cx="104" cy="20" r="13" />
      <text x="104" y="25.5" text-anchor="middle">💡</text>
    </g>
    <path class="tk-sweat" d="M99 38 q-6 9 0 12.5 q6 -3.5 0 -12.5 Z" />
    <g class="tk-sparkles">
      <text x="6" y="30">✨</text>
      <text x="98" y="44">✨</text>
      <text x="10" y="96">⭐</text>
    </g>
  </g>
</svg>`;
  }

  function mount(el, mood) {
    if (!el) return;
    el.classList.add("tiki");
    el.innerHTML = svg();
    setMood(el, mood || "confused");
  }

  function setMood(el, mood) {
    if (!el) return;
    MOODS.forEach((m) => el.classList.remove("mood-" + m));
    if (mood) el.classList.add("mood-" + mood);
  }

  /* ------------------------------------------------------------------ *
   *  TIME-OF-DAY SCENES
   *  Where Tiki goes once the child gets the time right. Without AM/PM
   *  (Set / Tell / Challenge 1-2) each hour has one kid-friendly daytime
   *  activity. With AM/PM (Challenge 3) evenings and nights are honoured.
   * ------------------------------------------------------------------ */

  const DAY_SCENES = {
    1: { emoji: "🧩", place: "puzzle time", line: "I love puzzles!" },
    2: { emoji: "🎨", place: "painting time", line: "I'll paint a clock!" },
    3: { emoji: "⚽", place: "time to play ball in the park", line: "Kick, kick, goal!" },
    4: { emoji: "🍎", place: "snack time", line: "Crunchy apple, yum!" },
    5: { emoji: "🚲", place: "bike ride time", line: "Wheee!" },
    6: { emoji: "🍝", place: "dinner time", line: "Spaghetti, my favourite!" },
    7: { emoji: "🥞", place: "breakfast time", line: "Pancakes, yum!" },
    8: { emoji: "🚌", place: "time for the school bus", line: "Beep beep, off to school!" },
    9: { emoji: "📚", place: "story time", line: "Once upon a time…" },
    10: { emoji: "🎵", place: "music time", line: "La la la!" },
    11: { emoji: "🌻", place: "time to water the flowers", line: "Grow, sunflowers, grow!" },
    12: { emoji: "🥪", place: "lunch time", line: "Munch, munch!" },
  };

  function sceneFor(hour, minute, isPM) {
    if (isPM === true) {
      if (hour === 7) return { emoji: "🛁", place: "bath time", line: "Splish splash!" };
      if (hour >= 8 && hour <= 11) return { emoji: "🌙", place: "bedtime", line: "Goodnight, sleep tight!" };
    }
    if (isPM === false) {
      if (hour === 12 || hour <= 5) return { emoji: "😴", place: "sleeping time", line: "Zzz… shh!" };
      if (hour === 6) return { emoji: "☀️", place: "wake-up time", line: "Good morning, sunshine!" };
    }
    return DAY_SCENES[hour] || DAY_SCENES[12];
  }

  /* ------------------------------------------------------------------ *
   *  WHAT TIKI SAYS WHILE WAITING
   * ------------------------------------------------------------------ */

  const WAITING_LINES = {
    set: [
      "Hmm… which way do the hands go? Can you show me {time}?",
      "Oh no, I always mix up the hands! Help me make {time}.",
      "I need to know when it's {time}… can you set the clock?",
    ],
    tell: [
      "What time does the clock say? I'm all mixed up!",
      "Hoo-hoo… I can't read this clock. Can you?",
      "So many numbers! What time is it?",
    ],
    challenge: [
      "Ooh, a time puzzle! I'm stuck — can you work it out?",
      "My head is spinning! What time will it be?",
      "Let's think together… what's the answer?",
    ],
  };

  function waitingLine(activity, time) {
    const pool = WAITING_LINES[activity] || WAITING_LINES.set;
    const line = pool[Math.floor(Math.random() * pool.length)];
    return line.replace("{time}", time || "the time");
  }

  window.Tiki = { svg, mount, setMood, sceneFor, waitingLine };
})();
