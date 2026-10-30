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

/**
 * Returns available voices filtered for Portuguese with preference for natural male voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices;
}

/**
 * Selects best matching Brazilian Portuguese voice (preferably male)
 */
export function selectBestPtVoice(selectedURI?: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  if (selectedURI) {
    const found = voices.find((v) => v.voiceURI === selectedURI);
    if (found) return found;
  }

  // Prioritize Brazilian Portuguese male voices
  const ptBrVoices = voices.filter(
    (v) => v.lang.toLowerCase() === 'pt-br' || v.lang.toLowerCase().startsWith('pt')
  );

  // Look for male voice identifiers (Daniel, Felipe, Male, Homem, etc.)
  const malePtVoice = ptBrVoices.find((v) => {
    const n = v.name.toLowerCase();
    return (
      n.includes('daniel') ||
      n.includes('felipe') ||
      n.includes('ricardo') ||
      n.includes('antonio') ||
      n.includes('male') ||
      n.includes('homem')
    );
  });

  if (malePtVoice) return malePtVoice;
  if (ptBrVoices.length > 0) return ptBrVoices[0];

  return voices[0] || null;
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

  window.speechSynthesis.cancel();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = 'pt-BR';
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 0.95; // Slightly deeper authoritative tone

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
    window.speechSynthesis.cancel();
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
