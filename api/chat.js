// Vercel Serverless Function — /api/chat
// Proxies requests to Anthropic so the API key never hits the browser.
// Deploy this alongside index.html in your Vercel project.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic origin check — update this to your actual Vercel domain
  const allowed = [
    'https://loam-assessment.vercel.app',
    'https://loamstrategy.com',
    'https://www.loamstrategy.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin || '';
  if (allowed.length && !allowed.some(o => origin.startsWith(o))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { model, max_tokens, system, messages, thinking } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,  // ← set in Vercel dashboard
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model, max_tokens, system, messages, ...(thinking ? { thinking } : {}) })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // CORS header so the browser accepts the response
    res.setHeader('Access-Control-Allow-Origin', origin);
    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
