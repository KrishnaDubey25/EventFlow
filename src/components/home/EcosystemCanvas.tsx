import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { 
  AlertCircle, 
  Rotate3d
} from "lucide-react";

interface EcosystemCanvasProps {
  onSelectZone?: (zoneName: string) => void;
}

/**
 * EcosystemCanvas
 * A world-class architectural 3D digital twin of a universal mega-event ecosystem.
 * - Versatile Multi-Purpose Venue: Features a curved monumental performance/keynote stage,
 *   panoramic curved digital LED media wall, overhead lighting trusses, sweeping spotlight beams,
 *   and multi-tier seating/expo tiers.
 * - Coordinated Flow: Arterial roadway shuttles, 3-car metro train on curved viaduct, and crowds.
 */
export const EcosystemCanvas: React.FC<EcosystemCanvasProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Verify WebGL
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    let animationFrameId: number;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 560;

    // 1. Scene & Warm Architectural Fog matching #FBF8F1
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFAF9F6);
    scene.fog = new THREE.Fog(0xFAF9F6, 28, 52);

    // 2. Camera Setup (Refined isometric perspective)
    const camera = new THREE.PerspectiveCamera(31, width / height, 0.1, 100);
    camera.position.set(20, 18, 22);
    camera.lookAt(0, 0.7, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Architectural Lighting
    const ambientLight = new THREE.AmbientLight(0xEFF4FA, 1.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFDF5, 2.5);
    sunLight.position.set(18, 28, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 65;
    sunLight.shadow.camera.left = -17;
    sunLight.shadow.camera.right = 17;
    sunLight.shadow.camera.top = 17;
    sunLight.shadow.camera.bottom = -17;
    sunLight.shadow.bias = -0.0003;
    scene.add(sunLight);

    const skyFill = new THREE.DirectionalLight(0xD8E5F8, 1.1);
    skyFill.position.set(-16, 15, -14);
    scene.add(skyFill);

    // Stadium internal light (Real warm professional auditorium & arena lighting)
    const venueInternalLight = new THREE.PointLight(0xFFF7ED, 2.2, 14);
    venueInternalLight.position.set(0, 2.0, 0);
    scene.add(venueInternalLight);

    // Stage spotlight accent (Real warm theatrical spotlight)
    const stageSpotLight = new THREE.SpotLight(0xFFFBEB, 3.6, 12, Math.PI / 4, 0.5, 1);
    stageSpotLight.position.set(0, 4.2, 1.5);
    stageSpotLight.target.position.set(0, 0.6, -0.6);
    scene.add(stageSpotLight);
    scene.add(stageSpotLight.target);

    // Root model anchor
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // ==========================================
    // A. ORGANIC GROUND & PRECINCT PAVEMENT
    // ==========================================
    const groundGeo = new THREE.CylinderGeometry(16, 16.8, 0.3, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xDFE5EB, // Real light gray architectural sidewalk / precinct foundation
      roughness: 0.95,
      metalness: 0.02,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.15;
    groundMesh.receiveShadow = true;
    modelGroup.add(groundMesh);

    // Central Concourse & Plaza surface (Real architectural interlocking pavers)
    const plazaGeo = new THREE.CylinderGeometry(12.2, 12.2, 0.04, 64);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xD3DAE2, // Real urban pedestrian stone pavers
      roughness: 0.85,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = 0.01;
    plaza.receiveShadow = true;
    modelGroup.add(plaza);

    // Landscaped Parks (Real vibrant green grass lawns)
    const parkAreas = [
      { x: 7.0, z: -5.2, w: 5.0, d: 4.4 },
      { x: -7.0, z: 6.2, w: 4.4, d: 3.6 },
    ];
    parkAreas.forEach((p) => {
      const parkGeo = new THREE.BoxGeometry(p.w, 0.05, p.d);
      const parkMat = new THREE.MeshStandardMaterial({
        color: 0x3E7B44, // Real lush park lawn green
        roughness: 0.95,
      });
      const parkMesh = new THREE.Mesh(parkGeo, parkMat);
      parkMesh.position.set(p.x, 0.03, p.z);
      parkMesh.receiveShadow = true;
      modelGroup.add(parkMesh);
    });

    // Trees with natural bark and canopy foliage
    const treePositions = [
      { x: 5.4, z: -4.0 },
      { x: 6.6, z: -4.6 },
      { x: 8.0, z: -4.0 },
      { x: 8.6, z: -5.6 },
      { x: 6.0, z: -6.4 },
      { x: -6.0, z: 6.0 },
      { x: -7.2, z: 7.0 },
      { x: -8.4, z: 6.0 },
      { x: -3.8, z: 4.4 },
      { x: 3.8, z: 4.4 },
      { x: -4.0, z: -4.4 },
      { x: 4.0, z: -4.4 },
    ];
    const treeFoliageGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const treeFoliageMat1 = new THREE.MeshStandardMaterial({
      color: 0x2D6A32, // Real deep natural canopy green
      roughness: 0.8,
    });
    const treeFoliageMat2 = new THREE.MeshStandardMaterial({
      color: 0x387E3E, // Slightly lighter sunny canopy tone
      roughness: 0.8,
    });
    const trunkGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.38, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ 
      color: 0x4A3525, // Real tree bark brown
      roughness: 0.9,
    });

    treePositions.forEach((tp, i) => {
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(tp.x, 0.19, tp.z);
      trunk.castShadow = true;
      modelGroup.add(trunk);

      const foliage = new THREE.Mesh(treeFoliageGeo, i % 2 === 0 ? treeFoliageMat1 : treeFoliageMat2);
      foliage.position.set(tp.x, 0.5, tp.z);
      foliage.castShadow = true;
      modelGroup.add(foliage);
    });

    // ==========================================
    // B. UNIVERSAL MEGA-EVENT VENUE (CONCERT, SUMMIT, EXPO, ARENA)
    // ==========================================
    const venueGroup = new THREE.Group();
    modelGroup.add(venueGroup);

    // Stadium Foundation Plinth (Refined architectural light pearl granite)
    const plinthGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.36, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x64748B, // Premium light architectural granite plinth
      roughness: 0.55,
      metalness: 0.2,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.18;
    plinth.receiveShadow = true;
    venueGroup.add(plinth);

    // Lower Tier Outer Facade (Architectural dark smoked glass & granite concourse cladding)
    const lowerBowlGeo = new THREE.CylinderGeometry(3.6, 3.25, 0.9, 48, 1, true);
    const lowerBowlMat = new THREE.MeshStandardMaterial({
      color: 0x1E2733, // Real dark smoked architectural curtain glass and granite
      roughness: 0.25,
      metalness: 0.4,
      side: THREE.DoubleSide,
    });
    const lowerBowl = new THREE.Mesh(lowerBowlGeo, lowerBowlMat);
    lowerBowl.position.y = 0.65;
    lowerBowl.castShadow = true;
    lowerBowl.receiveShadow = true;
    venueGroup.add(lowerBowl);

    // Upper Tier Outer Facade (Luminous Brushed Platinum-Titanium - elegant, bright & clearly defined)
    const upperBowlGeo = new THREE.CylinderGeometry(3.9, 3.6, 0.9, 48, 1, true);
    const upperBowlMat = new THREE.MeshStandardMaterial({
      color: 0x94A3B8, // Premium luminous platinum titanium (not black, not washed white)
      roughness: 0.24,
      metalness: 0.58,
      side: THREE.DoubleSide,
    });
    const upperBowl = new THREE.Mesh(upperBowlGeo, upperBowlMat);
    upperBowl.position.y = 1.55;
    upperBowl.castShadow = true;
    upperBowl.receiveShadow = true;
    venueGroup.add(upperBowl);

    // Exterior Architectural Structural Louver Fins (High-polish polished chrome / platinum fins)
    const ribGeo = new THREE.BoxGeometry(0.08, 0.85, 0.16);
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9, // Mirror chrome vertical accents
      metalness: 0.95,
      roughness: 0.12,
    });
    for (let r = 0; r < 24; r++) {
      const ribAngle = (r / 24) * Math.PI * 2;
      const ribMesh = new THREE.Mesh(ribGeo, ribMat);
      ribMesh.position.set(
        Math.cos(ribAngle) * 3.78,
        1.55,
        Math.sin(ribAngle) * 3.78
      );
      ribMesh.rotation.y = -ribAngle;
      ribMesh.castShadow = true;
      venueGroup.add(ribMesh);
    }

    // Modern Multi-Tier Grandstand / Auditorium Seating (Real Professional Executive Charcoal-Slate Seats)
    const seatingGeo = new THREE.CylinderGeometry(3.1, 2.2, 1.0, 36, 1, true);
    const seatingMat = new THREE.MeshStandardMaterial({
      color: 0x222B38, // Real world-class arena executive charcoal-slate acoustic upholstery
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const seating = new THREE.Mesh(seatingGeo, seatingMat);
    seating.position.y = 0.9;
    venueGroup.add(seating);

    // Concentric Arena Balcony Rings (VIP Club Level Frosted Glass Balustrade)
    const balconyRimGeo = new THREE.RingGeometry(2.35, 2.45, 36);
    const balconyRimMat = new THREE.MeshBasicMaterial({
      color: 0xE2E8F0, // Architectural frosted glass balustrade with subtle warm accent
      transparent: true,
      opacity: 0.7,
    });
    const balconyRim = new THREE.Mesh(balconyRimGeo, balconyRimMat);
    balconyRim.rotation.x = -Math.PI / 2;
    balconyRim.position.y = 1.15;
    venueGroup.add(balconyRim);

    // ----------------------------------------------------
    // UNIVERSAL EVENT ARENA & AUDITORIUM FLOOR (NOT A SOCCER PITCH!)
    // ----------------------------------------------------
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fctx = floorCanvas.getContext("2d");
    if (fctx) {
      // Polished architectural event floor
      fctx.fillStyle = "#1E2530";
      fctx.fillRect(0, 0, 512, 512);

      // Fine concentric architectural floor grid lines
      fctx.strokeStyle = "rgba(226, 232, 240, 0.22)";
      fctx.lineWidth = 2;
      [80, 140, 200].forEach((r) => {
        fctx.beginPath();
        fctx.arc(256, 256, r, 0, Math.PI * 2);
        fctx.stroke();
      });

      // Radiating architectural grid segments
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        fctx.beginPath();
        fctx.moveTo(256 + Math.cos(a) * 60, 256 + Math.sin(a) * 60);
        fctx.lineTo(256 + Math.cos(a) * 210, 256 + Math.sin(a) * 210);
        fctx.stroke();
      }

      // Center stage & VIP zone warm ambient lighting pool
      const grad = fctx.createRadialGradient(256, 256, 10, 256, 256, 180);
      grad.addColorStop(0, "rgba(254, 243, 199, 0.25)");
      grad.addColorStop(1, "rgba(30, 37, 48, 0)");
      fctx.fillStyle = grad;
      fctx.fillRect(0, 0, 512, 512);
    }
    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    const floorGeo = new THREE.CylinderGeometry(1.95, 1.95, 0.08, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.45,
      metalness: 0.2,
    });
    const eventFloor = new THREE.Mesh(floorGeo, floorMat);
    eventFloor.position.y = 0.45;
    eventFloor.receiveShadow = true;
    venueGroup.add(eventFloor);

    // ----------------------------------------------------
    // MONUMENTAL MAIN PERFORMANCE / KEYNOTE / EXPO STAGE
    // ----------------------------------------------------
    const stageGroup = new THREE.Group();
    stageGroup.position.set(0, 0.48, -0.65);
    venueGroup.add(stageGroup);

    // Stage Platform (Real black performance stage deck)
    const stagePlatformGeo = new THREE.BoxGeometry(1.7, 0.14, 0.85);
    const stagePlatformMat = new THREE.MeshStandardMaterial({
      color: 0x18181B, // Real dark performance stage deck
      roughness: 0.3,
      metalness: 0.25,
    });
    const stagePlatform = new THREE.Mesh(stagePlatformGeo, stagePlatformMat);
    stagePlatform.position.y = 0.07;
    stagePlatform.castShadow = true;
    stagePlatform.receiveShadow = true;
    stageGroup.add(stagePlatform);

    // Stage Lip Safety Illumination (Real perimeter stage caution glow)
    const stageLipGeo = new THREE.BoxGeometry(1.74, 0.04, 0.08);
    const stageLipMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B, // Real stage perimeter safety gold / amber
      emissive: 0xD97706,
      emissiveIntensity: 0.75,
    });
    const stageLip = new THREE.Mesh(stageLipGeo, stageLipMat);
    stageLip.position.set(0, 0.12, 0.43);
    stageGroup.add(stageLip);

    // Curved Panoramic Ultra-Wide Digital LED Media Backdrop Screen
    const ledScreenGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.72, 24, 1, true, -Math.PI * 0.4, Math.PI * 0.8);
    const ledCanvas = document.createElement("canvas");
    ledCanvas.width = 512;
    ledCanvas.height = 256;
    const lctx = ledCanvas.getContext("2d");
    if (lctx) {
      // Professional executive keynote presentation screen (warm obsidian & graphite with golden highlight)
      const lgrad = lctx.createLinearGradient(0, 0, 512, 256);
      lgrad.addColorStop(0, "#090D16");
      lgrad.addColorStop(0.4, "#1E293B");
      lgrad.addColorStop(0.85, "#334155");
      lgrad.addColorStop(1, "#C9A15C");
      lctx.fillStyle = lgrad;
      lctx.fillRect(0, 0, 512, 256);

      // Fine executive stage presentation soundwave & frequency grid
      lctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      lctx.lineWidth = 3;
      lctx.beginPath();
      for (let x = 0; x < 512; x += 10) {
        const y = 138 + Math.sin(x * 0.04) * 28 + Math.cos(x * 0.02) * 16;
        if (x === 0) lctx.moveTo(x, y);
        else lctx.lineTo(x, y);
      }
      lctx.stroke();

      // Bold digital live keynote text
      lctx.fillStyle = "#FFFFFF";
      lctx.font = "bold 24px sans-serif";
      lctx.fillText("EVENTFLOW LIVE", 155, 65);
    }
    const ledTexture = new THREE.CanvasTexture(ledCanvas);
    const ledMat = new THREE.MeshStandardMaterial({
      map: ledTexture,
      emissive: 0x334155,
      emissiveIntensity: 0.25,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });
    const ledScreen = new THREE.Mesh(ledScreenGeo, ledMat);
    ledScreen.position.set(0, 0.5, -0.38);
    ledScreen.rotation.y = Math.PI;
    stageGroup.add(ledScreen);

    // Stage Overhead Aluminum Lighting Truss Arch (Real polished aluminum rigging)
    const trussCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.95, 0.1, 0.1),
      new THREE.Vector3(-0.85, 0.85, 0.1),
      new THREE.Vector3(0, 1.05, 0.1),
      new THREE.Vector3(0.85, 0.85, 0.1),
      new THREE.Vector3(0.95, 0.1, 0.1),
    ]);
    const trussGeo = new THREE.TubeGeometry(trussCurve, 24, 0.035, 6, false);
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0xCBD5E1, // Real brushed aluminum stage truss
      metalness: 0.85,
      roughness: 0.2,
    });
    const trussMesh = new THREE.Mesh(trussGeo, trussMat);
    stageGroup.add(trussMesh);

    // ----------------------------------------------------
    // DYNAMIC VOLUMETRIC SPOTLIGHT BEAMS (Real warm halogen theatrical beams)
    // ----------------------------------------------------
    const beamGeo = new THREE.ConeGeometry(0.35, 1.6, 16, 1, true);
    beamGeo.translate(0, -0.8, 0); // Origin at top tip

    const beamMat1 = new THREE.MeshBasicMaterial({
      color: 0xFEF08A, // Real warm halogen stage spotlight beam
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beam1 = new THREE.Mesh(beamGeo, beamMat1);
    beam1.position.set(-0.6, 1.0, 0.1);
    beam1.rotation.z = -0.25;
    beam1.rotation.x = 0.2;
    stageGroup.add(beam1);

    const beamMat2 = new THREE.MeshBasicMaterial({
      color: 0xFFEDD5, // Real warm champagne theatrical spotlight beam
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const beam2 = new THREE.Mesh(beamGeo, beamMat2);
    beam2.position.set(0.6, 1.0, 0.1);
    beam2.rotation.z = 0.25;
    beam2.rotation.x = 0.2;
    stageGroup.add(beam2);

    // Central Plenary Floor Seating Blocks (Real upholstered charcoal conference chairs)
    const seatingBlockGeo = new THREE.BoxGeometry(0.38, 0.05, 0.22);
    const seatingBlockMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B, // Real dark charcoal fabric seats
      roughness: 0.6,
    });
    [-0.45, 0, 0.45].forEach((xOff) => {
      [0.15, 0.45, 0.75].forEach((zOff) => {
        const block = new THREE.Mesh(seatingBlockGeo, seatingBlockMat);
        block.position.set(xOff, 0.04, zOff);
        stageGroup.add(block);
      });
    });

    // ----------------------------------------------------
    // ROOF CANOPY & SIGNATURE LUMINOUS CROWN RING
    // ----------------------------------------------------
    const roofTorusGeo = new THREE.TorusGeometry(3.8, 0.28, 16, 48);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Premium architectural satin titanium compression ring
      roughness: 0.28,
      metalness: 0.65,
    });
    const roofTorus = new THREE.Mesh(roofTorusGeo, roofMat);
    roofTorus.rotation.x = Math.PI / 2;
    roofTorus.position.y = 2.05;
    roofTorus.castShadow = true;
    venueGroup.add(roofTorus);

    // Outer Signature Event Crown Ring (Real architectural facade illumination strip)
    const crownGeo = new THREE.TorusGeometry(3.96, 0.045, 12, 48);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      emissive: 0x0284C7,
      emissiveIntensity: 0.65,
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 2.15;
    venueGroup.add(crown);

    // Canopy Support Struts (Real galvanized structural steel)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const strutGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.68, 8);
      const strutMat = new THREE.MeshStandardMaterial({ 
        color: 0xCBD5E1, // Polished structural steel columns
        metalness: 0.85,
        roughness: 0.2,
      });
      const strut = new THREE.Mesh(strutGeo, strutMat);
      strut.position.set(Math.cos(a) * 3.6, 2.34, Math.sin(a) * 3.6);
      venueGroup.add(strut);
    }

    // Four Cardinal Entrance Plazas (Real security checkpoints with turnstiles & green clearance indicators)
    const entranceAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    entranceAngles.forEach((angle) => {
      const gateGroup = new THREE.Group();
      const canopyGeo = new THREE.BoxGeometry(1.4, 0.1, 0.75);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x334155, // Premium satin titanium portal canopy
        roughness: 0.3,
        metalness: 0.55,
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 0.88, 0);
      canopy.castShadow = true;

      // Real entrance status indicator (Emerald green for "OPEN / CLEAR")
      const edgeGeo = new THREE.BoxGeometry(1.42, 0.03, 0.1);
      const edgeMat = new THREE.MeshStandardMaterial({
        color: 0x10B981, // Real green gate clearance indicator
        emissive: 0x059669,
        emissiveIntensity: 0.7,
        roughness: 0.2,
      });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.set(0, 0.92, 0.35);

      // Real brushed stainless steel support posts
      const pillarGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.88, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ 
        color: 0x94A3B8, 
        metalness: 0.8, 
        roughness: 0.2 
      });
      const p1 = new THREE.Mesh(pillarGeo, pillarMat);
      p1.position.set(-0.55, 0.44, -0.28);
      const p2 = new THREE.Mesh(pillarGeo, pillarMat);
      p2.position.set(0.55, 0.44, -0.28);

      // Real optical stainless steel turnstile row
      const barrierGeo = new THREE.BoxGeometry(1.15, 0.28, 0.2);
      const barrierMat = new THREE.MeshStandardMaterial({ 
        color: 0x64748B, // Real brushed chrome / stainless steel turnstiles
        metalness: 0.85, 
        roughness: 0.2 
      });
      const barrier = new THREE.Mesh(barrierGeo, barrierMat);
      barrier.position.set(0, 0.14, 0);

      gateGroup.add(canopy, edge, p1, p2, barrier);
      const dist = 4.8;
      gateGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      gateGroup.rotation.y = -angle + Math.PI / 2;
      venueGroup.add(gateGroup);
    });

    // ==========================================
    // C. ROADWAYS & VEHICLES (SHUTTLES & CARS)
    // ==========================================
    const roadGroup = new THREE.Group();
    modelGroup.add(roadGroup);

    // Real dark asphalt roadway
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x22262E, // Real asphalt road
      roughness: 0.9,
    });
    const ringRoadGeo = new THREE.RingGeometry(7.2, 8.5, 48);
    const ringRoad = new THREE.Mesh(ringRoadGeo, roadMat);
    ringRoad.rotation.x = -Math.PI / 2;
    ringRoad.position.y = 0.025;
    ringRoad.receiveShadow = true;
    roadGroup.add(ringRoad);

    // Real painted white highway line markings
    const laneMarkGeo = new THREE.RingGeometry(7.82, 7.87, 48);
    const laneMarkMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF, // Real bright white road markings
      transparent: true,
      opacity: 0.8,
    });
    const laneMark = new THREE.Mesh(laneMarkGeo, laneMarkMat);
    laneMark.rotation.x = -Math.PI / 2;
    laneMark.position.y = 0.028;
    roadGroup.add(laneMark);

    const eastAveGeo = new THREE.PlaneGeometry(1.5, 2.6);
    const eastAve = new THREE.Mesh(eastAveGeo, roadMat);
    eastAve.rotation.x = -Math.PI / 2;
    eastAve.position.set(5.9, 0.026, 0);
    eastAve.receiveShadow = true;
    roadGroup.add(eastAve);

    const vehicles: Array<{
      mesh: THREE.Group;
      angle: number;
      speed: number;
      radius: number;
    }> = [];

    // Real-life automotive car finishes: Pearl White, Metallic Silver, Obsidian, Crimson Red, Navy Blue, Slate Grey
    const realisticCarColors = [0xF8FAFC, 0x18181B, 0x94A3B8, 0xDC2626, 0x1D4ED8, 0x475569];

    for (let i = 0; i < 7; i++) {
      const vGroup = new THREE.Group();
      const isShuttle = i % 2 === 0;

      // Body: Shuttles are modern white airport/event shuttles with blue transit stripe; cars are realistic paint coats
      const bodyGeo = isShuttle
        ? new THREE.BoxGeometry(0.38, 0.25, 0.82)
        : new THREE.BoxGeometry(0.34, 0.17, 0.58);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: isShuttle ? 0xF8FAFC : realisticCarColors[i % realisticCarColors.length],
        roughness: isShuttle ? 0.3 : 0.2,
        metalness: isShuttle ? 0.2 : 0.65, // Metallic car finish
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = isShuttle ? 0.15 : 0.11;
      body.castShadow = true;
      vGroup.add(body);

      // Shuttle transit fleet stripe
      if (isShuttle) {
        const stripeGeo = new THREE.BoxGeometry(0.386, 0.05, 0.824);
        const stripeMat = new THREE.MeshStandardMaterial({
          color: 0x2563EB, // Real transit blue livery stripe
          roughness: 0.3,
        });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 0.14;
        vGroup.add(stripe);
      }

      // Windshield & tinted windows
      const windGeo = new THREE.BoxGeometry(0.34, 0.09, 0.18);
      const windMat = new THREE.MeshStandardMaterial({
        color: 0x1E293B, // Real dark automotive tinted glass
        roughness: 0.1,
        metalness: 0.4,
      });
      const windshield = new THREE.Mesh(windGeo, windMat);
      windshield.position.set(0, isShuttle ? 0.21 : 0.15, 0.2);
      vGroup.add(windshield);

      // Real vehicle headlights (Warm white)
      const headlightGeo = new THREE.BoxGeometry(0.08, 0.04, 0.02);
      const headlightMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });
      const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
      hlLeft.position.set(-0.11, isShuttle ? 0.14 : 0.1, isShuttle ? 0.42 : 0.3);
      const hlRight = new THREE.Mesh(headlightGeo, headlightMat);
      hlRight.position.set(0.11, isShuttle ? 0.14 : 0.1, isShuttle ? 0.42 : 0.3);
      vGroup.add(hlLeft, hlRight);

      // Real vehicle taillights (Safety red)
      const taillightGeo = new THREE.BoxGeometry(0.08, 0.04, 0.02);
      const taillightMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
      const tlLeft = new THREE.Mesh(taillightGeo, taillightMat);
      tlLeft.position.set(-0.11, isShuttle ? 0.14 : 0.1, isShuttle ? -0.42 : -0.3);
      const tlRight = new THREE.Mesh(taillightGeo, taillightMat);
      tlRight.position.set(0.11, isShuttle ? 0.14 : 0.1, isShuttle ? -0.42 : -0.3);
      vGroup.add(tlLeft, tlRight);

      roadGroup.add(vGroup);
      vehicles.push({
        mesh: vGroup,
        angle: (i / 7) * Math.PI * 2,
        speed: 0.005 + (isShuttle ? 0.003 : 0.0045),
        radius: 7.85 + (i % 2 === 0 ? 0.25 : -0.25),
      });
    }

    // ==========================================
    // D. PARKING PRECINCT
    // ==========================================
    const parkingGroup = new THREE.Group();
    modelGroup.add(parkingGroup);

    // Real asphalt parking lot
    const parkBaseGeo = new THREE.BoxGeometry(4.0, 0.03, 3.6);
    const parkBase = new THREE.Mesh(parkBaseGeo, roadMat);
    parkBase.position.set(-9.6, 0.03, -4.0);
    parkBase.receiveShadow = true;
    parkingGroup.add(parkBase);

    // Real diverse parked automotive palette
    const parkedCarPalette = [0xF8FAFC, 0x18181B, 0x94A3B8, 0xDC2626, 0x1D4ED8, 0x475569, 0xD97706];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        if (Math.random() > 0.12) {
          const carGeo = new THREE.BoxGeometry(0.3, 0.14, 0.5);
          const carMat = new THREE.MeshStandardMaterial({
            color: parkedCarPalette[(row * 5 + col) % parkedCarPalette.length],
            roughness: 0.25,
            metalness: 0.55,
          });
          const car = new THREE.Mesh(carGeo, carMat);
          car.position.set(
            -10.8 + col * 0.6,
            0.11,
            -5.0 + row * 1.0
          );
          car.castShadow = true;
          parkingGroup.add(car);

          // Parked car windshield
          const pWindGeo = new THREE.BoxGeometry(0.28, 0.06, 0.14);
          const pWindMat = new THREE.MeshStandardMaterial({
            color: 0x1E293B,
            roughness: 0.1,
          });
          const pWind = new THREE.Mesh(pWindGeo, pWindMat);
          pWind.position.set(-10.8 + col * 0.6, 0.15, -5.0 + row * 1.0 + 0.1);
          parkingGroup.add(pWind);
        }
      }
    }

    // ==========================================
    // E. PUBLIC TRANSPORT: ELEVATED RAIL & METRO TRAIN
    // ==========================================
    const transitGroup = new THREE.Group();
    modelGroup.add(transitGroup);

    const trackPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI * 0.14 + (i / 24) * (Math.PI * 0.64);
      trackPoints.push(new THREE.Vector3(Math.cos(a) * 10.3, 0.95, Math.sin(a) * 10.3));
    }
    const trackCurve = new THREE.CatmullRomCurve3(trackPoints);
    const trackGeo = new THREE.TubeGeometry(trackCurve, 32, 0.075, 6, false);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Real steel transit rails & concrete guide-track
      metalness: 0.7,
      roughness: 0.3,
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    transitGroup.add(trackMesh);

    for (let i = 0; i <= 5; i++) {
      const a = Math.PI * 0.17 + (i / 5) * (Math.PI * 0.58);
      const pilGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.95, 8);
      const pilMat = new THREE.MeshStandardMaterial({ 
        color: 0x94A3B8, // Real poured concrete bridge columns
        roughness: 0.85, 
      });
      const pil = new THREE.Mesh(pilGeo, pilMat);
      pil.position.set(Math.cos(a) * 10.3, 0.47, Math.sin(a) * 10.3);
      pil.castShadow = true;
      transitGroup.add(pil);
    }

    // Real modern transit station with dark steel framework and tinted glass roof
    const stationGeo = new THREE.BoxGeometry(2.4, 0.44, 1.2);
    const stationMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B, // Real dark architectural steel station
      roughness: 0.3,
      metalness: 0.4,
    });
    const station = new THREE.Mesh(stationGeo, stationMat);
    station.position.set(7.6, 1.14, 7.0);
    station.rotation.y = -Math.PI / 4;
    station.castShadow = true;
    transitGroup.add(station);

    // Real modern commuter metro train: Sleek aerodynamic silver/white carriages with signature transit blue line
    const trainGroup = new THREE.Group();
    const trainMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9, // Real sleek stainless steel train carriages
      roughness: 0.25,
      metalness: 0.75,
    });
    const trainGlassMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B, // Real dark tinted passenger windows
      roughness: 0.1,
      metalness: 0.3,
    });
    const trainStripeMat = new THREE.MeshStandardMaterial({
      color: 0x0284C7, // Real electric blue metro transit line livery stripe
      roughness: 0.3,
    });

    [-0.7, 0, 0.7].forEach((zOffset) => {
      const carGeo = new THREE.BoxGeometry(0.34, 0.26, 0.62);
      const car = new THREE.Mesh(carGeo, trainMat);
      car.position.z = zOffset;
      car.castShadow = true;
      trainGroup.add(car);

      // Transit stripe along train
      const strGeo = new THREE.BoxGeometry(0.344, 0.04, 0.624);
      const str = new THREE.Mesh(strGeo, trainStripeMat);
      str.position.set(0, -0.02, zOffset);
      trainGroup.add(str);

      // Continuous passenger window band
      const winGeo = new THREE.BoxGeometry(0.348, 0.08, 0.52);
      const win = new THREE.Mesh(winGeo, trainGlassMat);
      win.position.set(0, 0.04, zOffset);
      trainGroup.add(win);
    });

    // Train front headlight
    const trainHlGeo = new THREE.BoxGeometry(0.12, 0.04, 0.02);
    const trainHlMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });
    const trainHl = new THREE.Mesh(trainHlGeo, trainHlMat);
    trainHl.position.set(0, 0.02, 1.02);
    trainGroup.add(trainHl);

    trainGroup.position.set(7.6, 1.15, 7.0);
    trainGroup.rotation.y = -Math.PI / 4;
    transitGroup.add(trainGroup);

    // ==========================================
    // F. HOTEL & CONVENTION TOWERS
    // ==========================================
    const hotelGroup = new THREE.Group();
    modelGroup.add(hotelGroup);

    // Real modern skyscraper towers: Sky-blue reflective curtain wall glass with dark charcoal spandrel panels
    const towers = [
      { x: -7.2, z: 2.4, h: 4.5, w: 1.6, d: 1.4, baseCol: 0x1E293B, bodyCol: 0x60A5FA }, // Blue glass curtain wall tower
      { x: -9.0, z: 1.1, h: 3.4, w: 1.4, d: 1.2, baseCol: 0x334155, bodyCol: 0xE2E8F0 }, // Architectural limestone & steel tower
      { x: -7.9, z: 4.2, h: 2.8, w: 1.3, d: 1.2, baseCol: 0x1E293B, bodyCol: 0x93C5FD }, // Reflective glass commercial tower
    ];

    towers.forEach((t) => {
      const baseHeight = 0.8;
      const baseGeo = new THREE.BoxGeometry(t.w + 0.1, baseHeight, t.d + 0.1);
      const baseMat = new THREE.MeshStandardMaterial({
        color: t.baseCol,
        roughness: 0.4,
        metalness: 0.3,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(t.x, baseHeight / 2 + 0.02, t.z);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      hotelGroup.add(baseMesh);

      const mainHeight = t.h - baseHeight;
      const bGeo = new THREE.BoxGeometry(t.w, mainHeight, t.d);
      const bMat = new THREE.MeshStandardMaterial({
        color: t.bodyCol, // Real reflective curtain-wall glass
        roughness: 0.15,
        metalness: 0.6,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(t.x, baseHeight + mainHeight / 2 + 0.02, t.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      hotelGroup.add(bMesh);

      // Real architectural horizontal mullion bands
      const bandGeo = new THREE.BoxGeometry(t.w + 0.02, 0.08, t.d + 0.02);
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0x1E293B, // Real dark aluminum spandrel floor mullions
        roughness: 0.3,
        metalness: 0.4,
      });
      for (let y = baseHeight + 0.4; y < t.h; y += 0.55) {
        const band = new THREE.Mesh(bandGeo, bandMat);
        band.position.set(t.x, y, t.z);
        hotelGroup.add(band);
      }
    });

    // Hospitality & VIP Fan Pavilion (Real warm architectural teak wood with clean white canopy)
    const pavilionGeo = new THREE.BoxGeometry(2.1, 0.22, 1.3);
    const pavilionMat = new THREE.MeshStandardMaterial({
      color: 0x9A3412, // Real architectural warm teak wood slats
      roughness: 0.7,
    });
    const pavilion = new THREE.Mesh(pavilionGeo, pavilionMat);
    pavilion.position.set(-5.0, 0.38, 3.6);
    pavilion.castShadow = true;
    hotelGroup.add(pavilion);

    // Pavilion clean white architectural roof canopy
    const pavRoofGeo = new THREE.BoxGeometry(2.2, 0.04, 1.4);
    const pavRoofMat = new THREE.MeshStandardMaterial({
      color: 0xF8FAFC,
      roughness: 0.3,
    });
    const pavRoof = new THREE.Mesh(pavRoofGeo, pavRoofMat);
    pavRoof.position.set(-5.0, 0.51, 3.6);
    hotelGroup.add(pavRoof);

    // ==========================================
    // G. PEDESTRIAN CROWD FLOW (Real-life varied attire colors)
    // ==========================================
    const crowdCount = 130;
    const crowdGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.2, 6);
    const crowdMat = new THREE.MeshStandardMaterial({
      roughness: 0.5,
    });
    const crowdInstanced = new THREE.InstancedMesh(crowdGeo, crowdMat, crowdCount);
    crowdInstanced.castShadow = true;
    modelGroup.add(crowdInstanced);

    // Real human clothing colors: navy, denim blue, black jackets, white shirts, crimson jackets, forest green, warm amber, khaki
    const crowdAttireColors = [
      new THREE.Color(0x1E3A8A), // Navy
      new THREE.Color(0x2563EB), // Blue
      new THREE.Color(0x18181B), // Black
      new THREE.Color(0xF8FAFC), // White
      new THREE.Color(0xDC2626), // Red
      new THREE.Color(0x15803D), // Forest green
      new THREE.Color(0xD97706), // Amber
      new THREE.Color(0xA8A29E), // Khaki
      new THREE.Color(0x3B82F6), // Denim
      new THREE.Color(0x334155), // Charcoal
    ];

    for (let i = 0; i < crowdCount; i++) {
      const assignedColor = crowdAttireColors[i % crowdAttireColors.length];
      crowdInstanced.setColorAt(i, assignedColor);
    }
    if (crowdInstanced.instanceColor) {
      crowdInstanced.instanceColor.needsUpdate = true;
    }

    const crowdData: Array<{
      progress: number;
      speed: number;
      gateIdx: number;
      offsetLane: number;
    }> = [];

    for (let i = 0; i < crowdCount; i++) {
      crowdData.push({
        progress: Math.random(),
        speed: 0.0022 + Math.random() * 0.0028,
        gateIdx: i % 4,
        offsetLane: (Math.random() - 0.5) * 0.55,
      });
    }

    // ==========================================
    // INTERACTION & PARALLAX
    // ==========================================
    let targetTiltX = 0;
    let targetTiltY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetTiltY = x * 0.12;
      targetTiltX = -y * 0.08;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    const dummyMat = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyScale = new THREE.Vector3(1, 1, 1);
    const dummyQuat = new THREE.Quaternion();

    // ==========================================
    // ANIMATION LOOP
    // ==========================================
    let clock = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock += 0.016;

      // Camera parallax
      const idleBobY = Math.sin(clock * 0.8) * 0.02;
      const idleBobX = Math.cos(clock * 0.6) * 0.015;
      modelGroup.rotation.y += (targetTiltY + idleBobY - modelGroup.rotation.y) * 0.04;
      modelGroup.rotation.x += (targetTiltX + idleBobX - modelGroup.rotation.x) * 0.04;

      // Dynamic stage spotlight sweep
      const sweepAngle1 = Math.sin(clock * 1.8) * 0.35;
      const sweepAngle2 = -Math.sin(clock * 1.8 + 0.6) * 0.35;
      beam1.rotation.y = sweepAngle1;
      beam2.rotation.y = sweepAngle2;
      beam1.rotation.x = 0.2 + Math.cos(clock * 1.2) * 0.1;
      beam2.rotation.x = 0.2 - Math.cos(clock * 1.2) * 0.1;

      // Stage spotlight ambient modulation
      stageLipMat.emissiveIntensity = 0.7 + Math.sin(clock * 3) * 0.2;
      beamMat1.opacity = 0.35 + Math.sin(clock * 2) * 0.1;
      beamMat2.opacity = 0.35 + Math.cos(clock * 2) * 0.1;

      // Vehicles on road
      vehicles.forEach((v) => {
        v.angle += v.speed;
        const vx = Math.cos(v.angle) * v.radius;
        const vz = Math.sin(v.angle) * v.radius;
        v.mesh.position.set(vx, 0.03, vz);
        v.mesh.rotation.y = -v.angle + Math.PI / 2;
      });

      // Metro Train
      const trainPhase = (Math.sin(clock * 0.6) + 1) * 0.5;
      const trainU = 0.2 + trainPhase * 0.6;
      const trainPos = trackCurve.getPointAt(trainU);
      const trainTangent = trackCurve.getTangentAt(trainU);
      trainGroup.position.copy(trainPos);
      trainGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), trainTangent);

      // Event Lifecycle & Lighting Pulse
      const cycleTime = (clock % 32) / 32;
      const isDispersal = cycleTime > 0.65;
      venueInternalLight.intensity = 2.4 + Math.sin(clock * 2.5) * 0.5;

      // Crowd Movement
      crowdData.forEach((cd, i) => {
        cd.progress += cd.speed;
        if (cd.progress > 1.0) cd.progress = 0;

        const gateAngle = entranceAngles[cd.gateIdx];
        const outerRadius = 8.5;
        const gateRadius = 4.8;
        const currentDist = !isDispersal
          ? outerRadius - cd.progress * (outerRadius - gateRadius)
          : gateRadius + cd.progress * (outerRadius - gateRadius);

        const px = Math.cos(gateAngle) * currentDist + Math.sin(gateAngle) * cd.offsetLane;
        const pz = Math.sin(gateAngle) * currentDist - Math.cos(gateAngle) * cd.offsetLane;
        const py = 0.13 + Math.sin(clock * 6 + i) * 0.015;

        dummyPos.set(px, py, pz);
        dummyMat.compose(dummyPos, dummyQuat, dummyScale);
        crowdInstanced.setMatrixAt(i, dummyMat);
      });
      crowdInstanced.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* 3D Canvas Viewport */}
      <div
        className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] overflow-visible pointer-events-auto"
        style={{
          maskImage:
            "radial-gradient(ellipse 92% 88% at 50% 50%, black 72%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 92% 88% at 50% 50%, black 72%, transparent 100%)",
        }}
      >
        {hasWebGL ? (
          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            title="Interactive 3D Mega-Event Ecosystem (Move cursor or drag to inspect)"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-transparent">
            <AlertCircle className="w-8 h-8 text-[#C9A15C] mb-2" />
            <h4 className="text-sm font-semibold text-[#0B1120]">
              Interactive Digital Twin
            </h4>
            <p className="text-xs text-[#8A806F] max-w-sm">
              Enable WebGL hardware acceleration to view the live event ecosystem simulation.
            </p>
          </div>
        )}

        {/* Top-Right Telemetry & Drag HUD */}
        <div className="absolute top-4 right-4 sm:right-6 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5EFE2]/90 backdrop-blur-md border border-[#E4D9BE]/80 shadow-xs text-[11px] font-mono font-medium text-[#16213B]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>LIVE DIGITAL TWIN</span>
          <span className="text-[#8A806F]">•</span>
          <Rotate3d className="w-3.5 h-3.5 text-[#8A806F]" />
          <span className="text-[#8A806F] hidden sm:inline">DRAG TO INSPECT</span>
        </div>
      </div>
    </div>
  );
};
