/**
 * AURON Speech Recognition and Synthesis (PT-BR)
 * Leverages native Web Speech API with automatic natural voice selection
 */

export interface SpeechController {
  isListening: boolean;
  isSpeaking: boolean;
  supported: {
    recognition: boolean;
    synthesis: boolean;
  };
  startListening: (onTranscript: (text: string, isFinal: boolean) => void, onError?: (err: any) => void) => void;
  stopListening: () => void;
  speak: (text: string, options?: { rate?: number; pitch?: number; voiceURI?: string; onEnd?: () => void }) => void;
  stopSpeaking: () => void;
  getVoices: () => SpeechSynthesisVoice[];
}

let activeRecognition: any = null;

export function checkSpeechSupport() {
  const recognitionSupported =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const synthesisSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  return {
    recognition: Boolean(recognitionSupported),
    synthesis: Boolean(synthesisSupported),
  };
}

export const DEFAULT_VOICE_CONFIG = {
  rate: 0.90, // Ritmo moderadamente pausado e focado
  pitch: 0.85, // Timbre médio-grave futurista
  profileName: 'Inteligência Artificial Futurista',
  demoPhrase:
    'Saudações, Senhor. Identidade vocal AURON calibrada no perfil inteligência artificial futurista. Timbre médio-grave e cadência operacional em perfeita harmonia.',
};

export interface CategorizedVoice {
  voice: SpeechSynthesisVoice;
  isPtBr: boolean;
  isMale: boolean;
  recommended: boolean;
  displayName: string;
}

/**
 * Checks if a voice name or identifier suggests a male voice
 */
export function isMaleVoiceName(name: string): boolean {
  const n = (name || '').toLowerCase();
  return (
    n.includes('daniel') ||
    n.includes('felipe') ||
    n.includes('ricardo') ||
    n.includes('antonio') ||
    n.includes('homem') ||
    n.includes('male') ||
    n.includes('man') ||
    n.includes('guy') ||
    n.includes('jorge') ||
    n.includes('carlos') ||
    n.includes('pt-br-standard-b') ||
    n.includes('pt-br-wavenet-b')
  );
}

/**
 * Prioritizes and selects the best Brazilian Portuguese voice with preference for natural male timbre
 */
export function selectBestPtVoiceFromList(
  voices: SpeechSynthesisVoice[],
  selectedURI?: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  if (selectedURI) {
    const found = voices.find((v) => v.voiceURI === selectedURI);
    if (found) return found;
  }

  // Score each voice
  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = -1;

  for (const v of voices) {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const name = (v.name || '').toLowerCase();
    const isMale = isMaleVoiceName(name);

    let score = 0;
    if (lang === 'pt-br') {
      score = isMale ? 100 : 70;
    } else if (lang.startsWith('pt')) {
      score = isMale ? 60 : 40;
    } else if (v.default) {
      score = 20;
    } else {
      score = 10;
    }

    if (score > bestScore) {
      bestScore = score;
      bestVoice = v;
    }
  }

  return bestVoice;
}

/**
 * Returns available voices filtered for Portuguese with preference for natural male voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Selects best matching Brazilian Portuguese voice (preferably male)
 */
export function selectBestPtVoice(selectedURI?: string): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();
  return selectBestPtVoiceFromList(voices, selectedURI);
}

/**
 * Categorizes and formats voices for presentation in the UI
 */
export function categorizeVoices(voices: SpeechSynthesisVoice[]): CategorizedVoice[] {
  return voices.map((v) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    const isPtBr = lang === 'pt-br';
    const isPt = lang.startsWith('pt');
    const isMale = isMaleVoiceName(v.name);
    const recommended = isPtBr && isMale;

    let tag = '';
    if (isPtBr) {
      tag = isMale ? ' [PT-BR • Masculino • Recomendado]' : ' [PT-BR]';
    } else if (isPt) {
      tag = isMale ? ' [Português • Masculino]' : ' [Português]';
    } else {
      tag = ` [${v.lang}]`;
    }

    return {
      voice: v,
      isPtBr,
      isMale,
      recommended,
      displayName: `${v.name}${tag}`,
    };
  });
}

/**
 * Clean text before speech synthesis (remove markdown formatting, code blocks, URLs)
 */
export function cleanTextForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, 'Bloco de código omitido.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/https?:\/\/\S+/g, 'link da web')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

/**
 * Speaks text using the SpeechSynthesis API
 */
export function speakText(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  // Cancel any ongoing speech cleanly to prevent overlapping
  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'pt-BR';
  // Futuristic AI Profile: rate 0.90 (paused cadence), pitch 0.85 (medium-deep presence)
  utterance.rate = options.rate ?? DEFAULT_VOICE_CONFIG.rate;
  utterance.pitch = options.pitch ?? DEFAULT_VOICE_CONFIG.pitch;

  const voice = selectBestPtVoice(options.voiceURI);
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('Síntese de voz concluída ou cancelada:', e);
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Starts speech recognition
 */
export function startVoiceRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined') return false;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('Reconhecimento de fala não suportado neste navegador.');
    return false;
  }

  try {
    if (activeRecognition) {
      activeRecognition.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        onResult(final, true);
      } else if (interim) {
        onResult(interim, false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Erro de reconhecimento de voz:', event.error);
      onError?.(event.error);
    };

    recognition.onend = () => {
      activeRecognition = null;
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
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (e) {
      // ignore
    }
    activeRecognition = null;
  }
}
