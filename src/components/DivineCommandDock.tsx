import React, { useState } from 'react';
import {
  CelestialWorldType,
  CosmosGameState,
  OracleChatMessage,
  TimeArrowMode,
} from '../types/cosmos';
import { PHASE_PRESETS, PromptInspirationPreset } from '../utils/causalEngine';
import { DivergenceMapD3 } from './DivergenceMapD3';
import { ScienceOracleChat } from './ScienceOracleChat';
import { GoogleChatSidePanel } from './GoogleChatSidePanel';
import {
  Flame,
  Eye,
  MessageSquare,
  GitBranch,
  Globe,
  Crosshair,
  ShieldAlert,
  Layers,
  Lock,
  Sparkles,
} from 'lucide-react';

interface DivineCommandDockProps {
  gameState: CosmosGameState;
  isWeaving: boolean;
  isCollapsed: boolean;
  showEntropyHeatmap: boolean;
  onToggleCollapse: () => void;
  onToggleEntropyHeatmap: () => void;
  onToggleAlienVision: () => void;
  onWeaveTurn: (
    p1Active: string,
    p1Passive: string,
    p2Active: string,
    p2Passive: string,
    actingMode?: 'player1' | 'player2' | 'both'
  ) => void;
  onAdvancePhase: (targetPhase: 1 | 2 | 3) => void;
  onSelectWorld: (worldId: CelestialWorldType) => void;
  onSetTimeArrow: (arrow: TimeArrowMode) => void;
  onUpdateCutaway: (sliceZ: number, sliceY: number) => void;
  onAppendOracleMessages: (msgs: OracleChatMessage[]) => void;
  onOpenFullConstellationModal: () => void;
}

export const DivineCommandDock: React.FC<DivineCommandDockProps> = ({
  gameState,
  isWeaving,
  isCollapsed,
  showEntropyHeatmap,
  onToggleCollapse,
  onToggleEntropyHeatmap,
  onToggleAlienVision,
  onWeaveTurn,
  onAdvancePhase,
  onSelectWorld,
  onSetTimeArrow,
  onUpdateCutaway,
  onAppendOracleMessages,
  onOpenFullConstellationModal,
}) => {
  const [p1Active, setP1Active] = useState(
    PHASE_PRESETS[gameState.phase][0]?.p1Active || ''
  );
  const [p1Passive, setP1Passive] = useState(
    PHASE_PRESETS[gameState.phase][0]?.p1Passive || ''
  );
  const [p2Active, setP2Active] = useState(
    PHASE_PRESETS[gameState.phase][0]?.p2Active || ''
  );
  const [p2Passive, setP2Passive] = useState(
    PHASE_PRESETS[gameState.phase][0]?.p2Passive || ''
  );
  const [activeTab, setActiveTab] = useState<
    'prompts' | 'world_matrix' | 'synergies' | 'constellation' | 'oracle'
  >('prompts');
  const [isChatSidePanelOpen, setIsChatSidePanelOpen] = useState<boolean>(false);

  const applyPreset = (preset: PromptInspirationPreset) => {
    setP1Active(preset.p1Active);
    setP1Passive(preset.p1Passive);
    setP2Active(preset.p2Active);
    setP2Passive(preset.p2Passive);
    setActiveTab('prompts');
  };

  const handlePhaseTransition = (nextPhase: 1 | 2 | 3) => {
    const defaultPreset = PHASE_PRESETS[nextPhase][0];
    if (defaultPreset) {
      setP1Active(defaultPreset.p1Active);
      setP1Passive(defaultPreset.p1Passive);
      setP2Active(defaultPreset.p2Active);
      setP2Passive(defaultPreset.p2Passive);
    }
    onAdvancePhase(nextPhase);
  };

  const handleApplyNegotiatedMove = (
    player: 'player1' | 'player2',
    activeMove: string,
    passiveMove: string
  ) => {
    if (player === 'player1') {
      setP1Active(activeMove);
      setP1Passive(passiveMove);
    } else {
      setP2Active(activeMove);
      setP2Passive(passiveMove);
    }
    setActiveTab('prompts');
  };

  const latestChronicle = gameState.chronicles[0];

  return (
    <>
      {/* Google Chat API Move-Negotiation Side-Panel */}
      <GoogleChatSidePanel
        gameState={gameState}
        isOpen={isChatSidePanelOpen}
        onClose={() => setIsChatSidePanelOpen(false)}
        p1Active={p1Active}
        p1Passive={p1Passive}
        p2Active={p2Active}
        p2Passive={p2Passive}
        onApplyNegotiatedMove={handleApplyNegotiatedMove}
      />

      {/* Unified StarCraft 1 Tactical Command Console */}
      <div
        className="fixed left-1/2 -translate-x-1/2 bottom-2 z-20 w-[98vw] max-w-[1260px] pointer-events-auto transition-transform duration-200 font-mono"
        style={{
          transform: isCollapsed
            ? 'translate(-50%, calc(100% - 34px))'
            : 'translate(-50%, 0)',
        }}
      >
        {/* Top Beveled SC1 Console Rim Handle & Phase Outflow Gate */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 mb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#0A130F] hover:bg-[#12241C] text-[#22C55E] border-2 border-[#22C55E]/60 rounded-t-sm cursor-pointer whitespace-nowrap"
            >
              {isCollapsed
                ? '▴ [H] RAISE STARCRAFT COMMAND CONSOLE'
                : '▾ [H] LOWER CONSOLE'}
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] bg-[#0B1218] border border-amber-500/50 text-amber-300 rounded-t-sm">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>NO BACKSIES PROTOCOL ACTIVE · TURN #{gameState.globalTurn}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* D3 Entropy Heatmap Toggle */}
            <button
              type="button"
              onClick={onToggleEntropyHeatmap}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase rounded-t-sm border-2 transition-colors cursor-pointer ${
                showEntropyHeatmap
                  ? 'bg-rose-600 text-white border-rose-300'
                  : 'bg-[#12080D] hover:bg-[#240F1A] text-rose-300 border-rose-500/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>[E] D3 Entropy Heatmap ({gameState.entropyIndex}%)</span>
            </button>

            {/* Google Chat Diplomatic Side-Panel Toggle */}
            <button
              type="button"
              onClick={() => setIsChatSidePanelOpen((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase rounded-t-sm border-2 transition-colors cursor-pointer ${
                isChatSidePanelOpen
                  ? 'bg-[#22C55E] text-slate-950 border-emerald-200'
                  : 'bg-[#081510] hover:bg-[#0F291E] text-[#22C55E] border-[#22C55E]/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Google Chat Comms</span>
            </button>

            {gameState.phase === 1 && (
              <button
                type="button"
                onClick={() => handlePhaseTransition(2)}
                className="px-3 py-1 text-[11px] font-bold uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-300 rounded-t-sm cursor-pointer"
              >
                Ignite Sun → Phase II (Orbits &amp; Eye)
              </button>
            )}

            {gameState.phase === 2 && (
              <button
                type="button"
                onClick={() => handlePhaseTransition(3)}
                className="px-3 py-1 text-[11px] font-bold uppercase bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-2 border-cyan-200 rounded-t-sm cursor-pointer"
              >
                Lock Planet → Phase III SC1 Voxel Board
              </button>
            )}
          </div>
        </div>

        {/* Main StarCraft 1 Brood War / Remastered Metallic Console Frame */}
        <div className="bg-[#070B0E]/98 border-2 border-[#2A3F36] rounded-sm p-2.5 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-2.5">
          {/* ================================================================= */}
          {/* LEFT WING (2 COLS): SC1 TACTICAL RADAR MINIMAP & LAYER TOGGLES    */}
          {/* ================================================================= */}
          <div className="lg:col-span-2 flex flex-col justify-between bg-[#040806] border-2 border-[#1E3A2F] rounded-sm p-2">
            <div className="flex items-center justify-between text-[10px] text-[#22C55E] border-b border-[#1E3A2F] pb-1 mb-1">
              <span className="font-bold uppercase flex items-center gap-1">
                <Crosshair className="w-3 h-3" />
                <span>SC1 Radar</span>
              </span>
              <span className="text-amber-300">P{gameState.phase}</span>
            </div>

            {/* Interactive SVG Tactical Radar Minimap */}
            <div className="relative w-full aspect-square max-h-32 mx-auto bg-[#020504] border border-[#22C55E]/50 rounded-sm overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-full h-full block">
                {/* Stepped Cliff High-Ground Plateau on right */}
                <rect x="65" y="5" width="32" height="90" fill="rgba(34, 197, 94, 0.14)" />
                <line
                  x1="65"
                  y1="5"
                  x2="65"
                  y2="95"
                  stroke="#22C55E"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
                {/* Choke-Point Ramp */}
                <rect x="55" y="40" width="12" height="20" fill="rgba(245, 158, 11, 0.3)" />
                {/* Coastal Water Basin on left */}
                <rect x="4" y="20" width="18" height="60" fill="rgba(2, 132, 199, 0.35)" />

                {/* Mineral Line Blips (Cyan) */}
                <circle cx="88" cy="32" r="2.5" fill="#38BDF8" />
                <circle cx="88" cy="40" r="2.5" fill="#38BDF8" />
                <circle cx="32" cy="22" r="2.5" fill="#38BDF8" />

                {/* Vespene Geyser Blip (Neon Green Square) */}
                <rect x="82" y="68" width="5" height="5" fill="#22C55E" />

                {/* Live Autonomous Unit Blips */}
                {gameState.phase3.agents.map((ag, idx) => {
                  const bx = Math.min(94, Math.max(6, (ag.x / 20) * 100));
                  const bz = Math.min(94, Math.max(6, (ag.z / 20) * 100));
                  const blipCol =
                    ag.faction === 'player1'
                      ? '#F59E0B'
                      : ag.faction === 'player2'
                        ? '#38BDF8'
                        : ag.faction === 'entropy'
                          ? '#F43F5E'
                          : '#22C55E';
                  return <circle key={idx} cx={bx} cy={bz} r="2.6" fill={blipCol} />;
                })}

                {/* White StarCraft Camera Frustum Box */}
                <rect
                  x="18"
                  y="18"
                  width="64"
                  height="64"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  opacity="0.75"
                />
              </svg>
            </div>

            {/* Minimap Layer Quick-Buttons */}
            <div className="mt-1.5 space-y-1 text-[10px]">
              <button
                type="button"
                onClick={onToggleAlienVision}
                className={`w-full flex items-center justify-between px-1.5 py-1 rounded-sm border cursor-pointer ${
                  gameState.phase2.ocular.simulateAlienVisionFilter
                    ? 'bg-amber-500/25 text-amber-200 border-amber-400'
                    : 'bg-[#08110D] text-slate-300 border-[#1E3A2F] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-400" />
                  <span>[V] Alien Eye</span>
                </span>
                <span>
                  {gameState.phase2.ocular.kokosjaSlepotaActive ? 'NO RODS!' : '3-Cone'}
                </span>
              </button>

              {gameState.phase === 3 && (
                <div className="px-1.5 py-1 bg-[#08110D] border border-[#1E3A2F] rounded-sm">
                  <div className="flex justify-between text-[9px] text-cyan-300 mb-0.5">
                    <span>Ant-Farm Cutaway</span>
                    <span>Z:{gameState.phase3.cutawaySliceZ}/24</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={24}
                    value={gameState.phase3.cutawaySliceZ}
                    onChange={(e) =>
                      onUpdateCutaway(Number(e.target.value), gameState.phase3.cutawaySliceY)
                    }
                    className="w-full h-1.5 accent-[#22C55E] cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* CENTER CONSOLE (8 COLS): TABS, MOVE COMPOSER, D3 & ORACLE         */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-[#060A0D] border-2 border-[#1E3A2F] rounded-sm p-2.5">
            {/* Top Console Mode Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 mb-2 border-b border-[#1E3A2F]">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('prompts')}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-sm border cursor-pointer ${
                    activeTab === 'prompts'
                      ? 'bg-[#22C55E] text-slate-950 border-emerald-300'
                      : 'bg-[#09130F] text-emerald-300/80 border-[#1E3A2F] hover:text-white'
                  }`}
                >
                  1. Command Moves
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('world_matrix')}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-sm border cursor-pointer ${
                    activeTab === 'world_matrix'
                      ? 'bg-[#22C55E] text-slate-950 border-emerald-300'
                      : 'bg-[#09130F] text-emerald-300/80 border-[#1E3A2F] hover:text-white'
                  }`}
                >
                  2. Wireframe Matrix ({gameState.phase3.implementedFeatures.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('synergies')}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-sm border cursor-pointer ${
                    activeTab === 'synergies'
                      ? 'bg-[#22C55E] text-slate-950 border-emerald-300'
                      : 'bg-[#09130F] text-emerald-300/80 border-[#1E3A2F] hover:text-white'
                  }`}
                >
                  3. Loophole Log
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('constellation')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase rounded-sm border cursor-pointer ${
                    activeTab === 'constellation'
                      ? 'bg-amber-400 text-slate-950 border-amber-200'
                      : 'bg-[#121008] text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                  }`}
                >
                  <GitBranch className="w-3 h-3" />
                  <span>4. D3 Constellation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('oracle')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase rounded-sm border cursor-pointer ${
                    activeTab === 'oracle'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                      : 'bg-[#081217] text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>5. Science Vessel Oracle</span>
                </button>
              </div>

              {/* Phase II Orbit Picker or Phase I Time Arrow */}
              {gameState.phase === 2 && (
                <div className="flex items-center gap-1 overflow-x-auto">
                  {gameState.candidateWorlds.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => onSelectWorld(w.id)}
                      className={`px-2 py-0.5 text-[10px] rounded-sm border cursor-pointer ${
                        gameState.phase2.selectedWorldType === w.id
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-200'
                          : w.inGoldilocksZone
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                            : 'bg-[#091015] text-slate-400 border-slate-800'
                      }`}
                    >
                      #{w.orbitNumber} {w.inGoldilocksZone ? '★Goldilocks' : w.id.split('_')[0]}
                    </button>
                  ))}
                </div>
              )}

              {gameState.phase === 1 && (
                <div className="flex items-center gap-1">
                  {(['forward', 'reversible_echo', 'dilated'] as TimeArrowMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onSetTimeArrow(mode)}
                      className={`px-2 py-0.5 text-[10px] rounded-sm border cursor-pointer ${
                        gameState.phase1.timeArrow === mode
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-200'
                          : 'bg-[#091015] text-slate-400 border-slate-800'
                      }`}
                    >
                      {mode === 'forward' ? 'Forward Time' : mode === 'reversible_echo' ? 'Echo' : 'Dilated'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 1: MOVE-BASED ACTIVE + PASSIVE COMMAND INPUTS */}
            {activeTab === 'prompts' && (
              <div className="space-y-2">
                {/* Scenario Presets Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold shrink-0">
                    Presets:
                  </span>
                  {PHASE_PRESETS[gameState.phase].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2 py-0.5 text-[10px] bg-[#0B1612] hover:bg-[#132820] text-emerald-200 border border-[#22C55E]/40 rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="w-2.5 h-2.5 inline mr-1 text-amber-400" />
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Open Loophole Hint Banner if previous move left a loophole */}
                {gameState.lastPlayerMove && (
                  <div className="px-2.5 py-1 bg-amber-950/40 border border-amber-500/50 rounded-sm text-[10px] text-amber-200 flex items-center justify-between gap-2">
                    <span>
                      <strong className="text-amber-400 uppercase">
                        Last Move ({gameState.lastPlayerMove.player.toUpperCase()}):
                      </strong>{' '}
                      {gameState.lastPlayerMove.openLoopholeHint}
                    </span>
                    <span className="text-emerald-300 shrink-0 font-bold">
                      Next Up: {gameState.activePlayerTurn.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Player 1 & Player 2 Command Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* PLAYER 1 */}
                  <div
                    className={`p-2 rounded-sm bg-[#08100D] border-2 space-y-1.5 ${
                      gameState.activePlayerTurn === 'player1'
                        ? 'border-amber-400'
                        : 'border-[#1E3A2F]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-400 uppercase">
                        P1 (Architect of Order) {gameState.activePlayerTurn === 'player1' ? '◀ ACTIVE TURN' : ''}
                      </span>
                      <button
                        type="button"
                        disabled={isWeaving}
                        onClick={() =>
                          onWeaveTurn(p1Active, p1Passive, p2Active, p2Passive, 'player1')
                        }
                        className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] rounded-sm uppercase cursor-pointer"
                      >
                        Commit P1 Move
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-amber-300 w-12 shrink-0">Active:</span>
                      <input
                        type="text"
                        value={p1Active}
                        onChange={(e) => setP1Active(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] bg-[#030605] text-slate-100 border border-[#1E3A2F] rounded-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 w-12 shrink-0">Passive:</span>
                      <input
                        type="text"
                        value={p1Passive}
                        onChange={(e) => setP1Passive(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] bg-[#030605] text-slate-200 border border-[#1E3A2F] rounded-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* PLAYER 2 */}
                  <div
                    className={`p-2 rounded-sm bg-[#08100D] border-2 space-y-1.5 ${
                      gameState.activePlayerTurn === 'player2'
                        ? 'border-cyan-400'
                        : 'border-[#1E3A2F]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-cyan-400 uppercase">
                        P2 (Weaver / Counter) {gameState.activePlayerTurn === 'player2' ? '◀ ACTIVE TURN' : ''}
                      </span>
                      <button
                        type="button"
                        disabled={isWeaving}
                        onClick={() =>
                          onWeaveTurn(p1Active, p1Passive, p2Active, p2Passive, 'player2')
                        }
                        className="px-2 py-0.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[10px] rounded-sm uppercase cursor-pointer"
                      >
                        Commit P2 Move
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-cyan-300 w-12 shrink-0">Active:</span>
                      <input
                        type="text"
                        value={p2Active}
                        onChange={(e) => setP2Active(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] bg-[#030605] text-slate-100 border border-[#1E3A2F] rounded-sm focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 w-12 shrink-0">Passive:</span>
                      <input
                        type="text"
                        value={p2Passive}
                        onChange={(e) => setP2Passive(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] bg-[#030605] text-slate-200 border border-[#1E3A2F] rounded-sm focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="text-[10px] text-rose-300 truncate max-w-xl">
                    <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-rose-400" />
                    <strong>ENTROPY AI (3RD FACTION):</strong> {gameState.lastEntropyCounterLaw}
                  </div>

                  <button
                    type="button"
                    disabled={isWeaving}
                    onClick={() =>
                      onWeaveTurn(p1Active, p1Passive, p2Active, p2Passive, 'both')
                    }
                    className="px-4 py-1.5 bg-[#22C55E] hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase rounded-sm border border-emerald-200 transition-colors cursor-pointer shrink-0"
                  >
                    {isWeaving
                      ? 'Executing Literal AI & Physics Weave…'
                      : `Execute Simultaneous Turn #${gameState.globalTurn} (P1 + P2 × Entropy)`}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: WIREFRAME TELEMETRY MATRIX */}
            {activeTab === 'world_matrix' && (
              <div className="space-y-2 text-[11px] max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 bg-[#040806] border border-[#1E3A2F] rounded-sm">
                    <div className="text-slate-400 text-[10px]">Sun Mass &amp; Goldilocks</div>
                    <div className="text-amber-300 font-bold">
                      {gameState.phase1.sunMassSolar.toFixed(2)} M☉ (L={gameState.phase1.sunLuminositySolar} L☉)
                    </div>
                  </div>
                  <div className="p-2 bg-[#040806] border border-[#1E3A2F] rounded-sm">
                    <div className="text-slate-400 text-[10px]">Atmosphere &amp; Boiling</div>
                    <div className="text-cyan-300 font-bold">
                      {gameState.phase2.atmosphericPhysics.surfacePressureBar} bar · Boil {gameState.phase2.atmosphericPhysics.waterBoilingPointC}°C
                    </div>
                  </div>
                  <div className="p-2 bg-[#040806] border border-[#1E3A2F] rounded-sm">
                    <div className="text-slate-400 text-[10px]">Ocular Cones &amp; Rods</div>
                    <div className="text-emerald-300 font-bold">
                      {gameState.phase2.ocular.kokosjaSlepotaActive
                        ? 'Kokošja Slepota (No Rods!)'
                        : '3-Cone + Rods Active'}
                    </div>
                  </div>
                  <div className="p-2 bg-[#040806] border border-[#1E3A2F] rounded-sm">
                    <div className="text-slate-400 text-[10px]">Trees &amp; Sea Level</div>
                    <div className="text-rose-300 font-bold">
                      Trees {gameState.phase3.resources.treesRemainingOnIsland}% · Sea +{gameState.phase3.climate.seaLevelY.toFixed(1)}m
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {gameState.phase3.implementedFeatures.map((feat) => (
                    <div
                      key={feat.id}
                      className="p-2 bg-[#08110D] border border-[#1E3A2F] rounded-sm space-y-0.5"
                    >
                      <div className="flex justify-between font-bold text-emerald-300">
                        <span className="truncate">{feat.name}</span>
                        <span className="text-amber-300">{feat.efficiency}%</span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-sans leading-snug">
                        {feat.literalOutcome}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LOOPHOLE & ENTROPY CHRONICLE LOG */}
            {activeTab === 'synergies' && latestChronicle && (
              <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                <div className="font-bold text-amber-300">{latestChronicle.headline}</div>
                <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                  {latestChronicle.narrative}
                </p>
                <div className="space-y-1 pt-1">
                  {latestChronicle.synergies.map((syn, i) => (
                    <div key={i} className="text-[11px] text-emerald-200">
                      <span className="text-amber-400">▶</span> <strong>{syn.source}</strong> ×{' '}
                      <strong>{syn.target}</strong>: {syn.outcome}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: D3 CAUSAL CONSTELLATION MAP */}
            {activeTab === 'constellation' && (
              <DivergenceMapD3
                gameState={gameState}
                mode="compact"
                onOpenModal={onOpenFullConstellationModal}
              />
            )}

            {/* TAB 5: JULIAPHYSICS & GOOGLE SEARCH SCIENCE ORACLE */}
            {activeTab === 'oracle' && (
              <ScienceOracleChat
                gameState={gameState}
                onAppendOracleMessages={onAppendOracleMessages}
              />
            )}
          </div>

          {/* ================================================================= */}
          {/* RIGHT WING (2 COLS): STARCRAFT 1 3x3 TACTICAL COMMAND CARD        */}
          {/* ================================================================= */}
          <div className="lg:col-span-2 flex flex-col justify-between bg-[#040806] border-2 border-[#1E3A2F] rounded-sm p-2">
            <div className="flex items-center justify-between text-[10px] text-[#22C55E] border-b border-[#1E3A2F] pb-1 mb-1">
              <span className="font-bold uppercase flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>3x3 Command Card</span>
              </span>
              <span className="text-amber-300">{gameState.phase3.mathRules.collatzValue}n</span>
            </div>

            <div className="grid grid-cols-3 gap-1 my-auto">
              <button
                type="button"
                onClick={() => handlePhaseTransition(1)}
                className="p-1.5 bg-[#0A1611] hover:bg-[#142C22] border border-[#22C55E]/50 rounded-sm text-center cursor-pointer"
                title="Phase I: SU(3) Big Bang"
              >
                <div className="text-[9px] text-amber-400 font-bold">[Q] P-I</div>
                <div className="text-[8px] text-slate-300 truncate">Big Bang</div>
              </button>
              <button
                type="button"
                onClick={() => handlePhaseTransition(2)}
                className="p-1.5 bg-[#0A1611] hover:bg-[#142C22] border border-[#22C55E]/50 rounded-sm text-center cursor-pointer"
                title="Phase II: Orbits & Eye"
              >
                <div className="text-[9px] text-cyan-400 font-bold">[W] P-II</div>
                <div className="text-[8px] text-slate-300 truncate">Orbits/Eye</div>
              </button>
              <button
                type="button"
                onClick={() => handlePhaseTransition(3)}
                className="p-1.5 bg-[#0A1611] hover:bg-[#142C22] border border-[#22C55E]/50 rounded-sm text-center cursor-pointer"
                title="Phase III: SC1 Voxel Board"
              >
                <div className="text-[9px] text-emerald-400 font-bold">[E] P-III</div>
                <div className="text-[8px] text-slate-300 truncate">SC1 Board</div>
              </button>

              <button
                type="button"
                onClick={onToggleEntropyHeatmap}
                className={`p-1.5 border rounded-sm text-center cursor-pointer ${
                  showEntropyHeatmap
                    ? 'bg-rose-600/40 border-rose-400 text-white'
                    : 'bg-[#0A1611] hover:bg-[#142C22] border-rose-500/50 text-rose-300'
                }`}
                title="Toggle D3 Entropy Index Viewport Heatmap"
              >
                <div className="text-[9px] font-bold">[A] HEAT</div>
                <div className="text-[8px] truncate">D3 Stasis</div>
              </button>
              <button
                type="button"
                onClick={() => setIsChatSidePanelOpen((prev) => !prev)}
                className={`p-1.5 border rounded-sm text-center cursor-pointer ${
                  isChatSidePanelOpen
                    ? 'bg-emerald-600/40 border-emerald-300 text-white'
                    : 'bg-[#0A1611] hover:bg-[#142C22] border-[#22C55E]/50 text-emerald-300'
                }`}
                title="Open Google Chat Diplomatic Comms"
              >
                <div className="text-[9px] font-bold">[S] CHAT</div>
                <div className="text-[8px] truncate">G-Chat API</div>
              </button>
              <button
                type="button"
                onClick={onOpenFullConstellationModal}
                className="p-1.5 bg-[#0A1611] hover:bg-[#142C22] border border-amber-500/50 rounded-sm text-center cursor-pointer text-amber-300"
                title="Expand Full D3 Constellation Map"
              >
                <div className="text-[9px] font-bold">[D] MAP</div>
                <div className="text-[8px] truncate">D3 Graph</div>
              </button>

              <button
                type="button"
                onClick={onToggleAlienVision}
                className="p-1.5 bg-[#0A1611] hover:bg-[#142C22] border border-[#22C55E]/50 rounded-sm text-center cursor-pointer text-purple-300"
                title="Toggle Alien Ocular Vision Filter"
              >
                <div className="text-[9px] font-bold">[Z] EYE</div>
                <div className="text-[8px] truncate">Rods/Cones</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('oracle')}
                className="p-1.5 bg-[#0A1611] hover:bg-[#142C22] border border-[#22C55E]/50 rounded-sm text-center cursor-pointer text-cyan-300"
                title="Open JuliaPhysics & Google Search Oracle"
              >
                <div className="text-[9px] font-bold">[X] SCI</div>
                <div className="text-[8px] truncate">Julia.jl</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('prompts')}
                className="p-1.5 bg-[#22C55E]/25 hover:bg-[#22C55E]/40 border border-[#22C55E] rounded-sm text-center cursor-pointer text-[#22C55E]"
                title="Return to Active/Passive Move Composer"
              >
                <div className="text-[9px] font-bold">[C] MOVE</div>
                <div className="text-[8px] truncate">Weave</div>
              </button>
            </div>

            <div className="mt-1 pt-1 border-t border-[#1E3A2F] text-[9px] text-slate-400 flex justify-between">
              <span>Döner: {gameState.phase3.resources.donerKebabs}</span>
              <span>SkyWhales: {gameState.phase2.atmosphericPhysics.skyWhalesPresent ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
