/**
 * AURON Pure Tools & Math Engine
 * Decoupled logic safe for unit testing without UI dependencies.
 */

import { ToolDefinition } from '../types/index.ts';

/**
 * Safely parses and evaluates basic mathematical expressions without using eval()
 */
export function evaluateSafeMath(rawExpr: string): { success: boolean; result?: number; error?: string } {
  if (!rawExpr || typeof rawExpr !== 'string') {
    return { success: false, error: 'Expressão vazia ou inválida.' };
  }

  // Remove whitespace and normalize common operators
  const sanitized = rawExpr
    .replace(/\s+/g, '')
    .replace(/x|×/gi, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '.')
    .replace(/\^/g, '**');

  // Strict regex check: only numbers, operators, dots, parentheses, and Math functions allowed
  const safeRegex = /^([0-9+\-*/().%]|(\*\*)|Math\.(sqrt|pow|abs|round|floor|ceil|PI|E))+$/;
  if (!safeRegex.test(sanitized)) {
    return { success: false, error: 'Caracteres não autorizados na expressão matemática.' };
  }

  try {
    // Using Function constructor with Math scope locked
    const compute = new Function('Math', `"use strict"; return (${sanitized});`);
    const val = compute(Math);
    if (typeof val !== 'number' || !isFinite(val)) {
      return { success: false, error: 'O resultado não é um número finito válido.' };
    }
    return { success: true, result: Math.round(val * 100000) / 100000 };
  } catch (err: any) {
    return { success: false, error: `Falha ao calcular: ${err?.message || 'sintaxe incorreta'}` };
  }
}

/**
 * Formats date and time in Brazilian Portuguese with futuristic HUD styling
 */
export function formatSystemTime(date: Date = new Date()): {
  iso: string;
  timeStr: string;
  dateStr: string;
  dayOfWeek: string;
  fullDescription: string;
} {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    hour12: false,
  };

  const timeStr = date.toLocaleTimeString('pt-BR', {
    ...options,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateStr = date.toLocaleDateString('pt-BR', {
    ...options,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const dayOfWeek = date.toLocaleDateString('pt-BR', {
    ...options,
    weekday: 'long',
  });

  return {
    iso: date.toISOString(),
    timeStr,
    dateStr,
    dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
    fullDescription: `${dayOfWeek}, ${dateStr} às ${timeStr} (Horário Padrão de Brasília)`,
  };
}

/**
 * Validates whether an action requires explicit user authorization modal
 */
export function requiresSecurityAuthorization(toolName: string, args: Record<string, any> = {}): boolean {
  const highRiskTools = ['system_purge', 'delete_all_memories', 'send_external_message', 'execute_raw_command'];
  if (highRiskTools.includes(toolName)) {
    return true;
  }

  // Deletions or clear operations
  if (toolName === 'manage_memory' && (args.action === 'delete_all' || args.action === 'clear')) {
    return true;
  }

  if (args.highImpact === true || args.requiresConfirmation === true) {
    return true;
  }

  return false;
}

/**
 * Default tool definitions list for AURON
 */
export const AURON_TOOLS_CATALOG: ToolDefinition[] = [
  {
    id: 'get_system_time_and_date',
    name: 'get_system_time_and_date',
    displayName: 'Relógio e Calendário Quântico',
    description: 'Consulta horário atual, data e fuso de Brasília com precisão do sistema.',
    category: 'sistema',
    isAvailable: true,
    statusText: 'Operacional (Sincronizado)',
    requiresAuth: false,
    riskLevel: 'seguro',
  },
  {
    id: 'calculate_expression',
    name: 'calculate_expression',
    displayName: 'Motor de Cálculo Analítico',
    description: 'Realiza cálculos matemáticos complexos, porcentagens e conversões.',
    category: 'sistema',
    isAvailable: true,
    statusText: 'Operacional (Acelerado)',
    requiresAuth: false,
    riskLevel: 'seguro',
  },
  {
    id: 'manage_memory',
    name: 'manage_memory',
    displayName: 'Banco de Memória Cognitiva',
    description: 'Registra, recupera e categoriza preferências, projetos e diretrizes.',
    category: 'sistema',
    isAvailable: true,
    statusText: 'Operacional (Persistência Local/Servidor)',
    requiresAuth: false,
    riskLevel: 'seguro',
  },
  {
    id: 'execute_system_diagnostic',
    name: 'execute_system_diagnostic',
    displayName: 'Varredura e Diagnóstico',
    description: 'Executa telemetria do assistente, integridade de submódulos e latência.',
    category: 'sistema',
    isAvailable: true,
    statusText: 'Operacional',
    requiresAuth: false,
    riskLevel: 'seguro',
  },
  {
    id: 'create_task',
    name: 'create_task',
    displayName: 'Gerenciador de Tarefas e Metas',
    description: 'Cria e monitora objetivos em andamento com barra de progresso.',
    category: 'produtividade',
    isAvailable: true,
    statusText: 'Operacional',
    requiresAuth: false,
    riskLevel: 'seguro',
  },
  {
    id: 'google_workspace',
    name: 'google_workspace',
    displayName: 'Google Agenda & Workspace',
    description: 'Leitura de eventos de agenda e tarefas. Requer fluxo de autorização OAuth do usuário.',
    category: 'integracao',
    isAvailable: false,
    statusText: 'Requer Conexão OAuth Externa',
    requiresAuth: true,
    riskLevel: 'moderado',
  },
  {
    id: 'gmail_assistant',
    name: 'gmail_assistant',
    displayName: 'Comunicação Gmail',
    description: 'Resumos e rascunhos de e-mails. Requer autorização de escopo OAuth.',
    category: 'integracao',
    isAvailable: false,
    statusText: 'Requer Conexão OAuth Externa',
    requiresAuth: true,
    riskLevel: 'moderado',
  },
  {
    id: 'smart_home_iot',
    name: 'smart_home_iot',
    displayName: 'Controle de Dispositivos e IoT',
    description: 'Automação residencial e acionamento de cenários. Requer integração Home Assistant / Matter.',
    category: 'automacao',
    isAvailable: false,
    statusText: 'Aguardando Hub Doméstico',
    requiresAuth: true,
    riskLevel: 'alto',
  },
];
