import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { dbInstance } from '../App';

export default function AdminPanel({ groepen, user }) {
  const [melding, setMelding] = useState('');

  // Zorg dat groepen altijd een object is
  const groepenObj = Array.isArray(groepen)
    ? Object.fromEntries(groepen.map((g, i) => [g?.id || i, g]).filter(([_, g]) => g && g.naam))
    : (groepen || {});

  const handlePointsChange = async (groepId, delta) => {
    const groep = groepenObj[groepId];
    const current = groep.adminPoints || 0;
    try {
      await update(ref(dbInstance, `groepen/${groepId}`), {
        adminPoints: current + delta,
      });
      setTimeout(() => setMelding(''), 2000);
    } catch {
      setMelding('Fout bij aanpassen punten.');
    }
  };

  return (
    <section className="card max-w-2xl mx-auto my-8 p-6">
      <h2 className="text-xl font-bold mb-4 text-cyan-200">Admin: Groep punten aanpassen</h2>
      {melding && <p className="mb-4 text-pink-300">{melding}</p>}
      <ul className="space-y-4">
        {Object.entries(groepenObj).map(([groepId, groep]) => (
          <li key={groepId} className="flex items-center gap-4 bg-white/10 rounded-lg p-3">
            <span className="flex-1 font-semibold text-cyan-100">{groep.naam}</span>
            <span className="font-mono text-lg text-purple-200">
              {groep.adminPoints || 0} admin punten
            </span>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded-full font-bold hover:bg-green-600"
              onClick={() => handlePointsChange(groepId, 1)}
            >
              +1
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-full font-bold hover:bg-red-600"
              onClick={() => handlePointsChange(groepId, -1)}
            >
              -1
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
