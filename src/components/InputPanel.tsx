import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, ShieldAlert, CheckCircle2, Save, Trash2, Info, RefreshCw, HelpCircle, Menu, Percent, Scale } from 'lucide-react';

export default function InputPanel({ direction, setDirection, selectedAsset, setSelectedAsset, equity, setEquity, riskPercent, setRiskPercent, slPercent, setSlPercent, leverage, setLeverage, entryPrice, setEntryPrice, tpPrice, setTpPrice, calc, showExplanation, setShowExplanation, ASSET_PRESETS, handleAssetSelect, triggerNotification, setTpByRrr, saveCurrentSetup, lunarData }: any) {
  return (
    <>
      {/* LEFT COLUMN: PARAMETER SETUP (5 cols on large screen) */}
          <div className="lg:col-span-5 space-y-6" id="panel-inputs">
            
            {/* DIRECTION SEGMENTED SWITCH */}
            <div className="flex gap-2">
              <button
                id="btn-long"
                onClick={() => {
                  setDirection('Long');
                  const preset = ASSET_PRESETS.find(a => a.symbol === selectedAsset);
                  if (preset) setTpPrice(preset.tpLong);
                }}
                className={`flex-1 py-3 rounded-[6px] text-[14px] font-semibold uppercase transition-all duration-200 cursor-pointer ${
                  direction === 'Long' 
                    ? 'bg-[#0ecb81] text-[#ffffff]' 
                    : 'bg-[#1e2329] text-[#707a8a] hover:text-[#eaecef]'
                }`}
              >
                Buy / Long
              </button>

              <button
                id="btn-short"
                onClick={() => {
                  setDirection('Short');
                  const preset = ASSET_PRESETS.find(a => a.symbol === selectedAsset);
                  if (preset) setTpPrice(preset.tpShort);
                }}
                className={`flex-1 py-3 rounded-[6px] text-[14px] font-semibold uppercase transition-all duration-200 cursor-pointer ${
                  direction === 'Short' 
                    ? 'bg-[#f6465d] text-[#ffffff]' 
                    : 'bg-[#1e2329] text-[#707a8a] hover:text-[#eaecef]'
                }`}
              >
                Sell / Short
              </button>
            </div>

            {/* PARAMETER CARD PANEL */}
            <div className="bg-[#1e2329] border border-[#2b3139] p-6 rounded-[12px] relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-5 border-b border-[#2b3139] pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-[#eaecef]">Parameter Setup</h2>
                </div>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-[#707a8a] hover:text-[#eaecef] p-1 rounded transition duration-150 cursor-pointer"
                  title="Tampilkan Info Kalkulasi"
                  id="btn-toggle-info"
                >
                  <HelpCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-6">
                
                {/* CRYPTO PRESETS TRACK */}
                <div>
                  <label className="block text-[12px] font-medium text-[#707a8a] mb-2">Preset Aset Kripto</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ASSET_PRESETS.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => handleAssetSelect(asset.symbol)}
                        className={`py-1.5 text-[12px] font-mono font-medium rounded-[4px] border transition-all duration-200 cursor-pointer ${
                          selectedAsset === asset.symbol
                            ? 'bg-[#2b3139] border-[#fcd535] text-[#fcd535]'
                            : 'bg-[#0b0e11] border-[#2b3139] text-[#707a8a] hover:text-[#eaecef]'
                        }`}
                      >
                        {asset.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                {/* EQUITY INPUT & QUICK ADJUSTS */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[12px] font-medium text-[#707a8a]">
                      Avail Balance (USD)
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      id="input-equity"
                      min="10" 
                      max="10000000"
                      className="w-full bg-[#0b0e11] border border-[#2b3139] focus:border-[#3b82f6] rounded-[6px] py-[10px] pl-[16px] pr-[40px] text-[14px] font-medium text-[#eaecef] outline-none font-mono transition"
                      value={equity} 
                      onChange={(e) => setEquity(Math.max(0, Number(e.target.value)))} 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#707a8a]">USD</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[1000, 5000, 10000, 25000].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setEquity(val);
                          triggerNotification(`Equity diset ke $${val.toLocaleString()}`, 'info');
                        }}
                        className="py-1 text-[12px] font-mono font-medium rounded-[4px] bg-[#2b3139] text-[#eaecef] hover:bg-[#3b424d] transition cursor-pointer"
                      >
                        ${val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RISK PERCENTAGE SLIDER */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[12px] font-medium text-[#707a8a] flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-[#707a8a]" /> Risiko per Trade
                    </label>
                    <span className={`text-[12px] font-mono font-bold px-2 py-0.5 rounded-[4px] ${
                      riskPercent <= 1 ? 'bg-[#2b3139] text-[#0ecb81] border border-[#2b3139]' :
                      riskPercent <= 3 ? 'bg-[#2b3139] text-[#fcd535] border border-[#2b3139]' :
                      'bg-[#2b3139] text-[#f6465d] border border-[#2b3139]'
                    }`}>
                      {riskPercent}% = ${calc.riskUsd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      id="range-risk"
                      min="0.1" 
                      max="10" 
                      step="0.1"
                      className="flex-1 accent-[#fcd535] cursor-pointer h-1 bg-[#0b0e11] rounded appearance-none"
                      value={riskPercent} 
                      onChange={(e) => setRiskPercent(Number(e.target.value))} 
                    />
                    <input
                      type="number"
                      step="0.1"
                      id="input-risk"
                      className="w-16 bg-[#0b0e11] border border-[#2b3139] focus:border-[#3b82f6] text-center rounded-[6px] py-1 text-[14px] font-mono text-[#eaecef] outline-none"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(Math.max(0.1, Math.min(100, Number(e.target.value))))}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[0.5, 1, 2, 5].map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setRiskPercent(p);
                        }}
                        className={`flex-1 py-1 text-[12px] font-mono font-medium rounded-[4px] border transition cursor-pointer ${
                          riskPercent === p
                            ? 'bg-[#2b3139] border-[#fcd535] text-[#fcd535]'
                            : 'bg-[#0b0e11] border-[#2b3139] text-[#707a8a] hover:text-[#eaecef]'
                        }`}
                      >
                        {p}% Risk
                      </button>
                    ))}
                  </div>
                </div>

                {/* STOP LOSS DISTANCE SLIDER */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[12px] font-medium text-[#707a8a] flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-[#707a8a]" /> Jarak Stop Loss (SL)
                    </label>
                    <span className="text-[12px] font-mono font-medium text-[#eaecef] bg-[#0b0e11] border border-[#2b3139] px-2 py-0.5 rounded-[4px]">
                      {slPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      id="range-sl"
                      min="0.5" 
                      max="20" 
                      step="0.1"
                      className="flex-1 accent-[#fcd535] cursor-pointer h-1 bg-[#0b0e11] rounded appearance-none"
                      value={slPercent} 
                      onChange={(e) => setSlPercent(Number(e.target.value))} 
                    />
                    <input
                      type="number"
                      step="0.1"
                      id="input-sl"
                      className="w-16 bg-[#0b0e11] border border-[#2b3139] focus:border-[#3b82f6] text-center rounded-[6px] py-1 text-[14px] font-mono text-[#eaecef] outline-none"
                      value={slPercent}
                      onChange={(e) => setSlPercent(Math.max(0.01, Math.min(100, Number(e.target.value))))}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 5].map((sl) => (
                      <button
                        key={sl}
                        onClick={() => {
                          setSlPercent(sl);
                        }}
                        className={`flex-1 py-1 text-[12px] font-mono font-medium rounded-[4px] border transition cursor-pointer ${
                          slPercent === sl
                            ? 'bg-[#2b3139] border-[#fcd535] text-[#fcd535]'
                            : 'bg-[#0b0e11] border-[#2b3139] text-[#707a8a] hover:text-[#eaecef]'
                        }`}
                      >
                        {sl}% SL
                      </button>
                    ))}
                  </div>
                </div>

                {/* LEVERAGE CONTROL WITH MAX LEVERAGE WARNING */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[12px] font-medium text-[#707a8a]">Leverage (x)</label>
                    <span className={`text-[12px] font-mono font-bold px-2 py-0.5 rounded-[4px] ${
                      calc.isLiqBeforeSl 
                        ? 'bg-[#2b3139] text-[#f6465d] border border-[#f6465d]/50 animate-pulse' 
                        : leverage > calc.maxLeverage 
                        ? 'bg-[#2b3139] text-[#fcd535] border border-[#fcd535]/50' 
                        : 'bg-[#2b3139] text-[#0ecb81] border border-[#0ecb81]/50'
                    }`}>
                      {leverage}x
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      id="range-leverage"
                      min="1" 
                      max="125" 
                      step="1"
                      className="flex-1 accent-[#fcd535] cursor-pointer h-1 bg-[#0b0e11] rounded appearance-none"
                      value={leverage} 
                      onChange={(e) => setLeverage(Number(e.target.value))} 
                    />
                    <input
                      type="number"
                      id="input-leverage"
                      className="w-16 bg-[#0b0e11] border border-[#2b3139] focus:border-[#3b82f6] text-center rounded-[6px] py-1 text-[14px] font-mono text-[#eaecef] outline-none"
                      value={leverage}
                      onChange={(e) => setLeverage(Math.max(1, Math.min(150, Number(e.target.value))))}
                    />
                  </div>
                  
                  {/* Buffer max leverage indicators */}
                  <div className="flex justify-between items-center mt-2.5 bg-[#0b0e11] p-2.5 rounded-[4px] border border-[#2b3139] text-[12px] font-mono leading-none">
                    <span className="text-[#707a8a]">Batas Aman (Buffer 1%):</span>
                    <button 
                      onClick={() => setLeverage(Math.floor(calc.maxLeverage))}
                      className="text-[#fcd535] font-bold hover:underline cursor-pointer bg-transparent border-none"
                    >
                      {calc.maxLeverage.toFixed(1)}x
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1 bg-[#0b0e11]/50 px-2.5 py-1.5 rounded-[4px] border border-[#2b3139] text-[11px] font-mono leading-none">
                    <span className="text-[#707a8a]">Batas Absolut Liq (Limit):</span>
                    <button 
                      onClick={() => setLeverage(Math.floor(calc.absoluteMaxLeverage))}
                      className="text-[#f6465d] font-bold hover:underline cursor-pointer bg-transparent border-none"
                    >
                      {calc.absoluteMaxLeverage.toFixed(1)}x
                    </button>
                  </div>
                </div>

                {/* PRICES CARD FOR ENTRY AND TARGET */}
                <div className="p-4 bg-[#0b0e11] rounded-[8px] border border-[#2b3139] space-y-4">
                  
                  {/* ENTRY PRICE */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[12px] font-medium text-[#707a8a]">Entry Price (USD)</label>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEntryPrice(prev => Number((prev * 0.99).toFixed(2)))}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1e2329] rounded-[4px] border border-[#2b3139] text-[#707a8a] hover:text-[#eaecef] cursor-pointer"
                        >
                          -1%
                        </button>
                        <button 
                          onClick={() => setEntryPrice(prev => Number((prev * 1.01).toFixed(2)))}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1e2329] rounded-[4px] border border-[#2b3139] text-[#707a8a] hover:text-[#eaecef] cursor-pointer"
                        >
                          +1%
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707a8a] text-[14px]">$</span>
                      <input 
                        type="number" 
                        id="input-entry-price"
                        className="w-full bg-[#1e2329] border border-[#2b3139] focus:border-[#3b82f6] rounded-[6px] py-[8px] pl-[24px] pr-[12px] text-[14px] font-medium text-[#eaecef] outline-none font-mono"
                        value={entryPrice} 
                        onChange={(e) => setEntryPrice(Math.max(0.01, Number(e.target.value)))} 
                      />
                    </div>
                  </div>

                  {/* TARGET PRICE (TP) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[12px] font-medium text-[#707a8a]">Target Price (TP)</label>
                      <span className="text-[11px] font-mono text-[#707a8a]">
                        Rasio saat ini: {(Math.abs(entryPrice - tpPrice) / entryPrice / (slPercent / 100)).toFixed(2)}x
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707a8a] text-[14px]">$</span>
                      <input 
                        type="number" 
                        id="input-tp-price"
                        className="w-full bg-[#1e2329] border border-[#2b3139] focus:border-[#3b82f6] rounded-[6px] py-[8px] pl-[24px] pr-[12px] text-[14px] font-medium text-[#eaecef] outline-none font-mono"
                        value={tpPrice} 
                        onChange={(e) => setTpPrice(Math.max(0.01, Number(e.target.value)))} 
                      />
                    </div>
                    
                    {/* Auto-Calculate TP Buttons Based on RRR */}
                    <div className="mt-3">
                      <p className="text-[11px] text-[#707a8a] font-medium mb-1.5">Set TP Berdasarkan RRR:</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[1.5, 2.0, 3.0].map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setTpByRrr(ratio)}
                            className="py-1.5 text-[11px] font-mono font-medium rounded-[4px] bg-[#1e2329] border border-[#2b3139] hover:border-[#fcd535] hover:text-[#fcd535] text-[#707a8a] transition cursor-pointer"
                          >
                            Set RRR 1:{ratio.toFixed(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* SAVE BUTTON */}
                <button
                  onClick={saveCurrentSetup}
                  id="btn-save-setup"
                  className="w-full py-3 bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] font-bold text-[14px] rounded-[6px] transition duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Setup Trading
                </button>

              </div>
            </div>
          </div>
    </>
  );
}
