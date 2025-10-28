// page.tsx

'use client';

import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AuthButton from '@/components/AuthButton';

function toLatex(input: string): string {
  return input
    .replace(/tan\^\(?-1\)?\(?x\)?/gi, '\\arctan{x}')
    .replace(/sin\^\(?-1\)?\(?x\)?/gi, '\\arcsin{x}')
    .replace(/cos\^\(?-1\)?\(?x\)?/gi, '\\arccos{x}')
    .replace(/d\/dx/g, '\\frac{d}{dx}')
    .replace(/x\^(\d+)/g, 'x^{$1}')
    .replace(/=/g, '=');
}

type Pod = {
  title: string;
  subpods: {
    plaintext?: string;
    img?: { src: string; alt?: string };
  }[];
  states?: { name: string; input: string }[];
};

export default function Home() {
  const { data: session, status } = useSession();
  const [expr, setExpr] = useState('');
  const [type, setType] = useState<'differentiate' | 'integrate' | 'arithmetic'>('differentiate');
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepLoading, setStepLoading] = useState(false);
  const [stepPods, setStepPods] = useState<Pod[]>([]);
  const [stepError, setStepError] = useState<string | null>(null);

  const handleCompute = async () => {
    if (!expr.trim()) return;
    setLoading(true);
    setError(null);
    setPods([]);
    setStepPods([]);
    setStepError(null);

    // For arithmetic, send just the expression; for calculus operations, prefix with the operation
    const query = type === 'arithmetic' ? expr : `${type} ${expr}`;

    try {
      const res = await fetch('/api/wolfram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: query }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Unknown error');
        return;
      }

      setPods(data.pods);
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-[#1F1F1F] border border-gray-700 rounded-xl p-8 w-full max-w-2xl shadow-lg">
        {/* Auth Button at the top */}
        <div className="flex justify-end mb-4">
          <AuthButton />
        </div>

        <h1 className="text-3xl font-bold text-green-500 mb-2">∑ CalcAI Pro</h1>
        <p className="text-gray-300 mb-6">
          {"Your AI-powered calculus assistant. Enter an expression, choose an operation, and let AI do the math! It's mathemagical!"}
        </p>

        {/* Navigation Links - Only show to admin */}
        {session?.user?.email === 'bhatiav0909@gmail.com' && (
          <div className="flex gap-4 mb-6">
            <Link
              href="/demo"
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              View OAuth Demo
            </Link>
            <Link
              href="/admin"
              className="text-purple-400 hover:text-purple-300 underline text-sm"
            >
              Admin Dashboard
            </Link>
          </div>
        )}

        {/* Show message if not authenticated */}
        {status === 'loading' && (
          <div className="text-center text-gray-400 mb-6">Loading authentication...</div>
        )}

        {!session && status !== 'loading' && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6 text-yellow-200">
            <p className="text-sm">⚠️ Please sign in to use the calculator</p>
          </div>
        )}

        <label className="block text-sm text-gray-400 mb-1">Expression (LaTeX or standard math)</label>
        <input
          className="w-full mb-4 px-4 py-3 text-base rounded-lg bg-[#2A2A2A] border border-gray-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g. x^2 + 3x"
          value={expr}
          onChange={e => setExpr(e.target.value)}
        />

        <div className="flex gap-4 mb-4">
          <div className="w-1/2">
            <label className="block text-sm text-gray-400 mb-1">Operation</label>
            <select
              className="w-full px-4 py-3 text-base rounded-lg bg-[#2A2A2A] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={type}
              onChange={e => setType(e.target.value as 'differentiate' | 'integrate' | 'arithmetic')}
            >
              <option value="differentiate">Derivative</option>
              <option value="integrate">Integral</option>
              <option value="arithmetic">Arithmetic</option>
            </select>
          </div>

          <div className="w-1/2">
            <label className="block text-sm text-gray-400 mb-1">Variable</label>
            <input
              className="w-full px-4 py-3 text-base rounded-lg bg-[#2A2A2A] border border-gray-600 placeholder-gray-500"
              value="x"
              disabled
            />
          </div>
        </div>

        <button
          className="w-full bg-green-500 hover:bg-green-600 transition text-white font-semibold text-lg px-6 py-3 rounded-lg disabled:opacity-50"
          onClick={handleCompute}
          disabled={!expr || loading || !session}
        >
          {loading ? 'Computing...' : 'Compute'}
        </button>

        {error && (
          <div className="mt-6 text-red-500 font-semibold text-center">{error}</div>
        )}

        {pods.length > 0 && (
          <>
            <div className="mt-6 space-y-3">
              {pods.map((pod, i) => (
                <div key={i} className="bg-[#2A2A2A] border border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#1F1F1F] border-b border-gray-700">
                    <div className="w-0.5 h-3 bg-green-500 rounded"></div>
                    <h3 className="text-xs font-semibold text-green-400 uppercase">{pod.title}</h3>
                  </div>
                  <div className="p-3">
                    {pod.subpods.map((sp, j) => (
                      <div key={j} className="flex items-center justify-center">
                        {sp.img && (
                          <div className="max-w-[200px] max-h-[80px] overflow-hidden flex items-center justify-center">
                            <Image
                              src={sp.img.src}
                              alt={sp.img.alt || 'Wolfram Alpha result'}
                              width={200}
                              height={80}
                              unoptimized
                              className="object-contain"
                              style={{ filter: 'invert(1) hue-rotate(180deg)', maxHeight: '80px' }}
                            />
                          </div>
                        )}
                        {sp.plaintext && !sp.img && (
                          /^[^a-zA-Z]*[=^]/.test(sp.plaintext) ? (
                            <div className="text-center text-sm">
                              <BlockMath math={toLatex(sp.plaintext)} />
                            </div>
                          ) : (
                            <p className="text-gray-300 text-sm text-center">{sp.plaintext}</p>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Step-by-step button */}
            <div className="text-center mt-6">
              <button
                className="text-green-400 underline hover:text-green-300 transition"
                onClick={async () => {
                  setStepLoading(true);
                  setStepPods([]);
                  setStepError(null);

                  // Find a state labeled step-by-step from any pod
                  const stepStateInput = (() => {
                    for (const p of pods) {
                      const states = p.states || [];
                      const target = states.find(s => s.name?.toLowerCase().includes('step-by-step'));
                      if (target?.input) return target.input;
                    }
                    return null;
                  })();

                  try {
                    if (!stepStateInput) {
                      setStepError('Step-by-step not available for this query.');
                      return;
                    }
                    const res = await fetch('/api/steps', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        input: type === 'arithmetic' ? expr : `${type} ${expr}`,
                        podstate: stepStateInput,
                      })
                    });

                    const data = await res.json();
                    if (!data.success) {
                      setStepError(data.error || 'Failed to fetch steps');
                      return;
                    }
                    
                    // Log all pod titles to see what we're getting
                    console.log('All step pods:', data.pods.map((p: Pod) => p.title));
                    
                    // Filter out the duplicate/extra pods (Input, plots, properties, etc.)
                    // Keep everything EXCEPT the known duplicates
                    const stepOnlyPods = data.pods.filter((p: Pod) => {
                      const title = p.title?.toLowerCase() || '';
                      const isExtraStuff = 
                        title.includes('input') ||
                        title.includes('plot') ||
                        title.includes('parabola') ||
                        title.includes('discriminant') ||
                        title.includes('properties') ||
                        title.includes('even') ||
                        title.includes('minimum') ||
                        title.includes('maximum') ||
                        title.includes('root') ||
                        title.includes('domain') ||
                        title.includes('range');
                      return !isExtraStuff;
                    });
                    
                    console.log('Filtered step pods:', stepOnlyPods.map((p: Pod) => p.title));
                    setStepPods(stepOnlyPods);
                  } catch (err) {
                    console.error('Step fetch failed', err);
                    setStepError('Network error while fetching steps');
                  } finally {
                    setStepLoading(false);
                  }
                }}
                disabled={stepLoading}
              >
                {stepLoading ? 'Fetching Steps...' : 'Show Steps'}
              </button>
              {stepError && (
                <div className="mt-3 text-red-500 text-sm">{stepError}</div>
              )}
            </div>

            {/* Step-by-step results */}
            {stepPods.length > 0 && (
              <div className="mt-6 bg-[#2A2A2A] border border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#1F1F1F] border-b border-gray-700">
                  <span className="text-sm">📝</span>
                  <h2 className="text-xs font-bold text-green-400 uppercase">Step-by-Step Solution</h2>
                </div>
                <div className="p-3 space-y-2">
                  {stepPods.map((pod, i) => (
                    <div key={`steps-${i}`} className="bg-[#1F1F1F] border border-gray-700 rounded p-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex items-center justify-center w-4 h-4 bg-green-500 text-black text-xs font-bold rounded-full">
                          {i + 1}
                        </span>
                        <h3 className="text-xs font-semibold text-gray-400">{pod.title}</h3>
                      </div>
                      {pod.subpods.map((sp, j) => (
                        <div key={`steps-sp-${j}`} className="ml-6 flex items-center justify-center">
                          {sp.img && (
                            <div className="max-w-[200px] max-h-[80px] overflow-hidden flex items-center justify-center">
                              <Image
                                src={sp.img.src}
                                alt={sp.img.alt || 'Wolfram Alpha step result'}
                                width={200}
                                height={80}
                                unoptimized
                                className="object-contain"
                                style={{ filter: 'invert(1) hue-rotate(180deg)', maxHeight: '80px' }}
                              />
                            </div>
                          )}
                          {sp.plaintext && !sp.img && (
                            /^[^a-zA-Z]*[=^]/.test(sp.plaintext) ? (
                              <div className="text-center text-sm">
                                <BlockMath math={toLatex(sp.plaintext)} />
                              </div>
                            ) : (
                              <p className="text-gray-300 text-xs text-center">{sp.plaintext}</p>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

