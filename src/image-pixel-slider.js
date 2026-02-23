import { LitElement, html, css } from 'lit';

class ImagePixelSlider extends LitElement {
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
      max-width: 600px;
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
    .canvas-container {
      margin-bottom: 24px;
      text-align: center;
    }
    canvas {
      border-radius: 4px;
      max-width: 100%;
    }
    .controls {
      display: flex;
      flex-direction: column;
    }
    .controls label {
      color: #374151;
      font-weight: 700;
      margin-bottom: 8px;
      text-align: center;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    input[type="range"] {
      flex: 1;
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
    .value-display {
      background-color: #645a89;
      color: white;
      border-radius: 4px;
      padding: 8px 16px;
      font-weight: 600;
      min-width: 100px;
      text-align: center;
      white-space: nowrap;
    }
  `;

  static properties = {
    pixelSize: { type: Number },
    imageUrl: { type: String }
  };

  constructor() {
    super();
    this.originalPixelSize = 0.1083333;
    this.pixelSize = this.originalPixelSize;
    this.imageUrl = 'https://microtutor-courses.github.io/microtutor-demos/images/u2os_ph488.jpg';
    this.imageWidth = 500;
    this.imageHeight = 500;
    this.image = null;
  }

  firstUpdated() {
    this.loadImage();
  }

  updated() {
    this.drawPixelatedImage();
  }

  loadImage() {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.onload = () => this.drawPixelatedImage();
    this.image.src = this.imageUrl;
  }

  drawPixelatedImage() {
    const canvas = this.shadowRoot.getElementById('canvas');
    if (!canvas || !this.image || !this.image.complete) return;
    const ctx = canvas.getContext('2d');

    const downsampleFactor = this.pixelSize / this.originalPixelSize;
    const downsampledWidth = Math.floor(this.imageWidth / downsampleFactor);
    const downsampledHeight = Math.floor(this.imageHeight / downsampleFactor);

    ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.image, 0, 0, downsampledWidth, downsampledHeight);
    ctx.drawImage(canvas, 0, 0, downsampledWidth, downsampledHeight, 0, 0, this.imageWidth, this.imageHeight);
  }

  handleSlider(e) {
    this.pixelSize = parseFloat(e.target.value);
  }

  render() {
    return html`
      <div class="container">
        <div class="header">Adjust the image pixel size with the slider below</div>
        <div class="canvas-container">
          <canvas id="canvas" width="${this.imageWidth}" height="${this.imageHeight}"></canvas>
        </div>
        <div class="controls">
          <label>Pixel Size</label>
          <div class="slider-row">
            <input type="range"
              min="0.1083333"
              max="2"
              step="0.01"
              .value=${this.pixelSize}
              @input=${this.handleSlider}>
            <div class="value-display">${this.pixelSize.toFixed(2)} µm</div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('image-pixel-slider', ImagePixelSlider);

function initViewers() {
  document
    .querySelectorAll('[data-component="image-pixel-slider"]')
    .forEach((el) => {
      const viewer = document.createElement('image-pixel-slider');
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