# Archery Ranges Canada — Task Board

> This file is the shared communication layer between Cowork (Josh's AI assistant) and Antigravity agents.
> Cowork writes tasks here. Antigravity picks them up, builds them, and marks them done.
> Update the status checkboxes as you go so both sides stay in sync.

---

## How This Works

- **[ ]** = Not started
- **[~]** = In progress (claim it by changing to this + add your agent name)
- **[x]** = Done — mark complete and add a short note on what you did

---

## 🟡 In Progress

### [x] Update Contact Form Logic
*Completed by Antigravity — all code items done (2–5). Item 6 is non-code, leaving to Josh.*

### [~] Regenerate Alberta SEO CSV
*Picked up by Antigravity — files were deleted and need to be regenerated*

- The following Alberta CSV files are restored in the project root and ready to use:
  - `alberta_archery_ranges_corrected.csv`
  - `alberta_archery_ranges_seo.csv`
- Regenerate and commit the final `alberta_archery_ranges_seo.csv` from the corrected source data

---

## 🔵 Queued — Ready to Build

### [x] Fix Telegram Webhook 307 Redirect Error
*Fixed by Cowork + committed by Antigravity — excluded `/api/telegram/webhook` from middleware matcher (commit `672780b`)*

### [x] Build Telegram Webhook Endpoint
*Completed by Antigravity — webhook API route live, SQL migration script ready*

- [x] Create `src/app/api/telegram/webhook/route.ts`
- [x] Create `scripts/create_telegram_messages_table.sql` (Supabase migration)
- [x] Update `.env.local` with Telegram vars
- [x] Create `VERCEL_ENV_SETUP.md`
- [x] **Josh to do:** Run SQL migration in Supabase SQL Editor
- [x] **Josh to do:** Add `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` to Vercel dashboard
- [x] **Josh to do:** Register webhook URL (see `VERCEL_ENV_SETUP.md` for curl command)
- [x] **Josh to do:** Regenerate bot token via @BotFather (token was in git history via TASKS.md)

---

---

## ✅ Completed

- **[x] Update Contact Form Logic** — all code items done (2–5). Non-code item 6 left to Josh.
- **[x] Fix Telegram Webhook 307 Redirect** — excluded `/api/telegram/webhook` from middleware matcher (`672780b`)
- **[x] Build Telegram Webhook Endpoint** — webhook route live, SQL migration, VERCEL_ENV_SETUP.md, env vars, webhook registered
- **[x] Wire Telegram Webhook — Cron Flush + force-dynamic** — `vercel.json` cron job created, `force-dynamic` added to route
- **[x] Fix Telegram Webhook RLS Error (42501)** — switched to service role Supabase client in webhook route (`c2f5d80`)
- **[x] Update Cron Schedule** — changed flush cron from every minute to daily at 8am UTC (`c97fa1d`)

---

## 📋 Notes for Antigravity

- The root directory was cleaned up by Cowork. All one-off scripts, SQL files, and old docs are in `_archive/` — do not delete that folder, but feel free to ignore it.
- Core app code is in `src/`. Config files (`next.config.js`, `package.json`, etc.) are in root.
- Do not generate one-off fix scripts in the root. If a fix is needed, make it directly in `src/` or use the `scripts/` folder.
- Keep commits clean and descriptive. Vercel auto-deploys on push to `main`.
- **Always update TASKS.md** when completing any work, even small fixes. Commit TASKS.md alongside the code change.
- If you need Cowork to do something (e.g. generate a doc, restructure files, analyze data), leave a note in the **"Requests for Cowork"** section below.

---

## 💬 Requests for Cowork

*(Antigravity leaves requests here for Josh's Cowork assistant)*

---
