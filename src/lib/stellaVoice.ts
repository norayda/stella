/**
 * Shared Stella voice utility.
 * Priority 1: ElevenLabs "Rachel" voice (only if an API key is provided at runtime).
 * Priority 2: Web Speech API with optimized settings and curated female voice list.
 *
 * API key is read at call-time from (in order):
 *   - window.STELLA_ELEVENLABS_API_KEY
 *   - localStorage['stella:elevenlabs_key']
 * No key is ever hardcoded — safe for frontend-only prototypes.
 */

export type VoiceLang = 'fr' | 'en';

const ELEVENLABS_RACHEL_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

const FEMALE_VOICE_HINTS: Record<VoiceLang, string[]> = {
  fr: ['Amélie', 'Audrey', 'Marie', 'Google français', 'Microsoft Julie'],
  en: ['Samantha', 'Victoria', 'Karen', 'Google US English', 'Microsoft Zira'],
};

const FEMALE_FALLBACK_PATTERN =
  /(female|femme|woman|samantha|amelie|amélie|victoria|marie|audrey|virginie|karen|zira|aria|jenny|hortense|julie)/i;

const WEB_SPEECH_SETTINGS = {
  rate: 0.82,
  pitch: 1.15,
  volume: 1,
} as const;

let audioRef: HTMLAudioElement | null = null;

function getApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtimeKey = (window as any).STELLA_ELEVENLABS_API_KEY as string | undefined;
  if (runtimeKey && runtimeKey.trim()) return runtimeKey.trim();
  try {
    const stored = window.localStorage.getItem('stella:elevenlabs_key');
    if (stored && stored.trim()) return stored.trim();
  } catch {
    /* localStorage unavailable */
  }
  return null;
}

async function trySpeakElevenLabs(text: string, lang: VoiceLang): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey) return false;
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_RACHEL_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.35,
            use_speaker_boost: true,
          },
        }),
      }
    );
    if (!res.ok) return false;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    stopSpeaking();
    const audio = new Audio(url);
    audioRef = audio;
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

function waitForVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const current = window.speechSynthesis.getVoices();
    if (current.length > 0) {
      resolve(current);
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.speechSynthesis.removeEventListener('voiceschanged', onChange);
      resolve(window.speechSynthesis.getVoices());
    };
    const onChange = () => finish();
    window.speechSynthesis.addEventListener('voiceschanged', onChange);
    window.setTimeout(finish, timeoutMs);
  });
}

function pickFemaleVoice(voices: SpeechSynthesisVoice[], lang: VoiceLang): SpeechSynthesisVoice | null {
  const langPrefix = lang === 'fr' ? 'fr' : 'en';
  const hints = FEMALE_VOICE_HINTS[lang];
  const sameLang = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix));

  for (const hint of hints) {
    const h = hint.toLowerCase();
    const match = sameLang.find((v) => v.name.toLowerCase().includes(h));
    if (match) return match;
  }
  const patternMatch = sameLang.find((v) => FEMALE_FALLBACK_PATTERN.test(v.name));
  if (patternMatch) return patternMatch;
  return sameLang[0] || voices[0] || null;
}

async function speakWithWebSpeech(text: string, lang: VoiceLang): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = await waitForVoices();
  const voice = pickFemaleVoice(voices, lang);
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    utter.rate = WEB_SPEECH_SETTINGS.rate;
    utter.pitch = WEB_SPEECH_SETTINGS.pitch;
    utter.volume = WEB_SPEECH_SETTINGS.volume;
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
  } catch {
    /* swallow */
  }
}

export async function speakStella(text: string, lang: VoiceLang): Promise<void> {
  if (!text || typeof window === 'undefined') return;
  stopSpeaking();
  const ok = await trySpeakElevenLabs(text, lang);
  if (!ok) {
    await speakWithWebSpeech(text, lang);
  }
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  if (audioRef) {
    try {
      audioRef.pause();
      audioRef.currentTime = 0;
    } catch {
      /* noop */
    }
    audioRef = null;
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  }
}

export function buildWelcomeMessage(name: string, lang: VoiceLang): string {
  const fallback = lang === 'fr' ? 'toi' : 'you';
  const safeName = (name || '').trim() || fallback;
  return lang === 'fr'
    ? `Coucou ${safeName} ! Je suis Stella, ton assistante personnelle. Je suis là pour toi, quand tu veux !`
    : `Hey ${safeName}! I'm Stella, your personal assistant. I'm here for you, whenever you need!`;
}
