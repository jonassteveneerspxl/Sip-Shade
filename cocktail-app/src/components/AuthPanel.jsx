import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPanel() {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-4 p-4 mb-4 max-w-sm mx-auto">
        <span className="text-cyan-200 font-semibold">Hello, {user.email}</span>
        <button onClick={logout} className="bg-gradient-to-r from-purple-600 to-pink-400 text-white px-6 py-2 rounded-full font-bold shadow-md hover:scale-105 hover:bg-purple-700 transition-all duration-200">
          Logout
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="card flex flex-col gap-3 items-center max-w-sm mx-auto mt-6">
      <h2 className="text-lg font-bold text-cyan-200 mb-2">Inloggen</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-[#18122B] w-full">
        Login
      </button>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </form>
  );
}