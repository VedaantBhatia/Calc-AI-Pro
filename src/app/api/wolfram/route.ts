// /app/api/wolfram/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseStringPromise } from 'xml2js';
type Subpod = {
  plaintext?: string;
  img?: {
    src: string;
    alt?: string;
  };
};

type Pod = {
  title: string;
  subpod: Subpod[] | Subpod;
};

export async function POST(req: NextRequest) {
  const { input } = await req.json();
  const appid = process.env.WOLFRAM_APP_ID;
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
    const normalizedPods = (Array.isArray(pods) ? pods : [pods]).map((pod: Pod) => ({
  title: pod.title,
  subpods: (Array.isArray(pod.subpod) ? pod.subpod : [pod.subpod]).map((sp: Subpod) => ({
    plaintext: sp.plaintext,
    img: sp.img?.src
      ? {
          src: sp.img.src,
          alt: sp.img.alt || pod.title,
        }
      : undefined,
  })),
}));


    return NextResponse.json({ success: true, pods: normalizedPods });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    
  }
}