import type { SonarScan, DebrisCategory } from '../types';

export const CATEGORY_DETAILS: Record<DebrisCategory, { label: string; color: string; bg: string; icon: string }> = {
  ghost_net: {
    label: 'Ghost Net / Derelict Gear',
    color: '#f87171',
    bg: 'rgba(248, 113, 113, 0.15)',
    icon: 'FishOff',
  },
  metal_drum: {
    label: 'Hazardous Metal Drum',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.15)',
    icon: 'AlertTriangle',
  },
  cargo_container: {
    label: 'Lost Intermodal Container',
    color: '#00f2fe',
    bg: 'rgba(0, 242, 254, 0.15)',
    icon: 'Box',
  },
  sunken_vessel: {
    label: 'Sunken Wreck / Derelict Hull',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    icon: 'Anchor',
  },
  tire_cluster: {
    label: 'Artificial Tire Dumpsite',
    color: '#38ef7d',
    bg: 'rgba(56, 239, 125, 0.15)',
    icon: 'CircleDot',
  },
  plastic_debris: {
    label: 'High-Density Plastic Waste',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    icon: 'Layers',
  },
};

export const SAMPLE_SONAR_SCANS: SonarScan[] = [
  {
    id: 'scan-arabian-sea-01',
    title: 'Arabian Sea - Sector Bravo Transect 04',
    sector: 'Offshore Mumbai High (Continental Shelf)',
    surveyVessel: 'RV Sagar Nidhi (AUV Hydroid REMUS 600)',
    frequencyKhz: 455,
    altitudeMeters: 8.5,
    slantRangeMeters: 42.0,
    dateCaptured: '2026-08-28 09:42:15 UTC',
    description: 'High frequency acoustic backscatter revealing extensive ghost fishing net snagged along rocky seabed with trailing monofilament line and high-reflectivity acoustic shadow.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    detections: [
      {
        id: 'det-001',
        name: 'Derelict Monofilament Ghost Net',
        category: 'ghost_net',
        confidence: 96.8,
        bbox: { x: 22, y: 28, width: 34, height: 26 },
        coordinates: { lat: 18.9412, lng: 72.8256 },
        depthMeters: 38.4,
        shadowLengthMeters: 4.8,
        estimatedHeightMeters: 1.25,
        acousticShadowVerified: true,
        severity: 'critical',
        timestamp: '2026-08-28T09:43:02Z',
        materialComposition: 'High-density Polyethylene & Nylon 6',
      },
      {
        id: 'det-002',
        name: 'Submerged 200L Industrial Chemical Drum',
        category: 'metal_drum',
        confidence: 91.4,
        bbox: { x: 68, y: 55, width: 18, height: 22 },
        coordinates: { lat: 18.9435, lng: 72.8291 },
        depthMeters: 39.1,
        shadowLengthMeters: 2.1,
        estimatedHeightMeters: 0.88,
        acousticShadowVerified: true,
        severity: 'high',
        timestamp: '2026-08-28T09:44:18Z',
        materialComposition: 'Corroded Ferrous Steel Alloy',
      }
    ]
  },
  {
    id: 'scan-bay-of-bengal-02',
    title: 'Bay of Bengal - Visakhapatnam Outer Harbor',
    sector: 'Zone Echo-9 (Commercial Shipping Fairway)',
    surveyVessel: 'INS Sandhayak (Hydrographic Survey Unit)',
    frequencyKhz: 900,
    altitudeMeters: 12.0,
    slantRangeMeters: 65.0,
    dateCaptured: '2026-08-30 14:15:33 UTC',
    description: 'Ultra-high resolution 900kHz sonar mosaic capturing a submerged 20ft intermodal container dislodged during cyclonic conditions, casting sharp acoustic deadzone.',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    detections: [
      {
        id: 'det-003',
        name: 'Submerged 20ft Cargo Container',
        category: 'cargo_container',
        confidence: 97.9,
        bbox: { x: 35, y: 32, width: 42, height: 38 },
        coordinates: { lat: 17.6868, lng: 83.2185 },
        depthMeters: 46.2,
        shadowLengthMeters: 8.4,
        estimatedHeightMeters: 2.59,
        acousticShadowVerified: true,
        severity: 'critical',
        timestamp: '2026-08-30T14:16:10Z',
        materialComposition: 'Corten Weathering Steel with Structural Distortion',
      }
    ]
  },
  {
    id: 'scan-kochi-channel-03',
    title: 'Kochi Port Approaches - Transect Delta',
    sector: 'Vypin Coastal Estuary & Fairway',
    surveyVessel: 'ICGS Samarth (Side-Scan Towfish Array)',
    frequencyKhz: 455,
    altitudeMeters: 6.0,
    slantRangeMeters: 30.0,
    dateCaptured: '2026-09-01 07:11:45 UTC',
    description: 'Shallow water multi-beam side scan detecting abandoned barge wreckage and dense discarded tire clusters creating localized seafloor disruption.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    detections: [
      {
        id: 'det-004',
        name: 'Derelict Fishing Trawler Hull Section',
        category: 'sunken_vessel',
        confidence: 94.2,
        bbox: { x: 15, y: 20, width: 50, height: 42 },
        coordinates: { lat: 9.9674, lng: 76.2215 },
        depthMeters: 21.5,
        shadowLengthMeters: 6.2,
        estimatedHeightMeters: 2.15,
        acousticShadowVerified: true,
        severity: 'high',
        timestamp: '2026-09-01T07:12:30Z',
        materialComposition: 'Composite Timber & Lead Ballast Keel',
      },
      {
        id: 'det-005',
        name: 'Discarded Heavy Vehicle Tire Cluster (x8)',
        category: 'tire_cluster',
        confidence: 89.7,
        bbox: { x: 72, y: 62, width: 22, height: 26 },
        coordinates: { lat: 9.9691, lng: 76.2248 },
        depthMeters: 22.1,
        shadowLengthMeters: 1.8,
        estimatedHeightMeters: 0.65,
        acousticShadowVerified: true,
        severity: 'medium',
        timestamp: '2026-09-01T07:13:05Z',
        materialComposition: 'Vulcanized Synthetic Rubber & Steel Belting',
      }
    ]
  },
  {
    id: 'scan-goa-shelf-04',
    title: 'Goa Coastal Shelf - Mormugao Anchorage',
    sector: 'Anchorage Zone Alpha-2',
    surveyVessel: 'NIO Sagar Sukti (EdgeTech 4200-MP)',
    frequencyKhz: 600,
    altitudeMeters: 10.0,
    slantRangeMeters: 50.0,
    dateCaptured: '2026-09-02 11:22:04 UTC',
    description: 'Survey identifying high density synthetic polypropylene dumping and secondary entanglement zones threatening local pelagic fish nurseries.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    detections: [
      {
        id: 'det-006',
        name: 'Accumulated Plastic Sheeting & Cordage',
        category: 'plastic_debris',
        confidence: 88.5,
        bbox: { x: 30, y: 40, width: 38, height: 32 },
        coordinates: { lat: 15.4182, lng: 73.7845 },
        depthMeters: 31.0,
        shadowLengthMeters: 2.4,
        estimatedHeightMeters: 0.72,
        acousticShadowVerified: true,
        severity: 'medium',
        timestamp: '2026-09-02T11:23:19Z',
        materialComposition: 'Microfragmented Polypropylene / Low Density PE',
      }
    ]
  }
];

/**
 * Calculates acoustic object height using standard side scan sonar shadow geometry:
 * H = (L * H_sensor) / (R + L)
 * where:
 *   L = Length of acoustic shadow (meters)
 *   H_sensor = Altitude of sonar transducer above seafloor (meters)
 *   R = Slant range from sonar nadir to target (meters)
 */
export function calculateShadowHeight(shadowLength: number, altitude: number, slantRange: number): number {
  if (slantRange + shadowLength === 0) return 0;
  const height = (shadowLength * altitude) / (slantRange + shadowLength);
  return Math.round(height * 100) / 100;
}
