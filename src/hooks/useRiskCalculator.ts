import { useMemo } from 'react';

export interface CalculationResults {
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

export function useRiskCalculator(
  direction: 'Long' | 'Short',
  equity: number,
  riskPercent: number,
  slPercent: number,
  leverage: number,
  entryPrice: number,
  tpPrice: number
) {
  const calc = useMemo<CalculationResults>(() => {
    const safeSlPercent = Math.max(0.01, slPercent);
    const safeLeverage = Math.max(1, leverage);
    const safeEntryPrice = Math.max(0.01, entryPrice);

    const maxLeverage = 100 / (safeSlPercent + 1);
    const absoluteMaxLeverage = 100 / safeSlPercent;
    const riskUsd = equity * (riskPercent / 100);
    const positionUsd = riskUsd / (safeSlPercent / 100);
    const marginUsd = positionUsd / safeLeverage;
    const contractBtc = positionUsd / safeEntryPrice;

    const slPrice = direction === 'Long'
      ? safeEntryPrice - (safeEntryPrice * (safeSlPercent / 100))
      : safeEntryPrice + (safeEntryPrice * (safeSlPercent / 100));

    const liqPrice = direction === 'Long'
      ? safeEntryPrice * (1 - (1 / safeLeverage))
      : safeEntryPrice * (1 + (1 / safeLeverage));

    const tpDistanceRaw = Math.abs(safeEntryPrice - tpPrice) / safeEntryPrice;
    const rewardUsd = positionUsd * tpDistanceRaw;
    const rrr = tpDistanceRaw / (safeSlPercent / 100);
    const isLiqBeforeSl = safeLeverage > absoluteMaxLeverage;

    return {
      maxLeverage,
      absoluteMaxLeverage,
      riskUsd,
      positionUsd,
      marginUsd,
      contractBtc,
      slPrice,
      liqPrice,
      tpDistance: tpDistanceRaw * 100,
      rewardUsd,
      rrr,
      isLiqBeforeSl
    };
  }, [direction, equity, riskPercent, slPercent, leverage, entryPrice, tpPrice]);

  const fib = useMemo(() => {
    const safeSlPercent = Math.max(0.01, slPercent);
    const safeEntryPrice = Math.max(0.01, entryPrice);
    const mult = direction === 'Long' ? 1 : -1;
    
    return {
      tp1: safeEntryPrice * (1 + mult * ((safeSlPercent * 1.618) / 100)),
      tp2: safeEntryPrice * (1 + mult * ((safeSlPercent * 2.618) / 100)),
      tp3: safeEntryPrice * (1 + mult * ((safeSlPercent * 3.618) / 100)),
      r1: calc.riskUsd * 1.618,
      r2: calc.riskUsd * 2.618,
      r3: calc.riskUsd * 3.618
    };
  }, [direction, slPercent, entryPrice, calc.riskUsd]);

  const gauge = useMemo(() => {
    const minGaugeRrr = -1.2;
    const maxGaugeRrr = 4.2;
    const getPct = (r: number) => Math.max(0, Math.min(100, ((r - minGaugeRrr) / (maxGaugeRrr - minGaugeRrr)) * 100));

    const isTpCorrectSide = direction === 'Long' ? tpPrice >= entryPrice : tpPrice <= entryPrice;
    const directionalRrr = isTpCorrectSide ? calc.rrr : -calc.rrr;

    return {
      tp: getPct(directionalRrr),
      sl: getPct(-1.0),
      entry: getPct(0.0),
      tp1: getPct(1.618),
      tp2: getPct(2.618),
      tp3: getPct(3.618)
    };
  }, [direction, entryPrice, tpPrice, calc.rrr]);

  return { calc, fib, gauge };
}
