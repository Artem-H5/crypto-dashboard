<script setup lang="ts">
import { computed } from 'vue';
import { useTradingStore } from '../stores/trading';
import { markets } from '../mock/markets';

const tradingStore = useTradingStore();

const balances = computed(() => tradingStore.balances);

const nonZeroBalances = computed(() => {
  return Object.fromEntries(
    Object.entries(tradingStore.balances).filter(([, amount]) => amount > 0)
  );
});

const trades = computed(() =>
  [...tradingStore.trades].sort((a, b) => b.id - a.id)
);

const priceMap = computed(() => {
  const map: Record<string, number> = { USDT: 1 };

  markets.forEach((m) => {
    map[m.symbol] = m.price;
  });

  return map;
});

const totalValue = computed(() => {
  return Object.entries(balances.value).reduce((sum, [asset, amount]) => {
    const price = priceMap.value[asset] ?? 0;
    return sum + amount * price;
  }, 0);
});
</script>

<template>
  <div>
    <h1 class="mb-4">Portfolio</h1>

    <v-card class="mb-6" elevation="2">
      <v-card-title>Total portfolio value</v-card-title>
      <v-card-text>
        <div class="text-h5">${{ totalValue.toFixed(2) }}</div>
      </v-card-text>
    </v-card>

    <h2 class="mb-2">Balances</h2>

    <v-table class="mb-6">
      <thead>
        <tr>
          <th>Asset</th>
          <th>Amount</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(amount, asset) in nonZeroBalances" :key="asset">
          <td>{{ asset }}</td>
          <td>{{ amount }}</td>
        </tr>
      </tbody>
    </v-table>

    <h2 class="mb-2">Trade History</h2>

    <v-table v-if="trades.length">
      <thead>
        <tr>
          <th>Type</th>
          <th>Symbol</th>
          <th>Price</th>
          <th>Amount</th>
          <th>Total</th>
          <th>Time</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="t in trades" :key="t.id">
          <td :style="{ color: t.type === 'BUY' ? 'green' : 'red' }">
            {{ t.type }}
          </td>
          <td>{{ t.symbol }}</td>
          <td>${{ t.price }}</td>
          <td>{{ t.amount }}</td>
          <td>${{ t.total.toFixed(2) }}</td>
          <td>{{ new Date(t.createdAt).toLocaleString() }}</td>
        </tr>
      </tbody>
    </v-table>

    <p v-else>There are no trades at the moment.</p>
  </div>
</template>
