<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTradingStore } from '../stores/trading';
import { useMarkets } from '../composables/useMarkets';
import { useMarketChart } from '../composables/useMarketChart';
import PriceChart from '../components/PriceChart.vue';
import MarketMetrics from '../components/MarketMetrics.vue';

const route = useRoute();
const tradingStore = useTradingStore();

const { markets, loading, error, loadMarkets } = useMarkets();

const { loadMarketChart } = useMarketChart();

const symbol = computed(() => String(route.params.symbol).toUpperCase());

const market = computed(() =>
  markets.value.find((m) => m.symbol === symbol.value)
);

const chartPrices = ref<number[]>([]);
const chartLabels = ref<string[]>([]);
const chartTimestamps = ref<number[]>([]);
const chartLoading = ref(false);
const chartError = ref<string | null>(null);

const type = ref<'BUY' | 'SELL'>('BUY');
const price = ref(market.value?.price ?? 0);
const amount = ref(0);
const errorMessage = ref<string | null>(null);

const currentPrice = computed<number>(() => {
  const lastPrice = chartPrices.value[chartPrices.value.length - 1];
  if (typeof lastPrice === 'number') {
    return lastPrice;
  }
  return market.value?.price ?? 0;
});

const total = computed(() => {
  return price.value * amount.value;
});

const maxAmount = computed(() => {
  const usdtBalance = tradingStore.balances['USDT'] ?? 0;
  const assetBalance = tradingStore.balances[symbol.value] ?? 0;

  if (type.value === 'SELL') {
    return assetBalance;
  }

  if (type.value === 'BUY' && price.value > 0) {
    return Number((usdtBalance / price.value).toFixed(6));
  }

  return 0;
});

const displayedPrices = computed(() => {
  if (chartPrices.value.length) {
    return chartPrices.value;
  }
  return market.value?.history ?? [];
});

const historyLabels = computed(() => {
  if (chartLabels.value.length) return chartLabels.value;
  if (!market.value) return [];

  const len = market.value.history.length;
  return market.value.history.map((_, index) => {
    if (index === len - 1) return 'Now';
    const diff = len - 1 - index;
    return `T-${diff}`;
  });
});

const setMax = () => {
  amount.value = maxAmount.value;
};

const submitOrder = () => {
  if (!market.value) {
    errorMessage.value = 'Market not found.';
    return;
  }

  const err = tradingStore.placeOrder({
    symbol: symbol.value,
    type: type.value,
    price: price.value,
    amount: amount.value,
  });

  if (err) {
    errorMessage.value = err;
  } else {
    errorMessage.value = null;
    amount.value = 0;
  }
};

watch(
  currentPrice,
  (p) => {
    price.value = p;
  },
  { immediate: true }
);

watch(type, () => {
  errorMessage.value = null;
  amount.value = 0;
});

const loadChartData = async () => {
  if (!symbol.value) return;

  chartLoading.value = true;
  chartError.value = null;

  try {
    const { prices, labels, timestamps } = await loadMarketChart(symbol.value);
    chartPrices.value = prices;
    chartLabels.value = labels;
    chartTimestamps.value = timestamps;
  } catch (e: any) {
    console.error(e);
    chartError.value =
      e?.message ?? 'Failed to load chart data. Please try again.';
    chartPrices.value = [];
    chartLabels.value = [];
    chartTimestamps.value = [];
  } finally {
    chartLoading.value = false;
  }
};

onMounted(() => {
  loadMarkets();
  loadChartData();
});

watch(symbol, () => {
  loadChartData();
  errorMessage.value = null;
});
</script>

<template>
  <div>
    <v-row class="mb-4" align="start">
      <v-col cols="12" lg="4">
        <div class="d-flex flex-column ga-2">
          <div class="d-flex align-center ga-1">
            <v-btn
              class="ml-n4"
              variant="text"
              icon
              @click="$router.push('/markets')"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h1 class="mb-1">
              <img
                v-if="market?.id"
                :src="`https://static.coinpaprika.com/coin/${market.id}/logo.png`"
                @error="(e: any) => (e.target as HTMLImageElement).style.display = 'none'"
                width="30"
                height="30"
                alt=""
                class="mb-1"
                style="vertical-align: middle; margin-right: 6px"
              />
              {{ market ? market.name : 'Unknown market' }}
              <span v-if="market">({{ market.symbol }})</span>
            </h1>
          </div>
          <p class="mb-0">
            Current price:
            <strong
              >${{ Number(currentPrice.toFixed(2)).toLocaleString() }}</strong
            >
          </p>
        </div>
      </v-col>
      <MarketMetrics :symbol="symbol" />
    </v-row>

    <div v-if="loading" class="my-4">
      <v-progress-circular indeterminate />
    </div>

    <p v-if="error" style="color: red">
      {{ error }}
    </p>

    <div v-if="market">
      <v-card class="mb-4" elevation="2">
        <v-card-title>Price (last 30 days)</v-card-title>
        <v-card-text>
          <div v-if="chartLoading" class="my-2">
            <v-progress-circular indeterminate />
          </div>
          <p v-else-if="chartError" style="color: red">
            {{ chartError }}
          </p>
          <PriceChart
            v-else
            :prices="displayedPrices"
            :labels="historyLabels"
            :timestamps="chartTimestamps"
          />
        </v-card-text>
      </v-card>

      <v-card class="mb-4" flat>
        <v-card-title>Place order</v-card-title>

        <v-card-text>
          <div class="d-none d-sm-flex align-center mb-4" style="gap: 8px">
            <v-btn
              :color="type === 'BUY' ? 'success' : undefined"
              variant="elevated"
              @click="type = 'BUY'"
            >
              BUY
            </v-btn>

            <v-btn
              :color="type === 'SELL' ? 'error' : undefined"
              variant="elevated"
              @click="type = 'SELL'"
            >
              SELL
            </v-btn>
          </div>

          <v-row class="d-flex d-sm-none ga-1" justify="center">
            <v-col col="12">
              <v-btn
                block
                size="large"
                :color="type === 'BUY' ? 'success' : undefined"
                variant="elevated"
                @click="type = 'BUY'"
              >
                BUY
              </v-btn>
            </v-col>
            <v-col col="12">
              <v-btn
                block
                size="large"
                :color="type === 'SELL' ? 'error' : undefined"
                variant="elevated"
                @click="type = 'SELL'"
              >
                SELL
              </v-btn>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="price"
                type="number"
                label="Price"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="amount"
                type="number"
                label="Amount"
              >
                <template #append-inner>
                  <v-btn variant="text" size="x-small" @click="setMax">
                    All
                  </v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <p class="mt-2">
            Total: <strong>${{ total.toFixed(2) }}</strong>
          </p>

          <p class="mt-2">
            Your {{ symbol }} balance:
            <strong>{{
              (tradingStore.balances[symbol] ?? 0).toFixed(6)
            }}</strong>
            <br />
            Your USDT balance:
            <strong>{{
              (tradingStore.balances['USDT'] ?? 0).toFixed(2)
            }}</strong>
          </p>

          <p v-if="errorMessage" class="mt-2" style="color: red">
            {{ errorMessage }}
          </p>
        </v-card-text>

        <v-card-actions>
          <!-- Desktop CTA -->
          <v-btn
            class="d-flex d-sm-none mt-4"
            variant="tonal"
            block
            size="large"
            :color="type === 'BUY' ? 'success' : 'error'"
            @click="submitOrder"
          >
            {{ type === 'BUY' ? 'Buy' : 'Sell' }} {{ symbol }}
          </v-btn>
          <!-- Mobile CTA -->
          <v-btn
            :color="type === 'BUY' ? 'success' : 'error'"
            @click="submitOrder"
          >
            {{ type === 'BUY' ? 'Buy' : 'Sell' }} {{ symbol }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div v-else-if="!loading && !error">
      <p>Market not found.</p>
    </div>
  </div>
</template>
