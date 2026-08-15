import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '1';
    const coin = searchParams.get('coin') || 'ethereum';

    const [priceRes, ohlcRes] = await Promise.all([
      fetch(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}`, { signal: AbortSignal.timeout(10000) }),
      fetch(`https://api.coingecko.com/api/v3/coins/${coin}/ohlc?vs_currency=usd&days=${days === '0.04' ? '1' : days}`, { signal: AbortSignal.timeout(10000) }),
    ]);

    if (!priceRes.ok) {
      const retryAfter = priceRes.headers.get('Retry-After') || '60';
      return NextResponse.json(
        { error: 'Rate limit reached', retryAfter: parseInt(retryAfter) },
        { status: 429 }
      );
    }

    const priceJson = await priceRes.json();
    const ohlcJson = ohlcRes.ok ? await ohlcRes.json() : [];

    const filteredOhlc = days === '0.04'
      ? ohlcJson.filter(([ts]: [number]) => ts >= Date.now() - 60 * 60 * 1000)
      : ohlcJson;

    return NextResponse.json({
      prices: priceJson.prices,
      volumes: priceJson.total_volumes,
      ohlc: filteredOhlc,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
