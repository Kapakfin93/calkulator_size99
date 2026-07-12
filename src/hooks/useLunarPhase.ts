import { useState, useEffect } from 'react';

export interface LunarPhaseData {
  age: number;
  phaseName: string;
  icon: string;
  isReversalZone: boolean;
  cyclePercent: number;
  daysToFullMoon: number;
  daysToNewMoon: number;
  fullMoonDateStr: string;
  newMoonDateStr: string;
}

function normalize(_v: number) {
  let x = _v;
  x = x - Math.floor(x);
  if (x < 0) x = x + 1;
  return x;
}

function calcPhase(date: Date) {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();

  y = y - Math.floor((12 - m) / 10);
  m = m + 9;
  if (m >= 12) m = m - 12;

  const k1 = Math.floor(365.25 * (y + 4712));
  const k2 = Math.floor(30.6 * m + 0.5);
  const k3 = Math.floor(Math.floor((y / 100) + 49) * 0.75) - 38;

  let jd = k1 + k2 + d + 59;
  if (jd > 2299160) {
    jd = jd - k3;
  }

  const ip = normalize((jd - 2451550.1) / 29.530588853);
  const age = ip * 29.530588853;
  return age;
}

function getPhaseDetails(age: number): Omit<LunarPhaseData, 'age' | 'cyclePercent' | 'daysToFullMoon' | 'daysToNewMoon' | 'fullMoonDateStr' | 'newMoonDateStr'> {
  // Define phase based on age thresholds in a 29.53 days cycle
  if (age < 1.84) {
    return { phaseName: 'New Moon', icon: '🌑', isReversalZone: true };
  } else if (age < 5.53) {
    return { phaseName: 'Waxing Crescent', icon: '🌒', isReversalZone: false };
  } else if (age < 9.22) {
    return { phaseName: 'First Quarter', icon: '🌓', isReversalZone: false };
  } else if (age < 12.91) {
    return { phaseName: 'Waxing Gibbous', icon: '🌔', isReversalZone: false };
  } else if (age < 16.61) {
    return { phaseName: 'Full Moon', icon: '🌕', isReversalZone: true };
  } else if (age < 20.30) {
    return { phaseName: 'Waning Gibbous', icon: '🌖', isReversalZone: false };
  } else if (age < 24.00) {
    return { phaseName: 'Last Quarter', icon: '🌗', isReversalZone: false };
  } else if (age < 27.68) {
    return { phaseName: 'Waning Crescent', icon: '🌘', isReversalZone: false };
  } else {
    return { phaseName: 'New Moon', icon: '🌑', isReversalZone: true };
  }
}

export function useLunarPhase() {
  const [lunarData, setLunarData] = useState<LunarPhaseData | null>(null);

  useEffect(() => {
    const updatePhase = () => {
      const now = new Date();
      const age = calcPhase(now);
      const details = getPhaseDetails(age);
      
      const cyclePercent = Math.round((age / 29.530588853) * 100);
      
      // Countdown calculations:
      const daysToNewMoon = 29.530588853 - age;
      
      let daysToFullMoon = 14.7652944265 - age;
      if (daysToFullMoon < 0) {
        daysToFullMoon += 29.530588853;
      }
      
      const formatEventDate = (days: number) => {
        const eventDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      };
      
      const fullMoonDateStr = formatEventDate(daysToFullMoon);
      const newMoonDateStr = formatEventDate(daysToNewMoon);

      setLunarData({ 
        age, 
        ...details,
        cyclePercent,
        daysToFullMoon: Math.round(daysToFullMoon),
        daysToNewMoon: Math.round(daysToNewMoon),
        fullMoonDateStr,
        newMoonDateStr
      });
    };

    updatePhase();
    // Re-calculate every hour since moon phase changes slowly
    const interval = setInterval(updatePhase, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  return lunarData;
}

