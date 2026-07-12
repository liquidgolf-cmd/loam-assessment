// ─────────────────────────────────────────────────────────────
// LOAM STRATEGY — SITE CONFIGURATION
// This file ships to every visitor's browser, so it powers the
// payment button, booking link, and email notifications for ALL
// clients (not just this device). Edit the values below, push to
// GitHub, and Vercel deploys the change automatically.
//
// Anything left as an empty string '' is treated as "not set up
// yet" and the site falls back gracefully (e.g. an email-Mike
// button instead of a broken Stripe link).
//
// NOTE: The EmailJS public key is designed to be public — it can
// only send the templates you created, to the address you set in
// the template. Never put your Stripe secret key or Anthropic
// API key in this file.
// ─────────────────────────────────────────────────────────────

window.LOAM_CONFIG = {

  // Stripe Payment Link for the $500 session.
  // Create at: https://dashboard.stripe.com/payment-links
  // Example: 'https://buy.stripe.com/xxxxxxxxxxxx'
  STRIPE_LINK: '',

  // Calendly booking page for the 60-minute session.
  // Example: 'https://calendly.com/mike-loamstrategy/homerun-session'
  // Also set this URL as the Stripe Payment Link's after-payment
  // redirect so paying flows straight into booking.
  CALENDLY_LINK: '',

  // Where admin notifications go.
  MIKE_EMAIL: 'loamstrategy@gmail.com',

  // EmailJS credentials — create free account at https://emailjs.com
  // (200 emails/month free). See SETUP.md for the template to create.
  EMAILJS: {
    serviceId:  'service_z1hokmh',
    templateId: 'template_8bn6q0c',
    publicKey:  '-7XafDIbYHPjmCWUX'
  },

  // Temporary promo banner (homepage top bar + assessment intro callout).
  // To take the offer down: set enabled to false and push — or just ask
  // Claude to "turn off the promo." There is no automatic counter (a static
  // site can't count visitors across devices), so count the completions
  // from your notification emails and switch this off when you hit 5.
  PROMO: {
    enabled: true,
    text:    'Launch offer: the first 5 people to complete the full Assessment get it free — normally $500.',
    ctaText: 'Claim your spot'   // button label on the homepage bar
  }
};
