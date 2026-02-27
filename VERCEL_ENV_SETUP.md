# Vercel Environment Variables Setup

This document lists all environment variables that must be configured in the
[Vercel Dashboard](https://vercel.com/dashboard) → Project → Settings → Environment Variables.

---

## Required Variables

### Supabase

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |

### Telegram Bot

| Variable | Value | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | `8794749335:AAEif4MqLLH14nePDT-YsHgTC_v-IUuWQm4` | Token from @BotFather |
| `TELEGRAM_CHAT_ID` | `7683167236` | Josh's Telegram chat ID |

> **⚠️ Security note:** Regenerate the bot token via @BotFather after this commit,
> since the token appeared in TASKS.md (which is in git history).
> Update the new token in both `.env.local` and Vercel dashboard.

### Stripe

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_SILVER_PRICE_ID` | Stripe price ID for Silver plan |
| `STRIPE_GOLD_PRICE_ID` | Stripe price ID for Gold plan |
| `STRIPE_PLATNIUM_PRICE_ID` | Stripe price ID for Platinum plan |

### Email (Resend)

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sender email address |
| `RESEND_REPLY_TO_EMAIL` | Reply-to email address |

### AI

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key |
| `GEMINI_API_KEY` | Google Gemini API key |

### Site

| Variable | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://archeryrangescanada.ca` | Must be production URL in Vercel (not localhost) |
| `NEXT_PUBLIC_SITE_URL` | `https://archeryrangescanada.ca` | Same as above |

---

## Registering the Telegram Webhook

After deploying to Vercel, run this command once to tell Telegram where to send messages:

```bash
curl -X POST "https://api.telegram.org/bot8794749335:AAEif4MqLLH14nePDT-YsHgTC_v-IUuWQm4/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://archeryrangescanada.ca/api/telegram/webhook"}'
```

To verify the webhook is set:

```bash
curl "https://api.telegram.org/bot8794749335:AAEif4MqLLH14nePDT-YsHgTC_v-IUuWQm4/getWebhookInfo"
```

---

## Sending Outbound Messages (Cowork → Josh)

To send a message from Cowork/Antigravity to Josh's Telegram, insert a row into the `telegram_messages` table:

```sql
INSERT INTO telegram_messages (chat_id, from_name, message, direction, sent)
VALUES (7683167236, 'Antigravity', 'Your message here', 'outbound', FALSE);
```

The next time Josh sends a message via Telegram, the webhook will automatically pick up and send any unsent outbound rows.

You can also trigger a manual flush (send all pending outbound messages immediately) by visiting:

```
https://archeryrangescanada.ca/api/telegram/webhook?flush=true
```
