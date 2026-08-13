// API Proxy: forwards requests to Anthropic's Claude API.
// The ANTHROPIC_API_KEY must be set as an environment variable / secret on your hosting platform.
// This keeps the key server-side — the browser never sees it.
//
// This function handles POST requests to /api/claude
// It works with Express, Vercel, Netlify, Manus, or any Node.js backend.

export default async function handler(req, res) {
  // Handle different request formats (Express-style vs serverless)
  const method = req.method || req.httpMethod;
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  if (method !== "POST") {
    if (res?.status) return res.status(405).json({ error: "Method not allowed" });
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { model, max_tokens, system, messages } = body || {};
  if (!messages) {
    if (res?.status) return res.status(400).json({ error: "Missing messages" });
    return { statusCode: 400, body: JSON.stringify({ error: "Missing messages" }) };
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-6",
        max_tokens: Math.min(max_tokens || 1000, 2000),
        ...(system ? { system } : {}),
        messages,
      }),
    });

    const data = await upstream.json();

    // Express/Vercel-style response
    if (res?.status) return res.status(upstream.status).json(data);

    // Serverless-style response (Netlify, etc.)
    return {
      statusCode: upstream.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    if (res?.status) return res.status(500).json({ error: "Upstream request failed" });
    return { statusCode: 500, body: JSON.stringify({ error: "Upstream request failed" }) };
  }
}
