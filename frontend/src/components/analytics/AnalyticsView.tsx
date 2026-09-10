import React from 'react';
import { SAMPLE_SONAR_SCANS, CATEGORY_DETAILS } from '../../data/sampleSonarData';
import { BarChart3, ShieldCheck, AlertTriangle, Waves, Anchor, CheckCircle, Clock } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const allDetections = SAMPLE_SONAR_SCANS.flatMap(s => s.detections);

  // Category counts
  const categoryCounts: { [key: string]: number } = {};
  allDetections.forEach(d => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50 text-slate-900">
      {/* Top Banner */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-mono text-blue-700 font-bold mb-1.5">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span className="uppercase tracking-widest">Acoustic Survey Analytics & Debris Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
          Hydrographic Metric Overview & Fleet Operations
        </h1>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-2 font-medium">
            <span>Total Underwater Targets</span>
            <Anchor className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">{allDetections.length + 18}</div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
            <span>+6 confirmed in last 24h</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-2 font-medium">
            <span>Mean Model Confidence</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">94.8%</div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            <span>YOLOv12 SSS Fine-tuned</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-2 font-medium">
            <span>Acoustic Shadow Verification</span>
            <Waves className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700 font-mono">38.4%</div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium flex items-center space-x-1">
            <span>False Positives Filtered Out</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-2 font-medium">
            <span>Critical Entanglement Hazards</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 font-mono">
            {allDetections.filter(d => d.severity === 'critical').length + 3}
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium flex items-center space-x-1">
            <span>Immediate dispatch recommended</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Fleet Dispatch Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
          <h3 className="text-base font-bold text-slate-900 tracking-wide">Debris Classification Breakdown</h3>
          <p className="text-xs text-slate-500">Distribution of acoustic signatures identified across survey transects.</p>

          <div className="space-y-3 pt-2">
            {Object.entries(CATEGORY_DETAILS).map(([catKey, details]) => {
              const count = categoryCounts[catKey] || 1;
              const pct = Math.round((count / (allDetections.length || 1)) * 100);

              return (
                <div key={catKey} className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-700">
                    <span className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: details.color }}></span>
                      <span className="font-medium">{details.label}</span>
                    </span>
                    <span className="text-slate-900 font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(12, pct)}%`, backgroundColor: details.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Recovery Dispatch Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-wide">Marine Cleanup Dispatch Queue</h3>
              <p className="text-xs text-slate-500">Coordinated recovery operations for port and coast guard units.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {allDetections.map((item, index) => {
              const meta = CATEGORY_DETAILS[item.category];
              const isDispatched = index === 0;

              return (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase" style={{ color: meta.color, backgroundColor: meta.bg }}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-500">
                      GPS: {item.coordinates.lat}°N, {item.coordinates.lng}°E &bull; Depth: {item.depthMeters}m &bull; Shadow H: {item.estimatedHeightMeters}m
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 whitespace-nowrap text-xs font-mono">
                    {isDispatched ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Vessel Dispatched</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Recovery</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
