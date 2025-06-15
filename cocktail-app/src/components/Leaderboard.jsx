import React from 'react';

// Kleuren mapping hetzelfde als in jouw code
const COLOR_MAP = {
  Rood: 'bg-red-500',
  Blauw: 'bg-blue-500',
  Geel: 'bg-yellow-400',
  Groen: 'bg-green-500',
  Oranje: 'bg-orange-400',
  Roze: 'bg-pink-400',
  Paars: 'bg-purple-500',
  Turquoise: 'bg-cyan-400',
  Zwart: 'bg-gray-900',
  Wit: 'bg-gray-100 border border-gray-300',
  Grijs: 'bg-gray-400',
  Bruin: 'bg-yellow-900',
  Lichtblauw: 'bg-sky-300',
  Lichtgroen: 'bg-lime-300',
  Zalm: 'bg-orange-300',
  Goud: 'bg-yellow-300',
  Zilver: 'bg-gray-300',
  Beige: 'bg-yellow-100',
};

function getColorClass(kleur) {
  return COLOR_MAP[kleur] || 'bg-gray-500';
}

function getTrophyIcon(position) {
  const trophies = [
    <span className="text-yellow-400 drop-shadow-[0_0_8px_#FFD700]" title="1e plaats">🏆</span>,  // goud
    <span className="text-gray-400 drop-shadow-[0_0_8px_#C0C0C0]" title="2e plaats">🥈</span>,    // zilver
    <span className="text-orange-600 drop-shadow-[0_0_8px_#B87333]" title="3e plaats">🥉</span>,  // brons
  ];
  return trophies[position] || null;
}

export default function Leaderboard({ guests, user, groepen }) {
  if (!user) {
    return (
      <section className="p-8 text-center text-cyan-200">
        <p>Log in om te stemmen.</p>
      </section>
    );
  }
  // Maak mapping kleur -> groepsnaam (eerste gevonden per kleur)
  const kleurNaarGroep = {};
  Object.values(groepen || {}).forEach((groep) => {
    if (groep.naam && groep.kleur && !kleurNaarGroep[groep.kleur]) {
      kleurNaarGroep[groep.kleur] = groep.naam;
    }
  });

  // Punten per positie in top 3
  const puntenPerPositie = [3, 2, 1];

  // Score per groep initieel 0
  const scores = {};

  // Tel punten op over alle gasten en alle categorieën
  Object.values(guests || {}).forEach(gast => {
    const stemmen = gast.stemmen;
    if (!stemmen) return;

    Object.values(stemmen).forEach(top3 => {
      top3.forEach((groepNaam, idx) => {
        if (!groepNaam) return;
        scores[groepNaam] = (scores[groepNaam] || 0) + puntenPerPositie[idx];
      });
    });
  });

  // Voeg ook groepen zonder score toe met 0 punten
  const allGroupsWithScores = Object.values(groepen || {}).map(groep => {
    return [groep.naam, scores[groep.naam] || 0];
  });

  // Sorteer groepen op punten aflopend
  const sorted = allGroupsWithScores.sort((a, b) => b[1] - a[1]);

  return (
    <section className="card max-w-3xl mx-auto">
      <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-purple-500/40 blur-[2px] opacity-60"></div>
      <div className="relative z-10">
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 text-center drop-shadow-[0_0_12px_#7C3AED] tracking-tight">
          Leaderboard
        </h2>

        {sorted.length === 0 ? (
          <p className="text-cyan-200 text-center py-8 bg-black/20 rounded-xl shadow-inner">
            Er zijn nog geen stemmen uitgebracht.
          </p>
        ) : (
          <ol className="list-decimal list-inside space-y-4 text-lg text-cyan-100">
            {sorted.map(([groepNaam, punten], idx) => {
              const kleur = Object.values(groepen).find(g => g.naam === groepNaam)?.kleur || null;

              return (
                <li
                  key={groepNaam}
                  className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span
                      className={`inline-block w-6 h-6 rounded-full border-2 border-white/30 shadow-md ${getColorClass(kleur)}`}
                      title={kleur || 'Onbekende kleur'}
                    />
                    <span className="font-semibold text-cyan-100">{groepNaam}</span>
                  </div>
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-[#18122B] rounded-full px-5 py-1 font-bold shadow whitespace-nowrap">
                    {punten} punt{punten !== 1 ? 'en' : ''}
                  </span>
                  <span className="ml-2">
                    {getTrophyIcon(idx)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
