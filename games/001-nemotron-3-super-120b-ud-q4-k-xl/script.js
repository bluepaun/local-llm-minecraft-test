// Minecraft Clone with Three.js
let scene, camera, renderer;
let player;
let controls;
let clock;
let world;
let raycaster;
let mouse;
let isLeftClick = false;
let isRightClick = false;

// Game constants
const BLOCK_SIZE = 1;
const CHUNK_SIZE = 16;
const VIEW_DISTANCE = 4; // Number of chunks to render in each direction

// Block types
const BLOCK_TYPES = {
    GRASS: 0,
    DIRT: 1,
    STONE: 2,
    WOOD: 3,
    LEAVES: 4,
    SAND: 5
};

const BLOCK_COLORS = [
    0x228B22, // GRASS - Forest Green
    0x8B4513, // DIRT - Saddle Brown
    0x696969, // STONE - Dim Gray
    0x8B4513, // WOOD - Saddle Brown
    0x228B22, // LEAVES - Forest Green
    0xF4A460  // SAND - Sandy Brown
];

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75, // FOV
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near plane
        1000 // Far plane
    );
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Create player (simple box for now)
    const playerGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 1.5; // Eye level
    scene.add(player);
    
    // Create camera rig to hold the camera
    const cameraRig = new THREE.Object3D();
    cameraRig.add(camera);
    camera.position.set(0, 0, 0); // Camera offset from player
    player.add(cameraRig);
    
    // Initialize clock for delta time
    clock = new THREE.Clock();
    
    // Initialize raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Initialize world
    world = new World();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
}

// Set up event listeners for input
function setupEventListeners() {
    // Mouse down
    window.addEventListener('mousedown', (event) => {
        if (event.button === 0) isLeftClick = true; // Left click
        if (event.button === 2) isRightClick = true; // Right click
    });
    
    // Mouse up
    window.addEventListener('mouseup', (event) => {
        if (event.button === 0) isLeftClick = false;
        if (event.button === 2) isRightClick = false;
    });
    
    // Mouse move for looking
    window.addEventListener('mousemove', (event) => {
        // Calculate mouse position in normalized device coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Keyboard controls
    const keys = {};
    window.addEventListener('keydown', (event) => {
        keys[event.code] = true;
    });
    
    window.addEventListener('keyup', (event) => {
        keys[event.code] = false;
    });
    
    // Update player movement based on keys
    function updatePlayerMovement(delta) {
        const speed = 5 * delta; // 5 units per second
        
        if (keys['KeyW']) {
            // Move forward based on camera direction
            const direction = new THREE.Vector3();
            player.getWorldDirection(direction);
            direction.y = 0; // Keep movement on horizontal plane
            direction.normalize();
            player.position.addScaledVector(direction, speed);
        }
        if (keys['KeyS']) {
            const direction = new THREE.Vector3();
            player.getWorldDirection(direction);
            direction.y = 0;
            direction.normalize();
            player.position.addScaledVector(direction, -speed);
        }
        if (keys['KeyA']) {
            // Strafe left
            const direction = new THREE.Vector3();
            player.getWorldDirection(direction);
            direction.y = 0;
            direction.normalize();
            const left = new THREE.Vector3(-direction.z, 0, direction.x);
            player.position.addScaledVector(left, speed);
        }
        if (keys['KeyD']) {
            // Strafe right
            const direction = new THREE.Vector3();
            player.getWorldDirection(direction);
            direction.y = 0;
            direction.normalize();
            const right = new THREE.Vector3(direction.z, 0, -direction.x);
            player.position.addScaledVector(right, speed);
        }
        
        // Jump (simple implementation)
        if (keys['Space']) {
            // Simple jump - in a full game we'd have proper physics
            if (Math.abs(player.position.y - 1.5) < 0.1) { // Only jump if on ground
                player.position.y += 5 * delta; // Initial jump velocity
            }
        }
        
        // Apply gravity
        player.position.y -= 9.8 * delta * 0.5; // Simple gravity
        
        // Keep player above ground
        if (player.position.y < 1.5) {
            player.position.y = 1.5;
        }
    }
    
    // Store for use in animation loop
    window.updatePlayerMovement = updatePlayerMovement;
    window.keys = keys;
}

// Handle block placement/removal
function handleBlockInteraction() {
    // Update raycaster with camera position and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Get all meshes in scene that could be blocks
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        const intersect = intersects[0];
        const point = intersect.point;
        const face = intersect.face;
        
        if (isLeftClick && intersect.object !== player && intersect.object !== camera) {
            // Remove block
            scene.remove(intersect.object);
            // Update world data
            const blockPos = world.worldToBlockCoords(point);
            world.setBlock(blockPos.x, blockPos.y, blockPos.z, 0); // Air
        }
        
        if (isRightClick) {
            // Place block
            const normal = face.normal;
            const placePos = new THREE.Vector3(
                point.x + normal.x * BLOCK_SIZE/2,
                point.y + normal.y * BLOCK_SIZE/2,
                point.z + normal.z * BLOCK_SIZE/2
            );
            
            // Snap to grid
            const blockPos = world.worldToBlockCoords(placePos);
            
            // Check if position is empty and not too close to player
            if (world.getBlock(blockPos.x, blockPos.y, blockPos.z) === 0 &&
                player.distanceTo(new THREE.Vector3(
                    blockPos.x * BLOCK_SIZE,
                    blockPos.y * BLOCK_SIZE,
                    blockPos.z * BLOCK_SIZE
                )) > 2) {
                
                // Add block
                world.setBlock(blockPos.x, blockPos.y, blockPos.z, BLOCK_TYPES.GRASS); // Default to grass
                world.addBlockToScene(blockPos.x, blockPos.y, blockPos.z, scene);
            }
        }
        
        // Reset clicks after handling
        isLeftClick = false;
        isRightClick = false;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Update player movement
    if (window.updatePlayerMovement) {
        window.updatePlayerMovement(delta);
    }
    
    // Handle block interactions
    handleBlockInteraction();
    
    // Update FPS counter
    const fps = Math.round(1 / delta);
    document.getElementById('fps').textContent = fps;
    
    // Update chunk count
    document.getElementById('chunks').textContent = world.getActiveChunksCount();
    
    // Render scene
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// World class to manage chunks and blocks
class World {
    constructor() {
        this.chunks = new Map(); // Stores chunks by their coordinates
        this.blockTypes = new Map(); // Cache for block materials
        this.initBlockTypes();
        this.generateInitialChunks();
    }
    
    initBlockTypes() {
        // Create materials for each block type
        BLOCK_TYPES.GRASS = 0;
        BLOCK_TYPES.DIRT = 1;
        BLOCK_TYPES.STONE = 2;
        BLOCK_TYPES.WOOD = 3;
        BLOCK_TYPES.LEAVES = 4;
        BLOCK_TYPES.SAND = 5;
        
        for (let i = 0; i < Object.keys(BLOCK_TYPES).length; i++) {
            const color = BLOCK_COLORS[i] || 0xffffff;
            this.blockTypes.set(i, new THREE.MeshBasicMaterial({ 
                color: color,
                side: THREE.DoubleSide
            }));
        }
    }
    
    // Generate initial chunks around origin
    generateInitialChunks() {
        for (let x = -VIEW_DISTANCE; x <= VIEW_DISTANCE; x++) {
            for (let z = -VIEW_DISTANCE; z <= VIEW_DISTANCE; z++) {
                this.generateChunk(x, 0, z);
            }
        }
    }
    
    // Generate a chunk of blocks
    generateChunk(chunkX, chunkY, chunkZ) {
        const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
        
        // Check if chunk already exists
        if (this.chunks.has(chunkKey)) return;
        
        const chunk = new THREE.Object3D();
        
        // Generate terrain for this chunk
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const worldX = chunkX * CHUNK_SIZE + x;
                const worldZ = chunkZ * CHUNK_SIZE + z;
                
                // Simple height map based on perlin noise (simplified)
                const height = Math.floor(
                    10 + 
                    5 * Math.sin(worldX * 0.1) * 
                    Math.cos(worldZ * 0.1)
                );
                
                // Generate blocks from bedrock up to height
                for (let y = 0; y < height; y++) {
                    let blockType;
                    if (y === 0) {
                        blockType = BLOCK_TYPES.STONE; // Bedrock layer
                    } else if (y < height - 3) {
                        blockType = BLOCK_TYPES.STONE; // Stone
                    } else if (y === height - 1) {
                        blockType = BLOCK_TYPES.GRASS; // Grass top
                    } else {
                        blockType = BLOCK_TYPES.DIRT; // Dirt
                    }
                    
                    if (blockType > 0) { // Not air
                        this.addBlockToChunk(chunk, worldX, y, worldZ, blockType);
                    }
                }
                
                // Add some trees occasionally
                if (Math.random() < 0.05 && height > 10) { // 5% chance
                    this.generateTree(worldX, height, worldZ, chunk);
                }
            }
        }
        
        this.chunks.set(chunkKey, chunk);
        scene.add(chunk);
    }
    
    // Add a block to a chunk
    addBlockToChunk(chunk, x, y, z, blockType) {
        const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const material = this.blockTypes.get(blockType);
        const block = new THREE.Mesh(geometry, material);
        
        block.position.set(
            x * BLOCK_SIZE,
            y * BLOCK_SIZE,
            z * BLOCK_SIZE
        );
        
        chunk.add(block);
    }
    
    // Generate a simple tree
    generateTree(baseX, baseY, baseZ, chunk) {
        const trunkHeight = 4 + Math.floor(Math.random() * 3);
        const leafRadius = 3;
        
        // Generate trunk
        for (let y = 0; y < trunkHeight; y++) {
            this.addBlockToChunk(
                chunk, 
                baseX, 
                baseY + y, 
                baseZ, 
                BLOCK_TYPES.WOOD
            );
        }
        
        // Generate leaves
        const leafY = baseY + trunkHeight;
        for (let x = -leafRadius; x <= leafRadius; x++) {
            for (let y = -leafRadius; y <= leafRadius; y++) {
                for (let z = -leafRadius; z <= leafRadius; z++) {
                    // Spherical leaf distribution
                    if (x*x + y*y + z*z <= leafRadius*leafRadius) {
                        // Sometimes leave gaps for realism
                        if (Math.random() > 0.3) {
                            this.addBlockToChunk(
                                chunk,
                                baseX + x,
                                leafY + y,
                                baseZ + z,
                                BLOCK_TYPES.LEAVES
                            );
                        }
                    }
                }
            }
        }
    }
    
    // Add block to scene (for placement)
    addBlockToScene(x, y, z, blockType) {
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkY = Math.floor(y / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        
        const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
        let chunk = this.chunks.get(chunkKey);
        
        if (!chunk) {
            chunk = new THREE.Object3D();
            this.chunks.set(chunkKey, chunk);
            scene.add(chunk);
        }
        
        this.addBlockToChunk(chunk, x, y, z, blockType);
    }
    
    // Set block in world data
    setBlock(x, y, z, blockType) {
        // In a full implementation, we'd store this in a 3D array or similar
        // For simplicity, we're just modifying the scene directly
        // A real implementation would have proper chunk data storage
        const chunkX = Math.floor(x / CHUNK_SIZE);
        const chunkY = Math.floor(y / CHUNK_SIZE);
        const chunkZ = Math.floor(z / CHUNK_SIZE);
        
        const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localY = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        
        const chunkKey = `${chunkX},${chunkY},${chunkZ}`;
        const chunk = this.chunks.get(chunkKey);
        
        if (chunk) {
            // Remove existing block if any
            // In a full implementation, we'd modify the chunk's internal data
            // and rebuild the mesh
            
            // For now, we'll just remove and re-add if changing from/to air
            if (blockType === 0) { // Setting to air
                // Find and remove block at this position
                for (let i = chunk.children.length - 1; i >= 0; i--) {
                    const block = chunk.children[i];
                    if (block.position.x === localX * BLOCK_SIZE &&
                        block.position.y === localY * BLOCK_SIZE &&
                        block.position.z === localZ * BLOCK_SIZE) {
                        chunk.remove(block);
                        break;
                    }
                }
            } else { // Setting to solid block
                // Check if block already exists
                let exists = false;
                for (let i = 0; i < chunk.children.length; i++) {
                    const block = chunk.children[i];
                    if (block.position.x === localX * BLOCK_SIZE &&
                        block.position.y === localY * BLOCK_SIZE &&
                        block.position.z === localZ * BLOCK_SIZE) {
                        exists = true;
                        break;
                    }
                }
                
                if (!exists) {
                    this.addBlockToChunk(chunk, x, y, z, blockType);
                }
            }
        }
    }
    
    // Get block type at position
    getBlock(x, y, z) {
        // Simplified - in reality we'd check our chunk data
        // For now, return 0 (air) for simplicity in placement checks
        return 0;
    }
    
    // Convert world coordinates to block coordinates
    worldToBlockCoords(position) {
        return {
            x: Math.floor(position.x / BLOCK_SIZE),
            y: Math.floor(position.y / BLOCK_SIZE),
            z: Math.floor(position.z / BLOCK_SIZE)
        };
    }
    
    // Get count of active chunks
    getActiveChunksCount() {
        return this.chunks.size;
    }
}

// Initialize the game when page loads
window.addEventListener('load', init);