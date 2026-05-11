/**
 * @krisspy-file
 * @type page
 * @name "StellaModes"
 * @title "STELLA — Modes"
 * @description "Modes Stella : langue, mode sombre, daltonien, accessibilité, éco, nouvelle conductrice, voix, profil conductrice."
 * @routes ["/settings/modes"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check, X } from 'lucide-react';
import { useApplyModes, useModes, DriverProfile } from '../lib/stellaModes';

type ModeRow = { id: keyof ReturnType<typeof useModes>['modes']; emoji: string; label: string; sub: string; toastOn?: string; toastOff?: string };

const MODES_LIST: ModeRow[] = [
  { id: 'dark',          emoji: '🌙', label: 'Mode sombre',           sub: 'Plus doux pour les yeux la nuit' },
  { id: 'colorblind',    emoji: '🎨', label: 'Mode daltonien',        sub: 'Couleurs adaptées aux daltoniens' },
  { id: 'accessibility', emoji: '♿', label: 'Mode accessibilité',    sub: 'Polices plus grandes, contraste élevé' },
  { id: 'eco',           emoji: '🌿', label: 'Mode éco',              sub: 'Itinéraires et conseils écologiques' },
  { id: 'newDriver',     emoji: '🔑', label: 'Mode nouvelle conductrice', sub: 'Parcours simples, échangeurs évités' },
  { id: 'voiceNotifs',   emoji: '🔔', label: 'Notifications Stella',  sub: 'Stella te prévient à voix haute',
    toastOn: '✅ Notifications vocales activées', toastOff: '🔕 Notifications vocales désactivées' },
  { id: 'voice',         emoji: '🎙️', label: 'Voix (micro + synthèse)', sub: 'Stella t\'écoute et te répond',
    toastOn: '✅ Stella peut maintenant t\'écouter et te répondre à voix haute',
    toastOff: '🔕 Voix désactivée' },
];

const PROFILE_CHOICES: { id: DriverProfile; emoji: string; label: string; sub: string }[] = [
  { id: 'new',          emoji: '🔑', label: 'Nouvelle conductrice',   sub: 'Stella explique tout, zéro jargon' },
  { id: 'standard',     emoji: '⭐', label: 'Standard',                sub: 'Expérience équilibrée' },
  { id: 'experienced',  emoji: '🏎️', label: 'Expérimentée',           sub: 'Infos directes et détaillées' },
];

const StellaModes: React.FC = () => {
  const navigate = useNavigate();
  useApplyModes();
  const { modes, set, toggle } = useModes();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, []);

  const flip = (row: ModeRow) => {
    const currentlyOn = Boolean(modes[row.id]);
    toggle(row.id);
    if (row.toastOn && !currentlyOn) showToast(row.toastOn);
    else if (row.toastOff && currentlyOn) showToast(row.toastOff);
    else if (!currentlyOn && row.id === 'eco') showToast('🌿 Mode Éco activé');
    else if (!currentlyOn && row.id === 'newDriver') showToast('🔑 Mode Nouvelle Conductrice activé');
    else if (!currentlyOn && row.id === 'dark') showToast('🌙 Mode sombre activé');
    else if (!currentlyOn && row.id === 'colorblind') showToast('🎨 Mode daltonien activé');
    else if (!currentlyOn && row.id === 'accessibility') showToast('♿ Mode accessibilité activé');
  };

  const pickProfile = (p: DriverProfile) => {
    set('profile', p);
    setProfileOpen(false);
    showToast('✅ Profil mis à jour !');
  };

  const currentProfile = PROFILE_CHOICES.find((p) => p.id === modes.profile)!;

  return (
    <>
      <style>{`
        .mo-root * { box-sizing: border-box; }
        .mo-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .mo-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 16px 20px 40px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .mo-back {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
        }
        .mo-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .mo-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .mo-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        .mo-row {
          display: flex; align-items: center; gap: 12px;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
          font-family: inherit; text-align: left;
        }
        .mo-row.tap { cursor: pointer; transition: border-color 150ms ease, transform 150ms ease; }
        .mo-row.tap:hover { border-color: rgba(255,122,112,0.3); transform: translateY(-1px); }
        .mo-ico {
          flex-shrink: 0;
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, #FFE6E3 0%, #EEE7F7 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .mo-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .mo-label { font-size: 13.5px; font-weight: 900; color: #1A1A2E; }
        .mo-sub2 { font-size: 11.5px; font-weight: 600; color: #8A7A7A; line-height: 1.4; }

        .mo-switch {
          flex-shrink: 0;
          width: 44px; height: 24px; border-radius: 50px;
          background: #EADFD6;
          position: relative; cursor: pointer; border: none;
          transition: background 200ms ease;
        }
        .mo-switch.on { background: #FF7A70; box-shadow: 0 4px 10px rgba(255,122,112,0.35); }
        .mo-switch::after {
          content: ""; position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #FFF;
          box-shadow: 0 2px 4px rgba(26,26,46,0.2);
          transition: left 200ms cubic-bezier(0.22,1,0.36,1);
        }
        .mo-switch.on::after { left: 23px; }

        .mo-lang-pill {
          display: flex; gap: 4px; padding: 3px;
          background: #FDF6F0; border-radius: 50px;
        }
        .mo-lang-pill button {
          border: none; background: transparent;
          font-family: inherit; font-size: 12px; font-weight: 800;
          color: #8A7A7A; padding: 6px 12px; border-radius: 50px; cursor: pointer;
        }
        .mo-lang-pill button.active { background: #FF7A70; color: #FFF; }

        .mo-chev-tag {
          flex-shrink: 0;
          font-size: 12.5px; font-weight: 800;
          padding: 6px 12px; border-radius: 50px;
          background: #FDF6F0; color: #1A1A2E;
        }

        /* Modal */
        .mo-overlay {
          position: fixed; inset: 0;
          background: rgba(26,26,46,0.55);
          backdrop-filter: blur(5px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 200;
          opacity: 0; pointer-events: none;
          transition: opacity 200ms ease;
        }
        .mo-overlay.open { opacity: 1; pointer-events: auto; }
        .mo-dialog {
          width: 100%; max-width: 420px;
          background: #FFF;
          border-radius: 24px 24px 0 0;
          padding: 10px 20px 24px;
          transform: translateY(100%);
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1);
          display: flex; flex-direction: column; gap: 10px;
        }
        .mo-overlay.open .mo-dialog { transform: translateY(0); }
        .mo-grip { width: 40px; height: 4px; border-radius: 2px; background: #B8ACAC; margin: 0 auto 10px; }
        .mo-dialog-title {
          font-size: 17px; font-weight: 900; color: #1A1A2E; margin-bottom: 6px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .mo-close-btn {
          border: none; background: rgba(26,26,46,0.06); color: #1A1A2E;
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .mo-choice {
          display: flex; align-items: center; gap: 12px;
          padding: 14px;
          border: 2px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          background: #FFF;
          cursor: pointer;
          font-family: inherit; text-align: left;
          transition: border-color 150ms ease, background 150ms ease;
        }
        .mo-choice:hover { border-color: #FF7A70; background: #FFF5F2; }
        .mo-choice.active { border-color: #FF7A70; background: #FFF5F2; }
        .mo-choice-check {
          width: 22px; height: 22px; border-radius: 50%;
          background: #FF7A70; color: #FFF;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .mo-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translate(-50%, 20px);
          background: #FF7A70; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 20px 50px rgba(255,122,112,0.4);
          z-index: 220; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .mo-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="mo-root">
        <main className="mo-app">
          <button type="button" className="mo-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>
          <header>
            <span className="mo-mark"><Sparkles size={12} strokeWidth={2.5} /> Modes Stella</span>
            <h1 className="mo-h1">Modes Stella</h1>
            <p className="mo-sub">Chaque toggle s'applique instantanément dans l'app.</p>
          </header>

          <div className="mo-row">
            <span className="mo-ico">🌐</span>
            <div className="mo-text">
              <span className="mo-label">Langue</span>
              <span className="mo-sub2">Interface et messages vocaux</span>
            </div>
            <div className="mo-lang-pill">
              <button type="button" className={modes.lang === 'fr' ? 'active' : ''} onClick={() => { set('lang', 'fr'); showToast('✅ Langue : Français'); }}>FR</button>
              <button type="button" className={modes.lang === 'en' ? 'active' : ''} onClick={() => { set('lang', 'en'); showToast('✅ Language: English'); }}>EN</button>
            </div>
          </div>

          {MODES_LIST.map((row) => (
            <div key={row.id} className="mo-row">
              <span className="mo-ico">{row.emoji}</span>
              <div className="mo-text">
                <span className="mo-label">{row.label}</span>
                <span className="mo-sub2">{row.sub}</span>
              </div>
              <button
                type="button"
                className={`mo-switch ${modes[row.id] ? 'on' : ''}`}
                onClick={() => flip(row)}
                aria-pressed={!!modes[row.id]}
                aria-label={row.label}
              />
            </div>
          ))}

          <button type="button" className="mo-row tap" onClick={() => setProfileOpen(true)}>
            <span className="mo-ico">{currentProfile.emoji}</span>
            <div className="mo-text">
              <span className="mo-label">Changer de profil conductrice</span>
              <span className="mo-sub2">Profil actuel : {currentProfile.label}</span>
            </div>
            <span className="mo-chev-tag">Modifier</span>
          </button>
        </main>

        <div className={`mo-overlay ${profileOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setProfileOpen(false); }}>
          <div className="mo-dialog" role="dialog" aria-modal="true">
            <div className="mo-grip" />
            <div className="mo-dialog-title">
              <span>Choisis ton profil</span>
              <button type="button" className="mo-close-btn" onClick={() => setProfileOpen(false)} aria-label="Fermer">
                <X size={14} strokeWidth={2.8} />
              </button>
            </div>
            {PROFILE_CHOICES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`mo-choice ${modes.profile === p.id ? 'active' : ''}`}
                onClick={() => pickProfile(p.id)}
              >
                <span className="mo-ico" style={{ fontSize: 24 }}>{p.emoji}</span>
                <div className="mo-text">
                  <span className="mo-label">{p.label}</span>
                  <span className="mo-sub2">{p.sub}</span>
                </div>
                {modes.profile === p.id && (
                  <span className="mo-choice-check"><Check size={12} strokeWidth={3.5} /></span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className={`mo-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaModes;
