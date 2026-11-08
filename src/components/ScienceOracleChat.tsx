import React, { useState, useMemo } from 'react';
import { CosmosGameState, OracleChatMessage } from '../types/cosmos';
import { generateJuliaPhysicsSnippet } from '../utils/juliaPhysicsSolver';
import { Send, Globe, Code2, Eye, Sparkles, ExternalLink } from 'lucide-react';

interface ScienceOracleChatProps {
  gameState: CosmosGameState;
  onAppendOracleMessages: (msgs: OracleChatMessage[]) => void;
}

export const ScienceOracleChat: React.FC<ScienceOracleChatProps> = ({
  gameState,
  onAppendOracleMessages,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedPlanet = useMemo(
    () =>
      gameState.candidateWorlds.find(
        (w) => w.id === gameState.phase2.selectedWorldType
      ) || gameState.candidateWorlds[3] || gameState.candidateWorlds[0],
    [gameState.candidateWorlds, gameState.phase2.selectedWorldType]
  );

  const juliaCode = useMemo(
    () =>
      generateJuliaPhysicsSnippet(
        gameState.phase1,
        gameState.phase2,
        gameState.phase3.climate.fossilFuelBurned
      ),
    [gameState.phase1, gameState.phase2, gameState.phase3.climate.fossilFuelBurned]
  );

  const quickQuestions = [
    'Why was the Hero of Alexandria / Taqi al-Din steam turbine used for Döner spits before trains?',
    'Explain how the 3 color cones use "Red in the middle as a cheat" vs. Rods for Kokošja Slepota!',
    'How does a 1.0 M☉ Yellow Sun place the 4th planet in the Goldilocks habitable zone?',
    'What atmospheric density lets Hitchhiker’s Guide Sky Whales float via Archimedes buoyancy?',
  ];

  const handleAskOracle = async (promptText?: string) => {
    const q = (promptText ?? question).trim();
    if (!q || loading) return;

    const userMsg: OracleChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAppendOracleMessages([userMsg]);
    if (!promptText) setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/cosmos/oracle-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          gameStateSummary: {
            phase: gameState.phase,
            sunMassSolar: gameState.phase1.sunMassSolar,
            planetName: selectedPlanet.name,
            orbitalRadiusAU: selectedPlanet.orbitRadiusAU,
            inGoldilocksZone: selectedPlanet.inGoldilocksZone,
            atmosphericDensity: gameState.phase2.atmosphericPhysics.airDensityKgM3,
            skyWhaleViable: gameState.phase2.atmosphericPhysics.skyWhalesPresent,
            kokosjaSlepotaActive: gameState.phase2.ocular.kokosjaSlepotaActive,
            colorBlindnessMode: gameState.phase2.ocular.colorBlindnessMode,
            treesRemainingPercent: gameState.phase3.resources.treesRemainingOnIsland,
            seaLevelRiseMeters: gameState.phase3.climate.seaLevelY,
          },
        }),
      });

      const data = await response.json();
      const oracleMsg: OracleChatMessage = {
        id: `oracle-${Date.now()}`,
        role: 'assistant',
        content:
          data.answer ||
          data.reply ||
          'The JuliaPhysics & Wolfram Science Datalink computed your planetary state.',
        wolframEquations: data.wolframEquations || [],
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAppendOracleMessages([oracleMsg]);
    } catch {
      onAppendOracleMessages([
        {
          id: `oracle-err-${Date.now()}`,
          role: 'assistant',
          content:
            'Local JuliaPhysics kernel active: Clausius-Clapeyron boiling point, N-body Goldilocks scaling (L ∝ M^3.5), and 3-Cone + Rod spectral equations remain nominal.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const ocular = gameState.phase2.ocular;
  const sBluePct = ocular.cones.shortBlue ? 88 : 15;
  const mGreenPct = ocular.cones.mediumGreen ? 92 : 18;
  const lRedPct = ocular.cones.longRed ? 95 : 12;
  const rodPct = ocular.rodsPresent ? 94 : 8;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-[#060A0E] border border-[#1E3A2F] rounded-sm p-2.5 text-xs max-h-60 overflow-y-auto">
      {/* Left Column: Live JuliaPhysics & Ocular Spectral Graph (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-2 border-b lg:border-b-0 lg:border-r border-[#1E3A2F] pr-0 lg:pr-2.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-300 uppercase tracking-wider font-mono">
            <Code2 className="w-3.5 h-3.5" />
            <span>JuliaPhysics / ClimaAtmos.jl Solver</span>
          </span>
          <span className="font-mono text-[10px] text-amber-300">
            M☉={gameState.phase1.sunMassSolar.toFixed(2)} | r={selectedPlanet.orbitRadiusAU} AU
          </span>
        </div>

        <pre className="p-2 bg-[#030608] border border-[#1E3A2F] rounded-sm font-mono text-[10px] text-emerald-300 overflow-x-auto leading-relaxed max-h-28">
          {juliaCode}
        </pre>

        {/* 3-Cone ("Red in the Middle as a Cheat") + Rod Ocular Spectral SVG */}
        <div className="p-2 bg-[#070E0B] border border-[#1E3A2F] rounded-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-amber-200">
              <Eye className="w-3 h-3 text-amber-400" />
              <span>3-Cone Spectrum (“Red in Middle Cheat”) + Rods</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                ocular.kokosjaSlepotaActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {ocular.kokosjaSlepotaActive
                ? 'Kokošja Slepota (No Stars!)'
                : ocular.colorBlindnessMode !== 'none'
                  ? ocular.colorBlindnessMode
                  : 'Trichromatic + Rods OK'}
            </span>
          </div>
          <svg
            viewBox="0 0 260 52"
            className="w-full h-12 bg-[#04070B] rounded-sm border border-[#1E3A2F]"
          >
            <path
              d={`M 20 48 Q 105 ${48 - rodPct * 0.42} 190 48`}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <path
              d={`M 10 48 Q 55 ${48 - sBluePct * 0.44} 105 48`}
              fill="rgba(56, 189, 248, 0.18)"
              stroke="#38BDF8"
              strokeWidth="1.8"
            />
            <path
              d={`M 85 48 Q 145 ${48 - lRedPct * 0.44} 215 48`}
              fill="rgba(244, 63, 94, 0.18)"
              stroke="#F43F5E"
              strokeWidth="1.8"
            />
            <path
              d={`M 70 48 Q 130 ${48 - mGreenPct * 0.44} 195 48`}
              fill="rgba(52, 211, 153, 0.18)"
              stroke="#34D399"
              strokeWidth="1.8"
            />
            <text x="16" y="12" fill="#38BDF8" fontSize="7" fontFamily="monospace">
              S-Blue ({sBluePct}%)
            </text>
            <text x="88" y="12" fill="#F43F5E" fontSize="7" fontFamily="monospace">
              L-Red Cheat ({lRedPct}%)
            </text>
            <text x="172" y="12" fill="#34D399" fontSize="7" fontFamily="monospace">
              M-Green ({mGreenPct}%)
            </text>
            <text x="185" y="24" fill="#CBD5E1" fontSize="7" fontFamily="monospace">
              Rods ({rodPct}%)
            </text>
          </svg>
        </div>
      </div>

      {/* Right Column: Google Search Grounded Science & History Oracle Chat (7 cols) */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-amber-300 uppercase tracking-wider font-mono">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Search + Wolfram / JuliaPhysics Science Datalink</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Grounded in Astrophysics, Ocular Biology &amp; History
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {quickQuestions.map((qq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskOracle(qq)}
              disabled={loading}
              className="px-2 py-0.5 text-[10px] font-mono bg-[#0B1410] hover:bg-[#13241C] text-slate-300 border border-[#1E3A2F] rounded-sm transition-colors text-left truncate max-w-full cursor-pointer"
            >
              <Sparkles className="w-2.5 h-2.5 inline mr-1 text-amber-400" />
              {qq}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-[75px] max-h-28 overflow-y-auto space-y-1.5 p-2 bg-[#04070B] border border-[#1E3A2F] rounded-sm">
          {gameState.oracleHistory.map((msg) => (
            <div
              key={msg.id}
              className={`p-1.5 rounded-sm text-[11px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 ml-6'
                  : 'bg-slate-900/90 border border-amber-500/30 text-slate-200 mr-2'
              }`}
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                <span>
                  {msg.role === 'user'
                    ? 'COMMANDER QUERY'
                    : 'SCIENCE VESSEL DATALINK (GOOGLE SEARCH + JULIAPHYSICS)'}
                </span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-line">{msg.content}</p>
              {msg.wolframEquations && msg.wolframEquations.length > 0 && (
                <div className="mt-1 p-1 bg-black/50 border border-emerald-500/30 font-mono text-[10px] text-emerald-300">
                  {msg.wolframEquations.map((eq, i) => (
                    <div key={i}>{eq}</div>
                  ))}
                </div>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-1 pt-1 border-t border-slate-800 flex flex-wrap gap-1.5">
                  {msg.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-sm hover:bg-amber-500/20"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[160px]">{src.title}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskOracle();
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask the Science Vessel about N-body Goldilocks orbits, 3-cone vision, Steam Döner spits, or Collatz 3n+1..."
            className="flex-1 bg-[#070D0B] border border-[#1E3A2F] rounded-sm px-2.5 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 text-emerald-200 border border-emerald-400/50 rounded-sm font-mono text-xs uppercase transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>{loading ? 'Solving…' : 'Query'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
