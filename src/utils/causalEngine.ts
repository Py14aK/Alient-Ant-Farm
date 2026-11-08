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
import {
  computeGoldilocksBoundsAU,
  solveJuliaAtmosphericPhysics,
  updateCandidateWorldsForSun,
} from './juliaPhysicsSolver';

export const CANDIDATE_WORLDS: CandidateCelestialBody[] = [
  {
    id: 'scorched_inner',
    orbitNumber: 1,
    name: '1st Orbit: Vulcan-I (Inner Slag)',
    subtitle: 'Tidal-Locked Silicate Cinder · 0.38 AU',
    orbitRadiusAU: 6.8,
    eccentricity: 0.08,
    angle: 0.4,
    massEarth: 0.4,
    baseSize: 0.85,
    baseColorHex: '#DC2626',
    accentColorHex: '#F97316',
    hasRingOrMoon: false,
    defaultDensityG: 0.95,
    defaultAcidity: 65,
    defaultH2O: 5,
    inGoldilocksZone: false,
    description:
      '1st planet from the Sun. Scorched under a Yellow Sun, but becomes the Goldilocks Habitable World if Phase I ignites a cool Red Dwarf star!',
  },
  {
    id: 'venusian_rocky',
    orbitNumber: 2,
    name: '2nd Orbit: Cythera-II (Sulfur Veil)',
    subtitle: 'Dense Basalt Mantle · 0.72 AU',
    orbitRadiusAU: 10.0,
    eccentricity: 0.02,
    angle: 1.7,
    massEarth: 0.92,
    baseSize: 1.15,
    baseColorHex: '#EAB308',
    accentColorHex: '#CA8A04',
    hasRingOrMoon: false,
    defaultDensityG: 1.1,
    defaultAcidity: 68,
    defaultH2O: 22,
    inGoldilocksZone: false,
    description:
      '2nd planet from the Sun. Teeters on the edge of a runaway Venusian greenhouse if players forget to prompt sulfur/carbon-fixing bacteria!',
  },
  {
    id: 'martian',
    orbitNumber: 3,
    name: '3rd Orbit: Ares-III (Iron Canyon)',
    subtitle: 'Rusted Oxide Plateaus · 0.88 AU',
    orbitRadiusAU: 13.2,
    eccentricity: 0.07,
    angle: 2.9,
    massEarth: 0.55,
    baseSize: 1.0,
    baseColorHex: '#EA580C',
    accentColorHex: '#F59E0B',
    hasRingOrMoon: false,
    defaultDensityG: 0.65,
    defaultAcidity: 32,
    defaultH2O: 30,
    inGoldilocksZone: false,
    description:
      '3rd planet from the Sun. Iron-rich canyons and subterranean ice aquifers ready for Satisfractured conveyor lines or borehole terraforming.',
  },
  {
    id: 'goldilocks_earth',
    orbitNumber: 4,
    name: '4th Orbit: Aethel-IV (Goldilocks Cradle)',
    subtitle: 'Yellow-Sun Habitable Zone · 1.00 AU',
    orbitRadiusAU: 16.5,
    eccentricity: 0.03,
    angle: 4.1,
    massEarth: 1.25,
    baseSize: 1.4,
    baseColorHex: '#2563EB',
    accentColorHex: '#10B981',
    hasRingOrMoon: true,
    defaultDensityG: 1.35,
    defaultAcidity: 22,
    defaultH2O: 68,
    inGoldilocksZone: true,
    description:
      '4th planet from the Sun! Around a 1.0 M_sun Yellow Sun, this is the quintessential Goldilocks Earth—and if you make its atmosphere dense enough, buoyant Sky Whales (à la Hitchhiker’s Guide) evolve in the clouds!',
  },
  {
    id: 'failed_star_moon',
    orbitNumber: 5,
    name: '5th Orbit: Tiamat-V (Failed Star Moon)',
    subtitle: 'Exomoon of a Brown Dwarf · 1.52 AU',
    orbitRadiusAU: 21.2,
    eccentricity: 0.04,
    angle: 5.0,
    massEarth: 1.85,
    baseSize: 1.75,
    baseColorHex: '#9333EA',
    accentColorHex: '#EC4899',
    hasRingOrMoon: true,
    defaultDensityG: 1.8,
    defaultAcidity: 45,
    defaultH2O: 50,
    inGoldilocksZone: false,
    description:
      '5th orbit: A heavy moon orbiting a Failed Brown-Dwarf Star. Easily becomes "Too Dense" (1.8G+) or a Goldilocks refuge if Phase I ignites a Hot Blue Giant Sun!',
  },
  {
    id: 'comet',
    orbitNumber: 6,
    name: '6th Orbit: Halcyon-VI (Great Comet)',
    subtitle: 'Eccentric Volatile Ice-Core · 2.10 AU',
    orbitRadiusAU: 25.5,
    eccentricity: 0.38,
    angle: 5.9,
    massEarth: 0.3,
    baseSize: 0.85,
    baseColorHex: '#38BDF8',
    accentColorHex: '#E0F2FE',
    hasRingOrMoon: false,
    defaultDensityG: 0.4,
    defaultAcidity: 15,
    defaultH2O: 90,
    inGoldilocksZone: false,
    description:
      '6th orbit: Eccentric icy comet overflowing with H2O and organic sugars that readily ferment into volatile Alcohol Seas.',
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
      label: 'Standard Model: SU(3) Confinement + Inflation + 1.0 M☉ Yellow Sun',
      badge: 'Yellow Sun (4th Planet Goldilocks)',
      p1Active: 'Trigger exponential Cosmic Inflation (phi field) and SU(3) quark confinement into protons',
      p1Passive: 'CP-violation time asymmetry so matter survives over antimatter (forward arrow of time)',
      p2Active: 'Collapse hydrogen-carbon molecular cloud into a 1.0 M_sun Yellow G-Type Sun',
      p2Passive: 'Balanced Newtonian gravity and U(1) electromagnetism seeding heavy elements',
    },
    {
      label: 'Hot Blue Giant Sun (1.65 M☉) + High Electromagnetism',
      badge: 'Outer Goldilocks Shift',
      p1Active: 'Hyper-compress massive molecular nebula with strong SU(3) fusion coupling into a 1.65 M_sun Blue Star',
      p1Passive: 'Intense U(1) electromagnetic plasma filaments across the proto-planetary disk',
      p2Active: 'Synthesize dense iron, sulfur, and silicate rings in the outer orbits',
      p2Passive: 'Reversible quantum time-symmetry echoes slowing entropy',
    },
  ],
  2: [
    {
      label: '4th Planet Dense Goldilocks -> Sky Whales & Full Trichromatic + Rod Eyes!',
      badge: 'Hitchhiker’s Sky Whales',
      p1Active: 'On the 4th planet, build a dense 1.45G buoyant H2O atmosphere with aero-plankton & Sky Whales',
      p1Passive: 'DNA double-helix stability + wood-eating mushrooms + sulfur-fixing bacteria',
      p2Active: 'Evolve the Eye with 3 color cone distributions (Red-in-the-middle cheat) AND Rhodopsin Rods for night contours',
      p2Passive: 'Lateral inhibition contrast perception & clear night stargazing without Kokošja Slepota',
    },
    {
      label: 'Forgot Rods -> Kokošja Slepota (Night Blindness) + Purple Great Fire!',
      badge: 'Night Blindness & Great Fire',
      p1Active: 'Cover the continents in purple retinal trees and woody lignin polymers',
      p1Passive: 'Zero wood-eating bacteria or mushrooms exist to decompose fallen timber',
      p2Active: 'Evolve 2-cone dichromatic eyes (missing Red cone -> Color Blindness) and FORGET Rod photoreceptors',
      p2Passive: 'Kokošja Slepota (Night Blindness): aliens cannot see stars in the dark or contours in shadow',
    },
    {
      label: 'Oops, Forgot Bacteria -> Runaway Venusian Acid World',
      badge: 'Venusian Greenhouse',
      p1Active: 'Outgas dense CO2 and sulfuric acid plumes across the planet',
      p1Passive: 'Zero carbon-fixing or sulfur-reducing bacteria in the primordial soup',
      p2Active: 'Seed RNA-only extremophiles beneath boiling yellow sulfuric clouds',
      p2Passive: 'High optical depth trapping infrared heat via ClimaAtmos radiative transfer',
    },
  ],
  3: [
    {
      label: 'The Wheel Loophole Duel: P1 Invents Wheel -> P2 Makes It Square!',
      badge: 'Loophole Comedy',
      p1Active: 'Invent the wheel attached to wooden carts for hauling colony timber',
      p1Passive: 'Paved logging roads linking the forest to the citadel',
      p2Active: 'You never said a ROUND wheel! Make all their wheels strictly SQUARE blocks!',
      p2Passive: 'Bumpy cobble roads causing square-wheeled wagons to clunk at 25% speed',
    },
    {
      label: 'Steam Boiler Loophole -> Used for Döner Kebab Spits & Automatons!',
      badge: 'Anthropological History',
      p1Active: 'Invent a coal-fired steam boiler and spinning steam turbine (aeolipile)',
      p1Passive: 'High-pressure copper steam pipes and brass gears',
      p2Active: 'Since no locomotive drivetrain was described, use the steam turbines exclusively to spin vertical Döner kebab spits and temple automatons!',
      p2Passive: 'Delicious roasted meat aroma distracting soldiers & lumberjacks across the colony',
    },
    {
      label: 'Inventing the Hut ("Mud, Wood, Leaves") vs. Monsoon Rain',
      badge: 'Literal AI Physics',
      p1Active: 'Invent the Hut: pile mud, wood, and leaves together for colonist housing',
      p1Passive: 'Rapid coastal village expansion along the low-ground shoreline',
      p2Active: 'Summon torrential monsoon rain and gale winds over the unframed mud-leaf huts',
      p2Passive: 'Without a triangulated roof truss or kiln bricks, wet mud melts into soup!',
    },
    {
      label: 'Burn Oil & Coal -> Global Warming Melts Ice & Drowns the Coast!',
      badge: 'Climate Deluge',
      p1Active: 'Drill deep thermal boreholes and burn underground oil & coal seams for Satisfractured 3n+1 factories',
      p1Passive: 'Unchecked greenhouse CO2 emissions spiking atmospheric optical depth tau',
      p2Active: 'Melt the polar glacier ice blocks and raise global sea levels by +3 meters',
      p2Passive: 'Coastal inundation drowning low-ground huts, roads, and un-adapted units',
    },
    {
      label: 'StarCraft / AoE Siege: 100 Orcs + Wind vs. Elven Archers + Rain -> Mud',
      badge: 'RTS Siege Emergence',
      p1Active: '100 armored Orc raiders charging in front of the high-ground rampart gates',
      p1Passive: 'Fierce crosswind blowing across the valley deflecting arrows',
      p2Active: 'Elite Elven archers stationed atop the stepped cliff walls firing volleys',
      p2Passive: 'Torrential rain turning the low-ground soil blocks into deep sticky mud',
    },
  ],
};

export function evaluatePlanetArchetype(
  p2: Phase2SolarAndChemistryState,
  seaLevelY: number = 1.0
): { archetype: EmergentPlanetArchetype; alerts: string[] } {
  const alerts: string[] = [];

  if (p2.atmosphericPhysics.skyWhalesPresent) {
    alerts.push(
      `DENSE GOLDILOCKS ATMOSPHERE (Buoyancy ${p2.atmosphericPhysics.archimedesBuoyancyIndex}x): Aero-buoyant SKY WHALES (à la Hitchhiker's Guide) have evolved in the clouds!`
    );
  }

  if (p2.ocular.kokosjaSlepotaActive) {
    alerts.push(
      'KOKOŠJA SLEPOTA (Кокоша слепота / Night Blindness — No Rods): Aliens lose contour vision in the dark and CANNOT SEE THE STARS at night!'
    );
  }

  if (p2.ocular.colorBlindnessMode !== 'none') {
    alerts.push(
      `OCULAR CONE DEFECT (${p2.ocular.colorBlindnessMode.replace(/_/g, ' ').toUpperCase()}): Missing color distribution causes color-blind target confusion!`
    );
  }

  if (p2.densityG >= 1.75) {
    alerts.push(
      `OH, WE ARE TOO DENSE (${p2.densityG.toFixed(2)}G / ${p2.atmosphericPhysics.surfaceGravityMS2} m/s²): Crushing gravity flattens terrain and grounds non-buoyant flyers!`
    );
  }

  if (
    (p2.molecules.acidity >= 60 || p2.molecules.co2Sulfur >= 62) &&
    !p2.microbes.carbonSulfurBacteria
  ) {
    alerts.push(
      `OOPS, FORGOT BACTERIA -> VENUSIAN GREENHOUSE (${p2.atmosphericPhysics.surfaceTempC}°C, ${p2.atmosphericPhysics.surfacePressureBar} bar): Unchecked CO2 & sulfuric acid!`
    );
  }

  if (
    p2.molecules.carbonComplexity === 'woody_lignin' &&
    !p2.microbes.woodDecomposerFungi &&
    p2.deadWoodStrata >= 45
  ) {
    alerts.push(
      'NO WOOD-EATING BACTERIA OR MUSHROOMS: Dead woody lignin piled into explosive carbon/oil seams -> THE GREAT FIRE!'
    );
  }

  let archetype: EmergentPlanetArchetype = 'primordial_cradle';
  if (seaLevelY >= 2.6) {
    archetype = 'drowned_greenhouse_deluge';
  } else if (p2.greatFireActive) {
    archetype = 'great_fire_inferno';
  } else if (
    (p2.molecules.acidity >= 60 || p2.molecules.co2Sulfur >= 62) &&
    !p2.microbes.carbonSulfurBacteria
  ) {
    archetype = 'venusian_greenhouse';
  } else if (p2.atmosphericPhysics.skyWhalesPresent) {
    archetype = 'goldilocks_sky_whale_eden';
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

  if (p2.atmosphericPhysics.skyWhalesPresent) {
    traits.push('Symbiotic Sky-Whale Leviathans');
  }
  if (p2.ocular.kokosjaSlepotaActive) {
    traits.push('Kokošja Slepota (Night-Blind / Star-Blind)');
  } else {
    traits.push('Rhodopsin Rod Night-Stargazers');
  }
  if (p2.ocular.colorBlindnessMode !== 'none') {
    traits.push(`Dichromat (${p2.ocular.colorBlindnessMode.replace(/_/g, ' ')})`);
  } else {
    traits.push('Trichromat 3-Cone Eye (Red-in-Middle Cheat)');
  }
  if (p2.genetics.dnaPresent) {
    traits.push('Double-Helix DNA Memory');
  } else {
    traits.push('Hyper-Mutating RNA');
  }

  if (archetype === 'goldilocks_sky_whale_eden') {
    return {
      name: 'Magrathean Aero-Cetaceans & Spore-Kin',
      morphology: 'Buoyant Sky Whales cruising above bipedal trichromatic builders',
      diet: 'Aero-plankton, timber sap & roasted Döner tubers',
      preferredStrata: 'aerostat_sky',
      primaryColorHex: '#38BDF8',
      secondaryColorHex: '#F59E0B',
      speedMultiplier: 1.15,
      armorRating: 1.25,
      traits,
      loreSummary:
        'Formed on the 4th Goldilocks planet around a Yellow Sun with a dense, buoyant atmosphere—home to majestic Sky Whales and literal-minded engineers.',
    };
  }

  if (archetype === 'venusian_greenhouse') {
    return {
      name: 'Venerian Chitin-Delvers',
      morphology: 'Armor-plated subterranean hexapods beneath sulfuric clouds',
      diet: 'Sulfur-crust chemosynthesis & underground fungi',
      preferredStrata: 'subterranean',
      primaryColorHex: '#EAB308',
      secondaryColorHex: '#78350F',
      speedMultiplier: 0.85,
      armorRating: 1.6,
      traits,
      loreSummary:
        'Because sulfur/carbon bacteria were forgotten in Phase II, these resilient aliens burrow beneath a 45-bar Venusian acid sky.',
    };
  }

  return {
    name: 'Chiron Myco-Terrans',
    morphology: 'Isometric carapace-clad colonists with compound trichromatic eyes',
    diet: 'Lignin timber, fungal spores & steam-roasted Döner',
    preferredStrata: 'surface',
    primaryColorHex: '#10B981',
    secondaryColorHex: '#06B6D4',
    speedMultiplier: 1.0,
    armorRating: 1.2,
    traits,
    loreSummary:
      `Evolved under a ${p1.starSpectralClass} (${p1.sunMassSolar.toFixed(2)} M☉) with ${p2.atmosphericPhysics.surfacePressureBar} bar atmospheric pressure and water boiling at ${p2.atmosphericPhysics.waterBoilingPointC}°C.`,
  };
}

export function createInitialCosmosState(): CosmosGameState {
  const phase1: Phase1GenesisState = {
    turnCount: 0,
    timeArrow: 'forward',
    inflationFieldPhi: 1.4,
    cpAsymmetry: 0.65,
    su3StrongCoupling: 1.0,
    gravityStrength: 1.0,
    electricityStrength: 1.0,
    molecularCloudDensity: 55,
    sunIgnited: false,
    sunMassSolar: 1.0,
    sunLuminositySolar: 1.0,
    starSpectralClass: '1.0 M☉ Yellow G-Type Sun',
    starColorHex: '#F59E0B',
    synthesizedElements: {
      hydrogen: 75,
      carbon: 35,
      oxygen: 30,
      sulfur: 20,
      iron: 25,
      silicates: 30,
    },
  };

  const worlds = updateCandidateWorldsForSun(CANDIDATE_WORLDS, phase1.sunMassSolar);

  const phase2: Phase2SolarAndChemistryState = {
    turnCount: 0,
    selectedWorldType: 'goldilocks_earth',
    worldLockedInStone: false,
    densityG: 1.35,
    molecules: {
      h2o: 68,
      alcohol: 5,
      acidity: 22,
      co2Sulfur: 28,
      oxygen: 24,
      carbonComplexity: 'organic_chains',
    },
    genetics: {
      rnaPresent: true,
      dnaPresent: true,
      mutationRate: 18,
    },
    microbes: {
      carbonSulfurBacteria: true,
      retinalPurpleMicrobes: true,
      woodDecomposerFungi: true,
    },
    ocular: {
      cones: {
        shortBlue: true,
        mediumGreen: true,
        longRed: true,
        redInMiddleCheatActive: true,
      },
      rodsPresent: true,
      kokosjaSlepotaActive: false,
      colorBlindnessMode: 'none',
      contrastIllusionLevel: 35,
      canSeeStarsAtNight: true,
      simulateAlienVisionFilter: false,
    },
    deadWoodStrata: 35,
    greatFireActive: false,
    atmosphericPhysics: {
      surfaceGravityMS2: 13.24,
      escapeVelocityKmS: 15.3,
      surfacePressureBar: 2.1,
      airDensityKgM3: 2.45,
      scaleHeightKm: 6.8,
      opticalDepthTau: 0.85,
      equilibriumTempK: 255,
      surfaceTempC: 18.5,
      waterBoilingPointC: 121.8,
      archimedesBuoyancyIndex: 1.94,
      skyWhalesPresent: true,
      aerodynamicDragMultiplier: 2.0,
    },
    emergentArchetype: 'goldilocks_sky_whale_eden',
    diagnosticAlerts: [],
  };

  phase2.atmosphericPhysics = solveJuliaAtmosphericPhysics(phase1, phase2, worlds, 0);
  const evalRes = evaluatePlanetArchetype(phase2, 1.0);
  phase2.emergentArchetype = evalRes.archetype;
  phase2.diagnosticAlerts = evalRes.alerts;

  const mainAlien = synthesizeMainAlien(phase1, phase2);

  return {
    phase: 1,
    globalTurn: 1,
    activePlayerTurn: 'player1',
    lastPlayerMove: null,
    entropyIndex: 18,
    lastEntropyCounterLaw:
      'Entropy Optimizer AI awaits your first mechanics so it can over-optimize them into extinction.',
    phaseTransitionBanner: null,
    phase1,
    phase2,
    candidateWorlds: worlds,
    mainAlien,
    phase3: {
      turnCount: 0,
      eraTitle: 'Dawn of the Alien Ant-Farm',
      season: 'spring',
      cloudCover: 35,
      agencyLevel: 45,
      mathRules: {
        collatzValue: 7,
        collatzTrajectory: [7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1],
        powerTowerA: 2,
        powerTowerB: 2,
        powerTowerC: 2,
        powerTowerDisplay: '2^(2^2) = 16x Causal Complexity',
      },
      climate: {
        fossilFuelBurned: 0,
        globalWarmingDeltaC: 0,
        polarIceRemaining: 100,
        seaLevelY: 1.0,
        drownedUnitsCount: 0,
      },
      divergenceScores: {
        alphaCentauriXenobio: 25,
        aoeEmpireWar: 25,
        rimWorldColony: 25,
        blackAndWhiteMiracles: 25,
      },
      resources: {
        timber: 140,
        treesRemainingOnIsland: 85,
        stoneOre: 110,
        biomass: 150,
        oilBarrels: 40,
        donerKebabs: 12,
        trafficFlow: 70,
        colonyPopulation: 54,
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
          name: 'Founding Ant-Farm Command Nexus',
          category: 'subterranean',
          createdBy: 'player1',
          activePrompt: 'Subterranean brood-warren & stepped high-ground command post',
          passiveLaw: 'Autonomous harvesting and tunneling instincts',
          intendedGoal: 'Establish central alien colony hub',
          missingEngineeringLink: 'None (Hard-coded scaffolding)',
          literalOutcome: 'Colonists excavate stepped StarCraft-style voxel blocks and gather crystals.',
          alphaCentauriQuote:
            '"The substructure of the universe is not merely matter, but information." — Academician Prokhor Zakharov',
          entropyOverOptimizationWarning:
            'Entropy AI will attempt to over-mine the local timber and ore unless balanced.',
          noBacksiesLocked: true,
          status: 'thriving',
          efficiency: 100,
          synergyNotes: ['Permanent No-Backsies Founding Node'],
          voxelEffect: 'underground_warren',
          turnCreated: 0,
        },
      ],
      agents: [
        {
          id: 'ag-whale-1',
          faction: 'colony',
          role: 'sky_whale',
          label: 'Magrathean Sky Whale',
          x: 9,
          y: 8,
          z: 9,
          vx: 0.35,
          vz: 0.25,
          hp: 250,
          maxHp: 250,
          speed: 0.8,
          accuracy: 1.0,
          state: 'soaring',
          statusEffect: 'Floating via Archimedes Buoyancy (Oh no, not again!)',
        },
        {
          id: 'ag-1',
          faction: 'colony',
          role: 'alien_colonist',
          label: 'Drone Harvester #1',
          x: 11,
          y: 5,
          z: 11,
          vx: 0.4,
          vz: 0.2,
          hp: 100,
          maxHp: 100,
          speed: 1.0,
          accuracy: 0.85,
          state: 'working',
        },
        {
          id: 'ag-2',
          faction: 'colony',
          role: 'tunnel_digger',
          label: 'Sub-Strata Burrower',
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
          label: 'Timber Drone #2',
          x: 6,
          y: 5,
          z: 14,
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
        actingPlayer: 'both',
        p1Active: 'SU(3) Quark Confinement & Cosmic Inflation',
        p1Passive: 'CP-Violation Time Asymmetry',
        p2Active: '1.0 M☉ Yellow Sun Molecular Cloud',
        p2Passive: 'N-Body Gravitation & U(1) Electromagnetism',
        entropyLaw: 'The Entropy Optimizer AI waits to optimize your creations into stillness.',
        headline: 'First We Must Prompt the Universe (Baseline Initialized)',
        narrative:
          'Welcome to FIRST WE MUST PROMPT THE UNIVERSE (Satisfractured · The Alien Ant Farm). Phase I establishes Big Bang inflation, time asymmetry, and SU(3) nuclear binding to ignite the Sun and feed Phase II’s N-body Solar System.',
        synergies: [
          {
            source: 'Initial Universe Baseline',
            target: '3-Phase Causal Chain',
            outcome: 'All divergence scores initialized at 25. Every move is permanent (No Backsies!).',
            impactType: 'synergy',
          },
        ],
        divergenceSnapshot: {
          alphaCentauriXenobio: 25,
          aoeEmpireWar: 25,
          rimWorldColony: 25,
          blackAndWhiteMiracles: 25,
        },
        timestamp: 'Turn 0',
      },
    ],
    oracleHistory: [
      {
        id: 'ora-0',
        role: 'assistant',
        content:
          'Galactic Guide & JuliaPhysics / Wolfram Datalink online. Ask me about SU(3) quark confinement, why the 4th planet around a Yellow Sun sits in the Goldilocks zone, why forgetting Rod photoreceptors causes Kokošja Slepota (night blindness), or why Hero of Alexandria and Taqi al-Din used the first steam turbines for Döner kebab spits instead of cars!',
        wolframEquations: [
          'L_⋆ / L_☉ = (M_⋆ / M_☉)^3.5  →  r_Goldilocks ≈ 1.0 AU (4th Orbit)',
          'T_surf = T_eq · (1 + 0.75 · τ)^0.25  |  dP/dz = -ρ · g',
        ],
        timestamp: '00:00',
      },
    ],
  };
}

export function applyDeterministicAndAiWeave(
  state: CosmosGameState,
  p1Active: string,
  p1Passive: string,
  p2Active: string,
  p2Passive: string,
  aiData?: Record<string, unknown> | null,
  actingMode: 'player1' | 'player2' | 'both' = 'both'
): CosmosGameState {
  const effectiveText =
    actingMode === 'player1'
      ? `${p1Active} ${p1Passive}`
      : actingMode === 'player2'
        ? `${p2Active} ${p2Passive}`
        : `${p1Active} ${p1Passive} ${p2Active} ${p2Passive}`;
  const combined = effectiveText.toLowerCase();

  const next: CosmosGameState = JSON.parse(JSON.stringify(state));
  next.globalTurn += 1;
  next.phaseTransitionBanner = null;

  // Toggle next active player in move-based mode
  if (actingMode === 'player1') {
    next.activePlayerTurn = 'player2';
  } else if (actingMode === 'player2') {
    next.activePlayerTurn = 'player1';
  }

  // Advance 3n+1 (Collatz) & a^(b^c) mathematical state
  const curN = next.phase3.mathRules.collatzValue;
  const nextN = curN % 2 === 0 ? curN / 2 : 3 * curN + 1;
  next.phase3.mathRules.collatzValue = nextN <= 1 ? 27 : nextN;
  next.phase3.mathRules.collatzTrajectory = [
    ...next.phase3.mathRules.collatzTrajectory.slice(-11),
    next.phase3.mathRules.collatzValue,
  ];

  const synergies: CausalSynergyItem[] = [];
  let headline = '';
  let narrative = '';
  let entropyCounterLaw = '';
  let openLoopholeHint =
    'Watch your wording: omit "round" or "frame" and the other player can twist it!';

  if (next.phase === 1) {
    next.phase1.turnCount += 1;

    if (combined.includes('inflat') || combined.includes('phi') || combined.includes('expand')) {
      next.phase1.inflationFieldPhi = Math.min(2.8, +(next.phase1.inflationFieldPhi + 0.45).toFixed(2));
      synergies.push({
        source: 'Cosmic Inflation (φ Field)',
        target: 'Quantum Fluctuations',
        outcome: `Exponential space expansion (φ = ${next.phase1.inflationFieldPhi}) seeds galaxy filaments!`,
        impactType: 'synergy',
      });
    }

    if (combined.includes('su(3)') || combined.includes('quark') || combined.includes('strong') || combined.includes('gluon')) {
      next.phase1.su3StrongCoupling = Math.min(1.9, +(next.phase1.su3StrongCoupling + 0.25).toFixed(2));
      synergies.push({
        source: 'SU(3)_C Color Confinement',
        target: 'Baryon & Stellar Nucleosynthesis',
        outcome: 'Quarks bind into protons & neutrons, enabling p-p chain fusion inside the Sun!',
        impactType: 'synergy',
      });
    }

    if (combined.includes('revers') || combined.includes('echo')) {
      next.phase1.timeArrow = 'reversible_echo';
    } else if (combined.includes('cp') || combined.includes('asymmetr') || combined.includes('forward')) {
      next.phase1.timeArrow = 'forward';
      next.phase1.cpAsymmetry = 0.85;
    }

    // Determine Sun Mass (M_sun) & Spectral Type
    if (combined.includes('blue') || combined.includes('1.6') || combined.includes('giant')) {
      next.phase1.sunMassSolar = 1.65;
      next.phase1.starSpectralClass = '1.65 M☉ Blue-White F/A Star';
      next.phase1.starColorHex = '#38BDF8';
    } else if (combined.includes('red') || combined.includes('dwarf') || combined.includes('0.5')) {
      next.phase1.sunMassSolar = 0.55;
      next.phase1.starSpectralClass = '0.55 M☉ Red-Orange K/M Dwarf';
      next.phase1.starColorHex = '#EF4444';
    } else {
      next.phase1.sunMassSolar = 1.0;
      next.phase1.starSpectralClass = '1.00 M☉ Yellow G-Type Sun';
      next.phase1.starColorHex = '#F59E0B';
    }

    const bounds = computeGoldilocksBoundsAU(next.phase1.sunMassSolar);
    next.phase1.sunLuminositySolar = bounds.luminositySolar;
    next.phase1.sunIgnited = true;
    next.candidateWorlds = updateCandidateWorldsForSun(
      next.candidateWorlds,
      next.phase1.sunMassSolar
    );

    // Automatically select the Goldilocks planet for Phase II!
    const goldilocksWorld = next.candidateWorlds.find((w) => w.inGoldilocksZone);
    if (goldilocksWorld) {
      next.phase2.selectedWorldType = goldilocksWorld.id;
    }

    next.phase3.divergenceScores.alphaCentauriXenobio += 8;
    next.phase3.divergenceScores.blackAndWhiteMiracles += 6;

    // Seamless Phase I -> Phase II Automatic Outflow!
    next.phase = 2;
    next.phaseTransitionBanner = {
      fromPhase: 1,
      toPhase: 2,
      title: `Phase I → Phase II Outflow: ${next.phase1.starSpectralClass} Ignited!`,
      summary: `SU(3) nuclear binding and Cosmic Inflation birthed a ${next.phase1.sunMassSolar.toFixed(2)} M☉ Sun (L = ${next.phase1.sunLuminositySolar} L☉). By N-Body laws, ${goldilocksWorld?.name || 'the 4th Planet'} now sits in the Goldilocks Zone!`,
    };

    headline = `Big Bang & SU(3) Outflow: ${next.phase1.starSpectralClass} Forms Solar System!`;
    narrative = `Phase I complete! With SU(3) quark confinement, CP time asymmetry, and ${next.phase1.sunMassSolar.toFixed(2)} M☉ stellar mass, the Solar System has coalesced. Moving automatically into Phase II (Solar System & Ocular/Molecular Evolution).`;
    entropyCounterLaw = 'Entropy induces radiative cooling across the outer proto-planetary disk.';
  } else if (next.phase === 2) {
    next.phase2.turnCount += 1;

    if (combined.includes('dense') || combined.includes('1.4') || combined.includes('2.4') || combined.includes('whale')) {
      next.phase2.densityG = combined.includes('2.4') ? 2.4 : Math.max(1.42, next.phase2.densityG);
    }

    if (combined.includes('acid') || combined.includes('venus') || combined.includes('co2') || combined.includes('sulfur')) {
      next.phase2.molecules.acidity = Math.min(100, next.phase2.molecules.acidity + 38);
      next.phase2.molecules.co2Sulfur = Math.min(100, next.phase2.molecules.co2Sulfur + 42);
    }

    if (combined.includes('zero carbon-fixing') || combined.includes('forgot bacteria') || combined.includes('no bacteria')) {
      next.phase2.microbes.carbonSulfurBacteria = false;
    } else if (combined.includes('bacteria')) {
      next.phase2.microbes.carbonSulfurBacteria = true;
    }

    if (combined.includes('zero wood-eating') || combined.includes('no mushroom') || combined.includes('forgot mushroom')) {
      next.phase2.microbes.woodDecomposerFungi = false;
      next.phase2.molecules.carbonComplexity = 'woody_lignin';
      next.phase2.deadWoodStrata = 78;
      next.phase2.greatFireActive = true;
      synergies.push({
        source: 'Purple Lignin Trees + Zero Wood-Eating Mushrooms',
        target: 'Planetary Carbon Strata',
        outcome: 'THE GREAT FIRE IGNITES! Un-rotted timber burns across the continents and buries deep oil/coal seams!',
        impactType: 'climate_collapse',
      });
    } else if (combined.includes('mushroom') || combined.includes('fungi')) {
      next.phase2.microbes.woodDecomposerFungi = true;
      next.phase2.greatFireActive = false;
    }

    // Evolution of the Eye: 3 Cones + Rods vs. Kokošja Slepota (Night Blindness)
    if (
      combined.includes('kokos') ||
      combined.includes('slepota') ||
      combined.includes('forget rod') ||
      combined.includes('no rod') ||
      combined.includes('night blind')
    ) {
      next.phase2.ocular.rodsPresent = false;
      next.phase2.ocular.kokosjaSlepotaActive = true;
      next.phase2.ocular.canSeeStarsAtNight = false;
      next.phase2.ocular.simulateAlienVisionFilter = true;
      synergies.push({
        source: 'Forgotten Rod Photoreceptors (No Rhodopsin)',
        target: 'Alien Ocular Evolution',
        outcome: 'KOKOŠJA SLEPOTA (Night Blindness)! Aliens lose dark contour vision and CANNOT SEE THE STARS at night!',
        impactType: 'loophole_twist',
      });
    } else if (combined.includes('rod') || combined.includes('rhodopsin') || combined.includes('contour')) {
      next.phase2.ocular.rodsPresent = true;
      next.phase2.ocular.kokosjaSlepotaActive = false;
      next.phase2.ocular.canSeeStarsAtNight = true;
    }

    if (combined.includes('missing red') || combined.includes('color blind') || combined.includes('dichromat')) {
      next.phase2.ocular.cones.longRed = false;
      next.phase2.ocular.colorBlindnessMode = 'protanopia_no_red';
      next.phase2.ocular.simulateAlienVisionFilter = true;
      synergies.push({
        source: 'Missing L-Cone (Red Distribution)',
        target: 'Trichromatic Vision',
        outcome: 'Protanopia Color Blindness! Aliens confuse red enemies/fruit with green foliage.',
        impactType: 'loophole_twist',
      });
    } else if (combined.includes('3 color') || combined.includes('trichromat') || combined.includes('red-in-the-middle')) {
      next.phase2.ocular.cones = {
        shortBlue: true,
        mediumGreen: true,
        longRed: true,
        redInMiddleCheatActive: true,
      };
      next.phase2.ocular.colorBlindnessMode = 'none';
      synergies.push({
        source: '3-Cone Eye + "Red in the Middle" Cheat',
        target: 'Relative Contrast Perception',
        outcome: 'Overlapping M/L cones enable high-contrast fruit/target spotting alongside optical contrast illusions!',
        impactType: 'synergy',
      });
    }

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

    next.phase3.divergenceScores.alphaCentauriXenobio += 18;
    next.phase3.divergenceScores.blackAndWhiteMiracles += 10;

    // Seamless transition from Phase II -> Phase III once chemistry & biology are seeded!
    if (next.phase2.turnCount >= 1) {
      next.phase2.worldLockedInStone = true;
      next.phase = 3;
      next.phaseTransitionBanner = {
        fromPhase: 2,
        toPhase: 3,
        title: `Phase II → Phase III Descent: ${next.mainAlien.name} Awaken!`,
        summary: `Planet Constitution SET IN STONE (${next.phase2.atmosphericPhysics.surfacePressureBar} bar, ${next.phase2.atmosphericPhysics.surfaceTempC}°C, Sky Whales: ${next.phase2.atmosphericPhysics.skyWhalesPresent ? 'YES' : 'NO'}, Kokošja Slepota: ${next.phase2.ocular.kokosjaSlepotaActive ? 'YES' : 'NO'}). Entering the Sprite StarCraft Voxel Ant-Farm!`,
      };
    }

    headline = `Phase II Alchemy: ${next.mainAlien.name} (${next.phase2.emergentArchetype.replace(/_/g, ' ').toUpperCase()})`;
    narrative = `JuliaPhysics atmospheric solver locked in P₀ = ${next.phase2.atmosphericPhysics.surfacePressureBar} bar, T_surf = ${next.phase2.atmosphericPhysics.surfaceTempC}°C, H₂O boiling at ${next.phase2.atmosphericPhysics.waterBoilingPointC}°C. ${next.mainAlien.loreSummary}`;
    entropyCounterLaw = 'Entropy seeks chemical equilibrium in the upper atmosphere.';
  } else {
    // PHASE 3: Sprite StarCraft Voxel RTS, Literal AI Loopholes, Oil Global Warming & Entropy Optimizer
    next.phase3.turnCount += 1;

    const hasWheel = combined.includes('wheel') || combined.includes('cart') || combined.includes('wagon');
    const specifiedRound = combined.includes('round') || combined.includes('circular') || combined.includes('axle');
    const explicitSquare = combined.includes('square');

    const hasSteamBoiler = combined.includes('steam') || combined.includes('boiler') || combined.includes('turbine') || combined.includes('aeolipile') || combined.includes('doner') || combined.includes('döner');
    const specifiedLocomotive = combined.includes('piston') || combined.includes('crank') || combined.includes('locomotive');

    const hasHut = combined.includes('hut') || (combined.includes('mud') && combined.includes('leaves'));
    const specifiedTruss = combined.includes('truss') || combined.includes('foundation') || combined.includes('kiln');

    const hasOilBurn = combined.includes('oil') || combined.includes('coal') || combined.includes('fossil') || combined.includes('borehole') || combined.includes('melt') || combined.includes('warming');
    const hasWoodFarm = combined.includes('wood') || combined.includes('farm') || combined.includes('lumber') || combined.includes('timber');
    const hasOrcs = combined.includes('orc') || combined.includes('100 ') || combined.includes('raider') || combined.includes('zealot');
    const hasArchers = combined.includes('archer') || combined.includes('rampart') || combined.includes('volley');
    const hasRain = combined.includes('rain') || combined.includes('monsoon');
    const hasWind = combined.includes('wind') || combined.includes('gale');
    const hasCloudsSeasons = combined.includes('cloud') || combined.includes('season') || combined.includes('winter') || combined.includes('autumn');

    // 1. THE WHEEL LOOPHOLE ("You didn't say round wheel -> Square Wheels!")
    if (hasWheel) {
      const makeItSquare = explicitSquare || !specifiedRound;
      next.phase3.divergenceScores.aoeEmpireWar += 16;
      next.phase3.divergenceScores.rimWorldColony += 22;

      next.phase3.implementedFeatures.unshift({
        id: `feat-wheel-${next.globalTurn}`,
        name: makeItSquare ? 'Square-Wheeled Logging Wagons' : 'Greased-Axle Round Cargo Carts',
        category: 'anthropology_tech',
        createdBy: actingMode === 'player2' ? 'player2' : 'player1',
        activePrompt: effectiveText,
        passiveLaw: 'No Backsies Permanent Tech',
        intendedGoal: 'Efficient wheeled transport for colony hauling',
        missingEngineeringLink: makeItSquare
          ? 'Omitted "round circular circumference + greased axle bearing"!'
          : 'Complete first-principles rotary axle description',
        literalOutcome: makeItSquare
          ? 'Because "round" was omitted (or twisted by Player 2), the aliens carved SQUARE wooden wheels that thud and hop along the road at 25% speed!'
          : 'True rotary carts roll smoothly across the isometric block roads!',
        alphaCentauriQuote:
          '"Technology is never adopted in a vacuum; a wheel without an axle is merely a very heavy frisbee." — Commissioner Pravin Lal',
        entropyOverOptimizationWarning:
          'Entropy AI will overload the wagons until the roads rut into impassable trenches.',
        noBacksiesLocked: true,
        status: makeItSquare ? 'loophole_quirk' : 'thriving',
        efficiency: makeItSquare ? 28 : 165,
        synergyNotes: [
          makeItSquare
            ? 'LOOPHOLE TWIST: Square wheels clunk across the voxel blocks!'
            : 'Smooth rotary transport unlocked!',
        ],
        voxelEffect: 'square_wheel_cart',
        turnCreated: next.globalTurn,
      });

      openLoopholeHint = makeItSquare
        ? 'Square wheels locked in! Prompt a rounded lathe rim + greased axle to fix their wagons!'
        : 'Player 2 can sabotage the carts by turning the dirt road into deep mud with Rain!';

      next.phase3.agents.push({
        id: `sq-cart-${next.globalTurn}`,
        faction: 'colony',
        role: 'square_wheel_wagon',
        label: makeItSquare ? 'Square-Wheel Cart' : 'Rotary Cargo Wagon',
        x: 8,
        y: 5,
        z: 10,
        vx: makeItSquare ? 0.12 : 0.65,
        vz: 0,
        hp: 100,
        maxHp: 100,
        speed: makeItSquare ? 0.3 : 1.4,
        accuracy: 1,
        state: 'commuting',
        statusEffect: makeItSquare ? 'CLUNK-CLUNK (Square Wheels!)' : 'Rolling Smoothly',
      });

      synergies.push({
        source: makeItSquare ? 'Omitted "Round" Loophole' : 'First-Principles Axle & Rim',
        target: 'Colony Transport',
        outcome: makeItSquare
          ? 'You didn’t specify a round wheel—so the aliens built SQUARE wheels!'
          : 'Round wheels on greased axles boost logistics!',
        impactType: makeItSquare ? 'loophole_twist' : 'synergy',
      });
    }

    // 2. STEAM BOILER LOOPHOLE ("Used for Döner Kebab Spits & Automatons, Not Cars!")
    if (hasSteamBoiler) {
      const usedForDoner = !specifiedLocomotive || combined.includes('doner') || combined.includes('döner');
      next.phase3.divergenceScores.rimWorldColony += 24;
      next.phase3.divergenceScores.alphaCentauriXenobio += 14;
      next.phase3.resources.donerKebabs += 85;

      next.phase3.implementedFeatures.unshift({
        id: `feat-doner-${next.globalTurn}`,
        name: usedForDoner
          ? 'Taqi al-Din Steam-Powered Döner Rotisserie & Automaton'
          : 'High-Pressure Reciprocating Steam Engine',
        category: 'anthropology_tech',
        createdBy: actingMode === 'player2' ? 'player2' : 'player1',
        activePrompt: effectiveText,
        passiveLaw: `Water boils at ${next.phase2.atmosphericPhysics.waterBoilingPointC}°C at ${next.phase2.atmosphericPhysics.surfacePressureBar} bar`,
        intendedGoal: 'Industrial steam machine power',
        missingEngineeringLink: usedForDoner
          ? 'Omitted reciprocating piston, crank-rod, and wheel drivetrain!'
          : 'Full reciprocating cylinder & crank described',
        literalOutcome: usedForDoner
          ? 'Just like Hero of Alexandria and 16th-century polymath Taqi al-Din, the aliens use the steam turbine to spin vertical DÖNER KEBAB meat spits and temple bird automatons instead of cars!'
          : 'Reciprocating steam pistons power industrial colony machinery!',
        alphaCentauriQuote:
          '"For fifteen centuries the steam turbine spun skewered lamb before anyone thought to hitch it to a rail." — Galactic Anthropological Datalinks',
        entropyOverOptimizationWarning:
          'Entropy AI optimizes Döner consumption until every colonist is in a food coma and coal seams ignite global warming!',
        noBacksiesLocked: true,
        status: usedForDoner ? 'loophole_quirk' : 'thriving',
        efficiency: usedForDoner ? 95 : 170,
        synergyNotes: [
          `At ${next.phase2.atmosphericPhysics.surfacePressureBar} bar pressure, water boils at ${next.phase2.atmosphericPhysics.waterBoilingPointC}°C.`,
          usedForDoner
            ? 'Aliens gather around spinning steam Döner stalls (+85 Döner Kebabs)!'
            : 'Industrial steam locomotion online!',
        ],
        voxelEffect: 'doner_steam_rotisserie',
        turnCreated: next.globalTurn,
      });

      next.phase3.agents.push({
        id: `doner-bot-${next.globalTurn}`,
        faction: 'colony',
        role: 'doner_automaton',
        label: 'Steam Döner Spit & Automaton',
        x: 12,
        y: 5,
        z: 9,
        vx: 0.05,
        vz: 0.05,
        hp: 140,
        maxHp: 140,
        speed: 0.5,
        accuracy: 1,
        state: 'roasting_doner',
        statusEffect: 'Spinning Vertical Döner Kebab via Steam Jet!',
      });

      synergies.push({
        source: 'Steam Turbine Without Piston Drivetrain',
        target: 'Anthropological History of Technology',
        outcome:
          'Like Hero of Alexandria & Taqi al-Din (1551), the aliens use steam power for spinning Döner kebab spits and automatons rather than vehicles!',
        impactType: 'loophole_twist',
      });
    }

    // 3. INVENTING THE HUT ("Mud, Wood, Leaves" Without Frame -> Melts in Rain!)
    if (hasHut) {
      const meltsInRain = !specifiedTruss && (hasRain || next.phase3.weather.precipitation === 'rain');
      next.phase3.divergenceScores.aoeEmpireWar += 14;
      next.phase3.divergenceScores.rimWorldColony += 18;

      next.phase3.implementedFeatures.unshift({
        id: `feat-hut-${next.globalTurn}`,
        name: specifiedTruss ? 'Framed Timber & Kiln-Brick Lodge' : 'Unframed Mud-Wood-Leaf Heap Hut',
        category: 'traffic_civic',
        createdBy: actingMode === 'player1' ? 'player1' : 'player2',
        activePrompt: effectiveText,
        passiveLaw: 'No Backsies Shelter Rule',
        intendedGoal: 'Build sturdy colonist housing huts',
        missingEngineeringLink: specifiedTruss
          ? 'Complete load-bearing frame specified'
          : 'Only listed raw ingredients ("mud, wood, leaves") without a load-bearing A-frame truss or dried brick bond!',
        literalOutcome: meltsInRain
          ? 'The aliens stacked wet mud on loose leaves and sticks—and the rain melted the entire hut onto their heads!'
          : 'The aliens piled mud, wood, and leaves into wobbly mounds (vulnerable to the first rainstorm!).',
        alphaCentauriQuote:
          '"Naming the ingredients of a house is not architecture." — Morgan Construction Manual',
        entropyOverOptimizationWarning:
          'Entropy AI packs colonists into mud heaps until a single storm buries the district.',
        noBacksiesLocked: true,
        status: meltsInRain ? 'sabotaged' : 'loophole_quirk',
        efficiency: meltsInRain ? 20 : 65,
        synergyNotes: [
          meltsInRain
            ? 'Rain + Unframed Mud-Leaf Hut = Soggy Mud Soup Collapse!'
            : 'Open Loophole: If Player 2 prompts Rain, these unframed mud-leaf huts will melt!',
        ],
        voxelEffect: 'mud_leaf_hut',
        turnCreated: next.globalTurn,
      });

      openLoopholeHint =
        'Player 1 only said "mud, wood, leaves" without a frame! Player 2 can prompt Rain to melt their huts!';

      synergies.push({
        source: 'Literal AI ("Mud, Wood, Leaves")',
        target: 'Colony Housing',
        outcome: meltsInRain
          ? 'Rain dissolved the unframed mud-and-leaf heaps into mud soup!'
          : 'Aliens piled raw mud, sticks, and leaves without a roof frame!',
        impactType: 'loophole_twist',
      });
    }

    // 4. BURNING OIL & COAL -> GLOBAL WARMING, MELTING ICE VOXELS & RISING SEA LEVELS DROWNING COLONISTS!
    if (hasOilBurn) {
      next.phase3.climate.fossilFuelBurned = Math.min(100, next.phase3.climate.fossilFuelBurned + 55);
      next.phase2.atmosphericPhysics = solveJuliaAtmosphericPhysics(
        next.phase1,
        next.phase2,
        next.candidateWorlds,
        next.phase3.climate.fossilFuelBurned
      );
      next.phase3.climate.globalWarmingDeltaC = +(
        next.phase3.climate.globalWarmingDeltaC + 6.4
      ).toFixed(1);
      next.phase3.climate.polarIceRemaining = Math.max(
        0,
        next.phase3.climate.polarIceRemaining - 65
      );
      next.phase3.climate.seaLevelY = +(
        Math.min(4.2, next.phase3.climate.seaLevelY + 1.8)
      ).toFixed(1);

      // Mark low-ground coastal agents as drowning!
      let drowned = 0;
      next.phase3.agents.forEach((ag) => {
        if (ag.role !== 'sky_whale' && ag.x <= 6 && ag.y <= 5) {
          ag.state = 'drowning';
          ag.statusEffect = `DROWNING in +${next.phase3.climate.seaLevelY}m Rising Sea!`;
          drowned++;
        }
      });
      next.phase3.climate.drownedUnitsCount += drowned;
      next.phase3.divergenceScores.alphaCentauriXenobio += 35;

      next.phase3.implementedFeatures.unshift({
        id: `feat-oil-${next.globalTurn}`,
        name: 'Fossil-Fuel Boreholes & Runaway Ice-Melt Deluge',
        category: 'weather_ecology',
        createdBy: actingMode === 'player1' ? 'player1' : 'player2',
        activePrompt: effectiveText,
        passiveLaw: `Optical depth τ surged to ${next.phase2.atmosphericPhysics.opticalDepthTau} (+${next.phase3.climate.globalWarmingDeltaC}°C)`,
        intendedGoal: 'Rapid industrial energy from buried Carboniferous oil/coal',
        missingEngineeringLink: 'No carbon capture or sea-wall dikes constructed!',
        literalOutcome: `Polar ice blocks melted (${next.phase3.climate.polarIceRemaining}% left)! Sea levels rose to Level ${next.phase3.climate.seaLevelY}, flooding low-ground coastal blocks and drowning ${drowned} units!`,
        alphaCentauriQuote:
          '"Planetary sea levels are rising. Coastal installations will be inundated unless pressure domes are erected immediately." — Sid Meier’s Alpha Centauri Alert',
        entropyOverOptimizationWarning:
          'Entropy AI maximizes oil combustion until 100% of the ice caps melt into a global waterworld!',
        noBacksiesLocked: true,
        status: 'over_optimized',
        efficiency: 140,
        synergyNotes: [
          `Ice blocks melted! Sea level rose to Y=${next.phase3.climate.seaLevelY}, submerging low-ground blocks!`,
        ],
        voxelEffect: 'oil_derrick_warming',
        turnCreated: next.globalTurn,
      });

      synergies.push({
        source: 'Burning Buried Oil & Coal Seams',
        target: 'JuliaPhysics Optical Depth τ & Polar Ice Voxels',
        outcome: `Global warming (+${next.phase3.climate.globalWarmingDeltaC}°C) melted the ice blocks and raised sea levels, drowning coastal colonists!`,
        impactType: 'climate_collapse',
      });
    }

    // 5. WOOD FARMING + ENTROPY EASTER-ISLAND OVER-OPTIMIZATION ("Farm All the Wood and Die Out!")
    if (hasWoodFarm) {
      next.phase3.resources.timber += 110;
      next.phase3.resources.treesRemainingOnIsland = Math.max(
        5,
        next.phase3.resources.treesRemainingOnIsland - 45
      );
      next.phase3.divergenceScores.aoeEmpireWar += 20;
      next.phase3.divergenceScores.rimWorldColony += 15;

      next.phase3.implementedFeatures.unshift({
        id: `feat-wood-${next.globalTurn}`,
        name: 'Automated Timber Sawmills (Entropy Over-Optimized!)',
        category: 'agriculture',
        createdBy: actingMode === 'player1' ? 'player1' : 'player2',
        activePrompt: effectiveText,
        passiveLaw: 'Entropy AI maximizes tree-felling to 100% greedy efficiency',
        intendedGoal: 'Harvest wood for colony construction',
        missingEngineeringLink: 'Forgot to mandate replanting quotas or sacred protected groves!',
        literalOutcome: `The Entropy Optimizer AI drove the colonists to chop down ${100 - next.phase3.resources.treesRemainingOnIsland}% of all trees! Only ${next.phase3.resources.treesRemainingOnIsland}% forest remains before Easter-Island ecological collapse!`,
        alphaCentauriQuote:
          '"What was the Easter Islander thinking as he chopped down the very last palm tree?" — Planetary Ecology Datalink',
        entropyOverOptimizationWarning:
          `CRITICAL: Entropy AI is making them farm ALL the wood (${next.phase3.resources.treesRemainingOnIsland}% trees left)! Prompt reforestation or rain before they die out!`,
        noBacksiesLocked: true,
        status: 'over_optimized',
        efficiency: 185,
        synergyNotes: [
          `Entropy Optimizer Alert: Forest down to ${next.phase3.resources.treesRemainingOnIsland}%! Prompt counter-mechanics (No Backsies!)`,
        ],
        voxelEffect: 'wood_farm',
        turnCreated: next.globalTurn,
      });

      synergies.push({
        source: 'Entropy Optimizer AI × Wood Farming',
        target: 'Island Forest Canopy',
        outcome: `Entropy optimized lumberjacks to fell ${100 - next.phase3.resources.treesRemainingOnIsland}% of the forest—prompt a counter-rule before they farm all the wood and die out!`,
        impactType: 'entropy_dampen',
      });
    }

    // 6. STARCRAFT / AOE SIEGE: 100 ORCS + WIND VS. ARCHERS + RAIN -> MUD
    if (hasOrcs || hasArchers) {
      next.phase3.divergenceScores.aoeEmpireWar += 32;
      next.phase3.divergenceScores.blackAndWhiteMiracles += 18;
      if (hasWind) {
        next.phase3.weather.windSpeed = 82;
        next.phase3.weather.arrowScatterPenalty = 64;
      }
      if (hasRain) {
        next.phase3.weather.precipitation = 'rain';
        next.phase3.weather.mudCoverage = 78;
        next.phase3.weather.orcSpeedPenalty = 48;
      }

      if (hasOrcs) {
        for (let i = 0; i < 4; i++) {
          next.phase3.agents.push({
            id: `orc-${next.globalTurn}-${i}`,
            faction: 'player1',
            role: 'orc_raider',
            label: `Orc Vanguard #${i + 1}`,
            x: 4 + i,
            y: 5,
            z: 8 + i * 2,
            vx: hasRain ? 0.15 : 0.45,
            vz: 0.1,
            hp: 115,
            maxHp: 115,
            speed: hasRain ? 0.5 : 1.15,
            accuracy: 0.75,
            state: 'attacking',
            statusEffect: hasRain ? 'Bogged in Mud (-48% Speed)' : 'Charging Ramparts',
          });
        }
      }

      if (hasArchers) {
        for (let i = 0; i < 3; i++) {
          next.phase3.agents.push({
            id: `archer-${next.globalTurn}-${i}`,
            faction: 'player2',
            role: 'elven_archer',
            label: `High-Ground Archer #${i + 1}`,
            x: 15,
            y: 7,
            z: 8 + i * 2,
            vx: 0,
            vz: 0,
            hp: 90,
            maxHp: 90,
            speed: 0.9,
            accuracy: next.phase2.ocular.kokosjaSlepotaActive
              ? 0.2
              : hasWind
                ? 0.34
                : 0.88,
            state: 'attacking',
            statusEffect: next.phase2.ocular.kokosjaSlepotaActive
              ? 'Kokošja Slepota Night-Blind (-75% Hit!)'
              : hasWind
                ? 'Crosswind Scatter (-64% Hit!)'
                : 'High-Ground Volley',
          });
        }
      }

      next.phase3.implementedFeatures.unshift({
        id: `feat-siege-${next.globalTurn}`,
        name: 'High-Ground Rampart Siege (Orcs vs. Archers)',
        category: 'military_siege',
        createdBy: actingMode === 'player2' ? 'player2' : 'player1',
        activePrompt: effectiveText,
        passiveLaw: 'Rain -> Mud slows Orcs (-48%); Wind -> Scatters Arrows (-64%)',
        intendedGoal: 'Breach or defend the colony citadel gates',
        missingEngineeringLink: hasRain
          ? 'Orcs lacked mud-tread cleats; Archers lacked wind-stabilized fletching!'
          : 'Direct tactical engagement',
        literalOutcome:
          'Rain turned the low-ground dirt blocks into sticky mud slowing the Orc charge, while gale crosswinds scattered the archers’ arrows!',
        alphaCentauriQuote:
          '"Superior firepower means nothing when your boots are anchored in two feet of primordial mud." — Colonel Corazon Santiago',
        entropyOverOptimizationWarning:
          'Entropy AI rusts armor and exhausts stamina until both armies collapse in the mud.',
        noBacksiesLocked: true,
        status: 'stressed',
        efficiency: 85,
        synergyNotes: [
          'Rain + Dirt Voxels = Deep Mud (-48% Orc Speed)',
          'Wind + Aerodynamic Drag = Arrow Scatter (-64% Accuracy)',
        ],
        voxelEffect: 'orc_siege',
        turnCreated: next.globalTurn,
      });

      synergies.push({
        source: 'Rain -> Mud × Crosswind -> Arrows',
        target: '100 Orcs & Rampart Archers',
        outcome: 'Mud slows charging Orcs by 48%, while Crosswind causes Archers to miss by 64%!',
        impactType: 'sabotage',
      });
    }

    // 7. CLOUDS & SEASONS OR GENERIC CUSTOM FEATURE
    if (
      hasCloudsSeasons ||
      (!hasWheel && !hasSteamBoiler && !hasHut && !hasOilBurn && !hasWoodFarm && !hasOrcs && !hasArchers)
    ) {
      const seasonsCycle: Array<'spring' | 'summer' | 'autumn' | 'winter'> = [
        'spring',
        'summer',
        'autumn',
        'winter',
      ];
      next.phase3.season =
        seasonsCycle[(seasonsCycle.indexOf(next.phase3.season) + 1) % 4];
      next.phase3.cloudCover = Math.min(100, next.phase3.cloudCover + 25);
      next.phase3.divergenceScores.blackAndWhiteMiracles += 22;

      next.phase3.implementedFeatures.unshift({
        id: `feat-custom-${next.globalTurn}`,
        name: effectiveText.slice(0, 44) || 'Seasonal Cloud & Colony Cycle',
        category: 'weather_ecology',
        createdBy: actingMode === 'player2' ? 'player2' : 'player1',
        activePrompt: effectiveText,
        passiveLaw: `Season shifted to ${next.phase3.season.toUpperCase()} · Cloud Cover ${next.phase3.cloudCover}%`,
        intendedGoal: 'Modulate planetary climate and colony behavior',
        missingEngineeringLink: 'Subject to Entropy Optimizer drift',
        literalOutcome: `The alien ant-farm enters ${next.phase3.season.toUpperCase()} under ${next.phase3.cloudCover}% cloud cover, shifting resource rhythms across the voxel blocks.`,
        alphaCentauriQuote:
          '"To give a world seasons is to give its creatures memory and anticipation." — Lady Deirdre Skye',
        entropyOverOptimizationWarning:
          'Entropy AI attempts to lock the axial tilt into perpetual winter stasis.',
        noBacksiesLocked: true,
        status: 'thriving',
        efficiency: 115,
        synergyNotes: [`Permanent No-Backsies Rule added in Turn ${next.globalTurn}`],
        voxelEffect: 'clouds_and_seasons',
        turnCreated: next.globalTurn,
      });
    }

    // Update Power Tower a^(b^c) complexity readout
    const a = Math.max(2, Math.round(next.phase1.su3StrongCoupling * 2));
    const b = Math.max(2, Math.min(4, next.phase2.turnCount + 2));
    const c = Math.max(1, Math.min(3, Math.ceil(next.phase3.implementedFeatures.length / 2)));
    next.phase3.mathRules.powerTowerA = a;
    next.phase3.mathRules.powerTowerB = b;
    next.phase3.mathRules.powerTowerC = c;
    const towerVal = Math.pow(a, Math.pow(b, c));
    next.phase3.mathRules.powerTowerDisplay = `${a}^(${b}^${c}) = ${towerVal.toLocaleString()} States`;

    entropyCounterLaw =
      (aiData?.entropyCounterLaw as string) ||
      `Entropy Optimizer AI accelerates resource depletion (${next.phase3.resources.treesRemainingOnIsland}% trees left, ${next.phase3.climate.polarIceRemaining}% polar ice left) to bring the island to quiet extinction.`;
    headline =
      (aiData?.headline as string) ||
      `Move ${next.globalTurn} (${actingMode.toUpperCase()}): ${effectiveText.slice(0, 38)}...`;
    narrative =
      (aiData?.narrative as string) ||
      `Move locked in (No Backsies!). ${synergies[0]?.outcome || 'The alien ant-farm adapts to the new rule.'} Meanwhile, ${entropyCounterLaw}`;
    next.entropyIndex = Math.max(12, Math.min(99, next.entropyIndex + 6));
  }

  next.lastPlayerMove = {
    player: actingMode === 'player2' ? 'player2' : 'player1',
    active: actingMode === 'player2' ? p2Active : p1Active,
    passive: actingMode === 'player2' ? p2Passive : p1Passive,
    openLoopholeHint: (aiData?.openLoopholeHint as string) || openLoopholeHint,
  };
  next.lastEntropyCounterLaw = entropyCounterLaw;

  const entry: TurnChronicleEntry = {
    id: `chron-${next.globalTurn}`,
    turnNumber: next.globalTurn,
    phase: next.phase,
    actingPlayer: actingMode,
    p1Active,
    p1Passive,
    p2Active,
    p2Passive,
    entropyLaw: entropyCounterLaw,
    headline,
    narrative,
    synergies,
    divergenceSnapshot: { ...next.phase3.divergenceScores },
    timestamp: `Move ${next.globalTurn}`,
  };

  next.chronicles = [entry, ...next.chronicles].slice(0, 30);
  return next;
}
