import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { DebrisDetection } from '../../types';
import { CATEGORY_DETAILS } from '../../data/sampleSonarData';
import { Layers, Compass, Crosshair } from 'lucide-react';

interface Props {
  detections: DebrisDetection[];
  selectedDetectionId: string | null;
  onSelectDetection: (id: string) => void;
  onNavigateToStudio?: () => void;
}

export const SonarLeafletMap: React.FC<Props> = ({
  detections,
  selectedDetectionId,
  onSelectDetection,
  onNavigateToStudio,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Filtered detections
  const filtered = activeCategoryFilter === 'all'
    ? detections
    : detections.filter(d => d.category === activeCategoryFilter);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center near Indian Coastline (Arabian Sea / Mumbai)
    const initialLat = 18.9412;
    const initialLng = 72.8256;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
      });

      // CartoDB Positron Light Tiles (clean bright light theme map)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Add Custom Zoom Control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep instance alive across re-renders
    };
  }, []);

  // Update Markers whenever filtered detections or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    // Generate markers
    filtered.forEach(item => {
      const isSelected = selectedDetectionId === item.id;
      const markerColor = item.severity === 'critical' ? '#dc2626' : item.severity === 'high' ? '#d97706' : '#0284c7';

      const customIcon = L.divIcon({
        className: 'custom-sonar-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full ${isSelected ? 'animate-ping' : 'animate-pulse'}" style="background-color: ${markerColor}33"></span>
            <div class="relative w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-md transition-transform hover:scale-125" style="background-color: #ffffff; border-color: ${markerColor};">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${markerColor}"></span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], { icon: customIcon })
        .addTo(map);

      marker.on('click', () => {
        onSelectDetection(item.id);
      });

      // Bind popup (clean light theme popup)
      marker.bindPopup(`
        <div style="color: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${markerColor};">${item.severity.toUpperCase()} RISK</span>
            <span style="font-size: 11px; font-family: monospace; color: #64748b; font-weight: 600;">${item.confidence}% CONF</span>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${item.name}</h4>
          <div style="font-size: 11px; color: #334155; line-height: 1.5; font-family: monospace;">
            <div>&bull; Lat/Long: ${item.coordinates.lat.toFixed(4)}°N, ${item.coordinates.lng.toFixed(4)}°E</div>
            <div>&bull; Seafloor Depth: <b>${item.depthMeters} m</b></div>
            <div>&bull; Acoustic Height: <b>${item.estimatedHeightMeters} m</b></div>
            <div>&bull; Shadow Length: <b>${item.shadowLengthMeters} m</b></div>
          </div>
        </div>
      `, {
        className: 'custom-leaflet-popup-light',
      });

      markersRef.current[item.id] = marker;
    });

    // Draw survey ship track line
    const surveyLine = L.polyline(
      filtered.map(d => [d.coordinates.lat, d.coordinates.lng]),
      {
        color: '#0284c7',
        dashArray: '8, 8',
        weight: 2.5,
        opacity: 0.8,
      }
    ).addTo(map);

    return () => {
      surveyLine.remove();
    };
  }, [filtered, selectedDetectionId, onSelectDetection]);

  // Pan to selected item
  useEffect(() => {
    if (!selectedDetectionId || !mapInstanceRef.current) return;
    const selected = detections.find(d => d.id === selectedDetectionId);
    if (selected) {
      mapInstanceRef.current.flyTo([selected.coordinates.lat, selected.coordinates.lng], 14, {
        duration: 1.2,
      });
      markersRef.current[selected.id]?.openPopup();
    }
  }, [selectedDetectionId, detections]);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
      {/* Map Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Filter Pills */}
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-md pointer-events-auto">
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700 mr-1">Filter Debris:</span>
          <select
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value)}
            className="bg-slate-50 text-xs text-blue-700 font-bold border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Marine Categories ({detections.length})</option>
            <option value="ghost_net">Ghost Fishing Nets</option>
            <option value="metal_drum">Chemical Drums</option>
            <option value="cargo_container">Cargo Containers</option>
            <option value="sunken_vessel">Sunken Wrecks</option>
            <option value="tire_cluster">Tire Clusters</option>
            <option value="plastic_debris">Plastic Waste</option>
          </select>
        </div>

        {/* Right Info Pill */}
        <div className="flex items-center space-x-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-md text-xs font-mono pointer-events-auto">
          <div className="flex items-center space-x-1.5 text-blue-700 font-bold">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
            <span>GEO-REF: WGS 84</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1.5 text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>GPS SATELLITE LOCK: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Actual Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom Selected Item Summary Drawer */}
      {selectedDetectionId && (
        <div className="absolute bottom-4 left-4 max-w-md z-[1000] bg-white/98 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-2xl">
          {(() => {
            const item = detections.find(d => d.id === selectedDetectionId);
            if (!item) return null;
            const meta = CATEGORY_DETAILS[item.category];

            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase" style={{ color: meta.color, backgroundColor: meta.bg }}>
                    {meta.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600">
                    Confidence: {item.confidence}%
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">{item.name}</h4>
                <p className="text-xs text-slate-600 font-mono mb-2">
                  GPS: {item.coordinates.lat}°N, {item.coordinates.lng}°E &bull; Depth: {item.depthMeters}m
                </p>
                <div className="text-[11px] text-slate-600 mb-3 bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-slate-800 font-semibold">Composition:</span> {item.materialComposition}
                </div>
                {onNavigateToStudio && (
                  <button
                    onClick={onNavigateToStudio}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Inspect Acoustic Shadow in Studio</span>
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
