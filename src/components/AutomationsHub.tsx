import React, { useState } from 'react';
import {
  Workflow,
  Play,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Terminal,
  RotateCw,
  Sparkles,
  Layers,
} from 'lucide-react';

interface Routine {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: string;
  triggerType: 'manual' | 'agendado' | 'evento';
  steps: string[];
}

interface AutomationsHubProps {
  onRunRoutine: (routineId: string, routineName: string) => Promise<string[]>;
}

export const AutomationsHub: React.FC<AutomationsHubProps> = ({ onRunRoutine }) => {
  const [runningRoutineId, setRunningRoutineId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [completedRoutines, setCompletedRoutines] = useState<Record<string, boolean>>({});

  const routines: Routine[] = [
    {
      id: 'routine_briefing',
      name: 'Briefing Matinal e Telemetria',
      description: 'Sincroniza o relógio quântico, compila tarefas pendentes e avalia a saúde dos subsistemas do AURON.',
      category: 'Produtividade',
      estimatedDuration: '1.2s',
      triggerType: 'manual',
      steps: [
        'Consulta de horário e data oficial de Brasília',
        'Leitura das tarefas ativas na lista de objetivos',
        'Verificação de memórias de diretrizes permanentes',
        'Compilação do sumário executivo em áudio e texto',
      ],
    },
    {
      id: 'routine_diagnostic',
      name: 'Varredura de Segurança e Integridade',
      description: 'Auditoria completa dos barramentos neurais, cálculo de latência e validação dos módulos de segurança.',
      category: 'Sistema',
      estimatedDuration: '0.8s',
      triggerType: 'manual',
      steps: [
        'Teste de integridade dos barramentos matemáticos',
        'Medição de tempo de resposta da API neural',
        'Verificação de permissões e chaves seguras',
        'Emissão de atestado de conformidade nominal',
      ],
    },
    {
      id: 'routine_focus',
      name: 'Ativação do Protocolo de Foco',
      description: 'Ajusta a concisão do modelo para respostas ultra-objetivas e cria marco de foco na fila de tarefas.',
      category: 'Otimização',
      estimatedDuration: '0.5s',
      triggerType: 'manual',
      steps: [
        'Definição temporária de modo conciso nas diretrizes',
        'Registro de tarefa de foco de 45 minutos no painel',
        'Confirmação sonora de transição para modo operacional',
      ],
    },
    {
      id: 'routine_sync',
      name: 'Auditoria e Consolidação de Metas',
      description: 'Varre todas as tarefas em andamento, calcula a média de progresso e sinaliza metas concluídas.',
      category: 'Produtividade',
      estimatedDuration: '1.0s',
      triggerType: 'manual',
      steps: [
        'Consulta de todas as tarefas cadastradas',
        'Cálculo analítico ponderado de progresso',
        'Persistência do status no banco de memória',
      ],
    },
  ];

  const handleExecute = async (routine: Routine) => {
    setRunningRoutineId(routine.id);
    setExecutionLogs([`[INÍCIO] Iniciando rotina automatizada: "${routine.name}"...`]);

    try {
      const logs = await onRunRoutine(routine.id, routine.name);
      setExecutionLogs(logs);
      setCompletedRoutines((prev) => ({ ...prev, [routine.id]: true }));
    } catch (err: any) {
      setExecutionLogs((prev) => [...prev, `[ERRO] Falha na execução: ${err?.message || 'Erro de execução'}`]);
    } finally {
      setRunningRoutineId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#040813] auron-grid-bg relative font-rajdhani">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl auron-panel-border auron-hud-corner shadow-[0_0_20px_rgba(0,240,255,0.06)]">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-cyan-400" />
          <span className="font-mono-tech text-xs tracking-wider text-cyan-400 uppercase">
            Automações & Orquestração
          </span>
        </div>
        <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mt-1">
          ROTINAS DE <span className="text-cyan-300 auron-text-glow">AUTOMAÇÃO</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-0.5">
          Processos autônomos pré-configurados que encadeiam ferramentas e geram relatórios imediatos.
        </p>
      </div>

      {/* Grid: Routines & Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Routines List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2">
            <h2 className="font-orbitron text-base font-bold text-cyan-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              ROTINAS DISPONÍVEIS ({routines.length})
            </h2>
            <span className="text-xs font-mono-tech text-cyan-400">Disparo Imediato</span>
          </div>

          <div className="space-y-3">
            {routines.map((routine) => {
              const isRunning = runningRoutineId === routine.id;
              const isCompleted = completedRoutines[routine.id];

              return (
                <div
                  key={routine.id}
                  className="p-5 rounded-2xl auron-panel-border hover:border-cyan-500/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono-tech">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {routine.category}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {routine.estimatedDuration}
                        </span>
                      </div>
                      <h3 className="font-orbitron font-bold text-base text-slate-100 mt-1">
                        {routine.name}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">{routine.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecute(routine)}
                      disabled={Boolean(runningRoutineId)}
                      className={`px-4 py-2 rounded-xl font-mono-tech text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                        isRunning
                          ? 'bg-cyan-500 text-black animate-pulse'
                          : 'bg-cyan-950/80 hover:bg-cyan-500 hover:text-black border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Executando...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Executar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Steps preview */}
                  <div className="pt-2 border-t border-cyan-900/30">
                    <span className="text-[11px] font-mono-tech text-slate-400 block mb-1">
                      Etapas de Execução:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-300">
                      {routine.steps.map((st, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 font-rajdhani">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span className="truncate">{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Execution Console Terminal */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2">
            <h2 className="font-orbitron text-base font-bold text-cyan-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              CONSOLE DE EXECUÇÃO
            </h2>
            <span className="text-xs font-mono-tech text-slate-400">Tempo Real</span>
          </div>

          <div className="flex-1 min-h-[350px] p-4 rounded-2xl bg-black/90 border border-cyan-900/50 font-mono-tech text-xs text-cyan-300 overflow-y-auto space-y-2 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="text-slate-500 pb-2 border-b border-cyan-950 flex items-center justify-between">
              <span>AURON Automation Daemon v1.0</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {executionLogs.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-600 space-y-2">
                <Sparkles className="w-6 h-6 text-slate-700" />
                <p>Nenhuma rotina disparada recentemente.</p>
                <p className="text-[11px]">Selecione uma rotina ao lado para ver os logs de execução.</p>
              </div>
            ) : (
              executionLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-cyan-500 select-none mr-2">&gt;</span>
                  <span className={log.includes('[ERRO]') ? 'text-red-400' : 'text-slate-200'}>
                    {log}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
