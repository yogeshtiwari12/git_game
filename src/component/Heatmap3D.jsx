import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//  Modes 
const MODES = {
  github:    { label:"GitHub Classic", emoji:"", desc:"The OG green",            bg:"#0d1117", fog:"#0d1117", ground:"#161b22", grid:"#21262d", rimLight:0x39d353, rough:0.55, metal:0.10, stops:[[0,"#161b22"],[0.01,"#1a4f2a"],[0.20,"#206b35"],[0.45,"#2ea043"],[0.75,"#3fb950"],[1.00,"#56d364"]] },
  cyberpunk: { label:"Cyberpunk",      emoji:"", desc:"Neon city nights",         bg:"#04010d", fog:"#04010d", ground:"#0a051c", grid:"#150830", rimLight:0xff00ff, rough:0.15, metal:0.85, stops:[[0,"#0a051c"],[0.01,"#220066"],[0.20,"#0055cc"],[0.40,"#00ccff"],[0.65,"#ff00cc"],[0.85,"#ffee00"],[1.00,"#ffffff"]] },
  inferno:   { label:"Inferno",        emoji:"", desc:"Blazing heat",             bg:"#080002", fog:"#080002", ground:"#120005", grid:"#250010", rimLight:0xff4400, rough:0.65, metal:0.05, stops:[[0,"#120005"],[0.01,"#3d0015"],[0.18,"#821030"],[0.38,"#cc2000"],[0.58,"#f05000"],[0.78,"#faa000"],[1.00,"#fff060"]] },
  aurora:    { label:"Aurora",         emoji:"", desc:"Northern lights",          bg:"#010912", fog:"#010912", ground:"#030f1c", grid:"#071830", rimLight:0x7700ff, rough:0.30, metal:0.55, stops:[[0,"#030f1c"],[0.01,"#092040"],[0.20,"#0e4a6e"],[0.40,"#0a7a60"],[0.60,"#2060c0"],[0.80,"#7030b0"],[1.00,"#d080ff"]] },
  volcano:   { label:"Volcano",        emoji:"", desc:"Lava rising",              bg:"#070000", fog:"#070000", ground:"#120300", grid:"#200400", rimLight:0xff3300, rough:0.70, metal:0.05, stops:[[0,"#120300"],[0.01,"#400000"],[0.18,"#8b0000"],[0.42,"#d42000"],[0.65,"#ff5500"],[0.85,"#ffaa00"],[1.00,"#ffee00"]] },
  ocean:     { label:"Deep Ocean",     emoji:"", desc:"Bioluminescent deep sea",  bg:"#000610", fog:"#000610", ground:"#001525", grid:"#002848", rimLight:0x00f5d4, rough:0.20, metal:0.70, stops:[[0,"#001525"],[0.01,"#002d58"],[0.20,"#004a90"],[0.42,"#0082c8"],[0.65,"#00c8e0"],[0.85,"#00f0c0"],[1.00,"#b0fff0"]] },
  matrix:    { label:"Matrix",         emoji:"", desc:"Follow the white rabbit",  bg:"#000200", fog:"#000200", ground:"#000f00", grid:"#002800", rimLight:0x00ff41, rough:0.80, metal:0.00, stops:[[0,"#000f00"],[0.01,"#002a00"],[0.25,"#007000"],[0.55,"#00c030"],[0.80,"#00ff41"],[1.00,"#ccffd8"]] },
  galaxy:    { label:"Galaxy",         emoji:"", desc:"Across the cosmos",        bg:"#010008", fog:"#010008", ground:"#040012", grid:"#080028", rimLight:0xda70d6, rough:0.10, metal:0.90, stops:[[0,"#040012"],[0.01,"#1a0060"],[0.22,"#40008a"],[0.45,"#7000cc"],[0.68,"#a030e8"],[0.88,"#d870d8"],[1.00,"#fff0fe"]] },
  candy:     { label:"Candy",          emoji:"", desc:"Sweet pastel overdose",    bg:"#160816", fog:"#160816", ground:"#240a24", grid:"#361436", rimLight:0xff69b4, rough:0.25, metal:0.45, stops:[[0,"#240a24"],[0.01,"#560070"],[0.22,"#b000b0"],[0.45,"#ee30a0"],[0.68,"#ff88cc"],[0.88,"#ffb8e8"],[1.00,"#fff0fc"]] },
  snake:     { label:"Snake Game",     emoji:"", desc:"Eat all contributions!",   bg:"#040d07", fog:"#040d07", ground:"#061508", grid:"#0b2414", rimLight:0x3fb950, rough:0.55, metal:0.10, stops:[[0,"#061508"],[0.01,"#0d3818"],[0.35,"#1a7030"],[0.70,"#2db050"],[1.00,"#56f090"]] },
  rave:      { label:"Rave Party",     emoji:"", desc:"Every bar its own beat!",  bg:"#050008", fog:"#050008", ground:"#0a0010", grid:"#10001a", rimLight:0xff00ff, rough:0.10, metal:0.95, stops:[[0,"#050008"],[0.5,"#ff00ff"],[1.00,"#00ffff"]] },
  thunder:   { label:"Thunderstorm",   emoji:"", desc:"Lightning strikes the city!", bg:"#03050f", fog:"#03050f", ground:"#060a1a", grid:"#0a1030", rimLight:0x8888ff, rough:0.60, metal:0.20, stops:[[0,"#060a1a"],[0.01,"#0d1640"],[0.30,"#1a2a70"],[0.65,"#3050c0"],[1.00,"#e0e8ff"]] },
  meltdown:  { label:"Meltdown",       emoji:"", desc:"Buildings melt like lava wax!",bg:"#080100", fog:"#080100", ground:"#180500", grid:"#280800", rimLight:0xff5500, rough:0.80, metal:0.00, stops:[[0,"#180500"],[0.01,"#4a1000"],[0.30,"#aa2200"],[0.60,"#ff6600"],[0.85,"#ffcc00"],[1.00,"#ffff88"]] },
  earthquake:{ label:"Earthquake",     emoji:"", desc:"The ground tears apart!",     bg:"#050303", fog:"#050303", ground:"#1a0a06", grid:"#2a1008", rimLight:0xff8844, rough:0.85, metal:0.00, stops:[[0,"#1a0a06"],[0.01,"#3d1a10"],[0.30,"#7a3018"],[0.65,"#c05030"],[1.00,"#ff9060"]] },
  typhoon:   { label:"Typhoon",        emoji:"", desc:"Category 5 — buildings fly!",  bg:"#010508", fog:"#010508", ground:"#050e14", grid:"#081824", rimLight:0x88ccff, rough:0.30, metal:0.50, stops:[[0,"#050e14"],[0.01,"#0a2030"],[0.30,"#104060"],[0.65,"#2080b0"],[1.00,"#80d0ff"]] },
  custom:    { label:"Custom",         emoji:"", desc:"Your own color palette",   bg:"#0a0a0a", fog:"#0a0a0a", ground:"#141414", grid:"#222222", rimLight:0xffffff, rough:0.40, metal:0.20, stops:[[0,"#0a0a0a"],[0.01,"#111111"],[1.00,"#ffffff"]] },
};

const ZOOM_LEVELS = [
  { pos: [26, 38, 72], label: "Wide" },
  { pos: [26, 22, 44], label: "Medium" },
  { pos: [26, 12, 22], label: "Close" },
];

function mapColor(count, max, stops) {
  if (count === 0) return new THREE.Color(stops[0][1]);
  const t = Math.max(0.0001, Math.min(1, count / max));
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i], [t1, c1] = stops[i + 1];
    if (t >= t0 && t <= t1) {
      const local = (t - t0) / (t1 - t0);
      return new THREE.Color(c0).lerp(new THREE.Color(c1), local);
    }
  }
  return new THREE.Color(stops[stops.length - 1][1]);
}

function makeTextSprite(text, color = "#8b949e") {
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 32;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = color;
  ctx.font = "bold 22px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 4, 16);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(3.5, 0.9, 1);
  return sp;
}

function buildSnakePath(weeks) {
  const path = [];
  for (let wi = 0; wi < weeks.length; wi++) {
    const len = weeks[wi].contributionDays.length;
    if (wi % 2 === 0) for (let di = 0; di < len; di++) path.push([wi, di]);
    else              for (let di = len - 1; di >= 0; di--) path.push([wi, di]);
  }
  return path;
}

const MAX_H = 20;

//  Component 
export default function Heatmap3D({ calendar }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const snakeRef = useRef({ running: false, idx: 0, body: [], interval: null });

  const [mode,        setMode]        = useState("github");
  const [snakeState,  setSnakeState]  = useState("idle");
  const [tooltip,     setTooltip]     = useState(null);
  const [zoomIdx,     setZoomIdx]     = useState(0);
  const [spinning,    setSpinning]    = useState(false);
  const [customColor, setCustomColor] = useState("#00ff88");
  const [customColor2,setCustomColor2]= useState("#ff00ff");
  const modeRef     = useRef("github");
  const spinningRef  = useRef(false);
  const effectRef    = useRef(null); // tracks per-bar effect state for dramatic modes

  const weeks    = calendar.weeks;
  const total    = calendar.totalContributions;
  const allDays  = weeks.flatMap((w) => w.contributionDays);
  const maxCount = Math.max(...allDays.map((d) => d.contributionCount), 1);

  //  Custom mode stops 
  const getStops = useCallback((m) => {
    if (m === "custom") {
      return [[0,"#0a0a0a"],[0.01, customColor + "44"],[0.5, customColor],[1.0, customColor2]];
    }
    return MODES[m].stops;
  }, [customColor, customColor2]);

  //  Apply mode colors 
  const applyModeColors = useCallback((m) => {
    const { barMap, scene, rimLight: rl } = sceneRef.current;
    if (!barMap || !scene) return;
    const cfg   = MODES[m];
    const stops = getStops(m);
    scene.background = new THREE.Color(cfg.bg);
    if (scene.fog) scene.fog.color.set(cfg.fog);
    if (rl) rl.color.set(cfg.rimLight);
    barMap.forEach(({ mesh, count }) => {
      const col = mapColor(count, maxCount, stops);
      mesh.material.color.set(col);
      mesh.material.roughness = cfg.rough ?? 0.4;
      mesh.material.metalness = cfg.metal ?? 0.15;
      mesh.material.emissive.set(col.clone().multiplyScalar(count > 0 ? 0.18 : 0.0));
      mesh.userData.targetScaleY = 1;
    });
  }, [maxCount, getStops]);

  //  Snake 
  function startSnake() {
    const { barMap } = sceneRef.current;
    if (!barMap) return;
    applyModeColors("snake");
    const path     = buildSnakePath(weeks);
    const BODY_LEN = 12;
    const HEAD_COL = new THREE.Color("#ffff00");
    const BODY_COL = new THREE.Color("#00ff88");
    const DEAD_COL = new THREE.Color("#071a0e");
    snakeRef.current = { running: true, idx: 0, body: [], path };
    setSnakeState("running");
    const interval = setInterval(() => {
      const sr = snakeRef.current;
      if (!sr.running) { clearInterval(interval); return; }
      if (sr.idx >= sr.path.length) { clearInterval(interval); sr.running = false; setSnakeState("done"); return; }
      const [wi, di] = sr.path[sr.idx];
      const entry = barMap.get(`${wi}_${di}`);
      if (entry) {
        entry.mesh.material.color.set(HEAD_COL);
        entry.mesh.material.emissive.set(HEAD_COL.clone().multiplyScalar(0.5));
        sr.body.forEach(([bwi,bdi], bi) => {
          const b = barMap.get(`${bwi}_${bdi}`);
          if (b) { const t = 1 - bi/BODY_LEN; const col = BODY_COL.clone().lerp(DEAD_COL, 1-t); b.mesh.material.color.set(col); b.mesh.material.emissive.set(col.clone().multiplyScalar(0.15)); }
        });
        if (sr.body.length >= BODY_LEN) {
          const [twi,tdi] = sr.body[0]; const tail = barMap.get(`${twi}_${tdi}`);
          if (tail) { tail.mesh.material.color.set(DEAD_COL); tail.mesh.material.emissive.set(new THREE.Color("#000")); tail.mesh.userData.targetScaleY = 0.02; }
          sr.body = sr.body.slice(1);
        }
      }
      sr.body = [...sr.body, [wi,di]]; sr.idx += 1;
    }, 28);
    snakeRef.current.interval = interval;
  }

  function stopSnake()  { const sr = snakeRef.current; sr.running = false; clearInterval(sr.interval); setSnakeState("idle"); applyModeColors("snake"); }
  function resetSnake() { stopSnake(); setTimeout(startSnake, 60); }

  //  Mode / color changes 
  useEffect(() => {
    modeRef.current = mode;
    const DRAMATIC = ["thunder","meltdown","earthquake","typhoon"];
    if (mode === "snake" || mode === "rave" || DRAMATIC.includes(mode)) return;
    const sr = snakeRef.current;
    if (sr.running) { sr.running = false; clearInterval(sr.interval); setSnakeState("idle"); }
    applyModeColors(mode);
  }, [mode, customColor, customColor2, applyModeColors]);

  // When switching TO rave, set scene bg/fog/rimLight immediately
  useEffect(() => {
    if (mode !== "rave") return;
    const { scene, rimLight: rl } = sceneRef.current;
    if (!scene) return;
    const cfg = MODES.rave;
    scene.background = new THREE.Color(cfg.bg);
    if (scene.fog) scene.fog.color.set(cfg.fog);
    if (rl) rl.color.set(cfg.rimLight);
  }, [mode]);

  // Dramatic mode setup — seed per-bar effect data then apply bg/rim
  useEffect(() => {
    const DRAMATIC = ["thunder","meltdown","earthquake","typhoon"];
    if (!DRAMATIC.includes(mode)) return;
    const { barMap, scene, rimLight: rl } = sceneRef.current;
    if (!barMap || !scene) return;
    const cfg = MODES[mode];
    scene.background = new THREE.Color(cfg.bg);
    if (scene.fog) scene.fog.color.set(cfg.fog);
    if (rl) rl.color.set(cfg.rimLight);
    // Reset meshes to upright + original color for this mode first
    barMap.forEach(({ mesh, count }) => {
      mesh.scale.y = 1;
      mesh.rotation.set(0, 0, 0);
      mesh.position.x = mesh.userData.wi;
      mesh.position.z = mesh.userData.di;
      const col = mapColor(count, maxCount, cfg.stops);
      mesh.material.color.set(col);
      mesh.material.roughness = cfg.rough;
      mesh.material.metalness = cfg.metal;
      mesh.material.emissive.set(col.clone().multiplyScalar(count > 0 ? 0.15 : 0));
      // Per-bar effect seeds
      mesh.userData.targetScaleY = 1;
      mesh.userData.origCount    = mesh.userData.count; // store original count
      mesh.userData.shakePhase   = Math.random() * Math.PI * 2;
      mesh.userData.shakeAmp     = 0;
      mesh.userData.meltSpeed    = 0.0004 + Math.random() * 0.0008; // meltdown
      mesh.userData.meltTimer    = Math.random() * 120;              // staggered start
      mesh.userData.quakeTimer   = Math.floor(Math.random() * 180);  // earthquake fall delay
      mesh.userData.quakeFallen  = false;
      mesh.userData.windDelay    = Math.floor(Math.random() * 200);  // typhoon
      mesh.userData.windFallen   = false;
      mesh.userData.lightStruck  = false;
    });
    effectRef.current = { frame: 0 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  //  Zoom 
  useEffect(() => {
    const { camera, controls } = sceneRef.current;
    if (!camera || !controls) return;
    const [x,y,z] = ZOOM_LEVELS[zoomIdx].pos;
    camera.position.set(x, y, z);
    controls.update();
  }, [zoomIdx]);

  //  Spin toggle 
  useEffect(() => {
    spinningRef.current = spinning;
    const { controls } = sceneRef.current;
    if (!controls) return;
    controls.autoRotate      = spinning;
    controls.autoRotateSpeed = 2.0;
  }, [spinning]);

  //  Build scene 
  useEffect(() => {
    const el = mountRef.current;
    const W = el.clientWidth, H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(MODES.github.bg);
    scene.fog        = new THREE.Fog(MODES.github.fog, 80, 170);

    const camera = new THREE.PerspectiveCamera(42, W/H, 0.1, 400);
    camera.position.set(26, 38, 72);
    camera.lookAt(26, 0, 3.5);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(40, 60, 40);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 1; dir.shadow.camera.far = 300;
    dir.shadow.camera.left = dir.shadow.camera.bottom = -90;
    dir.shadow.camera.right = dir.shadow.camera.top   =  90;
    dir.target.position.set(26, 0, 3.5); // always aim at scene center
    scene.add(dir);
    scene.add(dir.target);
    // Rim / fill light — color changes with mode
    const rimLight = new THREE.PointLight(MODES.github.rimLight, 0.7, 180);
    rimLight.position.set(-20, 30, -10);
    scene.add(rimLight);
    // Subtle under-fill
    const fillLight = new THREE.DirectionalLight(0x334466, 0.3);
    fillLight.position.set(-30, -20, 40);
    scene.add(fillLight);
    // Running angle for light orbit
    let lightAngle = Math.atan2(40 - 3.5, 40 - 26); // initial angle matching starting position

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 30),
      new THREE.MeshStandardMaterial({ color: MODES.github.ground, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(26, -0.01, 3.5);
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(100, 100, MODES.github.grid, MODES.github.grid);
    gridHelper.position.set(26, 0, 3.5);
    scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.07;
    controls.minDistance = 8; controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.target.set(26, 0, 3.5);

    // Bars
    const barMap = new Map(), meshList = [], monthSeen = new Map();
    weeks.forEach((week, wi) => {
      const m = new Date(week.contributionDays[0].date).toLocaleString("default", { month: "short" });
      if (!monthSeen.has(m)) { monthSeen.set(m, wi); const sp = makeTextSprite(m, "#8b949e"); sp.position.set(wi+0.4, -0.7, -1.4); scene.add(sp); }
      week.contributionDays.forEach((day, di) => {
        const count = day.contributionCount;
        const barH  = count === 0 ? 0.05 : 0.05 + (count / maxCount) * MAX_H;
        const geo   = new THREE.BoxGeometry(0.82, barH, 0.82);
        geo.translate(0, barH / 2, 0);
        const col = mapColor(count, maxCount, MODES.github.stops);
        const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col.clone().multiplyScalar(count > 0 ? 0.18 : 0), roughness: MODES.github.rough, metalness: MODES.github.metal, envMapIntensity: 1.0 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(wi, 0, di); mesh.castShadow = mesh.receiveShadow = true;
        mesh.userData = { date: day.date, count, wi, di, targetScaleY: 1 };
        scene.add(mesh); barMap.set(`${wi}_${di}`, { mesh, count }); meshList.push(mesh);
      });
    });
    ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].forEach((d, i) => { const sp = makeTextSprite(d, "#6e7681"); sp.scale.set(2.2,0.7,1); sp.position.set(-2.6,-0.7,i); scene.add(sp); });

    // Raycaster
    const raycaster = new THREE.Raycaster(), mouse2 = new THREE.Vector2();
    let hovered = null, hovOrig = null;
    function onMouseMove(e) {
      const rect = el.getBoundingClientRect();
      mouse2.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse2.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse2, camera);
      const hits = raycaster.intersectObjects(meshList);
      if (hovered && hovered !== hits[0]?.object) { hovered.material.emissive.set(hovOrig); hovered = null; }
      if (hits.length) {
        const obj = hits[0].object;
        if (obj !== hovered) { hovered = obj; hovOrig = obj.material.emissive.clone(); obj.material.emissive.set(new THREE.Color(0xffffff).multiplyScalar(0.3)); setTooltip({ ...obj.userData, x: e.clientX, y: e.clientY }); }
        else setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : t);
      } else setTooltip(null);
    }

    // Double-click / double-tap = cycle zoom
    let lastTap = 0;
    function cycleZoom() { setZoomIdx((z) => (z + 1) % ZOOM_LEVELS.length); }
    function onTouchEnd() { const n = Date.now(); if (n - lastTap < 300) cycleZoom(); lastTap = n; }

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("dblclick",  cycleZoom);
    el.addEventListener("touchend",  onTouchEnd);

    function onResize() { const w = el.clientWidth, h = el.clientHeight; camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
    window.addEventListener("resize", onResize);

    // Rave: per-bar hue offsets seeded randomly
    const raveOffsets = new Map();
    barMap.forEach((_, key) => { raveOffsets.set(key, Math.random() * Math.PI * 2); });

    // Store orig positions for earthquake/typhoon reset
    barMap.forEach(({ mesh }) => {
      mesh.userData.origX = mesh.position.x;
      mesh.userData.origZ = mesh.position.z;
    });

    // Thunder: flash point light
    const boltLight = new THREE.PointLight(0xaaccff, 0, 120);
    boltLight.position.set(26, 50, 3.5);
    scene.add(boltLight);
    let nextBolt = 60 + Math.floor(Math.random() * 120);

    let animId, frame = 0;
    // Exact formula OrbitControls uses internally: 2π / 3600 * autoRotateSpeed per frame
    const SPIN_RAD = (2 * Math.PI / 3600) * 2.8;
    const ORBIT_R  = 55; // orbit radius of the sun light around scene center
    function animate() {
      animId = requestAnimationFrame(animate);
      frame++;
      const currentMode = modeRef.current;
      // Orbit dir light around scene center so shadows sweep across bars
      if (spinningRef.current) {
        lightAngle -= SPIN_RAD;
        dir.position.set(
          26 + Math.cos(lightAngle) * ORBIT_R,
          62,
          3.5 + Math.sin(lightAngle) * ORBIT_R
        );
        dir.shadow.camera.updateProjectionMatrix();
      }
      barMap.forEach(({ mesh, count }, key) => {
        const ud  = mesh.userData;
        const tgt = ud.targetScaleY ?? 1;
        if (Math.abs(mesh.scale.y - tgt) > 0.001) mesh.scale.y += (tgt - mesh.scale.y) * 0.14;

        // ---- THUNDER ----
        if (currentMode === "thunder" && count > 0) {
          // Random lightning strike on this bar
          if (frame === (ud.nextStrike ?? -1)) {
            ud.nextStrike = frame + 80 + Math.floor(Math.random() * 300);
            mesh.material.emissive.set(new THREE.Color(1, 1, 1));
            mesh.userData.flashOut = frame + 6;
          }
          if (ud.flashOut && frame >= ud.flashOut) {
            const col = mapColor(count, maxCount, MODES.thunder.stops);
            mesh.material.emissive.set(col.clone().multiplyScalar(0.15));
            ud.flashOut = null;
          }
          if (!ud.nextStrike) ud.nextStrike = frame + Math.floor(Math.random() * 300);
        }

        // ---- MELTDOWN ----
        if (currentMode === "meltdown" && count > 0) {
          if (ud.meltTimer > 0) { ud.meltTimer--; }
          else {
            // Scale Y down slowly — melting
            if (mesh.scale.y > 0.02) {
              mesh.scale.y = Math.max(0.02, mesh.scale.y - ud.meltSpeed);
              // As it melts, color shifts to cool ash gray
              const t = 1 - mesh.scale.y;
              const meltCol = new THREE.Color("#ff6600").lerp(new THREE.Color("#332200"), t);
              mesh.material.color.set(meltCol);
              mesh.material.emissive.set(meltCol.clone().multiplyScalar(0.25 * (1 - t)));
            }
            ud.targetScaleY = mesh.scale.y; // prevent snap-back
          }
        }

        // ---- EARTHQUAKE ----
        if (currentMode === "earthquake") {
          if (!ud.quakeFallen) {
            if (ud.quakeTimer > 0) {
              // Shaking phase: oscillate x/z
              ud.quakeTimer--;
              const amp = 0.08 + (ud.quakeTimer / 180) * 0.1;
              mesh.position.x = ud.origX + Math.sin(frame * 0.6 + ud.shakePhase) * amp;
              mesh.position.z = ud.origZ + Math.cos(frame * 0.5 + ud.shakePhase) * amp;
            } else {
              // Fall: tilt sideways then scale y to 0
              const dir2 = (ud.wi % 2 === 0 ? 1 : -1) * (ud.di % 2 === 0 ? 1 : -1);
              mesh.rotation.z += dir2 * 0.04;
              mesh.position.x = ud.origX + Math.sin(mesh.rotation.z) * 0.5;
              if (Math.abs(mesh.rotation.z) > Math.PI / 2) {
                mesh.rotation.z = Math.sign(mesh.rotation.z) * Math.PI / 2;
                if (mesh.scale.y > 0.04) { mesh.scale.y -= 0.015; ud.targetScaleY = mesh.scale.y; }
                else { ud.quakeFallen = true; }
              }
              const dustCol = new THREE.Color("#c05030").lerp(new THREE.Color("#3a1a0a"), Math.min(1, Math.abs(mesh.rotation.z) / (Math.PI/2)));
              mesh.material.color.set(dustCol);
            }
          }
        }

        // ---- TYPHOON ----
        if (currentMode === "typhoon" && count > 0) {
          if (ud.windDelay > 0) { ud.windDelay--; }
          else if (!ud.windFallen) {
            // Lean progressively in wind direction (z axis tilt)
            const lean = Math.min(Math.PI / 2, (ud.windLean ?? 0) + 0.05);
            ud.windLean = lean;
            mesh.rotation.z = lean * ((ud.wi % 3 === 0) ? -1 : 1);
            // Shrink and drift
            if (lean > 0.6) {
              mesh.scale.y = Math.max(0.02, mesh.scale.y - 0.03);
              mesh.position.x += ((ud.wi % 3 === 0) ? -0.04 : 0.04);
              ud.targetScaleY = mesh.scale.y;
            }
            if (lean >= Math.PI / 2 && mesh.scale.y <= 0.04) ud.windFallen = true;
            const windCol = new THREE.Color("#2080b0").lerp(new THREE.Color("#80d0ff"), lean / (Math.PI/2));
            mesh.material.color.set(windCol);
            mesh.material.emissive.set(windCol.clone().multiplyScalar(0.2));
          }
        }

        // Rave: cycle hue per bar independently
        if (currentMode === "rave" && count > 0) {
          const offset = raveOffsets.get(key) || 0;
          const speed  = 0.012 + (count / maxCount) * 0.025; // faster for taller bars
          const hue    = ((frame * speed + offset) % (Math.PI * 2)) / (Math.PI * 2);
          const sat    = 0.9 + Math.sin(frame * 0.007 + offset) * 0.1;
          const lit    = 0.45 + (count / maxCount) * 0.25;
          const col    = new THREE.Color().setHSL(hue, sat, lit);
          mesh.material.color.set(col);
          mesh.material.emissive.set(col.clone().multiplyScalar(0.35));
          mesh.material.roughness = MODES.rave.rough;
          mesh.material.metalness = MODES.rave.metal;
        }
      });

      // Thunder: flash the bolt light
      if (currentMode === "thunder") {
        if (frame >= nextBolt) {
          boltLight.position.set(10 + Math.random() * 32, 40 + Math.random() * 20, Math.random() * 7);
          boltLight.intensity = 6 + Math.random() * 4;
          nextBolt = frame + 5;
          // schedule off
          if (Math.random() > 0.5) nextBolt = frame + 60 + Math.floor(Math.random() * 180);
        }
        boltLight.intensity *= 0.82; // quick decay
      } else {
        boltLight.intensity = 0;
      }
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    sceneRef.current = { barMap, renderer, scene, camera, controls, rimLight, dir };

    return () => {
      cancelAnimationFrame(animId); controls.dispose(); renderer.dispose();
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("dblclick", cycleZoom);
      el.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [calendar]);

  const cfg = MODES[mode];

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Toolbar */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:"10px", marginBottom:"10px", background:"#161b22", border:"1px solid #30363d", borderRadius:"12px", padding:"12px 16px" }}>

        {/* Mode dropdown */}
        <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
          <span style={{ color:"#8b949e", fontSize:"12px" }}>Mode:</span>
          <select value={mode} onChange={(e) => { setMode(e.target.value); if (e.target.value !== "snake") setSnakeState("idle"); }}
            style={{ background:"#0d1117", color:"#e6edf3", border:"1px solid #30363d", borderRadius:"8px", padding:"5px 10px", fontSize:"13px", cursor:"pointer", outline:"none", fontWeight:600 }}>
            {Object.entries(MODES).map(([k, { label, emoji }]) => <option key={k} value={k}>{emoji} {label}</option>)}
          </select>
        </div>

        <span style={{ color:"#484f58", fontSize:"11px", fontStyle:"italic" }}>{cfg.desc}</span>

        {/* Custom color pickers */}
        {mode === "custom" && (
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ color:"#8b949e", fontSize:"12px" }}>From:</span>
            <input type="color" value={customColor}  onChange={(e) => setCustomColor(e.target.value)}  style={{ width:34, height:28, border:"1px solid #30363d", borderRadius:"5px", cursor:"pointer", background:"none" }} />
            <span style={{ color:"#8b949e", fontSize:"12px" }}>To:</span>
            <input type="color" value={customColor2} onChange={(e) => setCustomColor2(e.target.value)} style={{ width:34, height:28, border:"1px solid #30363d", borderRadius:"5px", cursor:"pointer", background:"none" }} />
          </div>
        )}

        {/* Zoom cycle */}
        <button onClick={() => setZoomIdx((z) => (z + 1) % ZOOM_LEVELS.length)}
          style={btnStyle("#21262d", "#8b949e")}>
           {ZOOM_LEVELS[zoomIdx].label}
        </button>

        {/* Spin */}
        <button onClick={() => setSpinning((s) => !s)}
          style={btnStyle(spinning ? "#1a3a27" : "#21262d", spinning ? "#3fb950" : "#8b949e")}>
          {spinning ? " Stop Spin" : " Spin"}
        </button>

        {/* Snake controls */}
        {mode === "snake" && (
          <div style={{ display:"flex", gap:"7px", alignItems:"center" }}>
            {snakeState === "idle"    && <button onClick={startSnake} style={btnStyle("#238636","#3fb950")}> Start</button>}
            {snakeState === "running" && <><button onClick={stopSnake} style={btnStyle("#8b2020","#f85149")}> Stop</button><button onClick={resetSnake} style={btnStyle("#21262d","#e6edf3")}> Reset</button></>}
            {snakeState === "done"    && <><span style={{ color:"#3fb950", fontSize:"13px", fontWeight:700 }}> All eaten!</span><button onClick={resetSnake} style={btnStyle("#1a3a27","#3fb950")}> Again</button></>}
          </div>
        )}

        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ background:"#1a3a27", color:"#3fb950", border:"1px solid #238636", borderRadius:"20px", padding:"3px 13px", fontSize:"12px", fontWeight:700 }}>
            {total.toLocaleString()} contributions
          </span>
          <span style={{ color:"#30363d", fontSize:"10px" }}>Drag  Scroll  Double-click zoom</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"8px", paddingLeft:"2px" }}>
        <span style={{ color:"#6e7681", fontSize:"11px", marginRight:"3px" }}>Less</span>
        {(mode === "custom" ? getStops("custom") : cfg.stops).slice(1).map(([, hex], i) => (
          <div key={i} style={{ width:13, height:13, borderRadius:"3px", backgroundColor:hex, border:"1px solid rgba(255,255,255,0.07)" }} />
        ))}
        <span style={{ color:"#6e7681", fontSize:"11px", marginLeft:"3px" }}>More</span>
      </div>

      {/* Canvas */}
      <div ref={mountRef} style={{ width:"100%", height:"540px", borderRadius:"12px", overflow:"hidden", border:"1px solid #30363d", cursor:"grab" }} />

      {/* Tooltip */}
      {tooltip && (
        <div style={{ position:"fixed", top:tooltip.y-50, left:tooltip.x-56, background:"#1c2128", color:"#e6edf3", padding:"7px 13px", borderRadius:"7px", fontSize:"12px", fontWeight:500, pointerEvents:"none", whiteSpace:"nowrap", border:"1px solid #30363d", boxShadow:"0 6px 20px rgba(0,0,0,0.7)", zIndex:1000 }}>
          <span style={{ color:"#3fb950", fontWeight:700 }}>{tooltip.count} contribution{tooltip.count !== 1 ? "s" : ""}</span>
          <span style={{ color:"#8b949e", marginLeft:7 }}>on {tooltip.date}</span>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg, fg) {
  return { padding:"5px 12px", borderRadius:"7px", border:`1px solid ${fg}44`, background:bg, color:fg, cursor:"pointer", fontSize:"12px", fontWeight:600 };
}