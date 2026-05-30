const STATIC_RATES_TO_CAD: Record<string, number> = {
  CAD: 1,
  USD: 1.37,
  EUR: 1.50,
  GBP: 1.73,
  CHF: 1.55,
  AUD: 0.91,
};

export function toCad(amount: number, currency: string): number {
  const upper = currency.toUpperCase();
  const rate = STATIC_RATES_TO_CAD[upper];
  if (!rate) {
    console.warn(`Unknown currency ${currency}, treating as CAD`);
    return amount;
  }
  return Math.round(amount * rate * 100) / 100;
}
