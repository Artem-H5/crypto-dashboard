import { ref } from 'vue';
import type { Market } from '../types/market';

const markets = ref<Market[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

function generateHistoryFromPrice(price: number): number[] {
  const points = 7;
  const history: number[] = [];
  let current = price;

  for (let i = points - 1; i >= 0; i--) {
    const delta = price * 0.02 * (Math.random() - 0.5);
    current = current + delta;
    history.unshift(Number(current.toFixed(2)));
  }

  return history;
}

export function useApi() {
  async function loadMarkets() {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch('https://api.coinpaprika.com/v1/tickers');

      if (!res.ok) {
        if (res.status === 402) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              'API limit reached. Please wait before next request.'
          );
        }
        throw new Error(`Failed to fetch markets: ${res.status}`);
      }

      const data = await res.json();

      const slice = (data as any[]).slice(0, 20);

      markets.value = slice.map((item: any) => {
        const usd = item.quotes?.USD ?? {};
        const price = Number(usd.price ?? 0);
        const change = Number(usd.percent_change_24h ?? 0);
        const marketCap = Number(usd.market_cap ?? 0);

        return {
          id: item.id as string,
          rank: Number(item.rank),
          symbol: String(item.symbol).toUpperCase(),
          name: item.name as string,
          price,
          change24h: change,
          marketCap,
          history: generateHistoryFromPrice(price),
        } satisfies Market;
      });
    } catch (e: any) {
      console.error(e);
      error.value = e?.message ?? 'Unknown error';
      markets.value = [];
    } finally {
      loading.value = false;
    }
  }

  return {
    markets,
    loading,
    error,
    loadMarkets,
  };
}
