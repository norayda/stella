/**
 * @krisspy-file
 * @type page
 * @name "StellaHome"
 * @title "STELLA — Accueil"
 * @description "Tableau de bord principal : statut véhicule, insights IA, alertes maintenance, actions vocales rapides, SOS et navigation bas."
 * @routes ["/home", "/dashboard"]
 * @flowName "App"
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import StellaNav from '../components/StellaNav';

type Lang = 'fr' | 'en';

const I18N = {
  fr: {
    greet_title: (name: string) => `On va où aujourd'hui, ${name} ? 🚗`,
    greet_sub: (car: string) => `Ta ${car} est prête pour un trajet sûr et optimisé.`,
    mark: 'Mon tableau de bord',
    sec_vehicle: 'Statut véhicule',
    sec_vehicle_sub: (car: string, fuel: string) => `${car} · ${fuel}`,
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
    insight_electric: 'Recharge après 22h pour économiser jusqu\'à 7 €/mois.',
    insight_hybrid: 'En mode électrique sous 50 km/h, tu économises jusqu\'à 15% de carburant.',
    insight_ice: 'Anticiper les freinages réduit la consommation jusqu\'à 8%.',
    status_fuel: 'Carburant',
    status_oil: 'Huile moteur',
    status_oil_value: 'Bon état',
    status_hybrid_battery: 'Batterie hybride',
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
    greet_sub: (car: string) => `Your ${car} is ready for a safe and optimized drive.`,
    mark: 'My dashboard',
    sec_vehicle: 'Vehicle status',
    sec_vehicle_sub: (car: string, fuel: string) => `${car} · ${fuel}`,
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
    insight_electric: 'Charge after 10 PM to save up to €7/month.',
    insight_hybrid: 'Using electric mode under 50 km/h saves up to 15% fuel.',
    insight_ice: 'Anticipating braking can reduce fuel consumption by up to 8%.',
    status_fuel: 'Fuel',
    status_oil: 'Engine oil',
    status_oil_value: 'Good',
    status_hybrid_battery: 'Hybrid battery',
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

type FuelCategory = 'electric' | 'hybrid' | 'ice';

function detectFuelCategory(fuel: string | undefined): FuelCategory {
  if (!fuel) return 'ice';
  const f = fuel.toLowerCase();
  if (f.includes('électrique') || f.includes('electrique') || f.includes('electric') || f.includes('ev') || f.includes('bev')) return 'electric';
  if (f.includes('hybride') || f.includes('hybrid') || f.includes('phev') || f.includes('hev') || f.includes('rechargeable')) return 'hybrid';
  return 'ice';
}


const StellaHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lang, setLang] = useState<Lang>('fr');
  const t = I18N[lang];

  // Nickname: Supabase metadata → sessionStorage → fallback
  const nickname: string =
    user?.user_metadata?.nickname ||
    (() => { try { return window.sessionStorage.getItem('stella:nickname') || ''; } catch { return ''; } })() ||
    (lang === 'fr' ? 'toi' : 'you');

  // Vehicle: from sessionStorage (set during onboarding)
  const vehicle = (() => {
    try {
      const raw = window.sessionStorage.getItem('stella:vehicle');
      return raw ? (JSON.parse(raw) as { brand?: string; model?: string; fuel?: string }) : null;
    } catch { return null; }
  })();
  const vehicleName = vehicle ? [vehicle.brand, vehicle.model].filter(Boolean).join(' ') : (lang === 'fr' ? 'votre véhicule' : 'your vehicle');
  const vehicleFuel  = vehicle?.fuel || (lang === 'fr' ? 'Véhicule' : 'Vehicle');
  const fuelCategory = detectFuelCategory(vehicle?.fuel);
  const isElectric   = fuelCategory === 'electric';
  const isHybrid     = fuelCategory === 'hybrid';
  const insight      = isElectric ? t.insight_electric : isHybrid ? t.insight_hybrid : t.insight_ice;

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

        @media (min-width: 640px) {
          .sh-app { padding: 32px 20px 108px; }
          .sh-h1 { font-size: 26px; }
        }
        @media (min-width: 1024px) {
          .sh-root { padding-left: 220px; justify-content: flex-start; }
          .sh-app { max-width: 640px; padding-bottom: 32px; }
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
            <p className="sh-sub">{t.greet_sub(vehicleName)}</p>
          </header>

          {/* Hero vehicle card */}
          <section className="sh-hero" aria-label={t.sec_vehicle}>
            <div className="sh-hero-head">
              <div className="sh-hero-brand">
                <span className="sh-hero-title">{t.sec_vehicle}</span>
                <span className="sh-hero-sub">{t.sec_vehicle_sub(vehicleName, vehicleFuel)}</span>
              </div>
              <span className="sh-hero-live">
                <span className="sh-hero-dot" />
                LIVE
              </span>
            </div>

            <div className="sh-data">
              {/* Row 1: Battery (electric/hybrid) or Fuel level (ICE) */}
              {(isElectric || isHybrid) ? (
                <div className="sh-data-row">
                  <div className="sh-data-line">
                    <span className="sh-data-label">
                      <span aria-hidden="true">🔋</span>
                      {isHybrid ? t.status_hybrid_battery : t.status_battery}
                    </span>
                    <span className="sh-data-value ok">78%</span>
                  </div>
                  <div className="sh-data-bar" role="progressbar" aria-valuenow={78} aria-valuemin={0} aria-valuemax={100}>
                    <div className="sh-data-bar-fill" style={{ width: '78%' }} />
                  </div>
                </div>
              ) : (
                <div className="sh-data-row">
                  <div className="sh-data-line">
                    <span className="sh-data-label"><span aria-hidden="true">⛽</span> {t.status_fuel}</span>
                    <span className="sh-data-value ok">~60%</span>
                  </div>
                  <div className="sh-data-bar" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
                    <div className="sh-data-bar-fill" style={{ width: '60%' }} />
                  </div>
                </div>
              )}
              {/* Row 2: Range (electric) / Fuel (hybrid) / Oil (ICE) */}
              {isElectric ? (
                <div className="sh-data-row">
                  <div className="sh-data-line">
                    <span className="sh-data-label"><span aria-hidden="true">🛣️</span> {t.status_range}</span>
                    <span className="sh-data-value">312 km</span>
                  </div>
                </div>
              ) : isHybrid ? (
                <div className="sh-data-row">
                  <div className="sh-data-line">
                    <span className="sh-data-label"><span aria-hidden="true">⛽</span> {t.status_fuel}</span>
                    <span className="sh-data-value ok">~60%</span>
                  </div>
                  <div className="sh-data-bar" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
                    <div className="sh-data-bar-fill" style={{ width: '60%' }} />
                  </div>
                </div>
              ) : (
                <div className="sh-data-row">
                  <div className="sh-data-line">
                    <span className="sh-data-label"><span aria-hidden="true">🛢️</span> {t.status_oil}</span>
                    <span className="sh-data-value ok">{t.status_oil_value}</span>
                  </div>
                </div>
              )}
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
              onClick={() => navigate('/vehicle-health')}
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
              <span className="sh-insight-line">{insight}</span>
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

        <StellaNav activePage="home" lang={lang} />
      </div>
    </>
  );
};

export default StellaHome;
