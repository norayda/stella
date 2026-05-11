/**
 * @krisspy-file
 * @type page
 * @name "StellaInterests"
 * @title "STELLA — Centres d'intérêt"
 * @description "Centres d'intérêt multi-select pour personnaliser les conseils Stella."
 * @routes ["/interests"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Check } from 'lucide-react';

const CHIPS = [
  { id: 'eco',      label: '🌿 Éco-conduite' },
  { id: 'roadtrip', label: '🗺️ Road trips' },
  { id: 'savings',  label: '💰 Économies' },
  { id: 'safety',   label: '🛡️ Sécurité' },
  { id: 'city',     label: '🏙️ Conduite urbaine' },
  { id: 'charge',   label: '⚡ Recharge EV' },
  { id: 'maint',    label: '🔧 Entretien auto' },
  { id: 'long',     label: '✈️ Longs trajets' },
  { id: 'night',    label: '🌙 Conduite de nuit' },
];

const StellaInterests: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(() => {
    try {
      const raw = window.sessionStorage.getItem('stella:interests');
      return raw ? JSON.parse(raw) : ['eco', 'savings'];
    } catch {
      return ['eco', 'savings'];
    }
  });
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, []);

  const toggle = (id: string) =>
    setSelected((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const save = () => {
    try { window.sessionStorage.setItem('stella:interests', JSON.stringify(selected)); } catch { /* noop */ }
    showToast('✅ Centres d\'intérêt mis à jour ! Stella s\'adapte.');
    window.setTimeout(() => navigate(-1), 900);
  };

  return (
    <>
      <style>{`
        .in-root * { box-sizing: border-box; }
        .in-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .in-app { width: 100%; max-width: 420px; min-height: 100vh; padding: 16px 20px 40px; display: flex; flex-direction: column; gap: 14px; }
        .in-back { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7); color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06); }
        .in-mark { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px; background: rgba(255,122,112,0.1); border-radius: 50px; }
        .in-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .in-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        .in-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .in-chip {
          border: 1.5px solid #EADFD6;
          background: #FFF; color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 10px 16px; border-radius: 50px;
          cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 180ms ease;
          box-shadow: 0 2px 6px rgba(26,26,46,0.03);
        }
        .in-chip:hover { border-color: #FFB5A7; }
        .in-chip.active {
          background: #FF7A70; color: #FFF;
          border-color: #FF7A70;
          box-shadow: 0 6px 16px rgba(255,122,112,0.35);
        }

        .in-cta {
          width: 100%; border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          font-family: inherit; font-size: 14px; font-weight: 900;
          padding: 13px 18px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 10px 22px rgba(255,122,112,0.4);
          margin-top: 6px;
        }
        .in-cta:hover { background: #F26158; }
        .in-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        .in-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 20px);
          background: #FF7A70; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 20px 50px rgba(255,122,112,0.4);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .in-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="in-root">
        <main className="in-app">
          <button type="button" className="in-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>
          <header>
            <span className="in-mark"><Target size={12} strokeWidth={2.5} /> Centres d'intérêt</span>
            <h1 className="in-h1">Qu'est-ce qui t'intéresse ?</h1>
            <p className="in-sub">Stella personnalise tes conseils selon tes centres d'intérêt.</p>
          </header>

          <div className="in-grid">
            {CHIPS.map((c) => {
              const active = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`in-chip ${active ? 'active' : ''}`}
                  onClick={() => toggle(c.id)}
                  aria-pressed={active}
                >
                  <span>{c.label}</span>
                  {active && <Check size={12} strokeWidth={3.5} />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="in-cta"
            disabled={selected.length === 0}
            onClick={save}
          >
            → Enregistrer mes préférences
          </button>
        </main>
        <div className={`in-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaInterests;
