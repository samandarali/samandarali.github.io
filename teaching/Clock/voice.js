/* ==========================================================================
   TIKI'S VOICE — reads lines aloud with the browser's built-in speech
   (Web Speech API). Free, no files, nothing leaves the device.

   ClockVoice.speak(text)  say a line (stops anything already being said)
   ClockVoice.stop()
   ClockVoice.supported    false on browsers without speech
   ========================================================================== */

(function () {
  "use strict";

  const synth = window.speechSynthesis;
  const supported = !!(synth && window.SpeechSynthesisUtterance);

  // Tiki should sound like a child. "Microsoft Ana" (in Microsoft Edge) is a
  // real child voice; elsewhere a female voice is pitched up so it sounds
  // young. Deep male voices are avoided. pitch: 0-2 (1 = normal).
  const VOICE_PROFILES = [
    { name: "Microsoft Ana", pitch: 1.15, rate: 1.0 },          // real child voice (Edge)
    { name: "Google US English", pitch: 1.6, rate: 1.0 },
    { name: "Samantha", pitch: 1.7, rate: 1.0 },                // macOS / iOS
    { name: "Microsoft Jenny", pitch: 1.6, rate: 1.0 },
    { name: "Microsoft Aria", pitch: 1.6, rate: 1.0 },
    { name: "Google UK English Female", pitch: 1.6, rate: 1.0 },
    { name: "Karen", pitch: 1.7, rate: 1.0 },
    { name: "Microsoft Zira", pitch: 1.85, rate: 1.0 },          // Windows
  ];
  const MALE = /david|mark|guy|ryan|george|james|daniel|fred|alex|tom\b|male/i;
  let voice = null;
  let pitch = 1.8;
  let rate = 1.0;

  function pickVoice() {
    if (!supported) return;
    const voices = synth.getVoices();
    if (!voices.length) return;
    for (const p of VOICE_PROFILES) {
      const v = voices.find((x) => x.name.indexOf(p.name) === 0);
      if (v) { voice = v; pitch = p.pitch; rate = p.rate; return; }
    }
    const english = voices.filter((x) => /^en(-|_|$)/i.test(x.lang));
    voice = english.find((x) => !MALE.test(x.name)) || english[0] || null;
    pitch = 1.8;
    rate = 1.0;
  }
  if (supported) {
    pickVoice();
    synth.addEventListener ? synth.addEventListener("voiceschanged", pickVoice) : (synth.onvoiceschanged = pickVoice);
  }

  /* ---------------- making lines sound natural ---------------- */

  const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty"];

  function numberWords(n) {
    if (n < 20) return ONES[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return TENS[t] + (o ? "-" + ONES[o] : "");
  }

  // 11:00 -> "eleven o'clock", 7:30 -> "seven thirty", 7:05 -> "seven oh five"
  function timeWords(h, m, ampm) {
    const hour = numberWords(h);
    let words;
    if (m === 0) words = hour + " o'clock";
    else if (m < 10) words = hour + " oh " + ONES[m];
    else words = hour + " " + numberWords(m);
    if (ampm) words += ampm.toUpperCase() === "AM" ? " A M" : " P M";
    return words;
  }

  function toSpeech(text) {
    return String(text)
      // emoji and their joiners are not read out
      .replace(/[\p{Extended_Pictographic}️‍]/gu, "")
      // clock times, with optional AM/PM
      .replace(/\b(\d{1,2}):(\d{2})(?:\s*(AM|PM))?\b/gi, (_, h, m, ap) => timeWords(+h, +m, ap))
      // durations used in the stories: "1 h 50 min"
      .replace(/\b(\d+)\s*h\b/g, (_, n) => n + (n === "1" ? " hour" : " hours"))
      .replace(/\b(\d+)\s*min\b/g, (_, n) => n + " minutes")
      .replace(/…/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* ---------------- speaking ---------------- */

  let pending = null;

  function speak(text) {
    if (!supported) return;
    const line = toSpeech(text);
    if (!line) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(line);
    if (voice) u.voice = voice;
    u.lang = voice ? voice.lang : "en-US";
    u.rate = rate;
    u.pitch = pitch; // high and bright: Tiki is a little owl
    u.volume = 1;
    u.onstart = () => window.ClockMusic && window.ClockMusic.duck && window.ClockMusic.duck(true);
    u.onend = u.onerror = () => window.ClockMusic && window.ClockMusic.duck && window.ClockMusic.duck(false);
    // Chrome sometimes ignores speak() right after cancel(); a tiny delay fixes it.
    clearTimeout(pending);
    pending = setTimeout(() => synth.speak(u), 60);
  }

  function stop() {
    if (!supported) return;
    clearTimeout(pending); // a line queued a moment ago must not play after "off"
    synth.cancel();
    if (window.ClockMusic && window.ClockMusic.duck) window.ClockMusic.duck(false);
  }

  window.ClockVoice = { speak, stop, supported, toSpeech };
})();
