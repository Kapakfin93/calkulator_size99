import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, TrendingUp, TrendingDown, Info, Clock } from 'lucide-react';
import { MarketSentiment } from '../hooks/useMarketData';
import { LunarPhaseData } from '../hooks/useLunarPhase';

interface HeaderProps {
  currentTime: string;
  marketSession?: string;
  marketSentiment: MarketSentiment | null;
  lunarData?: LunarPhaseData | null;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (isOpen: boolean) => void;
}

export default function Header({ currentTime, marketSession, marketSentiment, lunarData, isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const [showSentimentModal, setShowSentimentModal] = useState<boolean>(false);
  const [showLunarDropdown, setShowLunarDropdown] = useState<boolean>(false);

  return (
    <>
      {/* TOP STATUS BAR & HEADER */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#2D3139] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCD535] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FCD535]"></span>
            </span>
            <p className="text-[10px] font-mono tracking-widest text-[#FCD535] font-bold uppercase">PRO RISK ENGINE</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif italic font-semibold tracking-wide text-white">
            Terminal <span className="text-[#FCD535] font-sans uppercase text-xs not-italic ml-1.5 opacity-90 tracking-[0.15em] font-bold">Risk Control & Position Sizing</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1.5 font-sans">
            Kalkulator presisi futures isolated margin untuk kelayakan perdagangan (RRR) & mitigasi likuidasi dini.
          </p>
        </div>

        {/* Status Indicators Row */}
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* Badge 1: Fear & Greed */}
          {marketSentiment?.fngValue && (
            <div className="flex items-center gap-2 text-[#94A3B8] bg-[#111419] border border-[#2D3139] rounded px-3 py-2">
              <Activity className={`w-3.5 h-3.5 ${
                Number(marketSentiment.fngValue) <= 45 ? 'text-rose-500' : Number(marketSentiment.fngValue) >= 55 ? 'text-emerald-500' : 'text-amber-500'
              }`} />
              <span className="font-semibold text-[#E2E8F0]">{marketSentiment.fngValue}</span>
              <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${
                Number(marketSentiment.fngValue) <= 45 ? 'text-rose-500' : Number(marketSentiment.fngValue) >= 55 ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {marketSentiment.fngLabel} 
                <span className="hidden sm:inline">
                  {Number(marketSentiment.fngValue) <= 45 ? '(Down)' : Number(marketSentiment.fngValue) >= 55 ? '(Up)' : ''}
                </span>
              </span>
            </div>
          )}

          {/* Badge 2: L/S Ratio */}
          {marketSentiment?.lsRatio && (
            <div className="flex items-center gap-2 text-[#94A3B8] bg-[#111419] border border-[#2D3139] rounded px-3 py-2">
              {Number(marketSentiment.lsRatio) > 1 ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className="font-semibold text-[#E2E8F0]">L/S {marketSentiment.lsRatio}</span>
              <span className={`text-[10px] uppercase font-bold ${Number(marketSentiment.lsRatio) > 1 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <span className="hidden sm:inline">
                  {Number(marketSentiment.lsRatio) > 1 ? '(Long Heavy)' : '(Short Heavy)'}
                </span>
                <span className="inline sm:hidden">
                  {Number(marketSentiment.lsRatio) > 1 ? '(L)' : '(S)'}
                </span>
              </span>
            </div>
          )}
          
          {/* Badge 3: Lunar Phase Button */}
          {lunarData && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowLunarDropdown(!showLunarDropdown);
                  setShowSentimentModal(false);
                }}
                className={`flex items-center gap-1.5 bg-[#111419] border border-[#2D3139] rounded px-3 py-2 cursor-pointer hover:text-white transition-colors text-left outline-none ${
                  lunarData.isReversalZone ? 'text-amber-400 border-amber-500/35' : 'text-[#94A3B8]'
                }`}
                title="Detail Fase Bulan"
              >
                <span className="text-sm">{lunarData.icon}</span>
                <span className="font-semibold leading-none">{lunarData.phaseName}</span>
                {lunarData.isReversalZone && (
                  <span className="text-[9px] uppercase font-bold text-amber-500 animate-pulse hidden sm:inline ml-1">
                    ⚠️ Reversal
                  </span>
                )}
              </button>

              {/* Lunar Dropdown Panel */}
              <AnimatePresence>
                {showLunarDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-[-80px] sm:right-0 top-full mt-3 z-50 w-[280px] sm:w-72 bg-[#1e2329] border border-[#2D3139] p-5 rounded-xl shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#2b3139] pb-2">
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Detail Siklus Lunar</h4>
                      <span className="px-1.5 py-0.5 bg-[#0b0e11] text-[#707a8a] text-[8px] font-bold rounded">ASTRONACCI</span>
                    </div>

                    <div className="flex items-center gap-3.5 bg-[#0b0e11] p-3 rounded-lg border border-[#2b3139]/40">
                      {/* Moon Icon with pulsing glow */}
                      <div className="relative w-12 h-12 rounded-full bg-[#181a20] border border-[#2b3139] flex items-center justify-center text-2xl shrink-0">
                        <div className={`absolute inset-0 rounded-full blur-[6px] opacity-20 ${
                          lunarData.isReversalZone ? 'bg-amber-400' : 'bg-blue-400'
                        }`} />
                        <span className="relative z-10">{lunarData.icon}</span>
                      </div>

                      {/* Phase details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-white truncate">{lunarData.phaseName}</span>
                          <span className="text-[9px] font-mono text-[#707a8a] shrink-0">{lunarData.cyclePercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#1e2329] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              lunarData.isReversalZone ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                            }`}
                            style={{ width: `${lunarData.cyclePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Countdown Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-[#0b0e11]/80 border border-[#2b3139] p-2.5 rounded-lg flex flex-col justify-between">
                        <span className="text-[8px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-0.5">FULL MOON</span>
                        <div className="text-[11px] font-bold text-white leading-tight">{lunarData.daysToFullMoon} hari lagi</div>
                        <span className="text-[9px] text-[#707a8a] font-mono mt-0.5">{lunarData.fullMoonDateStr}</span>
                      </div>
                      <div className="bg-[#0b0e11]/80 border border-[#2b3139] p-2.5 rounded-lg flex flex-col justify-between">
                        <span className="text-[8px] font-mono font-bold text-slate-300 uppercase tracking-widest block mb-0.5">NEW MOON</span>
                        <div className="text-[11px] font-bold text-white leading-tight">{lunarData.daysToNewMoon} hari lagi</div>
                        <span className="text-[9px] text-[#707a8a] font-mono mt-0.5">{lunarData.newMoonDateStr}</span>
                      </div>
                    </div>

                    {/* Reversal zone alert text inside dropdown */}
                    {lunarData.isReversalZone && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] leading-relaxed">
                        ⚠️ <strong>Reversal Zone Hack:</strong> Probabilitas pembalikan tren pasar meningkat. Disarankan waspada volatilitas.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Badge 5: Info Button for Sentiment Conclusion */}
          {(marketSentiment?.fngValue || marketSentiment?.lsRatio) && (
            <div className="bg-[#111419] border border-[#2D3139] rounded p-1.5 flex items-center">
              <button 
                onClick={() => {
                  setShowSentimentModal(!showSentimentModal);
                  setShowLunarDropdown(false);
                }}
                className={`p-1 rounded-[4px] border transition-colors cursor-pointer ${showSentimentModal ? 'bg-[#fcd535]/10 border-[#fcd535]/30 text-[#fcd535]' : 'bg-[#2b3139] border-[#2D3139] text-[#707a8a] hover:text-[#eaecef]'}`}
                title="Lihat Kesimpulan Sentimen"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {/* Badge 4: Clock */}
          <div className="hidden sm:flex items-center gap-2 text-[#94A3B8] bg-[#111419] border border-[#2D3139] rounded px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-[#FCD535]" />
            <div className="flex flex-col">
              <span className="font-semibold text-[#E2E8F0] leading-none">{currentTime || 'UTC'}</span>
              {marketSession && <span className="text-[9px] text-[#FCD535]/80 mt-1 uppercase font-bold">{marketSession}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* SENTIMENT CONCLUSION MODAL (DROPDOWN) */}
      <AnimatePresence>
        {showSentimentModal && marketSentiment && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-5 bg-[#1e2329] border border-[#2D3139] rounded-xl shadow-2xl relative overflow-hidden"
          >
            {(() => {
              const fng = Number(marketSentiment.fngValue || 50);
              const ls = Number(marketSentiment.lsRatio || 1.0);
              let title = "Kondisi Pasar: Netral / Sideways";
              let desc = "Tidak ada indikasi sentimen yang ekstrem. Lanjutkan analisis teknikal biasa.";
              let color = "text-[#94A3B8]";
              let icon = <Activity className="w-8 h-8 text-[#94A3B8] mb-3" />;
              
              if (fng >= 60 && ls >= 1.3) {
                title = "⚠️ RAWAN LONG SQUEEZE (AWAS BANTINGAN!)";
                desc = "Pasar sangat serakah (Greed) dan terlalu banyak ritel yang membuka posisi Buy (Long Heavy). Smart Money/Whales berpotensi memanipulasi harga turun tajam untuk memakan Stop Loss para Longers.";
                color = "text-rose-500";
                icon = <TrendingDown className="w-8 h-8 text-rose-500 mb-3" />;
              } else if (fng <= 40 && ls <= 0.8) {
                title = "⚠️ RAWAN SHORT SQUEEZE (AWAS PAMOKAN!)";
                desc = "Pasar sangat ketakutan (Fear) dan terlalu banyak ritel yang membuka posisi Sell (Short Heavy). Whales berpotensi memompa harga naik tajam untuk melikuidasi para Shorters.";
                color = "text-emerald-500";
                icon = <TrendingUp className="w-8 h-8 text-emerald-500 mb-3" />;
              } else if (fng >= 55) {
                title = "✅ BIAS BULLISH (WASPADA KOREKSI)";
                desc = "Sentimen cenderung optimis, tren naik mendominasi. Namun tetap disiplin gunakan Stop Loss.";
                color = "text-emerald-500";
                icon = <TrendingUp className="w-8 h-8 text-emerald-500 mb-3" />;
              } else if (fng <= 45) {
                title = "📉 BIAS BEARISH (FASE DISTRIBUSI/AKUMULASI)";
                desc = "Sentimen cenderung pesimis, tren turun mendominasi. Cocok untuk strategi short-term sell atau akumulasi spot.";
                color = "text-rose-500";
                icon = <TrendingDown className="w-8 h-8 text-rose-500 mb-3" />;
              }
              
              return (
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className={`p-4 rounded-xl bg-black/20 border border-black/30 flex flex-col items-center justify-center min-w-[120px] text-center`}>
                    {icon}
                    <span className={`text-xs font-bold font-mono tracking-wider ${color}`}>STATUS KINI</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold font-mono uppercase tracking-wide mb-2 ${color}`}>{title}</h3>
                    <p className="text-sm text-[#94A3B8] leading-relaxed font-sans">{desc}</p>
                    
                    <div className="mt-4 pt-4 border-t border-[#2D3139] grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[#707a8a] block mb-1">Logika Fear & Greed (Harian)</span>
                        <span className="text-[#eaecef]">&gt; 60 (Serakah) | &lt; 40 (Takut)</span>
                      </div>
                      <div>
                        <span className="text-[#707a8a] block mb-1">Logika L/S Ratio (1 Hari)</span>
                        <span className="text-[#eaecef]">&gt; 1.3 (Ritel Buy) | &lt; 0.8 (Ritel Sell)</span>
                      </div>
                      <div className="col-span-2 mt-2 pt-2 border-t border-[#2D3139]">
                        <span className="text-[#707a8a] block mb-1">Astronacci (Siklus Reversal)</span>
                        <span className="text-[#eaecef]">Pembalikan tren sering terjadi saat <strong>New Moon 🌑</strong> atau <strong>Full Moon 🌕</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
