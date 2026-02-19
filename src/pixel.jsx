import React, { useState, useEffect, useRef } from 'react';

function PixelDemo() {
    const originalPixelSize = 0.1083333; // Original image pixel size in microns
    const [pixelSize, setPixelSize] = useState(originalPixelSize); // in microns
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    
    // Image dimensions
    const imageWidth = 500;
    const imageHeight = 500;
    
    // Actual image properties
    const actualImagePixels = 1326; // Original image is 1326x1326 pixels
    const fieldSize = 143.65; // Field of view is 143.65 x 143.65 microns

    useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!img.complete) {
        img.onload = () => drawPixelatedImage(ctx, img);
    } else {
        drawPixelatedImage(ctx, img);
    }
    }, [pixelSize]);

    const drawPixelatedImage = (ctx, img) => {
    // Calculate the downsampled dimensions based on pixel size
    const downsampleFactor = pixelSize / originalPixelSize;
    const downsampledWidth = Math.floor(imageWidth / downsampleFactor);
    const downsampledHeight = Math.floor(imageHeight / downsampleFactor);

    // Clear canvas
    ctx.clearRect(0, 0, imageWidth, imageHeight);

    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;

    // Draw image downsampled then scaled back up
    ctx.drawImage(img, 0, 0, downsampledWidth, downsampledHeight);
    ctx.drawImage(
        canvasRef.current,
        0, 0, downsampledWidth, downsampledHeight,
        0, 0, imageWidth, imageHeight
    );
    };

    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl">
        {/* Info section */}
        <div className="mb-6 p-4 rounded-lg text-center flex items-center justify-center" style={{ backgroundColor: '#645a89', width: imageWidth }}>
            <h3 className="font-semibold text-white">Adjust the image pixel size with the slider below</h3>
        </div>
        
        {/* Image with grid overlay */}
        <div className="relative mb-6 inline-block">
            <img 
            ref={imageRef}
            src="https://microtutor-courses.github.io/microtutor-demos/images/u2os_ph488.jpg"
            alt="Microscopy Image"
            style={{ display: 'none' }}
            crossOrigin="anonymous"
            />
            
            <canvas
            ref={canvasRef}
            width={imageWidth}
            height={imageHeight}
            className="rounded"
            />
        </div>
        
        {/* Slider controls */}
        <div className="flex flex-col" style={{ width: imageWidth }}>
            <label className="text-gray-700 font-bold mb-2 text-center">
            Pixel Size
            </label>
            <div className="flex items-center gap-4">
            <input
                type="range"
                min="0.1083333"
                max="2"
                step="0.01"
                value={pixelSize}
                onChange={(e) => setPixelSize(parseFloat(e.target.value))}
                className="flex-1"
            />
            <div className="rounded px-4 py-2 text-white font-semibold whitespace-nowrap min-w-[100px] text-center" style={{ backgroundColor: '#645a89' }}>
                {pixelSize.toFixed(2)} μm
            </div>
            </div>
        </div>
        </div>
    </div>
    );
}

export default PixelDemo