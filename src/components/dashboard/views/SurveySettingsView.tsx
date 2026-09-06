import React from 'react';

interface SurveySettingsViewProps {
  profileFullName: string;
  setProfileFullName: (name: string) => void;
  profileRole: string;
  profileEmail: string;
  setProfileEmail: (email: string) => void;
  profileOrg: string;
  setProfileOrg: (org: string) => void;
  profilePhone: string;
  setProfilePhone: (phone: string) => void;
  profileTeam: string;
  setProfileTeam: (team: string) => void;
  profileLocation: string;
  setProfileLocation: (loc: string) => void;
  profileBio: string;
  setProfileBio: (bio: string) => void;
  isProfileSaved: boolean;
  setIsProfileSaved: (saved: boolean) => void;
}

export const SurveySettingsView: React.FC<SurveySettingsViewProps> = ({
  profileFullName,
  setProfileFullName,
  profileRole,
  profileEmail,
  setProfileEmail,
  profileOrg,
  setProfileOrg,
  profilePhone,
  setProfilePhone,
  profileTeam,
  setProfileTeam,
  profileLocation,
  setProfileLocation,
  profileBio,
  setProfileBio,
  isProfileSaved,
  setIsProfileSaved,
}) => {
  return (
    <main className="p-3.5 sm:p-4 lg:p-5 space-y-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Space_Grotesk']">
          Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage your account, preferences, and system settings.
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4 max-w-4xl">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Space_Grotesk']">
              Profile Information
            </h2>
            <p className="text-xs text-slate-500">
              Update your personal and organization details.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsProfileSaved(true);
              setTimeout(() => setIsProfileSaved(false), 3000);
            }}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {isProfileSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* Section: Account Details */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
            Account Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
            {/* Left Inputs (8 cols) */}
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileFullName}
                  onChange={(e) => setProfileFullName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                  Role
                </label>
                <input
                  type="text"
                  value={profileRole}
                  readOnly
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                  Organization
                </label>
                <input
                  type="text"
                  value={profileOrg}
                  onChange={(e) => setProfileOrg(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Right Profile Picture (4 cols) */}
            <div className="md:col-span-4 p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col items-center justify-center space-y-2 text-center">
              <span className="text-[10.5px] font-mono font-bold text-slate-600 self-start">
                Profile Picture
              </span>
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {profileFullName.charAt(0) || 'A'}
              </div>
              <button
                type="button"
                className="px-3.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 shadow-2xs cursor-pointer"
              >
                Change Photo
              </button>
              <span className="text-[9.5px] font-mono text-slate-400">JPG, PNG up to 2MB</span>
            </div>
          </div>
        </div>

        {/* Section: Organization / Team */}
        <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Space_Grotesk']">
            Organization / Team
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                Team Name
              </label>
              <input
                type="text"
                value={profileTeam}
                onChange={(e) => setProfileTeam(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                Location
              </label>
              <input
                type="text"
                value={profileLocation}
                onChange={(e) => setProfileLocation(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10.5px] font-mono font-bold text-slate-600 mb-0.5">
                Bio (Optional)
              </label>
              <textarea
                rows={2}
                value={profileBio}
                maxLength={200}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              ></textarea>
              <div className="text-right text-[10px] font-mono text-slate-400">
                {profileBio.length}/200
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
