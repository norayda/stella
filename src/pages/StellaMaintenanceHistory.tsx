/**
 * @krisspy-file
 * @type page
 * @name "StellaMaintenanceHistory"
 * @title "STELLA — Carnet d'entretien"
 * @description "Historique complet des entretiens du véhicule : timeline, ajout, partage."
 * @routes ["/maintenance-history"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, Plus, Share2 } from 'lucide-react';

const ITEMS = [
  { id: 'm1', icon: '🔧', title: 'Vidange',                 date: '15/01/2026', where: 'Garage Eurorepar',    cost: '85 €',  next: 'Prochaine : 22 450 km' },
  { id: 'm2', icon: '🛞', title: 'Rotation pneus',          date: '10/03/2026', where: 'AutoService',          cost: '45 €',  next: null as string | null },
  { id: 'm3', icon: '🔋', title: 'Vérification batterie',   date: '02/04/2026', where: 'Concessionnaire Jeep', cost: '0 €',   next: null as string | null },
  { id: 'm4', icon: '🔧', title: 'Contrôle freins',         date: '18/11/2025', where: 'Garage Eurorepar',    cost: '30 €',  next: null as string | null },
  { id: 'm5', icon: '🛞', title: 'Changement pneus hiver',  date: '05/11/2025', where: 'AutoService',          cost: '420 €', next: null as string | null },
];

const StellaMaintenanceHistory: React.FC = () => {
  const navigate = useNavigate();
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
        .mh-root * { box-sizing: border-box; }
        .mh-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          -webkit-font-smoothing: antialiased;
        }
        .mh-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 16px 20px 40px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .mh-back {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
        }
        .mh-back:hover { background: #FFF; }
        .mh-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #6B4E9B; padding: 5px 12px;
          background: rgba(107,78,155,0.1); border-radius: 50px;
        }
        .mh-h1 {
          font-size: 24px; font-weight: 900; line-height: 1.2;
          letter-spacing: -0.4px; margin: 6px 0 4px;
        }
        .mh-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        .mh-list { display: flex; flex-direction: column; gap: 10px; }
        .mh-row {
          display: flex; gap: 12px; align-items: flex-start;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 12px 14px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
        }
        .mh-dot {
          flex-shrink: 0;
          width: 38px; height: 38px; border-radius: 12px;
          background: #FFE6E3;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .mh-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .mh-title { font-size: 14px; font-weight: 900; color: #1A1A2E; }
        .mh-meta { font-size: 12px; font-weight: 600; color: #8A7A7A; }
        .mh-next { font-size: 11.5px; font-weight: 800; color: #6B4E9B; margin-top: 2px; }

        .mh-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .mh-btn {
          border: none; cursor: pointer;
          font-family: inherit; font-size: 13px; font-weight: 800;
          padding: 12px 16px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          transition: background 150ms ease, transform 150ms ease;
        }
        .mh-btn.coral {
          background: #FFF; color: #FF7A70;
          border: 1.5px solid #FF7A70;
        }
        .mh-btn.coral:hover { background: #FFF5F2; }
        .mh-btn.purple {
          background: #6B4E9B; color: #FFF;
          box-shadow: 0 8px 18px rgba(107,78,155,0.35);
        }
        .mh-btn.purple:hover { filter: brightness(1.05); }
        .mh-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translate(-50%, 20px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 20px 50px rgba(26,26,46,0.25);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .mh-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="mh-root">
        <main className="mh-app">
          <button type="button" className="mh-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} />
            Retour
          </button>
          <header>
            <span className="mh-mark"><Wrench size={12} strokeWidth={2.5} /> Entretien</span>
            <h1 className="mh-h1">Carnet d'entretien</h1>
            <p className="mh-sub">Historique complet de ton Jeep Avenger Electric.</p>
          </header>

          <div className="mh-list">
            {ITEMS.map((m) => (
              <div key={m.id} className="mh-row">
                <span className="mh-dot">{m.icon}</span>
                <div className="mh-body">
                  <span className="mh-title">{m.title}</span>
                  <span className="mh-meta">{m.date} · {m.where} · {m.cost}</span>
                  {m.next && <span className="mh-next">{m.next}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="mh-actions">
            <button type="button" className="mh-btn coral" onClick={() => showToast('Ajouter un entretien…')}>
              <Plus size={15} strokeWidth={2.8} />
              Ajouter
            </button>
            <button type="button" className="mh-btn purple" onClick={() => showToast('Carnet partagé 📤')}>
              <Share2 size={15} strokeWidth={2.5} />
              Partager
            </button>
          </div>
        </main>
        <div className={`mh-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
      </div>
    </>
  );
};

export default StellaMaintenanceHistory;
