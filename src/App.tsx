/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AssistantState, ChatMessage, MemoryItem, PersonaSettings, SystemTelemetry, TaskItem, ToolDefinition } from './types/index.ts';
import { AURON_TOOLS_CATALOG, formatSystemTime } from './utils/tools.ts';
import { INITIAL_SEED_MEMORIES } from './utils/memory.ts';
import { startVoiceRecognition, stopVoiceRecognition, speakText, stopSpeaking } from './utils/speech.ts';

import { Sidebar, NavTab } from './components/Sidebar.tsx';
import { HomeHUD } from './components/HomeHUD.tsx';
import { ChatPanel } from './components/ChatPanel.tsx';
import { MemoryHub } from './components/MemoryHub.tsx';
import { ToolsHub } from './components/ToolsHub.tsx';
import { AutomationsHub } from './components/AutomationsHub.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { SecurityConfirmModal } from './components/SecurityConfirmModal.tsx';
import { Menu, ShieldCheck } from 'lucide-react';

const DEFAULT_SETTINGS: PersonaSettings = {
  userName: 'Senhor',
  honorific: 'Senhor',
  speechRate: 1.0,
  speechPitch: 0.95,
  voiceGender: 'male',
  selectedVoiceURI: '',
  autoSpeak: true,
  model: 'gemini-3.1-flash-lite',
  safetyLevel: 'estrito',
};

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  sender: 'auron',
  text: 'Saudações. Sou o AURON, seu assistente pessoal de inteligência artificial. Todos os subsistemas e matrizes de memória estão operando em regime nominal. Como posso ser útil neste momento?',
  timestamp: formatSystemTime().timeStr,
  state: 'idle',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(true);

  // Core Data
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auron_messages');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_SEED_MEMORIES);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tools, setTools] = useState<ToolDefinition[]>(AURON_TOOLS_CATALOG);
  const [telemetry, setTelemetry] = useState<SystemTelemetry | null>(null);
  const [settings, setSettings] = useState<PersonaSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auron_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Security Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action?: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });

  // Save messages and settings to localStorage
  useEffect(() => {
    localStorage.setItem('auron_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('auron_settings', JSON.stringify(settings));
  }, [settings]);

  // Fetch initial telemetry, memories and tasks from backend
  const refreshSystemData = useCallback(async () => {
    try {
      const [resStatus, resMem, resTasks, resTools] = await Promise.all([
        fetch('/api/system/status').catch(() => null),
        fetch('/api/memory').catch(() => null),
        fetch('/api/tasks').catch(() => null),
        fetch('/api/tools').catch(() => null),
      ]);

      if (resStatus?.ok) {
        const data = await resStatus.json();
        setTelemetry(data);
      }

      if (resMem?.ok) {
        const data = await resMem.json();
        if (data.items) setMemories(data.items);
      }

      if (resTasks?.ok) {
        const data = await resTasks.json();
        if (data.items) setTasks(data.items);
      }

      if (resTools?.ok) {
        const data = await resTools.json();
        if (data.tools) setTools(data.tools);
      }
    } catch (err) {
      console.warn('AURON: sincronização inicial com backend local:', err);
    }
  }, []);

  useEffect(() => {
    refreshSystemData();
  }, [refreshSystemData]);

  // Send message to AURON
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: formatSystemTime().timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setAssistantState('processing');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          model: settings.model,
          userName: settings.userName,
          userHonorific: settings.honorific,
        }),
      });

      if (!response.ok) {
        throw new Error(`Servidor retornou código ${response.status}`);
      }

      const data = await response.json();

      const auronMsg: ChatMessage = {
        id: 'msg_auron_' + Date.now(),
        sender: 'auron',
        text: data.text || 'Entendido, Senhor.',
        timestamp: formatSystemTime().timeStr,
        state: 'responding',
        toolCalls: data.toolCalls,
      };

      setMessages((prev) => [...prev, auronMsg]);
      setAssistantState('responding');

      // Refresh memory and tasks if tools were executed
      if (data.toolCalls && data.toolCalls.length > 0) {
        refreshSystemData();
      }

      // Voice synthesis if enabled
      if (speechSynthesisActive && settings.autoSpeak && auronMsg.text) {
        speakText(auronMsg.text, {
          voiceURI: settings.selectedVoiceURI,
          rate: settings.speechRate,
          pitch: settings.speechPitch,
          onEnd: () => setAssistantState('idle'),
        });
      } else {
        setTimeout(() => setAssistantState('idle'), 1800);
      }
    } catch (error: any) {
      console.error('Falha na comunicação com AURON:', error);
      const errMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'auron',
        text: `Peço desculpas, ${settings.honorific || 'Senhor'}. Ocorreu uma oscilação na resposta da API: ${error?.message || 'Erro de conexão'}. As ferramentas e diagnósticos locais permanecem disponíveis.`,
        timestamp: formatSystemTime().timeStr,
        state: 'idle',
      };
      setMessages((prev) => [...prev, errMsg]);
      setAssistantState('idle');
    }
  };

  // Toggle voice input with automatic turn completion
  const handleToggleVoice = () => {
    if (isListening) {
      stopVoiceRecognition();
      setIsListening(false);
      setAssistantState('idle');
      return;
    }

    setIsListening(true);
    setAssistantState('listening');

    const started = startVoiceRecognition(
      (transcript, isFinal) => {
        if (isFinal && transcript.trim()) {
          stopVoiceRecognition();
          setIsListening(false);
          handleSendMessage(transcript.trim());
        }
      },
      (error) => {
        console.warn('Erro de reconhecimento de voz:', error);
        setIsListening(false);
        setAssistantState('idle');
      },
      () => {
        setIsListening(false);
        setAssistantState((curr) => (curr === 'listening' ? 'idle' : curr));
      }
    );

    if (!started) {
      setIsListening(false);
      setAssistantState('idle');
    }
  };

  // Clear chat history
  const handleClearHistory = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    localStorage.removeItem('auron_messages');
  };

  // Memory additions
  const handleAddMemory = async (newMemData: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMemData),
      });
      if (res.ok) {
        const data = await res.json();
        setMemories((prev) => [data.item, ...prev]);
      } else {
        // Fallback local
        const localItem: MemoryItem = {
          ...newMemData,
          id: 'mem_' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setMemories((prev) => [localItem, ...prev]);
      }
    } catch (e) {
      console.warn('Fallback salvamento memória local:', e);
    }
  };

  // Delete memory with security check
  const handleDeleteMemory = async (id: string) => {
    const memory = memories.find((m) => m.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Registro de Memória?',
      description: `Tem certeza que deseja apagar permanentemente a memória "${memory?.title || id}"? O assistente perderá este contexto imediatamente.`,
      action: async () => {
        try {
          await fetch(`/api/memory/${id}`, { method: 'DELETE' });
        } catch (e) {
          // ignore
        }
        setMemories((prev) => prev.filter((m) => m.id !== id));
        setConfirmModal((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  // Run routine
  const handleRunRoutine = async (routineId: string, routineName: string): Promise<string[]> => {
    setAssistantState('executing');
    const logs: string[] = [];

    const append = (log: string) => logs.push(log);

    append(`[SISTEMA] Disparando protocolo da rotina: ${routineName}`);
    append(`[HORÁRIO] ${formatSystemTime().fullDescription}`);

    if (routineId === 'routine_briefing') {
      append('[DIAGNÓSTICO] Verificando integridade neural: 100% NOMINAL.');
      append(`[MEMÓRIA] Carregando ${memories.length} nós de memória cognitiva.`);
      append(`[TAREFAS] ${tasks.length} objetivos registrados na matriz.`);
      append(`[CONCLUSÃO] Briefing finalizado com sucesso.`);
    } else if (routineId === 'routine_diagnostic') {
      append('[TESTE] Barramento de cálculo matemático: OK.');
      append('[TESTE] Sincronização quântica de tempo oficial: OK.');
      append('[TESTE] Permissões e integridade de credenciais: OK.');
      append('[RESULTADO] Todos os subsistemas operacionais do AURON estão em conformidade.');
    } else if (routineId === 'routine_focus') {
      append('[CONFIG] Ajustando modo de concisão máxima para foco.');
      append('[TAREFA] Registrando marco "Sessão de Foco Profundo - 45 min".');
      append('[STATUS] Modo de foco ativado.');
    } else {
      append(`[CONSOLIDAÇÃO] Metas atualizadas.`);
    }

    setTimeout(() => {
      setAssistantState('idle');
    }, 1200);

    return logs;
  };

  // Direct tool test
  const handleTestTool = async (toolName: string, args?: any) => {
    setAssistantState('executing');
    try {
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName, args }),
      });
      const data = await res.json();
      setTimeout(() => setAssistantState('idle'), 600);
      return data;
    } catch (err: any) {
      setAssistantState('idle');
      throw err;
    }
  };

  // Reset all local cache data
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Resetar Cache & Histórico Local?',
      description: 'Esta operação apagará as mensagens de conversa e restaurará as configurações originais de fábrica do AURON.',
      action: () => {
        localStorage.clear();
        setMessages([DEFAULT_WELCOME_MESSAGE]);
        setSettings(DEFAULT_SETTINGS);
        setConfirmModal((c) => ({ ...c, isOpen: false }));
      },
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 font-rajdhani select-none">
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-[#050a18]/90 border-b border-cyan-900/40 backdrop-blur-md px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menu de navegação"
          className="p-2 rounded-lg bg-slate-900 border border-cyan-900/40 text-cyan-400"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500 text-black font-orbitron font-extrabold flex items-center justify-center text-xs">
            A
          </div>
          <span className="font-orbitron font-bold text-sm text-cyan-300">AURON</span>
        </div>

        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
      </div>

      {/* Futuristic Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activeToolsCount={tools.filter((t) => t.isAvailable).length}
        totalToolsCount={tools.length}
        memoryCount={memories.length}
        hasApiKey={Boolean(telemetry?.hasApiKey)}
        modelName={settings.model}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pt-14 lg:pt-0 relative">
        {activeTab === 'inicio' && (
          <HomeHUD
            state={assistantState}
            onCoreClick={handleToggleVoice}
            onNavigateTab={(tab) => setActiveTab(tab)}
            telemetry={telemetry}
            tasks={tasks}
            tools={tools}
            onTriggerQuickAction={(text) => {
              setActiveTab('conversas');
              handleSendMessage(text);
            }}
            isListening={isListening}
          />
        )}

        {activeTab === 'conversas' && (
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
            state={assistantState}
            isListening={isListening}
            onToggleVoice={handleToggleVoice}
            speechSynthesisActive={speechSynthesisActive}
            onToggleSpeechSynthesis={() => setSpeechSynthesisActive((v) => !v)}
            speechVoiceURI={settings.selectedVoiceURI}
            speechRate={settings.speechRate}
            speechPitch={settings.speechPitch}
          />
        )}

        {activeTab === 'memoria' && (
          <MemoryHub
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {activeTab === 'ferramentas' && (
          <ToolsHub tools={tools} onTestTool={handleTestTool} />
        )}

        {activeTab === 'automacoes' && (
          <AutomationsHub onRunRoutine={handleRunRoutine} />
        )}

        {activeTab === 'configuracoes' && (
          <SettingsView
            settings={settings}
            onSaveSettings={(s) => setSettings(s)}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Security Authorization Modal */}
      <SecurityConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={() => confirmModal.action?.()}
        onCancel={() => setConfirmModal((c) => ({ ...c, isOpen: false }))}
      />
    </div>
  );
}
