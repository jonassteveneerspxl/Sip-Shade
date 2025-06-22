import React, { useState } from 'react';

export default function Menu({ page, setPage, user }) {
  const [open, setOpen] = useState(false);
  const menuItems = ['Uitleg', 'Groepen', 'Leaderboard', 'Stemmen', 'Event', 'Login'];
  // Voeg Admin toe als de gebruiker admin is
  const items = user?.admin ? [...menuItems, 'Admin'] : menuItems;

  return (
    <nav className="relative w-full">
      {/* Hamburger button for mobile */}
      <button
        className="sm:hidden absolute left-2 top-2 z-20 flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 shadow-lg focus:outline-none"
        aria-label="Menu openen"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`block w-6 h-0.5 bg-[#18122B] mb-1 rounded transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-[#18122B] mb-1 rounded transition-all duration-200 ${open ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-[#18122B] rounded transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>
      {/* Menu items */}
      <div
        className={`
          flex-col sm:flex-row sm:static sm:flex
          ${open ? 'flex' : 'hidden'}
          sm:gap-4 gap-2
          bg-gradient-to-r from-[#18122B]/95 via-[#3a2177]/90 to-[#7C3AED]/90
          p-4 sm:p-2 rounded-2xl mb-6
          justify-center items-center
          text-cyan-100 font-semibold shadow-[0_4px_24px_0_rgba(44,0,80,0.35)]
          backdrop-blur-md border border-purple-700/40 whitespace-nowrap
          absolute sm:relative top-14 left-0 w-full sm:w-auto z-10
        `}
      >
        {items.map((p, i) => (
          <button
            key={p}
            className={`py-2 px-6 sm:py-2 sm:px-4 rounded-full transition-all duration-150 w-full sm:w-auto text-left sm:text-center
              ${page === i
                ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-[#18122B] font-bold shadow-lg ring-2 ring-cyan-300/60'
                : 'hover:bg-white/10 hover:text-cyan-200'}
            `}
            onClick={() => {
              setPage(i);
              setOpen(false);
            }}
            aria-current={page === i ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
      </div>
    </nav>
  );
}
