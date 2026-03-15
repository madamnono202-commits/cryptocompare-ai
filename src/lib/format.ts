// ---------------------------------------------------------------------------
// Number & currency formatting utilities
// ---------------------------------------------------------------------------

/**
 * Format a number as USD currency.
 */
export function formatCurrency(
  value: number,
  options?: { compact?: boolean; decimals?: number }
): string {
  const { compact = false, decimals } = options ?? {};

  if (compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Auto-detect decimal places based on value size
  const fractionDigits =
    decimals !== undefined
      ? decimals
      : value >= 1
        ? 2
        : value >= 0.01
          ? 4
          : 6;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Format a number with commas.
 */
export function formatNumber(
  value: number,
  options?: { compact?: boolean; decimals?: number }
): string {
  const { compact = false, decimals = 0 } = options ?? {};

  if (compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage value.
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "N/A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
