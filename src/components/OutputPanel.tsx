import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, ShieldAlert, CheckCircle2, Save, Trash2, Info, RefreshCw, HelpCircle, Menu, Percent, Scale } from 'lucide-react';

export default function OutputPanel({ calc, fib, gauge, direction, entryPrice, slPercent, tpPrice, setTpPrice, triggerNotification, showExplanation, leverage, setLeverage, selectedAsset, lunarData }: any) {
  const { tp1: fibTp1Price, tp2: fibTp2Price, tp3: fibTp3Price, r1: fibTp1Reward, r2: fibTp2Reward, r3: fibTp3Reward } = fib || {};
  const { tp: currentTpPctPosition, sl: slPctPosition, entry: entryPctPosition, tp1: tp1PctPosition, tp2: tp2PctPosition, tp3: tp3PctPosition } = gauge || {};
  
  const isTpCorrectSide = direction === 'Long' ? tpPrice >= entryPrice : tpPrice <= entryPrice;
  const directionalRrr = isTpCorrectSide ? calc?.rrr : -(calc?.rrr || 0);

  return (
    <>
      {/* RIGHT COLUMN: COMPUTED METRICS & RESULTS (7 cols on large screen) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* REAL-TIME DETAILED INFORMATION BOX (Toggled by user click) */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                  id="info-explanation-box"
                >
                  <div className="bg-[#111419] border border-[#2D3139] p-5 rounded text-xs leading-relaxed text-[#94A3B8] space-y-3 shadow-lg">
                    <h3 className="font-bold text-sm text-emerald-500 flex items-center gap-1.5 font-serif italic">
                      <Info className="w-4 h-4 not-italic text-emerald-500" /> Panduan & Rumus Position Sizing
                    </h3>
                    <ul className="list-disc pl-4 space-y-1.5">
                      <li>
                        <strong className="text-white">Max Leverage (Buffer 1%):</strong> Dihitung dengan rumus <code className="font-mono bg-[#0A0B0D] px-1 py-0.5 rounded text-amber-500">100 / (SL + 1)</code>. Buffer 1% ditambahkan ke stop loss sebagai margin aman untuk fluktuasi slippage exchange sebelum likuidasi.
                      </li>
                      <li>
                        <strong className="text-white">Risk Nominal:</strong> Kerugian maksimum yang Anda toleransi dalam USD. <code className="font-mono bg-[#0A0B0D] px-1 py-0.5 rounded">Equity x Risk %</code>.
                      </li>
                      <li>
                        <strong className="text-white">Position Size:</strong> Nilai kontrak posisi total yang harus dibuka untuk menyamakan risiko kerugian. <code className="font-mono bg-[#0A0B0D] px-1 py-0.5 rounded">Risk (USD) / SL %</code>.
                      </li>
                      <li>
                        <strong className="text-white">Margin Minimum (Isolated):</strong> Modal jaminan bersih yang dikunci exchange. <code className="font-mono bg-[#0A0B0D] px-1 py-0.5 rounded">Position Size / Leverage</code>.
                      </li>
                      <li>
                        <strong className="text-white">Harga Likuidasi (Isolated):</strong> Estimasi harga batas jaminan habis. 
                        Long: <code className="font-mono bg-[#0A0B0D] px-1 py-0.5 rounded">Entry x (1 - 1/Leverage)</code> | 
                        Short: <code className="font-mono bg-[#0A0B0D] px-1 py-0.5 rounded">Entry x (1 + 1/Leverage)</code>.
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SIZING METRICS HEADER & SUMMARY CARDS (ROW 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="row-metrics-sizing">
              
              {/* POSITION SIZE CARD */}
              <div className="bg-[#15181E] border border-[#2D3139] p-5 rounded shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 h-0.5 w-full bg-emerald-500/60" />
                <p className="text-[10px] font-bold text-[#64748B] tracking-widest uppercase mb-1 flex items-center gap-1.5">
                  Position Size
                </p>
                <p className="text-2xl font-serif font-bold text-white leading-none tracking-tight">
                  ${calc.positionUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#475569] font-mono mt-2">
                  Total Kontrak Trading
                </p>
              </div>

              {/* REQUIRED MARGIN CARD */}
              <div className="bg-[#15181E] border border-[#2D3139] p-5 rounded shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 h-0.5 w-full bg-emerald-500/30" />
                <p className="text-[10px] font-bold text-[#64748B] tracking-widest uppercase mb-1">
                  Margin (Isolated)
                </p>
                <p className="text-2xl font-serif font-bold text-[#E2E8F0] leading-none tracking-tight">
                  ${calc.marginUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#475569] font-mono mt-2">
                  Jaminan yg Dikunci ({leverage}x)
                </p>
              </div>

              {/* CONTRACT SIZE IN COIN */}
              <div className="bg-[#15181E] border border-[#2D3139] p-5 rounded shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 h-0.5 w-full bg-emerald-500/30" />
                <p className="text-[10px] font-bold text-[#64748B] tracking-widest uppercase mb-1">
                  Ukuran Kontrak ({selectedAsset === 'CUSTOM' ? 'UNIT' : selectedAsset})
                </p>
                <p className="text-2xl font-serif font-bold text-emerald-500 leading-none tracking-tight">
                  {calc.contractBtc.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })}
                </p>
                <p className="text-[10px] text-[#475569] font-mono mt-2">
                  Volume Unit Kripto
                </p>
              </div>

            </div>

            {/* PRICE ACTION TARGETS PROJECTION (ROW 2 - SIDE-BY-SIDE CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="row-targets-projection">
              
              {/* STOP LOSS PROJECTION */}
              <div className="bg-[#1A1214] border border-rose-900/30 p-6 rounded relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-3 opacity-[0.02] text-rose-500 pointer-events-none">
                  <TrendingDown className="w-24 h-24" />
                </div>
                <div className="flex items-center justify-between mb-3 border-b border-rose-950/40 pb-2">
                  <span className="px-2 py-0.5 bg-rose-500/5 border border-rose-500/20 rounded text-[9px] font-bold text-rose-400 tracking-widest uppercase">
                    Stop Loss Target
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono font-medium">SL {slPercent}%</span>
                </div>
                
                <p className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Harga Eksekusi SL</p>
                <p className="text-2xl font-serif font-bold text-white mt-1 mb-4 tracking-tight">
                  ${calc.slPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>

                <div className="space-y-2 border-t border-rose-950/40 pt-4 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Kerugian Bersih:</span>
                    <span className="font-bold text-rose-400">-${calc.riskUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#2D3139]/30">
                    <span className="text-[#64748B]">Harga Likuidasi:</span>
                    <span className={`font-bold ${calc.isLiqBeforeSl ? 'text-rose-400 underline decoration-rose-500/70 decoration-dotted animate-pulse' : 'text-[#E2E8F0]'}`}>
                      ${calc.liqPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* TARGET PROFIT PROJECTION */}
              <div className="bg-[#111A16] border border-emerald-900/30 p-6 rounded relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-3 opacity-[0.02] text-emerald-500 pointer-events-none">
                  <TrendingUp className="w-24 h-24" />
                </div>
                <div className="flex items-center justify-between mb-3 border-b border-emerald-950/40 pb-2">
                  <span className="px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-400 tracking-widest uppercase">
                    Take Profit Target
                  </span>
                  <span className="text-[11px] text-[#64748B] font-mono font-medium">Jarak {calc.tpDistance.toFixed(2)}%</span>
                </div>

                <p className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Harga Eksekusi TP</p>
                <p className="text-2xl font-serif font-bold text-white mt-1 mb-4 tracking-tight">
                  ${tpPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>

                <div className="space-y-2 border-t border-emerald-950/40 pt-4 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748B]">Profit Bersih:</span>
                    <span className="font-bold text-emerald-400">+${calc.rewardUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#2D3139]/30">
                    <span className="text-[#64748B]">Rasio ROI Kontrak:</span>
                    <span className="font-bold text-teal-400">
                      +{(calc.rewardUsd / calc.marginUsd * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* RISK / REWARD RATIO STATS BAR (ROW 3) */}
            <div 
              id="validation-status-card"
              className={`p-5 rounded border transition-all duration-300 shadow-md ${
                calc.isLiqBeforeSl 
                  ? 'bg-[#1A1214] border-rose-500/30'
                  : calc.rrr >= 1.5 
                  ? 'bg-[#111A16] border-emerald-500/35' 
                  : 'bg-[#191511] border-amber-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* RRR Display */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Risk/Reward Ratio (RRR)</p>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className={`text-3xl font-serif font-semibold tracking-tight ${
                      calc.isLiqBeforeSl 
                        ? 'text-rose-400'
                        : calc.rrr >= 1.5 
                        ? 'text-emerald-500' 
                        : 'text-amber-500'
                    }`}>
                      1 : {calc.rrr.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#475569] font-mono">
                      (Minimum ideal 1:1.50)
                    </span>
                  </div>
                </div>

                {/* Validation Badge */}
                <div className="sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">Status Kelayakan</p>
                  {calc.isLiqBeforeSl ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 rounded text-xs font-bold border border-rose-500/20 uppercase tracking-wider">
                      ⚠️ BAHAYA: LIKUIDASI DULUAN
                    </span>
                  ) : calc.rrr >= 1.5 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-bold border border-emerald-500/20 uppercase tracking-wider">
                      ✅ LAYAK EKSEKUSI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded text-xs font-bold border border-amber-500/20 uppercase tracking-wider">
                      ❌ RRR TERLALU RENDAH
                    </span>
                  )}
                </div>

              </div>

              {/* RRR VISUAL GRAPH METER */}
              <div className="mt-4 pt-4 border-t border-[#2D3139]/40">
                <div className="flex justify-between text-[10px] text-[#475569] font-mono mb-1.5">
                  <span>Buruk (&lt;1.0)</span>
                  <span>Sedang (1.0 - 1.5)</span>
                  <span>Sangat Layak (&gt;1.5)</span>
                </div>
                <div className="h-2 w-full bg-[#0A0B0D] rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-rose-500 transition-all duration-300" 
                    style={{ width: `${Math.min(100, (Math.min(calc.rrr, 1) / 3) * 100)}%` }} 
                  />
                  <div 
                    className="h-full bg-amber-500 transition-all duration-300" 
                    style={{ width: `${Math.min(100, (Math.max(0, Math.min(calc.rrr, 1.5) - 1) / 3) * 100)}%` }} 
                  />
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300" 
                    style={{ width: `${Math.min(100, (Math.max(0, calc.rrr - 1.5) / 3) * 100)}%` }} 
                  />
                </div>
              </div>

            </div>

            {/* FIBONACCI GOLDEN RATIO TARGETS PANEL */}
            <div className="bg-[#111419] border border-[#2D3139] p-5 rounded-lg shadow-xl space-y-5" id="fibonacci-golden-ratio-panel">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#0A0B0D] border border-[#2D3139]">
                      <Scale className="w-4 h-4 text-amber-500" />
                    </span>
                    <h3 className="text-xs font-bold font-sans uppercase tracking-widest text-white">
                      Proyeksi Target Profit Golden Ratio
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-bold rounded">
                    FIBONACCI LEVEL
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] font-sans leading-relaxed">
                  Sistem otomatis menghitung level sasaran profit berdasarkan perluasan deret Fibonacci (Rasio Emas) dari stop loss Anda (1R = ${calc.riskUsd?.toFixed(2)} USD).
                </p>
              </div>

              {/* THREE INTERACTIVE CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* TP1 CARD */}
                <div 
                  className="bg-[#0A0B0D] hover:bg-[#15181E] border border-[#2D3139]/60 hover:border-amber-500/30 rounded p-3 flex flex-col justify-between transition group cursor-pointer"
                  onClick={() => {
                    setTpPrice(Number(fibTp1Price.toFixed(2)));
                    triggerNotification("Target Profit disesuaikan ke level Golden Ratio TP1 (1 : 1.618)!", "success");
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider">TP1 (Golden)</span>
                    <span className="text-[8px] text-[#475569] font-mono">1.618R</span>
                  </div>
                  <div className="my-1">
                    <div className="text-xs font-bold text-white font-mono">
                      ${fibTp1Price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium font-sans flex items-center gap-0.5 mt-0.5">
                      +${fibTp1Reward.toLocaleString(undefined, { maximumFractionDigits: 1 })} USD
                    </div>
                  </div>
                  <button className="mt-2 w-full py-1 bg-[#111419] group-hover:bg-amber-500/15 border border-[#2D3139] group-hover:border-amber-500/30 text-[#64748B] group-hover:text-amber-400 text-[9px] rounded transition font-medium">
                    Terapkan TP1
                  </button>
                </div>

                {/* TP2 CARD */}
                <div 
                  className="bg-[#0A0B0D] hover:bg-[#15181E] border border-[#2D3139]/60 hover:border-emerald-500/30 rounded p-3 flex flex-col justify-between transition group cursor-pointer"
                  onClick={() => {
                    setTpPrice(Number(fibTp2Price.toFixed(2)));
                    triggerNotification("Target Profit disesuaikan ke level Golden Ratio TP2 (1 : 2.618)!", "success");
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">TP2 (Golden)</span>
                    <span className="text-[8px] text-[#475569] font-mono">2.618R</span>
                  </div>
                  <div className="my-1">
                    <div className="text-xs font-bold text-white font-mono">
                      ${fibTp2Price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium font-sans flex items-center gap-0.5 mt-0.5">
                      +${fibTp2Reward.toLocaleString(undefined, { maximumFractionDigits: 1 })} USD
                    </div>
                  </div>
                  <button className="mt-2 w-full py-1 bg-[#111419] group-hover:bg-emerald-500/15 border border-[#2D3139] group-hover:border-emerald-500/30 text-[#64748B] group-hover:text-emerald-400 text-[9px] rounded transition font-medium">
                    Terapkan TP2
                  </button>
                </div>

                {/* TP3 CARD */}
                <div 
                  className="bg-[#0A0B0D] hover:bg-[#15181E] border border-[#2D3139]/60 hover:border-teal-500/30 rounded p-3 flex flex-col justify-between transition group cursor-pointer"
                  onClick={() => {
                    setTpPrice(Number(fibTp3Price.toFixed(2)));
                    triggerNotification("Target Profit disesuaikan ke level Golden Ratio TP3 (1 : 3.618)!", "success");
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono font-bold text-teal-400 uppercase tracking-wider">TP3 (Golden)</span>
                    <span className="text-[8px] text-[#475569] font-mono">3.618R</span>
                  </div>
                  <div className="my-1">
                    <div className="text-xs font-bold text-white font-mono">
                      ${fibTp3Price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium font-sans flex items-center gap-0.5 mt-0.5">
                      +${fibTp3Reward.toLocaleString(undefined, { maximumFractionDigits: 1 })} USD
                    </div>
                  </div>
                  <button className="mt-2 w-full py-1 bg-[#111419] group-hover:bg-teal-500/15 border border-[#2D3139] group-hover:border-teal-500/30 text-[#64748B] group-hover:text-teal-400 text-[9px] rounded transition font-medium">
                    Terapkan TP3
                  </button>
                </div>
              </div>

              {/* HIGH FIDELITY PROGRESS SCALE CHART FOR TP1, TP2, TP3 RELATIVE POSITION */}
              <div className="bg-[#0A0B0D] border border-[#2D3139]/50 rounded-lg p-4">
                <p className="text-[9px] font-bold font-sans uppercase tracking-widest text-[#64748B] mb-6 text-center">
                  Garis Progres Target Profit Relatif Terhadap Entry & Stop Loss
                </p>

                <div className="relative pt-6 pb-12 px-2 select-none">
                  {/* Progress Line Track */}
                  <div className="absolute h-1 left-2 right-2 top-1/2 -translate-y-1/2 bg-[#1A1D24] rounded-full overflow-hidden flex">
                    {/* Loss zone (SL to Entry) */}
                    <div 
                      className="h-full bg-rose-500/30"
                      style={{ width: `${entryPctPosition}%` }}
                    />
                    {/* Profit zone (Entry to end) */}
                    <div 
                      className="h-full bg-emerald-500/20"
                      style={{ width: `${100 - entryPctPosition}%` }}
                    />
                  </div>

                  {/* INDICATOR POINTS */}

                  {/* 1. Stop Loss Point */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${slPctPosition}%` }}
                  >
                    <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-[#0A0B0D] shadow-md shadow-rose-500/20" />
                    <span className="absolute -bottom-8 font-mono text-[8px] text-rose-400 font-bold whitespace-nowrap text-center">
                      SL (-1R)
                      <span className="block text-[7px] text-[#475569] font-normal">
                        ${calc.slPrice?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </span>
                    </span>
                  </div>

                  {/* 2. Entry Price Point */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${entryPctPosition}%` }}
                  >
                    <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-[#0A0B0D]" />
                    <span className="absolute -bottom-8 font-mono text-[8px] text-slate-300 font-bold whitespace-nowrap text-center">
                      Entry (0R)
                      <span className="block text-[7px] text-[#475569] font-normal">
                        ${entryPrice?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </span>
                    </span>
                  </div>

                  {/* 3. Golden TP1 Point */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                    style={{ left: `${tp1PctPosition}%` }}
                    onClick={() => {
                      setTpPrice(Number(fibTp1Price.toFixed(2)));
                      triggerNotification("Target Profit disesuaikan ke level Golden Ratio TP1 (1 : 1.618)!", "success");
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-[#0A0B0D] group-hover:scale-125 transition" />
                    <span className="absolute -bottom-8 font-mono text-[8px] text-amber-500 font-bold whitespace-nowrap text-center">
                      TP1 (1.6R)
                      <span className="block text-[7px] text-[#475569] font-normal">
                        ${fibTp1Price?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </span>
                    </span>
                  </div>

                  {/* 4. Golden TP2 Point */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                    style={{ left: `${tp2PctPosition}%` }}
                    onClick={() => {
                      setTpPrice(Number(fibTp2Price.toFixed(2)));
                      triggerNotification("Target Profit disesuaikan ke level Golden Ratio TP2 (1 : 2.618)!", "success");
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0A0B0D] group-hover:scale-125 transition" />
                    <span className="absolute -bottom-8 font-mono text-[8px] text-emerald-400 font-bold whitespace-nowrap text-center">
                      TP2 (2.6R)
                      <span className="block text-[7px] text-[#475569] font-normal">
                        ${fibTp2Price?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </span>
                    </span>
                  </div>

                  {/* 5. Golden TP3 Point */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                    style={{ left: `${tp3PctPosition}%` }}
                    onClick={() => {
                      setTpPrice(Number(fibTp3Price.toFixed(2)));
                      triggerNotification("Target Profit disesuaikan ke level Golden Ratio TP3 (1 : 3.618)!", "success");
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500 border border-[#0A0B0D] group-hover:scale-125 transition" />
                    <span className="absolute -bottom-8 font-mono text-[8px] text-teal-400 font-bold whitespace-nowrap text-center">
                      TP3 (3.6R)
                      <span className="block text-[7px] text-[#475569] font-normal">
                        ${fibTp3Price?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </span>
                    </span>
                  </div>

                  {/* 6. Dynamic current TP Position Pin (Floating Needle pointing down) */}
                  <div 
                    className="absolute top-[5%] -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none"
                    style={{ left: `${currentTpPctPosition}%` }}
                  >
                    <div className="bg-emerald-500 text-slate-950 font-sans font-extrabold text-[8px] tracking-wider px-1.5 py-0.5 rounded shadow-lg shadow-emerald-500/20 whitespace-nowrap uppercase mb-1">
                      TP Aktif ({directionalRrr >= 0 ? `1:${calc.rrr?.toFixed(1)}` : 'Rugi'})
                    </div>
                    {/* Glowing vertical needle */}
                    <div className="w-0.5 h-5 bg-linear-to-b from-emerald-400 to-emerald-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 -mt-0.5 border border-[#0A0B0D] animate-ping absolute top-[15px]" />
                  </div>
                </div>

                <div className="mt-3 text-center border-t border-[#2D3139]/30 pt-2">
                  <span className="text-[10px] text-[#475569] font-mono leading-tight block">
                    *Tip: Klik titik target (TP1, TP2, TP3) pada garis atau tombol di atas untuk menerapkannya langsung ke kalkulator.
                  </span>
                </div>
              </div>
            </div>

          </div>
    </>
  );
}
