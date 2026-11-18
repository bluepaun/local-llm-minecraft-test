import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const STORAGE_KEY = "blockcraft-html-save-v1";
const BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const WORLD_SIZE = 48;
const WORLD_HALF = WORLD_SIZE / 2;
const MAX_WORLD_HEIGHT = 28;
const PLAYER_HEIGHT = 1.8;
const PLAYER_RADIUS = 0.35;
const PLAYER_EYE_HEIGHT = 1.62;
const REACH_DISTANCE = 7;
const GRAVITY = 26;
const JUMP_FORCE = 9.5;
const WALK_SPEED = 5.8;
const SPRINT_SPEED = 8.4;
const FLY_SPEED = 8.5;
const INTERACTION_COOLDOWN = 140;

const BLOCK_TYPES = {
  grass: { name: "Grass", placeable: true, solid: true },
  dirt: { name: "Dirt", placeable: true, solid: true },
  stone: { name: "Stone", placeable: true, solid: true },
  sand: { name: "Sand", placeable: true, solid: true },
  wood: { name: "Wood", placeable: true, solid: true },
  leaves: { name: "Leaves", placeable: true, solid: true },
  bedrock: { name: "Bedrock", placeable: false, solid: true, unbreakable: true },
};

const HOTBAR = ["grass", "dirt", "stone", "sand", "wood", "leaves"];
const NEIGHBOR_OFFSETS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

const canvas = document.querySelector("#game");
const menu = document.querySelector("#menu");
const menuHint = document.querySelector("#menuHint");
const startButton = document.querySelector("#startButton");
const loadButton = document.querySelector("#loadButton");
const newWorldButton = document.querySelector("#newWorldButton");
const saveButton = document.querySelector("#saveButton");
const respawnButton = document.querySelector("#respawnButton");
const statusText = document.querySelector("#statusText");
const hotbar = document.querySelector("#hotbar");
const message = document.querySelector("#message");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x8fc7ff, 18, 90);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 250);
camera.rotation.order = "YXZ";

const hemisphereLight = new THREE.HemisphereLight(0xaed7ff, 0x4d4030, 1.45);
scene.add(hemisphereLight);

const sunLight = new THREE.DirectionalLight(0xfff3c2, 1.05);
sunLight.position.set(18, 30, 8);
scene.add(sunLight);

const worldGroup = new THREE.Group();
scene.add(worldGroup);

const highlight = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(1.02, 1.02, 1.02)),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
);
highlight.visible = false;
scene.add(highlight);

const raycaster = new THREE.Raycaster();
const targetDirection = new THREE.Vector3();
const messageTimer = { id: null };

const state = {
  blocks: new Map(),
  meshes: new Map(),
  pressed: new Set(),
  selectedIndex: 0,
  player: {
    position: new THREE.Vector3(0.5, 12, 0.5),
    velocity: new THREE.Vector3(),
    yaw: 0,
    pitch: 0,
    flying: false,
    onGround: false,
    spawn: new THREE.Vector3(0.5, 12, 0.5),
    spawnYaw: 0,
    spawnPitch: -0.12,
  },
  targetBlock: null,
  canMineAt: 0,
  worldReady: false,
};

const materials = createMaterials();
buildHotbar();
loadWorld(false);

startButton.addEventListener("click", () => lockPointer());
canvas.addEventListener("click", () => {
  if (document.pointerLockElement !== canvas) {
    lockPointer();
  }
});

loadButton.addEventListener("click", () => {
  const loaded = loadWorld(true);
  flash(loaded ? "Loaded saved world." : "No save found. Generated a new world.");
});

newWorldButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  generateFreshWorld();
  flash("Generated a new world.");
});

saveButton.addEventListener("click", () => {
  saveWorld();
  flash("World saved.");
});

respawnButton.addEventListener("click", () => {
  respawnPlayer();
  flash("Respawned at the starting point.");
});

document.addEventListener("pointerlockchange", () => {
  const locked = document.pointerLockElement === canvas;
  menu.classList.toggle("visible", !locked);
  menuHint.textContent = locked
    ? ""
    : "Click Play to resume. Press Esc any time to unlock the cursor.";
});

document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement !== canvas) {
    return;
  }

  state.player.yaw -= event.movementX * 0.0026;
  state.player.pitch -= event.movementY * 0.0022;
  state.player.pitch = THREE.MathUtils.clamp(state.player.pitch, -1.54, 1.54);
});

document.addEventListener("contextmenu", (event) => event.preventDefault());

document.addEventListener("mousedown", (event) => {
  if (document.pointerLockElement !== canvas || !state.worldReady) {
    return;
  }

  if (event.button === 0) {
    mineTargetedBlock();
  }

  if (event.button === 2) {
    placeSelectedBlock();
  }
});

document.addEventListener("keydown", (event) => {
  state.pressed.add(event.code);

  if (event.code === "Space") {
    event.preventDefault();
    if (!state.player.flying && state.player.onGround) {
      state.player.velocity.y = JUMP_FORCE;
      state.player.onGround = false;
    }
  }

  if (event.code === "KeyF" && !event.repeat) {
    state.player.flying = !state.player.flying;
    if (state.player.flying) {
      state.player.velocity.y = 0;
    }
    flash(state.player.flying ? "Flying enabled." : "Flying disabled.");
  }

  if (event.code === "KeyR" && !event.repeat) {
    respawnPlayer();
    flash("Respawned.");
  }

  if (event.code === "KeyP" && !event.repeat) {
    saveWorld();
    flash("World saved.");
  }

  const number = Number.parseInt(event.key, 10);
  if (number >= 1 && number <= HOTBAR.length) {
    state.selectedIndex = number - 1;
    updateHotbarSelection();
  }
});

document.addEventListener("keyup", (event) => {
  state.pressed.delete(event.code);
});

window.addEventListener("wheel", (event) => {
  if (!state.worldReady) {
    return;
  }

  state.selectedIndex += event.deltaY > 0 ? 1 : -1;
  state.selectedIndex = (state.selectedIndex + HOTBAR.length) % HOTBAR.length;
  updateHotbarSelection();
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("beforeunload", () => {
  if (state.worldReady) {
    saveWorld();
  }
});

let previousTime = performance.now();
requestAnimationFrame(loop);

function loop(now) {
  const delta = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;

  if (state.worldReady) {
    updatePlayer(delta);
    updateCamera();
    updateTargetBlock();
    updateLighting(now / 1000);
    updateStatus();
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

function buildHotbar() {
  hotbar.innerHTML = "";

  HOTBAR.forEach((blockType, index) => {
    const block = BLOCK_TYPES[blockType];
    const slot = document.createElement("div");
    slot.className = "hotbar-slot";
    slot.dataset.index = String(index);
    slot.innerHTML = `<strong>${index + 1}</strong><span>${block.name}</span>`;
    hotbar.append(slot);
  });

  updateHotbarSelection();
}

function updateHotbarSelection() {
  for (const slot of hotbar.children) {
    slot.classList.toggle("active", Number(slot.dataset.index) === state.selectedIndex);
  }
}

function lockPointer() {
  canvas.requestPointerLock();
}

function flash(text, duration = 1800) {
  message.textContent = text;
  message.classList.add("visible");

  if (messageTimer.id) {
    window.clearTimeout(messageTimer.id);
  }

  messageTimer.id = window.setTimeout(() => {
    message.classList.remove("visible");
  }, duration);
}

function keyFor(x, y, z) {
  return `${x}|${y}|${z}`;
}

function parseKey(key) {
  const [x, y, z] = key.split("|").map(Number);
  return { x, y, z };
}

function inBounds(x, y, z) {
  return (
    x >= -WORLD_HALF &&
    x < WORLD_HALF &&
    z >= -WORLD_HALF &&
    z < WORLD_HALF &&
    y >= 0 &&
    y <= MAX_WORLD_HEIGHT
  );
}

function getBlock(x, y, z) {
  return state.blocks.get(keyFor(x, y, z)) || null;
}

function isSolidBlock(x, y, z) {
  const block = getBlock(x, y, z);
  return Boolean(block && BLOCK_TYPES[block]?.solid);
}

function setBlock(x, y, z, type, refresh = true) {
  if (!inBounds(x, y, z)) {
    return;
  }

  state.blocks.set(keyFor(x, y, z), type);

  if (refresh) {
    refreshBlockAndNeighbors(x, y, z);
  }
}

function removeBlock(x, y, z, refresh = true) {
  state.blocks.delete(keyFor(x, y, z));

  if (refresh) {
    refreshBlockAndNeighbors(x, y, z);
  }
}

function clearRenderedWorld() {
  for (const mesh of state.meshes.values()) {
    worldGroup.remove(mesh);
  }
  state.meshes.clear();
}

function rebuildVisibleWorld() {
  clearRenderedWorld();
  for (const key of state.blocks.keys()) {
    const { x, y, z } = parseKey(key);
    updateBlockVisibility(x, y, z);
  }
}

function refreshBlockAndNeighbors(x, y, z) {
  updateBlockVisibility(x, y, z);
  for (const [dx, dy, dz] of NEIGHBOR_OFFSETS) {
    updateBlockVisibility(x + dx, y + dy, z + dz);
  }
}

function updateBlockVisibility(x, y, z) {
  const key = keyFor(x, y, z);
  const block = getBlock(x, y, z);

  if (!block) {
    const existing = state.meshes.get(key);
    if (existing) {
      worldGroup.remove(existing);
      state.meshes.delete(key);
    }
    return;
  }

  const shouldShow = NEIGHBOR_OFFSETS.some(([dx, dy, dz]) => !getBlock(x + dx, y + dy, z + dz));
  const existing = state.meshes.get(key);

  if (!shouldShow) {
    if (existing) {
      worldGroup.remove(existing);
      state.meshes.delete(key);
    }
    return;
  }

  if (existing) {
    existing.material = materials[block];
    existing.userData.type = block;
    return;
  }

  const mesh = new THREE.Mesh(BOX_GEOMETRY, materials[block]);
  mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
  mesh.userData = { x, y, z, type: block };
  worldGroup.add(mesh);
  state.meshes.set(key, mesh);
}

function generateFreshWorld() {
  state.blocks.clear();
  clearRenderedWorld();
  highlight.visible = false;
  state.targetBlock = null;

  for (let x = -WORLD_HALF; x < WORLD_HALF; x += 1) {
    for (let z = -WORLD_HALF; z < WORLD_HALF; z += 1) {
      const topY = terrainHeight(x, z);
      setBlock(x, 0, z, "bedrock", false);

      for (let y = 1; y <= topY; y += 1) {
        let type = "stone";
        const depth = topY - y;

        if (depth === 0) {
          type = topY < 7 ? "sand" : "grass";
        } else if (depth < 3) {
          type = topY < 7 ? "sand" : "dirt";
        }

        setBlock(x, y, z, type, false);
      }

      maybeGrowTree(x, topY, z);
    }
  }

  const spawn = prepareSpawnPlateau();
  clearSpawnArea(spawn);
  rebuildVisibleWorld();
  state.player.spawn.copy(spawn);
  state.player.spawnYaw = findSpawnYaw(spawn);
  state.player.spawnPitch = -0.12;
  respawnPlayer();
  state.worldReady = true;
}

function maybeGrowTree(x, topY, z) {
  if (topY < 7 || topY > MAX_WORLD_HEIGHT - 8) {
    return;
  }

  if (Math.abs(x) > WORLD_HALF - 4 || Math.abs(z) > WORLD_HALF - 4) {
    return;
  }

  const chance = hash2D(x * 17 + 91, z * 13 + 37);
  if (chance < 0.83 || getBlock(x, topY, z) !== "grass") {
    return;
  }

  const trunkHeight = 3 + Math.floor(hash2D(x * 29 + 3, z * 19 + 7) * 3);

  for (let y = topY + 1; y <= topY + trunkHeight; y += 1) {
    setBlock(x, y, z, "wood", false);
  }

  const canopyY = topY + trunkHeight;
  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dz = -2; dz <= 2; dz += 1) {
        const distance = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
        if (distance > 4) {
          continue;
        }

        const leafX = x + dx;
        const leafY = canopyY + dy;
        const leafZ = z + dz;

        if (!getBlock(leafX, leafY, leafZ)) {
          setBlock(leafX, leafY, leafZ, "leaves", false);
        }
      }
    }
  }
}

function terrainHeight(x, z) {
  const low = Math.sin(x * 0.16) * 1.8 + Math.cos(z * 0.14) * 1.4;
  const mid = Math.sin((x + z) * 0.08) * 2.4 + Math.cos((x - z) * 0.06) * 1.8;
  const high = (hash2D(x, z) - 0.5) * 1.8;
  return Math.max(4, Math.min(17, Math.floor(9 + low + mid + high)));
}

function hash2D(x, z) {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function findSpawnPoint() {
  const candidates = [[0, 0]];

  for (let radius = 1; radius < WORLD_HALF; radius += 1) {
    for (let x = -radius; x <= radius; x += 1) {
      candidates.push([x, -radius], [x, radius]);
    }

    for (let z = -radius + 1; z < radius; z += 1) {
      candidates.push([-radius, z], [radius, z]);
    }
  }

  for (const [x, z] of candidates) {
    const surface = findTopWalkableY(x, z);
    if (surface !== null && surface + 3 < MAX_WORLD_HEIGHT) {
      return new THREE.Vector3(x + 0.5, surface + 1, z + 0.5);
    }
  }

  return new THREE.Vector3(0.5, 12, 0.5);
}

function prepareSpawnPlateau() {
  const surfaceY = terrainHeight(0, 0);

  for (let x = -4; x <= 4; x += 1) {
    for (let z = -4; z <= 4; z += 1) {
      if (Math.hypot(x, z) > 4.6) {
        continue;
      }

      for (let y = 1; y <= MAX_WORLD_HEIGHT; y += 1) {
        if (y > surfaceY) {
          removeBlock(x, y, z, false);
          continue;
        }

        const depth = surfaceY - y;
        const type = depth === 0 ? "grass" : depth < 3 ? "dirt" : "stone";
        setBlock(x, y, z, type, false);
      }
    }
  }

  return new THREE.Vector3(0.5, surfaceY + 1, 0.5);
}

function findSpawnYaw(spawn) {
  const candidates = [
    { yaw: 0, dx: 0, dz: -1 },
    { yaw: Math.PI / 2, dx: 1, dz: 0 },
    { yaw: Math.PI, dx: 0, dz: 1 },
    { yaw: -Math.PI / 2, dx: -1, dz: 0 },
  ];

  let bestYaw = 0;
  let bestScore = -1;

  for (const candidate of candidates) {
    let score = 0;

    for (let distance = 1; distance <= 12; distance += 1) {
      const x = Math.floor(spawn.x + candidate.dx * distance);
      const z = Math.floor(spawn.z + candidate.dz * distance);
      let blocked = false;

      for (let y = Math.floor(spawn.y); y <= Math.floor(spawn.y) + 2; y += 1) {
        if (getBlock(x, y, z)) {
          blocked = true;
          break;
        }
      }

      if (blocked) {
        break;
      }

      score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestYaw = candidate.yaw;
    }
  }

  return bestYaw;
}

function clearSpawnArea(spawn) {
  const centerX = Math.floor(spawn.x);
  const centerZ = Math.floor(spawn.z);
  const floorY = Math.floor(spawn.y - 1);

  for (let dx = -8; dx <= 8; dx += 1) {
    for (let dz = -8; dz <= 8; dz += 1) {
      const distance = Math.hypot(dx, dz);
      if (distance > 8.4) {
        continue;
      }

      for (let y = floorY + 1; y <= floorY + 8; y += 1) {
        const block = getBlock(centerX + dx, y, centerZ + dz);
        if (block && block !== "bedrock") {
          removeBlock(centerX + dx, y, centerZ + dz, false);
        }
      }

      if (distance <= 7.2) {
        setBlock(centerX + dx, floorY, centerZ + dz, "grass", false);
        setBlock(centerX + dx, floorY - 1, centerZ + dz, "dirt", false);
        setBlock(centerX + dx, floorY - 2, centerZ + dz, "dirt", false);
      }
    }
  }
}

function findTopSolidY(x, z) {
  for (let y = MAX_WORLD_HEIGHT; y >= 0; y -= 1) {
    if (isSolidBlock(x, y, z)) {
      return y;
    }
  }
  return null;
}

function findTopWalkableY(x, z) {
  for (let y = MAX_WORLD_HEIGHT; y >= 0; y -= 1) {
    const block = getBlock(x, y, z);
    if (block && block !== "leaves" && block !== "wood") {
      return y;
    }
  }

  return null;
}

function respawnPlayer() {
  state.player.position.copy(state.player.spawn);
  state.player.velocity.set(0, 0, 0);
  state.player.yaw = state.player.spawnYaw;
  state.player.pitch = state.player.spawnPitch;
}

function updatePlayer(delta) {
  if (document.pointerLockElement === canvas) {
    applyMovement(delta);
  }

  if (!state.player.flying && state.player.position.y < -10) {
    respawnPlayer();
    flash("You fell. Respawned.");
  }
}

function applyMovement(delta) {
  const input = new THREE.Vector3();
  if (state.pressed.has("KeyW")) input.z -= 1;
  if (state.pressed.has("KeyS")) input.z += 1;
  if (state.pressed.has("KeyA")) input.x -= 1;
  if (state.pressed.has("KeyD")) input.x += 1;

  const moveDirection = new THREE.Vector3();
  if (input.lengthSq() > 0) {
    input.normalize();
    const forward = new THREE.Vector3(Math.sin(state.player.yaw), 0, -Math.cos(state.player.yaw));
    const right = new THREE.Vector3(Math.cos(state.player.yaw), 0, Math.sin(state.player.yaw));
    moveDirection.addScaledVector(forward, -input.z);
    moveDirection.addScaledVector(right, input.x);
    moveDirection.normalize();
  }

  const walkingSpeed = state.player.flying
    ? FLY_SPEED
    : state.pressed.has("ShiftLeft") || state.pressed.has("ShiftRight")
      ? SPRINT_SPEED
      : WALK_SPEED;

  const acceleration = state.player.flying ? 16 : state.player.onGround ? 20 : 10;
  const desiredVelocityX = moveDirection.x * walkingSpeed;
  const desiredVelocityZ = moveDirection.z * walkingSpeed;

  state.player.velocity.x += (desiredVelocityX - state.player.velocity.x) * Math.min(1, acceleration * delta);
  state.player.velocity.z += (desiredVelocityZ - state.player.velocity.z) * Math.min(1, acceleration * delta);

  if (state.player.flying) {
    let verticalTarget = 0;
    if (state.pressed.has("Space")) verticalTarget += FLY_SPEED;
    if (state.pressed.has("ShiftLeft") || state.pressed.has("ShiftRight")) verticalTarget -= FLY_SPEED;
    state.player.velocity.y += (verticalTarget - state.player.velocity.y) * Math.min(1, 12 * delta);
  } else {
    state.player.velocity.y -= GRAVITY * delta;
  }

  state.player.onGround = false;
  moveAxis("x", state.player.velocity.x * delta);
  moveAxis("y", state.player.velocity.y * delta);
  moveAxis("z", state.player.velocity.z * delta);

  if (!state.player.flying) {
    const groundedProbe = state.player.position.clone();
    groundedProbe.y -= 0.08;
    state.player.onGround = collidesAt(groundedProbe);
  }
}

function moveAxis(axis, distance) {
  if (distance === 0) {
    return;
  }

  const direction = Math.sign(distance);
  const step = 0.05 * direction;
  let moved = 0;
  const remaining = Math.abs(distance);

  while (Math.abs(moved) + Math.abs(step) <= remaining) {
    state.player.position[axis] += step;
    if (collidesAt(state.player.position)) {
      state.player.position[axis] -= step;
      if (axis === "y" && direction < 0) {
        state.player.onGround = true;
      }
      state.player.velocity[axis] = 0;
      return;
    }
    moved += step;
  }

  const remainder = distance - moved;
  state.player.position[axis] += remainder;
  if (collidesAt(state.player.position)) {
    state.player.position[axis] -= remainder;
    if (axis === "y" && direction < 0) {
      state.player.onGround = true;
    }
    state.player.velocity[axis] = 0;
  }
}

function collidesAt(position) {
  const minX = Math.floor(position.x - PLAYER_RADIUS);
  const maxX = Math.floor(position.x + PLAYER_RADIUS);
  const minY = Math.floor(position.y);
  const maxY = Math.floor(position.y + PLAYER_HEIGHT - 0.001);
  const minZ = Math.floor(position.z - PLAYER_RADIUS);
  const maxZ = Math.floor(position.z + PLAYER_RADIUS);

  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      for (let z = minZ; z <= maxZ; z += 1) {
        if (isSolidBlock(x, y, z)) {
          return true;
        }
      }
    }
  }

  return false;
}

function updateCamera() {
  camera.position.set(
    state.player.position.x,
    state.player.position.y + PLAYER_EYE_HEIGHT,
    state.player.position.z
  );
  camera.rotation.y = state.player.yaw;
  camera.rotation.x = state.player.pitch;
}

function updateTargetBlock() {
  if (!state.worldReady || state.meshes.size === 0) {
    state.targetBlock = null;
    highlight.visible = false;
    return;
  }

  camera.getWorldDirection(targetDirection);
  raycaster.set(camera.position, targetDirection);
  raycaster.far = REACH_DISTANCE;

  const intersections = raycaster.intersectObjects(worldGroup.children, false);
  const hit = intersections[0];

  if (!hit) {
    state.targetBlock = null;
    highlight.visible = false;
    return;
  }

  const block = hit.object.userData;
  state.targetBlock = {
    x: block.x,
    y: block.y,
    z: block.z,
    type: block.type,
    faceNormal: hit.face?.normal?.clone() || new THREE.Vector3(),
  };

  highlight.visible = true;
  highlight.position.set(block.x + 0.5, block.y + 0.5, block.z + 0.5);
}

function mineTargetedBlock() {
  if (!state.targetBlock || performance.now() < state.canMineAt) {
    return;
  }

  const { x, y, z, type } = state.targetBlock;
  const definition = BLOCK_TYPES[type];
  if (definition?.unbreakable) {
    flash("Bedrock cannot be broken.");
    return;
  }

  removeBlock(x, y, z);
  state.canMineAt = performance.now() + INTERACTION_COOLDOWN;
}

function placeSelectedBlock() {
  if (!state.targetBlock || performance.now() < state.canMineAt) {
    return;
  }

  const normal = state.targetBlock.faceNormal;
  const placeX = state.targetBlock.x + Math.round(normal.x);
  const placeY = state.targetBlock.y + Math.round(normal.y);
  const placeZ = state.targetBlock.z + Math.round(normal.z);

  if (!inBounds(placeX, placeY, placeZ) || getBlock(placeX, placeY, placeZ)) {
    return;
  }

  if (playerIntersectsBlock(placeX, placeY, placeZ)) {
    flash("Cannot place a block inside the player.");
    return;
  }

  setBlock(placeX, placeY, placeZ, HOTBAR[state.selectedIndex]);
  state.canMineAt = performance.now() + INTERACTION_COOLDOWN;
}

function playerIntersectsBlock(x, y, z) {
  const minX = state.player.position.x - PLAYER_RADIUS;
  const maxX = state.player.position.x + PLAYER_RADIUS;
  const minY = state.player.position.y;
  const maxY = state.player.position.y + PLAYER_HEIGHT;
  const minZ = state.player.position.z - PLAYER_RADIUS;
  const maxZ = state.player.position.z + PLAYER_RADIUS;

  return !(
    maxX <= x ||
    minX >= x + 1 ||
    maxY <= y ||
    minY >= y + 1 ||
    maxZ <= z ||
    minZ >= z + 1
  );
}

function updateStatus() {
  const currentBlock = HOTBAR[state.selectedIndex];
  const target = state.targetBlock ? ` | Target: ${BLOCK_TYPES[state.targetBlock.type].name}` : "";
  const movementMode = state.player.flying ? "Fly" : state.player.onGround ? "Walk" : "Air";
  statusText.textContent =
    `XYZ ${state.player.position.x.toFixed(1)} ${state.player.position.y.toFixed(1)} ${state.player.position.z.toFixed(1)}` +
    ` | Mode: ${movementMode}` +
    ` | Block: ${BLOCK_TYPES[currentBlock].name}` +
    ` | ${document.pointerLockElement === canvas ? "Locked" : "Paused"}` +
    target;
}

function updateLighting(time) {
  const cycle = time * 0.08;
  const daylight = Math.max(0.25, Math.sin(cycle) * 0.5 + 0.65);
  hemisphereLight.intensity = 0.8 + daylight * 0.8;
  sunLight.intensity = 0.35 + daylight * 1.05;
  sunLight.position.set(Math.cos(cycle) * 24, 14 + daylight * 18, Math.sin(cycle) * 18);

  const skyColor = new THREE.Color().lerpColors(
    new THREE.Color(0x101726),
    new THREE.Color(0x8fc7ff),
    daylight
  );

  scene.background = skyColor;
  scene.fog.color.copy(skyColor);
}

function saveWorld() {
  const payload = {
    blocks: Array.from(state.blocks.entries()),
    player: {
      position: state.player.position.toArray(),
      yaw: state.player.yaw,
      pitch: state.player.pitch,
      flying: state.player.flying,
      spawn: state.player.spawn.toArray(),
      spawnYaw: state.player.spawnYaw,
      spawnPitch: state.player.spawnPitch,
    },
    selectedIndex: state.selectedIndex,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadWorld(forceSavedWorld) {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    generateFreshWorld();
    return false;
  }

  try {
    hydrateWorld(JSON.parse(raw));
    return true;
  } catch {
    generateFreshWorld();
    if (forceSavedWorld) {
      flash("Save data was invalid. Generated a new world.");
    }
    return false;
  }
}

function hydrateWorld(save) {
  state.blocks.clear();
  clearRenderedWorld();

  for (const [key, type] of save.blocks || []) {
    const { x, y, z } = parseKey(key);
    if (BLOCK_TYPES[type] && inBounds(x, y, z)) {
      state.blocks.set(key, type);
    }
  }

  rebuildVisibleWorld();
  state.player.position.fromArray(save.player?.position || [0.5, 12, 0.5]);
  state.player.spawn.fromArray(save.player?.spawn || [0.5, 12, 0.5]);
  state.player.yaw = save.player?.yaw ?? -Math.PI / 2;
  state.player.pitch = save.player?.pitch ?? -0.15;
  state.player.flying = Boolean(save.player?.flying);
  state.player.spawnYaw = save.player?.spawnYaw ?? findSpawnYaw(state.player.spawn);
  state.player.spawnPitch = save.player?.spawnPitch ?? -0.12;
  state.player.velocity.set(0, 0, 0);
  state.selectedIndex = Math.max(0, Math.min(HOTBAR.length - 1, save.selectedIndex ?? 0));

  if (collidesAt(state.player.position)) {
    state.player.spawn.copy(findSpawnPoint());
    state.player.spawnYaw = findSpawnYaw(state.player.spawn);
    state.player.spawnPitch = -0.12;
    respawnPlayer();
  }

  updateHotbarSelection();
  state.worldReady = true;
}

function createMaterials() {
  const dirt = texturedMaterial(makeNoiseTexture("#77512d", 34));
  const grassTop = texturedMaterial(makeNoiseTexture("#53ad3b", 26));
  const grassSide = texturedMaterial(makeGrassSideTexture());
  const stone = texturedMaterial(makeNoiseTexture("#8b929f", 28));
  const sand = texturedMaterial(makeNoiseTexture("#d7cb7c", 22));
  const woodSide = texturedMaterial(makeWoodSideTexture());
  const woodTop = texturedMaterial(makeWoodTopTexture());
  const leaves = texturedMaterial(makeLeavesTexture(), true);
  const bedrock = texturedMaterial(makeNoiseTexture("#2f3643", 24));

  return {
    dirt,
    stone,
    sand,
    leaves,
    bedrock,
    wood: [woodSide, woodSide, woodTop, woodTop, woodSide, woodSide],
    grass: [grassSide, grassSide, grassTop, dirt, grassSide, grassSide],
  };
}

function texturedMaterial(texture, transparent = false) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return new THREE.MeshLambertMaterial({
    map: texture,
    transparent,
    alphaTest: transparent ? 0.25 : 0,
  });
}

function makeCanvasTexture(draw) {
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 16;
  canvasTexture.height = 16;
  const ctx = canvasTexture.getContext("2d");
  draw(ctx);
  return new THREE.CanvasTexture(canvasTexture);
}

function makeNoiseTexture(baseHex, variance) {
  return makeCanvasTexture((ctx) => {
    const base = new THREE.Color(baseHex);
    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const offset = (hash2D(x * 17 + base.r * 100, y * 31 + base.g * 100) - 0.5) * variance / 255;
        const pixel = base.clone().offsetHSL(0, 0, offset);
        ctx.fillStyle = `#${pixel.getHexString()}`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

function makeGrassSideTexture() {
  return makeCanvasTexture((ctx) => {
    const dirt = new THREE.Color("#77512d");
    const grass = new THREE.Color("#53ad3b");

    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const isGrass = y < 4 + Math.floor(hash2D(x * 3, y * 7) * 2);
        const color = (isGrass ? grass : dirt)
          .clone()
          .offsetHSL(0, 0, (hash2D(x * 19, y * 29) - 0.5) * 0.16);
        ctx.fillStyle = `#${color.getHexString()}`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

function makeWoodSideTexture() {
  return makeCanvasTexture((ctx) => {
    const light = new THREE.Color("#8d6238");
    const dark = new THREE.Color("#6a4527");

    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const stripe = Math.sin(x * 0.9) * 0.5 + 0.5;
        const color = light.clone().lerp(dark, stripe * 0.7).offsetHSL(0, 0, (hash2D(x * 11, y * 17) - 0.5) * 0.1);
        ctx.fillStyle = `#${color.getHexString()}`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

function makeWoodTopTexture() {
  return makeCanvasTexture((ctx) => {
    const center = 7.5;
    const light = new THREE.Color("#a97b46");
    const dark = new THREE.Color("#6c482a");

    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const distance = Math.hypot(x - center, y - center) / 11;
        const rings = (Math.sin(distance * 18) * 0.5 + 0.5) * 0.85;
        const color = light.clone().lerp(dark, rings).offsetHSL(0, 0, (hash2D(x * 41, y * 43) - 0.5) * 0.08);
        ctx.fillStyle = `#${color.getHexString()}`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}

function makeLeavesTexture() {
  return makeCanvasTexture((ctx) => {
    const light = new THREE.Color("#4a9a32");
    const dark = new THREE.Color("#29611e");

    ctx.clearRect(0, 0, 16, 16);
    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const alpha = hash2D(x * 23, y * 31);
        if (alpha < 0.18) {
          continue;
        }
        const color = light.clone().lerp(dark, hash2D(x * 11, y * 13) * 0.75);
        ctx.fillStyle = `#${color.getHexString()}`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
}
