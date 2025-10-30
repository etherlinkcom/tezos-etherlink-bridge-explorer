export function toDecimalValue(amount: number, decimals: number): number {
  return amount / Math.pow(10, decimals);
}
