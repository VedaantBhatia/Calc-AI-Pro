// /app/api/wolfram/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { input } = body;
  const appid = process.env.WOLFRAM_APP_ID;

  const query = encodeURIComponent(input);

  try {
    const res = await fetch(
      `https://www.wolframalpha.com/api/v1/llm-api?appid=${appid}&input=${query}`
    );

    const text = await res.text();
    return NextResponse.json({ success: true, result: text });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    console.error(err)
  }
}
