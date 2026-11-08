import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CosmosGameState } from '../types/cosmos';
import { Flame, ShieldAlert, Activity, EyeOff } from 'lucide-react';

interface EntropyHeatmapOverlayD3Props {
  gameState: CosmosGameState;
  visible: boolean;
  onClose: () => void;
}

interface EntropyHotspot {
  id: string;
  label: string;
  normX: number; // 0.1 to 0.9 across viewport
  normY: number; // 0.15 to 0.78 across viewport
  intensity: number; // 0 to 100
  stasisForceLabel: string;
  formula: string;
  details: string;
}

export const EntropyHeatmapOverlayD3: React.FC<EntropyHeatmapOverlayD3Props> = ({
  gameState,
  visible,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<EntropyHotspot | null>(null);

  const hotspots = useMemo<EntropyHotspot[]>(() => {
    const p1 = gameState.phase1;
    const p2 = gameState.phase2;
    const p3 = gameState.phase3;
    const baseEntropy = gameState.entropyIndex;

    const deforestationDeg = Math.max(18, 100 - p3.resources.treesRemainingOnIsland);
    const climateDeg = Math.min(
      100,
      Math.max(15, p3.climate.fossilFuelBurned * 1.1 + (p3.climate.seaLevelY - 1) * 28)
    );
    const trafficStasis = Math.max(
      20,
      100 -
        p3.resources.trafficFlow +
        (p3.implementedFeatures.some((f) => f.voxelEffect === 'square_wheel_cart') ? 35 : 0)
    );
    const ocularStasis = p2.ocular.kokosjaSlepotaActive
      ? 88
      : p2.ocular.colorBlindnessMode !== 'none'
        ? 58
        : 22;
    const collatzShear = Math.min(
      98,
      Math.max(25, (p3.mathRules.collatzValue % 64) + baseEntropy * 0.45)
    );

    return [
      {
        id: 'hs-deforestation',
        label: 'Easter Island Timber Exhaustion Zone',
        normX: 0.34,
        normY: 0.54,
        intensity: Math.min(100, Math.round((deforestationDeg + baseEntropy) * 0.6)),
        stasisForceLabel: 'STASIS VECTOR: Clear-Cut Sawmills',
        formula: `d(Trees)/dt = -k_entropy · N_lumber (${p3.resources.treesRemainingOnIsland.toFixed(0)}% Left)`,
        details:
          'Entropy AI over-optimizes wood harvesting toward 0% forest cover so the colony runs out of timber and collapses.',
      },
      {
        id: 'hs-climate-borehole',
        label: 'Greenhouse τ & Polar Melt Plume',
        normX: 0.64,
        normY: 0.36,
        intensity: Math.min(100, Math.round(climateDeg)),
        stasisForceLabel: 'STASIS VECTOR: Thermal Deluge',
        formula: `τ = ${p2.atmosphericPhysics.opticalDepthTau} | Sea Y = +${p3.climate.seaLevelY.toFixed(1)}m`,
        details:
          'Burning subterranean coal/oil spikes infrared optical depth τ, melting polar ice voxels and drowning low-ground coastal huts.',
      },
      {
        id: 'hs-traffic-trench',
        label: 'Square-Wheel & Mud Logistics Trench',
        normX: 0.48,
        normY: 0.46,
        intensity: Math.min(100, Math.round(trafficStasis)),
        stasisForceLabel: 'STASIS VECTOR: Kinetic Friction Lock',
        formula: `v_cart = v_0 · (1 - μ_mud) = ${p3.resources.trafficFlow}% Flow`,
        details:
          'Literal AI loopholes (Square Wheels + Monsoon Mud) allow the Entropy Optimizer to grind colony transport into kinetic stasis.',
      },
      {
        id: 'hs-collatz-nexus',
        label: '3n+1 Collatz & Steam Döner Sink',
        normX: 0.56,
        normY: 0.6,
        intensity: Math.min(100, Math.round(collatzShear)),
        stasisForceLabel: 'STASIS VECTOR: Recursive Loop',
        formula: `f(n) = ${p3.mathRules.collatzValue} | ${p3.mathRules.powerTowerDisplay}`,
        details:
          'Unchecked steam turbines spin Döner kebab spits while 3n+1 conveyor loops cycle resources toward thermodynamic equilibrium.',
      },
      {
        id: 'hs-ocular-shadow',
        label: p2.ocular.kokosjaSlepotaActive
          ? 'Kokošja Slepota Night-Blindness Ridge'
          : 'High-Ground Cliff Rampart Shear',
        normX: 0.26,
        normY: 0.34,
        intensity: Math.min(100, Math.round((ocularStasis + p1.su3StrongCoupling * 15) * 0.75)),
        stasisForceLabel: p2.ocular.kokosjaSlepotaActive
          ? 'STASIS VECTOR: Scotopic Rod Loss'
          : 'STASIS VECTOR: Ballistic Wind Shear',
        formula: p2.ocular.kokosjaSlepotaActive
          ? 'Rods = FALSE → Contour & Star Blindness'
          : `Wind Scatter = ${p3.weather.arrowScatterPenalty}% | Mud Slow = ${p3.weather.orcSpeedPenalty}%`,
        details: p2.ocular.kokosjaSlepotaActive
          ? 'Because Rod photoreceptors were omitted, night-time contours vanish into Stasis darkness.'
          : 'High-ground cliff elevation and crosswind vectors degrade siege accuracy.',
      },
    ];
  }, [gameState]);

  useEffect(() => {
    if (!visible) return;
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;

    const renderHeatmap = () => {
      const width = containerEl.clientWidth || window.innerWidth;
      const height = containerEl.clientHeight || window.innerHeight;

      const svg = d3.select(svgEl);
      svg.selectAll('*').remove();

      const defs = svg.append('defs');

      // Arrowhead marker for Stasis force vectors
      defs
        .append('marker')
        .attr('id', 'stasis-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L10,0L0,4')
        .attr('fill', '#F43F5E');

      // Generate dense sample points around each hotspot weighted by intensity for d3.contourDensity
      const samplePoints: Array<[number, number, number]> = [];
      const rng = d3.randomNormal.source(d3.randomLcg(42 + gameState.globalTurn));

      hotspots.forEach((hs) => {
        const cx = hs.normX * width;
        const cy = hs.normY * height;
        const count = Math.max(18, Math.round(hs.intensity * 0.95));
        const spreadX = width * 0.075;
        const spreadY = height * 0.075;
        const rx = rng(cx, spreadX);
        const ry = rng(cy, spreadY);
        for (let i = 0; i < count; i++) {
          samplePoints.push([rx(), ry(), hs.intensity]);
        }
      });

      const densityData = d3
        .contourDensity<[number, number, number]>()
        .x((d) => d[0])
        .y((d) => d[1])
        .weight((d) => d[2])
        .size([width, height])
        .bandwidth(48)
        .thresholds(14)(samplePoints);

      const maxVal = d3.max(densityData, (d) => d.value) || 1;
      const colorScale = d3
        .scaleSequential(d3.interpolateInferno)
        .domain([0, maxVal * 1.05]);

      const contourGroup = svg.append('g').attr('class', 'entropy-contours');

      contourGroup
        .selectAll('path')
        .data(densityData)
        .join('path')
        .attr('d', d3.geoPath())
        .attr('fill', (d) => colorScale(d.value))
        .attr('fill-opacity', (d, i) => 0.08 + (i / densityData.length) * 0.34)
        .attr('stroke', (d) => colorScale(d.value))
        .attr('stroke-width', (d, i) => (i % 3 === 0 ? 1.4 : 0.6))
        .attr('stroke-opacity', 0.65);

      // Isometric tactical grid lines inside the heatmap overlay
      const gridGroup = svg.append('g').attr('class', 'tactical-entropy-grid');
      const step = 80;
      for (let x = step; x < width; x += step) {
        gridGroup
          .append('line')
          .attr('x1', x)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', height)
          .attr('stroke', 'rgba(244, 63, 94, 0.08)')
          .attr('stroke-dasharray', '2 6');
      }
      for (let y = step; y < height; y += step) {
        gridGroup
          .append('line')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', width)
          .attr('y2', y)
          .attr('stroke', 'rgba(244, 63, 94, 0.08)')
          .attr('stroke-dasharray', '2 6');
      }

      // Draw Stasis Force Vectors converging toward the central Entropy Sink
      const vectorsGroup = svg.append('g').attr('class', 'stasis-vectors');
      const sinkX = width * 0.49;
      const sinkY = height * 0.47;

      hotspots.forEach((hs) => {
        const hx = hs.normX * width;
        const hy = hs.normY * height;
        const dx = sinkX - hx;
        const dy = sinkY - hy;
        const dist = Math.hypot(dx, dy);
        if (dist > 25) {
          const tx = hx + dx * 0.55;
          const ty = hy + dy * 0.55;
          vectorsGroup
            .append('line')
            .attr('x1', hx)
            .attr('y1', hy)
            .attr('x2', tx)
            .attr('y2', ty)
            .attr('stroke', '#F43F5E')
            .attr('stroke-width', 1.8)
            .attr('stroke-dasharray', '5 3')
            .attr('marker-end', 'url(#stasis-arrow)')
            .attr('opacity', 0.85);
        }
      });
    };

    renderHeatmap();
    window.addEventListener('resize', renderHeatmap);
    return () => window.removeEventListener('resize', renderHeatmap);
  }, [visible, hotspots, gameState.globalTurn]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-10 pointer-events-none overflow-hidden select-none"
      aria-label="D3 Entropy Index & Stasis Force Viewport Heatmap Overlay"
    >
      {/* D3 Contour Heatmap SVG */}
      <svg ref={svgRef} className="w-full h-full block pointer-events-none" />

      {/* Interactive Hotspot Telemetry Markers (pointer-events-auto on badges only) */}
      {hotspots.map((hs) => (
        <div
          key={hs.id}
          style={{
            left: `${hs.normX * 100}%`,
            top: `${hs.normY * 100}%`,
          }}
          onMouseEnter={() => setHoveredHotspot(hs)}
          onMouseLeave={() => setHoveredHotspot((prev) => (prev?.id === hs.id ? null : prev))}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500/40" />
            <div className="px-2 py-0.5 rounded-sm bg-[#12060B]/95 border border-rose-500/80 text-[10px] font-mono text-rose-200 shadow-lg flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="font-bold text-amber-300">{hs.intensity}%</span>
              <span className="hidden sm:inline truncate max-w-[130px]">{hs.label}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Top-Right StarCraft 1 Entropy Telemetry Legend & Stasis Inspector */}
      <div className="fixed top-14 right-4 z-20 w-80 bg-[#080C0A]/95 border-2 border-rose-500/70 rounded-sm p-3 pointer-events-auto shadow-2xl font-mono text-xs">
        <div className="flex items-center justify-between border-b border-rose-500/40 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>D3 Entropy Gradient &amp; Stasis</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-500/50 rounded-sm cursor-pointer"
          >
            <EyeOff className="w-3 h-3" />
            <span>Hide [E]</span>
          </button>
        </div>

        {/* Gradient Scale Bar */}
        <div className="space-y-1 mb-2.5">
          <div className="flex justify-between text-[10px] text-slate-300">
            <span>0% Equilibrium</span>
            <span className="text-amber-300">50% Shear</span>
            <span className="text-rose-400 font-bold">
              100% Stasis ({gameState.entropyIndex}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-sm bg-gradient-to-r from-[#1E1B4B] via-[#D97706] to-[#F43F5E] border border-rose-500/40" />
        </div>

        {hoveredHotspot ? (
          <div className="p-2 bg-rose-950/40 border border-rose-500/50 rounded-sm space-y-1">
            <div className="text-[10px] text-amber-300 font-bold uppercase">
              {hoveredHotspot.stasisForceLabel}
            </div>
            <div className="text-xs font-bold text-white">{hoveredHotspot.label}</div>
            <div className="text-[10px] text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded-sm">
              {hoveredHotspot.formula}
            </div>
            <p className="text-[11px] text-slate-300 leading-snug font-sans">
              {hoveredHotspot.details}
            </p>
          </div>
        ) : (
          <div className="p-2 bg-[#040706] border border-slate-800 rounded-sm space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-emerald-400">
              <Activity className="w-3 h-3" />
              <span>ACTIVE ENTROPY OPTIMIZER DIRECTIVE:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {gameState.lastEntropyCounterLaw}
            </p>
            <div className="text-[10px] text-slate-400 pt-1">
              Hover any hotspot node on the viewport to inspect localized Stasis force equations.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
