import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calculator,
  BrainCircuit,
  Activity,
  ListTodo,
  Calendar,
  Mail,
  Home,
  Shield,
  Play,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ToolDefinition } from '../types/index.ts';

interface ToolsHubProps {
  tools: ToolDefinition[];
  onTestTool: (toolName: string, args?: any) => Promise<any>;
}

export const ToolsHub: React.FC<ToolsHubProps> = ({ tools, onTestTool }) => {
  const [testingToolId, setTestingToolId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ toolId: string; data: any } | null>(null);

  const handleRunTest = async (tool: ToolDefinition) => {
    setTestingToolId(tool.id);
    setTestResult(null);

    let sampleArgs: any = {};
    if (tool.id === 'calculate_expression') {
      sampleArgs = { expression: 'Math.sqrt(1024) * 3.5 + 44' };
    } else if (tool.id === 'manage_memory') {
      sampleArgs = { action: 'list' };
    }

    try {
      const res = await onTestTool(tool.id, sampleArgs);
      setTestResult({ toolId: tool.id, data: res });
    } catch (err: any) {
      setTestResult({ toolId: tool.id, data: { error: err?.message || 'Falha na execução' } });
    } finally {
      setTestingToolId(null);
    }
  };

  const getToolIcon = (id: string) => {
    switch (id) {
      case 'get_system_time_and_date':
        return Clock;
      case 'calculate_expression':
        return Calculator;
      case 'manage_memory':
        return BrainCircuit;
      case 'execute_system_diagnostic':
        return Activity;
      case 'create_task':
        return ListTodo;
      case 'google_workspace':
        return Calendar;
      case 'gmail_assistant':
        return Mail;
      case 'smart_home_iot':
        return Home;
      default:
        return Wrench;
    }
  };

  const operationalTools = tools.filter((t) => t.isAvailable);
  const externalPendingTools = tools.filter((t) => !t.isAvailable);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#040813] auron-grid-bg relative font-rajdhani">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl auron-panel-border auron-hud-corner shadow-[0_0_20px_rgba(0,240,255,0.06)]">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          <span className="font-mono-tech text-xs tracking-wider text-cyan-400 uppercase">
            Barramento de Ferramentas & Integrações
          </span>
        </div>
        <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mt-1">
          CATÁLOGO DE <span className="text-cyan-300 auron-text-glow">FERRAMENTAS</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-0.5">
          Arquitetura modular de chamadas de funções (function calling) com controle de segurança e permissões.
        </p>
      </div>

      {/* Honest Compliance Notice */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-orbitron font-semibold text-amber-300">
            POLÍTICA DE TRANSPARÊNCIA OPERACIONAL
          </span>
          <p className="text-slate-300 leading-relaxed">
            O AURON distingue claramente ferramentas locais ativas de serviços externos que exigem
            credenciais de terceiros. Nunca geramos dados simulados fingindo acesso real a contas de
            usuário antes da autorização adequada.
          </p>
        </div>
      </div>

      {/* Section 1: Fully Operational Tools */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2">
          <h2 className="font-orbitron text-base font-bold text-cyan-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            FERRAMENTAS OPERACIONAIS ATIVAS ({operationalTools.length})
          </h2>
          <span className="text-xs font-mono-tech text-emerald-400">100% Funcionais</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {operationalTools.map((tool) => {
            const Icon = getToolIcon(tool.id);
            const isTesting = testingToolId === tool.id;
            const hasResult = testResult?.toolId === tool.id;

            return (
              <div
                key={tool.id}
                className="p-5 rounded-2xl auron-panel-border flex flex-col justify-between hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                      {tool.statusText}
                    </span>
                  </div>

                  <h3 className="font-orbitron font-bold text-base text-slate-100 mt-3">
                    {tool.displayName}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{tool.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-900/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400">
                    <span>Nível de Risco:</span>
                    <span className="text-emerald-400 uppercase font-semibold">{tool.riskLevel}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunTest(tool)}
                    disabled={isTesting}
                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-cyan-900/40 hover:border-cyan-500/40 text-cyan-300 font-mono-tech text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-3 h-3 text-cyan-400" />
                    <span>{isTesting ? 'Executando Teste...' : 'Testar Execução'}</span>
                  </button>

                  {/* Live execution test output */}
                  {hasResult && (
                    <div className="mt-2 p-2 rounded bg-black/80 border border-cyan-900/60 font-mono-tech text-[10px] text-cyan-200 overflow-x-auto max-h-28">
                      <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: External Integrations Ready for Authorization */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2">
          <h2 className="font-orbitron text-base font-bold text-slate-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            INTEGRAÇÕES EXTERNAS PREPARADAS ({externalPendingTools.length})
          </h2>
          <span className="text-xs font-mono-tech text-amber-400">Aguardando Credenciais Externas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {externalPendingTools.map((tool) => {
            const Icon = getToolIcon(tool.id);

            return (
              <div
                key={tool.id}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-amber-950/80 text-amber-300 border border-amber-800/60 uppercase">
                      Requer OAuth
                    </span>
                  </div>

                  <h3 className="font-orbitron font-bold text-base text-slate-200 mt-3">
                    {tool.displayName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tool.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
                  <div className="p-2.5 rounded bg-slate-900/60 text-[11px] font-mono-tech text-slate-300 border border-slate-800">
                    <span className="text-amber-400 font-semibold block mb-0.5">Requisito para Ativação:</span>
                    Fluxo de consentimento OAuth do usuário ou chave de API de serviço.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
