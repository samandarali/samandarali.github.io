/* ==========================================================================
   BACKGROUND MUSIC — an original, gentle music-box tune made with Web Audio.
   No audio files are downloaded: every note is synthesised in the browser.

   ClockMusic.start()  fade in and loop (call from a click: browsers only
                       allow audio after the user interacts with the page)
   ClockMusic.stop()   fade out
   ClockMusic.isPlaying()
   ========================================================================== */

(function () {
  "use strict";

  const BPM = 96;
  const EIGHTH = 60 / BPM / 2;      // seconds per eighth note
  const VOLUME = 0.07;              // kept low so it sits under the game

  // 8 bars of 8 eighth notes (MIDI note numbers, null = rest).
  // Chords: C | Am | F | G | C | Am | F | G-C
  const MELODY = [
    [76, 79, 84, 79, 76, 79, 74, null],
    [72, 76, 81, 76, 72, null, 74, 76],
    [77, 76, 74, 72, 69, 72, 74, null],
    [74, 79, 83, 79, 74, null, 71, null],
    [76, 74, 72, 74, 76, 79, 76, null],
    [81, 79, 76, 79, 81, null, 84, null],
    [77, 81, 84, 81, 77, 76, 74, null],
    [74, 76, 74, 71, 72, null, null, null],
  ];
  // bass: chord root on beat 1, fifth on beat 3
  const BASS = [
    [48, 55], [45, 52], [41, 48], [43, 50],
    [48, 55], [45, 52], [41, 48], [43, 48],
  ];

  let ctx = null;
  let master = null;
  let timer = null;
  let playing = false;
  let step = 0;            // eighth-note index across the whole tune
  let nextTime = 0;        // audio-clock time of the next eighth note

  function freq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function ensureContext() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3200;

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(lowpass);
    lowpass.connect(ctx.destination);
    return ctx;
  }

  // music-box pluck: a sine plus a soft octave, quick attack, long decay
  function bell(midi, time) {
    const f = freq(midi);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, time);
    out.gain.exponentialRampToValueAtTime(0.9, time + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0001, time + 1.1);
    out.connect(master);

    [[f, 1], [f * 2, 0.18], [f * 3, 0.05]].forEach(([hz, level]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = hz;
      g.gain.value = level;
      osc.connect(g);
      g.connect(out);
      osc.start(time);
      osc.stop(time + 1.15);
    });
  }

  // soft round bass note
  function bass(midi, time) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq(midi);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.55, time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + EIGHTH * 3.6);
    osc.connect(g);
    g.connect(master);
    osc.start(time);
    osc.stop(time + EIGHTH * 3.8);
  }

  function scheduleStep(s, time) {
    const bar = Math.floor(s / 8) % MELODY.length;
    const pos = s % 8;
    const note = MELODY[bar][pos];
    if (note !== null) bell(note, time);
    if (pos === 0) bass(BASS[bar][0], time);
    if (pos === 4) bass(BASS[bar][1], time);
  }

  // look-ahead scheduler: keeps notes perfectly in time even if the page
  // is busy, by queueing them a little ahead on the audio clock
  function tick() {
    while (nextTime < ctx.currentTime + 0.15) {
      scheduleStep(step, nextTime);
      step = (step + 1) % (MELODY.length * 8);
      nextTime += EIGHTH;
    }
  }

  function start() {
    if (!ensureContext()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (playing) return;
    playing = true;
    step = 0;
    nextTime = ctx.currentTime + 0.08;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(VOLUME, now + 1.2);
    tick();
    timer = setInterval(tick, 40);
  }

  function stop() {
    if (!ctx || !playing) return;
    playing = false;
    clearInterval(timer);
    timer = null;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.5);
  }

  // pause quietly while the tab is in the background
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (playing) ctx.resume();
  });

  window.ClockMusic = { start, stop, isPlaying: () => playing };
})();
