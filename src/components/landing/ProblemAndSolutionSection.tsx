import { Waves, ShieldAlert, Cpu, MapPin, Eye, CheckCircle2 } from 'lucide-react';

export function ProblemAndSolutionSection() {
  const steps = [
    {
      num: '01',
      title: 'Acoustic Waterfall Ingestion',
      desc: 'Ingestion of raw Side-Scan Sonar (SSS) acoustic returns from towfish, AUVs, or hydrographic survey vessels operating at 455/900 kHz.',
      icon: Waves,
      tag: 'Zero-Visibility Penetration',
      badgeColor: 'text-blue-700 border-blue-200 bg-blue-50'
    },
    {
      num: '02',
      title: 'Acoustic Shadow Geometry',
      desc: 'Applies trigonometric shadow relief calculation: H = (L * H_sensor) / (R + L). Rejects 38%+ false positives caused by natural seabed sand ripples.',
      icon: Cpu,
      tag: 'False Positive Reducer',
      badgeColor: 'text-emerald-700 border-emerald-200 bg-emerald-50'
    },
    {
      num: '03',
      title: 'YOLOv12 Target Inference',
      desc: 'Fine-tuned deep neural network identifies ghost nets, intermodal cargo containers, chemical drums, and tire dumps with 94.8% mAP confidence.',
      icon: Eye,
      tag: 'Real-Time Edge Inference',
      badgeColor: 'text-amber-700 border-amber-200 bg-amber-50'
    },
    {
      num: '04',
      title: 'Geotagged Fleet Recovery',
      desc: 'Automated GPS extraction (WGS 84), depth calculation, and dynamic dispatch routing for coast guard, salvage vessels, and cleanup NGOs.',
      icon: MapPin,
      tag: 'Actionable Coordinates',
      badgeColor: 'text-purple-700 border-purple-200 bg-purple-50'
    },
  ];

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Problem Statement Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>The Benthic Marine Crisis</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
              Why Traditional Optical Cameras Fail Underwater
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Standard optical cameras are rendered completely blind beyond 5-10 meters depth due to turbidity, light absorption, and suspended particulate matter.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Over <b>640,000 tons of ghost fishing gear</b> and hazardous cargo containers are abandoned on the seabed every year, silently trapping marine life and obstructing vital commercial shipping channels.
            </p>

            <div className="pt-2 space-y-2 text-xs font-mono text-slate-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Side-Scan Sonar illuminates through turbid zero-light water</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Automated AI eliminates manual inspection of gigabytes of waterfall logs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Instant geotagging enables rapid salvage vessel coordination</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-md space-y-4 relative overflow-hidden">
              <h3 className="text-sm font-mono uppercase text-rose-700 font-bold tracking-wider">
                Threat Matrix: Subsea Debris Impact
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] uppercase">Ghost Fishing Nets</div>
                  <div className="text-rose-600 font-bold text-lg mt-1">46% of Ocean Macroplastics</div>
                  <p className="text-[10px] text-slate-500 mt-1">Traps pelagic species for centuries</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] uppercase">Lost Cargo Containers</div>
                  <div className="text-amber-600 font-bold text-lg mt-1">1,382+ Lost / Year</div>
                  <p className="text-[10px] text-slate-500 mt-1">Severe navigational collision risk</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] uppercase">Toxic Chemical Drums</div>
                  <div className="text-orange-600 font-bold text-lg mt-1">Persistent Leaching</div>
                  <p className="text-[10px] text-slate-500 mt-1">Heavy metals & corrosive chemicals</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-[10px] uppercase">Seafloor Tire Dumps</div>
                  <div className="text-emerald-600 font-bold text-lg mt-1">Toxic Leachate</div>
                  <p className="text-[10px] text-slate-500 mt-1">Microplastic fiber disintegration</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Solution Pipeline */}
        <div className="space-y-8 pt-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-mono text-blue-700 font-bold uppercase tracking-widest">
              Automated Detection Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
              The 4-Stage Sonar Intelligence Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 relative group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-blue-600 transition-colors">
                      {step.num}
                    </span>
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block mb-2 ${step.badgeColor}`}>
                    {step.tag}
                  </span>

                  <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
