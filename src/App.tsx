import React, { useCallback, useEffect, useState } from 'react';
import { CosmicViewport3D } from './components/CosmicViewport3D';
import { DivineCommandDock } from './components/DivineCommandDock';
import { EntropyHeatmapOverlayD3 } from './components/EntropyHeatmapOverlayD3';
import { DivergenceMapD3 } from './components/DivergenceMapD3';
import { ChronicleModal, TitleScreenOverlay } from './components/TitleAndModals';
import {
  CelestialWorldType,
  CosmicPhase,
  CosmosGameState,
  OracleChatMessage,
  TimeArrowMode,
} from './types/cosmos';
import {
  applyDeterministicAndAiWeave,
  createInitialCosmosState,
  evaluatePlanetArchetype,
  synthesizeMainAlien,
} from './utils/causalEngine';
import { solveJuliaAtmosphericPhysics } from './utils/juliaPhysicsSolver';
import { soundEngine } from './utils/sound';

export default function App() {
  const [gameState, setGameState] = useState<CosmosGameState>(() =>
    createInitialCosmosState()
  );
  const [showTitleScreen, setShowTitleScreen] = useState<boolean>(true);
  const [showChronicleModal, setShowChronicleModal] = useState<boolean>(false);
  const [showFullConstellationModal, setShowFullConstellationModal] = useState<boolean>(false);
  const [showEntropyHeatmap, setShowEntropyHeatmap] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isWeaving, setIsWeaving] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [inspectedEntity, setInspectedEntity] = useState<{
    title: string;
    subtitle: string;
    details: string;
  } | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();
      if (key === 'h') {
        e.preventDefault();
        setIsDockCollapsed((prev) => !prev);
      } else if (key === 'e') {
        e.preventDefault();
        setShowEntropyHeatmap((prev) => !prev);
      } else if (key === 'v') {
        e.preventDefault();
        setGameState((prev) => ({
          ...prev,
          phase2: {
            ...prev.phase2,
            ocular: {
              ...prev.phase2.ocular,
              simulateAlienVisionFilter: !prev.phase2.ocular.simulateAlienVisionFilter,
            },
          },
        }));
      } else if (e.key === 'Escape') {
        setShowChronicleModal(false);
        setShowFullConstellationModal(false);
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
      next.phaseTransitionBanner = null;
      if (targetPhase >= 2 && !next.phase1.sunIgnited) {
        next.phase1.sunIgnited = true;
        next.phase1.starSpectralClass = '1.0 M☉ Yellow G-Type Sun';
      }
      if (targetPhase === 3) {
        next.phase2.worldLockedInStone = true;
        next.phase2.atmosphericPhysics = solveJuliaAtmosphericPhysics(
          next.phase1,
          next.phase2,
          next.candidateWorlds,
          next.phase3.climate.fossilFuelBurned
        );
        const evalRes = evaluatePlanetArchetype(next.phase2, next.phase3.climate.seaLevelY);
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
      next.phase2.atmosphericPhysics = solveJuliaAtmosphericPhysics(
        next.phase1,
        next.phase2,
        next.candidateWorlds,
        next.phase3.climate.fossilFuelBurned
      );
      const evalRes = evaluatePlanetArchetype(next.phase2, next.phase3.climate.seaLevelY);
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

  const handleToggleAlienVision = useCallback(() => {
    soundEngine.playClick(540);
    setGameState((prev) => ({
      ...prev,
      phase2: {
        ...prev.phase2,
        ocular: {
          ...prev.phase2.ocular,
          simulateAlienVisionFilter: !prev.phase2.ocular.simulateAlienVisionFilter,
        },
      },
    }));
  }, []);

  const handleAppendOracleMessages = useCallback((msgs: OracleChatMessage[]) => {
    setGameState((prev) => ({
      ...prev,
      oracleHistory: [...prev.oracleHistory, ...msgs],
    }));
  }, []);

  const handleWeaveTurn = async (
    p1Active: string,
    p1Passive: string,
    p2Active: string,
    p2Passive: string,
    actingMode: 'player1' | 'player2' | 'both' = 'both'
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
          actingMode,
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
      // Deterministic physics & loophole compiler handles offline fallback seamlessly
    }

    setGameState((prev) => {
      const updated = applyDeterministicAndAiWeave(
        prev,
        p1Active,
        p1Passive,
        p2Active,
        p2Passive,
        aiResponseData,
        actingMode
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
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#06080D]">
      {/* 100% Full-Viewport 3D Simulation Canvas (SC1 2D Sprites on 3D Stepped Voxel Cliff Board) */}
      <CosmicViewport3D
        gameState={gameState}
        onSelectWorld={handleSelectWorld}
        onInspectEntity={setInspectedEntity}
      />

      {/* D3 Entropy Index & Stasis Force Viewport Heatmap Overlay */}
      <EntropyHeatmapOverlayD3
        gameState={gameState}
        visible={showEntropyHeatmap}
        onClose={() => setShowEntropyHeatmap(false)}
      />

      {/* Title Screen Overlay */}
      {showTitleScreen && (
        <TitleScreenOverlay
          onStartGame={handleStartGame}
          onJumpToPhase={handleAdvancePhase}
        />
      )}

      {/* Active Gameplay StarCraft 1 Top Resource & Telemetry Bar */}
      {!showTitleScreen && (
        <>
          <header className="fixed top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#060B09]/95 border-b-2 border-[#1E3A2F] pointer-events-auto font-mono">
            {/* Zone 1: Brand & Phase Stepper */}
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-[#22C55E] whitespace-nowrap shrink-0">
                FIRST WE MUST PROMPT THE UNIVERSE
              </span>

              <div className="flex items-center gap-1 p-0.5 bg-[#030605] rounded-sm border border-[#1E3A2F]">
                {([1, 2, 3] as CosmicPhase[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleAdvancePhase(p)}
                    className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      gameState.phase === p
                        ? 'bg-[#22C55E] text-slate-950'
                        : 'text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    {p === 1
                      ? 'I: SU(3) Big Bang'
                      : p === 2
                        ? 'II: Orbits & Eye'
                        : 'III: SC1 Voxel Ant-Farm'}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone 2: StarCraft 1 Resource & Physics Telemetry Strip */}
            <div className="hidden xl:flex items-center gap-3 text-[11px] text-slate-200">
              <span className="text-amber-300">
                ☀ {gameState.phase1.sunMassSolar.toFixed(2)} M☉
              </span>
              <span className="text-cyan-300">
                💎 Ore: {gameState.phase3.resources.stoneOre}
              </span>
              <span className="text-emerald-300">
                🌲 Trees: {gameState.phase3.resources.treesRemainingOnIsland}%
              </span>
              <span className="text-orange-300">
                🍖 Döner: {gameState.phase3.resources.donerKebabs}
              </span>
              <span className="text-sky-300">
                🌊 Sea: +{gameState.phase3.climate.seaLevelY.toFixed(1)}m
              </span>
              <span className="text-rose-400 font-bold">
                ⚡ Entropy: {gameState.entropyIndex}%
              </span>
            </div>

            {/* Zone 3: Utility Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowFullConstellationModal(true)}
                className="px-2.5 py-1 text-[11px] font-bold text-amber-300 bg-[#121008] hover:bg-[#1E1A0C] border border-amber-500/50 rounded-sm cursor-pointer"
              >
                D3 Astrolabe
              </button>
              <button
                type="button"
                onClick={() => setShowChronicleModal(true)}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-300 bg-[#08130E] hover:bg-[#0F241B] border border-[#22C55E]/50 rounded-sm cursor-pointer"
              >
                Chronicle ({gameState.chronicles.length})
              </button>
              <button
                type="button"
                onClick={handleToggleMute}
                className="px-2 py-1 text-[11px] text-slate-300 bg-[#0A1017] hover:bg-[#14202E] border border-slate-700 rounded-sm cursor-pointer"
              >
                {isMuted ? 'Muted' : 'Audio'}
              </button>
              <button
                type="button"
                onClick={handleResetCosmos}
                className="px-2 py-1 text-[11px] text-rose-300 bg-[#160B10] hover:bg-[#29121C] border border-rose-500/40 rounded-sm cursor-pointer"
              >
                Reset
              </button>
            </div>
          </header>

          {/* Top-Left Contextual Phase & Inspected SC1 Unit Readout */}
          <div className="fixed top-13 left-4 z-10 max-w-md pointer-events-none space-y-2 font-mono">
            {gameState.phaseTransitionBanner && (
              <div className="px-3 py-2 rounded-sm bg-[#091812]/95 border-2 border-[#22C55E] text-xs pointer-events-auto">
                <div className="font-bold text-[#22C55E]">
                  {gameState.phaseTransitionBanner.title}
                </div>
                <p className="text-[11px] text-slate-200 font-sans mt-0.5">
                  {gameState.phaseTransitionBanner.summary}
                </p>
              </div>
            )}

            {inspectedEntity && (
              <div className="px-3 py-2 rounded-sm bg-[#060D0A]/95 border-2 border-amber-400 text-xs pointer-events-auto">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-amber-300">{inspectedEntity.title}</span>
                  <button
                    type="button"
                    onClick={() => setInspectedEntity(null)}
                    className="text-slate-400 hover:text-white cursor-pointer text-[10px]"
                  >
                    [X]
                  </button>
                </div>
                <div className="text-[#22C55E] text-[10px] mt-0.5">
                  {inspectedEntity.subtitle}
                </div>
                <p className="text-slate-300 text-[11px] font-sans mt-1">
                  {inspectedEntity.details}
                </p>
              </div>
            )}
          </div>

          {/* Unified StarCraft 1 Tactical Command Console */}
          <DivineCommandDock
            gameState={gameState}
            isWeaving={isWeaving}
            isCollapsed={isDockCollapsed}
            showEntropyHeatmap={showEntropyHeatmap}
            onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
            onToggleEntropyHeatmap={() => setShowEntropyHeatmap((prev) => !prev)}
            onToggleAlienVision={handleToggleAlienVision}
            onWeaveTurn={handleWeaveTurn}
            onAdvancePhase={handleAdvancePhase}
            onSelectWorld={handleSelectWorld}
            onSetTimeArrow={handleSetTimeArrow}
            onUpdateCutaway={handleUpdateCutaway}
            onAppendOracleMessages={handleAppendOracleMessages}
            onOpenFullConstellationModal={() => setShowFullConstellationModal(true)}
          />
        </>
      )}

      {/* Full-Screen D3 Causal Constellation Modal */}
      {showFullConstellationModal && (
        <div className="fixed inset-0 z-40 bg-black/85 p-4 md:p-8 flex items-center justify-center">
          <div className="w-full h-full max-w-6xl max-h-[88vh]">
            <DivergenceMapD3
              gameState={gameState}
              mode="modal"
              onCloseModal={() => setShowFullConstellationModal(false)}
            />
          </div>
        </div>
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
