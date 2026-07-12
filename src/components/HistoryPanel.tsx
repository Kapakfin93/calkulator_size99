import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, ShieldAlert, CheckCircle2, Save, Trash2, Info, RefreshCw, HelpCircle, Menu, Percent, Scale } from 'lucide-react';
import RiskRewardChart from "./RiskRewardChart";

export default function HistoryPanel({ savedSetups, clearAllSetups, loadSetup, deleteSetup }: any) {
  return (
    <>
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
    </>
  );
}
