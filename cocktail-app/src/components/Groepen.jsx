import React, { useState, useEffect } from "react";
import { ref, onValue, push, set, update } from "firebase/database";
import { dbInstance } from "../App";
import { useAuth } from '../context/AuthContext';
import getColorHex from '../helpers/getColorHex';

function ColorPicker({ value, onChange, colors, usedColors }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className={`w-full flex items-center gap-2 bg-black/40 border border-purple-400 rounded-lg px-3 py-2 text-cyan-100 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value ? (
          <>
            <span
              className={`inline-block w-5 h-5 rounded-full border-2 border-white/30 shadow-md ${getColorHex(value)}`}
            ></span>
            <span className="text-white">{value}</span>
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
      {open && (
        <ul
          className="absolute z-20 mt-1 w-full bg-[#18122B] border border-purple-400 rounded-lg shadow-lg max-h-40 overflow-auto"
          role="listbox"
        >
          {colors.map((kleur) => {
            const isUsed = usedColors.includes(kleur);
            return (
              <li
                key={kleur}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-purple-700/40 ${
                  value === kleur ? "bg-purple-800/60" : ""
                } ${isUsed && value !== kleur ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!isUsed || value === kleur) {
                    onChange(kleur);
                    setOpen(false);
                  }
                }}
                role="option"
                aria-selected={value === kleur}
                aria-disabled={isUsed && value !== kleur}
              >
                <span
                  className={`inline-block w-5 h-5 rounded-full border-2 border-white/30 shadow-md ${getColorHex(kleur)}`}
                ></span>
                <span className="text-white">{kleur}</span>
                {isUsed && value !== kleur && (
                  <span className="ml-2 text-xs text-pink-300">(in gebruik)</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function GroepBewerken({ groepId, groep, gasten, groepen, onClose }) {
  const [naam, setNaam] = useState(groep.naam || "");
  const [kleur, setKleur] = useState(groep.kleur || "");
  const [gekozenLeden, setGekozenLeden] = useState(groep.leden || []);
  const [cocktail, setCocktail] = useState(groep.cocktail || "");
  const [hapje, setHapje] = useState(groep.hapje || "");
  const [melding, setMelding] = useState("");

  // Verzamel alle leden die al in een andere groep zitten (behalve deze groep)
  const ledenInAndereGroepen = Object.entries(groepen)
    .filter(([id]) => id !== groepId)
    .flatMap(([, g]) => g.leden || []);

  // Verzamel alle kleuren die al in gebruik zijn (behalve deze groep)
  const kleurenInGebruik = Object.entries(groepen)
    .filter(([id]) => id !== groepId)
    .map(([, g]) => g.kleur)
    .filter(Boolean);

  const handleLidSelect = (lid) => {
    if (gekozenLeden.includes(lid)) {
      setGekozenLeden(gekozenLeden.filter((l) => l !== lid));
    } else if (gekozenLeden.length < 3) {
      setGekozenLeden([...gekozenLeden, lid]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!naam || !kleur || gekozenLeden.length === 0) {
      setMelding("Vul een groepsnaam, kleur en kies 1-3 leden.");
      return;
    }
    if (gekozenLeden.length > 3) {
      setMelding("Je mag maximaal 3 leden kiezen.");
      return;
    }
    // Check of gekozen leden al in een andere groep zitten
    const conflictLid = gekozenLeden.find((lid) => ledenInAndereGroepen.includes(lid));
    if (conflictLid) {
      setMelding(`Lid "${conflictLid}" zit al in een andere groep.`);
      return;
    }
    // Check of kleur al in gebruik is
    if (kleurenInGebruik.includes(kleur)) {
      setMelding("Deze kleur is al gekozen door een andere groep.");
      return;
    }
    try {
      await update(ref(dbInstance, `groepen/${groepId}`), {
        naam,
        kleur,
        leden: gekozenLeden,
        cocktail: cocktail || "",
        hapje: hapje || "",
      });
      // Update elke guest met de groepskleur (optioneel)
      for (const lid of gekozenLeden) {
        await set(ref(dbInstance, `guests/${lid}/kleur`), kleur);
      }
      setMelding("Groep succesvol bijgewerkt!");
      setTimeout(() => {
        setMelding("");
        onClose();
      }, 1200);
    } catch {
      setMelding("Er ging iets mis bij het bijwerken van de groep.");
    }
  };

  const COLORS = [
    'Rood', 'Blauw', 'Geel', 'Groen', 'Oranje', 'Roze', 'Paars', 'Turquoise', 'Zwart', 'Wit', 'Grijs', 'Bruin', 'Lichtblauw', 'Lichtgroen', 'Zalm', 'Goud', 'Zilver', 'Beige'
  ];

  // Overlay sluit bij Escape
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
        className="card flex flex-col gap-2 w-full max-w-2xl mx-auto mb-8"
      >
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
              onChange={(e) => setNaam(e.target.value)}
            />
            <ColorPicker
              value={kleur}
              onChange={setKleur}
              colors={COLORS}
              usedColors={kleurenInGebruik}
            />
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
                      onClick={() => !isUsed && handleLidSelect(gast)}
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
              onChange={(e) => setCocktail(e.target.value)}
            />
            <input
              type="text"
              className="bg-black/40 border border-purple-400 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition"
              placeholder="Hapje (optioneel)"
              value={hapje}
              onChange={(e) => setHapje(e.target.value)}
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

export default function Groepen({  user }) {
  const [naam, setNaam] = useState("");
  const [kleur, setKleur] = useState("");
  const [gasten, setGasten] = useState([]);
  const [gekozenLeden, setGekozenLeden] = useState([]);
  const [cocktail, setCocktail] = useState("");
  const [hapje, setHapje] = useState("");
  const [melding, setMelding] = useState("");
  const [groepen, setGroepen] = useState({});
  const [bewerkGroepId, setBewerkGroepId] = useState(null);
  const [groepenLocked, setGroepenLocked] = useState(false);
  const { isAdmin } = useAuth();

  const COLORS = [
    'Rood', 'Blauw', 'Geel', 'Groen', 'Oranje', 'Roze', 'Paars', 'Turquoise', 'Zwart', 'Wit', 'Grijs', 'Bruin', 'Lichtblauw', 'Lichtgroen', 'Zalm', 'Goud', 'Zilver', 'Beige'
  ];

  if (!user) {
    return (
      <section className="p-8 text-center text-cyan-200">
        <p>Log in om te stemmen.</p>
      </section>
    );
  }

  // Haal bestaande guests en groepen op
  useEffect(() => {
    const gastenRef = ref(dbInstance, "guests");
    const unsubGasten = onValue(gastenRef, (snapshot) => {
      const val = snapshot.val() || {};
      setGasten(Object.keys(val));
    });
    const groepenRef = ref(dbInstance, "groepen");
    const unsubGroepen = onValue(groepenRef, (snapshot) => {
      setGroepen(snapshot.val() || {});
    });
    return () => {
      unsubGasten();
      unsubGroepen();
    };
  }, []);

  // Haal lock-status op uit database
  useEffect(() => {
    const lockRef = ref(dbInstance, 'groepenLocked');
    const unsub = onValue(lockRef, (snap) => {
      setGroepenLocked(!!snap.val());
    });
    return () => unsub();
  }, []);

  // Verzamel alle leden die al in een groep zitten
  const ledenInGroepen = Object.values(groepen)
    .flatMap((groep) => groep.leden || []);

  // Verzamel alle kleuren die al in gebruik zijn
  const kleurenInGebruik = Object.values(groepen)
    .map((groep) => groep.kleur)
    .filter(Boolean);

  const handleLidSelect = (lid) => {
    if (gekozenLeden.includes(lid)) {
      setGekozenLeden(gekozenLeden.filter((l) => l !== lid));
    } else if (gekozenLeden.length < 3) {
      setGekozenLeden([...gekozenLeden, lid]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!naam || !kleur || gekozenLeden.length === 0) {
      setMelding("Vul een groepsnaam, kleur en kies 1-3 leden.");
      return;
    }
    if (gekozenLeden.length > 3) {
      setMelding("Je mag maximaal 3 leden kiezen.");
      return;
    }
    // Check of gekozen leden al in een groep zitten
    const conflictLid = gekozenLeden.find((lid) => ledenInGroepen.includes(lid));
    if (conflictLid) {
      setMelding(`Lid "${conflictLid}" zit al in een andere groep.`);
      return;
    }
    // Check of kleur al in gebruik is
    if (kleurenInGebruik.includes(kleur)) {
      setMelding("Deze kleur is al gekozen door een andere groep.");
      return;
    }
    try {
      await push(ref(dbInstance, "groepen"), {
        naam,
        kleur,
        leden: gekozenLeden,
        cocktail: cocktail || "",
        hapje: hapje || "",
      });
      // Update elke guest met de groepskleur (optioneel)
      for (const lid of gekozenLeden) {
        await set(ref(dbInstance, `guests/${lid}/kleur`), kleur);
      }
      setMelding("Groep succesvol aangemaakt!");
      setNaam("");
      setKleur("");
      setGekozenLeden([]);
      setCocktail("");
      setHapje("");
      setTimeout(() => setMelding(""), 2000);
    } catch {
      setMelding("Er ging iets mis bij het aanmaken van de groep.");
    }
  };

  // Voeg een functie toe om een groep te verwijderen
  const handleDeleteGroep = async (groepId) => {
    if (!window.confirm('Weet je zeker dat je deze groep wilt verwijderen?')) return;
    try {
      await set(ref(dbInstance, `groepen/${groepId}`), null);
      setMelding('Groep verwijderd.');
      setTimeout(() => setMelding(''), 2000);
    } catch {
      setMelding('Verwijderen mislukt.');
    }
  };

  // Admin kan locken/unlocken
  const handleLockToggle = async () => {
    await set(ref(dbInstance, 'groepenLocked'), !groepenLocked);
  };

  return (
    <div>
      {/* Admin lock toggle */}
      {isAdmin && (
        <div className="flex justify-end max-w-2xl mx-auto mb-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-full font-bold shadow-md border-2 transition-all duration-200 ${groepenLocked ? 'bg-pink-700/80 border-pink-400 text-white' : 'bg-cyan-700/80 border-cyan-400 text-white'}`}
            onClick={handleLockToggle}
          >
            {groepenLocked ? 'Groepen bewerken vergrendeld' : 'Groepen bewerken ontgrendeld'}
          </button>
        </div>
      )}
      {/* Groep aanmaken */}
      <form
        onSubmit={handleSubmit}
        className="card flex flex-col gap-2 w-full max-w-2xl mx-auto mb-8"
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-purple-500/40 blur-[2px] opacity-60"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 mb-2 text-center tracking-wide drop-shadow-[0_0_8px_#7C3AED]">
            Nieuwe groep aanmaken
          </h3>
          {groepenLocked && (
            <div className="text-center text-pink-400 font-semibold mb-2">Groepen bewerken is vergrendeld door de admin.</div>
          )}
          <fieldset className={groepenLocked ? 'opacity-50 pointer-events-none select-none' : ''} disabled={groepenLocked}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                className="bg-black/40 border border-purple-400 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition"
                placeholder="Groepsnaam"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
              />
              <ColorPicker value={kleur} onChange={setKleur} colors={COLORS} usedColors={kleurenInGebruik} />
              <div className="col-span-2">
                <label className="block text-cyan-200 mb-1">Kies maximaal 3 leden:</label>
                <div className="flex flex-wrap gap-2">
                  {gasten.length === 0 && (
                    <span className="text-purple-300">Geen gasten beschikbaar</span>
                  )}
                  {gasten.map((gast) => {
                    const isUsed = ledenInGroepen.includes(gast);
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
                        onClick={() => !isUsed && handleLidSelect(gast)}
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
                onChange={(e) => setCocktail(e.target.value)}
              />
              <input
                type="text"
                className="bg-black/40 border border-purple-400 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition"
                placeholder="Hapje (optioneel)"
                value={hapje}
                onChange={(e) => setHapje(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-[#18122B] px-4 py-2 rounded-full font-semibold shadow-md hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-200 self-center"
              disabled={groepenLocked}
            >
              Groep aanmaken
            </button>
            {melding && <p className="mt-2 text-center text-pink-300">{melding}</p>}
          </fieldset>
        </div>
      </form>

      {/* Overzicht van groepen */}
      <div className="w-full max-w-5xl card p-6 sm:p-10 mb-8">
        <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-purple-500/40 blur-[2px] opacity-60"></div>
        <h2 className="relative z-10 text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 text-center drop-shadow-[0_0_12px_#7C3AED] tracking-tight">
          Aangemaakte groepen
        </h2>
        <div className="relative z-10">
          {Object.keys(groepen).length === 0 ? (
            <p className="text-cyan-200 text-center py-8 bg-black/20 rounded-xl shadow-inner">
              Er zijn nog geen groepen aangemaakt.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
              {Object.entries(groepen).map(([groepId, groep]) => {
                const isLid = (groep.leden || []).includes(user?.displayName) || (groep.leden || []).includes(user?.email);
                return (
                  <div
                    key={groepId}
                    className="relative bg-gradient-to-br from-[#18122B] via-[#3a2177] to-[#7C3AED]/80 border-2 border-purple-700 rounded-2xl shadow-xl p-6 flex flex-col gap-3 card hover:scale-[1.025] hover:border-cyan-400 transition-transform duration-200 overflow-hidden"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-cyan-400/40 blur-[2px] opacity-40"></div>
                    <div className="relative z-10">
                      <h3 className="font-bold text-lg mb-2 text-yellow-300 tracking-wide flex items-center gap-2 drop-shadow-[0_0_8px_#FFD700]">
                        <span
                          className={`inline-block w-5 h-5 rounded-full border-2 border-white/30 shadow-md ${getColorHex(groep.kleur)}`}
                          title={groep.kleur}
                        ></span>
                        {groep.naam}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-800/60 text-cyan-200 text-xs font-semibold uppercase tracking-wider">
                          {groep.kleur}
                        </span>
                        {groep.cocktail && (
                          <span className="px-2 py-0.5 rounded-full bg-pink-700/60 text-yellow-200 text-xs font-semibold">
                            {groep.cocktail}
                          </span>
                        )}
                        {groep.hapje && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-700/60 text-pink-200 text-xs font-semibold">
                            {groep.hapje}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-cyan-100">Leden:</span>
                        <ul className="list-disc list-inside ml-4 text-cyan-100">
                          {(groep.leden || []).map((lid, idx) => (
                            <li key={idx}>{lid}</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        className="mt-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-[#18122B] px-4 py-1 rounded-full font-semibold shadow-md hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-200 self-end"
                        onClick={() => setBewerkGroepId(groepId)}
                        disabled={groepenLocked || (!isAdmin && !isLid)}
                        style={{ display: (isAdmin || isLid) ? undefined : 'none' }}
                      >
                        Bewerk
                      </button>
                      {isAdmin && (
                        <button
                          className="mt-3 ml-2 bg-red-600 text-white px-4 py-1 rounded-full font-semibold shadow-md hover:bg-red-700 transition-all duration-200 self-end"
                          onClick={() => handleDeleteGroep(groepId)}
                          disabled={groepenLocked}
                        >
                          Verwijder
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Overlay bewerkformulier */}
      {bewerkGroepId && (
        <GroepBewerken
          groepId={bewerkGroepId}
          groep={groepen[bewerkGroepId]}
          gasten={gasten}
          groepen={groepen}
          onClose={() => setBewerkGroepId(null)}
        />
      )}
    </div>
  );
}