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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0a0a0a] to-gray-900 text-white px-4 py-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <span className="text-2xl font-bold text-white">∑</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">CalcAI Pro</h1>
              <p className="text-xs text-gray-400">AI-Powered Math Assistant</p>
            </div>
          </div>
          <AuthButton />
        </div>

        {/* Navigation Links - Only show to admin */}
        {session?.user?.email === 'bhatiav0909@gmail.com' && (
          <div className="flex gap-3 mb-6">
            <Link
              href="/demo"
              className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-medium transition-all"
            >
              OAuth Demo
            </Link>
            <Link
              href="/admin"
              className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-medium transition-all"
            >
              Admin Dashboard
            </Link>
          </div>
        )}

        {/* Main Calculator Card */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Status Messages */}
          {status === 'loading' && (
            <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Loading authentication...
              </div>
            </div>
          )}

          {!session && status !== 'loading' && (
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-sm border-b border-yellow-700/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-sm text-yellow-200">Please sign in to use the calculator</p>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">

            <label className="block text-sm font-medium text-gray-300 mb-2">Expression</label>
            <input
              className="w-full mb-5 px-5 py-4 text-lg rounded-xl bg-[#0a0a0a] border-2 border-gray-700 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
              placeholder="e.g. x^2 + 3x, sin(x), 15+5"
              value={expr}
              onChange={e => setExpr(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCompute()}
            />

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setType('differentiate')}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  type === 'differentiate'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-[#0a0a0a] border-2 border-gray-700 text-gray-400 hover:border-green-500/50'
                }`}
              >
                <div className="text-lg mb-1">d/dx</div>
                <div className="text-xs">Derivative</div>
              </button>
              <button
                onClick={() => setType('integrate')}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  type === 'integrate'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-[#0a0a0a] border-2 border-gray-700 text-gray-400 hover:border-green-500/50'
                }`}
              >
                <div className="text-lg mb-1">∫</div>
                <div className="text-xs">Integral</div>
              </button>
              <button
                onClick={() => setType('arithmetic')}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  type === 'arithmetic'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                    : 'bg-[#0a0a0a] border-2 border-gray-700 text-gray-400 hover:border-green-500/50'
                }`}
              >
                <div className="text-lg mb-1">±×÷</div>
                <div className="text-xs">Arithmetic</div>
              </button>
            </div>

            <button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-6 py-4 rounded-xl shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleCompute}
              disabled={!expr || loading || !session}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Computing...
                </div>
              ) : (
                'Compute'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-700/50 rounded-xl px-6 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        {pods.length > 0 && (
          <>
            <div className="mt-8 space-y-4">
              {pods.map((pod, i) => (
                <div key={i} className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-green-500/10 transition-all">
                  <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-b border-gray-800">
                    <div className="w-1 h-5 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full"></div>
                    <h3 className="text-base font-bold text-green-400 uppercase tracking-wide">{pod.title}</h3>
                  </div>
                  <div className="p-8 flex items-center justify-center min-h-[140px]">
                    {pod.subpods.map((sp, j) => (
                      <div key={j} className="w-full flex items-center justify-center">
                        {sp.img && (
                          <div className="w-full max-w-lg">
                            <Image
                              src={sp.img.src}
                              alt={sp.img.alt || 'Wolfram Alpha result'}
                              width={500}
                              height={120}
                              unoptimized
                              className="w-full h-auto"
                              style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                            />
                          </div>
                        )}
                        {sp.plaintext && !sp.img && (
                          /^[^a-zA-Z]*[=^]/.test(sp.plaintext) ? (
                            <div className="text-center text-lg">
                              <BlockMath math={toLatex(sp.plaintext)} />
                            </div>
                          ) : (
                            <p className="text-gray-300 text-base text-center font-medium">{sp.plaintext}</p>
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
                className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 rounded-xl text-blue-400 font-semibold transition-all shadow-lg hover:shadow-blue-500/20"
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
                {stepLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Fetching Steps...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>📝</span>
                    Show Step-by-Step Solution
                  </div>
                )}
              </button>
              {stepError && (
                <div className="mt-4 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
                  <p className="text-red-300 text-sm">{stepError}</p>
                </div>
              )}
            </div>

            {/* Step-by-step results */}
            {stepPods.length > 0 && (
              <div className="mt-8 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-b border-gray-800">
                  <span className="text-2xl">📝</span>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Step-by-Step Solution</h2>
                </div>
                <div className="p-6 space-y-5">
                  {stepPods.map((pod, i) => (
                    <div key={`steps-${i}`} className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5 hover:border-purple-500/30 transition-all">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 text-white text-base font-bold rounded-full shadow-lg">
                          {i + 1}
                        </span>
                        <h3 className="text-base font-semibold text-gray-300">{pod.title}</h3>
                      </div>
                      {pod.subpods.map((sp, j) => (
                        <div key={`steps-sp-${j}`} className="ml-11 flex items-center justify-center min-h-[100px]">
                          {sp.img && (
                            <div className="w-full max-w-lg">
                              <Image
                                src={sp.img.src}
                                alt={sp.img.alt || 'Wolfram Alpha step result'}
                                width={500}
                                height={120}
                                unoptimized
                                className="w-full h-auto"
                                style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                              />
                            </div>
                          )}
                          {sp.plaintext && !sp.img && (
                            /^[^a-zA-Z]*[=^]/.test(sp.plaintext) ? (
                              <div className="text-center text-lg">
                                <BlockMath math={toLatex(sp.plaintext)} />
                              </div>
                            ) : (
                              <p className="text-gray-300 text-base text-center font-medium">{sp.plaintext}</p>
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

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by Wolfram Alpha API • Built with Next.js & TailwindCSS</p>
        </div>
      </div>
    </main>
  );
}

