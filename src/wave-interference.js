import { LitElement, html, css } from 'lit';

class WaveInterference extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: sans-serif;
    }
    .container {
      background: #f3f4f6;
      padding: 2rem;
      border-radius: 8px;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      padding: 1.5rem;
      max-width: 560px;
      margin: 0 auto;
    }
    .title {
      background-color: #645a89;
      color: white;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .wave-row {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .label {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      color: #645a89;
      font-weight: bold;
      font-size: 14px;
      margin-right: 8px;
    }
    canvas {
      border: 1px solid #d1d5db;
      border-radius: 4px;
    }
    .slider-section {
      display: flex;
      flex-direction: column;
    }
    .slider-label {
      text-align: center;
      font-weight: bold;
      color: #374151;
      margin-bottom: 8px;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 1rem;
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
    .value-display {
      background-color: #645a89;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 600;
      min-width: 80px;
      text-align: center;
    }
  `;

  static properties = {
    phaseShift: { type: Number }
  };

  constructor() {
    super();
    this.phaseShift = 0;
  }

  firstUpdated() {
    this.drawAll();
  }

  updated() {
    this.drawAll();
  }

  drawAll() {
    this.drawWave(this.shadowRoot.getElementById('canvas1'), 0);
    this.drawWave(this.shadowRoot.getElementById('canvas2'), this.phaseShift);
    this.drawCombined(this.shadowRoot.getElementById('canvas3'), this.phaseShift);
  }

  drawWave(canvas, phase) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 500, h = 150;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // dashed reference line
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // axis
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // wave
    const phaseRad = phase * Math.PI / 180;
    ctx.strokeStyle = '#7bcdcf';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = h / 2 - 35 * Math.sin(2 * Math.PI * x / 100 + phaseRad);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  drawCombined(canvas, phase) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 500, h = 150;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    const phaseRad = phase * Math.PI / 180;
    ctx.strokeStyle = '#7bcdcf';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = h / 2 - (35 * Math.sin(2 * Math.PI * x / 100) + 35 * Math.sin(2 * Math.PI * x / 100 + phaseRad));
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  handleSlider(e) {
    this.phaseShift = parseFloat(e.target.value);
  }

  render() {
    return html`
      <div class="container">
        <div class="card">
          <div class="title">Adjust the phase shift between wave 1 & wave 2 with the slider below</div>
          <div class="wave-row">
            <div class="label">wave 1</div>
            <canvas id="canvas1" style="width:500px;height:150px"></canvas>
          </div>
          <div class="wave-row">
            <div class="label">wave 2</div>
            <canvas id="canvas2" style="width:500px;height:150px"></canvas>
          </div>
          <div class="wave-row">
            <div class="label">resulting</div>
            <canvas id="canvas3" style="width:500px;height:150px"></canvas>
          </div>
          <div class="slider-section">
            <div class="slider-label">phase shift</div>
            <div class="slider-row">
              <input type="range" min="0" max="360" step="1"
                .value=${this.phaseShift}
                @input=${this.handleSlider}>
              <div class="value-display">${this.phaseShift}°</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('wave-interference', WaveInterference);

// Moodle workaround: replace divs with data-component attribute
function initViewers() {
  document
    .querySelectorAll('[data-component="wave-interference"]')
    .forEach((el) => {
      const viewer = document.createElement('wave-interference');
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