import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  User, 
  ArrowRight, 
  FileCheck2,
  HelpCircle,
  History as HistoryIcon,
  Home as HomeIcon,
  Info
} from 'lucide-react';
import { DisclaimerBanner } from './DisclaimerBanner';
import { DocShieldLogo } from './DocShieldLogo';

export type NavPage = 'home' | 'verify' | 'how_it_works' | 'history' | 'about';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: Array<{ id: NavPage; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'verify', label: 'Verify Document', icon: FileCheck2 },
    { id: 'how_it_works', label: 'How It Works', icon: HelpCircle },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Academic Prototype Micro-bar */}
      <DisclaimerBanner compact />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNav('home')}
            className="cursor-pointer group select-none"
            title="DocShield Home"
          >
            <DocShieldLogo size="md" showText={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Officer Profile Badge */}
            <div 
              title="Authorized Verification Officer"
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200/70 cursor-pointer transition-colors"
            >
              <User className="w-4 h-4" />
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleNav('verify')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 hover:shadow-md transition-all cursor-pointer"
            >
              <span>Verify Document</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => handleNav('verify')}
              className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold"
            >
              Verify
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span>Officer Console</span>
            </div>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Academic Prototype
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
