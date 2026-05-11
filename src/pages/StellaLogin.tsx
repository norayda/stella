/**
 * @krisspy-file
 * @type page
 * @name "StellaLogin"
 * @title "STELLA — Connexion"
 * @description "Écran de connexion : email + mot de passe, mot de passe oublié, lien vers la création de compte. Bilingue FR/EN."
 * @routes ["/login", "/connexion"]
 * @flowName "Authentification"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, KeyRound, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Lang = 'fr' | 'en';

const I18N = {
  fr: {
    back: 'Retour',
    mark: 'Connexion',
    title: 'Bon retour ! ✨',
    sub: 'Ravie de te retrouver. Connecte-toi pour reprendre là où tu t\'étais arrêtée.',
    email_label: 'Ton adresse email',
    email_ph: 'marie@exemple.com',
    pwd_label: 'Mot de passe',
    pwd_ph: '••••••••',
    show_pwd: 'Afficher le mot de passe',
    hide_pwd: 'Masquer le mot de passe',
    forgot: 'Mot de passe oublié ?',
    cta: 'Me connecter',
    cta_sub: 'Accéder à mon compte',
    no_account: 'Pas encore de compte ?',
    create: 'Créer un compte',
    toast_success: '✅ Connexion réussie — bon retour !',
    toast_forgot: '📧 Un email de réinitialisation t\'a été envoyé.',
    err_credentials: 'Email ou mot de passe incorrect.',
    err_generic: 'Une erreur est survenue. Réessaie.',
  },
  en: {
    back: 'Back',
    mark: 'Sign in',
    title: 'Welcome back! ✨',
    sub: 'Glad to see you again. Sign in to pick up where you left off.',
    email_label: 'Your email address',
    email_ph: 'marie@example.com',
    pwd_label: 'Password',
    pwd_ph: '••••••••',
    show_pwd: 'Show password',
    hide_pwd: 'Hide password',
    forgot: 'Forgot password?',
    cta: 'Sign in',
    cta_sub: 'Access my account',
    no_account: 'No account yet?',
    create: 'Create an account',
    toast_success: '✅ Signed in — welcome back!',
    toast_forgot: '📧 A reset email has been sent.',
    err_credentials: 'Incorrect email or password.',
    err_generic: 'Something went wrong. Please try again.',
  },
} as const;

const StellaLogin: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const t = I18N[lang];
  const emailOk = /\S+@\S+\.\S+/.test(email.trim());
  const isValid = emailOk && password.length > 0;

  useEffect(() => {
    const timer = window.setTimeout(() => emailRef.current?.focus(), 180);
    return () => window.clearTimeout(timer);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || authLoading) return;
    setAuthError(null);
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setAuthError(t.err_credentials);
        return;
      }
      showToast(t.toast_success);
      window.setTimeout(() => navigate('/home'), 900);
    } catch {
      setAuthError(t.err_generic);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!emailOk) { showToast(lang === 'fr' ? 'Saisis ton email d\'abord.' : 'Enter your email first.'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    showToast(error ? t.err_generic : t.toast_forgot);
  };

  return (
    <>
      <style>{`
        .lg-root * { box-sizing: border-box; }
        .lg-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          animation: lg-page-in 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes lg-page-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lg-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .lg-blobs::before, .lg-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
        }
        .lg-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .lg-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .lg-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 20px 24px 32px;
          display: flex; flex-direction: column;
          position: relative; z-index: 1;
          gap: 22px;
        }
        .lg-top {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
        }
        .lg-back {
          display: inline-flex; align-items: center; gap: 6px;
          border: none; background: rgba(255,255,255,0.7);
          color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px;
          cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06);
          backdrop-filter: blur(8px);
          transition: background 150ms ease, transform 150ms ease;
        }
        .lg-back:hover { background: #FFF; }
        .lg-back:active { transform: scale(0.97); }
        .lg-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .lg-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
          transition: all 150ms ease;
        }
        .lg-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 3px 10px rgba(255,122,112,0.3);
        }

        .lg-header {
          display: flex; flex-direction: column; gap: 10px;
          text-align: left;
        }
        .lg-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
          margin-bottom: 2px;
        }
        .lg-h1 {
          font-size: 28px; font-weight: 800; line-height: 1.2;
          letter-spacing: -0.4px; color: #1A1A2E;
          margin: 0;
        }
        .lg-sub {
          font-size: 14px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }

        .lg-form { display: flex; flex-direction: column; gap: 14px; }
        .lg-field { display: flex; flex-direction: column; gap: 6px; }
        .lg-field-label {
          font-size: 12px; font-weight: 700;
          color: #6B4E9B;
          letter-spacing: 0.2px;
          padding-left: 4px;
        }
        .lg-field-box {
          display: flex; align-items: center; gap: 10px;
          background: #FFF;
          border: 1.5px solid transparent;
          border-radius: 14px;
          padding: 12px 14px;
          box-shadow: 0 4px 14px rgba(26,26,46,0.05);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }
        .lg-field-box:focus-within {
          border-color: #FF7A70;
          box-shadow: 0 6px 20px rgba(255,122,112,0.15);
        }
        .lg-field-icon {
          flex-shrink: 0;
          width: 28px; height: 28px; border-radius: 8px;
          background: #FFE6E3; color: #FF7A70;
          display: flex; align-items: center; justify-content: center;
        }
        .lg-field-input {
          flex: 1; border: none; outline: none;
          font-family: inherit; font-size: 15px; font-weight: 600;
          color: #1A1A2E; background: transparent;
          padding: 2px 0;
          min-width: 0;
        }
        .lg-field-input::placeholder { color: #B8ACAC; font-weight: 500; }
        .lg-field-toggle {
          flex-shrink: 0;
          border: none; background: transparent;
          color: #FF7A70; cursor: pointer;
          padding: 4px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 150ms ease;
        }
        .lg-field-toggle:hover { background: #FFE6E3; }

        .lg-forgot {
          align-self: flex-end;
          background: transparent; border: none;
          font-family: inherit; font-size: 12.5px; font-weight: 700;
          color: #6B4E9B; cursor: pointer;
          text-decoration: underline; text-underline-offset: 3px;
          padding: 4px 6px;
          margin-top: -4px;
        }
        .lg-forgot:hover { color: #FF7A70; }

        .lg-cta {
          width: 100%;
          border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          font-family: inherit; font-size: 16px; font-weight: 800;
          padding: 14px 20px; border-radius: 50px;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          box-shadow: 0 8px 22px rgba(255,122,112,0.4);
          transition: transform 150ms ease, background 150ms ease, opacity 200ms ease;
          margin-top: 4px;
        }
        .lg-cta:hover:not(:disabled) { background: #F26158; }
        .lg-cta:active:not(:disabled) { transform: scale(0.985); }
        .lg-cta:disabled {
          opacity: 0.45; cursor: not-allowed;
          box-shadow: 0 4px 10px rgba(255,122,112,0.2);
        }
        .lg-cta-sub { font-size: 12px; font-weight: 500; opacity: 0.9; }

        .lg-divider {
          display: flex; align-items: center; gap: 12px;
          color: #B8ACAC;
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 6px 0;
        }
        .lg-divider::before, .lg-divider::after {
          content: ""; flex: 1; height: 1px;
          background: rgba(26,26,46,0.08);
        }

        .lg-create {
          background: #FFF;
          border: 1.5px solid rgba(107,78,155,0.25);
          border-radius: 14px;
          padding: 14px;
          display: flex; align-items: center; gap: 12px;
          cursor: pointer; font-family: inherit;
          transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
        }
        .lg-create:hover {
          border-color: #6B4E9B;
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(107,78,155,0.15);
        }
        .lg-create-ico {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 10px rgba(255,122,112,0.3);
        }
        .lg-create-text { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .lg-create-top {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
        }
        .lg-create-label {
          font-size: 14px; font-weight: 900; color: #6B4E9B;
          letter-spacing: -0.1px;
        }

        .lg-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translate(-50%, 80px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 20px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 20px 50px rgba(26,26,46,0.25);
          z-index: 200; opacity: 0;
          transition: transform 300ms ease, opacity 300ms ease;
          pointer-events: none;
        }
        .lg-toast.show {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-blobs" aria-hidden="true" />

        <main className="lg-app">
          <div className="lg-top">
            <button
              type="button"
              className="lg-back"
              onClick={() => navigate(-1)}
              aria-label={t.back}
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
              {t.back}
            </button>
            <div className="lg-lang" role="tablist">
              <button
                type="button"
                className={`lg-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >FR</button>
              <button
                type="button"
                className={`lg-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >EN</button>
            </div>
          </div>

          <header className="lg-header">
            <span className="lg-mark">
              <Sparkles size={12} strokeWidth={2.5} /> STELLA
            </span>
            <h1 className="lg-h1">{t.title}</h1>
            <p className="lg-sub">{t.sub}</p>
          </header>

          <form className="lg-form" onSubmit={handleSubmit} noValidate>
            <div className="lg-field">
              <label className="lg-field-label" htmlFor="lg-email">{t.email_label}</label>
              <div className="lg-field-box">
                <span className="lg-field-icon" aria-hidden="true">
                  <Mail size={16} strokeWidth={2.5} />
                </span>
                <input
                  ref={emailRef}
                  id="lg-email"
                  type="email"
                  className="lg-field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.email_ph}
                  autoComplete="email"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="lg-field">
              <label className="lg-field-label" htmlFor="lg-pwd">{t.pwd_label}</label>
              <div className="lg-field-box">
                <span className="lg-field-icon" aria-hidden="true">
                  <KeyRound size={16} strokeWidth={2.5} />
                </span>
                <input
                  id="lg-pwd"
                  type={showPwd ? 'text' : 'password'}
                  className="lg-field-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.pwd_ph}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lg-field-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? t.hide_pwd : t.show_pwd}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="lg-forgot"
              onClick={handleForgot}
            >
              {t.forgot}
            </button>

            {authError && (
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#E04A42', margin: 0 }} role="alert">
                <AlertCircle size={14} strokeWidth={2.5} />
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="lg-cta"
              disabled={!isValid || authLoading}
              aria-disabled={!isValid || authLoading}
            >
              <span>{authLoading ? '…' : t.cta}</span>
              <span className="lg-cta-sub">{t.cta_sub}</span>
            </button>
          </form>

          <div className="lg-divider">{lang === 'fr' ? 'ou' : 'or'}</div>

          <button
            type="button"
            className="lg-create"
            onClick={() => navigate('/name')}
          >
            <span className="lg-create-ico" aria-hidden="true">
              <Sparkles size={18} strokeWidth={2.5} />
            </span>
            <div className="lg-create-text">
              <span className="lg-create-top">{t.no_account}</span>
              <span className="lg-create-label">{t.create} →</span>
            </div>
          </button>
        </main>

        <div className={`lg-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaLogin;
