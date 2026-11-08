import React, { useState } from 'react';
import {
  CelestialWorldType,
  CosmosGameState,
  TimeArrowMode,
} from '../types/cosmos';
import { PHASE_PRESETS, PromptInspirationPreset } from '../utils/causalEngine';

interface DivineCommandDockProps {
  gameState: CosmosGameState;
  isWeaving: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onWeaveTurn: (p1Active: string, p1Passive: string, p2Active: string, p2Passive: string) => void;
  onAdvancePhase: (targetPhase: 1 | 2 | 3) => void;
  onSelectWorld: (worldId: CelestialWorldType) => void;
  onSetTimeArrow: (arrow: TimeArrowMode) => void;
  onUpdateCutaway: (sliceZ: number, sliceY: number) => void;
}

export const DivineCommandDock: React.FC<DivineCommandDockProps> = ({
  gameState,
  isWeaving,
  isCollapsed,
  onToggleCollapse,
  onWeaveTurn,
  onAdvancePhase,
  onSelectWorld,
  onSetTimeArrow,
  onUpdateCutaway,
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
  const [activeTab, setActiveTab] = useState<'prompts' | 'world_matrix' | 'synergies'>('prompts');

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

  const latestChronicle = gameState.chronicles[0];

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-3 z-20 w-[96vw] max-w-[1080px] pointer-events-auto transition-transform duration-200"
      style={{
        transform: isCollapsed
          ? 'translate(-50%, calc(100% - 34px))'
          : 'translate(-50%, 0)',
      }}
    >
      {/* Top Collapse/Expand Handle + Phase Advancement Callout */}
      <div className="flex items-center justify-between px-2 mb-1">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="px-3.5 py-1 text-xs font-medium bg-[#121621] hover:bg-[#1B2130] text-slate-200 border border-[#262D40] rounded-t-lg cursor-pointer whitespace-nowrap shrink-0"
        >
          {isCollapsed ? '▴ Show Divine Command Dock (H)' : '▾ Hide Controls (H)'}
        </button>

        {/* Contextual Next-Phase Progression Gate Button */}
        <div className="flex items-center gap-2">
          {gameState.phase === 1 && (
            <button
              type="button"
              onClick={() => handlePhaseTransition(2)}
              className={`px-4 py-1 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                gameState.phase1.sunIgnited
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-[#1A2030] hover:bg-[#232B3E] text-amber-300 border border-amber-500/30'
              }`}
            >
              {gameState.phase1.sunIgnited
                ? 'Sun Ignited → Enter Phase II (Solar System Simulator)'
                : 'Skip to Phase II (Solar System Simulator) →'}
            </button>
          )}

          {gameState.phase === 2 && (
            <button
              type="button"
              onClick={() => handlePhaseTransition(3)}
              className="px-4 py-1 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Lock Planet in Stone → Descend to Phase III Ant-Farm Colony
            </button>
          )}
        </div>
      </div>

      {/* Main Dock Container (No backdrop-filter over active WebGL canvas) */}
      <div className="bg-[#0E121B]/95 border border-[#262D40] rounded-xl p-4 shadow-2xl">
        {/* Top Row: Segmented Mode Tabs + Inspiration Presets + Phase-Specific Quick Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E2536]">
          {/* Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#090B10] rounded-lg border border-[#1E2536]">
            <button
              type="button"
              onClick={() => setActiveTab('prompts')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'prompts'
                  ? 'bg-[#1E2536] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Declare Prompts (Active &amp; Passive)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('world_matrix')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'world_matrix'
                  ? 'bg-[#1E2536] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {gameState.phase === 1
                ? '2. Big Bang Physics'
                : gameState.phase === 2
                  ? '2. Planet & Molecular Rules'
                  : `2. Colony Features (${gameState.phase3.implementedFeatures.length})`}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('synergies')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'synergies'
                  ? 'bg-[#1E2536] text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. Causal Synergies &amp; Entropy
            </button>
          </div>

          {/* Phase III Subterranean Ant-Farm Cutaway Z-Slice Slider */}
          {gameState.phase === 3 && (
            <div className="flex items-center gap-3 px-3 py-1 bg-[#131824] rounded-lg border border-[#242C40]">
              <label
                htmlFor="antfarm-slice-slider"
                className="text-xs text-cyan-300 font-medium whitespace-nowrap shrink-0"
              >
                Ant-Farm Cutaway Slice:
              </label>
              <input
                id="antfarm-slice-slider"
                type="range"
                min={6}
                max={24}
                value={gameState.phase3.cutawaySliceZ}
                onChange={(e) =>
                  onUpdateCutaway(Number(e.target.value), gameState.phase3.cutawaySliceY)
                }
                className="w-24 accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs font-mono-tabular text-slate-300">
                {gameState.phase3.cutawaySliceZ === 24
                  ? 'Full Block'
                  : `Z-Layer ${gameState.phase3.cutawaySliceZ}/24`}
              </span>
            </div>
          )}

          {/* Phase II Planet Picker */}
          {gameState.phase === 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs text-slate-400 mr-1 whitespace-nowrap shrink-0">
                Select World:
              </span>
              {gameState.candidateWorlds.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onSelectWorld(w.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    gameState.phase2.selectedWorldType === w.id
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-[#141926] text-slate-300 hover:bg-[#1E2638]'
                  }`}
                >
                  {w.id === 'rocky'
                    ? 'Rocky'
                    : w.id === 'martian'
                      ? 'Martian'
                      : w.id === 'failed_star_moon'
                        ? 'Failed Star Moon'
                        : 'Comet'}
                </button>
              ))}
            </div>
          )}

          {/* Phase I Time Symmetry Selector */}
          {gameState.phase === 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                Time Flow:
              </span>
              {(['forward', 'reversible_echo', 'dilated'] as TimeArrowMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onSetTimeArrow(mode)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap shrink-0 ${
                    gameState.phase1.timeArrow === mode
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-[#141926] text-slate-300 hover:bg-[#1E2638]'
                  }`}
                >
                  {mode === 'forward'
                    ? 'One-Way Forward'
                    : mode === 'reversible_echo'
                      ? 'Time-Symmetric Echo'
                      : 'Dilated'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: ACTIVE & PASSIVE PROMPT DECLARATIONS */}
        {activeTab === 'prompts' && (
          <div className="space-y-3">
            {/* Quick-Fill Scenario Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                Quick Scenario Presets:
              </span>
              {PHASE_PRESETS[gameState.phase].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 text-xs bg-[#151B28] hover:bg-[#1F283B] text-slate-200 border border-[#28324A] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Dual Player Active + Passive Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* PLAYER 1 */}
              <div className="p-3 rounded-lg bg-[#131824] border border-[#262E42] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-400">
                    PLAYER 1 — {gameState.phase === 1 ? 'Co-Creator of Flux' : 'Architect / Sovereign I'}
                  </span>
                  <span className="text-slate-400 font-mono-tabular">
                    1 Active + 1 Passive
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="p1-active-input"
                      className="text-xs font-medium text-amber-300 w-14 shrink-0"
                    >
                      Active:
                    </label>
                    <input
                      id="p1-active-input"
                      type="text"
                      value={p1Active}
                      onChange={(e) => setP1Active(e.target.value)}
                      placeholder="e.g., 100 Orcs in front of the gates / Farm wood..."
                      className="w-full px-2.5 py-1.5 text-xs bg-[#090B10] text-slate-100 border border-[#262E42] rounded focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="p1-passive-input"
                      className="text-xs font-medium text-slate-400 w-14 shrink-0"
                    >
                      Passive:
                    </label>
                    <input
                      id="p1-passive-input"
                      type="text"
                      value={p1Passive}
                      onChange={(e) => setP1Passive(e.target.value)}
                      placeholder="e.g., Strong crosswind blowing / High gravity..."
                      className="w-full px-2.5 py-1.5 text-xs bg-[#090B10] text-slate-200 border border-[#262E42] rounded focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* PLAYER 2 */}
              <div className="p-3 rounded-lg bg-[#131824] border border-[#262E42] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-400">
                    PLAYER 2 — {gameState.phase === 1 ? 'Co-Creator of Tide' : 'Co-Builder or Trickster Rival'}
                  </span>
                  <span className="text-slate-400 font-mono-tabular">
                    1 Active + 1 Passive
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="p2-active-input"
                      className="text-xs font-medium text-cyan-300 w-14 shrink-0"
                    >
                      Active:
                    </label>
                    <input
                      id="p2-active-input"
                      type="text"
                      value={p2Active}
                      onChange={(e) => setP2Active(e.target.value)}
                      placeholder="e.g., Elven archers on the walls / Create drought..."
                      className="w-full px-2.5 py-1.5 text-xs bg-[#090B10] text-slate-100 border border-[#262E42] rounded focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="p2-passive-input"
                      className="text-xs font-medium text-slate-400 w-14 shrink-0"
                    >
                      Passive:
                    </label>
                    <input
                      id="p2-passive-input"
                      type="text"
                      value={p2Passive}
                      onChange={(e) => setP2Passive(e.target.value)}
                      placeholder="e.g., Torrential rain -> mud / No wood-eating mushrooms..."
                      className="w-full px-2.5 py-1.5 text-xs bg-[#090B10] text-slate-200 border border-[#262E42] rounded focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Turn & Latest Synergy Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-300 truncate">
                <span className="text-purple-400 font-medium">3rd Faction (Entropy AI):</span>{' '}
                <span className="text-slate-400">{gameState.lastEntropyCounterLaw}</span>
              </div>

              <button
                type="button"
                disabled={isWeaving}
                onClick={() => onWeaveTurn(p1Active, p1Passive, p2Active, p2Passive)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isWeaving
                  ? 'Weaving Emergent Reality...'
                  : `Weave Turn ${gameState.globalTurn} (P1 + P2 × Entropy)`}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: WORLD MATRIX / MOLECULAR EMERGENCE / IMPLEMENTED COLONY FEATURES */}
        {activeTab === 'world_matrix' && (
          <div className="space-y-3">
            {gameState.phase === 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#131824] border border-[#242C40]">
                  <div className="text-slate-400">Arrow of Time</div>
                  <div className="text-sm font-semibold text-amber-300 mt-0.5">
                    {gameState.phase1.timeArrow.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#131824] border border-[#242C40]">
                  <div className="text-slate-400">Gravity vs. Electricity</div>
                  <div className="text-sm font-mono-tabular font-semibold text-cyan-300 mt-0.5">
                    {gameState.phase1.gravityStrength.toFixed(2)}G /{' '}
                    {gameState.phase1.electricityStrength.toFixed(2)}E
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#131824] border border-[#242C40]">
                  <div className="text-slate-400">Molecular Cloud Outflow</div>
                  <div className="text-sm font-mono-tabular font-semibold text-slate-100 mt-0.5">
                    C:{gameState.phase1.synthesizedElements.carbon}% · O:
                    {gameState.phase1.synthesizedElements.oxygen}% · Fe:
                    {gameState.phase1.synthesizedElements.iron}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#131824] border border-[#242C40]">
                  <div className="text-slate-400">Protostar Status</div>
                  <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                    {gameState.phase1.sunIgnited
                      ? gameState.phase1.starSpectralClass
                      : 'Awaiting Cooperative Ignition'}
                  </div>
                </div>
              </div>
            )}

            {gameState.phase === 2 && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono-tabular">
                  <div className="p-2.5 rounded bg-[#131824] border border-[#242C40]">
                    <div className="text-slate-400">Density / Mass</div>
                    <div className="text-sm font-semibold text-amber-300">
                      {gameState.phase2.densityG.toFixed(2)}G{' '}
                      {gameState.phase2.densityG >= 1.75 ? '(TOO DENSE!)' : ''}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#131824] border border-[#242C40]">
                    <div className="text-slate-400">Acidity / CO2</div>
                    <div className="text-sm font-semibold text-yellow-300">
                      {gameState.phase2.molecules.acidity}% Acid
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#131824] border border-[#242C40]">
                    <div className="text-slate-400">H2O &amp; Alcohol</div>
                    <div className="text-sm font-semibold text-cyan-300">
                      {gameState.phase2.molecules.h2o}% H2O · {gameState.phase2.molecules.alcohol}% Alc
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#131824] border border-[#242C40]">
                    <div className="text-slate-400">Genetics</div>
                    <div className="text-sm font-semibold text-purple-300">
                      {gameState.phase2.genetics.dnaPresent ? 'DNA + RNA' : 'RNA Only'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#131824] border border-[#242C40]">
                    <div className="text-slate-400">Sulfur Bacteria</div>
                    <div className="text-sm font-semibold text-slate-100">
                      {gameState.phase2.microbes.carbonSulfurBacteria
                        ? 'Present'
                        : 'FORGOTTEN (Venus Risk)'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#131824] border border-[#242C40]">
                    <div className="text-slate-400">Wood Mushrooms</div>
                    <div className="text-sm font-semibold text-slate-100">
                      {gameState.phase2.microbes.woodDecomposerFungi
                        ? 'Present'
                        : `FORGOTTEN (Fire ${gameState.phase2.deadWoodStrata}%)`}
                    </div>
                  </div>
                </div>

                {/* Diagnostic Emergence Warnings */}
                <div className="p-2.5 rounded bg-[#090B10] border border-[#242C40] text-xs space-y-1">
                  <div className="font-semibold text-amber-400">
                    Emergent Planet Archetype:{' '}
                    {gameState.phase2.emergentArchetype.replace(/_/g, ' ').toUpperCase()} · Main
                    Alien: {gameState.mainAlien.name}
                  </div>
                  {gameState.phase2.diagnosticAlerts.map((al, i) => (
                    <div key={i} className="text-slate-300">
                      • {al}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameState.phase === 3 && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono-tabular">
                  <span>
                    Divergence Trajectory — SimCity Civic:{' '}
                    <strong className="text-cyan-300">
                      {gameState.phase3.divergenceScores.simCityCivic}
                    </strong>{' '}
                    · Age of Empires RTS:{' '}
                    <strong className="text-amber-300">
                      {gameState.phase3.divergenceScores.aoeEmpireWar}
                    </strong>{' '}
                    · Dwarf Subterranean:{' '}
                    <strong className="text-purple-300">
                      {gameState.phase3.divergenceScores.dwarfSubterranean}
                    </strong>
                  </span>
                  <span>
                    Wind: {gameState.phase3.weather.windSpeed}kt (Arrow Miss{' '}
                    {gameState.phase3.weather.arrowScatterPenalty}%) · Mud:{' '}
                    {gameState.phase3.weather.mudCoverage}% (Orc Slow{' '}
                    {gameState.phase3.weather.orcSpeedPenalty}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-1">
                  {gameState.phase3.implementedFeatures.map((feat) => (
                    <div
                      key={feat.id}
                      className="p-2.5 rounded bg-[#131824] border border-[#242C40] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100 truncate">
                          {feat.name}
                        </span>
                        <span className="font-mono-tabular text-amber-300">
                          {feat.efficiency}%
                        </span>
                      </div>
                      <div className="text-slate-400 truncate">
                        {feat.category.replace(/_/g, ' ')} · Status: {feat.status.toUpperCase()}
                      </div>
                      {feat.synergyNotes[0] && (
                        <div className="text-slate-300 truncate">→ {feat.synergyNotes[0]}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CAUSAL SYNERGIES & ENTROPY LOG */}
        {activeTab === 'synergies' && latestChronicle && (
          <div className="space-y-2 text-xs max-h-36 overflow-y-auto pr-1">
            <div className="font-semibold text-amber-300">{latestChronicle.headline}</div>
            <p className="text-slate-300 leading-relaxed">{latestChronicle.narrative}</p>
            <div className="space-y-1 pt-1">
              {latestChronicle.synergies.map((syn, i) => (
                <div key={i} className="text-slate-200">
                  <span className="text-cyan-400 font-mono-tabular">→</span>{' '}
                  <strong>{syn.source}</strong> × <strong>{syn.target}</strong>: {syn.outcome}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
