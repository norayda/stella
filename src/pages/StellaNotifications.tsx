/**
 * @krisspy-file
 * @type page
 * @name "StellaNotifications"
 * @title "STELLA — Notifications"
 * @description "Préférences de notifications : rappels entretien, résumés trajets, astuces éco, alertes vitesse/radar/obstacles, DND."
 * @routes ["/notifications"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Clock } from 'lucide-react';

type Row = { id: string; emoji: string; label: string; sub: string; confirm?: string };

const ROWS: Row[] = [
  { id: 'maint',  emoji: '🔔', label: 'Rappels d\'entretien',  sub: 'Vidanges, pneus, contrôles — sans harceler', confirm: '✅ Tu recevras un rappel 2 semaines avant chaque échéance' },
  { id: 'trips',  emoji: '📋', label: 'Résumés de trajets',    sub: 'Un résumé rapide après chaque trajet' },
  { id: 'eco',    emoji: '🌿', label: 'Astuces éco',           sub: 'Petites idées pour rouler plus vert' },
  { id: 'speed',  emoji: '🚨', label: 'Alertes vitesse',       sub: 'Un petit signal quand tu dépasses la limite' },
  { id: 'radar',  emoji: '📡', label: 'Alertes radar',         sub: 'Prévenues avant les radars fixes sur ton trajet' },
  { id: 'obst',   emoji: '⚠️', label: 'Alertes obstacles',     sub: 'Travaux, accidents, obstacles signalés' },
];

const StellaNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    maint: true, trips: true, eco: true, speed: true, radar: false, obst: true,
  });
  const [dndOpen, setDndOpen] = useState(false);
  const [dndStart, setDndStart] = useState('22:00');
  const [dndEnd, setDndEnd] = useState('07:00');
  const [dndOn, setDndOn] = useState(true);
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

  const flip = (r: Row) => {
    const wasOn = toggles[r.id];
    setToggles((v) => ({ ...v, [r.id]: !wasOn }));
    if (!wasOn) showToast(r.confirm || `✅ ${r.label} activées`);
    else showToast(`🔕 ${r.label} désactivées`);
  };

  return (
    <>
      <style>{`
        .no-root * { box-sizing: border-box; }
        .no-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .no-app { width: 100%; max-width: 420px; min-height: 100vh; padding: 16px 20px 40px; display: flex; flex-direction: column; gap: 14px; }
        .no-back {
          display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7); color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
        }
        .no-mark {
          display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .no-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .no-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }
        .no-row {
          display: flex; align-items: center; gap: 12px;
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px; padding: 14px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
        }
        .no-ico {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #FFE6E3 0%, #EEE7F7 100%);
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .no-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .no-label { font-size: 13.5px; font-weight: 900; color: #1A1A2E; }
        .no-sub2 { font-size: 11.5px; font-weight: 600; color: #8A7A7A; line-height: 1.4; }
        .no-switch {
          flex-shrink: 0; width: 44px; height: 24px; border-radius: 50px;
          background: #EADFD6; position: relative; cursor: pointer; border: none;
          transition: background 200ms ease;
        }
        .no-switch.on { background: #FF7A70; box-shadow: 0 4px 10px rgba(255,122,112,0.35); }
        .no-switch::after {
          content: ""; position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%; background: #FFF;
          box-shadow: 0 2px 4px rgba(26,26,46,0.2);
          transition: left 200ms cubic-bezier(0.22,1,0.36,1);
        }
        .no-switch.on::after { left: 23px; }
        .no-chev-row {
          display: flex; align-items: center; gap: 12px;
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px; padding: 14px; cursor: pointer;
          font-family: inherit; text-align: left;
        }
        .no-chev-row:hover { border-color: rgba(255,122,112,0.3); }
        .no-tag { font-size: 12.5px; font-weight: 800; color: #6B4E9B; }

        .no-dnd-card {
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 8px 18px rgba(26,26,46,0.05);
        }
        .no-dnd-title { font-size: 14px; font-weight: 900; color: #1A1A2E; }
        .no-dnd-row { display: flex; align-items: center; gap: 10px; }
        .no-dnd-label { flex: 1; font-size: 12.5px; font-weight: 700; color: #8A7A7A; }
        .no-time {
          border: 1px solid rgba(26,26,46,0.08);
          background: #FDF6F0; border-radius: 10px;
          padding: 8px 12px;
          font-family: inherit; font-size: 13px; font-weight: 800; color: #1A1A2E;
          outline: none;
        }
        .no-time:focus { border-color: #FF7A70; background: #FFF; }

        .no-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translate(-50%, 20px);
          background: #FF7A70; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 20px 50px rgba(255,122,112,0.4);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .no-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="no-root">
        <main className="no-app">
          <button type="button" className="no-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>
          <header>
            <span className="no-mark"><Bell size={12} strokeWidth={2.5} /> Notifications</span>
            <h1 className="no-h1">Notifications</h1>
            <p className="no-sub">Choisis ce que Stella peut t'envoyer.</p>
          </header>

          {ROWS.map((r) => (
            <div key={r.id} className="no-row">
              <span className="no-ico">{r.emoji}</span>
              <div className="no-text">
                <span className="no-label">{r.label}</span>
                <span className="no-sub2">{r.sub}</span>
              </div>
              <button
                type="button"
                className={`no-switch ${toggles[r.id] ? 'on' : ''}`}
                onClick={() => flip(r)}
                aria-pressed={toggles[r.id]}
                aria-label={r.label}
              />
            </div>
          ))}

          <button type="button" className="no-chev-row" onClick={() => setDndOpen((v) => !v)}>
            <span className="no-ico" style={{ background: '#EEE7F7' }}>⚙️</span>
            <div className="no-text">
              <span className="no-label">Préférences de notifications</span>
              <span className="no-sub2">Plage « Ne pas déranger »</span>
            </div>
            <span className="no-tag">{dndOpen ? 'Masquer' : 'Modifier'}</span>
          </button>

          {dndOpen && (
            <section className="no-dnd-card">
              <span className="no-dnd-title"><Clock size={14} strokeWidth={2.5} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Ne pas déranger</span>
              <div className="no-dnd-row">
                <span className="no-dnd-label">Activer</span>
                <button
                  type="button"
                  className={`no-switch ${dndOn ? 'on' : ''}`}
                  onClick={() => { setDndOn((v) => !v); showToast(dndOn ? '🔕 DND désactivé' : `✅ DND activé de ${dndStart} à ${dndEnd}`); }}
                  aria-pressed={dndOn}
                />
              </div>
              <div className="no-dnd-row">
                <span className="no-dnd-label">Entre</span>
                <input type="time" className="no-time" value={dndStart} onChange={(e) => setDndStart(e.target.value)} />
                <span className="no-dnd-label" style={{ flex: 'none' }}>et</span>
                <input type="time" className="no-time" value={dndEnd} onChange={(e) => setDndEnd(e.target.value)} />
              </div>
            </section>
          )}
        </main>
        <div className={`no-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaNotifications;
