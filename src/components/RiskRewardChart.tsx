import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Scale, 
  ShieldAlert, 
  CheckCircle2, 
  DollarSign, 
  BarChart2, 
  LineChart as LineChartIcon,
  HelpCircle,
  Activity,
  RefreshCw
} from 'lucide-react';

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

interface RiskRewardChartProps {
  savedSetups: SavedSetup[];
  onLoadSetup: (setup: SavedSetup) => void;
}

export default function RiskRewardChart({ savedSetups, onLoadSetup }: RiskRewardChartProps) {
  const [activeTab, setActiveTab] = useState<'nominal' | 'rrr'>('nominal');

  if (!savedSetups || savedSetups.length === 0) {
    return null;
  }

  // Calculate high-fidelity strategic stats
  const totalSetups = savedSetups.length;
  const avgRrr = savedSetups.reduce((acc, curr) => acc + curr.rrr, 0) / totalSetups;
  const totalRisked = savedSetups.reduce((acc, curr) => acc + curr.riskUsd, 0);
  const totalReward = savedSetups.reduce((acc, curr) => acc + curr.rewardUsd, 0);
  
  // High RRR setups (>= 1.5)
  const healthySetups = savedSetups.filter(s => s.rrr >= 1.5 && s.leverage <= (100 / s.slPercent)).length;
  const healthRate = (healthySetups / totalSetups) * 100;

  // Danger setups (liq price before stop loss)
  const dangerousSetups = savedSetups.filter(s => s.leverage > (100 / s.slPercent)).length;
  const dangerRate = (dangerousSetups / totalSetups) * 100;

  // Prepare data for Recharts
  // Order chronologically for trend (original setups list has newest first, let's reverse for chart presentation)
  const chartData = [...savedSetups].reverse().map((setup, index) => {
    const isLiqFirst = setup.leverage > (100 / setup.slPercent);
    let rrrCategory = 'Sangat Layak (>= 1.5)';
    if (isLiqFirst) {
      rrrCategory = 'Beresiko Likuidasi';
    } else if (setup.rrr < 1.5) {
      rrrCategory = 'RRR Rendah (< 1.5)';
    }

    return {
      index: index + 1,
      id: setup.id,
      label: `#${index + 1} ${setup.asset}`,
      asset: setup.asset,
      direction: setup.direction,
      timestamp: setup.timestamp,
      riskUsd: Number(setup.riskUsd.toFixed(2)),
      rewardUsd: Number(setup.rewardUsd.toFixed(2)),
      rrr: Number(setup.rrr.toFixed(2)),
      isLiqFirst,
      rrrCategory,
      rawSetup: setup
    };
  });

  // Custom tooltips for elegant dark styling
  const CustomNominalTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111419] border border-[#2D3139] rounded-lg p-3.5 shadow-2xl font-mono text-xs max-w-[280px]">
          <div className="flex justify-between items-center border-b border-[#2D3139]/50 pb-1.5 mb-2">
            <span className="font-sans font-bold text-white text-sm flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${data.direction === 'Long' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {data.asset} ({data.direction})
            </span>
            <span className="text-[10px] text-[#64748B]">{data.timestamp}</span>
          </div>
          <div className="space-y-1 text-[#94A3B8]">
            <div className="flex justify-between">
              <span>Risiko Maks:</span>
              <span className="text-rose-400 font-bold">-${data.riskUsd.toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between">
              <span>Potensi Profit:</span>
              <span className="text-emerald-400 font-bold">+${data.rewardUsd.toLocaleString()} USD</span>
            </div>
            <div className="flex justify-between border-t border-[#2D3139]/30 pt-1 mt-1 font-semibold text-white">
              <span>Rasio RRR:</span>
              <span className={data.rrr >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}>1 : {data.rrr}</span>
            </div>
            {data.isLiqFirst && (
              <div className="mt-2 text-[10px] px-1.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-sans rounded font-bold text-center">
                ⚠️ LIKUIDASI DULUAN SEBELUM SL
              </div>
            )}
          </div>
          <button
            onClick={() => onLoadSetup(data.rawSetup)}
            className="mt-3 w-full py-1 bg-[#0A0B0D] hover:bg-emerald-500/10 border border-[#2D3139] hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[11px] rounded transition flex items-center justify-center gap-1.5 cursor-pointer font-sans"
          >
            <RefreshCw className="w-3 h-3" />
            Muat ke Kalkulator
          </button>
        </div>
      );
    }
    return null;
  };

  const CustomRrrTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111419] border border-[#2D3139] rounded-lg p-3.5 shadow-2xl font-mono text-xs max-w-[280px]">
          <div className="flex justify-between items-center border-b border-[#2D3139]/50 pb-1.5 mb-2">
            <span className="font-sans font-bold text-white text-sm flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${data.direction === 'Long' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {data.asset} ({data.direction})
            </span>
            <span className="text-[10px] text-[#64748B]">{data.timestamp}</span>
          </div>
          <div className="space-y-1 text-[#94A3B8]">
            <div className="flex justify-between">
              <span>Risk-to-Reward (RRR):</span>
              <span className="text-white font-bold">1 : {data.rrr}</span>
            </div>
            <div className="flex justify-between">
              <span>Kategori Kelayakan:</span>
              <span className={`font-semibold ${
                data.isLiqFirst ? 'text-rose-400' : data.rrr >= 1.5 ? 'text-emerald-400' : 'text-amber-400'
              }`}>{data.rrrCategory}</span>
            </div>
            <div className="flex justify-between border-t border-[#2D3139]/30 pt-1 mt-1 text-[11px]">
              <span>Stop Loss Jarak:</span>
              <span className="text-white">{data.rawSetup.slPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span>Leverage Terpasang:</span>
              <span className="text-white">{data.rawSetup.leverage}x</span>
            </div>
          </div>
          <button
            onClick={() => onLoadSetup(data.rawSetup)}
            className="mt-3 w-full py-1 bg-[#0A0B0D] hover:bg-emerald-500/10 border border-[#2D3139] hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-[11px] rounded transition flex items-center justify-center gap-1.5 cursor-pointer font-sans"
          >
            <RefreshCw className="w-3 h-3" />
            Muat ke Kalkulator
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6 p-5 bg-[#151921] border border-[#2D3139]/60 rounded-lg" id="risk-reward-distribution-dashboard">
      <div className="flex flex-col lg:flex-row gap-5">
        
        {/* LEFT COLUMN: CRITICAL STRATEGIC PERFORMANCE STATS */}
        <div className="w-full lg:w-1/3 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold font-sans uppercase tracking-widest text-[#94A3B8]">
                Analisis Kinerja Strategi
              </h4>
            </div>
            <p className="text-[11px] text-[#64748B] font-sans">
              Evaluasi kestabilan profil risiko dan probabilitas imbalan berdasarkan seluruh entri log.
            </p>
          </div>

          {/* STATS BENTO-STYLE GRID */}
          <div className="grid grid-cols-2 gap-3">
            {/* STAT 1: AVERAGE RRR */}
            <div className="bg-[#0A0B0D] border border-[#2D3139]/40 rounded p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono flex items-center gap-1">
                <Scale className="w-3 h-3 text-emerald-500/70" /> Avg RRR
              </span>
              <div className="mt-1.5">
                <span className="text-lg font-bold text-white font-mono">1 : {avgRrr.toFixed(2)}</span>
                <span className={`block text-[9px] mt-0.5 font-bold ${avgRrr >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {avgRrr >= 1.5 ? '✓ Sangat Sehat' : '⚠ Perlu Diperbaiki'}
                </span>
              </div>
            </div>

            {/* STAT 2: PORTFOLIO EFFICIENCY */}
            <div className="bg-[#0A0B0D] border border-[#2D3139]/40 rounded p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500/70" /> Kelayakan
              </span>
              <div className="mt-1.5">
                <span className="text-lg font-bold text-white font-mono">{healthRate.toFixed(0)}%</span>
                <span className="block text-[9px] text-[#64748B] mt-0.5">
                  {healthySetups} dari {totalSetups} Sehat
                </span>
              </div>
            </div>

            {/* STAT 3: TOTAL RISK */}
            <div className="bg-[#0A0B0D] border border-[#2D3139]/40 rounded p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-rose-500/70" /> Total Risiko
              </span>
              <div className="mt-1.5">
                <span className="text-md font-bold text-rose-400 font-mono">${totalRisked.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                <span className="block text-[9px] text-[#64748B] mt-0.5">Potensi Kerugian</span>
              </div>
            </div>

            {/* STAT 4: TOTAL REWARD */}
            <div className="bg-[#0A0B0D] border border-[#2D3139]/40 rounded p-3 flex flex-col justify-between">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500/70" /> Total Imbalan
              </span>
              <div className="mt-1.5">
                <span className="text-md font-bold text-emerald-400 font-mono">${totalReward.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                <span className="block text-[9px] text-[#64748B] mt-0.5">Potensi Keuntungan</span>
              </div>
            </div>
          </div>

          {/* DANGER EXPOSURE METER */}
          <div className="bg-[#0A0B0D]/50 border border-[#2D3139]/30 rounded p-2.5">
            <div className="flex justify-between items-center text-[10px] font-mono mb-1">
              <span className="text-[#64748B] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Paparan Likuidasi Dini
              </span>
              <span className={dangerousSetups > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {dangerousSetups} Posisi ({dangerRate.toFixed(0)}%)
              </span>
            </div>
            <div className="h-1.5 bg-[#111419] rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${dangerRate}%` }}
              />
            </div>
            <p className="text-[9px] text-[#475569] mt-1 font-sans leading-tight">
              {dangerousSetups > 0 
                ? 'Ada setup dengan leverage melampaui batas aman stop loss. Kurangi leverage!'
                : 'Semua posisi aman dari risiko terlikuidasi mendahului stop loss.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: GRAPH VISUALIZATION ENGINE */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {/* TAB TOGLE SELECTORS */}
          <div className="flex items-center justify-between border-b border-[#2D3139]/40 pb-2 mb-3">
            <span className="text-[11px] font-mono text-[#64748B]">Visualisasi Distribusi</span>
            <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded border border-[#2D3139]/60">
              <button
                onClick={() => setActiveTab('nominal')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium font-sans transition cursor-pointer ${
                  activeTab === 'nominal'
                    ? 'bg-[#1A231E] border border-emerald-500/20 text-emerald-400'
                    : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
                id="tab-chart-nominal"
              >
                <BarChart2 className="w-3 h-3" />
                Komparasi USD
              </button>
              <button
                onClick={() => setActiveTab('rrr')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium font-sans transition cursor-pointer ${
                  activeTab === 'rrr'
                    ? 'bg-[#1A231E] border border-emerald-500/20 text-emerald-400'
                    : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
                id="tab-chart-rrr"
              >
                <LineChartIcon className="w-3 h-3" />
                Rasio RRR
              </button>
            </div>
          </div>

          {/* ACTIVE CHART RENDER STAGE */}
          <div className="h-[200px] w-full" id="chart-stage">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'nominal' ? (
                // 1. RISK VS REWARD NOMINAL COMPARISON (USD)
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F232B" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#475569" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#2D3139' }}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickFormatter={(v) => `$${v}`}
                    tickLine={false}
                    axisLine={{ stroke: '#2D3139' }}
                  />
                  <Tooltip content={<CustomNominalTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                  <Legend 
                    verticalAlign="top" 
                    height={32}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#64748B' }}
                  />
                  <Bar 
                    name="Risiko Maksimal (USD)" 
                    dataKey="riskUsd" 
                    fill="#F43F5E" 
                    radius={[2, 2, 0, 0]} 
                  />
                  <Bar 
                    name="Potensi Keuntungan (USD)" 
                    dataKey="rewardUsd" 
                    fill="#10B981" 
                    radius={[2, 2, 0, 0]} 
                  />
                </BarChart>
              ) : (
                // 2. RRR SCATTER / BAR DISTRIBUTION (1 : RRR TRENDLINE)
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F232B" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#475569" 
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#2D3139' }}
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickFormatter={(v) => `1:${v}`}
                    tickLine={false}
                    axisLine={{ stroke: '#2D3139' }}
                  />
                  <Tooltip content={<CustomRrrTooltip />} />
                  <ReferenceLine y={1.5} stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="4 4" label={{ value: 'Kelayakan (1.5)', fill: '#475569', fontSize: 8, position: 'insideTopLeft' }} />
                  <ReferenceLine y={1.618} stroke="rgba(217, 119, 6, 0.4)" strokeDasharray="3 3" label={{ value: 'Golden TP1 (1.618)', fill: '#D97706', fontSize: 8, position: 'insideTopRight' }} />
                  <ReferenceLine y={2.618} stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="3 3" label={{ value: 'Golden TP2 (2.618)', fill: '#10B981', fontSize: 8, position: 'insideTopRight' }} />
                  <ReferenceLine y={3.618} stroke="rgba(20, 184, 166, 0.4)" strokeDasharray="3 3" label={{ value: 'Golden TP3 (3.618)', fill: '#14B8A6', fontSize: 8, position: 'insideTopRight' }} />
                  
                  {/* Bar representing the RRR height with customized coloring based on safety/profitability */}
                  <Bar dataKey="rrr" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry, idx) => {
                      let barColor = '#F59E0B'; // Amber for < 1.5
                      if (entry.isLiqFirst) {
                        barColor = '#EF4444'; // Rose for Liquidation risk
                      } else if (entry.rrr >= 1.5) {
                        barColor = '#10B981'; // Emerald for >= 1.5
                      }
                      return <Cell key={`cell-${idx}`} fill={barColor} />;
                    })}
                  </Bar>
                  
                  {/* Trendline for RRR */}
                  <Line 
                    type="monotone" 
                    dataKey="rrr" 
                    stroke="#E2E8F0" 
                    strokeWidth={1.5} 
                    dot={{ fill: '#E2E8F0', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Tren RRR"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* COLOR LEGEND INDICATOR FOR RRR VIEW */}
          {activeTab === 'rrr' && (
            <div className="flex justify-center items-center gap-4 mt-2 text-[9px] font-mono text-[#64748B]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Sangat Layak (&gt;= 1.5)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>RRR Rendah (&lt; 1.5)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span>Beresiko Likuidasi Sebelum SL</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
