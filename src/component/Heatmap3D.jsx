import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

//  Modes 
const MODES = {
  github:    { label:"GitHub Classic", emoji:"", desc:"The OG green",           bg:"#0d1117", fog:"#0d1117", ground:"#161b22", grid:"#21262d", bgType:"stars",     stops:[[0,"#0e1117"],[0.01,"#0e4429"],[0.30,"#006d32"],[0.65,"#26a641"],[1.00,"#39d353"]] },
  cyberpunk: { label:"Cyberpunk",      emoji:"", desc:"Neon city nights",        bg:"#05020f", fog:"#05020f", ground:"#0d0720", grid:"#1a0a3a", bgType:"grid",      stops:[[0,"#05020f"],[0.01,"#1a0050"],[0.25,"#00eeff"],[0.55,"#ff00ff"],[0.80,"#ffff00"],[1.00,"#ffffff"]] },
  inferno:   { label:"Inferno",        emoji:"", desc:"Blazing heat",            bg:"#0a0004", fog:"#0a0004", ground:"#150008", grid:"#2a000f", bgType:"embers",    stops:[[0,"#000000"],[0.01,"#1b0030"],[0.20,"#6b0040"],[0.40,"#c0233e"],[0.65,"#f5622e"],[0.85,"#fca50a"],[1.00,"#fcf524"]] },
  aurora:    { label:"Aurora",         emoji:"", desc:"Northern lights",         bg:"#020a14", fog:"#020a14", ground:"#030d1a", grid:"#0a1a2a", bgType:"aurora",    stops:[[0,"#020a14"],[0.01,"#0a1e3d"],[0.25,"#0a4d6e"],[0.50,"#0d7a5f"],[0.75,"#5c2d97"],[1.00,"#c47dff"]] },
  volcano:   { label:"Volcano",        emoji:"", desc:"Lava rising",             bg:"#0a0000", fog:"#0a0000", ground:"#160500", grid:"#240500", bgType:"embers",    stops:[[0,"#0a0000"],[0.01,"#3a0000"],[0.20,"#7d0000"],[0.45,"#c92b00"],[0.70,"#ff6600"],[0.88,"#ffb700"],[1.00,"#fff700"]] },
  ocean:     { label:"Deep Ocean",     emoji:"", desc:"Bioluminescent deep sea", bg:"#000814", fog:"#000814", ground:"#001a2e", grid:"#003060", bgType:"bubbles",   stops:[[0,"#000814"],[0.01,"#002855"],[0.25,"#0057b8"],[0.55,"#00a8e8"],[0.80,"#00f5d4"],[1.00,"#ffffff"]] },
  matrix:    { label:"Matrix",         emoji:"", desc:"Follow the white rabbit", bg:"#000300", fog:"#000300", ground:"#001200", grid:"#003000", bgType:"matrix",    stops:[[0,"#000300"],[0.01,"#003300"],[0.30,"#00aa00"],[0.65,"#00ff41"],[1.00,"#ccffcc"]] },
  galaxy:    { label:"Galaxy",         emoji:"", desc:"Across the cosmos",       bg:"#02000a", fog:"#02000a", ground:"#05001a", grid:"#0a0030", bgType:"stars",     stops:[[0,"#02000a"],[0.01,"#1a0050"],[0.30,"#4b0082"],[0.60,"#8b00ff"],[0.85,"#da70d6"],[1.00,"#fff0f5"]] },
  candy:     { label:"Candy",          emoji:"", desc:"Sweet pastel overdose",   bg:"#1a0a1a", fog:"#1a0a1a", ground:"#2a0a2a", grid:"#3d1a3d", bgType:"bubbles",   stops:[[0,"#1a0a1a"],[0.01,"#4a0060"],[0.25,"#cc00cc"],[0.50,"#ff69b4"],[0.75,"#ff9de2"],[1.00,"#fff0fb"]] },
  snake:     { label:"Snake Game",     emoji:"", desc:"Eat all contributions!",  bg:"#05100a", fog:"#05100a", ground:"#071a0e", grid:"#0d2a18", bgType:"stars",     stops:[[0,"#051508"],[0.01,"#0a3d1a"],[0.40,"#1a7a3a"],[0.80,"#2db554"],[1.00,"#5dfc8c"]] },
  custom:    { label:"Custom",         emoji:"", desc:"Your own color palette",  bg:"#0a0a0a", fog:"#0a0a0a", ground:"#141414", grid:"#222222", bgType:"stars",     stops:[[0,"#0a0a0a"],[0.01,"#111111"],[1.00,"#ffffff"]] },
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
    const { barMap, scene } = sceneRef.current;
    if (!barMap || !scene) return;
    const cfg   = MODES[m];
    const stops = getStops(m);
    scene.background = new THREE.Color(cfg.bg);
    if (scene.fog) scene.fog.color.set(cfg.fog);
    barMap.forEach(({ mesh, count }) => {
      const col = mapColor(count, maxCount, stops);
      mesh.material.color.set(col);
      mesh.material.emissive.set(col.clone().multiplyScalar(0.12));
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
    if (mode === "snake") return;
    const sr = snakeRef.current;
    if (sr.running) { sr.running = false; clearInterval(sr.interval); setSnakeState("idle"); }
    applyModeColors(mode);
  }, [mode, customColor, customColor2, applyModeColors]);

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
    const { controls } = sceneRef.current;
    if (!controls) return;
    controls.autoRotate      = spinning;
    controls.autoRotateSpeed = 2.8;
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

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 1.3);
    dir.position.set(40, 60, 40); dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 1; dir.shadow.camera.far = 250;
    dir.shadow.camera.left = dir.shadow.camera.bottom = -80;
    dir.shadow.camera.right = dir.shadow.camera.top   =  80;
    scene.add(dir);
    scene.add(new THREE.PointLight(0x4ade80, 0.4, 100));

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
        const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col.clone().multiplyScalar(0.12), roughness: 0.4, metalness: 0.15 });
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

    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      barMap.forEach(({ mesh }) => {
        const tgt = mesh.userData.targetScaleY ?? 1;
        if (Math.abs(mesh.scale.y - tgt) > 0.001) mesh.scale.y += (tgt - mesh.scale.y) * 0.14;
      });
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    sceneRef.current = { barMap, renderer, scene, camera, controls };

    return () => {
      cancelAnimationFrame(animId); controls.dispose(); renderer.dispose();
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("dblclick", cycleZoom);
      el.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
