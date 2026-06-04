// api/ai-commentary.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt } = req.body

  if (!process.env.ZG_COMPUTE_API_KEY) {
    return res.status(500).json({ error: 'Missing API key' })
  }

  try {
    const response = await fetch('https://router-api-testnet.integratenetwork.work/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZG_COMPUTE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen2.5-omni-7b',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    const text = await response.text()

    if (!response.ok) {
      return res.status(500).json({ error: `0G error ${response.status}`, detail: text })
    }

    const data = JSON.parse(text)
    return res.status(200).json(data)

  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack })
  }
}