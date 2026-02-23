import { LitElement, html, css } from 'lit';

class SNRDemo extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .header {
      background-color: #645a89;
      color: white;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 24px;
      font-weight: 600;
    }
    .panels {
      display: flex;
      gap: 24px;
      justify-content: center;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .panel h4 {
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #374151;
      font-size: 16px;
    }
    .canvas-wrapper {
      border: 2px solid #d1d5db;
      border-radius: 4px;
    }
    canvas {
      display: block;
    }
    .controls {
      display: flex;
      flex-direction: column;
      max-width: 930px;
      margin: 0 auto;
    }
    .controls label {
      color: #374151;
      font-weight: 700;
      margin-bottom: 8px;
      text-align: center;
    }
    input[type="range"] {
      width: 100%;
      -webkit-appearance: none;
      height: 6px;
      background: #d1d5db;
      border-radius: 5px;
      outline: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #7bcdcf;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    input[type="range"]::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #7bcdcf;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `;

  static properties = {
    noiseLevel: { type: Number },
  };

  constructor() {
    super();
    this.noiseLevel = 0;
    this.imageWidth = 400;
    this.imageHeight = 400;
    this.plotWidth = 500;
    this.plotHeight = 400;
    this.originalImageData = null;
    this.image = null;
  }

  firstUpdated() {
    this.loadImage();
  }

  updated() {
    if (this.originalImageData) {
      this.drawAll();
    }
  }

  loadImage() {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.onload = () => {
      // Draw to offscreen canvas to extract pixel data
      const offscreen = document.createElement('canvas');
      offscreen.width = this.imageWidth;
      offscreen.height = this.imageHeight;
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight);
      this.originalImageData = ctx.getImageData(0, 0, this.imageWidth, this.imageHeight);
      this.drawAll();
    };
    this.image.onerror = () => console.error('Failed to load image');
    this.image.src = 'https://microtutor-courses.github.io/microtutor-demos/images/lateral_psf.png';
  }

  gaussianRandom() {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  generateNoisyData() {
    // t goes from 0 (no noise) to 1 (max noise)
    const t = this.noiseLevel / 20;

    // Signal scales down, noise scales up
    const signalStrength = 1 - t * 0.95; // signal drops to 5% at max
    const noiseSigma = t * 120; // noise grows to sigma=120 at max

    const src = this.originalImageData.data;
    const noisyData = new Float32Array(this.imageWidth * this.imageHeight);

    for (let i = 0; i < this.imageWidth * this.imageHeight; i++) {
      const idx = i * 4;
      const r = src[idx], g = src[idx + 1], b = src[idx + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const signal = gray * signalStrength;
      const noise = this.gaussianRandom() * noiseSigma;
      noisyData[i] = signal + noise;
    }

    return noisyData;
  }

  drawAll() {
    const noisyData = this.generateNoisyData();
    this.drawImage(noisyData);
    this.drawPlot(noisyData);
  }

  drawImage(noisyData) {
    const canvas = this.shadowRoot.getElementById('image-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Contrast stretch for display
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < noisyData.length; i++) {
      if (noisyData[i] < min) min = noisyData[i];
      if (noisyData[i] > max) max = noisyData[i];
    }
    const range = max - min || 1;

    const imageData = ctx.createImageData(this.imageWidth, this.imageHeight);
    for (let i = 0; i < noisyData.length; i++) {
      const val = Math.max(0, Math.min(255, ((noisyData[i] - min) / range) * 255));
      imageData.data[i * 4] = val;
      imageData.data[i * 4 + 1] = val;
      imageData.data[i * 4 + 2] = val;
      imageData.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Draw dotted line across middle
    const midY = this.imageHeight / 2;
    ctx.strokeStyle = '#7bcdcf';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(this.imageWidth, midY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  drawPlot(noisyData) {
    const canvas = this.shadowRoot.getElementById('plot-canvas');
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = this.plotWidth * dpr;
    canvas.height = this.plotHeight * dpr;
    canvas.style.width = this.plotWidth + 'px';
    canvas.style.height = this.plotHeight + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const w = this.plotWidth;
    const h = this.plotHeight;
    const padding = 50;

    // Clear
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);

    // Extract middle row intensities — clamp to 0-255 for fixed axis
    const midY = Math.floor(this.imageHeight / 2);
    const intensities = [];
    for (let x = 0; x < this.imageWidth; x++) {
      const val = Math.max(0, Math.min(255, noisyData[midY * this.imageWidth + x]));
      intensities.push(val);
    }

    // Axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // Y axis ticks and labels (fixed 0-255)
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    [0, 64, 128, 192, 255].forEach(val => {
      const y = h - padding - (val / 255) * (h - 2 * padding);
      ctx.beginPath();
      ctx.moveTo(padding - 5, y);
      ctx.lineTo(padding, y);
      ctx.stroke();
      ctx.fillText(val, padding - 8, y + 4);
    });

    // Axis labels
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Distance (pixels)', w / 2, h - 10);

    ctx.save();
    ctx.translate(14, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Intensity', 0, 0);
    ctx.restore();

    // Plot intensity line
    const plotAreaWidth = w - 2 * padding;
    const plotAreaHeight = h - 2 * padding;

    ctx.strokeStyle = '#7bcdcf';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < intensities.length; i++) {
      const x = padding + (i / (intensities.length - 1)) * plotAreaWidth;
      const y = h - padding - (intensities[i] / 255) * plotAreaHeight;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  handleSlider(e) {
    this.noiseLevel = parseFloat(e.target.value);
  }

  render() {
    return html`
      <div class="container">
        <div class="header">Adjust the noise and observe the effect on the intensity profile</div>
        <div class="panels">
          <div class="panel">
            <h4>Digital Image</h4>
            <div class="canvas-wrapper">
              <canvas id="image-canvas" width="${this.imageWidth}" height="${this.imageHeight}"></canvas>
            </div>
          </div>
          <div class="panel">
            <h4>Intensity Profile</h4>
            <div class="canvas-wrapper">
              <canvas id="plot-canvas" style="width:${this.plotWidth}px;height:${this.plotHeight}px"></canvas>
            </div>
          </div>
        </div>
        <div class="controls">
          <label>Noise</label>
          <input type="range" min="0" max="20" step="0.1"
            .value=${this.noiseLevel}
            @input=${this.handleSlider}>
        </div>
      </div>
    `;
  }
}

customElements.define('snr-demo', SNRDemo);

function initViewers() {
  document
    .querySelectorAll('[data-component="snr-demo"]')
    .forEach((el) => {
      const viewer = document.createElement('snr-demo');
      Object.keys(el.dataset).forEach((key) => {
        viewer[key] = el.dataset[key];
      });
      el.replaceWith(viewer);
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initViewers);
} else {
  initViewers();
}