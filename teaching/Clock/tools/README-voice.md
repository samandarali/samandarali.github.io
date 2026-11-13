# Tiki's voice clips

Tiki speaks with pre-made audio clips recorded once with Microsoft Azure's
child voice **Ana** (`en-US-AnaNeural`). The game joins clips together for
lines that change (times, numbers), so about 390 short clips cover every
line in Set the Clock, Tell the Time and Time Challenge levels 1–2.
Level 3 word problems are not read aloud (only "Read the story and work out
the time.").

## One-time setup (free)

1. Sign in at <https://portal.azure.com> (a free account is enough).
2. **Create a resource** → search **Speech** → **Create**.
   - Pricing tier: **Free F0**
   - Region: one near you, e.g. *Canada Central* or *East US*
3. Open the new resource → **Keys and Endpoint**. Copy **KEY 1** and the
   **Location/Region** (e.g. `canadacentral`).

Keep the key private: never paste it into a file in this repository.

## Make the clips

In a terminal, from the website folder (PowerShell):

```powershell
$env:AZURE_SPEECH_KEY = "paste-your-key-here"
$env:AZURE_SPEECH_REGION = "canadacentral"
node teaching/Clock/tools/make-voice.mjs
```

It takes about 20 minutes on the free tier (it pauses between clips to stay
under the free limit) and uses well under the free monthly allowance.
Afterwards commit `teaching/Clock/voice/` (clips + `manifest.json`).

## After changing a line

If you change something Tiki says in `script.js` or `tiki.js`, update the
same phrase in `voice-lines.js` and run the command again: only new or
changed phrases are recorded, and old unused clips are removed.

`node teaching/Clock/tools/make-voice.mjs --dry-run` shows how many clips
would be recorded without contacting Azure.

Other voices can be tried with `$env:TIKI_VOICE = "en-US-AnaNeural"` and the
speed with `$env:TIKI_RATE = "-4%"` (delete `voice/clips` to re-record all).
