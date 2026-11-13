/* ==========================================================================
   TIKI'S LINES — shared by the game (voice.js) and the clip generator
   (tools/make-voice.mjs), so the recorded clips always match the game.

   toSpeech(text)  turns game text into speakable words
                   ("11:00" -> "eleven o'clock", "1 h 20 min" -> "one hour
                   twenty minutes", emoji removed)
   tokens(text)    lower-case words used to match a line against clips
   phrases()       every phrase that gets a recorded clip. Lines that change
                   (times, numbers) are recorded in pieces and joined.

   IMPORTANT: when you change a line in script.js or tiki.js that Tiki says,
   add or update it here too and run the generator again (see
   tools/README-voice.md). Lines with no clip are simply not spoken.
   ========================================================================== */

(function (root) {
  "use strict";

  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function numberWords(n) {
    if (n < 20) return ONES[n];
    if (n < 100) {
      const o = n % 10;
      return TENS[Math.floor(n / 10)] + (o ? "-" + ONES[o] : "");
    }
    return String(n);
  }

  // 11:00 -> "eleven o'clock", 7:30 -> "seven thirty", 7:05 -> "seven oh five"
  function timeWords(h, m, ampm) {
    const hour = numberWords(h);
    let words;
    if (m === 0) words = hour + " o'clock";
    else if (m < 10) words = hour + " oh " + ONES[m];
    else words = hour + " " + numberWords(m);
    if (ampm) words += " " + ampm.toUpperCase();
    return words;
  }

  const PLURALS = { 5: "fives", 10: "tens" };

  function toSpeech(text) {
    return String(text)
      .replace(/[\p{Extended_Pictographic}️‍]/gu, "")
      .replace(/\b(\d{1,2}):(\d{2})(?:\s*(AM|PM))?\b/gi, (_, h, m, ap) => timeWords(+h, +m, ap))
      .replace(/\b(\d+)\s*h\b/g, (_, n) => n + (n === "1" ? " hour" : " hours"))
      .replace(/\b(\d+)\s*min\b/g, (_, n) => n + " minutes")
      .replace(/\b(\d+)s\b/g, (_, n) => PLURALS[+n] || numberWords(+n) + "s")
      .replace(/\b00\b/g, "zero")
      .replace(/\b\d+\b/g, (n) => numberWords(parseInt(n, 10)))
      .replace(/…/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(text) {
    return toSpeech(text)
      .toLowerCase()
      .replace(/[’]/g, "'")
      .replace(/[^a-z0-9'\- ]+/g, " ")
      .split(/\s+/)
      .filter((t) => t && /[a-z0-9]/.test(t));
  }

  /* ---------------- every phrase that gets a clip ---------------- */

  const pad2 = (n) => String(n).padStart(2, "0");

  // keep in sync with tiki.js (scenes) and script.js (messages)
  const SCENES = [
    ["puzzle time", "I love puzzles!"],
    ["painting time", "I'll paint a clock!"],
    ["time to play ball in the park", "Kick, kick, goal!"],
    ["snack time", "Crunchy apple, yum!"],
    ["bike ride time", "Wheee!"],
    ["dinner time", "Spaghetti, my favourite!"],
    ["breakfast time", "Pancakes, yum!"],
    ["time for the school bus", "Beep beep, off to school!"],
    ["story time", "Once upon a time…"],
    ["music time", "La la la!"],
    ["time to water the flowers", "Grow, sunflowers, grow!"],
    ["lunch time", "Munch, munch!"],
    ["bath time", "Splish splash!"],
    ["bedtime", "Goodnight, sleep tight!"],
    ["sleeping time", "Zzz… shh!"],
    ["wake-up time", "Good morning, sunshine!"],
  ];

  function phrases() {
    const list = [];
    const add = (t) => list.push(t);

    // building blocks for times and numbers
    for (let h = 1; h <= 12; h++) for (let m = 0; m < 60; m += 5) add(`${h}:${pad2(m)}`);
    for (let n = 0; n <= 60; n++) add(String(n));
    ["oh", "AM", "PM", "minutes", "minute", "hour", "hours"].forEach(add);

    // waiting lines (tiki.js WAITING_LINES)
    add("Hmm… which way do the hands go? Can you show me");
    add("Oh no, I always mix up the hands! Help me make");
    add("I need to know when it's");
    add("can you set the clock?");
    add("What time does the clock say? I'm all mixed up!");
    add("Hoo-hoo… I can't read this clock. Can you?");
    add("So many numbers! What time is it?");

    // Time Challenge questions
    add("It is");
    [15, 30, 45].forEach((d) => add(`What time will it be after ${d} minutes?`));
    [[1, 20], [1, 40], [2, 15], [2, 30], [2, 40], [2, 50], [3, 15], [3, 25]]
      .forEach(([h, m]) => add(`What time will it be after ${h} h ${m} min?`));
    add("Read the story and work out the time.");

    // wrong answers (script.js)
    [
      "Hmm, that's a different time. Let's look again!",
      "Not quite — that time is far away. Try again!",
      "Look at both hands.",
      "Remember: the short hand shows the hour and the long hand shows the minutes.",
      "Almost! Nudge the long hand just a little.",
      "The short hand is right! Now move the long hand for the minutes.",
      "Almost! The short hand is one number away.",
      "The long hand is right! Now point the short hand at the hour.",
      "Type the time with numbers, like",
      "So close! The time is right — check AM or PM.",
      "Almost! Don't forget to pick AM or PM.",
      "Almost! You're very close — check the minutes again.",
      "The hour is right! Now check the minutes.",
      "The minutes are right! Now check the hour.",
      "Not quite — let's add the time again, step by step.",
    ].forEach(add);

    // correct answers: "<cheer> <time> is <place>!"
    ["Hooray, you got it!", "You did it!", "Fantastic!", "Brilliant!"].forEach(add);
    SCENES.forEach(([place, line]) => {
      add(`is ${place}!`);
      add(`${place.charAt(0).toUpperCase() + place.slice(1)}! ${line}`);
    });

    // other lines
    add("Practice complete! Thank you for helping me. Now I can tell time too!");
    add("Hi, I'm Tiki! I'll read the questions for you.");

    // hints: Set the Clock
    add("00 minutes means the long hand points to 12.");
    for (let k = 1; k <= 11; k++) add(`${pad2(k * 5)} minutes means the long hand points to ${k}.`);
    for (let h = 1; h <= 12; h++) {
      add(`The short hand should point right at the ${h}.`);
      add(`The short hand should be between ${h} and ${(h % 12) + 1}.`);
      add(`The short hand is near the ${h}, so the hour is ${h}.`);
    }
    for (let m = 5; m <= 55; m += 5) {
      const steps = [];
      for (let s = 5; s <= m; s += 5) steps.push(s);
      add(`Count by 5s: ${steps.join(", ")}.`);
      add(`That means ${pad2(m)} minutes.`);
    }

    // hints: Tell the Time
    add("The short hand tells the hour. The long hand tells the minutes.");
    add("The long hand is pointing straight up to 12. That means 00 minutes.");
    for (let k = 1; k <= 11; k++) add(`The long hand is pointing to ${k}. Count by 5s to find the minutes.`);

    // hints: Time Challenge levels 1-2 (joined with numbers and times)
    [
      "First add", "minutes to reach", "You still have", "minutes left to add.",
      "Once you reach", "count on", "more minutes to land on the answer.",
      "Count on", "minutes from", "a little at a time.",
      "Try counting on by 5s or 10s from", "until you've added", "minutes in total.",
      "Try adding the", "hour first, then add the", "hours first, then add the",
      "After adding the hour, you're at", "After adding the hours, you're at", "Now add the",
    ].forEach(add);

    return list;
  }

  // short, stable file name for a phrase
  function clipId(text) {
    const words = tokens(text).join("-").replace(/[^a-z0-9-]/g, "").slice(0, 48);
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return `${words}-${(h >>> 0).toString(36)}`;
  }

  /* ---------------- matching a line to clips ---------------- */

  // entries: [{ t: phrase text, f: clip file }]
  function buildTable(entries) {
    const byFirst = new Map();
    entries.forEach((e) => {
      const tok = tokens(e.t);
      if (!tok.length) return;
      if (!byFirst.has(tok[0])) byFirst.set(tok[0], []);
      byFirst.get(tok[0]).push({ tok, f: e.f });
    });
    byFirst.forEach((arr) => arr.sort((a, b) => b.tok.length - a.tok.length));
    return byFirst;
  }

  // Splits a line into the longest recorded phrases, left to right.
  // Returns the clip files and any words that have no clip.
  function plan(text, table) {
    const words = tokens(text);
    const files = [];
    const missing = [];
    let i = 0;
    while (i < words.length) {
      const options = table.get(words[i]) || [];
      const hit = options.find((o) => o.tok.every((w, k) => words[i + k] === w));
      if (hit) {
        files.push(hit.f);
        i += hit.tok.length;
      } else {
        missing.push(words[i]);
        i++;
      }
    }
    return { files, missing };
  }

  root.ClockVoiceLines = { toSpeech, tokens, phrases, clipId, timeWords, numberWords, buildTable, plan };
})(typeof window !== "undefined" ? window : globalThis);
