export interface Market {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  history: number[];
}

export const markets: Market[] = [
  {
    id: 1,
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 42150,
    change24h: 1.2,
    history: [39500, 40200, 41000, 40500, 41500, 42000, 42150],
  },
  {
    id: 2,
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2225,
    change24h: -0.8,
    history: [2150, 2180, 2200, 2250, 2230, 2210, 2225],
  },
  {
    id: 3,
    symbol: 'SOL',
    name: 'Solana',
    price: 95.3,
    change24h: 4.6,
    history: [80, 82, 85, 90, 92, 94, 95.3],
  },
  {
    id: 4,
    symbol: 'XRP',
    name: 'XRP',
    price: 0.52,
    change24h: 0.3,
    history: [0.48, 0.49, 0.5, 0.51, 0.5, 0.51, 0.52],
  },
  {
    id: 5,
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.62,
    change24h: -1.5,
    history: [0.65, 0.64, 0.63, 0.62, 0.61, 0.62, 0.62],
  },
];
