import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import RiskRewardChart from './components/RiskRewardChart';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Scale, 
  Save, 
  Trash2, 
  Activity, 
  Info, 
  RefreshCw, 
  HelpCircle,
  Clock,
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

// Interfaces
interface CalculationResults {
  maxLeverage: number;
  absoluteMaxLeverage: number;
  riskUsd: number;
  positionUsd: number;
  marginUsd: number;
  contractBtc: number;
  slPrice: number;
  liqPrice: number;
  tpDistance: number;
  rewardUsd: number;
  rrr: number;
  isLiqBeforeSl: boolean;
}

interface SavedSetup {
  id: string;
  timestamp: string;
  direction: string;
  asset: string;
  equity: number;
  riskPercent: number;
  slPercent: number;
  leverage: number;
  entryPrice: number;
  tpPrice: number;
  positionUsd: number;
  marginUsd: number;
  riskUsd: number;
  rewardUsd: number;
  rrr: number;
  slPrice: number;
  liqPrice: number;
}

// Preset assets with standard starter prices and coin abbreviations
const ASSET_PRESETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 64000, tpLong: 67200, tpShort: 60800 },
  { symbol: 'ETH', name: 'Ethereum', price: 3400, tpLong: 3600, tpShort: 3200 },
  { symbol: 'SOL', name: 'Solana', price: 140, tpLong: 154, tpShort: 126 },
  { symbol: 'BNB', name: 'BNB Chain', price: 580, tpLong: 620, tpShort: 540 },
  { symbol: 'CUSTOM', name: 'Custom Asset', price: 1000, tpLong: 1050, tpShort: 950 }
];

export default function App() {
  // === INPUT VARIABLES ===
  const [direction, setDirection] = useState<'Long' | 'Short'>('Short');
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [equity, setEquity] = useState<number>(5000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [slPercent, setSlPercent] = useState<number>(3);
  const [leverage, setLeverage] = useState<number>(25);
  const [entryPrice, setEntryPrice] = useState<number>(64000);
  const [tpPrice, setTpPrice] = useState<number>(61000);

  // === CALCULATIONS STATE ===
  const [calc, setCalc] = useState<CalculationResults>({
    maxLeverage: 25,
    absoluteMaxLeverage: 33.3,
    riskUsd: 50,
    positionUsd: 1666.67,
    marginUsd: 66.67,
    contractBtc: 0.02604,
    slPrice: 65920,
    liqPrice: 66560,
    tpDistance: 4.6875,
    rewardUsd: 78.125,
    rrr: 1.5625,
    isLiqBeforeSl: false
  });

  // === SYSTEM STATES ===
  const [savedSetups, setSavedSetups] = useState<SavedSetup[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [notif, setNotif] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // UTC clock update and Initial storage load
  useEffect(() => {
    // Clock
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Local Storage
    const stored = localStorage.getItem('trade_setups');
    if (stored) {
      try {
        setSavedSetups(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved setups', e);
      }
    }

    return () => clearInterval(interval);
  }, []);

  // Show temporary notifications
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotif({ message, type });
    setTimeout(() => {
      setNotif(null);
    }, 4000);
  };

  // Calculate whenever parameters change
  useEffect(() => {
    const safeSlPercent = Math.max(0.01, slPercent);
    const safeLeverage = Math.max(1, leverage);
    const safeEntryPrice = Math.max(0.01, entryPrice);

    // 1. Max Leverage (Buffer 1% Rule)
    const maxLeverage = 100 / (safeSlPercent + 1);
    const absoluteMaxLeverage = 100 / safeSlPercent;

    // 2. Risk Nominal (USD)
    const riskUsd = equity * (riskPercent / 100);

    // 3. Position Size & Margin
    const positionUsd = riskUsd / (safeSlPercent / 100);
    const marginUsd = positionUsd / safeLeverage;
    const contractBtc = positionUsd / safeEntryPrice;

    // 4. Harga Stop Loss
    const slPrice = direction === 'Long'
      ? safeEntryPrice - (safeEntryPrice * (safeSlPercent / 100))
      : safeEntryPrice + (safeEntryPrice * (safeSlPercent / 100));

    // 5. Harga Likuidasi (Isolated Margin)
    const liqPrice = direction === 'Long'
      ? safeEntryPrice * (1 - (1 / safeLeverage))
      : safeEntryPrice * (1 + (1 / safeLeverage));

    // 6. Reward & RRR
    const tpDistance = Math.abs(safeEntryPrice - tpPrice) / safeEntryPrice;
    const rewardUsd = positionUsd * tpDistance;
    const rrr = tpDistance / (safeSlPercent / 100);

    // Danger Zone: If leverage is greater than 100 / slPercent, 
    // liquidation price is closer to entry than stop loss!
    const isLiqBeforeSl = safeLeverage > absoluteMaxLeverage;

    setCalc({
      maxLeverage,
      absoluteMaxLeverage,
      riskUsd,
      positionUsd,
      marginUsd,
      contractBtc,
      slPrice,
      liqPrice,
      tpDistance: tpDistance * 100,
      rewardUsd,
      rrr,
      isLiqBeforeSl
    });
  }, [direction, equity, riskPercent, slPercent, leverage, entryPrice, tpPrice]);

  // Derived Fibonacci Golden Ratio Targets
  const safeSlPercent = Math.max(0.01, slPercent);
  const safeEntryPrice = Math.max(0.01, entryPrice);
  
  const fibTp1Price = direction === 'Long'
    ? safeEntryPrice * (1 + (safeSlPercent * 1.618) / 100)
    : safeEntryPrice * (1 - (safeSlPercent * 1.618) / 100);

  const fibTp2Price = direction === 'Long'
    ? safeEntryPrice * (1 + (safeSlPercent * 2.618) / 100)
    : safeEntryPrice * (1 - (safeSlPercent * 2.618) / 100);

  const fibTp3Price = direction === 'Long'
    ? safeEntryPrice * (1 + (safeSlPercent * 3.618) / 100)
    : safeEntryPrice * (1 - (safeSlPercent * 3.618) / 100);

  const fibTp1Reward = calc.riskUsd * 1.618;
  const fibTp2Reward = calc.riskUsd * 2.618;
  const fibTp3Reward = calc.riskUsd * 3.618;

  // Gauge Position calculations
  const minGaugeRrr = -1.2;
  const maxGaugeRrr = 4.2;
  const getGaugePct = (r: number) => {
    const pct = ((r - minGaugeRrr) / (maxGaugeRrr - minGaugeRrr)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const isTpCorrectSide = direction === 'Long'
    ? tpPrice >= entryPrice
    : tpPrice <= entryPrice;

  const directionalRrr = isTpCorrectSide ? calc.rrr : -calc.rrr;
  const currentTpPctPosition = getGaugePct(directionalRrr);

  const slPctPosition = getGaugePct(-1.0);
  const entryPctPosition = getGaugePct(0.0);
  const tp1PctPosition = getGaugePct(1.618);
  const tp2PctPosition = getGaugePct(2.618);
  const tp3PctPosition = getGaugePct(3.618);

  // Handle Asset Preset click
  const handleAssetSelect = (assetSymbol: string) => {
    setSelectedAsset(assetSymbol);
    const preset = ASSET_PRESETS.find(a => a.symbol === assetSymbol);
    if (preset) {
      setEntryPrice(preset.price);
      setTpPrice(direction === 'Long' ? preset.tpLong : preset.tpShort);
      triggerNotification(`Asset diubah ke ${preset.symbol}. Entry & TP diperbarui.`, 'info');
    }
  };

  // Auto-calculate TP based on desired Risk/Reward Ratio (RRR)
  const setTpByRrr = (targetRrr: number) => {
    const safeSlPercent = Math.max(0.01, slPercent);
    const changePercent = (safeSlPercent * targetRrr) / 100;
    
    let targetTp = entryPrice;
    if (direction === 'Long') {
      targetTp = entryPrice * (1 + changePercent);
    } else {
      targetTp = entryPrice * (1 - changePercent);
    }
    
    setTpPrice(Number(targetTp.toFixed(2)));
    triggerNotification(`Target Profit disesuaikan untuk mencapai RRR 1 : ${targetRrr}`, 'success');
  };

  // Save Setup to list
  const saveCurrentSetup = () => {
    const newSetup: SavedSetup = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      direction,
      asset: selectedAsset,
      equity,
      riskPercent,
      slPercent,
      leverage,
      entryPrice,
      tpPrice,
      positionUsd: calc.positionUsd,
      marginUsd: calc.marginUsd,
      riskUsd: calc.riskUsd,
      rewardUsd: calc.rewardUsd,
      rrr: calc.rrr,
      slPrice: calc.slPrice,
      liqPrice: calc.liqPrice
    };

    const updated = [newSetup, ...savedSetups];
    setSavedSetups(updated);
    localStorage.setItem('trade_setups', JSON.stringify(updated));
    triggerNotification('Setup trading berhasil disimpan!', 'success');
  };

  // Delete saved setup
  const deleteSetup = (id: string) => {
    const updated = savedSetups.filter(s => s.id !== id);
    setSavedSetups(updated);
    localStorage.setItem('trade_setups', JSON.stringify(updated));
    triggerNotification('Setup terhapus.', 'info');
  };

  // Load saved setup back into inputs
  const loadSetup = (setup: SavedSetup) => {
    setDirection(setup.direction as 'Long' | 'Short');
    setSelectedAsset(setup.asset);
    setEquity(setup.equity);
    setRiskPercent(setup.riskPercent);
    setSlPercent(setup.slPercent);
    setLeverage(setup.leverage);
    setEntryPrice(setup.entryPrice);
    setTpPrice(setup.tpPrice);
    triggerNotification(`Memuat setup ${setup.asset} (${setup.direction})`, 'info');
  };

  // Clear all saved setups
  const clearAllSetups = () => {
    if (window.confirm('Hapus semua setup yang disimpan?')) {
      setSavedSetups([]);
      localStorage.removeItem('trade_setups');
      triggerNotification('Semua setup dihapus.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E2E8F0] font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* BACKGROUND DECORATIVE SHADOWS (SOPHISTICATED DARK ASPECT) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-emerald-500/3 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-rose-500/3 blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10">
        
        {/* TOP STATUS BAR & HEADER */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#2D3139] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] font-mono tracking-widest text-emerald-500 font-bold uppercase">PRO RISK ENGINE</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif italic font-semibold tracking-wide text-white">
              Terminal <span className="text-emerald-500 font-sans uppercase text-xs not-italic ml-1.5 opacity-90 tracking-[0.15em] font-bold">Risk Control & Position Sizing</span>
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1.5 font-sans">
              Kalkulator presisi futures isolated margin untuk kelayakan perdagangan (RRR) & mitigasi likuidasi dini.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-4 text-xs font-mono bg-[#111419] border border-[#2D3139] rounded px-4 py-2.5">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-[#E2E8F0]">{currentTime || 'UTC 14:32'}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[#94A3B8] border-l border-[#2D3139] pl-4">
              <User className="w-3.5 h-3.5 text-emerald-500/75" />
              <span className="text-xs text-[#94A3B8]">joekapak93@gmail.com</span>
            </div>
          </div>
        </header>

        {/* NOTIFICATION FEEDBACK TOAST */}
        <AnimatePresence>
          {notif && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-xl flex items-center gap-3 max-w-sm ${
                notif.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
                  : notif.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                  : 'bg-slate-950/90 border-slate-700/80 text-slate-200'
              }`}
            >
              <div className="p-1 rounded-full bg-slate-900/50">
                {notif.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : notif.type === 'error' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                ) : (
                  <Info className="w-5 h-5 text-teal-400" />
                )}
              </div>
              <p className="text-xs font-medium">{notif.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CRITICAL WARNING: LIQUIDATION BEFORE STOP LOSS */}
        <AnimatePresence>
          {calc.isLiqBeforeSl && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
              id="liq-warning-banner"
            >
              <div className="bg-gradient-to-r from-rose-950/80 via-red-950/60 to-rose-950/80 border border-rose-500/50 p-5 rounded-xl shadow-xl flex flex-col md:flex-row md:items-center gap-4">
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400 self-start md:self-center">
                  <ShieldAlert className="w-8 h-8 animate-pulse" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-rose-200 tracking-wide text-sm md:text-base uppercase">
                    Peringatan Kritis: Risiko Likuidasi Sebelum Stop Loss!
                  </h3>
                  <p className="text-xs md:text-sm text-rose-300/90 mt-1 leading-relaxed">
                    Leverage saat ini ({leverage}x) terlalu tinggi untuk jarak Stop Loss ({slPercent}%). Harga Likuidasi Isolated 
                    (${calc.liqPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}) akan tercapai sebelum harga Stop Loss 
                    (${calc.slPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}). Anda berisiko kehilangan seluruh margin posisi Anda secara permanen.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 items-center">
                    <button 
                      onClick={() => setLeverage(Math.floor(calc.absoluteMaxLeverage))}
                      className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded transition duration-200 shadow-md cursor-pointer"
                    >
                      Turunkan Leverage ke {Math.floor(calc.absoluteMaxLeverage)}x (Limit SL)
                    </button>
                    <button 
                      onClick={() => setLeverage(Math.floor(calc.maxLeverage))}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded transition duration-200 shadow-md cursor-pointer"
                    >
                      Batas Aman Buffer 1%: {Math.floor(calc.maxLeverage)}x
                    </button>
                    <span className="text-xs text-rose-400 font-mono">
                      (Rumus Limit: Leverage &le; 100 / SL)
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CALCULATOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
          
          {/* LEFT COLUMN: PARAMETER SETUP (5 cols on large screen) */}
          <div className="lg:col-span-5 space-y-6" id="panel-inputs">
            
            {/* DIRECTION SEGMENTED SWITCH */}
            <div className="bg-[#0A0B0D] border border-[#2D3139] p-1 rounded flex shadow-inner">
              <button
                id="btn-long"
                onClick={() => {
                  setDirection('Long');
                  // Adjust TP standard preset directionally
                  const preset = ASSET_PRESETS.find(a => a.symbol === selectedAsset);
                  if (preset) setTpPrice(preset.tpLong);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-xs font-bold tracking-widest uppercase transition-all duration-200 relative cursor-pointer ${
                  direction === 'Long' 
                    ? 'text-white' 
                    : 'text-[#475569]/80 hover:text-slate-200'
                }`}
              >
                {direction === 'Long' && (
                  <motion.div 
                    layoutId="active-direction" 
                    className="absolute inset-0 bg-[#15181E] border border-[#2D3139] rounded shadow-inner z-0" 
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <TrendingUp className={`w-3.5 h-3.5 ${direction === 'Long' ? 'text-emerald-500' : 'text-emerald-500/50'}`} />
                  BUY / LONG
                </span>
              </button>

              <button
                id="btn-short"
                onClick={() => {
                  setDirection('Short');
                  // Adjust TP standard preset directionally
                  const preset = ASSET_PRESETS.find(a => a.symbol === selectedAsset);
                  if (preset) setTpPrice(preset.tpShort);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded text-xs font-bold tracking-widest uppercase transition-all duration-200 relative cursor-pointer ${
                  direction === 'Short' 
                    ? 'text-white' 
                    : 'text-[#475569]/80 hover:text-slate-200'
                }`}
              >
                {direction === 'Short' && (
                  <motion.div 
                    layoutId="active-direction" 
                    className="absolute inset-0 bg-[#15181E] border border-[#2D3139] rounded shadow-inner z-0" 
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <TrendingDown className={`w-3.5 h-3.5 ${direction === 'Short' ? 'text-rose-500' : 'text-rose-500/50'}`} />
                  SELL / SHORT
                </span>
              </button>
            </div>

            {/* PARAMETER CARD PANEL */}
            <div className="bg-[#111419] border border-[#2D3139] p-6 rounded-lg shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-900/40 to-transparent pointer-events-none rounded-tr-lg" />
              
              <div className="flex items-center justify-between mb-5 border-b border-[#2D3139]/50 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">Parameter Setup</h2>
                </div>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-[#64748B] hover:text-[#E2E8F0] p-1 rounded hover:bg-[#0A0B0D] transition duration-150 cursor-pointer"
                  title="Tampilkan Info Kalkulasi"
                  id="btn-toggle-info"
                >
                  <HelpCircle className="w-4.5 h-4.5 text-[#64748B]" />
                </button>
              </div>

              <div className="space-y-5">
                
                {/* CRYPTO PRESETS TRACK */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2">Preset Aset Kripto</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ASSET_PRESETS.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => handleAssetSelect(asset.symbol)}
                        className={`py-2 text-xs font-mono font-bold rounded border transition-all duration-200 cursor-pointer ${
                          selectedAsset === asset.symbol
                            ? 'bg-[#15181E] border-emerald-500/50 text-emerald-500 shadow-sm shadow-emerald-500/5'
                            : 'bg-[#0A0B0D]/80 border-[#2D3139] text-[#64748B] hover:text-[#E2E8F0] hover:border-[#475569]'
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Equity (USD)
                    </label>
                    <span className="text-[11px] font-mono font-medium text-[#E2E8F0] bg-[#0A0B0D] border border-[#2D3139] px-2 py-0.5 rounded">
                      ${equity.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      id="input-equity"
                      min="10" 
                      max="10000000"
                      className="w-full bg-[#0A0B0D] border border-[#2D3139] focus:border-emerald-500/80 rounded py-2.5 pl-4 pr-12 text-sm font-semibold text-white outline-none font-mono transition"
                      value={equity} 
                      onChange={(e) => setEquity(Math.max(0, Number(e.target.value)))} 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#475569]">USD</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[1000, 5000, 10000, 25000].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setEquity(val);
                          triggerNotification(`Equity diset ke $${val.toLocaleString()}`, 'info');
                        }}
                        className="py-1 text-[10px] font-mono font-semibold rounded bg-[#0A0B0D]/50 border border-[#2D3139] hover:border-[#475569] text-[#94A3B8] hover:bg-[#0A0B0D] hover:text-white transition cursor-pointer"
                      >
                        +${val >= 1000 ? `${val / 1000}k` : val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RISK PERCENTAGE SLIDER */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-[#64748B]" /> Risiko per Trade
                    </label>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      riskPercent <= 1 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                      riskPercent <= 3 ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' :
                      'bg-rose-950/40 text-rose-400 border border-rose-500/20'
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
                      className="flex-1 accent-emerald-500 cursor-pointer h-1 bg-[#0A0B0D] rounded appearance-none"
                      value={riskPercent} 
                      onChange={(e) => setRiskPercent(Number(e.target.value))} 
                    />
                    <input
                      type="number"
                      step="0.1"
                      id="input-risk"
                      className="w-16 bg-[#0A0B0D] border border-[#2D3139] focus:border-emerald-500 text-center rounded py-1 text-xs font-mono text-white outline-none"
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
                        className={`flex-1 py-1 text-[10px] font-mono font-semibold rounded border transition cursor-pointer ${
                          riskPercent === p
                            ? 'bg-[#15181E] border-emerald-500/30 text-emerald-500'
                            : 'bg-[#0A0B0D]/50 border-[#2D3139] text-[#64748B] hover:text-slate-200 hover:bg-[#0A0B0D]'
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-[#64748B]" /> Jarak Stop Loss (SL)
                    </label>
                    <span className="text-[11px] font-mono font-medium text-[#E2E8F0] bg-[#0A0B0D] border border-[#2D3139] px-2 py-0.5 rounded">
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
                      className="flex-1 accent-emerald-500 cursor-pointer h-1 bg-[#0A0B0D] rounded appearance-none"
                      value={slPercent} 
                      onChange={(e) => setSlPercent(Number(e.target.value))} 
                    />
                    <input
                      type="number"
                      step="0.1"
                      id="input-sl"
                      className="w-16 bg-[#0A0B0D] border border-[#2D3139] focus:border-emerald-500 text-center rounded py-1 text-xs font-mono text-white outline-none"
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
                        className={`flex-1 py-1 text-[10px] font-mono font-semibold rounded border transition cursor-pointer ${
                          slPercent === sl
                            ? 'bg-[#15181E] border-emerald-500/30 text-emerald-500'
                            : 'bg-[#0A0B0D]/50 border-[#2D3139] text-[#64748B] hover:text-slate-200 hover:bg-[#0A0B0D]'
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Leverage (x)</label>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      calc.isLiqBeforeSl 
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30 animate-pulse' 
                        : leverage > calc.maxLeverage 
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30' 
                        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
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
                      className="flex-1 accent-emerald-500 cursor-pointer h-1 bg-[#0A0B0D] rounded appearance-none"
                      value={leverage} 
                      onChange={(e) => setLeverage(Number(e.target.value))} 
                    />
                    <input
                      type="number"
                      id="input-leverage"
                      className="w-16 bg-[#0A0B0D] border border-[#2D3139] focus:border-emerald-500 text-center rounded py-1 text-xs font-mono text-white outline-none"
                      value={leverage}
                      onChange={(e) => setLeverage(Math.max(1, Math.min(150, Number(e.target.value))))}
                    />
                  </div>
                  
                  {/* Buffer max leverage indicators */}
                  <div className="flex justify-between items-center mt-2.5 bg-[#0A0B0D]/80 p-2.5 rounded border border-[#2D3139] text-[11px] font-mono leading-none">
                    <span className="text-[#64748B]">Batas Aman (Buffer 1%):</span>
                    <button 
                      onClick={() => setLeverage(Math.floor(calc.maxLeverage))}
                      className="text-amber-500 font-bold hover:underline cursor-pointer bg-transparent border-none"
                    >
                      {calc.maxLeverage.toFixed(1)}x
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1 bg-[#0A0B0D]/30 px-2.5 py-1.5 rounded border border-[#2D3139]/30 text-[10px] font-mono leading-none">
                    <span className="text-[#475569]">Batas Absolut Liq (Limit):</span>
                    <button 
                      onClick={() => setLeverage(Math.floor(calc.absoluteMaxLeverage))}
                      className="text-rose-500/80 font-bold hover:underline cursor-pointer bg-transparent border-none"
                    >
                      {calc.absoluteMaxLeverage.toFixed(1)}x
                    </button>
                  </div>
                </div>

                {/* PRICES CARD FOR ENTRY AND TARGET */}
                <div className="p-4 bg-[#0A0B0D] rounded border border-[#2D3139] space-y-4">
                  
                  {/* ENTRY PRICE */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Entry Price (USD)</label>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEntryPrice(prev => Number((prev * 0.99).toFixed(2)))}
                          className="px-1.5 py-0.5 text-[9px] font-mono bg-[#111419] rounded border border-[#2D3139] hover:border-[#475569] text-[#94A3B8] cursor-pointer"
                        >
                          -1%
                        </button>
                        <button 
                          onClick={() => setEntryPrice(prev => Number((prev * 1.01).toFixed(2)))}
                          className="px-1.5 py-0.5 text-[9px] font-mono bg-[#111419] rounded border border-[#2D3139] hover:border-[#475569] text-[#94A3B8] cursor-pointer"
                        >
                          +1%
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                      <input 
                        type="number" 
                        id="input-entry-price"
                        className="w-full bg-[#0A0B0D] border border-[#2D3139] focus:border-emerald-500/80 rounded py-2 pl-7 pr-3 text-sm font-semibold text-white outline-none font-mono"
                        value={entryPrice} 
                        onChange={(e) => setEntryPrice(Math.max(0.01, Number(e.target.value)))} 
                      />
                    </div>
                  </div>

                  {/* TARGET PRICE (TP) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Target Price (TP)</label>
                      <span className="text-[10px] font-mono text-[#475569]">
                        Rasio saat ini: {(Math.abs(entryPrice - tpPrice) / entryPrice / (slPercent / 100)).toFixed(2)}x
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                      <input 
                        type="number" 
                        id="input-tp-price"
                        className="w-full bg-[#0A0B0D] border border-[#2D3139] focus:border-emerald-500/80 rounded py-2 pl-7 pr-3 text-sm font-semibold text-white outline-none font-mono"
                        value={tpPrice} 
                        onChange={(e) => setTpPrice(Math.max(0.01, Number(e.target.value)))} 
                      />
                    </div>
                    
                    {/* Auto-Calculate TP Buttons Based on RRR */}
                    <div className="mt-2.5">
                      <p className="text-[10px] text-[#64748B] font-bold mb-1.5 uppercase tracking-wider">Set TP Berdasarkan RRR:</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[1.5, 2.0, 3.0].map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setTpByRrr(ratio)}
                            className="py-1 text-[10px] font-mono font-bold rounded bg-[#111419] border border-[#2D3139] hover:border-emerald-500/50 hover:text-emerald-500 text-[#94A3B8] transition cursor-pointer"
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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-[#0A0B0D] font-extrabold text-xs uppercase tracking-widest rounded transition duration-200 flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Simpan Setup Trading
                </button>

              </div>
            </div>

          </div>

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
                    <div className="w-0.5 h-5 bg-gradient-to-b from-emerald-400 to-emerald-500" />
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

        </div>

        {/* BOTTOM SECTION: PERSISTENT SAVED TRADE SETUPS */}
        <section className="bg-[#111419] border border-[#2D3139] rounded-lg p-6 overflow-hidden" id="section-history-logs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2D3139]/50 pb-4 mb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white flex items-center gap-2">
                <span className="p-1 rounded bg-[#0A0B0D] border border-[#2D3139]">
                  <Save className="w-3.5 h-3.5 text-emerald-500" />
                </span>
                Log Setup Trading Tersimpan
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5">
                Bandingkan kalkulasi strategi posisi trading yang Anda simpan di browser lokal.
              </p>
            </div>
            
            {savedSetups.length > 0 && (
              <button
                onClick={clearAllSetups}
                className="self-start sm:self-center px-3 py-1.5 bg-[#0A0B0D] hover:bg-rose-950/20 border border-[#2D3139] hover:border-rose-500/30 rounded text-xs font-mono font-medium text-[#94A3B8] hover:text-rose-400 transition flex items-center gap-1.5 cursor-pointer"
                id="btn-clear-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Semua ({savedSetups.length})
              </button>
            )}
          </div>

          {/* RISK REWARD VISUALIZATION CHART */}
          <RiskRewardChart savedSetups={savedSetups} onLoadSetup={loadSetup} />

          {savedSetups.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#2D3139] rounded">
              <p className="text-sm text-[#64748B]">Belum ada setup trading yang disimpan.</p>
              <p className="text-xs text-[#475569] mt-1.5">Atur parameter dan klik tombol "Simpan Setup Trading" di panel kiri untuk menyimpan simulasi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse" id="saved-setups-table">
                <thead>
                  <tr className="border-b border-[#2D3139] text-[#64748B] uppercase text-[9px] tracking-widest font-bold">
                    <th className="py-3 px-4">Aset / Arah</th>
                    <th className="py-3 px-4">Equity</th>
                    <th className="py-3 px-4">Risiko (USD)</th>
                    <th className="py-3 px-4">Posisi (USD)</th>
                    <th className="py-3 px-4">Stop Loss</th>
                    <th className="py-3 px-4">Leverage</th>
                    <th className="py-3 px-4">Target TP</th>
                    <th className="py-3 px-4 text-center">RRR</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3139]/30">
                  {savedSetups.map((setup) => {
                    const setupIsLiqFirst = setup.leverage > (100 / setup.slPercent);
                    return (
                      <tr key={setup.id} className="hover:bg-[#15181E]/40 transition group">
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-2.5">
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ${
                              setup.direction === 'Long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {setup.direction[0]}
                            </span>
                            <div>
                              <span className="font-serif italic font-semibold text-white tracking-wide">{setup.asset}</span>
                              <span className="text-[9px] text-[#475569] block font-mono">{setup.timestamp}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#94A3B8]">${setup.equity.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-rose-400">
                          -${setup.riskUsd.toFixed(1)} <span className="text-[10px] text-[#475569]">({setup.riskPercent}%)</span>
                        </td>
                        <td className="py-3.5 px-4 text-white font-semibold">
                          ${setup.positionUsd.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[#E2E8F0] block">${setup.slPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</span>
                          <span className="text-[10px] text-[#475569] block">Jarak: {setup.slPercent}%</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            setupIsLiqFirst 
                              ? 'bg-[#1A1214] border-rose-500/20 text-rose-400' 
                              : 'bg-[#0A0B0D] border-[#2D3139] text-[#64748B]'
                          }`}>
                            {setup.leverage}x
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-emerald-500 font-semibold">
                          ${setup.tpPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            setupIsLiqFirst
                              ? 'bg-[#1A1214] border-rose-500/20 text-rose-400'
                              : setup.rrr >= 1.5 
                              ? 'bg-[#111A16] border-emerald-500/20 text-emerald-500' 
                              : 'bg-[#191511] border-amber-500/20 text-amber-500'
                          }`}>
                            1:{setup.rrr.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => loadSetup(setup)}
                              className="p-1.5 bg-[#0A0B0D] border border-[#2D3139] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 rounded text-[#64748B] transition cursor-pointer"
                              title="Muat Setup ke Kalkulator"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteSetup(setup.id)}
                              className="p-1.5 bg-[#0A0B0D] border border-[#2D3139] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 rounded text-[#64748B] transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
