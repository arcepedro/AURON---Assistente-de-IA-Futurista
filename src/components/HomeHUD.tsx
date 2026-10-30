import React from 'react';
import {
  Mic,
  MessageSquare,
  Activity,
  Cpu,
  BrainCircuit,
  Wrench,
  Clock,
  Sparkles,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
} from 'lucide-react';
import { AssistantState, SystemTelemetry, TaskItem, ToolDefinition } from '../types/index.ts';
import { AIAvatarCore } from './AIAvatarCore.tsx';

interface HomeHUDProps {
  state: AssistantState;
  onCoreClick: () => void;
  onNavigateTab: (tab: 'conversas' | 'memoria' | 'ferramentas' | 'automacoes') => void;
  telemetry: SystemTelemetry | null;
  tasks: TaskItem[];
  tools: ToolDefinition[];
  onTriggerQuickAction: (actionText: string) => void;
  isListening: boolean;
  voiceError?: string | null;
  onDismissVoiceError?: () => void;
}

export const HomeHUD: React.FC<HomeHUDProps> = ({
  state,
  onCoreClick,
  onNavigateTab,
  telemetry,
  tasks,
  tools,
  onTriggerQuickAction,
  isListening,
  voiceError,
  onDismissVoiceError,
}) => {
  const activeTools = tools.filter((t) => t.isAvailable);
  const pendingTools = tools.filter((t) => !t.isAvailable);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-[#040813] auron-grid-bg relative">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl auron-panel-border auron-hud-corner shadow-[0_0_20px_rgba(0,240,255,0.08)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-mono-tech text-xs tracking-wider text-cyan-400 uppercase">
              Terminal Operacional AURON
            </span>
          </div>
          <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mt-1">
            BEM-VINDO AO <span className="text-cyan-300 auron-text-glow">AURON</span>
          </h1>
          <p className="text-slate-400 font-rajdhani text-sm sm:text-base mt-0.5">
            Assistente Pessoal de Inteligência Artificial • Núcleo Quântico Ativo
          </p>
        </div>

        {/* Quick Voice Launch Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCoreClick}
            aria-label={isListening ? 'Parar microfone' : 'Ativar conversa por voz com AURON'}
            className={`px-5 py-3 rounded-xl font-rajdhani font-bold text-base flex items-center gap-2.5 transition-all shadow-lg ${
              isListening
                ? 'bg-cyan-400 text-black shadow-[0_0_25px_rgba(0,240,255,0.8)] animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>{isListening ? 'Ouvindo... Clique para Parar' : 'Iniciar Conversa por Voz'}</span>
          </button>
        </div>
      </div>

      {voiceError && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-950/40 p-4 text-sm text-amber-100">
          <div>
            <p className="font-semibold">Microfone indisponível</p>
            <p className="mt-1 text-amber-100/90">{voiceError}</p>
            <p className="mt-2 text-xs text-amber-200/80">Dica: use HTTPS ou localhost e permita o microfone pelo ícone ao lado do endereço do site.</p>
          </div>
          <button type="button" onClick={onDismissVoiceError} className="shrink-0 rounded border border-amber-500/40 px-2 py-1 text-xs hover:bg-amber-900/60">Fechar</button>
        </div>
      )}

      {/* Main Grid: Visual Core & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Central Core Hologram Section */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 rounded-2xl auron-panel-border auron-hud-corner relative overflow-hidden group min-h-[380px]">
          {/* Subtle radar background circle */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-cyan-500/10 pointer-events-none" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-cyan-500/15 pointer-events-none" />

          {/* Hologram Avatar Core */}
          <AIAvatarCore state={state} onCoreClick={onCoreClick} size="lg" isAudioActive={isListening} />

          <p className="mt-4 text-xs font-mono-tech text-slate-400 text-center">
            Clique no núcleo para alternar o microfone e iniciar interação direta por voz.
          </p>

          {/* Quick HUD command buttons */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => onNavigateTab('conversas')}
              className="px-4 py-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono-tech text-xs hover:bg-cyan-900/60 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Abrir Terminal de Chat
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onTriggerQuickAction('Execute um diagnóstico completo dos subsistemas do AURON')}
              className="px-4 py-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 font-mono-tech text-xs hover:border-cyan-500/50 hover:text-cyan-200 transition-all flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Varredura de Diagnóstico
            </button>
          </div>
        </div>

        {/* Telemetry and System Health */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Telemetry Card */}
          <div className="p-5 rounded-2xl auron-panel-border space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
              <span className="font-orbitron text-sm font-semibold text-cyan-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                TELEMETRIA DE SISTEMA
              </span>
              <span className="text-[11px] font-mono-tech px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                100% NOMINAL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/20 space-y-1">
                <span className="text-slate-400">Motor Neural</span>
                <p className="text-cyan-200 font-bold truncate">
                  {telemetry?.modelEngine || 'Gemini 3.8 Flash'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/20 space-y-1">
                <span className="text-slate-400">Latência Média</span>
                <p className="text-cyan-200 font-bold">{telemetry?.latencyMs || 12} ms</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/20 space-y-1">
                <span className="text-slate-400">Nós de Memória</span>
                <p className="text-cyan-200 font-bold">{telemetry?.memoryCount || 4} Registros</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-900/20 space-y-1">
                <span className="text-slate-400">Ferramentas</span>
                <p className="text-cyan-200 font-bold">
                  {activeTools.length} Ativas / {tools.length} Total
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-between text-xs font-rajdhani">
              <div className="flex items-center gap-2 text-cyan-300">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Protocolo de Segurança e Validação de Ações Ativo</span>
              </div>
              <span className="text-cyan-400 font-mono-tech text-[10px]">Ativo</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-5 rounded-2xl auron-panel-border space-y-3">
            <span className="font-orbitron text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              ROTINAS RÁPIDAS
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech">
              <button
                type="button"
                onClick={() => onTriggerQuickAction('Qual o horário e data oficial do sistema?')}
                className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-cyan-950/50 border border-cyan-900/30 hover:border-cyan-500/50 text-left text-slate-300 hover:text-cyan-200 transition-colors flex items-center justify-between"
              >
                <span>Relógio Quântico</span>
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
              </button>

              <button
                type="button"
                onClick={() => onTriggerQuickAction('Liste o que está armazenado na memória de AURON')}
                className="p-2.5 rounded-lg bg-slate-950/70 hover:bg-cyan-950/50 border border-cyan-900/30 hover:border-cyan-500/50 text-left text-slate-300 hover:text-cyan-200 transition-colors flex items-center justify-between"
              >
                <span>Consultar Memória</span>
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Tools & Availability Status Strip */}
      <div className="p-5 sm:p-6 rounded-2xl auron-panel-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-900/30 pb-3">
          <div>
            <h2 className="font-orbitron text-base font-bold text-cyan-200 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              STATUS DE FERRAMENTAS & INTEGRAÇÕES
            </h2>
            <p className="text-xs text-slate-400 font-rajdhani">
              Transparência total sobre módulos operacionais vs integrações externas pendentes de autorização.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('ferramentas')}
            className="text-xs font-mono-tech text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
          >
            Gerenciar Conexões
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`p-3.5 rounded-xl border font-rajdhani transition-all ${
                tool.isAvailable
                  ? 'bg-slate-950/80 border-cyan-900/40 hover:border-cyan-500/40'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-200 truncate">
                  {tool.displayName}
                </span>
                {tool.isAvailable ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tool.description}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono-tech">
                <span
                  className={
                    tool.isAvailable ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'
                  }
                >
                  {tool.statusText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ongoing Tasks Panel */}
      <div className="p-5 sm:p-6 rounded-2xl auron-panel-border space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-orbitron text-base font-bold text-cyan-200">
              TAREFAS & OBJETIVOS EM ANDAMENTO
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono-tech bg-cyan-950 text-cyan-400 border border-cyan-800">
              {tasks.length}
            </span>
          </div>

          <span className="text-xs font-mono-tech text-slate-400">Sincronização em tempo real</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-cyan-900/30 font-rajdhani space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono-tech">
                <span className="text-cyan-400 font-semibold">{task.category}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                    task.status === 'concluida'
                      ? 'bg-emerald-950 text-emerald-300'
                      : task.status === 'em_andamento'
                      ? 'bg-cyan-950 text-cyan-300'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-semibold text-slate-200 text-sm">{task.title}</h3>
              {task.details && <p className="text-xs text-slate-400 line-clamp-2">{task.details}</p>}

              {/* Progress Bar */}
              <div className="pt-1">
                <div className="flex justify-between text-[11px] font-mono-tech text-slate-400 mb-1">
                  <span>Progresso</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
