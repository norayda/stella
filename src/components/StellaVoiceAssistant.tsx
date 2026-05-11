import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Mic, X, Sparkles } from 'lucide-react';
import { useModes } from '../lib/stellaModes';
import { speakStella, stopSpeaking } from '../lib/stellaVoice';

/**
 * Global Stella voice assistant overlay + floating mic button.
 * Mounted once at the app root. Completely hidden when `modes.voice` is false.
 * - Floating glassmorphic mic button (bottom-right, above nav bar)
 * - Full-screen voice overlay with waveform + text reply + spoken reply
 * - Uses Web Speech API (female voice picked per lang) via stellaVoice helper
 */

type Phase = 'idle' | 'listening' | 'thinking' | 'responding';

const REPLIES_FR: { match: RegExp; text: string }[] = [
  { match: /(trajet|itin[eé]raire|route|conduire)/i, text: 'Je peux te calculer ton itinéraire. Ouvre l\'onglet Trajets quand tu veux.' },
  { match: /(recharge|batterie|borne)/i, text: 'Ta batterie est à 78%, autonomie estimée 312 kilomètres. Besoin d\'une borne ?' },
  { match: /(devis|garage|prix|cher)/i, text: 'Envoie-moi ton devis depuis l\'accueil, je te dis en deux minutes si c\'est correct.' },
  { match: /(entretien|vidange|pneu|r[eé]vision)/i, text: 'Prochaine révision dans deux mois. Pas d\'urgence, on peut s\'organiser.' },
  { match: /(bonjour|salut|coucou|hello|hey)/i, text: 'Salut ! Je suis Stella, ta co-pilote. Que puis-je faire pour toi ?' },
  { match: /(merci|super|g[eé]nial)/i, text: 'Avec plaisir ! Je suis toujours là si tu as besoin.' },
  { match: /(aide|help|urgence|sos)/i, text: 'Pour une urgence, appuie sur le bouton SOS dans l\'accueil. J\'y suis si tu veux.' },
];

const REPLIES_EN: { match: RegExp; text: string }[] = [
  { match: /(trip|route|drive|navigation)/i, text: 'I can plan your route. Open the Trips tab whenever you\'re ready.' },
  { match: /(charge|battery|plug)/i, text: 'Your battery is at 78%, estimated range 312 kilometres. Want a charger nearby?' },
  { match: /(quote|garage|price|expensive)/i, text: 'Send me your quote from home, I\'ll tell you if it\'s fair in two minutes.' },
  { match: /(maintenance|service|tyre|tire)/i, text: 'Next service due in two months. No rush, we can plan it.' },
  { match: /(hello|hi|hey)/i, text: 'Hi there! I\'m Stella, your co-pilot. What can I do for you?' },
  { match: /(thanks|thank you|great|awesome)/i, text: 'My pleasure! I\'m here whenever you need me.' },
  { match: /(help|emergency|sos)/i, text: 'For an emergency, tap the SOS button on the home screen. I\'m with you.' },
];

function pickReply(phrase: string, lang: 'fr' | 'en'): string {
  const table = lang === 'fr' ? REPLIES_FR : REPLIES_EN;
  for (const r of table) {
    if (r.match.test(phrase)) return r.text;
  }
  return lang === 'fr'
    ? 'Je t\'écoute — dis-m\'en plus.'
    : 'I\'m listening — tell me more.';
}

const MOCK_PHRASES_FR = [
  'Quel est mon prochain entretien ?',
  'Planifie un trajet vers Lyon.',
  'Ma voiture est-elle en bonne santé ?',
];
const MOCK_PHRASES_EN = [
  'When is my next service?',
  'Plan a trip to Lyon.',
  'Is my car healthy?',
];

export const StellaVoiceAssistant: React.FC = () => {
  const { modes } = useModes();
  const enabled = modes.voice;
  const lang = modes.lang;

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [userPhrase, setUserPhrase] = useState<string>('');
  const [reply, setReply] = useState<string>('');
  const phaseTimer = useRef<number | null>(null);

  const greeting = useMemo(
    () => lang === 'fr' ? 'Bonjour, je t\'écoute ✨' : 'Hi, I\'m listening ✨',
    [lang]
  );
  const placeholders = useMemo(
    () => lang === 'fr' ? MOCK_PHRASES_FR : MOCK_PHRASES_EN,
    [lang]
  );

  const cleanup = useCallback(() => {
    if (phaseTimer.current) window.clearTimeout(phaseTimer.current);
    phaseTimer.current = null;
    stopSpeaking();
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // If voice is disabled at runtime while overlay is open, force-close everything
  useEffect(() => {
    if (!enabled) {
      setOpen(false);
      setPhase('idle');
      cleanup();
    }
  }, [enabled, cleanup]);

  const startSession = useCallback(() => {
    setOpen(true);
    setUserPhrase('');
    setReply('');
    setPhase('listening');

    // After 1.6s of "listening", pick a random mock phrase and start thinking
    if (phaseTimer.current) window.clearTimeout(phaseTimer.current);
    phaseTimer.current = window.setTimeout(() => {
      const phrase = placeholders[Math.floor(Math.random() * placeholders.length)];
      setUserPhrase(phrase);
      setPhase('thinking');

      // Thinking 600ms → replying
      phaseTimer.current = window.setTimeout(() => {
        const r = pickReply(phrase, lang);
        setReply(r);
        setPhase('responding');
        void speakStella(r, lang);

        // Auto-dismiss 2.4s after reply starts
        phaseTimer.current = window.setTimeout(() => {
          setOpen(false);
          setPhase('idle');
        }, 2400 + Math.min(r.length * 25, 3500));
      }, 600);
    }, 1600);
  }, [lang, placeholders]);

  const closeOverlay = useCallback(() => {
    cleanup();
    setOpen(false);
    setPhase('idle');
  }, [cleanup]);

  if (!enabled) return null;

  return (
    <>
      <style>{`
        .sv-fab {
          position: fixed;
          right: 16px; bottom: 86px;
          width: 52px; height: 52px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.35);
          background: linear-gradient(135deg, rgba(255,122,112,0.9) 0%, rgba(107,78,155,0.88) 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(107,78,155,0.35), 0 0 0 3px rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 160;
          transition: transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease, filter 180ms ease;
        }
        .sv-fab:hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.05); }
        .sv-fab:active { transform: scale(0.96); }
        .sv-fab-ring {
          position: absolute; inset: -6px; border-radius: 50%;
          border: 2px solid rgba(255,122,112,0.35);
          pointer-events: none;
          animation: sv-fab-ring 2.4s ease-out infinite;
        }
        @keyframes sv-fab-ring {
          0%   { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .sv-fab-dot {
          position: absolute; top: 6px; right: 6px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #FFF;
          box-shadow: 0 0 0 2px #FF7A70, 0 0 8px rgba(255,255,255,0.6);
          animation: sv-fab-dot 1.4s ease-in-out infinite;
        }
        @keyframes sv-fab-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.7); }
        }

        .sv-overlay {
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse at 50% 30%, rgba(255,122,112,0.45) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 110%, rgba(107,78,155,0.55) 0%, transparent 55%),
            rgba(26,26,46,0.86);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          z-index: 250;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 24px;
          padding: 40px 24px;
          opacity: 0; pointer-events: none;
          transition: opacity 260ms ease;
        }
        .sv-overlay.open { opacity: 1; pointer-events: auto; }
        .sv-close {
          position: absolute; top: 18px; right: 18px;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.12);
          color: #FFF; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px);
        }
        .sv-close:hover { background: rgba(255,255,255,0.22); }

        .sv-title {
          font-family: 'Nunito', sans-serif;
          font-size: 20px; font-weight: 900;
          color: #FFF; letter-spacing: -0.2px;
          text-align: center;
        }
        .sv-status {
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 800; letter-spacing: 0.6px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
        }

        .sv-waveform {
          display: flex; align-items: center; gap: 6px;
          height: 80px;
        }
        .sv-bar {
          width: 6px; border-radius: 3px;
          background: linear-gradient(180deg, #FF8F85 0%, #6B4E9B 100%);
          box-shadow: 0 0 14px rgba(255,122,112,0.55);
        }
        .sv-overlay.listening .sv-bar {
          animation: sv-wave 900ms ease-in-out infinite;
        }
        .sv-overlay.responding .sv-bar {
          animation: sv-wave 600ms ease-in-out infinite;
        }
        .sv-overlay.thinking .sv-bar {
          height: 10px !important;
          animation: sv-pulse 700ms ease-in-out infinite;
        }
        .sv-bar:nth-child(1) { height: 22px; animation-delay: 0ms;   }
        .sv-bar:nth-child(2) { height: 44px; animation-delay: 90ms;  }
        .sv-bar:nth-child(3) { height: 66px; animation-delay: 180ms; }
        .sv-bar:nth-child(4) { height: 78px; animation-delay: 270ms; }
        .sv-bar:nth-child(5) { height: 66px; animation-delay: 180ms; }
        .sv-bar:nth-child(6) { height: 44px; animation-delay: 90ms;  }
        .sv-bar:nth-child(7) { height: 22px; animation-delay: 0ms;   }
        @keyframes sv-wave {
          0%, 100% { transform: scaleY(0.4); }
          50%      { transform: scaleY(1.2); }
        }
        @keyframes sv-pulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }

        .sv-bubble {
          max-width: 420px; width: 100%;
          padding: 14px 18px; border-radius: 18px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px; font-weight: 700;
          line-height: 1.45;
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          color: #FFF;
          animation: sv-fade 260ms ease;
        }
        .sv-bubble.user {
          background: rgba(255,122,112,0.28);
          align-self: flex-end;
        }
        .sv-bubble.stella {
          background: rgba(255,255,255,0.14);
          position: relative;
        }
        .sv-bubble.stella::before {
          content: "✨ Stella";
          display: block;
          font-size: 10.5px; font-weight: 900; letter-spacing: 1px;
          color: #FFE0A3;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        @keyframes sv-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sv-thread {
          display: flex; flex-direction: column; gap: 10px;
          width: 100%; max-width: 420px;
        }

        .sv-lang-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 50px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          font-size: 10px; font-weight: 900; letter-spacing: 1px;
          text-transform: uppercase; color: rgba(255,255,255,0.85);
        }
      `}</style>

      {/* Floating mic button — never renders when voice disabled */}
      <button
        type="button"
        className="sv-fab"
        onClick={startSession}
        aria-label={lang === 'fr' ? 'Parler à Stella' : 'Talk to Stella'}
      >
        <span className="sv-fab-ring" aria-hidden="true" />
        <Mic size={20} strokeWidth={2.5} />
        <span className="sv-fab-dot" aria-hidden="true" />
      </button>

      {/* Full-screen overlay */}
      <div
        className={`sv-overlay ${open ? 'open' : ''} ${phase}`}
        role="dialog"
        aria-modal="true"
        aria-label="Stella voice assistant"
      >
        <button
          type="button"
          className="sv-close"
          onClick={closeOverlay}
          aria-label={lang === 'fr' ? 'Fermer' : 'Close'}
        >
          <X size={18} strokeWidth={2.8} />
        </button>

        <span className="sv-lang-pill">{lang === 'fr' ? 'FR-FR' : 'EN-US'}</span>

        <div className="sv-title">
          {phase === 'listening' && greeting}
          {phase === 'thinking' && (lang === 'fr' ? 'Stella réfléchit…' : 'Stella is thinking…')}
          {phase === 'responding' && (lang === 'fr' ? 'Stella te répond ✨' : 'Stella is replying ✨')}
          {phase === 'idle' && ' '}
        </div>

        <div className="sv-waveform" aria-hidden="true">
          <span className="sv-bar" />
          <span className="sv-bar" />
          <span className="sv-bar" />
          <span className="sv-bar" />
          <span className="sv-bar" />
          <span className="sv-bar" />
          <span className="sv-bar" />
        </div>

        <div className="sv-status">
          {phase === 'listening' && (lang === 'fr' ? 'En écoute…' : 'Listening…')}
          {phase === 'thinking' && (lang === 'fr' ? 'Analyse…' : 'Processing…')}
          {phase === 'responding' && (lang === 'fr' ? 'Réponse en cours' : 'Responding')}
          {phase === 'idle' && ' '}
        </div>

        <div className="sv-thread">
          {userPhrase && (
            <div className="sv-bubble user">{userPhrase}</div>
          )}
          {reply && (
            <div className="sv-bubble stella">{reply}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default StellaVoiceAssistant;
