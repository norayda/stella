/**
 * @krisspy-file
 * @type page
 * @name "StellaReady"
 * @title "STELLA — Bon retour"
 * @description "Écran de transition post-onboarding : hero véhicule avec animation de scan, chargement du profil IA, récapitulatif personnalisé et CTA d'entrée dans l'app."
 * @routes ["/ready", "/welcome-back"]
 * @flowName "Onboarding"
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Car,
  Zap,
  Gauge,
  Activity,
  ShieldCheck,
  Wallet,
  Sofa,
  Accessibility,
  MapPinned,
  Coffee,
  Map,
  Radio,
  ArrowRight,
  Check,
  CircleCheck,
} from 'lucide-react';

type Lang = 'fr' | 'en';

const I18N = {
  fr: {
    mark: 'Prête à rouler',
    hello: (name: string) => `Bon retour, ${name}`,
    wave: '👋',
    sub: (brand: string, model: string) => `Ta ${brand} ${model} est prête avec STELLA.`,
    caption: 'Ton véhicule connecté',
    scan_label: 'Scan du véhicule',
    loading_ai: 'Personnalisation de STELLA…',
    loaded: 'Profil chargé',
    synced: 'Actif · Synchronisé',
    sec_vehicle: 'Ton véhicule',
    sec_profile: 'Ton profil de conduite',
    sec_reco: 'Recommandations pour toi',
    driver_intermediate: 'Conductrice intermédiaire',
    focus_title: 'Priorités',
    focus: [
      { id: 'safety', label: 'Sécurité' },
      { id: 'savings', label: 'Économies' },
      { id: 'comfort', label: 'Confort' },
    ],
    accessibility_on: 'Assistance STELLA activée',
    reco: [
      { id: 'route', label: 'Recommandations d\'itinéraire' },
      { id: 'rest', label: 'Suggestions de pauses ☕' },
      { id: 'nav', label: 'Navigation simplifiée' },
      { id: 'insight', label: 'Insights de conduite en temps réel' },
    ],
    cta: 'Entrer dans STELLA',
    cta_sub: 'Démarrer ton expérience personnalisée',
  },
  en: {
    mark: 'Ready to roll',
    hello: (name: string) => `Welcome back, ${name}`,
    wave: '👋',
    sub: (brand: string, model: string) => `Your ${brand} ${model} is ready with STELLA.`,
    caption: 'Your connected vehicle',
    scan_label: 'Vehicle scan',
    loading_ai: 'Personalizing STELLA…',
    loaded: 'Profile loaded',
    synced: 'Active · Synced',
    sec_vehicle: 'Your vehicle',
    sec_profile: 'Your driving profile',
    sec_reco: 'Recommendations for you',
    driver_intermediate: 'Intermediate driver',
    focus_title: 'Focus areas',
    focus: [
      { id: 'safety', label: 'Safety' },
      { id: 'savings', label: 'Savings' },
      { id: 'comfort', label: 'Comfort' },
    ],
    accessibility_on: 'STELLA assistance enabled',
    reco: [
      { id: 'route', label: 'Route recommendations' },
      { id: 'rest', label: 'Rest stop suggestions ☕' },
      { id: 'nav', label: 'Simplified navigation' },
      { id: 'insight', label: 'Real-time driving insights' },
    ],
    cta: 'Enter STELLA',
    cta_sub: 'Start your personalized driving experience',
  },
} as const;

const FOCUS_ICONS: Record<string, React.ReactNode> = {
  safety: <ShieldCheck size={14} strokeWidth={2.5} />,
  savings: <Wallet size={14} strokeWidth={2.5} />,
  comfort: <Sofa size={14} strokeWidth={2.5} />,
};

const RECO_ICONS: Record<string, React.ReactNode> = {
  route: <MapPinned size={16} strokeWidth={2.5} />,
  rest: <Coffee size={16} strokeWidth={2.5} />,
  nav: <Map size={16} strokeWidth={2.5} />,
  insight: <Radio size={16} strokeWidth={2.5} />,
};

const StellaReady: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');
  const [progress, setProgress] = useState(0);
  const [scanDone, setScanDone] = useState(false);

  const nickname = 'Marie';

  const vehicleYear = useMemo(() => {
    try {
      const stored = (window.sessionStorage.getItem('stella:vehicle_year') || '').trim();
      if (stored) {
        if (stored === '2021-') return lang === 'fr' ? '2021 ou avant' : '2021 or earlier';
        return stored;
      }
    } catch { /* noop */ }
    return '2024';
  }, [lang]);

  const t = I18N[lang];
  const vehicleBrand = 'Jeep';
  const vehicleModel = 'Avenger';

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1800;
    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);
      if (elapsed < duration) raf = requestAnimationFrame(tick);
      else setScanDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <style>{`
        .sr-root * { box-sizing: border-box; }
        .sr-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .sr-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .sr-blobs::before, .sr-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
        }
        .sr-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .sr-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .sr-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 24px 140px;
          display: flex; flex-direction: column; gap: 20px;
          position: relative; z-index: 1;
        }
        .sr-top { display: flex; align-items: center; justify-content: flex-end; }
        .sr-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .sr-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
        }
        .sr-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 3px 10px rgba(255,122,112,0.3);
        }

        .sr-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .sr-h1 {
          font-size: 26px; font-weight: 800; line-height: 1.2;
          letter-spacing: -0.4px; color: #1A1A2E;
          margin: 6px 0 6px;
        }
        .sr-h1 span.sr-name {
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .sr-sub {
          font-size: 14.5px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }
        .sr-sub b { color: #1A1A2E; font-weight: 700; }

        /* Hero card */
        .sr-hero {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 16 / 10;
          box-shadow: 0 18px 40px rgba(255,122,112,0.22), 0 0 0 1px rgba(255,255,255,0.3) inset;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 45%),
            radial-gradient(ellipse at 75% 85%, rgba(255,122,112,0.35) 0%, transparent 55%),
            linear-gradient(135deg, #2D2447 0%, #4A3B75 40%, #7A5BA8 100%);
        }
        .sr-hero::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 55%, rgba(26,26,46,0.55) 100%);
          pointer-events: none;
          z-index: 2;
        }
        .sr-hero-photo {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          z-index: 0;
        }
        .sr-hero-car {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .sr-car-svg {
          width: 78%;
          filter: drop-shadow(0 22px 30px rgba(0,0,0,0.35));
          opacity: 1;
          animation: sr-float 5s ease-in-out infinite;
        }
        @keyframes sr-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .sr-glow {
          position: absolute; width: 80%; height: 22%;
          left: 10%; bottom: -4%;
          background: radial-gradient(ellipse, rgba(255,122,112,0.6) 0%, transparent 70%);
          filter: blur(18px);
          pointer-events: none;
          mix-blend-mode: screen;
          z-index: 1;
        }

        /* Scan overlay */
        .sr-scan {
          position: absolute; inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 2;
        }
        .sr-scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, #FF7A70 50%, transparent 100%);
          box-shadow: 0 0 18px rgba(255,122,112,0.9);
          animation: sr-scan-move 1.8s cubic-bezier(0.45, 0, 0.55, 1) 1;
          opacity: 0;
        }
        .sr-scan.done .sr-scan-line { display: none; }
        @keyframes sr-scan-move {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .sr-scan-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.6;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
        .sr-scan-corner {
          position: absolute; width: 22px; height: 22px;
          border-color: #FF7A70;
          border-style: solid;
          border-width: 0;
        }
        .sr-scan-corner.tl { top: 12px; left: 12px; border-top-width: 2px; border-left-width: 2px; border-top-left-radius: 6px; }
        .sr-scan-corner.tr { top: 12px; right: 12px; border-top-width: 2px; border-right-width: 2px; border-top-right-radius: 6px; }
        .sr-scan-corner.bl { bottom: 12px; left: 12px; border-bottom-width: 2px; border-left-width: 2px; border-bottom-left-radius: 6px; }
        .sr-scan-corner.br { bottom: 12px; right: 12px; border-bottom-width: 2px; border-right-width: 2px; border-bottom-right-radius: 6px; }

        .sr-scan-label {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 50px;
          font-size: 10.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          color: #FF7A70; background: rgba(26,26,46,0.6);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,122,112,0.4);
          transition: opacity 300ms ease, transform 300ms ease;
        }
        .sr-scan.done .sr-scan-label {
          color: #FFF; border-color: rgba(255,255,255,0.2);
        }
        .sr-pulse-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #FF7A70;
          box-shadow: 0 0 10px rgba(255,122,112,0.8);
          animation: sr-pulse 1s ease-in-out infinite;
        }
        .sr-scan.done .sr-pulse-dot {
          background: #2BB8A6; box-shadow: 0 0 10px rgba(43,184,166,0.7);
          animation: none;
        }
        @keyframes sr-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .sr-hero-caption {
          position: absolute; bottom: 14px; left: 16px; right: 16px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
          color: #FFF;
          z-index: 3;
        }
        .sr-caption-text {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700;
          padding: 5px 10px; border-radius: 50px;
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .sr-status-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 50px;
          background: rgba(43,184,166,0.2);
          color: #B6F0E6;
          border: 1px solid rgba(43,184,166,0.45);
        }
        .sr-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2BB8A6;
          box-shadow: 0 0 8px rgba(43,184,166,0.9);
          animation: sr-pulse 1.4s ease-in-out infinite;
        }

        /* AI loader card */
        .sr-loader {
          background: #FFF;
          border-radius: 16px;
          padding: 16px 18px;
          box-shadow: 0 10px 30px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 10px;
        }
        .sr-loader-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
        }
        .sr-loader-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; color: #1A1A2E;
        }
        .sr-loader-ico {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
        }
        .sr-loader-pct {
          font-size: 13px; font-weight: 800; color: #FF7A70;
          letter-spacing: -0.2px;
        }
        .sr-loader-done { color: #2BB8A6; }
        .sr-loader-bar {
          height: 6px;
          background: rgba(107,78,155,0.1);
          border-radius: 4px; overflow: hidden;
        }
        .sr-loader-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          border-radius: 4px;
          transition: width 80ms linear;
        }
        .sr-loader.done .sr-loader-fill {
          background: linear-gradient(90deg, #2BB8A6 0%, #6B4E9B 100%);
        }

        /* Sections */
        .sr-section {
          background: #FFF;
          border-radius: 18px;
          padding: 16px 18px;
          box-shadow: 0 10px 30px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 12px;
        }
        .sr-sec-head {
          display: flex; align-items: center; gap: 8px;
        }
        .sr-sec-ico {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .sr-sec-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .sr-sec-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .sr-sec-ico.teal { background: #DFF5F1; color: #2BB8A6; }
        .sr-sec-title {
          font-size: 13px; font-weight: 800; color: #1A1A2E;
          letter-spacing: 0.1px;
        }

        /* Vehicle summary */
        .sr-vehicle {
          display: flex; flex-direction: column; gap: 6px;
        }
        .sr-vehicle-name {
          font-size: 17px; font-weight: 800; color: #1A1A2E;
          letter-spacing: -0.2px;
        }
        .sr-vehicle-name .sr-tag {
          display: inline-flex; align-items: center; gap: 4px;
          margin-left: 8px;
          font-size: 10.5px; font-weight: 700;
          padding: 3px 8px; border-radius: 50px;
          background: #DFF5F1; color: #17856C;
          letter-spacing: 0.3px; text-transform: uppercase;
          vertical-align: middle;
        }
        .sr-vehicle-name .sr-year {
          margin-left: 8px;
          font-size: 14px; font-weight: 700;
          color: #8A7A7A;
          vertical-align: middle;
        }
        .sr-vehicle-meta {
          display: flex; flex-wrap: wrap; gap: 6px;
          font-size: 12.5px; font-weight: 600; color: #8A7A7A;
          margin-top: 2px;
        }
        .sr-meta-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 50px;
          background: #FDF6F0;
          color: #6B4E9B;
        }

        /* Profile */
        .sr-profile-line {
          font-size: 14px; font-weight: 700; color: #1A1A2E;
        }
        .sr-focus-label {
          font-size: 11px; font-weight: 700; color: #8A7A7A;
          text-transform: uppercase; letter-spacing: 1px;
          margin-top: 2px;
        }
        .sr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .sr-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 700;
          color: #1A1A2E;
          padding: 6px 12px; border-radius: 50px;
          background: #FFF5F2;
          border: 1px solid rgba(255,122,112,0.2);
        }
        .sr-chip svg { color: #FF7A70; }
        .sr-access-row {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 12px;
          background: #F4EFFC;
          color: #6B4E9B;
          border-radius: 12px;
          font-size: 12.5px; font-weight: 700;
          align-self: flex-start;
        }

        /* Reco */
        .sr-reco-list {
          display: flex; flex-direction: column; gap: 8px;
        }
        .sr-reco-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          background: #FDF6F0;
          font-size: 13px; font-weight: 700; color: #1A1A2E;
        }
        .sr-reco-ico {
          width: 28px; height: 28px; border-radius: 8px;
          background: #FFE6E3; color: #FF7A70;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sr-reco-check {
          margin-left: auto;
          width: 20px; height: 20px; border-radius: 50%;
          background: #DFF5F1; color: #17856C;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* Sticky CTA */
        .sr-sticky {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 420px;
          padding: 16px 24px 20px;
          background: linear-gradient(to top, rgba(253,246,240,1) 55%, rgba(253,246,240,0));
          z-index: 50;
        }
        .sr-cta {
          font-family: inherit; border: none; cursor: pointer; width: 100%;
          padding: 14px 20px; border-radius: 50px;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          background: #FF7A70; color: #FFF;
          box-shadow: 0 10px 26px rgba(255,122,112,0.45);
          transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease, opacity 200ms ease;
        }
        .sr-cta:hover:not(:disabled) { background: #F26158; }
        .sr-cta:active:not(:disabled) { transform: scale(0.985); }
        .sr-cta:disabled { opacity: 0.55; cursor: not-allowed; }
        .sr-cta-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 16px; font-weight: 800;
        }
        .sr-cta-sub { font-size: 12px; font-weight: 500; opacity: 0.9; }
        .sr-cta-arrow { display: inline-flex; transition: transform 250ms ease; }
        .sr-cta:hover:not(:disabled) .sr-cta-arrow { transform: translateX(3px); }

        @media (min-width: 640px) {
          .sr-app { padding: 32px 24px 140px; }
          .sr-h1 { font-size: 28px; }
        }
      `}</style>

      <div className="sr-root">
        <div className="sr-blobs" aria-hidden="true" />

        <main className="sr-app">
          <div className="sr-top">
            <div className="sr-lang" role="tablist">
              <button
                type="button"
                className={`sr-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >FR</button>
              <button
                type="button"
                className={`sr-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >EN</button>
            </div>
          </div>

          <header>
            <span className="sr-mark">
              <Sparkles size={12} strokeWidth={2.5} /> {t.mark}
            </span>
            <h1 className="sr-h1">
              {lang === 'fr' ? 'Bienvenue, ' : 'Welcome back, '}
              <span className="sr-name">{nickname}</span>
              {' '}{t.wave}
            </h1>
            <p className="sr-sub">
              {lang === 'fr'
                ? <>Ta <b>{vehicleBrand} {vehicleModel}</b> est prête avec STELLA.</>
                : <>Your <b>{vehicleBrand} {vehicleModel}</b> is ready with STELLA.</>}
            </p>
          </header>

          {/* Hero card */}
          <div className="sr-hero" aria-label={t.caption}>
            <img
              className="sr-hero-photo"
              src="https://krisspy.blob.core.windows.net/public/images/1778367418020-8rl3fz26jxk.png"
              alt={`${vehicleBrand} ${vehicleModel}`}
              loading="eager"
            />
            <div className="sr-hero-car" style={{ display: 'none' }}>
              <svg className="sr-car-svg" viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" fill="none">
                <defs>
                  <linearGradient id="sr-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF8F85" />
                    <stop offset="60%" stopColor="#FF7A70" />
                    <stop offset="100%" stopColor="#E05A50" />
                  </linearGradient>
                  <linearGradient id="sr-body-shade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C94D45" />
                    <stop offset="100%" stopColor="#8A342E" />
                  </linearGradient>
                  <linearGradient id="sr-glass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B8C9F0" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#2D2447" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="sr-wheel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#555" />
                    <stop offset="100%" stopColor="#111" />
                  </linearGradient>
                </defs>

                {/* Ground shadow */}
                <ellipse cx="180" cy="138" rx="130" ry="6" fill="#000" opacity="0.35" />

                {/* SUV silhouette — chunky Jeep Avenger vibe */}
                <path
                  d="M42 112
                     C 44 90, 62 78, 82 74
                     L 108 56
                     C 116 48, 128 44, 142 44
                     L 222 44
                     C 238 44, 252 50, 262 60
                     L 284 76
                     C 308 80, 322 92, 324 110
                     L 324 120
                     C 324 124, 320 128, 316 128
                     L 46 128
                     C 42 128, 40 124, 40 120 Z"
                  fill="url(#sr-body)"
                />
                {/* Bottom shade */}
                <path
                  d="M40 118 L 324 118 L 324 124 C 324 128, 320 130, 316 130 L 46 130 C 42 130, 40 128, 40 124 Z"
                  fill="url(#sr-body-shade)"
                />
                {/* Windshield + windows */}
                <path
                  d="M118 58
                     L 140 50
                     L 222 50
                     C 232 50, 242 54, 250 62
                     L 262 74
                     L 118 74 Z"
                  fill="url(#sr-glass)"
                  opacity="0.95"
                />
                {/* Window divider */}
                <rect x="178" y="52" width="2.4" height="22" fill="#2D2447" opacity="0.75" />

                {/* Front grille hint */}
                <rect x="296" y="96" width="22" height="8" rx="2" fill="#2A1F40" opacity="0.5" />

                {/* Headlight */}
                <circle cx="312" cy="90" r="5" fill="#FFF7C8" />
                <circle cx="312" cy="90" r="2.2" fill="#FFF" />

                {/* Door line */}
                <path d="M180 74 L 180 118" stroke="#C94D45" strokeWidth="1.2" opacity="0.6" />
                <path d="M142 74 L 142 118" stroke="#C94D45" strokeWidth="1.2" opacity="0.6" />

                {/* Side accent */}
                <path d="M56 108 L 316 108" stroke="#FFF" strokeOpacity="0.12" strokeWidth="1.5" />

                {/* Wheel arches */}
                <path d="M80 118 a 26 26 0 0 1 52 0" fill="#1A1A2E" />
                <path d="M228 118 a 26 26 0 0 1 52 0" fill="#1A1A2E" />

                {/* Wheels */}
                <circle cx="106" cy="124" r="18" fill="url(#sr-wheel)" />
                <circle cx="106" cy="124" r="9" fill="#222" stroke="#777" strokeWidth="1.5" />
                <circle cx="106" cy="124" r="2.5" fill="#DDD" />

                <circle cx="254" cy="124" r="18" fill="url(#sr-wheel)" />
                <circle cx="254" cy="124" r="9" fill="#222" stroke="#777" strokeWidth="1.5" />
                <circle cx="254" cy="124" r="2.5" fill="#DDD" />

                {/* Electric bolt on door */}
                <path d="M200 90 L 194 102 L 201 102 L 197 112 L 208 98 L 201 98 Z"
                  fill="#FFF" opacity="0.92" />

                {/* Roof rail */}
                <rect x="122" y="46" width="130" height="3" rx="1.5" fill="#2A1F40" opacity="0.55" />
              </svg>
            </div>
            <div className="sr-glow" />

            {/* Scan overlay */}
            <div className={`sr-scan ${scanDone ? 'done' : ''}`} aria-hidden="true">
              <div className="sr-scan-grid" />
              <div className="sr-scan-corner tl" />
              <div className="sr-scan-corner tr" />
              <div className="sr-scan-corner bl" />
              <div className="sr-scan-corner br" />
              <div className="sr-scan-line" />
              <div className="sr-scan-label">
                <span className="sr-pulse-dot" />
                <span>{t.scan_label}</span>
              </div>
            </div>

            {/* Caption row */}
            <div className="sr-hero-caption">
              <span className="sr-caption-text">
                <Sparkles size={12} strokeWidth={2.5} />
                {t.caption}
              </span>
              <span className="sr-status-chip">
                <span className="sr-status-dot" />
                {t.synced}
              </span>
            </div>
          </div>

          {/* AI loader */}
          <div className={`sr-loader ${progress >= 100 ? 'done' : ''}`}>
            <div className="sr-loader-row">
              <span className="sr-loader-label">
                <span className="sr-loader-ico">
                  {progress >= 100
                    ? <CircleCheck size={16} strokeWidth={2.5} />
                    : <Sparkles size={14} strokeWidth={2.5} />}
                </span>
                {progress >= 100 ? `${t.loaded} ✓` : t.loading_ai}
              </span>
              <span className={`sr-loader-pct ${progress >= 100 ? 'sr-loader-done' : ''}`}>
                {progress}%
              </span>
            </div>
            <div className="sr-loader-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="sr-loader-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Vehicle section */}
          <section className="sr-section">
            <div className="sr-sec-head">
              <span className="sr-sec-ico coral"><Car size={16} strokeWidth={2.5} /></span>
              <span className="sr-sec-title">{t.sec_vehicle}</span>
            </div>
            <div className="sr-vehicle">
              <div className="sr-vehicle-name">
                {vehicleBrand} {vehicleModel}
                <span className="sr-tag"><Zap size={10} strokeWidth={3} /> Electric</span>
                <span className="sr-year">· {vehicleYear}</span>
              </div>
              <div className="sr-vehicle-meta">
                <span className="sr-meta-chip"><Gauge size={12} strokeWidth={2.5} /> 18 450 km</span>
                <span className="sr-meta-chip"><Activity size={12} strokeWidth={2.5} /> {t.synced}</span>
              </div>
            </div>
          </section>

          {/* Driving profile */}
          <section className="sr-section">
            <div className="sr-sec-head">
              <span className="sr-sec-ico purple"><Activity size={16} strokeWidth={2.5} /></span>
              <span className="sr-sec-title">{t.sec_profile}</span>
            </div>
            <div className="sr-profile-line">🟡 {t.driver_intermediate}</div>
            <div className="sr-focus-label">{t.focus_title}</div>
            <div className="sr-chips">
              {t.focus.map((f) => (
                <span key={f.id} className="sr-chip">
                  {FOCUS_ICONS[f.id]}
                  <span>{f.label}</span>
                </span>
              ))}
            </div>
            <span className="sr-access-row">
              <Accessibility size={14} strokeWidth={2.5} />
              {t.accessibility_on}
            </span>
          </section>

          {/* Reco */}
          <section className="sr-section">
            <div className="sr-sec-head">
              <span className="sr-sec-ico teal"><Sparkles size={16} strokeWidth={2.5} /></span>
              <span className="sr-sec-title">{t.sec_reco}</span>
            </div>
            <div className="sr-reco-list">
              {t.reco.map((r) => (
                <div key={r.id} className="sr-reco-item">
                  <span className="sr-reco-ico">{RECO_ICONS[r.id]}</span>
                  <span>{r.label}</span>
                  <span className="sr-reco-check">
                    <Check size={12} strokeWidth={3.5} />
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <div className="sr-sticky">
          <button
            type="button"
            className="sr-cta"
            disabled={progress < 100}
            aria-disabled={progress < 100}
            onClick={() => navigate('/home')}
          >
            <span className="sr-cta-label">
              {t.cta}
              <span className="sr-cta-arrow">
                <ArrowRight size={18} strokeWidth={2.5} />
              </span>
            </span>
            <span className="sr-cta-sub">{t.cta_sub}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default StellaReady;
