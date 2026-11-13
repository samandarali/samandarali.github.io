/* ==========================================================================
   TIKI'S VOICE — plays pre-made child-voice clips (voice/clips/*.mp3).
   Lines that change (times, numbers) are joined from several clips; the
   silence around each clip is trimmed so the joins sound natural.
   Clips are made once with tools/make-voice.mjs (see tools/README-voice.md).
   Until the clips exist the voice controls stay hidden.

   ClockVoice.speak(text)    say a line (stops anything already playing)
   ClockVoice.stop()
   ClockVoice.whenReady(fn)  runs fn once the clips are available
   ========================================================================== */

(function () {
  "use strict";

  const L = window.ClockVoiceLines;
  const BASE = "voice/";
  const WORD_GAP = 0.04;      // seconds between joined pieces of one sentence
  const SENTENCE_GAP = 0.28;  // seconds after a full sentence
  const VOLUME = 1.0;

  let table = null;
  const endsSentence = new Map();
  let ready = false;
  const readyCallbacks = [];

  if (L && window.fetch) {
    fetch(BASE + "manifest.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (!m || !Array.isArray(m.clips) || !m.clips.length) return;
        table = L.buildTable(m.clips);
        m.clips.forEach((c) => endsSentence.set(c.f, /[.!?…]\s*$/.test(c.t)));
        ready = true;
        readyCallbacks.splice(0).forEach((fn) => fn());
      })
      .catch(() => { /* no clips yet: voice stays off */ });
  }

  function whenReady(fn) {
    if (ready) fn();
    else readyCallbacks.push(fn);
  }

  /* ---------------- audio ---------------- */

  let ctx = null;
  let out = null;
  const buffers = new Map(); // file -> Promise<AudioBuffer>

  function audio() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = VOLUME;
    out.connect(ctx.destination);
    return ctx;
  }

  // cut the quiet start and end of a clip (keeps a few ms so it isn't clipped)
  function trim(buf) {
    const data = buf.getChannelData(0);
    const threshold = 0.012;
    let start = 0;
    let end = data.length - 1;
    while (start < end && Math.abs(data[start]) < threshold) start++;
    while (end > start && Math.abs(data[end]) < threshold) end--;
    const pad = Math.floor(buf.sampleRate * 0.03);
    start = Math.max(0, start - pad);
    end = Math.min(data.length - 1, end + pad);
    const out2 = ctx.createBuffer(1, end - start + 1, buf.sampleRate);
    out2.copyToChannel(data.subarray(start, end + 1), 0);
    return out2;
  }

  function load(file) {
    if (!buffers.has(file)) {
      buffers.set(
        file,
        fetch(BASE + "clips/" + file)
          .then((r) => r.arrayBuffer())
          .then((ab) => new Promise((ok, fail) => ctx.decodeAudioData(ab, ok, fail)))
          .then(trim)
      );
    }
    return buffers.get(file);
  }

  /* ---------------- speaking ---------------- */

  let playId = 0;
  let sources = [];
  let duckTimer = null;

  function duck(on) {
    if (window.ClockMusic && window.ClockMusic.duck) window.ClockMusic.duck(on);
  }

  function stopSources() {
    sources.forEach((s) => { try { s.stop(); } catch (e) { /* already stopped */ } });
    sources = [];
    clearTimeout(duckTimer);
  }

  async function speak(text) {
    if (!ready || !audio()) return;
    const p = L.plan(text, table);
    if (!p.files.length) return;
    if (p.missing.length) {
      // no clip for part of this line: stay quiet rather than say half of it
      console.debug("[Tiki voice] no clip for:", p.missing.join(" "), "|", text);
      return;
    }
    const id = ++playId;
    stopSources();
    if (ctx.state === "suspended") ctx.resume();

    let bufs;
    try {
      bufs = await Promise.all(p.files.map(load));
    } catch (e) {
      console.debug("[Tiki voice] could not load clips", e);
      return;
    }
    if (id !== playId) return; // something newer started meanwhile

    let t = ctx.currentTime + 0.05;
    bufs.forEach((buf, i) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(out);
      src.start(t);
      sources.push(src);
      t += buf.duration + (endsSentence.get(p.files[i]) ? SENTENCE_GAP : WORD_GAP);
    });
    duck(true);
    duckTimer = setTimeout(() => {
      if (id === playId) duck(false);
    }, (t - ctx.currentTime) * 1000);
  }

  function stop() {
    playId++;
    stopSources();
    duck(false);
  }

  window.ClockVoice = {
    speak,
    stop,
    whenReady,
    get supported() { return ready; },
    toSpeech: L ? L.toSpeech : (s) => s,
  };
})();
