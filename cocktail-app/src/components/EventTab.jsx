import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

// Dummy events data
const events = [
  {
    name: 'Cocktailronde',
    time: new Date('2025-08-15T15:00:00'),
  },
  {
    name: 'Stemmen',
    time: new Date('2025-08-15T16:00:00'),
  },
  {
    name: 'Scavenger Hunt Start',
    time: new Date('2025-08-15T17:00:00'),
  },
  {
    name: 'BBQ en Borrel',
    time: new Date('2025-08-15T18:00:00'),
  },
  {
    name: 'Prijsuitreiking',
    time: new Date('2025-08-15T19:00:00'),
  },
  {
    name: 'Feesten tot in de late uurtjes',
    time: new Date('2025-08-15T19:30:00'),
  }
];

// Time calculation helper function
function getTimeLeft(target) {
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  let result = '';
  if (days > 0) result += `${days}d `;
  result += `${hours}u ${minutes}m ${seconds}s`;
  return result.trim();
}

const EventTab = () => {
  const [nextEvent, setNextEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const { isAdmin } = useAuth();


  // Set up event timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const upcoming = events.find(e => e.time > now);
      setNextEvent(upcoming);
      setTimeLeft(upcoming ? getTimeLeft(upcoming.time) : null);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show alert/notification for the next event
  useEffect(() => {
    if (nextEvent && timeLeft) {
      // Geef een alert als het event binnen 5 minuten start
      const [h, m, s] = timeLeft.split(/[u m s]+/).map(Number);
      const totalSeconds = (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
      if (totalSeconds <= 300 && totalSeconds > 0) {
        if (!window.__eventAlertShown || window.__eventAlertShown !== nextEvent.name) {
          // Mobiel: custom popup, anders Notification API
          if (window.matchMedia('(max-width: 600px)').matches) {
            showMobilePopup(`Let op! ${nextEvent.name} begint bijna! (${timeLeft})`);
          } else {
            alert(`Let op! ${nextEvent.name} begint bijna! (${timeLeft})`);
          }
          window.__eventAlertShown = nextEvent.name;
        }
      }
    }
  }, [nextEvent, timeLeft]);


  // Voeg een eenvoudige mobiele popup toe
  function showMobilePopup(message) {
    // Gebruik een custom popup voor mobiel
    const popup = document.createElement('div');
    popup.innerText = message;
    popup.style.position = 'fixed';
    popup.style.bottom = '32px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(24,18,43,0.95)';
    popup.style.color = '#fff';
    popup.style.padding = '16px 24px';
    popup.style.borderRadius = '16px';
    popup.style.boxShadow = '0 4px 24px 0 rgba(44,0,80,0.35)';
    popup.style.zIndex = 9999;
    popup.style.fontSize = '1.1rem';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '90vw';
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.style.opacity = '0';
      setTimeout(() => document.body.removeChild(popup), 500);
    }, 3500);
  }

  return (
    <div className="text-white w-full max-w-xl mx-auto px-2 sm:px-0 card">
      <h2 className="text-2xl font-bold m-4 text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]">Event Programma</h2>
      <ul className="space-y-2 m-6">
        {events.map((event, idx) => (
          <li key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white/5 rounded-xl px-4 py-2 border border-purple-500/30 backdrop-blur-sm shadow-inner">
            <span className="font-medium text-purple-200">{event.name}</span>
            <span className="text-sm text-cyan-300">om {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 shadow-md">
        <h3 className="text-xl font-semibold text-purple-200 mb-2">Volgende Event</h3>
        {nextEvent ? (
          <>
            <p className="text-lg">
              <span className="font-bold text-pink-300">{nextEvent.name}</span> om{' '}
              <span className="text-cyan-200">{nextEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </p>
            <p className="text-sm mt-2 text-cyan-400">Aftelling: {timeLeft}</p>
          </>
        ) : (
          <p className="text-pink-300">Alle events zijn voorbij!</p>
        )}
      </div>
    </div>
  );
};

export default EventTab;
