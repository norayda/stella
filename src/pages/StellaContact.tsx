/**
 * @krisspy-file
 * @type page
 * @name "StellaContact"
 * @title "STELLA — Support Jeep Heart"
 * @description "Page de support Jeep Heart : aide et support, chat avec Stella. Coordonnées service client."
 * @routes ["/contact"]
 * @flowName "App"
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, MessageCircle, Phone, ChevronLeft } from 'lucide-react';

type Mode = 'home' | 'support';

const StellaContact: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('home');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [subject, setSubject] = useState('Problème technique');
  const [message, setMessage] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, []);

  const sendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    showToast('✅ Message envoyé ! L\'équipe Stellantis te répondra sous 24h.');
    setMessage('');
    setMode('home');
  };

  return (
    <>
      <style>{`
        .ct-root * { box-sizing: border-box; }
        .ct-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
        }
        .ct-app { width: 100%; max-width: 420px; min-height: 100vh; padding: 16px 20px 40px; display: flex; flex-direction: column; gap: 14px; }
        .ct-back { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          border: none; background: rgba(255,255,255,0.7); color: #1A1A2E;
          font-family: inherit; font-size: 13px; font-weight: 700;
          padding: 7px 14px 7px 10px; border-radius: 50px; cursor: pointer;
          border: 1px solid rgba(26,26,46,0.06); }
        .ct-mark { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          color: #6B4E9B; padding: 5px 12px; background: rgba(107,78,155,0.1); border-radius: 50px; }
        .ct-h1 { font-size: 24px; font-weight: 900; line-height: 1.2; letter-spacing: -0.4px; margin: 6px 0 4px; }
        .ct-sub { font-size: 14px; font-weight: 500; color: #8A7A7A; margin: 0; }

        .ct-stella {
          display: flex; align-items: center; gap: 12px;
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px; padding: 14px;
          box-shadow: 0 8px 18px rgba(26,26,46,0.05);
        }
        .ct-stella-avatar {
          flex-shrink: 0;
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 14px rgba(255,122,112,0.35);
        }
        .ct-stella-text { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .ct-stella-title { font-size: 14px; font-weight: 900; color: #1A1A2E; }
        .ct-stella-sub { font-size: 11.5px; font-weight: 600; color: #8A7A7A; }

        .ct-card {
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px; padding: 16px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 8px 18px rgba(26,26,46,0.05);
          cursor: pointer; font-family: inherit; text-align: left;
          transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
        }
        .ct-card:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(26,26,46,0.08); }
        .ct-ico {
          flex-shrink: 0; width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .ct-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .ct-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .ct-ico.teal { background: #DFF5F1; color: #17856C; }
        .ct-card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .ct-card-title { font-size: 14px; font-weight: 900; color: #1A1A2E; }
        .ct-card-sub { font-size: 12px; font-weight: 600; color: #8A7A7A; line-height: 1.4; }

        /* Forms */
        .ct-form {
          background: #FFF; border: 1px solid rgba(26,26,46,0.06);
          border-radius: 18px; padding: 16px;
          display: flex; flex-direction: column; gap: 10px;
          box-shadow: 0 10px 24px rgba(26,26,46,0.05);
        }
        .ct-label { font-size: 11px; font-weight: 800; color: #6B4E9B; letter-spacing: 0.3px; padding-left: 2px; }
        .ct-input, .ct-textarea, .ct-select {
          width: 100%; border: 1px solid rgba(26,26,46,0.08);
          background: #FDF6F0; border-radius: 12px;
          padding: 10px 14px;
          font-family: inherit; font-size: 13px; font-weight: 700;
          color: #1A1A2E; outline: none;
        }
        .ct-textarea { min-height: 100px; resize: vertical; }
        .ct-input:focus, .ct-textarea:focus, .ct-select:focus {
          border-color: #FF7A70; background: #FFF;
          box-shadow: 0 0 0 3px rgba(255,122,112,0.15);
        }
        .ct-upload {
          border: 2px dashed rgba(255,122,112,0.4);
          background: #FFF5F2;
          border-radius: 14px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          font-family: inherit; font-size: 13px; font-weight: 800;
          color: #FF7A70;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .ct-upload:hover { background: #FFE6E3; border-color: #FF7A70; }
        .ct-upload.has-file { background: #DFF5F1; border-color: #17856C; color: #0F6B57; }

        .ct-cta {
          border: none; cursor: pointer;
          background: #FF7A70; color: #FFF;
          font-family: inherit; font-size: 14px; font-weight: 900;
          padding: 13px 18px; border-radius: 50px;
          box-shadow: 0 10px 22px rgba(255,122,112,0.4);
        }
        .ct-cta:hover { background: #F26158; }
        .ct-cta:disabled { opacity: 0.5; cursor: not-allowed; }

        .ct-phone {
          background: linear-gradient(135deg, #1A1A2E 0%, #3C2B66 100%);
          color: #FFF; border-radius: 18px; padding: 16px;
          display: flex; flex-direction: column; gap: 6px;
          box-shadow: 0 14px 28px rgba(26,26,46,0.25);
        }
        .ct-phone-label { font-size: 10.5px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.7); }
        .ct-phone-num { font-size: 18px; font-weight: 900; display: inline-flex; align-items: center; gap: 8px; }
        .ct-phone-hours { font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,0.78); }

        .ct-sub-back {
          background: transparent; border: none;
          font-family: inherit; font-size: 12.5px; font-weight: 800;
          color: #6B4E9B; cursor: pointer;
          display: inline-flex; align-items: center; gap: 4px;
          align-self: flex-start;
          padding: 2px 8px;
        }

        .ct-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 20px);
          background: #FF7A70; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 20px 50px rgba(255,122,112,0.4);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .ct-toast.show { transform: translate(-50%, 0); opacity: 1; }
      `}</style>

      <div className="ct-root">
        <main className="ct-app">
          <button type="button" className="ct-back" onClick={() => mode === 'home' ? navigate(-1) : setMode('home')}>
            <ArrowLeft size={15} strokeWidth={2.5} /> Retour
          </button>

          {mode === 'home' && (
            <>
              <header>
                <span className="ct-mark"><MessageCircle size={12} strokeWidth={2.5} /> Support Jeep Heart</span>
                <h1 className="ct-h1">Comment pouvons-nous t'aider ?</h1>
                <p className="ct-sub">Choisis ce qui t'arrange — on te répond vite.</p>
              </header>

              <div className="ct-stella">
                <span className="ct-stella-avatar"><Sparkles size={22} strokeWidth={2.3} /></span>
                <div className="ct-stella-text">
                  <span className="ct-stella-title">Stella est là pour toi ✨</span>
                  <span className="ct-stella-sub">Équipe Jeep Heart · Réponse sous 24h</span>
                </div>
              </div>

              <button type="button" className="ct-card" onClick={() => setMode('support')}>
                <span className="ct-ico coral"><MessageCircle size={22} strokeWidth={2.5} /></span>
                <div className="ct-card-body">
                  <span className="ct-card-title">💬 Aide et support</span>
                  <span className="ct-card-sub">Une question sur l'app ou ton véhicule ?</span>
                </div>
              </button>

              <button type="button" className="ct-card" onClick={() => navigate('/copilot')}>
                <span className="ct-ico teal"><Sparkles size={22} strokeWidth={2.5} /></span>
                <div className="ct-card-body">
                  <span className="ct-card-title">✨ Chat avec Stella</span>
                  <span className="ct-card-sub">Pose ta question directement à l'IA.</span>
                </div>
              </button>

              <section className="ct-phone">
                <span className="ct-phone-label">Support Jeep Heart</span>
                <span className="ct-phone-num"><Phone size={18} strokeWidth={2.8} /> 0800 000 000 (gratuit)</span>
                <span className="ct-phone-hours">Lun–Ven 8h–20h · Sam 9h–17h</span>
              </section>
            </>
          )}

          {mode === 'support' && (
            <>
              <button type="button" className="ct-sub-back" onClick={() => setMode('home')}>
                <ChevronLeft size={14} strokeWidth={2.8} /> Tous les contacts
              </button>
              <header>
                <span className="ct-mark">Aide et support</span>
                <h1 className="ct-h1">Contacte l'équipe 💬</h1>
                <p className="ct-sub">On te répond sous 24h.</p>
              </header>
              <form className="ct-form" onSubmit={sendSupport}>
                <span className="ct-label">Sujet</span>
                <select className="ct-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option>Problème technique</option>
                  <option>Question sur mon véhicule</option>
                  <option>Mon abonnement</option>
                  <option>Autre</option>
                </select>
                <span className="ct-label">Message</span>
                <textarea
                  className="ct-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décris ta question ou ton problème…"
                />
                <button type="submit" className="ct-cta" disabled={!message.trim()}>
                  Envoyer
                </button>
              </form>
            </>
          )}

        </main>
        <div className={`ct-toast ${toast ? 'show' : ''}`}>{toast}</div>
      </div>
    </>
  );
};

export default StellaContact;
