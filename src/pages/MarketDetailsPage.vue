<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTradingStore } from '../stores/trading';
import { useMarkets } from '../composables/useMarkets';
import { useMarketChart } from '../composables/useMarketChart';
import PriceChart from '../components/PriceChart.vue';
import MarketMetrics from '../components/MarketMetrics.vue';
import { useToast } from 'vue-toastification';

const route = useRoute();
const tradingStore = useTradingStore();

const { allMarkets, loading, error, loadMarkets } = useMarkets();

const { loadMarketChart } = useMarketChart();

const toast = useToast();

const symbol = computed(() => String(route.params.symbol).toUpperCase());

const market = computed(() =>
  allMarkets.value.find((m) => m.symbol === symbol.value)
);

const marketsErrorText = computed(() => {
  if (!error.value) return null;
  return `Failed to load markets. Please try again. (${error.value})`;
});

const chartPrices = ref<number[]>([]);
const chartLabels = ref<string[]>([]);
const chartTimestamps = ref<number[]>([]);
const chartLoading = ref(false);
const chartError = ref<string | null>(null);

const type = ref<'BUY' | 'SELL'>('BUY');
const price = ref(market.value?.price ?? 0);
const amount = ref(0);
const amountPct = ref(0);

let syncingFromPct = false;
let syncingFromAmount = false;

const blurActive = () => {
  const el = document.activeElement;
  if (el && el instanceof HTMLElement) el.blur();
};

const clamp = (n: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, n));
};

const floorTo = (n: number, decimals: number) => {
  const p = 10 ** decimals;
  return Math.floor(n * p) / p;
};

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
    const precision = 1_000_000;
    const raw = (usdtBalance / price.value) * precision;
    return Math.floor(raw) / precision;
  }

  return 0;
});

watch(
  () => amountPct.value,
  (pct) => {
    if (syncingFromAmount) return;
    syncingFromPct = true;
    const max = maxAmount.value;
    const next = max > 0 ? (max * clamp(pct, 0, 100)) / 100 : 0;
    amount.value = floorTo(next, 6);
    syncingFromPct = false;
  }
);

watch(
  [() => amount.value, () => maxAmount.value],
  () => {
    if (syncingFromPct) return;
    syncingFromAmount = true;
    const max = maxAmount.value;
    const pct = max > 0 ? (amount.value / max) * 100 : 0;
    amountPct.value = Math.round(clamp(pct, 0, 100));
    syncingFromAmount = false;
  },
  { immediate: true }
);

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
    toast.error('Market not found.');
    return;
  }
  const err = tradingStore.placeOrder({
    symbol: symbol.value,
    type: type.value,
    price: price.value,
    amount: amount.value,
  });

  if (err) {
    toast.error(err);
  } else {
    toast.success('Order placed.');
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
    chartError.value = 'Unable to load chart data. Please try again.';
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
                v-if="market?.image"
                :src="market.image"
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
              >${{ Number(market?.price.toFixed(2)).toLocaleString() }}</strong
            >
          </p>
        </div>
      </v-col>
      <MarketMetrics :symbol="symbol" />
    </v-row>

    <div v-if="loading" class="my-4">
      <v-progress-circular indeterminate />
    </div>
    <v-alert
      v-else-if="marketsErrorText"
      type="error"
      variant="tonal"
      class="my-2"
      density="compact"
    >
      {{ marketsErrorText }}
    </v-alert>
    <div v-else-if="!market" class="my-4 text-body-2">
      Could not find this market. Please return to Markets and try again.
    </div>

    <div v-else>
      <v-card class="mb-4" elevation="2">
        <v-card-title>30d chart</v-card-title>
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
          <v-row align="center">
            <!--1 col -->
            <v-col cols="12" sm="4" md="3">
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
            </v-col>

            <!--2 col -->
            <v-col cols="12" sm="8" md="9" class="pb-0">
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <div class="text-caption text-medium-emphasis mb-1">
                    Current price
                  </div>
                  <div class="text-h5 font-weight-bold">
                    ${{ market?.price.toLocaleString() }}
                  </div>
                </v-col>

                <v-col cols="12" sm="6" md="4" class="d-none d-sm-block">
                  <v-text-field
                    v-model.number="amount"
                    type="number"
                    label="Amount"
                    density="compact"
                    hide-details
                    class="mb-0"
                  >
                    <template #append-inner>
                      <v-btn
                        variant="text"
                        size="x-small"
                        style="height: 60%"
                        @click="setMax"
                      >
                        All
                      </v-btn>
                    </template>
                  </v-text-field>
                  <div class="mt-0">
                    <v-slider
                      class="amount-pct-slider"
                      v-model="amountPct"
                      :min="0"
                      :max="100"
                      :step="1"
                      thumb-label
                      @pointerup="blurActive"
                      @pointercancel="blurActive"
                    >
                      <template #thumb-label="{ modelValue }">
                        {{ modelValue }}%
                      </template>
                    </v-slider>
                  </div>
                </v-col>
                <v-col cols="12" class="d-sm-none pb-0">
                  <div class="amount-wrapper">
                    <v-text-field
                      v-model.number="amount"
                      type="number"
                      label="Amount"
                      hide-details
                    >
                      <template #append-inner>
                        <v-btn
                          variant="tonal"
                          size="small"
                          style="height: 70%"
                          @click="setMax"
                        >
                          ALL
                        </v-btn>
                      </template>
                    </v-text-field>

                    <v-slider
                      v-model="amountPct"
                      :min="0"
                      :max="100"
                      :step="1"
                      thumb-label
                      @pointerup="blurActive"
                      @pointercancel="blurActive"
                      class="amount-pct-slider mt-2"
                    >
                      <template #thumb-label="{ modelValue }">
                        {{ modelValue }}%
                      </template>
                    </v-slider>
                  </div>
                </v-col>
              </v-row>
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
  </div>
</template>

<style scoped>
/* Remove focus/hover halo on v-slider thumb */
:deep(.v-slider-thumb__surface::before) {
  content: none !important;
}

:deep(.v-slider-thumb__ripple) {
  display: none !important;
}

:deep(.amount-pct-slider .v-slider-thumb) {
  --v-slider-thumb-size: 16px !important;
}

/* Hide number input arrows */
:deep(input[type='number']::-webkit-outer-spin-button),
:deep(input[type='number']::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

:deep(input[type='number']) {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
