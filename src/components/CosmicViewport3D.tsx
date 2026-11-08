import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CelestialWorldType, CosmosGameState } from '../types/cosmos';
import { computeGoldilocksBoundsAU } from '../utils/juliaPhysicsSolver';

interface CosmicViewport3DProps {
  gameState: CosmosGameState;
  onSelectWorld: (worldId: CelestialWorldType) => void;
  onInspectEntity: (info: { title: string; subtitle: string; details: string } | null) => void;
}

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();

// 4x4 Bayer Dithering Matrix for authentic 1998 256-color Brood War palette quantization
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const _tileTextureCache = new Map<string, THREE.CanvasTexture>();
const _spriteTextureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Generates an authentic 32x32 256-color Bayer-dithered Brood War terrain block texture
 * (Ashworld / Badlands / Char / High-Ground Metal Platform)
 */
function getBroodWarVoxelAtlasTexture(): THREE.CanvasTexture {
  const cached = _tileTextureCache.get('bw-block-base');
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const imgData = ctx.createImageData(64, 64);
  const data = imgData.data;

  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const i = (y * 64 + x) * 4;
      const bayer = BAYER_4X4[y % 4][x % 4] / 16 - 0.5;
      // Add gritty 1998 pixel cliff & dirt speckles + dark 1px tile border bevel
      const isBevelDark = x === 0 || y === 0 || x === 63 || y === 63;
      const isBevelHighlight = x === 1 || y === 1;
      const hash = ((x * 37 + y * 91) ^ (x * y)) & 31;
      let shade = 195 + bayer * 38 + (hash - 16) * 1.6;

      if (isBevelDark) shade = 75;
      else if (isBevelHighlight) shade = 245;
      else if (y % 16 === 0 && x % 4 !== 0) shade -= 35; // Striated cliff rock lines

      const v = Math.max(0, Math.min(255, Math.round(shade)));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  _tileTextureCache.set('bw-block-base', tex);
  return tex;
}

/**
 * Helper to draw a crisp pixel-art block on a 64x64 sprite canvas
 */
function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/**
 * Generates authentic 1998 StarCraft: Brood War pixel-art 64x64 sprite sheets
 * with NearestFilter crisp pixels, segmented wireframe shields/HP, and 256-color dithering.
 */
function getBroodWarPixelSpriteTexture(
  kind: string,
  primaryHex: string,
  secondaryHex: string,
  statusBadge?: string
): THREE.CanvasTexture {
  const key = `bw64-${kind}-${primaryHex}-${secondaryHex}-${statusBadge || ''}`;
  const existing = _spriteTextureCache.get(key);
  if (existing) return existing;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 64, 64);

  // 1. Dithered checkerboard drop-shadow on ground (classic 1998 SC1 shadow)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  for (let sy = 50; sy <= 57; sy++) {
    for (let sx = 14; sx <= 50; sx++) {
      const dx = (sx - 32) / 18;
      const dy = (sy - 53.5) / 4;
      if (dx * dx + dy * dy <= 1.0 && (sx + sy) % 2 === 0) {
        ctx.fillRect(sx, sy, 1, 1);
      }
    }
  }

  // 2. Classic Brood War Segmented Pixel Health & Shield Bar at Top
  const barX = 12;
  const barY = 3;
  px(ctx, barX - 1, barY - 1, 40, 6, '#000000');
  for (let s = 0; s < 7; s++) {
    // Blue Protoss shield pixel row on top, Green/Red HP row below
    px(ctx, barX + s * 5.5, barY, 4.5, 1.5, '#00A8FF');
    px(
      ctx,
      barX + s * 5.5,
      barY + 2,
      4.5,
      2,
      kind.includes('entropy') || kind.includes('orc') ? '#FF2222' : '#00FF00'
    );
  }

  // 3. Draw 1998 Brood War Pixel-Art Unit / Building Sprite
  if (kind === 'command_nexus') {
    // Terran Command Center / Zerg Hatchery Hybrid Superstructure (Pixel Art)
    px(ctx, 8, 26, 48, 24, '#1E242B'); // Outer dark steel hull outline
    px(ctx, 10, 28, 44, 20, '#4A5568'); // Mid steel armor plating
    px(ctx, 12, 22, 40, 8, '#718096'); // Upper command deck
    // Central glowing Command Dome
    px(ctx, 20, 14, 24, 14, '#2D3748');
    px(ctx, 22, 16, 20, 10, primaryHex);
    px(ctx, 26, 18, 8, 4, '#FFFFFF'); // Specular pixel highlight
    // 4 Corner Support Legs (SC1 Command Center landing struts)
    px(ctx, 6, 38, 6, 14, '#2D3748');
    px(ctx, 52, 38, 6, 14, '#2D3748');
    px(ctx, 14, 42, 6, 12, '#1A202C');
    px(ctx, 44, 42, 6, 12, '#1A202C');
    // Glowing green SC1 hangar bay & radar dishes
    px(ctx, 24, 38, 16, 10, '#000000');
    px(ctx, 26, 40, 12, 6, '#00FF00');
    // Blinking yellow/red pixel lights
    px(ctx, 14, 32, 3, 3, '#FFD700');
    px(ctx, 47, 32, 3, 3, '#FF2222');
  } else if (kind === 'mineral_patch') {
    // Iconic StarCraft 1 Jagged Blue Mineral Crystal Field!
    // Dark base rock
    px(ctx, 12, 46, 40, 6, '#1A202C');
    // Left shard
    px(ctx, 14, 28, 8, 20, '#0055AA');
    px(ctx, 16, 24, 6, 22, '#00A8FF');
    px(ctx, 17, 24, 2, 10, '#E0FFFF');
    // Center tall crystal spire
    px(ctx, 25, 14, 12, 34, '#004488');
    px(ctx, 27, 12, 9, 34, '#00CCFF');
    px(ctx, 29, 12, 3, 18, '#FFFFFF');
    // Right crystal cluster
    px(ctx, 39, 22, 10, 26, '#0055AA');
    px(ctx, 41, 20, 7, 26, '#38BDF8');
    px(ctx, 43, 22, 2, 12, '#FFFFFF');
    // Front low crystal
    px(ctx, 21, 34, 20, 14, '#0077CC');
    px(ctx, 24, 36, 14, 10, '#7CE8FF');
  } else if (kind === 'vespene_geyser') {
    // Iconic StarCraft 1 Brown Crater Vespene Geyser + Neon Green Gas Plumes!
    px(ctx, 10, 38, 44, 14, '#3E2723');
    px(ctx, 14, 34, 36, 14, '#5D4037');
    px(ctx, 18, 30, 28, 10, '#795548');
    // Glowing green crater maw
    px(ctx, 22, 31, 20, 6, '#004D00');
    px(ctx, 24, 32, 16, 4, '#00FF00');
    // Pixel-art rising green Vespene smoke clouds
    px(ctx, 26, 20, 12, 9, '#00CC00');
    px(ctx, 22, 13, 16, 8, '#33FF33');
    px(ctx, 28, 8, 10, 6, '#99FF99');
  } else if (kind === 'square_wheel_wagon') {
    // Armored SC1 Cargo Vulture/Siege Wagon with giant literal SQUARE WHEELS!
    px(ctx, 14, 24, 36, 14, '#5C4033');
    px(ctx, 16, 26, 32, 10, '#8B5A2B');
    // Blue mineral + timber cargo load
    px(ctx, 18, 18, 12, 6, '#00CCFF');
    px(ctx, 32, 18, 14, 6, '#D97706');
    // TWO UNMISTAKABLE PIXEL-ART SQUARE WHEELS WITH RIVETS
    px(ctx, 12, 36, 15, 15, '#000000');
    px(ctx, 14, 38, 11, 11, '#F59E0B');
    px(ctx, 18, 42, 3, 3, '#1E293B');

    px(ctx, 37, 36, 15, 15, '#000000');
    px(ctx, 39, 38, 11, 11, '#F59E0B');
    px(ctx, 43, 42, 3, 3, '#1E293B');
  } else if (kind === 'doner_automaton') {
    // Terran Steam-Powered Döner Kebab Supply Depot!
    px(ctx, 10, 28, 20, 22, '#7C2D12'); // Copper steam boiler
    px(ctx, 12, 30, 16, 18, '#D97706');
    px(ctx, 18, 16, 24, 4, '#FDE047'); // Brass steam pipe
    // Spinning vertical Döner Kebab meat cone
    px(ctx, 36, 20, 16, 22, '#991B1B');
    px(ctx, 38, 22, 12, 18, '#EF4444');
    px(ctx, 40, 24, 4, 14, '#FCA5A5');
    // Glowing fire pit underneath
    px(ctx, 34, 44, 20, 6, '#F59E0B');
    px(ctx, 38, 42, 12, 4, '#FEF08A');
  } else if (kind === 'mud_leaf_hut' || kind === 'melted_mud_hut') {
    if (kind === 'melted_mud_hut') {
      // Melted mud-leaf puddle after monsoon rain!
      px(ctx, 10, 42, 44, 10, '#3E2723');
      px(ctx, 14, 44, 36, 6, '#5D4037');
      px(ctx, 20, 43, 8, 4, '#15803D');
      px(ctx, 34, 45, 10, 3, '#166534');
    } else {
      // Intact Terran/Zerg Mud-Leaf Bunker
      px(ctx, 16, 30, 32, 20, '#5D4037');
      px(ctx, 12, 22, 40, 10, '#14532D');
      px(ctx, 18, 16, 28, 8, '#22C55E');
      px(ctx, 26, 38, 12, 12, '#000000');
    }
  } else if (kind === 'sky_whale') {
    // Zerg Overlord / Magrathean Sky Whale Leviathan (Pixel Art!)
    px(ctx, 10, 20, 38, 18, '#0369A1');
    px(ctx, 12, 18, 34, 16, '#0EA5E9');
    px(ctx, 16, 20, 22, 6, '#7DD3FC'); // Dorsal highlight
    // Bioluminescent gas sacs (like SC1 Overlord!)
    px(ctx, 20, 24, 6, 8, '#A855F7');
    px(ctx, 30, 24, 6, 8, '#A855F7');
    // Tail flukes
    px(ctx, 46, 16, 10, 10, '#0284C7');
    px(ctx, 48, 26, 8, 8, '#0369A1');
    // Glowing golden eye & baleen grin
    px(ctx, 14, 24, 3, 3, '#FACC15');
    px(ctx, 12, 32, 24, 4, '#E0F2FE');
  } else if (kind === 'orc_raider') {
    // Protoss Zealot / Armored Orc Raider with dual glowing Psi-Blades!
    px(ctx, 20, 20, 24, 24, '#991B1B'); // Crimson/Gold armor torso
    px(ctx, 22, 22, 20, 18, '#EF4444');
    px(ctx, 24, 14, 16, 10, '#F59E0B'); // Golden helm
    px(ctx, 26, 17, 4, 3, '#00FFFF'); // Glowing eyes
    px(ctx, 34, 17, 4, 3, '#00FFFF');
    // Left & Right Glowing Cyan Psi-Blades!
    px(ctx, 8, 24, 12, 5, '#00FFFF');
    px(ctx, 10, 25, 10, 3, '#FFFFFF');
    px(ctx, 44, 24, 12, 5, '#00FFFF');
    px(ctx, 44, 25, 10, 3, '#FFFFFF');
    // Armored greaves
    px(ctx, 22, 42, 7, 10, '#7F1D1D');
    px(ctx, 35, 42, 7, 10, '#7F1D1D');
  } else if (kind === 'elven_archer') {
    // Terran Marine / Ghost in Powered Combat Armor with Gauss Rifle Muzzle Flash!
    px(ctx, 18, 20, 28, 22, '#0284C7'); // Bulky SC1 Marine shoulder pads
    px(ctx, 22, 22, 20, 18, '#38BDF8');
    // Tinted visor helmet
    px(ctx, 24, 14, 16, 10, '#0F172A');
    px(ctx, 26, 16, 12, 5, '#F59E0B');
    // C-14 Impaler Gauss Rifle + bright yellow muzzle flash
    px(ctx, 34, 28, 18, 6, '#334155');
    px(ctx, 52, 26, 8, 10, '#FEF08A');
    px(ctx, 54, 28, 4, 6, '#FFFFFF');
    // Boots
    px(ctx, 22, 42, 8, 10, '#1E293B');
    px(ctx, 34, 42, 8, 10, '#1E293B');
  } else {
    // SCV / Zerg Drone Harvester carrying a glowing Blue Mineral Chunk!
    px(ctx, 18, 22, 28, 20, '#334155'); // Industrial exo-frame
    px(ctx, 20, 24, 24, 16, primaryHex);
    // Cockpit / Trichromatic Alien Eye Visor ("Red in the middle cheat")
    px(ctx, 22, 15, 20, 10, secondaryHex);
    px(ctx, 24, 18, 4, 4, '#38BDF8'); // S-Blue cone
    px(ctx, 30, 17, 5, 5, '#FF2222'); // L-Red in middle cheat!
    px(ctx, 37, 18, 4, 4, '#00FF00'); // M-Green cone
    // Mechanical plasma clamps holding a harvested Blue Mineral Crystal!
    px(ctx, 10, 28, 8, 10, '#F59E0B');
    px(ctx, 46, 28, 8, 10, '#F59E0B');
    px(ctx, 26, 34, 12, 10, '#00CCFF'); // Carried mineral crystal
    px(ctx, 28, 36, 6, 6, '#FFFFFF');
    // Thruster treads
    px(ctx, 20, 42, 9, 9, '#1E293B');
    px(ctx, 35, 42, 9, 9, '#1E293B');
  }

  // Crisp pixel label plate at bottom of sprite
  if (statusBadge) {
    px(ctx, 4, 54, 56, 9, 'rgba(0, 12, 6, 0.92)');
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1;
    ctx.strokeRect(4.5, 54.5, 55, 8);
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(statusBadge.slice(0, 14).toUpperCase(), 32, 61);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  _spriteTextureCache.set(key, tex);
  return tex;
}

function createBroodWarBillboardUnit(
  kind: string,
  primaryHex: string,
  secondaryHex: string,
  selectionColorHex: number,
  scaleSize: number = 1.85,
  statusBadge?: string
): THREE.Group {
  const group = new THREE.Group();

  // 1. Classic 1998 StarCraft Bright Green (#00FF00) Ground Selection Ellipse
  const ringGeo = new THREE.RingGeometry(scaleSize * 0.37, scaleSize * 0.44, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: selectionColorHex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
  });
  const selectionCircle = new THREE.Mesh(ringGeo, ringMat);
  selectionCircle.rotation.x = -Math.PI / 2;
  selectionCircle.position.y = 0.06;
  group.add(selectionCircle);

  // 2. Pixel-Art Camera-Facing Billboard Sprite (NearestFilter)
  const spriteMat = new THREE.SpriteMaterial({
    map: getBroodWarPixelSpriteTexture(kind, primaryHex, secondaryHex, statusBadge),
    transparent: true,
    depthTest: true,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(scaleSize, scaleSize, 1);
  sprite.position.y = scaleSize * 0.52;
  group.add(sprite);

  return group;
}

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

  const coreGeo = new THREE.SphereGeometry(radius, 18, 18);
  const coreMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(baseColorHex),
    roughness: 0.65,
    metalness: 0.15,
    flatShading: true,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  coreMesh.userData = { bodyId };
  group.add(coreMesh);

  if (hasRingOrMoon) {
    const ringGeo = new THREE.RingGeometry(radius * 1.4, radius * 2.0, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(accentColorHex),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.4;
    ringMesh.userData = { bodyId };
    group.add(ringMesh);
  }

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

  // Classic StarCraft 1 Green Rubber-Band Selection Box State
  const [dragBox, setDragBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

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
    scene.background = new THREE.Color(0x040608);
    scene.fog = new THREE.FogExp2(0x040608, 0.011);

    // Tight isometric-style FOV (28 deg) so the 3D stepped voxel cliff board looks like 1998 StarCraft: Brood War!
    const camera = new THREE.PerspectiveCamera(
      28,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      320
    );
    camera.position.set(26, 26, 26);

    const renderer = new THREE.WebGLRenderer({
      antialias: false, // Crisp pixel-art edges like 1998 Brood War!
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setPixelRatio(1); // Authentic crisp pixel ratio
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.BasicShadowMap; // Hard-edged RTS shadows
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x111827, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.1);
    keyLight.position.set(16, 28, 14);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    scene.add(keyLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 85;
    controls.minDistance = 12;
    controls.maxPolarAngle = Math.PI / 2.25;
    controls.target.set(0, -1, 0);

    // Starfield (disappears if Kokošja Slepota / Night Blindness is active!)
    const starCount = 650;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 70 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starField = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.55 })
    );
    scene.add(starField);

    // =========================================================================
    // ORBITAL SKY HOLOGRAM GROUP (Visible above the Brood War board in Phase I & II!)
    // =========================================================================
    const orbitalSkyGroup = new THREE.Group();
    orbitalSkyGroup.position.set(0, 7.2, -4);
    orbitalSkyGroup.scale.setScalar(0.45);
    scene.add(orbitalSkyGroup);

    const solarSunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const solarSun = new THREE.Mesh(new THREE.SphereGeometry(2.5, 16, 16), solarSunMat);
    orbitalSkyGroup.add(solarSun);

    const goldilocksBandGeo = new THREE.RingGeometry(13.8, 19.5, 48);
    const goldilocksBandMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22,
    });
    const goldilocksBandMesh = new THREE.Mesh(goldilocksBandGeo, goldilocksBandMat);
    goldilocksBandMesh.rotation.x = Math.PI / 2;
    orbitalSkyGroup.add(goldilocksBandMesh);

    const planetMeshesMap = new Map<CelestialWorldType, THREE.Group>();
    const clickablePlanets: THREE.Object3D[] = [];

    stateRef.current.candidateWorlds.forEach((world) => {
      const orbitCurve = new THREE.EllipseCurve(
        0,
        0,
        world.orbitRadiusAU,
        world.orbitRadiusAU * (1 - world.eccentricity * 0.4),
        0,
        Math.PI * 2,
        false,
        0
      );
      const pts = orbitCurve.getPoints(48).map((p) => new THREE.Vector3(p.x, 0, p.y));
      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({
          color: world.orbitNumber === 4 ? 0x00ff00 : 0x38bdf8,
          transparent: true,
          opacity: world.orbitNumber === 4 ? 0.9 : 0.45,
        })
      );
      orbitalSkyGroup.add(orbitLine);

      const pGroup = createProceduralPlanetGroup(
        world.id,
        world.baseColorHex,
        world.accentColorHex,
        world.baseSize * 1.15,
        world.hasRingOrMoon
      );
      orbitalSkyGroup.add(pGroup);
      planetMeshesMap.set(world.id, pGroup);
      clickablePlanets.push(pGroup);
    });

    const selectionRing = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.6, 24),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
    );
    selectionRing.rotation.x = Math.PI / 2;
    orbitalSkyGroup.add(selectionRing);

    // =========================================================================
    // ALWAYS-VISIBLE STARCRAFT: BROOD WAR 3D STEPPED VOXEL CLIFF BATTLEFIELD
    // =========================================================================
    const broodWarBoardGroup = new THREE.Group();
    scene.add(broodWarBoardGroup);

    const GRID_X = 20;
    const GRID_Z = 20;
    const GRID_Y = 8;
    const maxVoxels = GRID_X * GRID_Z * GRID_Y;

    const voxelGeo = new THREE.BoxGeometry(0.98, 0.96, 0.98);
    const voxelMat = new THREE.MeshLambertMaterial({
      map: getBroodWarVoxelAtlasTexture(),
    });
    const voxelInstanced = new THREE.InstancedMesh(voxelGeo, voxelMat, maxVoxels);
    voxelInstanced.castShadow = !isSoftwareGl;
    voxelInstanced.receiveShadow = !isSoftwareGl;
    voxelInstanced.frustumCulled = false;
    broodWarBoardGroup.add(voxelInstanced);

    const waterGeo = new THREE.BoxGeometry(GRID_X + 0.4, 1.0, GRID_Z + 0.4);
    const waterMat = new THREE.MeshBasicMaterial({
      color: 0x0044aa,
      transparent: true,
      opacity: 0.62,
    });
    const seaLevelMesh = new THREE.Mesh(waterGeo, waterMat);
    seaLevelMesh.position.set(-0.5, -1.8, -0.5);
    broodWarBoardGroup.add(seaLevelMesh);

    const structuresGroup = new THREE.Group();
    broodWarBoardGroup.add(structuresGroup);

    const agentsGroup = new THREE.Group();
    broodWarBoardGroup.add(agentsGroup);

    // Dedicated SCV / Drone Mineral & Vespene Harvester Sprites (Always actively mining on the board!)
    const harvestersGroup = new THREE.Group();
    broodWarBoardGroup.add(harvestersGroup);
    for (let h = 0; h < 4; h++) {
      const scv = createBroodWarBillboardUnit(
        'alien_colonist',
        '#F59E0B',
        '#38BDF8',
        0x00ff00,
        1.65,
        h < 3 ? 'MINING MINERALS' : 'HARVESTING GAS'
      );
      harvestersGroup.add(scv);
    }

    // Weather particles
    const weatherCount = 280;
    const weatherGeo = new THREE.BufferGeometry();
    const weatherPos = new Float32Array(weatherCount * 3);
    for (let i = 0; i < weatherCount; i++) {
      weatherPos[i * 3] = (Math.random() - 0.5) * 22;
      weatherPos[i * 3 + 1] = Math.random() * 14;
      weatherPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    weatherGeo.setAttribute('position', new THREE.BufferAttribute(weatherPos, 3));
    const weatherMat = new THREE.PointsMaterial({
      size: 0.22,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const weatherPoints = new THREE.Points(weatherGeo, weatherMat);
    broodWarBoardGroup.add(weatherPoints);

    // Ballistic Gauss / Arrow projectiles
    const arrowMeshes: THREE.Mesh[] = [];
    const arrowGeo = new THREE.BoxGeometry(0.12, 0.12, 0.45);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    for (let i = 0; i < 10; i++) {
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.visible = false;
      broodWarBoardGroup.add(arrow);
      arrowMeshes.push(arrow);
    }

    let lastVoxelSignature = '';

    function getSteppedCliffSurfaceY(x: number, z: number, sliceY: number): number {
      if (x >= 13) return Math.min(sliceY - 1, 5); // High-Ground Brood War Main Base Plateau
      if ((x === 11 || x === 12) && z >= 8 && z <= 11) return Math.min(sliceY - 1, 4); // Narrow Choke Ramp
      if (x <= 3 && z >= 5 && z <= 15) return Math.min(sliceY - 1, 2); // Low Coastal Basin
      return Math.min(sliceY - 1, 3); // Badlands Low-Ground Expansion
    }

    function rebuildBroodWarVoxelWorld(st: CosmosGameState) {
      const p2 = st.phase2;
      const p3 = st.phase3;
      const sliceZ = Math.min(GRID_Z, Math.max(3, Math.round((p3.cutawaySliceZ / 24) * GRID_Z)));
      const sliceY = Math.min(GRID_Y, Math.max(2, Math.round((p3.cutawaySliceY / 10) * GRID_Y)));

      const hasDrought =
        p3.weather.precipitation === 'drought' ||
        p3.implementedFeatures.some((f) => f.voxelEffect === 'drought_heat');
      const hasRoad =
        p3.implementedFeatures.some((f) => f.voxelEffect === 'transit_road') ||
        p3.implementedFeatures.some((f) => f.voxelEffect === 'square_wheel_cart');
      const hasMud = p3.weather.mudCoverage >= 35 || p3.weather.precipitation === 'rain';
      const isVenus = p2.emergentArchetype === 'venusian_greenhouse';
      const isGreatFire = p2.greatFireActive || p2.emergentArchetype === 'great_fire_inferno';
      const densityScaleY = p2.densityG >= 1.75 ? 0.68 : p2.densityG <= 0.55 ? 1.22 : 1.0;

      let idx = 0;
      for (let x = 0; x < GRID_X; x++) {
        for (let z = 0; z < sliceZ; z++) {
          const surfaceY = getSteppedCliffSurfaceY(x, z, sliceY);

          for (let y = 0; y <= surfaceY; y++) {
            const isMainTunnel =
              (y === 1 && (Math.abs(x - 10) <= 1 || Math.abs(z - 10) <= 1)) ||
              (y === 2 && x >= 14 && x <= 17 && z >= 8 && z <= 12);

            if (isMainTunnel && z < sliceZ - 1 && x > 1 && x < GRID_X - 2) {
              if (y === 1 && (x + z) % 2 === 0) {
                _dummy.position.set(
                  x - GRID_X / 2,
                  (y - 3) * densityScaleY,
                  z - GRID_Z / 2
                );
                _dummy.scale.set(0.85, 0.35 * densityScaleY, 0.85);
                _dummy.updateMatrix();
                voxelInstanced.setMatrixAt(idx, _dummy.matrix);
                _color.setHex(0x6b21a8); // Zerg Creep / Subterranean Ant-Farm Conduit
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

            const isPolarIceTile =
              z <= 1 && x >= 14 && y === surfaceY && p3.climate.polarIceRemaining > 20;
            const isZergCreepAroundNexus =
              y === surfaceY && x >= 14 && x <= 17 && z >= 8 && z <= 12;

            // Authentic 1998 StarCraft Badlands / Ashworld / Char palette colors
            if (isPolarIceTile) {
              _color.setHex(0xcffafe);
            } else if (y === 0) {
              _color.setHex(0x1f1916); // Deep Ashworld bedrock
            } else if (y < surfaceY) {
              // Stepped Brood War Cliff Face (Striated Badlands Sandstone / Basalt)
              _color.setHex(y % 2 === 0 ? 0x6b4c35 : 0x523927);
            } else if ((x === 11 || x === 12) && z >= 8 && z <= 11) {
              // Metallic High-Ground Choke Ramp Grating
              _color.setHex(0x8899a6);
            } else if (isZergCreepAroundNexus) {
              // Classic Brood War Purple Zerg Creep Mat under Command Nexus
              _color.setHex((x + z) % 2 === 0 ? 0x581c87 : 0x4c1d95);
            } else if (hasRoad && (z === 9 || z === 10)) {
              // Terran Metal Supply Road
              _color.setHex(0x64748b);
            } else if (hasMud && x >= 5 && x <= 11 && z >= 6 && z <= 13) {
              // Dark Bog Mud
              _color.setHex(0x3e2723);
            } else if (x >= 13) {
              // High-Ground Badlands Plateau (Warm Ochre/Tan Dirt)
              _color.setHex(isVenus ? 0xca8a04 : (x + z) % 2 === 0 ? 0x9c6d47 : 0x8a5f3c);
            } else if (hasDrought || isGreatFire) {
              // Char Volcanic Magma Dirt
              _color.setHex((x + z) % 3 === 0 ? 0xb91c1c : 0x451a03);
            } else {
              // Low-Ground Jungle / Badlands Moss & Dirt Checkerboard
              _color.setHex((x + z) % 2 === 0 ? 0x4d5d3b : 0x5c4938);
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

      const waterSurfaceY = (-1.6 + (p3.climate.seaLevelY - 1.0) * 0.95) * densityScaleY;
      seaLevelMesh.position.y = waterSurfaceY;

      while (structuresGroup.children.length > 0) {
        structuresGroup.remove(structuresGroup.children[0]);
      }

      const highGroundY = (5 - 3 + 0.5) * densityScaleY;
      const lowGroundY = (3 - 3 + 0.5) * densityScaleY;

      // 1. Main Base Command Center / Hatchery Nexus
      const nexusSprite = createBroodWarBillboardUnit(
        'command_nexus',
        st.mainAlien.primaryColorHex,
        st.mainAlien.secondaryColorHex,
        0x00ff00,
        3.2,
        'COMMAND CENTER'
      );
      nexusSprite.position.set(15.5 - GRID_X / 2, highGroundY, 10 - GRID_Z / 2);
      structuresGroup.add(nexusSprite);

      // 2. Natural Expansion Command Post on Low-Ground
      const expNexus = createBroodWarBillboardUnit(
        'command_nexus',
        '#38BDF8',
        '#F59E0B',
        0x00ff00,
        2.6,
        'NATURAL EXPANSION'
      );
      expNexus.position.set(6.5 - GRID_X / 2, lowGroundY, 7.5 - GRID_Z / 2);
      structuresGroup.add(expNexus);

      // 3. Classic StarCraft Blue Mineral Crystal Patches (Arc around Main & Natural!)
      [
        [18, 6],
        [18.5, 7.5],
        [18.5, 9],
        [18, 10.5],
        [5, 4],
        [6.5, 3.8],
        [8, 4],
      ].forEach(([mx, mz]) => {
        const my = mx >= 13 ? highGroundY : lowGroundY;
        const minSprite = createBroodWarBillboardUnit(
          'mineral_patch',
          '#00CCFF',
          '#FFFFFF',
          0x00ccff,
          1.75,
          'MINERALS 1500'
        );
        minSprite.position.set(mx - GRID_X / 2, my, mz - GRID_Z / 2);
        structuresGroup.add(minSprite);
      });

      // 4. Vespene Gas Geysers
      [
        [16.5, 13.8, highGroundY],
        [4.5, 8.5, lowGroundY],
      ].forEach(([gx, gz, gy]) => {
        const geyserSprite = createBroodWarBillboardUnit(
          'vespene_geyser',
          '#00FF00',
          '#15803D',
          0x00ff00,
          2.1,
          'VESPENE GEYSER'
        );
        geyserSprite.position.set(gx - GRID_X / 2, gy, gz - GRID_Z / 2);
        structuresGroup.add(geyserSprite);
      });

      // 5. Loophole Buildings (Mud-Leaf Bunker & Steam Döner Rotisserie Depot)
      const hutMelted = p3.implementedFeatures.some(
        (f) => f.voxelEffect === 'mud_leaf_hut' && f.status === 'loophole_quirk'
      );
      const hutSprite = createBroodWarBillboardUnit(
        hutMelted ? 'melted_mud_hut' : 'mud_leaf_hut',
        '#78350F',
        '#22C55E',
        hutMelted ? 0xff2222 : 0x00ff00,
        2.0,
        hutMelted ? 'MELTED BUNKER!' : 'MUD-LEAF BUNKER'
      );
      hutSprite.position.set(9 - GRID_X / 2, lowGroundY, 12.5 - GRID_Z / 2);
      structuresGroup.add(hutSprite);

      const donerSprite = createBroodWarBillboardUnit(
        'doner_automaton',
        '#EF4444',
        '#F59E0B',
        0xffaa00,
        2.15,
        'STEAM DÖNER DEPOT'
      );
      donerSprite.position.set(14 - GRID_X / 2, highGroundY, 12.5 - GRID_Z / 2);
      structuresGroup.add(donerSprite);

      // 6. Rebuild Autonomous Units
      while (agentsGroup.children.length > 0) {
        agentsGroup.remove(agentsGroup.children[0]);
      }

      p3.agents.slice(0, 26).forEach((ag) => {
        const selColor =
          ag.faction === 'player1'
            ? 0x00ff00
            : ag.faction === 'player2'
              ? 0x00ccff
              : ag.faction === 'entropy'
                ? 0xff2222
                : 0x00ff00;

        const scale =
          ag.role === 'sky_whale'
            ? 2.7
            : ag.role === 'square_wheel_wagon'
              ? 2.05
              : 1.75;
        const unitBillboard = createBroodWarBillboardUnit(
          ag.role,
          st.mainAlien.primaryColorHex,
          st.mainAlien.secondaryColorHex,
          selColor,
          scale,
          ag.label
        );
        unitBillboard.userData = { agentId: ag.id, agent: ag };
        agentsGroup.add(unitBillboard);
      });
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos: { x: number; y: number } | null = null;

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0 && e.shiftKey) {
        // Shift + Left-Drag draws classic StarCraft green RTS selection box!
        pointerDownPos = { x: e.clientX, y: e.clientY };
        setDragBox({
          startX: e.clientX,
          startY: e.clientY,
          endX: e.clientX,
          endY: e.clientY,
        });
      }

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const st = stateRef.current;

      // Check planets in sky hologram
      const planetHits = raycaster.intersectObjects(clickablePlanets, true);
      if (planetHits.length > 0) {
        let obj: THREE.Object3D | null = planetHits[0].object;
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
              subtitle: `${worldInfo.subtitle} · ${worldInfo.inGoldilocksZone ? 'GOLDILOCKS ZONE' : 'OUTER/INNER ORBIT'}`,
              details: worldInfo.description,
            });
          }
          return;
        }
      }

      // Check Brood War units on the stepped voxel board
      const unitHits = raycaster.intersectObjects(agentsGroup.children, true);
      if (unitHits.length > 0) {
        let obj: THREE.Object3D | null = unitHits[0].object;
        while (obj && !obj.userData?.agent) {
          obj = obj.parent;
        }
        if (obj?.userData?.agent) {
          const ag = obj.userData.agent;
          inspectRef.current({
            title: ag.label,
            subtitle: `BROOD WAR UNIT: ${ag.role.replace(/_/g, ' ').toUpperCase()} · FACTION: ${ag.faction.toUpperCase()}`,
            details: `Order: ${ag.state.toUpperCase()} · HP: ${ag.hp}/${ag.maxHp} · Speed: ${ag.speed.toFixed(2)} ${ag.statusEffect ? `· [${ag.statusEffect}]` : ''}`,
          });
        }
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!pointerDownPos) return;
      setDragBox({
        startX: pointerDownPos.x,
        startY: pointerDownPos.y,
        endX: e.clientX,
        endY: e.clientY,
      });
    };

    const handlePointerUp = () => {
      if (pointerDownPos) {
        pointerDownPos = null;
        setDragBox(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / Math.max(1, container.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

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

      starField.visible = !st.phase2.ocular.kokosjaSlepotaActive;

      // Update Orbital Sky Astrolabe above the Brood War cliff board
      solarSunMat.color.set(st.phase1.starColorHex);
      const bounds = computeGoldilocksBoundsAU(st.phase1.sunMassSolar);
      goldilocksBandMesh.scale.setScalar(bounds.optimalAU / 16.5);
      orbitalSkyGroup.visible = st.phase === 1 || st.phase === 2;

      st.candidateWorlds.forEach((world) => {
        const pGroup = planetMeshesMap.get(world.id);
        if (!pGroup) return;
        const orbitalSpeed =
          0.45 *
          Math.sqrt(st.phase1.sunMassSolar) *
          Math.pow(10 / Math.max(4, world.orbitRadiusAU), 1.2);
        const currentAngle = world.angle + elapsed * orbitalSpeed;
        const rx = Math.cos(currentAngle) * world.orbitRadiusAU;
        const rz =
          Math.sin(currentAngle) *
          world.orbitRadiusAU *
          (1 - world.eccentricity * 0.4);
        pGroup.position.set(rx, 0, rz);
        pGroup.rotation.y += dt * 0.8;

        if (world.id === st.phase2.selectedWorldType) {
          selectionRing.position.set(rx, -0.1, rz);
          selectionRing.rotation.z = elapsed * 0.8;
        }
      });

      // Always keep the 3D Stepped Voxel Brood War Battlefield active & alive!
      const sig = [
        st.globalTurn,
        st.phase,
        st.phase3.cutawaySliceZ,
        st.phase3.cutawaySliceY,
        st.phase3.implementedFeatures.length,
        st.phase3.weather.precipitation,
        st.phase2.densityG,
        st.phase3.resources.treesRemainingOnIsland,
        st.phase3.climate.seaLevelY,
        st.phase3.climate.polarIceRemaining,
      ].join('-');

      if (sig !== lastVoxelSignature) {
        lastVoxelSignature = sig;
        rebuildBroodWarVoxelWorld(st);
      }

      const densityScaleY =
        st.phase2.densityG >= 1.75 ? 0.68 : st.phase2.densityG <= 0.55 ? 1.22 : 1.0;
      const highGroundY = (5 - 3 + 0.55) * densityScaleY;

      // Animate SCV / Drone Harvesters shuttling between Command Center and Minerals/Geyser!
      harvestersGroup.children.forEach((scv, hIdx) => {
        const cycle = (Math.sin(elapsed * 2.4 + hIdx * 1.6) + 1) * 0.5;
        if (hIdx < 3) {
          const hx = THREE.MathUtils.lerp(15.5, 18.2, cycle) - GRID_X / 2;
          const hz = THREE.MathUtils.lerp(10, 6.5 + hIdx * 1.5, cycle) - GRID_Z / 2;
          scv.position.set(hx, highGroundY, hz);
        } else {
          const hx = THREE.MathUtils.lerp(15.5, 16.5, cycle) - GRID_X / 2;
          const hz = THREE.MathUtils.lerp(10, 13.8, cycle) - GRID_Z / 2;
          scv.position.set(hx, highGroundY, hz);
        }
      });

      // Animate Brood War Units on the board
      agentsGroup.children.forEach((child, i) => {
        const ag = st.phase3.agents[i];
        if (!ag) return;

        const isSquareWheel = ag.role === 'square_wheel_wagon' && ag.speed < 0.6;
        const speedMod =
          ag.role === 'orc_raider' && st.phase3.weather.mudCoverage >= 35 ? 0.4 : 1.0;
        const offset = Math.sin(elapsed * 2.0 * ag.speed * speedMod + i * 1.7) * 2.5;

        const gx =
          ag.x -
          GRID_X / 2 +
          (ag.role === 'square_wheel_wagon' ? offset * 1.3 : offset * 0.55);
        const gz =
          ag.z -
          GRID_Z / 2 +
          (ag.role === 'square_wheel_wagon' ? 0 : Math.cos(elapsed * 1.4 + i) * 0.85);

        const hopY = isSquareWheel ? Math.abs(Math.sin(elapsed * 9 + i)) * 0.32 : 0;

        const gy =
          ag.role === 'sky_whale'
            ? (4.6 + Math.sin(elapsed * 1.6 + i) * 0.45) * densityScaleY
            : ag.role === 'tunnel_digger'
              ? -1.4 * densityScaleY
              : ag.role === 'elven_archer' || gx >= 3
                ? 2.5 * densityScaleY + hopY
                : 0.55 * densityScaleY + hopY;

        child.position.set(gx, gy, gz);
      });

      // Animate Gauss / Arrow volleys from high-ground cliff ramparts
      const archersActive = st.phase3.agents.some((a) => a.role === 'elven_archer');
      const windScatter = (st.phase3.weather.arrowScatterPenalty / 100) * 3.2;
      const highGDrop = st.phase2.densityG >= 1.65 ? 0.55 : 1.0;

      arrowMeshes.forEach((arrow, idx) => {
        if (!archersActive) {
          arrow.visible = false;
          return;
        }
        arrow.visible = true;
        const t = (elapsed * 1.1 + idx * 0.1) % 1;
        const startX = 3.5;
        const endX = startX - 8.5 * highGDrop;
        const curX = THREE.MathUtils.lerp(startX, endX, t);
        const curY =
          2.8 * densityScaleY * (1 - t) +
          0.8 * densityScaleY * t +
          Math.sin(t * Math.PI) * (2.2 * highGDrop);
        const curZ =
          -3 + (idx % 5) * 1.5 + Math.sin(idx * 4 + elapsed) * windScatter * t;

        _vec3A.set(curX, curY, curZ);
        arrow.position.copy(_vec3A);
        _vec3B.set(endX, 0.8, curZ + windScatter);
        arrow.lookAt(_vec3B);
      });

      // Weather particles
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
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const ocular = gameState.phase2.ocular;
  const visionFilterClass = ocular.simulateAlienVisionFilter
    ? ocular.kokosjaSlepotaActive
      ? 'brightness-50 contrast-150 saturate-50'
      : ocular.colorBlindnessMode === 'protanopia_no_red'
        ? 'hue-rotate-60 saturate-75'
        : 'contrast-125 saturate-125'
    : '';

  return (
    <>
      <div
        ref={mountRef}
        className={`fixed inset-0 w-full h-full z-0 overflow-hidden bg-[#040608] transition-all duration-300 ${visionFilterClass}`}
        style={{ imageRendering: 'pixelated' }}
        aria-label="StarCraft: Brood War 256-Color Pixel-Art Sprites on 3D Stepped Voxel Cliff Board"
      />

      {/* Classic 1998 StarCraft CRT Scanline & Vignette Overlay */}
      <div
        className="fixed inset-0 z-[5] pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Classic StarCraft 1 Green Rubber-Band Selection Box (Shift + Drag) */}
      {dragBox && (
        <div
          className="fixed z-20 pointer-events-none border-2 border-[#00FF00] bg-[#00FF00]/10"
          style={{
            left: Math.min(dragBox.startX, dragBox.endX),
            top: Math.min(dragBox.startY, dragBox.endY),
            width: Math.abs(dragBox.endX - dragBox.startX),
            height: Math.abs(dragBox.endY - dragBox.startY),
          }}
        />
      )}
    </>
  );
};
