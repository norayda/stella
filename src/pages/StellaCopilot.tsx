/**
 * @krisspy-file
 * @type page
 * @name "StellaCopilot"
 * @title "STELLA — Copilote"
 * @description "Écran de chat copilote IA : suggestions rapides, thread conversationnel, reconnaissance vocale simulée. Bilingue FR/EN, réponses mock côté client."
 * @routes ["/copilot"]
 * @flowName "App"
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Mic, Home, Map as MapIcon, Star, User, ArrowLeft } from 'lucide-react';

type Lang = 'fr' | 'en';
type Sender = 'user' | 'stella';

type Message = {
  id: string;
  sender: Sender;
  text: string;
  time: string;
};

const I18N = {
  fr: {
    back: 'Retour',
    mark: 'Stella',
    title: 'Coucou, quoi de neuf ? ✨',
    sub: 'Demande-moi tout — je te couvre.',
    placeholder: 'Pose ta question à Stella…',
    listening: 'En écoute…',
    voice_phrase: 'Planifier un trajet sécurisé',
    hello: (name: string) => `Salut ${name} ! Long trajet prévu ? Je peux te trouver une route bien éclairée 💡`,
    chips: [
      'Pourquoi ce voyant est-il allumé ?',
      'Je prépare un road trip ce week-end',
      'Le garage me facture 800€, c\'est correct ?',
      'J\'entends un bruit bizarre au freinage',
      'Économiser sur le carburant',
      'Trouver un garage accessible près de moi',
    ],
    nav: [
      { id: 'home', label: 'Accueil' },
      { id: 'trips', label: 'Trajets' },
      { id: 'perks', label: 'Avantages' },
      { id: 'profile', label: 'Profil' },
    ],
    replies: {
      warning: 'Ce voyant orange, c\'est la pression des pneus — pas urgent, mais à régler cette semaine. 5 min à la station-service suffit 🔧',
      garage: '🛠️ Bon réflexe de vérifier. Demande un détail écrit avec les références pièces — tape Analyser le devis et je te dis ce qui cloche.',
      noise: '🛠️ Bon indice — c\'est au freinage ou sur les bosses ? Décris-moi et on creuse ensemble avant de dépenser en garage.',
      trip: '🌱 Check rapide : pneus OK, lave-glace plein, chargeur téléphone dans le sac. Tape Planifier ce trajet et je te cale une pause toutes les 2h.',
      emergency: '🚨 Je suis là. Appuie sur SOS pour joindre les secours et partager ta position — reste où tu es si c\'est sûr.',
      fuel: '💸 Accélérations douces + freinages anticipés = environ 18€ d\'économies par mois. Active le mode Éco dans les réglages !',
      default: '✅ Je suis là pour toi 💛 Raconte-moi — tu roules là, ou tu prépares quelque chose ?',
    },
  },
  en: {
    back: 'Back',
    mark: 'Stella',
    title: "Hey, what's up? ✨",
    sub: "Ask me anything — I've got your back.",
    placeholder: 'Ask Stella anything…',
    listening: 'Listening…',
    voice_phrase: 'Plan a safe route home',
    hello: (name: string) => `Hey ${name}! Long drive ahead? I can check your route for well-lit roads 💡`,
    chips: [
      'Why is this warning light on?',
      'Planning a road trip this weekend',
      'The garage quoted me €800 — is that fair?',
      'I hear a weird sound when I brake',
      'Save money on fuel',
      'Find an accessible garage near me',
    ],
    nav: [
      { id: 'home', label: 'Home' },
      { id: 'trips', label: 'Trips' },
      { id: 'perks', label: 'Perks' },
      { id: 'profile', label: 'Profile' },
    ],
    replies: {
      warning: 'That orange light is tyre pressure — not urgent, but worth sorting this week. 5 minutes at the petrol station will do it 🔧',
      garage: "🛠️ Smart to double-check. Ask for a written breakdown with part references — tap Analyze quote and I'll flag anything off.",
      noise: "🛠️ Good clue — is it when braking, or over bumps? Describe it and we'll dig in together before spending at the garage.",
      trip: '🌱 Quick check: tyres OK, washer fluid topped up, phone charger in the bag. Tap Plan this trip and I\'ll add a break every 2 hours.',
      emergency: "🚨 I'm here. Tap SOS to reach emergency services and share your location — stay put if it's safe.",
      fuel: '💸 Smooth acceleration + early braking = roughly €18 savings per month. Switch on Eco mode in settings!',
      default: "✅ I'm here for you 💛 Tell me more — are you driving right now, or planning something?",
    },
  },
} as const;

const NAV_ICONS: Record<string, React.ReactNode> = {
  home: <Home size={20} strokeWidth={2.4} />,
  trips: <MapIcon size={20} strokeWidth={2.4} />,
  perks: <Star size={20} strokeWidth={2.4} />,
  profile: <User size={20} strokeWidth={2.4} />,
};

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

let idCounter = 0;
const newId = () => `m${Date.now()}_${++idCounter}`;

const StellaCopilot: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyTimer = useRef<number | null>(null);
  const voiceTimer = useRef<number | null>(null);

  const t = I18N[lang];

  const nickname = useMemo(() => {
    try {
      const stored = (window.sessionStorage.getItem('stella:nickname') || '').trim();
      if (stored) return stored;
    } catch { /* noop */ }
    return 'Marie';
  }, []);

  const pickReply = useCallback((raw: string): string => {
    const s = raw.toLowerCase();
    const r = I18N[lang].replies;
    if (/(voyant|warning light|warning|dashboard light)/.test(s)) return r.warning;
    if (/(garage|devis|quote|facture|charged|bill)/.test(s)) return r.garage;
    if (/(bruit|noise|sound|weird sound)/.test(s)) return r.noise;
    if (/(trajet|road trip|road-trip|trip|itin[eé]raire|drive|route)/.test(s)) return r.trip;
    if (/(urgence|emergency|accident|sos|crash)/.test(s)) return r.emergency;
    if (/(carburant|fuel|essence|gas|[ée]conomiser|saving|save)/.test(s)) return r.fuel;
    return r.default;
  }, [lang]);

  const scrollToBottom = useCallback(() => {
    const el = threadRef.current;
    if (!el) return;
    // smooth after first paint
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  const sendMessage = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg: Message = {
      id: newId(), sender: 'user', text, time: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      const reply: Message = {
        id: newId(), sender: 'stella', text: pickReply(text), time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
    }, 800);
  }, [pickReply]);

  // Greeting on mount
  useEffect(() => {
    const greet: Message = {
      id: newId(), sender: 'stella', text: t.hello(nickname), time: formatTime(new Date()),
    };
    setMessages([greet]);
    // no deps on lang — greeting uses the FR default. lang switch handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When lang toggles, rewrite the greeting if it's the only message AND keep messages as-is otherwise.
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      if (first && first.sender === 'stella' && rest.length === 0) {
        return [{ ...first, text: I18N[lang].hello(nickname) }];
      }
      return prev;
    });
  }, [lang, nickname]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (replyTimer.current) window.clearTimeout(replyTimer.current);
      if (voiceTimer.current) window.clearTimeout(voiceTimer.current);
    };
  }, []);

  const handleSend = () => sendMessage(input);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (listening) {
      if (voiceTimer.current) window.clearTimeout(voiceTimer.current);
      setListening(false);
      return;
    }
    setListening(true);
    if (voiceTimer.current) window.clearTimeout(voiceTimer.current);
    voiceTimer.current = window.setTimeout(() => {
      setListening(false);
      sendMessage(t.voice_phrase);
    }, 2000);
  };

  const canSend = input.trim().length > 0;

  return (
    <>
      <style>{`
        .sc-root * { box-sizing: border-box; }
        .sc-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .sc-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .sc-blobs::before, .sc-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.45;
        }
        .sc-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .sc-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 5%; left: -100px;
        }

        .sc-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 16px 20px 180px;
          display: flex; flex-direction: column; gap: 18px;
          position: relative; z-index: 1;
        }

        .sc-top {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .sc-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
          transition: background 180ms ease, transform 150ms ease;
          backdrop-filter: blur(8px);
        }
        .sc-back:hover { background: #FFF; }
        .sc-back:active { transform: scale(0.97); }
        .sc-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .sc-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
        }
        .sc-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 3px 10px rgba(255,122,112,0.3);
        }

        /* Hero */
        .sc-hero {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          text-align: center;
          padding: 4px 0 6px;
        }
        .sc-avatar-wrap {
          position: relative;
          width: 88px; height: 88px;
        }
        .sc-avatar {
          width: 88px; height: 88px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          display: flex; align-items: center; justify-content: center;
          color: #FFF;
          box-shadow: 0 14px 32px rgba(255,122,112,0.35);
          position: relative;
        }
        .sc-avatar::after {
          content: ""; position: absolute; inset: -4px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,122,112,0.35);
          animation: sc-ring 2.6s ease-out infinite;
        }
        @keyframes sc-ring {
          0% { transform: scale(0.96); opacity: 0.8; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        .sc-avatar-dot {
          position: absolute; top: 4px; right: 4px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #FF7A70;
          border: 2.5px solid #FDF0E8;
          box-shadow: 0 0 10px rgba(255,122,112,0.6);
        }
        .sc-mark {
          font-size: 11px; font-weight: 800; letter-spacing: 1.8px;
          text-transform: uppercase; color: #FF7A70;
        }
        .sc-h1 {
          font-size: 24px; font-weight: 900; line-height: 1.22;
          letter-spacing: -0.3px; color: #1A1A2E;
          margin: 2px 0 0;
        }
        .sc-sub {
          font-size: 14px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }

        /* Suggestion chips row */
        .sc-chips {
          display: flex; flex-direction: row; gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          margin: 0 -20px;
          padding: 4px 20px;
        }
        .sc-chips::-webkit-scrollbar { display: none; }
        .sc-chip {
          flex-shrink: 0;
          font-family: inherit;
          background: #FFF; color: #FF7A70;
          border: 1.5px solid #FF7A70;
          font-size: 12.5px; font-weight: 700;
          padding: 9px 14px; border-radius: 50px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 180ms ease;
          box-shadow: 0 2px 6px rgba(26,26,46,0.03);
        }
        .sc-chip:hover {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 8px 18px rgba(255,122,112,0.25);
          transform: translateY(-1px);
        }
        .sc-chip:active { transform: translateY(0); }

        /* Thread */
        .sc-thread {
          display: flex; flex-direction: column; gap: 14px;
          padding: 4px 0;
        }
        .sc-row { display: flex; gap: 8px; align-items: flex-end; }
        .sc-row.user { justify-content: flex-end; }
        .sc-stella-avatar {
          flex-shrink: 0;
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(255,122,112,0.3);
        }
        .sc-bubble-wrap {
          display: flex; flex-direction: column; gap: 3px;
          max-width: 78%;
        }
        .sc-bubble-wrap.user { align-items: flex-end; }
        .sc-bubble {
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px; font-weight: 600;
          line-height: 1.45;
          box-shadow: 0 4px 12px rgba(26,26,46,0.05);
        }
        .sc-bubble.stella {
          background: #FFF;
          color: #1A1A2E;
          border: 1px solid rgba(26,26,46,0.06);
          border-bottom-left-radius: 6px;
        }
        .sc-bubble.user {
          background: #FF7A70;
          color: #FFF;
          border-bottom-right-radius: 6px;
          box-shadow: 0 6px 16px rgba(255,122,112,0.3);
        }
        .sc-time {
          font-size: 10.5px; font-weight: 600;
          color: #B8ACAC;
          padding: 0 6px;
        }

        /* Typing indicator */
        .sc-typing-bubble {
          padding: 12px 16px;
          background: #FFF;
          border-radius: 16px;
          border: 1px solid rgba(26,26,46,0.06);
          border-bottom-left-radius: 6px;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .sc-typing-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #FF7A70;
          animation: sc-bounce 1.1s ease-in-out infinite;
        }
        .sc-typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .sc-typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes sc-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        /* Listening banner */
        .sc-listening {
          position: fixed; bottom: 168px; left: 50%; transform: translateX(-50%);
          z-index: 60;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 50px;
          background: rgba(26,26,46,0.92); color: #FFF;
          font-size: 12px; font-weight: 700;
          box-shadow: 0 14px 30px rgba(26,26,46,0.25);
          backdrop-filter: blur(6px);
          opacity: 0; pointer-events: none;
          transition: opacity 200ms ease, transform 200ms ease;
        }
        .sc-listening.show {
          opacity: 1;
          transform: translateX(-50%) translateY(-4px);
        }
        .sc-listening-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #E53935;
          box-shadow: 0 0 12px rgba(229,57,53,0.9);
          animation: sc-pulse 0.9s ease-in-out infinite;
        }
        @keyframes sc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.75); }
        }

        /* Input bar */
        .sc-input-wrap {
          position: fixed; bottom: 88px; left: 50%; transform: translateX(-50%);
          width: calc(100% - 28px); max-width: 392px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(14px);
          border-radius: 999px;
          box-shadow: 0 14px 30px rgba(26,26,46,0.1), 0 0 0 1px rgba(26,26,46,0.04) inset;
          display: flex; align-items: center; gap: 8px;
          z-index: 55;
        }
        .sc-mic-btn {
          flex-shrink: 0;
          border: none;
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(255,122,112,0.35);
          transition: transform 150ms ease, filter 180ms ease;
        }
        .sc-mic-btn.listening {
          background: linear-gradient(135deg, #E53935 0%, #B91C17 100%);
          animation: sc-mic-pulse 900ms ease-in-out infinite;
        }
        @keyframes sc-mic-pulse {
          0%, 100% { box-shadow: 0 8px 18px rgba(229,57,53,0.45), 0 0 0 0 rgba(229,57,53,0.5); }
          50% { box-shadow: 0 8px 18px rgba(229,57,53,0.45), 0 0 0 10px rgba(229,57,53,0); }
        }
        .sc-mic-btn:active { transform: scale(0.94); }
        .sc-input {
          flex: 1; border: none; outline: none;
          background: transparent;
          font-family: inherit; font-size: 14px; font-weight: 600;
          color: #1A1A2E;
          padding: 4px 6px;
          min-width: 0;
        }
        .sc-input::placeholder { color: #B8ACAC; font-weight: 500; }
        .sc-input-wrap:focus-within {
          box-shadow: 0 14px 30px rgba(26,26,46,0.1), 0 0 0 1.5px #FF7A70 inset;
        }
        .sc-send-btn {
          flex-shrink: 0;
          border: none;
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform 150ms ease, background 180ms ease, color 180ms ease;
        }
        .sc-send-btn.enabled {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 6px 14px rgba(255,122,112,0.4);
        }
        .sc-send-btn.enabled:active { transform: scale(0.94); }
        .sc-send-btn.disabled {
          background: #EADFD6; color: #B8ACAC;
          cursor: not-allowed;
        }

        /* Bottom nav — same style as home */
        .sc-nav {
          position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%);
          width: calc(100% - 28px); max-width: 392px;
          padding: 8px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(14px);
          border-radius: 22px;
          box-shadow: 0 20px 40px rgba(26,26,46,0.15), 0 0 0 1px rgba(255,255,255,0.6) inset;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          z-index: 50;
        }
        .sc-nav-btn {
          border: none; background: transparent;
          font-family: inherit;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 10px 6px; border-radius: 14px;
          font-size: 10.5px; font-weight: 700;
          color: #8A7A7A;
          cursor: pointer;
          transition: all 200ms ease;
        }
        .sc-nav-btn svg { transition: transform 200ms ease; }
        .sc-nav-btn:hover { color: #1A1A2E; }
        .sc-nav-btn.active {
          background: linear-gradient(135deg, rgba(255,122,112,0.12) 0%, rgba(107,78,155,0.1) 100%);
          color: #FF7A70;
        }
        .sc-nav-btn.active svg {
          color: #FF7A70;
          filter: drop-shadow(0 4px 10px rgba(255,122,112,0.5));
        }

        @media (min-width: 640px) {
          .sc-app { padding: 24px 20px 180px; }
          .sc-h1 { font-size: 26px; }
        }
      `}</style>

      <div className="sc-root">
        <div className="sc-blobs" aria-hidden="true" />

        <main className="sc-app">
          <div className="sc-top">
            <button
              type="button"
              className="sc-back"
              onClick={() => navigate(-1)}
              aria-label={t.back}
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
              {t.back}
            </button>
            <div className="sc-lang" role="tablist">
              <button
                type="button"
                className={`sc-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >FR</button>
              <button
                type="button"
                className={`sc-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >EN</button>
            </div>
          </div>

          <header className="sc-hero">
            <div className="sc-avatar-wrap">
              <div className="sc-avatar">
                <Sparkles size={36} strokeWidth={2.3} />
              </div>
              <span className="sc-avatar-dot" aria-hidden="true" />
            </div>
            <span className="sc-mark">{t.mark}</span>
            <h1 className="sc-h1">{t.title}</h1>
            <p className="sc-sub">{t.sub}</p>
          </header>

          <div className="sc-chips" role="group" aria-label="Suggestions">
            {t.chips.map((c, i) => (
              <button
                key={i}
                type="button"
                className="sc-chip"
                onClick={() => sendMessage(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="sc-thread" ref={threadRef} aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`sc-row ${m.sender}`}>
                {m.sender === 'stella' && (
                  <span className="sc-stella-avatar" aria-hidden="true">
                    <Sparkles size={14} strokeWidth={2.5} />
                  </span>
                )}
                <div className={`sc-bubble-wrap ${m.sender}`}>
                  <div className={`sc-bubble ${m.sender}`}>{m.text}</div>
                  <span className="sc-time">{m.time}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="sc-row stella">
                <span className="sc-stella-avatar" aria-hidden="true">
                  <Sparkles size={14} strokeWidth={2.5} />
                </span>
                <div className="sc-typing-bubble" aria-label="Stella is typing">
                  <span className="sc-typing-dot" />
                  <span className="sc-typing-dot" />
                  <span className="sc-typing-dot" />
                </div>
              </div>
            )}
          </div>
        </main>

        <div className={`sc-listening ${listening ? 'show' : ''}`} role="status" aria-live="polite">
          <span className="sc-listening-dot" />
          {t.listening}
        </div>

        <div className="sc-input-wrap">
          <button
            type="button"
            className={`sc-mic-btn ${listening ? 'listening' : ''}`}
            onClick={toggleVoice}
            aria-label="Voice"
          >
            <Mic size={20} strokeWidth={2.5} />
          </button>
          <input
            ref={inputRef}
            type="text"
            className="sc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
          />
          <button
            type="button"
            className={`sc-send-btn ${canSend ? 'enabled' : 'disabled'}`}
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="sc-nav" aria-label="Navigation principale">
          {t.nav.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`sc-nav-btn ${n.id === 'home' ? '' : ''}`}
              onClick={() => {
                if (n.id === 'home') navigate('/home');
              }}
            >
              {NAV_ICONS[n.id]}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default StellaCopilot;
