import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Cpu,
  Clock,
  Terminal,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { AssistantState, ChatMessage } from '../types/index.ts';
import { AIAvatarCore } from './AIAvatarCore.tsx';
import { speakText, stopSpeaking } from '../utils/speech.ts';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearHistory: () => void;
  state: AssistantState;
  isListening: boolean;
  onToggleVoice: () => void;
  speechSynthesisActive: boolean;
  onToggleSpeechSynthesis: () => void;
  speechVoiceURI?: string;
  speechRate?: number;
  speechPitch?: number;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onClearHistory,
  state,
  isListening,
  onToggleVoice,
  speechSynthesisActive,
  onToggleSpeechSynthesis,
  speechVoiceURI,
  speechRate = 0.90,
  speechPitch = 0.85,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || state === 'processing') return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakMessage = (id: string, text: string) => {
    if (speakingMessageId === id) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(id);
    speakText(text, {
      voiceURI: speechVoiceURI,
      rate: speechRate,
      pitch: speechPitch,
      onEnd: () => setSpeakingMessageId(null),
    });
  };

  const quickPrompts = [
    'Qual o horário e data oficial do sistema?',
    'Execute a varredura e diagnóstico geral',
    'Calcule a fórmula: Math.sqrt(256) * 12.5',
    'Liste o que está armazenado na memória',
    'Qual o status do conector Google Workspace?',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#040813] relative overflow-hidden">
      {/* Background Tech Grid */}
      <div className="absolute inset-0 auron-grid-bg pointer-events-none" />

      {/* Top Header Bar */}
      <header className="px-6 py-3.5 border-b border-cyan-900/30 bg-[#060c1d]/90 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-cyan-400/40 bg-cyan-950/60 flex items-center justify-center text-cyan-300 font-orbitron text-xs shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-sm tracking-wider font-bold text-cyan-200">
                AURON CONSOLE
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <p className="text-[11px] font-mono-tech text-slate-400">
              Canal criptografado • Sintetizador de voz ativo
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* TTS Audio toggle */}
          <button
            type="button"
            onClick={onToggleSpeechSynthesis}
            aria-label={speechSynthesisActive ? 'Desativar leitura de voz' : 'Ativar leitura de voz'}
            className={`p-2 rounded-lg border text-xs font-mono-tech flex items-center gap-1.5 transition-all ${
              speechSynthesisActive
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {speechSynthesisActive ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="hidden sm:inline">Voz Ativa</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Voz Muta</span>
              </>
            )}
          </button>

          {/* Clear chat button */}
          <button
            type="button"
            onClick={onClearHistory}
            aria-label="Limpar histórico da conversa"
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-300 hover:bg-slate-900/60 transition-colors"
            title="Limpar histórico"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 space-y-5">
            <AIAvatarCore state={state} onCoreClick={onToggleVoice} size="md" />

            <div className="max-w-md space-y-2">
              <h2 className="font-orbitron text-lg sm:text-xl font-bold text-cyan-300 auron-text-glow">
                AURON PRONTO PARA INTERAÇÃO
              </h2>
              <p className="text-sm text-slate-300 font-rajdhani">
                À sua disposição, Senhor. Fale ou digite seus comandos. Posso calcular valores, consultar
                relógio e calendário, registrar memórias e executar diagnósticos de subsistemas.
              </p>
            </div>

            {/* Quick action chips */}
            <div className="w-full max-w-lg flex flex-wrap gap-2 justify-center pt-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(prompt)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-cyan-900/40 bg-slate-900/60 hover:bg-cyan-950/40 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 transition-all font-mono-tech flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isAuron = msg.sender === 'auron';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 font-mono-tech text-xs flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAuron ? 'items-start' : 'items-end'} space-y-1`}
                >
                  {/* Sender Metadata */}
                  <div className="flex items-center gap-2 px-1 text-xs font-mono-tech text-slate-400">
                    {isAuron ? (
                      <>
                        <span className="font-orbitron font-semibold text-cyan-400">AURON</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <span>{msg.timestamp}</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-300">VOCÊ</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[90%] sm:max-w-[78%] rounded-2xl p-4 transition-all relative ${
                      isAuron
                        ? 'auron-panel-border text-slate-100 rounded-tl-sm shadow-[0_0_20px_rgba(0,240,255,0.06)]'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(0,112,243,0.3)]'
                    }`}
                  >
                    {/* Tool Calls Accordion/Cards */}
                    {isAuron && msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mb-3 space-y-2 border-b border-cyan-900/40 pb-3">
                        {msg.toolCalls.map((tc, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-900/40 font-mono-tech text-xs"
                          >
                            <div className="flex items-center justify-between text-cyan-300">
                              <span className="flex items-center gap-1.5 font-semibold">
                                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                                {tc.label || tc.name}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                                  tc.status === 'success'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                                }`}
                              >
                                {tc.status === 'success' ? 'Executado' : tc.status}
                              </span>
                            </div>
                            {tc.result && (
                              <pre className="mt-1.5 p-1.5 rounded bg-black/60 text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                                {typeof tc.result === 'object'
                                  ? JSON.stringify(tc.result, null, 2)
                                  : String(tc.result)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Main Text Content */}
                    <div className="font-rajdhani text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </div>

                    {/* Bottom Action Footer for AURON */}
                    {isAuron && (
                      <div className="mt-3 pt-2 border-t border-cyan-900/30 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSpeakMessage(msg.id, msg.text)}
                            aria-label="Reproduzir áudio desta mensagem"
                            className="p-1 rounded hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors flex items-center gap-1"
                            title="Ouvir mensagem"
                          >
                            {speakingMessageId === msg.id ? (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                                <span className="font-mono-tech text-[10px] text-cyan-300">Reproduzindo...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span className="font-mono-tech text-[10px]">Ouvir</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            aria-label="Copiar texto da resposta"
                            className="p-1 rounded hover:text-cyan-300 hover:bg-cyan-950/40 transition-colors flex items-center gap-1"
                            title="Copiar texto"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="font-mono-tech text-[10px] text-emerald-300">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="font-mono-tech text-[10px]">Copiar</span>
                              </>
                            )}
                          </button>
                        </div>

                        <span className="text-[10px] font-mono-tech text-slate-500">Protocolo AURON-Sec</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* State Indicator Bubble when processing */}
            {state === 'processing' && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 w-fit max-w-sm">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono-tech text-xs text-cyan-300">
                  AURON está processando com modelo neural...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Bar Area */}
      <div className="p-4 sm:p-5 border-t border-cyan-900/40 bg-[#050a18]/95 backdrop-blur-xl relative z-20">
        {/* Quick prompt bar when messages exist */}
        {messages.length > 0 && (
          <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
            {quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(prompt)}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded bg-slate-900/70 hover:bg-cyan-950/60 border border-cyan-900/30 text-slate-300 hover:text-cyan-200 font-mono-tech transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
          {/* Voice Input Toggle Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            aria-label={isListening ? 'Parar captura de voz' : 'Iniciar conversa por voz'}
            className={`p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.7)] animate-pulse'
                : 'bg-slate-900/80 text-cyan-400 border-cyan-800/40 hover:border-cyan-500/60 hover:bg-cyan-950/40'
            }`}
            title={isListening ? 'Parar microfone' : 'Conversar por voz'}
          >
            {isListening ? <Mic className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Ouvindo sua voz... Pode falar...'
                  : 'Fale ou digite sua solicitação para o AURON (Enter para enviar)...'
              }
              rows={1}
              className="w-full resize-none rounded-xl bg-slate-950/90 border border-cyan-900/40 px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-rajdhani text-base transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || state === 'processing'}
            aria-label="Enviar mensagem para AURON"
            className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] font-mono-tech text-slate-500 px-1">
          <span>AURON Core v1.0 • Pressione Enter para enviar, Shift+Enter para nova linha</span>
          <span>PT-BR (Brasil)</span>
        </div>
      </div>
    </div>
  );
};
