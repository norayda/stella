/**
 * @krisspy-file
 * @type page
 * @name "StellaPersonalization"
 * @title "STELLA — Personnalisation"
 * @description "Écran d'onboarding post-inscription : objectifs, niveau de conduite, préférences de trajet, assistant vocal. Sticky CTA, chips, zéro donnée sensible."
 * @routes ["/personalization"]
 * @flowName "Onboarding"
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { speakStella, stopSpeaking, buildWelcomeMessage } from '../lib/stellaVoice';
import { useModes } from '../lib/stellaModes';
import {
  Sparkles,
  ShieldCheck,
  Wallet,
  Sofa,
  Mountain,
  Route,
  ArrowRight,
  Info,
  Zap,
  Shield,
  Leaf,
  Camera,
  Coffee,
  Mic,
  BellOff,
  Check,
} from 'lucide-react';

type Lang = 'fr' | 'en';
type Level = 'new' | 'standard' | 'experienced';
type Voice = 'yes' | 'later';

const I18N = {
  fr: {
    step: 'Étape 2 sur 2',
    mark: 'Personnalisation',
    title: 'Rendons STELLA vraiment à toi.',
    sub: 'Quelques préférences pour que tout soit personnalisé dès le premier trajet.',
    s1_title: 'Qu\'attends-tu le plus de STELLA ?',
    s1_hint: 'Choisis tout ce qui te parle.',
    s1: [
      { id: 'safety', label: 'Sécurité' },
      { id: 'savings', label: 'Économies' },
      { id: 'comfort', label: 'Confort de conduite' },
      { id: 'roadtrip', label: 'Road trips' },
      { id: 'commute', label: 'Trajets du quotidien plus simples' },
    ],
    s2_title: 'Quel est ton profil de conductrice ?',
    s2_hint: 'Un seul choix.',
    s2: [
      { id: 'new' as Level, emoji: '🔑', label: 'Nouvelle conductrice', tip: 'Tu préfères une conduite simple et rassurante ou tu es encore en apprentissage.' },
      { id: 'standard' as Level, emoji: '⭐', label: 'Standard', tip: 'Tu te sens à l\'aise dans la plupart des situations de conduite.' },
      { id: 'experienced' as Level, emoji: '🏎️', label: 'Expérimentée', tip: 'Tu gères différents types de trajets en toute autonomie.' },
    ],
    s2_access_label: 'Accessibilité (optionnel)',
    s2_access_chip: 'Accessibilité',
    s2_access_helper: 'Stella privilégie les itinéraires accessibles PMR : parkings handicapés, rampes d\'accès et arrêts adaptés.',
    s3_title: 'Quel type de trajets préfères-tu ?',
    s3_hint: 'Choix multiples.',
    s3: [
      { id: 'fast', label: 'Rapide', emoji: '⚡' },
      { id: 'safe', label: 'Sûr', emoji: '🛡️' },
      { id: 'eco', label: 'Écologique', emoji: '🌱' },
      { id: 'scenic', label: 'Paysager', emoji: '🌄' },
      { id: 'comfortable', label: 'Confortable', emoji: '😌' },
    ],
    s4_title: 'Tu souhaites utiliser l\'assistant vocal STELLA ?',
    s4_hint: 'Idéal pour rester concentré·e sur la route.',
    s4_yes: 'Oui, activer l\'assistant vocal',
    s4_later: 'Peut-être plus tard',
    s4_note: 'Aucune autorisation micro demandée maintenant — uniquement lors de la première utilisation.',
    cta: 'Continuer',
    cta_sub: 'Personnaliser mon expérience',
    toast_done: 'Parfait — STELLA est prête pour toi ✨',
    tooltip_label: 'Info',
  },
  en: {
    step: 'Step 2 of 2',
    mark: 'Personalization',
    title: 'Let\'s make STELLA truly yours.',
    sub: 'A few preferences so everything feels personal from your very first trip.',
    s1_title: 'What are you looking forward to most with STELLA?',
    s1_hint: 'Pick everything that resonates.',
    s1: [
      { id: 'safety', label: 'Safety' },
      { id: 'savings', label: 'Savings' },
      { id: 'comfort', label: 'Driving comfort' },
      { id: 'roadtrip', label: 'Road trips' },
      { id: 'commute', label: 'Simpler commuting' },
    ],
    s2_title: 'What is your driver profile?',
    s2_hint: 'Pick one.',
    s2: [
      { id: 'new' as Level, emoji: '🔑', label: 'New driver', tip: 'You prefer a simple and reassuring driving experience or are still learning.' },
      { id: 'standard' as Level, emoji: '⭐', label: 'Standard', tip: 'You feel comfortable in most driving situations.' },
      { id: 'experienced' as Level, emoji: '🏎️', label: 'Experienced', tip: 'You confidently handle different types of trips and drive independently.' },
    ],
    s2_access_label: 'Accessibility (optional)',
    s2_access_chip: 'Accessibility needs',
    s2_access_helper: 'Stella prioritizes accessible routes: disabled parking, ramps and adapted stops.',
    s3_title: 'What type of trips do you prefer?',
    s3_hint: 'Multiple choice.',
    s3: [
      { id: 'fast', label: 'Fast', emoji: '⚡' },
      { id: 'safe', label: 'Safe', emoji: '🛡️' },
      { id: 'eco', label: 'Eco-friendly', emoji: '🌱' },
      { id: 'scenic', label: 'Scenic', emoji: '🌄' },
      { id: 'comfortable', label: 'Comfortable', emoji: '😌' },
    ],
    s4_title: 'Would you like to use the STELLA voice assistant?',
    s4_hint: 'Ideal for staying focused on the road.',
    s4_yes: 'Yes, enable voice assistant',
    s4_later: 'Maybe later',
    s4_note: 'No microphone permission is requested now — only on first actual use.',
    cta: 'Continue',
    cta_sub: 'Personalize my experience',
    toast_done: 'All set — STELLA is ready for you ✨',
    tooltip_label: 'Info',
  },
} as const;

const GOAL_ICONS: Record<string, React.ReactNode> = {
  safety: <ShieldCheck size={16} strokeWidth={2.5} />,
  savings: <Wallet size={16} strokeWidth={2.5} />,
  comfort: <Sofa size={16} strokeWidth={2.5} />,
  roadtrip: <Mountain size={16} strokeWidth={2.5} />,
  commute: <Route size={16} strokeWidth={2.5} />,
};

const TRIP_ICONS: Record<string, React.ReactNode> = {
  fast: <Zap size={16} strokeWidth={2.5} />,
  safe: <Shield size={16} strokeWidth={2.5} />,
  eco: <Leaf size={16} strokeWidth={2.5} />,
  scenic: <Camera size={16} strokeWidth={2.5} />,
  comfortable: <Coffee size={16} strokeWidth={2.5} />,
};

const StellaPersonalization: React.FC = () => {
  const [lang, setLang] = useState<Lang>('fr');
  const [goals, setGoals] = useState<string[]>([]);
  const [level, setLevelState] = useState<Level | null>(null);
  const setLevel = (v: Level | null) => {
    setLevelState(v);
    try {
      if (v) window.sessionStorage.setItem('stella:level', v);
      else window.sessionStorage.removeItem('stella:level');
    } catch { /* noop */ }
  };
  const [accessibility, setAccessibilityState] = useState(false);
  const setAccessibility = (v: boolean | ((prev: boolean) => boolean)) => {
    setAccessibilityState((prev) => {
      const next = typeof v === 'function' ? (v as (p: boolean) => boolean)(prev) : v;
      try { window.sessionStorage.setItem('stella:accessibility', next ? '1' : '0'); } catch { /* noop */ }
      return next;
    });
  };
  const [voice, setVoice] = useState<Voice | null>(null);
  const [openTip, setOpenTip] = useState<Level | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const t = I18N[lang];

  const toggleGoal = (id: string) =>
    setGoals((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const progress =
    (goals.length > 0 ? 33 : 0) +
    (level ? 34 : 0) +
    (voice ? 33 : 0);

  const isValid = goals.length > 0 && !!level && !!voice;

  const handleSubmit = () => {
    if (!isValid) return;
    showToast(t.toast_done);
  };

  useEffect(() => {
    const close = () => setOpenTip(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const speakWelcome = useCallback(() => {
    let nickname = '';
    try {
      nickname = (window.sessionStorage.getItem('stella:nickname') || '').trim();
    } catch { /* sessionStorage may be unavailable */ }
    const message = buildWelcomeMessage(nickname, lang);
    void speakStella(message, lang);
  }, [lang]);

  const { set: setMode } = useModes();
  const handleVoiceSelect = (choice: Voice) => {
    setVoice(choice);
    setMode('voice', choice === 'yes');
    if (choice === 'yes') speakWelcome();
    else stopSpeaking();
  };

  useEffect(() => {
    return () => { stopSpeaking(); };
  }, []);

  return (
    <>
      <style>{`
        .sp-root * { box-sizing: border-box; }
        .sp-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .sp-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .sp-blobs::before, .sp-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
        }
        .sp-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .sp-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .sp-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 24px 140px;
          display: flex; flex-direction: column; gap: 24px;
          position: relative; z-index: 1;
        }
        .sp-top {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .sp-progress-wrap { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .sp-step {
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: #8A7A7A;
        }
        .sp-bar {
          height: 4px; background: rgba(107,78,155,0.12);
          border-radius: 4px; overflow: hidden;
        }
        .sp-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          border-radius: 4px;
          transition: width 400ms cubic-bezier(0.22,1,0.36,1);
        }
        .sp-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .sp-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
          transition: all 200ms ease;
        }
        .sp-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 3px 10px rgba(255,122,112,0.3);
        }
        .sp-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .sp-h1 {
          font-size: 26px; font-weight: 800; line-height: 1.2;
          letter-spacing: -0.4px; color: #1A1A2E;
          margin: 4px 0 6px;
        }
        .sp-h1 span {
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .sp-sub {
          font-size: 14.5px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }
        .sp-section {
          background: #FFF;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 14px;
        }
        .sp-section-head {
          display: flex; flex-direction: column; gap: 4px;
        }
        .sp-section-title {
          font-size: 16px; font-weight: 800; color: #1A1A2E;
          line-height: 1.3; margin: 0;
        }
        .sp-section-hint {
          font-size: 12px; font-weight: 500; color: #8A7A7A; margin: 0;
        }

        .sp-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .sp-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: inherit;
          border: 1.5px solid #EADFD6;
          background: #FFF; color: #1A1A2E;
          font-size: 13px; font-weight: 600;
          padding: 9px 14px; border-radius: 50px;
          cursor: pointer;
          transition: transform 150ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
          position: relative;
        }
        .sp-chip:hover { border-color: #FFB5A7; }
        .sp-chip:active { transform: scale(0.97); }
        .sp-chip.active {
          background: #FF7A70; color: #FFF;
          border-color: #FF7A70;
          box-shadow: 0 6px 18px rgba(255,122,112,0.35);
        }
        .sp-chip-check {
          display: inline-flex; align-items: center; justify-content: center;
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
        }

        .sp-levels { display: flex; flex-direction: column; gap: 8px; }
        .sp-access-block {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: 6px;
          padding-top: 14px;
          border-top: 1px dashed rgba(138,122,122,0.2);
        }
        .sp-access-label {
          font-size: 11.5px; font-weight: 500; font-style: italic;
          color: #B8ACAC;
          letter-spacing: 0.2px;
        }
        .sp-access-row { display: flex; }
        .sp-access-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: inherit;
          border: 1.5px solid #EADFD6;
          background: #FFF; color: #1A1A2E;
          font-size: 13px; font-weight: 600;
          padding: 9px 14px; border-radius: 50px;
          cursor: pointer;
          transition: transform 150ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease, box-shadow 180ms ease;
        }
        .sp-access-chip:hover { border-color: #FFB5A7; }
        .sp-access-chip:active { transform: scale(0.97); }
        .sp-access-chip.active {
          background: #FF7A70; color: #FFF;
          border-color: #FF7A70;
          box-shadow: 0 6px 18px rgba(255,122,112,0.35);
        }
        .sp-access-chip-check {
          display: inline-flex; align-items: center; justify-content: center;
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
        }
        .sp-access-helper {
          font-size: 11.5px; font-weight: 500; font-style: italic;
          color: #B8ACAC;
          line-height: 1.45;
        }
        .sp-level {
          display: flex; align-items: center; gap: 12px;
          background: #FDF6F0;
          border: 1.5px solid transparent;
          border-radius: 14px;
          padding: 12px 14px;
          font-family: inherit;
          cursor: pointer;
          transition: all 180ms ease;
          position: relative;
        }
        .sp-level:hover { border-color: #EADFD6; }
        .sp-level.active {
          background: #FFF5F2;
          border-color: #FF7A70;
          box-shadow: 0 6px 18px rgba(255,122,112,0.18);
        }
        .sp-level-emoji {
          font-size: 20px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          background: rgba(255,255,255,0.7);
        }
        .sp-level-text { flex: 1; text-align: left; }
        .sp-level-label {
          font-size: 14px; font-weight: 700; color: #1A1A2E;
        }
        .sp-level-tip-btn {
          flex-shrink: 0;
          width: 28px; height: 28px; border-radius: 50%;
          border: none; cursor: pointer;
          background: rgba(107,78,155,0.08);
          color: #6B4E9B;
          display: flex; align-items: center; justify-content: center;
          transition: background 150ms ease;
        }
        .sp-level-tip-btn:hover { background: rgba(107,78,155,0.15); }
        .sp-tooltip {
          position: absolute;
          bottom: calc(100% + 8px); right: 4px;
          background: #1A1A2E; color: #FFF;
          padding: 10px 14px; border-radius: 12px;
          font-size: 12px; font-weight: 500; line-height: 1.4;
          max-width: 240px;
          box-shadow: 0 10px 25px rgba(26,26,46,0.25);
          opacity: 0; transform: translateY(4px);
          pointer-events: none;
          transition: opacity 180ms ease, transform 180ms ease;
          z-index: 10;
        }
        .sp-tooltip.open { opacity: 1; transform: translateY(0); }
        .sp-tooltip::after {
          content: ""; position: absolute; top: 100%; right: 14px;
          border: 6px solid transparent; border-top-color: #1A1A2E;
        }

        .sp-trip-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .sp-trip {
          display: flex; align-items: center; gap: 10px;
          font-family: inherit;
          border: 1.5px solid #EADFD6;
          background: #FFF; color: #1A1A2E;
          font-size: 13px; font-weight: 700;
          padding: 12px 14px; border-radius: 14px;
          cursor: pointer;
          transition: all 180ms ease;
          text-align: left;
        }
        .sp-trip:hover { border-color: #FFB5A7; }
        .sp-trip.active {
          background: #FFF5F2;
          border-color: #FF7A70;
          box-shadow: 0 6px 18px rgba(255,122,112,0.2);
        }
        .sp-trip-emoji {
          font-size: 18px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          background: #FFE6E3;
          color: #FF7A70;
          flex-shrink: 0;
        }
        .sp-trip.active .sp-trip-emoji {
          background: #FF7A70; color: #FFF;
        }

        .sp-voice { display: flex; flex-direction: column; gap: 8px; }
        .sp-voice-opt {
          display: flex; align-items: center; gap: 12px;
          font-family: inherit;
          background: #FDF6F0;
          border: 1.5px solid transparent;
          border-radius: 14px;
          padding: 14px;
          cursor: pointer;
          transition: all 180ms ease;
          text-align: left;
        }
        .sp-voice-opt:hover { border-color: #EADFD6; }
        .sp-voice-opt.active {
          background: #FFF5F2;
          border-color: #FF7A70;
          box-shadow: 0 6px 18px rgba(255,122,112,0.2);
        }
        .sp-voice-icon {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: #EEE7F7; color: #6B4E9B;
          transition: all 180ms ease;
        }
        .sp-voice-opt.active .sp-voice-icon {
          background: #FF7A70; color: #FFF;
        }
        .sp-voice-label { font-size: 14px; font-weight: 700; color: #1A1A2E; }
        .sp-voice-check {
          flex-shrink: 0; width: 22px; height: 22px;
          border-radius: 50%;
          border: 1.5px solid #DCCFC5;
          display: flex; align-items: center; justify-content: center;
          color: transparent;
          transition: all 180ms ease;
        }
        .sp-voice-opt.active .sp-voice-check {
          background: #FF7A70; border-color: #FF7A70; color: #FFF;
        }
        .sp-voice-note {
          font-size: 11.5px; font-weight: 500; color: #8A7A7A;
          line-height: 1.45; margin: 4px 4px 0;
          display: flex; gap: 6px; align-items: flex-start;
        }
        .sp-voice-note svg { flex-shrink: 0; margin-top: 2px; color: #6B4E9B; }

        .sp-sticky {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 420px;
          padding: 16px 24px 20px;
          background: linear-gradient(to top, rgba(253,246,240,1) 55%, rgba(253,246,240,0));
          z-index: 50;
        }
        .sp-cta {
          font-family: inherit; border: none; cursor: pointer; width: 100%;
          padding: 14px 20px; border-radius: 50px;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          background: #FF7A70; color: #FFF;
          box-shadow: 0 10px 26px rgba(255,122,112,0.45);
          transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease, opacity 200ms ease;
        }
        .sp-cta:hover:not(:disabled) { background: #F26158; }
        .sp-cta:active:not(:disabled) { transform: scale(0.985); }
        .sp-cta:disabled {
          opacity: 0.45; cursor: not-allowed;
          box-shadow: 0 4px 10px rgba(255,122,112,0.2);
        }
        .sp-cta-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 16px; font-weight: 800;
        }
        .sp-cta-sub { font-size: 12px; font-weight: 500; opacity: 0.9; }
        .sp-cta-arrow { display: inline-flex; transition: transform 250ms ease; }
        .sp-cta:hover:not(:disabled) .sp-cta-arrow { transform: translateX(3px); }

        .sp-toast {
          position: fixed; bottom: 96px; left: 50%;
          transform: translate(-50%, 20px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 20px 50px rgba(26,26,46,0.25);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .sp-toast.show { transform: translate(-50%, 0); opacity: 1; }

        @media (min-width: 640px) {
          .sp-app { padding: 32px 24px 140px; }
          .sp-h1 { font-size: 28px; }
        }
      `}</style>

      <div className="sp-root">
        <div className="sp-blobs" aria-hidden="true" />

        <main className="sp-app">
          <div className="sp-top">
            <div className="sp-progress-wrap">
              <span className="sp-step">{t.step}</span>
              <div className="sp-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="sp-bar-fill" style={{ width: `${Math.max(progress, 6)}%` }} />
              </div>
            </div>
            <div className="sp-lang" role="tablist">
              <button
                type="button"
                className={`sp-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >
                FR
              </button>
              <button
                type="button"
                className={`sp-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >
                EN
              </button>
            </div>
          </div>

          <header>
            <span className="sp-mark">
              <Sparkles size={12} strokeWidth={2.5} /> {t.mark}
            </span>
            <h1 className="sp-h1">{t.title}</h1>
            <p className="sp-sub">{t.sub}</p>
          </header>

          {/* Section 1 — Goals */}
          <section className="sp-section">
            <div className="sp-section-head">
              <h2 className="sp-section-title">{t.s1_title}</h2>
              <p className="sp-section-hint">{t.s1_hint}</p>
            </div>
            <div className="sp-chips" role="group" aria-label={t.s1_title}>
              {t.s1.map((g) => {
                const active = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={`sp-chip ${active ? 'active' : ''}`}
                    onClick={() => toggleGoal(g.id)}
                    aria-pressed={active}
                  >
                    {GOAL_ICONS[g.id]}
                    <span>{g.label}</span>
                    {active && (
                      <span className="sp-chip-check">
                        <Check size={11} strokeWidth={3.5} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2 — Driving level */}
          <section className="sp-section">
            <div className="sp-section-head">
              <h2 className="sp-section-title">{t.s2_title}</h2>
              <p className="sp-section-hint">{t.s2_hint}</p>
            </div>
            <div className="sp-levels">
              {t.s2.map((lv) => {
                const active = level === lv.id;
                const tipOpen = openTip === lv.id;
                return (
                  <div
                    key={lv.id}
                    className={`sp-level ${active ? 'active' : ''}`}
                    onClick={() => setLevel(lv.id)}
                    role="radio"
                    aria-checked={active}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setLevel(lv.id);
                      }
                    }}
                  >
                    <span className="sp-level-emoji">{lv.emoji}</span>
                    <div className="sp-level-text">
                      <div className="sp-level-label">{lv.label}</div>
                    </div>
                    {lv.tip && (
                      <>
                        <button
                          type="button"
                          className="sp-level-tip-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTip((v) => (v === lv.id ? null : lv.id));
                          }}
                          aria-label={t.tooltip_label}
                        >
                          <Info size={14} strokeWidth={2.5} />
                        </button>
                        <div className={`sp-tooltip ${tipOpen ? 'open' : ''}`} role="tooltip">
                          {lv.tip}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="sp-access-block">
              <span className="sp-access-label">{t.s2_access_label}</span>
              <div className="sp-access-row">
                <button
                  type="button"
                  className={`sp-access-chip ${accessibility ? 'active' : ''}`}
                  onClick={() => setAccessibility((v) => !v)}
                  aria-pressed={accessibility}
                >
                  <span aria-hidden="true">♿</span>
                  <span>{t.s2_access_chip}</span>
                  {accessibility && (
                    <span className="sp-access-chip-check">
                      <Check size={11} strokeWidth={3.5} />
                    </span>
                  )}
                </button>
              </div>
              <p className="sp-access-helper">{t.s2_access_helper}</p>
            </div>
          </section>

          {/* Section 4 — Voice assistant */}
          <section className="sp-section">
            <div className="sp-section-head">
              <h2 className="sp-section-title">{t.s4_title}</h2>
              <p className="sp-section-hint">{t.s4_hint}</p>
            </div>
            <div className="sp-voice" role="radiogroup" aria-label={t.s4_title}>
              <div
                className={`sp-voice-opt ${voice === 'yes' ? 'active' : ''}`}
                onClick={() => handleVoiceSelect('yes')}
                role="radio"
                aria-checked={voice === 'yes'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleVoiceSelect('yes');
                  }
                }}
              >
                <span className="sp-voice-icon">
                  <Mic size={18} strokeWidth={2.5} />
                </span>
                <span className="sp-voice-label" style={{ flex: 1 }}>{t.s4_yes}</span>
                <span className="sp-voice-check">
                  <Check size={13} strokeWidth={3.5} />
                </span>
              </div>
              <div
                className={`sp-voice-opt ${voice === 'later' ? 'active' : ''}`}
                onClick={() => handleVoiceSelect('later')}
                role="radio"
                aria-checked={voice === 'later'}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleVoiceSelect('later');
                  }
                }}
              >
                <span className="sp-voice-icon">
                  <BellOff size={18} strokeWidth={2.5} />
                </span>
                <span className="sp-voice-label" style={{ flex: 1 }}>{t.s4_later}</span>
                <span className="sp-voice-check">
                  <Check size={13} strokeWidth={3.5} />
                </span>
              </div>
            </div>
            <p className="sp-voice-note">
              <Info size={13} strokeWidth={2.5} />
              <span>{t.s4_note}</span>
            </p>
          </section>
        </main>

        <div className="sp-sticky">
          <button
            type="button"
            className="sp-cta"
            disabled={!isValid}
            aria-disabled={!isValid}
            onClick={handleSubmit}
          >
            <span className="sp-cta-label">
              {t.cta}
              <span className="sp-cta-arrow">
                <ArrowRight size={18} strokeWidth={2.5} />
              </span>
            </span>
            <span className="sp-cta-sub">{t.cta_sub}</span>
          </button>
        </div>

        <div className={`sp-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaPersonalization;
