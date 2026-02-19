import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client'

function SNRDemo() {
  const [noiseLevel, setNoiseLevel] = useState(0);
  const canvasRef = useRef(null);
  const plotCanvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  
  const imageWidth = 400;
  const imageHeight = 400;
  const plotWidth = 500;
  const plotHeight = 400;

  // Load and store original image data
  useEffect(() => {
    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      const imgData = ctx.getImageData(0, 0, imageWidth, imageHeight);
      setImageData(imgData);
    };
    
    img.onerror = () => {
      console.error('Failed to load image');
    };
  }, []);

  // Update image and plot when noise level changes
  useEffect(() => {
    if (imageData) {
      drawNoisyImage();
    }
  }, [noiseLevel, imageData]);

  const addGaussianNoise = (value, sigma) => {
    if (sigma === 0) return value;
    
    // Box-Muller transform to generate Gaussian random numbers
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    const noisyValue = value + z0 * sigma;
    return Math.max(0, Math.min(255, noisyValue));
  };

  const drawNoisyImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Create a copy of the original image data
    const noisyData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageWidth,
      imageHeight
    );

    // Add Gaussian noise to each pixel if noise level > 0
    if (noiseLevel > 0) {
      for (let i = 0; i < noisyData.data.length; i += 4) {
        const r = noisyData.data[i];
        const g = noisyData.data[i + 1];
        const b = noisyData.data[i + 2];
        
        // Convert to grayscale
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Add Gaussian noise with standard deviation = noiseLevel
        const noisyValue = addGaussianNoise(gray, noiseLevel * 10);
        
        noisyData.data[i] = noisyValue;
        noisyData.data[i + 1] = noisyValue;
        noisyData.data[i + 2] = noisyValue;
      }
    }

    // Apply min/max contrast stretching for better visualization
    let min = 255, max = 0;
    for (let i = 0; i < noisyData.data.length; i += 4) {
      const val = noisyData.data[i];
      if (val < min) min = val;
      if (val > max) max = val;
    }
    
    const range = max - min;
    if (range > 0) {
      for (let i = 0; i < noisyData.data.length; i += 4) {
        const stretched = ((noisyData.data[i] - min) / range) * 255;
        noisyData.data[i] = stretched;
        noisyData.data[i + 1] = stretched;
        noisyData.data[i + 2] = stretched;
      }
    }

    ctx.putImageData(noisyData, 0, 0);

    // Draw the dotted line across the middle
    const midY = imageHeight / 2;
    ctx.strokeStyle = '#7bcdcf';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(imageWidth, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update the plot
    drawIntensityPlot(ctx);
  };

  const drawIntensityPlot = (imgCtx) => {
    const plotCanvas = plotCanvasRef.current;
    const plotCtx = plotCanvas.getContext('2d');
    
    // Set high DPI scaling for crisp rendering
    const dpr = window.devicePixelRatio || 2;
    const displayWidth = 500;
    const displayHeight = 400;
    
    plotCanvas.width = displayWidth * dpr;
    plotCanvas.height = displayHeight * dpr;
    plotCanvas.style.width = displayWidth + 'px';
    plotCanvas.style.height = displayHeight + 'px';
    plotCtx.scale(dpr, dpr);
    
    const plotWidth = displayWidth;
    const plotHeight = displayHeight;

    // Get intensity values along the middle line from the ORIGINAL noisy data (before contrast stretch)
    const midY = Math.floor(imageHeight / 2);
    const intensities = [];
    
    // Get the pre-contrast-stretched data
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = imageWidth;
    tempCanvas.height = imageHeight;
    
    // Recreate the noisy data without contrast stretching
    const noisyData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageWidth,
      imageHeight
    );

    if (noiseLevel > 0) {
      for (let i = 0; i < noisyData.data.length; i += 4) {
        const r = noisyData.data[i];
        const g = noisyData.data[i + 1];
        const b = noisyData.data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const noisyValue = addGaussianNoise(gray, noiseLevel * 10);
        noisyData.data[i] = noisyValue;
        noisyData.data[i + 1] = noisyValue;
        noisyData.data[i + 2] = noisyValue;
      }
    }
    
    // Extract intensity values from the middle row
    for (let x = 0; x < imageWidth; x++) {
      const idx = (midY * imageWidth + x) * 4;
      intensities.push(noisyData.data[idx]);
    }

    // Clear plot canvas
    plotCtx.fillStyle = 'white';
    plotCtx.fillRect(0, 0, plotWidth, plotHeight);

    // Draw axes (without ticks)
    const padding = 50;
    const plotAreaWidth = plotWidth - 2 * padding;
    const plotAreaHeight = plotHeight - 2 * padding;
    const axisOffset = 3; // Offset to prevent plot from covering axis

    plotCtx.strokeStyle = '#333';
    plotCtx.lineWidth = 2;
    plotCtx.beginPath();
    plotCtx.moveTo(padding, padding);
    plotCtx.lineTo(padding, plotHeight - padding);
    plotCtx.lineTo(plotWidth - padding, plotHeight - padding);
    plotCtx.stroke();

    // Draw axis labels only
    plotCtx.fillStyle = '#333';
    plotCtx.font = '16px Arial';
    plotCtx.textAlign = 'center';
    plotCtx.fillText('Distance (pixels)', plotWidth / 2, plotHeight - 10);
    
    plotCtx.save();
    plotCtx.translate(18, plotHeight / 2);
    plotCtx.rotate(-Math.PI / 2);
    plotCtx.fillText('Intensity', 0, 0);
    plotCtx.restore();

    // Find min and max for scaling
    const maxIntensity = Math.max(...intensities);
    const minIntensity = Math.min(...intensities);
    const range = maxIntensity - minIntensity || 1;

    // Draw intensity plot with antialiasing
    plotCtx.strokeStyle = '#7bcdcf';
    plotCtx.lineWidth = 3;
    plotCtx.lineCap = 'round';
    plotCtx.lineJoin = 'round';
    plotCtx.beginPath();

    for (let i = 0; i < intensities.length; i++) {
      const x = padding + (i / (intensities.length - 1)) * plotAreaWidth;
      const normalizedIntensity = (intensities[i] - minIntensity) / range;
      // Subtract axisOffset to keep plot above the x-axis, and reduce plot area slightly
      const y = plotHeight - padding - normalizedIntensity * (plotAreaHeight - axisOffset) - axisOffset;
      
      if (i === 0) {
        plotCtx.moveTo(x, y);
      } else {
        plotCtx.lineTo(x, y);
      }
    }
    
    plotCtx.stroke();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl">
        {/* Instructions div */}
        <div className="mb-6 p-4 rounded-lg text-center" style={{ backgroundColor: '#645a89' }}>
          <h3 className="font-semibold text-white">Adjust the noise and observe the effect on the intensity profile</h3>
        </div>
        
        {/* Two side-by-side panels */}
        <div className="flex gap-6 mb-6 justify-center items-start">
          {/* Panel 1: Image with dotted line */}
          <div className="flex flex-col items-center">
            <h4 className="font-semibold mb-3 text-gray-700 text-lg">Digital Image</h4>
            <div className="border-2 border-gray-300 rounded">
              <img 
                ref={imageRef}
                src="https://microtutor-courses.github.io/microtutor-demos/images/lateral_psf.tif"
                alt="PSF"
                style={{ display: 'none' }}
                crossOrigin="anonymous"
              />
              <canvas
                ref={canvasRef}
                width={imageWidth}
                height={imageHeight}
              />
            </div>
          </div>

          {/* Panel 2: Intensity plot */}
          <div className="flex flex-col items-center">
            <h4 className="font-semibold mb-3 text-gray-700 text-lg">Intensity Profile</h4>
            <div className="border-2 border-gray-300 rounded">
              <canvas
                ref={plotCanvasRef}
                style={{ width: '500px', height: '400px' }}
              />
            </div>
          </div>
        </div>
        
        {/* Slider controls */}
        <div className="flex flex-col" style={{ width: '100%', maxWidth: '930px', margin: '0 auto' }}>
          <label className="text-gray-700 font-bold mb-2 text-center">
            Noise
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SNRDemo

// Only mount if the target div exists on the page
const container = document.getElementById('snr-demo')
if (container) {
  createRoot(container).render(<SNRDemo />)
}