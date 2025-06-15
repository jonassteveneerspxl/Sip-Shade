import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { dbInstance } from "../App";
import { useAuth } from '../context/AuthContext';


export default function RegistrationForm({ onRegistered }) {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user, } = useAuth();
  
  if (user) {
      return;
    }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    // Validatie
    if (!naam || !email || !password || !password2) {
      setError("Vul alle velden in.");
      return;
    }
    if (password !== password2) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }
    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens zijn.");
      return;
    }

    try {
      // Check of de naam al bestaat als guest
      const guestRef = ref(dbInstance, `guests/${naam}`);
      const guestSnap = await get(guestRef);
      if (guestSnap.exists()) {
        setError("Deze naam is al in gebruik als gast. Kies een andere naam.");
        return;
      }
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Zet displayName in Firebase Authentication profiel
      await import('firebase/auth').then(({ updateProfile }) => updateProfile(userCredential.user, { displayName: naam }));
      // Sla de naam op in de database onder users/{uid}
      await set(ref(dbInstance, `users/${userCredential.user.uid}`), {
        naam,
        email,
        admin: false, // standaard geen admin, handmatig aan te passen in database
      });
      // Maak ook een guest aan met deze naam
      await set(ref(dbInstance, `guests/${naam}`), {
        kleur: "",
        stem: "",
      });
      setSuccess("Registratie gelukt! Je bent nu ingelogd.");
      setNaam("");
      setEmail("");
      setPassword("");
      setPassword2("");
      if (onRegistered) onRegistered();
    } catch (err) {
      console.log(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Dit e-mailadres is al in gebruik.");
      } else if (err.code === "auth/invalid-email") {
        setError("Ongeldig e-mailadres.");
      } else {
        setError("Registratie mislukt. Probeer het opnieuw.");
      }
      console.error("Registration error:", err);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="card flex flex-col gap-3 items-center max-w-sm mx-auto mt-6"
    >
      <h2 className="text-lg font-bold text-cyan-200 mb-2">Registreren</h2>
      <input
        type="text"
        placeholder="Naam"
        value={naam}
        onChange={(e) => setNaam(e.target.value)}
        className="px-3 py-2 rounded border w-full"
        required
      />
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-3 py-2 rounded border w-full"
        required
      />
      <input
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-3 py-2 rounded border w-full"
        required
      />
      <input
        type="password"
        placeholder="Herhaal wachtwoord"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        className="px-3 py-2 rounded border w-full"
        required
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-[#18122B] w-full"
      >
        Registreren
      </button>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
      {success && <span className="text-green-400 text-sm mt-1">{success}</span>}
    </form>
  );
}