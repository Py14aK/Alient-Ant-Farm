export type CosmicPhase = 1 | 2 | 3;

export type TimeArrowMode = 'forward' | 'reversible_echo' | 'dilated';

export type CelestialWorldType =
  | 'scorched_inner'
  | 'martian'
  | 'venusian_rocky'
  | 'goldilocks_earth'
  | 'failed_star_moon'
  | 'comet';

export type EmergentPlanetArchetype =
  | 'primordial_cradle'
  | 'goldilocks_sky_whale_eden'
  | 'venusian_greenhouse'
  | 'super_dense_crusher'
  | 'purple_retinal_world'
  | 'great_fire_inferno'
  | 'alcohol_ferment_sea'
  | 'temperate_fungal_garden'
  | 'drowned_greenhouse_deluge';

export type FeatureCategory =
  | 'agriculture'
  | 'traffic_civic'
  | 'weather_ecology'
  | 'military_siege'
  | 'subterranean'
  | 'anthropology_tech';

export interface Phase1GenesisState {
  turnCount: number;
  timeArrow: TimeArrowMode;
  inflationFieldPhi: number; // 0.5 to 3.0 (Cosmic Inflation expansion factor)
  cpAsymmetry: number; // 0.1 to 1.0 (Matter-Antimatter Baryogenesis asymmetry)
  su3StrongCoupling: number; // 0.5 to 2.0 (SU(3)_C QCD quark confinement & fusion rate)
  gravityStrength: number; // 0.4 to 2.8 (G multiplier)
  electricityStrength: number; // 0.4 to 2.5 (U(1) Electromagnetism)
  molecularCloudDensity: number; // 0 to 100
  sunIgnited: boolean;
  sunMassSolar: number; // 0.35 to 2.4 M_sun (1.0 = Yellow Sun where 4th planet is Goldilocks!)
  sunLuminositySolar: number; // L = M^3.5
  starSpectralClass: string;
  starColorHex: string;
  synthesizedElements: {
    hydrogen: number;
    carbon: number;
    oxygen: number;
    sulfur: number;
    iron: number;
    silicates: number;
  };
}

export interface CandidateCelestialBody {
  id: CelestialWorldType;
  orbitNumber: number; // 1st, 2nd, 3rd, 4th (Goldilocks on Yellow Sun!), 5th, 6th
  name: string;
  subtitle: string;
  orbitRadiusAU: number; // Scene units scaled from AU
  eccentricity: number;
  angle: number;
  massEarth: number;
  baseSize: number;
  baseColorHex: string;
  accentColorHex: string;
  hasRingOrMoon: boolean;
  defaultDensityG: number;
  defaultAcidity: number;
  defaultH2O: number;
  inGoldilocksZone: boolean;
  description: string;
}

export interface JuliaAtmosphericPhysics {
  surfaceGravityMS2: number; // g = 9.81 * densityG
  escapeVelocityKmS: number;
  surfacePressureBar: number; // P_0 in bar
  airDensityKgM3: number; // rho_atm in kg/m^3
  scaleHeightKm: number; // H = R*T / (mu*g)
  opticalDepthTau: number; // Greenhouse optical depth tau
  equilibriumTempK: number; // T_eq from Sun luminosity & orbital distance
  surfaceTempC: number; // T_surf = T_eq * (1 + 0.75*tau)^0.25 - 273.15
  waterBoilingPointC: number; // Clausius-Clapeyron boiling point at P_0
  archimedesBuoyancyIndex: number; // Supports Sky Whales when >= 1.0
  skyWhalesPresent: boolean;
  aerodynamicDragMultiplier: number;
}

export interface Phase2SolarAndChemistryState {
  turnCount: number;
  selectedWorldType: CelestialWorldType;
  worldLockedInStone: boolean;
  densityG: number; // 0.3 to 3.0 (>1.75 = Too Dense!)
  molecules: {
    h2o: number; // 0 to 100
    alcohol: number; // 0 to 100
    acidity: number; // 0 to 100
    co2Sulfur: number; // 0 to 100
    oxygen: number; // 0 to 100
    carbonComplexity: 'simple_gas' | 'organic_chains' | 'woody_lignin';
  };
  genetics: {
    rnaPresent: boolean;
    dnaPresent: boolean;
    mutationRate: number; // 0 to 100
  };
  microbes: {
    carbonSulfurBacteria: boolean;
    retinalPurpleMicrobes: boolean;
    woodDecomposerFungi: boolean;
  };
  deadWoodStrata: number; // 0 to 100 buildup of un-rotted carbon/oil seams
  greatFireActive: boolean;
  atmosphericPhysics: JuliaAtmosphericPhysics;
  emergentArchetype: EmergentPlanetArchetype;
  diagnosticAlerts: string[];
}

export interface MainAlienSpecies {
  name: string;
  morphology: string;
  diet: string;
  preferredStrata: 'surface' | 'subterranean' | 'amphibious' | 'aerostat_sky';
  primaryColorHex: string;
  secondaryColorHex: string;
  speedMultiplier: number;
  armorRating: number;
  traits: string[];
  loreSummary: string;
}

export interface ImplementedColonyFeature {
  id: string;
  name: string;
  category: FeatureCategory;
  createdBy: 'player1' | 'player2' | 'entropy';
  activePrompt: string;
  passiveLaw: string;
  intendedGoal: string;
  missingEngineeringLink: string;
  literalOutcome: string;
  alphaCentauriQuote: string;
  status: 'thriving' | 'stressed' | 'sabotaged' | 'loophole_quirk' | 'equilibrium';
  efficiency: number; // 0 to 200%
  synergyNotes: string[];
  voxelEffect:
    | 'wood_farm'
    | 'transit_road'
    | 'square_wheel_cart'
    | 'doner_steam_rotisserie'
    | 'mud_leaf_hut'
    | 'castle_wall'
    | 'watchtower'
    | 'underground_warren'
    | 'rain_storm'
    | 'drought_heat'
    | 'mud_bog'
    | 'orc_siege'
    | 'archer_garrison'
    | 'aqueduct'
    | 'fungal_reactor'
    | 'oil_derrick_warming'
    | 'clouds_and_seasons'
    | 'sky_whale_pod'
    | 'entropy_monolith';
  turnCreated: number;
}

export type AgentRole =
  | 'alien_colonist'
  | 'lumberjack'
  | 'commuter_cart'
  | 'square_wheel_wagon'
  | 'doner_automaton'
  | 'sky_whale'
  | 'tunnel_digger'
  | 'orc_raider'
  | 'elven_archer'
  | 'siege_construct'
  | 'entropy_wraith';

export interface AutonomousAgent {
  id: string;
  faction: 'player1' | 'player2' | 'entropy' | 'colony';
  role: AgentRole;
  label: string;
  x: number; // Grid 0..19
  y: number; // Height/Strata 0..9
  z: number; // Grid 0..19
  vx: number;
  vz: number;
  hp: number;
  maxHp: number;
  speed: number;
  accuracy: number; // 0..1
  state:
    | 'working'
    | 'moving'
    | 'attacking'
    | 'commuting'
    | 'burrowing'
    | 'soaring'
    | 'roasting_doner'
    | 'drowning'
    | 'dormant';
  statusEffect?: string;
}

export interface CausalSynergyItem {
  source: string;
  target: string;
  outcome: string;
  impactType:
    | 'synergy'
    | 'sabotage'
    | 'loophole_twist'
    | 'planetary_constraint'
    | 'climate_collapse'
    | 'entropy_dampen';
}

export interface TurnChronicleEntry {
  id: string;
  turnNumber: number;
  phase: CosmicPhase;
  p1Active: string;
  p1Passive: string;
  p2Active: string;
  p2Passive: string;
  entropyLaw: string;
  headline: string;
  narrative: string;
  synergies: CausalSynergyItem[];
  divergenceSnapshot: {
    alphaCentauriXenobio: number;
    aoeEmpireWar: number;
    rimWorldColony: number;
    blackAndWhiteMiracles: number;
  };
  timestamp: string;
}

export interface Phase3SandboxState {
  turnCount: number;
  eraTitle: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  cloudCover: number; // 0 to 100
  agencyLevel: number; // 0 to 100 (Autonomous alien agency & tool comprehension)
  climate: {
    fossilFuelBurned: number; // 0 to 100%
    globalWarmingDeltaC: number; // +0.0 to +18.0 C
    polarIceRemaining: number; // 100% down to 0%
    seaLevelY: number; // 1.0 (normal) up to 4.5 (drowns coastal huts & units!)
    drownedUnitsCount: number;
  };
  divergenceScores: {
    alphaCentauriXenobio: number; // Baseline: 25
    aoeEmpireWar: number; // Baseline: 25
    rimWorldColony: number; // Baseline: 25
    blackAndWhiteMiracles: number; // Baseline: 25
  };
  resources: {
    timber: number;
    stoneOre: number;
    biomass: number;
    oilBarrels: number;
    donerKebabs: number;
    trafficFlow: number; // 0 to 100%
    colonyPopulation: number;
  };
  weather: {
    windSpeed: number; // 0 to 100
    windDirectionDeg: number;
    precipitation: 'none' | 'rain' | 'acid_rain' | 'drought' | 'snow_blizzard';
    mudCoverage: number; // 0 to 100
    arrowScatterPenalty: number; // 0 to 90%
    orcSpeedPenalty: number; // 0 to 80%
  };
  implementedFeatures: ImplementedColonyFeature[];
  agents: AutonomousAgent[];
  cutawaySliceZ: number; // 1 to 24
  cutawaySliceY: number; // 1 to 10
}

export interface OracleChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  wolframEquations?: string[];
  sources?: Array<{ title: string; uri: string }>;
  timestamp: string;
}

export interface CosmosGameState {
  phase: CosmicPhase;
  globalTurn: number;
  entropyIndex: number; // 0 to 100
  lastEntropyCounterLaw: string;
  phaseTransitionBanner: {
    fromPhase: CosmicPhase;
    toPhase: CosmicPhase;
    title: string;
    summary: string;
  } | null;
  phase1: Phase1GenesisState;
  phase2: Phase2SolarAndChemistryState;
  candidateWorlds: CandidateCelestialBody[];
  mainAlien: MainAlienSpecies;
  phase3: Phase3SandboxState;
  chronicles: TurnChronicleEntry[];
  oracleHistory: OracleChatMessage[];
}
