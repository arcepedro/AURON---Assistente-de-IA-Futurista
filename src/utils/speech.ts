/**
 * AURON Speech Recognition and Synthesis (PT-BR)
 * Native Web Speech API with configurable, browser-available voices.
 */
export interface SpeechController {
  isListening: boolean;
  isSpeaking: boolean;
  supported: { recognition: boolean; synthesis: boolean };
  startListening: (onTranscript: (text: string, isFinal: boolean) => void, onError?: (err: any) => void) => void;
  stopListening: () => void;
  speak: (text: string, options?: { rate?: number; pitch?: number; voiceURI?: string; onEnd?: () => void }) => void;
  stopSpeaking: () => void;
  getVoices: () => SpeechSynthesisVoice[];
}

let activeRecognition: any = null;

export function checkSpeechSupport() {
  return {
    recognition: typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window),
    synthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
  };
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices().slice().sort((a, b) => {
    const aPt = /^pt-br$/i.test(a.lang) ? 0 : /^pt/i.test(a.lang) ? 1 : 2;
    const bPt = /^pt-br$/i.test(b.lang) ? 0 : /^pt/i.test(b.lang) ? 1 : 2;
    return aPt - bPt || a.name.localeCompare(b.name);
  });
}

function isPortugueseVoice(voice: SpeechSynthesisVoice): boolean {
  return /^pt(-|$)/i.test(voice.lang) || /portuguese|portugu[eê]s/i.test(voice.name);
}

function maleVoiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  let score = /^pt-br$/i.test(voice.lang) ? 30 : /^pt/i.test(voice.lang) ? 12 : 0;
  if (/daniel|felipe|ricardo|ant[oô]nio|antonio|male|masculino|homem|masculine/i.test(name)) score += 25;
  if (/natural|neural|enhanced|premium/i.test(name)) score += 4;
  if (/female|feminina|mulher/i.test(name)) score -= 30;
  if (voice.default) score += 1;
  return score;
}

export function selectBestPtVoice(selectedURI?: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  if (selectedURI) {
    const selected = voices.find((voice) => voice.voiceURI === selectedURI);
    if (selected) return selected;
  }
  const portuguese = voices.filter(isPortugueseVoice);
  if (portuguese.length) {
    return portuguese.slice().sort((a, b) => maleVoiceScore(b) - maleVoiceScore(a))[0];
  }
  return voices.find((voice) => voice.default) || voices[0] || null;
}

export function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, 'Bloco de código omitido.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/https?:\/\/\S+/g, 'link da web')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[•▪►]/g, ', ')
    .trim();
}

export function speakText(
  text: string,
  options: { rate?: number; pitch?: number; voiceURI?: string; onStart?: () => void; onEnd?: () => void } = {}
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  const synthesis = window.speechSynthesis;
  synthesis.cancel();
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'pt-BR';
  utterance.rate = Math.min(1.3, Math.max(0.8, options.rate ?? 0.9));
  utterance.pitch = Math.min(1.2, Math.max(0.7, options.pitch ?? 0.85));

  const assignVoiceAndSpeak = () => {
    const voice = selectBestPtVoice(options.voiceURI);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'pt-BR';
    }
    utterance.onstart = () => options.onStart?.();
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      options.onEnd?.();
    };
    utterance.onend = finish;
    utterance.onerror = (event) => {
      // "canceled" is expected when the user starts another utterance.
      if ((event as SpeechSynthesisErrorEvent).error !== 'canceled') {
        console.warn('AURON: falha na síntese de voz.', event);
      }
      finish();
    };
    synthesis.speak(utterance);
  };

  // Some browsers only expose voices after voiceschanged or a short delay.
  if (synthesis.getVoices().length) {
    assignVoiceAndSpeak();
  } else {
    let attempts = 0;
    const retry = () => {
      if (synthesis.getVoices().length || attempts >= 8) {
        synthesis.removeEventListener?.('voiceschanged', retry);
        assignVoiceAndSpeak();
        return;
      }
      attempts += 1;
      window.setTimeout(retry, 150);
    };
    synthesis.addEventListener?.('voiceschanged', retry, { once: true });
    window.setTimeout(retry, 150);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function startVoiceRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined') return false;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError?.('Reconhecimento de fala não suportado neste navegador.');
    return false;
  }
  try {
    if (activeRecognition) activeRecognition.abort();
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final) onResult(final, true);
      else if (interim) onResult(interim, false);
    };
    recognition.onerror = (event: any) => {
      console.warn('AURON: erro no reconhecimento de voz:', event.error);
      onError?.(event.error);
    };
    recognition.onend = () => {
      if (activeRecognition === recognition) activeRecognition = null;
      onEnd?.();
    };
    activeRecognition = recognition;
    recognition.start();
    return true;
  } catch (err: any) {
    onError?.(err?.message || 'Falha ao iniciar microfone.');
    return false;
  }
}

export function stopVoiceRecognition() {
  if (!activeRecognition) return;
  try { activeRecognition.stop(); } catch { /* already stopped */ }
  activeRecognition = null;
}
