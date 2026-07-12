import { useState, useEffect } from 'react';

export interface MarketSentiment {
  fngValue: string;
  fngLabel: string;
  lsRatio: string;
}

export function useMarketData() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [marketSession, setMarketSession] = useState<string>('');
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null);

  useEffect(() => {
    // Clock & Session (WIB)
    const updateTime = () => {
      const now = new Date();
      // Format time to WIB (Asia/Jakarta)
      const options: Intl.DateTimeFormatOptions = { 
        timeZone: 'Asia/Jakarta',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      };
      
      const formatter = new Intl.DateTimeFormat('id-ID', options);
      const parts = formatter.formatToParts(now);
      const dateMap = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
      
      setCurrentTime(`${dateMap.year}-${dateMap.month}-${dateMap.day} ${dateMap.hour}:${dateMap.minute}:${dateMap.second} WIB`);
      
      const hour = parseInt(dateMap.hour, 10);
      let session = "Sydney (Low Volatility)";
      if (hour >= 20 && hour <= 23) session = "New York & London Overlap (High Volatility 🔥)";
      else if (hour >= 20 || hour < 4) session = "New York Session (US Market 🇺🇸)";
      else if (hour >= 14 && hour < 20) session = "London Session (EU Market 🇪🇺)";
      else if (hour >= 7 && hour < 14) session = "Tokyo Session (Asian Market 🇯🇵)";
      
      setMarketSession(session);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Fetch Market Sentiment
    Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1').then(res => res.json()),
      fetch('https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1d&limit=1').then(res => res.json())
    ]).then(([fngData, lsData]) => {
      const fng = fngData?.data?.[0];
      const ls = lsData?.[0];
      if (fng && ls) {
        setMarketSentiment({
          fngValue: fng.value,
          fngLabel: fng.value_classification,
          lsRatio: Number(ls.longShortRatio).toFixed(2)
        });
      }
    }).catch(e => console.error('Failed to fetch sentiment', e));

    return () => clearInterval(interval);
  }, []);

  return { currentTime, marketSession, marketSentiment };
}
