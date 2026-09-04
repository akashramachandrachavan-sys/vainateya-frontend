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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg text-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">Acoustic Shadow Verification</h3>
            <p className="text-[11px] font-mono text-slate-500">SIH Geometry Module &bull; False-Positive Reducer</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Verification</span>
        </div>
      </div>

      {/* Shadow Geometry Formula Box */}
      <div className="p-3.5 mb-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-600 mb-1">
          <span className="flex items-center space-x-1 text-blue-800 font-bold">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Trigonometric Height Formula:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">IEEE Geoscience SSS Standard</span>
        </div>
        <div className="text-center py-2 px-3 rounded bg-white text-blue-700 font-bold text-sm tracking-wider border border-blue-200 shadow-sm">
          H = ( L &times; H<sub>sensor</sub> ) &divide; ( R + L )
        </div>
        <div className="mt-2 text-[10px] text-slate-600 grid grid-cols-3 gap-2 text-center pt-1 border-t border-blue-100">
          <div><b className="text-slate-900">L:</b> Shadow Length</div>
          <div><b className="text-slate-900">H<sub>sensor</sub>:</b> Sonar Altitude</div>
          <div><b className="text-slate-900">R:</b> Slant Range</div>
        </div>
      </div>

      {/* Interactive Sliders for Live Geometry Testing */}
      <div className="space-y-3.5 mb-4 text-xs font-mono">
        <div>
          <div className="flex justify-between text-slate-700 mb-1">
            <span className="font-medium">Acoustic Shadow Length (L):</span>
            <span className="text-blue-700 font-bold">{customShadowLength.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="15.0"
            step="0.1"
            value={customShadowLength}
            onChange={(e) => setCustomShadowLength(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-700 mb-1">
            <span className="font-medium">Towfish Sonar Altitude (H<sub>sensor</sub>):</span>
            <span className="text-blue-700 font-bold">{customAltitude.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="25.0"
            step="0.5"
            value={customAltitude}
            onChange={(e) => setCustomAltitude(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-slate-700 mb-1">
            <span className="font-medium">Slant Range to Target (R):</span>
            <span className="text-blue-700 font-bold">{customSlantRange.toFixed(1)} m</span>
          </div>
          <input
            type="range"
            min="10.0"
            max="80.0"
            step="1.0"
            value={customSlantRange}
            onChange={(e) => setCustomSlantRange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Output Calculated Height & Status */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-medium">Computed Target Relief</span>
          <div className="text-xl font-bold font-mono text-slate-900 flex items-baseline space-x-1">
            <span className="text-blue-700 text-2xl">{calculatedHeight}</span>
            <span className="text-xs text-slate-500">meters above seafloor</span>
          </div>
        </div>

        <div className="text-right">
          {isPlausibleDebris ? (
            <div className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Debris Verified</span>
            </div>
          ) : (
            <div className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-mono font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>False Positive Flag</span>
            </div>
          )}
          <span className="block text-[10px] text-slate-500 mt-1">Geometric Cross-Check</span>
        </div>
      </div>
    </div>
  );
};
