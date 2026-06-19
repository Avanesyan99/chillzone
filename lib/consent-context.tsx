'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ConsentState = {
  functional: boolean;  // cart, auth session — required for the store to work
  analytics: boolean;   // optional future analytics
  decided: boolean;     // has the user made a choice yet
};

const DEFAULT: ConsentState = { functional: false, analytics: false, decided: false };

const STORAGE_KEY = 'chillzone-cookie-consent';

interface ConsentContextType {
  consent: ConsentState;
  acceptAll: () => void;
  acceptRequired: () => void;
  reject: () => void;
  resetConsent: () => void;
}

const ConsentContext = createContext<ConsentContextType | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setConsent(JSON.parse(saved));
    } catch {}
  }, []);

  function save(s: ConsentState) {
    setConsent(s);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }

  // Accept all — cart + auth + analytics
  function acceptAll() { save({ functional: true, analytics: true, decided: true }); }

  // Accept only required — cart + auth cookies (needed to use the store)
  function acceptRequired() { save({ functional: true, analytics: false, decided: true }); }

  // Reject all optional — note: functional cookies are still set because
  // they are strictly necessary for the service (GDPR Article 6(1)(b))
  function reject() { save({ functional: true, analytics: false, decided: true }); }

  function resetConsent() { save(DEFAULT); try { localStorage.removeItem(STORAGE_KEY); } catch {} }

  return (
    <ConsentContext.Provider value={{ consent, acceptAll, acceptRequired, reject, resetConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
