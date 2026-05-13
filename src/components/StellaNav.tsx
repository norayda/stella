/**
 * @component StellaNav
 * @description Shared navigation component — bottom bar on mobile/tablet (< 1024px),
 *              left sidebar on desktop (≥ 1024px).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Map, Star, User } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NavPage = 'home' | 'trips' | 'perks' | 'profile';

interface StellaNavProps {
  activePage: NavPage;
  lang?: 'fr' | 'en';
}

// ─── Nav items definition ─────────────────────────────────────────────────────

interface NavItem {
  id: NavPage;
  labelFr: string;
  labelEn: string;
  icon: React.ReactNode;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    labelFr: 'Accueil',
    labelEn: 'Home',
    icon: <Home size={20} strokeWidth={2.4} />,
    route: '/home',
  },
  {
    id: 'trips',
    labelFr: 'Trajets',
    labelEn: 'Trips',
    icon: <Map size={20} strokeWidth={2.4} />,
    route: '/trips',
  },
  {
    id: 'perks',
    labelFr: 'Avantages',
    labelEn: 'Perks',
    icon: <Star size={20} strokeWidth={2.4} />,
    route: '/rewards',
  },
  {
    id: 'profile',
    labelFr: 'Profil',
    labelEn: 'Profile',
    icon: <User size={20} strokeWidth={2.4} />,
    route: '/profile',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const StellaNav: React.FC<StellaNavProps> = ({ activePage, lang = 'fr' }) => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        /* ===== STELLA NAV — shared navigation ===== */

        .stella-nav {
          position: fixed;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 28px);
          max-width: 392px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-radius: 22px;
          box-shadow:
            0 20px 40px rgba(26, 26, 46, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.6) inset;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          z-index: 50;
        }

        @media (min-width: 1024px) {
          .stella-nav {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 220px;
            max-width: 220px;
            border-radius: 0;
            transform: none;
            flex-direction: column;
            display: flex;
            padding: 24px 12px;
            box-shadow: 2px 0 20px rgba(26, 26, 46, 0.08);
            grid-template-columns: none;
            justify-content: flex-start;
            align-items: stretch;
            gap: 4px;
          }

          /* Logo/brand at the top of the sidebar */
          .stella-nav::before {
            content: "STELLA";
            display: block;
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 2px;
            background: linear-gradient(90deg, #FF7A70, #6B4E9B);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            padding: 0 12px 24px;
            text-align: center;
          }
        }

        /* ─── Nav buttons ───────────────────────────────────────────────── */

        .stella-nav-btn {
          border: none;
          background: transparent;
          font-family: inherit;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 10px 6px;
          border-radius: 14px;
          font-size: 10.5px;
          font-weight: 700;
          color: #8A7A7A;
          cursor: pointer;
          transition: all 200ms ease;
          position: relative;
        }

        .stella-nav-btn svg {
          transition: transform 200ms ease;
        }

        .stella-nav-btn:hover {
          color: #1A1A2E;
        }

        .stella-nav-btn.active {
          background: linear-gradient(
            135deg,
            rgba(255, 122, 112, 0.12) 0%,
            rgba(107, 78, 155, 0.1) 100%
          );
          color: #FF7A70;
        }

        .stella-nav-btn.active svg {
          color: #FF7A70;
          filter: drop-shadow(0 4px 10px rgba(255, 122, 112, 0.5));
          transform: translateY(-1px);
        }

        .stella-nav-btn.active::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #FF7A70;
          box-shadow: 0 0 8px rgba(255, 122, 112, 0.8);
        }

        @media (min-width: 1024px) {
          .stella-nav-btn {
            flex-direction: row;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
            text-align: left;
            justify-content: flex-start;
          }

          .stella-nav-btn.active::after {
            display: none;
          }

          .stella-nav-btn svg {
            transform: none !important;
          }

          .stella-nav-btn.active svg {
            transform: none !important;
          }
        }
      `}</style>

      <nav className="stella-nav" aria-label="Navigation principale">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`stella-nav-btn${activePage === item.id ? ' active' : ''}`}
            onClick={() => navigate(item.route)}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            {item.icon}
            <span>{lang === 'fr' ? item.labelFr : item.labelEn}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default StellaNav;
