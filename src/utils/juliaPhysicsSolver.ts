import {
  CandidateCelestialBody,
  JuliaAtmosphericPhysics,
  Phase1GenesisState,
  Phase2SolarAndChemistryState,
} from '../types/cosmos';

/**
 * JuliaPhysics / SciML-inspired Astrophysical N-Body & ClimaAtmos Solver
 * Computes stellar luminosity L = M^3.5, Goldilocks Habitable Zone boundaries,
 * hydrostatic scale height H = R*T / (mu*g), radiative greenhouse optical depth tau,
 * Clausius-Clapeyron boiling point, and Archimedes buoyancy for Sky Whales.
 */

export function computeGoldilocksBoundsAU(sunMassSolar: number): {
  luminositySolar: number;
  innerAU: number;
  outerAU: number;
  optimalAU: number;
} {
  const m = Math.max(0.25, Math.min(3.0, sunMassSolar));
  // Main-sequence mass-luminosity relation: L / L_sun ~ (M / M_sun)^3.5
  const luminositySolar = Math.pow(m, 3.5);
  const sqrtL = Math.sqrt(luminositySolar);
  // Scaled so that around a 1.0 M_sun Yellow Sun, Orbit #4 (16.5 scene units = 1.0 AU equivalent) sits dead-center in the Goldilocks Zone!
  const optimalAU = 16.5 * sqrtL;
  const innerAU = 13.8 * sqrtL;
  const outerAU = 19.5 * sqrtL;
  return {
    luminositySolar: +luminositySolar.toFixed(2),
    innerAU: +innerAU.toFixed(2),
    outerAU: +outerAU.toFixed(2),
    optimalAU: +optimalAU.toFixed(2),
  };
}

export function updateCandidateWorldsForSun(
  worlds: CandidateCelestialBody[],
  sunMassSolar: number
): CandidateCelestialBody[] {
  const { innerAU, outerAU } = computeGoldilocksBoundsAU(sunMassSolar);
  return worlds.map((w) => ({
    ...w,
    inGoldilocksZone: w.orbitRadiusAU >= innerAU && w.orbitRadiusAU <= outerAU,
  }));
}

export function solveJuliaAtmosphericPhysics(
  p1: Phase1GenesisState,
  p2: Phase2SolarAndChemistryState,
  worlds: CandidateCelestialBody[],
  fossilFuelBurned: number = 0
): JuliaAtmosphericPhysics {
  const world =
    worlds.find((w) => w.id === p2.selectedWorldType) || worlds[3] || worlds[0];
  const { luminositySolar } = computeGoldilocksBoundsAU(p1.sunMassSolar);

  // 1. Surface gravity g (m/s^2) and escape velocity (km/s)
  const effectiveG = Math.max(0.25, p2.densityG * p1.gravityStrength);
  const surfaceGravityMS2 = +(9.81 * effectiveG).toFixed(2);
  const escapeVelocityKmS = +(11.186 * Math.sqrt(effectiveG * world.baseSize)).toFixed(2);

  // 2. Equilibrium Blackbody Temperature T_eq (K) at orbital distance r
  // Normalized so 4th planet (r = 16.5) around 1.0 M_sun has T_eq = 255 K (-18 C before greenhouse)
  const rRatio = Math.max(0.35, world.orbitRadiusAU / 16.5);
  const albedo = p2.molecules.h2o > 50 ? 0.3 : 0.22;
  const equilibriumTempK = Math.round(
    278 * Math.pow(luminositySolar, 0.25) * Math.pow(1 - albedo, 0.25) / Math.sqrt(rRatio)
  );

  // 3. Hydrostatic Surface Pressure P_0 (bar)
  const volatileInventory =
    (p2.molecules.co2Sulfur * 1.4 +
      p2.molecules.h2o * 0.45 +
      p2.molecules.oxygen * 0.35 +
      p2.molecules.alcohol * 0.5 +
      fossilFuelBurned * 0.9) /
    100;
  const bacteriaSink = p2.microbes.carbonSulfurBacteria ? 0.45 : 1.85;
  const rawPressure = Math.pow(effectiveG, 1.35) * volatileInventory * bacteriaSink;
  const surfacePressureBar = +Math.max(0.04, Math.min(92.0, rawPressure)).toFixed(2);

  // 4. Radiative Transfer Greenhouse Optical Depth (tau)
  const co2Greenhouse =
    (p2.molecules.co2Sulfur / 100) * (p2.microbes.carbonSulfurBacteria ? 0.6 : 4.2);
  const h2oVaporFeedback = (p2.molecules.h2o / 100) * 0.55;
  const fossilFuelTau = (fossilFuelBurned / 100) * 2.8;
  const opticalDepthTau = +(0.25 + co2Greenhouse + h2oVaporFeedback + fossilFuelTau).toFixed(2);

  // Gray-atmosphere Eddington approximation: T_surf = T_eq * (1 + 0.75 * tau)^0.25
  const surfaceTempK = equilibriumTempK * Math.pow(1 + 0.75 * opticalDepthTau, 0.25);
  const surfaceTempC = +(surfaceTempK - 273.15).toFixed(1);

  // 5. Ideal Gas Law & Hydrostatic Scale Height: rho = P / (R_spec * T), H = R_spec * T / g
  // Mean molar mass mu (kg/mol): higher if CO2/Sulfur or Alcohol dominates
  const meanMolarMass =
    p2.molecules.co2Sulfur >= 55 && !p2.microbes.carbonSulfurBacteria ? 0.044 : 0.029;
  const rSpecific = 8.314 / meanMolarMass; // J/(kg*K)
  const airDensityKgM3 = +(
    (surfacePressureBar * 100000) /
    (rSpecific * Math.max(120, surfaceTempK))
  ).toFixed(2);
  const scaleHeightKm = +(
    (rSpecific * Math.max(120, surfaceTempK)) /
    (surfaceGravityMS2 * 1000)
  ).toFixed(1);

  // 6. Clausius-Clapeyron Water Boiling Point at pressure P_0 (bar)
  // 1 / T_boil = 1 / 373.15 - (R / dH_vap) * ln(P_0 / 1.013)
  const invTBoil =
    1 / 373.15 - (8.314 / 40660) * Math.log(Math.max(0.01, surfacePressureBar) / 1.013);
  const waterBoilingPointC = +(1 / invTBoil - 273.15).toFixed(1);

  // 7. Archimedes Aero-Buoyancy Index for Sky Whales (a la Hitchhiker's Guide!)
  // Sky Whales evolve when air density is thick enough (or planet density/volatiles high) and not boiling acid inferno
  const archimedesBuoyancyIndex = +(
    (airDensityKgM3 / 1.45) *
    (p2.molecules.h2o >= 25 ? 1.15 : 0.7)
  ).toFixed(2);
  const skyWhalesPresent =
    archimedesBuoyancyIndex >= 1.15 &&
    p2.densityG >= 1.15 &&
    surfaceTempC < 160 &&
    !p2.greatFireActive;

  const aerodynamicDragMultiplier = +Math.min(
    3.5,
    Math.max(0.25, airDensityKgM3 / 1.225)
  ).toFixed(2);

  return {
    surfaceGravityMS2,
    escapeVelocityKmS,
    surfacePressureBar,
    airDensityKgM3,
    scaleHeightKm,
    opticalDepthTau,
    equilibriumTempK,
    surfaceTempC,
    waterBoilingPointC,
    archimedesBuoyancyIndex,
    skyWhalesPresent,
    aerodynamicDragMultiplier,
  };
}

export function generateJuliaPhysicsSnippet(
  p1: Phase1GenesisState,
  p2: Phase2SolarAndChemistryState,
  fossilFuelBurned: number
): string {
  const atm = p2.atmosphericPhysics;
  return `# JuliaSciML / ClimaAtmos.jl & NBodySimulator.jl Live World Kernel
using DifferentialEquations, Unitful

# Phase I: SU(3)_C × SU(2)_L × U(1)_Y & Stellar Nucleosynthesis
const M_sun = ${p1.sunMassSolar.toFixed(2)}u"Msun"       # Luminosity L = ${p1.sunLuminositySolar.toFixed(2)} L_sun
const alpha_s_SU3 = ${p1.su3StrongCoupling.toFixed(2)}  # Strong color confinement coupling
const G_eff = ${p1.gravityStrength.toFixed(2)} * G_newton

# Phase II: Symplectic Velocity-Verlet N-Body & Hydrostatic Atmosphere
# dP/dz = -rho * g  |  T_surf = T_eq * (1 + 3/4 * tau)^(1/4)
g_surf = ${atm.surfaceGravityMS2}u"m/s^2"
P_0    = ${atm.surfacePressureBar}u"bar"
rho_0  = ${atm.airDensityKgM3}u"kg/m^3"
H_scale = ${atm.scaleHeightKm}u"km"
tau_IR  = ${atm.opticalDepthTau}  # Fossil Fuel Burn = ${fossilFuelBurned}%
T_surf  = ${atm.surfaceTempC}u"°C" (T_boil_H2O = ${atm.waterBoilingPointC}u"°C")
sky_whale_buoyancy = ${atm.archimedesBuoyancyIndex} # Sky Whales: ${atm.skyWhalesPresent}`;
}
