import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.llama.fi/v2/historicalChainTvl/ethereum', { signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch TVL data' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ tvl: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
