/**
 * @krisspy-file
 * @type page
 * @name "StellaVehicle"
 * @title "STELLA — Mon véhicule"
 * @description "Configuration rapide du véhicule (marque, modèle, motorisation, année, kilométrage) pour personnaliser les insights STELLA."
 * @routes ["/vehicle"]
 * @flowName "Onboarding"
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Sparkles,
  Car,
  Settings2,
  Zap,
  Calendar,
  Gauge,
  ChevronDown,
  Check,
  ArrowRight,
  HelpCircle,
  Loader2,
  Wrench,
} from 'lucide-react';

type Lang = 'fr' | 'en';

const I18N = {
  fr: {
    step: 'Véhicule',
    mark: 'Mon véhicule',
    title: 'Ajoute ton véhicule.',
    sub: 'STELLA adapte ses conseils à ta voiture.',
    placeholder_brand: 'Sélectionne une marque',
    placeholder_model: 'Sélectionne un modèle',
    placeholder_model_disabled: 'Choisis d\'abord une marque',
    placeholder_fuel: 'Sélectionne une motorisation',
    placeholder_year: 'Sélectionne l\'année',
    placeholder_mileage: 'Sélectionne un kilométrage',
    lbl_brand: 'Marque',
    lbl_model: 'Modèle',
    lbl_fuel: 'Motorisation',
    lbl_year: 'Année du véhicule',
    lbl_mileage: 'Kilométrage',
    lbl_service: 'Date de la dernière révision',
    placeholder_service: 'Sélectionne une période',
    services: [
      { id: 'lt6', label: 'Moins de 6 mois' },
      { id: '6to12', label: 'Entre 6 et 12 mois' },
      { id: 'gt12', label: 'Plus de 12 mois' },
      { id: 'unknown', label: 'Je ne sais pas' },
    ],
    not_sure: 'Je ne connais pas certains de ces détails',
    not_sure_hint: 'On passera en mode onboarding simplifié.',
    cta: 'Continuer',
    cta_sub: 'Finaliser ma configuration',
    configuring: (brand: string, model: string) => `Configuration de ta ${brand} ${model}…`,
    fuels: [
      { id: 'electric', label: 'Électrique' },
      { id: 'hybrid', label: 'Hybride' },
      { id: 'petrol', label: 'Essence' },
      { id: 'diesel', label: 'Diesel' },
    ],
    years: [
      { id: '2025', label: '2025' },
      { id: '2024', label: '2024' },
      { id: '2023', label: '2023' },
      { id: '2022', label: '2022' },
      { id: '2021-', label: '2021 ou avant' },
    ],
    mileages: [
      { id: '0-10', label: '0 – 10 000 km' },
      { id: '10-30', label: '10 000 – 30 000 km' },
      { id: '30-60', label: '30 000 – 60 000 km' },
      { id: '60-100', label: '60 000 – 100 000 km' },
      { id: '100+', label: '100 000+ km' },
    ],
    toast_done: 'Véhicule enregistré ✨',
    toast_simplified: 'Mode simplifié activé — on continue !',
  },
  en: {
    step: 'Vehicle',
    mark: 'My vehicle',
    title: 'Add your vehicle.',
    sub: 'STELLA adapts its insights to your car.',
    placeholder_brand: 'Select a brand',
    placeholder_model: 'Select a model',
    placeholder_model_disabled: 'Pick a brand first',
    placeholder_fuel: 'Select a fuel type',
    placeholder_year: 'Select a year',
    placeholder_mileage: 'Select a mileage range',
    lbl_brand: 'Brand',
    lbl_model: 'Model',
    lbl_fuel: 'Powertrain',
    lbl_year: 'Vehicle year',
    lbl_mileage: 'Mileage',
    lbl_service: 'Date of last service',
    placeholder_service: 'Select a period',
    services: [
      { id: 'lt6', label: 'Less than 6 months' },
      { id: '6to12', label: 'Between 6 and 12 months' },
      { id: 'gt12', label: 'More than 12 months' },
      { id: 'unknown', label: 'I don\'t know' },
    ],
    not_sure: 'I don\'t know some of these details',
    not_sure_hint: 'We\'ll switch to simplified onboarding.',
    cta: 'Continue',
    cta_sub: 'Finalize my setup',
    configuring: (brand: string, model: string) => `Configuring your ${brand} ${model}…`,
    fuels: [
      { id: 'electric', label: 'Electric' },
      { id: 'hybrid', label: 'Hybrid' },
      { id: 'petrol', label: 'Petrol' },
      { id: 'diesel', label: 'Diesel' },
    ],
    years: [
      { id: '2025', label: '2025' },
      { id: '2024', label: '2024' },
      { id: '2023', label: '2023' },
      { id: '2022', label: '2022' },
      { id: '2021-', label: '2021 or earlier' },
    ],
    mileages: [
      { id: '0-10', label: '0 – 10,000 km' },
      { id: '10-30', label: '10,000 – 30,000 km' },
      { id: '30-60', label: '30,000 – 60,000 km' },
      { id: '60-100', label: '60,000 – 100,000 km' },
      { id: '100+', label: '100,000+ km' },
    ],
    toast_done: 'Vehicle saved ✨',
    toast_simplified: 'Simplified mode enabled — continuing!',
  },
} as const;

const BRANDS = [
  { id: 'jeep', label: 'Jeep' },
  { id: 'peugeot', label: 'Peugeot' },
  { id: 'citroen', label: 'Citroën' },
  { id: 'fiat', label: 'Fiat' },
  { id: 'opel', label: 'Opel' },
  { id: 'other', label: { fr: 'Autre', en: 'Other' } },
];

const MODELS: Record<string, { id: string; label: string }[]> = {
  jeep: [
    { id: 'avenger', label: 'Avenger' },
    { id: 'renegade', label: 'Renegade' },
    { id: 'compass', label: 'Compass' },
    { id: 'wrangler', label: 'Wrangler' },
    { id: 'cherokee', label: 'Cherokee' },
  ],
  peugeot: [
    { id: '208', label: '208' },
    { id: '308', label: '308' },
    { id: '2008', label: '2008' },
    { id: '3008', label: '3008' },
    { id: '5008', label: '5008' },
  ],
  citroen: [
    { id: 'c3', label: 'C3' },
    { id: 'c4', label: 'C4' },
    { id: 'c5-aircross', label: 'C5 Aircross' },
    { id: 'berlingo', label: 'Berlingo' },
  ],
  fiat: [
    { id: '500', label: '500' },
    { id: 'panda', label: 'Panda' },
    { id: 'tipo', label: 'Tipo' },
    { id: '500x', label: '500X' },
  ],
  opel: [
    { id: 'corsa', label: 'Corsa' },
    { id: 'astra', label: 'Astra' },
    { id: 'mokka', label: 'Mokka' },
    { id: 'grandland', label: 'Grandland' },
  ],
  other: [],
};

type DropdownProps = {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string | null;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
};

const Dropdown: React.FC<DropdownProps> = ({
  id,
  label,
  icon,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  disabledPlaceholder,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const shownPlaceholder = disabled && disabledPlaceholder ? disabledPlaceholder : placeholder;

  return (
    <div className="sv-field" ref={ref}>
      <label className="sv-label" htmlFor={id}>{label}</label>
      <div className={`sv-dd ${open ? 'open' : ''} ${disabled ? 'disabled' : ''} ${selected ? 'filled' : ''}`}>
        <button
          id={id}
          type="button"
          className="sv-dd-trigger"
          onClick={() => !disabled && setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          <span className="sv-dd-icon" aria-hidden="true">{icon}</span>
          <span className={`sv-dd-value ${!selected ? 'placeholder' : ''}`}>
            {selected ? selected.label : shownPlaceholder}
          </span>
          <ChevronDown size={18} strokeWidth={2.5} className="sv-dd-chevron" />
        </button>
        {open && !disabled && (
          <div className="sv-dd-menu" role="listbox">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={opt.id === value}
                className={`sv-dd-opt ${opt.id === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {opt.id === value && <Check size={16} strokeWidth={3} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StellaVehicle: React.FC = () => {
  const [lang, setLang] = useState<Lang>('fr');
  const [brand, setBrand] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [fuel, setFuel] = useState<string | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [mileage, setMileage] = useState<string | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [notSure, setNotSure] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const configTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);

  const t = I18N[lang];

  const brandOptions = BRANDS.map((b) => ({
    id: b.id,
    label: typeof b.label === 'string' ? b.label : b.label[lang],
  }));
  const modelOptions = brand ? MODELS[brand] || [] : [];

  const brandLabel = brandOptions.find((b) => b.id === brand)?.label ?? '';
  const modelLabel = modelOptions.find((m) => m.id === model)?.label ?? '';

  const handleBrand = (id: string) => {
    setBrand(id);
    if (id !== brand) setModel(null);
  };

  const handleModel = (id: string) => {
    setModel(id);
    setConfiguring(true);
    if (configTimer.current) window.clearTimeout(configTimer.current);
    configTimer.current = window.setTimeout(() => setConfiguring(false), 1400);
  };

  useEffect(() => {
    return () => {
      if (configTimer.current) window.clearTimeout(configTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const isValid = notSure
    ? !!brand
    : !!brand && !!model && !!fuel && !!year && !!mileage && !!service;

  const filled =
    (brand ? 1 : 0) + (model ? 1 : 0) + (fuel ? 1 : 0) + (year ? 1 : 0) + (mileage ? 1 : 0) + (service ? 1 : 0);
  const progress = notSure ? 100 : Math.round((filled / 6) * 100);

  const handleSubmit = () => {
    if (!isValid) return;
    showToast(notSure ? t.toast_simplified : t.toast_done);
  };

  return (
    <>
      <style>{`
        .sv-root * { box-sizing: border-box; }
        .sv-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .sv-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .sv-blobs::before, .sv-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
        }
        .sv-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .sv-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .sv-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 24px 140px;
          display: flex; flex-direction: column; gap: 24px;
          position: relative; z-index: 1;
        }
        .sv-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sv-progress-wrap { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .sv-step {
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: #8A7A7A;
        }
        .sv-bar { height: 4px; background: rgba(107,78,155,0.12); border-radius: 4px; overflow: hidden; }
        .sv-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          border-radius: 4px;
          transition: width 400ms cubic-bezier(0.22,1,0.36,1);
        }
        .sv-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .sv-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
          transition: all 200ms ease;
        }
        .sv-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 3px 10px rgba(255,122,112,0.3);
        }
        .sv-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .sv-h1 {
          font-size: 26px; font-weight: 800; line-height: 1.2;
          letter-spacing: -0.4px; color: #1A1A2E;
          margin: 4px 0 6px;
        }
        .sv-sub {
          font-size: 14.5px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }
        .sv-card {
          background: #FFF;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(26,26,46,0.06);
          display: flex; flex-direction: column; gap: 14px;
        }

        .sv-field { display: flex; flex-direction: column; gap: 6px; }
        .sv-label {
          font-size: 12px; font-weight: 700;
          color: #6B4E9B;
          letter-spacing: 0.2px;
          padding-left: 4px;
        }
        .sv-dd { position: relative; }
        .sv-dd-trigger {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          background: #FDF6F0;
          border: 1.5px solid transparent;
          border-radius: 14px;
          padding: 12px 14px;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .sv-dd.filled .sv-dd-trigger {
          background: #FFF5F2;
          border-color: rgba(255,122,112,0.25);
        }
        .sv-dd-trigger:hover:not(:disabled) { border-color: #FFB5A7; }
        .sv-dd.open .sv-dd-trigger {
          border-color: #FF7A70;
          box-shadow: 0 6px 20px rgba(255,122,112,0.18);
          background: #FFF;
        }
        .sv-dd-trigger:disabled { opacity: 0.55; cursor: not-allowed; }
        .sv-dd-icon {
          flex-shrink: 0;
          width: 30px; height: 30px; border-radius: 9px;
          background: #FFE6E3; color: #FF7A70;
          display: flex; align-items: center; justify-content: center;
          transition: background 200ms ease, color 200ms ease;
        }
        .sv-dd.filled .sv-dd-icon {
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
        }
        .sv-dd-value {
          flex: 1;
          font-size: 14.5px; font-weight: 700; color: #1A1A2E;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .sv-dd-value.placeholder { font-weight: 500; color: #B8ACAC; }
        .sv-dd-chevron {
          flex-shrink: 0; color: #8A7A7A;
          transition: transform 250ms ease;
        }
        .sv-dd.open .sv-dd-chevron { transform: rotate(180deg); color: #FF7A70; }

        .sv-dd-menu {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #FFF; border-radius: 14px;
          box-shadow: 0 20px 50px rgba(26,26,46,0.18);
          padding: 6px; z-index: 20;
          max-height: 240px; overflow-y: auto;
          animation: sv-fadein 180ms ease;
        }
        @keyframes sv-fadein {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sv-dd-opt {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 10px 14px;
          border: none; background: transparent;
          font-family: inherit; font-size: 14px; font-weight: 600;
          color: #1A1A2E; cursor: pointer; border-radius: 10px;
          text-align: left;
          transition: background 150ms ease, color 150ms ease;
        }
        .sv-dd-opt:hover { background: #FFF5F2; color: #FF7A70; }
        .sv-dd-opt.selected { background: #FFE6E3; color: #FF7A70; }
        .sv-dd-opt.selected svg { color: #FF7A70; }

        .sv-configuring {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: linear-gradient(90deg, rgba(255,122,112,0.08) 0%, rgba(107,78,155,0.08) 100%);
          font-size: 13px; font-weight: 700;
          color: #6B4E9B;
          opacity: 0; transform: translateY(-4px);
          transition: opacity 250ms ease, transform 250ms ease;
          max-height: 0; overflow: hidden;
          margin-top: -8px;
        }
        .sv-configuring.show {
          opacity: 1; transform: translateY(0);
          max-height: 60px;
          margin-top: 0;
        }
        .sv-spinner { animation: sv-spin 900ms linear infinite; color: #FF7A70; }
        @keyframes sv-spin { to { transform: rotate(360deg); } }

        .sv-notsure {
          display: flex; align-items: flex-start; gap: 12px;
          background: #FFF;
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 6px 18px rgba(26,26,46,0.04);
          cursor: pointer;
          font-family: inherit; text-align: left;
          border: 1.5px solid transparent;
          transition: all 180ms ease;
        }
        .sv-notsure:hover { border-color: #EADFD6; }
        .sv-notsure.active {
          background: #FFF5F2;
          border-color: #FF7A70;
          box-shadow: 0 8px 22px rgba(255,122,112,0.2);
        }
        .sv-notsure-check {
          flex-shrink: 0;
          width: 22px; height: 22px; border-radius: 6px;
          border: 1.5px solid #DCCFC5;
          display: flex; align-items: center; justify-content: center;
          color: transparent;
          transition: all 180ms ease;
          margin-top: 1px;
        }
        .sv-notsure.active .sv-notsure-check {
          background: #FF7A70; border-color: #FF7A70; color: #FFF;
        }
        .sv-notsure-text { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .sv-notsure-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 13.5px; font-weight: 700; color: #1A1A2E;
        }
        .sv-notsure-hint {
          font-size: 12px; font-weight: 500; color: #8A7A7A;
          line-height: 1.4;
        }

        .sv-sticky {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 420px;
          padding: 16px 24px 20px;
          background: linear-gradient(to top, rgba(253,246,240,1) 55%, rgba(253,246,240,0));
          z-index: 50;
        }
        .sv-cta {
          font-family: inherit; border: none; cursor: pointer; width: 100%;
          padding: 14px 20px; border-radius: 50px;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          background: #FF7A70; color: #FFF;
          box-shadow: 0 10px 26px rgba(255,122,112,0.45);
          transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease, opacity 200ms ease;
        }
        .sv-cta:hover:not(:disabled) { background: #F26158; }
        .sv-cta:active:not(:disabled) { transform: scale(0.985); }
        .sv-cta:disabled {
          opacity: 0.45; cursor: not-allowed;
          box-shadow: 0 4px 10px rgba(255,122,112,0.2);
        }
        .sv-cta-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 16px; font-weight: 800;
        }
        .sv-cta-sub { font-size: 12px; font-weight: 500; opacity: 0.9; }
        .sv-cta-arrow { display: inline-flex; transition: transform 250ms ease; }
        .sv-cta:hover:not(:disabled) .sv-cta-arrow { transform: translateX(3px); }

        .sv-toast {
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
        .sv-toast.show { transform: translate(-50%, 0); opacity: 1; }

        @media (min-width: 640px) {
          .sv-app { padding: 32px 24px 140px; }
          .sv-h1 { font-size: 28px; }
        }
      `}</style>

      <div className="sv-root">
        <div className="sv-blobs" aria-hidden="true" />

        <main className="sv-app">
          <div className="sv-top">
            <div className="sv-progress-wrap">
              <span className="sv-step">{t.step}</span>
              <div className="sv-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="sv-bar-fill" style={{ width: `${Math.max(progress, 6)}%` }} />
              </div>
            </div>
            <div className="sv-lang" role="tablist">
              <button
                type="button"
                className={`sv-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >
                FR
              </button>
              <button
                type="button"
                className={`sv-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >
                EN
              </button>
            </div>
          </div>

          <header>
            <span className="sv-mark">
              <Sparkles size={12} strokeWidth={2.5} /> {t.mark}
            </span>
            <h1 className="sv-h1">{t.title}</h1>
            <p className="sv-sub">{t.sub}</p>
          </header>

          <div className="sv-card">
            <Dropdown
              id="sv-brand"
              label={t.lbl_brand}
              icon={<Car size={16} strokeWidth={2.5} />}
              value={brand}
              onChange={handleBrand}
              options={brandOptions}
              placeholder={t.placeholder_brand}
            />
            <Dropdown
              id="sv-model"
              label={t.lbl_model}
              icon={<Settings2 size={16} strokeWidth={2.5} />}
              value={model}
              onChange={handleModel}
              options={modelOptions}
              placeholder={t.placeholder_model}
              disabled={!brand || modelOptions.length === 0}
              disabledPlaceholder={t.placeholder_model_disabled}
            />
            <div className={`sv-configuring ${configuring ? 'show' : ''}`} aria-live="polite">
              <Loader2 size={16} strokeWidth={2.5} className="sv-spinner" />
              <span>{t.configuring(brandLabel, modelLabel)}</span>
            </div>
            <Dropdown
              id="sv-fuel"
              label={t.lbl_fuel}
              icon={<Zap size={16} strokeWidth={2.5} />}
              value={fuel}
              onChange={setFuel}
              options={t.fuels as unknown as { id: string; label: string }[]}
              placeholder={t.placeholder_fuel}
            />
            <Dropdown
              id="sv-year"
              label={t.lbl_year}
              icon={<Calendar size={16} strokeWidth={2.5} />}
              value={year}
              onChange={(id) => {
                setYear(id);
                try { window.sessionStorage.setItem('stella:vehicle_year', id); } catch { /* noop */ }
              }}
              options={t.years as unknown as { id: string; label: string }[]}
              placeholder={t.placeholder_year}
            />
            <Dropdown
              id="sv-mileage"
              label={t.lbl_mileage}
              icon={<Gauge size={16} strokeWidth={2.5} />}
              value={mileage}
              onChange={setMileage}
              options={t.mileages as unknown as { id: string; label: string }[]}
              placeholder={t.placeholder_mileage}
            />
            <Dropdown
              id="sv-service"
              label={t.lbl_service}
              icon={<Wrench size={16} strokeWidth={2.5} />}
              value={service}
              onChange={setService}
              options={t.services as unknown as { id: string; label: string }[]}
              placeholder={t.placeholder_service}
            />
          </div>

          <button
            type="button"
            className={`sv-notsure ${notSure ? 'active' : ''}`}
            onClick={() => setNotSure((v) => !v)}
            aria-pressed={notSure}
          >
            <span className="sv-notsure-check">
              <Check size={14} strokeWidth={3} />
            </span>
            <span className="sv-notsure-text">
              <span className="sv-notsure-label">
                <HelpCircle size={14} strokeWidth={2.5} style={{ color: '#6B4E9B' }} />
                {t.not_sure}
              </span>
              <span className="sv-notsure-hint">{t.not_sure_hint}</span>
            </span>
          </button>
        </main>

        <div className="sv-sticky">
          <button
            type="button"
            className="sv-cta"
            disabled={!isValid}
            aria-disabled={!isValid}
            onClick={handleSubmit}
          >
            <span className="sv-cta-label">
              {t.cta}
              <span className="sv-cta-arrow">
                <ArrowRight size={18} strokeWidth={2.5} />
              </span>
            </span>
            <span className="sv-cta-sub">{t.cta_sub}</span>
          </button>
        </div>

        <div className={`sv-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaVehicle;
