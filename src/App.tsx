import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import RiskRewardChart from './components/RiskRewardChart';
import { useMarketData } from './hooks/useMarketData';
import { useLunarPhase } from './hooks/useLunarPhase';
import { useRiskCalculator } from './hooks/useRiskCalculator';
import { useSavedSetups, SavedSetup } from './hooks/useSavedSetups';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import HistoryPanel from './components/HistoryPanel';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Menu
} from 'lucide-react';

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

  // === SYSTEM STATES ===
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [notif, setNotif] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // === CUSTOM HOOKS (Logic & Data Layers) ===
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const { currentTime, marketSession, marketSentiment } = useMarketData();
  const lunarData = useLunarPhase();
  const { calc, fib, gauge } = useRiskCalculator(direction, equity, riskPercent, slPercent, leverage, entryPrice, tpPrice);
  const { savedSetups, saveSetup: saveSetupToCloud, deleteSetup, clearAllSetups } = useSavedSetups(triggerNotification);



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
    saveSetupToCloud({
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
    });
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

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0e11] text-[#eaecef] font-sans selection:bg-[#fcd535]/20 selection:text-[#fcd535]">
      
      {/* SIDEBAR (BINANCE STYLE) */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto relative h-full">
        
        {/* FLOATING BADGE (HAMBURGER) TO TOGGLE SIDEBAR */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-[26px] left-0 z-30 p-2 pl-3 bg-[#1e2329] border-y border-r border-[#2b3139] rounded-r-[8px] text-[#707a8a] hover:text-[#fcd535] hover:bg-[#2b3139] shadow-lg transition-all cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10 pl-14 md:pl-16">
        
        <Header 
          currentTime={currentTime}
          marketSession={marketSession}
          marketSentiment={marketSentiment}
          lunarData={lunarData}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

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

        {/* MAIN CALCULATOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
          <InputPanel 
            direction={direction} setDirection={setDirection}
            selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset}
            equity={equity} setEquity={setEquity}
            riskPercent={riskPercent} setRiskPercent={setRiskPercent}
            slPercent={slPercent} setSlPercent={setSlPercent}
            leverage={leverage} setLeverage={setLeverage}
            entryPrice={entryPrice} setEntryPrice={setEntryPrice}
            tpPrice={tpPrice} setTpPrice={setTpPrice}
            calc={calc}
            showExplanation={showExplanation} setShowExplanation={setShowExplanation}
            ASSET_PRESETS={ASSET_PRESETS}
            handleAssetSelect={handleAssetSelect}
            triggerNotification={triggerNotification}
            setTpByRrr={setTpByRrr}
            saveCurrentSetup={saveCurrentSetup}
            lunarData={lunarData}
          />
          <OutputPanel 
            calc={calc}
            fib={fib}
            gauge={gauge}
            direction={direction}
            entryPrice={entryPrice}
            slPercent={slPercent}
            tpPrice={tpPrice}
            setTpPrice={setTpPrice}
            triggerNotification={triggerNotification}
            showExplanation={showExplanation}
            leverage={leverage}
            setLeverage={setLeverage}
            selectedAsset={selectedAsset}
          />
        </div>

        {/* BOTTOM SECTION: PERSISTENT SAVED TRADE SETUPS */}
        <HistoryPanel 
          savedSetups={savedSetups}
          clearAllSetups={clearAllSetups}
          loadSetup={loadSetup}
          deleteSetup={deleteSetup}
        />

      </div>
      </div>
    </div>
  );
}
