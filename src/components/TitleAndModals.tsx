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
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-between p-8 pointer-events-none bg-gradient-to-b from-[#090B10]/85 via-[#090B10]/35 to-[#090B10]/90">
      {/* Top quiet kicker */}
      <div className="text-xs tracking-widest text-slate-400 font-mono-tabular pt-2">
        TWO-PLAYER + ENTROPY EMERGENT STRATEGY SANDBOX
      </div>

      {/* Centerpiece SVG Lockup with generous negative space */}
      <div className="flex flex-col items-center text-center max-w-2xl my-auto pointer-events-auto">
        <svg
          viewBox="0 0 560 130"
          className="w-full max-w-[520px] h-auto mb-4"
          role="img"
          aria-label="Aethelgard: The Ant-Farm Cosmos"
        >
          <defs>
            <linearGradient id="titleGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          {/* Astrolabe Orbital Rings */}
          <ellipse
            cx="280"
            cy="65"
            rx="240"
            ry="44"
            fill="none"
            stroke="url(#titleGold)"
            strokeWidth="1.2"
            strokeDasharray="6 6"
            opacity="0.45"
          />
          <circle
            cx="280"
            cy="65"
            r="52"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1"
            opacity="0.35"
          />
          <circle cx="95" cy="48" r="5" fill="#F59E0B" />
          <circle cx="465" cy="82" r="6" fill="#06B6D4" />
          <circle cx="280" cy="13" r="4" fill="#A855F7" />
          <text
            x="280"
            y="64"
            textAnchor="middle"
            fill="url(#titleGold)"
            fontFamily="Cinzel, Georgia, serif"
            fontSize="40"
            fontWeight="700"
            letterSpacing="6"
          >
            AETHELGARD
          </text>
          <text
            x="280"
            y="95"
            textAnchor="middle"
            fill="#E2E8F0"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontSize="13"
            fontWeight="600"
            letterSpacing="4.5"
          >
            THE ANT-FARM COSMOS
          </text>
        </svg>

        <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6 max-w-xl">
          To create pie, you must first prompt the universe. Cooperate in{' '}
          <span className="text-amber-300 font-medium">Phase I (Big Bang &amp; Molecular Clouds)</span>,
          select your planet and seed biochemical rules in{' '}
          <span className="text-cyan-300 font-medium">Phase II (Solar System Simulator)</span>,
          then clash or co-build across an autonomous{' '}
          <span className="text-purple-300 font-medium">Phase III 3D Voxel Ant-Farm</span>—from{' '}
          <em>SimCity</em> traffic networks to <em>Age of Empires</em> sieges in the mud.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <button
            type="button"
            onClick={onStartGame}
            className="px-7 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-lg transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            Start Simulation (Phase I Genesis)
          </button>
          <button
            type="button"
            onClick={() => onJumpToPhase(2)}
            className="px-4 py-3 bg-[#151A28] hover:bg-[#1E2538] text-slate-200 border border-[#2A334B] text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Jump to Phase II (Solar System)
          </button>
          <button
            type="button"
            onClick={() => onJumpToPhase(3)}
            className="px-4 py-3 bg-[#151A28] hover:bg-[#1E2538] text-cyan-300 border border-cyan-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Jump to Phase III (Ant-Farm Colony)
          </button>
        </div>
      </div>

      {/* Single flat control-hint line */}
      <div className="text-xs text-slate-400 font-mono-tabular pb-1">
        Drag Orbit Camera · Scroll Zoom · Click Planets/Units to Inspect · Enter Start · H Toggle HUD
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75">
      <div className="w-full max-w-3xl max-h-[84vh] flex flex-col bg-[#0F131C] border border-[#262D40] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262D40]">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Cosmic Chronicle &amp; Planetary Constitution
            </h2>
            <p className="text-xs text-slate-400">
              Turn {gameState.globalTurn} · Active Laws, Molecular History &amp; Emergent Synergies
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#1A2030] rounded-md cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Set-in-Stone Planetary & Alien Summary */}
          <div className="p-4 rounded-lg bg-[#141926] border border-[#262D40]">
            <div className="text-xs text-amber-400 font-semibold mb-1">
              {gameState.phase === 3
                ? 'SET IN STONE: LOCKED PLANETARY CONSTITUTION & MAIN ALIEN'
                : 'CURRENT PLANETARY & COSMIC STATE'}
            </div>
            <div className="text-sm font-semibold text-slate-100 mb-1">
              {gameState.mainAlien.name} — {gameState.mainAlien.morphology}
            </div>
            <p className="text-xs text-slate-300 mb-3">{gameState.mainAlien.loreSummary}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono-tabular">
              <span>World: {gameState.phase2.selectedWorldType.toUpperCase()}</span>
              <span>·</span>
              <span>Density: {gameState.phase2.densityG.toFixed(2)}G</span>
              <span>·</span>
              <span>Acidity: {gameState.phase2.molecules.acidity}%</span>
              <span>·</span>
              <span>H2O: {gameState.phase2.molecules.h2o}%</span>
              <span>·</span>
              <span>Alcohol: {gameState.phase2.molecules.alcohol}%</span>
              <span>·</span>
              <span>
                Genetics: {gameState.phase2.genetics.dnaPresent ? 'DNA + RNA' : 'RNA Only'}
              </span>
              <span>·</span>
              <span>
                Bacteria/Fungi:{' '}
                {gameState.phase2.microbes.woodDecomposerFungi
                  ? 'Wood-Decomposers Active'
                  : 'No Wood-Decomposers!'}
              </span>
            </div>
          </div>

          {/* Turn-by-Turn Chronicle Log */}
          <div className="space-y-3">
            {gameState.chronicles.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg bg-[#121621] border border-[#22293A] space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono-tabular">
                  <span>
                    Phase {entry.phase} · Turn {entry.turnNumber}
                  </span>
                  <span>{entry.timestamp}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{entry.headline}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{entry.narrative}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2 rounded bg-[#0C0F17] border border-[#1E2434]">
                    <span className="text-amber-400 font-medium">P1 Active:</span>{' '}
                    <span className="text-slate-200">{entry.p1Active}</span>
                    <div className="text-slate-400 mt-0.5">
                      Passive: {entry.p1Passive}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#0C0F17] border border-[#1E2434]">
                    <span className="text-cyan-400 font-medium">P2 Active:</span>{' '}
                    <span className="text-slate-200">{entry.p2Active}</span>
                    <div className="text-slate-400 mt-0.5">
                      Passive: {entry.p2Passive}
                    </div>
                  </div>
                </div>

                {entry.synergies.length > 0 && (
                  <div className="pt-2 space-y-1">
                    {entry.synergies.map((syn, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="text-amber-400 font-mono-tabular shrink-0">→</span>
                        <span>
                          <strong className="text-slate-100">{syn.source}</strong> on{' '}
                          <strong className="text-slate-200">{syn.target}</strong>: {syn.outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
