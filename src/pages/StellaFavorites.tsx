/**
 * @krisspy-file
 * @type page
 * @name "StellaFavorites"
 * @title "STELLA — Favoris"
 * @description "Lieux et trajets favoris de l'utilisateur — onglets Lieux / Trajets."
 * @routes ["/favorites"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ChevronRight, Plus, Home as HomeIcon, Briefcase, Star, MapPin, Bookmark } from 'lucide-react';

const PLACES = [
  { id: 'p1', icon: <HomeIcon size={16} strokeWidth={2.5} />, name: 'Maison',       sub: '12 rue de la Paix, Paris · Domicile', tone: 'coral' },
  { id: 'p2', icon: <Briefcase size={16} strokeWidth={2.5} />, name: 'Bureau',      sub: 'La Défense, Paris · Travail',         tone: 'purple' },
  { id: 'p3', icon: <Star size={16} strokeWidth={2.5} />,     name: 'Parc de Saint-Cloud', sub: 'Favori',                 tone: 'amber' },
];

const TRIPS = [
  { id: 't1', from: 'Paris', to: 'Lyon', km: 465, date: 'Sauvegardé le 12/01/2026' },
  { id: 't2', from: 'Paris', to: 'Nice', km: 686, date: 'Sauvegardé le 09/01/2026' },
];

const StellaFavorites: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'places' | 'trips'>('places');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, []);

  return (
    <>
      <style>{`
        .fv-root * { box-sizing: border-box; }
        .fv-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .fv-app { width: 100%; max-width: 420px; min-height: 100vh; padding: 16px 20px 40px; display: flex; flex-direction: column; gap: 14px; }
        .fv-back { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7); color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06); }
        .fv-mark { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px; background: rgba(255,122,112,0.1); border-radius: 50px; }
        .fv-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .fv-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        .fv-tabs {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.75); border-radius: 50px;
          box-shadow: 0 6px 16px rgba(26,26,46,0.06);
          border: 1px solid rgba(26,26,46,0.04);
        }
        .fv-tab {
          border: none; background: transparent;
          font-family: inherit; font-size: 13px; font-weight: 800;
          color: #8A7A7A; padding: 10px 14px; border-radius: 50px;
          cursor: pointer;
        }
        .fv-tab.active {
          background: linear-gradient(135deg, #FF7A70 0%, #F26158 100%);
          color: #FFF; box-shadow: 0 6px 14px rgba(255,122,112,0.38);
        }

        .fv-list { display: flex; flex-direction: column; gap: 10px; }
        .fv-row {
          display: flex; align-items: center; gap: 12px;
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px; padding: 12px 14px;
          cursor: pointer; font-family: inherit; text-align: left;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
          transition: transform 150ms ease, border-color 150ms ease;
        }
        .fv-row:hover { transform: translateY(-1px); border-color: rgba(255,122,112,0.3); }
        .fv-ico {
          flex-shrink: 0; width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .fv-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .fv-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .fv-ico.amber { background: #FDEFD4; color: #B27300; }
        .fv-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .fv-name { font-size: 14px; font-weight: 900; color: #1A1A2E; }
        .fv-sub2 { font-size: 11.5px; font-weight: 600; color: #8A7A7A; line-height: 1.4; }
        .fv-chev { color: #B8ACAC; }

        .fv-add {
          border: 1.5px dashed rgba(255,122,112,0.55);
          background: transparent; color: #FF7A70;
          padding: 12px 14px; border-radius: 16px;
          font-family: inherit; font-size: 13px; font-weight: 900;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer;
          transition: background 150ms ease;
        }
        .fv-add:hover { background: #FFF5F2; }

        .fv-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 20px);
          background: #FF7A70; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 20px 50px rgba(255,122,112,0.4);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .fv-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="fv-root">
        <main className="fv-app">
          <button type="button" className="fv-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>
          <header>
            <span className="fv-mark"><Heart size={12} strokeWidth={2.5} /> Favoris</span>
            <h1 className="fv-h1">Favoris</h1>
            <p className="fv-sub">Tes lieux et trajets sauvegardés.</p>
          </header>

          <div className="fv-tabs" role="tablist">
            <button type="button" className={`fv-tab ${tab === 'places' ? 'active' : ''}`} onClick={() => setTab('places')}>Lieux</button>
            <button type="button" className={`fv-tab ${tab === 'trips' ? 'active' : ''}`} onClick={() => setTab('trips')}>Trajets</button>
          </div>

          {tab === 'places' && (
            <>
              <div className="fv-list">
                {PLACES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="fv-row"
                    onClick={() => { navigate('/trips'); }}
                  >
                    <span className={`fv-ico ${p.tone}`}>{p.icon}</span>
                    <span className="fv-text">
                      <span className="fv-name">{p.name}</span>
                      <span className="fv-sub2">{p.sub}</span>
                    </span>
                    <ChevronRight size={16} strokeWidth={2.5} className="fv-chev" />
                  </button>
                ))}
              </div>
              <button type="button" className="fv-add" onClick={() => showToast('Nouveau lieu — bientôt')}>
                <Plus size={14} strokeWidth={2.8} /> Ajouter un lieu
              </button>
            </>
          )}

          {tab === 'trips' && (
            <>
              <div className="fv-list">
                {TRIPS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="fv-row"
                    onClick={() => { navigate('/trips'); }}
                  >
                    <span className="fv-ico purple"><Bookmark size={16} strokeWidth={2.5} /></span>
                    <span className="fv-text">
                      <span className="fv-name">{t.from} → {t.to}</span>
                      <span className="fv-sub2">{t.km} km · {t.date}</span>
                    </span>
                    <ChevronRight size={16} strokeWidth={2.5} className="fv-chev" />
                  </button>
                ))}
              </div>
              <button type="button" className="fv-add" onClick={() => showToast('Nouveau trajet — bientôt')}>
                <Plus size={14} strokeWidth={2.8} /> Sauvegarder un trajet
              </button>
            </>
          )}
        </main>
        <div className={`fv-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaFavorites;
