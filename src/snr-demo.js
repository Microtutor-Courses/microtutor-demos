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
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
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
      flex-direction: row;
      gap: 24px;
      justify-content: center;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
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
      width: 100%;
      line-height: 0;
    }
    canvas {
      display: block; 
      width: 100%;
      line-height: 0;
    }
    .controls {
      display: flex;
      flex-direction: column;
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

  .panels.stacked {
      flex-direction: column;
      align-items: center;
    }
    .panels.stacked .panel {
      width: 100%;
  }   
  `;

  static properties = {
    noiseLevel: { type: Number },
    _imageSize: { state: true },
    _plotWidth: { state: true },
    _plotHeight: { state: true },
    _stacked: { state: true },
  };

  constructor() {
    super();
    this.noiseLevel = 0;
    this._imageSize = 400;
    this._plotWidth = 500;
    this._plotHeight = 400;
    this._stacked = false;
    this.originalImageData = null;
    this.image = null;
    this._resizeObserver = null;
  }

  firstUpdated() {
    const container = this.shadowRoot.querySelector('.container');
    this._resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const totalWidth = Math.floor(entry.contentRect.width);
        // Match media query breakpoint: stack below 768px viewport,
        const stacked = totalWidth < 768;
        this._stacked = stacked;

        if (stacked) {
          // Each canvas gets full container width
          this._imageSize = totalWidth;
          this._plotWidth = totalWidth;
          this._plotHeight = Math.round(totalWidth * 0.8);
        } else {
          // Split available width between the two panels, accounting for gap
          const gap = 24;
          const halfWidth = Math.floor((totalWidth - gap) / 2);
          this._imageSize = halfWidth;
          this._plotWidth = halfWidth;
          this._plotHeight = halfWidth;
        }
      }
    });
    this._resizeObserver.observe(container);
    this.loadImage();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) this._resizeObserver.disconnect();
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
      const offscreen = document.createElement('canvas');
      offscreen.width = 400; // use fixed reference size
      offscreen.height = 400; // use fixed reference size
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(this.image, 0, 0, 400, 400);
      this.originalImageData = ctx.getImageData(0, 0, 400, 400);
      this.drawAll();
    };
    this.image.onerror = () => console.error('Failed to load image');
    this.image.src = 'https://microtutor-courses.github.io/microtutor-demos/images/lateral_psf.png';
  }

  gaussianRandom() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  generateNoisyData() {
    const t = this.noiseLevel / 20;
    const signalStrength = 1 - t * 0.95;
    const noiseSigma = t * 120;

    const src = this.originalImageData.data;
    const size = 400; // use fixed reference size
    const noisyData = new Float32Array(size * size);

    for (let i = 0; i < size * size; i++) {
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
  const size = this._imageSize;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Build 400x400 imageData first
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < noisyData.length; i++) {
    if (noisyData[i] < min) min = noisyData[i];
    if (noisyData[i] > max) max = noisyData[i];
  }
  const range = max - min || 1;

  const offscreen = document.createElement('canvas');
  offscreen.width = 400;
  offscreen.height = 400;
  const offCtx = offscreen.getContext('2d');
  const imageData = offCtx.createImageData(400, 400);
  for (let i = 0; i < noisyData.length; i++) {
    const val = Math.max(0, Math.min(255, ((noisyData[i] - min) / range) * 255));
    imageData.data[i * 4] = val;
    imageData.data[i * 4 + 1] = val;
    imageData.data[i * 4 + 2] = val;
    imageData.data[i * 4 + 3] = 255;
  }
  offCtx.putImageData(imageData, 0, 0);

  // Scale up to display canvas
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, size, size);

  // Dotted line
  ctx.strokeStyle = '#7bcdcf';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

  drawPlot(noisyData) {
    const canvas = this.shadowRoot.getElementById('plot-canvas');
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = this._plotWidth;
    const h = this._plotHeight;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px'; 
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const padding = 50;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, w, h);

    const refSize = 400; // use fixed ref size so intensity plot is consistently plotting pixel values
    const midY = Math.floor(refSize / 2);
    const intensities = [];
    for (let x = 0; x < refSize; x++) {
      const val = Math.max(0, Math.min(255, noisyData[midY * refSize + x]));
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

    // Y axis ticks and labels
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

    // Plot line
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
        <div class="panels ${this._stacked ? 'stacked' : ''}">
          <div class="panel">
            <h4>Digital Image</h4>
            <div class="canvas-wrapper">
              <canvas id="image-canvas"></canvas>
            </div>
          </div>
          <div class="panel">
            <h4>Intensity Profile</h4>
            <div class="canvas-wrapper">
              <canvas id="plot-canvas"></canvas>
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