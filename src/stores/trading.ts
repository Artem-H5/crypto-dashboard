import { defineStore } from 'pinia';
import type { Market } from '../mock/markets';
import { markets } from '../mock/markets';

export type TradeType = 'BUY' | 'SELL';

export interface Trade {
  id: number;
  symbol: string;
  type: TradeType;
  price: number;
  amount: number;
  total: number;
  createdAt: string;
}

export interface TradingState {
  balances: Record<string, number>;
  trades: Trade[];
}

function createInitialBalances(): Record<string, number> {
  const balances: Record<string, number> = {};

  markets.forEach((m: Market) => {
    balances[m.symbol] = 0;
  });

  balances['USDT'] = 10_000;

  return balances;
}

export const useTradingStore = defineStore('trading', {
  state: (): TradingState => ({
    balances: createInitialBalances(),
    trades: [],
  }),

  actions: {
    placeOrder(payload: {
      symbol: string;
      type: TradeType;
      price: number;
      amount: number;
    }): string | null {
      const { symbol, type, price, amount } = payload;

      if (price <= 0 || amount <= 0) {
        return 'Price and amount must be greater than zero.';
      }

      const total = price * amount;

      if (!this.balances[symbol]) {
        this.balances[symbol] = 0;
      }

      if (type === 'BUY') {
        const usdtBalance = this.balances['USDT'] ?? 0;
        if (usdtBalance < total) {
          return 'Insufficient USDT to buy.';
        }

        this.balances['USDT'] = usdtBalance - total;
        this.balances[symbol] += amount;
      } else {
        if (this.balances[symbol] < amount) {
          return `Insufficient ${symbol} to sell.`;
        }

        this.balances[symbol] -= amount;
        this.balances['USDT'] = (this.balances['USDT'] ?? 0) + total;
      }

      const trade: Trade = {
        id: Date.now(),
        symbol,
        type,
        price,
        amount,
        total,
        createdAt: new Date().toISOString(),
      };

      this.trades.push(trade);

      return null;
    },
  },
});
