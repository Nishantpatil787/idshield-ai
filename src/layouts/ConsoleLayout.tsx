import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  FileText, 
  Sliders, 
  Terminal, 
  Wifi, 
  UserCheck, 
  Menu, 
  X,
  FileSearch,
  ExternalLink,
  Lock
} from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export type NavigationPage = 'dashboard' | 'new_screening' | 'screening_result' | 'history' | 'settings';

interface ConsoleLayoutProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  children: React.ReactNode;
  activeScreeningId?: string | null;
}

export const ConsoleLayout: React.FC<ConsoleLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
  activeScreeningId,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: Array<{
    id: NavigationPage;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
    disabled?: boolean;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_screening', label: 'New Screening', icon: PlusCircle, badge: 'INTAKE' },
    { 
      id: 'screening_result', 
      label: 'Screening Result', 
      icon: FileSearch,
      badge: activeScreeningId ? activeScreeningId.slice(-4) : 'VIEW'
    },
    { id: 'history', label: 'Screening History', icon: History },
    { id: 'settings', label: 'System & Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Academic Disclaimer Sub-Bar */}
      <DisclaimerBanner compact />

      {/* Main Security Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo & Identity */}
          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 group-hover:border-sky-500/50 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white font-mono">
                  DOCSHIELD
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80 uppercase font-semibold">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                FAKE ID & TRAVEL DOCUMENT SCREENING CONSOLE
              </p>
            </div>
          </div>
        </div>

        {/* Console Telemetry & Status */}
        <div className="flex items-center gap-3 md:gap-5 font-mono text-xs">
          {/* UTC Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>{currentTime || 'SYNCHRONIZING...'}</span>
          </div>

          {/* Station & Operator */}
          <div className="hidden sm:flex items-center gap-2 text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700 text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>TERM-3-SEC-A</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">OP #4819</span>
          </div>

          {/* Quick Action Button */}
          {currentPage !== 'new_screening' && (
            <button
              onClick={() => onNavigate('new_screening')}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs px-3 py-1.5 rounded font-semibold transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Screening</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex">
        {/* Left Navigation Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-slate-900/95 border-r border-slate-800 pt-24 lg:pt-4 px-3 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
            ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          `}
        >
          <div className="space-y-4">
            <div className="px-3 py-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold tracking-wider">
                SCREENING MODULES
              </span>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-md font-mono text-xs font-medium transition-colors text-left
                      ${
                        isActive
                          ? 'bg-sky-950/70 text-sky-200 border border-sky-800/80 font-semibold shadow-inner'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          isActive
                            ? 'bg-sky-800/60 text-sky-100 border border-sky-700'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Target Document Types Supported Info */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">
                Supported Document Classes
              </span>
              <ul className="text-[11px] font-mono text-slate-400 space-y-1">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Passports (ICAO 9303)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Passports (ICAO 9303)
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Visas & Travel Authorizations
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  National ID Cards
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar Footer telemetry */}
          <div className="pb-4 space-y-2">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>AI Pipeline</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>OCR / MRZ Engine</span>
                <span>v1.2 (Active)</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono text-center">
              Security Console UI • Build 2026.09
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-slate-950 p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
