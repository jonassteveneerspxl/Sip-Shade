import React, { useState, useEffect, useRef } from 'react';
import { ref, update, set, onValue } from 'firebase/database';
import { dbInstance } from '../App';
import getColorHex from '../helpers/getColorHex';

const COLORS = [
  'Rood', 'Blauw', 'Geel', 'Groen', 'Oranje', 'Roze', 'Paars', 'Turquoise', 'Zwart', 'Wit', 'Grijs', 'Bruin', 'Lichtblauw', 'Lichtgroen', 'Zalm', 'Goud', 'Zilver', 'Beige'
];

export default function GroepBewerken({ groepId, groep, onClose, onGroepBewerkt }) {
  const [naam, setNaam] = useState(groep.naam || '');
  const [kleur, setKleur] = useState(groep.kleur || '');
  const [ledenInput, setLedenInput] = useState((groep.leden || []).join(', '));
  const [cocktail, setCocktail] = useState(groep.cocktail || '');
  const [hapje, setHapje] = useState(groep.hapje || '');
  const [melding, setMelding] = useState('');
  const [gasten, setGasten] = useState([]);
  const [groepen, setGroepen] = useState({});
  const [showColors, setShowColors] = useState(false);
  const oudeLedenRef = useRef(groep.leden || []);

  // Haal gasten en groepen op
  useEffect(() => {
    const gastenRef = ref(dbInstance, 'guests');
    const unsubGasten = onValue(gastenRef, (snapshot) => {
      const val = snapshot.val() || {};
      setGasten(Object.keys(val));
    });
    const groepenRef = ref(dbInstance, 'groepen');
    const unsubGroepen = onValue(groepenRef, (snapshot) => {
      setGroepen(snapshot.val() || {});
    });
    return () => {
      unsubGasten();
      unsubGroepen();
    };
  }, []);

  // Verzamel alle leden die al in een andere groep zitten (behalve deze groep)
  const ledenInAndereGroepen = Object.entries(groepen)
    .filter(([id]) => id !== groepId)
    .flatMap(([, g]) => g.leden || []);

  // Verzamel alle kleuren die al in gebruik zijn (behalve deze groep)
  const kleurenInGebruik = Object.entries(groepen)
    .filter(([id]) => id !== groepId)
    .map(([, g]) => g.kleur)
    .filter(Boolean);

  // Leden selectie logica
  const gekozenLeden = ledenInput
    .split(',')
    .map(lid => lid.trim())
    .filter(Boolean);

  const handleLidToggle = (lid) => {
    let nieuweLeden;
    if (gekozenLeden.includes(lid)) {
      nieuweLeden = gekozenLeden.filter(l => l !== lid);
    } else if (gekozenLeden.length < 3) {
      nieuweLeden = [...gekozenLeden, lid];
    } else {
      nieuweLeden = gekozenLeden;
    }
    setLedenInput(nieuweLeden.join(', '));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!naam || !kleur || gekozenLeden.length === 0) {
      setMelding('Vul een groepsnaam, kleur en kies 1-3 leden.');
      return;
    }
    if (gekozenLeden.length > 3) {
      setMelding('Je mag maximaal 3 leden kiezen.');
      return;
    }
    // Check of gekozen leden al in een andere groep zitten
    const conflictLid = gekozenLeden.find(lid => ledenInAndereGroepen.includes(lid));
    if (conflictLid) {
      setMelding(`Lid "${conflictLid}" zit al in een andere groep.`);
      return;
    }
    // Check of kleur al in gebruik is
    if (kleurenInGebruik.includes(kleur)) {
      setMelding('Deze kleur is al gekozen door een andere groep.');
      return;
    }
    try {
      // 1. Update groep
      await update(ref(dbInstance, `groepen/${groepId}`), {
        naam,
        kleur,
        leden: gekozenLeden,
        cocktail: cocktail || '',
        hapje: hapje || ''
      });

      // 2. Reset kleur van leden die verwijderd zijn
      const oudeLeden = oudeLedenRef.current;
      const verwijderdeLeden = oudeLeden.filter(lid => !gekozenLeden.includes(lid));
      for (const lid of verwijderdeLeden) {
        await set(ref(dbInstance, `guests/${lid}/kleur`), "");
      }
      // 3. Zet kleur voor nieuwe/blijvende leden
      for (const lid of gekozenLeden) {
        await set(ref(dbInstance, `guests/${lid}/kleur`), kleur);
      }
      // 4. Update oudeLedenRef voor volgende edit
      oudeLedenRef.current = gekozenLeden;

      setMelding('Groep succesvol bijgewerkt!');
      if (onGroepBewerkt) onGroepBewerkt();
      if (onClose) setTimeout(onClose, 1000); // Sluit na 1s automatisch
    } catch (err) {
      setMelding('Er ging iets mis bij het bijwerken van de groep.');
    }
  };

  // Sluit overlay bij Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        onSubmit={handleSubmit}
        className="relative card p-6 max-w-xl w-full mx-auto overflow-hidden"
      >
        {/* Neon border glow effect */}
        <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-purple-500/40 blur-[2px] opacity-60"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 drop-shadow-[0_0_8px_#7C3AED] text-center">
            Groep bewerken
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              className="bg-black/40 border border-purple-400 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition"
              placeholder="Groepsnaam"
              value={naam}
              onChange={e => setNaam(e.target.value)}
            />
            {/* ColorPicker inline */}
            <div className="relative">
              <button
                type="button"
                className={`w-full flex items-center gap-2 bg-black/40 border border-purple-400 rounded-lg px-3 py-2 text-cyan-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
                onClick={() => setShowColors((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={showColors}
              >
                {kleur ? (
                  <>
                    <span
                      className={`inline-block w-5 h-5 rounded-full border-2 border-white/30 shadow-md ${getColorHex(kleur)}`}
                    ></span>
                    <span className="text-white">{kleur}</span>
                  </>
                ) : (
                  <span className="text-purple-300">Kies een kleur</span>
                )}
                <svg
                  className="ml-auto w-4 h-4 text-cyan-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showColors && (
                <ul
                  className="absolute z-20 mt-1 w-full bg-[#18122B] border border-purple-400 rounded-lg shadow-lg max-h-40 overflow-auto"
                  role="listbox"
                >
                  {COLORS.map((kleurOpt) => {
                    const isUsed = kleurenInGebruik.includes(kleurOpt);
                    return (
                      <li
                        key={kleurOpt}
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-purple-700/40 ${
                          kleur === kleurOpt ? "bg-purple-800/60" : ""
                        } ${isUsed && kleur !== kleurOpt ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {
                          if (!isUsed || kleur === kleurOpt) {
                            setKleur(kleurOpt);
                            setShowColors(false);
                          }
                        }}
                        role="option"
                        aria-selected={kleur === kleurOpt}
                        aria-disabled={isUsed && kleur !== kleurOpt}
                      >
                        <span
                          className={`inline-block w-5 h-5 rounded-full border-2 border-white/30 shadow-md ${getColorHex(kleurOpt)}`}
                        ></span>
                        <span className="text-white">{kleurOpt}</span>
                        {isUsed && kleur !== kleurOpt && (
                          <span className="ml-2 text-xs text-pink-300">(in gebruik)</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-cyan-200 mb-1">Kies maximaal 3 leden:</label>
              <div className="flex flex-wrap gap-2">
                {gasten.length === 0 && (
                  <span className="text-purple-300">Geen gasten beschikbaar</span>
                )}
                {gasten.map((gast) => {
                  const isUsed = ledenInAndereGroepen.includes(gast);
                  const isSelected = gekozenLeden.includes(gast);
                  return (
                    <button
                      type="button"
                      key={gast}
                      className={`px-3 py-1 rounded-full border-2 font-semibold transition
                        ${
                          isSelected
                            ? "bg-cyan-400 text-[#18122B] border-cyan-400"
                            : "bg-black/40 text-cyan-100 border-purple-400 hover:bg-purple-700/40"
                        }
                        ${
                          (gekozenLeden.length >= 3 && !isSelected) || isUsed
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      `}
                      onClick={() => !isUsed && handleLidToggle(gast)}
                      disabled={
                        ((gekozenLeden.length >= 3 && !isSelected) || isUsed)
                      }
                    >
                      {gast}
                      {isUsed && !isSelected && (
                        <span className="ml-2 text-xs text-pink-300">(in groep)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <input
              type="text"
              className="bg-black/40 border border-purple-400 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition"
              placeholder="Cocktail (optioneel)"
              value={cocktail}
              onChange={e => setCocktail(e.target.value)}
            />
            <input
              type="text"
              className="bg-black/40 border border-purple-400 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition"
              placeholder="Hapje (optioneel)"
              value={hapje}
              onChange={e => setHapje(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-4 justify-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-[#18122B] px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-200"
            >
              Opslaan
            </button>
            <button
              type="button"
              className="bg-gray-700/70 text-cyan-100 px-6 py-2 rounded-full font-bold hover:bg-gray-600 transition-all duration-150"
              onClick={onClose}
            >
              Annuleren
            </button>
          </div>
          {melding && <p className="mt-2 text-center text-pink-300">{melding}</p>}
        </div>
      </form>
    </div>
  );
}