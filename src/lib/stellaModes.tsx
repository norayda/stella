import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

export type DriverProfile = 'new' | 'standard' | 'experienced';

export type Modes = {
  lang: 'fr' | 'en';
  dark: boolean;
  colorblind: boolean;
  accessibility: boolean;     // +20% font, larger buttons
  highContrast: boolean;
  largeText: boolean;         // +30% font
  reduceMotion: boolean;
  eco: boolean;
  newDriver: boolean;
  voice: boolean;
  voiceNotifs: boolean;
  voicePriority: boolean;     // reads labels aloud on navigation
  readAlerts: boolean;
  haptics: boolean;
  profile: DriverProfile;
};

const DEFAULTS: Modes = {
  lang: 'fr',
  dark: false,
  colorblind: false,
  accessibility: false,
  highContrast: false,
  largeText: false,
  reduceMotion: false,
  eco: false,
  newDriver: false,
  voice: false,
  voiceNotifs: false,
  voicePriority: false,
  readAlerts: false,
  haptics: false,
  profile: 'standard',
};

const STORAGE_KEY = 'stella:modes';

function loadModes(): Modes {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    // Legacy single-key migration for accessibility + level
    const acc = window.sessionStorage.getItem('stella:accessibility') === '1';
    const level = window.sessionStorage.getItem('stella:level');
    return {
      ...DEFAULTS,
      accessibility: acc,
      profile: level === 'new' || level === 'experienced' ? (level as DriverProfile) : 'standard',
    };
  } catch {
    return DEFAULTS;
  }
}

function saveModes(m: Modes) {
  try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(m)); } catch { /* noop */ }
}

type ModesContextValue = {
  modes: Modes;
  set: <K extends keyof Modes>(key: K, value: Modes[K]) => void;
  toggle: (key: keyof Modes) => void;
};

const ModesContext = createContext<ModesContextValue | null>(null);

export const ModesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modes, setModes] = useState<Modes>(() => loadModes());

  const set = useCallback(<K extends keyof Modes>(key: K, value: Modes[K]) => {
    setModes((prev) => {
      const next = { ...prev, [key]: value };
      saveModes(next);
      return next;
    });
  }, []);

  const toggle = useCallback((key: keyof Modes) => {
    setModes((prev) => {
      const cur = prev[key];
      if (typeof cur !== 'boolean') return prev;
      const next = { ...prev, [key]: !cur } as Modes;
      saveModes(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ modes, set, toggle }), [modes, set, toggle]);

  return <ModesContext.Provider value={value}>{children}</ModesContext.Provider>;
};

export function useModes(): ModesContextValue {
  const ctx = useContext(ModesContext);
  if (ctx) return ctx;
  // Safe fallback: local state that doesn't crash if provider is missing
  const [modes, setModes] = useState<Modes>(() => loadModes());
  return {
    modes,
    set: (k, v) => setModes((m) => {
      const next = { ...m, [k]: v };
      saveModes(next);
      return next;
    }),
    toggle: (k) => setModes((m) => {
      const cur = m[k];
      if (typeof cur !== 'boolean') return m;
      const next = { ...m, [k]: !cur } as Modes;
      saveModes(next);
      return next;
    }),
  };
}

// Hook that applies the cross-app visual CSS variables on <html>.
export function useApplyModes(): Modes {
  const { modes } = useModes();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    // Font scale
    const scale = modes.largeText ? 1.3 : modes.accessibility ? 1.2 : 1;
    html.style.setProperty('--stella-font-scale', String(scale));
    // Dark mode
    html.classList.toggle('stella-dark', modes.dark);
    html.classList.toggle('stella-hc', modes.highContrast);
    html.classList.toggle('stella-cb', modes.colorblind);
    html.classList.toggle('stella-reduce-motion', modes.reduceMotion);
  }, [modes]);
  return modes;
}
