/**
 * @krisspy-file
 * @type page
 * @name "StellaHome"
 * @title "STELLA — Accueil"
 * @description "Tableau de bord principal : statut véhicule, insights IA, alertes maintenance, actions vocales rapides, SOS et navigation bas."
 * @routes ["/home", "/dashboard"]
 * @flowName "App"
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Home,
  Map,
  Star,
  User,
  Lightbulb,
} from 'lucide-react';

type Lang = 'fr' | 'en';

const I18N = {
  fr: {
    greet_title: (name: string) => `On va où aujourd'hui, ${name} ? 🚗`,
    greet_sub: 'Ta Jeep Avenger est prête pour un trajet sûr et optimisé.',
    mark: 'Mon tableau de bord',
    sec_vehicle: 'Statut véhicule',
    sec_vehicle_sub: 'Jeep Avenger · Électrique',
    battery_label: 'Batterie',
    range_label: 'Autonomie',
    tires_label: 'Pneus',
    tires_value: 'Bon état',
    health_label: 'Santé',
    health_value: 'Systèmes OK',
    service_label: 'Révision',
    service_value: '~2 mois',
    service_value_pill: 'Dans 2 mois',
    all_good: 'Tout va bien',
    view_details: 'Voir les détails du véhicule',
    insight_tag: 'Pour toi',
    insight: 'Recharge après 22h pour économiser jusqu\'à 7 €/mois.',
    alert_title: 'Révision dans ~2 mois',
    alert_sub: 'Anticipe pour comparer les devis sans stress.',
    alert_cta: 'Analyser un devis garage',
    quick_title: 'Demande à STELLA',
    quick_sub: 'Appuie pour parler ou choisis une suggestion',
    quick: [
      'Meilleur trajet pour économiser ?',
      'Ma voiture est-elle en bonne santé ?',
      'Puis-je reporter la révision ?',
      'Prévision des coûts mensuels ?',
    ],
    sos: 'Aide d\'urgence',
    sos_long: 'Appel d\'urgence en cours…',
    status_battery: 'Batterie',
    status_range: 'Autonomie',
    status_service: 'Révision',
    status_service_value: 'Dans ~2 mois',
    status_health: 'Santé',
    status_health_value: 'Tous systèmes OK',
    qa_route_title: '🔧 Analyser un devis garage',
    qa_route_sub: 'Comprends chaque devis',
    qa_chat_title: '✨ Discuter avec Stella',
    qa_chat_sub: 'Demande-moi ce que tu veux',
    qa_sos_title: '🆘 SOS',
    qa_sos_sub: 'Aide d\'urgence',
    nav: [
      { id: 'home', label: 'Accueil' },
      { id: 'trips', label: 'Trajets' },
      { id: 'perks', label: 'Avantages' },
      { id: 'profile', label: 'Profil' },
    ],
    toast_quick: 'STELLA t\'écoute…',
    toast_details: 'Ouverture des détails véhicule',
    toast_quote: 'Analyse de devis — bientôt disponible',
    toast_nav: (label: string) => `Navigation : ${label}`,
  },
  en: {
    greet_title: (name: string) => `Where are we going today, ${name}? 🚗`,
    greet_sub: 'Your Jeep Avenger is ready for a safe and optimized drive.',
    mark: 'My dashboard',
    sec_vehicle: 'Vehicle status',
    sec_vehicle_sub: 'Jeep Avenger · Electric',
    battery_label: 'Battery',
    range_label: 'Range',
    tires_label: 'Tires',
    tires_value: 'Good condition',
    health_label: 'Health',
    health_value: 'All systems OK',
    service_label: 'Service',
    service_value: '~2 months',
    service_value_pill: 'In 2 months',
    all_good: 'All good',
    view_details: 'View vehicle details',
    insight_tag: 'For you',
    insight: 'Charge after 10 PM to save up to €7/month.',
    alert_title: 'Service coming up in ~2 months',
    alert_sub: 'Plan ahead to compare quotes stress-free.',
    alert_cta: 'Analyze garage quote',
    quick_title: 'Ask STELLA',
    quick_sub: 'Tap to speak or pick a suggestion',
    quick: [
      'Best route for savings?',
      'Is my car healthy?',
      'Can I delay service?',
      'Monthly cost forecast?',
    ],
    sos: 'Emergency help',
    sos_long: 'Emergency call in progress…',
    status_battery: 'Battery',
    status_range: 'Range',
    status_service: 'Service',
    status_service_value: 'Due in ~2 months',
    status_health: 'Health',
    status_health_value: 'All systems OK',
    qa_route_title: '🔧 Analyze garage quote',
    qa_route_sub: 'Understand every quote',
    qa_chat_title: '✨ Chat with Stella',
    qa_chat_sub: 'Ask me anything',
    qa_sos_title: '🆘 SOS',
    qa_sos_sub: 'Emergency help',
    nav: [
      { id: 'home', label: 'Home' },
      { id: 'trips', label: 'Trips' },
      { id: 'perks', label: 'Perks' },
      { id: 'profile', label: 'Profile' },
    ],
    toast_quick: 'STELLA is listening…',
    toast_details: 'Opening vehicle details',
    toast_quote: 'Quote analysis — coming soon',
    toast_nav: (label: string) => `Navigate: ${label}`,
  },
} as const;

const NAV_ICONS: Record<string, React.ReactNode> = {
  home: <Home size={20} strokeWidth={2.4} />,
  trips: <Map size={20} strokeWidth={2.4} />,
  perks: <Star size={20} strokeWidth={2.4} />,
  profile: <User size={20} strokeWidth={2.4} />,
};

const BATTERY_PCT = 78;
const RANGE_KM = 312;

const StellaHome: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');
  const [activeNav, setActiveNav] = useState('home');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const t = I18N[lang];
  const nickname = 'Marie';

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const handleSos = () => {
    navigate('/sos');
  };

  return (
    <>
      <style>{`
        .sh-root * { box-sizing: border-box; }
        .sh-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .sh-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .sh-blobs::before, .sh-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
        }
        .sh-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .sh-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .sh-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 20px 108px;
          display: flex; flex-direction: column; gap: 18px;
          position: relative; z-index: 1;
        }
        .sh-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sh-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; letter-spacing: 0.4px;
          box-shadow: 0 4px 12px rgba(255,122,112,0.35);
        }
        .sh-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .sh-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
        }
        .sh-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 3px 10px rgba(255,122,112,0.3);
        }

        .sh-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .sh-h1 {
          font-size: 24px; font-weight: 800; line-height: 1.22;
          letter-spacing: -0.3px; color: #1A1A2E;
          margin: 6px 0 4px;
        }
        .sh-sub {
          font-size: 14px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }
        .sh-sub b { color: #1A1A2E; font-weight: 700; }

        /* Hero vehicle section — frameless, tiles sit on page */
        .sh-hero {
          position: relative;
          padding: 0;
          background: transparent;
          color: #1A1A2E;
          display: flex; flex-direction: column; gap: 12px;
        }
        .sh-hero-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
        }
        .sh-hero-brand {
          display: flex; flex-direction: column; gap: 2px;
        }
        .sh-hero-title {
          font-size: 11px; font-weight: 700; letter-spacing: 1.4px;
          text-transform: uppercase; color: #FF7A70;
        }
        .sh-hero-sub {
          font-size: 14px; font-weight: 800; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sh-hero-live {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10.5px; font-weight: 700;
          padding: 4px 10px; border-radius: 50px;
          color: #17856C; background: #DFF5F1;
          letter-spacing: 0.4px; text-transform: uppercase;
        }
        .sh-hero-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2BB8A6;
          animation: sh-pulse 1.4s ease-in-out infinite;
        }
        @keyframes sh-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Vehicle data rows */
        .sh-data {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px 16px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .sh-data-row { display: flex; flex-direction: column; gap: 6px; }
        .sh-data-line {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
        }
        .sh-data-label {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 700;
          color: #1A1A2E;
        }
        .sh-data-label span { font-size: 15px; line-height: 1; }
        .sh-data-value {
          font-size: 13.5px; font-weight: 800;
          color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sh-data-value.ok { color: #17856C; }
        .sh-data-value.warn { color: #B27300; }
        .sh-data-bar {
          height: 6px;
          background: rgba(26,26,46,0.06);
          border-radius: 4px; overflow: hidden;
        }
        .sh-data-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #2BB8A6 0%, #17856C 100%);
          border-radius: 4px;
          transition: width 500ms cubic-bezier(0.22,1,0.36,1);
        }

        .sh-hero-cta {
          width: 100%;
          border: 1.5px solid rgba(255,122,112,0.25);
          background: #FFF5F2;
          color: #FF7A70;
          padding: 11px 16px; border-radius: 50px;
          font-family: inherit; font-size: 13px; font-weight: 800;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer;
          transition: background 180ms ease, transform 150ms ease, border-color 180ms ease;
        }
        .sh-hero-cta:hover {
          background: #FF7A70; color: #FFF; border-color: #FF7A70;
        }
        .sh-hero-cta:active { transform: scale(0.99); }
        .sh-hero-cta svg { transition: transform 250ms ease; }
        .sh-hero-cta:hover svg { transform: translateX(3px); }

        /* Insight banner */
        .sh-insight {
          display: flex; align-items: center; gap: 12px;
          background: linear-gradient(90deg, rgba(255,122,112,0.12) 0%, rgba(107,78,155,0.1) 100%);
          border: 1px solid rgba(255,122,112,0.25);
          border-radius: 14px;
          padding: 12px 14px;
          box-shadow: 0 10px 24px rgba(255,122,112,0.08);
        }
        .sh-insight-ico {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #FFE6A3 0%, #FFB670 100%);
          color: #8A5A00;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 14px rgba(245,165,36,0.3);
        }
        .sh-insight-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .sh-insight-tag {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.8px;
          text-transform: uppercase; color: #FF7A70;
        }
        .sh-insight-line {
          font-size: 13px; font-weight: 700; color: #1A1A2E;
          line-height: 1.35;
        }

        /* Maintenance alert */
        .sh-alert {
          background: #FFF;
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 10px 24px rgba(26,26,46,0.06);
          border-left: 4px solid #F5A524;
          display: flex; flex-direction: column; gap: 10px;
        }
        .sh-alert-row {
          display: flex; align-items: flex-start; gap: 10px;
        }
        .sh-alert-ico {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 10px;
          background: #FDEFD4; color: #8A5A00;
          display: flex; align-items: center; justify-content: center;
        }
        .sh-alert-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .sh-alert-title { font-size: 14px; font-weight: 800; color: #1A1A2E; }
        .sh-alert-sub { font-size: 12px; font-weight: 500; color: #8A7A7A; line-height: 1.4; }
        /* Quick actions — 3 large colored cards, vertical stack */
        .sh-qa {
          display: flex; flex-direction: column; gap: 12px;
        }
        .sh-qa-card {
          font-family: inherit; border: none; cursor: pointer;
          width: 100%;
          padding: 18px 20px;
          border-radius: 16px;
          color: #FFF;
          text-align: left;
          display: flex; flex-direction: column; gap: 4px;
          position: relative; overflow: hidden;
          transition: transform 150ms ease, box-shadow 200ms ease, filter 180ms ease;
        }
        .sh-qa-card::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 90% 10%, rgba(255,255,255,0.18) 0%, transparent 55%);
          pointer-events: none;
        }
        .sh-qa-card:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .sh-qa-card:active { transform: scale(0.99); }
        .sh-qa-card.coral {
          background: linear-gradient(135deg, #FF8F85 0%, #FF7A70 100%);
          box-shadow: 0 14px 26px rgba(255,122,112,0.35);
        }
        .sh-qa-card.purple {
          background: linear-gradient(135deg, #7B5CAF 0%, #6B4E9B 100%);
          box-shadow: 0 14px 26px rgba(107,78,155,0.35);
        }
        .sh-qa-card.red {
          background: linear-gradient(135deg, #EF453E 0%, #E53935 100%);
          box-shadow: 0 14px 26px rgba(229,57,53,0.38);
        }
        .sh-qa-title {
          font-size: 17px; font-weight: 900;
          letter-spacing: -0.2px;
          position: relative; z-index: 1;
        }
        .sh-qa-sub {
          font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,0.88);
          position: relative; z-index: 1;
        }
        .sh-see-rewards {
          align-self: center;
          background: transparent; border: none;
          font-family: inherit; font-size: 13px; font-weight: 800;
          color: #FF7A70; cursor: pointer;
          text-decoration: underline; text-underline-offset: 3px;
          padding: 8px 12px;
          margin: -4px 0 2px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: color 150ms ease;
        }
        .sh-see-rewards:hover { color: #F26158; }

        /* Bottom nav */
        .sh-nav {
          position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%);
          width: calc(100% - 28px); max-width: 392px;
          padding: 8px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(14px);
          border-radius: 22px;
          box-shadow: 0 20px 40px rgba(26,26,46,0.15), 0 0 0 1px rgba(255,255,255,0.6) inset;
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          z-index: 50;
        }
        .sh-nav-btn {
          border: none; background: transparent;
          font-family: inherit;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 10px 6px; border-radius: 14px;
          font-size: 10.5px; font-weight: 700;
          color: #8A7A7A;
          cursor: pointer;
          transition: all 200ms ease;
          position: relative;
        }
        .sh-nav-btn svg { transition: transform 200ms ease; }
        .sh-nav-btn:hover { color: #1A1A2E; }
        .sh-nav-btn.active {
          background: linear-gradient(135deg, rgba(255,122,112,0.12) 0%, rgba(107,78,155,0.1) 100%);
          color: #FF7A70;
        }
        .sh-nav-btn.active svg {
          color: #FF7A70;
          filter: drop-shadow(0 4px 10px rgba(255,122,112,0.5));
          transform: translateY(-1px);
        }
        .sh-nav-btn.active::after {
          content: ""; position: absolute; bottom: 4px; left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
          background: #FF7A70;
          box-shadow: 0 0 8px rgba(255,122,112,0.8);
        }

        /* Toast */
        .sh-toast {
          position: fixed; bottom: 96px; left: 50%;
          transform: translate(-50%, 20px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 20px 50px rgba(26,26,46,0.25);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .sh-toast.show { transform: translate(-50%, 0); opacity: 1; }

        @media (min-width: 640px) {
          .sh-app { padding: 32px 20px 108px; }
          .sh-h1 { font-size: 26px; }
        }
      `}</style>

      <div className="sh-root">
        <div className="sh-blobs" aria-hidden="true" />

        <main className="sh-app">
          <div className="sh-top">
            <div className="sh-avatar" aria-hidden="true">{nickname.charAt(0)}</div>
            <div className="sh-lang" role="tablist">
              <button
                type="button"
                className={`sh-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >FR</button>
              <button
                type="button"
                className={`sh-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >EN</button>
            </div>
          </div>

          <header>
            <span className="sh-mark">
              <Sparkles size={12} strokeWidth={2.5} /> {t.mark}
            </span>
            <h1 className="sh-h1">{t.greet_title(nickname)}</h1>
            <p className="sh-sub">{t.greet_sub}</p>
          </header>

          {/* Hero vehicle card */}
          <section className="sh-hero" aria-label={t.sec_vehicle}>
            <div className="sh-hero-head">
              <div className="sh-hero-brand">
                <span className="sh-hero-title">{t.sec_vehicle}</span>
                <span className="sh-hero-sub">{t.sec_vehicle_sub}</span>
              </div>
              <span className="sh-hero-live">
                <span className="sh-hero-dot" />
                LIVE
              </span>
            </div>

            <div className="sh-data">
              <div className="sh-data-row">
                <div className="sh-data-line">
                  <span className="sh-data-label"><span aria-hidden="true">🔋</span> {t.status_battery}</span>
                  <span className="sh-data-value ok">78%</span>
                </div>
                <div className="sh-data-bar" role="progressbar" aria-valuenow={78} aria-valuemin={0} aria-valuemax={100}>
                  <div className="sh-data-bar-fill" style={{ width: '78%' }} />
                </div>
              </div>
              <div className="sh-data-row">
                <div className="sh-data-line">
                  <span className="sh-data-label"><span aria-hidden="true">🛣️</span> {t.status_range}</span>
                  <span className="sh-data-value">312 km</span>
                </div>
              </div>
              <div className="sh-data-row">
                <div className="sh-data-line">
                  <span className="sh-data-label"><span aria-hidden="true">🔧</span> {t.status_service}</span>
                  <span className="sh-data-value warn">{t.status_service_value}</span>
                </div>
              </div>
              <div className="sh-data-row">
                <div className="sh-data-line">
                  <span className="sh-data-label"><span aria-hidden="true">✅</span> {t.status_health}</span>
                  <span className="sh-data-value ok">{t.status_health_value}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="sh-hero-cta"
              onClick={() => showToast(t.toast_details)}
            >
              {t.view_details}
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </section>

          {/* Smart insight */}
          <div className="sh-insight" role="note">
            <span className="sh-insight-ico">
              <Lightbulb size={18} strokeWidth={2.5} />
            </span>
            <div className="sh-insight-text">
              <span className="sh-insight-tag">💡 {t.insight_tag}</span>
              <span className="sh-insight-line">{t.insight}</span>
            </div>
          </div>

          {/* Maintenance alert */}
          <section className="sh-alert">
            <div className="sh-alert-row">
              <span className="sh-alert-ico">
                <AlertTriangle size={18} strokeWidth={2.5} />
              </span>
              <div className="sh-alert-text">
                <span className="sh-alert-title">⚠️ {t.alert_title}</span>
                <span className="sh-alert-sub">{t.alert_sub}</span>
              </div>
            </div>
          </section>

          {/* Quick actions — 3 large colored cards */}
          <div className="sh-qa" role="group">
            <button
              type="button"
              className="sh-qa-card coral"
              onClick={() => navigate('/garage')}
            >
              <span className="sh-qa-title">{t.qa_route_title}</span>
              <span className="sh-qa-sub">{t.qa_route_sub}</span>
            </button>
            <button
              type="button"
              className="sh-qa-card purple"
              onClick={() => navigate('/copilot')}
            >
              <span className="sh-qa-title">{t.qa_chat_title}</span>
              <span className="sh-qa-sub">{t.qa_chat_sub}</span>
            </button>
            <button
              type="button"
              className="sh-qa-card red"
              onClick={handleSos}
              aria-label={t.sos}
            >
              <span className="sh-qa-title">{t.qa_sos_title}</span>
              <span className="sh-qa-sub">{t.qa_sos_sub}</span>
            </button>
          </div>

          <button type="button" className="sh-see-rewards" onClick={() => navigate('/avantages')}>
            Voir toutes mes récompenses →
          </button>
        </main>

        {/* Bottom nav */}
        <nav className="sh-nav" aria-label="Navigation principale">
          {t.nav.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`sh-nav-btn ${activeNav === n.id ? 'active' : ''}`}
              onClick={() => {
                setActiveNav(n.id);
                if (n.id === 'trips') navigate('/trips');
                else if (n.id === 'perks') navigate('/rewards');
                else if (n.id === 'profile') navigate('/profile');
                else if (n.id !== 'home') showToast(t.toast_nav(n.label));
              }}
              aria-current={activeNav === n.id ? 'page' : undefined}
            >
              {NAV_ICONS[n.id]}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <div className={`sh-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaHome;
