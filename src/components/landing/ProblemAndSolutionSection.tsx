import {
  Upload,
  Settings,
  Brain,
  ShieldCheck,
  MapPin,
  FileText,
  Clock,
  UserCheck,
  AlertTriangle,
  Shield,
  Leaf,
  IndianRupee,
  Target,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

export function ProblemAndSolutionSection() {
  const steps = [
    {
      num: '01',
      title: 'Upload Sonar Data',
      desc: 'Upload SSS files (.xtf, .jsf, .tif, .png) with survey details.',
      icon: Upload,
      bottomTag: 'Your Survey Data',
      badgeStyle: 'bg-blue-50 text-blue-600 border-blue-200',
      iconStyle: 'bg-blue-50/80 text-blue-600 border-blue-100',
      tagStyle: 'bg-blue-50/90 text-blue-600 border-blue-200/70',
    },
    {
      num: '02',
      title: 'Preprocessing',
      desc: 'Enhance sonar imagery for better analysis (e.g., noise reduction, normalization).',
      icon: Settings,
      bottomTag: 'Processed Sonar Image',
      badgeStyle: 'bg-purple-50 text-purple-600 border-purple-200',
      iconStyle: 'bg-purple-50/80 text-purple-600 border-purple-100',
      tagStyle: 'bg-purple-50/90 text-purple-600 border-purple-200/70',
    },
    {
      num: '03',
      title: 'AI Detection',
      desc: 'Detect potential marine debris and anomalies using deep learning.',
      icon: Brain,
      bottomTag: 'Detected Targets',
      badgeStyle: 'bg-rose-50 text-rose-600 border-rose-200',
      iconStyle: 'bg-rose-50/80 text-rose-600 border-rose-100',
      tagStyle: 'bg-rose-50/90 text-rose-600 border-rose-200/70',
    },
    {
      num: '04',
      title: 'Review & Verification',
      desc: 'Human-in-the-loop review to confirm, reject or reclassify detections.',
      icon: ShieldCheck,
      bottomTag: 'Verified Results',
      badgeStyle: 'bg-amber-50 text-amber-600 border-amber-200',
      iconStyle: 'bg-amber-50/80 text-amber-600 border-amber-100',
      tagStyle: 'bg-amber-50/90 text-amber-600 border-amber-200/70',
    },
    {
      num: '05',
      title: 'Map & Visualize',
      desc: 'View detections on an interactive map with available survey coordinates.',
      icon: MapPin,
      bottomTag: 'Geospatial View',
      badgeStyle: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      iconStyle: 'bg-emerald-50/80 text-emerald-600 border-emerald-100',
      tagStyle: 'bg-emerald-50/90 text-emerald-600 border-emerald-200/70',
    },
    {
      num: '06',
      title: 'Generate Report',
      desc: 'Export detection summaries (PDF, CSV, GeoJSON) for further action.',
      icon: FileText,
      bottomTag: 'Actionable Output',
      badgeStyle: 'bg-sky-50 text-sky-600 border-sky-200',
      iconStyle: 'bg-sky-50/80 text-sky-600 border-sky-100',
      tagStyle: 'bg-sky-50/90 text-sky-600 border-sky-200/70',
    },
  ];

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Problem Statement Grid: Underwater Debris is a Serious Challenge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Headline, Checkpoints, and 6 Impact Mini Cards */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight leading-[1.15]">
                Underwater Debris is a <br />
                Serious Challenge for <br />
                <span className="text-blue-600">Safe and Sustainable Oceans.</span>
              </h2>

              {/* 4 Bullet Points with small blue tick and circle */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start space-x-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Large volumes of Side-Scan Sonar (SSS) data are collected during marine surveys.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Identifying and confirming debris (e.g., lost fishing gear, containers, other man-made objects) is slow and complex.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Many hazardous objects remain undetected, posing risks to navigation, marine life, coastal communities and marine operations.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>There is a need for an automated solution to detect and help locate underwater debris and anomalies from SSS imagery.</span>
                </div>
              </div>
            </div>

            {/* 6 Mini Challenge Cards (3x2 Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {/* 1. Time-Consuming */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Time-Consuming</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Large sonar data takes time to analyze.
                  </p>
                </div>
              </div>

              {/* 2. Expert Dependent */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Expert Dependent</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Requires trained analysts.
                  </p>
                </div>
              </div>

              {/* 3. Risk to Navigation */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Risk to Navigation</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Undetected debris can endanger vessels.
                  </p>
                </div>
              </div>

              {/* 4. Disaster Management Relevance */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">Disaster Management Relevance</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Supports safer coasts and faster response.
                  </p>
                </div>
              </div>

              {/* 5. Environmental Impact */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Environmental Impact</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Harms marine ecosystems and wildlife.
                  </p>
                </div>
              </div>

              {/* 6. Economic Losses */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Economic Losses</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Increases operational costs and damages.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real Survey Sonar Inspection & Our Goal */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-2 flex-1 flex flex-col">
              {/* Top Subtitle Bar */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  SIDE-SCAN SONAR (SSS) : REAL SURVEY EXAMPLE
                </span>
                <span className="bg-slate-900 text-white text-[10.5px] px-2.5 py-0.5 rounded-full font-medium flex items-center space-x-1.5 shadow-xs">
                  <BarChart2 className="w-3 h-3 text-amber-400" />
                  <span>Actual Sonar Imagery</span>
                </span>
              </div>

              {/* Complete, Uncropped Sonar Image */}
              <div className="w-full">
                <img
                  src="/sonar-survey-sample.png"
                  alt="Side-Scan Sonar Real Survey Example showing detected fishing net and man-made debris"
                  className="w-full h-auto object-contain rounded-2xl block shadow-md"
                />
              </div>
            </div>

            {/* Bottom Target Goal Card - positioned at bottom in the same row as Economic Losses */}
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center space-x-3.5 shadow-xs mt-auto">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-blue-600 tracking-widest uppercase">
                  OUR GOAL
                </div>
                <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed mt-0.5">
                  Automate the <span className="text-blue-700 font-bold">detection and localization</span> of underwater debris and anomalies from Side-Scan Sonar imagery.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Step End-to-End Pipeline: From Sonar Upload to Actionable Insights */}
        <div className="space-y-10 pt-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">
              HOW VAINATEYA WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
              From Sonar Upload to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                Actionable Insights
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              A simple, end-to-end pipeline to detect, review and map marine debris from Side-Scan Sonar imagery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-3 relative items-stretch">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative flex flex-col items-center justify-between bg-white px-4 py-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 group"
                >
                  {/* Top Step Pill Badge */}
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border shadow-xs ${step.badgeStyle}`}
                  >
                    {step.num}
                  </div>

                  {/* Icon Square */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border mt-2 mb-3.5 transition-transform group-hover:scale-105 ${step.iconStyle}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Step Title */}
                  <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk'] text-center mb-1.5 leading-snug">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-[11.5px] text-slate-500 text-center leading-relaxed mb-4 flex-1">
                    {step.desc}
                  </p>

                  {/* Bottom Pill */}
                  <div
                    className={`w-full py-1.5 px-2 rounded-xl text-[10.5px] font-semibold font-mono text-center border mt-auto ${step.tagStyle}`}
                  >
                    {step.bottomTag}
                  </div>

                  {/* Curved Connector Arrow for Large Screens (pointing to the next card) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3.5 top-[38%] z-20 pointer-events-none w-7 h-5 text-blue-500">
                      <svg viewBox="0 0 32 20" fill="none" className="w-full h-full">
                        <path
                          d="M2 14 C10 20, 18 3, 28 8"
                          stroke="#3B82F6"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                        <path
                          d="M23 4.5 L28 8 L24 12"
                          stroke="#3B82F6"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
