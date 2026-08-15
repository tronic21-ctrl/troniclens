import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { telemetryData, prompt } = await request.json();
    const apiKey = process.env.ZG_COMPUTE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    const response = await fetch('https://router-api-testnet.integratenetwork.work/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        model: 'Qwen2.5-7B-Instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi analytics expert. Analyze the provided on-chain telemetry data and provide actionable insights about staking trends, whale behavior, and protocol health. Be concise and data-driven.',
          },
          {
            role: 'user',
            content: prompt || `Analyze this on-chain telemetry data and provide insights:\n${JSON.stringify(telemetryData, null, 2)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    const isTimeout = error.name === 'TimeoutError';
    return NextResponse.json(
      { error: isTimeout ? '0G Compute timeout' : (error.message || 'Internal server error') },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
