import React from 'react';
import { Menu, Calculator, History, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  return (
    <>
      <aside 
        className={`fixed md:relative flex flex-col bg-[#1e2329] border-r border-[#2b3139] transition-all duration-300 z-50 h-full shadow-2xl ${isOpen ? 'w-64 left-0' : 'w-0 -left-64 md:left-0 md:w-0 overflow-hidden border-r-0'}`}
      >
        <div className="h-[76px] flex items-center justify-between px-4 border-b border-[#2b3139]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#fcd535] rounded-[4px] flex items-center justify-center text-[#181a20] font-bold">B</div>
            <span className="ml-3 font-bold text-[#eaecef] tracking-widest uppercase whitespace-nowrap">Binance</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#707a8a] hover:text-[#eaecef] cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 space-y-2 px-2 overflow-y-auto w-64">
          <button className={`w-full flex items-center p-3 rounded-[6px] transition-colors justify-start bg-[#2b3139] text-[#fcd535] cursor-pointer`}>
            <Calculator className="w-5 h-5 shrink-0" />
            <span className="ml-3 text-[14px] font-medium whitespace-nowrap">Trade Desk</span>
          </button>
          
          <button className={`w-full flex items-center p-3 rounded-[6px] transition-colors justify-start text-[#707a8a] hover:bg-[#2b3139] hover:text-[#eaecef] cursor-pointer`}>
            <History className="w-5 h-5 shrink-0" />
            <span className="ml-3 text-[14px] font-medium whitespace-nowrap">History</span>
          </button>
        </nav>
        
        <div className="p-2 border-t border-[#2b3139] w-64">
          <button className={`w-full flex items-center p-3 rounded-[6px] transition-colors justify-start text-[#707a8a] hover:bg-[#2b3139] hover:text-[#eaecef] cursor-pointer`}>
            <Settings className="w-5 h-5 shrink-0" />
            <span className="ml-3 text-[14px] font-medium whitespace-nowrap">Settings</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
