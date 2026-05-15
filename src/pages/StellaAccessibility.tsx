/**
 * @krisspy-file
 * @type page
 * @name "StellaAccessibility"
 * @title "STELLA — Accessibilité"
 * @description "Réglages accessibilité : priorité voix, texte large, daltonien, réduction anim, vibrations, lecture alertes, contraste. Avec aperçu live."
 * @routes ["/settings/accessibility"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Accessibility as AccIcon } from 'lucide-react';
import { useApplyModes, useModes } from '../lib/stellaModes';
import { speakStella } from '../lib/stellaVoice';

type Row = { id: 'voicePriority' | 'largeText' | 'colorblind' | 'reduceMotion' | 'haptics' | 'readAlerts' | 'highContrast'; emoji: string; label: string; sub: string; toastOn: string; toastOff?: string };

const ROWS: Row[] = [
  { id: 'voicePriority', emoji: '🎙️', label: 'Mode priorité voix', sub: 'Stella lit les libellés à chaque navigation',
    toastOn: '✅ Priorité voix activée', toastOff: '🔕 Priorité voix désactivée' },
  { id: 'largeText', emoji: '🔠', label: 'Texte très grand', sub: 'Polices +30% dans toute l\'app',
    toastOn: '✅ Texte agrandi', toastOff: 'Texte normal rétabli' },
  { id: 'colorblind', emoji: '🎨', label: 'Mode daltonien', sub: 'Palette bleu/magenta au lieu de rouge/vert',
    toastOn: '✅ Palette daltonien activée', toastOff: 'Palette standard rétablie' },
  { id: 'reduceMotion', emoji: '🎞️', label: 'Réduire les animations', sub: 'Désactive les transitions CSS',
    toastOn: '✅ Animations réduites', toastOff: 'Animations rétablies' },
  { id: 'haptics', emoji: '📳', label: 'Retours haptiques', sub: 'Vibrations pour les alertes importantes',
    toastOn: '✅ Vibrations activées — tu ressentiras les alertes importantes', toastOff: '🔕 Vibrations désactivées' },
  { id: 'readAlerts', emoji: '📢', label: 'Lire les alertes à voix haute', sub: 'Stella lit chaque alerte quand elle apparaît',
    toastOn: '✅ Stella lira les alertes à voix haute', toastOff: '🔕 Lecture des alertes désactivée' },
  { id: 'highContrast', emoji: '🌓', label: 'Contraste élevé', sub: 'Fond blanc pur, texte noir, bordures épaisses',
    toastOn: '✅ Contraste élevé activé', toastOff: 'Contraste standard rétabli' },
];

const StellaAccessibility: React.FC = () => {
  const navigate = useNavigate();
  useApplyModes();
  const { modes, toggle } = useModes();
  const nickname = useMemo(() => {
    try { return (window.sessionStorage.getItem('stella:nickname') || '').trim() || 'toi'; } catch { return 'toi'; }
  }, []);
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
    const wasOn = Boolean(modes[r.id]);
    toggle(r.id);
    showToast(!wasOn ? r.toastOn : (r.toastOff || r.toastOn));
    // Voice priority: read the label aloud
    if (!wasOn && r.id === 'voicePriority') {
      void speakStella('Priorité voix activée. Stella lit les libellés pour toi.', modes.lang);
    }
    if (!wasOn && r.id === 'haptics' && 'vibrate' in navigator) {
      try { navigator.vibrate?.(80); } catch { /* noop */ }
    }
  };

  // Preview style reacts to current toggles
  const previewClasses = [
    'ac-preview',
    modes.largeText && 'large',
    modes.highContrast && 'hc',
    modes.colorblind && 'cb',
    modes.reduceMotion && 'reduced',
  ].filter(Boolean).join(' ');

  return (
    <>
      <style>{`
        .ac-root * { box-sizing: border-box; }
        .ac-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .ac-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 16px 20px 40px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .ac-back {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
        }
        .ac-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #6B4E9B; padding: 5px 12px;
          background: rgba(107,78,155,0.1); border-radius: 50px;
        }
        .ac-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .ac-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        /* Live preview */
        .ac-preview-wrap {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 10px 24px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 10px;
        }
        .ac-preview-label {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.8px;
          text-transform: uppercase; color: #FF7A70;
        }
        .ac-preview {
          background: #FDF6F0;
          border-radius: 14px;
          padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          border: 1px solid rgba(26,26,46,0.06);
          transition: all 200ms ease;
        }
        .ac-preview.large { font-size: 1.3em; }
        .ac-preview.hc { background: #FFF; border: 3px solid #000; color: #000; }
        .ac-preview.hc .ac-preview-title { color: #000; }
        .ac-preview.cb .ac-preview-btn { background: #3058FF; }
        .ac-preview.cb .ac-preview-badge { background: #3058FF; color: #FFF; }
        .ac-preview.reduced * { transition: none !important; animation: none !important; }
        .ac-preview-title { font-size: 15px; font-weight: 900; color: #1A1A2E; }
        .ac-preview-text { font-size: 13px; font-weight: 600; color: #8A7A7A; line-height: 1.5; }
        .ac-preview-btn {
          align-self: flex-start;
          border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          padding: 10px 18px; border-radius: 50px;
          font-family: inherit; font-weight: 900; font-size: 13px;
        }
        .ac-preview-badge {
          align-self: flex-start;
          padding: 4px 10px; border-radius: 50px;
          background: #DFF5F1; color: #0F6B57;
          font-size: 11px; font-weight: 800;
        }
        .ac-preview-explain {
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          line-height: 1.4;
        }

        /* Rows */
        .ac-row {
          display: flex; align-items: center; gap: 12px;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
        }
        .ac-ico {
          flex-shrink: 0;
          width: 40px; height: 40px; border-radius: 12px;
          background: #EEE7F7;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .ac-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .ac-label { font-size: 13.5px; font-weight: 900; color: #1A1A2E; }
        .ac-sub2 { font-size: 11.5px; font-weight: 600; color: #8A7A7A; line-height: 1.4; }
        .ac-switch {
          flex-shrink: 0;
          width: 44px; height: 24px; border-radius: 50px;
          background: #EADFD6;
          position: relative; cursor: pointer; border: none;
          transition: background 200ms ease;
        }
        .ac-switch.on { background: #FF7A70; box-shadow: 0 4px 10px rgba(255,122,112,0.35); }
        .ac-switch::after {
          content: ""; position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #FFF;
          box-shadow: 0 2px 4px rgba(26,26,46,0.2);
          transition: left 200ms cubic-bezier(0.22,1,0.36,1);
        }
        .ac-switch.on::after { left: 23px; }

        .ac-toast {
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
        .ac-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="ac-root">
        <main className="ac-app">
          <button type="button" className="ac-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>
          <header>
            <span className="ac-mark"><AccIcon size={12} strokeWidth={2.5} /> Accessibilité</span>
            <h1 className="ac-h1">Accessibilité</h1>
            <p className="ac-sub">Adapte Stella à tes besoins visuels et auditifs.</p>
          </header>

          <section className="ac-preview-wrap">
            <span className="ac-preview-label">Aperçu — Voilà à quoi Stella va ressembler pour toi</span>
            <div className={previewClasses}>
              <span className="ac-preview-title">Bienvenue, {nickname}</span>
              <span className="ac-preview-text">Un texte typique dans l'app. Ajuste les réglages ci-dessous pour le voir changer en direct.</span>
              <span className="ac-preview-badge">🌿 Éco activé</span>
              <button type="button" className="ac-preview-btn">Lancer la navigation</button>
            </div>
            <span className="ac-preview-explain">
              Les changements s'appliquent immédiatement à tout l'écran Accessibilité, Profil et Réglages.
            </span>
          </section>

          {ROWS.map((r) => (
            <div key={r.id} className="ac-row">
              <span className="ac-ico">{r.emoji}</span>
              <div className="ac-text">
                <span className="ac-label">{r.label}</span>
                <span className="ac-sub2">{r.sub}</span>
              </div>
              <button
                type="button"
                className={`ac-switch ${modes[r.id] ? 'on' : ''}`}
                onClick={() => flip(r)}
                aria-pressed={!!modes[r.id]}
                aria-label={r.label}
              />
            </div>
          ))}
        </main>
        <div className={`ac-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaAccessibility;
