/**
 * @krisspy-file
 * @type page
 * @name "StellaSettings"
 * @title "STELLA — Réglages"
 * @description "Réglages utilisateur : notifications, confort, confidentialité, données, compte. Tous les toggles fonctionnels."
 * @routes ["/settings"]
 * @flowName "App"
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, ChevronRight, ChevronDown, X } from 'lucide-react';

type Row = { id: string; label: string; emoji?: string; toastOn?: string; toastOff?: string };

const NOTIFS: Row[] = [
  { id: 'maint',     emoji: '🔧', label: 'Rappels entretien',     toastOn: '✅ Rappels entretien activés' },
  { id: 'trip',      emoji: '🛣️', label: 'Résumés trajets' },
  { id: 'eco',       emoji: '🌿', label: 'Astuces éco' },
  { id: 'speed',     emoji: '🚨', label: 'Alertes vitesse',       toastOn: '✅ Alertes vitesse activées' },
  { id: 'radar',     emoji: '📡', label: 'Alertes radar',         toastOn: '✅ Alertes radar activées' },
  { id: 'obstacles', emoji: '⚠️', label: 'Alertes obstacles',     toastOn: '✅ Alertes obstacles activées' },
];

const PRIVACY_TOGGLES: Row[] = [
  { id: 'night', emoji: '🌙', label: 'Mode nuit auto',       toastOn: '✅ L\'écran s\'adaptera automatiquement au coucher du soleil' },
  { id: 'loc',   emoji: '📍', label: 'Partage de position',  toastOn: '✅ Position partagée avec tes contacts de confiance' },
];

const PRIVACY_DETAILS: Row[] = [
  { id: 'p-contacts', label: 'Partage de position avec contacts de confiance' },
  { id: 'p-improve',  label: 'Données utilisées pour améliorer Stella' },
  { id: 'p-analytics', label: 'Cookies analytiques' },
];

const TOS_TEXT = `En utilisant Stella, vous acceptez nos conditions générales d'utilisation. Stellantis s'engage à protéger vos données personnelles conformément au RGPD européen. Vos données ne sont jamais vendues à des tiers. Les services proposés par Stella (assistance conversationnelle, itinéraires optimisés, analyse de devis, suivi d'entretien) sont fournis sans garantie d'exactitude absolue et doivent être utilisés comme outil d'aide à la décision, jamais comme substitut au jugement du conducteur ou aux conseils d'un professionnel qualifié. En cas d'urgence routière, contactez toujours les services d'urgence officiels. L'abonnement Premium est facturé mensuellement et peut être résilié à tout moment depuis votre espace Paiement.`;

const PRIVACY_TEXT = `Stella collecte uniquement les données nécessaires au fonctionnement de l'application : position GPS (avec votre consentement explicite), données véhicule (avec votre consentement), historique d'entretien, préférences de conduite, et adresses favorites. Ces données sont stockées de manière chiffrée et ne sont accessibles qu'à vous et aux équipes Stellantis dans le cadre strict de la fourniture du service. Vous pouvez à tout moment exporter ou supprimer l'intégralité de vos données depuis la section "Données & compte" de cet écran. Aucune donnée biométrique ou de santé n'est collectée par Stella.`;

const LICENSES = [
  { name: 'React', license: 'MIT License' },
  { name: 'Leaflet', license: 'BSD License' },
  { name: 'Lucide Icons', license: 'ISC License' },
  { name: 'OpenStreetMap', license: 'ODbL License' },
  { name: 'Nunito', license: 'SIL Open Font License' },
];

type Panel = null | 'privacy' | 'tos' | 'privacy-text' | 'licenses' | 'export' | 'delete';

const StellaSettings: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    maint: true, trip: true, eco: true, speed: true, radar: false, obstacles: true,
    night: true, loc: true,
    'p-contacts': true, 'p-improve': false, 'p-analytics': false,
  });
  const [panel, setPanel] = useState<Panel>(null);

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
    if (!wasOn && r.toastOn) showToast(r.toastOn);
    else if (wasOn && r.toastOff) showToast(r.toastOff);
    else if (!wasOn) showToast(`✅ ${r.label} activées`);
  };

  const confirmExport = () => {
    showToast('📤 Tes données arrivent par email sous 48h');
    setPanel(null);
  };

  const confirmDelete = () => {
    showToast('🗑️ Suppression en cours — tu seras déconnectée');
    setPanel(null);
    window.setTimeout(() => navigate('/'), 1200);
  };

  return (
    <>
      <style>{`
        .se-root * { box-sizing: border-box; }
        .se-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .se-app { width: 100%; max-width: 420px; min-height: 100vh; padding: 16px 20px 40px; display: flex; flex-direction: column; gap: 14px; }
        .se-back { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7); color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06); }
        .se-mark { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          color: #6B4E9B; padding: 5px 12px; background: rgba(107,78,155,0.1); border-radius: 50px; }
        .se-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .se-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        .se-sec-label { font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #8A7A7A; padding: 0 4px; margin-top: 4px; }

        .se-card {
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px; padding: 6px 10px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
          display: flex; flex-direction: column;
        }
        .se-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 6px;
          border-bottom: 1px solid rgba(26,26,46,0.05);
        }
        .se-row:last-child { border-bottom: none; }
        .se-row-ico {
          flex-shrink: 0; width: 32px; height: 32px; border-radius: 10px;
          background: #FDF6F0;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .se-row-label { flex: 1; font-size: 13.5px; font-weight: 800; color: #1A1A2E; }

        .se-switch {
          flex-shrink: 0; width: 44px; height: 24px; border-radius: 50px;
          background: #EADFD6; position: relative; cursor: pointer; border: none;
          transition: background 200ms ease;
        }
        .se-switch.on { background: #FF7A70; box-shadow: 0 4px 10px rgba(255,122,112,0.35); }
        .se-switch::after {
          content: ""; position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%; background: #FFF;
          box-shadow: 0 2px 4px rgba(26,26,46,0.2);
          transition: left 200ms cubic-bezier(0.22,1,0.36,1);
        }
        .se-switch.on::after { left: 23px; }

        .se-link-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 6px;
          cursor: pointer;
          border: none; background: transparent;
          font-family: inherit; text-align: left;
          border-bottom: 1px solid rgba(26,26,46,0.05);
          width: 100%;
        }
        .se-link-row:last-child { border-bottom: none; }
        .se-link-label { flex: 1; font-size: 13.5px; font-weight: 800; color: #1A1A2E; }
        .se-link-row.danger .se-link-label { color: #C2221B; }
        .se-chev { color: #B8ACAC; }

        .se-panel {
          background: #FFF; border: 1px solid rgba(107,78,155,0.25);
          border-radius: 16px; padding: 16px;
          box-shadow: 0 10px 22px rgba(107,78,155,0.1);
          display: flex; flex-direction: column; gap: 10px;
          animation: se-fadein 200ms ease;
        }
        @keyframes se-fadein {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .se-panel-head {
          display: flex; align-items: center; justify-content: space-between;
        }
        .se-panel-title { font-size: 14px; font-weight: 900; color: #1A1A2E; }
        .se-panel-close {
          border: none; background: rgba(26,26,46,0.06); color: #1A1A2E;
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .se-panel-body {
          font-size: 12.5px; font-weight: 600; color: #1A1A2E;
          line-height: 1.6;
          max-height: 260px; overflow-y: auto;
          padding-right: 6px;
        }
        .se-license-row {
          display: flex; justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(26,26,46,0.06);
          font-size: 13px;
        }
        .se-license-row:last-child { border-bottom: none; }
        .se-license-name { font-weight: 900; color: #1A1A2E; }
        .se-license-lic { font-weight: 600; color: #8A7A7A; }

        .se-confirm {
          display: flex; flex-direction: column; gap: 10px;
        }
        .se-confirm-text {
          font-size: 13px; font-weight: 700; color: #1A1A2E;
          line-height: 1.5;
        }
        .se-confirm-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .se-btn {
          border: none; cursor: pointer;
          font-family: inherit; font-size: 13px; font-weight: 900;
          padding: 11px 16px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .se-btn.coral { background: #FF7A70; color: #FFF; box-shadow: 0 8px 18px rgba(255,122,112,0.35); }
        .se-btn.red   { background: #E53935; color: #FFF; box-shadow: 0 8px 18px rgba(229,57,53,0.35); }
        .se-btn.ghost { background: #FDF6F0; color: #1A1A2E; border: 1px solid rgba(26,26,46,0.08); }

        .se-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 20px);
          background: #FF7A70; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 20px 50px rgba(255,122,112,0.4);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .se-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="se-root">
        <main className="se-app">
          <button type="button" className="se-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>
          <header>
            <span className="se-mark"><SettingsIcon size={12} strokeWidth={2.5} /> Réglages</span>
            <h1 className="se-h1">Réglages</h1>
            <p className="se-sub">Personnalise ton expérience et gère ton compte.</p>
          </header>

          <span className="se-sec-label">Notifications</span>
          <div className="se-card">
            {NOTIFS.map((r) => (
              <div key={r.id} className="se-row">
                <span className="se-row-ico">{r.emoji}</span>
                <span className="se-row-label">{r.label}</span>
                <button
                  type="button"
                  className={`se-switch ${toggles[r.id] ? 'on' : ''}`}
                  onClick={() => flip(r)}
                  aria-pressed={toggles[r.id]}
                  aria-label={r.label}
                />
              </div>
            ))}
          </div>

          <span className="se-sec-label">Confort & confidentialité</span>
          <div className="se-card">
            {PRIVACY_TOGGLES.map((r) => (
              <div key={r.id} className="se-row">
                <span className="se-row-ico">{r.emoji}</span>
                <span className="se-row-label">{r.label}</span>
                <button
                  type="button"
                  className={`se-switch ${toggles[r.id] ? 'on' : ''}`}
                  onClick={() => flip(r)}
                  aria-pressed={toggles[r.id]}
                  aria-label={r.label}
                />
              </div>
            ))}
            <button type="button" className="se-link-row" onClick={() => setPanel(panel === 'privacy' ? null : 'privacy')}>
              <span className="se-link-label">Confidentialité</span>
              {panel === 'privacy'
                ? <ChevronDown size={16} strokeWidth={2.5} className="se-chev" />
                : <ChevronRight size={16} strokeWidth={2.5} className="se-chev" />}
            </button>
          </div>

          {panel === 'privacy' && (
            <section className="se-panel">
              <div className="se-panel-head">
                <span className="se-panel-title">Confidentialité</span>
                <button type="button" className="se-panel-close" onClick={() => setPanel(null)}><X size={14} strokeWidth={2.8} /></button>
              </div>
              <div className="se-card" style={{ padding: 0, border: 'none', boxShadow: 'none' }}>
                {PRIVACY_DETAILS.map((r) => (
                  <div key={r.id} className="se-row" style={{ padding: '10px 2px' }}>
                    <span className="se-row-label">{r.label}</span>
                    <button
                      type="button"
                      className={`se-switch ${toggles[r.id] ? 'on' : ''}`}
                      onClick={() => flip(r)}
                      aria-pressed={toggles[r.id]}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <span className="se-sec-label">Données & compte</span>
          <div className="se-card">
            <button type="button" className="se-link-row" onClick={() => setPanel('export')}>
              <span className="se-link-label">Exporter mes données</span>
              <ChevronRight size={16} strokeWidth={2.5} className="se-chev" />
            </button>
            <button type="button" className="se-link-row danger" onClick={() => setPanel('delete')}>
              <span className="se-link-label">Supprimer mon compte</span>
              <ChevronRight size={16} strokeWidth={2.5} className="se-chev" />
            </button>
            <button type="button" className="se-link-row" onClick={() => setPanel(panel === 'tos' ? null : 'tos')}>
              <span className="se-link-label">Conditions d'utilisation</span>
              <ChevronRight size={16} strokeWidth={2.5} className="se-chev" />
            </button>
            <button type="button" className="se-link-row" onClick={() => setPanel(panel === 'privacy-text' ? null : 'privacy-text')}>
              <span className="se-link-label">Politique de confidentialité</span>
              <ChevronRight size={16} strokeWidth={2.5} className="se-chev" />
            </button>
            <button type="button" className="se-link-row" onClick={() => setPanel(panel === 'licenses' ? null : 'licenses')}>
              <span className="se-link-label">Licences</span>
              <ChevronRight size={16} strokeWidth={2.5} className="se-chev" />
            </button>
          </div>

          {panel === 'export' && (
            <section className="se-panel">
              <div className="se-panel-head">
                <span className="se-panel-title">📤 Exporter mes données</span>
                <button type="button" className="se-panel-close" onClick={() => setPanel(null)}><X size={14} strokeWidth={2.8} /></button>
              </div>
              <div className="se-confirm">
                <span className="se-confirm-text">Tes données seront envoyées à ton adresse email dans les 48h. Confirmer l'envoi ?</span>
                <div className="se-confirm-actions">
                  <button type="button" className="se-btn ghost" onClick={() => setPanel(null)}>Annuler</button>
                  <button type="button" className="se-btn coral" onClick={confirmExport}>Confirmer</button>
                </div>
              </div>
            </section>
          )}

          {panel === 'delete' && (
            <section className="se-panel" style={{ borderColor: 'rgba(229,57,53,0.4)', boxShadow: '0 10px 22px rgba(229,57,53,0.1)' }}>
              <div className="se-panel-head">
                <span className="se-panel-title" style={{ color: '#C2221B' }}>⚠️ Supprimer mon compte</span>
                <button type="button" className="se-panel-close" onClick={() => setPanel(null)}><X size={14} strokeWidth={2.8} /></button>
              </div>
              <div className="se-confirm">
                <span className="se-confirm-text">Cette action est irréversible. Toutes tes données (points, historique, favoris) seront effacées définitivement.</span>
                <div className="se-confirm-actions">
                  <button type="button" className="se-btn ghost" onClick={() => setPanel(null)}>Annuler</button>
                  <button type="button" className="se-btn red" onClick={confirmDelete}>Supprimer</button>
                </div>
              </div>
            </section>
          )}

          {panel === 'tos' && (
            <section className="se-panel">
              <div className="se-panel-head">
                <span className="se-panel-title">Conditions d'utilisation</span>
                <button type="button" className="se-panel-close" onClick={() => setPanel(null)}><X size={14} strokeWidth={2.8} /></button>
              </div>
              <div className="se-panel-body">{TOS_TEXT}</div>
            </section>
          )}

          {panel === 'privacy-text' && (
            <section className="se-panel">
              <div className="se-panel-head">
                <span className="se-panel-title">Politique de confidentialité</span>
                <button type="button" className="se-panel-close" onClick={() => setPanel(null)}><X size={14} strokeWidth={2.8} /></button>
              </div>
              <div className="se-panel-body">{PRIVACY_TEXT}</div>
            </section>
          )}

          {panel === 'licenses' && (
            <section className="se-panel">
              <div className="se-panel-head">
                <span className="se-panel-title">Licences</span>
                <button type="button" className="se-panel-close" onClick={() => setPanel(null)}><X size={14} strokeWidth={2.8} /></button>
              </div>
              <div>
                {LICENSES.map((l) => (
                  <div key={l.name} className="se-license-row">
                    <span className="se-license-name">{l.name}</span>
                    <span className="se-license-lic">{l.license}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
        <div className={`se-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaSettings;
