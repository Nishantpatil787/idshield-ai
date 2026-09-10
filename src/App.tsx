import React, { useState, useEffect } from 'react';
import { Navbar, NavPage } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { VerifyDocumentPage } from './pages/VerifyDocumentPage';
import { ScreeningResultPage } from './pages/ScreeningResultPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ScreeningHistoryPage } from './pages/ScreeningHistoryPage';
import { AboutPage } from './pages/AboutPage';
import { ScreeningRecord } from './types';
import { ScreeningService } from './services/api';

export function App() {
  const [currentPage, setCurrentPage] = useState<NavPage | 'result'>('home');
  const [activeScreening, setActiveScreening] = useState<ScreeningRecord | null>(null);

  // Initialize with the first demo screening record as active for quick inspection
  useEffect(() => {
    const initDefaultScreening = async () => {
      const records = await ScreeningService.getScreenings();
      if (records.length > 0) {
        setActiveScreening(records[0]);
      }
    };
    initDefaultScreening();
  }, []);

  const handleViewScreening = async (screeningId: string) => {
    const record = await ScreeningService.getScreeningById(screeningId);
    if (record) {
      setActiveScreening(record);
      setCurrentPage('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScreeningComplete = (newScreening: ScreeningRecord) => {
    setActiveScreening(newScreening);
    setCurrentPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: NavPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* ProofX Top Navigation */}
      <Navbar
        currentPage={currentPage === 'result' ? 'verify' : currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}

        {currentPage === 'verify' && (
          <VerifyDocumentPage
            onScreeningComplete={handleScreeningComplete}
          />
        )}

        {currentPage === 'result' && (
          <ScreeningResultPage
            screening={activeScreening}
            onNavigateToNew={() => handleNavigate('verify')}
            onNavigateToHistory={() => handleNavigate('history')}
          />
        )}

        {currentPage === 'how_it_works' && (
          <HowItWorksPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'history' && (
          <ScreeningHistoryPage
            onViewScreening={handleViewScreening}
            onNavigateToNew={() => handleNavigate('verify')}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}
      </main>

      {/* ProofX Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
export default App;
