export interface Market {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  image?: string;
  price: number;
  change24h: number;
  marketCap: number;
  history: number[];
}
