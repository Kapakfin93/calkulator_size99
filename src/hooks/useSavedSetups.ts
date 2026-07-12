import { useState, useEffect } from 'react';

export interface SavedSetup {
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

export function useSavedSetups(triggerNotification: (msg: string, type: 'success' | 'info' | 'error') => void) {
  const [savedSetups, setSavedSetups] = useState<SavedSetup[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('joglo_saved_setups');
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data)) setSavedSetups(data);
      }
    } catch (e) {
      console.error('Failed to parse saved setups from localStorage', e);
    }
  }, []);

  const saveSetup = (newSetup: SavedSetup) => {
    const updated = [newSetup, ...savedSetups];
    setSavedSetups(updated);
    localStorage.setItem('joglo_saved_setups', JSON.stringify(updated));
    triggerNotification('Setup trading berhasil disimpan!', 'success');
  };

  const deleteSetup = (id: string) => {
    const updated = savedSetups.filter(s => s.id !== id);
    setSavedSetups(updated);
    localStorage.setItem('joglo_saved_setups', JSON.stringify(updated));
    triggerNotification('Setup terhapus.', 'info');
  };

  const clearAllSetups = () => {
    if (window.confirm('Hapus semua setup yang disimpan?')) {
      setSavedSetups([]);
      localStorage.removeItem('joglo_saved_setups');
      triggerNotification('Semua setup dihapus.', 'info');
    }
  };

  return {
    savedSetups,
    saveSetup,
    deleteSetup,
    clearAllSetups
  };
}
