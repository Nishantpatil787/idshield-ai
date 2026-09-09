import React, { useState, useEffect } from 'react';
import { ConsoleLayout, NavigationPage } from './layouts/ConsoleLayout';
import { DashboardPage } from './pages/DashboardPage';
import { NewScreeningPage } from './pages/NewScreeningPage';
import { ScreeningResultPage } from './pages/ScreeningResultPage';
import { ScreeningHistoryPage } from './pages/ScreeningHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ScreeningRecord } from './types';
import { ScreeningService } from './services/api';

export function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [activeScreening, setActiveScreening] = useState<ScreeningRecord | null>(null);
  const [activeScreeningId, setActiveScreeningId] = useState<string | null>(null);

  // Initialize with the first demo screening record as active for quick inspection
  useEffect(() => {
    const initDefaultScreening = async () => {
      const records = await ScreeningService.getScreenings();
      if (records.length > 0) {
        setActiveScreening(records[0]);
        setActiveScreeningId(records[0].screeningId);
      }
    };
    initDefaultScreening();
  }, []);

  const handleViewScreening = async (screeningId: string) => {
    const record = await ScreeningService.getScreeningById(screeningId);
    if (record) {
      setActiveScreening(record);
      setActiveScreeningId(record.screeningId);
      setCurrentPage('screening_result');
    }
  };

  const handleScreeningCreated = (newScreening: ScreeningRecord) => {
    setActiveScreening(newScreening);
    setActiveScreeningId(newScreening.screeningId);
    setCurrentPage('screening_result');
  };

  return (
    <ConsoleLayout
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page)}
      activeScreeningId={activeScreeningId}
    >
      {currentPage === 'dashboard' && (
        <DashboardPage
          onNavigateToNewScreening={() => setCurrentPage('new_screening')}
          onViewScreening={handleViewScreening}
          onNavigateToHistory={() => setCurrentPage('history')}
        />
      )}

      {currentPage === 'new_screening' && (
        <NewScreeningPage
          onScreeningCreated={handleScreeningCreated}
          onCancel={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'screening_result' && (
        <ScreeningResultPage
          screening={activeScreening}
          onNavigateToNew={() => setCurrentPage('new_screening')}
          onNavigateToHistory={() => setCurrentPage('history')}
        />
      )}

      {currentPage === 'history' && (
        <ScreeningHistoryPage
          onViewScreening={handleViewScreening}
          onNavigateToNew={() => setCurrentPage('new_screening')}
        />
      )}

      {currentPage === 'settings' && <SettingsPage />}
    </ConsoleLayout>
  );
}

export default App;
