import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Volume2,
  VolumeX,
  Cpu,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Play,
  Square,
  Sparkles,
  Info,
  Radio,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PersonaSettings } from '../types/index.ts';
import {
  DEFAULT_VOICE_CONFIG,
  getAvailableVoices,
  categorizeVoices,
  speakText,
  stopSpeaking,
  checkSpeechSupport,
} from '../utils/speech.ts';

interface SettingsViewProps {
  settings: PersonaSettings;
  onSaveSettings: (newSettings: PersonaSettings) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetData,
}) => {
  const [formData, setFormData] = useState<PersonaSettings>(settings);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [voiceResetNotice, setVoiceResetNotice] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    const support = checkSpeechSupport();
    setIsSpeechSupported(support.synthesis);

    const loadVoices = () => {
      const voices = getAvailableVoices();
      setAvailableVoices(voices);
    };

    loadVoices();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      stopSpeaking();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleDemoVoice = () => {
    if (isPlayingDemo) {
      stopSpeaking();
      setIsPlayingDemo(false);
      return;
    }

    setIsPlayingDemo(true);
    speakText(DEFAULT_VOICE_CONFIG.demoPhrase, {
      voiceURI: formData.selectedVoiceURI,
      rate: formData.speechRate,
      pitch: formData.speechPitch,
      onStart: () => setIsPlayingDemo(true),
      onEnd: () => setIsPlayingDemo(false),
    });
  };

  const handleResetVoiceDefaults = () => {
    stopSpeaking();
    setIsPlayingDemo(false);
    setFormData((prev) => ({
      ...prev,
      speechRate: DEFAULT_VOICE_CONFIG.rate,
      speechPitch: DEFAULT_VOICE_CONFIG.pitch,
      selectedVoiceURI: '',
    }));
    setVoiceResetNotice(true);
    setTimeout(() => setVoiceResetNotice(false), 2500);
  };

  const categorized = categorizeVoices(availableVoices);
  const ptVoices = categorized.filter((v) => v.isPtBr || v.voice.lang.toLowerCase().startsWith('pt'));
  const otherVoices = categorized.filter((v) => !v.isPtBr && !v.voice.lang.toLowerCase().startsWith('pt'));

  const getRateLabel = (rate: number) => {
    if (rate === 0.90) return '0.90x • Moderadamente Pausado (Padrão IA Futurista)';
    if (rate < 0.85) return `${rate.toFixed(2)}x • Cadência Lenta / Solene`;
    if (rate <= 0.95) return `${rate.toFixed(2)}x • Cadência Ponderada`;
    if (rate <= 1.05) return `${rate.toFixed(2)}x • Cadência Padrão`;
    return `${rate.toFixed(2)}x • Cadência Acelerada`;
  };

  const getPitchLabel = (pitch: number) => {
    if (pitch === 0.85) return '0.85 • Médio-Grave Tecnológico (Padrão IA Futurista)';
    if (pitch < 0.80) return `${pitch.toFixed(2)} • Grave Profundo`;
    if (pitch <= 0.90) return `${pitch.toFixed(2)} • Médio-Grave Confiante`;
    if (pitch <= 1.00) return `${pitch.toFixed(2)} • Tom Natural`;
    return `${pitch.toFixed(2)} • Tom Agudo / Metálico`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#040813] auron-grid-bg relative font-rajdhani">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl auron-panel-border auron-hud-corner shadow-[0_0_20px_rgba(0,240,255,0.06)]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="font-mono-tech text-xs tracking-wider text-cyan-400 uppercase">
            Configuração de Parâmetros & Persona
          </span>
        </div>
        <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mt-1">
          CONFIGURAÇÕES DO <span className="text-cyan-300 auron-text-glow">AURON</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-0.5">
          Ajuste as preferências de voz, tratamento, modelo de inteligência artificial e níveis de segurança.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Section 1: Persona and Treatment */}
        <div className="p-5 sm:p-6 rounded-2xl auron-panel-border space-y-4">
          <div className="flex items-center gap-2 border-b border-cyan-900/30 pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="font-orbitron text-base font-bold text-cyan-200">
              IDENTIDADE & TRATAMENTO DO USUÁRIO
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-tech text-slate-400 mb-1">
                Nome de Preferência
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Ex: Pedro, Comandante"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 font-rajdhani"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-tech text-slate-400 mb-1">
                Título Honorífico de Saudação
              </label>
              <select
                value={formData.honorific}
                onChange={(e) => setFormData({ ...formData, honorific: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 font-rajdhani"
              >
                <option value="Senhor">Senhor</option>
                <option value="Comandante">Comandante</option>
                <option value="Doutor">Doutor</option>
                <option value="Diretor">Diretor</option>
                <option value="Amigo">Amigo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Dedicated Voice Settings - Perfil Inteligência Artificial Futurista */}
        <div className="p-5 sm:p-6 rounded-2xl auron-panel-border space-y-5 relative">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-900/30 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-orbitron text-base font-bold text-cyan-200">
                  PERFIL DE VOZ: INTELIGÊNCIA ARTIFICIAL FUTURISTA
                </h2>
                <p className="text-xs text-slate-400 font-rajdhani">
                  Timbre médio-grave, presença imersiva, ritmo moderadamente pausado e entonação tecnológica.
                </p>
              </div>
            </div>

            {/* Voice Reset and Demo Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleResetVoiceDefaults}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-cyan-900/40 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 font-mono-tech text-xs transition-colors flex items-center gap-1.5"
                title="Restaurar valores de velocidade 0.90 e tom 0.85"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restaurar Padrão</span>
              </button>

              <button
                type="button"
                onClick={handleToggleDemoVoice}
                className={`px-3.5 py-1.5 rounded-lg font-mono-tech text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isPlayingDemo
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.6)] animate-pulse'
                    : 'bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                }`}
              >
                {isPlayingDemo ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Interromper</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Ouvir Demonstração</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Warning if Speech Synthesis not supported */}
          {!isSpeechSupported && (
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Aviso: A API de síntese de voz nativa não foi detectada neste navegador. As respostas serão exibidas no terminal em texto.
              </span>
            </div>
          )}

          {/* Reset Notice Banner */}
          {voiceResetNotice && (
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-xs font-mono-tech flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Perfil IA Futurista restaurado: Velocidade 0.90x e Tom 0.85 (Médio-Grave).</span>
            </div>
          )}

          {/* Voice Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-tech text-slate-400">
                Voz do Sistema (Prioridade: Masculina em Português do Brasil)
              </label>
              <span className="text-[11px] font-mono-tech text-cyan-400">
                {availableVoices.length > 0 ? `${availableVoices.length} vozes detectadas` : 'Carregando vozes...'}
              </span>
            </div>

            <select
              value={formData.selectedVoiceURI}
              onChange={(e) => setFormData({ ...formData, selectedVoiceURI: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 font-rajdhani"
            >
              <option value="">Detecção Automática (Voz Natural Masculina PT-BR Recomendada)</option>

              {ptVoices.length > 0 && (
                <optgroup label="─── Vozes em Português (Recomendadas) ───">
                  {ptVoices.map(({ voice, displayName }) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {displayName}
                    </option>
                  ))}
                </optgroup>
              )}

              {otherVoices.length > 0 && (
                <optgroup label="─── Outras Vozes do Sistema ───">
                  {otherVoices.map(({ voice, displayName }) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {displayName}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            <p className="text-[11px] font-mono-tech text-slate-500">
              O AURON varre o navegador e o sistema operacional selecionando preferencialmente vozes masculinas brasileiras (como Microsoft Daniel, Felipe ou Google Português).
            </p>
          </div>

          {/* Sliders: Rate and Pitch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Speed (Rate) */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/30 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono-tech">
                <span className="text-slate-300 font-semibold">Velocidade (Ritmo)</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px]">
                  {formData.speechRate.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min="0.70"
                max="1.30"
                step="0.05"
                value={formData.speechRate}
                onChange={(e) =>
                  setFormData({ ...formData, speechRate: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-mono-tech text-slate-500">
                <span>0.70x (Lenta)</span>
                <span className="text-cyan-400 font-medium">{getRateLabel(formData.speechRate)}</span>
                <span>1.30x (Rápida)</span>
              </div>
            </div>

            {/* Pitch (Tone) */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/30 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono-tech">
                <span className="text-slate-300 font-semibold">Tom / Timbre (Frequência)</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px]">
                  {formData.speechPitch.toFixed(2)}
                </span>
              </div>

              <input
                type="range"
                min="0.60"
                max="1.20"
                step="0.05"
                value={formData.speechPitch}
                onChange={(e) =>
                  setFormData({ ...formData, speechPitch: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-mono-tech text-slate-500">
                <span>0.60 (Grave)</span>
                <span className="text-cyan-400 font-medium">{getPitchLabel(formData.speechPitch)}</span>
                <span>1.20 (Agudo)</span>
              </div>
            </div>
          </div>

          {/* Auto Speak Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-cyan-900/30">
            <div>
              <span className="font-semibold text-sm text-slate-200">Reprodução Automática de Respostas</span>
              <p className="text-xs text-slate-400">
                Falar imediatamente as respostas geradas pelo AURON utilizando o perfil configurado.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.autoSpeak}
              onChange={(e) => setFormData({ ...formData, autoSpeak: e.target.checked })}
              className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Section 3: AI Engine Model */}
        <div className="p-5 sm:p-6 rounded-2xl auron-panel-border space-y-4">
          <div className="flex items-center gap-2 border-b border-cyan-900/30 pb-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h2 className="font-orbitron text-base font-bold text-cyan-200">
              MOTOR DE INTELIGÊNCIA ARTIFICIAL (GEMINI API)
            </h2>
          </div>

          <div>
            <label className="block text-xs font-mono-tech text-slate-400 mb-1">
              Modelo Selecionado
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 font-rajdhani"
            >
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Padrão Recomendado • Resposta Instantânea &lt; 1s)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (Raciocínio Estendido com Fallback Automático)</option>
            </select>
            <p className="text-[11px] font-mono-tech text-slate-500 mt-1">
              Integrado via servidor Express seguro com o SDK @google/genai oficial. Credenciais gerenciadas estritamente pelo backend.
            </p>
          </div>
        </div>

        {/* Section 4: Security & Confirmations */}
        <div className="p-5 sm:p-6 rounded-2xl auron-panel-border space-y-4">
          <div className="flex items-center gap-2 border-b border-cyan-900/30 pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h2 className="font-orbitron text-base font-bold text-cyan-200">
              POLÍTICA DE SEGURANÇA E CONFIRMAÇÃO
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm text-slate-200">
                Nível de Confirmação de Ações
              </span>
              <p className="text-xs text-slate-400">
                Exigir validação visual com modal de segurança antes de ações destrutivas (excluir memórias, reset de dados).
              </p>
            </div>

            <select
              value={formData.safetyLevel}
              onChange={(e) => setFormData({ ...formData, safetyLevel: e.target.value as any })}
              className="p-2 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-100 text-xs font-mono-tech"
            >
              <option value="estrito">Estrito (Recomendado)</option>
              <option value="moderado">Moderado</option>
            </select>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onResetData}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-900/50 hover:bg-red-950/40 text-red-400 font-mono-tech text-xs transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Resetar Histórico e Cache Local
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-rajdhani font-bold text-base hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span>Configurações Salvas com Sucesso</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
