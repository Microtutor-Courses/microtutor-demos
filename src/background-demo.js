import { LitElement, html, css, svg } from 'lit';

class BackgroundDemo extends LitElement {
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
      max-width: 500px;
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
    .cup-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 28px;
    }
    .buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
    button {
      flex: 1;
      max-width: 180px;
      padding: 12px 16px;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
      background-color: #d1d5db;
      color: #374151;
    }
    button.active {
      background-color: #645a89;
      color: white;
    }
    button:hover {
      opacity: 0.85;
    }
    .legend {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 20px;
      font-size: 13px;
      color: #374151;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-circle {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #7bcdcf;
      flex-shrink: 0;
    }
    .legend-bg {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #645a89;
      flex-shrink: 0;
    }
  `;

  static properties = {
    _mode: { state: true },
  };

  constructor() {
    super();
    this._mode = 'high';
  }

  _getPhotons() {
    const total = 20;
    const bgCount = this._mode === 'high' ? 15 : 5;
    const signalCount = total - bgCount;

    const photons = [
      ...Array(bgCount).fill('background'),
      ...Array(signalCount).fill('signal'),
    ];

    const seed = this._mode === 'high' ? 42 : 99;
    return this._seededShuffle(photons, seed);
  }

  _seededShuffle(arr, seed) {
    const a = [...arr];
    let s = seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  _renderCup(photons) {
    // ViewBox of both SVGs from Illustrator
    const vbWidth = 392.46;
    const vbHeight = 262.34;

    // Interior clip path boundary (from Illustrator interior path)
    // Approximate bounding box of the interior path for photon grid placement:
    // x: ~89 to ~302, y: ~55 to ~206
    const gridLeft = 95;
    const gridRight = 290;
    const gridTop = 63;
    const gridBottom = 198;
    const gridWidth = gridRight - gridLeft;
    const gridHeight = gridBottom - gridTop;

    // Grid layout: 4 cols x 4 rows = 16 photons
    const cols = 4;
    const rows = 5;
    const r = 11; // circle radius in viewBox units

    const photonElements = photons.map((type, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;

      // Interpolate left/right edges at this row to follow the tapered cup shape
      const t = (row + 0.5) / rows;
      const rowLeft = gridLeft + (gridWidth * 0.08) * t;       // taper inward slightly at bottom
      const rowRight = gridRight - (gridWidth * 0.08) * t;
      const rowW = rowRight - rowLeft;
      const colSpacing = rowW / cols;

      const cx = rowLeft + colSpacing * col + colSpacing / 2;
      const cy = gridTop + (gridHeight / rows) * row + (gridHeight / rows) / 2;

      if (type === 'signal') {
        return svg`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#7bcdcf" opacity="0.95"/>`;
      } else {
        return svg`
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="#645a89" opacity="0.95"/>
          <line x1="${cx - r * 0.5}" y1="${cy - r * 0.5}" x2="${cx + r * 0.5}" y2="${cy + r * 0.5}"
            stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="${cx + r * 0.5}" y1="${cy - r * 0.5}" x2="${cx - r * 0.5}" y2="${cy + r * 0.5}"
            stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        `;
      }
    });

    return svg`
      <svg
        viewBox="0 0 ${vbWidth} ${vbHeight}"
        width="420"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <!-- Clip path using the Illustrator interior boundary path -->
          <clipPath id="cup-interior-clip">
            <path d="m118.86,206.4c-4.67-9.34-12.2-24.96-14.91-34.49-5.22-18.4-8.97-38.38-11.15-59.4-1.41-13.62-2.47-27.58-3.49-41.07-.27-3.6-.54-7.21-.83-10.81-.16-1.95-.13-3.51.07-4.68.06-.01.13-.02.22-.02h.72s212.93,0,212.93,0c.77,0,1.27.09,1.53.17.08.29.16.87.11,1.76-.23,3.76-.36,7.52-.49,11.16-.12,3.23-2,29.42-2.71,34.58-.45,3.23-.85,6.5-1.24,9.66-.75,6.08-1.45,11.83-2.49,17.53-1.72,9.42-3.78,19.01-5.78,28.29-.71,3.31-1.43,6.62-2.12,9.93-.89,3.92-10.05,28.51-11.95,32.08-.98,1.74-1.99,3.48-3.04,5.25l-155.37.05Z"/>
          </clipPath>
        </defs>

        <!-- Photons clipped to cup interior -->
        <g clip-path="url(#cup-interior-clip)">
          ${photonElements}
        </g>

        <!-- Cup outline from Illustrator (drawn on top so walls overlap photons) -->
        <path d="m362.96,196.71c-.96-.19-1.98-.14-2.98-.14h-82.9c-1.63,0-2.63-1.78-1.8-3.18,2.12-3.54,4.16-6.93,6.1-10.38,2.13-3.77,5.26-5.61,9.56-5.6,4.33.01,8.66.02,12.98,0,17.78-.12,32.77-6.7,43.82-20.6,17.55-22.07,22.42-47.45,16.9-74.71-3.2-15.79-13.23-25.95-29.3-28.91-6.89-1.27-14.07-.96-21.11-1.27-3.5-.15-5.42-2.01-5.29-5.46.13-3.65.26-7.31.48-10.96.47-7.85-3.82-12.53-11.62-12.53H84.87c-.33,0-.66-.01-1,0-4.65.13-8.66,3.02-9.65,7.56-.55,2.54-.54,5.29-.33,7.91,1.35,17.39,2.54,34.79,4.34,52.14,2.14,20.66,5.8,41.1,11.48,61.11,3.59,12.61,14.33,33.81,18.37,41.75.73,1.43-.32,3.13-1.93,3.13H31.45c-2.07-.01-4.06.21-5.21,2.22-1.15,2.02-.45,4,.81,5.58,2.48,3.1,4.92,6.34,7.89,8.93,13.98,12.24,30.25,20.05,48.39,23.94,4.53.97,9.17,1.43,13.75,2.13h198.21c.64-.16,1.27-.41,1.92-.46,11.23-.78,21.93-3.68,32.2-8.17,12.06-5.27,23.23-11.95,32.26-21.7,1.72-1.86,3.21-4.05,4.36-6.32,1.43-2.81-.02-5.39-3.07-6.01Zm-36.23-123.78c3.24.27,6.27,1.7,8.51,4.05,17.85,18.74,7.08,50.29.27,61.3-8.06,13.04-19.77,19.25-35.16,18.37-4.26-.25-6.92-4.08-5.98-8.53,2.71-12.82,5.61-25.6,7.96-38.49,1.67-9.14,2.52-18.42,3.8-27.63.76-5.52,4.89-9.58,10.38-9.62,2.73-.03,6.99.27,10.21.54Z"
          fill="none" stroke="#626075" stroke-miterlimit="10" stroke-width="7"/>

        <!-- Detector label text from Illustrator -->
        <text transform="translate(130.14 225.87)" fill="#626075" font-family="system-ui, sans-serif" font-size="35">
          <tspan x="0" y="0">detector</tspan>
        </text>
      </svg>
    `;
  }

  render() {
    const photons = this._getPhotons();

    return html`
      <div class="container">
        <div class="header">the detector as a coffee cup</div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-circle"></div>
            <span>signal photon</span>
          </div>
          <div class="legend-item">
            <div class="legend-bg"></div>
            <span>background photon</span>
          </div>
        </div>
        <div class="cup-wrapper">
          ${this._renderCup(photons)}
        </div>
        <div class="buttons">
          <button
            class="${this._mode === 'high' ? 'active' : ''}"
            @click=${() => this._mode = 'high'}
          >high background</button>
          <button
            class="${this._mode === 'low' ? 'active' : ''}"
            @click=${() => this._mode = 'low'}
          >low background</button>
        </div>
      </div>
    `;
  }
}

customElements.define('background-demo', BackgroundDemo);

function initViewers() {
  document
    .querySelectorAll('[data-component="background-demo"]')
    .forEach((el) => {
      const viewer = document.createElement('background-demo');
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