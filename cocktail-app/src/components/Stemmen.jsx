import React, { useState, useEffect } from 'react';
import { ref, update, get } from 'firebase/database';
import { dbInstance } from '../App';

// Mapping van groepskleuren naar Tailwind classes
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

const getColorClass = kleur => COLOR_MAP[kleur] || 'bg-gray-500';

const categorieen = [
  { key: 'lekkersteCocktail', label: 'Lekkerste cocktail' },
  { key: 'mooisteOutfit', label: 'Mooiste outfit' },
  { key: 'leuksteGroep', label: 'Leukste groep' },
  { key: 'mooisteCocktail', label: 'Mooiste cocktail' },
  { key: 'besteGroepsNaam', label: 'Beste groepsnaam' },
];

export default function Stemmen({ guests, user, groepen }) {
  const [naam, setNaam] = useState('');
  const [stemmen, setStemmen] = useState(() =>
    Object.fromEntries(categorieen.map(({ key }) => [key, ['', '', '']]))
  );
  const [melding, setMelding] = useState('');
  const [loadingNaam, setLoadingNaam] = useState(true);

  const groepsNamen = Object.values(groepen || {}).map(g => g.naam).filter(Boolean);

  useEffect(() => {
    let active = true;
    const fetchNaam = async () => {
      if (!user?.uid) return setLoadingNaam(false);

      try {
        const snap = await get(ref(dbInstance, `users/${user.uid}/naam`));
        if (active) {
          setNaam(snap.exists() ? snap.val() : '');
        }
      } catch {
        if (active) setNaam('');
      } finally {
        if (active) setLoadingNaam(false);
      }
    };
    fetchNaam();
    return () => (active = false);
  }, [user]);

  useEffect(() => {
    if (guests?.[naam]?.stemmen) {
      setStemmen(guests[naam].stemmen);
    }
  }, [guests, naam]);

  if (!user) {
    return (
      <section className="p-8 text-center text-cyan-200">
        <p>Log in om te stemmen.</p>
      </section>
    );
  }

  const isGekozen = (categorieKey, groepNaam, plek) =>
    stemmen[categorieKey].some((g, i) => g === groepNaam && i !== plek);

  const handleStemChange = (categorieKey, plek, waarde) => {
    setStemmen(prev => ({
      ...prev,
      [categorieKey]: [...prev[categorieKey].slice(0, plek), waarde, ...prev[categorieKey].slice(plek + 1)],
    }));
  };

  const handleStemOpslaan = async (e) => {
    e.preventDefault();

    if (!naam.trim()) return setMelding('Kon je naam niet ophalen. Probeer opnieuw in te loggen.');
    if (!guests?.[naam]) return setMelding('Deze naam is niet bekend. Neem contact op met de organisatie.');

    for (const { key, label } of categorieen) {
      const keuzes = stemmen[key].filter(Boolean);
      const uniek = new Set(keuzes);
      if (!keuzes.length) return setMelding(`Vul minstens één stem in voor "${label}".`);
      if (uniek.size !== keuzes.length)
        return setMelding(`Je kunt niet twee keer dezelfde groep kiezen bij "${label}".`);
    }

    try {
      await update(ref(dbInstance, `guests/${naam}`), { stemmen });
      setMelding('Stem succesvol opgeslagen! 🎉');
      setTimeout(() => setMelding(''), 3000);
    } catch {
      setMelding('Er ging iets mis bij het opslaan van je stem.');
    }
  };

  return (
    <section className="card max-w-4xl mx-auto">
      <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-purple-500/40 blur-[2px] opacity-60"></div>
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 text-center drop-shadow-[0_0_12px_#7C3AED] tracking-tight">
          Stem op jouw favorieten (Top 3)
        </h2>
        <form onSubmit={handleStemOpslaan} className="w-full max-w-3xl flex flex-col gap-8">
          <input
            type="text"
            className="bg-black/40 border border-purple-400 rounded-lg px-4 py-2 text-cyan-100 placeholder:text-purple-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 transition w-full max-w-sm mx-auto"
            placeholder="Jouw naam"
            value={loadingNaam ? 'Laden...' : naam}
            readOnly
            disabled={loadingNaam}
          />

          {categorieen.map(({ key, label }) => (
            <fieldset key={key} className="border border-purple-700 rounded-lg p-4">
              <legend className="text-lg font-semibold text-purple-300 mb-4">{label}</legend>
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((plek) => {
                  const gekozen = stemmen[key][plek];
                  const groep = Object.values(groepen || {}).find(g => g.naam === gekozen);

                  return (
                    <div key={plek} className="flex items-center gap-3">
                      <span className="w-8 text-sm text-cyan-300 font-semibold text-right">
                        {`${plek + 1}e`}
                      </span>
                      <KleurDropDown
                        value={gekozen}
                        onChange={(waarde) => handleStemChange(key, plek, waarde)}
                        opties={groepsNamen}
                        groepen={groepen}
                        disabledOpties={groepsNamen.filter(groepNaam => isGekozen(key, groepNaam, plek))}
                      />
                      {groep && (
                        <span
                          className={`ml-2 w-5 h-5 rounded-full inline-block border-2 border-white shadow ${getColorClass(
                            groep.kleur
                          )}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {melding && (
            <p className="mt-2 text-center text-pink-300 font-semibold">{melding}</p>
          )}

          <button
            type="submit"
            className="mt-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-[#18122B] px-6 py-3 rounded-full font-semibold shadow-md hover:scale-105 hover:shadow-cyan-400/50 transition-all duration-200 max-w-sm mx-auto"
            disabled={loadingNaam}
          >
            Stem opslaan
          </button>
        </form>
      </div>
    </section>
  );
}

import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

function KleurDropDown({ value, onChange, opties, groepen, disabledOpties }) {
  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-full max-w-xs">
          <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-black/60 border-2 border-purple-600 py-2 pl-4 pr-10 text-left text-cyan-100 shadow-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400">
            <span>{value || 'Kies een groep'}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-5 w-5 text-purple-300" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white/90 py-1 text-base shadow-lg ring-1 ring-black/20 focus:outline-none sm:text-sm">
            {/* Optie om te deselecteren */}
            <Listbox.Option value="" className={({ active }) =>
              `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-cyan-100 text-black' : 'text-gray-900'}`
            }>
              <span className="block truncate italic text-gray-400">Kies een groep</span>
            </Listbox.Option>
            {opties.map((groepNaam) => {
              const groep = Object.values(groepen || {}).find(g => g.naam === groepNaam);
              const kleur = groep?.kleur || 'Onbekend';
              const isDisabled = disabledOpties.includes(groepNaam);

              return (
                <Listbox.Option
                  key={groepNaam}
                  value={groepNaam}
                  disabled={isDisabled}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      isDisabled
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed italic'
                        : active
                        ? 'bg-cyan-100 text-black'
                        : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`absolute left-2 top-2 w-4 h-4 rounded-full border border-white shadow ${getColorClass(
                          kleur
                        )}`}
                      ></span>
                      <span className={`block truncate ${selected ? 'font-bold' : ''}`}>
                        {groepNaam}
                      </span>
                      {selected && !isDisabled && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-cyan-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </div>
      )}
    </Listbox>
  );
}
