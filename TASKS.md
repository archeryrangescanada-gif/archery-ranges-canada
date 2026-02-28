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

### [ ] Create cowork_tasks Supabase Table
*Added by Cowork — required for Ralph↔Cowork↔Antigravity task pipeline*

Run the SQL migration to create the `cowork_tasks` table which enables the full agent communication loop:

- File: `scripts/create_cowork_tasks_table.sql`
- Run it in the Supabase SQL Editor (same process as `create_telegram_messages_table.sql`)
- This table is how Ralph queues tasks for Cowork, and how Antigravity can request research/data work from Cowork

**What the table enables:**
- Josh messages Ralph on Telegram → Ralph detects it needs real work → queues a `cowork_tasks` row → Cowork picks it up, executes it, replies to Telegram
- Antigravity can also insert rows into `cowork_tasks` when it needs research or data from Cowork
- Cowork polls this table every 2 minutes via a scheduled task on Josh's laptop

Once you've run the SQL, mark this **[x]** and commit.

---

### [x] Update Contact Form Logic
*Completed by Antigravity — all code items done (2–5). Item 6 is non-code, leaving to Josh.*

### [x] Regenerate Alberta SEO CSV
*Completed by Antigravity — verified both `alberta_archery_ranges_corrected.csv` and `alberta_archery_ranges_seo.csv` exist with 37 ranges each, all with enhanced SEO descriptions.*

---

## 🔵 Queued — Ready to Build

### [x] Import Saskatchewan Archery Range Listings
*Completed by Antigravity — all 29 Saskatchewan ranges imported to Supabase. Script: `scripts/deploy-saskatchewan-ranges.js`*

The file `saskatchewan_ranges.csv` in the project root contains **29 Saskatchewan archery ranges** and is verified and ready to import as live listings on archeryrangescanada.ca.

**Corrections applied by Cowork audit:**
- Thunderhead Archers: address corrected (302-1st St W, Delisle SK S0L 0P0, phone 306-493-7738)
- No.1 Archery & Sports: city corrected to Regina (was "Sherwood No. 159"), added postal S4N 2G6
- Antler River Archery Club: removed wrong website, added correct phone (306-449-2227) and email (kmartel@sasktel.net)
- Moose Creek Archers: added address (415 Wylie Avenue, Oxbow SK S0C 2B0) and phone (306-483-7218)
- Viscount Archery Club: added Community Center address, postal S0K 4M0, phone (306-944-2079)
- Lloydminster & Area Archers: updated contact to David Charbonneau (306-307-3349, decharbonn@icloud.com)
- Broken Arrow Archery Club: corrected location to 19km west of Yorkton on Yellowhead Hwy, added official website

**What to do:**
- [ ] Import all 29 rows from `saskatchewan_ranges.csv` as listings in the database (same process used for Alberta/BC)
- [ ] Verify listings appear correctly on the site under Saskatchewan
- [ ] Commit and update this task to [x] when done

---

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
- **[x] Regenerate Alberta SEO CSV** — verified both CSVs exist with 37 ranges each, all with enhanced SEO descriptions
- **[x] Scrape Saskatchewan Archery Ranges** — 29 ranges found via crawl4ai + SAA directory, exported to `saskatchewan_ranges.csv`
- **[x] Audit Saskatchewan CSV** — Two-pass audit by Cowork complete. 7 corrections applied. `saskatchewan_ranges.csv` in root is verified and ready to import.
- **[x] Import Saskatchewan Archery Range Listings** — 29 ranges deployed to Supabase via `scripts/deploy-saskatchewan-ranges.js`

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

## 🔵 Queued — Ready to Build

### [x] Scrape Saskatchewan Archery Ranges (crawl4ai)
*Completed by Antigravity — 29 ranges found and exported to `saskatchewan_ranges.csv`. Crawled 12 club websites via crawl4ai; remaining clubs populated from SAA 2025 directory.*

Use **crawl4ai** to scan for all archery ranges in Saskatchewan, Canada, and export results as a CSV file named `saskatchewan_ranges.csv` in the project root.

**Sources to crawl:**
- Archery Canada range finder / directory
- Saskatchewan Archery Association website
- Google Maps / local business listings
- Club websites, Facebook pages, and any other discoverable sources

**Fields to extract** (use these exact column headers in the CSV):

| Field | Description |
|---|---|
| `post_title` | Name of the range / club |
| `post_author` | Contact person or club administrator name (if available) |
| `post_category` | Category (e.g. Archery Range, Archery Club) |
| `F174` | Leave blank |
| `post_address` | Street address |
| `post_city` | City or town |
| `post_region` | Province — Saskatchewan / SK |
| `post_country` | Canada |
| `post_zip` | Postal code |
| `post_latitude` | GPS latitude |
| `post_longitude` | GPS longitude |
| `phone` | Primary phone number |
| `email` | Contact email address |
| `website` | Official website URL |
| `post_content` | Description of the range / club (2–5 sentences if available) |
| `post_tags` | Relevant tags (e.g. outdoor, indoor, 3D, field, competitive) |
| `business_hours` | Operating hours (all days if available) |
| `post_images` | URL(s) to any available images of the range |
| `range_length_yards` | Maximum shooting distance in yards |
| `number_of_lanes` | Total number of shooting lanes |
| `facility_type` | Indoor / Outdoor / Both |
| `has_pro_shop` | Yes / No |
| `has_3d_course` | Yes / No |
| `has_field_course` | Yes / No |
| `membership_required` | Yes / No |
| `membership_price_adult` | Annual adult membership price (e.g. $75/year) |
| `drop_in_price` | Drop-in / day use fee if applicable |
| `equipment_rental_available` | Yes / No |
| `lessons_available` | Yes / No |
| `lesson_price_range` | Price range for lessons (e.g. $20–$50) |
| `bow_types_allowed` | e.g. Recurve, Compound, Longbow, Crossbow |
| `accessibility` | Notes on accessibility (wheelchair access, etc.) |
| `parking_available` | Yes / No |

**Rules:**
- Saskatchewan only — do not include ranges from other provinces
- Do not fabricate or estimate any data — only include what is confirmed from the source
- If a club has multiple locations, create a separate row for each location
- Leave fields blank if the information cannot be confirmed
- Output: `saskatchewan_ranges.csv` (UTF-8 encoded, one row per range)

Once complete, mark this task **[x]** and note how many ranges were found. Cowork will audit the CSV before any listings are created.

---
