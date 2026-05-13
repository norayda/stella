/**
 * @krisspy-file
 * @type page
 * @name "StellaRewards"
 * @title "STELLA — Avantages"
 * @description "Écran Avantages / STELLA Points : solde, tier, progression vers la prochaine récompense, sources de points, récompenses disponibles, partenaires, actions rapides."
 * @routes ["/rewards", "/avantages"]
 * @flowName "App"
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StellaNav from '../components/StellaNav';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  ChevronRight,
  Gauge,
  BatteryCharging,
  Route as RouteIcon,
  Handshake,
  Gift,
  Coffee,
  ParkingCircle,
  Wrench,
  Plug,
  Lightbulb,
  ShieldCheck,
  History,
  Map as MapIcon,
  Home as HomeNavIcon,
  Star as StarIcon,
  User,
  TrendingUp,
  Factory,
} from 'lucide-react';

type SourceDetail = { text: string; pts: string };
type Source = { id: string; label: string; hint: string; icon: React.ReactNode; tone: 'coral' | 'purple' | 'teal' | 'amber'; details: SourceDetail[] };
type Reward = { id: string; icon: string; title: string; sub: string; cost: number; tone: 'coral' | 'purple' | 'teal' | 'amber' };
type Partner = { id: string; name: string; kind: string; bonus: string; icon: React.ReactNode; tone: 'coral' | 'purple' | 'teal' | 'amber' };

const SOURCES: Source[] = [
  {
    id: 'drive', label: 'Conduite intelligente', hint: 'Conduite éco + anticipation',
    icon: <Gauge size={18} strokeWidth={2.5} />, tone: 'coral',
    details: [
      { text: 'Anticipation au freinage',                          pts: '+5 pts par trajet' },
      { text: 'Vitesse régulière sur autoroute',                   pts: '+10 pts par trajet' },
      { text: 'Zéro freinage brusque détecté',                     pts: '+15 pts par trajet' },
      { text: 'Score de conduite > 80% sur le mois',               pts: '+100 pts bonus mensuel' },
    ],
  },
  {
    id: 'charge', label: 'Recharge EV', hint: 'Heures creuses ou partenaires',
    icon: <BatteryCharging size={18} strokeWidth={2.5} />, tone: 'teal',
    details: [
      { text: 'Recharge entre 22h et 6h (heures creuses)',                         pts: '+20 pts par recharge' },
      { text: 'Recharge chez un partenaire STELLA (IONITY, Belib\', TotalEnergies)', pts: '+80 pts par session' },
      { text: 'Recharge complète avant un long trajet',                            pts: '+30 pts' },
      { text: '5 recharges partenaires dans le mois',                              pts: '+150 pts bonus' },
    ],
  },
  {
    id: 'route', label: 'Trajets optimisés', hint: 'Itinéraires STELLA',
    icon: <RouteIcon size={18} strokeWidth={2.5} />, tone: 'purple',
    details: [
      { text: 'Utiliser un itinéraire Stella recommandé',  pts: '+10 pts par trajet' },
      { text: '3 trajets optimisés dans la semaine',       pts: '+50 pts bonus' },
    ],
  },
  {
    id: 'partners', label: 'Services partenaires', hint: 'Maintenance, café, parking',
    icon: <Handshake size={18} strokeWidth={2.5} />, tone: 'amber',
    details: [
      { text: 'Entretien dans un garage partenaire Eurorepar',          pts: '+200 pts' },
      { text: 'Choisir une pièce SUSTAINera (rénovée)',                 pts: '+150 pts' },
      { text: 'Pause café chez un partenaire Stella sur un trajet',     pts: '+50 pts' },
      { text: 'Réservation hôtel partenaire via Stella',                pts: '+100 pts' },
      { text: 'Parking partenaire Indigo réservé via Stella',           pts: '+40 pts' },
    ],
  },
];

const REWARDS: Reward[] = [
  { id: 'charge10', icon: '⚡', title: 'Recharge -10%', sub: 'Réseau partenaires', cost: 500, tone: 'teal' },
  { id: 'park2h', icon: '🅿️', title: '2h de parking', sub: 'Indigo · Q-Park', cost: 800, tone: 'purple' },
  { id: 'coffee', icon: '☕', title: 'Café offert', sub: 'Columbus · Starbucks', cost: 300, tone: 'coral' },
  { id: 'maint', icon: '🔧', title: 'Révision -15%', sub: 'Ateliers certifiés', cost: 1500, tone: 'amber' },
];

const PARTNERS: Partner[] = [
  { id: 'ionity',   name: 'IONITY',         kind: 'Recharge ultra-rapide', bonus: 'x2 points', icon: <Plug size={16} strokeWidth={2.5} />, tone: 'teal' },
  { id: 'indigo',   name: 'Indigo',         kind: 'Parking partenaire',    bonus: '+40 pts',    icon: <ParkingCircle size={16} strokeWidth={2.5} />, tone: 'purple' },
  { id: 'columbus', name: 'Columbus Café',  kind: 'Café / travel',         bonus: 'Café offert', icon: <Coffee size={16} strokeWidth={2.5} />, tone: 'coral' },
  { id: 'jeep',     name: 'Jeep Certifié',  kind: 'Maintenance',           bonus: '-15%',        icon: <Factory size={16} strokeWidth={2.5} />, tone: 'amber' },
];

type ActionPanel =
  | null
  | { kind: 'redeem' }
  | { kind: 'partners' }
  | { kind: 'history' };

type HistoryEntry = { icon: string; text: string; when: string };

const EXPANDED_PARTNERS: { id: string; icon: string; name: string; desc: string; bonus: string }[] = [
  { id: 'ionity',   icon: '⚡', name: 'IONITY',       desc: 'Recharge ultra-rapide partenaire',  bonus: '+80 pts' },
  { id: 'indigo',   icon: '🅿️', name: 'Indigo',       desc: 'Parking partenaire · réservation app', bonus: '+40 pts' },
  { id: 'starbucks', icon: '☕', name: 'Starbucks',    desc: 'Café pendant la recharge',            bonus: '+25 pts' },
  { id: 'novotel',  icon: '🏨', name: 'Novotel',      desc: 'Hébergement + recharge nuit',         bonus: '+150 pts' },
  { id: 'eurorepar',icon: '🔧', name: 'Eurorepar',    desc: 'Entretien réseau certifié',           bonus: '+100 pts' },
];

const HISTORY: HistoryEntry[] = [
  { icon: '✅', text: '+80 pts — Recharge IONITY',    when: 'il y a 2 jours' },
  { icon: '✅', text: '+50 pts — Itinéraire éco',     when: 'il y a 5 jours' },
  { icon: '✅', text: '+40 pts — Parking Indigo',     when: 'il y a 1 semaine' },
];

const StellaRewards: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [panel, setPanel] = useState<ActionPanel>(null);
  const [redeemMode, setRedeemMode] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const rewardsRef = useRef<HTMLDivElement>(null);

  const toggleSource = (id: string) =>
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));

  const nickname = useMemo(() => {
    try {
      const stored = (window.sessionStorage.getItem('stella:nickname') || '').trim();
      if (stored) return stored;
    } catch { /* noop */ }
    return 'Marie';
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, []);

  const scrollToRewards = () => {
    setRedeemMode(false);
    setPanel(null);
    window.setTimeout(() => {
      rewardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const handleRedeem = () => {
    setRedeemMode(true);
    setPanel({ kind: 'redeem' });
    window.setTimeout(() => {
      rewardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePartners = () => {
    setRedeemMode(false);
    setPanel((p) => (p && p.kind === 'partners' ? null : { kind: 'partners' }));
  };

  const handleHistory = () => {
    setRedeemMode(false);
    setPanel((p) => (p && p.kind === 'history' ? null : { kind: 'history' }));
  };

  const handleClaimReward = () => {
    showToast('🎉 Récompense activée ! Présente ton app chez le partenaire.');
  };

  // Points & tier state
  const balance = 3240;
  const nextTier = 'Eco Driver Elite';
  const nextTierAt = 4000;
  const progress = Math.min(1, balance / nextTierAt);
  const toNextTier = Math.max(0, nextTierAt - balance);
  const monthSaved = 42;
  const currentTier = 'Eco Driver Pro';

  // Animated progress: 0 -> target after mount
  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedProgress(progress));
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  // Insight pick — rotate between two hints
  const nextReward = REWARDS[0];
  const smartInsight = toNextTier > 0
    ? `Plus que ${toNextTier} SP pour débloquer ${nextReward.title}.`
    : 'Félicitations — tu viens de débloquer un nouveau palier ✨';

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
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.45;
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
          padding: 16px 20px 108px;
          display: flex; flex-direction: column; gap: 18px;
          position: relative; z-index: 1;
        }

        .sr-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sr-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
          transition: background 180ms ease, transform 150ms ease;
          backdrop-filter: blur(8px);
        }
        .sr-back:hover { background: #FFF; }
        .sr-back:active { transform: scale(0.97); }

        .sr-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .sr-h1 {
          font-size: 24px; font-weight: 900; line-height: 1.2;
          letter-spacing: -0.4px; color: #1A1A2E;
          margin: 6px 0 4px;
        }
        .sr-sub {
          font-size: 14px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }

        /* Hero card — premium dark gradient */
        .sr-hero {
          position: relative;
          border-radius: 20px;
          padding: 20px;
          color: #FFF;
          background:
            radial-gradient(ellipse at 100% 0%, rgba(255,122,112,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 0% 100%, rgba(107,78,155,0.4) 0%, transparent 55%),
            linear-gradient(160deg, #2A2147 0%, #1A1A2E 100%);
          box-shadow: 0 20px 40px rgba(26,26,46,0.28), 0 0 0 1px rgba(255,255,255,0.05) inset;
          overflow: hidden;
        }
        .sr-hero::before {
          content: ""; position: absolute;
          width: 180px; height: 180px;
          top: -50px; right: -40px;
          background: radial-gradient(circle, rgba(255,122,112,0.35) 0%, transparent 70%);
          filter: blur(26px);
          pointer-events: none;
          animation: sr-glow 4s ease-in-out infinite;
        }
        @keyframes sr-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .sr-hero-top {
          display: flex; align-items: center; justify-content: space-between;
          position: relative; z-index: 1;
        }
        .sr-hero-tier {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10.5px; font-weight: 800; letter-spacing: 1.2px;
          text-transform: uppercase;
          padding: 5px 11px; border-radius: 50px;
          background: linear-gradient(135deg, #FFE6A3 0%, #FFB670 100%);
          color: #8A5A00;
          box-shadow: 0 6px 14px rgba(245,165,36,0.3);
        }
        .sr-hero-greet {
          font-size: 11.5px; font-weight: 700;
          color: rgba(255,255,255,0.65);
        }
        .sr-hero-balance-wrap {
          position: relative; z-index: 1;
          margin-top: 16px;
          display: flex; align-items: baseline; gap: 6px;
        }
        .sr-hero-balance {
          font-size: 40px; font-weight: 900;
          letter-spacing: -1px;
          color: #FFF;
          font-variant-numeric: tabular-nums;
        }
        .sr-hero-unit {
          font-size: 14px; font-weight: 800; letter-spacing: 0.8px;
          color: #FFE0A3;
          text-transform: uppercase;
        }
        .sr-hero-saving {
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,0.85);
          margin-top: 4px;
          display: inline-flex; align-items: center; gap: 6px;
          position: relative; z-index: 1;
        }
        .sr-hero-saving span { color: #7EE3CB; }

        .sr-hero-progress {
          margin-top: 16px;
          position: relative; z-index: 1;
        }
        .sr-hero-progress-row {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.75);
          margin-bottom: 6px;
          letter-spacing: 0.3px;
        }
        .sr-hero-progress-row strong {
          color: #FFE0A3; font-weight: 900;
        }
        .sr-hero-bar {
          height: 6px; border-radius: 50px;
          background: rgba(255,255,255,0.1);
          overflow: hidden;
          position: relative;
        }
        .sr-hero-bar-fill {
          height: 100%; border-radius: 50px;
          background: linear-gradient(90deg, #FFE6A3 0%, #FF7A70 55%, #C8A6F5 100%);
          box-shadow: 0 0 12px rgba(255,122,112,0.5);
          transition: width 900ms cubic-bezier(0.22,1,0.36,1);
        }
        .sr-hero-next {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.6px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          margin-top: 6px;
        }
        .sr-hero-next span { color: #FFE0A3; font-weight: 900; }

        .sr-hero-cta {
          margin-top: 16px;
          width: 100%;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.1);
          color: #FFF;
          padding: 12px 18px; border-radius: 50px;
          font-family: inherit; font-size: 13.5px; font-weight: 800;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer;
          transition: background 180ms ease, transform 150ms ease;
          backdrop-filter: blur(6px);
          position: relative; z-index: 1;
        }
        .sr-hero-cta:hover { background: rgba(255,255,255,0.18); }
        .sr-hero-cta:active { transform: scale(0.99); }
        .sr-hero-cta svg { transition: transform 200ms ease; }
        .sr-hero-cta:hover svg { transform: translateX(3px); }

        /* Section headings */
        .sr-sec-head {
          display: flex; align-items: center; gap: 8px;
          padding: 0 2px;
          margin-bottom: -6px;
        }
        .sr-sec-ico {
          width: 28px; height: 28px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .sr-sec-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .sr-sec-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .sr-sec-ico.teal { background: #DFF5F1; color: #17856C; }
        .sr-sec-ico.amber { background: #FDEFD4; color: #B27300; }
        .sr-sec-title {
          font-size: 12px; font-weight: 800; color: #1A1A2E;
          letter-spacing: 0.4px; text-transform: uppercase;
        }

        /* Sources grid */
        .sr-sources {
          display: flex; flex-direction: column; gap: 10px;
        }
        .sr-source {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px;
          display: flex; flex-direction: column; gap: 0;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .sr-source.open {
          border-color: rgba(255,122,112,0.35);
          box-shadow: 0 10px 22px rgba(255,122,112,0.1);
        }
        .sr-source-head {
          display: flex; align-items: center; gap: 12px;
        }
        .sr-source-text {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 1px;
        }
        .sr-source-toggle {
          flex-shrink: 0;
          border: none; background: transparent;
          font-family: inherit; font-size: 11.5px; font-weight: 800;
          letter-spacing: 0.2px;
          color: #FF7A70; cursor: pointer;
          padding: 6px 8px;
          white-space: nowrap;
          transition: color 150ms ease;
        }
        .sr-source-toggle:hover { color: #F26158; }
        .sr-source-ico {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .sr-source-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .sr-source-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .sr-source-ico.teal { background: #DFF5F1; color: #17856C; }
        .sr-source-ico.amber { background: #FDEFD4; color: #B27300; }

        .sr-source-details-wrap {
          max-height: 0; overflow: hidden;
          transition: max-height 320ms cubic-bezier(0.22,1,0.36,1);
        }
        .sr-source-details-wrap.open { max-height: 440px; }
        .sr-source-details {
          margin-top: 10px;
          background: #FFF0EE;
          border: 1px solid rgba(255,122,112,0.2);
          border-radius: 12px;
          padding: 12px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .sr-source-detail-row {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 12.5px; font-weight: 600; color: #1A1A2E;
          line-height: 1.4;
        }
        .sr-source-check {
          flex-shrink: 0;
          width: 16px; height: 16px; border-radius: 50%;
          background: #FF7A70; color: #FFF;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 900;
          margin-top: 1px;
          box-shadow: 0 2px 6px rgba(255,122,112,0.35);
        }
        .sr-source-detail-text { flex: 1; min-width: 0; }
        .sr-source-detail-pts {
          flex-shrink: 0;
          font-size: 11.5px; font-weight: 900;
          color: #FF7A70;
          white-space: nowrap;
        }
        .sr-source-label {
          font-size: 13px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sr-source-hint {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
          line-height: 1.35;
        }

        /* Redeem banner */
        .sr-redeem-banner {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, #F4EFFC 0%, #EEE7F7 100%);
          border: 1px solid rgba(107,78,155,0.25);
          color: #4E3A7A;
          font-size: 13px; font-weight: 700;
          line-height: 1.4;
          box-shadow: 0 8px 18px rgba(107,78,155,0.1);
          animation: sr-fadein 220ms ease;
        }
        .sr-redeem-banner b { color: #6B4E9B; font-weight: 900; }
        .sr-redeem-ico {
          flex-shrink: 0;
          width: 32px; height: 32px; border-radius: 10px;
          background: rgba(107,78,155,0.18);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        @keyframes sr-fadein {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sr-reward-claim {
          margin-top: 4px;
          align-self: flex-start;
          display: inline-flex; align-items: center;
          font-size: 10.5px; font-weight: 900; letter-spacing: 0.3px;
          padding: 4px 10px; border-radius: 50px;
          background: #FF7A70; color: #FFF;
          text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(255,122,112,0.35);
        }
        .sr-rewards.highlight .sr-reward {
          border-color: rgba(255,122,112,0.5);
          box-shadow: 0 10px 22px rgba(255,122,112,0.22);
        }

        /* Expanded panel (partners list / history) */
        .sr-panel {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 10px 24px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 12px;
          animation: sr-fadein 240ms ease;
        }
        .sr-panel-head { display: flex; flex-direction: column; gap: 2px; }
        .sr-panel-title {
          font-size: 14px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sr-panel-sub {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
        }
        .sr-panel-list { display: flex; flex-direction: column; gap: 8px; }
        .sr-panel-row {
          display: flex; align-items: center; gap: 10px;
          background: #FDF6F0;
          border-radius: 12px;
          padding: 10px 12px;
          border: 1px solid rgba(26,26,46,0.04);
        }
        .sr-panel-emoji {
          flex-shrink: 0;
          width: 34px; height: 34px; border-radius: 10px;
          background: #FFF;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
          box-shadow: 0 2px 6px rgba(26,26,46,0.05);
        }
        .sr-panel-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
        .sr-panel-name { font-size: 13.5px; font-weight: 900; color: #1A1A2E; }
        .sr-panel-desc { font-size: 11.5px; font-weight: 600; color: #8A7A7A; line-height: 1.35; }
        .sr-panel-bonus {
          flex-shrink: 0;
          font-size: 11px; font-weight: 900;
          padding: 5px 11px; border-radius: 50px;
          background: linear-gradient(135deg, #FF8F85 0%, #FF7A70 100%);
          color: #FFF;
          box-shadow: 0 4px 10px rgba(255,122,112,0.35);
          white-space: nowrap;
        }

        /* Timeline */
        .sr-timeline { display: flex; flex-direction: column; gap: 10px; position: relative; padding-left: 4px; }
        .sr-timeline-row {
          display: flex; align-items: flex-start; gap: 10px;
          position: relative;
        }
        .sr-timeline-dot {
          flex-shrink: 0;
          width: 10px; height: 10px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          box-shadow: 0 0 0 3px #FFF, 0 0 0 4px rgba(107,78,155,0.18);
          margin-top: 4px;
        }
        .sr-timeline-body {
          flex: 1;
          background: #FDF6F0;
          border-radius: 12px;
          padding: 10px 12px;
          border: 1px solid rgba(26,26,46,0.04);
          display: flex; flex-direction: column; gap: 2px;
        }
        .sr-timeline-text {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 800; color: #1A1A2E;
        }
        .sr-timeline-ico { font-size: 13px; }
        .sr-timeline-when {
          font-size: 11px; font-weight: 700; color: #8A7A7A;
          letter-spacing: 0.2px;
        }

        /* Active state on quick action chip */
        .sr-action.active {
          background: #FFF5F2; color: #FF7A70;
          border-color: #FF7A70;
          box-shadow: 0 6px 14px rgba(255,122,112,0.18);
        }

        /* Rewards horizontal carousel */
        .sr-rewards {
          display: flex; flex-direction: row; gap: 10px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          margin: 0 -20px;
          padding: 6px 20px;
          scroll-snap-type: x mandatory;
        }
        .sr-rewards::-webkit-scrollbar { display: none; }
        .sr-reward {
          flex-shrink: 0;
          width: 180px;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px;
          display: flex; flex-direction: column; gap: 8px;
          box-shadow: 0 8px 18px rgba(26,26,46,0.05);
          scroll-snap-align: start;
          transition: transform 150ms ease, box-shadow 150ms ease;
          cursor: pointer;
          font-family: inherit; text-align: left;
        }
        .sr-reward:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(26,26,46,0.08);
        }
        .sr-reward-ico {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }
        .sr-reward-ico.coral { background: #FFE6E3; }
        .sr-reward-ico.purple { background: #EEE7F7; }
        .sr-reward-ico.teal { background: #DFF5F1; }
        .sr-reward-ico.amber { background: #FDEFD4; }
        .sr-reward-title {
          font-size: 13.5px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
          line-height: 1.25;
        }
        .sr-reward-sub {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
          line-height: 1.35;
        }
        .sr-reward-cost {
          margin-top: auto;
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 10px; border-radius: 50px;
          background: linear-gradient(135deg, rgba(255,122,112,0.12) 0%, rgba(107,78,155,0.12) 100%);
          color: #FF7A70;
          font-size: 11.5px; font-weight: 900;
          border: 1px solid rgba(255,122,112,0.2);
          align-self: flex-start;
        }

        /* Insight */
        .sr-insight {
          display: flex; align-items: center; gap: 12px;
          background: linear-gradient(90deg, rgba(255,122,112,0.12) 0%, rgba(107,78,155,0.1) 100%);
          border: 1px solid rgba(255,122,112,0.25);
          border-radius: 14px;
          padding: 12px 14px;
          box-shadow: 0 8px 18px rgba(255,122,112,0.08);
        }
        .sr-insight-ico {
          flex-shrink: 0;
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #FFE6A3 0%, #FFB670 100%);
          color: #8A5A00;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 14px rgba(245,165,36,0.3);
        }
        .sr-insight-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .sr-insight-tag {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.8px;
          text-transform: uppercase; color: #FF7A70;
        }
        .sr-insight-line {
          font-size: 13px; font-weight: 700; color: #1A1A2E;
          line-height: 1.35;
        }

        /* Partners list */
        .sr-partner-list { display: flex; flex-direction: column; gap: 8px; }
        .sr-partner {
          display: flex; align-items: center; gap: 10px;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 14px;
          padding: 10px 14px;
          box-shadow: 0 4px 12px rgba(26,26,46,0.04);
        }
        .sr-partner-ico {
          flex-shrink: 0;
          width: 34px; height: 34px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .sr-partner-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .sr-partner-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .sr-partner-ico.teal { background: #DFF5F1; color: #17856C; }
        .sr-partner-ico.amber { background: #FDEFD4; color: #B27300; }
        .sr-partner-body {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 1px;
        }
        .sr-partner-name {
          font-size: 13.5px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sr-partner-kind {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
        }
        .sr-partner-bonus {
          font-size: 11px; font-weight: 900;
          padding: 4px 10px; border-radius: 50px;
          background: rgba(255,122,112,0.1);
          color: #FF7A70;
          border: 1px solid rgba(255,122,112,0.2);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Quick actions */
        .sr-actions {
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .sr-action {
          font-family: inherit; border: none; cursor: pointer;
          background: #FFF; color: #1A1A2E;
          border: 1.5px solid #EADFD6;
          font-size: 12.5px; font-weight: 700;
          padding: 9px 14px; border-radius: 50px;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 180ms ease;
          box-shadow: 0 2px 6px rgba(26,26,46,0.03);
        }
        .sr-action:hover {
          background: #FFF5F2; color: #FF7A70;
          border-color: #FF7A70;
          transform: translateY(-1px);
          box-shadow: 0 6px 14px rgba(255,122,112,0.18);
        }
        .sr-action.primary {
          background: #FF7A70;
          color: #FFF;
          border-color: #FF7A70;
          box-shadow: 0 6px 14px rgba(255,122,112,0.35);
        }
        .sr-action.primary:hover { background: #F26158; }

        /* Toast */
        .sr-toast {
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
        .sr-toast.show { transform: translate(-50%, 0); opacity: 1; }

        @media (min-width: 640px) {
          .sr-app { padding: 24px 20px 108px; }
          .sr-h1 { font-size: 26px; }
          .sr-hero-balance { font-size: 44px; }
        }
        @media (min-width: 1024px) {
          .sr-root { padding-left: 220px; justify-content: flex-start; }
          .sr-app { max-width: 640px; padding-bottom: 32px; }
        }
      `}</style>

      <div className="sr-root">
        <div className="sr-blobs" aria-hidden="true" />

        <main className="sr-app">
          <div className="sr-top">
            <button
              type="button"
              className="sr-back"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
              Retour
            </button>
          </div>

          <header>
            <span className="sr-mark">
              <Sparkles size={12} strokeWidth={2.5} /> STELLA Points
            </span>
            <h1 className="sr-h1">Avantages</h1>
            <p className="sr-sub">Conduis malin. Profite de vrais avantages.</p>
          </header>

          {/* Hero points card */}
          <section className="sr-hero">
            <div className="sr-hero-top">
              <span className="sr-hero-tier">
                <Trophy size={12} strokeWidth={3} />
                {currentTier}
              </span>
              <span className="sr-hero-greet">Salut {nickname}</span>
            </div>
            <div className="sr-hero-balance-wrap">
              <span className="sr-hero-balance">{balance.toLocaleString('fr-FR')}</span>
              <span className="sr-hero-unit">SP</span>
            </div>
            <span className="sr-hero-saving">
              <TrendingUp size={13} strokeWidth={2.8} style={{ color: '#7EE3CB' }} />
              Tu as économisé <span>{monthSaved} €</span> ce mois-ci
            </span>
            <div className="sr-hero-progress">
              <div className="sr-hero-progress-row">
                <span>{currentTier}</span>
                <span><strong>{Math.round(progress * 100)}%</strong></span>
              </div>
              <div
                className="sr-hero-bar"
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="sr-hero-bar-fill" style={{ width: `${animatedProgress * 100}%` }} />
              </div>
              <div className="sr-hero-next">
                Plus que <span>{toNextTier.toLocaleString('fr-FR')} SP</span> pour atteindre {nextTier}
              </div>
            </div>
            <button
              type="button"
              className="sr-hero-cta"
              onClick={scrollToRewards}
            >
              Voir mes récompenses
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </section>

          {/* How to earn */}
          <div className="sr-sec-head">
            <span className="sr-sec-ico coral"><Gift size={14} strokeWidth={2.5} /></span>
            <span className="sr-sec-title">Comment gagner des points</span>
          </div>
          <div className="sr-sources">
            {SOURCES.map((s) => {
              const open = !!expandedSources[s.id];
              return (
                <div key={s.id} className={`sr-source ${open ? 'open' : ''}`}>
                  <div className="sr-source-head">
                    <span className={`sr-source-ico ${s.tone}`}>{s.icon}</span>
                    <div className="sr-source-text">
                      <span className="sr-source-label">{s.label}</span>
                      <span className="sr-source-hint">{s.hint}</span>
                    </div>
                    <button
                      type="button"
                      className="sr-source-toggle"
                      onClick={() => toggleSource(s.id)}
                      aria-expanded={open}
                      aria-controls={`src-${s.id}`}
                    >
                      {open ? 'Masquer ‹' : 'Voir le détail ›'}
                    </button>
                  </div>
                  <div
                    id={`src-${s.id}`}
                    className={`sr-source-details-wrap ${open ? 'open' : ''}`}
                    aria-hidden={!open}
                  >
                    <div className="sr-source-details">
                      {s.details.map((d, i) => (
                        <div key={i} className="sr-source-detail-row">
                          <span className="sr-source-check">✓</span>
                          <span className="sr-source-detail-text">{d.text}</span>
                          <span className="sr-source-detail-pts">{d.pts}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rewards */}
          <div className="sr-sec-head" ref={rewardsRef} style={{ scrollMarginTop: 16 }}>
            <span className="sr-sec-ico purple"><Gift size={14} strokeWidth={2.5} /></span>
            <span className="sr-sec-title">Quelques récompenses pour toi ✨</span>
          </div>
          {panel && panel.kind === 'redeem' && (
            <div className="sr-redeem-banner" role="status">
              <span className="sr-redeem-ico">💜</span>
              <span className="sr-redeem-text">
                Tu as <b>{balance.toLocaleString('fr-FR')} SP</b> disponibles. Choisis une récompense ci-dessous pour l'activer.
              </span>
            </div>
          )}
          <div className={`sr-rewards ${redeemMode ? 'highlight' : ''}`} role="group" aria-label="Récompenses">
            {REWARDS.map((r) => (
              <button
                key={r.id}
                type="button"
                className="sr-reward"
                onClick={handleClaimReward}
              >
                <span className={`sr-reward-ico ${r.tone}`}>{r.icon}</span>
                <span className="sr-reward-title">{r.title}</span>
                <span className="sr-reward-sub">{r.sub}</span>
                <span className="sr-reward-cost">
                  <Sparkles size={11} strokeWidth={3} />
                  {r.cost.toLocaleString('fr-FR')} SP
                </span>
                {redeemMode && (
                  <span className="sr-reward-claim">Réclamer</span>
                )}
              </button>
            ))}
          </div>

          {/* Smart insight */}
          <div className="sr-insight" role="note">
            <span className="sr-insight-ico"><Lightbulb size={16} strokeWidth={2.5} /></span>
            <div className="sr-insight-text">
              <span className="sr-insight-tag">💡 Pour toi</span>
              <span className="sr-insight-line">{smartInsight}</span>
            </div>
          </div>

          {/* Partners */}
          <div className="sr-sec-head">
            <span className="sr-sec-ico teal"><ShieldCheck size={14} strokeWidth={2.5} /></span>
            <span className="sr-sec-title">Partenaires STELLA</span>
          </div>
          <div className="sr-partner-list">
            {PARTNERS.map((p) => (
              <div key={p.id} className="sr-partner">
                <span className={`sr-partner-ico ${p.tone}`}>{p.icon}</span>
                <div className="sr-partner-body">
                  <span className="sr-partner-name">{p.name}</span>
                  <span className="sr-partner-kind">{p.kind}</span>
                </div>
                <span className="sr-partner-bonus">{p.bonus}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="sr-sec-head">
            <span className="sr-sec-ico coral"><Sparkles size={14} strokeWidth={2.5} /></span>
            <span className="sr-sec-title">Actions rapides</span>
          </div>
          <div className="sr-actions">
            <button
              type="button"
              className="sr-action primary"
              onClick={handleRedeem}
            >
              <Gift size={13} strokeWidth={2.8} />
              Échanger mes points
            </button>
            <button
              type="button"
              className={`sr-action ${panel && panel.kind === 'partners' ? 'active' : ''}`}
              onClick={handlePartners}
            >
              <Handshake size={13} strokeWidth={2.5} />
              Voir les partenaires
            </button>
            <button
              type="button"
              className={`sr-action ${panel && panel.kind === 'history' ? 'active' : ''}`}
              onClick={handleHistory}
            >
              <History size={13} strokeWidth={2.5} />
              Historique
            </button>
            <button
              type="button"
              className="sr-action"
              onClick={() => navigate('/copilot')}
            >
              <Sparkles size={13} strokeWidth={2.5} />
              Demander à STELLA
            </button>
          </div>

          {panel && panel.kind === 'partners' && (
            <section className="sr-panel" aria-label="Partenaires étendus">
              <div className="sr-panel-head">
                <span className="sr-panel-title">🤝 Écosystème partenaires</span>
                <span className="sr-panel-sub">Gagne des points chez chacun</span>
              </div>
              <div className="sr-panel-list">
                {EXPANDED_PARTNERS.map((p) => (
                  <div key={p.id} className="sr-panel-row">
                    <span className="sr-panel-emoji">{p.icon}</span>
                    <div className="sr-panel-body">
                      <span className="sr-panel-name">{p.name}</span>
                      <span className="sr-panel-desc">{p.desc}</span>
                    </div>
                    <span className="sr-panel-bonus">{p.bonus}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {panel && panel.kind === 'history' && (
            <section className="sr-panel" aria-label="Historique des points">
              <div className="sr-panel-head">
                <span className="sr-panel-title">📜 Historique des points</span>
                <span className="sr-panel-sub">Tes 3 dernières activités</span>
              </div>
              <div className="sr-timeline">
                {HISTORY.map((h, i) => (
                  <div key={i} className="sr-timeline-row">
                    <span className="sr-timeline-dot" />
                    <div className="sr-timeline-body">
                      <span className="sr-timeline-text">
                        <span className="sr-timeline-ico">{h.icon}</span>
                        {h.text}
                      </span>
                      <span className="sr-timeline-when">{h.when}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <StellaNav activePage="perks" />

        <div className={`sr-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaRewards;
