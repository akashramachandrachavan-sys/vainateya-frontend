import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { SplashScreen } from './components/landing/SplashScreen';
import type { UserProfile } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 relative">
      {/* Intro Animation / Splash Screen on site visit */}
      {showSplash && (
        <SplashScreen
          duration={3500}
          onComplete={() => setShowSplash(false)}
        />
      )}

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Landing View Area */}
      <main className="flex-1">
        <LandingPage />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
