# Loam Strategy — Go-Live Setup

Three external services need to be connected before the assessment is fully turnkey:
**Stripe** (payment), **Calendly** (booking), and **EmailJS** (your notification emails).
All three plug into one file — **`config.js`** at the root of this repo. Edit it, push
to GitHub, and Vercel deploys automatically.

The **admin dashboard** (`loamstrategy.com/admin`, password in `admin.html`) shows a
Go-Live Status panel that tells you what's still missing.

The client flow once everything is connected:

> Enter name, email, business name, website, and city or area served (social is
> optional) → pick focus → AI conversation → "what we heard" end screen → pay $500 on
> Stripe → land on Calendly → book the session (at least two business days out) → you
> research and send the report within two business days → the session.

There's no instant AI report. A report built from answers alone, with no research, can't
find a real blind spot. The client sees a short recap of their own words (no diagnosis),
what happens next, and the booking button. You build the real report with the
`loam-blind-spot-assessment` skill and send it within two business days, before the session.
While `PROMO` is on, the booking button skips payment and says the session is free.

You get two emails per assessment:

1. **"Assessment just started"** when they submit the contact step, with their business
   details and quiz result, so no lead is lost.
2. **"Assessment finished, full transcript"** the moment they finish the last section.
   It holds the full Cowork Prompt: business details, quiz result, which sections were
   finished or skipped, and the whole conversation with both the coach's questions and the
   owner's answers. Paste it into Claude with the `loam-blind-spot-assessment` skill.
   **This is your two-business-day clock.**

If that email fails, the client's progress stays saved on their device and the end screen
asks them to **Send Again** or **Download My Answers** and email them to you. If the recap
fails, the end screen still shows (just without the recap). Nothing is lost either way.

### What the assessment asks

Every focus shares the same core, built so the `loam-blind-spot-assessment` skill has
one side of each gap to check against the research:

1. **The Business**: what they do, best customer, team size, years in business
2. **The Problem You'd Fix**: the stated problem and their theory of the cause
3. **How Customers Find You**: last customer's path, why they bought, inquiries and close rate, one that got away
4. **What You're Known For**: what they think they're known for vs. what customers say
5. **Pricing & Money**: how they price, how quoting feels, job value, revenue trend
6. **Where Your Week Goes**: where the hours went vs. what would move the business

Then the focus adds its own sections:

- **AI Tools**: Tools & Tech, Repeat Work
- **Business Health**: Team & Handoffs, After the Sale
- **Brand Clarity**: Your Message, Who You're Up Against
- **Full Picture** (or any combination): Message & Market, Team & Tools, After the Sale

It always ends with **What You Already Know**, so anything they name there can be
credited instead of reported as a blind spot.

The coach collects and doesn't diagnose. It pushes back once on a vague answer, then
moves on and marks it as thin in the transcript. The question sets live in
`SEC` and `FOCUS_SECTIONS` in `assessment.html`. If you change a section id there,
bump `SECTION_VERSION` so old saved sessions don't resume into the wrong questions.

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
> email, the free quiz opt-in, and the admin test email.

### Free quiz opt-in

The quiz result is always free and never gated. Under the result, an optional form
offers a personal note from you in exchange for first name, email, and business name
or website. When someone submits it you get an email through the same template:

- **Subject** reads `New Assessment — {name} (Free quiz opt-in)`. If you'd like it to
  read differently, change the template subject to something like
  `Loam — {{client_name}} ({{focus}})`.
- **report_summary** has their business, result, what they named in Q8, the pattern
  in their other 11 answers, and whether the two match.
- **cowork_prompt** has all 12 questions with the answer they picked.

They're told to expect one personal observation from you within **two business days**.

The quiz also saves its result in the visitor's browser. If they go on to the paid
assessment on the same device, their name and email are prefilled, and the quiz
result is added to the "started" email, the completion email, and the Cowork Prompt.

### Whose name clients see

The site speaks as "we" / Loam Strategy everywhere except two spots, which use the names
in `config.js`:

- `SESSION_LEAD` is who runs the 60-minute session ("a 60-minute session with Mike").
- `QUIZ_REPLY_FROM` signs the thank-you after a free quiz opt-in.

If someone else takes over either job, change the name there and push. Leave one blank
and the site says "a Loam strategist" or "The Loam Strategy team" instead. The AI coach
is called "Loam AI Coach" and never uses a person's name. The founder section on the
home page still introduces Mike by name.

## 2. Stripe Payment Link (≈15 min)

1. In the [Stripe dashboard](https://dashboard.stripe.com/payment-links), create a
   **Payment Link**: product "HomeRun Session — Loam Strategy", $500, one-time.
2. **After payment** setting: choose "Don't show confirmation page — redirect customers
   to your website" and paste your **Calendly link** (from step 3). If Calendly isn't
   ready yet, leave the default confirmation page and update later.
3. Copy the payment link URL (`https://buy.stripe.com/…`) into `STRIPE_LINK` in
   `config.js`, push.

Until this is set, the completion screen shows an **"Email Us to Book"** button
instead, so nothing is ever broken for a client.

## 3. Calendly (≈15 min)

1. Create a free [Calendly](https://calendly.com) account.
2. New event type: **"HomeRun Session — Loam Strategy"**, 60 minutes. Set your real
   availability and add a buffer between meetings.
3. Set **minimum scheduling notice** to 2 business days (Calendly calls it "Limits"), so
   nobody books a session before their report can reach them.
4. Add your Zoom/Meet link so the confirmation email includes meeting details.
5. Copy the event URL into `CALENDLY_LINK` in `config.js`, push.
6. Go back to Stripe and set this URL as the after-payment redirect (step 2.2).

Calendly emails you when someone books. Make sure their report goes out before the call.

---

## Test Checklist

Run through this after each config change, using **test mode** so real-data flags stay clean:

- [ ] Open `/admin`, sign in — Go-Live Status shows all three rows green.
- [ ] Click **Send Test Email** — email arrives (check spam the first time).
- [ ] Launch **quiz in test mode** from the admin page (red banner appears). Finish it,
      fill in the opt-in, and confirm the email arrives tagged `[TEST]` with all 12 answers.
- [ ] From the quiz result, click **Get the Full Assessment**. Name and email should be prefilled.
- [ ] Launch **assessment in test mode** from the admin page (red banner appears).
- [ ] Contact screen appears first. Blank name, bad email, blank business name, a website that
      isn't a web address, or blank city/area is rejected with the field outlined. Social can be blank.
- [ ] You receive the "Assessment just started" email with the test name/email.
- [ ] Pick a focus area, answer 2–3 sections (use **Skip this section →** to move fast).
- [ ] The first section ("The Business") opens with your business name and doesn't ask for your name again.
- [ ] Give one deliberately vague answer twice in a row. The coach should push back once, then move on.
      In the transcript email, that coach line is marked `[moved on, answer above was thin]`.
- [ ] The coach never gives advice or names a blind spot during the conversation. If you ask for
      advice, it should say that's what the report and session are for.
- [ ] You receive **"Assessment finished, full transcript"**. Check that it shows both the coach's
      questions and your answers, marks skipped sections, and names the `loam-blind-spot-assessment` skill.
- [ ] The end screen says "Thanks, {name}. Here's what we heard." The recap uses your own words
      and doesn't diagnose anything or recommend tools. "What Happens Next" names your website and area.
- [ ] In test mode the payment button is replaced by a TEST MODE notice. That's expected.
- [ ] Run once **without** `?test=true`: the Stripe button appears, pays with Stripe's
      test card `4242 4242 4242 4242` (put the link in test mode in Stripe first if you
      want to avoid a real charge), and redirects to Calendly.
- [ ] Book a Calendly slot. Nothing sooner than two business days out is offered, and you get
      the Calendly notification.
- [ ] Back in `/admin`: the session appears under Past Assessments with name + email;
      detail view shows contact info, business, and the recap; Export All downloads a JSON file.
- [ ] Refresh mid-section: the resume banner appears, and **Continue** brings back that
      section's conversation so far, not just its opening question.

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
- **EmailJS free tier is 200 emails/month** — each assessment uses 2 (started and
  transcript) and each quiz opt-in uses 1. Upgrade when you get close.
- **EmailJS also limits the size of each email.** The transcript email is capped at 40,000
  characters. The transcript sits at the end, so only its tail gets cut, with a note saying
  so. If a real transcript gets cut or the send fails, check EmailJS's current size limit
  for your plan.
