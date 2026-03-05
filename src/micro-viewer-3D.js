import * as THREE from 'three';

class MicroViewer3D extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        // Volume properties
        this.imageData = null;
        this.width = 300;  // x dimension
        this.height = 300;  // y dimension 
        this.depth = 300;  // z dimension
        this.channels = 1;
        this.currentZ = 0;
        this.currentChannel = 0;
        this.crosshairX = 0;
        this.crosshairY = 0;
        
        // Three.js variables
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.xyPlane = null;
        this.xzPlane = null;
        this.yzPlane = null;
        this.boundingBox = null;
    }
    
    connectedCallback() {
        this.render();
        this.initialize();
    }

    disconnectedCallback() {
    if (this._animationFrameId) {
        cancelAnimationFrame(this._animationFrameId);
        this._animationFrameId = null;
    }
    if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
    }
}
    
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    color: #333333;
                }
                
                .container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 15px;
                }
                
                .main-grid {
                    display: grid;
                    grid-template-columns: 300px 300px;
                    grid-template-rows: auto auto;
                    gap: 15px;
                }
                
                .controls {
                    background: #f8f9fa;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                }
                
                .control-group {
                    margin-bottom: 0;
                }
                
                .control-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 6px;
                    color: #555555;
                }
                
                .slider-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                input[type="range"] {
                    flex: 1;
                    height: 4px;
                    border-radius: 2px;
                    background: #d0d0d0;
                    outline: none;
                    -webkit-appearance: none;
                }
                
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #7bcdcf;
                    cursor: pointer;
                }
                
                input[type="range"]::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #7bcdcf;
                    cursor: pointer;
                    border: none;
                }
                
                .view-panel {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 12px;
                    border: 1px solid #e0e0e0;
                }
                
                .view-title {
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    color: #555555;
                }
                
                .canvas-container {
                    position: relative;
                    background: #ecebea;
                    border-radius: 4px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 276px;
                    height: 276px;
                }
                
                .canvas-container.xy {
                    cursor: crosshair;
                }
                
                #threejs-container {
                    width: 276px;
                    height: 276px;
                    background: #ecebea;
                    border-radius: 4px;
                    position: relative;
                }
                
                canvas {
                    display: block;
                    image-rendering: pixelated;
                }
                
                .instructions {
                    background: #e8f4f8;
                    padding: 8px;
                    border-radius: 4px;
                    margin-top: 8px;
                    font-size: 11px;
                    color: #555;
                    line-height: 1.4;
                }
                
                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #666666;
                }
                
                .right-column {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .top-row {
                    grid-column: 1 / 2;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .yz-column {
                    grid-column: 2 / 3;
                    grid-row: 1 / 2;
                    align-self: end;
                }
                
                .xz-row {
                    grid-column: 1 / 2;
                    grid-row: 2 / 3;
                }
                
                .viz-row {
                    grid-column: 2 / 3;
                    grid-row: 2 / 3;
                }
            </style>
            
            <div class="container">
                <div id="loading" class="loading">Loading data...</div>
                
                <div id="viewerContent" style="display: none;">
                    <div class="main-grid">
                        <div class="top-row">
                            <div class="controls">
                                <div class="control-group">
                                    <label>Z Slice: <span id="zValue">0</span></label>
                                    <div class="slider-container">
                                        <input type="range" id="zSlider" min="0" max="0" value="0">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="view-panel xy-panel">
                                <div class="view-title">XY View</div>
                                <div class="canvas-container xy">
                                    <canvas id="canvasXY"></canvas>
                                </div>
                                <div class="instructions">
                                    Click to change crosshair positions
                                </div>
                            </div>
                        </div>
                        
                        <div class="view-panel yz-column">
                            <div class="view-title">YZ View</div>
                            <div class="canvas-container">
                                <canvas id="canvasYZ"></canvas>
                            </div>
                            <div class="instructions" style="visibility: hidden;">
                                &nbsp;
                            </div>
                        </div>
                        
                        <div class="view-panel xz-row">
                            <div class="view-title">XZ View</div>
                            <div class="canvas-container">
                                <canvas id="canvasXZ"></canvas>
                            </div>
                        </div>
                        
                        <div class="view-panel viz-row">
                            <div class="view-title">3D Visualization</div>
                            <div id="threejs-container"></div>
                            <div class="instructions">
                                Drag to rotate • Scroll to zoom
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async initialize() {
        const loading = this.shadowRoot.getElementById('loading');
        const viewerContent = this.shadowRoot.getElementById('viewerContent');
        
        loading.style.display = 'block';
        viewerContent.style.display = 'none';
        
        this.createRectangularPrism();
        this.setupUI();
        this.setupEventListeners();
        this.setup3D();
        this.renderViews();
        
        loading.style.display = 'none';
        viewerContent.style.display = 'block';
    }
    
    createRectangularPrism() {
        const size = this.width * this.height * this.depth;
        this.imageData = new Uint8Array(size);
        
        const prismStartX = Math.floor((this.width - 150)/2);
        const prismEndX = Math.floor((this.width + 150)/2);
        const prismStartY = Math.floor((this.height - 50) / 2);
        const prismEndY = Math.floor((this.height + 50) / 2);
        const prismStartZ = Math.floor((this.depth -150)/2);
        const prismEndZ = Math.floor((this.depth + 150)/2);
        
        for (let z = 0; z < this.depth; z++) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const idx = z * this.height * this.width + y * this.width + x;
                    
                    if (x >= prismStartX && x < prismEndX &&
                        y >= prismStartY && y < prismEndY &&
                        z >= prismStartZ && z < prismEndZ) {
                        this.imageData[idx] = 180;
                    } else {
                        this.imageData[idx] = 50;
                    }
                }
            }
        }
    }
    
    setupUI() {
        const zSlider = this.shadowRoot.getElementById('zSlider');
        zSlider.max = this.depth - 1;
        zSlider.value = Math.floor(this.depth / 2);
        this.currentZ = parseInt(zSlider.value);
        this.shadowRoot.getElementById('zValue').textContent = this.currentZ;
        
        this.crosshairX = Math.floor(this.width / 2);
        this.crosshairY = Math.floor(this.height / 2);
    }
    
    setupEventListeners() {
        this.shadowRoot.getElementById('zSlider').addEventListener('input', (e) => {
            this.currentZ = parseInt(e.target.value);
            this.shadowRoot.getElementById('zValue').textContent = this.currentZ;
            this.renderViews();
            this.update3DPlanes();
        });
        
        const canvasXY = this.shadowRoot.getElementById('canvasXY');
        canvasXY.addEventListener('click', (e) => {
            const rect = canvasXY.getBoundingClientRect();
            const scaleX = canvasXY.width / rect.width;
            const scaleY = canvasXY.height / rect.height;
            const x = Math.floor((e.clientX - rect.left) * scaleX);
            const y = Math.floor((e.clientY - rect.top) * scaleY);
            
            if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                this.crosshairX = x;
                this.crosshairY = y;
                this.renderViews();
                this.update3DPlanes();
            }
        });
    }
    
    setup3D() {
        const container = this.shadowRoot.getElementById('threejs-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const width = 276;
        const height = 276;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xecebea);
        
        const aspect = width / height;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        this.camera.position.set(0.5, 0.5, 0.5);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Calculate prism dimensions for 3D visualization to match createRectangularPrism() dimensions
        const prismStartX = Math.floor((this.width - 150)/2);
        const prismEndX = Math.floor((this.width + 150)/2);
        const prismStartY = Math.floor((this.height - 50) / 2);
        const prismEndY = Math.floor((this.height + 50) / 2);
        const prismStartZ = Math.floor((this.depth -150)/2);
        const prismEndZ = Math.floor((this.depth + 150)/2);
        
        const prismWidth = prismEndX - prismStartX;
        const prismHeight = prismEndY - prismStartY;
        const prismDepth = prismEndZ - prismStartZ;
        
        const maxDim = Math.max(this.width, this.height, this.depth);
        const scaleX = prismWidth / maxDim;
        const scaleY = prismHeight / maxDim;
        const scaleZ = prismDepth / maxDim;
        
        const boxGeometry = new THREE.BoxGeometry(scaleX, scaleY, scaleZ);
        const boxEdges = new THREE.EdgesGeometry(boxGeometry);
        const boxLines = new THREE.LineSegments(
            boxEdges, 
            new THREE.LineBasicMaterial({ color: 0x231f20, linewidth: 2 })
        );
        this.scene.add(boxLines);
        
        // Create planes with prism dimensions
        const prismScaleX = prismWidth / maxDim;
        const prismScaleY = prismHeight / maxDim;
        const prismScaleZ = prismDepth / maxDim;
        
        const xyGeometry = new THREE.PlaneGeometry(prismScaleX, prismScaleY);
        const xyMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x645a89, 
            transparent: true, 
            opacity: 0.9,
            side: THREE.DoubleSide 
        });
        this.xyPlane = new THREE.Mesh(xyGeometry, xyMaterial);
        this.scene.add(this.xyPlane);
        
        const xzGeometry = new THREE.PlaneGeometry(prismScaleX, prismScaleZ);
        const xzMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xcfe8e4, 
            transparent: true, 
            opacity: 0.9,
            side: THREE.DoubleSide 
        });
        this.xzPlane = new THREE.Mesh(xzGeometry, xzMaterial);
        this.xzPlane.rotation.x = Math.PI / 2;
        this.scene.add(this.xzPlane);
        
        const yzGeometry = new THREE.PlaneGeometry(prismScaleY, prismScaleZ);
        const yzMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x26225d, 
            transparent: true, 
            opacity: 0.9,
            side: THREE.DoubleSide 
        });
        this.yzPlane = new THREE.Mesh(yzGeometry, yzMaterial);
        // rotate along 2 axes to get yz orientation
        this.yzPlane.rotation.x = Math.PI / 2;
        this.yzPlane.rotation.y = Math.PI / 2;
        this.scene.add(this.yzPlane);
        
        // Axes helper: commented out to hide axes
        // const axesHelper = new THREE.AxesHelper(1);
        // this.scene.add(axesHelper);
        
        this.setupMouseControls(container);
        this.update3DPlanes();
        this.renderer.render(this.scene, this.camera);
        this.animate();
    }
    
    setupMouseControls(container) {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        container.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                
                const rotationSpeed = 0.005;
                const radius = Math.sqrt(
                    this.camera.position.x ** 2 + 
                    this.camera.position.y ** 2 + 
                    this.camera.position.z ** 2
                );
                
                const theta = Math.atan2(this.camera.position.x, this.camera.position.z);
                const phi = Math.acos(this.camera.position.y / radius);
                
                const newTheta = theta - deltaX * rotationSpeed;
                const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY * rotationSpeed));
                
                this.camera.position.x = radius * Math.sin(newPhi) * Math.sin(newTheta);
                this.camera.position.y = radius * Math.cos(newPhi);
                this.camera.position.z = radius * Math.sin(newPhi) * Math.cos(newTheta);
                
                this.camera.lookAt(0, 0, 0);
                previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });
        
        container.addEventListener('mouseup', () => { isDragging = false; });
        container.addEventListener('mouseleave', () => { isDragging = false; });
        
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const direction = e.deltaY > 0 ? 1 : -1;
            const factor = 1 + direction * zoomSpeed;
            this.camera.position.multiplyScalar(factor);
            
            const distance = this.camera.position.length();
            if (distance < 0.5) {
                this.camera.position.setLength(0.5);
            } else if (distance > 5) {
                this.camera.position.setLength(5);
            }
        });
    }
    
update3DPlanes() {
    if (!this.xyPlane) return;
    
    // Plane positioning in volume
    const maxDim = Math.max(this.width, this.height, this.depth);
    const fullScaleX = this.width / maxDim;   // 300/300 = 1.0
    const fullScaleY = this.height / maxDim;  // 300/300 = 1.0
    const fullScaleZ = this.depth / maxDim;   // 300/300 = 1.0
    
    const normalizedZ = (this.currentZ / (this.depth - 1)) - 0.5;
    this.xyPlane.position.z = normalizedZ * fullScaleZ;
    
    const normalizedY = (this.crosshairY / (this.height - 1)) - 0.5;
    this.xzPlane.position.y = -normalizedY * fullScaleY;
    
    const normalizedX = (this.crosshairX / (this.width - 1)) - 0.5;
    this.yzPlane.position.x = normalizedX * fullScaleX;
}

    animate() {
        this._animationFrameId = requestAnimationFrame(() => this.animate());
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    getVoxel(x, y, z, c) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || 
            z < 0 || z >= this.depth) {
            return 0;
        }
        const idx = (z * this.height * this.width + y * this.width + x) * this.channels + c;
        return this.imageData[idx];
    }
    
    // Helper function to convert hex color to RGB values
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    renderXY(canvas) {
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(this.width, this.height);
        
        const prismColor = this.hexToRgb('#645a89');
        const bgColor = this.hexToRgb('#ecebea');
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const value = this.getVoxel(x, y, this.currentZ, this.currentChannel);
                const idx = (y * this.width + x) * 4;
                
                // Color based on whether inside or outside the prism
                if (value > 100) {
                    imageData.data[idx] = prismColor.r;
                    imageData.data[idx + 1] = prismColor.g;
                    imageData.data[idx + 2] = prismColor.b;
                } else {
                    imageData.data[idx] = bgColor.r;
                    imageData.data[idx + 1] = bgColor.g;
                    imageData.data[idx + 2] = bgColor.b;
                }
                imageData.data[idx + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        ctx.strokeStyle = '#7bcdcf';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.crosshairX, 0);
        ctx.lineTo(this.crosshairX, this.height);
        ctx.stroke();
        
        ctx.strokeStyle = '#9990b2';
        ctx.beginPath();
        ctx.moveTo(0, this.crosshairY);
        ctx.lineTo(this.width, this.crosshairY);
        ctx.stroke();
    }
    
    renderXZ(canvas) {
        // XZ view: X horizontal, Z vertical
        canvas.width = this.width;
        canvas.height = this.depth;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(this.width, this.depth);
        
        const prismColor = this.hexToRgb('#cfe8e4');
        const bgColor = this.hexToRgb('#ecebea');
        
        const y = this.crosshairY;
        
        // Z goes down (vertical), X goes across (horizontal)
        for (let z = 0; z < this.depth; z++) {
            for (let x = 0; x < this.width; x++) {
                const value = this.getVoxel(x, y, z, this.currentChannel);
                const idx = (z * this.width + x) * 4;
                
                // Color based on whether inside or outside the prism
                if (value > 100) {
                    imageData.data[idx] = prismColor.r;
                    imageData.data[idx + 1] = prismColor.g;
                    imageData.data[idx + 2] = prismColor.b;
                } else {
                    imageData.data[idx] = bgColor.r;
                    imageData.data[idx + 1] = bgColor.g;
                    imageData.data[idx + 2] = bgColor.b;
                }
                imageData.data[idx + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Vertical line for X crosshair
        ctx.strokeStyle = '#7bcdcf';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.crosshairX, 0);
        ctx.lineTo(this.crosshairX, this.depth);
        ctx.stroke();
        
        // Horizontal line for Z slice
        ctx.strokeStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(0, this.currentZ);
        ctx.lineTo(this.width, this.currentZ);
        ctx.stroke();
    }
    
    renderYZ(canvas) {
        // YZ view: Y horizontal, Z vertical
        canvas.width = this.height;
        canvas.height = this.depth;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(this.height, this.depth);
        
        const prismColor = this.hexToRgb('#26225d');
        const bgColor = this.hexToRgb('#ecebea');
        
        const x = this.crosshairX;
        
        // Z goes down (vertical), Y goes across (horizontal)
        for (let z = 0; z < this.depth; z++) {
            for (let y = 0; y < this.height; y++) {
                const value = this.getVoxel(x, y, z, this.currentChannel);
                const idx = (z * this.height + y) * 4;
                
                // Color based on whether inside or outside the prism
                if (value > 100) {
                    imageData.data[idx] = prismColor.r;
                    imageData.data[idx + 1] = prismColor.g;
                    imageData.data[idx + 2] = prismColor.b;
                } else {
                    imageData.data[idx] = bgColor.r;
                    imageData.data[idx + 1] = bgColor.g;
                    imageData.data[idx + 2] = bgColor.b;
                }
                imageData.data[idx + 3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Vertical line for Y crosshair
        ctx.strokeStyle = '#9990b2';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.crosshairY, 0);
        ctx.lineTo(this.crosshairY, this.depth);
        ctx.stroke();
        
        // Horizontal line for Z slice
        ctx.strokeStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(0, this.currentZ);
        ctx.lineTo(this.height, this.currentZ);
        ctx.stroke();
    }
    
    renderViews() {
        this.renderXY(this.shadowRoot.getElementById('canvasXY'));
        this.renderXZ(this.shadowRoot.getElementById('canvasXZ'));
        this.renderYZ(this.shadowRoot.getElementById('canvasYZ'));
    }
}

// Register the custom element
customElements.define('micro-viewer-3D', MicroViewer3D);

// For Moodle integration: Custom elemnts are sanitized or not allowed,
// The code below is a work around: Look for divs with data-component="micro-viewer-3D"
// and replace them with the web component.
function initViewers() {
	document
		.querySelectorAll('[data-component="micro-viewer-3D"]')
		.forEach((el) => {
			const viewer = document.createElement("micro-viewer-3D");

			// grab all data- attributes and pass them to the viewer
			Object.keys(el.dataset).forEach((key) => {
				viewer[key] = el.dataset[key];
			});

			el.replaceWith(viewer);
		});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initViewers);
} else {
	initViewers();
}