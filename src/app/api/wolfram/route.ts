// /app/api/wolfram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';
import { auth } from '@/app/api/auth/[...nextauth]/route';

type RawSubpod = {
  plaintext?: string;
  img?: {
    src: string;
    alt?: string;
  };
};

type RawPod = {
  title: string;
  subpod: RawSubpod[] | RawSubpod;
  states?: {
    state: { name: string; input: string } | { name: string; input: string }[];
  };
};

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }

  const { input } = await req.json();
  const appid = process.env.WOLFRAM_APP_ID;
  if (!appid) {
    return NextResponse.json(
      { success: false, error: 'Missing WOLFRAM_APP_ID in environment' },
      { status: 500 }
    );
  }
  const query = encodeURIComponent(input);

  try {
    const res = await fetch(
      `https://api.wolframalpha.com/v2/query?appid=${appid}&input=${query}&output=XML`
    );
    const xml = await res.text();

    const parsed = await parseStringPromise(xml, {
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true,
    });

    const pods = parsed?.queryresult?.pod;

    if (!pods || (Array.isArray(pods) && pods.length === 0)) {
      return NextResponse.json({ success: false, error: 'No pods returned' });
    }

    const normalizedPods = (Array.isArray(pods) ? pods : [pods]).map((pod: RawPod) => ({
      title: pod.title,
      subpods: (Array.isArray(pod.subpod) ? pod.subpod : [pod.subpod]).map((sp: RawSubpod) => ({
        plaintext: sp.plaintext,
        img: sp.img?.src
          ? {
              src: sp.img.src,
              alt: sp.img.alt || pod.title,
            }
          : undefined,
      })),
      // ✅ include states (like Step-by-step solution) if present
      states:
        pod.states && pod.states.state
          ? Array.isArray(pod.states.state)
            ? pod.states.state.map((s: { name: string; input: string }) => ({ name: s.name, input: s.input }))
            : [{ name: pod.states.state.name, input: pod.states.state.input }]
          : [],
    }));

    return NextResponse.json({ success: true, pods: normalizedPods });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

