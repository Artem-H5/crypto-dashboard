export interface MarketChart {
  prices: number[];
  labels: string[];
  timestamps: number[];
}

export const useMarketChart = () => {
  const loadMarketChart = async (symbol: string): Promise<MarketChart> => {
    const query = symbol.trim().toUpperCase();
    if (!query) {
      throw new Error('Symbol is required.');
    }

    const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(
      query
    )}`;
    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok) {
      throw new Error(`Failed to search coin (${searchRes.status}).`);
    }

    const searchData = await searchRes.json();
    const coins = searchData?.coins ?? [];
    const match =
      coins.find((c: any) => String(c.symbol).toUpperCase() === query) ??
      coins[0];

    if (!match?.id) {
      throw new Error('Coin not found on CoinGecko.');
    }

    const requests: Array<{
      kind: 'hourly' | 'daily';
      url: string;
    }> = [
      {
        kind: 'hourly',
        url: `https://api.coingecko.com/api/v3/coins/${match.id}/market_chart?vs_currency=usd&days=30`,
      },
      {
        kind: 'daily',
        url: `https://api.coingecko.com/api/v3/coins/${match.id}/market_chart?vs_currency=usd&days=30&interval=daily`,
      },
    ];

    let lastError: any = null;

    for (const req of requests) {
      try {
        const chartRes = await fetch(req.url);

        if (!chartRes.ok) {
          throw new Error(`Failed to load chart data (${chartRes.status}).`);
        }

        const chartData = await chartRes.json();

        if (!Array.isArray(chartData?.prices)) {
          throw new Error('Invalid chart response.');
        }

        const parsed = chartData.prices as [number, number][];
        if (!parsed.length) {
          throw new Error('No price points returned for this period.');
        }

        if (req.kind === 'hourly') {
          const prices: number[] = [];
          const labels: string[] = [];
          const timestamps: number[] = [];
          parsed.forEach(([ts, p], idx) => {
            if (idx % 4 !== 0) return;
            prices.push(Number(p.toFixed(4)));
            labels.push(
              new Date(ts).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC',
              })
            );
            timestamps.push(ts);
          });

          if (!prices.length) {
            throw new Error('No price points returned for this period.');
          }

          return { prices, labels, timestamps };
        }

        const prices: number[] = [];
        const labels: string[] = [];
        const timestamps: number[] = [];

        for (const [ts, p] of parsed) {
          const label = new Date(ts).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          });

          if (labels[labels.length - 1] === label) {
            prices[prices.length - 1] = Number(p.toFixed(4));
            timestamps[timestamps.length - 1] = ts;
          } else {
            labels.push(label);
            prices.push(Number(p.toFixed(4)));
            timestamps.push(ts);
          }
        }

        return { prices, labels, timestamps };
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    throw lastError ?? new Error('Failed to load chart data.');
  };

  return {
    loadMarketChart,
  };
};
