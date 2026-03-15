import { TrendingDown, TrendingUp } from "lucide-react";

interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

const FALLBACK_DATA: CoinPrice[] = [
  { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 67432.0, price_change_percentage_24h: 2.34, image: "" },
  { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3521.18, price_change_percentage_24h: 1.87, image: "" },
  { id: "binancecoin", symbol: "bnb", name: "BNB", current_price: 594.32, price_change_percentage_24h: -0.45, image: "" },
  { id: "solana", symbol: "sol", name: "Solana", current_price: 148.56, price_change_percentage_24h: 3.12, image: "" },
  { id: "ripple", symbol: "xrp", name: "XRP", current_price: 0.6234, price_change_percentage_24h: -1.23, image: "" },
];

async function fetchPrices(): Promise<CoinPrice[]> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,ripple&order=market_cap_desc&sparkline=false",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return FALLBACK_DATA;
    return await res.json();
  } catch {
    return FALLBACK_DATA;
  }
}

function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

export async function CryptoTicker() {
  const prices = await fetchPrices();

  return (
    <section className="border-y bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto py-3 scrollbar-hide">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Prices
          </span>
          {prices.map((coin) => {
            const isPositive = coin.price_change_percentage_24h >= 0;
            return (
              <div
                key={coin.id}
                className="flex shrink-0 items-center gap-2.5"
              >
                <span className="text-sm font-semibold uppercase">
                  {coin.symbol}
                </span>
                <span className="text-sm text-foreground">
                  {formatPrice(coin.current_price)}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    isPositive
                      ? "text-[hsl(var(--chart-green))]"
                      : "text-[hsl(var(--chart-red))]"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
