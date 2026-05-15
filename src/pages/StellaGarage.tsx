/**
 * @krisspy-file
 * @type page
 * @name "StellaGarage"
 * @title "STELLA — Analyser un devis"
 * @description "Écran d'analyse de devis garage : aperçu du document, résumé structuré (total, verdict, pièces/main d'œuvre, urgence), insights, recommandation et garages partenaires."
 * @routes ["/garage"]
 * @flowName "App"
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  BadgeCheck,
  Zap,
  ChevronRight,
  Wallet,
  Scale,
  Wrench,
  User,
  Clock,
  AlertTriangle,
  CircleCheck,
  Lightbulb,
  ShieldCheck,
  Factory,
  Leaf,
  Star,
  Phone,
  GitCompareArrows,
  Check,
  X,
  Camera,
  Upload,
  Pencil,
  Loader2,
  Plus,
  MessageCircle,
  Send,
} from 'lucide-react';

type Lang = 'fr' | 'en';
type Verdict = 'fair' | 'high' | 'low';
type Urgency = 'low' | 'medium' | 'high';

const I18N = {
  fr: {
    back: 'Retour',
    mark: 'Analyse de devis',
    title: 'Analyser un devis garage',
    sub: 'STELLA lit et décortique ton devis en quelques secondes.',
    input_title: 'Comment veux-tu ajouter ton devis ?',
    input_sub: 'Trois façons — choisis ce qui est le plus pratique.',
    input_photo_title: 'Prendre une photo',
    input_photo_sub: 'Scanne le devis directement',
    input_pdf_title: 'Importer un PDF',
    input_pdf_sub: 'Ou une image (JPG, PNG)',
    input_manual_title: 'Écrire le devis',
    input_manual_sub: 'Saisis les lignes à la main',
    input_or: 'ou',
    input_example: 'Voir un exemple de devis analysé',
    manual_title: 'Saisir le devis',
    manual_sub: 'Ajoute les lignes de ton devis, STELLA s\'occupe du reste.',
    manual_line_label: 'Description',
    manual_line_ph: 'Ex : Plaquettes de frein avant',
    manual_amount_label: 'Montant (€)',
    manual_amount_ph: '0',
    manual_add_line: 'Ajouter une ligne',
    manual_total: 'Total',
    manual_cta: 'Analyser ce devis',
    manual_back: 'Retour',
    uploading: 'Analyse en cours…',
    uploading_sub: 'STELLA lit ton devis',
    preview_filename: 'devis-garage-avril.pdf',
    preview_meta: '2 pages · reçu le 18 avril',
    preview_tap: 'Appuyer pour agrandir',
    status_analyzed: 'Analysé',
    vehicle_tag: 'Jeep Avenger · Électrique',
    sec_summary: 'Résumé de l\'analyse',
    total_label: 'Total TTC',
    total_sub: 'Devis reçu',
    verdict_label: 'Verdict',
    verdict_fair: 'Tarif correct',
    verdict_high: 'Tarif un peu élevé',
    verdict_low: 'Tarif avantageux',
    verdict_sub: {
      fair: 'Dans la fourchette du marché',
      high: '~8% au-dessus du marché',
      low: 'Sous la moyenne du marché',
    },
    breakdown_label: 'Répartition',
    parts_label: 'Pièces',
    labor_label: 'Main d\'œuvre',
    urgency_label: 'Urgence',
    urgency: { low: 'Faible', medium: 'Modérée', high: 'Élevée' },
    urgency_sub: {
      low: 'Peut attendre 1 à 2 mois',
      medium: 'À faire dans les 2 semaines',
      high: 'À faire sans délai',
    },
    sec_insights: 'Points à noter',
    insights: [
      { kind: 'warn' as const, text: 'Tarif main d\'œuvre ~8% au-dessus de la moyenne régionale.' },
      { kind: 'info' as const, text: 'Remplacement des plaquettes non urgent — usure à 55%.' },
      { kind: 'ok' as const, text: 'Pièces proposées conformes aux références constructeur.' },
    ],
    sec_reco: 'Ma recommandation',
    reco_title: 'Compare avant d\'approuver',
    reco_text: 'Demande un deuxième devis avant validation. STELLA a trouvé 2 garages compatibles avec une économie potentielle.',
    reco_save_label: 'Économie potentielle',
    reco_save_value: '~62 €',
    sec_garages: 'Garages recommandés',
    garages: [
      {
        id: 'manuf',
        name: 'Auto Jeep Certifié',
        badge: 'Agréé constructeur',
        reason: 'Pièces d\'origine + garantie constructeur conservée.',
        rating: 4.8,
        distance: '3,2 km',
        tone: 'purple' as const,
      },
      {
        id: 'ev',
        name: 'EV Expert Garage',
        badge: 'Spécialiste véhicules électriques',
        reason: 'Indépendant certifié EV — tarifs ~12% plus bas.',
        rating: 4.7,
        distance: '5,8 km',
        tone: 'teal' as const,
      },
    ],
    trust_label: 'Confiance',
    action_approve: 'Approuver le devis',
    action_compare: 'Comparer les garages',
    action_contact: 'Contacter le garage',
    toast_approve: 'Devis approuvé — le garage a été prévenu.',
    toast_compare: 'Ouverture de la comparaison…',
    toast_contact: (name: string) => `Appel de ${name}…`,
    modal_close: 'Fermer',
    modal_pages: 'Page 1 sur 2',
    ai_open: 'Ouvrir l\'assistant IA',
    ai_title: 'Stella',
    ai_status: 'En ligne',
    ai_greeting: 'Salut ! Une question sur ce devis ? Je te donne une réponse franche.',
    ai_placeholder: 'Demande-moi sur ce devis…',
    ai_suggestions: [
      'Pourquoi ce devis est-il trop cher ?',
      'Puis-je négocier ?',
      'Est-ce urgent ?',
    ],
    ai_replies: {
      expensive: 'La main d\'œuvre est ~8% au-dessus du marché et les disques sont au prix constructeur. Tu peux économiser ~62 € en allant chez EV Expert Garage.',
      negotiate: 'Oui. Demande un geste commercial sur la main d\'œuvre (358 €) ou un devis alternatif avec plaquettes OEM compatibles — ~40 € en moins.',
      urgent: 'Non — tes plaquettes sont à 55% d\'usure. Tu peux attendre 2 à 6 semaines sans risque. À faire avant ton prochain long trajet.',
      default: 'Je regarde ce devis avec toi 👀 Dis-moi ce qui te fait hésiter — le prix, l\'urgence, la main d\'œuvre ?',
    },
  },
  en: {
    back: 'Back',
    mark: 'Quote analysis',
    title: 'Analyze garage quote',
    sub: 'STELLA reads and breaks down your estimate instantly.',
    input_title: 'How do you want to add your quote?',
    input_sub: 'Three ways — pick whatever is easiest.',
    input_photo_title: 'Take a photo',
    input_photo_sub: 'Scan the quote directly',
    input_pdf_title: 'Upload a PDF',
    input_pdf_sub: 'Or an image (JPG, PNG)',
    input_manual_title: 'Type it in',
    input_manual_sub: 'Enter the lines by hand',
    input_or: 'or',
    input_example: 'See an example analyzed quote',
    manual_title: 'Type the quote',
    manual_sub: 'Add the quote lines, STELLA handles the rest.',
    manual_line_label: 'Description',
    manual_line_ph: 'E.g.: Front brake pads',
    manual_amount_label: 'Amount (€)',
    manual_amount_ph: '0',
    manual_add_line: 'Add a line',
    manual_total: 'Total',
    manual_cta: 'Analyze this quote',
    manual_back: 'Back',
    uploading: 'Analyzing…',
    uploading_sub: 'STELLA is reading your quote',
    preview_filename: 'garage-quote-april.pdf',
    preview_meta: '2 pages · received Apr 18',
    preview_tap: 'Tap to expand',
    status_analyzed: 'Analyzed',
    vehicle_tag: 'Jeep Avenger · Electric',
    sec_summary: 'Analysis summary',
    total_label: 'Total incl. tax',
    total_sub: 'Quote received',
    verdict_label: 'Verdict',
    verdict_fair: 'Fair pricing',
    verdict_high: 'Slightly high',
    verdict_low: 'Good deal',
    verdict_sub: {
      fair: 'Within market range',
      high: '~8% above market',
      low: 'Below market average',
    },
    breakdown_label: 'Breakdown',
    parts_label: 'Parts',
    labor_label: 'Labor',
    urgency_label: 'Urgency',
    urgency: { low: 'Low', medium: 'Medium', high: 'High' },
    urgency_sub: {
      low: 'Can wait 1–2 months',
      medium: 'Do within 2 weeks',
      high: 'Do without delay',
    },
    sec_insights: 'Worth noting',
    insights: [
      { kind: 'warn' as const, text: 'Labor rate ~8% above regional average.' },
      { kind: 'info' as const, text: 'Brake pad replacement not urgent — 55% wear.' },
      { kind: 'ok' as const, text: 'Proposed parts match manufacturer references.' },
    ],
    sec_reco: 'My recommendation',
    reco_title: 'Compare before approving',
    reco_text: 'Get a second quote before signing off. STELLA found 2 compatible garages with potential savings.',
    reco_save_label: 'Potential savings',
    reco_save_value: '~€62',
    sec_garages: 'Recommended garages',
    garages: [
      {
        id: 'manuf',
        name: 'Jeep Certified Garage',
        badge: 'Manufacturer-certified',
        reason: 'Genuine parts, keeps your factory warranty intact.',
        rating: 4.8,
        distance: '3.2 km',
        tone: 'purple' as const,
      },
      {
        id: 'ev',
        name: 'EV Expert Garage',
        badge: 'Certified EV independent',
        reason: 'Independent EV specialist — ~12% lower rates.',
        rating: 4.7,
        distance: '5.8 km',
        tone: 'teal' as const,
      },
    ],
    trust_label: 'Trust',
    action_approve: 'Approve estimate',
    action_compare: 'Compare garages',
    action_contact: 'Contact garage',
    toast_approve: 'Estimate approved — the garage has been notified.',
    toast_compare: 'Opening comparison…',
    toast_contact: (name: string) => `Calling ${name}…`,
    modal_close: 'Close',
    modal_pages: 'Page 1 of 2',
    ai_open: 'Open AI assistant',
    ai_title: 'Stella',
    ai_status: 'Online',
    ai_greeting: 'Hi! Any question on this quote? I\'ll give you a straight answer.',
    ai_placeholder: 'Ask me about this quote…',
    ai_suggestions: [
      'Why is this quote too expensive?',
      'Can I negotiate?',
      'Is it urgent?',
    ],
    ai_replies: {
      expensive: 'Labor is ~8% above the regional average and the discs are at manufacturer price. You can save ~€62 by going to EV Expert Garage.',
      negotiate: 'Yes. Ask for a discount on labor (€358) or an alternative quote with OEM-compatible pads — around €40 less.',
      urgent: 'No — your pads are at 55% wear. You can wait 2 to 6 weeks safely. Sort it before your next long trip.',
      default: "I'm looking at this quote with you 👀 Tell me what's holding you back — price, urgency, labor?",
    },
  },
} as const;

// Mock quote data (same across languages)
const QUOTE = {
  total: 782,
  parts: 424,
  labor: 358,
  verdict: 'high' as Verdict,
  urgency: 'medium' as Urgency,
  // Detailed lines shown inside the preview modal
  lines: [
    { label_fr: 'Plaquettes de frein avant', label_en: 'Front brake pads', amount: 168 },
    { label_fr: 'Disques de frein avant', label_en: 'Front brake discs', amount: 256 },
    { label_fr: 'Main d\'œuvre (2,5 h)', label_en: 'Labor (2.5 h)', amount: 358 },
  ],
};

type Step = 'input' | 'manual' | 'uploading' | 'analysis';
type ManualLine = { id: string; label: string; amount: string };

let lineIdCounter = 0;
const newLineId = () => `line_${Date.now()}_${++lineIdCounter}`;

const StellaGarage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('fr');

  const vehicleTag = (() => {
    try {
      const raw = window.sessionStorage.getItem('stella:vehicle');
      if (raw) {
        const v = JSON.parse(raw) as { brand?: string; model?: string; fuel?: string };
        const name = [v.brand, v.model].filter(Boolean).join(' ');
        const fuelLabel = v.fuel ? ` · ${v.fuel}` : '';
        return name ? `${name}${fuelLabel}` : null;
      }
    } catch { /* noop */ }
    return null;
  })();
  const [docOpen, setDocOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('input');
  const [docFilename, setDocFilename] = useState<string | null>(null);
  const [manualLines, setManualLines] = useState<ManualLine[]>([
    { id: newLineId(), label: '', amount: '' },
  ]);
  const toastTimer = useRef<number | null>(null);
  const uploadTimer = useRef<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const t = I18N[lang];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
    };
  }, []);

  const startUpload = useCallback((filename: string) => {
    setDocFilename(filename);
    setStep('uploading');
    if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
    uploadTimer.current = window.setTimeout(() => setStep('analysis'), 1400);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startUpload(file.name);
    // reset input so the same file can be picked again later
    e.target.value = '';
  };

  const manualTotal = manualLines.reduce((acc, l) => {
    const n = parseFloat(l.amount.replace(',', '.'));
    return acc + (isNaN(n) ? 0 : n);
  }, 0);

  const manualValid = manualLines.some(
    (l) => l.label.trim().length > 0 && parseFloat(l.amount.replace(',', '.')) > 0
  );

  const addLine = () => setManualLines((v) => [...v, { id: newLineId(), label: '', amount: '' }]);
  const removeLine = (id: string) =>
    setManualLines((v) => (v.length <= 1 ? v : v.filter((l) => l.id !== id)));
  const updateLine = (id: string, patch: Partial<ManualLine>) =>
    setManualLines((v) => v.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const submitManual = () => {
    if (!manualValid) return;
    startUpload(lang === 'fr' ? 'devis-saisi-manuellement.txt' : 'quote-manual-entry.txt');
  };

  const resetToInput = () => {
    setStep('input');
    setDocFilename(null);
    setManualLines([{ id: newLineId(), label: '', amount: '' }]);
  };

  // === AI assistant popup ===
  type AiMsg = { id: string; sender: 'user' | 'ai'; text: string };
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<AiMsg[]>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const aiTimer = useRef<number | null>(null);
  const aiThreadRef = useRef<HTMLDivElement>(null);

  const aiReplyFor = useCallback((raw: string): string => {
    const s = raw.toLowerCase();
    const r = I18N[lang].ai_replies;
    if (/(cher|expensive|trop|above|élev|elev|high)/.test(s)) return r.expensive;
    if (/(n[ée]gocier|negotiate|discount|discount|rabais|remise)/.test(s)) return r.negotiate;
    if (/(urgent|urgence|wait|attendre|delay|retard)/.test(s)) return r.urgent;
    return r.default;
  }, [lang]);

  const sendAi = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg: AiMsg = { id: `u_${Date.now()}_${Math.random()}`, sender: 'user', text };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiTyping(true);
    if (aiTimer.current) window.clearTimeout(aiTimer.current);
    aiTimer.current = window.setTimeout(() => {
      setAiMessages((prev) => [...prev, {
        id: `a_${Date.now()}_${Math.random()}`, sender: 'ai', text: aiReplyFor(text),
      }]);
      setAiTyping(false);
    }, 800);
  }, [aiReplyFor]);

  // Seed greeting on first open
  useEffect(() => {
    if (aiOpen && aiMessages.length === 0) {
      setAiMessages([{ id: `a_${Date.now()}`, sender: 'ai', text: I18N[lang].ai_greeting }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiOpen]);

  // Auto scroll
  useEffect(() => {
    const el = aiThreadRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [aiMessages, aiTyping, aiOpen]);

  useEffect(() => {
    return () => { if (aiTimer.current) window.clearTimeout(aiTimer.current); };
  }, []);

  useEffect(() => {
    if (!docOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDocOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [docOpen]);

  const verdictKey = QUOTE.verdict;
  const verdictLabel = verdictKey === 'fair' ? t.verdict_fair : verdictKey === 'high' ? t.verdict_high : t.verdict_low;
  const urgencyKey = QUOTE.urgency;
  const partsPct = Math.round((QUOTE.parts / QUOTE.total) * 100);
  const laborPct = 100 - partsPct;

  const formatMoney = (n: number) =>
    lang === 'fr'
      ? `${n.toLocaleString('fr-FR')} €`
      : `€${n.toLocaleString('en-US')}`;

  const insightIcon = (kind: 'warn' | 'info' | 'ok') => {
    if (kind === 'warn') return <AlertTriangle size={14} strokeWidth={2.5} />;
    if (kind === 'ok') return <CircleCheck size={14} strokeWidth={2.5} />;
    return <Lightbulb size={14} strokeWidth={2.5} />;
  };

  return (
    <>
      <style>{`
        .sg-root * { box-sizing: border-box; }
        .sg-root {
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #1A1A2E;
          background: linear-gradient(160deg, #FDF6F0 0%, #FDE8E0 100%);
          min-height: 100vh;
          display: flex; justify-content: center; align-items: flex-start;
          position: relative; overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        .sg-blobs { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
        .sg-blobs::before, .sg-blobs::after {
          content: ""; position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.45;
        }
        .sg-blobs::before {
          width: 320px; height: 320px;
          background: radial-gradient(circle, #FFB5A7 0%, transparent 70%);
          top: -80px; right: -80px;
        }
        .sg-blobs::after {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #D4C5F3 0%, transparent 70%);
          bottom: 10%; left: -100px;
        }
        .sg-app {
          width: 100%; max-width: 420px; min-height: 100vh;
          padding: 16px 20px 32px;
          display: flex; flex-direction: column; gap: 18px;
          position: relative; z-index: 1;
        }
        .sg-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .sg-back {
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
        .sg-back:hover { background: #FFF; }
        .sg-back:active { transform: scale(0.97); }
        .sg-lang {
          display: flex; gap: 4px; padding: 4px;
          background: rgba(255,255,255,0.6); border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(26,26,46,0.04);
        }
        .sg-lang-btn {
          border: none; background: transparent; font-family: inherit;
          font-size: 12px; font-weight: 600; color: #8A7A7A;
          padding: 6px 12px; border-radius: 50px; cursor: pointer;
        }
        .sg-lang-btn.active {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 3px 10px rgba(255,122,112,0.3);
        }

        .sg-mark {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #FF7A70; padding: 5px 12px;
          background: rgba(255,122,112,0.1); border-radius: 50px;
        }
        .sg-h1 {
          font-size: 24px; font-weight: 900; line-height: 1.2;
          letter-spacing: -0.4px; color: #1A1A2E;
          margin: 6px 0 4px;
        }
        .sg-sub {
          font-size: 14px; font-weight: 500;
          color: #8A7A7A; line-height: 1.5; margin: 0;
        }

        /* Input step — 3 option cards */
        .sg-input-grid {
          display: flex; flex-direction: column; gap: 10px;
        }
        .sg-input-card {
          width: 100%;
          display: flex; align-items: center; gap: 12px;
          font-family: inherit;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px 16px;
          cursor: pointer;
          text-align: left;
          box-shadow: 0 8px 20px rgba(26,26,46,0.05);
          transition: transform 150ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .sg-input-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 26px rgba(26,26,46,0.08);
        }
        .sg-input-card.coral:hover { border-color: rgba(255,122,112,0.45); }
        .sg-input-card.purple:hover { border-color: rgba(107,78,155,0.45); }
        .sg-input-card.teal:hover { border-color: rgba(23,133,108,0.45); }
        .sg-input-card:active { transform: translateY(0); }
        .sg-input-ico {
          flex-shrink: 0;
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .sg-input-card.coral .sg-input-ico {
          background: linear-gradient(135deg, #FF8F85 0%, #FF7A70 100%);
          color: #FFF;
          box-shadow: 0 8px 18px rgba(255,122,112,0.35);
        }
        .sg-input-card.purple .sg-input-ico {
          background: linear-gradient(135deg, #7B5CAF 0%, #6B4E9B 100%);
          color: #FFF;
          box-shadow: 0 8px 18px rgba(107,78,155,0.3);
        }
        .sg-input-card.teal .sg-input-ico {
          background: linear-gradient(135deg, #2BB8A6 0%, #17856C 100%);
          color: #FFF;
          box-shadow: 0 8px 18px rgba(23,133,108,0.3);
        }
        .sg-input-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .sg-input-title {
          font-size: 14.5px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sg-input-sub {
          font-size: 12.5px; font-weight: 600; color: #8A7A7A;
        }
        .sg-input-arrow { flex-shrink: 0; color: #B8ACAC; transition: transform 200ms ease, color 200ms ease; }
        .sg-input-card:hover .sg-input-arrow { transform: translateX(3px); color: #FF7A70; }
        .sg-input-example {
          align-self: center;
          margin-top: 4px;
          font-family: inherit; background: transparent; border: none;
          font-size: 12.5px; font-weight: 700; color: #6B4E9B;
          cursor: pointer; padding: 8px 12px;
          text-decoration: underline; text-underline-offset: 3px;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sg-input-example:hover { color: #FF7A70; }

        /* Manual form */
        .sg-manual {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 10px 24px rgba(26,26,46,0.05);
          display: flex; flex-direction: column; gap: 12px;
        }
        .sg-manual-row {
          display: flex; gap: 8px; align-items: flex-end;
          background: #FDF6F0;
          border-radius: 12px;
          padding: 10px;
        }
        .sg-manual-field {
          display: flex; flex-direction: column; gap: 4px;
          min-width: 0;
        }
        .sg-manual-field-label { flex: 1; }
        .sg-manual-field-amount { width: 88px; }
        .sg-manual-l {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.4px;
          text-transform: uppercase; color: #8A7A7A;
          padding-left: 2px;
        }
        .sg-manual-input {
          width: 100%;
          border: 1px solid rgba(26,26,46,0.08);
          background: #FFF;
          border-radius: 10px;
          padding: 9px 12px;
          font-family: inherit; font-size: 13px; font-weight: 700;
          color: #1A1A2E;
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }
        .sg-manual-input::placeholder { color: #B8ACAC; font-weight: 500; }
        .sg-manual-input:focus {
          border-color: #FF7A70;
          box-shadow: 0 0 0 3px rgba(255,122,112,0.15);
        }
        .sg-manual-remove {
          flex-shrink: 0;
          border: none; background: rgba(229,57,53,0.1); color: #C2221B;
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; margin-bottom: 4px;
          transition: background 150ms ease;
        }
        .sg-manual-remove:hover { background: rgba(229,57,53,0.2); }
        .sg-manual-add {
          align-self: flex-start;
          font-family: inherit; background: transparent; border: 1.5px dashed rgba(255,122,112,0.5);
          color: #FF7A70;
          padding: 8px 14px; border-radius: 50px;
          font-size: 12.5px; font-weight: 800;
          display: inline-flex; align-items: center; gap: 6px;
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease;
        }
        .sg-manual-add:hover {
          background: #FFF5F2;
          border-color: #FF7A70;
        }
        .sg-manual-total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 10px;
          border-top: 1px dashed rgba(138,122,122,0.3);
          font-size: 14px; font-weight: 900; color: #1A1A2E;
        }
        .sg-manual-actions {
          display: grid; grid-template-columns: auto 1fr; gap: 8px;
          margin-top: 2px;
        }
        .sg-manual-actions .sg-action.ghost { width: auto; padding: 13px 18px; }
        .sg-action:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        /* Uploading state */
        .sg-uploading {
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 28px 20px;
          box-shadow: 0 10px 24px rgba(26,26,46,0.05);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          text-align: center;
        }
        .sg-uploading-ico {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 12px 28px rgba(255,122,112,0.35);
          margin-bottom: 4px;
        }
        .sg-uploading-ico svg { animation: sg-spin 1s linear infinite; }
        @keyframes sg-spin { to { transform: rotate(360deg); } }
        .sg-uploading-title {
          font-size: 15px; font-weight: 900; color: #1A1A2E;
        }
        .sg-uploading-sub {
          font-size: 12.5px; font-weight: 600; color: #8A7A7A;
        }
        .sg-uploading-bar {
          margin-top: 10px;
          width: 80%;
          height: 6px; background: rgba(26,26,46,0.06);
          border-radius: 50px; overflow: hidden;
        }
        .sg-uploading-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF7A70 0%, #6B4E9B 100%);
          border-radius: 50px;
          animation: sg-progress 1.4s ease-in-out forwards;
        }
        @keyframes sg-progress {
          from { width: 8%; }
          to { width: 100%; }
        }

        /* Document preview */
        .sg-doc {
          display: flex; align-items: center; gap: 12px;
          background: #FFF;
          border: 1px solid rgba(26,26,46,0.06);
          border-radius: 16px;
          padding: 14px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: transform 150ms ease, box-shadow 180ms ease, border-color 180ms ease;
          box-shadow: 0 8px 20px rgba(26,26,46,0.05);
        }
        .sg-doc:hover {
          border-color: rgba(255,122,112,0.35);
          box-shadow: 0 14px 26px rgba(26,26,46,0.08);
          transform: translateY(-1px);
        }
        .sg-doc:active { transform: translateY(0); }
        .sg-doc-thumb {
          flex-shrink: 0;
          width: 56px; height: 72px; border-radius: 10px;
          background: linear-gradient(160deg, #FFF 0%, #FDF0E8 100%);
          border: 1px solid rgba(26,26,46,0.08);
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          color: #FF7A70;
        }
        .sg-doc-thumb::before {
          content: ""; position: absolute; top: 12px; left: 10px; right: 10px; height: 2px;
          background: rgba(26,26,46,0.12); border-radius: 2px;
          box-shadow: 0 6px 0 rgba(26,26,46,0.08), 0 12px 0 rgba(26,26,46,0.08), 0 18px 0 rgba(26,26,46,0.05);
        }
        .sg-doc-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .sg-doc-name {
          font-size: 13.5px; font-weight: 800; color: #1A1A2E;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .sg-doc-meta {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
        }
        .sg-doc-tags {
          display: flex; flex-wrap: wrap; gap: 5px;
          margin-top: 2px;
        }
        .sg-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.2px;
          padding: 3px 8px; border-radius: 50px;
        }
        .sg-tag.ok { background: #DFF5F1; color: #0F6B57; }
        .sg-tag.ev { background: #EEE7F7; color: #4E3A7A; }
        .sg-doc-tap {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.4px;
          color: #FF7A70; text-transform: uppercase;
          display: inline-flex; align-items: center; gap: 3px;
          margin-top: 2px;
        }

        /* Section heading */
        .sg-sec-head {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: -2px;
          padding: 0 2px;
        }
        .sg-sec-ico {
          width: 28px; height: 28px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
        }
        .sg-sec-ico.coral { background: #FFE6E3; color: #FF7A70; }
        .sg-sec-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .sg-sec-ico.teal { background: #DFF5F1; color: #17856C; }
        .sg-sec-title {
          font-size: 12px; font-weight: 800; color: #1A1A2E;
          letter-spacing: 0.4px; text-transform: uppercase;
        }

        /* Summary card */
        .sg-summary {
          background: #FFF;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid rgba(26,26,46,0.06);
          box-shadow: 0 10px 24px rgba(26,26,46,0.05);
          display: flex; flex-direction: column; gap: 14px;
        }
        .sg-summary-top {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .sg-kpi {
          display: flex; flex-direction: column; gap: 3px;
          padding: 12px;
          background: #FDF6F0;
          border-radius: 12px;
        }
        .sg-kpi.verdict.high { background: #FDEFD4; }
        .sg-kpi.verdict.fair { background: #DFF5F1; }
        .sg-kpi.verdict.low { background: #DFF5F1; }
        .sg-kpi-label {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.6px;
          text-transform: uppercase; color: #8A7A7A;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .sg-kpi-value {
          font-size: 20px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.4px;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .sg-kpi.verdict.high .sg-kpi-value { color: #8A5A00; }
        .sg-kpi.verdict.fair .sg-kpi-value,
        .sg-kpi.verdict.low .sg-kpi-value { color: #0F6B57; }
        .sg-kpi-sub {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
          line-height: 1.3;
        }

        /* Breakdown bar */
        .sg-breakdown { display: flex; flex-direction: column; gap: 8px; }
        .sg-breakdown-label {
          font-size: 11px; font-weight: 800; letter-spacing: 0.5px;
          text-transform: uppercase; color: #8A7A7A;
          display: flex; align-items: center; justify-content: space-between;
        }
        .sg-breakdown-bar {
          display: flex; height: 10px; border-radius: 50px; overflow: hidden;
          background: rgba(26,26,46,0.05);
        }
        .sg-breakdown-parts {
          background: linear-gradient(90deg, #FF7A70 0%, #F26158 100%);
          height: 100%;
        }
        .sg-breakdown-labor {
          background: linear-gradient(90deg, #7B5CAF 0%, #6B4E9B 100%);
          height: 100%;
        }
        .sg-breakdown-legend {
          display: flex; justify-content: space-between; gap: 10px;
          font-size: 12px; font-weight: 700;
        }
        .sg-legend-item {
          display: inline-flex; align-items: center; gap: 6px;
          color: #1A1A2E;
        }
        .sg-legend-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .sg-legend-dot.parts { background: #FF7A70; }
        .sg-legend-dot.labor { background: #6B4E9B; }
        .sg-legend-amount { color: #8A7A7A; font-weight: 600; }

        /* Urgency chip row */
        .sg-urgency {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
          padding: 12px;
          border-radius: 12px;
          background: #FDF6F0;
        }
        .sg-urgency.low { background: #DFF5F1; }
        .sg-urgency.medium { background: #FDEFD4; }
        .sg-urgency.high { background: #FFE0DD; }
        .sg-urgency-left { display: flex; flex-direction: column; gap: 2px; }
        .sg-urgency-label {
          font-size: 10.5px; font-weight: 800; letter-spacing: 0.6px;
          text-transform: uppercase; color: #8A7A7A;
        }
        .sg-urgency-value {
          font-size: 15px; font-weight: 900;
          display: inline-flex; align-items: center; gap: 6px;
          color: #1A1A2E;
        }
        .sg-urgency.low .sg-urgency-value { color: #0F6B57; }
        .sg-urgency.medium .sg-urgency-value { color: #8A5A00; }
        .sg-urgency.high .sg-urgency-value { color: #C2221B; }
        .sg-urgency-sub {
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
        }
        .sg-urgency-pill {
          font-size: 18px;
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.7);
          display: flex; align-items: center; justify-content: center;
        }

        /* Insights list */
        .sg-insights {
          background: #FFF;
          border-radius: 16px;
          border: 1px solid rgba(26,26,46,0.06);
          padding: 14px 16px;
          box-shadow: 0 10px 24px rgba(26,26,46,0.05);
          display: flex; flex-direction: column; gap: 10px;
        }
        .sg-insight-row {
          display: flex; align-items: flex-start; gap: 10px;
        }
        .sg-insight-ico {
          flex-shrink: 0;
          width: 26px; height: 26px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .sg-insight-ico.warn { background: #FDEFD4; color: #8A5A00; }
        .sg-insight-ico.ok { background: #DFF5F1; color: #17856C; }
        .sg-insight-ico.info { background: #EEE7F7; color: #6B4E9B; }
        .sg-insight-text {
          font-size: 13px; font-weight: 600; line-height: 1.45;
          color: #1A1A2E;
        }

        /* Reco block */
        .sg-reco {
          background: linear-gradient(135deg, #FF8F85 0%, #FF7A70 100%);
          color: #FFF;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 14px 28px rgba(255,122,112,0.3);
          display: flex; flex-direction: column; gap: 10px;
          position: relative; overflow: hidden;
        }
        .sg-reco::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 90% 0%, rgba(255,255,255,0.22) 0%, transparent 55%);
          pointer-events: none;
        }
        .sg-reco-head {
          display: flex; align-items: center; gap: 10px;
          position: relative; z-index: 1;
        }
        .sg-reco-ico {
          width: 34px; height: 34px; border-radius: 10px;
          background: rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
        }
        .sg-reco-title {
          font-size: 15px; font-weight: 900; letter-spacing: -0.1px;
        }
        .sg-reco-text {
          font-size: 13px; font-weight: 500; line-height: 1.5;
          color: rgba(255,255,255,0.92);
          position: relative; z-index: 1;
          margin: 0;
        }
        .sg-reco-save {
          display: inline-flex; align-items: center; gap: 6px;
          align-self: flex-start;
          background: rgba(255,255,255,0.18);
          padding: 6px 12px; border-radius: 50px;
          font-size: 12px; font-weight: 800;
          border: 1px solid rgba(255,255,255,0.3);
          position: relative; z-index: 1;
        }
        .sg-reco-save strong { font-size: 13px; font-weight: 900; }

        /* Garage cards */
        .sg-garages { display: flex; flex-direction: column; gap: 10px; }
        .sg-garage {
          background: #FFF;
          border-radius: 16px;
          padding: 14px;
          border: 1px solid rgba(26,26,46,0.06);
          box-shadow: 0 8px 20px rgba(26,26,46,0.05);
          display: flex; flex-direction: column; gap: 10px;
        }
        .sg-garage-head {
          display: flex; align-items: center; gap: 10px;
        }
        .sg-garage-ico {
          flex-shrink: 0;
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .sg-garage-ico.purple { background: #EEE7F7; color: #6B4E9B; }
        .sg-garage-ico.teal { background: #DFF5F1; color: #17856C; }
        .sg-garage-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .sg-garage-name {
          font-size: 14px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sg-garage-badge {
          font-size: 11px; font-weight: 700; color: #8A7A7A;
          display: inline-flex; align-items: center; gap: 4px;
        }
        .sg-garage-badge svg { color: #17856C; }
        .sg-garage-trust {
          display: flex; align-items: center; gap: 6px;
          padding: 4px 10px; border-radius: 50px;
          background: #FDF6F0;
          font-size: 11.5px; font-weight: 800;
          color: #1A1A2E;
          flex-shrink: 0;
        }
        .sg-garage-trust svg { color: #F5A524; }
        .sg-garage-reason {
          font-size: 12.5px; font-weight: 600; color: #8A7A7A;
          line-height: 1.45;
        }
        .sg-garage-foot {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px;
        }
        .sg-garage-distance {
          font-size: 11.5px; font-weight: 700; color: #8A7A7A;
        }
        .sg-garage-contact {
          font-family: inherit; border: none; cursor: pointer;
          padding: 8px 14px; border-radius: 50px;
          background: #FFF5F2; color: #FF7A70;
          border: 1.5px solid rgba(255,122,112,0.25);
          font-size: 12px; font-weight: 800;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background 150ms ease, color 150ms ease, border-color 150ms ease;
        }
        .sg-garage-contact:hover {
          background: #FF7A70; color: #FFF; border-color: #FF7A70;
        }

        /* Actions */
        .sg-actions {
          display: flex; flex-direction: column; gap: 10px;
          margin-top: 2px;
        }
        .sg-action {
          font-family: inherit; border: none; cursor: pointer;
          width: 100%;
          padding: 14px 18px; border-radius: 50px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 14px; font-weight: 800;
          transition: transform 150ms ease, background 180ms ease, box-shadow 200ms ease;
        }
        .sg-action.primary {
          background: #FF7A70; color: #FFF;
          box-shadow: 0 10px 22px rgba(255,122,112,0.4);
        }
        .sg-action.primary:hover { background: #F26158; }
        .sg-action.ghost {
          background: #FFF;
          color: #1A1A2E;
          border: 1.5px solid rgba(26,26,46,0.08);
        }
        .sg-action.ghost:hover {
          border-color: #6B4E9B;
          color: #6B4E9B;
        }
        .sg-action:active { transform: scale(0.99); }

        /* Document modal */
        .sg-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(26,26,46,0.55);
          backdrop-filter: blur(6px);
          z-index: 100;
          display: flex; align-items: flex-end; justify-content: center;
          opacity: 0; pointer-events: none;
          transition: opacity 200ms ease;
        }
        .sg-modal-overlay.open { opacity: 1; pointer-events: auto; }
        .sg-modal {
          width: 100%; max-width: 420px;
          background: #FDF6F0;
          border-radius: 24px 24px 0 0;
          padding: 10px 20px 24px;
          max-height: 92vh; overflow-y: auto;
          transform: translateY(100%);
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1);
        }
        .sg-modal-overlay.open .sg-modal { transform: translateY(0); }
        .sg-modal-grip {
          width: 40px; height: 4px; border-radius: 2px;
          background: #B8ACAC; margin: 0 auto 14px;
        }
        .sg-modal-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .sg-modal-title {
          font-size: 17px; font-weight: 900; color: #1A1A2E;
        }
        .sg-modal-close {
          border: none; background: rgba(26,26,46,0.06);
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #1A1A2E; cursor: pointer;
          transition: background 150ms ease;
        }
        .sg-modal-close:hover { background: rgba(26,26,46,0.12); }
        .sg-modal-page {
          background: #FFF;
          border-radius: 14px;
          padding: 18px;
          border: 1px solid rgba(26,26,46,0.08);
          box-shadow: 0 10px 26px rgba(26,26,46,0.1);
          display: flex; flex-direction: column; gap: 12px;
        }
        .sg-modal-logo {
          font-size: 11px; font-weight: 800; letter-spacing: 1.4px;
          text-transform: uppercase; color: #6B4E9B;
        }
        .sg-modal-vehicle {
          font-size: 12.5px; font-weight: 700; color: #8A7A7A;
          border-bottom: 1px dashed rgba(138,122,122,0.3);
          padding-bottom: 10px;
        }
        .sg-modal-lines { display: flex; flex-direction: column; gap: 8px; }
        .sg-modal-line {
          display: flex; justify-content: space-between; gap: 10px;
          font-size: 13px; font-weight: 600; color: #1A1A2E;
        }
        .sg-modal-line-amount { font-weight: 800; }
        .sg-modal-total {
          display: flex; justify-content: space-between; gap: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(26,26,46,0.1);
          font-size: 14px; font-weight: 900; color: #1A1A2E;
        }
        .sg-modal-foot {
          margin-top: 10px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 11.5px; font-weight: 600; color: #8A7A7A;
        }

        /* Floating AI assistant */
        .sg-ai-fab {
          position: fixed;
          right: 18px; bottom: 24px;
          width: 56px; height: 56px; border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(255,122,112,0.45);
          z-index: 150;
          transition: transform 200ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms ease;
        }
        .sg-ai-fab:hover { transform: translateY(-2px) scale(1.02); }
        .sg-ai-fab:active { transform: scale(0.95); }
        .sg-ai-fab.open {
          background: #1A1A2E;
          box-shadow: 0 14px 30px rgba(26,26,46,0.35);
        }
        .sg-ai-fab::before {
          content: ""; position: absolute; inset: -4px; border-radius: 50%;
          border: 2px solid rgba(255,122,112,0.35);
          animation: sg-ai-ring 2.2s ease-out infinite;
          pointer-events: none;
        }
        .sg-ai-fab.open::before { display: none; }
        @keyframes sg-ai-ring {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .sg-ai-fab-dot {
          position: absolute; top: 8px; right: 8px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #FFF;
          box-shadow: 0 0 0 2px #FF7A70;
          animation: sg-ai-pulse 1.3s ease-in-out infinite;
        }
        @keyframes sg-ai-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }

        .sg-ai-pop {
          position: fixed;
          right: 18px; bottom: 92px;
          width: min(340px, calc(100vw - 32px));
          max-height: min(520px, calc(100vh - 140px));
          background: #FFF;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(26,26,46,0.22), 0 0 0 1px rgba(26,26,46,0.06) inset;
          display: flex; flex-direction: column;
          z-index: 140;
          opacity: 0; transform: translateY(12px) scale(0.96);
          transform-origin: bottom right;
          pointer-events: none;
          transition: opacity 220ms ease, transform 220ms cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }
        .sg-ai-pop.open {
          opacity: 1; transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .sg-ai-head {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 14px 12px;
          border-bottom: 1px solid rgba(26,26,46,0.06);
          background: linear-gradient(135deg, rgba(255,122,112,0.08) 0%, rgba(107,78,155,0.08) 100%);
        }
        .sg-ai-avatar {
          flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 14px rgba(255,122,112,0.35);
        }
        .sg-ai-head-text {
          flex: 1; display: flex; flex-direction: column; gap: 1px;
        }
        .sg-ai-name {
          font-size: 14px; font-weight: 900; color: #1A1A2E;
          letter-spacing: -0.1px;
        }
        .sg-ai-status {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: #17856C;
        }
        .sg-ai-status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2BB8A6;
          box-shadow: 0 0 6px rgba(43,184,166,0.7);
        }
        .sg-ai-close {
          flex-shrink: 0;
          border: none; background: rgba(26,26,46,0.06);
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #1A1A2E; cursor: pointer;
          transition: background 150ms ease;
        }
        .sg-ai-close:hover { background: rgba(26,26,46,0.12); }

        .sg-ai-thread {
          flex: 1;
          overflow-y: auto;
          padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
          min-height: 120px;
        }
        .sg-ai-row { display: flex; align-items: flex-end; gap: 6px; }
        .sg-ai-row.user { justify-content: flex-end; }
        .sg-ai-msg-avatar {
          flex-shrink: 0;
          width: 22px; height: 22px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A70 0%, #6B4E9B 100%);
          color: #FFF;
          display: flex; align-items: center; justify-content: center;
        }
        .sg-ai-bubble {
          max-width: 82%;
          padding: 9px 12px;
          border-radius: 14px;
          font-size: 12.5px; font-weight: 600;
          line-height: 1.45;
        }
        .sg-ai-bubble.ai {
          background: #FDF6F0;
          color: #1A1A2E;
          border: 1px solid rgba(26,26,46,0.05);
          border-bottom-left-radius: 6px;
        }
        .sg-ai-bubble.user {
          background: #FF7A70;
          color: #FFF;
          border-bottom-right-radius: 6px;
          box-shadow: 0 4px 10px rgba(255,122,112,0.3);
        }
        .sg-ai-typing {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 12px 14px;
        }
        .sg-ai-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #FF7A70;
          animation: sg-ai-bounce 1.1s ease-in-out infinite;
        }
        .sg-ai-dot:nth-child(2) { animation-delay: 0.15s; }
        .sg-ai-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes sg-ai-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        .sg-ai-suggestions {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 0 14px 10px;
        }
        .sg-ai-chip {
          font-family: inherit; border: none; cursor: pointer;
          background: #FFF; color: #FF7A70;
          border: 1px solid rgba(255,122,112,0.4);
          font-size: 11.5px; font-weight: 700;
          padding: 7px 11px; border-radius: 50px;
          transition: background 150ms ease, color 150ms ease;
        }
        .sg-ai-chip:hover { background: #FF7A70; color: #FFF; }

        .sg-ai-input {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 12px;
          border-top: 1px solid rgba(26,26,46,0.06);
          background: #FFF;
        }
        .sg-ai-field {
          flex: 1; border: 1px solid rgba(26,26,46,0.08);
          background: #FDF6F0;
          border-radius: 50px;
          padding: 9px 14px;
          font-family: inherit; font-size: 12.5px; font-weight: 600;
          color: #1A1A2E;
          outline: none;
          min-width: 0;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .sg-ai-field::placeholder { color: #B8ACAC; font-weight: 500; }
        .sg-ai-field:focus {
          border-color: #FF7A70;
          box-shadow: 0 0 0 3px rgba(255,122,112,0.15);
          background: #FFF;
        }
        .sg-ai-send {
          flex-shrink: 0;
          border: none;
          width: 34px; height: 34px; border-radius: 50%;
          background: #EADFD6; color: #B8ACAC;
          display: flex; align-items: center; justify-content: center;
          cursor: not-allowed;
          transition: background 150ms ease, color 150ms ease, transform 150ms ease;
        }
        .sg-ai-send.enabled {
          background: #FF7A70; color: #FFF; cursor: pointer;
          box-shadow: 0 6px 12px rgba(255,122,112,0.35);
        }
        .sg-ai-send.enabled:active { transform: scale(0.95); }

        /* Toast */
        .sg-toast {
          position: fixed; bottom: 24px; left: 50%;
          transform: translate(-50%, 20px);
          background: #1A1A2E; color: #FFF;
          padding: 12px 22px; border-radius: 50px;
          font-size: 13px; font-weight: 700;
          box-shadow: 0 20px 50px rgba(26,26,46,0.25);
          z-index: 200; opacity: 0;
          transition: transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease;
          pointer-events: none;
        }
        .sg-toast.show { transform: translate(-50%, 0); opacity: 1; }

        @media (min-width: 640px) {
          .sg-app { padding: 24px 20px 40px; }
          .sg-h1 { font-size: 26px; }
        }
      `}</style>

      <div className="sg-root">
        <div className="sg-blobs" aria-hidden="true" />

        <main className="sg-app">
          <div className="sg-top">
            <button
              type="button"
              className="sg-back"
              onClick={() => navigate(-1)}
              aria-label={t.back}
            >
              <ArrowLeft size={15} strokeWidth={2.5} />
              {t.back}
            </button>
            <div className="sg-lang" role="tablist">
              <button
                type="button"
                className={`sg-lang-btn ${lang === 'fr' ? 'active' : ''}`}
                onClick={() => setLang('fr')}
                aria-selected={lang === 'fr'}
              >FR</button>
              <button
                type="button"
                className={`sg-lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
                aria-selected={lang === 'en'}
              >EN</button>
            </div>
          </div>

          <header>
            <span className="sg-mark">
              <Sparkles size={12} strokeWidth={2.5} /> {t.mark}
            </span>
            <h1 className="sg-h1">{step === 'manual' ? t.manual_title : t.title}</h1>
            <p className="sg-sub">{step === 'manual' ? t.manual_sub : step === 'input' ? t.input_sub : t.sub}</p>
          </header>

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,image/*"
            style={{ display: 'none' }}
            onChange={handleFile}
          />

          {step === 'input' && (
            <section className="sg-input-grid">
              <button type="button" className="sg-input-card coral" onClick={() => photoInputRef.current?.click()}>
                <span className="sg-input-ico"><Camera size={22} strokeWidth={2.5} /></span>
                <span className="sg-input-text">
                  <span className="sg-input-title">{t.input_photo_title}</span>
                  <span className="sg-input-sub">{t.input_photo_sub}</span>
                </span>
                <ChevronRight size={18} strokeWidth={2.5} className="sg-input-arrow" />
              </button>
              <button type="button" className="sg-input-card purple" onClick={() => pdfInputRef.current?.click()}>
                <span className="sg-input-ico"><Upload size={22} strokeWidth={2.5} /></span>
                <span className="sg-input-text">
                  <span className="sg-input-title">{t.input_pdf_title}</span>
                  <span className="sg-input-sub">{t.input_pdf_sub}</span>
                </span>
                <ChevronRight size={18} strokeWidth={2.5} className="sg-input-arrow" />
              </button>
              <button type="button" className="sg-input-card teal" onClick={() => setStep('manual')}>
                <span className="sg-input-ico"><Pencil size={22} strokeWidth={2.5} /></span>
                <span className="sg-input-text">
                  <span className="sg-input-title">{t.input_manual_title}</span>
                  <span className="sg-input-sub">{t.input_manual_sub}</span>
                </span>
                <ChevronRight size={18} strokeWidth={2.5} className="sg-input-arrow" />
              </button>
              <button type="button" className="sg-input-example" onClick={() => setStep('analysis')}>
                <Sparkles size={13} strokeWidth={2.5} />
                {t.input_example}
              </button>
            </section>
          )}

          {step === 'manual' && (
            <section className="sg-manual">
              {manualLines.map((line, idx) => (
                <div key={line.id} className="sg-manual-row">
                  <div className="sg-manual-field sg-manual-field-label">
                    <label className="sg-manual-l" htmlFor={`m-l-${line.id}`}>{t.manual_line_label}</label>
                    <input
                      id={`m-l-${line.id}`}
                      type="text"
                      className="sg-manual-input"
                      value={line.label}
                      onChange={(e) => updateLine(line.id, { label: e.target.value })}
                      placeholder={t.manual_line_ph}
                    />
                  </div>
                  <div className="sg-manual-field sg-manual-field-amount">
                    <label className="sg-manual-l" htmlFor={`m-a-${line.id}`}>{t.manual_amount_label}</label>
                    <input
                      id={`m-a-${line.id}`}
                      type="text"
                      inputMode="decimal"
                      className="sg-manual-input"
                      value={line.amount}
                      onChange={(e) => updateLine(line.id, { amount: e.target.value })}
                      placeholder={t.manual_amount_ph}
                    />
                  </div>
                  {manualLines.length > 1 && (
                    <button
                      type="button"
                      className="sg-manual-remove"
                      onClick={() => removeLine(line.id)}
                      aria-label="Remove line"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="sg-manual-add" onClick={addLine}>
                <Plus size={15} strokeWidth={3} />
                {t.manual_add_line}
              </button>
              <div className="sg-manual-total-row">
                <span>{t.manual_total}</span>
                <span>{formatMoney(Math.round(manualTotal))}</span>
              </div>
              <div className="sg-manual-actions">
                <button type="button" className="sg-action ghost" onClick={resetToInput}>
                  <ArrowLeft size={15} strokeWidth={2.5} />
                  {t.manual_back}
                </button>
                <button
                  type="button"
                  className="sg-action primary"
                  disabled={!manualValid}
                  onClick={submitManual}
                >
                  <Sparkles size={15} strokeWidth={2.5} />
                  {t.manual_cta}
                </button>
              </div>
            </section>
          )}

          {step === 'uploading' && (
            <section className="sg-uploading">
              <div className="sg-uploading-ico"><Loader2 size={22} strokeWidth={2.5} /></div>
              <span className="sg-uploading-title">{t.uploading}</span>
              <span className="sg-uploading-sub">{t.uploading_sub}</span>
              <div className="sg-uploading-bar"><div className="sg-uploading-fill" /></div>
            </section>
          )}

          {step === 'analysis' && (<>

          {/* Document preview */}
          <button
            type="button"
            className="sg-doc"
            onClick={() => setDocOpen(true)}
            aria-label={t.preview_tap}
          >
            <span className="sg-doc-thumb" aria-hidden="true">
              <FileText size={20} strokeWidth={2.2} />
            </span>
            <div className="sg-doc-body">
              <span className="sg-doc-name">{docFilename || t.preview_filename}</span>
              <span className="sg-doc-meta">{t.preview_meta}</span>
              <div className="sg-doc-tags">
                <span className="sg-tag ok">
                  <BadgeCheck size={11} strokeWidth={3} /> {t.status_analyzed}
                </span>
                <span className="sg-tag ev">
                  <Zap size={11} strokeWidth={3} /> {vehicleTag ?? t.vehicle_tag}
                </span>
              </div>
              <span className="sg-doc-tap">
                {t.preview_tap} <ChevronRight size={11} strokeWidth={3} />
              </span>
            </div>
          </button>

          {/* Summary */}
          <div className="sg-sec-head">
            <span className="sg-sec-ico coral"><Scale size={14} strokeWidth={2.5} /></span>
            <span className="sg-sec-title">{t.sec_summary}</span>
          </div>
          <section className="sg-summary">
            <div className="sg-summary-top">
              <div className="sg-kpi">
                <span className="sg-kpi-label"><Wallet size={11} strokeWidth={3} /> {t.total_label}</span>
                <span className="sg-kpi-value">{formatMoney(QUOTE.total)}</span>
                <span className="sg-kpi-sub">{t.total_sub}</span>
              </div>
              <div className={`sg-kpi verdict ${verdictKey}`}>
                <span className="sg-kpi-label"><Scale size={11} strokeWidth={3} /> {t.verdict_label}</span>
                <span className="sg-kpi-value">{verdictLabel}</span>
                <span className="sg-kpi-sub">{t.verdict_sub[verdictKey]}</span>
              </div>
            </div>

            <div className="sg-breakdown">
              <div className="sg-breakdown-label">
                <span>{t.breakdown_label}</span>
                <span style={{ color: '#1A1A2E', fontWeight: 800 }}>{formatMoney(QUOTE.total)}</span>
              </div>
              <div className="sg-breakdown-bar" aria-hidden="true">
                <div className="sg-breakdown-parts" style={{ width: `${partsPct}%` }} />
                <div className="sg-breakdown-labor" style={{ width: `${laborPct}%` }} />
              </div>
              <div className="sg-breakdown-legend">
                <span className="sg-legend-item">
                  <span className="sg-legend-dot parts" />
                  <Wrench size={12} strokeWidth={2.5} style={{ color: '#FF7A70' }} />
                  {t.parts_label}
                  <span className="sg-legend-amount">· {formatMoney(QUOTE.parts)} · {partsPct}%</span>
                </span>
                <span className="sg-legend-item">
                  <span className="sg-legend-dot labor" />
                  <User size={12} strokeWidth={2.5} style={{ color: '#6B4E9B' }} />
                  {t.labor_label}
                  <span className="sg-legend-amount">· {formatMoney(QUOTE.labor)} · {laborPct}%</span>
                </span>
              </div>
            </div>

            <div className={`sg-urgency ${urgencyKey}`}>
              <div className="sg-urgency-left">
                <span className="sg-urgency-label">
                  <Clock size={11} strokeWidth={3} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {t.urgency_label}
                </span>
                <span className="sg-urgency-value">{t.urgency[urgencyKey]}</span>
                <span className="sg-urgency-sub">{t.urgency_sub[urgencyKey]}</span>
              </div>
              <span className="sg-urgency-pill" aria-hidden="true">
                {urgencyKey === 'high' ? '🔴' : urgencyKey === 'medium' ? '🟡' : '🟢'}
              </span>
            </div>
          </section>

          {/* Insights */}
          <div className="sg-sec-head">
            <span className="sg-sec-ico purple"><Lightbulb size={14} strokeWidth={2.5} /></span>
            <span className="sg-sec-title">{t.sec_insights}</span>
          </div>
          <section className="sg-insights">
            {t.insights.map((ins, i) => (
              <div key={i} className="sg-insight-row">
                <span className={`sg-insight-ico ${ins.kind}`}>
                  {insightIcon(ins.kind)}
                </span>
                <span className="sg-insight-text">{ins.text}</span>
              </div>
            ))}
          </section>

          {/* Recommendation */}
          <div className="sg-sec-head">
            <span className="sg-sec-ico coral"><Sparkles size={14} strokeWidth={2.5} /></span>
            <span className="sg-sec-title">{t.sec_reco}</span>
          </div>
          <section className="sg-reco">
            <div className="sg-reco-head">
              <span className="sg-reco-ico">
                <GitCompareArrows size={18} strokeWidth={2.5} />
              </span>
              <span className="sg-reco-title">{t.reco_title}</span>
            </div>
            <p className="sg-reco-text">{t.reco_text}</p>
            <span className="sg-reco-save">
              <Wallet size={13} strokeWidth={3} />
              {t.reco_save_label} · <strong>{t.reco_save_value}</strong>
            </span>
          </section>

          {/* Partner garages */}
          <div className="sg-sec-head">
            <span className="sg-sec-ico teal"><ShieldCheck size={14} strokeWidth={2.5} /></span>
            <span className="sg-sec-title">{t.sec_garages}</span>
          </div>
          <div className="sg-garages">
            {t.garages.map((g) => (
              <article key={g.id} className="sg-garage">
                <div className="sg-garage-head">
                  <span className={`sg-garage-ico ${g.tone}`}>
                    {g.id === 'manuf'
                      ? <Factory size={18} strokeWidth={2.5} />
                      : <Leaf size={18} strokeWidth={2.5} />}
                  </span>
                  <div className="sg-garage-body">
                    <span className="sg-garage-name">{g.name}</span>
                    <span className="sg-garage-badge">
                      <BadgeCheck size={12} strokeWidth={2.5} />
                      {g.badge}
                    </span>
                  </div>
                  <span className="sg-garage-trust">
                    <Star size={12} strokeWidth={2.5} fill="#F5A524" />
                    {g.rating.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </span>
                </div>
                <p className="sg-garage-reason">{g.reason}</p>
                <div className="sg-garage-foot">
                  <span className="sg-garage-distance">📍 {g.distance}</span>
                  <button
                    type="button"
                    className="sg-garage-contact"
                    onClick={() => showToast(t.toast_contact(g.name))}
                  >
                    <Phone size={12} strokeWidth={2.8} />
                    {t.action_contact}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Actions */}
          <div className="sg-actions">
            <button
              type="button"
              className="sg-action primary"
              onClick={() => showToast(t.toast_approve)}
            >
              <Check size={16} strokeWidth={3} />
              {t.action_approve}
            </button>
            <button
              type="button"
              className="sg-action ghost"
              onClick={() => showToast(t.toast_compare)}
            >
              <GitCompareArrows size={15} strokeWidth={2.5} />
              {t.action_compare}
            </button>
          </div>
          </>)}
        </main>

        {/* Document modal */}
        <div
          className={`sg-modal-overlay ${docOpen ? 'open' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) setDocOpen(false); }}
        >
          <div className="sg-modal" role="dialog" aria-modal="true" aria-label={t.preview_filename}>
            <div className="sg-modal-grip" />
            <div className="sg-modal-head">
              <span className="sg-modal-title">{t.preview_filename}</span>
              <button
                type="button"
                className="sg-modal-close"
                onClick={() => setDocOpen(false)}
                aria-label={t.modal_close}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="sg-modal-page">
              <div className="sg-modal-logo">AUTO GARAGE · Paris 15e</div>
              <div className="sg-modal-vehicle">{vehicleTag ?? t.vehicle_tag}</div>
              <div className="sg-modal-lines">
                {QUOTE.lines.map((l, i) => (
                  <div key={i} className="sg-modal-line">
                    <span>{lang === 'fr' ? l.label_fr : l.label_en}</span>
                    <span className="sg-modal-line-amount">{formatMoney(l.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="sg-modal-total">
                <span>{t.total_label}</span>
                <span>{formatMoney(QUOTE.total)}</span>
              </div>
            </div>
            <div className="sg-modal-foot">
              <span>{t.modal_pages}</span>
              <span>{t.preview_meta}</span>
            </div>
          </div>
        </div>

        {/* Floating AI assistant — docked right */}
        <button
          type="button"
          className={`sg-ai-fab ${aiOpen ? 'open' : ''}`}
          onClick={() => setAiOpen((v) => !v)}
          aria-label={t.ai_open}
          aria-expanded={aiOpen}
        >
          {aiOpen
            ? <X size={20} strokeWidth={2.8} />
            : <MessageCircle size={20} strokeWidth={2.5} />}
          {!aiOpen && <span className="sg-ai-fab-dot" aria-hidden="true" />}
        </button>

        <div className={`sg-ai-pop ${aiOpen ? 'open' : ''}`} role="dialog" aria-label={t.ai_title}>
          <div className="sg-ai-head">
            <span className="sg-ai-avatar" aria-hidden="true">
              <Sparkles size={16} strokeWidth={2.5} />
            </span>
            <div className="sg-ai-head-text">
              <span className="sg-ai-name">{t.ai_title}</span>
              <span className="sg-ai-status">
                <span className="sg-ai-status-dot" />
                {t.ai_status}
              </span>
            </div>
            <button
              type="button"
              className="sg-ai-close"
              onClick={() => setAiOpen(false)}
              aria-label={t.modal_close}
            >
              <X size={14} strokeWidth={2.8} />
            </button>
          </div>
          <div className="sg-ai-thread" ref={aiThreadRef}>
            {aiMessages.map((m) => (
              <div key={m.id} className={`sg-ai-row ${m.sender}`}>
                {m.sender === 'ai' && (
                  <span className="sg-ai-msg-avatar" aria-hidden="true">
                    <Sparkles size={11} strokeWidth={2.5} />
                  </span>
                )}
                <div className={`sg-ai-bubble ${m.sender}`}>{m.text}</div>
              </div>
            ))}
            {aiTyping && (
              <div className="sg-ai-row ai">
                <span className="sg-ai-msg-avatar" aria-hidden="true">
                  <Sparkles size={11} strokeWidth={2.5} />
                </span>
                <div className="sg-ai-bubble ai sg-ai-typing">
                  <span className="sg-ai-dot" />
                  <span className="sg-ai-dot" />
                  <span className="sg-ai-dot" />
                </div>
              </div>
            )}
          </div>
          {aiMessages.length <= 1 && !aiTyping && (
            <div className="sg-ai-suggestions">
              {t.ai_suggestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  className="sg-ai-chip"
                  onClick={() => sendAi(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <form
            className="sg-ai-input"
            onSubmit={(e) => { e.preventDefault(); sendAi(aiInput); }}
          >
            <input
              type="text"
              className="sg-ai-field"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder={t.ai_placeholder}
              aria-label={t.ai_placeholder}
            />
            <button
              type="submit"
              className={`sg-ai-send ${aiInput.trim().length > 0 ? 'enabled' : ''}`}
              disabled={aiInput.trim().length === 0}
              aria-label="Send"
            >
              <Send size={14} strokeWidth={2.8} />
            </button>
          </form>
        </div>

        <div className={`sg-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
};

export default StellaGarage;
