import React from 'react';
import { Download } from 'lucide-react';
import logo from '../assests/Golden-Terry-Towels.png';

export default function Header({ onDownloadExcel, totalSavedCount = 0 }) {
  return (
    <header className="sticky top-0 z-50 h-16 bg-paper/80 backdrop-blur-md border-b border-hairline transition-all">
      <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 cursor-pointer py-1">
            <img
              src={logo}
              alt="Golden Terry Towels Logo"
              className="h-9 w-auto object-contain"
            />
          </a>

          <div className="h-5 w-px bg-hairline hidden md:block"></div>

          {/* Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-stone font-sans font-medium">
            <a href="#uploader" className="hover:text-obsidian transition-colors">
              Scanner
            </a>
            <a href="#review" className="hover:text-obsidian transition-colors">
              Verification
            </a>
            <a href="#database" className="hover:text-obsidian transition-colors">
              Database
            </a>
          </nav>
        </div>

        {/* Action Cluster */}
        <div className="flex items-center gap-3">
          {totalSavedCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-hairline bg-pure text-[11px] font-mono text-stone">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-green"></span>
              <span>{totalSavedCount} Saved</span>
            </div>
          )}

          <button
            onClick={onDownloadExcel}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-hairline bg-pure text-xs font-sans text-obsidian hover:bg-hairline/40 transition-all shadow-subtle-2 font-medium"
          >
            <Download className="w-3.5 h-3.5 text-obsidian" />
            <span>Download Excel</span>
          </button>
        </div>

      </div>
    </header>
  );
}
