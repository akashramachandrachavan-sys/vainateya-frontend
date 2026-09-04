import React, { useState } from 'react';
import type { UserRole } from '../../types';
import confetti from 'canvas-confetti';
import {
  Anchor,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Waves,
  Cpu,
  Compass
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  // Read initial mode from URL search query: ?mode=signin or ?mode=signup
  const [isSignUp, setIsSignUp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode');
      return mode !== 'signin' && mode !== 'login';
    }
    return true;
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [role, setRole] = useState<UserRole>('Marine Scientist');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleModeToggle = (signUp: boolean) => {
    setIsSignUp(signUp);
    setErrorMessage('');
    setSuccessMessage('');
    // Update URL query string without reloading page
    const newUrl = `${window.location.pathname}?mode=${signUp ? 'signup' : 'signin'}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password || (isSignUp && !name)) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    // Simulate authentication process
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(isSignUp ? 'Account registered successfully! Redirecting...' : 'Authenticated successfully! Redirecting...');

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Redirect to Naadvedh dashboard
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    }, 700);
  };

  const roleOptions: { role: UserRole; desc: string; icon: typeof Waves }[] = [
    { role: 'Marine Scientist', desc: 'Acoustic survey & research analysis', icon: Waves },
    { role: 'Port & Harbor Authority', desc: 'Fairway navigation & channel safety', icon: Compass },
    { role: 'Cleanup Fleet Coordinator', desc: 'Salvage operations & debris recovery', icon: Anchor },
    { role: 'Environmental Researcher', desc: 'Benthic habitat & plastic impact', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <a
          href="/index.html"
          className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-slate-700 hover:text-blue-600 transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-50 border border-slate-200 group-hover:border-blue-200 text-slate-700 group-hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Home</span>
        </a>

        <div className="flex items-center space-x-2.5">
          <img
            src="/vainateya-symbol.png"
            alt="VAINATEYA Logo"
            className="w-8 h-8 object-contain"
          />
          <div>
            <span className="font-extrabold text-base tracking-wider font-['Space_Grotesk'] text-slate-900 block leading-tight">
              VAINATEYA
            </span>
            <span className="text-[9px] font-mono text-slate-500 italic block leading-tight">
              When human vision ends, perception must continue.
            </span>
          </div>
        </div>

        {/* Empty spacer on right for balanced flex centering */}
        <div className="w-28 hidden sm:block"></div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">

          {/* Left Column: Visuals, Benefits & Trust (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-8 lg:p-10 text-white flex flex-col justify-center relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none"></div>

            <div className="space-y-6 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Space_Grotesk'] leading-tight">
                Secure Portal for Oceanographic &amp; Harbor Operations
              </h2>

              <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                Connect your hydrographic survey logs, side-scan sonar waterfall data, and coordinate salvage recovery operations in real-time.
              </p>

              {/* Pillars */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-blue-200 shrink-0">
                    <Waves className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dual-Frequency Sonar</h4>
                    <p className="text-[11px] text-blue-100/90 leading-normal">Processes 455/900 kHz acoustic waterfall swaths with zero-visibility penetration.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-blue-200 shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">YOLOv12 SSS Inference</h4>
                    <p className="text-[11px] text-blue-100/90 leading-normal">Classifies ghost nets, drums, and containers with 94.8% detection accuracy.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-blue-200 shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Geotagged Fleet Recovery</h4>
                    <p className="text-[11px] text-blue-100/90 leading-normal">Instant WGS 84 GPS coordinate extraction for cleanup and salvage vessels.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5">

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleModeToggle(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${!isSignUp
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${isSignUp
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* Form Title & Subtitle */}
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold font-['Space_Grotesk'] text-slate-900">
                {isSignUp ? 'Create your Operator Account' : 'Sign In to your Account'}
              </h3>
              <p className="text-xs text-slate-500">
                {isSignUp
                  ? 'Register to access side-scan sonar image telemetry & AI detection models'
                  : 'Enter your hydrographic credentials to access detection studio and ocean map'}
              </p>
            </div>

            {/* Notifications / Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Aryan Sharma"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@maritime.gov.in or scientist@nio.res.in"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  {!isSignUp && (
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password recovery link sent to official email.'); }} className="text-[11px] font-mono text-blue-600 hover:underline">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Designated Role
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {roleOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = role === opt.role;
                        return (
                          <div
                            key={opt.role}
                            onClick={() => setRole(opt.role)}
                            className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center space-x-2.5 ${isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                              }`}
                          >
                            <div className={`p-1.5 rounded-md shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold leading-tight truncate">{opt.role}</h5>
                              <p className="text-[10px] text-slate-500 leading-tight truncate">{opt.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Organization / Authority
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. Indian Coast Guard Hydrographic Unit"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? 'Processing...'
                    : isSignUp
                      ? 'Complete Registration & Enter'
                      : 'Sign In to Hydrographic Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Toggle Note */}
            <div className="pt-2 text-center text-xs text-slate-500">
              {isSignUp ? (
                <p>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeToggle(false)}
                    className="text-blue-600 font-bold hover:underline ml-1"
                  >
                    Sign In instead
                  </button>
                </p>
              ) : (
                <p>
                  Don't have credentials yet?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeToggle(true)}
                    className="text-blue-600 font-bold hover:underline ml-1"
                  >
                    Create an account
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="w-full bg-white border-t border-slate-200 px-4 py-4 text-center text-xs font-mono text-slate-500">
        &copy; {new Date().getFullYear()} VAINATEYA &bull; Smart India Hackathon Prototype (PS 26057) &bull; Ministry of Earth Sciences (MoES)
      </footer>
    </div>
  );
};
