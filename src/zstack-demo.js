import { LitElement, html, css } from 'lit';

class ZStackDemo extends LitElement {
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
      font-size: 16px;
    }
    .canvas-container {
      display: flex;
      justify-content: center;
      margin-bottom: 24px;
      line-height: 0;
    }
    canvas {
      display: block;
      border-radius: 4px;
      background: #f0f4f8;
    }
    .controls {
      display: flex;
      flex-direction: column;
    }
    .slider-label {
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
      min-width: 80px;
      text-align: center;
      white-space: nowrap;
    }
    .slice-count {
      text-align: center;
      margin-top: 10px;
      font-size: 13px;
      color: #6b7280;
    }
  `;

  static properties = {
    stepSize: { type: Number },
  };

  constructor() {
    super();
    this.stepSize = 2.0;
    // Sphere and canvas parameters
    this.sphereDiameter = 10; // µm
    this.sphereRadius = this.sphereDiameter / 2;
    this.canvasWidth = 450;
    this.canvasHeight = 320;
    // Scale: pixels per micron
    this.scale = 28; // 1 µm = 28 px
  }

  firstUpdated() {
    this.drawReconstruction();
  }

  updated() {
    this.drawReconstruction();
  }

  drawReconstruction() {
    const canvas = this.shadowRoot.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const W = this.canvasWidth;
    const H = this.canvasHeight;
    const scale = this.scale;
    const R = this.sphereRadius; // µm
    const step = this.stepSize;  // µm

    ctx.clearRect(0, 0, W, H);

    // Fill background
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, W, H);

    // Center of sphere in canvas coords
    const cx = W / 2;
    const cy = H / 2;

    // Total sphere height in pixels
    const sphereHeightPx = this.sphereDiameter * scale;

    // Compute z slice positions from -R to +R
    // Slices start at -R and step upward
    const slices = [];
    for (let z = -R; z < R; z += step) {
      const zCenter = z + step / 2; // center of this slice
      // Clamp zCenter within sphere
      if (Math.abs(zCenter) > R) continue;
      // Radius of sphere cross-section at this z
      const sliceR = Math.sqrt(R * R - zCenter * zCenter); // µm
      slices.push({ z, zCenter, sliceR });
    }

    // Draw slices from bottom to top
    // z increases upward on screen (bottom of canvas = -R, top = +R)
    for (const slice of slices) {
      const { z, sliceR } = slice;

      // y position on canvas: z=-R is at cy + sphereHeightPx/2
      // z=+R is at cy - sphereHeightPx/2
      const sliceTopY = cy - (z + step) * scale;
      const sliceBottomY = cy - z * scale;
      const sliceHeight = Math.max(sliceBottomY - sliceTopY, 1);

      const sliceWidthPx = sliceR * 2 * scale;
      const sliceLeft = cx - sliceWidthPx / 2;

      // Draw disc as filled rounded rect
      const rounding = Math.min(sliceHeight / 2, sliceWidthPx / 2, 6);

      ctx.beginPath();
      ctx.roundRect(sliceLeft, sliceTopY, sliceWidthPx, sliceHeight, rounding);
      ctx.fillStyle = '#7bcdcf';
      ctx.fill();

      // Stroke border between slices
      ctx.strokeStyle = '#f0f4f8';
      ctx.lineWidth = step > 1.5 ? 2 : 1;
      ctx.stroke();
    }

    // Z label
    ctx.fillStyle = '#645a89';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('z', axisX, axisTop - 14);

    // Step size bracket on the right (only if step is large enough to show)
    if (slices.length > 0 && slices.length <= 12) {
      const bracketX = cx + (R * scale) + 18;
      // Show bracket for the top slice
      const topSlice = slices[slices.length - 1];
      const bracketTop = cy - (topSlice.z + step) * scale;
      const bracketBottom = cy - topSlice.z * scale;
      const bh = bracketBottom - bracketTop;

      if (bh > 8) {
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1.5;

        // Bracket lines
        ctx.beginPath();
        ctx.moveTo(bracketX + 4, bracketTop);
        ctx.lineTo(bracketX, bracketTop);
        ctx.lineTo(bracketX, bracketBottom);
        ctx.lineTo(bracketX + 4, bracketBottom);
        ctx.stroke();

        // Label
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('step', bracketX + 8, (bracketTop + bracketBottom) / 2 - 4);
        ctx.fillText('size', bracketX + 8, (bracketTop + bracketBottom) / 2 + 10);
      }
    }
  }

  handleSlider(e) {
    this.stepSize = parseFloat(e.target.value);
  }

  render() {
    const sliceCount = Math.floor(this.sphereDiameter / this.stepSize);

    return html`
      <div class="container">
        <div class="header">Adjust step size to observe effect on z-stack reconstruction</div>
        <div class="canvas-container">
          <canvas
            id="canvas"
            width="${this.canvasWidth}"
            height="${this.canvasHeight}"
          ></canvas>
        </div>
        <div class="controls">
          <div class="slider-label">Step Size</div>
          <div class="slider-row">
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              .value=${this.stepSize}
              @input=${this.handleSlider}
            >
            <div class="value-display">${this.stepSize.toFixed(1)} µm</div>
          </div>
        </div>
        <div class="slice-count">${sliceCount} z-slice${sliceCount !== 1 ? 's' : ''}</div>
      </div>
    `;
  }
}

customElements.define('zstack-demo', ZStackDemo);

function initViewers() {
  document
    .querySelectorAll('[data-component="zstack-demo"]')
    .forEach((el) => {
      const viewer = document.createElement('zstack-demo');
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