import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CelestialWorldType,
  CosmosGameState,
} from '../types/cosmos';

interface CosmicViewport3DProps {
  gameState: CosmosGameState;
  onSelectWorld: (worldId: CelestialWorldType) => void;
  onInspectEntity: (info: { title: string; subtitle: string; details: string } | null) => void;
}

// Pre-allocated math helpers at module scope to prevent GC in the render loop
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();

function createProceduralPlanetGroup(
  bodyId: CelestialWorldType,
  baseColorHex: string,
  accentColorHex: string,
  radius: number,
  hasRingOrMoon: boolean
): THREE.Group {
  const group = new THREE.Group();
  group.name = `planet-${bodyId}`;
  group.userData = { bodyId };

  // 1. Primary core sphere
  const coreGeo = new THREE.SphereGeometry(radius, 28, 28);
  const coreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(baseColorHex),
    roughness: 0.55,
    metalness: 0.15,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.castShadow = true;
  coreMesh.receiveShadow = true;
  coreMesh.userData = { bodyId };
  group.add(coreMesh);

  // 2. Secondary continent / band relief bands
  const bandGeo = new THREE.TorusGeometry(radius * 0.78, radius * 0.24, 12, 28);
  const bandMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColorHex),
    roughness: 0.8,
    metalness: 0.05,
  });
  const bandMesh = new THREE.Mesh(bandGeo, bandMat);
  bandMesh.rotation.x = Math.PI / 2.3;
  bandMesh.scale.set(1, 1, 0.65);
  bandMesh.userData = { bodyId };
  group.add(bandMesh);

  // 3. Polar cap or volcanic crown
  const capGeo = new THREE.SphereGeometry(
    radius * 0.68,
    18,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.35
  );
  const capMat = new THREE.MeshStandardMaterial({
    color: bodyId === 'martian' || bodyId === 'comet' ? 0xe0f2fe : 0xf59e0b,
    roughness: 0.3,
    metalness: 0.25,
  });
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.position.y = radius * 0.38;
  capMesh.userData = { bodyId };
  group.add(capMesh);

  // 4. Atmospheric outer shell
  const atmoGeo = new THREE.SphereGeometry(radius * 1.12, 24, 24);
  const atmoMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(accentColorHex),
    transparent: true,
    opacity: 0.22,
    roughness: 0.2,
    metalness: 0.1,
    depthWrite: false,
  });
  const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
  atmoMesh.name = 'atmo-shell';
  atmoMesh.userData = { bodyId };
  group.add(atmoMesh);

  // 5. Optional planetary ring or orbiting exomoon (for Rocky or Failed Star Moon system)
  if (hasRingOrMoon) {
    const ringGeo = new THREE.RingGeometry(radius * 1.45, radius * 2.1, 36);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColorHex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      roughness: 0.4,
      metalness: 0.3,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.5;
    ringMesh.userData = { bodyId };
    group.add(ringMesh);

    if (bodyId === 'failed_star_moon') {
      const moonGeo = new THREE.SphereGeometry(radius * 0.34, 16, 16);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x3b0764,
        roughness: 0.5,
      });
      const moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.position.set(radius * 2.4, 0.2, 0);
      moonMesh.name = 'habitable-exomoon';
      moonMesh.userData = { bodyId };
      group.add(moonMesh);
    }
  }

  // 6. Comet coma tail if comet
  if (bodyId === 'comet') {
    const tailGeo = new THREE.ConeGeometry(radius * 0.75, radius * 3.8, 16, 1, true);
    const tailMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    tailMesh.rotation.z = -Math.PI / 2;
    tailMesh.position.x = radius * 2.1;
    group.add(tailMesh);
  }

  return group;
}

function createProceduralAgentMesh(
  role: string,
  factionColor: number,
  accentColor: number
): THREE.Group {
  const group = new THREE.Group();

  if (role === 'commuter_cart') {
    // 4-part SimCity transit pod
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.26, 0.38),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7, roughness: 0.2 })
    );
    hull.position.y = 0.2;
    group.add(hull);

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.18, 0.32),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, metalness: 0.9, roughness: 0.1 })
    );
    canopy.position.set(0.05, 0.36, 0);
    group.add(canopy);

    const headlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    headlight.rotation.x = Math.PI / 2;
    headlight.position.set(0.33, 0.2, 0);
    group.add(headlight);
    return group;
  }

  // 4-part autonomous unit (Torso, Head/Crest, Shield/Tool, Base)
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.45, 10),
    new THREE.MeshStandardMaterial({ color: factionColor, roughness: 0.5, metalness: 0.3 })
  );
  torso.position.y = 0.225;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 12, 12),
    new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.35, metalness: 0.4 })
  );
  head.position.y = 0.54;
  group.add(head);

  const crest = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.24, 6),
    new THREE.MeshStandardMaterial({
      color: role === 'orc_raider' ? 0xef4444 : role === 'elven_archer' ? 0x06b6d4 : 0xf59e0b,
      roughness: 0.25,
      metalness: 0.7,
    })
  );
  crest.position.set(0, 0.72, 0);
  group.add(crest);

  const weapon = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.36, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
  );
  weapon.position.set(0.22, 0.36, 0.1);
  weapon.rotation.z = -0.35;
  group.add(weapon);

  return group;
}

export const CosmicViewport3D: React.FC<CosmicViewport3DProps> = ({
  gameState,
  onSelectWorld,
  onInspectEntity,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<CosmosGameState>(gameState);
  const selectWorldRef = useRef(onSelectWorld);
  const inspectRef = useRef(onInspectEntity);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    selectWorldRef.current = onSelectWorld;
    inspectRef.current = onInspectEntity;
  }, [onSelectWorld, onInspectEntity]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Software WebGL detection per Three.js skill directive
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090b10);
    scene.fog = new THREE.FogExp2(0x090b10, 0.014);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      250
    );
    camera.position.set(22, 18, 26);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e1b4b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    keyLight.position.set(18, 28, 16);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-20, 12, -18);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxDistance = 68;
    controls.minDistance = 7;
    controls.target.set(0, 0, 0);

    // =========================================================================
    // PHASE 1 GROUP: Big Bang Singularity, Molecular Cloud & Protostar Ignition
    // =========================================================================
    const phase1Group = new THREE.Group();
    scene.add(phase1Group);

    const cloudCount = 1200;
    const cloudGeo = new THREE.BufferGeometry();
    const cloudPos = new Float32Array(cloudCount * 3);
    const cloudCol = new Float32Array(cloudCount * 3);
    for (let i = 0; i < cloudCount; i++) {
      const r = 2.5 + Math.pow(Math.random(), 0.7) * 20;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.5 * (1 - r / 26);
      cloudPos[i * 3] = Math.cos(theta) * r;
      cloudPos[i * 3 + 1] = y;
      cloudPos[i * 3 + 2] = Math.sin(theta) * r;

      _color.setHSL(0.08 + (i % 5) * 0.12, 0.85, 0.6);
      cloudCol[i * 3] = _color.r;
      cloudCol[i * 3 + 1] = _color.g;
      cloudCol[i * 3 + 2] = _color.b;
    }
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
    cloudGeo.setAttribute('color', new THREE.BufferAttribute(cloudCol, 3));
    const cloudMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const molecularCloudPoints = new THREE.Points(cloudGeo, cloudMat);
    phase1Group.add(molecularCloudPoints);

    // Protostar core (multi-part group)
    const protoStarGroup = new THREE.Group();
    const starCore = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 1.5,
        roughness: 0.2,
      })
    );
    protoStarGroup.add(starCore);

    const coronaRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(3.3, 0.12, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.65 })
    );
    protoStarGroup.add(coronaRing1);

    const coronaRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.08, 12, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
    );
    coronaRing2.rotation.x = Math.PI / 3;
    protoStarGroup.add(coronaRing2);
    phase1Group.add(protoStarGroup);

    // =========================================================================
    // PHASE 2 GROUP: 3D Solar System Simulator & Planetary Alchemy Globe
    // =========================================================================
    const phase2Group = new THREE.Group();
    scene.add(phase2Group);

    // Central Sun in Phase 2
    const solarSun = new THREE.Mesh(
      new THREE.SphereGeometry(2.8, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.8,
        roughness: 0.15,
      })
    );
    phase2Group.add(solarSun);

    // Candidate planets + orbital rings
    const planetMeshesMap = new Map<CelestialWorldType, THREE.Group>();
    const clickablePlanets: THREE.Object3D[] = [];

    stateRef.current.candidateWorlds.forEach((world) => {
      // Orbit track line
      const orbitCurve = new THREE.EllipseCurve(
        0,
        0,
        world.orbitRadius,
        world.orbitRadius * (1 - world.eccentricity * 0.4),
        0,
        Math.PI * 2,
        false,
        0
      );
      const pts = orbitCurve.getPoints(72).map((p) => new THREE.Vector3(p.x, 0, p.y));
      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({
          color: 0x334155,
          transparent: true,
          opacity: 0.65,
        })
      );
      orbitLine.name = `orbit-${world.id}`;
      phase2Group.add(orbitLine);

      const pGroup = createProceduralPlanetGroup(
        world.id,
        world.baseColorHex,
        world.accentColorHex,
        world.baseSize,
        world.hasRingOrMoon
      );
      phase2Group.add(pGroup);
      planetMeshesMap.set(world.id, pGroup);
      clickablePlanets.push(pGroup);
    });

    // Selection beacon ring for currently selected world in Phase 2
    const selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.45, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
      })
    );
    selectionRing.rotation.x = Math.PI / 2;
    phase2Group.add(selectionRing);

    // =========================================================================
    // PHASE 3 GROUP: 24x24x10 Isometric 3D Voxel Ant-Farm + Autonomous Agents
    // =========================================================================
    const phase3Group = new THREE.Group();
    scene.add(phase3Group);

    const GRID_X = 20;
    const GRID_Z = 20;
    const GRID_Y = 8;
    const maxVoxels = GRID_X * GRID_Z * GRID_Y;

    const voxelGeo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    const voxelMat = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.15,
    });
    const voxelInstanced = new THREE.InstancedMesh(voxelGeo, voxelMat, maxVoxels);
    voxelInstanced.castShadow = !isSoftwareGl;
    voxelInstanced.receiveShadow = !isSoftwareGl;
    voxelInstanced.frustumCulled = false;
    phase3Group.add(voxelInstanced);

    // Surface structures container (Wood farms, SimCity roads, Citadel Gates & Towers)
    const structuresGroup = new THREE.Group();
    phase3Group.add(structuresGroup);

    // Autonomous Agents container
    const agentsGroup = new THREE.Group();
    phase3Group.add(agentsGroup);

    // Ballistic arrows & weather particles (Rain / Acid Rain / Great Fire embers)
    const weatherCount = 320;
    const weatherGeo = new THREE.BufferGeometry();
    const weatherPos = new Float32Array(weatherCount * 3);
    for (let i = 0; i < weatherCount; i++) {
      weatherPos[i * 3] = (Math.random() - 0.5) * 22;
      weatherPos[i * 3 + 1] = Math.random() * 14;
      weatherPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    weatherGeo.setAttribute('position', new THREE.BufferAttribute(weatherPos, 3));
    const weatherMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    const weatherPoints = new THREE.Points(weatherGeo, weatherMat);
    phase3Group.add(weatherPoints);

    // Live ballistic arrow meshes for Orcs vs Archers showcase
    const arrowMeshes: THREE.Mesh[] = [];
    const arrowGeo = new THREE.ConeGeometry(0.07, 0.45, 6);
    arrowGeo.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let i = 0; i < 10; i++) {
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.visible = false;
      phase3Group.add(arrow);
      arrowMeshes.push(arrow);
    }

    // Track rebuild signature so we only rebuild instanced voxels when state changes
    let lastVoxelSignature = '';
    let lastPhase: number = 0;

    function rebuildPhase3VoxelWorld(st: CosmosGameState) {
      const p2 = st.phase2;
      const p3 = st.phase3;
      const sliceZ = Math.min(GRID_Z, Math.max(3, Math.round((p3.cutawaySliceZ / 24) * GRID_Z)));
      const sliceY = Math.min(GRID_Y, Math.max(2, Math.round((p3.cutawaySliceY / 10) * GRID_Y)));

      const hasWoodFarm = p3.implementedFeatures.some((f) => f.voxelEffect === 'wood_farm');
      const hasDrought =
        p3.weather.precipitation === 'drought' ||
        p3.implementedFeatures.some((f) => f.voxelEffect === 'drought_heat');
      const hasRoad = p3.implementedFeatures.some((f) => f.voxelEffect === 'transit_road');
      const hasMud = p3.weather.mudCoverage >= 40;
      const isVenus = p2.emergentArchetype === 'venusian_greenhouse';
      const isGreatFire = p2.greatFireActive || p2.emergentArchetype === 'great_fire_inferno';
      const isAlcohol = p2.molecules.alcohol >= 40;
      const isPurple = p2.microbes.retinalPurpleMicrobes;

      // Flatten height slightly if "Too Dense"
      const densityScaleY = p2.densityG >= 1.75 ? 0.68 : p2.densityG <= 0.55 ? 1.22 : 1.0;

      let idx = 0;
      for (let x = 0; x < GRID_X; x++) {
        for (let z = 0; z < sliceZ; z++) {
          // Determine surface height at (x, z)
          const distCenter = Math.hypot(x - GRID_X / 2, z - GRID_Z / 2);
          const surfaceY = Math.min(
            sliceY - 1,
            Math.max(3, Math.floor(4 + Math.sin(x * 0.45) * 0.8 + Math.cos(z * 0.45) * 0.8))
          );

          for (let y = 0; y <= surfaceY; y++) {
            // Carve out subterranean Ant-Farm chambers & tunnels on layers y = 1..3!
            const isMainTunnel =
              (y === 2 && (Math.abs(x - 10) <= 1 || Math.abs(z - 10) <= 1)) ||
              (y === 1 && distCenter < 4.2);

            if (isMainTunnel && z < sliceZ - 1 && x > 1 && x < GRID_X - 2) {
              // Leave hollow tunnel chamber, except glowing fungal floor markers
              if (y === 1 && (x + z) % 2 === 0) {
                _dummy.position.set(
                  x - GRID_X / 2,
                  (y - 3) * densityScaleY,
                  z - GRID_Z / 2
                );
                _dummy.scale.set(0.85, 0.35 * densityScaleY, 0.85);
                _dummy.updateMatrix();
                voxelInstanced.setMatrixAt(idx, _dummy.matrix);
                _color.setHex(0x06b6d4); // Bioluminescent underground fungal farm node
                voxelInstanced.setColorAt(idx, _color);
                idx++;
              }
              continue;
            }

            _dummy.position.set(
              x - GRID_X / 2,
              (y - 3) * densityScaleY,
              z - GRID_Z / 2
            );
            _dummy.scale.set(1, densityScaleY, 1);
            _dummy.updateMatrix();
            voxelInstanced.setMatrixAt(idx, _dummy.matrix);

            // Color voxel by depth and planetary chemistry
            if (y === 0) {
              _color.setHex(0x1e293b); // Bedrock
            } else if (y < surfaceY - 1) {
              // Subterranean coal seams if un-decomposed wood built up in Phase II!
              if (p2.deadWoodStrata >= 45 && (x + y + z) % 5 === 0) {
                _color.setHex(isGreatFire ? 0xef4444 : 0x334155);
              } else if ((x * z + y) % 9 === 0) {
                _color.setHex(0xd97706); // Iron/Ore vein
              } else {
                _color.setHex(0x334155); // Basalt strata
              }
            } else if (y === surfaceY) {
              // Surface biome layer
              if (hasRoad && (z === 10 || z === 11)) {
                _color.setHex(0x475569); // Paved SimCity Highway
              } else if (x <= 3 && z >= 6 && z <= 14) {
                // Liquid basin
                _color.setHex(isVenus ? 0xeab308 : isAlcohol ? 0x2dd4bf : 0x0284c7);
              } else if (hasMud && x >= 4 && x <= 13 && z >= 6 && z <= 13) {
                _color.setHex(0x573b26); // Deep sticky Mud in front of the gates!
              } else if (hasDrought) {
                _color.setHex(0xb45309); // Parched drought earth
              } else if (isGreatFire) {
                _color.setHex((x + z) % 3 === 0 ? 0xdc2626 : 0x451a03);
              } else if (isVenus) {
                _color.setHex(0xca8a04); // Sulfuric crust
              } else if (isPurple) {
                _color.setHex(0x7e22ce); // Purple Retinal Flora
              } else {
                _color.setHex(0x15803d); // Temperate green/fungal soil
              }
            } else {
              _color.setHex(0x475569);
            }

            voxelInstanced.setColorAt(idx, _color);
            idx++;
          }
        }
      }

      voxelInstanced.count = idx;
      voxelInstanced.instanceMatrix.needsUpdate = true;
      if (voxelInstanced.instanceColor) voxelInstanced.instanceColor.needsUpdate = true;
      voxelInstanced.computeBoundingSphere();

      // Rebuild surface multi-part structures (Citadel Gate, Ramparts, Wood Farms, Commuter Signals)
      while (structuresGroup.children.length > 0) {
        structuresGroup.remove(structuresGroup.children[0]);
      }

      const topY = 1.6 * densityScaleY;

      // 1. Citadel Gatehouse & Rampart Wall (at x = 14)
      const gateGroup = new THREE.Group();
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.7,
        metalness: 0.2,
      });
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.35,
        metalness: 0.5,
      });

      for (let wz = -4; wz <= 4; wz += 2) {
        if (wz === 0) continue; // Gate opening
        const wallBlock = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 1.8), wallMat);
        wallBlock.position.set(4, topY + 1.1, wz);
        wallBlock.castShadow = !isSoftwareGl;
        gateGroup.add(wallBlock);
      }

      // Twin Gate Towers (3-part composite)
      [-2, 2].forEach((tz) => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 3.2, 12), wallMat);
        tower.position.set(4, topY + 1.6, tz);
        gateGroup.add(tower);

        const spire = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.2, 12), roofMat);
        spire.position.set(4, topY + 3.7, tz);
        gateGroup.add(spire);
      });
      structuresGroup.add(gateGroup);

      // 2. Wood Farm Groves (if Wood Farming prompted or default flora)
      const treeCount = hasWoodFarm ? 10 : 5;
      for (let t = 0; t < treeCount; t++) {
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.22, 1.1, 8),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 })
        );
        trunk.position.y = 0.55;
        treeGroup.add(trunk);

        const crownColor = hasDrought
          ? 0xd97706
          : isGreatFire
            ? 0xef4444
            : hasWoodFarm
              ? 0x10b981
              : 0x9333ea;
        const crown = new THREE.Mesh(
          new THREE.ConeGeometry(0.65, 1.4, 9),
          new THREE.MeshStandardMaterial({ color: crownColor, roughness: 0.5 })
        );
        crown.position.y = 1.4;
        treeGroup.add(crown);

        treeGroup.position.set(-4 + (t % 5) * 1.6, topY, 4.5 + Math.floor(t / 5) * 2.2);
        structuresGroup.add(treeGroup);
      }

      // Rebuild autonomous agent meshes
      while (agentsGroup.children.length > 0) {
        agentsGroup.remove(agentsGroup.children[0]);
      }

      p3.agents.slice(0, 24).forEach((ag) => {
        const fColor =
          ag.faction === 'player1'
            ? 0xf59e0b
            : ag.faction === 'player2'
              ? 0x06b6d4
              : ag.faction === 'entropy'
                ? 0xa855f7
                : parseInt(st.mainAlien.primaryColorHex.replace('#', ''), 16) || 0x10b981;
        const aColor =
          parseInt(st.mainAlien.secondaryColorHex.replace('#', ''), 16) || 0xf3f4f6;
        const mesh = createProceduralAgentMesh(ag.role, fColor, aColor);
        mesh.userData = { agentId: ag.id, agent: ag };
        agentsGroup.add(mesh);
      });
    }

    // Raycasting for clicking planets in Phase 2 or inspecting units in Phase 3
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const st = stateRef.current;

      if (st.phase === 2) {
        const hits = raycaster.intersectObjects(clickablePlanets, true);
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && !obj.userData?.bodyId) {
            obj = obj.parent;
          }
          if (obj?.userData?.bodyId) {
            const wid = obj.userData.bodyId as CelestialWorldType;
            selectWorldRef.current(wid);
            const worldInfo = st.candidateWorlds.find((w) => w.id === wid);
            if (worldInfo) {
              inspectRef.current({
                title: worldInfo.name,
                subtitle: worldInfo.subtitle,
                details: worldInfo.description,
              });
            }
          }
        }
      } else if (st.phase === 3) {
        const hits = raycaster.intersectObjects(agentsGroup.children, true);
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && !obj.userData?.agent) {
            obj = obj.parent;
          }
          if (obj?.userData?.agent) {
            const ag = obj.userData.agent;
            inspectRef.current({
              title: ag.label,
              subtitle: `${ag.role.replace(/_/g, ' ').toUpperCase()} · Faction: ${ag.faction.toUpperCase()}`,
              details: `Autonomous State: ${ag.state} · Speed: ${ag.speed.toFixed(2)} · Accuracy: ${Math.round(ag.accuracy * 100)}% ${ag.statusEffect ? `· [${ag.statusEffect}]` : ''}`,
            });
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Resize listener
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Software WebGL fenceSync pacing helper per Three.js skill directive
    let frameId = 0;
    let isDisposed = false;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (isDisposed) return;
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Toggle visible scene group by phase
      phase1Group.visible = st.phase === 1;
      phase2Group.visible = st.phase === 2;
      phase3Group.visible = st.phase === 3;

      if (lastPhase !== st.phase) {
        lastPhase = st.phase;
        if (st.phase === 1) {
          camera.position.set(18, 14, 22);
        } else if (st.phase === 2) {
          camera.position.set(0, 26, 32);
        } else {
          camera.position.set(19, 17, 19);
        }
        controls.target.set(0, 0, 0);
      }

      if (st.phase === 1) {
        const dirSign = st.phase1.timeArrow === 'reversible_echo' ? Math.sin(elapsed * 0.8) : 1;
        molecularCloudPoints.rotation.y += dt * 0.28 * dirSign * st.phase1.gravityStrength;
        const sScale = st.phase1.sunIgnited ? 1.35 + Math.sin(elapsed * 3) * 0.08 : 0.75;
        protoStarGroup.scale.setScalar(sScale);
        coronaRing1.rotation.z += dt * 0.9 * st.phase1.electricityStrength;
        coronaRing2.rotation.y -= dt * 1.2 * st.phase1.electricityStrength;
      } else if (st.phase === 2) {
        solarSun.rotation.y += dt * 0.25;
        st.candidateWorlds.forEach((world) => {
          const pGroup = planetMeshesMap.get(world.id);
          if (!pGroup) return;
          const currentAngle = world.angle + elapsed * world.orbitSpeed;
          const rx = Math.cos(currentAngle) * world.orbitRadius;
          const rz =
            Math.sin(currentAngle) *
            world.orbitRadius *
            (1 - world.eccentricity * 0.4);
          pGroup.position.set(rx, 0, rz);
          pGroup.rotation.y += dt * 0.8;

          if (world.id === st.phase2.selectedWorldType) {
            selectionRing.position.set(rx, -0.1, rz);
            selectionRing.rotation.z = elapsed * 0.8;

            // Morph selected planet visually according to densityG & emergent chemistry!
            const squashY = st.phase2.densityG >= 1.75 ? 0.65 : 1.0;
            pGroup.scale.set(1.15, 1.15 * squashY, 1.15);
            const atmo = pGroup.getObjectByName('atmo-shell') as THREE.Mesh | undefined;
            if (atmo && atmo.material instanceof THREE.MeshPhysicalMaterial) {
              if (st.phase2.greatFireActive) {
                atmo.material.color.setHex(0xef4444);
                atmo.material.opacity = 0.48;
              } else if (st.phase2.emergentArchetype === 'venusian_greenhouse') {
                atmo.material.color.setHex(0xeab308);
                atmo.material.opacity = 0.55;
              } else if (st.phase2.microbes.retinalPurpleMicrobes) {
                atmo.material.color.setHex(0xa855f7);
                atmo.material.opacity = 0.35;
              }
            }
          } else {
            pGroup.scale.setScalar(1.0);
          }
        });
      } else if (st.phase === 3) {
        const sig = `${st.globalTurn}-${st.phase3.cutawaySliceZ}-${st.phase3.cutawaySliceY}-${st.phase3.implementedFeatures.length}-${st.phase3.weather.precipitation}-${st.phase2.densityG}`;
        if (sig !== lastVoxelSignature) {
          lastVoxelSignature = sig;
          rebuildPhase3VoxelWorld(st);
        }

        const densityScaleY =
          st.phase2.densityG >= 1.75 ? 0.68 : st.phase2.densityG <= 0.55 ? 1.22 : 1.0;

        // Animate autonomous agents on the voxel ant-farm
        agentsGroup.children.forEach((child, i) => {
          const ag = st.phase3.agents[i];
          if (!ag) return;
          const speedMod =
            ag.role === 'orc_raider' && st.phase3.weather.mudCoverage >= 40
              ? 0.45
              : 1.0;
          const offset = Math.sin(elapsed * 2.2 * ag.speed * speedMod + i * 1.7) * 2.4;
          const gx = ag.x - GRID_X / 2 + (ag.role === 'commuter_cart' ? offset * 1.5 : offset * 0.5);
          const gz = ag.z - GRID_Z / 2 + (ag.role === 'commuter_cart' ? 0 : Math.cos(elapsed * 1.5 + i) * 0.8);
          const gy =
            ag.role === 'tunnel_digger'
              ? -1.2 * densityScaleY
              : ag.role === 'elven_archer'
                ? 3.8 * densityScaleY
                : 1.65 * densityScaleY;
          child.position.set(gx, gy, gz);
          child.rotation.y = Math.atan2(ag.vz, ag.vx) + Math.sin(elapsed * 3 + i) * 0.2;
        });

        // Animate ballistic arrows if Archers are active
        const archersActive = st.phase3.agents.some((a) => a.role === 'elven_archer');
        const windScatter = (st.phase3.weather.arrowScatterPenalty / 100) * 3.2;
        const highGDrop = st.phase2.densityG >= 1.65 ? 0.55 : 1.0;

        arrowMeshes.forEach((arrow, idx) => {
          if (!archersActive) {
            arrow.visible = false;
            return;
          }
          arrow.visible = true;
          const t = (elapsed * 0.85 + idx * 0.1) % 1;
          // Launch from ramparts (x=4) toward Orc vanguard (x=-5)
          const startX = 4.0;
          const endX = startX - 9.0 * highGDrop;
          const curX = THREE.MathUtils.lerp(startX, endX, t);
          const curY =
            3.6 * densityScaleY * (1 - t) +
            1.6 * densityScaleY * t +
            Math.sin(t * Math.PI) * (2.6 * highGDrop);
          const curZ =
            -3 + (idx % 5) * 1.5 + Math.sin(idx * 4 + elapsed) * windScatter * t;

          _vec3A.set(curX, curY, curZ);
          arrow.position.copy(_vec3A);
          _vec3B.set(endX, 1.5, curZ + windScatter);
          arrow.lookAt(_vec3B);
        });

        // Animate weather particles (Rain, Acid Rain, or Great Fire Ash)
        const posAttr = weatherGeo.getAttribute('position') as THREE.BufferAttribute;
        const precip = st.phase3.weather.precipitation;
        weatherPoints.visible = precip !== 'none' || st.phase2.greatFireActive;
        if (weatherPoints.visible) {
          weatherMat.color.setHex(
            st.phase2.greatFireActive
              ? 0xef4444
              : precip === 'acid_rain'
                ? 0xeab308
                : precip === 'drought'
                  ? 0xd97706
                  : 0x38bdf8
          );
          const windX = (st.phase3.weather.windSpeed / 100) * 6.0;
          for (let i = 0; i < weatherCount; i++) {
            let py = posAttr.getY(i) - dt * (precip === 'drought' ? 1.5 : 9.5);
            let px = posAttr.getX(i) + dt * windX;
            if (py < -2) {
              py = 12;
              px = (Math.random() - 0.5) * 20;
            }
            if (px > 11) px = -11;
            posAttr.setXY(i, px, py);
          }
          posAttr.needsUpdate = true;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#090B10]"
      aria-label="3D Cosmic and Isometric Voxel Ant-Farm Simulation Viewport"
    />
  );
};
