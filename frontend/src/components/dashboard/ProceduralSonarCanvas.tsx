import React, { useEffect, useRef, useState } from 'react';
import type { DebrisDetection } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Crosshair, Sparkles } from 'lucide-react';

interface Props {
  detections: DebrisDetection[];
  showBoundingBoxes: boolean;
  onToggleBoundingBoxes: () => void;
  confidenceThreshold: number;
  selectedDetectionId: string | null;
  onSelectDetection: (id: string) => void;
  colorPalette: 'amber' | 'cyan' | 'green' | 'copper';
}

export const ProceduralSonarCanvas: React.FC<Props> = ({
  detections,
  showBoundingBoxes,
  onToggleBoundingBoxes,
  confidenceThreshold,
  selectedDetectionId,
  onSelectDetection,
  colorPalette = 'amber',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredDetection, setHoveredDetection] = useState<DebrisDetection | null>(null);

  // Filter detections by current confidence threshold
  const visibleDetections = detections.filter(d => d.confidence >= confidenceThreshold);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Synthetic seabed acoustic texture
    ctx.fillStyle = colorPalette === 'cyan' ? '#040d1a' : '#140c02';
    ctx.fillRect(0, 0, width, height);

    // Sand ripples & acoustic noise
    const imgData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        // Distance from nadir line (center x = width/2)
        const distFromNadir = Math.abs(x - width / 2);
        const nadirFactor = Math.min(1, distFromNadir / 40);

        // Ripple wave frequency
        const wave = Math.sin(y * 0.08 + x * 0.015) * 18 + Math.cos(y * 0.04 - x * 0.02) * 12;
        const noise = (Math.random() - 0.5) * 28;

        let intensity = (55 + wave + noise) * nadirFactor;

        // Nadir water column is dark acoustic void
        if (distFromNadir < 22) {
          intensity = Math.max(8, intensity * 0.15);
        }

        intensity = Math.min(255, Math.max(0, intensity));

        if (colorPalette === 'cyan') {
          imgData.data[index] = intensity * 0.2;     // R
          imgData.data[index + 1] = intensity * 0.85; // G
          imgData.data[index + 2] = intensity * 1.0;  // B
        } else if (colorPalette === 'green') {
          imgData.data[index] = intensity * 0.2;     // R
          imgData.data[index + 1] = intensity * 1.0;  // G
          imgData.data[index + 2] = intensity * 0.4;  // B
        } else if (colorPalette === 'copper') {
          imgData.data[index] = intensity * 1.0;     // R
          imgData.data[index + 1] = intensity * 0.55; // G
          imgData.data[index + 2] = intensity * 0.2;  // B
        } else {
          // Classic SSS Amber/Bronze
          imgData.data[index] = intensity * 1.0;     // R
          imgData.data[index + 1] = intensity * 0.72; // G
          imgData.data[index + 2] = intensity * 0.18; // B
        }
        imgData.data[index + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw acoustic highlight and acoustic shadow for each detection
    detections.forEach(d => {
      const cx = (d.bbox.x + d.bbox.width / 2) * (width / 100);
      const cy = (d.bbox.y + d.bbox.height / 2) * (height / 100);
      const w = (d.bbox.width * width) / 100;
      const h = (d.bbox.height * height) / 100;

      // Determine shadow direction (away from central nadir track at width/2)
      const shadowDir = cx > width / 2 ? 1 : -1;
      const shadowLength = (d.shadowLengthMeters || 4) * 8;

      // Draw Acoustic Shadow (absorption zone behind target)
      ctx.save();
      ctx.fillStyle = 'rgba(2, 4, 8, 0.92)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - h / 2);
      ctx.lineTo(cx + shadowDir * shadowLength, cy - h / 2 + 10);
      ctx.lineTo(cx + shadowDir * shadowLength, cy + h / 2 + 15);
      ctx.lineTo(cx, cy + h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Draw High-Reflectivity Target Echo (bright returns)
      ctx.save();
      const highlightGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(w, h));
      if (colorPalette === 'cyan') {
        highlightGrad.addColorStop(0, '#ffffff');
        highlightGrad.addColorStop(0.4, '#a5f3fc');
        highlightGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      } else {
        highlightGrad.addColorStop(0, '#ffffff');
        highlightGrad.addColorStop(0.3, '#fef08a');
        highlightGrad.addColorStop(0.7, '#f59e0b');
        highlightGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      }
      ctx.fillStyle = highlightGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.45, h * 0.4, Math.PI / 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });

    // Central Nadir Towfish Track Line
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Transducer Nadir label
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('▼ TOWFISH NADIR TRACK', width / 2 - 62, 18);
    ctx.restore();

  }, [colorPalette, detections]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xl">
      {/* Sonar Canvas Header Bar (Clean Light Theme) */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/95 border-b border-slate-200 text-xs text-slate-700">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="font-mono text-blue-700 font-bold tracking-wider uppercase">SSS Waterfall Acoustic Display</span>
          <span className="text-slate-500 font-mono">| 455 kHz Dual Beam</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleBoundingBoxes}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${showBoundingBoxes
              ? 'bg-blue-600 text-white font-bold shadow-sm'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300'
              }`}
            title="Toggle YOLO Bounding Boxes"
          >
            {showBoundingBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showBoundingBoxes ? 'YOLO Overlay ON' : 'Raw Sonar'}</span>
          </button>

          <div className="flex items-center bg-white rounded-md border border-slate-300 p-0.5 shadow-sm">
            <button
              onClick={() => setZoom(prev => Math.max(0.75, prev - 0.25))}
              className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-600 font-bold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.min(2.0, prev + 0.25))}
              className="p-1 text-slate-600 hover:text-blue-600 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 text-slate-600 hover:text-blue-600 transition-colors border-l border-slate-200 ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[560px] overflow-hidden flex items-center justify-center bg-black cursor-crosshair">
        <div
          className="relative transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <canvas
            ref={canvasRef}
            width={880}
            height={500}
            className="w-full h-auto block rounded-lg select-none"
          />

          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none sonar-scanlines opacity-40 rounded-lg"></div>

          {/* Interactive YOLO Bounding Boxes Layer */}
          {showBoundingBoxes && visibleDetections.map((detection) => {
            const isSelected = selectedDetectionId === detection.id;
            const isHovered = hoveredDetection?.id === detection.id;

            return (
              <div
                key={detection.id}
                onClick={() => onSelectDetection(detection.id)}
                onMouseEnter={() => setHoveredDetection(detection)}
                onMouseLeave={() => setHoveredDetection(null)}
                style={{
                  left: `${detection.bbox.x}%`,
                  top: `${detection.bbox.y}%`,
                  width: `${detection.bbox.width}%`,
                  height: `${detection.bbox.height}%`,
                }}
                className={`absolute transition-all cursor-pointer rounded-sm border-2 ${isSelected
                  ? 'border-blue-500 bg-blue-500/20 ring-4 ring-blue-500/40 z-30 shadow-lg'
                  : isHovered
                    ? 'border-white bg-white/20 z-20 shadow-md'
                    : 'border-yellow-400 bg-yellow-400/20 z-10'
                  }`}
              >
                {/* YOLO Label Tag */}
                <div
                  className={`absolute -top-7 left-0 px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap flex items-center space-x-1.5 shadow-md ${isSelected ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900/90 text-yellow-300 border border-yellow-400/60'
                    }`}
                >
                  <Crosshair className="w-3 h-3" />
                  <span>{detection.name}</span>
                  <span className="px-1 py-0.2 bg-black/50 rounded text-[10px] font-mono font-bold text-white">
                    {detection.confidence}%
                  </span>
                </div>

                {/* Acoustic Shadow Vector Indicator */}
                {detection.acousticShadowVerified && (
                  <div className="absolute -bottom-6 right-0 text-[10px] font-mono text-emerald-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/40 flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    <span>Shadow: {detection.shadowLengthMeters}m (H: {detection.estimatedHeightMeters}m)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Range Ruler Overlay Left & Right */}
        <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-[9px] font-mono text-slate-400 pointer-events-none">
          <span>PORT 40m</span>
          <span>20m</span>
          <span>0m</span>
          <span>20m</span>
          <span>STARBOARD 40m</span>
        </div>

        {/* Telemetry HUD Bottom Overlay (Clean Light Theme Banner) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] font-mono text-slate-700 shadow-md pointer-events-none">
          <div className="font-bold">LAT: 18°56'28"N &bull; LON: 72°49'32"E</div>
          <div className="text-blue-700 font-bold">SWATH WIDTH: 80 METERS</div>
          <div className="text-emerald-700 font-bold">YOLO INFERENCE: 18.4ms (YOLOv12-SSS)</div>
        </div>
      </div>
    </div>
  );
};
