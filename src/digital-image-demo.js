import { LitElement, html, css } from 'lit';

class DigitalImageDemo extends LitElement {
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
      max-width: 1100px;
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
    .panels {
      display: flex;
      flex-direction: row;
      gap: 24px;
      justify-content: center;
      align-items: stretch;
    }
    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      max-width: 480px;
    }
    .panel-label {
      font-weight: 600;
      color: #374151;
      font-size: 15px;
      margin-bottom: 10px;
    }
    /* Optical image */
    .optical-img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 4px;
      border: 2px solid #d1d5db;
      box-sizing: border-box;
    }
    /* Slider reveal container */
    .reveal-container {
      position: relative;
      width: 100%;
      overflow: hidden;
      border: 2px solid #d1d5db;
      border-radius: 4px;
      user-select: none;
      cursor: ew-resize;
      line-height: 0;
    }
    .reveal-container img {
      display: block;
      width: 100%;
      height: auto;
      pointer-events: none;
    }
    /* The overlay image is clipped to reveal from the right */
    .overlay-img {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      clip-path: polygon(0 0, var(--clip-x, 50%) 0, var(--clip-x, 50%) 100%, 0 100%);
    }
    /* Divider line */
    .divider {
      position: absolute;
      top: 0;
      left: var(--divider-x, 50%);
      transform: translateX(-50%);
      width: 5px;
      height: 100%;
      background: #7bcdcf;
      pointer-events: none;
      z-index: 10;
    }
    /* Divider handle circle */
    .divider-handle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      background: #7bcdcf;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .divider-handle::before {
      content: '◀   ▶';
      font-size: 15px;
      color: white;
      letter-spacing: -1px;
    }

    @media (max-width: 768px) {
      .panels {
        flex-direction: column;
        align-items: center;
      }
      .panel {
        width: 100%;
      }
    }
  `;

  static properties = {
    _dividerPct: { state: true },
    _isDragging: { state: false },
  };

  constructor() {
    super();
    this._dividerPct = 75;
    this._isDragging = false;
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mousemove', this._onPointerMove);
    window.addEventListener('mouseup', this._onPointerUp);
    window.addEventListener('touchmove', this._onPointerMove, { passive: false });
    window.addEventListener('touchend', this._onPointerUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mousemove', this._onPointerMove);
    window.removeEventListener('mouseup', this._onPointerUp);
    window.removeEventListener('touchmove', this._onPointerMove);
    window.removeEventListener('touchend', this._onPointerUp);
  }

  _onPointerDown(e) {
    this._isDragging = true;
    this._updateDivider(e);
    e.preventDefault();
  }

  _onPointerMove(e) {
    if (!this._isDragging) return;
    this._updateDivider(e);
    e.preventDefault();
  }

  _onPointerUp() {
    this._isDragging = false;
  }

  _updateDivider(e) {
    const container = this.shadowRoot.querySelector('.reveal-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    this._dividerPct = Math.max(0, Math.min(100, pct));
  }

  render() {
    const baseUrl = 'https://microtutor-courses.github.io/microtutor-demos/images';
    const clipX = `${this._dividerPct}%`;

    return html`
      <div class="container">
        <div class="header">Drag the slider to reveal the intensity values</div>
        <div class="panels">

          <div class="panel">
            <div class="panel-label">Optical Image</div>
            <img
              class="optical-img"
              src="${baseUrl}/optical_spine.png"
              alt="Optical image"
              crossorigin="anonymous"
            />
          </div>

          <div class="panel">
            <div class="panel-label">Digital Image</div>
            <div
              class="reveal-container"
              style="--clip-x: ${clipX}; --divider-x: ${clipX};"
              @mousedown=${this._onPointerDown}
              @touchstart=${this._onPointerDown}
            >
              <!-- Base layer: intensity array image (right side) -->
              <img
                src="${baseUrl}/spines_array.png"
                alt="Intensity values array"
                crossorigin="anonymous"
              />
              <!-- Overlay layer: array/color-mapped image (left side) -->
              <img
                class="overlay-img"
                src="${baseUrl}/digitized_spines.png"
                alt="Color-mapped digital image"
                crossorigin="anonymous"
              />
              <!-- Divider -->
              <div class="divider">
                <div class="divider-handle"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }
}

customElements.define('digital-image-demo', DigitalImageDemo);

function initViewers() {
  document
    .querySelectorAll('[data-component="digital-image-demo"]')
    .forEach((el) => {
      const viewer = document.createElement('digital-image-demo');
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