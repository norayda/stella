/**
 * @krisspy-file
 * @type page
 * @name "StellaName"
 * @title "STELLA — Votre prénom"
 * @description "Écran d'onboarding : l'utilisateur choisit comment STELLA doit l'appeler. Auto-focus, validation instantanée, ton chaleureux et appropriation."
 * @routes ["/name"]
 * @flowName "Onboarding"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Settings, Lock, Mail, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

type Lang = 'fr' | 'en';

const I18N = {
  fr: {
    lang_fr: 'Français',
    lang_en: 'English',
    step: 'Étape 1 sur 2',
    question: 'Comment aimerais-tu que l\'on t\'appelle ?',
    sub: 'Saisis ton prénom ou un surnom.',
    placeholder: 'Ex : Sarah, Luna, Alex…',
    email_label: 'Ton adresse email',
    email_ph: 'stella@exemple.com',
    pwd_label: 'Choisis un mot de passe',
    pwd_ph: '••••••••',
    pwd2_label: 'Confirme ton mot de passe',
    pwd2_ph: '••••••••',
    pwd_mismatch: 'Les mots de passe ne correspondent pas',
    show_pwd: 'Afficher le mot de passe',
    hide_pwd: 'Masquer le mot de passe',
    cta: 'Continuer',
    cta_sub: 'Personnaliser mon expérience',
    trust: 'Ce prénom sera utilisé pour personnaliser ton expérience dans toute l\'app.',
    settings: 'Modifiable à tout moment dans les réglages',
    counter: (n: number, max: number) => `${n} / ${max}`,
    preview: (name: string) => `Enchantée, ${name} ✨`,
    toast: (name: string) => `Bienvenue ${name} — on continue l'aventure !`,
  },
  en: {
    lang_fr: 'Français',
    lang_en: 'English',
    step: 'Step 1 of 2',
    question: 'What would you like us to call you?',
    sub: 'Enter your first name or a nickname.',
    placeholder: 'E.g.: Sarah, Luna, Alex…',
    email_label: 'Your email address',
    email_ph: 'stella@example.com',
    pwd_label: 'Choose a password',
    pwd_ph: '••••••••',
    pwd2_label: 'Confirm your password',
    pwd2_ph: '••••••••',
    pwd_mismatch: "Passwords don't match",
    show_pwd: 'Show password',
    hide_pwd: 'Hide password',
    cta: 'Continue',
    cta_sub: 'Personalize my experience',
    trust: 'This name will be used to personalize your experience throughout the app.',
    settings: 'Can be changed at any time in settings',
    counter: (n: number, max: number) => `${n} / ${max}`,
    preview: (name: string) => `Nice to meet you, ${name} ✨`,
    toast: (name: string) => `Welcome ${name} — let's keep going!`,
  },
} as const;

const MAX_LEN = 20;

const StellaName: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | null>(null);

  const t = I18N[lang];
  const trimmed = name.trim();
  const emailOk = /\S+@\S+\.\S+/.test(email.trim());
  const pwdsMatch = pwd.length > 0 && pwd === pwd2;
  const pwdMismatch = pwd2.length > 0 && pwd !== pwd2;
  const isValid = trimmed.length > 0 && emailOk && pwd.length > 0 && pwdsMatch;

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => window.clearTimeout(timer);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.slice(0, MAX_LEN);
    setName(v);
    try {
      const t = v.trim();
      if (t) window.sessionStorage.setItem('stella:nickname', t);
      else window.sessionStorage.removeItem('stella:nickname');
    } catch { /* noop */ }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isValid) return;
    try { window.sessionStorage.setItem('stella:nickname', trimmed); } catch { /* noop */ }
    showToast(t.toast(trimmed));
    window.setTimeout(() => navigate('/personalization'), 700);
  };

  const progress = Math.min(trimmed.length / 3, 1);

  return (
    <>
      <style>{`
        .sn-root * { box-sizing: border-box; }
        .sn-root {
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
          animation: sn-page-in 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes sn-page-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sn-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .sn-blobs::before, .sn-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
        }
        .sn-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .sn-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .sn-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 24px 32px;
          display: flex; flex-direction: column;
          position: relative; z-index: 1;
          gap: 24px;
        }
        .sn-top {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
        }
        .sn-progress-wrap {
          flex: 1;
          display: flex; flex-direction: column; gap: 6px;
        }
        .sn-step {
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: #8A7A7A;
        }
        .sn-bar {
          height: 4px; background: rgba(107,78,155,0.12);
          border-radius: 4px; overflow: hidden;
        }
        .sn-bar-fill {
          height: 100%; width: 50%;
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          border-radius: 4px;
          transition: width 400ms cubic-bezier(0.22,1,0.36,1);
        }
        .sn-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .sn-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
          transition: all 200ms ease;
        }
        .sn-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 3px 10px rgba(255,122,112,0.3);
        }
        .sn-main {
          flex: 1;
          display: flex; flex-direction: column;
          justify-content: center;
          gap: 28px;
          padding: 16px 0;
        }
        .sn-header {
          display: flex; flex-direction: column; gap: 10px;
          text-align: left;
        }
        .sn-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
          margin-bottom: 4px;
        }
        .sn-h1 {
          font-size: 28px; font-weight: 800; line-height: 1.2;
          letter-spacing: -0.4px; color: #1A1A2E;
          margin: 0;
        }
        .sn-h1 span {
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .sn-sub {
          font-size: 15px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5;
          margin: 0;
        }
        .sn-form { display: flex; flex-direction: column; gap: 16px; }

        .sn-input-card {
          background: #FFF; border-radius: 16px;
          padding: 6px;
          box-shadow: 0 10px 30px rgba(26,26,46,0.08);
          border: 2px solid transparent;
          transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
          position: relative;
        }
        .sn-input-card.focused {
          border-color: #FF7A70;
          box-shadow: 0 14px 40px rgba(255,122,112,0.22);
        }
        .sn-input-row {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 18px;
        }
        .sn-input-prefix {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #FFE6E3 0%, #EEE7F7 100%);
          color: #FF7A70;
          display: flex; align-items: center; justify-content: center;
          transition: transform 200ms ease;
        }
        .sn-input-card.focused .sn-input-prefix {
          transform: scale(1.05);
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
        }
        .sn-input {
          flex: 1; border: none; outline: none;
          font-family: inherit; font-size: 20px; font-weight: 700;
          color: #1A1A2E; background: transparent;
          padding: 4px 0;
          letter-spacing: -0.2px;
        }
        .sn-input::placeholder {
          color: #B8ACAC; font-weight: 500; letter-spacing: 0;
        }
        .sn-counter {
          font-size: 11px; font-weight: 700; color: #B8ACAC;
          padding: 4px 8px; border-radius: 6px;
          background: #F8F1EC;
          min-width: 44px; text-align: center;
          transition: color 200ms ease, background 200ms ease;
        }
        .sn-counter.near {
          color: #FF7A70; background: #FFE6E3;
        }
        .sn-field { display: flex; flex-direction: column; gap: 6px; }
        .sn-field-label {
          font-size: 12px; font-weight: 700;
          color: #6B4E9B;
          letter-spacing: 0.2px;
          padding-left: 4px;
        }
        .sn-field-box {
          display: flex; align-items: center; gap: 10px;
          background: #FFF;
          border: 1.5px solid transparent;
          border-radius: 14px;
          padding: 12px 14px;
          box-shadow: 0 4px 14px rgba(26,26,46,0.05);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .sn-field-box:focus-within {
          border-color: #FF7A70;
          box-shadow: 0 6px 20px rgba(255,122,112,0.15);
        }
        .sn-field-box.error {
          border-color: #E04A42;
          box-shadow: 0 6px 20px rgba(224,74,66,0.12);
        }
        .sn-field-icon {
          flex-shrink: 0;
          width: 28px; height: 28px; border-radius: 8px;
          background: #FFE6E3; color: #FF7A70;
          display: flex; align-items: center; justify-content: center;
        }
        .sn-field-input {
          flex: 1; border: none; outline: none;
          font-family: inherit; font-size: 15px; font-weight: 600;
          color: #1A1A2E; background: transparent;
          padding: 2px 0;
          min-width: 0;
        }
        .sn-field-input::placeholder {
          color: #B8ACAC; font-weight: 500;
        }
        .sn-field-toggle {
          flex-shrink: 0;
          border: none; background: transparent;
          color: #FF7A70; cursor: pointer;
          padding: 4px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 150ms ease, color 150ms ease;
        }
        .sn-field-toggle:hover { background: #FFE6E3; color: #F26158; }
        .sn-field-error {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          color: #E04A42;
          padding-left: 4px;
          margin: 2px 0 0;
        }
        .sn-preview {
          font-size: 13px; font-weight: 600;
          color: #6B4E9B;
          padding: 2px 6px;
          opacity: 0; transform: translateY(-4px);
          transition: opacity 250ms ease, transform 250ms ease;
          height: 18px;
        }
        .sn-preview.show { opacity: 1; transform: translateY(0); }

        .sn-cta {
          font-family: inherit; border: none; cursor: pointer; width: 100%;
          padding: 14px 20px; border-radius: 50px;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          background: #FF7A70; color: #FFF;
          box-shadow: 0 8px 22px rgba(255,122,112,0.4);
          transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease, opacity 200ms ease;
          position: relative;
        }
        .sn-cta:hover:not(:disabled) { background: #F26158; }
        .sn-cta:active:not(:disabled) { transform: scale(0.985); }
        .sn-cta:disabled {
          opacity: 0.45; cursor: not-allowed;
          box-shadow: 0 4px 10px rgba(255,122,112,0.2);
        }
        .sn-cta-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 16px; font-weight: 800; letter-spacing: -0.1px;
        }
        .sn-cta-sub { font-size: 12px; font-weight: 500; opacity: 0.9; }
        .sn-cta-arrow {
          display: inline-flex;
          transition: transform 250ms ease;
        }
        .sn-cta:hover:not(:disabled) .sn-cta-arrow { transform: translateX(3px); }

        .sn-trust {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 14px 16px;
          background: rgba(255,255,255,0.55);
          border-radius: 14px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107,78,155,0.08);
        }
        .sn-trust-icon {
          flex-shrink: 0; width: 28px; height: 28px;
          border-radius: 8px; background: #EEE7F7; color: #6B4E9B;
          display: flex; align-items: center; justify-content: center;
        }
        .sn-trust-text {
          font-size: 12.5px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }
        .sn-settings {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: center;
          font-family: inherit; background: transparent; border: none;
          font-size: 12.5px; font-weight: 600; color: #6B4E9B;
          cursor: pointer; padding: 6px 10px;
          text-decoration: underline; text-underline-offset: 3px;
        }
        .sn-settings:hover { color: #FF7A70; }

        .sn-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translate(-50%, 80px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 20px 50px rgba(26,26,46,0.25);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .sn-toast.show { transform: translate(-50%, 0); opacity: 1; }
        .sn-toast-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #FF7A70;
          box-shadow: 0 0 10px rgba(255,122,112,0.8);
        }

        @media (min-width: 640px) {
          .sn-app { padding: 32px 24px 40px; }
          .sn-h1 { font-size: 30px; }
        }
        @media (max-height: 640px) {
          .sn-main { justify-content: flex-start; padding: 8px 0 0; }
          .sn-h1 { font-size: 24px; }
        }
      `}</style>

      <div className="sn-root">
        <div className="sn-blobs" aria-hidden="true" />

        <main className="sn-app">
          <div className="sn-top">
            <div className="sn-progress-wrap">
              <span className="sn-step">{t.step}</span>
              <div className="sn-bar" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}>
                <div className="sn-bar-fill" style={{ width: '50%' }} />
              </div>
            </div>
            <div className="sn-lang" role="tablist">
              <button
                type="button"
                className={`sn-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >
                FR
              </button>
              <button
                type="button"
                className={`sn-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >
                EN
              </button>
            </div>
          </div>

          <form className="sn-main" onSubmit={handleSubmit} noValidate>
            <header className="sn-header">
              <span className="sn-mark">
                <Sparkles size={12} strokeWidth={2.5} /> STELLA
              </span>
              <h1 className="sn-h1">{t.question}</h1>
              <p className="sn-sub">{t.sub}</p>
            </header>

            <div className="sn-form">
              <div className={`sn-input-card ${isFocused ? 'focused' : ''}`}>
                <div className="sn-input-row">
                  <span className="sn-input-prefix" aria-hidden="true">
                    <Sparkles size={18} strokeWidth={2.5} />
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="sn-input"
                    value={name}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={t.placeholder}
                    maxLength={MAX_LEN}
                    autoComplete="given-name"
                    autoCapitalize="words"
                    aria-label={t.question}
                    spellCheck={false}
                  />
                  <span
                    className={`sn-counter ${name.length >= MAX_LEN - 3 ? 'near' : ''}`}
                    aria-live="polite"
                  >
                    {t.counter(name.length, MAX_LEN)}
                  </span>
                </div>
              </div>

              <div
                className={`sn-preview ${trimmed.length > 0 ? 'show' : ''}`}
                aria-live="polite"
              >
                {trimmed.length > 0 ? t.preview(trimmed) : ' '}
              </div>

              <div className="sn-field">
                <label className="sn-field-label" htmlFor="sn-email">{t.email_label}</label>
                <div className="sn-field-box">
                  <span className="sn-field-icon" aria-hidden="true">
                    <Mail size={16} strokeWidth={2.5} />
                  </span>
                  <input
                    id="sn-email"
                    type="email"
                    className="sn-field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.email_ph}
                    autoComplete="email"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="sn-field">
                <label className="sn-field-label" htmlFor="sn-pwd">{t.pwd_label}</label>
                <div className="sn-field-box">
                  <span className="sn-field-icon" aria-hidden="true">
                    <KeyRound size={16} strokeWidth={2.5} />
                  </span>
                  <input
                    id="sn-pwd"
                    type={showPwd ? 'text' : 'password'}
                    className="sn-field-input"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder={t.pwd_ph}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="sn-field-toggle"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? t.hide_pwd : t.show_pwd}
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>

              <div className="sn-field">
                <label className="sn-field-label" htmlFor="sn-pwd2">{t.pwd2_label}</label>
                <div className={`sn-field-box ${pwdMismatch ? 'error' : ''}`}>
                  <span className="sn-field-icon" aria-hidden="true">
                    <KeyRound size={16} strokeWidth={2.5} />
                  </span>
                  <input
                    id="sn-pwd2"
                    type={showPwd2 ? 'text' : 'password'}
                    className="sn-field-input"
                    value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                    placeholder={t.pwd2_ph}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="sn-field-toggle"
                    onClick={() => setShowPwd2((v) => !v)}
                    aria-label={showPwd2 ? t.hide_pwd : t.show_pwd}
                    tabIndex={-1}
                  >
                    {showPwd2 ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                  </button>
                </div>
                {pwdMismatch && (
                  <p className="sn-field-error" role="alert">
                    <AlertCircle size={13} strokeWidth={2.5} />
                    <span>{t.pwd_mismatch}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="sn-cta"
                disabled={!isValid}
                aria-disabled={!isValid}
              >
                <span className="sn-cta-label">
                  {t.cta}
                  <span className="sn-cta-arrow">
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </span>
                </span>
                <span className="sn-cta-sub">{t.cta_sub}</span>
              </button>

            </div>

            <div className="sn-trust">
              <span className="sn-trust-icon" aria-hidden="true">
                <Lock size={14} strokeWidth={2.5} />
              </span>
              <p className="sn-trust-text">{t.trust}</p>
            </div>

            <button
              type="button"
              className="sn-settings"
              onClick={() => showToast(t.settings)}
            >
              <Settings size={14} strokeWidth={2.5} />
              <span>👉 {t.settings}</span>
            </button>
          </form>
        </main>

        <div className={`sn-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast && <span className="sn-toast-dot" aria-hidden="true" />}
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaName;
