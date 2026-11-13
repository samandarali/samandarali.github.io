// ==========================================================================
// Makes Tiki's voice clips with Microsoft Azure Speech (child voice "Ana").
//
//   Run from the website folder (see README-voice.md for the full steps):
//     node teaching/Clock/tools/make-voice.mjs
//
// Needs two environment variables, set in YOUR terminal only:
//   AZURE_SPEECH_KEY     your Speech resource key  (never commit it)
//   AZURE_SPEECH_REGION  e.g. eastus, canadacentral
//
// Only clips that don't exist yet are created, so running it again after
// adding a line only records the new line. Writes:
//   teaching/Clock/voice/clips/<id>.mp3
//   teaching/Clock/voice/manifest.json   (which text each clip says)
// ==========================================================================

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const clockDir = path.resolve(here, "..");
const clipsDir = path.join(clockDir, "voice", "clips");
const manifestPath = path.join(clockDir, "voice", "manifest.json");

globalThis.window = globalThis;
createRequire(import.meta.url)(path.join(clockDir, "voice-lines.js"));
const V = globalThis.ClockVoiceLines;

const VOICE = process.env.TIKI_VOICE || "en-US-AnaNeural"; // child voice
const RATE = process.env.TIKI_RATE || "-4%";
const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;
const DRY = process.argv.includes("--dry-run");

// Free tier (F0) allows 20 requests per minute: wait a little between clips.
const GAP_MS = Number(process.env.TIKI_GAP_MS || 3200);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function ssml(text) {
  // speak the friendly form: "11:00" -> "eleven o'clock", emoji removed
  const spoken = V.toSpeech(text);
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">` +
    `<voice name="${VOICE}"><prosody rate="${RATE}">${esc(spoken)}</prosody></voice></speak>`;
}

async function synth(text, file) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "clock-practice-voice",
      },
      body: ssml(text),
    });
    if (res.ok) {
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      return;
    }
    if (res.status === 429 || res.status >= 500) {
      const wait = 15000 * attempt;
      console.log(`  busy (${res.status}), waiting ${wait / 1000}s…`);
      await sleep(wait);
      continue;
    }
    throw new Error(`Azure said ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  throw new Error("Azure kept refusing; try again later.");
}

const phrases = [...new Set(V.phrases())];
fs.mkdirSync(clipsDir, { recursive: true });
const todo = phrases.filter((t) => !fs.existsSync(path.join(clipsDir, V.clipId(t) + ".mp3")));

console.log(`${phrases.length} phrases, ${phrases.length - todo.length} already recorded, ${todo.length} to record.`);
if (todo.length && !DRY) {
  if (!KEY || !REGION) {
    console.error("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION first (see README-voice.md).");
    process.exit(1);
  }
  console.log(`Voice ${VOICE}. About ${Math.ceil((todo.length * GAP_MS) / 60000)} minutes on the free tier.`);
  for (let i = 0; i < todo.length; i++) {
    const t = todo[i];
    process.stdout.write(`[${i + 1}/${todo.length}] ${V.toSpeech(t)}\n`);
    await synth(t, path.join(clipsDir, V.clipId(t) + ".mp3"));
    if (i < todo.length - 1) await sleep(GAP_MS);
  }
}

// manifest: only phrases that have a clip
const manifest = phrases
  .filter((t) => fs.existsSync(path.join(clipsDir, V.clipId(t) + ".mp3")))
  .map((t) => ({ t, f: V.clipId(t) + ".mp3" }));
fs.writeFileSync(manifestPath, JSON.stringify({ voice: VOICE, clips: manifest }, null, 0) + "\n");

// tidy: remove clips for phrases that no longer exist
const keep = new Set(manifest.map((m) => m.f));
for (const f of fs.readdirSync(clipsDir)) {
  if (f.endsWith(".mp3") && !keep.has(f)) fs.unlinkSync(path.join(clipsDir, f));
}
console.log(`Done. ${manifest.length} clips listed in voice/manifest.json.`);
