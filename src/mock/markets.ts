export interface Market {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export const markets: Market[] = [
  { id: 1, symbol: 'BTC', name: 'Bitcoin', price: 42150, change24h: 1.2 },
  { id: 2, symbol: 'ETH', name: 'Ethereum', price: 2225, change24h: -0.8 },
  { id: 3, symbol: 'SOL', name: 'Solana', price: 95.3, change24h: 4.6 },
  { id: 4, symbol: 'XRP', name: 'XRP', price: 0.52, change24h: 0.3 },
  { id: 5, symbol: 'ADA', name: 'Cardano', price: 0.62, change24h: -1.5 },
];
