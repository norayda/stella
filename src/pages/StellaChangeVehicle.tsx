/**
 * @krisspy-file
 * @type page
 * @name "StellaChangeVehicle"
 * @title "STELLA — Changer de voiture"
 * @description "Mettre à jour les informations du véhicule tout en conservant points et historique."
 * @routes ["/change-vehicle"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Car, Check } from 'lucide-react';
import { useModes } from '../lib/stellaModes';

type Fuel = 'petrol' | 'diesel' | 'hybrid' | 'electric';
type Level = 'new' | 'standard' | 'experienced';

const StellaChangeVehicle: React.FC = () => {
  const navigate = useNavigate();
  const { modes, set } = useModes();
  const [year, setYear] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [km, setKm] = useState('');
  const [fuel, setFuel] = useState<Fuel>('electric');
  const [lastService, setLastService] = useState('');
  const [level, setLevel] = useState<Level>(modes.profile);
  const [a11y, setA11y] = useState(modes.accessibility);
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    set('profile', level);
    set('accessibility', a11y);
    try {
      window.sessionStorage.setItem('stella:vehicle', JSON.stringify({ year, brand, model, km, fuel, lastService }));
    } catch { /* noop */ }
    showToast('✅ Nouveau véhicule enregistré !');
    window.setTimeout(() => navigate(-1), 900);
  };

  return (
    <>
      <style>{`
        .cv-root * { box-sizing: border-box; }
        .cv-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .cv-app { width: 100%; max-width: 420px; min-height: 100vh; padding: 16px 20px 40px; display: flex; flex-direction: column; gap: 14px; }
        .cv-back { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7); color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06); }
        .cv-mark { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          color: #6B4E9B; padding: 5px 12px; background: rgba(107,78,155,0.1); border-radius: 50px; }
        .cv-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .cv-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        .cv-card {
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: 0 10px 24px rgba(26,26,46,0.05);
        }
        .cv-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cv-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .cv-label { font-size: 10.5px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #6B4E9B; padding-left: 2px; }
        .cv-input, .cv-select {
          width: 100%;
          border: 1px solid rgba(26,26,46,0.08);
          background: #FDF6F0; border-radius: 12px;
          padding: 10px 14px;
          font-family: inherit; font-size: 13.5px; font-weight: 800;
          color: #1A1A2E; outline: none;
        }
        .cv-input:focus, .cv-select:focus { border-color: #FF7A70; background: #FFF; box-shadow: 0 0 0 3px rgba(255,122,112,0.15); }

        .cv-fuel { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .cv-fuel-btn {
          border: 1.5px solid rgba(26,26,46,0.08);
          background: #FFF; color: #1A1A2E;
          padding: 10px; border-radius: 12px;
          font-family: inherit; font-size: 12.5px; font-weight: 800; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 180ms ease;
        }
        .cv-fuel-btn.active { background: #FFF5F2; border-color: #FF7A70; color: #FF7A70; }

        .cv-levels { display: flex; gap: 6px; flex-wrap: wrap; }
        .cv-level {
          flex: 1; min-width: 0;
          border: 1.5px solid rgba(26,26,46,0.08); background: #FFF;
          border-radius: 12px; padding: 10px 8px;
          font-family: inherit; font-size: 11.5px; font-weight: 800; cursor: pointer;
          transition: all 180ms ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 4px;
          text-align: center; line-height: 1.2;
        }
        .cv-level.active { background: #FFF5F2; border-color: #FF7A70; color: #FF7A70; }

        .cv-a11y {
          display: flex; align-items: center; gap: 12px;
          background: #FDF6F0; border: 1px dashed rgba(138,122,122,0.3);
          border-radius: 12px; padding: 10px 12px;
        }
        .cv-a11y-label { flex: 1; font-size: 12.5px; font-weight: 700; color: #1A1A2E; }
        .cv-switch {
          flex-shrink: 0; width: 40px; height: 22px; border-radius: 50px;
          background: #EADFD6; position: relative; cursor: pointer; border: none;
          transition: background 200ms ease;
        }
        .cv-switch.on { background: #6B4E9B; }
        .cv-switch::after {
          content: ""; position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px; border-radius: 50%; background: #FFF;
          box-shadow: 0 2px 4px rgba(26,26,46,0.2);
          transition: left 200ms ease;
        }
        .cv-switch.on::after { left: 21px; }

        .cv-cta {
          border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          font-family: inherit; font-size: 14px; font-weight: 900;
          padding: 13px 18px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 10px 22px rgba(255,122,112,0.4);
        }
        .cv-cta:hover { background: #F26158; }
        .cv-note {
          font-size: 12px; font-weight: 700; color: #6B4E9B;
          text-align: center;
        }

        .cv-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 20px);
          background: #FF7A70; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 20px 50px rgba(255,122,112,0.4);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .cv-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="cv-root">
        <main className="cv-app">
          <button type="button" className="cv-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>
          <header>
            <span className="cv-mark"><Car size={12} strokeWidth={2.5} /> Nouveau véhicule</span>
            <h1 className="cv-h1">Configure ta nouvelle voiture</h1>
            <p className="cv-sub">Renseigne les infos de ton nouveau véhicule. Tes points et ton historique sont conservés 💜</p>
          </header>

          <form className="cv-card" onSubmit={submit}>
            <div className="cv-field">
              <label className="cv-label">Année</label>
              <select className="cv-select" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Sélectionne une année</option>
                {['2026','2025','2024','2023','2022','2021','2021 ou avant'].map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="cv-row">
              <div className="cv-field">
                <label className="cv-label">Marque</label>
                <input className="cv-input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex : Jeep" />
              </div>
              <div className="cv-field">
                <label className="cv-label">Modèle</label>
                <input className="cv-input" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex : Avenger" />
              </div>
            </div>
            <div className="cv-field">
              <label className="cv-label">Kilométrage actuel</label>
              <input className="cv-input" inputMode="numeric" value={km} onChange={(e) => setKm(e.target.value)} placeholder="Ex : 12000" />
            </div>
            <div className="cv-field">
              <label className="cv-label">Type de carburant</label>
              <div className="cv-fuel">
                {([['petrol','🔴 Essence'],['diesel','🔴 Diesel'],['hybrid','🔋 Hybride'],['electric','⚡ Électrique']] as [Fuel, string][]).map(([id, l]) => (
                  <button key={id} type="button" className={`cv-fuel-btn ${fuel === id ? 'active' : ''}`} onClick={() => setFuel(id)}>{l}</button>
                ))}
              </div>
            </div>
            <div className="cv-field">
              <label className="cv-label">Dernière révision (optionnel)</label>
              <input className="cv-input" type="date" value={lastService} onChange={(e) => setLastService(e.target.value)} />
            </div>
            <div className="cv-field">
              <label className="cv-label">Mon niveau</label>
              <div className="cv-levels">
                <button type="button" className={`cv-level ${level === 'new' ? 'active' : ''}`} onClick={() => setLevel('new')}>🔑 Nouvelle conductrice</button>
                <button type="button" className={`cv-level ${level === 'standard' ? 'active' : ''}`} onClick={() => setLevel('standard')}>⭐ Standard</button>
                <button type="button" className={`cv-level ${level === 'experienced' ? 'active' : ''}`} onClick={() => setLevel('experienced')}>🏎️ Expérimentée</button>
              </div>
            </div>
            <div className="cv-a11y">
              <span className="cv-a11y-label">♿ Besoins d'accessibilité</span>
              <button type="button" className={`cv-switch ${a11y ? 'on' : ''}`} onClick={() => setA11y((v) => !v)} aria-pressed={a11y} />
            </div>

            <button type="submit" className="cv-cta">
              → Enregistrer mon nouveau véhicule
            </button>
            <span className="cv-note">💜 Tes points et ton historique sont conservés</span>
          </form>
        </main>
        <div className={`cv-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaChangeVehicle;
