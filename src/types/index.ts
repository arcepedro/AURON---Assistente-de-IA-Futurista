export type AssistantState = 'idle' | 'listening' | 'processing' | 'responding' | 'executing';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'auron' | 'system';
  text: string;
  timestamp: string;
  state?: AssistantState;
  toolCalls?: {
    name: string;
    label: string;
    args?: Record<string, any>;
    result?: any;
    status: 'running' | 'success' | 'failed' | 'requires_confirmation';
  }[];
  requiresConfirmation?: {
    actionId: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  };
}

export type MemoryCategory = 'preferencias' | 'projetos' | 'instrucoes' | 'historico';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  priority?: 'alta' | 'media' | 'baixa';
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  progress: number;
  priority: 'alta' | 'media' | 'baixa';
  createdAt: string;
  details?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'sistema' | 'produtividade' | 'integracao' | 'automacao';
  isAvailable: boolean;
  statusText: string;
  requiresAuth: boolean;
  riskLevel: 'seguro' | 'moderado' | 'alto';
  parameters?: Record<string, any>;
}

export interface SystemTelemetry {
  status: 'nominal' | 'alerta' | 'manutencao';
  modelEngine: string;
  uptimeSeconds: number;
  latencyMs: number;
  memoryCount: number;
  activeToolsCount: number;
  activeTasksCount: number;
  voiceEngineStatus: 'online' | 'indisponivel';
  /** Optional backend capability flag; absent when the server does not expose key status. */
  hasApiKey?: boolean;
}

export interface PersonaSettings {
  userName: string;
  honorific: string; // "Senhor", "Comandante", "Doutor", etc.
  speechRate: number; // 0.8 to 1.3
  speechPitch: number; // 0.7 to 1.2
  voiceGender: 'male' | 'female' | 'system';
  selectedVoiceURI: string;
  autoSpeak: boolean;
  model: string;
  safetyLevel: 'estrito' | 'moderado';
}
