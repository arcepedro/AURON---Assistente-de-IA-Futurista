import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Volume2,
  Cpu,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Play,
} from 'lucide-react';
import { PersonaSettings } from '../types/index.ts';
import { getAvailableVoices, speakText } from '../utils/speech.ts';

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
  const [voiceTestActive, setVoiceTestActive] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    const voices = getAvailableVoices();
    setAvailableVoices(voices);

    // Some browsers populate voices asynchronously. Clean up the listener on unmount.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synthesis = window.speechSynthesis;
      const refreshVoices = () => setAvailableVoices(getAvailableVoices());
      synthesis.addEventListener?.('voiceschanged', refreshVoices);
      const timer = window.setTimeout(refreshVoices, 250);
      return () => {
        window.clearTimeout(timer);
        synthesis.removeEventListener?.('voiceschanged', refreshVoices);
        synthesis.cancel();
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestVoice = () => {
    if (voiceTestActive && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoiceTestActive(false);
      return;
    }
    setVoiceTestActive(true);
    speakText(
      `Saudações. Eu sou o AURON. Sistemas operacionais. Voz configurada para uma comunicação clara, precisa e natural. Esta é uma demonstração do meu perfil de voz futurista.`,
      {
        voiceURI: formData.selectedVoiceURI,
        rate: formData.speechRate,
        pitch: formData.speechPitch,
        onEnd: () => setVoiceTestActive(false),
      }
    );
  };

  // Put Portuguese voices first, but allow comparing every voice installed on this device.
  const sortedVoices = [...availableVoices].sort((a, b) => {
    const aPt = /^pt(-|$)/i.test(a.lang) ? 0 : 1;
    const bPt = /^pt(-|$)/i.test(b.lang) ? 0 : 1;
    return aPt - bPt || a.name.localeCompare(b.name);
  });

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

        {/* Section 2: Speech & Audio Engine */}
        <div className="p-5 sm:p-6 rounded-2xl auron-panel-border space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <h2 className="font-orbitron text-base font-bold text-cyan-200">
                SINTETIZADOR DE VOZ & ÁUDIO (PT-BR)
              </h2>
            </div>

            <button
              type="button"
              onClick={handleTestVoice}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono-tech text-xs hover:bg-cyan-900 flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3 h-3 text-cyan-400" />
              {voiceTestActive ? 'Parar Teste' : 'Testar Voz'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono-tech text-slate-400 mb-1">
                Voz do Navegador (Prioridade: Masculina em Português)
              </label>
              <select
                value={formData.selectedVoiceURI}
                onChange={(e) => setFormData({ ...formData, selectedVoiceURI: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-100 text-sm focus:outline-none focus:border-cyan-400 font-rajdhani"
              >
                <option value="">Detecção Automática (Voz Natural Masculina PT-BR)</option>
                {sortedVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              <p className="text-[11px] font-mono-tech text-slate-500 mt-1">
                {availableVoices.length === 0
                  ? 'Carregando vozes do sistema… Se nenhuma aparecer, verifique o suporte do navegador e as vozes instaladas no Windows.'
                  : `${availableVoices.length} voz(es) disponíveis neste dispositivo. As vozes em português aparecem primeiro; a seleção manual permite comparar alternativas. A identificação de gênero depende do nome fornecido pelo sistema.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-mono-tech text-slate-400 mb-1">
                  <span>Velocidade de Fala</span>
                  <span className="text-cyan-300">{formData.speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={formData.speechRate}
                  onChange={(e) =>
                    setFormData({ ...formData, speechRate: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-tech text-slate-400 mb-1">
                  <span>Tom / Pitch (Grave / Autoritário)</span>
                  <span className="text-cyan-300">{formData.speechPitch}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.2"
                  step="0.05"
                  value={formData.speechPitch}
                  onChange={(e) =>
                    setFormData({ ...formData, speechPitch: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-slate-200">Reprodução Automática</span>
                <p className="text-xs text-slate-400">
                  Falar as respostas de AURON imediatamente após serem geradas.
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
