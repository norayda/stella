/**
 * @krisspy-file
 * @type page
 * @name "StellaVehicle"
 * @title "STELLA — Connexion boîtier OBD2"
 * @description "Connexion simulée au boîtier OBD2 Stella — mock hackathon."
 * @routes ["/vehicle"]
 * @flowName "Onboarding"
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

type Lang = 'fr' | 'en';
type Step = 'searching' | 'found';

const I18N = {
  fr: {
    mark: 'Boîtier Stella',
    title: 'Connecte ton boîtier Stella 🔌',
    sub: 'Le boîtier récupère automatiquement toutes les infos de ta Jeep — kilométrage, santé moteur, niveau de batterie, pneus.',
    searching: '🔍 Recherche du boîtier…',
    found: '✅ Boîtier connecté — Jeep Avenger Electric détectée',
    found_sub: 'Kilométrage · Batterie · Moteur · Pneus synchronisés',
    cta: "C'est parti !",
  },
  en: {
    mark: 'Stella Device',
    title: 'Connect your Stella device 🔌',
    sub: 'The device automatically reads all your Jeep data — mileage, engine health, battery, tires.',
    searching: '🔍 Searching for device…',
    found: '✅ Device connected — Jeep Avenger Electric detected',
    found_sub: 'Mileage · Battery · Engine · Tires synced',
    cta: "Let's go!",
  },
} as const;

const StellaVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [lang] = useState<Lang>('fr');
  const [step, setStep] = useState<Step>('searching');
  const t = I18N[lang];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Mock OBD2: store Jeep Avenger Electric to sessionStorage
      try {
        window.sessionStorage.setItem('stella:vehicle', JSON.stringify({
          brand: 'Jeep',
          model: 'Avenger',
          fuel: 'Électrique',
          year: '2024',
        }));
      } catch { /* noop */ }
      setStep('found');
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        .ov-root * { box-sizing: border-box; }
        .ov-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .ov-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .ov-blobs::before {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .ov-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .ov-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 48px 28px 40px;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
          position: relative; z-index: 1;
          text-align: center;
        }
        .ov-mark {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase; color: #FF7A70;
          padding: 5px 12px; background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .ov-h1 {
          font-size: 26px; font-weight: 900; line-height: 1.2;
          letter-spacing: -0.3px; color: #1A1A2E; margin: 0;
        }
        .ov-sub {
          font-size: 14px; font-weight: 500; color: #8A7A7A;
          line-height: 1.6; max-width: 340px;
        }

        /* OBD2 illustration */
        .ov-device {
          width: 160px; height: 160px;
          border-radius: 28px;
          background: linear-gradient(135deg, #1A1A2E 0%, #2A2A4E 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 24px 48px rgba(26,26,46,0.25), 0 0 0 1px rgba(255,255,255,0.06) inset;
          position: relative;
        }
        .ov-device-plug {
          font-size: 52px; line-height: 1;
          filter: drop-shadow(0 4px 12px rgba(255,122,112,0.5));
        }
        .ov-device-label {
          font-size: 10px; font-weight: 900; letter-spacing: 2px;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
        }
        /* Pulse rings when searching */
        .ov-device::before, .ov-device::after {
          content: ""; position: absolute; border-radius: 50%;
          border: 2px solid rgba(255,122,112,0.4);
          animation: ov-ring 2s ease-out infinite;
        }
        .ov-device::before { width: 200px; height: 200px; }
        .ov-device::after  { width: 240px; height: 240px; animation-delay: 0.5s; }
        @keyframes ov-ring {
          0%   { opacity: 0.6; transform: scale(0.85); }
          100% { opacity: 0;   transform: scale(1.1); }
        }
        /* Stop pulse when found */
        .ov-device.found::before, .ov-device.found::after { animation: none; opacity: 0; }

        /* Status pill */
        .ov-status {
          display: inline-flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 16px 24px; border-radius: 20px;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          box-shadow: 0 10px 24px rgba(26,26,46,0.07);
          width: 100%;
          transition: border-color 300ms ease, box-shadow 300ms ease;
        }
        .ov-status.found {
          border-color: rgba(43,184,166,0.4);
          box-shadow: 0 10px 24px rgba(43,184,166,0.12);
        }
        .ov-status-line {
          font-size: 15px; font-weight: 800; color: #1A1A2E; letter-spacing: -0.1px;
        }
        .ov-status-sub {
          font-size: 12px; font-weight: 600; color: #8A7A7A;
        }
        /* Searching dots */
        .ov-dots span {
          display: inline-block;
          width: 7px; height: 7px; border-radius: 50%;
          background: #FF7A70; margin: 0 3px;
          animation: ov-bounce 1.2s ease-in-out infinite;
        }
        .ov-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ov-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes ov-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        /* CTA */
        .ov-cta {
          width: 100%; border: none; cursor: pointer;
          font-family: inherit; font-size: 16px; font-weight: 900;
          color: #FFF;
          background: linear-gradient(135deg, #FF8F85 0%, #FF7A70 100%);
          padding: 16px 24px; border-radius: 50px;
          box-shadow: 0 14px 28px rgba(255,122,112,0.4);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: transform 150ms ease, box-shadow 200ms ease, opacity 300ms ease;
          opacity: 0; pointer-events: none;
        }
        .ov-cta.visible { opacity: 1; pointer-events: auto; }
        .ov-cta:hover { transform: translateY(-2px); box-shadow: 0 18px 36px rgba(255,122,112,0.45); }
        .ov-cta:active { transform: scale(0.98); }

        @media (min-width: 640px) {
          .ov-app { padding: 64px 40px 40px; }
          .ov-h1 { font-size: 30px; }
        }
        @media (min-width: 1024px) {
          .ov-root { padding-left: 0; }
          .ov-app { max-width: 480px; }
        }
      `}</style>

      <div className="ov-root">
        <div className="ov-blobs" aria-hidden="true" />

        <main className="ov-app">
          <span className="ov-mark">
            <Sparkles size={12} strokeWidth={2.5} /> {t.mark}
          </span>

          <h1 className="ov-h1">{t.title}</h1>
          <p className="ov-sub">{t.sub}</p>

          {/* Device illustration */}
          <div className={`ov-device ${step === 'found' ? 'found' : ''}`} aria-hidden="true">
            <span className="ov-device-plug">🔌</span>
            <span className="ov-device-label">OBD2 · BLE</span>
          </div>

          {/* Status card */}
          <div className={`ov-status ${step === 'found' ? 'found' : ''}`} role="status" aria-live="polite">
            <span className="ov-status-line">
              {step === 'searching' ? t.searching : t.found}
            </span>
            {step === 'searching' ? (
              <div className="ov-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
            ) : (
              <span className="ov-status-sub">{t.found_sub}</span>
            )}
          </div>

          {/* CTA — visible only after connection */}
          <button
            type="button"
            className={`ov-cta ${step === 'found' ? 'visible' : ''}`}
            onClick={() => navigate('/ready')}
            aria-hidden={step !== 'found'}
            tabIndex={step === 'found' ? 0 : -1}
          >
            {t.cta}
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </main>
      </div>
    </>
  );
};

export default StellaVehicle;
