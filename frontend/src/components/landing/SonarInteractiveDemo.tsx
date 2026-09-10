import { useState } from 'react';
import { SAMPLE_SONAR_SCANS, CATEGORY_DETAILS } from '../../data/sampleSonarData';
import { ProceduralSonarCanvas } from '../dashboard/ProceduralSonarCanvas';
import { Sparkles, Crosshair, ArrowRight } from 'lucide-react';

export function SonarInteractiveDemo() {
  const [showAIOverlay, setShowAIOverlay] = useState<boolean>(true);
  const [selectedDetectionId, setSelectedDetectionId] = useState<string>(
    SAMPLE_SONAR_SCANS[0].detections[0].id
  );

  const activeScan = SAMPLE_SONAR_SCANS[0];
  const activeDetection = activeScan.detections.find(d => d.id === selectedDetectionId) || activeScan.detections[0];
  const meta = CATEGORY_DETAILS[activeDetection.category];

  return (
    <section id="interactive-demo" className="py-16 bg-white border-y border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Sonar Inspection Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
            Raw Acoustic Waterfall vs. AI Detection
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Test how our AI processes raw Side-Scan Sonar (SSS) backscatter, delineates high-reflectivity targets, and calculates acoustic shadow geometry in real-time.
          </p>
        </div>

        {/* Demo Stage Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sonar Canvas Display (8 cols) */}
          <div className="lg:col-span-8 relative">
            <ProceduralSonarCanvas
              detections={activeScan.detections}
              showBoundingBoxes={showAIOverlay}
              onToggleBoundingBoxes={() => setShowAIOverlay(!showAIOverlay)}
              confidenceThreshold={80}
              selectedDetectionId={selectedDetectionId}
              onSelectDetection={(id) => setSelectedDetectionId(id)}
              colorPalette="amber"
            />
          </div>

          {/* Interactive Inspection Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-mono text-blue-700 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Crosshair className="w-4 h-4 text-blue-600" />
                  <span>Target Inspection</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Acoustic Verified
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded uppercase inline-block mb-1.5" style={{ color: meta.color, backgroundColor: meta.bg }}>
                  {meta.label}
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{activeDetection.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  GPS: {activeDetection.coordinates.lat}°N, {activeDetection.coordinates.lng}°E
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">YOLO CONFIDENCE</span>
                  <span className="text-amber-600 font-bold text-base">{activeDetection.confidence}%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">SEAFLOOR DEPTH</span>
                  <span className="text-slate-900 font-bold text-base">{activeDetection.depthMeters} m</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">ACOUSTIC SHADOW</span>
                  <span className="text-blue-600 font-bold text-base">{activeDetection.shadowLengthMeters} m</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">CALCULATED RELIEF</span>
                  <span className="text-emerald-600 font-bold text-base">{activeDetection.estimatedHeightMeters} m</span>
                </div>
              </div>

              {/* Composition */}
              <div className="text-[11px] text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Compositional Analysis:</span>
                {activeDetection.materialComposition}
              </div>

              {/* Action Button to Launch Full Studio */}
              <a
                href="/dashboard.html"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/20"
              >
                <span>Open in Full Detection Studio</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
