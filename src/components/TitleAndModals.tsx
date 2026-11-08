import React, { useEffect } from 'react';
import { CosmosGameState } from '../types/cosmos';

interface TitleScreenOverlayProps {
  onStartGame: () => void;
  onJumpToPhase: (phase: 1 | 2 | 3) => void;
}

export const TitleScreenOverlay: React.FC<TitleScreenOverlayProps> = ({
  onStartGame,
  onJumpToPhase,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-between p-8 pointer-events-none bg-gradient-to-b from-[#05080C]/90 via-[#05080C]/45 to-[#05080C]/95 font-mono">
      <div className="text-xs tracking-widest text-[#22C55E] pt-2 uppercase">
        STARCRAFT 1 2D SPRITES ON 3D STEPPED VOXEL CLIFFS · 2-PLAYER + ENTROPY AI
      </div>

      <div className="flex flex-col items-center text-center max-w-3xl my-auto pointer-events-auto">
        <svg
          viewBox="0 0 680 140"
          className="w-full max-w-[640px] h-auto mb-4"
          role="img"
          aria-label="First We Must Prompt The Universe: Satisfractured"
        >
          <defs>
            <linearGradient id="sc1TitleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <ellipse
            cx="340"
            cy="70"
            rx="300"
            ry="50"
            fill="none"
            stroke="url(#sc1TitleGrad)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.55"
          />
          <text
            x="340"
            y="62"
            textAnchor="middle"
            fill="url(#sc1TitleGrad)"
            fontFamily="Cinzel, Georgia, serif"
            fontSize="28"
            fontWeight="700"
            letterSpacing="4"
          >
            FIRST WE MUST PROMPT THE UNIVERSE
          </text>
          <text
            x="340"
            y="98"
            textAnchor="middle"
            fill="#22C55E"
            fontFamily="JetBrains Mono, monospace"
            fontSize="13"
            fontWeight="700"
            letterSpacing="3.5"
          >
            SATISFRACTURED · STARCRAFT 1 VOXEL ANT-FARM
          </text>
        </svg>

        <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed mb-6 max-w-2xl">
          Configure <span className="text-amber-300 font-semibold">Phase I SU(3) Big Bang Physics</span>{' '}
          to ignite a <span className="text-amber-300">1.0 M☉ Yellow Sun</span>, evolve{' '}
          <span className="text-cyan-300 font-semibold">
            Phase II 4th-Planet Goldilocks Sky Whales &amp; Trichromatic + Rod Eyes
          </span>{' '}
          (avoiding <em>Kokošja Slepota</em> night blindness!), and battle{' '}
          <span className="text-rose-400 font-semibold">Entropy’s Ruthless Optimizer</span> across a{' '}
          <span className="text-[#22C55E] font-semibold">
            Phase III StarCraft 1 2D Sprite &amp; 3D Stepped Voxel Cliff Board
          </span>{' '}
          where every move has <strong>No Backsies!</strong>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={onStartGame}
            className="px-6 py-3 bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase rounded-sm border-2 border-emerald-200 transition-transform active:scale-95 cursor-pointer"
          >
            Launch Phase I (SU(3) Big Bang Genesis)
          </button>
          <button
            type="button"
            onClick={() => onJumpToPhase(2)}
            className="px-4 py-3 bg-[#091410] hover:bg-[#11261E] text-amber-300 border-2 border-amber-500/50 text-xs font-bold uppercase rounded-sm transition-colors cursor-pointer"
          >
            Jump to Phase II (Goldilocks Orbits &amp; Eye)
          </button>
          <button
            type="button"
            onClick={() => onJumpToPhase(3)}
            className="px-4 py-3 bg-[#091410] hover:bg-[#11261E] text-cyan-300 border-2 border-cyan-500/50 text-xs font-bold uppercase rounded-sm transition-colors cursor-pointer"
          >
            Jump to Phase III (SC1 Sprite Voxel Board)
          </button>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 pb-1">
        Drag Orbit Camera · Scroll Zoom · [E] D3 Entropy Heatmap · [V] Alien Eye Vision · [H] Toggle SC1 Console
      </div>
    </div>
  );
};

interface ChronicleModalProps {
  gameState: CosmosGameState;
  onClose: () => void;
}

export const ChronicleModal: React.FC<ChronicleModalProps> = ({ gameState, onClose }) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 font-mono">
      <div className="w-full max-w-3xl max-h-[84vh] flex flex-col bg-[#060C09] border-2 border-[#22C55E] rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E3A2F] bg-[#0A1611]">
          <div>
            <h2 className="text-sm font-bold text-[#22C55E] uppercase">
              StarCraft Datalinks · Cosmic Chronicle &amp; No-Backsies Constitution
            </h2>
            <p className="text-[11px] text-slate-400">
              Turn #{gameState.globalTurn} · Sun {gameState.phase1.sunMassSolar.toFixed(2)} M☉ · Entropy {gameState.entropyIndex}%
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-bold text-slate-200 hover:text-white bg-[#13261E] border border-[#22C55E]/50 rounded-sm cursor-pointer"
          >
            Close [Esc]
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-sm bg-[#09130E] border border-[#1E3A2F]">
            <div className="text-xs text-amber-400 font-bold mb-1">
              LOCKED PLANETARY &amp; OCULAR CONSTITUTION
            </div>
            <div className="text-sm font-bold text-slate-100 mb-1">
              {gameState.mainAlien.name} — {gameState.mainAlien.morphology}
            </div>
            <p className="text-xs text-slate-300 font-sans mb-2">{gameState.mainAlien.loreSummary}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-emerald-300">
              <span>World: {gameState.phase2.selectedWorldType.toUpperCase()}</span>
              <span>·</span>
              <span>P₀: {gameState.phase2.atmosphericPhysics.surfacePressureBar} bar</span>
              <span>·</span>
              <span>T_boil: {gameState.phase2.atmosphericPhysics.waterBoilingPointC}°C</span>
              <span>·</span>
              <span>
                Sky Whales: {gameState.phase2.atmosphericPhysics.skyWhalesPresent ? 'ACTIVE' : 'NO'}
              </span>
              <span>·</span>
              <span>
                Kokošja Slepota: {gameState.phase2.ocular.kokosjaSlepotaActive ? 'YES (NO RODS)' : 'NO (RODS OK)'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {gameState.chronicles.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-sm bg-[#08100C] border border-[#1E3A2F] space-y-2"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Phase {entry.phase} · Turn #{entry.turnNumber}
                  </span>
                  <span>{entry.timestamp}</span>
                </div>
                <h3 className="text-xs font-bold text-amber-300">{entry.headline}</h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{entry.narrative}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
