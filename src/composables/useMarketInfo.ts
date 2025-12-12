export interface MarketInfo {
  id: string;
  symbol: string;
  name: string;
  marketCap: number | null;
  volume24h: number | null;
  change24h: number | null;
  circulating: number | null;
  maxSupply: number | null;
}

export const useMarketInfo = () => {
  const loadMarketInfo = async (symbol: string): Promise<MarketInfo> => {
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

    const infoUrl = `https://api.coingecko.com/api/v3/coins/${match.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const infoRes = await fetch(infoUrl);

    if (!infoRes.ok) {
      throw new Error(`Failed to load market info (${infoRes.status}).`);
    }

    const data = await infoRes.json();
    const md = data?.market_data ?? {};

    const pct = (v: any) =>
      typeof v === 'number' && Number.isFinite(v) ? Number(v) : null;
    const num = (v: any) =>
      typeof v === 'number' && Number.isFinite(v) ? Number(v) : null;

    return {
      id: String(data?.id ?? match.id),
      symbol: String(data?.symbol ?? match.symbol ?? query).toUpperCase(),
      name: String(data?.name ?? match.name ?? query),
      marketCap: num(md.market_cap?.usd),
      volume24h: num(md.total_volume?.usd),
      change24h: pct(md.price_change_percentage_24h),
      circulating: num(md.circulating_supply),
      maxSupply: num(md.max_supply),
    };
  };

  return {
    loadMarketInfo,
  };
};
