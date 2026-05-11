/**
 * @krisspy-file
 * @type page
 * @name "StellaSOS"
 * @title "STELLA — Aide d'urgence"
 * @description "Écran SOS avec numéros d'urgence français : SAMU 15, Pompiers 18, Gendarmerie 17, Violences conjugales 3919. Contraste élevé, tap-to-call."
 * @routes ["/sos"]
 * @flowName "App"
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';

type Lang = 'fr' | 'en';

const I18N = {
  fr: {
    title: 'Aide d\'urgence',
    sub: 'Appui sur une carte pour appeler immédiatement.',
    footer: 'Ces numéros sont gratuits et disponibles 24h/24.',
    back: 'Retour',
    contacts: [
      { id: 'samu', emoji: '🚑', name: 'SAMU', number: '15', label: 'Urgence médicale', color: '#E53935' },
      { id: 'pompiers', emoji: '🚒', name: 'Pompiers', number: '18', label: 'Incendie ou accident', color: '#FF6F00' },
      { id: 'gendarmerie', emoji: '🚔', name: 'Gendarmerie', number: '17', label: 'Danger ou agression', color: '#1A237E' },
      { id: 'violences', emoji: '💜', name: 'Violences conjugales', number: '3919', label: 'Violence conjugale — écoute 24h/24', color: '#6B4E9B' },
    ],
  },
  en: {
    title: 'Emergency help',
    sub: 'Tap a card to call immediately.',
    footer: 'These numbers are free and available 24/7.',
    back: 'Back',
    contacts: [
      { id: 'samu', emoji: '🚑', name: 'SAMU', number: '15', label: 'Medical emergency', color: '#E53935' },
      { id: 'pompiers', emoji: '🚒', name: 'Pompiers', number: '18', label: 'Fire or accident', color: '#FF6F00' },
      { id: 'gendarmerie', emoji: '🚔', name: 'Gendarmerie', number: '17', label: 'Danger or assault', color: '#1A237E' },
      { id: 'violences', emoji: '💜', name: 'Domestic violence', number: '3919', label: 'Domestic violence — 24/7 helpline', color: '#6B4E9B' },
    ],
  },
} as const;

const StellaSOS: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');
  const t = I18N[lang];

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <>
      <style>{`
        .so-root * { box-sizing: border-box; }
        .so-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #FFF;
          background: #1A1A2E;
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .so-root::before {
          content: ""; position: fixed; inset: 0;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(229,57,53,0.18) 0%, transparent 45%),
            radial-gradient(ellipse at 80% 100%, rgba(107,78,155,0.22) 0%, transparent 50%);
          pointer-events: none;
        }
        .so-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 20px 32px;
          display: flex; flex-direction: column; gap: 18px;
          position: relative; z-index: 1;
        }
        .so-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .so-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: rgba(255,255,255,0.08);
          color: #FFF;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 8px 14px 8px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.1);
          transition: background 180ms ease, transform 150ms ease;
          backdrop-filter: blur(8px);
        }
        .so-back:hover { background: rgba(255,255,255,0.14); }
        .so-back:active { transform: scale(0.97); }
        .so-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.08); border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .so-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.65);
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
        }
        .so-lang-btn.active {
          background: #FFF; color: #1A1A2E;
        }

        .so-header { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
        .so-badge {
          align-self: flex-start;
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10.5px; font-weight: 800; letter-spacing: 1.4px;
          text-transform: uppercase;
          padding: 5px 12px; border-radius: 50px;
          background: rgba(229,57,53,0.18);
          color: #FFB4B0;
          border: 1px solid rgba(229,57,53,0.5);
        }
        .so-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #E53935;
          box-shadow: 0 0 10px rgba(229,57,53,0.9);
          animation: so-pulse 1s ease-in-out infinite;
        }
        @keyframes so-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        .so-title {
          font-size: 28px; font-weight: 900; color: #FFF;
          letter-spacing: -0.4px; margin: 4px 0 0;
          line-height: 1.1;
        }
        .so-sub {
          font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.6); line-height: 1.5; margin: 0;
        }

        .so-list {
          display: flex; flex-direction: column; gap: 12px;
          margin-top: 4px;
        }
        .so-card {
          width: 100%;
          display: flex; align-items: center; gap: 14px;
          padding: 18px 18px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid var(--so-color);
          cursor: pointer;
          font-family: inherit; text-align: left;
          color: #FFF;
          transition: transform 180ms ease, background 200ms ease, box-shadow 200ms ease;
          position: relative;
          overflow: hidden;
        }
        .so-card::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(135deg, var(--so-color) 0%, transparent 85%);
          opacity: 0.18;
          pointer-events: none;
        }
        .so-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.06);
          box-shadow: 0 14px 30px rgba(0,0,0,0.35), 0 0 0 1px var(--so-color) inset;
        }
        .so-card:active { transform: translateY(0) scale(0.99); }
        .so-card-emoji {
          flex-shrink: 0;
          width: 52px; height: 52px; border-radius: 14px;
          background: var(--so-color);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.35);
          position: relative; z-index: 1;
        }
        .so-card-body {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 2px;
          position: relative; z-index: 1;
        }
        .so-card-top {
          display: flex; align-items: baseline; gap: 10px;
        }
        .so-card-number {
          font-size: 28px; font-weight: 900;
          letter-spacing: -0.6px; color: #FFF;
          line-height: 1;
        }
        .so-card-name {
          font-size: 12px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.8);
        }
        .so-card-label {
          font-size: 12.5px; font-weight: 500;
          color: rgba(255,255,255,0.68);
          line-height: 1.4;
          margin-top: 3px;
        }
        .so-card-phone {
          flex-shrink: 0;
          width: 44px; height: 44px; border-radius: 50%;
          background: #FFF; color: var(--so-color);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.3);
          position: relative; z-index: 1;
          animation: so-ring 2.4s ease-in-out infinite;
        }
        @keyframes so-ring {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-14deg); }
          20% { transform: rotate(12deg); }
          30% { transform: rotate(-8deg); }
          40% { transform: rotate(6deg); }
          50% { transform: rotate(0deg); }
        }

        .so-footer {
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.4);
          text-align: center;
          line-height: 1.5;
          margin-top: 8px;
        }

        @media (min-width: 640px) {
          .so-app { padding: 32px 20px 40px; }
          .so-title { font-size: 30px; }
        }
      `}</style>

      <div className="so-root">
        <main className="so-app">
          <div className="so-top">
            <button
              type="button"
              className="so-back"
              onClick={() => navigate(-1)}
              aria-label={t.back}
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              {t.back}
            </button>
            <div className="so-lang" role="tablist">
              <button
                type="button"
                className={`so-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >FR</button>
              <button
                type="button"
                className={`so-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >EN</button>
            </div>
          </div>

          <header className="so-header">
            <span className="so-badge">
              <span className="so-badge-dot" />
              SOS
            </span>
            <h1 className="so-title">{t.title}</h1>
            <p className="so-sub">{t.sub}</p>
          </header>

          <div className="so-list">
            {t.contacts.map((c) => (
              <button
                key={c.id}
                type="button"
                className="so-card"
                style={{ ['--so-color' as string]: c.color } as React.CSSProperties}
                onClick={() => handleCall(c.number)}
                aria-label={`${c.name} — ${c.number}`}
              >
                <span className="so-card-emoji" aria-hidden="true">{c.emoji}</span>
                <span className="so-card-body">
                  <span className="so-card-top">
                    <span className="so-card-number">{c.number}</span>
                    <span className="so-card-name">{c.name}</span>
                  </span>
                  <span className="so-card-label">{c.label}</span>
                </span>
                <span className="so-card-phone" aria-hidden="true">
                  <Phone size={18} strokeWidth={2.8} fill="currentColor" />
                </span>
              </button>
            ))}
          </div>

          <p className="so-footer">{t.footer}</p>
        </main>
      </div>
    </>
  );
};

export default StellaSOS;
