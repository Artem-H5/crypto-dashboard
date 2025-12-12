<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, ref } from 'vue';
import { useMarkets } from '../composables/useMarkets';

const router = useRouter();
const { markets, error, loadMarkets } = useMarkets();

const initialLoading = ref(true);

function goToMarket(symbol: string) {
  router.push(`/markets/${symbol}`);
}

let intervalId: number | undefined;

onMounted(async () => {
  await loadMarkets();
  initialLoading.value = false;

  intervalId = window.setInterval(loadMarkets, 5000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<template>
  <div>
    <h1 class="mb-4">Markets</h1>

    <div v-if="initialLoading" class="my-4">
      <v-progress-circular indeterminate />
    </div>

    <div v-if="error" class="my-2" style="color: red">
      {{ error }}
    </div>

    <v-table v-if="!initialLoading && markets.length">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Symbol</th>
          <th class="d-none d-sm-table-cell">Name</th>
          <th>Price</th>
          <th class="d-none d-sm-table-cell">Market cap</th>
          <th>24h</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="m in markets"
          :key="m.id"
          @click="goToMarket(m.symbol)"
          class="market-row"
        >
          <td>{{ m.rank }}</td>
          <td>
            <img
              :src="`https://static.coinpaprika.com/coin/${m.id}/logo.png`"
              width="20"
              height="20"
              alt=""
              style="vertical-align: middle; margin-right: 6px"
            />
            {{ m.symbol }}
          </td>
          <td class="d-none d-sm-table-cell">{{ m.name }}</td>
          <td>${{ m.price.toLocaleString() }}</td>
          <td class="d-none d-sm-table-cell">
            ${{ m.marketCap.toLocaleString() }}
          </td>
          <td :style="{ color: m.change24h >= 0 ? 'green' : 'red' }">
            {{ m.change24h }}%
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.market-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.v-theme--light .market-row:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.v-theme--dark .market-row:hover {
  background-color: rgba(255, 255, 255, 0.04);
}
</style>
