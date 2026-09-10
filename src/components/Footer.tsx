import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import { NavPage } from './Navbar';
import { DocShieldLogo } from './DocShieldLogo';

interface FooterProps {
  onNavigate: (page: NavPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('home')}
              className="cursor-pointer group select-none inline-block"
            >
              <DocShieldLogo size="md" showText={true} />
            </div>
            
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              DocShield is an AI-powered document verification platform demonstrating multimodal document tampering detection, OCR parsing, and biometric identity verification for passports, visas, and national IDs.
            </p>

            <div className="pt-2 text-xs text-slate-400">
              <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                DocShield v2.0
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('verify')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  Verify Document
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('how_it_works')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('history')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  History
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('about')} 
                  className="hover:text-blue-600 transition-colors"
                >
                  About
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Supported Documents
            </h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Passports (ICAO TD3)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Travel Visas</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>National IDs</span>
              </li>
              <li className="pt-2 text-xs text-slate-400">
                <span>Privacy by Design</span>
              </li>
            </ul>
          </div>

          {/* Contact & Vision */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Contact &amp; Research
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs truncate">contact@docshield.ai</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs">Document Security Research Lab</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-semibold text-blue-700 border-l-2 border-blue-600 pl-2">
                "Securing Documents. Verifying Trust."
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Academic Prototype Disclosure */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DocShield. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Academic Prototype — This demonstration does not connect to real government databases.
          </p>
        </div>
      </div>
    </footer>
  );
};
