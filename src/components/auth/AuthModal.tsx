import React, { useState } from 'react';
import type { UserProfile, UserRole } from '../../types';
import { Anchor, Mail, Lock, User, Building, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signup',
}) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(initialMode === 'signup');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [organization, setOrganization] = useState<string>('National Institute of Oceanography');
  const [role, setRole] = useState<UserRole>('Marine Scientist');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    const user: UserProfile = {
      name: isSignUp ? name : (name || 'Dr. Aryan Sharma'),
      email,
      role,
      organization: organization || 'Indian Coast Guard Hydrographic Unit',
    };

    onSuccess(user);
  };

  // 1-Click Fast Demo Login for Hackathon Judges & Evaluators
  const handleDemoLogin = (selectedRole: UserRole) => {
    const demoUser: UserProfile = {
      name: selectedRole === 'Port & Harbor Authority' ? 'Commander R. Nair' : 'Dr. Aditi Rao',
      email: 'demo.evaluator@vainateya.gov.in',
      role: selectedRole,
      organization: 'Maritime Safety & Ocean AI Directorate',
    };
    onSuccess(demoUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative text-slate-900">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4 text-center relative border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 text-sm rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-3 shadow-sm">
            <Anchor className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] tracking-tight">
            {isSignUp ? 'Create VAINATEYA Account' : 'Welcome Back, Officer'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {isSignUp
              ? 'Join the autonomous side-scan sonar marine debris detection network'
              : 'Authenticate using your hydrographic survey credentials'}
          </p>
        </div>

        {/* Quick Demo Access Strip */}
        <div className="bg-blue-50/80 px-6 py-2.5 border-b border-blue-100 flex items-center justify-between text-xs">
          <span className="flex items-center space-x-1.5 text-blue-800 font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Hackathon Quick Access:</span>
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDemoLogin('Marine Scientist')}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 font-mono text-[11px] font-bold shadow-sm transition-all"
            >
              Demo Scientist
            </button>
            <button
              onClick={() => handleDemoLogin('Port & Harbor Authority')}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-bold shadow-sm transition-all"
            >
              Demo Port Auth
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1.5 font-bold">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1.5 font-bold">
              Official Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="scientist@nio.res.in or officer@port.gov.in"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1.5 font-bold">
              Access Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1.5 font-bold">
                  Maritime Role & Designation
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                >
                  <option value="Marine Scientist">Marine Scientist / Oceanographer</option>
                  <option value="Port & Harbor Authority">Port & Harbor Authority Officer</option>
                  <option value="Cleanup Fleet Coordinator">Cleanup Fleet Coordinator / Salvage NGO</option>
                  <option value="Environmental Researcher">Environmental Researcher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1.5 font-bold">
                  Organization / Agency
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. National Institute of Oceanography (NIO)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center space-x-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25"
          >
            <span>{isSignUp ? 'Register & Initialize Dashboard' : 'Authenticate & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-600">
          {isSignUp ? (
            <p>
              Already have hydrographic access?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-blue-600 font-bold hover:underline ml-1"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Need operational credentials?{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-blue-600 font-bold hover:underline ml-1"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
