/**
 * @krisspy-file
 * @type page
 * @name "StellaWelcome"
 * @title "STELLA — Bienvenue"
 * @description "Écran d'accueil et authentification de STELLA, assistant mobilité intelligent. Bilingue FR/EN avec modal transparence des données."
 * @routes ["/", "/welcome"]
 * @flowName "Authentification"
 * @design "reference"
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Wrench,
  ShieldCheck,
  Zap,
  Star,
  Database,
  Lightbulb,
  ShieldOff,
  ChevronDown,
} from 'lucide-react';

type Lang = 'fr' | 'en';

const I18N = {
  fr: {
    headline_pre: 'Votre ',
    headline_accent: 'assistant intelligent',
    headline_post: ' pour mieux vous déplacer, décider et économiser.',
    subhead: 'Une expérience simple, personnalisée et sécurisée.',
    cta_primary: 'Créer un compte',
    cta_primary_sub: 'Créer votre expérience personnalisée',
    cta_secondary: 'Se connecter',
    cta_secondary_sub: 'Accéder à mon compte',
    cta_ghost: "Découvrir l'application →",
    data_text: 'STELLA utilise uniquement les données nécessaires au fonctionnement de votre copilote.',
    data_link: '👉 Voir le détail des données',
    v1_title: 'Aide Garage & Devis',
    v1_desc: 'Comprenez chaque devis, évitez les mauvaises surprises.',
    v2_title: 'Sécurité & Bien-être',
    v2_desc: 'Des trajets plus sûrs, des alertes intelligentes.',
    v3_title: 'Énergie Intelligente',
    v3_desc: 'Optimisez vos coûts selon votre usage.',
    v4_title: 'Économies & Avantages',
    v4_desc: 'Réduisez vos dépenses et gagnez au quotidien.',
    modal_title: 'Transparence des données',
    modal_sub: 'Voici exactement ce que nous faisons, et ne faisons pas, avec vos données.',
    acc1_title: 'Données collectées',
    acc2_title: 'À quoi elles servent',
    acc3_title: 'Ce que nous ne faisons jamais',
    modal_cta: 'Compris ✓',
    acc1: ['Kilométrage', 'État du véhicule', 'Trajets récents', "Historique d'entretien"],
    acc2: ['Personnaliser vos trajets', 'Améliorer votre sécurité', "Réduire vos coûts d'entretien"],
    acc3: ['Publicité ciblée', 'Vente de vos données', 'Partage sans consentement'],
    toast_primary: 'Création de compte — démo prototype',
    toast_secondary: 'Connexion — démo prototype',
    toast_ghost: 'Visite guidée — démo prototype',
    lang_fr: 'Français',
    lang_en: 'English',
  },
  en: {
    headline_pre: 'Your ',
    headline_accent: 'smart assistant',
    headline_post: ' to move smarter, decide better and save more.',
    subhead: 'A simple, personalized and secure experience.',
    cta_primary: 'Create an account',
    cta_primary_sub: 'Build your personalized experience',
    cta_secondary: 'Sign in',
    cta_secondary_sub: 'Access my account',
    cta_ghost: 'Explore the app →',
    data_text: 'STELLA only uses data that is strictly necessary to power your copilot.',
    data_link: '👉 View data details',
    v1_title: 'Garage & Quote Help',
    v1_desc: 'Understand every quote, avoid bad surprises.',
    v2_title: 'Safety & Wellbeing',
    v2_desc: 'Safer journeys and smart alerts.',
    v3_title: 'Smart Energy',
    v3_desc: 'Optimize your costs based on your usage.',
    v4_title: 'Savings & Perks',
    v4_desc: 'Reduce your expenses and gain daily benefits.',
    modal_title: 'Data transparency',
    modal_sub: "Here is exactly what we do, and don't do, with your data.",
    acc1_title: 'Data collected',
    acc2_title: "What it's used for",
    acc3_title: 'What we never do',
    modal_cta: 'Got it ✓',
    acc1: ['Mileage', 'Vehicle condition', 'Recent trips', 'Maintenance history'],
    acc2: ['Personalize your routes', 'Improve your safety', 'Reduce maintenance costs'],
    acc3: ['Targeted advertising', 'Selling your data', 'Sharing without consent'],
    toast_primary: 'Account creation — prototype demo',
    toast_secondary: 'Sign in — prototype demo',
    toast_ghost: 'Guided tour — prototype demo',
    lang_fr: 'Français',
    lang_en: 'English',
  },
} as const;

const StellaWelcome: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');
  const [modalOpen, setModalOpen] = useState(false);
  const [openAcc, setOpenAcc] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const t = I18N[lang];

  const goTo = useCallback(
    (path: string) => {
      if (leaving) return;
      setLeaving(true);
      window.setTimeout(() => navigate(path), 260);
    },
    [leaving, navigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const toggleAcc = (idx: number) => setOpenAcc((v) => (v === idx ? null : idx));

  return (
    <>
      <style>{`
        .stella-root * { box-sizing: border-box; }
        .stella-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          position: relative;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          opacity: 1;
          transform: translateY(0);
          transition: opacity 260ms ease, transform 260ms ease;
        }
        .stella-root.stella-leaving {
          opacity: 0;
          transform: translateY(-8px);
        }
        @media (prefers-reduced-motion: reduce) {
          .stella-root { transition: none; }
          .stella-root.stella-leaving { transform: none; }
        }
        .stella-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .stella-blobs::before, .stella-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
        }
        .stella-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .stella-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .stella-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 24px 48px;
          display: flex; flex-direction: column; gap: 28px;
          position: relative; z-index: 1;
        }
        .stella-lang {
          display: flex; justify-content: center; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px); align-self: center;
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .stella-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 13px; font-weight: 600; color: #8A7A7A;
          padding: 8px 16px; border-radius: 50px; cursor: pointer;
          display: flex; align-items: center; gap: 6px; transition: all 200ms ease;
        }
        .stella-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 4px 12px rgba(255,122,112,0.3);
        }
        .stella-hero { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 24px; }
        .stella-visual { width: 100%; height: 180px; animation: stella-float 6s ease-in-out infinite; }
        .stella-visual svg { width: 100%; height: 100%; }
        @keyframes stella-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .stella-brand { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .stella-mark {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: #FF7A70; padding: 6px 14px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .stella-headline {
          font-size: 26px; font-weight: 800; line-height: 1.22;
          letter-spacing: -0.3px; color: #1A1A2E; margin: 0;
        }
        .stella-accent {
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          font-style: normal;
        }
        .stella-sub { font-size: 15px; font-weight: 500; color: #8A7A7A; line-height: 1.5; margin: 6px 0 0; }
        .stella-actions { display: flex; flex-direction: column; gap: 12px; }
        .stella-btn {
          font-family: inherit; border: none; cursor: pointer; width: 100%;
          padding: 14px 20px; border-radius: 50px;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
          text-align: center;
        }
        .stella-btn:active { transform: scale(0.98); }
        .stella-btn-primary {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 8px 20px rgba(255,122,112,0.35);
        }
        .stella-btn-primary:hover { background: #F26158; }
        .stella-btn-secondary {
          background: #FFF; color: #6B4E9B; border: 1.5px solid #6B4E9B;
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .stella-btn-secondary:hover { background: #EEE7F7; }
        .stella-btn-label { font-size: 16px; font-weight: 700; }
        .stella-btn-sublabel { font-size: 12px; font-weight: 500; opacity: 0.85; }
        .stella-btn-primary .stella-btn-sublabel { opacity: 0.9; }
        .stella-ghost {
          background: transparent; border: none; color: #6B4E9B;
          font-family: inherit; font-size: 14px; font-weight: 600;
          text-decoration: underline; text-underline-offset: 3px;
          cursor: pointer; padding: 8px; align-self: center;
        }
        .stella-ghost:hover { color: #FF7A70; }
        .stella-data-card {
          background: #FFF; border-radius: 16px; padding: 20px;
          box-shadow: 0 10px 30px rgba(26,26,46,0.08);
          display: flex; gap: 14px; align-items: flex-start;
        }
        .stella-data-icon {
          flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #FF7A70 0%, #FFB5A7 100%);
          color: #FFF; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(255,122,112,0.3);
        }
        .stella-data-text {
          font-size: 13.5px; font-weight: 500; color: #1A1A2E;
          line-height: 1.5; margin: 0 0 10px;
        }
        .stella-data-link {
          background: transparent; border: none; color: #FF7A70;
          font-family: inherit; font-size: 13px; font-weight: 700;
          cursor: pointer; padding: 0;
        }
        .stella-data-link:hover { color: #F26158; }
        .stella-values { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .stella-vcard {
          background: #FFF; border-radius: 16px; padding: 16px;
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
          display: flex; flex-direction: column; gap: 8px;
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .stella-vcard:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(26,26,46,0.08);
        }
        .stella-vicon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .stella-vicon.coral { background: #FFE6E3; color: #FF7A70; }
        .stella-vicon.purple { background: #EEE7F7; color: #6B4E9B; }
        .stella-vicon.teal { background: #DFF5F1; color: #2BB8A6; }
        .stella-vicon.amber { background: #FDEFD4; color: #F5A524; }
        .stella-vtitle { font-size: 13px; font-weight: 800; color: #1A1A2E; line-height: 1.3; margin: 0; }
        .stella-vdesc { font-size: 11.5px; font-weight: 500; color: #8A7A7A; line-height: 1.45; margin: 0; }
        .stella-overlay {
          position: fixed; inset: 0; background: rgba(26,26,46,0.45);
          backdrop-filter: blur(4px); z-index: 100;
          opacity: 0; pointer-events: none; transition: opacity 250ms ease;
          display: flex; justify-content: center; align-items: flex-end;
        }
        .stella-overlay.open { opacity: 1; pointer-events: auto; }
        .stella-modal {
          width: 100%; max-width: 420px;
          background: #FDF6F0; border-radius: 24px 24px 0 0;
          padding: 10px 24px 28px;
          transform: translateY(100%);
          transition: transform 350ms cubic-bezier(0.22,1,0.36,1);
          max-height: 88vh; overflow-y: auto;
        }
        .stella-overlay.open .stella-modal { transform: translateY(0); }
        .stella-grip {
          width: 40px; height: 4px; border-radius: 2px;
          background: #B8ACAC; margin: 0 auto 18px;
        }
        .stella-mtitle { font-size: 20px; font-weight: 800; color: #1A1A2E; margin: 0 0 6px; }
        .stella-msub { font-size: 13.5px; color: #8A7A7A; margin: 0 0 18px; line-height: 1.5; }
        .stella-acc {
          background: #FFF; border-radius: 16px; margin-bottom: 10px; overflow: hidden;
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .stella-acc-header {
          width: 100%; background: transparent; border: none; padding: 16px;
          display: flex; justify-content: space-between; align-items: center; gap: 12px;
          font-family: inherit; text-align: left; cursor: pointer;
        }
        .stella-acc-label { display: flex; align-items: center; gap: 10px; }
        .stella-acc-dot {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stella-acc-dot.coral { background: #FFE6E3; color: #FF7A70; }
        .stella-acc-dot.purple { background: #EEE7F7; color: #6B4E9B; }
        .stella-acc-dot.teal { background: #DFF5F1; color: #2BB8A6; }
        .stella-acc-title { font-size: 14px; font-weight: 700; color: #1A1A2E; }
        .stella-chevron { color: #8A7A7A; transition: transform 250ms ease; }
        .stella-acc.open .stella-chevron { transform: rotate(180deg); }
        .stella-acc-body { max-height: 0; overflow: hidden; transition: max-height 300ms ease; }
        .stella-acc.open .stella-acc-body { max-height: 300px; }
        .stella-acc-inner { padding: 0 16px 16px; display: flex; flex-wrap: wrap; gap: 6px; }
        .stella-tag {
          font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 50px;
          background: #F8F1EC; color: #1A1A2E;
        }
        .stella-tag.neg {
          background: #FFE8E6; color: #D14A41;
          text-decoration: line-through;
          text-decoration-color: rgba(209,74,65,0.5);
        }
        .stella-mcta {
          width: 100%; margin-top: 16px; padding: 14px 20px; border: none;
          border-radius: 50px; background: #FF7A70; color: #FFF;
          font-family: inherit; font-size: 15px; font-weight: 700;
          cursor: pointer; box-shadow: 0 8px 20px rgba(255,122,112,0.35);
        }
        .stella-mcta:hover { background: #F26158; }
        .stella-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translate(-50%, 80px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 20px; border-radius: 50px;
          font-size: 13px; font-weight: 600;
          box-shadow: 0 20px 50px rgba(26,26,46,0.12);
          z-index: 200; opacity: 0;
          transition: transform 300ms ease, opacity 300ms ease;
          pointer-events: none;
        }
        .stella-toast.show { transform: translate(-50%, 0); opacity: 1; }
        @media (min-width: 640px) {
          .stella-app { padding: 32px 24px 64px; }
          .stella-headline { font-size: 28px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .stella-visual { animation: none; }
        }
      `}</style>

      <div className={`stella-root ${leaving ? 'stella-leaving' : ''}`}>
        <div className="stella-blobs" aria-hidden="true" />

        <main className="stella-app">
          <div className="stella-lang" role="tablist" aria-label="Langue / Language">
            <button
              type="button"
              className={`stella-lang-btn ${lang === 'fr' ? 'active' : ''}`}
              onClick={() => setLang('fr')}
              role="tab"
              aria-selected={lang === 'fr'}
            >
              <span>🇫🇷</span>
              <span>{t.lang_fr}</span>
            </button>
            <button
              type="button"
              className={`stella-lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
              role="tab"
              aria-selected={lang === 'en'}
            >
              <span>🇬🇧</span>
              <span>{t.lang_en}</span>
            </button>
          </div>

          <section className="stella-hero">
            <div className="stella-visual" aria-hidden="true">
              <svg viewBox="0 0 360 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="stella-road" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF7A70" />
                    <stop offset="100%" stopColor="#6B4E9B" />
                  </linearGradient>
                  <linearGradient id="stella-road2" x1="1" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB5A7" />
                    <stop offset="100%" stopColor="#2BB8A6" />
                  </linearGradient>
                  <radialGradient id="stella-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFD9D1" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FFD9D1" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="180" cy="90" r="78" fill="url(#stella-glow)" />
                <path
                  d="M10 140 C 80 140, 100 60, 180 60 S 280 140, 350 140"
                  stroke="url(#stella-road)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                />
                <path
                  d="M10 150 C 80 150, 100 90, 180 90 S 280 150, 350 150"
                  stroke="url(#stella-road2)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.55"
                  strokeDasharray="6 8"
                />
                <path
                  d="M30 120 C 90 120, 120 40, 180 40 S 290 120, 340 120"
                  stroke="#6B4E9B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.3"
                />
                <circle cx="180" cy="60" r="8" fill="#FF7A70" />
                <circle cx="180" cy="60" r="14" fill="#FF7A70" opacity="0.25" />
                <circle cx="90" cy="128" r="4" fill="#6B4E9B" />
                <circle cx="270" cy="128" r="4" fill="#2BB8A6" />
              </svg>
            </div>

            <div className="stella-brand">
              <span className="stella-mark">
                <Sparkles size={14} strokeWidth={2.5} /> STELLA
              </span>
              <h1 className="stella-headline">
                {t.headline_pre}
                <em className="stella-accent">{t.headline_accent}</em>
                {t.headline_post}
              </h1>
              <p className="stella-sub">{t.subhead}</p>
            </div>
          </section>

          <section className="stella-actions" aria-label="Authentication">
            <button
              type="button"
              className="stella-btn stella-btn-primary"
              onClick={() => goTo('/name')}
              aria-label={t.cta_primary}
            >
              <span className="stella-btn-label">{t.cta_primary}</span>
              <span className="stella-btn-sublabel">{t.cta_primary_sub}</span>
            </button>
            <button
              type="button"
              className="stella-btn stella-btn-secondary"
              onClick={() => goTo('/login')}
              aria-label={t.cta_secondary}
            >
              <span className="stella-btn-label">{t.cta_secondary}</span>
              <span className="stella-btn-sublabel">{t.cta_secondary_sub}</span>
            </button>
            <button type="button" className="stella-ghost" onClick={() => showToast(t.toast_ghost)}>
              {t.cta_ghost}
            </button>
          </section>

          <section className="stella-data-card" aria-label="Data transparency">
            <div className="stella-data-icon">
              <Lock size={22} strokeWidth={2.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p className="stella-data-text">{t.data_text}</p>
              <button type="button" className="stella-data-link" onClick={() => setModalOpen(true)}>
                {t.data_link}
              </button>
            </div>
          </section>

          <section className="stella-values" aria-label="Key benefits">
            <article className="stella-vcard">
              <div className="stella-vicon coral">
                <Wrench size={18} strokeWidth={2.5} />
              </div>
              <h3 className="stella-vtitle">{t.v1_title}</h3>
              <p className="stella-vdesc">{t.v1_desc}</p>
            </article>
            <article className="stella-vcard">
              <div className="stella-vicon purple">
                <ShieldCheck size={18} strokeWidth={2.5} />
              </div>
              <h3 className="stella-vtitle">{t.v2_title}</h3>
              <p className="stella-vdesc">{t.v2_desc}</p>
            </article>
            <article className="stella-vcard">
              <div className="stella-vicon teal">
                <Zap size={18} strokeWidth={2.5} />
              </div>
              <h3 className="stella-vtitle">{t.v3_title}</h3>
              <p className="stella-vdesc">{t.v3_desc}</p>
            </article>
            <article className="stella-vcard">
              <div className="stella-vicon amber">
                <Star size={18} strokeWidth={2.5} />
              </div>
              <h3 className="stella-vtitle">{t.v4_title}</h3>
              <p className="stella-vdesc">{t.v4_desc}</p>
            </article>
          </section>
        </main>

        <div
          className={`stella-overlay ${modalOpen ? 'open' : ''}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            className="stella-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stella-modal-title"
          >
            <div className="stella-grip" />
            <h2 className="stella-mtitle" id="stella-modal-title">
              {t.modal_title}
            </h2>
            <p className="stella-msub">{t.modal_sub}</p>

            {[
              { idx: 0, icon: <Database size={14} strokeWidth={2.5} />, dot: 'coral', title: t.acc1_title, tags: t.acc1, neg: false },
              { idx: 1, icon: <Lightbulb size={14} strokeWidth={2.5} />, dot: 'purple', title: t.acc2_title, tags: t.acc2, neg: false },
              { idx: 2, icon: <ShieldOff size={14} strokeWidth={2.5} />, dot: 'teal', title: t.acc3_title, tags: t.acc3, neg: true },
            ].map((a) => (
              <div key={a.idx} className={`stella-acc ${openAcc === a.idx ? 'open' : ''}`}>
                <button
                  type="button"
                  className="stella-acc-header"
                  onClick={() => toggleAcc(a.idx)}
                  aria-expanded={openAcc === a.idx}
                >
                  <span className="stella-acc-label">
                    <span className={`stella-acc-dot ${a.dot}`}>{a.icon}</span>
                    <span className="stella-acc-title">{a.title}</span>
                  </span>
                  <ChevronDown size={18} className="stella-chevron" />
                </button>
                <div className="stella-acc-body">
                  <div className="stella-acc-inner">
                    {a.tags.map((tag, i) => (
                      <span key={i} className={`stella-tag ${a.neg ? 'neg' : ''}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="stella-mcta" onClick={() => setModalOpen(false)}>
              {t.modal_cta}
            </button>
          </div>
        </div>

        <div className={`stella-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaWelcome;
