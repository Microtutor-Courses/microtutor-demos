import { LitElement, html, css } from 'lit';

const IMAGE_URLS = {
  ideal: {
    xy: {
      greys: 'https://microtutor-courses.github.io/microtutor-demos/images/perfect_psf_lateral.png',
      heatmap: 'https://microtutor-courses.github.io/microtutor-demos/images/perfect_psf_lateral_fire.png'
    },
    xz: {
      greys: 'https://microtutor-courses.github.io/microtutor-demos/images/perfect_axial_cropped.png',
      heatmap: 'https://microtutor-courses.github.io/microtutor-demos/images/perfect_axial_cropped_fire.png'
    }
  },
  aberration: {
    xy: {
      greys: 'https://microtutor-courses.github.io/microtutor-demos/images/aberrated_psf_lateral.png',
      heatmap: 'https://microtutor-courses.github.io/microtutor-demos/images/aberrated_psf_lateral_fire.png'
    },
    xz: {
      greys: 'https://microtutor-courses.github.io/microtutor-demos/images/aberrated_axial_cropped.png',
      heatmap: 'https://microtutor-courses.github.io/microtutor-demos/images/aberrated_axial_cropped_fire.png'
    }
  }
};

class SphericalAberration extends LitElement {
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
      max-width: 760px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }
    .columns {
      display: flex;
      gap: 24px;
      justify-content: center;
    }
    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .column-header {
      background-color: #645a89;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
      margin-bottom: 16px;
      width: 303px;
      box-sizing: border-box;
    }
    .image-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 12px;
    }
    .image-wrapper img {
      display: block;
      border: 2px solid #d1d5db;
      border-radius: 4px;
    }
    .overlay-controls {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(255,255,255,0.92);
      padding: 8px 12px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .toggle-label {
      font-size: 14px;
      font-weight: 600;
      color: #4b5563;
    }
    /* CSS toggle switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }
    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #d1d5db;
      border-radius: 20px;
      transition: 0.3s;
    }
    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: 0.3s;
    }
    input:checked + .toggle-slider {
      background-color: #7bcdcf;
    }
    input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }
    .ray-overlay {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 5;
    }

    .row-labels {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 60px; /* match column header height */
    }
    .row-label-xy {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 315px; /* match xy image height + margin */
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-weight: 600;
    color: #4b5563;
    font-size: 14px;
    }
    .row-label-xz {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 750px; /* match xz image height */
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-weight: 600;
    color: #4b5563;
    font-size: 14px;
    }

  @media (max-width: 768px) {
    .container {
      transform: scale(0.7);
      transform-origin: top left;
      width: 143%; /* compensate for scale so it fills the space */
    }
  }

  @media (max-width: 480px) {
    .container {
      transform: scale(0.5);
      transform-origin: top left;
      width: 200%;
    }
  }
  `;

  static properties = {
    _states: { state: true }
  };

  constructor() {
    super();
    this._states = {
      ideal:      { xy: { heatmap: false }, xz: { heatmap: false, rays: false } },
      aberration: { xy: { heatmap: false }, xz: { heatmap: false, rays: false } }
    };
  }

  _toggle(condition, plane, key) {
    this._states = {
      ...this._states,
      [condition]: {
        ...this._states[condition],
        [plane]: {
          ...this._states[condition][plane],
          [key]: !this._states[condition][plane][key]
        }
      }
    };
  }

  _renderRays(isIdeal) {
    const w = 101, h = 250, cx = 50.5;
    if (isIdeal) {
      const fy = 125;
      return html`
        <svg class="ray-overlay" viewBox="0 0 ${w} ${h}">
          <line x1="${cx}" y1="0" x2="${cx}" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="0" y1="0" x2="${cx}" y2="${fy}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${cx}" y1="${fy}" x2="${w}" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${w}" y1="0" x2="${cx}" y2="${fy}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${cx}" y1="${fy}" x2="0" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${w * 0.25}" y1="0" x2="${cx}" y2="${fy}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${cx}" y1="${fy}" x2="${w * 0.75}" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${w * 0.75}" y1="0" x2="${cx}" y2="${fy}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${cx}" y1="${fy}" x2="${w * 0.25}" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
        </svg>`;
    } else {
      const mfy = 112, iffy = 126;
      return html`
        <svg class="ray-overlay" viewBox="0 0 ${w} ${h}">
          <line x1="${cx}" y1="0" x2="${cx}" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="0" y1="0" x2="${cx}" y2="${mfy}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${cx}" y1="${mfy}" x2="${w}" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${w}" y1="0" x2="${cx}" y2="${mfy}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${cx}" y1="${mfy}" x2="0" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${w * 0.25}" y1="0" x2="${cx}" y2="${iffy}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${cx}" y1="${iffy}" x2="${w * 0.75}" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${w * 0.75}" y1="0" x2="${cx}" y2="${iffy}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
          <line x1="${cx}" y1="${iffy}" x2="${w * 0.25}" y2="${h}" stroke="#7bcdcf" stroke-width="1.5" opacity="0.8"/>
        </svg>`;
    }
  }

  _renderImageView(condition, plane) {
    const state = this._states[condition][plane];
    const url = IMAGE_URLS[condition][plane][state.heatmap ? 'heatmap' : 'greys'];
    const isXZ = plane === 'xz';
    const width = 303;
    const height = isXZ ? 750 : 303;

    return html`
      <div class="image-wrapper">
        <div class="overlay-controls">
          <span class="toggle-label">heat map</span>
          <label class="toggle">
            <input type="checkbox" 
              .checked=${state.heatmap}
              @change=${() => this._toggle(condition, plane, 'heatmap')}>
            <span class="toggle-slider"></span>
          </label>
          ${isXZ ? html`
            <span class="toggle-label">ray diagram</span>
            <label class="toggle">
              <input type="checkbox"
                .checked=${state.rays}
                @change=${() => this._toggle(condition, plane, 'rays')}>
              <span class="toggle-slider"></span>
            </label>` : ''}
        </div>
        <img src="${url}" width="${width}" height="${height}" 
          alt="${condition} ${plane} view">
        ${isXZ && state.rays ? this._renderRays(condition === 'ideal') : ''}
      </div>
    `;
  }

  _renderColumn(condition, title) {
    return html`
      <div class="column">
        <div class="column-header">${title}</div>
        ${this._renderImageView(condition, 'xy')}
        ${this._renderImageView(condition, 'xz')}
      </div>
    `;
  }

    render() {
        return html`
            <div class="container">
            <div class="columns">
                <div class="row-labels">
                    <span class="row-label-xy">XY</span>
                    <span class="row-label-xz">XZ</span>
                </div>
                ${this._renderColumn('ideal', 'Ideal')}
                ${this._renderColumn('aberration', 'Spherical Aberration')}
            </div>
            </div>
        `;
    }
}

customElements.define('spherical-aberration', SphericalAberration);

function initViewers() {
  document
    .querySelectorAll('[data-component="spherical-aberration"]')
    .forEach((el) => {
      const viewer = document.createElement('spherical-aberration');
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