import { useState } from 'react';
import {
  Layers,
  Database,
  Cpu,
  Compass,
  Code2,
  Server,
  ShieldCheck,
  Palette,
  Cloud,
  Terminal,
  HardDrive,
  Box,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';

interface TechItem {
  category: 'Frontend' | 'Backend' | 'AI Tools';
  layer: string;
  finalTool: string;
  description: string;
  icon: typeof Code2;
  badge: string;
}

export function TechStackShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Frontend' | 'Backend' | 'AI Tools'>('All');
  const [viewMode, setViewMode] = useState<'columns' | 'grid' | 'table'>('columns');

  const stackItems: TechItem[] = [
    // Frontend Tools
    {
      category: 'Frontend',
      layer: 'Frontend',
      finalTool: 'React.js + TypeScript',
      description: 'Typed reactive state and sub-second UI updates',
      icon: Code2,
      badge: 'Core',
    },
    {
      category: 'Frontend',
      layer: 'UI Framework',
      finalTool: 'Tailwind CSS + shadcn/ui',
      description: 'Clean light design system with accessible HUD components',
      icon: Layers,
      badge: 'Styling',
    },
    {
      category: 'Frontend',
      layer: 'Maps',
      finalTool: 'Leaflet + OpenStreetMap',
      description: 'Geospatial GPS survey tracks and debris coordinates',
      icon: Compass,
      badge: 'GIS',
    },
    {
      category: 'Frontend',
      layer: 'Authentication',
      finalTool: 'JWT',
      description: 'Role-based token auth and secure session control',
      icon: ShieldCheck,
      badge: 'Auth',
    },
    {
      category: 'Frontend',
      layer: 'UI Design',
      finalTool: 'Figma',
      description: 'Sonar HUD design tokens and interface mockups',
      icon: Palette,
      badge: 'Design',
    },
    {
      category: 'Frontend',
      layer: 'Deployment',
      finalTool: 'Vercel',
      description: 'Edge CDN hosting with instant preview deployments',
      icon: Cloud,
      badge: 'Hosting',
    },

    // Backend Tools
    {
      category: 'Backend',
      layer: 'Backend API',
      finalTool: 'FastAPI',
      description: 'High-speed async REST endpoints with OpenAPI docs',
      icon: Server,
      badge: 'API',
    },
    {
      category: 'Backend',
      layer: 'Programming Language',
      finalTool: 'Python',
      description: 'Core runtime for FastAPI and PyTorch model inferencing',
      icon: Terminal,
      badge: 'Runtime',
    },
    {
      category: 'Backend',
      layer: 'Database',
      finalTool: 'PostgreSQL + PostGIS',
      description: 'Spatial relational database for GIS coordinates and scans',
      icon: Database,
      badge: 'PostGIS',
    },
    {
      category: 'Backend',
      layer: 'Image Storage',
      finalTool: 'Cloudflare R2',
      description: 'Zero-egress S3 object bucket for large sonar waterfalls',
      icon: HardDrive,
      badge: 'Storage',
    },
    {
      category: 'Backend',
      layer: 'Model Serving',
      finalTool: 'FastAPI',
      description: 'Low-latency async microservice for YOLO predictions',
      icon: Server,
      badge: 'Serving',
    },
    {
      category: 'Backend',
      layer: 'Background Jobs',
      finalTool: 'FastAPI BackgroundTasks + Redis + RQ',
      description: 'Queue system for heavy sonar tiling and inference batches',
      icon: SlidersHorizontal,
      badge: 'Queue',
    },
    {
      category: 'Backend',
      layer: 'Containerization',
      finalTool: 'Docker',
      description: 'Reproducible microservice container images',
      icon: Box,
      badge: 'DevOps',
    },
    {
      category: 'Backend',
      layer: 'Deployment',
      finalTool: 'Local RTX 3050 / Cloud VPS',
      description: 'CUDA acceleration locally and scalable Cloud VPS',
      icon: Cpu,
      badge: 'Compute',
    },

    // AI Tools
    {
      category: 'AI Tools',
      layer: 'AI Framework',
      finalTool: 'PyTorch',
      description: 'Tensor math and neural network model execution',
      icon: Cpu,
      badge: 'PyTorch',
    },
    {
      category: 'AI Tools',
      layer: 'Object Detection',
      finalTool: 'YOLOv12',
      description: 'Sonar debris classification with bounding boxes',
      icon: Cpu,
      badge: 'Vision',
    },
    {
      category: 'AI Tools',
      layer: 'Transfer Learning',
      finalTool: 'Pretrained YOLO',
      description: 'Weights fine-tuned on side-scan sonar underwater sets',
      icon: Cpu,
      badge: 'Fine-Tuning',
    },
    {
      category: 'AI Tools',
      layer: 'Image Processing',
      finalTool: 'OpenCV + NumPy',
      description: 'Contrast CLAHE, despeckling, and slant-range correction',
      icon: Terminal,
      badge: 'OpenCV',
    },
    {
      category: 'AI Tools',
      layer: 'Shadow Verification',
      finalTool: 'Custom Shadow Geometry Model',
      description: 'Trigonometric acoustic shadow formula for target height',
      icon: Compass,
      badge: 'Geometry',
    },
  ];

  const filteredItems = selectedCategory === 'All'
    ? stackItems
    : stackItems.filter(item => item.category === selectedCategory);

  const categories = [
    { id: 'All', label: 'All Layers', count: stackItems.length },
    { id: 'Frontend', label: 'Frontend Tools', count: stackItems.filter(i => i.category === 'Frontend').length },
    { id: 'Backend', label: 'Backend Tools', count: stackItems.filter(i => i.category === 'Backend').length },
    { id: 'AI Tools', label: 'AI Tools', count: stackItems.filter(i => i.category === 'AI Tools').length },
  ] as const;

  const frontendItems = stackItems.filter(i => i.category === 'Frontend');
  const backendItems = stackItems.filter(i => i.category === 'Backend');
  const aiItems = stackItems.filter(i => i.category === 'AI Tools');

  return (
    <section className="py-7 sm:py-9 bg-white border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
        <div className="text-center max-w-3xl mx-auto space-y-1">
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <Layers className="w-3 h-3 text-blue-600" />
            <span>Smart India Hackathon Technical Specification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
            Engineered Full-Stack Architecture
          </h2>
          <p className="text-xs text-slate-500">
            All 19 approved layers &amp; tools for autonomous marine debris classification, acoustic shadow relief, and geospatial mapping.
          </p>
        </div>

        {/* Filter Controls & View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b border-slate-200 pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('columns')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${viewMode === 'columns' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Layers className="w-3 h-3" />
              <span>3-Column Stack</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Compact Cards ({filteredItems.length})</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <TableIcon className="w-3 h-3" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* View Mode: Compact Grid Cards (Ultra-compact 1-row chips) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {filteredItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  title={`${item.layer}: ${item.finalTool} • ${item.description}`}
                  className="bg-white p-2 px-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all group flex items-center justify-between gap-2"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className={`p-1 rounded-md border transition-colors shrink-0 ${item.category === 'Frontend' ? 'bg-blue-50 border-blue-200 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                      item.category === 'Backend' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                        'bg-purple-50 border-purple-200 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                      }`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono text-slate-400 uppercase truncate leading-tight">
                        {item.layer}
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate leading-tight">
                        {item.finalTool}
                      </h3>
                    </div>
                  </div>

                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${item.category === 'Frontend' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    item.category === 'Backend' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      'bg-purple-50 border-purple-200 text-purple-700'
                    }`}>
                    {item.badge}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode: 3-Column Stack (Frontend, Backend, AI Tools side by side) */}
        {viewMode === 'columns' && (
          <div className={`grid gap-3 ${selectedCategory === 'All'
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
            {/* Frontend Column */}
            {(selectedCategory === 'All' || selectedCategory === 'Frontend') && (
              <div className="bg-slate-50/70 p-3 rounded-2xl border border-blue-200/80 flex flex-col space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
                  <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">Frontend Tools</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">6 Layers</span>
                </div>
                <div className="space-y-1">
                  {frontendItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} title={item.description} className="bg-white p-1.5 px-2 rounded-lg border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="p-1 rounded bg-blue-50 text-blue-600 shrink-0">
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono text-slate-400 uppercase leading-tight">{item.layer}</div>
                            <div className="text-xs font-bold text-slate-900 truncate leading-tight">{item.finalTool}</div>
                          </div>
                        </div>
                        <span className="text-[8.5px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">{item.badge}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Backend Column */}
            {(selectedCategory === 'All' || selectedCategory === 'Backend') && (
              <div className="bg-slate-50/70 p-3 rounded-2xl border border-emerald-200/80 flex flex-col space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100">
                  <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Backend Tools</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">8 Layers</span>
                </div>
                <div className="space-y-1">
                  {backendItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} title={item.description} className="bg-white p-1.5 px-2 rounded-lg border border-slate-200 hover:border-emerald-400 transition-colors flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="p-1 rounded bg-emerald-50 text-emerald-600 shrink-0">
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono text-slate-400 uppercase leading-tight">{item.layer}</div>
                            <div className="text-xs font-bold text-slate-900 truncate leading-tight">{item.finalTool}</div>
                          </div>
                        </div>
                        <span className="text-[8.5px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">{item.badge}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Tools Column */}
            {(selectedCategory === 'All' || selectedCategory === 'AI Tools') && (
              <div className="bg-slate-50/70 p-3 rounded-2xl border border-purple-200/80 flex flex-col space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-purple-100">
                  <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider">AI Tools</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">5 Layers</span>
                </div>
                <div className="space-y-1">
                  {aiItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} title={item.description} className="bg-white p-1.5 px-2 rounded-lg border border-slate-200 hover:border-purple-400 transition-colors flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="p-1 rounded bg-purple-50 text-purple-600 shrink-0">
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono text-slate-400 uppercase leading-tight">{item.layer}</div>
                            <div className="text-xs font-bold text-slate-900 truncate leading-tight">{item.finalTool}</div>
                          </div>
                        </div>
                        <span className="text-[8.5px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 shrink-0">{item.badge}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode: Structured Specification Table */}
        {viewMode === 'table' && (
          <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Layer</th>
                  <th className="px-5 py-3">Final Tool</th>
                  <th className="px-5 py-3">Engineering Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-5 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.category === 'Frontend' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        item.category === 'Backend' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          'bg-purple-50 border-purple-200 text-purple-700'
                        }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 font-mono text-slate-900 font-medium whitespace-nowrap">
                      {item.layer}
                    </td>
                    <td className="px-5 py-2.5 font-bold text-blue-600 whitespace-nowrap">
                      {item.finalTool}
                    </td>
                    <td className="px-5 py-2.5 text-slate-600 text-[11px]">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
