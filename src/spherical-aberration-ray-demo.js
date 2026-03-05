/**
 * Spherical aberration ray diagram simulator originally authored by Talley Lambert
 * Adapted for Microtutor and converted to a Lit web component by Eva de la Serna
 */

import { LitElement, html, css } from 'lit';

class SphericalAberrationRayDemo extends LitElement {
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
      max-width: 900px;
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
      width: 100%;
      margin-bottom: 24px;
      line-height: 0;
    }
    canvas {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 4px;
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
    .slider-range-labels {
      display: flex;
      justify-content: space-between;
      margin-top: 6px;
      font-size: 15px;
      color: #6b7280;
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

    @media (max-width: 600px) {
      .container {
        padding: 16px;
      }
    }
  `;

  static properties = {
    oilRI: { type: Number },
  };

  constructor() {
    super();
    this.oilRI = 1.516;
    this.settings = {
      csThick: 170,
      oilThick: 500,
      csRI: 1.516,
      sampleRI: 1.44,
      depth: 0,
      numrays: 5,
      max_aoi: 53.19,
      vertShift: 0,
    };
    this.canvasWidth = 1024;
    this.canvasHeight = 600;
    this.zoom = 101;
  }

  firstUpdated() {
    this.drawFan();
  }

  updated() {
    this.drawFan();
  }

  // --- Math helpers ---
  deg2rad(x) { return x * Math.PI / 180; }
  microns2pixels(x) { return x * this.zoom; }
  pixels2microns(x) { return x / this.zoom; }

  linspace(a, b, n) {
    if (n < 2) return n === 1 ? [a] : [];
    const ret = Array(n);
    for (let i = 0; i < n; i++) ret[i] = (i * b + (n - 1 - i) * a) / (n - 1);
    return ret;
  }

  aor(aoi, ri1, ri2) {
    return Math.asin(Math.sin(aoi) * ri1 / ri2);
  }

  // --- Drawing ---
  drawLine(ctx, a, b, dash, color) {
    dash = dash || [0, 0];
    color = color || '#000000';
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([0, 0]);
  }

  drawRay(ctx, aoi) {
    const { csThick, oilThick, csRI, sampleRI, depth, vertShift } = this.settings;
    const oilRI = this.oilRI;
    const midline = this.canvasWidth / 2;
    const csLine = this.canvasHeight / 2;

    const csAOR = this.aor(this.deg2rad(aoi), sampleRI, csRI);
    const oilAOR = this.aor(csAOR, csRI, oilRI);

    const point0 = {
      x: midline,
      y: csLine + vertShift - this.microns2pixels(depth),
    };
    const point1 = {
      x: midline + this.microns2pixels(Math.tan(this.deg2rad(aoi)) * depth),
      y: csLine + vertShift,
    };
    const point2 = {
      x: point1.x + this.microns2pixels(Math.tan(csAOR) * csThick),
      y: csLine + vertShift + this.microns2pixels(csThick),
    };
    const point3 = {
      x: point2.x + this.microns2pixels(Math.tan(oilAOR) * oilThick),
      y: csLine + vertShift + this.microns2pixels(csThick + oilThick),
    };

    const b = Math.tan(this.deg2rad(aoi)) * depth + Math.tan(csAOR) * csThick;
    const c = csThick + this.pixels2microns(csLine + vertShift);
    const a = Math.tan(oilAOR) * c - b;
    const backpoint = {
      x: midline - this.microns2pixels(a),
      y: 0,
    };

    this.drawLine(ctx, point2, point3, [0, 0], '#7bcdcf');
    this.drawLine(ctx, point2, backpoint, [0, 0], '#7bcdcf');
  }

  drawFan() {
    const canvas = this.shadowRoot.getElementById('canvas');
    if (!canvas) return;

    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    const ctx = canvas.getContext('2d');

    const { max_aoi, numrays } = this.settings;
    const aois = this.linspace(-max_aoi, max_aoi, numrays);

    // Draw rays first
    for (const aoi of aois) {
      this.drawRay(ctx, aoi);
    }

    // Draw horizontal dotted midline on top
    const halfHeight = this.canvasHeight / 2;
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.moveTo(0, halfHeight);
    ctx.lineTo(this.canvasWidth, halfHeight);
    ctx.stroke();
    ctx.setLineDash([0, 0]);
  }

  handleSlider(e) {
    this.oilRI = parseFloat(e.target.value);
  }

  render() {
    return html`
      <div class="container">
        <div class="header">Adjust the oil refractive index to observe spherical aberration</div>
        <div class="canvas-container">
          <canvas id="canvas"></canvas>
        </div>
        <div class="controls">
          <div class="slider-label">Spherical Aberration</div>
          <input
            type="range"
            min="1.516"
            max="1.520"
            step="0.0001"
            .value=${this.oilRI}
            @input=${this.handleSlider}
          >
          <div class="slider-range-labels">
            <span>None</span>
            <span>High</span>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('spherical-aberration-ray-demo', SphericalAberrationRayDemo);

function initViewers() {
  document
    .querySelectorAll('[data-component="spherical-aberration-ray-demo"]')
    .forEach((el) => {
      const viewer = document.createElement('spherical-aberration-ray-demo');
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