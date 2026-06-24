/** 1 XLM = 10,000,000 stroops. All contract amounts are in stroops (i128). */
export const STROOPS_PER_XLM = 10_000_000n;

export function xlmToStroops(xlm: number): bigint {
  // Avoid floating point drift: work in integer cents-of-a-stroop space.
  const rounded = Math.round(xlm * 10_000_000);
  return BigInt(rounded);
}

export function stroopsToXlm(stroops: bigint | number): number {
  const big = typeof stroops === "bigint" ? stroops : BigInt(Math.trunc(stroops));
  return Number(big) / 10_000_000;
}

export function formatXlm(stroops: bigint | number): string {
  const value = stroopsToXlm(stroops);
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  })} XLM`;
}

export function truncateAddress(address: string, lead = 4, tail = 4): string {
  if (address.length <= lead + tail + 3) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}
