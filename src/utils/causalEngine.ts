import {
  CandidateCelestialBody,
  CausalSynergyItem,
  CelestialWorldType,
  CosmosGameState,
  EmergentPlanetArchetype,
  ImplementedColonyFeature,
  MainAlienSpecies,
  Phase1GenesisState,
  Phase2SolarAndChemistryState,
  TurnChronicleEntry,
} from '../types/cosmos';

export const CANDIDATE_WORLDS: CandidateCelestialBody[] = [
  {
    id: 'rocky',
    name: 'Aethel-Prime (Rocky Terrestrial)',
    subtitle: 'Dense Silicate-Iron Mantle · Tectonic Basins',
    orbitRadius: 9.5,
    orbitSpeed: 0.42,
    eccentricity: 0.04,
    angle: 0.8,
    baseSize: 1.35,
    baseColorHex: '#3B82F6',
    accentColorHex: '#10B981',
    hasRingOrMoon: true,
    defaultDensityG: 1.0,
    defaultAcidity: 22,
    defaultH2O: 55,
    description:
      'Balanced silicate crust with active volcanism. Prone to becoming a runaway Venusian greenhouse if sulfur/carbon bacteria are forgotten, or a Purple Carboniferous forest if wood forms before mushrooms.',
  },
  {
    id: 'martian',
    name: 'Khor-Vex (Martian Arid World)',
    subtitle: 'Iron-Oxide Canyons · Thin Cryo-Envelope',
    orbitRadius: 13.8,
    orbitSpeed: 0.28,
    eccentricity: 0.09,
    angle: 2.4,
    baseSize: 1.05,
    baseColorHex: '#EA580C',
    accentColorHex: '#F59E0B',
    hasRingOrMoon: false,
    defaultDensityG: 0.45,
    defaultAcidity: 35,
    defaultH2O: 18,
    description:
      'Low-gravity rusted plains and deep subterranean permafrost aquifers. Ideal for sprawling SimCity transit tubes or high-arcing artillery.',
  },
  {
    id: 'failed_star_moon',
    name: 'Tiamat-IV (Failed Star Moon System)',
    subtitle: 'Tidal-Locked Moon of a Sub-Stellar Brown Dwarf',
    orbitRadius: 19.2,
    orbitSpeed: 0.18,
    eccentricity: 0.03,
    angle: 4.1,
    baseSize: 1.75,
    baseColorHex: '#9333EA',
    accentColorHex: '#EC4899',
    hasRingOrMoon: true,
    defaultDensityG: 1.45,
    defaultAcidity: 48,
    defaultH2O: 40,
    description:
      'Basked in infrared glow and fierce magnetospheric lightning from its parent Failed Star. Easily tips into a Super-Dense High-G Crusher or Purple Retinal jungle.',
  },
  {
    id: 'comet',
    name: 'Halcyon-9 (Great Eccentric Comet)',
    subtitle: 'Elliptical Ice-Nucleus · Perihelion Steam Geysers',
    orbitRadius: 24.0,
    orbitSpeed: 0.34,
    eccentricity: 0.42,
    angle: 5.5,
    baseSize: 0.9,
    baseColorHex: '#38BDF8',
    accentColorHex: '#E0F2FE',
    hasRingOrMoon: false,
    defaultDensityG: 0.35,
    defaultAcidity: 15,
    defaultH2O: 85,
    description:
      'Swings from deep freeze to scorching solar approach. Rich in H2O and organic volatiles that readily ferment into vast Alcohol Oceans.',
  },
];

export interface PromptInspirationPreset {
  label: string;
  p1Active: string;
  p1Passive: string;
  p2Active: string;
  p2Passive: string;
  badge: string;
}

export const PHASE_PRESETS: Record<1 | 2 | 3, PromptInspirationPreset[]> = {
  1: [
    {
      label: 'Standard Big Bang + Molecular Cloud Ignition',
      badge: 'Cooperative Genesis',
      p1Active: 'Ignite primordial hydrogen-carbon molecular cloud into a golden protostar',
      p1Passive: 'Time flows strictly forward with thermodynamic irreversibility',
      p2Active: 'Seed heavy iron and silicate supernova dust spirals around the core',
      p2Passive: 'Balanced gravity and electromagnetic plasma filaments binding matter',
    },
    {
      label: 'High-Gravity Heavy Metal Forge',
      badge: 'Dense Universe',
      p1Active: 'Compress ultra-dense neutron-star debris into the proto-solar core',
      p1Passive: 'Amplified gravitational attraction pulling heavy ores inward',
      p2Active: 'Unleash high-voltage cosmic lightning across the molecular nebula',
      p2Passive: 'Reversible time-symmetry echoes preserving ancient energy states',
    },
  ],
  2: [
    {
      label: 'The Purple Earth & The Great Fire (No Mushrooms!)',
      badge: 'Carboniferous Inferno',
      p1Active: 'Create purple retinal flora and towering woody lignin trees across the continents',
      p1Passive: 'High oxygen and dense carbon polymer bonding rules with DNA heredity',
      p2Active: 'Unleash dry volcanic lightning storms over the ancient purple forests',
      p2Passive: 'Zero wood-eating bacteria or mushrooms exist to decompose fallen trees',
    },
    {
      label: 'Oops, We Forgot Bacteria! (Accidental Venus World)',
      badge: 'Runaway Acid Greenhouse',
      p1Active: 'Erupt sulfuric acid geysers and dense CO2 volcanic plumes into the sky',
      p1Passive: 'Extreme atmospheric acidity and thermal heat trapping without carbon-fixing bacteria',
      p2Active: 'Condense boiling sulfuric clouds and metallic frost across the highlands',
      p2Passive: 'RNA-only extremophile soup with zero sulfur-reducing microbes',
    },
    {
      label: 'Oh, We Are Too Dense! (2.4G High-Gravity Crusher)',
      badge: 'Super-Dense Planet',
      p1Active: 'Accrete massive iron-osmium core layers and compress the planetary mantle',
      p1Passive: 'Crushing 2.4G surface gravity flattening mountains into dense basalt plateaus',
      p2Active: 'Seed white-rot wood-eating mushrooms, H2O aquifers, and stable DNA life',
      p2Passive: 'Subterranean piezoelectric crystal veins sheltering life underground',
    },
    {
      label: 'Fermented Alcohol Ocean World',
      badge: 'Ethanol Seas',
      p1Active: 'Flood the basins with H2O, complex carbon sugars, and wild anaerobic yeast',
      p1Passive: 'Global fermentation converting oceans into volatile 40-proof alcohol seas',
      p2Active: 'Create bioluminescent fungal reefs and DNA-stabilized amphibious life',
      p2Passive: 'Warm intoxicating ethanol vapor mist blanketing the lowlands',
    },
  ],
  3: [
    {
      label: 'Age of Empires Siege: 100 Orcs + Wind vs. Archers + Rain',
      badge: 'RTS Battle Emergence',
      p1Active: '100 armored Orc raiders charging directly in front of the citadel gates',
      p1Passive: 'Fierce crosswind blowing across the battlefield deflecting projectiles',
      p2Active: 'Elite Elven archers stationed atop the stone ramparts firing volleys',
      p2Passive: 'Torrential rain soaking the dirt battlefield into deep sticky mud',
    },
    {
      label: 'Builder vs. Saboteur: Wood Farming vs. Severe Drought',
      badge: 'Resource Sabotage',
      p1Active: 'Establish automated alien wood farming plantations and timber sawmills',
      p1Passive: 'Organized Age of Empires villager harvesting routes and storage barns',
      p2Active: 'Summon scorching localized drought and bark-boring beetles over the groves',
      p2Passive: 'Dry desiccating winds parching the soil and halting sap flow',
    },
    {
      label: 'Co-Op Wood Farming + Monsoon Rain Boom',
      badge: 'Cooperative Economy',
      p1Active: 'Plant sprawling terraced wood farms and myco-lumber mills across the valley',
      p1Passive: 'Rich composted soil and selective DNA timber breeding',
      p2Active: 'Build stone irrigation aqueducts feeding the forestry terraces',
      p2Passive: 'Gentle warm monsoon rain nourishing rapid canopy growth',
    },
    {
      label: 'SimCity Metropolis: Highway Traffic Grid vs. Rush-Hour Mudslide',
      badge: 'SimCity Divergence',
      p1Active: 'Construct a SimCity multi-lane paved transit road network and commuter pods',
      p1Passive: 'Synchronized electromagnetic traffic signals and high-speed logistics zoning',
      p2Active: 'Trigger a mischievous flash mudslide and toll-booth blockade at the central interchange',
      p2Passive: 'Foggy rush-hour congestion slowing commuter throughput',
    },
  ],
};

export function evaluatePlanetArchetype(
  p2: Phase2SolarAndChemistryState
): { archetype: EmergentPlanetArchetype; alerts: string[] } {
  const alerts: string[] = [];

  if (p2.densityG >= 1.75) {
    alerts.push(
      `OH, WE ARE TOO DENSE (${p2.densityG.toFixed(2)}G): Crushing surface gravity flattens terrain, grounds flyers, and shortens arrow arcs by 45%!`
    );
  }

  if (
    (p2.molecules.acidity >= 62 || p2.molecules.co2Sulfur >= 65) &&
    !p2.microbes.carbonSulfurBacteria
  ) {
    alerts.push(
      'OOPS, FORGOT BACTERIA -> VENUSIAN GREENHOUSE: Unchecked CO2 & sulfuric acid locked in a boiling acid atmosphere!'
    );
  }

  if (
    p2.molecules.carbonComplexity === 'woody_lignin' &&
    !p2.microbes.woodDecomposerFungi &&
    p2.deadWoodStrata >= 45
  ) {
    alerts.push(
      'NO WOOD-EATING BACTERIA OR MUSHROOMS: Dead woody lignin piled into explosive carbon seams -> THE GREAT FIRE!'
    );
  }

  if (p2.molecules.alcohol >= 45) {
    alerts.push(
      `VOLATILE ALCOHOL SEAS (${Math.round(p2.molecules.alcohol)}% Ethanol): Flammable vapors & hyper-metabolic colony behavior!`
    );
  }

  if (p2.genetics.rnaPresent && !p2.genetics.dnaPresent) {
    alerts.push(
      'RNA-ONLY WORLD (Forgot DNA): High genetic mutation rate causes rapid, unpredictable alien morphing!'
    );
  }

  let archetype: EmergentPlanetArchetype = 'primordial_cradle';
  if (p2.greatFireActive || (p2.molecules.carbonComplexity === 'woody_lignin' && !p2.microbes.woodDecomposerFungi && p2.deadWoodStrata >= 50)) {
    archetype = 'great_fire_inferno';
  } else if ((p2.molecules.acidity >= 62 || p2.molecules.co2Sulfur >= 65) && !p2.microbes.carbonSulfurBacteria) {
    archetype = 'venusian_greenhouse';
  } else if (p2.densityG >= 1.75) {
    archetype = 'super_dense_crusher';
  } else if (p2.molecules.alcohol >= 45) {
    archetype = 'alcohol_ferment_sea';
  } else if (p2.microbes.retinalPurpleMicrobes && !p2.microbes.woodDecomposerFungi) {
    archetype = 'purple_retinal_world';
  } else if (p2.microbes.woodDecomposerFungi || p2.genetics.dnaPresent) {
    archetype = 'temperate_fungal_garden';
  }

  return { archetype, alerts };
}

export function synthesizeMainAlien(
  p1: Phase1GenesisState,
  p2: Phase2SolarAndChemistryState
): MainAlienSpecies {
  const { archetype } = evaluatePlanetArchetype(p2);
  const traits: string[] = [];

  if (p2.densityG >= 1.65) {
    traits.push(`High-G Hexapod Frame (${p2.densityG.toFixed(1)}G Adapted)`);
  } else if (p2.densityG <= 0.6) {
    traits.push('Low-G Gliding Tendrils');
  } else {
    traits.push('Balanced Bipedal/Mycelial Posture');
  }

  if (p2.molecules.acidity >= 55) {
    traits.push('Sulfuric-Resistant Silicate Carapace');
  }
  if (p2.molecules.alcohol >= 35) {
    traits.push('Ethanol-Combustion Metabolism');
  }
  if (p2.microbes.woodDecomposerFungi) {
    traits.push('Symbiotic White-Rot Mycelium');
  }
  if (p2.genetics.dnaPresent) {
    traits.push('Double-Helix DNA Caste Memory');
  } else if (p2.genetics.rnaPresent) {
    traits.push('Hyper-Mutating RNA Polymorphism');
  }
  if (p1.electricityStrength >= 1.4) {
    traits.push('Bio-Electric Nervous Arcs');
  }

  if (archetype === 'venusian_greenhouse') {
    return {
      name: 'Venerian Chitin-Delvers',
      morphology: 'Armor-plated subterranean hexapods with acid-filtering spiracles',
      diet: 'Sulfur-crust chemosynthesis & underground fungal tubers',
      preferredStrata: 'subterranean',
      primaryColorHex: '#EAB308',
      secondaryColorHex: '#78350F',
      speedMultiplier: 0.85,
      armorRating: 1.6,
      traits,
      loreSummary:
        'Because carbon/sulfur bacteria were forgotten in Phase II, these resilient aliens evolved beneath a boiling Venusian acid sky, excelling at deep ant-farm bunker construction.',
    };
  }

  if (archetype === 'super_dense_crusher') {
    return {
      name: 'Baryon Tortoise-Kin',
      morphology: 'Squat, ultra-dense eight-legged litho-crawlers with hydraulic limbs',
      diet: 'Compressed carbon seams & heavy-metal lichens',
      preferredStrata: 'subterranean',
      primaryColorHex: '#38BDF8',
      secondaryColorHex: '#1E293B',
      speedMultiplier: 0.72,
      armorRating: 1.9,
      traits,
      loreSummary:
        'Forged on a planet that grew "too dense", they cannot jump or fly, and arrows drop swiftly—making them masters of heavy siege engineering and subterranean highways.',
    };
  }

  if (archetype === 'great_fire_inferno' || archetype === 'purple_retinal_world') {
    return {
      name: 'Pyro-Retinal Myconids',
      morphology: 'Violet-plumed symbionts born amidst burning Carboniferous lignin forests',
      diet: 'Charred wood-ash, retinal sap & roasted spores',
      preferredStrata: 'surface',
      primaryColorHex: '#A855F7',
      secondaryColorHex: '#EF4444',
      speedMultiplier: 1.15,
      armorRating: 1.1,
      traits,
      loreSummary:
        'Evolved under purple skies where un-rotted wood fueled the Great Fire; they thrive in timber harvesting, ash-fertilized farming, and ranged warfare.',
    };
  }

  if (archetype === 'alcohol_ferment_sea') {
    return {
      name: 'Zymurgic Skitter-Guild',
      morphology: 'Amphibious ethanol-fueled crustaceans with pressurized distiller shells',
      diet: 'Fermented nectar, kelp sugars & hydro-carbons',
      preferredStrata: 'amphibious',
      primaryColorHex: '#2DD4BF',
      secondaryColorHex: '#F59E0B',
      speedMultiplier: 1.35,
      armorRating: 0.95,
      traits,
      loreSummary:
        'Born from fermented alcohol seas, their hyper-metabolic colonies build rapid SimCity-like canal/road traffic networks and volatile alchemical engines.',
    };
  }

  return {
    name: 'Aethelian Spore-Architects',
    morphology: 'Bioluminescent insectoid-fungal builders with crystalline antennae',
    diet: 'Decomposed humus, timber sap & hydro-minerals',
    preferredStrata: 'surface',
    primaryColorHex: '#10B981',
    secondaryColorHex: '#06B6D4',
    speedMultiplier: 1.05,
    armorRating: 1.2,
    traits,
    loreSummary:
      'A balanced DNA-stabilized alien civilization equally adept at SimCity urban logistics, Age of Empires forestry and castle sieges, and Dwarf Fortress underground mining.',
  };
}

export function createInitialCosmosState(): CosmosGameState {
  const phase1: Phase1GenesisState = {
    turnCount: 0,
    timeArrow: 'forward',
    gravityStrength: 1.0,
    electricityStrength: 1.0,
    molecularCloudDensity: 45,
    bigBangEnergy: 80,
    sunIgnited: false,
    starSpectralClass: 'Proto-Nebula Core',
    starColorHex: '#F59E0B',
    synthesizedElements: {
      hydrogen: 75,
      carbon: 25,
      oxygen: 20,
      sulfur: 15,
      iron: 20,
      silicates: 25,
    },
  };

  const phase2: Phase2SolarAndChemistryState = {
    turnCount: 0,
    selectedWorldType: 'rocky',
    worldLockedInStone: false,
    densityG: 1.0,
    molecules: {
      h2o: 50,
      alcohol: 5,
      acidity: 25,
      co2Sulfur: 30,
      oxygen: 22,
      carbonComplexity: 'organic_chains',
    },
    genetics: {
      rnaPresent: true,
      dnaPresent: false,
      mutationRate: 45,
    },
    microbes: {
      carbonSulfurBacteria: false,
      retinalPurpleMicrobes: true,
      woodDecomposerFungi: false,
    },
    deadWoodStrata: 30,
    greatFireActive: false,
    emergentArchetype: 'purple_retinal_world',
    diagnosticAlerts: [
      'Early Retinal Flora gives the world a vivid purple hue.',
      'Warning: Neither carbon-fixing bacteria nor wood-eating mushrooms have been prompted yet!',
    ],
  };

  const mainAlien = synthesizeMainAlien(phase1, phase2);

  return {
    phase: 1,
    globalTurn: 1,
    entropyIndex: 18,
    lastEntropyCounterLaw:
      'Primordial Vacuum Dilation — Entropy seeks to disperse the molecular cloud before stellar ignition.',
    phase1,
    phase2,
    candidateWorlds: CANDIDATE_WORLDS,
    mainAlien,
    phase3: {
      turnCount: 0,
      eraTitle: 'Dawn of the Ant-Farm Colony',
      divergenceScores: {
        simCityCivic: 25,
        aoeEmpireWar: 25,
        dwarfSubterranean: 30,
        ecologicalChaos: 20,
      },
      resources: {
        timber: 120,
        stoneOre: 100,
        biomass: 140,
        trafficFlow: 65,
        colonyPopulation: 48,
      },
      weather: {
        windSpeed: 18,
        windDirectionDeg: 45,
        precipitation: 'none',
        mudCoverage: 10,
        arrowScatterPenalty: 12,
        orcSpeedPenalty: 8,
      },
      implementedFeatures: [
        {
          id: 'feat-genesis-nexus',
          name: 'Central Alien Ant-Farm Nexus',
          category: 'subterranean',
          createdBy: 'player1',
          activePrompt: 'Founding subterranean brood-chamber and surface gatehouse',
          passiveLaw: 'Autonomous foraging and tunneling instincts',
          status: 'thriving',
          efficiency: 100,
          synergyNotes: ['Core colony hub anchored to the locked planetary strata'],
          voxelEffect: 'underground_warren',
          turnCreated: 0,
        },
      ],
      agents: [
        {
          id: 'ag-1',
          faction: 'colony',
          role: 'alien_colonist',
          label: 'Brood Forager Alpha',
          x: 11,
          y: 5,
          z: 11,
          vx: 0.4,
          vz: 0.2,
          hp: 100,
          maxHp: 100,
          speed: 1.0,
          accuracy: 0.8,
          state: 'working',
        },
        {
          id: 'ag-2',
          faction: 'colony',
          role: 'tunnel_digger',
          label: 'Deep-Strata Delver',
          x: 10,
          y: 2,
          z: 12,
          vx: -0.3,
          vz: 0.3,
          hp: 120,
          maxHp: 120,
          speed: 0.85,
          accuracy: 0.75,
          state: 'burrowing',
        },
        {
          id: 'ag-3',
          faction: 'colony',
          role: 'lumberjack',
          label: 'Spore-Timber Harvester',
          x: 14,
          y: 5,
          z: 9,
          vx: 0.25,
          vz: -0.35,
          hp: 95,
          maxHp: 95,
          speed: 1.05,
          accuracy: 0.8,
          state: 'working',
        },
      ],
      cutawaySliceZ: 24,
      cutawaySliceY: 10,
    },
    chronicles: [
      {
        id: 'chron-0',
        turnNumber: 0,
        phase: 1,
        p1Active: 'Primordial Singularity',
        p1Passive: 'Symmetry Scaffolding',
        p2Active: 'Quantum Fluctuations',
        p2Passive: 'Vacuum Potential',
        entropyLaw: 'The Great Silence awaits thermodynamic decay.',
        headline: 'Before the Pie, First Prompt the Universe',
        narrative:
          'Phase I begins in the aftermath of the Big Bang. Work together to define time direction, gravity, electricity, and molecular clouds so a Sun and Solar System can emerge.',
        synergies: [
          {
            source: 'Player 1 & Player 2',
            target: 'Molecular Cloud Scaffolding',
            outcome: 'Combine Active & Passive physics declarations to ignite the Sun.',
            impactType: 'synergy',
          },
        ],
        timestamp: '00:00',
      },
    ],
  };
}

/**
 * Deterministic + AI-assisted turn compiler so every prompt keyword ("orc", "archer",
 * "rain", "wind", "drought", "wood", "traffic", "simcity", "acid", "bacteria",
 * "mushroom", "dense", "dna", "rna", "alcohol", "h2o") immediately triggers
 * accurate mechanical changes on top of any server-side Gemini response.
 */
export function applyDeterministicAndAiWeave(
  state: CosmosGameState,
  p1Active: string,
  p1Passive: string,
  p2Active: string,
  p2Passive: string,
  aiData?: Record<string, unknown> | null
): CosmosGameState {
  const combined = `${p1Active} ${p1Passive} ${p2Active} ${p2Passive}`.toLowerCase();
  const next: CosmosGameState = JSON.parse(JSON.stringify(state));
  next.globalTurn += 1;

  const synergies: CausalSynergyItem[] = [];
  let headline = '';
  let narrative = '';
  let entropyCounterLaw = '';

  if (next.phase === 1) {
    next.phase1.turnCount += 1;
    // Time direction
    if (combined.includes('revers') || combined.includes('echo') || combined.includes('symmetr')) {
      next.phase1.timeArrow = 'reversible_echo';
      synergies.push({
        source: 'Time Symmetry Prompt',
        target: 'Cosmic Arrow of Time',
        outcome: 'Time flows with reversible quantum echoes, reducing Entropy decay by 35%.',
        impactType: 'synergy',
      });
    } else if (combined.includes('dilat') || combined.includes('slow')) {
      next.phase1.timeArrow = 'dilated';
    } else {
      next.phase1.timeArrow = 'forward';
    }

    // Gravity & Electricity
    if (combined.includes('heavy') || combined.includes('dense') || combined.includes('compress') || combined.includes('gravity')) {
      next.phase1.gravityStrength = Math.min(2.6, +(next.phase1.gravityStrength + 0.35).toFixed(2));
    }
    if (combined.includes('electric') || combined.includes('lightning') || combined.includes('plasma') || combined.includes('magnet')) {
      next.phase1.electricityStrength = Math.min(2.5, +(next.phase1.electricityStrength + 0.4).toFixed(2));
    }

    // Elements
    next.phase1.molecularCloudDensity = Math.min(100, next.phase1.molecularCloudDensity + 35);
    next.phase1.synthesizedElements.carbon = Math.min(100, next.phase1.synthesizedElements.carbon + 28);
    next.phase1.synthesizedElements.oxygen = Math.min(100, next.phase1.synthesizedElements.oxygen + 25);
    next.phase1.synthesizedElements.iron = Math.min(100, next.phase1.synthesizedElements.iron + 22);
    next.phase1.synthesizedElements.silicates = Math.min(100, next.phase1.synthesizedElements.silicates + 25);
    next.phase1.synthesizedElements.sulfur = Math.min(100, next.phase1.synthesizedElements.sulfur + 20);

    // Ignite Sun!
    next.phase1.sunIgnited = true;
    next.phase1.starSpectralClass =
      next.phase1.electricityStrength > 1.35
        ? 'Class-F Blue-Gold Magnetar Sun'
        : next.phase1.gravityStrength > 1.35
          ? 'Class-K Dense Amber Giant'
          : 'Class-G Luminous Sol';
    next.phase1.starColorHex =
      next.phase1.electricityStrength > 1.35 ? '#38BDF8' : '#F59E0B';

    synergies.push({
      source: `P1 (${p1Active.slice(0, 28)}) + P2 (${p2Active.slice(0, 28)})`,
      target: 'Stellar Nucleosynthesis',
      outcome: `Ignited ${next.phase1.starSpectralClass}! Outflowing Carbon, Oxygen, Iron & Silicates into the Phase II Solar System.`,
      impactType: 'synergy',
    });

    entropyCounterLaw =
      (aiData?.entropyCounterLaw as string) ||
      'Entropy injects Cosmic Redshift Cooling, trying to thin the proto-planetary disk.';
    headline =
      (aiData?.headline as string) ||
      `Stellar Ignition Achieved: ${next.phase1.starSpectralClass} Born!`;
    narrative =
      (aiData?.narrative as string) ||
      `Working together across the primordial molecular cloud, both players established a ${next.phase1.timeArrow} arrow of time (${next.phase1.gravityStrength}x Gravity, ${next.phase1.electricityStrength}x Electricity). The Sun has ignited and heavy elements now outflow into the Phase II Solar System!`;
    next.entropyIndex = Math.max(8, Math.min(95, next.entropyIndex + 4));
  } else if (next.phase === 2) {
    next.phase2.turnCount += 1;

    // Density / "Too Dense"
    if (
      combined.includes('dense') ||
      combined.includes('heavy') ||
      combined.includes('iron') ||
      combined.includes('osmium') ||
      combined.includes('2.4g') ||
      combined.includes('crush')
    ) {
      next.phase2.densityG = Math.min(2.8, +(next.phase2.densityG + 0.85).toFixed(2));
      synergies.push({
        source: 'Heavy Core Accretion',
        target: 'Planetary Density',
        outcome: `"Oh, we are too dense!" Surface gravity surged to ${next.phase2.densityG.toFixed(2)}G—flattening terrain and grounding future aerial units.`,
        impactType: 'planetary_constraint',
      });
    }

    // Acidity / Sulfur / Venus
    if (
      combined.includes('acid') ||
      combined.includes('sulfur') ||
      combined.includes('venus') ||
      combined.includes('co2') ||
      combined.includes('volcan')
    ) {
      next.phase2.molecules.acidity = Math.min(100, next.phase2.molecules.acidity + 38);
      next.phase2.molecules.co2Sulfur = Math.min(100, next.phase2.molecules.co2Sulfur + 40);
    }

    // H2O
    if (combined.includes('h2o') || combined.includes('water') || combined.includes('ocean') || combined.includes('aquifer') || combined.includes('rain')) {
      next.phase2.molecules.h2o = Math.min(100, next.phase2.molecules.h2o + 28);
    }

    // Alcohol
    if (combined.includes('alcohol') || combined.includes('ethanol') || combined.includes('ferment') || combined.includes('yeast') || combined.includes('wine')) {
      next.phase2.molecules.alcohol = Math.min(100, next.phase2.molecules.alcohol + 50);
      synergies.push({
        source: 'Anaerobic Sugar Fermentation',
        target: 'Planetary Hydrosphere',
        outcome: 'Oceans fermented into volatile Alcohol Seas with flammable vapors!',
        impactType: 'synergy',
      });
    }

    // DNA / RNA
    if (combined.includes('dna') || combined.includes('double-helix') || combined.includes('heredit')) {
      next.phase2.genetics.dnaPresent = true;
      next.phase2.genetics.mutationRate = 15;
    }
    if (combined.includes('rna')) {
      next.phase2.genetics.rnaPresent = true;
      if (!combined.includes('dna') && !next.phase2.genetics.dnaPresent) {
        next.phase2.genetics.mutationRate = 82;
      }
    }

    // Bacteria & Mushrooms (or explicitly forgetting them!)
    const explicitlyNoDecomposers =
      combined.includes('zero wood-eating') ||
      combined.includes('no wood-eating') ||
      combined.includes('no mushroom') ||
      combined.includes('forgot bacteria') ||
      combined.includes('without carbon-fixing') ||
      combined.includes('zero sulfur');

    if (!explicitlyNoDecomposers) {
      if (combined.includes('bacteria') || combined.includes('microbe') || combined.includes('cyanobacteria')) {
        next.phase2.microbes.carbonSulfurBacteria = true;
        next.phase2.molecules.acidity = Math.max(10, next.phase2.molecules.acidity - 22);
      }
      if (combined.includes('mushroom') || combined.includes('fungi') || combined.includes('white-rot') || combined.includes('decompos')) {
        next.phase2.microbes.woodDecomposerFungi = true;
        next.phase2.deadWoodStrata = Math.max(5, next.phase2.deadWoodStrata - 35);
      }
    } else {
      if (combined.includes('zero wood-eating') || combined.includes('no mushroom')) {
        next.phase2.microbes.woodDecomposerFungi = false;
      }
      if (combined.includes('without carbon-fixing') || combined.includes('zero sulfur')) {
        next.phase2.microbes.carbonSulfurBacteria = false;
      }
    }

    // Purple flora & woody lignin -> The Great Fire
    if (combined.includes('purple') || combined.includes('retinal') || combined.includes('wood') || combined.includes('lignin') || combined.includes('tree')) {
      next.phase2.microbes.retinalPurpleMicrobes = true;
      next.phase2.molecules.carbonComplexity = 'woody_lignin';
      next.phase2.molecules.oxygen = Math.min(100, next.phase2.molecules.oxygen + 25);
      if (!next.phase2.microbes.woodDecomposerFungi) {
        next.phase2.deadWoodStrata = Math.min(100, next.phase2.deadWoodStrata + 45);
      }
    }

    // Check Great Fire trigger
    if (
      next.phase2.molecules.carbonComplexity === 'woody_lignin' &&
      !next.phase2.microbes.woodDecomposerFungi &&
      next.phase2.deadWoodStrata >= 50
    ) {
      next.phase2.greatFireActive = true;
      synergies.push({
        source: 'Woody Lignin + Zero Wood-Eating Mushrooms',
        target: 'Global Carbon Strata',
        outcome: 'THE GREAT FIRE IGNITES! Centuries of un-rotted purple timber erupt into a planetary conflagration!',
        impactType: 'sabotage',
      });
    } else if (next.phase2.microbes.woodDecomposerFungi) {
      next.phase2.greatFireActive = false;
      synergies.push({
        source: 'Wood-Eating Mushrooms & Bacteria',
        target: 'Dead Lignin Timber',
        outcome: 'Fungi digest the dead wood into rich humus soil, averting The Great Fire!',
        impactType: 'synergy',
      });
    }

    const evalResult = evaluatePlanetArchetype(next.phase2);
    next.phase2.emergentArchetype = evalResult.archetype;
    next.phase2.diagnosticAlerts = evalResult.alerts;

    if (evalResult.archetype === 'venusian_greenhouse') {
      synergies.push({
        source: 'High Acidity/CO2 + Forgotten Bacteria',
        target: 'Planetary Atmosphere',
        outcome: 'Runaway Venusian Greenhouse locked in! Surface colonies will need acid-shielding or underground burrows.',
        impactType: 'planetary_constraint',
      });
    }

    next.mainAlien = synthesizeMainAlien(next.phase1, next.phase2);

    entropyCounterLaw =
      (aiData?.entropyCounterLaw as string) ||
      'Entropy condenses Inert Silicate Crust to lock free carbon away from nascent life.';
    headline =
      (aiData?.headline as string) ||
      `Planetary Alchemy: ${next.mainAlien.name} Emerge (${next.phase2.emergentArchetype.replace(/_/g, ' ').toUpperCase()})`;
    narrative =
      (aiData?.narrative as string) ||
      `Across the selected world, molecular rules collided: Gravity sits at ${next.phase2.densityG.toFixed(2)}G, Acidity at ${next.phase2.molecules.acidity}%, H2O at ${next.phase2.molecules.h2o}%, and Alcohol at ${next.phase2.molecules.alcohol}%. ${next.mainAlien.loreSummary}`;
    next.entropyIndex = Math.max(10, Math.min(95, next.entropyIndex + 5));
  } else {
    // PHASE 3: Ant-Farm Colony & Divergent Feature Sandbox (Universe & Planet Set in Stone!)
    next.phase3.turnCount += 1;

    const hasOrcs = combined.includes('orc') || combined.includes('raider') || combined.includes('horde') || combined.includes('infantry') || combined.includes('100 ');
    const hasArchers = combined.includes('archer') || combined.includes('legolas') || combined.includes('bow') || combined.includes('volley') || combined.includes('rampart');
    const hasWind = combined.includes('wind') || combined.includes('gale') || combined.includes('gust') || combined.includes('storm');
    const hasRain = combined.includes('rain') || combined.includes('monsoon') || combined.includes('downpour') || combined.includes('mud');
    const hasDrought = combined.includes('drought') || combined.includes('draught') || combined.includes('parch') || combined.includes('arid') || combined.includes('beetle');
    const hasWoodFarm = combined.includes('wood') || combined.includes('farm') || combined.includes('lumber') || combined.includes('timber') || combined.includes('forest');
    const hasTrafficSimCity = combined.includes('traffic') || combined.includes('road') || combined.includes('simcity') || combined.includes('sim city') || combined.includes('highway') || combined.includes('transit') || combined.includes('commut');
    const hasMudslideSabotage = combined.includes('mudslide') || combined.includes('toll') || combined.includes('blockade') || combined.includes('gridlock') || combined.includes('jam');
    const hasTunnel = combined.includes('tunnel') || combined.includes('underground') || combined.includes('burrow') || combined.includes('bunker') || combined.includes('mine');

    // Weather updates
    if (hasWind) {
      next.phase3.weather.windSpeed = 78;
      next.phase3.weather.arrowScatterPenalty = 62;
    }
    if (hasRain) {
      next.phase3.weather.precipitation =
        next.phase2.molecules.acidity >= 60 ? 'acid_rain' : 'rain';
      next.phase3.weather.mudCoverage = 75;
      next.phase3.weather.orcSpeedPenalty = 45;
    } else if (hasDrought) {
      next.phase3.weather.precipitation = 'drought';
      next.phase3.weather.mudCoverage = 0;
      next.phase3.weather.orcSpeedPenalty = 0;
    }

    // Planetary Set-in-Stone constraint checks!
    if (next.phase2.densityG >= 1.65) {
      next.phase3.weather.arrowScatterPenalty = Math.min(
        90,
        next.phase3.weather.arrowScatterPenalty + 25
      );
      synergies.push({
        source: `Set-in-Stone High Density (${next.phase2.densityG.toFixed(2)}G)`,
        target: 'Ballistics & Surface Stamina',
        outcome: `Locked High-G planet drags projectiles downward (+25% miss rate) and slows heavy surface marches!`,
        impactType: 'planetary_constraint',
      });
    }

    if (next.phase2.emergentArchetype === 'venusian_greenhouse') {
      synergies.push({
        source: 'Set-in-Stone Venusian Acid Atmosphere',
        target: 'Exposed Surface Units',
        outcome: 'Unshielded surface structures & troops suffer sulfuric corrosion unless sheltered in underground tunnels!',
        impactType: 'planetary_constraint',
      });
    }

    // 1. Classic Orcs + Wind vs. Archers + Rain -> Mud & Arrow Deflection
    if (hasOrcs || hasArchers) {
      next.phase3.divergenceScores.aoeEmpireWar += 30;
      next.phase3.eraTitle = 'Age of Empires: The Siege of the Ant-Farm Gates';

      if (hasOrcs) {
        next.phase3.implementedFeatures.unshift({
          id: `feat-orcs-${next.globalTurn}`,
          name: '100 Orc Vanguard at the Gates',
          category: 'military_siege',
          createdBy: 'player1',
          activePrompt: p1Active,
          passiveLaw: p1Passive,
          status: hasRain ? 'stressed' : 'thriving',
          efficiency: hasRain ? 55 : 115,
          synergyNotes: hasRain
            ? ['Rain turned the gate approach into deep Mud -> Orc charge speed reduced by 45%!']
            : ['Charging full speed toward the colony gates!'],
          voxelEffect: 'orc_siege',
          turnCreated: next.globalTurn,
        });

        for (let i = 0; i < 6; i++) {
          next.phase3.agents.push({
            id: `orc-${next.globalTurn}-${i}`,
            faction: 'player1',
            role: 'orc_raider',
            label: `Orc Vanguard #${i + 1}`,
            x: 3 + (i % 3) * 2,
            y: 5,
            z: 8 + Math.floor(i / 3) * 3,
            vx: hasRain ? 0.18 : 0.42,
            vz: 0.1,
            hp: 110,
            maxHp: 110,
            speed: hasRain ? 0.55 : 1.1,
            accuracy: 0.75,
            state: 'attacking',
            statusEffect: hasRain ? 'Bogged in Mud (-45% Speed)' : 'Charging Gates',
          });
        }
      }

      if (hasArchers) {
        next.phase3.implementedFeatures.unshift({
          id: `feat-archers-${next.globalTurn}`,
          name: 'Rampart Elven Archer Garrison',
          category: 'military_siege',
          createdBy: 'player2',
          activePrompt: p2Active,
          passiveLaw: p2Passive,
          status: hasWind ? 'stressed' : 'thriving',
          efficiency: hasWind ? 42 : 120,
          synergyNotes: hasWind
            ? ['Gale-force Crosswind deflects arrows -> Legolas-style volleys scatter with -62% hit rate!']
            : ['Raining precision volleys from the citadel walls!'],
          voxelEffect: 'archer_garrison',
          turnCreated: next.globalTurn,
        });

        for (let i = 0; i < 4; i++) {
          next.phase3.agents.push({
            id: `archer-${next.globalTurn}-${i}`,
            faction: 'player2',
            role: 'elven_archer',
            label: `Rampart Archer #${i + 1}`,
            x: 16,
            y: 7,
            z: 7 + i * 2,
            vx: 0,
            vz: 0,
            hp: 85,
            maxHp: 85,
            speed: 0.9,
            accuracy: hasWind ? 0.32 : 0.88,
            state: 'attacking',
            statusEffect: hasWind ? 'Wind Scatter (-62% Hit)' : 'Volley Fire',
          });
        }
      }

      if (hasRain && hasOrcs) {
        synergies.push({
          source: 'Player 2 Passive (Rain) + Soil Strata',
          target: 'Player 1 Active (100 Orcs at Gates)',
          outcome: 'Rain -> Deep Mud -> Charging Orcs bogged down (-45% movement speed) in front of the gates!',
          impactType: 'sabotage',
        });
      }
      if (hasWind && hasArchers) {
        synergies.push({
          source: 'Player 1 Passive (Crosswind)',
          target: 'Player 2 Active (Rampart Archers)',
          outcome: 'Wind -> Arrow Deflection -> Archers fail to pick off the vanguard (-62% accuracy)!',
          impactType: 'sabotage',
        });
      }
    }

    // 2. Wood Farming vs. Rain (Co-op) or Drought (Sabotage)
    if (hasWoodFarm) {
      next.phase3.divergenceScores.aoeEmpireWar += 15;
      next.phase3.divergenceScores.ecologicalChaos += 15;

      const isSabotagedByDrought = hasDrought;
      const isBoostedByRain = hasRain && !hasDrought;

      next.phase3.implementedFeatures.unshift({
        id: `feat-wood-${next.globalTurn}`,
        name: 'Alien Timber Plantation & Sawmills',
        category: 'agriculture',
        createdBy: 'player1',
        activePrompt: p1Active,
        passiveLaw: p1Passive,
        status: isSabotagedByDrought ? 'sabotaged' : 'thriving',
        efficiency: isSabotagedByDrought ? 30 : isBoostedByRain ? 175 : 110,
        synergyNotes: isSabotagedByDrought
          ? ['Sabotaged by rival Drought! Sap dries up and timber yield drops by 70%!']
          : isBoostedByRain
            ? ['Nourished by Monsoon Rain & Aqueducts! Timber output surges to 175%!']
            : ['Autonomous lumberjacks harvesting planetary timber groves.'],
        voxelEffect: isSabotagedByDrought ? 'drought_heat' : 'wood_farm',
        turnCreated: next.globalTurn,
      });

      next.phase3.resources.timber += isSabotagedByDrought ? 15 : isBoostedByRain ? 140 : 65;

      for (let i = 0; i < 3; i++) {
        next.phase3.agents.push({
          id: `lumber-${next.globalTurn}-${i}`,
          faction: 'player1',
          role: 'lumberjack',
          label: `Timber Harvester #${i + 1}`,
          x: 7 + i * 3,
          y: 5,
          z: 15,
          vx: 0.25,
          vz: -0.2,
          hp: 90,
          maxHp: 90,
          speed: 1.0,
          accuracy: 0.8,
          state: 'working',
          statusEffect: isSabotagedByDrought ? 'Parched by Drought' : 'Harvesting Timber',
        });
      }

      if (isSabotagedByDrought) {
        synergies.push({
          source: 'Player 2 (Severe Drought)',
          target: 'Player 1 (Wood Farming)',
          outcome: 'Drought withers the newly planted timber groves into dry brush (-70% wood yield)!',
          impactType: 'sabotage',
        });
      } else if (isBoostedByRain) {
        synergies.push({
          source: 'Player 2 (Rain & Irrigation)',
          target: 'Player 1 (Wood Farming)',
          outcome: 'Co-Op Synergy! Rain supercharges the alien forestry groves (+140 Timber, thriving canopy)!',
          impactType: 'synergy',
        });
      }
    }

    // 3. SimCity Traffic & Road Network vs. Mudslide / Gridlock
    if (hasTrafficSimCity) {
      next.phase3.divergenceScores.simCityCivic += 35;
      next.phase3.eraTitle = 'SimCity Divergence: Alien Transit Metropolis';

      const jammed = hasMudslideSabotage;
      next.phase3.resources.trafficFlow = jammed
        ? Math.max(18, next.phase3.resources.trafficFlow - 38)
        : Math.min(98, next.phase3.resources.trafficFlow + 25);
      next.phase3.resources.colonyPopulation += jammed ? 8 : 28;

      next.phase3.implementedFeatures.unshift({
        id: `feat-traffic-${next.globalTurn}`,
        name: 'SimCity Elevated Transit & Commuter Grid',
        category: 'traffic_civic',
        createdBy: 'player1',
        activePrompt: p1Active,
        passiveLaw: p1Passive,
        status: jammed ? 'sabotaged' : 'thriving',
        efficiency: jammed ? 40 : 155,
        synergyNotes: jammed
          ? ['Rival Mudslide & Toll Blockade triggered a multi-lane alien rush-hour traffic jam!']
          : ['Synchronized commuter pods and cargo haulers accelerating colony growth!'],
        voxelEffect: 'transit_road',
        turnCreated: next.globalTurn,
      });

      for (let i = 0; i < 4; i++) {
        next.phase3.agents.push({
          id: `cart-${next.globalTurn}-${i}`,
          faction: 'colony',
          role: 'commuter_cart',
          label: `Transit Pod #${i + 1}`,
          x: 4 + i * 4,
          y: 5,
          z: 12,
          vx: jammed ? 0.08 : 0.65,
          vz: 0,
          hp: 100,
          maxHp: 100,
          speed: jammed ? 0.25 : 1.5,
          accuracy: 1,
          state: 'commuting',
          statusEffect: jammed ? 'Stuck in Traffic Jam!' : 'Express Lane Flow',
        });
      }

      if (jammed) {
        synergies.push({
          source: 'Player 2 (Mudslide & Toll Blockade)',
          target: 'Player 1 (SimCity Transit Network)',
          outcome: 'Rush-hour gridlock! Commuter pods pile up at the mud-choked interchange (-38% Traffic Flow).',
          impactType: 'sabotage',
        });
      } else {
        synergies.push({
          source: 'SimCity Transit Grid',
          target: 'Alien Ant-Farm Economy',
          outcome: 'High-speed road network links surface timber mills with underground shafts (+28 Population)!',
          impactType: 'synergy',
        });
      }
    }

    // 4. Generic Open-Ended Feature Fallback (if players typed a completely custom creative prompt!)
    if (!hasOrcs && !hasArchers && !hasWoodFarm && !hasTrafficSimCity) {
      next.phase3.divergenceScores.dwarfSubterranean += hasTunnel ? 25 : 10;
      next.phase3.implementedFeatures.unshift({
        id: `feat-custom-p1-${next.globalTurn}`,
        name: p1Active.slice(0, 42) || 'Divine Manifestation I',
        category: hasTunnel ? 'subterranean' : 'weather_ecology',
        createdBy: 'player1',
        activePrompt: p1Active,
        passiveLaw: p1Passive,
        status: 'thriving',
        efficiency: 115,
        synergyNotes: [`Interacting with ${p2Active.slice(0, 32)} under ${next.phase2.emergentArchetype.replace(/_/g, ' ')} laws.`],
        voxelEffect: hasTunnel ? 'underground_warren' : 'fungal_reactor',
        turnCreated: next.globalTurn,
      });

      next.phase3.implementedFeatures.unshift({
        id: `feat-custom-p2-${next.globalTurn}`,
        name: p2Active.slice(0, 42) || 'Divine Manifestation II',
        category: 'weather_ecology',
        createdBy: 'player2',
        activePrompt: p2Active,
        passiveLaw: p2Passive,
        status: 'thriving',
        efficiency: 110,
        synergyNotes: [`Passive condition (${p2Passive.slice(0, 32)}) reshapes local colony behavior.`],
        voxelEffect: 'aqueduct',
        turnCreated: next.globalTurn,
      });

      synergies.push({
        source: `P1 (${p1Active.slice(0, 25)})`,
        target: `P2 (${p2Active.slice(0, 25)})`,
        outcome: `New custom features integrated into the ${next.mainAlien.name} colony simulation!`,
        impactType: 'synergy',
      });
    }

    // Merge AI-generated features or synergies if returned by Gemini
    if (aiData && typeof aiData === 'object') {
      const p3Ai = (aiData as { phase3Updates?: Record<string, unknown> }).phase3Updates;
      if (p3Ai && Array.isArray(p3Ai.newFeatures)) {
        for (const af of p3Ai.newFeatures.slice(0, 2)) {
          const item = af as Record<string, unknown>;
          if (item.name && typeof item.name === 'string') {
            const alreadyExists = next.phase3.implementedFeatures.some(
              (f) => f.name.toLowerCase() === String(item.name).toLowerCase()
            );
            if (!alreadyExists) {
              next.phase3.implementedFeatures.unshift({
                id: `feat-ai-${next.globalTurn}-${Math.random().toString(36).slice(2, 6)}`,
                name: String(item.name),
                category: (item.category as ImplementedColonyFeature['category']) || 'weather_ecology',
                createdBy: (item.createdBy as ImplementedColonyFeature['createdBy']) || 'player1',
                activePrompt: String(item.activePrompt || p1Active),
                passiveLaw: String(item.passiveLaw || p1Passive),
                status: (item.status as ImplementedColonyFeature['status']) || 'thriving',
                efficiency: Number(item.efficiency) || 100,
                synergyNotes: Array.isArray(item.synergyNotes)
                  ? item.synergyNotes.map(String)
                  : ['Synthesized by Gemini Causal Weaver'],
                voxelEffect:
                  (item.voxelEffect as ImplementedColonyFeature['voxelEffect']) ||
                  'fungal_reactor',
                turnCreated: next.globalTurn,
              });
            }
          }
        }
      }
    }

    // Entropy 3rd Faction Move in Phase 3
    entropyCounterLaw =
      (aiData?.entropyCounterLaw as string) ||
      'Entropy (The Great Silence) imposes Calcified Equilibrium — rusting gears, dulling arrowheads, and urging colonists to sleep.';
    synergies.push({
      source: '3rd Faction: Entropy AI',
      target: 'All Active Features & Units',
      outcome: entropyCounterLaw,
      impactType: 'entropy_dampen',
    });

    headline =
      (aiData?.headline as string) ||
      `Turn ${next.globalTurn}: ${p1Active.slice(0, 24)} × ${p2Active.slice(0, 24)}`;
    narrative =
      (aiData?.narrative as string) ||
      `On the locked ${next.phase2.emergentArchetype.replace(/_/g, ' ')} world (${next.phase2.densityG.toFixed(2)}G), Player 1 declared "${p1Active}" (${p1Passive}) while Player 2 countered with "${p2Active}" (${p2Passive}). Meanwhile, Entropy attempts to quiet the chaos.`;
    next.entropyIndex = Math.max(12, Math.min(98, next.entropyIndex + 6));
  }

  // Merge AI synergies if present
  if (aiData && Array.isArray((aiData as { synergies?: unknown[] }).synergies)) {
    const aiSyns = (aiData as { synergies: CausalSynergyItem[] }).synergies;
    for (const s of aiSyns.slice(0, 3)) {
      if (s && s.source && s.outcome) {
        synergies.push({
          source: String(s.source),
          target: String(s.target || 'Colony World'),
          outcome: String(s.outcome),
          impactType:
            (s.impactType as CausalSynergyItem['impactType']) || 'synergy',
        });
      }
    }
  }

  next.lastEntropyCounterLaw = entropyCounterLaw;

  const entry: TurnChronicleEntry = {
    id: `chron-${next.globalTurn}`,
    turnNumber: next.globalTurn,
    phase: next.phase,
    p1Active,
    p1Passive,
    p2Active,
    p2Passive,
    entropyLaw: entropyCounterLaw,
    headline,
    narrative,
    synergies,
    timestamp: `Turn ${next.globalTurn}`,
  };

  next.chronicles = [entry, ...next.chronicles].slice(0, 25);
  return next;
}
