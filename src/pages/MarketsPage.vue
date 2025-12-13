<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useMarkets } from '../composables/useMarkets';

const router = useRouter();
const { markets, error, loadMarkets, loadMoreLocal, hasMore } = useMarkets();

const initialLoading = ref(true);
const loadingMore = ref(false);
const priceFlash = ref<Record<string, 'up' | 'down'>>({});

const marketsErrorText = computed(() => {
  if (!error.value) return null;
  return `Unable to load markets. Please try again. (${error.value})`;
});

function goToMarket(symbol: string) {
  router.push(`/markets/${symbol}`);
}

let intervalId: number | undefined;

const loadMore = async () => {
  loadingMore.value = true;
  await new Promise((resolve) => setTimeout(resolve, 100));
  loadMoreLocal();
  loadingMore.value = false;
};

const retryLoad = async () => {
  initialLoading.value = true;
  await loadMarkets();
  initialLoading.value = false;
};

const flashClass = (marketId: string) => {
  const dir = priceFlash.value[marketId];
  if (dir === 'up') return 'flash-up';
  if (dir === 'down') return 'flash-down';
  return '';
};

watch(
  markets,
  (next, prev) => {
    const prevPrices = new Map((prev ?? []).map((m) => [m.id, m.price]));
    const updates: Record<string, 'up' | 'down'> = { ...priceFlash.value };

    next.forEach((m) => {
      const prevPrice = prevPrices.get(m.id);
      if (prevPrice === undefined || prevPrice === m.price) return;
      const dir = m.price > prevPrice ? 'up' : 'down';
      updates[m.id] = dir;

      window.setTimeout(() => {
        if (priceFlash.value[m.id] === dir) {
          const copy = { ...priceFlash.value };
          delete copy[m.id];
          priceFlash.value = copy;
        }
      }, 600);
    });

    priceFlash.value = updates;
  },
  { deep: true }
);

onMounted(async () => {
  await loadMarkets();
  initialLoading.value = false;

  intervalId = window.setInterval(loadMarkets, 15000);
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

    <div v-if="marketsErrorText && !initialLoading" class="my-3">
      <v-alert type="error" variant="tonal" density="comfortable" class="mb-2">
        {{ marketsErrorText }}
      </v-alert>
      <v-btn size="small" @click="retryLoad" :loading="initialLoading">
        Retry
      </v-btn>
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
          :class="['market-row', flashClass(m.id)]"
        >
          <td>{{ m.rank }}</td>
          <td>
            <img
              :src="m.image"
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
            {{ m.change24h.toFixed(2) }}%
          </td>
        </tr>
      </tbody>
    </v-table>
    <div v-else-if="!initialLoading && !marketsErrorText" class="my-3">
      No markets to display right now.
    </div>
    <div class="d-flex justify-center mt-4">
      <v-btn v-if="hasMore && !loadingMore" @click="loadMore">Load more</v-btn>
      <p v-else-if="!loadingMore && !error">No more markets to load.</p>
      <div v-if="loadingMore" class="my-4">
        <v-progress-circular indeterminate />
      </div>
    </div>
  </div>
</template>

<style scoped>
.market-row {
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.v-theme--light .market-row:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
.v-theme--dark .market-row:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.flash-up {
  background-color: rgba(46, 204, 113, 0.22);
}

.flash-down {
  background-color: rgba(231, 76, 60, 0.22);
}
</style>
