module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }


  const { date, cuisine } = req.body || {};
  if (!date || !cuisine) {
    return res.status(400).end('Missing fields');
  }

  // Sanity-check field lengths to reject junk payloads
  if (date.length > 100 || cuisine.length > 100) {
    return res.status(400).end('Fields too long');
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:      process.env.EMAILJS_SERVICE_ID,
        template_id:     process.env.EMAILJS_TEMPLATE_ID,
        user_id:         process.env.EMAILJS_PUBLIC_KEY,
        accessToken:     process.env.EMAILJS_PRIVATE_KEY,
        template_params: { date, cuisine },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('EmailJS error:', response.status, text);
      return res.status(502).json({ error: 'Email send failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Notify handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
