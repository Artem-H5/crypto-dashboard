import { ref } from 'vue';
import type { Market } from '../types/market';

const markets = ref<Market[]>([]);
const allMarkets = ref<Market[]>([]);
const page = ref(1);
const perPage = 20;
const hasMore = ref(true);
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

export const useMarkets = () => {
  const loadMarkets = async (): Promise<Market[]> => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=220&page=1&sparkline=false&price_change_percentage=24h`
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch markets: ${res.status}`);
      }

      const data = await res.json();

      const prevPriceById = new Map(
        allMarkets.value.map((m) => [m.id, m.price])
      );

      const mapped = (data as any[]).map((item: any) => {
        const price = Number(item.current_price ?? 0);
        const change = Number(item.price_change_percentage_24h ?? 0);
        const marketCap = Number(item.market_cap ?? 0);
        const prevPrice = prevPriceById.get(item.id);
        let priceChange: 'up' | 'down' | 'same' = 'same';
        if (prevPrice !== undefined) {
          if (price > prevPrice) priceChange = 'up';
          else if (price < prevPrice) priceChange = 'down';
        }

        return {
          id: item.id as string,
          rank: Number(item.market_cap_rank ?? 0),
          symbol: String(item.symbol).toUpperCase(),
          name: item.name as string,
          image: item.image as string | undefined,
          price,
          change24h: change,
          marketCap,
          history: generateHistoryFromPrice(price),
          priceChange,
        } satisfies Market;
      });

      const currentPage = Math.max(1, page.value);

      allMarkets.value = mapped;

      const maxPage = Math.max(1, Math.ceil(allMarkets.value.length / perPage));
      const nextPage = Math.min(currentPage, maxPage);
      page.value = nextPage;

      const end = nextPage * perPage;
      markets.value = allMarkets.value.slice(0, end);
      hasMore.value = markets.value.length < allMarkets.value.length;

      return markets.value;
    } catch (e: any) {
      console.error(e);
      error.value = e?.message ?? 'Unknown error';
      markets.value = [];
      allMarkets.value = [];
      hasMore.value = false;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const loadMoreLocal = () => {
    const nextPage = page.value + 1;
    const end = nextPage * perPage;
    markets.value = allMarkets.value.slice(0, end);
    page.value = nextPage;
    hasMore.value = markets.value.length < allMarkets.value.length;
  };

  return {
    markets,
    allMarkets,
    loading,
    error,
    loadMarkets,
    loadMoreLocal,
    page,
    hasMore,
  };
};
