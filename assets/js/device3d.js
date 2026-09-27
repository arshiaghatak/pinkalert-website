// Pink Alert: interactive 3D model of the prototype probe (three.js r128).
// Geometry follows the prototype design document: 70 × 40 mm head, 200 mm overall,
// central ultrasound transducer, four corner force sensors (F1–F4), IMU, controller, LiPo battery.
(() => {
  const host = document.getElementById('viewer');
  if (!host) return;

  const PARTS = [
    { id: 1, name: 'Ultrasound transducer', at: [0, 15.5, 0], n: [0, 1, 0],
      body: 'A high-frequency linear-array transducer behind an acoustic lens window. It sends sound pulses into breast tissue and builds an image from the echoes, with no radiation.',
      specs: [['Frequency', '5–15 MHz'], ['Array', 'Linear, central'], ['Window', 'Clear acoustic lens']] },
    { id: 2, name: 'Force sensors F1–F4', at: [24, 15.5, 18], n: [0, 1, 0],
      body: 'Four force-sensing resistors surround the transducer. Their sum gives total pressure; their balance shows tilt, so the app can say "level the probe" or "reduce pressure". Comparing frames at different pressures gives a relative stiffness estimate.',
      specs: [['Type', 'FSR / piezoelectric'], ['Tilt', 'D = (F_left − F_right) / F_total'], ['Placement', 'Four corners of the head']] },
    { id: 3, name: 'Status indicator', at: [0, -40, 16], n: [0, 0, 1],
      body: 'A light bar shows device state at a glance: powered on, scanning, low battery, or scan complete.',
      specs: [['Type', 'RGB LED'], ['Location', 'Front of the neck']] },
    { id: 4, name: 'Power and mode buttons', at: [0, -80, 15], n: [0, 0, 1],
      body: 'Two thumb-reach buttons turn the probe on and switch between scanning and review modes, so the phone can stay out of the way during a scan.',
      specs: [['Controls', 'Power, Mode'], ['Feedback', 'Tactile + app']] },
    { id: 5, name: 'Ergonomic housing', at: [17, -125, 0], n: [1, 0, 0],
      body: 'A lightweight, rounded grip sized for smaller hands, with a smooth head that glides over skin and can be cleaned between uses.',
      specs: [['Material', 'Medical-grade ABS + PC'], ['Size', '70 × 40 × 200 mm'], ['Finish', 'White / light gray']] },
    { id: 6, name: 'Inertial measurement unit', at: [0, -70, 2], internal: true,
      body: 'An accelerometer and gyroscope record the probe\'s orientation. Every frame is saved with its image, force, angle and time, so future scans of the same region can be compared like for like.',
      specs: [['Sensors', 'Accelerometer, gyroscope'], ['Stored frame', '(image, force, angle, time)']] },
    { id: 7, name: 'Controller board', at: [0, -100, 2], internal: true,
      body: 'A microcontroller reads the force sensors and IMU, time-stamps each ultrasound frame and streams the data to the app for image analysis and sensor fusion.',
      specs: [['Prototype', 'ESP32 / Raspberry Pi'], ['Role', 'Data acquisition']] },
    { id: 8, name: 'Rechargeable battery', at: [0, -148, 0], internal: true,
      body: 'A lithium-polymer cell with a dedicated charging and protection circuit powers the probe for portable, at-home use.',
      specs: [['Cell', '3.7 V, 2000 mAh LiPo'], ['Charging', 'TP4056 module']] },
    { id: 9, name: 'Cable and connectivity', at: [0, -186, 9], n: [0, -0.2, 1],
      body: 'A strain-relieved USB cable carries power and data in the prototype. A Bluetooth or Wi-Fi link to the phone app is planned for later generations.',
      specs: [['Prototype', 'USB'], ['Planned', 'Bluetooth / Wi-Fi']] },
  ];

  const panel = {
    no: document.getElementById('part-no'), title: document.getElementById('part-title'),
    body: document.getElementById('part-body'), specs: document.getElementById('part-specs'),
    list: document.getElementById('parts'),
  };
  // Used only when WebGL is unavailable: show part details in the side panel
  function fillPanel(p) {
    panel.no.textContent = `Part ${String(p.id).padStart(2, '0')}${p.internal ? ' · internal' : ''}`;
    panel.title.textContent = p.name;
    panel.body.textContent = p.body;
    panel.specs.innerHTML = p.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  }

  // Parts list (works even if WebGL is unavailable)
  PARTS.forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" data-part="${p.id}"><span class="n">${String(p.id).padStart(2, '0')}</span><span>${p.name}${p.internal ? ' <span style="opacity:.6">(internal)</span>' : ''}</span></button>`;
    panel.list.appendChild(li);
  });

  if (!window.THREE || !THREE.OrbitControls) {
    host.querySelector('.viewer-fallback').hidden = false;
    host.querySelector('.viewer-tools').hidden = true;
    panel.list.addEventListener('click', (e) => { const b = e.target.closest('[data-part]'); if (b) fillPanel(PARTS.find((x) => x.id === +b.dataset.part)); });
    return;
  }

  // ---------- renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.localClippingEnabled = true;
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  if (THREE.RoomEnvironment) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.8;
  }
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a1f2c, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(220, 260, 120); scene.add(key);
  const rim = new THREE.DirectionalLight(0xf7a8c4, 0.9); rim.position.set(-220, 60, -180); scene.add(rim);

  const camera = new THREE.PerspectiveCamera(32, 1, 1, 3000);
  const HOME = { pos: new THREE.Vector3(250, 190, 400), target: new THREE.Vector3(0, -95, 0) };
  camera.position.copy(HOME.pos);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 170; controls.maxDistance = 800;
  controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  controls.autoRotateSpeed = 1.1;
  controls.update();

  // ---------- materials ----------
  const shellMat = new THREE.MeshPhysicalMaterial({ color: 0xe4dfe3, roughness: 0.42, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35, envMapIntensity: 0.55 });
  const trimMat = new THREE.MeshPhysicalMaterial({ color: 0xc9c2c7, roughness: 0.45, clearcoat: 0.3, envMapIntensity: 0.55 });
  const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x1d1a20, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.15, envMapIntensity: 0.25 });
  const padMat = new THREE.MeshStandardMaterial({ color: 0x8a8489, roughness: 0.35, metalness: 0.7, envMapIntensity: 0.45 });
  const pinkMat = new THREE.MeshStandardMaterial({ color: 0xec648c, roughness: 0.35, metalness: 0.1, emissive: 0xec648c, emissiveIntensity: 0.12 });
  const ledMat = new THREE.MeshStandardMaterial({ color: 0xffc2d6, emissive: 0xec648c, emissiveIntensity: 1.6 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0xdcd6da, roughness: 0.6 });
  const shells = [shellMat, trimMat];

  const probe = new THREE.Group();
  probe.rotation.set(0.32, -0.5, -0.1); // present the scanning face toward the viewer
  scene.add(probe);
  HOME.target.copy(new THREE.Vector3(0, -88, 0).applyEuler(probe.rotation));
  controls.target.copy(HOME.target); controls.update();
  const pickables = [];
  const tag = (mesh, part) => { mesh.userData.part = part; pickables.push(mesh); return mesh; };

  // Head (70 wide × 56 deep × 26 tall), transducer face on top
  const RB = THREE.RoundedBoxGeometry;
  probe.add(tag(new THREE.Mesh(new RB(70, 26, 56, 6, 12), shellMat), 5));
  const lens = new THREE.Mesh(new RB(36, 3, 32, 4, 4), lensMat); lens.position.y = 13.2; probe.add(tag(lens, 1));
  [[-24, -18], [24, -18], [-24, 18], [24, 18]].forEach(([x, z]) => {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.6, 2.6, 40), padMat); pad.position.set(x, 13.6, z); probe.add(tag(pad, 2));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(7.4, 0.7, 12, 48), pinkMat); ring.rotation.x = Math.PI / 2; ring.position.set(x, 13.2, z); probe.add(tag(ring, 2));
  });

  // Neck and handle: lathe profile, flattened front-to-back
  const prof = [[0, -6], [27, -6], [26, -14], [22, -30], [19, -52], [17.2, -80], [16.6, -110], [17.4, -140], [18.8, -162], [17.5, -176], [12, -180], [0, -180]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const handle = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), shellMat);
  handle.scale.z = 0.78; probe.add(tag(handle, 5));

  // Status LED bar and buttons on the front
  const led = new THREE.Mesh(new RB(18, 2.6, 2, 2, 1), ledMat); led.position.set(0, -40, 15.6); led.rotation.x = -0.18; probe.add(tag(led, 3));
  [-72, -94].forEach((y) => {
    const well = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 1.4, 40), trimMat); well.rotation.x = Math.PI / 2; well.position.set(0, y, 13.4); probe.add(tag(well, 4));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.6, 1.6, 40), shellMat); cap.rotation.x = Math.PI / 2; cap.position.set(0, y, 14.2); probe.add(tag(cap, 4));
    const icon = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.35, 8, 32, Math.PI * 1.6), new THREE.MeshStandardMaterial({ color: 0x8d8590 }));
    icon.position.set(0, y, 15.1); icon.rotation.z = Math.PI * 0.7; probe.add(icon);
  });

  // Strain relief and cable
  const relief = new THREE.Mesh(new THREE.CylinderGeometry(8, 5, 20, 32), trimMat); relief.position.y = -189; probe.add(tag(relief, 9));
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -198, 0), new THREE.Vector3(2, -230, -6), new THREE.Vector3(18, -262, -26), new THREE.Vector3(52, -282, -60)]);
  probe.add(tag(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 3.4, 16, false), cableMat), 9));

  // ---------- internals (revealed with "Show internals") ----------
  const internals = new THREE.Group(); internals.visible = false; probe.add(internals);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1f5a45, roughness: 0.5, metalness: 0.2 });
  const chipMat = new THREE.MeshStandardMaterial({ color: 0x1a171c, roughness: 0.4, metalness: 0.3 });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(22, 62, 1.6), pcbMat); pcb.position.set(0, -92, 0); internals.add(tag(pcb, 7));
  const mcu = new THREE.Mesh(new THREE.BoxGeometry(11, 11, 1.8), chipMat); mcu.position.set(0, -100, 1.6); internals.add(tag(mcu, 7));
  const imu = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 1.6), new THREE.MeshStandardMaterial({ color: 0x2a2530, emissive: 0xec648c, emissiveIntensity: 0.25 }));
  imu.position.set(0, -70, 1.6); internals.add(tag(imu, 6));
  for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 1.2), chipMat); c.position.set(-6 + i * 4, -118, 1.4); internals.add(c); }
  const batt = new THREE.Mesh(new RB(20, 36, 8, 2, 2), new THREE.MeshStandardMaterial({ color: 0x9aa7b4, roughness: 0.35, metalness: 0.6 }));
  batt.position.set(0, -146, 0); internals.add(tag(batt, 8));
  const tx = new THREE.Mesh(new THREE.BoxGeometry(34, 14, 28), new THREE.MeshStandardMaterial({ color: 0x5a5560, roughness: 0.5, metalness: 0.4 }));
  tx.position.set(0, 4, 0); internals.add(tag(tx, 1));
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xec648c, roughness: 0.5 });
  [[-24, -18], [24, -18], [-24, 18], [24, 18]].forEach(([x, z]) => {
    const w = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 10, z), new THREE.Vector3(x * 0.5, -4, z * 0.4), new THREE.Vector3(x * 0.15, -40, 0), new THREE.Vector3(0, -62, 0.6)]);
    internals.add(new THREE.Mesh(new THREE.TubeGeometry(w, 24, 0.6, 6, false), wireMat));
  });

  function setInternals(on) {
    internals.visible = on;
    shells.forEach((m) => { m.transparent = on; m.opacity = on ? 0.14 : 1; m.depthWrite = !on; m.needsUpdate = true; });
    lensMat.transparent = on; lensMat.opacity = on ? 0.35 : 1; lensMat.needsUpdate = true;
    const b = host.querySelector('[data-act="internals"]'); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Hide internals' : 'Show internals';
    updateHotspots();
  }

  // ---------- hotspots ----------
  const spots = PARTS.map((p) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'hotspot'; b.textContent = p.id;
    b.setAttribute('aria-label', `${p.id}. ${p.name}`); b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', (e) => { e.stopPropagation(); select(p.id); });
    host.appendChild(b);
    return { p, b, v: new THREE.Vector3(...p.at), n: p.n ? new THREE.Vector3(...p.n).normalize() : null };
  });

  const tmp = new THREE.Vector3(), toCam = new THREE.Vector3(), wp = new THREE.Vector3(), wn = new THREE.Vector3();
  probe.updateMatrixWorld();
  function updateHotspots() {
    const w = host.clientWidth, h = host.clientHeight;
    spots.forEach((s) => {
      wp.copy(s.v).applyMatrix4(probe.matrixWorld);
      tmp.copy(wp).project(camera);
      s.b.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px, ${(-tmp.y * 0.5 + 0.5) * h}px)`;
      let cls = '';
      if (s.p.internal) cls = internals.visible ? '' : 'off';
      else if (s.n) { wn.copy(s.n).applyQuaternion(probe.quaternion); toCam.copy(camera.position).sub(wp).normalize(); if (toCam.dot(wn) < 0.05 && !internals.visible) cls = 'behind'; }
      s.b.classList.toggle('behind', cls === 'behind');
      s.b.classList.toggle('off', cls === 'off');
      s.b.tabIndex = cls === 'off' ? -1 : 0;
      if (s.p.id === current) {
        if (cls === 'off') closeCallout();
        else placeCallout((tmp.x * 0.5 + 0.5) * w, (-tmp.y * 0.5 + 0.5) * h);
      }
    });
  }

  // Pop-up callout next to the selected point, joined by a dotted diagonal leader line
  const leader = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  leader.setAttribute('class', 'leader'); leader.setAttribute('aria-hidden', 'true');
  leader.innerHTML = '<line stroke-dasharray="1 6" stroke-linecap="round"/><circle r="3"/>';
  host.appendChild(leader);
  const callout = document.createElement('div');
  callout.className = 'callout'; callout.hidden = true; callout.setAttribute('role', 'dialog'); callout.setAttribute('aria-live', 'polite');
  callout.innerHTML = '<button type="button" class="callout-x" aria-label="Close">×</button><span class="part-no"></span><h3></h3><p></p><dl></dl>';
  host.appendChild(callout);
  callout.querySelector('.callout-x').addEventListener('click', (e) => { e.stopPropagation(); closeCallout(); });

  function openCallout(p) {
    callout.querySelector('.part-no').textContent = `Part ${String(p.id).padStart(2, '0')}${p.internal ? ' · internal' : ''}`;
    callout.querySelector('h3').textContent = p.name;
    callout.querySelector('p').textContent = p.body;
    callout.querySelector('dl').innerHTML = p.specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    callout.hidden = false; leader.style.display = 'block';
    frameForCallout(true);
    callout.classList.remove('pop'); void callout.offsetWidth; callout.classList.add('pop');
  }
  function closeCallout() {
    current = null; callout.hidden = true; leader.style.display = 'none';
    frameForCallout(false);
    spots.forEach((s) => s.b.setAttribute('aria-pressed', 'false'));
    panel.list.querySelectorAll('[data-part]').forEach((x) => x.removeAttribute('aria-current'));
  }
  function frameForCallout(on) {
    const w = host.clientWidth, h = host.clientHeight;
    if (on && w < 600) camera.setViewOffset(w, h, 0, h * 0.3, w, h); else camera.clearViewOffset();
  }
  function placeCallout(sx, sy) {
    const w = host.clientWidth, bw = callout.offsetWidth, bh = callout.offsetHeight;
    // Never cover the control buttons along the bottom of the viewer
    const tools = host.querySelector('.viewer-tools');
    const h = tools ? tools.offsetTop - 6 : host.clientHeight;
    let left, top, cx, cy;
    if (w < 600) {
      // Phones: dock the pop-up along the bottom and point up to the part
      left = 10; top = h - bh - 10;
      cx = Math.max(left + 24, Math.min(sx, left + bw - 24)); cy = top;
    } else {
      // Box sits diagonally below the point; the dotted line always meets its nearest top corner
      const right = sx < w * 0.5, dx = 54, dy = 40;
      left = right ? sx + dx : sx - dx - bw;
      top = sy + dy;
      left = Math.max(10, Math.min(left, w - bw - 10));
      top = Math.max(10, Math.min(top, h - bh - 10));
      cx = right ? left : left + bw; cy = top;
    }
    callout.style.left = left + 'px'; callout.style.top = top + 'px';
    const line = leader.querySelector('line'), dot = leader.querySelector('circle');
    line.setAttribute('x1', sx); line.setAttribute('y1', sy); line.setAttribute('x2', cx); line.setAttribute('y2', cy);
    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
  }

  let current = null;
  function select(id) {
    const p = PARTS.find((x) => x.id === id); if (!p) return;
    current = id;
    openCallout(p);
    if (p.internal && !internals.visible) setInternals(true);
    spots.forEach((s) => s.b.setAttribute('aria-pressed', String(s.p.id === id)));
    panel.list.querySelectorAll('[data-part]').forEach((b) => b.setAttribute('aria-current', String(+b.dataset.part === id)));
    setSpin(false);
    // Turn the model so the chosen part faces the viewer
    const target = new THREE.Vector3(...p.at).applyMatrix4(probe.matrixWorld);
    const dir = (p.n ? new THREE.Vector3(...p.n) : new THREE.Vector3(0.55, 0.15, 1)).normalize().applyQuaternion(probe.quaternion);
    const blend = dir.clone().add(new THREE.Vector3(0.45, 0.35, 0.8)).normalize();
    const dist = host.clientWidth < 600 ? 520 : 300;
    flyTo(target.clone().lerp(HOME.target, 0.5), target.clone().add(blend.multiplyScalar(dist)));
  }
  panel.list.addEventListener('click', (e) => { const b = e.target.closest('[data-part]'); if (b) select(+b.dataset.part); });

  // Click a mesh to select it
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(pickables.filter((m) => m.visible && (internals.visible || !isInternal(m))), false)[0];
    if (hit && hit.object.userData.part) select(hit.object.userData.part);
    else if (current) closeCallout();
  });
  // Clicking anywhere else on the page closes the pop-up
  document.addEventListener('click', (e) => {
    if (!current) return;
    if (e.target.closest('.callout, .hotspot, .parts, .viewer-tools') || e.target === renderer.domElement) return;
    closeCallout();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current) closeCallout(); });
  function isInternal(m) { let o = m; while (o) { if (o === internals) return true; o = o.parent; } return false; }

  // Camera fly-to
  let fly = null;
  function flyTo(target, pos) { fly = { t0: performance.now(), fromT: controls.target.clone(), fromP: camera.position.clone(), toT: target, toP: pos }; }
  function stepFly(now) {
    if (!fly) return;
    const k = Math.min(1, (now - fly.t0) / 900), e = 1 - Math.pow(1 - k, 3);
    controls.target.lerpVectors(fly.fromT, fly.toT, e);
    camera.position.lerpVectors(fly.fromP, fly.toP, e);
    if (k === 1) fly = null;
  }

  // Tools
  function setSpin(on) { controls.autoRotate = on; host.querySelector('[data-act="spin"]').setAttribute('aria-pressed', String(on)); }
  setSpin(controls.autoRotate);
  host.querySelector('.viewer-tools').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'internals') setInternals(!internals.visible);
    if (act === 'spin') setSpin(!controls.autoRotate);
    if (act === 'in' || act === 'out') {
      const d = camera.position.clone().sub(controls.target);
      const len = THREE.MathUtils.clamp(d.length() * (act === 'in' ? 0.8 : 1.25), controls.minDistance, controls.maxDistance);
      flyTo(controls.target.clone(), controls.target.clone().add(d.setLength(len)));
    }
    if (act === 'reset') {
      flyTo(HOME.target.clone(), HOME.pos.clone()); setInternals(false); closeCallout();
    }
  });
  controls.addEventListener('start', () => { fly = null; setSpin(false); });

  // Size and render loop (paused while off screen)
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w < 520 ? 26 : 32; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host); resize();
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) requestAnimationFrame(loop); }, { rootMargin: '100px' }).observe(host);
  function loop(now) {
    if (!visible) return;
    stepFly(now); controls.update();
    renderer.render(scene, camera); updateHotspots();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
