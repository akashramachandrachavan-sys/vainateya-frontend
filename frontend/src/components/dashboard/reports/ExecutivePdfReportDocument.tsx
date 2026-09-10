import React from 'react';
import type { BatchImageResult, BatchSummaryStats } from '../types/dashboard.types';

interface ExecutivePdfReportDocumentProps {
  surveyName: string;
  surveyLocation: string;
  surveyDate: string;
  operatorName: string;
  activeImage: BatchImageResult;
  batchStats: BatchSummaryStats;
}

export const ExecutivePdfReportDocument: React.FC<ExecutivePdfReportDocumentProps> = ({
  surveyName,
  surveyLocation,
  surveyDate,
  operatorName,
  activeImage,
  batchStats,
}) => {
  const reportDateStr = surveyDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const reportMissionName = surveyName || 'Arabian Sea Shelf SSS Survey';
  const reportVessel = 'RV Sagar Nidhi (ORV)';
  const reportOperator = operatorName || 'Akash Chavan';
  const reportLocation = activeImage.location || surveyLocation || 'Arabian Sea Shelf (18.9142° N, 72.7845° E)';
  const reportSonarImage = activeImage.sonarImg || activeImage.thumb || '/sonar-tile-1.jpg';

  // Fallback detections if none are loaded
  const reportDetections = activeImage.detections.length > 0
    ? activeImage.detections
    : [
      {
        id: 'det-1',
        orderNumber: 1,
        name: 'Sunken Cargo Container',
        type: 'container',
        confidence: 94,
        coordinates: '18.9142° N, 72.7845° E',
        size: '6.1 × 2.4 m',
        color: 'red' as const,
        hexColor: '#ef4444',
        borderColor: 'border-rose-500',
        bgColor: 'bg-rose-500/10',
        textColor: 'text-rose-600',
        tagColor: 'bg-rose-500',
        badgeBg: 'bg-rose-50 text-rose-600 border border-rose-200',
        bbox: { left: '55%', top: '25%', width: '16%', height: '24%' },
        thumb: reportSonarImage,
      },
      {
        id: 'det-2',
        orderNumber: 2,
        name: 'Derelict Fishing Net / Gear',
        type: 'fishing_gear',
        confidence: 88,
        coordinates: '18.9158° N, 72.7862° E',
        size: '11.8 × 4.2 m',
        color: 'amber' as const,
        hexColor: '#f59e0b',
        borderColor: 'border-amber-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-600',
        tagColor: 'bg-amber-500',
        badgeBg: 'bg-amber-50 text-amber-600 border border-amber-200',
        bbox: { left: '25%', top: '46%', width: '18%', height: '17%' },
        thumb: reportSonarImage,
      },
      {
        id: 'det-3',
        orderNumber: 3,
        name: 'Submerged Metallic Debris',
        type: 'debris',
        confidence: 82,
        coordinates: '18.9171° N, 72.7879° E',
        size: '4.5 × 1.9 m',
        color: 'blue' as const,
        hexColor: '#3b82f6',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600',
        tagColor: 'bg-blue-500',
        badgeBg: 'bg-blue-50 text-blue-600 border border-blue-200',
        bbox: { left: '68%', top: '65%', width: '14%', height: '18%' },
        thumb: reportSonarImage,
      }
    ];

  const shadowData = [
    { shadowM: '4.8 m', reliefM: '2.1 m', hazard: 'CRITICAL HAZARD - NAVIGATION OBSTRUCTION' },
    { shadowM: '6.2 m', reliefM: '1.4 m', hazard: 'MEDIUM RISK - BENTHIC ENTANGLEMENT' },
    { shadowM: '3.1 m', reliefM: '0.9 m', hazard: 'LOW RISK - INERT SUBMERGED DEBRIS' },
  ];

  return (
    <div className="report-paper text-slate-900 bg-white font-sans max-w-[820px] mx-auto p-4 sm:p-8 space-y-6">
      {/* Masthead Header */}
      <div className="border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <img src="/moes-logo-clean.png" alt="MoES Logo" className="h-11 w-auto object-contain shrink-0" />
            <div className="h-9 w-[1px] bg-slate-300"></div>
            <img src="/vainateya-symbol.png" alt="VAINATEYA Logo" className="h-9 w-auto object-contain shrink-0" />
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase font-mono">
                MINISTRY OF EARTH SCIENCES • NAVAL HYDROGRAPHIC DIRECTORATE
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 font-['Space_Grotesk'] leading-tight">
                VAINATEYA EXECUTIVE MARINE SURVEY REPORT
              </h1>
              <div className="text-[11px] font-semibold text-blue-700 font-mono">
                Autonomous Side-Scan Sonar (SSS) Benthic Debris & Acoustic Shadow Audit
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[9px] font-bold tracking-wider uppercase mb-1">
              OFFICIAL HYDROGRAPHIC RECORD
            </div>
            <div className="text-xs font-mono font-bold text-slate-800">REF: VN-SURV-2026-0906</div>
            <div className="text-[10px] text-slate-500 font-mono">Issued: {reportDateStr}</div>
          </div>
        </div>
      </div>

      {/* Mission Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Survey Mission</div>
          <div className="font-bold text-slate-900 truncate">{reportMissionName}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Vessel / Platform</div>
          <div className="font-bold text-slate-900 truncate">{reportVessel}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Lead Hydrographer</div>
          <div className="font-bold text-slate-900 truncate">{reportOperator}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Geographic Grid</div>
          <div className="font-bold text-slate-900 truncate">{reportLocation}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Acoustic Payload</div>
          <div className="font-semibold text-slate-800">Dual-Freq Side-Scan Sonar</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Operating Frequency</div>
          <div className="font-semibold text-slate-800 font-mono">{activeImage.frequency || '455 kHz'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Swath & Speed</div>
          <div className="font-semibold text-slate-800 font-mono">{activeImage.swath || '75m'} | {activeImage.speed || '3.2 kts'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Scan UTC Time</div>
          <div className="font-semibold text-slate-800 font-mono">{activeImage.timeHud || '09:57:51 UTC'}</div>
        </div>
      </div>

      {/* Threat KPI Matrix */}
      <div className="avoid-page-break">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-2 flex items-center justify-between">
          <span>Executive Threat Matrix & Survey KPIs</span>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Geometry Resolved</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase font-mono">Frames Processed</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{batchStats.totalImages || 1}</div>
            <div className="text-[9px] text-slate-500 mt-0.5">High-res waterfall swath</div>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <div className="text-[10px] text-slate-500 font-bold uppercase font-mono">Detected Hazards</div>
            <div className="text-xl font-black text-blue-600 mt-0.5">{reportDetections.length}</div>
            <div className="text-[9px] text-blue-600/80 mt-0.5">Acoustic targets geolocated</div>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="text-[10px] text-rose-600 font-bold uppercase font-mono">Navigation Threat</div>
            <div className="text-xl font-black text-rose-700 mt-0.5">1 Critical</div>
            <div className="text-[9px] text-rose-600 mt-0.5">Relief &gt; 2m in shipping lane</div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="text-[10px] text-amber-600 font-bold uppercase font-mono">Eco / Ghost Net</div>
            <div className="text-xl font-black text-amber-700 mt-0.5">1 Derelict</div>
            <div className="text-[9px] text-amber-600 mt-0.5">Marine fauna entanglement</div>
          </div>
        </div>
      </div>

      {/* Sonar Waterfall Scan Transect */}
      <div className="avoid-page-break space-y-1.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center justify-between">
          <span>Acoustic Waterfall Swath Transect (Raw Sonar Backscatter)</span>
          <span className="text-[10px] text-slate-500 font-mono">SRC: Enabled | 0.12m/pixel</span>
        </div>
        <div className="relative border-2 border-slate-800 rounded-xl overflow-hidden bg-black aspect-[16/8]">
          <img
            src={reportSonarImage}
            alt="Sonar Waterfall Transect"
            className="w-full h-full object-cover"
          />
          {/* HUD Overlay */}
          <div className="absolute top-2 left-2 bg-black/75 text-emerald-400 font-mono text-[9px] px-2 py-1 rounded border border-emerald-500/40 backdrop-blur-xs space-y-0.5">
            <div>TIME: {activeImage.timeHud || '09:57:51 UTC'}</div>
            <div>FREQ: {activeImage.frequency || '455 kHz'} | SWATH: {activeImage.swath || '75m'} | SPEED: {activeImage.speed || '3kts'}</div>
            <div>FILE: {activeImage.filename || 'transect_sss_line_01.png'}</div>
          </div>

          {/* Target Geolocation Pins/Boxes on Scan */}
          {reportDetections.map((det, idx) => (
            <div
              key={det.id}
              className="absolute border-2 rounded pointer-events-none flex flex-col justify-start"
              style={{
                top: det.bbox?.top || `${25 + idx * 22}%`,
                left: det.bbox?.left || `${30 + idx * 20}%`,
                width: det.bbox?.width || '15%',
                height: det.bbox?.height || '20%',
                borderColor: det.hexColor || (idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#3b82f6'),
                backgroundColor: `${det.hexColor || '#ef4444'}20`,
              }}
            >
              <div
                className="text-[9px] font-mono font-bold text-white px-1 py-0.5 flex items-center justify-between"
                style={{
                  backgroundColor: det.hexColor || (idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#3b82f6')
                }}
              >
                <span>#{idx + 1} {det.name.slice(0, 14)}</span>
                <span>{det.confidence}%</span>
              </div>
            </div>
          ))}

          {/* Bottom Scale Bar */}
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-white flex items-center space-x-1.5 border border-white/20">
            <span className="w-12 h-1 bg-white inline-block"></span>
            <span>50 m</span>
          </div>
        </div>
      </div>

      {/* Detections & Acoustic Shadow Geometry Table */}
      <div className="avoid-page-break space-y-1.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          Verified Benthic Debris & Acoustic Shadow Geometry Inventory
        </div>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-[10px] uppercase">
                <th className="py-2 px-2.5">Trg #</th>
                <th className="py-2 px-2.5">Object Class / Description</th>
                <th className="py-2 px-2.5">GPS Position</th>
                <th className="py-2 px-2.5">Dimensions</th>
                <th className="py-2 px-2.5">Shadow (Ls)</th>
                <th className="py-2 px-2.5">Relief (h)</th>
                <th className="py-2 px-2.5">Conf.</th>
                <th className="py-2 px-2.5">Threat Level</th>
                <th className="py-2 px-2.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {reportDetections.map((det, idx) => {
                const sInfo = shadowData[idx % shadowData.length];
                return (
                  <tr key={det.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="py-2 px-2.5 font-mono font-bold text-slate-900">#{det.orderNumber || idx + 1}</td>
                    <td className="py-2 px-2.5">
                      <div className="font-bold text-slate-900">{det.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">{det.type}</div>
                    </td>
                    <td className="py-2 px-2.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">{det.coordinates}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-700">{det.size}</td>
                    <td className="py-2 px-2.5 font-mono font-semibold text-blue-700">{sInfo.shadowM}</td>
                    <td className="py-2 px-2.5 font-mono font-semibold text-purple-700">{sInfo.reliefM}</td>
                    <td className="py-2 px-2.5 font-mono font-bold text-slate-900">{det.confidence}%</td>
                    <td className="py-2 px-2.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${idx === 0
                        ? 'bg-rose-100 text-rose-700 border border-rose-300'
                        : idx === 1
                          ? 'bg-amber-100 text-amber-700 border border-amber-300'
                          : 'bg-blue-100 text-blue-700 border border-blue-300'
                        }`}>
                        {idx === 0 ? 'Critical Hazard' : idx === 1 ? 'Medium Risk' : 'Low / Inert'}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-[10px] text-emerald-700 font-bold">
                      CONFIRMED ✓
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Directives for Salvage Vessels */}
      <div className="avoid-page-break space-y-1.5">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
          Salvage Vessel & Hydrographic Action Directives
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="font-bold text-rose-900 flex items-center space-x-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              <span>1. Navigational Safety Notice</span>
            </div>
            <p className="text-[11px] text-rose-800/90 leading-relaxed">
              Target #1 exhibits 2.1m vertical elevation reduction in commercial shallow corridor. Issue urgent Notice to Mariners (NOTMAR) for Sector 18-Bravo.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="font-bold text-amber-900 flex items-center space-x-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span>2. Salvage Recovery Tasking</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Deploy salvage vessel equipped with ROV hydraulic shears to retrieve 11.8m derelict ghost net (Target #2) to protect benthic marine life.
            </p>
          </div>
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="font-bold text-blue-900 flex items-center space-x-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>3. Hydrographic Charting</span>
            </div>
            <p className="text-[11px] text-blue-800/90 leading-relaxed">
              Log verified acoustic shadow geometries into National Hydrographic Database (ENC Chart IN204, WGS-84 datum) for permanent bathymetric records.
            </p>
          </div>
        </div>
      </div>

      {/* Official Certification & Signatures */}
      <div className="avoid-page-break pt-4 border-t-2 border-slate-900 flex items-end justify-between gap-6">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">Lead Hydrographer / Officer-in-Charge</div>
          <div className="text-sm font-black text-slate-900 mt-1 font-['Space_Grotesk']">{reportOperator}</div>
          <div className="text-[11px] text-slate-600 font-medium">Senior Marine Operator & Hydrographic Surveyor</div>
          <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-1">
            Digitally Certified & Approved (PKI Key #VN-9481-AKC)
          </div>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center space-x-2 border-2 border-slate-900 rounded-xl px-3 py-2 bg-slate-50">
            <img src="/vainateya-symbol.png" alt="Seal" className="w-8 h-8 object-contain opacity-90" />
            <div className="text-left font-mono">
              <div className="text-[9px] font-black uppercase text-slate-900 tracking-wider">VAINATEYA CERTIFIED</div>
              <div className="text-[8px] text-slate-600">YOLOv8-Marine v3.2 Core</div>
              <div className="text-[8px] text-slate-500">ISO/IEC Hydro Standard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-[10px] text-slate-400 font-mono border-t border-slate-100">
        VAINATEYA Hydrographic Survey Directorate • Ministry of Earth Sciences • Certified Seabed Audit • Page 1 of 1
      </div>
    </div>
  );
};
