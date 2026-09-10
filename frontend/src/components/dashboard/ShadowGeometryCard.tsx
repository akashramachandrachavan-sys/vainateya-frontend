import React, { useState } from 'react';
import type { DebrisDetection } from '../../types';
import { calculateShadowHeight } from '../../data/sampleSonarData';
import { Ruler, ShieldCheck, AlertCircle, Calculator } from 'lucide-react';

interface Props {
  detection: DebrisDetection | null;
  sensorAltitude: number;
  slantRange: number;
}

export const ShadowGeometryCard: React.FC<Props> = ({
  detection,
  sensorAltitude,
  slantRange,
}) => {
  const [customAltitude, setCustomAltitude] = useState<number>(sensorAltitude || 8.5);
  const [customSlantRange, setCustomSlantRange] = useState<number>(slantRange || 42.0);
  const [customShadowLength, setCustomShadowLength] = useState<number>(
    detection ? detection.shadowLengthMeters : 4.8
  );

  const calculatedHeight = calculateShadowHeight(customShadowLength, customAltitude, customSlantRange);

  // False positive rejection logic
  const isPlausibleDebris = calculatedHeight >= 0.25 && calculatedHeight <= 10.0;

  return (
    <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs text-slate-900">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-wide">Acoustic Shadow Verification</h3>
            <p className="text-[10px] font-mono text-slate-500">Geometry Module &bull; False-Positive Reducer</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          <span>Verified</span>
        </div>
      </div>

      {/* Shadow Geometry Formula Box */}
      <div className="p-2.5 mb-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-[11px] font-mono">
        <div className="flex items-center justify-between text-slate-600 mb-1">
          <span className="flex items-center space-x-1 text-blue-800 font-bold">
            <Calculator className="w-3 h-3 text-blue-600" />
            <span>Trigonometric Relief Formula:</span>
          </span>
          <span className="text-[9px] text-slate-500 font-medium">IEEE SSS</span>
        </div>
        <div className="text-center py-1.5 px-2 rounded bg-white text-blue-700 font-bold text-xs tracking-wider border border-blue-200 shadow-2xs">
          H = ( L &times; H<sub>sensor</sub> ) &divide; ( R + L )
        </div>
        <div className="mt-1.5 text-[9.5px] text-slate-600 grid grid-cols-3 gap-1 text-center pt-1 border-t border-blue-100">
          <div><b className="text-slate-900">L:</b> Shadow</div>
          <div><b className="text-slate-900">H<sub>sensor</sub>:</b> Alt</div>
          <div><b className="text-slate-900">R:</b> Range</div>
        </div>
      </div>

      {/* Interactive Sliders for Live Geometry Testing */}
      <div className="space-y-2 mb-2.5 text-[11px] font-mono">
        <div>
          <div className="flex justify-between text-slate-700 mb-0.5">
            <span className="font-medium">Shadow Length (L):</span>
            <span className="text-blue-700 font-bold">{customShadowLength.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="15.0"
            step="0.1"
            value={customShadowLength}
            onChange={(e) => setCustomShadowLength(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-700 mb-0.5">
            <span className="font-medium">Towfish Altitude (H<sub>sensor</sub>):</span>
            <span className="text-blue-700 font-bold">{customAltitude.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="25.0"
            step="0.5"
            value={customAltitude}
            onChange={(e) => setCustomAltitude(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-700 mb-0.5">
            <span className="font-medium">Slant Range (R):</span>
            <span className="text-blue-700 font-bold">{customSlantRange.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="10.0"
            max="80.0"
            step="1.0"
            value={customSlantRange}
            onChange={(e) => setCustomSlantRange(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Output Calculated Height & Status */}
      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-medium">Computed Relief</span>
          <div className="text-lg font-bold font-mono text-slate-900 flex items-baseline space-x-1">
            <span className="text-blue-700 text-xl">{calculatedHeight}</span>
            <span className="text-[10px] text-slate-500">m above seafloor</span>
          </div>
        </div>

        <div className="text-right">
          {isPlausibleDebris ? (
            <div className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-mono font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px] font-mono font-bold">
              <AlertCircle className="w-3 h-3" />
              <span>Check</span>
            </div>
          )}
          <span className="block text-[9px] text-slate-400 mt-0.5">Cross-Check</span>
        </div>
      </div>
    </div>
  );
};
