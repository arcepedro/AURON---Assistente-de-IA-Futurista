import React, { useState } from 'react';
import {
  BrainCircuit,
  Plus,
  Trash2,
  Search,
  Sliders,
  FolderGit2,
  BookOpen,
  History,
  CheckCircle2,
  Database,
  Lock,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { MemoryCategory, MemoryItem } from '../types/index.ts';
import { filterMemories } from '../utils/memory.ts';

interface MemoryHubProps {
  memories: MemoryItem[];
  onAddMemory: (mem: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
}

export const MemoryHub: React.FC<MemoryHubProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'todas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Memory Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('preferencias');
  const [newPriority, setNewPriority] = useState<'alta' | 'media' | 'baixa'>('media');
  const [newTagInput, setNewTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: { id: MemoryCategory | 'todas'; label: string; icon: React.ElementType }[] = [
    { id: 'todas', label: 'Todas as Memórias', icon: BrainCircuit },
    { id: 'preferencias', label: 'Preferências', icon: Sliders },
    { id: 'projetos', label: 'Projetos', icon: FolderGit2 },
    { id: 'instrucoes', label: 'Instruções', icon: BookOpen },
    { id: 'historico', label: 'Histórico & Fatos', icon: History },
  ];

  const filtered = filterMemories(memories, searchQuery, selectedCategory);

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = newTagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onAddMemory({
        category: newCategory,
        title: newTitle.trim(),
        content: newContent.trim(),
        priority: newPriority,
        tags: tags.length > 0 ? tags : [newCategory],
      });

      setNewTitle('');
      setNewContent('');
      setNewTagInput('');
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#040813] auron-grid-bg relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl auron-panel-border auron-hud-corner shadow-[0_0_20px_rgba(0,240,255,0.06)]">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
            <span className="font-mono-tech text-xs tracking-wider text-cyan-400 uppercase">
              Matriz Cognitiva Persistente
            </span>
          </div>
          <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mt-1">
            BANCO DE MEMÓRIA DE <span className="text-cyan-300 auron-text-glow">AURON</span>
          </h1>
          <p className="text-slate-400 font-rajdhani text-sm sm:text-base mt-0.5">
            Informações estruturadas injetadas continuamente no contexto neural do modelo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-rajdhani font-bold text-sm hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nova Memória</span>
        </button>
      </div>

      {/* Honest Storage Status Callout */}
      <div className="p-4 rounded-xl border border-cyan-800/40 bg-gradient-to-r from-cyan-950/30 to-blue-950/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-rajdhani">
        <div className="flex items-start sm:items-center gap-3">
          <Database className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="font-orbitron font-semibold text-cyan-300">ESTADO DA PERSISTÊNCIA: </span>
            <span className="text-slate-300">
              Servidor Node.js + Cache Sincronizado do Navegador (Ativo e Operacional).
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono-tech">
              As memórias persistem enquanto a aplicação estiver em execução. Para sincronização multi-dispositivo permanente em nuvem, o conector Cloud SQL / Firestore está arquitetado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 font-mono-tech px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/50 self-start md:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{memories.length} Nós Ativos</span>
        </div>
      </div>

      {/* Categories Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-rajdhani font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
                {cat.id !== 'todas' && (
                  <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded bg-black/40 text-slate-400">
                    {memories.filter((m) => m.category === cat.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nas memórias..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-cyan-900/40 text-xs font-rajdhani text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-10 text-center rounded-2xl auron-panel-border space-y-3">
            <BrainCircuit className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400 font-rajdhani">
              Nenhuma memória encontrada para os filtros selecionados.
            </p>
          </div>
        ) : (
          filtered.map((mem) => (
            <div
              key={mem.id}
              className="p-5 rounded-2xl auron-panel-border font-rajdhani relative group hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono-tech mb-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 uppercase text-[10px]">
                    {mem.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {mem.priority && (
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          mem.priority === 'alta'
                            ? 'text-amber-400'
                            : mem.priority === 'media'
                            ? 'text-cyan-400'
                            : 'text-slate-400'
                        }`}
                      >
                        Prioridade {mem.priority}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteMemory(mem.id)}
                      aria-label={`Excluir memória ${mem.title}`}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors opacity-70 group-hover:opacity-100"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-orbitron font-bold text-base text-cyan-100">{mem.title}</h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{mem.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-900/30 flex items-center justify-between text-[11px] font-mono-tech text-slate-500">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {mem.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400"
                    >
                      <Tag className="w-2.5 h-2.5 text-cyan-500" />
                      {tag}
                    </span>
                  ))}
                </div>
                <span>ID: {mem.id.slice(-6)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-2xl auron-panel-border auron-hud-corner shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                <h2 className="font-orbitron font-bold text-lg text-white">Nova Memória Cognitiva</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono-tech text-xs"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4 font-rajdhani">
              <div>
                <label className="block text-xs font-mono-tech text-slate-400 mb-1">
                  Categoria
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-200 text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="preferencias">Preferências do Usuário</option>
                  <option value="projetos">Projetos & Metas</option>
                  <option value="instrucoes">Instruções & Diretrizes</option>
                  <option value="historico">Histórico & Fatos</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-slate-400 mb-1">
                  Título Resumido
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Fuso Horário de Preferência"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-200 text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-tech text-slate-400 mb-1">
                  Conteúdo / Diretriz
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Descreva a instrução ou memória detalhadamente para que AURON a respeite..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-200 text-sm focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-tech text-slate-400 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-200 text-sm focus:outline-none focus:border-cyan-400"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-tech text-slate-400 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="ex: persona, foco, rotina"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-slate-200 text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cyan-900/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
                >
                  {isSubmitting ? 'Gravando...' : 'Gravar Memória'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
