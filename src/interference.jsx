import React, { useState, useEffect, useRef } from 'react';

function WaveInterferenceDemo() {
    const [phaseShift, setPhaseShift] = useState(0); // Phase shift in degrees
    const canvasRef1 = useRef(null);
    const canvasRef2 = useRef(null);
    const canvasRef3 = useRef(null);
    
    const canvasWidth = 500;
    const canvasHeight = 150;
    
    useEffect(() => {
    drawWave(canvasRef1.current, 0, '#7bcdcf', 'Wave 1');
    drawWave(canvasRef2.current, phaseShift, '#7bcdcf', 'Wave 2');
    drawCombinedWave(canvasRef3.current, phaseShift);
    }, [phaseShift]);

    const drawWave = (canvas, phase, color, label) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set canvas resolution higher for crisp lines
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Enable anti-aliasing for smooth lines
    ctx.imageSmoothingEnabled = true;
    
    // Draw reference phase line (dashed vertical line)
    const referenceX = 50; // Position of the reference line
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(referenceX, 0);
    ctx.lineTo(referenceX, canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash
    
    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();
    
    // Draw wave
    const amplitude = 35;
    const wavelength = 100;
    const phaseRad = (phase * Math.PI) / 180;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let x = 0; x < canvasWidth; x++) {
        const y = canvasHeight / 2 - amplitude * Math.sin((2 * Math.PI * x) / wavelength + phaseRad);
        if (x === 0) {
        ctx.moveTo(x, y);
        } else {
        ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    };

    const drawCombinedWave = (canvas, phase) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set canvas resolution higher for crisp lines
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Enable anti-aliasing for smooth lines
    ctx.imageSmoothingEnabled = true;
    
    // Draw reference phase line (dashed vertical line)
    const referenceX = 50; // Position of the reference line
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(referenceX, 0);
    ctx.lineTo(referenceX, canvasHeight);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash
    
    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.stroke();
    
    // Draw combined wave
    const amplitude = 35;
    const wavelength = 100;
    const phaseRad = (phase * Math.PI) / 180;
    
    ctx.strokeStyle = '#7bcdcf';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    for (let x = 0; x < canvasWidth; x++) {
        const wave1 = amplitude * Math.sin((2 * Math.PI * x) / wavelength);
        const wave2 = amplitude * Math.sin((2 * Math.PI * x) / wavelength + phaseRad);
        const combined = wave1 + wave2;
        const y = canvasHeight / 2 - combined;
        
        if (x === 0) {
        ctx.moveTo(x, y);
        } else {
        ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    };

    const getInterferenceType = () => {
    const normalizedPhase = ((phaseShift % 360) + 360) % 360;
    if (normalizedPhase < 30 || normalizedPhase > 330) {
        return 'Constructive Interference';
    } else if (normalizedPhase > 150 && normalizedPhase < 210) {
        return 'Destructive Interference';
    } else {
        return 'Partial Interference';
    }
    };

    return (
        <div>

  <style>{`
    /* Custom slider styling */
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      background: #d1d5db;
      border-radius: 5px;
      outline: none;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
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
  `}</style>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
        {/* Info section */}
        <div className="mb-6 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-white" style={{ backgroundColor: '#645a89', padding: '16px', borderRadius: '8px' }}>Adjust the phase shift between wave 1 & wave 2 with the slider below</h3>
        </div>
        
        {/* Wave 1 */}
        <div className="mb-4 flex items-center justify-center">
            <div style={{ 
            writingMode: 'vertical-rl', 
            transform: 'rotate(180deg)',
            color: '#645a89',
            fontWeight: 'bold',
            fontSize: '16px',
            width: '20px',
            textAlign: 'center',
            marginRight: '4px'
            }}>
            wave 1
            </div>
            <canvas
            ref={canvasRef1}
            width={canvasWidth}
            height={canvasHeight}
            style={{ width: canvasWidth + 'px', height: canvasHeight + 'px' }}
            className="border border-gray-300 rounded"
            />
        </div>
        
        {/* Wave 2 */}
        <div className="mb-4 flex items-center justify-center">
            <div style={{ 
            writingMode: 'vertical-rl', 
            transform: 'rotate(180deg)',
            color: '#645a89',
            fontWeight: 'bold',
            fontSize: '16px',
            width: '20px',
            textAlign: 'center',
            marginRight: '4px'
            }}>
            wave 2
            </div>
            <canvas
            ref={canvasRef2}
            width={canvasWidth}
            height={canvasHeight}
            style={{ width: canvasWidth + 'px', height: canvasHeight + 'px' }}
            className="border border-gray-300 rounded"
            />
        </div>
        
        {/* Combined Wave */}
        <div className="mb-6 flex items-center justify-center">
            <div style={{ 
            writingMode: 'vertical-rl', 
            transform: 'rotate(180deg)',
            color: '#645a89',
            fontWeight: 'bold',
            fontSize: '16px',
            width: '20px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            marginRight: '4px'
            }}>
            resulting
            </div>
            <canvas
            ref={canvasRef3}
            width={canvasWidth}
            height={canvasHeight}
            style={{ width: canvasWidth + 'px', height: canvasHeight + 'px' }}
            className="border border-gray-300 rounded"
            />
        </div>
        
        {/* Slider controls */}
        <div className="flex flex-col">
            <label className="text-gray-700 font-bold mb-2 text-center">
            phase shift
            </label>
            <div className="flex items-center gap-4">
            <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={phaseShift}
                onChange={(e) => setPhaseShift(parseFloat(e.target.value))}
                className="flex-1"
            />
            <div className="rounded px-4 py-2 text-white font-semibold whitespace-nowrap min-w-[100px] text-center" style={{ backgroundColor: '#645a89' }}>
                {phaseShift.toFixed(0)}°
            </div>
            </div>
        </div>
        </div>
    </div>
        </div>

    );
}

export default WaveInterferenceDemo