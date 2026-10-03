[🇧🇷 Português](README.pt-BR.md)

# 🥊 AI Coach — training that fits your life

[![tests](https://github.com/lucasgabrieldevgg/coach/actions/workflows/ci.yml/badge.svg)](https://github.com/lucasgabrieldevgg/coach/actions/workflows/ci.yml)
![suite](https://img.shields.io/badge/suite-118%20checks-brightgreen)

A coach **100% focused on training**: asks how your week really looks, builds the circuit around the equipment you have, alternates effort and rest, and ramps the load at the right pace — no drama, no guilt. (Inspired by a real training conversation that worked; no personal data, just the method and the vibe.)

## 🌐 Try it now
**https://lucasgabrieldevgg.github.io/coach/** — opens right in the browser, no account: your data stays on your device.

## How it works
1. **Homepage → 8 CLASSIC QUESTIONS → chat**: "Start: 8 quick questions" opens the usual screen (QUESTION 1 OF 8). Done? The app **drops you straight into the 💬** with everything unlocked: the coach announces the plan by your name and **keeps asking in the chat** (sleep, schedule — to calibrate). On 🗺️, every exercise has a YouTube link in its name.

2. **📅 Today**: the day's workout with **A/B circuits** (exercise by exercise, reps for your level plus form cues), interval cardio with the **sentence test**, and a log of **how the workout felt** (😌 easy / 😅 just right / 🥵 heavy)
3. **🗺️ Plan**: the week organized around your available days, house rules, a **21-day cycle** and load in **4 steps** (progressive overload): 2 light workouts in a row → the coach suggests going up · 3 heavy → suggests going down
4. **🔁 Phase renewal**: when a cycle closes, you choose **how many weeks to settle into** the new training (2/3/4) — the coach adjusts the load based on your balance, **varies the schedule** (flips A/B, new cardio) and the Today and Plan tabs update instantly
5. **💬 Coach**: a training-specialist AI (free queue) that knows your plan, your cycle and your last workouts — and **asks about your life** (sleep, food, energy) to adapt; pin what it must remember with **📌** (lives in ⚙️ Settings → What the coach remembers). **It also BUILDS the plan by chatting**: tell it your context (or click the examples) and it delivers a plan ready to apply on the 🗺️ tab — and creates/edits **timers** through the chat
6. **⏱️ Timers**: Google-style clock with presets (rests, plank, cardio) + **custom timers** — with **edit ✏️** and **delete 🗑**; every timer starts with **5 extra seconds of prep** (on-screen warning, beeps when it starts and ends); the chat AI creates and tunes your timers
7. **❓ how do I do it? + linked workouts**: every exercise of the day has the button — the coach explains form in 2-3 sentences. And in ANY coach message, exercise names become **blue links** that open YouTube with the search pre-typed (no invented links)
8. **📈 Progress**: 7/30-day adherence, 🔥 streak, how workouts felt, cycle phase

## Care that comes built-in
- **Physical limitation becomes an adjustment, not an excuse**: knee → jumping jacks become marching in place, lunge with shorter range; back → substitutions that protect the lower spine
- **Minor or adult**: balance is the rule — NEVER restrictive diets, aggressive deficits, supplements or magic weight goals; sleep, water, real food
- **Coach with a clock**: knows the date, weekday, time and your timezone (no more "I don't know what day it is") — and when the plan closes it PRESENTS the week in the conversation
- **Coach that listens**: repeats its understanding when you mention days/times, accepts corrections right away (and never repeats the mistake), never asks the same thing twice and is FORBIDDEN from becoming a diet quiz (macros/calories)
- Acute pain = stop; persistent pain = see a health professional. Form before reps.
- Works offline (plan, check-in, load, timers and progress are local); the AI honestly tells you when the queue is full
- Test suite: `npm test` (118 checks — homepage→questions→chat, unlock-all, YouTube links, timers and "how do I do it?")

Made by [lucasgabrieldevgg](https://github.com/lucasgabrieldevgg) 💚

## Running it
It's a single file: download `index.html` and open in the browser (or serve it with any static server). Works offline once loaded.

## Testing it
```bash
npm ci
npm test   # suite with 118 behavior checks (jsdom)
```
Tests run automatically on push via GitHub Actions (badge up top).

## Stack
- Single-file vanilla HTML/CSS/JS — no build, no framework, no backend
- Everything local on the device (localStorage): plan, check-ins, timers and progress
- AI via a free queue (own proxy + fallbacks) — no keys in the client
- jsdom behavior suite + CI on GitHub Actions
- Published on GitHub Pages

## License
MIT — see [LICENSE](LICENSE).
