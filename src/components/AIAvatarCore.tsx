import React, { useMemo } from 'react';
import { AssistantState } from '../types/index.ts';
import { Mic, Activity, Cpu, Volume2, ShieldCheck, Zap } from 'lucide-react';

interface AIAvatarCoreProps {
  state: AssistantState;
  onCoreClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  isAudioActive?: boolean;
}

export const AIAvatarCore: React.FC<AIAvatarCoreProps> = ({
  state,
  onCoreClick,
  size = 'md',
  isAudioActive = false,
}) => {
  // Dimension tokens
  const dimensions = useMemo(() => {
    switch (size) {
      case 'sm':
        return { container: 'w-36 h-36', svg: 140, rCore: 26, r1: 42, r2: 56 };
      case 'lg':
        return { container: 'w-72 h-72 sm:w-80 sm:h-80', svg: 320, rCore: 60, r1: 95, r2: 125 };
      case 'md':
      default:
        return { container: 'w-52 h-52 sm:w-60 sm:h-60', svg: 240, rCore: 44, r1: 72, r2: 96 };
    }
  }, [size]);

  // Color & theme parameters by state
  const stateMeta = useMemo(() => {
    switch (state) {
      case 'listening':
        return {
          label: 'OUVINDO',
          subtext: 'Captação de voz ativa...',
          icon: Mic,
          primaryColor: '#00f0ff',
          glowClass: 'shadow-[0_0_50px_rgba(0,240,255,0.6)]',
          spinSpeed: 'animate-[spin_4s_linear_infinite]',
          spinReverse: 'animate-[spin_3s_linear_infinite_reverse]',
          coreBg: 'radial-gradient(circle, rgba(0,240,255,0.9) 0%, rgba(0,112,243,0.5) 60%, rgba(2,6,23,0.9) 100%)',
          pulseScale: 'scale-110',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        };
      case 'processing':
        return {
          label: 'PROCESSANDO',
          subtext: 'Raciocínio neural Gemini...',
          icon: Cpu,
          primaryColor: '#818cf8',
          glowClass: 'shadow-[0_0_55px_rgba(129,140,248,0.6)]',
          spinSpeed: 'animate-[spin_2s_linear_infinite]',
          spinReverse: 'animate-[spin_2.5s_linear_infinite_reverse]',
          coreBg: 'radial-gradient(circle, rgba(129,140,248,0.9) 0%, rgba(59,130,246,0.6) 60%, rgba(2,6,23,0.9) 100%)',
          pulseScale: 'scale-105',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        };
      case 'responding':
        return {
          label: 'RESPONDENDO',
          subtext: 'Síntese de voz e transmissão...',
          icon: Volume2,
          primaryColor: '#38bdf8',
          glowClass: 'shadow-[0_0_50px_rgba(56,189,248,0.55)]',
          spinSpeed: 'animate-[spin_6s_linear_infinite]',
          spinReverse: 'animate-[spin_5s_linear_infinite_reverse]',
          coreBg: 'radial-gradient(circle, rgba(56,189,248,0.85) 0%, rgba(14,165,233,0.4) 60%, rgba(2,6,23,0.9) 100%)',
          pulseScale: 'scale-105',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        };
      case 'executing':
        return {
          label: 'EXECUTANDO',
          subtext: 'Execução de ferramenta de sistema...',
          icon: Zap,
          primaryColor: '#f59e0b',
          glowClass: 'shadow-[0_0_50px_rgba(245,158,11,0.55)]',
          spinSpeed: 'animate-[spin_3s_linear_infinite]',
          spinReverse: 'animate-[spin_3.5s_linear_infinite_reverse]',
          coreBg: 'radial-gradient(circle, rgba(245,158,11,0.9) 0%, rgba(217,119,6,0.5) 60%, rgba(2,6,23,0.9) 100%)',
          pulseScale: 'scale-110',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'idle':
      default:
        return {
          label: 'AGUARDANDO',
          subtext: 'Pronto às suas ordens',
          icon: ShieldCheck,
          primaryColor: '#00f0ff',
          glowClass: 'shadow-[0_0_35px_rgba(0,240,255,0.3)]',
          spinSpeed: 'animate-spin-slow',
          spinReverse: 'animate-spin-reverse',
          coreBg: 'radial-gradient(circle, rgba(0,240,255,0.7) 0%, rgba(0,112,243,0.3) 65%, rgba(2,6,23,0.95) 100%)',
          pulseScale: 'scale-100',
          badgeColor: 'bg-cyan-950/40 text-cyan-400 border-cyan-800/50',
        };
    }
  }, [state]);

  const IconComponent = stateMeta.icon;

  return (
    <div className="flex flex-col items-center justify-center select-none group">
      {/* Outer interactive container */}
      <button
        type="button"
        onClick={onCoreClick}
        aria-label={`AURON Núcleo Quântico: estado ${stateMeta.label}. Clique para alternar interação por voz.`}
        className={`relative ${dimensions.container} flex items-center justify-center rounded-full cursor-pointer transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-cyan-400`}
      >
        {/* Ambient atmospheric aura */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-700 pointer-events-none ${stateMeta.glowClass}`}
          style={{ background: stateMeta.primaryColor }}
        />

        {/* Concentric SVG rings with HUD ticks */}
        <svg
          width={dimensions.svg}
          height={dimensions.svg}
          viewBox={`0 0 ${dimensions.svg} ${dimensions.svg}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Ring 1 - Outermost dashed orbit */}
          <circle
            cx={dimensions.svg / 2}
            cy={dimensions.svg / 2}
            r={dimensions.r2}
            fill="none"
            stroke={stateMeta.primaryColor}
            strokeWidth="1.5"
            strokeDasharray="6 8"
            strokeOpacity="0.4"
            className={`${stateMeta.spinSpeed} origin-center`}
          />

          {/* Ring 2 - Segmented tactical ring */}
          <circle
            cx={dimensions.svg / 2}
            cy={dimensions.svg / 2}
            r={dimensions.r2 - 10}
            fill="none"
            stroke={stateMeta.primaryColor}
            strokeWidth="1"
            strokeDasharray="24 16 6 16"
            strokeOpacity="0.6"
            className={`${stateMeta.spinReverse} origin-center`}
          />

          {/* Ring 3 - Intermediate energy ring */}
          <circle
            cx={dimensions.svg / 2}
            cy={dimensions.svg / 2}
            r={dimensions.r1}
            fill="none"
            stroke={stateMeta.primaryColor}
            strokeWidth="1.5"
            strokeDasharray="40 20 10 20"
            strokeOpacity="0.75"
            className={`${stateMeta.spinSpeed} origin-center`}
          />

          {/* Precision Crosshairs / Tick marks */}
          <line
            x1={dimensions.svg / 2}
            y1={dimensions.svg / 2 - dimensions.r2 - 6}
            x2={dimensions.svg / 2}
            y2={dimensions.svg / 2 - dimensions.r2 + 4}
            stroke={stateMeta.primaryColor}
            strokeWidth="2"
            strokeOpacity="0.8"
          />
          <line
            x1={dimensions.svg / 2}
            y1={dimensions.svg / 2 + dimensions.r2 - 4}
            x2={dimensions.svg / 2}
            y2={dimensions.svg / 2 + dimensions.r2 + 6}
            stroke={stateMeta.primaryColor}
            strokeWidth="2"
            strokeOpacity="0.8"
          />
          <line
            x1={dimensions.svg / 2 - dimensions.r2 - 6}
            y1={dimensions.svg / 2}
            x2={dimensions.svg / 2 - dimensions.r2 + 4}
            y2={dimensions.svg / 2}
            stroke={stateMeta.primaryColor}
            strokeWidth="2"
            strokeOpacity="0.8"
          />
          <line
            x1={dimensions.svg / 2 + dimensions.r2 - 4}
            y1={dimensions.svg / 2}
            x2={dimensions.svg / 2 + dimensions.r2 + 6}
            y2={dimensions.svg / 2}
            stroke={stateMeta.primaryColor}
            strokeWidth="2"
            strokeOpacity="0.8"
          />
        </svg>

        {/* Dynamic audio waves when responding */}
        {state === 'responding' && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none z-10">
            {[24, 42, 60, 36, 52, 28, 48, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-cyan-300 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Core Quantum Sphere */}
        <div
          className={`relative rounded-full flex items-center justify-center transition-all duration-500 border border-cyan-400/40 ${stateMeta.pulseScale}`}
          style={{
            width: `${dimensions.rCore * 2}px`,
            height: `${dimensions.rCore * 2}px`,
            background: stateMeta.coreBg,
          }}
        >
          {/* Internal orbital particles */}
          <div className="absolute inset-1 rounded-full border border-white/20 animate-spin-fast pointer-events-none" />

          {/* Central Holographic Icon or Letter */}
          <div className="flex flex-col items-center justify-center text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            <span className="font-orbitron font-extrabold text-lg sm:text-2xl tracking-widest text-cyan-100">
              A
            </span>
          </div>
        </div>
      </button>

      {/* State Telemetry Badge */}
      <div className="mt-3 flex flex-col items-center gap-1">
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono-tech tracking-wider uppercase transition-colors duration-300 ${stateMeta.badgeColor}`}
        >
          <IconComponent className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-semibold">{stateMeta.label}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>
        <p className="text-xs text-slate-400 font-rajdhani tracking-wide text-center">
          {stateMeta.subtext}
        </p>
      </div>
    </div>
  );
};
