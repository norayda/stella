/**
 * @krisspy-file
 * @type page
 * @name "StellaPayment"
 * @title "STELLA — Paiement"
 * @description "Mode de paiement : plan actuel, carte enregistrée, bascule Premium, pack famille, historique."
 * @routes ["/payment"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Crown, ChevronRight, Check, Users } from 'lucide-react';

const StellaPayment: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [upgraded, setUpgraded] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, []);

  return (
    <>
      <style>{`
        .py-root * { box-sizing: border-box; }
        .py-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .py-app { width: 100%; max-width: 420px; min-height: 100vh; padding: 16px 20px 40px; display: flex; flex-direction: column; gap: 14px; }
        .py-back { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7); color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06); }
        .py-mark { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px; background: rgba(255,122,112,0.1); border-radius: 50px; }
        .py-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .py-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        .py-plan {
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF; border-radius: 20px; padding: 20px;
          box-shadow: 0 14px 28px rgba(107,78,155,0.3);
          display: flex; flex-direction: column; gap: 8px;
          position: relative; overflow: hidden;
        }
        .py-plan::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 100% 0%, rgba(255,255,255,0.2) 0%, transparent 55%);
          pointer-events: none;
        }
        .py-plan-label {
          font-size: 10.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
          color: rgba(255,255,255,0.8);
        }
        .py-plan-title {
          font-size: 24px; font-weight: 900; letter-spacing: -0.4px;
        }
        .py-plan-price {
          font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.92);
        }

        .py-card {
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px; padding: 16px;
          display: flex; flex-direction: column; gap: 10px;
          box-shadow: 0 8px 18px rgba(26,26,46,0.05);
        }
        .py-card-head { display: flex; align-items: center; gap: 10px; }
        .py-card-ico {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg, #1A1A2E 0%, #3C2B66 100%);
          color: #FFF; display: flex; align-items: center; justify-content: center;
        }
        .py-card-body { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .py-card-title { font-size: 14px; font-weight: 900; color: #1A1A2E; }
        .py-card-sub { font-size: 12px; font-weight: 600; color: #8A7A7A; }
        .py-link {
          background: transparent; border: none;
          font-family: inherit; font-size: 12.5px; font-weight: 800;
          color: #FF7A70; cursor: pointer; align-self: flex-start;
          text-decoration: underline; text-underline-offset: 3px;
        }

        .py-cta {
          border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          font-family: inherit; font-size: 14px; font-weight: 900;
          padding: 13px 18px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 10px 22px rgba(255,122,112,0.4);
        }
        .py-cta.disabled { background: #DFF5F1; color: #0F6B57; box-shadow: none; cursor: default; }

        .py-features {
          display: flex; flex-direction: column; gap: 5px;
          font-size: 12px; font-weight: 700; color: #1A1A2E;
        }
        .py-features span { display: inline-flex; align-items: flex-start; gap: 6px; }
        .py-features svg { color: #17856C; margin-top: 1px; flex-shrink: 0; }

        .py-fam {
          background: #FFF; border: 1px solid rgba(107,78,155,0.25);
          border-radius: 16px; padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .py-fam-cta {
          align-self: flex-start;
          border: 1.5px solid #6B4E9B;
          background: #FFF; color: #6B4E9B;
          padding: 8px 14px; border-radius: 50px;
          font-family: inherit; font-size: 12.5px; font-weight: 800;
          cursor: pointer;
        }

        .py-hist { display: flex; flex-direction: column; gap: 0; }
        .py-hist-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(26,26,46,0.06);
        }
        .py-hist-row:last-child { border-bottom: none; }
        .py-hist-label { display: flex; flex-direction: column; gap: 1px; }
        .py-hist-date { font-size: 13px; font-weight: 800; color: #1A1A2E; }
        .py-hist-sub { font-size: 11.5px; font-weight: 600; color: #8A7A7A; }
        .py-hist-amt { font-size: 14px; font-weight: 900; color: #1A1A2E; }

        .py-sec-label { font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: #8A7A7A; padding: 0 4px; }

        .py-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 20px);
          background: #FF7A70; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 20px 50px rgba(255,122,112,0.4);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .py-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="py-root">
        <main className="py-app">
          <button type="button" className="py-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>
          <header>
            <span className="py-mark"><CreditCard size={12} strokeWidth={2.5} /> Paiement</span>
            <h1 className="py-h1">Mode de paiement</h1>
            <p className="py-sub">Ton plan, ta carte, ton historique.</p>
          </header>

          <section className="py-plan">
            <span className="py-plan-label">Ton plan actuel</span>
            <span className="py-plan-title">{upgraded ? '👑 Premium' : '🌱 Standard'}</span>
            <span className="py-plan-price">{upgraded ? '9,99 € / mois · 1 mois offert' : 'Gratuit'}</span>
          </section>

          <span className="py-sec-label">Moyen de paiement</span>
          <section className="py-card">
            <div className="py-card-head">
              <span className="py-card-ico"><CreditCard size={18} strokeWidth={2.5} /></span>
              <div className="py-card-body">
                <span className="py-card-title">Visa •••• 4242</span>
                <span className="py-card-sub">Expire 12/27</span>
              </div>
              <button type="button" className="py-link" onClick={() => showToast('Modification — bientôt')}>Modifier</button>
            </div>
          </section>

          {!upgraded ? (
            <section className="py-card" style={{ borderColor: '#FF7A70' }}>
              <div className="py-card-head">
                <span className="py-card-ico" style={{ background: 'linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%)' }}>
                  <Crown size={18} strokeWidth={2.5} />
                </span>
                <div className="py-card-body">
                  <span className="py-card-title">Passer à Premium</span>
                  <span className="py-card-sub">1 mois offert puis 9,99 €/mois</span>
                </div>
              </div>
              <div className="py-features">
                <span><Check size={12} strokeWidth={3} /> Chat IA illimité</span>
                <span><Check size={12} strokeWidth={3} /> Analyse de devis auto</span>
                <span><Check size={12} strokeWidth={3} /> Trajets optimisés avancés</span>
                <span><Check size={12} strokeWidth={3} /> Pack famille disponible</span>
              </div>
              <button
                type="button"
                className="py-cta"
                onClick={() => { setUpgraded(true); showToast('🎉 Bienvenue dans Premium — 1 mois offert !'); }}
              >
                <Crown size={14} strokeWidth={2.8} />
                Passer à Premium
              </button>
            </section>
          ) : (
            <section className="py-card">
              <div className="py-card-head">
                <span className="py-card-ico" style={{ background: '#DFF5F1', color: '#0F6B57' }}>
                  <Crown size={18} strokeWidth={2.5} />
                </span>
                <div className="py-card-body">
                  <span className="py-card-title">Abonnement Premium actif</span>
                  <span className="py-card-sub">Prochain prélèvement : 10 juin 2026 · 9,99 €</span>
                </div>
              </div>
              <button type="button" className="py-link" onClick={() => showToast('Gestion — bientôt')}>Gérer mon abonnement →</button>
            </section>
          )}

          <section className="py-fam">
            <div className="py-card-head">
              <span className="py-card-ico" style={{ background: '#EEE7F7', color: '#6B4E9B' }}>
                <Users size={18} strokeWidth={2.5} />
              </span>
              <div className="py-card-body">
                <span className="py-card-title">Pack famille</span>
                <span className="py-card-sub">Jusqu'à 2 profils · 14,99 €/mois</span>
              </div>
            </div>
            <button type="button" className="py-fam-cta" onClick={() => showToast('Invitation envoyée 👨‍👩‍👧')}>
              + Ajouter un profil
            </button>
          </section>

        </main>
        <div className={`py-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaPayment;
