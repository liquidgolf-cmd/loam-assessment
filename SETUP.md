# Loam Strategy — Go-Live Setup

Three external services need to be connected before the assessment is fully turnkey:
**Stripe** (payment), **Calendly** (booking), and **EmailJS** (your notification emails).
All three plug into one file — **`config.js`** at the root of this repo. Edit it, push
to GitHub, and Vercel deploys automatically.

The **admin dashboard** (`loamstrategy.com/admin`, password in `admin.html`) shows a
Go-Live Status panel that tells you what's still missing.

The client flow once everything is connected:

> Enter name + email → pick focus → AI conversation → report + Cowork Prompt →
> pay $500 on Stripe → land on Calendly → book the session.
> You get an email when they start and another with the full Cowork Prompt when they finish.

---

## 1. EmailJS (≈20 min) — do this first

This is what notifies you. Without it, nothing emails you when a client starts or finishes.

1. Create a free account at [emailjs.com](https://www.emailjs.com) (200 emails/month free).
2. **Add an Email Service**: Email Services → Add New Service → Gmail (connect the
   account you want the mail sent through). Copy the **Service ID** (`service_…`).
3. **Create a template**: Email Templates → Create New Template.
   - **To email:** `{{to_email}}`
   - **Subject:** `New Assessment — {{client_name}} ({{focus}})`
   - **Body:**
     ```
     Client: {{client_name}}
     Email: {{client_email}}
     Focus: {{focus}}
     Date: {{date}}

     {{report_summary}}

     ——— COWORK PROMPT ———

     {{cowork_prompt}}
     ```
   - Save, copy the **Template ID** (`template_…`).
4. **Public Key**: Account → General → copy the **Public Key**.
5. Paste all three into `config.js` under `EMAILJS`, push to GitHub.
6. Verify: open `/admin` → the EmailJS status row should be green → click
   **Send Test Email** → check your inbox.

> The same template is used for the "client just started" heads-up, the completion
> email, and the admin test email.

## 2. Stripe Payment Link (≈15 min)

1. In the [Stripe dashboard](https://dashboard.stripe.com/payment-links), create a
   **Payment Link**: product "HomeRun Session — Loam Strategy", $500, one-time.
2. **After payment** setting: choose "Don't show confirmation page — redirect customers
   to your website" and paste your **Calendly link** (from step 3). If Calendly isn't
   ready yet, leave the default confirmation page and update later.
3. Copy the payment link URL (`https://buy.stripe.com/…`) into `STRIPE_LINK` in
   `config.js`, push.

Until this is set, the completion screen shows an **"Email Mike to Book"** button
instead, so nothing is ever broken for a client.

## 3. Calendly (≈15 min)

1. Create a free [Calendly](https://calendly.com) account.
2. New event type: **"HomeRun Session — Loam Strategy"**, 60 minutes. Set your real
   availability and add a buffer between meetings.
3. Add a custom question to the booking form: **"Please paste your Cowork Prompt here."**
   (backup in case the client closed the tab before copying it).
4. Add your Zoom/Meet link so the confirmation email includes meeting details.
5. Copy the event URL into `CALENDLY_LINK` in `config.js`, push.
6. Go back to Stripe and set this URL as the after-payment redirect (step 2.2).

Calendly emails you when someone books — that's your signal to review their Cowork
Prompt before the call.

---

## Test Checklist

Run through this after each config change, using **test mode** so real-data flags stay clean:

- [ ] Open `/admin`, sign in — Go-Live Status shows all three rows green.
- [ ] Click **Send Test Email** — email arrives (check spam the first time).
- [ ] Launch **assessment in test mode** from the admin page (red banner appears).
- [ ] Contact screen appears first; blank name or bad email is rejected; valid entries continue.
- [ ] You receive the "Assessment just started" email with the test name/email.
- [ ] Pick a focus area, answer 2–3 sections (use **Skip this section →** to move fast).
- [ ] Report generates; your first name from the contact form appears on the cover.
- [ ] Cowork Prompt panel: **Copy Cowork Prompt** works and includes your name + email at the top.
- [ ] You receive the completion email with report summary + full Cowork Prompt (name has `[TEST]`).
- [ ] In test mode the payment button is replaced by a TEST MODE notice — expected.
- [ ] Run once **without** `?test=true`: the Stripe button appears, pays with Stripe's
      test card `4242 4242 4242 4242` (put the link in test mode in Stripe first if you
      want to avoid a real charge), and redirects to Calendly.
- [ ] Book a Calendly slot — the booking form asks for the Cowork Prompt; you get the
      Calendly notification.
- [ ] Back in `/admin`: the session appears under Past Assessments with name + email;
      detail view shows contact info; Export All downloads a JSON file.
- [ ] Refresh mid-assessment: the resume banner appears and continues where you left off.

## Notes & limits

- **Past Assessments is per-browser.** Sessions save to the visitor's own browser, so
  the admin list only shows assessments run on *your* device. The email notification is
  your permanent record for real clients. (A shared database is the eventual upgrade if
  volume grows.)
- **Admin password** is in `admin.html` (`ADMIN_PASSWORD`). It keeps honest people out
  but is visible in the page source — don't store anything sensitive behind it.
- **EmailJS public key is safe to publish** — it can only send your templates to the
  address configured in the template. Never put Stripe secret keys or the Anthropic API
  key in `config.js` (the Anthropic key lives in Vercel env vars for `/api/chat`).
- **EmailJS free tier is 200 emails/month** — each client uses 2 (start + completion).
