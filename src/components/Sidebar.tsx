import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  BrainCircuit,
  Wrench,
  Workflow,
  Settings,
  Cpu,
  Radio,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

export type NavTab = 'inicio' | 'conversas' | 'memoria' | 'ferramentas' | 'automacoes' | 'configuracoes';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  activeToolsCount: number;
  totalToolsCount: number;
  memoryCount: number;
  hasApiKey: boolean;
  modelName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  activeToolsCount,
  totalToolsCount,
  memoryCount,
  hasApiKey,
  modelName,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'inicio', label: 'Início', icon: LayoutDashboard },
    { id: 'conversas', label: 'Conversas', icon: MessageSquare },
    { id: 'memoria', label: 'Memória', icon: BrainCircuit, badge: memoryCount },
    { id: 'ferramentas', label: 'Ferramentas', icon: Wrench, badge: `${activeToolsCount}/${totalToolsCount}` },
    { id: 'automacoes', label: 'Automações', icon: Workflow },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-[#050a17]/95 border-r border-cyan-900/30 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Branding header */}
        <div className="p-6 border-b border-cyan-900/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] border border-cyan-300/40">
              <span className="font-orbitron font-black text-xl text-white tracking-widest">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-orbitron font-bold text-xl tracking-wider text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                  AURON
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-mono-tech rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">Assistente de IA Futurista</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-mono-tech uppercase tracking-widest text-slate-500">
            Módulos Principais
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'text-slate-300 hover:text-cyan-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]' : 'text-slate-400'
                    }`}
                  />
                  <span className="font-rajdhani text-base tracking-wide">{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono-tech ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'opacity-100 text-cyan-400' : 'text-slate-500'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Telemetry & Subsystem Status Footer */}
        <div className="p-4 border-t border-cyan-900/40 bg-slate-950/70 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono-tech">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              STATUS
            </span>
            <span className="text-cyan-300 font-medium">ONLINE NOMINAL</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between items-center py-1 px-2 rounded bg-slate-900/80 border border-cyan-900/20 font-mono-tech text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3 h-3 text-cyan-400" />
                Motor IA:
              </span>
              <span className="text-cyan-300 truncate max-w-[120px]">{modelName}</span>
            </div>

            <div className="flex justify-between items-center py-1 px-2 rounded bg-slate-900/80 border border-cyan-900/20 font-mono-tech text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Shield className="w-3 h-3 text-emerald-400" />
                Segurança:
              </span>
              <span className="text-emerald-300 font-medium">Autorização Ativa</span>
            </div>

            <div className="flex justify-between items-center py-1 px-2 rounded bg-slate-900/80 border border-cyan-900/20 font-mono-tech text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Layers className="w-3 h-3 text-cyan-400" />
                Ferramentas:
              </span>
              <span className="text-cyan-300">
                {activeToolsCount} Ativas / {totalToolsCount - activeToolsCount} Externas
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
