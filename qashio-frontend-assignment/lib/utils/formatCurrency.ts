export function formatCurrency(value: number): string {
  const decimals = String(value).split('.')[1]?.length ?? 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.max(2, decimals),
  }).format(value);
}
