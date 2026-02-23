import { LitElement, html, css } from 'lit';

class PoissonSNR extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background-color: #645a89;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 24px;
    }
    .header h3 {
      color: white;
      font-weight: 600;
      margin: 0;
      font-size: 16px;
    }
    .info-boxes {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      justify-content: center;
    }
    .info-box {
      flex: 1;
      max-width: 150px;
      border: 3px solid #7bcdcf;
      padding: 20px;
      text-align: center;
      background: white;
      border-radius: 4px;
    }
    .info-box-label {
      font-weight: bold;
      color: #5a5a5a;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .info-box-label-small {
      font-size: 14px;
      font-weight: normal;
    }
    .info-box-value {
      font-size: 26px;
      font-weight: bold;
      color: #333;
      min-height: 36px;
    }
    .chart-container {
      position: relative;
      height: 500px;
      margin-top: 20px;
    }
    .legend {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend-color {
      width: 30px;
      height: 3px;
      border-radius: 2px;
    }
    .legend-color-dotted {
      width: 30px;
      height: 3px;
      background-image: linear-gradient(to right, #919696 50%, transparent 50%);
      background-size: 8px 3px;
      background-repeat: repeat-x;
    }
    .legend-text {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  `;

  static properties = {
    _photonValue: { state: true },
    _noiseValue: { state: true },
    _snrValue: { state: true },
  };

  constructor() {
    super();
    this._photonValue = '-';
    this._noiseValue = '-';
    this._snrValue = '-';
    this._chart = null;

    // Pre-generate data
    this._photons = [];
    this._poissonNoise = [];
    this._snr = [];
    for (let i = 1; i <= 500; i++) {
      this._photons.push(i);
      const noise = Math.sqrt(i);
      this._poissonNoise.push(noise);
      this._snr.push(i / noise);
    }
  }

  firstUpdated() {
    this._loadChartJS().then(() => this._initChart());
  }

  _loadChartJS() {
    return new Promise((resolve) => {
      if (window.Chart) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  _initChart() {
    const canvas = this.shadowRoot.getElementById('poissonChart');
    const ctx = canvas.getContext('2d');

    this._chart = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: this._photons,
        datasets: [
          {
            label: 'Signal',
            data: this._photons,
            borderColor: '#919696',
            borderWidth: 3,
            borderDash: [10, 5],
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#919696',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
            tension: 0.1,
            yAxisID: 'y-left'
          },
          {
            label: 'Poisson Noise (√photons)',
            data: this._poissonNoise,
            borderColor: '#9990b2',
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#9990b2',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
            tension: 0.1,
            yAxisID: 'y-left'
          },
          {
            label: 'SNR',
            data: this._snr,
            borderColor: '#7bcdcf',
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#7bcdcf',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
            tension: 0.1,
            yAxisID: 'y-right'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Number of Photons',
              font: { weight: 'bold', size: 14 }
            },
            ticks: { stepSize: 100 },
            grid: { display: true, color: 'rgba(0,0,0,0.05)' }
          },
          'y-left': {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Poisson Noise (√photons)',
              font: { weight: 'bold', size: 14 },
              color: '#9990b2'
            },
            grid: { display: true, color: 'rgba(0,0,0,0.05)' },
            beginAtZero: true
          },
          'y-right': {
            type: 'linear',
            position: 'right',
            title: {
              display: true,
              text: 'SNR (Signal / Poisson Noise)',
              font: { weight: 'bold', size: 14 },
              color: '#7bcdcf'
            },
            grid: { display: false },
            beginAtZero: true
          }
        },
        onHover: (event, activeElements) => {
          if (activeElements.length > 0) {
            const index = activeElements[0].index;
            this._photonValue = this._photons[index];
            this._noiseValue = this._poissonNoise[index].toFixed(2);
            this._snrValue = this._snr[index].toFixed(2);
          }
        }
      }
    });

    canvas.addEventListener('mouseleave', () => {
      this._photonValue = '-';
      this._noiseValue = '-';
      this._snrValue = '-';
    });
  }

  render() {
    return html`
      <div class="container">
        <div class="header">
          <h3>Hover over the graph to observe the relationship between signal, Poisson noise, and SNR</h3>
        </div>
        <div class="info-boxes">
          <div class="info-box">
            <div class="info-box-label">Signal<br><span class="info-box-label-small">(photons)</span></div>
            <div class="info-box-value">${this._photonValue}</div>
          </div>
          <div class="info-box">
            <div class="info-box-label">Poisson Noise<br><span class="info-box-label-small">(√photons)</span></div>
            <div class="info-box-value">${this._noiseValue}</div>
          </div>
          <div class="info-box">
            <div class="info-box-label">SNR<br><span class="info-box-label-small">(Signal / Poisson Noise)</span></div>
            <div class="info-box-value">${this._snrValue}</div>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="poissonChart"></canvas>
        </div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color-dotted"></div>
            <div class="legend-text">Signal (photons)</div>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #9990b2;"></div>
            <div class="legend-text">Poisson Noise (√photons)</div>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background-color: #7bcdcf;"></div>
            <div class="legend-text">SNR (Signal / Poisson Noise)</div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('poisson-snr', PoissonSNR);

function initViewers() {
  document
    .querySelectorAll('[data-component="poisson-snr"]')
    .forEach((el) => {
      const viewer = document.createElement('poisson-snr');
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