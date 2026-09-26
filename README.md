# Video 10 — Why You Keep Starting Over

Why We Become explainer episode, produced by the Faceless Video Production Playbook.

**Deliverable:** `final.mp4` (1080p, 30 fps, burned-in captions)

## Layout

| Path | Contents |
| --- | --- |
| `script.md` | Narration script with inline motion cue tags |
| `narration/` | TTS chunks and mastered `voiceover.mp3` |
| `voiceover.json` | Nova-3 word-level timestamps |
| `captions.ass` | Rock-steady editorial captions (Montserrat ExtraBold, gold active word) |
| `sheets/raw/` | 48 generated illustrations |
| `frames/` | 1080p panel masters |
| `remotion/` | Remotion motion-graphics composition |
| `final/` | Final master and audio mix |
| `seo.md` | YouTube description with full source credits |
| `thumbnail.png` | 1280×720 thumbnail |
| `transcript.txt` | Full narration transcript |

## Pipeline

1. Script prep — branded outro auto-injection, cue-tag extraction, phonetic sanitisation
2. Deepgram `flux-cole-en` TTS → 7-stage broadcast vocal mastering (−16 LUFS)
3. Deepgram Nova-3 word-level transcription
4. 48 illustrations generated against the locked stickman reference sheet
5. Remotion motion layer — glass stat/mechanism cards, drafting vector arrows, documentary paper reveals, 3D tilted research documents
6. Audio mix — original ambient score with sidechain ducking plus synced SFX
7. Burned-in captions, 1080p render
8. Visual critic gate

Reproduce with the scripts in `scripts/`.
