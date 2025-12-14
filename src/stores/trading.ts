import { defineStore } from 'pinia';

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

type PersistedPortfolio = {
  balances: Record<string, number>;
  trades: Trade[];
};

const LS_KEY = 'portfolio';

const loadPortfolio = (): PersistedPortfolio => {
  if (typeof window === 'undefined') {
    return { balances: {}, trades: [] };
  }
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { balances: {}, trades: [] };
  } catch {
    return { balances: {}, trades: [] };
  }
};

const savePortfolio = (data: PersistedPortfolio) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
};

function createInitialBalances(): Record<string, number> {
  const balances: Record<string, number> = {};

  balances['USDT'] = 10_000;

  return balances;
}

export const useTradingStore = defineStore('trading', {
  state: (): TradingState => {
    const { balances, trades } = loadPortfolio();
    return {
      balances: Object.keys(balances).length
        ? balances
        : createInitialBalances(),
      trades,
    };
  },

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
      const EPS = 1e-9;

      if (this.balances[symbol] === undefined) {
        this.balances[symbol] = 0;
      }

      if (type === 'BUY') {
        const usdtBalance = this.balances['USDT'] ?? 0;
        if (usdtBalance + EPS < total) {
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

      savePortfolio({ balances: this.balances, trades: this.trades });

      return null;
    },
  },
});
