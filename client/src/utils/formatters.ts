// Format CHF currency
export const formatCHF = (value: number | string | undefined): string => {
  if (value === undefined || value === null) return '0 CHF';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF`;
};

// Format percentage
export const formatPercent = (value: number | undefined): string => {
  if (value === undefined) return '0%';
  return `${(value * 100).toFixed(0)}%`;
};
