import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import Menu from './components/Menu';
import Uitleg from './components/Uitleg';
import Groepen from './components/Groepen';
import Leaderboard from './components/Leaderboard';
import Stemmen from './components/Stemmen';
import SipAndShadeLogo from './assets/SipAndShadeLogo';
import Login from './components/Login';
import EventTab from './components/EventTab';
import AdminPanel from './components/AdminPanel';
import { useAuth } from './context/AuthContext'; // <-- import useAuth
import './index.css';

const firebaseConfig = {
  apiKey: "AIzaSyCMbmUWZqJAPfLYM1bdBLmI3rdXJ2u5zhM",
  authDomain: "cocktail-2cbbb.firebaseapp.com",
  databaseURL: "https://cocktail-2cbbb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cocktail-2cbbb",
  storageBucket: "cocktail-2cbbb.firebasestorage.app",
  messagingSenderId: "580207006117",
  appId: "1:580207006117:web:daffb58bb56dafee12984c",
  measurementId: "G-R8W8L7EJPT"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const COLORS = [
  'Rood', 'Blauw', 'Geel', 'Groen', 'Oranje', 'Roze',
  'Paars', 'Turquoise', 'Zwart', 'Wit', 'Grijs', 'Bruin',
  'Lichtblauw', 'Lichtgroen', 'Zalm', 'Goud', 'Zilver', 'Beige',
];

export const dbInstance = db;

export default function App() {
  const [page, setPage] = useState(0);
  const [guests, setGuests] = useState({});
  const [groeps, setGroeps] = useState([]);
  const { user, isAdmin } = useAuth(); // <-- get isAdmin

  useEffect(() => {
    const guestsRef = ref(db, 'guests');
    onValue(guestsRef, (snapshot) => {
      setGuests(snapshot.val() || {});
    });
    const groepssRef = ref(db, 'groepen');
    onValue(groepssRef, (snapshot) => {
      setGroeps(snapshot.val() || {});
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a1026] to-[#7C3AED]">
      <header className="w-full flex flex-col items-center py-4 px-4 bg-gradient-to-b from-[#18122B]/80 via-[#3a2177]/70 to-transparent">
        <SipAndShadeLogo className="w-48 h-auto mb-4 drop-shadow-[0_0_16px_#7C3AED]" />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 mb-2 tracking-tight drop-shadow-[0_0_16px_#7C3AED] text-center">
          Cocktail Party
        </h1>
        <Menu page={page} setPage={setPage} user={{...user, admin: isAdmin}} />
      </header>

      <main className="flex-1 flex mt-4 justify-center items-start">
        <section className="w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-3xl shadow-[0_8px_40px_0_rgba(44,0,80,0.45)] p-6 sm:p-10 mt-6 mb-12 mx-2 border border-cyan-400/30 relative overflow-hidden">
          {/* Neon border glow effect */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-purple-500/40 blur-[2px] opacity-60"></div>
          <div className="relative z-10">
            {page === 0 && <Uitleg />}
            {page === 1 && <Groepen guests={guests} setGuests={setGuests} user={user} />}
            {page === 2 && <Leaderboard guests={guests} user={user} groepen={groeps} />}
            {page === 3 && <Stemmen guests={guests} user={user} groepen={groeps} />}
            {page === 4 && <EventTab/>}
            {page === 5 && <Login/>}
            {isAdmin && page === 6 && <AdminPanel groepen={groeps} user={user} />}
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-cyan-200 py-6 opacity-90 tracking-wider bg-gradient-to-t from-[#18122B]/80 via-[#3a2177]/70 to-transparent">
        <span className="drop-shadow-[0_0_8px_#00CED1]">
          &copy; {new Date().getFullYear()} Sip &amp; Shade. Cheers! 🍹
        </span>
      </footer>
    </div>
  );
}