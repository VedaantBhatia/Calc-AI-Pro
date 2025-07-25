'use client';
 // @ts-expect-error
import { BlockMath} from 'react-katex';
import 'katex/dist/katex.min.css';

import { useState } from 'react';
function toLatex(input: string): string {
  return input
    // Handle inverse trig functions like tan^-1(x)
    .replace(/tan\^\(?-1\)?\(?x\)?/gi, '\\arctan{x}')
    .replace(/sin\^\(?-1\)?\(?x\)?/gi, '\\arcsin{x}')
    .replace(/cos\^\(?-1\)?\(?x\)?/gi, '\\arccos{x}')
    // Handle other standard formatting
    .replace(/d\/dx/g, '\\frac{d}{dx}')
    .replace(/x\^(\d+)/g, 'x^{$1}')
    .replace(/=/g, '=');
}

export default function Home() {
  const [expr, setExpr] = useState('');
  const [type, setType] = useState<'differentiate' | 'integrate'>('differentiate');
  const [result, setResult] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

 const handleCompute = async () => {
  if (!expr.trim()) return;

  setLoading(true);
  setResult({}); // ← we’ll store an object now

  const query = `${type} ${expr}`;

  try {
    const res = await fetch('/api/wolfram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: query }),
    });

    const data = await res.json();

    if (!data.success) {
      setResult({ Error: data.error || 'Unknown' });
    } else {
      // 🔽 STEP 1: Parse the response into a key-value object
      const lines = data.result
        .split('\n')
        .map((line: string) => line.trim())
        .filter(Boolean);

      const parsed: Record<string, string> = {};
      let currentKey = '';

      for (const line of lines) {
        if (line.endsWith(':')) {
          currentKey = line.replace(':', '');
          parsed[currentKey] = '';
        } else if (currentKey) {
          parsed[currentKey] += (parsed[currentKey] ? '\n' : '') + line;
        }
      }

      setResult(parsed); // ⬅️ now result is an object
    }
  } catch (err) {
    setResult({ Error: 'Network error' });
    console.error(err)
  } finally {
    setLoading(false);
  }
};



  return (
    <main className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-[#1F1F1F] border border-gray-700 rounded-xl p-8 w-full max-w-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-green-500 mb-2">∑ CalcAI Pro</h1>
        <p className="text-gray-300 mb-6">
          {"Your AI-powered calculus assistant. Enter an expression, choose an operation, and let AI do the math! It's mathemagical!"}
        </p>

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
              onChange={e => setType(e.target.value as 'differentiate' | 'integrate')}
            >
              <option value="differentiate">Derivative</option>
              <option value="integrate">Integral</option>
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
          disabled={!expr || loading}
        >
          {loading ? 'Computing...' : 'Compute'}
        </button>

        {Object.keys(result).length > 0 && (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-4">Result</h2>
    <div className="space-y-4 bg-[#2A2A2A] border border-gray-700 rounded-lg p-6 text-gray-100">

      {result['Query'] && (
        <div>
          <h3 className="text-sm text-gray-400 uppercase">Query</h3>
          <p className="text-lg">{result['Query']}</p>
        </div>
      )}

      {result['Derivative'] && (
  <div>
    <h3 className="text-sm text-gray-400 uppercase">Derivative</h3>
    <BlockMath math={toLatex(result['Derivative'])} />
  </div>
)}


      {result['Plot'] && result['Plot'].includes('image:') && (
        <div>
          <h3 className="text-sm text-gray-400 uppercase">Plot</h3>
          <img
            src={result['Plot'].match(/image:\s*(.*)/)?.[1] || ''}
            alt="Plot"
            className="rounded-lg border border-gray-600 mt-2"
          />
        </div>
      )}

      {result['Properties as a real function'] && (
        <div>
          <h3 className="text-sm text-gray-400 uppercase">Properties</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-200">{result['Properties as a real function']}</pre>
        </div>
      )}

      {result['Indefinite integral'] && (
        <div>
          <h3 className="text-sm text-gray-400 uppercase">Indefinite Integral</h3>
          <p className="text-lg">{result['Indefinite integral']}</p>
        </div>
      )}

      {result['Wolfram|Alpha website result for "differentiate x^2"'] && (
        <div>
          <a
            href={result['Wolfram|Alpha website result for "differentiate x^2"']}
            className="text-green-400 underline"
            target="_blank"
          >
            View full result on Wolfram|Alpha →
          </a>
        </div>
      )}
    </div>
  </div>
)}

      </div>
    </main>
  );
}
