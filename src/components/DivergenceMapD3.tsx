import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { CosmosGameState, DivergenceNode, DivergenceLink } from '../types/cosmos';
import { Maximize2, Minimize2, GitBranch, Compass } from 'lucide-react';

interface DivergenceMapD3Props {
  gameState: CosmosGameState;
  mode?: 'compact' | 'modal';
  onOpenModal?: () => void;
  onCloseModal?: () => void;
}

interface SimNode extends DivergenceNode, d3.SimulationNodeDatum {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  kind: 'causal_chain' | 'paradigm_pull' | 'entropy_shear';
  strength: number;
}

export const DivergenceMapD3: React.FC<DivergenceMapD3Props> = ({
  gameState,
  mode = 'compact',
  onOpenModal,
  onCloseModal,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [selectedNode, setSelectedNode] = useState<DivergenceNode | null>(null);

  const selectedPlanet = useMemo(
    () =>
      gameState.candidateWorlds.find(
        (w) => w.id === gameState.phase2.selectedWorldType
      ) || gameState.candidateWorlds[3] || gameState.candidateWorlds[0],
    [gameState.candidateWorlds, gameState.phase2.selectedWorldType]
  );

  // Normalize 4-way paradigm percentages from divergenceScores
  const normalizedMix = useMemo(() => {
    const raw = gameState.phase3.divergenceScores;
    const total = Math.max(
      1,
      raw.alphaCentauriXenobio +
        raw.aoeEmpireWar +
        raw.rimWorldColony +
        raw.blackAndWhiteMiracles
    );
    const smac = Math.round((raw.alphaCentauriXenobio / total) * 100);
    const aoe = Math.round((raw.aoeEmpireWar / total) * 100);
    const rim = Math.round((raw.rimWorldColony / total) * 100);
    const bw = Math.max(0, 100 - smac - aoe - rim);

    const drift =
      (Math.abs(smac - 25) +
        Math.abs(aoe - 25) +
        Math.abs(rim - 25) +
        Math.abs(bw - 25)) /
      1.5;

    const pairs: Array<{ label: string; val: number }> = [
      { label: 'Xenobiology & Sky Whales', val: smac },
      { label: 'StarCraft 1 Voxel RTS', val: aoe },
      { label: 'Satisfractured Ant-Farm', val: rim },
      { label: 'Literal AI Loopholes', val: bw },
    ];
    pairs.sort((a, b) => b.val - a.val);

    return {
      smac,
      aoe,
      rim,
      bw,
      driftIndex: Math.min(100, drift),
      dominantAttractor: pairs[0].label,
    };
  }, [gameState.phase3.divergenceScores]);

  // Build deterministic + emergent causal constellation nodes & links from live game state
  const { nodes, links } = useMemo(() => {
    const p1 = gameState.phase1;
    const p2 = gameState.phase2;
    const p3 = gameState.phase3;

    const rawNodes: DivergenceNode[] = [
      {
        id: 'origin-baseline',
        label: 'Initial Baseline (25 / 25 / 25 / 25)',
        category: 'origin',
        phase: 0,
        paradigm: 'origin',
        weight: 20,
        turnAdded: 0,
        description:
          'Unbroken Cosmic Equilibrium before Player 1 & Player 2 prompted the Universe. All four civilization paradigms begin at 25% parity.',
        loopholeQuote: 'First we must prompt the Universe — No Backsies!',
      },
      {
        id: 'attractor-smac',
        label: `Xenobiology & Sky Whales (${normalizedMix.smac}%)`,
        category: 'attractor',
        phase: 0,
        paradigm: 'alphaCentauri',
        weight: 15 + normalizedMix.smac * 0.16,
        turnAdded: 0,
        description:
          "Sid Meier's Alpha Centauri & Hitchhiker's Guide Xenobiology Attractor: High buoyancy skies, Sky Whales, psionic mind-worms, and planetary consciousness.",
      },
      {
        id: 'attractor-aoe',
        label: `StarCraft 1 Voxel RTS (${normalizedMix.aoe}%)`,
        category: 'attractor',
        phase: 0,
        paradigm: 'aoe2',
        weight: 15 + normalizedMix.aoe * 0.16,
        turnAdded: 0,
        description:
          'StarCraft 1 / Age of Empires Voxel Cliff RTS Attractor: Round-axle siege wheels, mineral/timber logistics, Orc vs. Elf high-ground tactical warfare.',
      },
      {
        id: 'attractor-rimworld',
        label: `Satisfractured Ant-Farm (${normalizedMix.rim}%)`,
        category: 'attractor',
        phase: 0,
        paradigm: 'rimworld',
        weight: 15 + normalizedMix.rim * 0.16,
        turnAdded: 0,
        description:
          'RimWorld / Satisfractured Colony Attractor: Subterranean ant-farm logistics, 3n+1 Collatz conveyor belts, Steam Döner rotisseries, and colonist psychology.',
      },
      {
        id: 'attractor-bw2',
        label: `Miracles & Literal Loopholes (${normalizedMix.bw}%)`,
        category: 'attractor',
        phase: 0,
        paradigm: 'blackAndWhite',
        weight: 15 + normalizedMix.bw * 0.16,
        turnAdded: 0,
        description:
          'Black & White 2 Divine Miracles & Literal AI Loopholes Attractor: Square wheels, melting mud-leaf huts, temple steam automatons, and divine awe.',
      },
      {
        id: 'attractor-entropy',
        label: `Entropy Stasis Sink (${gameState.entropyIndex}%)`,
        category: 'attractor',
        phase: 0,
        paradigm: 'entropy',
        weight: 15 + gameState.entropyIndex * 0.2,
        turnAdded: 0,
        description: `Entropy's Ruthless Optimizer Sink: Exploits unchecked player moves (Trees left: ${p3.resources.treesRemainingOnIsland.toFixed(0)}%, Sea level: ${p3.climate.seaLevelY.toFixed(1)}m).`,
      },
      {
        id: 'p1-inflation',
        label: `Inflation φ (${p1.inflationFieldPhi.toFixed(2)}) & CP Asymmetry`,
        category: 'phase1_constant',
        phase: 1,
        paradigm: 'alphaCentauri',
        weight: 11,
        turnAdded: 1,
        description: `Baryogenesis CP violation (${p1.cpAsymmetry.toFixed(2)}) and Cosmic Inflation rate (${p1.inflationFieldPhi.toFixed(2)}) prevented total matter-antimatter annihilation.`,
      },
      {
        id: 'p1-su3-sun',
        label: `SU(3) Gauge (${p1.su3StrongCoupling.toFixed(2)}) → ${p1.sunMassSolar.toFixed(2)} M☉ Sun`,
        category: 'phase1_constant',
        phase: 1,
        paradigm: p1.sunMassSolar >= 0.85 && p1.sunMassSolar <= 1.18 ? 'aoe2' : 'blackAndWhite',
        weight: 13,
        turnAdded: 1,
        description: `Strong nuclear coupling α_s = ${p1.su3StrongCoupling.toFixed(2)} forged a ${p1.sunMassSolar.toFixed(2)} M☉ star (${p1.starSpectralClass}), setting the Goldilocks habitable zone via L = M^3.5.`,
      },
      {
        id: 'p2-planet',
        label: `Orbit #${selectedPlanet.orbitNumber}: ${selectedPlanet.name}`,
        category: 'phase2_planet',
        phase: 2,
        paradigm: selectedPlanet.inGoldilocksZone ? 'aoe2' : 'rimworld',
        weight: 13,
        turnAdded: 2,
        description: `${selectedPlanet.subtitle}. Surface Temp: ${p2.atmosphericPhysics.surfaceTempC}°C, Boiling Point: ${p2.atmosphericPhysics.waterBoilingPointC}°C. ${
          selectedPlanet.inGoldilocksZone
            ? 'Sits squarely inside the 4th-planet Goldilocks liquid-water band!'
            : 'Outside the primary Goldilocks band — extreme thermodynamic adaptation required.'
        }`,
      },
      {
        id: 'p2-skywhales',
        label: p2.atmosphericPhysics.skyWhalesPresent
          ? `Sky Whales Viable (ρ=${p2.atmosphericPhysics.airDensityKgM3} kg/m³)`
          : `Thin Sky (ρ=${p2.atmosphericPhysics.airDensityKgM3} kg/m³)`,
        category: 'phase2_planet',
        phase: 2,
        paradigm: 'alphaCentauri',
        weight: p2.atmosphericPhysics.skyWhalesPresent ? 12 : 9,
        turnAdded: 2,
        description: p2.atmosphericPhysics.skyWhalesPresent
          ? `Archimedes buoyancy lift (${p2.atmosphericPhysics.archimedesBuoyancyIndex}x) supports aero-plankton and Hitchhiker's Guide Sky Whales!`
          : `Atmospheric density (${p2.atmosphericPhysics.airDensityKgM3} kg/m³) is below threshold for native Sky Whales.`,
      },
      {
        id: 'p2-ocular',
        label: p2.ocular.kokosjaSlepotaActive
          ? 'Eye: Kokošja Slepota (No Rods / Blind to Stars!)'
          : p2.ocular.colorBlindnessMode !== 'none'
            ? `Eye: ${p2.ocular.colorBlindnessMode} Color Blindness`
            : 'Eye: 3-Cone (Red-in-Middle Cheat) + Rods',
        category: 'phase2_ocular',
        phase: 2,
        paradigm: p2.ocular.kokosjaSlepotaActive ? 'blackAndWhite' : 'alphaCentauri',
        weight: 12,
        turnAdded: 2,
        description: p2.ocular.kokosjaSlepotaActive
          ? 'Rods were neglected! Aliens suffer Kokošja Slepota (Кокоша слепота / Night Blindness): they lose dark contours and cannot see the stars at night.'
          : 'Trichromatic S/M/L Cones (with Red-in-the-middle relative contrast cheat) + Rhodopsin Rods for night contour & star vision.',
      },
    ];

    const rawLinks: DivergenceLink[] = [
      { source: 'origin-baseline', target: 'p1-inflation', kind: 'causal_chain', strength: 0.8 },
      { source: 'p1-inflation', target: 'p1-su3-sun', kind: 'causal_chain', strength: 0.9 },
      { source: 'p1-su3-sun', target: 'p2-planet', kind: 'causal_chain', strength: 0.9 },
      { source: 'p2-planet', target: 'p2-skywhales', kind: 'causal_chain', strength: 0.75 },
      { source: 'p2-planet', target: 'p2-ocular', kind: 'causal_chain', strength: 0.75 },
      { source: 'p2-skywhales', target: 'attractor-smac', kind: 'paradigm_pull', strength: 0.45 },
      { source: 'p2-ocular', target: 'attractor-bw2', kind: 'paradigm_pull', strength: 0.35 },
    ];

    let prevFeatureNodeId = 'p2-ocular';
    p3.implementedFeatures.forEach((feat, idx) => {
      const nodeId = `p3-feat-${feat.id}`;
      const isLoophole = feat.status === 'loophole_quirk' || feat.status === 'over_optimized';
      const paradigm: DivergenceNode['paradigm'] =
        isLoophole
          ? 'blackAndWhite'
          : feat.category === 'weather_ecology'
            ? 'alphaCentauri'
            : feat.category === 'subterranean' || feat.category === 'anthropology_tech'
              ? 'rimworld'
              : 'aoe2';

      rawNodes.push({
        id: nodeId,
        label: `${feat.createdBy === 'player1' ? 'P1' : feat.createdBy === 'player2' ? 'P2' : 'ENTROPY'}: ${feat.name}`,
        category: isLoophole ? 'loophole' : 'phase3_move',
        phase: 3,
        paradigm,
        weight: isLoophole ? 12.5 : 10.5,
        turnAdded: feat.turnCreated || idx + 1,
        description: `${feat.literalOutcome} (Missing Link: ${feat.missingEngineeringLink})`,
        loopholeQuote: feat.alphaCentauriQuote,
      });

      rawLinks.push({
        source: prevFeatureNodeId,
        target: nodeId,
        kind: 'causal_chain',
        strength: 0.8,
      });

      const attractorTarget =
        paradigm === 'alphaCentauri'
          ? 'attractor-smac'
          : paradigm === 'aoe2'
            ? 'attractor-aoe'
            : paradigm === 'rimworld'
              ? 'attractor-rimworld'
              : 'attractor-bw2';

      rawLinks.push({
        source: nodeId,
        target: attractorTarget,
        kind: 'paradigm_pull',
        strength: 0.4,
      });

      if (isLoophole) {
        rawLinks.push({
          source: nodeId,
          target: 'attractor-entropy',
          kind: 'entropy_shear',
          strength: 0.4,
        });
      }

      prevFeatureNodeId = nodeId;
    });

    if (p3.resources.treesRemainingOnIsland <= 35 || p3.climate.seaLevelY > 1.4) {
      const climateNodeId = 'p3-entropy-climate';
      rawNodes.push({
        id: climateNodeId,
        label:
          p3.resources.treesRemainingOnIsland <= 35
            ? `Easter Island Collapse (${p3.resources.treesRemainingOnIsland.toFixed(0)}% Trees)`
            : `Global Warming Deluge (Sea Y=${p3.climate.seaLevelY.toFixed(1)}m)`,
        category: 'loophole',
        phase: 3,
        paradigm: 'entropy',
        weight: 13,
        turnAdded: gameState.globalTurn,
        description: `Entropy's Ruthless Optimizer over-exploited colony rules: Fossil Fuel Burn is ${p3.climate.fossilFuelBurned}%, Polar Ice is ${p3.climate.polarIceRemaining.toFixed(
          0
        )}%, and Trees remaining are ${p3.resources.treesRemainingOnIsland.toFixed(0)}%.`,
        loopholeQuote: 'Entropy optimizes unchecked rules to extinction!',
      });
      rawLinks.push({
        source: prevFeatureNodeId,
        target: climateNodeId,
        kind: 'entropy_shear',
        strength: 0.85,
      });
      rawLinks.push({
        source: climateNodeId,
        target: 'attractor-entropy',
        kind: 'entropy_shear',
        strength: 0.75,
      });
    }

    const filteredNodes = rawNodes.filter(
      (n) => phaseFilter === 'all' || n.phase === 0 || n.phase === phaseFilter
    );
    const allowedIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = rawLinks.filter(
      (l) => allowedIds.has(l.source) && allowedIds.has(l.target)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [gameState, selectedPlanet, phaseFilter, normalizedMix]);

  useEffect(() => {
    const svgEl = svgRef.current;
    const containerEl = containerRef.current;
    if (!svgEl || !containerEl) return;

    const width = containerEl.clientWidth || (mode === 'modal' ? 960 : 540);
    const height = containerEl.clientHeight || (mode === 'modal' ? 580 : 210);

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    const glowFilter = defs.append('filter').attr('id', `d3-glow-${mode}`);
    glowFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const gRoot = svg.append('g').attr('class', 'constellation-root');

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 2.8])
      .on('zoom', (event) => {
        gRoot.attr('transform', event.transform);
      });
    svg.call(zoomBehavior);

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.42;

    const ringsGroup = gRoot.append('g').attr('class', 'astrolabe-rings');
    [0.32, 0.64, 0.95].forEach((ratio, i) => {
      ringsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', maxRadius * ratio)
        .attr('fill', 'none')
        .attr('stroke', i === 2 ? 'rgba(34, 197, 94, 0.24)' : 'rgba(56, 189, 248, 0.14)')
        .attr('stroke-dasharray', i === 1 ? '4 4' : '2 6')
        .attr('stroke-width', 1);
    });

    ringsGroup
      .append('line')
      .attr('x1', cx - maxRadius)
      .attr('y1', cy)
      .attr('x2', cx + maxRadius)
      .attr('y2', cy)
      .attr('stroke', 'rgba(148, 163, 184, 0.12)')
      .attr('stroke-width', 1);
    ringsGroup
      .append('line')
      .attr('x1', cx)
      .attr('y1', cy - maxRadius)
      .attr('x2', cx)
      .attr('y2', cy + maxRadius)
      .attr('stroke', 'rgba(148, 163, 184, 0.12)')
      .attr('stroke-width', 1);

    const simNodes: SimNode[] = nodes.map((n) => {
      const copy: SimNode = { ...n };
      if (n.id === 'origin-baseline') {
        copy.fx = cx;
        copy.fy = cy;
      } else if (n.id === 'attractor-smac') {
        copy.fx = cx - maxRadius * 0.88;
        copy.fy = cy - maxRadius * 0.72;
      } else if (n.id === 'attractor-aoe') {
        copy.fx = cx + maxRadius * 0.88;
        copy.fy = cy - maxRadius * 0.72;
      } else if (n.id === 'attractor-rimworld') {
        copy.fx = cx - maxRadius * 0.88;
        copy.fy = cy + maxRadius * 0.72;
      } else if (n.id === 'attractor-bw2') {
        copy.fx = cx + maxRadius * 0.88;
        copy.fy = cy + maxRadius * 0.72;
      } else if (n.id === 'attractor-entropy') {
        copy.fx = cx;
        copy.fy = cy + maxRadius * 0.94;
      }
      return copy;
    });

    const simLinks: SimLink[] = links.map((l) => ({
      source: l.source,
      target: l.target,
      kind: l.kind,
      strength: l.strength,
    }));

    const colorForParadigm = (p: DivergenceNode['paradigm'], cat: DivergenceNode['category']) => {
      if (cat === 'origin') return '#F5B841';
      if (cat === 'loophole') return '#FB7185';
      switch (p) {
        case 'alphaCentauri':
          return '#34D399';
        case 'aoe2':
          return '#38BDF8';
        case 'rimworld':
          return '#F59E0B';
        case 'blackAndWhite':
          return '#C084FC';
        case 'entropy':
          return '#F43F5E';
        default:
          return '#E2E8F0';
      }
    };

    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance((l) =>
            l.kind === 'causal_chain'
              ? mode === 'modal'
                ? 78
                : 46
              : mode === 'modal'
                ? 130
                : 75
          )
          .strength((l) => l.strength * 0.65)
      )
      .force('charge', d3.forceManyBody().strength(mode === 'modal' ? -210 : -95))
      .force(
        'collide',
        d3.forceCollide<SimNode>().radius((d) => d.weight + (mode === 'modal' ? 14 : 6))
      )
      .force('x', d3.forceX(cx).strength(0.06))
      .force('y', d3.forceY(cy).strength(0.06));

    const linkEls = gRoot
      .append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', (d) =>
        d.kind === 'entropy_shear'
          ? '#F43F5E'
          : d.kind === 'causal_chain'
            ? '#22C55E'
            : 'rgba(192, 132, 252, 0.45)'
      )
      .attr('stroke-width', (d) => (d.kind === 'causal_chain' ? 2.2 : 1.3))
      .attr('stroke-dasharray', (d) =>
        d.kind === 'paradigm_pull' ? '3 4' : d.kind === 'entropy_shear' ? '5 3' : 'none'
      )
      .attr('opacity', (d) => (d.kind === 'causal_chain' ? 0.88 : 0.55));

    const nodeGroups = gRoot
      .append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        setSelectedNode(d);
      })
      .call(
        d3
          .drag<SVGGElement, SimNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (d.category !== 'origin' && d.category !== 'attractor') {
              d.fx = null;
              d.fy = null;
            }
          })
      );

    nodeGroups
      .filter((d) => d.category === 'origin' || d.category === 'loophole' || d.category === 'attractor')
      .append('circle')
      .attr('r', (d) => (mode === 'modal' ? d.weight * 0.95 + 5 : d.weight * 0.65 + 4))
      .attr('fill', 'none')
      .attr('stroke', (d) => colorForParadigm(d.paradigm, d.category))
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', (d) => (d.category === 'loophole' ? '2 2' : '4 2'))
      .attr('opacity', 0.65);

    nodeGroups
      .append('circle')
      .attr('r', (d) => (mode === 'modal' ? d.weight * 0.85 : d.weight * 0.55))
      .attr('fill', (d) => colorForParadigm(d.paradigm, d.category))
      .attr('stroke', '#090D16')
      .attr('stroke-width', 2)
      .attr('filter', `url(#d3-glow-${mode})`);

    nodeGroups
      .append('text')
      .text((d) =>
        d.category === 'origin'
          ? '0'
          : d.category === 'attractor'
            ? '★'
            : d.category === 'loophole'
              ? '!'
              : `P${d.phase}`
      )
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#05070B')
      .attr('font-size', mode === 'modal' ? '9px' : '7px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '700');

    nodeGroups
      .append('text')
      .text((d) =>
        mode === 'compact' && d.label.length > 26 ? d.label.slice(0, 24) + '…' : d.label
      )
      .attr('x', 0)
      .attr('y', (d) => (mode === 'modal' ? d.weight * 0.85 + 13 : d.weight * 0.55 + 10))
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.category === 'loophole' ? '#FDA4AF' : '#E2E8F0'))
      .attr('font-size', mode === 'modal' ? '11px' : '9px')
      .attr('font-family', 'Space Grotesk, sans-serif')
      .attr('font-weight', (d) =>
        d.category === 'origin' || d.category === 'loophole' ? '700' : '500'
      )
      .style('paint-order', 'stroke')
      .attr('stroke', '#05070B')
      .attr('stroke-width', 3);

    simulation.on('tick', () => {
      linkEls
        .attr('x1', (d) => (d.source as SimNode).x ?? cx)
        .attr('y1', (d) => (d.source as SimNode).y ?? cy)
        .attr('x2', (d) => (d.target as SimNode).x ?? cx)
        .attr('y2', (d) => (d.target as SimNode).y ?? cy);

      nodeGroups.attr('transform', (d) => `translate(${d.x ?? cx},${d.y ?? cy})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, mode]);

  return (
    <div
      className={`flex flex-col bg-[#06090E] border border-[#1E3A2F] rounded-sm overflow-hidden ${
        mode === 'modal' ? 'w-full h-full' : 'w-full h-56'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#0A1310] border-b border-[#1E3A2F] text-xs">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold tracking-wider uppercase text-emerald-300 font-mono">
            SC1 Tactical D3 Causal Constellation
          </span>
          <span className="px-1.5 py-0.5 font-mono text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded-sm">
            Drift from 25/25/25/25: {normalizedMix.driftIndex.toFixed(1)}%
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 font-mono text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded-sm">
            Dominant: {normalizedMix.dominantAttractor}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 1, 2, 3] as const).map((ph) => (
            <button
              key={String(ph)}
              type="button"
              onClick={() => setPhaseFilter(ph)}
              className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm border transition-colors cursor-pointer ${
                phaseFilter === ph
                  ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/60'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700/70 hover:text-slate-200'
              }`}
            >
              {ph === 'all' ? 'All Phases' : `Phase ${ph}`}
            </button>
          ))}

          {mode === 'compact' && onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 rounded-sm hover:bg-cyan-500/30 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Expand Astrolabe</span>
            </button>
          )}

          {mode === 'modal' && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono uppercase bg-rose-500/20 text-rose-200 border border-rose-400/50 rounded-sm hover:bg-rose-500/30 cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Close Astrolabe</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 min-h-0">
        <div
          ref={containerRef}
          className="lg:col-span-3 relative w-full h-full min-h-[165px] bg-[#04070B]"
        >
          <svg ref={svgRef} className="w-full h-full block select-none" />
          <div className="absolute bottom-1.5 left-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 pointer-events-none">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#F5B841] inline-block" /> Origin (25/25/25/25)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block" /> Causal Link
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FB7185] inline-block" /> Loophole / Entropy
            </span>
          </div>
        </div>

        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-[#1E3A2F] bg-[#070D0B] p-2.5 flex flex-col justify-between overflow-y-auto text-xs">
          {selectedNode ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {selectedNode.phase === 0 ? 'Cosmic Anchor' : `Phase ${selectedNode.phase} Node`}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Turn #{selectedNode.turnAdded}
                </span>
              </div>
              <h4 className="font-semibold text-slate-100 text-xs leading-snug font-mono">
                {selectedNode.label}
              </h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedNode.description}
              </p>
              {selectedNode.loopholeQuote && (
                <div className="p-1.5 bg-rose-950/50 border border-rose-500/40 rounded-sm text-[10px] text-rose-200 font-mono">
                  {selectedNode.loopholeQuote}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold font-mono">
                <Compass className="w-3.5 h-3.5" />
                <span>Causal Drift Telemetry</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click any node in the D3 force constellation to inspect how your Phase I{' '}
                <span className="text-amber-300">M☉ Sun Mass</span>, Phase II{' '}
                <span className="text-emerald-300">Cones &amp; Rods</span>, and Phase III{' '}
                <span className="text-rose-300">“No Backsies” Moves</span> bent this world.
              </p>
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-[#1E3A2F] space-y-1 font-mono text-[10px]">
            <div className="flex justify-between text-emerald-300">
              <span>Xenobiology / Sky Whales</span>
              <span>{normalizedMix.smac}%</span>
            </div>
            <div className="flex justify-between text-sky-300">
              <span>StarCraft 1 Voxel RTS</span>
              <span>{normalizedMix.aoe}%</span>
            </div>
            <div className="flex justify-between text-amber-300">
              <span>Satisfractured Ant-Farm</span>
              <span>{normalizedMix.rim}%</span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span>Miracles &amp; Loopholes</span>
              <span>{normalizedMix.bw}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
