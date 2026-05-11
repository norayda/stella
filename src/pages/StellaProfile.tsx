/**
 * @krisspy-file
 * @type page
 * @name "StellaProfile"
 * @title "STELLA — Profil"
 * @description "Profil utilisateur : hero, véhicule, stats, abonnement, carnet d'entretien, lexique auto, menu réglages, connexion compte, footer."
 * @routes ["/profile", "/profil"]
 * @flowName "App"
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplyModes, useModes } from '../lib/stellaModes';
import {
  ArrowLeft,
  Sparkles,
  Car,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Route as RouteIcon,
  Leaf,
  Flame,
  Crown,
  Check,
  Wrench,
  CircleDot,
  BatteryCharging,
  Plus,
  Share2,
  Search,
  Heart,
  CreditCard,
  Target,
  PhoneCall,
  LogOut,
  Bell,
  Settings as SettingsIcon,
  Accessibility as AccessibilityIcon,
  Gauge,
  Home as HomeNavIcon,
  Map as MapIcon,
  Star as StarIcon,
  User,
  Info,
  X,
} from 'lucide-react';

type Lexique = { term: string; def: string };

const LEXIQUE: Lexique[] = [
  { term: 'Plaquettes de frein', def: 'Les pièces qui appuient sur les roues pour freiner. À changer tous les 30 000 km environ.' },
  { term: 'Vidange', def: 'On change l\'huile du moteur pour qu\'il reste en bonne santé.' },
  { term: 'Voyant moteur', def: 'Le cerveau de la voiture détecte un problème — pas toujours urgent mais à vérifier.' },
  { term: 'Courroie de distribution', def: 'Pièce critique qui synchronise le moteur. Si elle casse, le moteur est mort.' },
  { term: 'Alternateur', def: 'Recharge la batterie pendant que tu roules.' },
  { term: 'Disques de frein', def: 'Les grands ronds métalliques sur lesquels les plaquettes appuient pour te ralentir.' },
  { term: 'Filtre à huile', def: 'Garde l\'huile propre dans le moteur. Changé à chaque vidange.' },
  { term: 'Pression des pneus', def: 'La bonne pression = meilleure tenue de route + moins de conso. Vérifie-la une fois par mois.' },
];

const MAINTENANCE = [
  { id: 'm1', icon: '🔧', title: 'Vidange',                 date: '15/01/2026', where: 'Garage Eurorepar',    cost: '85 €',  next: 'Prochaine : 22 450 km' },
  { id: 'm2', icon: '🛞', title: 'Rotation pneus',          date: '10/03/2026', where: 'AutoService',          cost: '45 €',  next: null as string | null },
  { id: 'm3', icon: '🔋', title: 'Vérification batterie',   date: '02/04/2026', where: 'Concessionnaire Jeep', cost: '0 €',   next: null as string | null },
];

const MENU = [
  { id: 'modes',         icon: '✨', label: 'Modes Stella',      route: '/settings/modes',          sub: 'Langue, sombre, éco, voix…' },
  { id: 'favorites',     icon: '💖', label: 'Favoris',          route: '/favorites',               sub: 'Lieux et contacts préférés' },
  { id: 'settings',      icon: '⚙️', label: 'Réglages',         route: '/settings',                sub: 'Confidentialité, données, compte' },
  { id: 'payment',       icon: '💳', label: 'Mode de paiement', route: '/payment',                 sub: 'Carte enregistrée' },
  { id: 'interests',     icon: '🎯', label: 'Centres d\'intérêt', route: '/interests',             sub: 'Personnalise tes recommandations' },
  { id: 'contact',       icon: '📞', label: 'Support Jeep Heart', route: '/contact',             sub: 'Aide et support' },
];

const StellaProfile: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [openLex, setOpenLex] = useState<Record<string, boolean>>({});
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const nickname = useMemo(() => {
    try {
      const stored = (window.sessionStorage.getItem('stella:nickname') || '').trim();
      if (stored) return stored;
    } catch { /* noop */ }
    return 'Marie';
  }, []);

  const plan: 'standard' | 'premium' = 'standard';
  useApplyModes();
  const { modes } = useModes();
  const profileLabel =
    modes.profile === 'new' ? '🔑 Nouvelle conductrice' :
    modes.profile === 'experienced' ? '🏎️ Expérimentée' : '⭐ Standard';

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, []);

  const filteredLex = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    // Default: show only a small refined set (4 most relevant terms)
    if (!q) return LEXIQUE.slice(0, 4);
    return LEXIQUE.filter((l) =>
      l.term.toLowerCase().includes(q) || l.def.toLowerCase().includes(q)
    );
  }, [searchQ]);

  const handleLogout = () => {
    setLogoutOpen(false);
    showToast('Déconnexion en cours…');
    window.setTimeout(() => navigate('/'), 700);
  };

  const handleRecoverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    showToast('Compte retrouvé — tes points sont de retour ✨');
    setEmail(''); setPassword('');
  };

  return (
    <>
      <style>{`
        .sp-root * { box-sizing: border-box; }
        .sp-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .sp-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .sp-blobs::before, .sp-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.45;
        }
        .sp-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .sp-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .sp-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 16px 20px 108px;
          display: flex; flex-direction: column; gap: 16px;
          position: relative; z-index: 1;
        }

        .sp-top { display: flex; align-items: center; justify-content: space-between; }
        .sp-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
          backdrop-filter: blur(8px);
          transition: background 180ms ease;
        }
        .sp-back:hover { background: #FFF; }

        .sp-mode-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 12.5px; font-weight: 800;
          line-height: 1.4;
        }
        .sp-mode-banner.eco {
          background: linear-gradient(135deg, #DFF5F1 0%, #E8F6EC 100%);
          border: 1px solid rgba(23,133,108,0.25);
          color: #0F6B57;
        }
        .sp-mode-banner.nd {
          background: linear-gradient(135deg, #E6F0FF 0%, #D6E7FB 100%);
          border: 1px solid rgba(60,120,220,0.3);
          color: #2447A8;
        }

        /* Hero */
        .sp-hero {
          position: relative;
          border-radius: 22px;
          padding: 20px;
          color: #FFF;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(255,255,255,0.22) 0%, transparent 55%),
            linear-gradient(135deg, #FF7A70 0%, #B85FA8 50%, #6B4E9B 100%);
          box-shadow: 0 20px 40px rgba(107,78,155,0.25), 0 0 0 1px rgba(255,255,255,0.08) inset;
          overflow: hidden;
        }
        .sp-hero::after {
          content: ""; position: absolute;
          width: 200px; height: 200px; top: -80px; right: -50px;
          background: radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%);
          filter: blur(28px); pointer-events: none;
        }
        .sp-hero-row {
          display: flex; align-items: center; gap: 14px;
          position: relative; z-index: 1;
        }
        .sp-avatar {
          flex-shrink: 0;
          width: 72px; height: 72px; border-radius: 50%;
          background: #FFF;
          padding: 3px;
          box-shadow: 0 10px 22px rgba(26,26,46,0.3);
          position: relative;
        }
        .sp-avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          display: flex; align-items: center; justify-content: center;
          color: #FFF; font-size: 28px; font-weight: 900;
        }
        .sp-hero-text {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 4px;
        }
        .sp-hero-name {
          font-size: 20px; font-weight: 900;
          letter-spacing: -0.3px;
        }
        .sp-hero-plan {
          display: inline-flex; align-items: center; gap: 5px;
          align-self: flex-start;
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.6px;
          padding: 4px 10px; border-radius: 50px;
          text-transform: uppercase;
          background: rgba(255,255,255,0.22);
          border: 1px solid rgba(255,255,255,0.35);
        }
        .sp-hero-meta {
          font-size: 11.5px; font-weight: 600;
          color: rgba(255,255,255,0.78);
        }
        .sp-hero-email {
          display: inline-block;
          font-size: 12px; font-weight: 700;
          padding: 4px 10px; border-radius: 50px;
          background: rgba(0,0,0,0.18);
          color: rgba(255,255,255,0.9);
          align-self: flex-start;
          margin-top: 2px;
        }

        /* Section head */
        .sp-sec-head {
          display: flex; align-items: center; gap: 8px;
          padding: 0 2px;
          margin-bottom: -4px;
        }
        .sp-sec-ico {
          width: 28px; height: 28px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .sp-sec-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .sp-sec-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .sp-sec-ico.teal { background: #DFF5F1; color: #17856C; }
        .sp-sec-ico.amber { background: #FDEFD4; color: #B27300; }
        .sp-sec-title {
          font-size: 12px; font-weight: 800; color: #1A1A2E;
          letter-spacing: 0.4px; text-transform: uppercase;
        }

        /* Vehicle card */
        .sp-vehicle {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 8px 20px rgba(26,26,46,0.05);
          cursor: pointer;
          font-family: inherit; text-align: left;
          transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
        }
        .sp-vehicle:hover {
          border-color: rgba(255,122,112,0.35);
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(26,26,46,0.08);
        }
        .sp-vehicle-ico {
          flex-shrink: 0;
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          box-shadow: 0 6px 14px rgba(255,122,112,0.3);
        }
        .sp-vehicle-body {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 2px;
        }
        .sp-vehicle-label {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.8px;
          text-transform: uppercase; color: #FF7A70;
        }
        .sp-vehicle-name {
          font-size: 15px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sp-vehicle-meta {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
        }
        .sp-sublink {
          align-self: center;
          background: transparent; border: none;
          font-family: inherit; font-size: 12.5px; font-weight: 800;
          color: #FF7A70; cursor: pointer;
          text-decoration: underline; text-underline-offset: 3px;
          padding: 4px 8px;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sp-sublink:hover { color: #F26158; }

        /* Stats grid */
        .sp-stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .sp-stat {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px;
          display: flex; flex-direction: column; gap: 2px;
          box-shadow: 0 6px 14px rgba(26,26,46,0.04);
        }
        .sp-stat-ico-row {
          display: flex; align-items: center; gap: 6px;
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.5px;
          text-transform: uppercase; color: #8A7A7A;
        }
        .sp-stat-emoji { font-size: 13px; }
        .sp-stat-value {
          font-size: 20px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.4px;
        }
        .sp-stat-value small {
          font-size: 11px; font-weight: 700; color: #8A7A7A; margin-left: 3px;
        }

        /* Subscription */
        .sp-subs {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .sp-sub-card {
          background: #FFF;
          border: 1.5px solid rgba(26,26,46,0.06);
          border-radius: 18px;
          padding: 14px;
          display: flex; flex-direction: column; gap: 8px;
          box-shadow: 0 8px 18px rgba(26,26,46,0.04);
          position: relative; overflow: hidden;
        }
        .sp-sub-card.premium {
          border-color: #FF7A70;
          background:
            radial-gradient(circle at 100% 0%, rgba(255,122,112,0.12) 0%, transparent 55%),
            #FFF;
          box-shadow: 0 14px 28px rgba(255,122,112,0.2);
        }
        .sp-sub-reco {
          position: absolute; top: 10px; right: 10px;
          font-size: 9px; font-weight: 900; letter-spacing: 0.6px;
          padding: 3px 8px; border-radius: 50px;
          background: #FF7A70; color: #FFF;
          text-transform: uppercase;
          box-shadow: 0 4px 10px rgba(255,122,112,0.35);
        }
        .sp-sub-title {
          font-size: 15px; font-weight: 900;
          letter-spacing: -0.2px;
        }
        .sp-sub-title.premium {
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .sp-sub-features {
          display: flex; flex-direction: column; gap: 4px;
          font-size: 11.5px; font-weight: 600; color: #1A1A2E;
          line-height: 1.45;
        }
        .sp-sub-features span {
          display: inline-flex; align-items: flex-start; gap: 5px;
        }
        .sp-sub-features svg { flex-shrink: 0; color: #17856C; margin-top: 1px; }
        .sp-sub-highlight {
          font-size: 11px; font-weight: 800; color: #FF7A70;
          background: #FFF0EE;
          padding: 5px 10px; border-radius: 10px;
          border: 1px solid rgba(255,122,112,0.25);
          align-self: flex-start;
        }
        .sp-sub-current {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.3px;
          padding: 4px 10px; border-radius: 50px;
          background: #DFF5F1; color: #0F6B57;
          border: 1px solid rgba(23,133,108,0.25);
          align-self: flex-start;
          text-transform: uppercase;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .sp-sub-cta {
          margin-top: auto;
          border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          font-family: inherit; font-size: 12.5px; font-weight: 900;
          padding: 10px 14px; border-radius: 50px;
          box-shadow: 0 8px 18px rgba(255,122,112,0.35);
          transition: background 150ms ease;
        }
        .sp-sub-cta:hover { background: #F26158; }
        .sp-sub-note {
          font-size: 11px; font-weight: 600; color: #8A7A7A;
          line-height: 1.35;
          margin-top: 2px;
          padding: 8px 10px; border-radius: 10px;
          background: #FDF6F0;
          border: 1px dashed rgba(138,122,122,0.25);
        }

        /* Maintenance */
        .sp-maint-card {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px;
          padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 10px 22px rgba(26,26,46,0.05);
        }
        .sp-maint-list {
          display: flex; flex-direction: column; gap: 10px;
          position: relative;
          padding-left: 6px;
        }
        .sp-maint-row {
          display: flex; align-items: flex-start; gap: 10px;
        }
        .sp-maint-dot {
          flex-shrink: 0;
          width: 34px; height: 34px; border-radius: 10px;
          background: #FFE6E3;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .sp-maint-body {
          flex: 1; min-width: 0;
          background: #FDF6F0;
          border: 1px solid rgba(26,26,46,0.05);
          border-radius: 12px;
          padding: 10px 12px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .sp-maint-title {
          font-size: 13.5px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sp-maint-meta {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
        }
        .sp-maint-next {
          font-size: 11px; font-weight: 800; color: #6B4E9B;
          margin-top: 2px;
        }
        .sp-maint-actions {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
          margin-top: 2px;
        }
        .sp-btn {
          border: none; cursor: pointer;
          font-family: inherit; font-size: 12.5px; font-weight: 800;
          padding: 10px 14px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 150ms ease;
        }
        .sp-btn.coral-outline {
          background: #FFF; color: #FF7A70;
          border: 1.5px solid #FF7A70;
        }
        .sp-btn.coral-outline:hover { background: #FFF5F2; }
        .sp-btn.purple-outline {
          background: #FFF; color: #6B4E9B;
          border: 1.5px solid #6B4E9B;
        }
        .sp-btn.purple-outline:hover { background: #EEE7F7; }

        /* Lexique */
        .sp-lex-card {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px;
          padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 10px 22px rgba(26,26,46,0.05);
        }
        .sp-lex-search {
          display: flex; align-items: center; gap: 10px;
          background: #FDF6F0;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 50px;
          padding: 9px 16px;
          transition: border-color 150ms ease, background 150ms ease;
        }
        .sp-lex-search:focus-within {
          border-color: #FF7A70;
          background: #FFF;
          box-shadow: 0 6px 14px rgba(255,122,112,0.12);
        }
        .sp-lex-search-ico { color: #8A7A7A; flex-shrink: 0; }
        .sp-lex-search-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-family: inherit; font-size: 13px; font-weight: 600;
          color: #1A1A2E; min-width: 0;
        }
        .sp-lex-search-input::placeholder { color: #B8ACAC; font-weight: 500; }
        .sp-lex-list {
          display: flex; flex-direction: column; gap: 8px;
          max-height: 280px; overflow-y: auto;
          padding-right: 4px;
        }
        .sp-lex-item {
          background: #FDF6F0;
          border: 1px solid rgba(26,26,46,0.04);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 180ms ease;
        }
        .sp-lex-item.open { border-color: rgba(255,122,112,0.35); }
        .sp-lex-head {
          width: 100%;
          background: transparent; border: none;
          font-family: inherit; text-align: left; cursor: pointer;
          padding: 10px 12px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px;
        }
        .sp-lex-term {
          font-size: 13px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
          flex: 1;
        }
        .sp-lex-chev {
          color: #8A7A7A; flex-shrink: 0;
          transition: transform 220ms ease;
        }
        .sp-lex-item.open .sp-lex-chev {
          transform: rotate(180deg); color: #FF7A70;
        }
        .sp-lex-def-wrap {
          max-height: 0; overflow: hidden;
          transition: max-height 300ms ease;
        }
        .sp-lex-item.open .sp-lex-def-wrap { max-height: 200px; }
        .sp-lex-def {
          display: block;
          padding: 0 12px 12px;
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
          line-height: 1.5;
        }
        .sp-lex-empty {
          font-size: 12px; font-weight: 600; color: #B8ACAC;
          text-align: center; padding: 10px;
        }

        /* Menu list */
        .sp-menu { display: flex; flex-direction: column; gap: 8px; }
        .sp-menu-row {
          display: flex; align-items: center; gap: 12px;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 14px;
          padding: 12px 14px;
          cursor: pointer;
          font-family: inherit; text-align: left;
          box-shadow: 0 4px 12px rgba(26,26,46,0.04);
          transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
        }
        .sp-menu-row:hover {
          border-color: rgba(255,122,112,0.3);
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(26,26,46,0.06);
        }
        .sp-menu-row.danger { border-color: rgba(229,57,53,0.3); }
        .sp-menu-row.danger:hover { border-color: rgba(229,57,53,0.6); }
        .sp-menu-ico {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #FFE6E3 0%, #EEE7F7 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
        }
        .sp-menu-text {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; gap: 1px;
        }
        .sp-menu-label {
          font-size: 13.5px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sp-menu-sub {
          font-size: 11px; font-weight: 600; color: #8A7A7A;
          line-height: 1.3;
        }
        .sp-menu-chev { color: #B8ACAC; transition: transform 150ms ease; }
        .sp-menu-row:hover .sp-menu-chev { transform: translateX(3px); color: #FF7A70; }
        .sp-menu-row.danger .sp-menu-label { color: #C2221B; }

        /* Recovery card */
        .sp-recov {
          background: #FFF;
          border: 1px solid rgba(107,78,155,0.22);
          border-radius: 18px;
          padding: 16px;
          display: flex; flex-direction: column; gap: 10px;
          box-shadow: 0 8px 20px rgba(107,78,155,0.1);
        }
        .sp-recov-title {
          font-size: 14px; font-weight: 900; color: #1A1A2E;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sp-recov-text {
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          line-height: 1.45;
        }
        .sp-recov-input {
          width: 100%;
          background: #FDF6F0;
          border: 1px solid rgba(26,26,46,0.08);
          border-radius: 12px;
          padding: 10px 14px;
          font-family: inherit; font-size: 13px; font-weight: 700;
          color: #1A1A2E; outline: none;
          transition: border-color 150ms ease, background 150ms ease;
        }
        .sp-recov-input:focus {
          border-color: #6B4E9B; background: #FFF;
          box-shadow: 0 0 0 3px rgba(107,78,155,0.1);
        }
        .sp-recov-cta {
          border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          font-family: inherit; font-size: 13px; font-weight: 900;
          padding: 11px 18px; border-radius: 50px;
          box-shadow: 0 8px 18px rgba(255,122,112,0.35);
          transition: background 150ms ease;
        }
        .sp-recov-cta:hover { background: #F26158; }
        .sp-recov-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Footer */
        .sp-footer {
          text-align: center;
          padding: 14px 0 4px;
          font-size: 11.5px; font-weight: 700; color: #8A7A7A;
          line-height: 1.4;
        }
        .sp-footer-v { font-size: 10.5px; color: #B8ACAC; margin-top: 2px; }

        /* Bottom nav (shared) */
        .sp-nav {
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
        .sp-nav-btn {
          border: none; background: transparent;
          font-family: inherit;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 10px 6px; border-radius: 14px;
          font-size: 10.5px; font-weight: 700;
          color: #8A7A7A; cursor: pointer;
          transition: all 200ms ease;
          position: relative;
        }
        .sp-nav-btn:hover { color: #1A1A2E; }
        .sp-nav-btn.active {
          background: linear-gradient(135deg, rgba(255,122,112,0.12) 0%, rgba(107,78,155,0.1) 100%);
          color: #FF7A70;
        }
        .sp-nav-btn.active svg { color: #FF7A70; filter: drop-shadow(0 4px 10px rgba(255,122,112,0.5)); }
        .sp-nav-btn.active::after {
          content: ""; position: absolute; bottom: 4px; left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
          background: #FF7A70; box-shadow: 0 0 8px rgba(255,122,112,0.8);
        }

        /* Dialog overlay */
        .sp-overlay {
          position: fixed; inset: 0;
          background: rgba(26,26,46,0.55);
          backdrop-filter: blur(5px);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 200;
          opacity: 0; pointer-events: none;
          transition: opacity 200ms ease;
        }
        .sp-overlay.open { opacity: 1; pointer-events: auto; }
        .sp-dialog {
          width: 100%; max-width: 420px;
          background: #FFF;
          border-radius: 24px 24px 0 0;
          padding: 10px 20px 24px;
          transform: translateY(100%);
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1);
        }
        .sp-overlay.open .sp-dialog { transform: translateY(0); }
        .sp-dialog-grip {
          width: 40px; height: 4px; border-radius: 2px;
          background: #B8ACAC; margin: 0 auto 14px;
        }
        .sp-dialog-title {
          font-size: 17px; font-weight: 900; color: #1A1A2E;
          margin-bottom: 4px;
        }
        .sp-dialog-sub {
          font-size: 13px; font-weight: 600; color: #8A7A7A;
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .sp-dialog-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .sp-btn.dialog-cancel {
          background: #FDF6F0; color: #1A1A2E;
          border: 1px solid rgba(26,26,46,0.08);
        }
        .sp-btn.dialog-confirm {
          background: linear-gradient(135deg, #E53935 0%, #B91C17 100%);
          color: #FFF;
          box-shadow: 0 8px 18px rgba(229,57,53,0.35);
        }

        /* Toast */
        .sp-toast {
          position: fixed; bottom: 96px; left: 50%;
          transform: translate(-50%, 20px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 20px 50px rgba(26,26,46,0.25);
          z-index: 220; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .sp-toast.show { transform: translate(-50%, 0); opacity: 1; }

        @media (min-width: 640px) {
          .sp-app { padding: 24px 20px 108px; }
        }
      `}</style>

      <div className="sp-root">
        <div className="sp-blobs" aria-hidden="true" />

        <main className="sp-app">
          <div className="sp-top">
            <button
              type="button"
              className="sp-back"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
              Retour
            </button>
          </div>

          {modes.eco && (
            <div className="sp-mode-banner eco">🌿 Mode Éco actif — Stella privilégie les conseils écologiques</div>
          )}
          {modes.newDriver && (
            <div className="sp-mode-banner nd">🔑 Mode Nouvelle Conductrice actif — Stella t'explique tout simplement</div>
          )}

          {/* 1. Profile hero */}
          <section className="sp-hero">
            <div className="sp-hero-row">
              <div className="sp-avatar" aria-hidden="true">
                <div className="sp-avatar-inner">{nickname.charAt(0).toUpperCase()}</div>
              </div>
              <div className="sp-hero-text">
                <span className="sp-hero-name">{nickname}</span>
                <span className="sp-hero-plan">
                  {plan === 'premium' ? '👑 Premium' : '🌱 Standard'}
                </span>
                <span className="sp-hero-meta">Membre depuis avril 2026</span>
                <span className="sp-hero-email">marie.dupont@email.com</span>
              </div>
            </div>
          </section>

          {/* 2. Vehicle card */}
          <button
            type="button"
            className="sp-vehicle"
            onClick={() => showToast('Ma voiture — bientôt disponible')}
          >
            <span className="sp-vehicle-ico" aria-hidden="true">🚗</span>
            <div className="sp-vehicle-body">
              <span className="sp-vehicle-label">Ma voiture</span>
              <span className="sp-vehicle-name">Jeep Avenger Electric</span>
              <span className="sp-vehicle-meta">Noir Carbone · 18 450 km</span>
            </div>
            <ChevronRight size={18} strokeWidth={2.5} style={{ color: '#B8ACAC' }} />
          </button>
          <button
            type="button"
            className="sp-sublink"
            onClick={() => navigate('/maintenance-history')}
          >
            📋 Voir le carnet d'entretien →
          </button>

          {/* Changer de voiture */}
          <button
            type="button"
            className="sp-vehicle"
            onClick={() => navigate('/change-vehicle')}
            style={{ borderColor: 'rgba(107,78,155,0.3)' }}
          >
            <span className="sp-vehicle-ico" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #7B5CAF 0%, #6B4E9B 100%)', fontSize: 20 }}>🔄</span>
            <div className="sp-vehicle-body">
              <span className="sp-vehicle-label" style={{ color: '#6B4E9B' }}>Changer de voiture</span>
              <span className="sp-vehicle-name">Configurer un nouveau véhicule</span>
              <span className="sp-vehicle-meta">💜 Points et historique conservés</span>
            </div>
            <ChevronRight size={18} strokeWidth={2.5} style={{ color: '#B8ACAC' }} />
          </button>

          {/* 3. Stats */}
          <div className="sp-sec-head">
            <span className="sp-sec-ico coral"><Gauge size={14} strokeWidth={2.5} /></span>
            <span className="sp-sec-title">Mes stats</span>
          </div>
          <div className="sp-stats">
            <div className="sp-stat">
              <span className="sp-stat-ico-row"><span className="sp-stat-emoji">🗺️</span> Km totaux</span>
              <span className="sp-stat-value">18 450<small>km</small></span>
            </div>
            <div className="sp-stat">
              <span className="sp-stat-ico-row"><span className="sp-stat-emoji">🌿</span> CO₂ économisé</span>
              <span className="sp-stat-value">324<small>kg</small></span>
            </div>
            <div className="sp-stat">
              <span className="sp-stat-ico-row"><span className="sp-stat-emoji">🛣️</span> Trajets</span>
              <span className="sp-stat-value">128</span>
            </div>
            <div className="sp-stat">
              <span className="sp-stat-ico-row"><span className="sp-stat-emoji">🔥</span> Série</span>
              <span className="sp-stat-value">12<small>jours</small></span>
            </div>
          </div>

          {/* 4. Subscription */}
          <div className="sp-sec-head">
            <span className="sp-sec-ico purple"><Crown size={14} strokeWidth={2.5} /></span>
            <span className="sp-sec-title">Abonnement</span>
          </div>
          <div className="sp-subs">
            <div className="sp-sub-card">
              <span className="sp-sub-title">🌱 Standard</span>
              <div className="sp-sub-features">
                <span><Check size={12} strokeWidth={3} /> Alertes véhicule</span>
                <span><Check size={12} strokeWidth={3} /> Trajets basiques</span>
                <span><Check size={12} strokeWidth={3} /> Points fidélité</span>
              </div>
              {plan === 'standard' && (
                <span className="sp-sub-current">
                  <Check size={11} strokeWidth={3.5} />
                  Offre actuelle
                </span>
              )}
            </div>
            <div className="sp-sub-card premium">
              <span className="sp-sub-reco">Recommandé</span>
              <span className="sp-sub-title premium">👑 Premium</span>
              <div className="sp-sub-features">
                <span><Check size={12} strokeWidth={3} /> Chat IA illimité</span>
                <span><Check size={12} strokeWidth={3} /> Analyse de devis</span>
                <span><Check size={12} strokeWidth={3} /> Trajets avancés</span>
                <span><Check size={12} strokeWidth={3} /> Pack famille (2 profils)</span>
              </div>
              <span className="sp-sub-highlight">1 mois offert puis 9,99 €/mois</span>
              {plan === 'premium' ? (
                <>
                  <span className="sp-sub-current">
                    <Check size={11} strokeWidth={3.5} />
                    Actif
                  </span>
                  <button
                    type="button"
                    className="sp-sublink"
                    style={{ alignSelf: 'flex-start', padding: 0 }}
                    onClick={() => showToast('Gestion de l\'abonnement')}
                  >
                    Gérer mon abonnement →
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="sp-sub-cta"
                  onClick={() => showToast('Essai Premium activé — 1 mois offert 🎉')}
                >
                  Essayer Premium
                </button>
              )}
            </div>
          </div>
          <div className="sp-sub-note">
            👨‍👩‍👧 Pack famille — jusqu'à 2 profils · 14,99 €/mois
          </div>


          {/* 6. Lexique */}
          <div className="sp-sec-head">
            <span className="sp-sec-ico amber"><BookOpen size={14} strokeWidth={2.5} /></span>
            <span className="sp-sec-title">Lexique auto simplifié 📖</span>
          </div>
          <section className="sp-lex-card">
            <div className="sp-lex-search">
              <Search size={15} strokeWidth={2.5} className="sp-lex-search-ico" />
              <input
                type="text"
                className="sp-lex-search-input"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Chercher un terme…"
                aria-label="Chercher un terme"
              />
            </div>
            <div className="sp-lex-list">
              {filteredLex.length === 0 ? (
                <span className="sp-lex-empty">Aucun résultat pour "{searchQ}"</span>
              ) : (
                filteredLex.map((l) => {
                  const open = !!openLex[l.term];
                  return (
                    <div key={l.term} className={`sp-lex-item ${open ? 'open' : ''}`}>
                      <button
                        type="button"
                        className="sp-lex-head"
                        onClick={() => setOpenLex((v) => ({ ...v, [l.term]: !v[l.term] }))}
                        aria-expanded={open}
                      >
                        <span className="sp-lex-term">{l.term}</span>
                        <ChevronDown size={15} strokeWidth={2.5} className="sp-lex-chev" />
                      </button>
                      <div className={`sp-lex-def-wrap ${open ? 'open' : ''}`}>
                        <span className="sp-lex-def">{l.def}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 7. Menu */}
          <div className="sp-sec-head">
            <span className="sp-sec-ico coral"><SettingsIcon size={14} strokeWidth={2.5} /></span>
            <span className="sp-sec-title">Menu</span>
          </div>
          <div className="sp-menu">
            {MENU.map((m) => (
              <button
                key={m.id}
                type="button"
                className="sp-menu-row"
                onClick={() => {
                  if (m.id === 'contact') navigate('/contact');
                  else if (m.id === 'settings') navigate('/settings');
                  else if (m.id === 'modes') navigate('/settings/modes');
                  else if (m.id === 'favorites') navigate('/favorites');
                  else if (m.id === 'payment') navigate('/payment');
                  else if (m.id === 'interests') navigate('/interests');
                  else showToast(`${m.label} — bientôt disponible`);
                }}
              >
                <span className="sp-menu-ico">{m.icon}</span>
                <div className="sp-menu-text">
                  <span className="sp-menu-label">{m.label}</span>
                  <span className="sp-menu-sub">{m.sub}</span>
                </div>
                <ChevronRight size={16} strokeWidth={2.5} className="sp-menu-chev" />
              </button>
            ))}
            <button
              type="button"
              className="sp-menu-row danger"
              onClick={() => setLogoutOpen(true)}
            >
              <span className="sp-menu-ico" style={{ background: '#FFE8E6' }}>🚪</span>
              <div className="sp-menu-text">
                <span className="sp-menu-label">Se déconnecter</span>
                <span className="sp-menu-sub">Te reconnecter plus tard</span>
              </div>
              <ChevronRight size={16} strokeWidth={2.5} className="sp-menu-chev" />
            </button>
          </div>

          {/* Footer */}
          <div className="sp-footer">
            Stella · Ta co-pilote bienveillante 💖
            <div className="sp-footer-v">v1.0.0</div>
          </div>
        </main>

        {/* Logout dialog */}
        <div
          className={`sp-overlay ${logoutOpen ? 'open' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) setLogoutOpen(false); }}
        >
          <div className="sp-dialog" role="dialog" aria-modal="true">
            <div className="sp-dialog-grip" />
            <div className="sp-dialog-title">Se déconnecter ?</div>
            <div className="sp-dialog-sub">
              Tu pourras toujours te reconnecter avec ton email pour retrouver tes points et ton historique.
            </div>
            <div className="sp-dialog-actions">
              <button type="button" className="sp-btn dialog-cancel" onClick={() => setLogoutOpen(false)}>
                Annuler
              </button>
              <button type="button" className="sp-btn dialog-confirm" onClick={handleLogout}>
                <LogOut size={14} strokeWidth={2.8} />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <nav className="sp-nav" aria-label="Navigation principale">
          <button type="button" className="sp-nav-btn" onClick={() => navigate('/home')}>
            <HomeNavIcon size={20} strokeWidth={2.4} />
            <span>Accueil</span>
          </button>
          <button type="button" className="sp-nav-btn" onClick={() => navigate('/trips')}>
            <MapIcon size={20} strokeWidth={2.4} />
            <span>Trajets</span>
          </button>
          <button type="button" className="sp-nav-btn" onClick={() => navigate('/rewards')}>
            <StarIcon size={20} strokeWidth={2.4} />
            <span>Avantages</span>
          </button>
          <button type="button" className="sp-nav-btn active" aria-current="page">
            <User size={20} strokeWidth={2.4} />
            <span>Profil</span>
          </button>
        </nav>

        <div className={`sp-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaProfile;
