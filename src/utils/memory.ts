/**
 * AURON Memory Management Utilities
 */

import { MemoryCategory, MemoryItem } from '../types/index.ts';

export const INITIAL_SEED_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_pref_1',
    category: 'preferencias',
    title: 'Tratamento e Formalidade',
    content: 'O usuário prefere ser tratado com respeito profissional e saudações corteses ("Senhor"). As respostas devem ser objetivas e estruturadas.',
    createdAt: '2026-10-30T08:00:00.000Z',
    updatedAt: '2026-10-30T08:00:00.000Z',
    priority: 'alta',
    tags: ['persona', 'comportamento', 'tratamento'],
  },
  {
    id: 'mem_proj_1',
    category: 'projetos',
    title: 'Projeto AURON v1.0',
    content: 'Desenvolvimento do núcleo de IA futurista com painel holográfico reativo, controle por voz em português brasileiro e arquitetura aberta para ferramentas.',
    createdAt: '2026-10-30T08:15:00.000Z',
    updatedAt: '2026-10-30T08:15:00.000Z',
    priority: 'alta',
    tags: ['ia', 'auron', 'arquitetura'],
  },
  {
    id: 'mem_inst_1',
    category: 'instrucoes',
    title: 'Diretriz de Segurança Operacional',
    content: 'Nunca simular acesso a contas ou arquivos externos inexistentes. Solicitar confirmação visual antes de ações destrutivas ou de exclusão.',
    createdAt: '2026-10-30T08:20:00.000Z',
    updatedAt: '2026-10-30T08:20:00.000Z',
    priority: 'alta',
    tags: ['seguranca', 'diretrizes'],
  },
  {
    id: 'mem_hist_1',
    category: 'historico',
    title: 'Inicialização do Sistema',
    content: 'Sessão iniciada com telemetria nominal. Motores de IA e síntese de voz configurados para resposta em português.',
    createdAt: '2026-10-30T08:30:00.000Z',
    updatedAt: '2026-10-30T08:30:00.000Z',
    priority: 'baixa',
    tags: ['boot', 'telemetria'],
  },
];

/**
 * Filter memories by text search and category
 */
export function filterMemories(
  memories: MemoryItem[],
  query: string = '',
  categoryFilter?: MemoryCategory | 'todas'
): MemoryItem[] {
  const q = query.trim().toLowerCase();
  return memories.filter((item) => {
    const matchesCategory =
      !categoryFilter || categoryFilter === 'todas' || item.category === categoryFilter;
    if (!matchesCategory) return false;

    if (!q) return true;

    const inTitle = item.title.toLowerCase().includes(q);
    const inContent = item.content.toLowerCase().includes(q);
    const inTags = item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;

    return inTitle || inContent || inTags;
  });
}

/**
 * Heuristically categorizes a natural language memory text
 */
export function categorizeMemoryText(text: string): MemoryCategory {
  const lower = text.toLowerCase();
  if (
    lower.includes('prefiro') ||
    lower.includes('gosto') ||
    lower.includes('nunca me chame') ||
    lower.includes('chame de') ||
    lower.includes('meu nome')
  ) {
    return 'preferencias';
  }

  if (
    lower.includes('projeto') ||
    lower.includes('meta') ||
    lower.includes('tarefa') ||
    lower.includes('desenvolvimento') ||
    lower.includes('roadmap')
  ) {
    return 'projetos';
  }

  if (
    lower.includes('sempre') ||
    lower.includes('nunca') ||
    lower.includes('regra') ||
    lower.includes('instrução') ||
    lower.includes('diretriz')
  ) {
    return 'instrucoes';
  }

  return 'historico';
}
