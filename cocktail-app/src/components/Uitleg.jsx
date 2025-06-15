import React from 'react';

export default function Uitleg() {
  return (
    <section className="card p-8 sm:p-10 mb-8 flex flex-col items-center">
      {/* Neon border glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-pink-400/40 blur-[2px] opacity-60"></div>
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="flex items-center mb-6">
          <span className="text-4xl mr-3 animate-bounce drop-shadow-[0_0_8px_#FFD700]">🍹</span>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-fuchsia-300 to-purple-400 drop-shadow-[0_0_12px_#E879F9] tracking-tight">
            Welkom bij de Sip & Shade!
          </h2>
        </div>

        <p className="text-center text-lg text-cyan-100 font-medium max-w-2xl mb-8">
          Tijd om te shaken, mixen en feesten in stijl! Volg deze stappen om deel te nemen aan het kleurrijkste feestje van het jaar. 🥳
        </p>

        {/* Locatie & Datum - naast elkaar op grotere schermen */}
        <div className="flex flex-col sm:flex-row justify-between w-full max-w-2xl mb-8 gap-x-4 gap-y-4">
          {/* Locatie */}
          <div className="flex-1 flex flex-col items-center sm:items-end text-center sm:text-right bg-gradient-to-r from-cyan-900/60 via-purple-900/60 to-pink-900/60 border border-cyan-400/30 px-4 py-3 rounded-xl shadow-lg">
            <span className="text-cyan-200 font-semibold text-lg flex items-center gap-2 mb-1">📍 Locatie:</span>
            <span className="text-cyan-100 text-base">Jappe thuis, Averbode<br />Sprinkhaanstraat 51A</span>
          </div>

          {/* Datum */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left bg-gradient-to-r from-cyan-900/60 via-purple-900/60 to-pink-900/60 border border-cyan-400/30 px-4 py-3 rounded-xl shadow-lg">
            <span className="text-cyan-200 font-semibold text-lg flex items-center gap-2 mb-1">📅 Datum:</span>
            <span className="text-cyan-100 text-base">15 augustus 2025</span>
          </div>
        </div>

        <div className="space-y-6 text-lg text-cyan-100 font-medium w-full max-w-2xl">
          {/* Stap 1 */}
          <div className="bg-white/5 rounded-xl p-4 shadow-lg border border-cyan-400/20">
            <p className="flex items-center gap-3 text-pink-300 font-bold text-xl mb-2">
              🔐 Stap 1: Inloggen
            </p>
            <p>Maak een account aan met je eigen naam. Na het inloggen krijg je toegang tot alle tabs in de app.</p>
          </div>

          {/* Stap 2 */}
          <div className="bg-white/5 rounded-xl p-4 shadow-lg border border-rose-400/20">
            <p className="flex items-center gap-3 text-rose-300 font-bold text-xl mb-2">
              👥 Stap 2: Groep aanmaken
            </p>
            <p>
              Ga naar <span className="text-pink-400 font-semibold">"Groepen"</span>, maak een groep aan met je vrienden en kies een originele groepsnaam
              <span className="italic"> (deze wordt beoordeeld!)</span>.
            </p>
          </div>

          {/* Stap 3 */}
          <div className="bg-white/5 rounded-xl p-4 shadow-lg border border-yellow-300/20">
            <p className="flex items-center gap-3 text-yellow-300 font-bold text-xl mb-2">
              🎨 Stap 3: Kleur kiezen
            </p>
            <p>
              Kies als groep een <span className="text-yellow-200 font-semibold">kleur</span> die jullie zal vertegenwoordigen. Kleed je in die kleur voor de avond!
            </p>
          </div>

          {/* Stap 4 */}
          <div className="bg-white/5 rounded-xl p-4 shadow-lg border border-cyan-300/20">
            <p className="flex items-center gap-3 text-cyan-300 font-bold text-xl mb-2">
              🍸 Stap 4: Cocktail & hapje
            </p>
            <p>
              Voeg later jullie <span className="text-cyan-200 font-semibold">cocktail</span> en <span className="text-purple-200 font-semibold">hapje</span> toe in de app. Alles blijft bewerkbaar tot vlak voor de avond.
            </p>
          </div>

          {/* Stap 5 */}
          <div className="bg-white/5 rounded-xl p-4 shadow-lg border border-purple-300/20">
            <p className="flex items-center gap-3 text-purple-300 font-bold text-xl mb-2">
              🧃 Stap 5: Breng genoeg mee!
            </p>
            <p>
              Elke groep krijgt een <span className="font-semibold text-pink-300">4L glazen pitcher</span>. Zorg dat je genoeg ingrediënten meeneemt om deze goed te vullen.
            </p>
          </div>

          {/* Stap 6 */}
          <div className="bg-white/5 rounded-xl p-4 shadow-lg border border-green-300/20">
            <p className="flex items-center gap-3 text-green-300 font-bold text-xl mb-2">
              🗳️ Stap 6: Stemmen & prijzen
            </p>
            <>
              <p>
                Iedereen stemt op elkaar in deze categorieën:
              </p>
              <ul className="list-disc list-inside mt-2 text-base text-cyan-200 space-y-1">
                <li>Leukste groep</li>
                <li>Mooiste outfit</li>
                <li>Mooiste cocktail</li>
                <li>Lekkerste cocktail</li>
                <li>Beste groepsoutfit</li>
              </ul>
            </>
            <p className="mt-2">
              De <span className="text-purple-200 font-semibold">top 3 groepen</span> winnen een prijs aan het einde van de avond! 🏆
            </p>
          </div>
        </div>

        <p className="mt-8 text-xl text-cyan-200 font-semibold flex items-center gap-2 drop-shadow-[0_0_8px_#00CED1] animate-pulse">
          Laat het feestje beginnen!
        </p>
      </div>
    </section>
  );
}
