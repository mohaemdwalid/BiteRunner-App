export function formatCurrency(amount: number, currency = 'EGP'): string {
  return `${amount.toFixed(0)} ${currency}`;
}
