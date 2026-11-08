import React, { useCallback, useEffect, useState } from 'react';
import { CosmicViewport3D } from './components/CosmicViewport3D';
import { DivineCommandDock } from './components/DivineCommandDock';
import { ChronicleModal, TitleScreenOverlay } from './components/TitleAndModals';
import {
  CelestialWorldType,
  CosmicPhase,
  CosmosGameState,
  TimeArrowMode,
} from './types/cosmos';
import {
  applyDeterministicAndAiWeave,
  createInitialCosmosState,
  evaluatePlanetArchetype,
  synthesizeMainAlien,
} from './utils/causalEngine';
import { soundEngine } from './utils/sound';

export default function App() {
  const [gameState, setGameState] = useState<CosmosGameState>(() =>
    createInitialCosmosState()
  );
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(true);
  const [showChronicleModal, setShowChronicleModal] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isWeaving, setIsWeaving] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inspectedEntity, setInspectedEntity] = useState<{
    title: string;
    subtitle: string;
    details: string;
  } | null>(null);

  // Keyboard shortcut 'H' to toggle HUD dock, 'Escape' to toggle Chronicle modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowChronicleModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  const handleStartGame = useCallback(() => {
    soundEngine.playBigBangPulse();
    setShowTitleScreen(false);
  }, []);

  const handleAdvancePhase = useCallback((targetPhase: CosmicPhase) => {
    soundEngine.playWeaveChord(targetPhase);
    setShowTitleScreen(false);
    setGameState((prev) => {
      const next: CosmosGameState = JSON.parse(JSON.stringify(prev));
      next.phase = targetPhase;
      if (targetPhase >= 2 && !next.phase1.sunIgnited) {
        next.phase1.sunIgnited = true;
        next.phase1.starSpectralClass = 'Class-G Luminous Sol';
      }
      if (targetPhase === 3) {
        next.phase2.worldLockedInStone = true;
        const evalRes = evaluatePlanetArchetype(next.phase2);
        next.phase2.emergentArchetype = evalRes.archetype;
        next.phase2.diagnosticAlerts = evalRes.alerts;
        next.mainAlien = synthesizeMainAlien(next.phase1, next.phase2);
      }
      return next;
    });
  }, []);

  const handleSelectWorld = useCallback((worldId: CelestialWorldType) => {
    soundEngine.playClick(620);
    setGameState((prev) => {
      if (prev.phase === 3 && prev.phase2.worldLockedInStone) return prev;
      const worldDef = prev.candidateWorlds.find((w) => w.id === worldId);
      if (!worldDef) return prev;
      const next: CosmosGameState = JSON.parse(JSON.stringify(prev));
      next.phase2.selectedWorldType = worldId;
      next.phase2.densityG = worldDef.defaultDensityG;
      next.phase2.molecules.acidity = worldDef.defaultAcidity;
      next.phase2.molecules.h2o = worldDef.defaultH2O;
      const evalRes = evaluatePlanetArchetype(next.phase2);
      next.phase2.emergentArchetype = evalRes.archetype;
      next.phase2.diagnosticAlerts = evalRes.alerts;
      next.mainAlien = synthesizeMainAlien(next.phase1, next.phase2);
      return next;
    });
  }, []);

  const handleSetTimeArrow = useCallback((arrow: TimeArrowMode) => {
    soundEngine.playClick(480);
    setGameState((prev) => ({
      ...prev,
      phase1: {
        ...prev.phase1,
        timeArrow: arrow,
      },
    }));
  }, []);

  const handleUpdateCutaway = useCallback((sliceZ: number, sliceY: number) => {
    setGameState((prev) => ({
      ...prev,
      phase3: {
        ...prev.phase3,
        cutawaySliceZ: sliceZ,
        cutawaySliceY: sliceY,
      },
    }));
  }, []);

  const handleWeaveTurn = async (
    p1Active: string,
    p1Passive: string,
    p2Active: string,
    p2Passive: string
  ) => {
    if (isWeaving) return;
    setIsWeaving(true);
    soundEngine.playWeaveChord(gameState.phase);

    let aiResponseData: Record<string, unknown> | null = null;
    try {
      const response = await fetch('/api/cosmos/weave-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: gameState.phase,
          p1Active,
          p1Passive,
          p2Active,
          p2Passive,
          currentState: {
            entropyIndex: gameState.entropyIndex,
            phase1: gameState.phase1,
            phase2: gameState.phase2,
            mainAlien: gameState.mainAlien,
            phase3Summary: {
              eraTitle: gameState.phase3.eraTitle,
              divergenceScores: gameState.phase3.divergenceScores,
              resources: gameState.phase3.resources,
              weather: gameState.phase3.weather,
              existingFeatures: gameState.phase3.implementedFeatures.map((f) => ({
                name: f.name,
                category: f.category,
                status: f.status,
                voxelEffect: f.voxelEffect,
              })),
            },
          },
        }),
      });
      if (response.ok) {
        aiResponseData = await response.json();
      }
    } catch {
      // Deterministic physics compiler handles offline or fallback seamlessly
    }

    setGameState((prev) => {
      const updated = applyDeterministicAndAiWeave(
        prev,
        p1Active,
        p1Passive,
        p2Active,
        p2Passive,
        aiResponseData
      );
      if (updated.phase === 2 && updated.phase2.greatFireActive && !prev.phase2.greatFireActive) {
        soundEngine.playGreatFireIgnite();
      } else {
        soundEngine.playEntropyDrone();
      }
      return updated;
    });

    setIsWeaving(false);
  };

  const handleResetCosmos = () => {
    soundEngine.playBigBangPulse();
    setInspectedEntity(null);
    setGameState(createInitialCosmosState());
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#090B10]">
      {/* 100% Full-Viewport 3D Simulation Canvas */}
      <CosmicViewport3D
        gameState={gameState}
        onSelectWorld={handleSelectWorld}
        onInspectEntity={setInspectedEntity}
      />

      {/* Title Screen Overlay */}
      {showTitleScreen && (
        <TitleScreenOverlay
          onStartGame={handleStartGame}
          onJumpToPhase={handleAdvancePhase}
        />
      )}

      {/* Active Gameplay Perimeter HUD */}
      {!showTitleScreen && (
        <>
          {/* Top Perimeter Status Bar (Low-Occlusion, Zero Backdrop-Filter) */}
          <header className="fixed top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-4 px-5 py-2.5 bg-[#0B0E17]/95 border-b border-[#22293A] pointer-events-auto">
            {/* Zone 1: Brand & Phase Stepper */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold tracking-wider text-amber-400 font-display whitespace-nowrap shrink-0">
                AETHELGARD
              </span>

              <div className="flex items-center gap-1 p-0.5 bg-[#121622] rounded-lg border border-[#242C40]">
                {([1, 2, 3] as CosmicPhase[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleAdvancePhase(p)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      gameState.phase === p
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p === 1
                      ? 'Phase I: Big Bang'
                      : p === 2
                        ? 'Phase II: Solar System'
                        : 'Phase III: Ant-Farm Colony'}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone 2: Unboxed Tabular Telemetry & Set-in-Stone Planetary Constitution */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 font-mono-tabular">
              <span>Turn {gameState.globalTurn}</span>
              <span aria-hidden="true">·</span>
              {gameState.phase === 1 && (
                <>
                  <span>Time: {gameState.phase1.timeArrow}</span>
                  <span aria-hidden="true">·</span>
                  <span>Gravity: {gameState.phase1.gravityStrength.toFixed(2)}G</span>
                  <span aria-hidden="true">·</span>
                  <span>Electricity: {gameState.phase1.electricityStrength.toFixed(2)}E</span>
                </>
              )}
              {gameState.phase === 2 && (
                <>
                  <span className="text-amber-300">
                    World: {gameState.phase2.selectedWorldType.toUpperCase()}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Density: {gameState.phase2.densityG.toFixed(2)}G</span>
                  <span aria-hidden="true">·</span>
                  <span>Acidity: {gameState.phase2.molecules.acidity}%</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Archetype:{' '}
                    {gameState.phase2.emergentArchetype.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </>
              )}
              {gameState.phase === 3 && (
                <>
                  <span className="text-amber-300 font-semibold">
                    LOCKED PLANET: {gameState.phase2.emergentArchetype.replace(/_/g, ' ').toUpperCase()} ({gameState.phase2.densityG.toFixed(2)}G)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-cyan-300">
                    Alien: {gameState.mainAlien.name}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Timber: {gameState.phase3.resources.timber}</span>
                  <span aria-hidden="true">·</span>
                  <span>Traffic: {gameState.phase3.resources.trafficFlow}%</span>
                  <span aria-hidden="true">·</span>
                  <span>Pop: {gameState.phase3.resources.colonyPopulation}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="text-purple-300">
                Entropy Stillness: {gameState.entropyIndex}%
              </span>
            </div>

            {/* Zone 3: Utility Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowChronicleModal(true)}
                className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#161C2B] hover:bg-[#20283D] border border-[#2A334B] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                Chronicle &amp; Laws ({gameState.chronicles.length})
              </button>
              <button
                type="button"
                onClick={handleToggleMute}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#161C2B] hover:bg-[#20283D] border border-[#2A334B] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                {isMuted ? 'Audio: Muted' : 'Audio: On'}
              </button>
              <button
                type="button"
                onClick={handleResetCosmos}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#161C2B] hover:bg-[#20283D] border border-[#2A334B] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                Reset Universe
              </button>
            </div>
          </header>

          {/* Compact Top-Left Contextual Phase Banner / Inspected Entity Readout */}
          <div className="fixed top-14 left-5 z-10 max-w-md pointer-events-none space-y-2">
            <div className="px-3.5 py-2 rounded-lg bg-[#0D111A]/90 border border-[#22293A] text-xs">
              {gameState.phase === 1 && (
                <div>
                  <span className="text-amber-400 font-semibold">
                    Phase I (Cooperative Genesis):
                  </span>{' '}
                  <span className="text-slate-300">
                    Work together to set time symmetry, gravity, electricity &amp; molecular
                    clouds. Outflows into the Sun and elements for Phase II.
                  </span>
                </div>
              )}
              {gameState.phase === 2 && (
                <div>
                  <span className="text-cyan-400 font-semibold">
                    Phase II (Solar System &amp; Molecular Emergence):
                  </span>{' '}
                  <span className="text-slate-300">
                    Click any orbiting planet ({gameState.phase2.selectedWorldType.toUpperCase()})
                    and prompt simple rules (Acidity, H2O, Alcohol, DNA/RNA, Bacteria, Mushrooms).
                    Forgetting bacteria creates a Venus world; forgetting mushrooms triggers The
                    Great Fire!
                  </span>
                </div>
              )}
              {gameState.phase === 3 && (
                <div>
                  <span className="text-purple-400 font-semibold">
                    Phase III ({gameState.phase3.eraTitle}):
                  </span>{' '}
                  <span className="text-slate-300">
                    Planet &amp; {gameState.mainAlien.name} are set in stone. Prompt any new
                    feature—from wood farming + rain/drought to SimCity traffic roads or Age of
                    Empires Orcs vs. Archers in the mud!
                  </span>
                </div>
              )}
            </div>

            {inspectedEntity && (
              <div className="px-3.5 py-2.5 rounded-lg bg-[#111726]/95 border border-amber-500/40 text-xs pointer-events-auto">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-amber-300">{inspectedEntity.title}</span>
                  <button
                    type="button"
                    onClick={() => setInspectedEntity(null)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="text-cyan-300 font-mono-tabular mt-0.5">
                  {inspectedEntity.subtitle}
                </div>
                <p className="text-slate-300 mt-1">{inspectedEntity.details}</p>
              </div>
            )}
          </div>

          {/* Unified Collapsible Bottom Divine Command Dock */}
          <DivineCommandDock
            gameState={gameState}
            isWeaving={isWeaving}
            isCollapsed={isDockCollapsed}
            onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
            onWeaveTurn={handleWeaveTurn}
            onAdvancePhase={handleAdvancePhase}
            onSelectWorld={handleSelectWorld}
            onSetTimeArrow={handleSetTimeArrow}
            onUpdateCutaway={handleUpdateCutaway}
          />
        </>
      )}

      {/* Chronicle & Planetary Constitution Modal */}
      {showChronicleModal && (
        <ChronicleModal
          gameState={gameState}
          onClose={() => setShowChronicleModal(false)}
        />
      )}
    </div>
  );
}
