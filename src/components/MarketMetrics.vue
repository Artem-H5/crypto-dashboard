<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useMarketInfo, type MarketInfo } from '../composables/useMarketInfo';

const props = defineProps<{
  symbol: string;
}>();

const { loadMarketInfo } = useMarketInfo();

const info = ref<MarketInfo | null>(null);
const infoLoading = ref(false);
const infoError = ref<string | null>(null);

const formatNumberCompact = (
  val: number | null,
  opts?: { withSymbol?: boolean }
) => {
  if (val === null) return '—';
  const abs = Math.abs(val);
  let formatted: string;
  if (abs >= 1_000_000_000) {
    formatted = `${(val / 1_000_000_000).toFixed(2)}b`;
  } else if (abs >= 1_000_000) {
    formatted = `${(val / 1_000_000).toFixed(2)}m`;
  } else if (abs >= 1_000) {
    formatted = `${(val / 1_000).toFixed(2)}k`;
  } else {
    formatted = val.toLocaleString();
  }
  return opts?.withSymbol ? `$${formatted}` : formatted;
};

onMounted(() => {
  loadInfo();
});

watch(
  () => props.symbol,
  () => {
    loadInfo();
  }
);

async function loadInfo() {
  if (!props.symbol) return;
  infoLoading.value = true;
  infoError.value = null;
  try {
    info.value = await loadMarketInfo(props.symbol);
  } catch (e: any) {
    console.error(e);
    infoError.value = e?.message ?? 'Failed to load market info.';
    info.value = null;
  } finally {
    infoLoading.value = false;
  }
}

const metrics = computed(() => {
  const m = info.value;
  if (!m) return [];

  return [
    {
      key: 'change24h',
      label: 'Change (24h)',
      display: m.change24h !== null ? m.change24h.toFixed(2) + '%' : '—',
      color: (m.change24h ?? 0) >= 0 ? 'green' : 'red',
    },
    {
      key: 'marketCap',
      label: 'Market cap',
      display: formatNumberCompact(m.marketCap, { withSymbol: true }),
    },
    {
      key: 'volume24h',
      label: 'Volume (24h)',
      display: formatNumberCompact(m.volume24h, { withSymbol: true }),
    },
    {
      key: 'supply',
      label: 'Supply',
      display: formatNumberCompact(m.circulating),
      extra: m.maxSupply !== null ? formatNumberCompact(m.maxSupply) : null,
    },
  ];
});
</script>

<template>
  <v-col cols="12" lg="8" class="d-flex align-center">
    <div v-if="infoLoading" class="d-flex align-center">
      <v-progress-circular indeterminate size="20" class="mr-2" />
      <span>Loading market data...</span>
    </div>
    <p v-else-if="infoError" class="mb-0 text-error">
      {{ infoError }}
    </p>

    <v-row v-else-if="info" class="w-100" align="stretch">
      <v-col
        v-for="metric in metrics"
        :key="metric.key"
        cols="6"
        sm="3"
        class="pa-2"
      >
        <v-card class="metric-card pa-2 px-3" variant="flat">
          <v-card-subtitle class="pa-0 ma-0 text-caption opacity-75">
            {{ metric.label }}
          </v-card-subtitle>

          <v-card-title
            class="metric-value pa-0 ma-0"
            :style="metric.color ? { color: metric.color } : {}"
          >
            {{ metric.display }}
            <span v-if="metric.extra"> / {{ metric.extra }} </span>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-col>
</template>

<style scoped>
.metric-card {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.v-theme--dark .metric-card {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
}

.metric-value {
  font-size: 15px;
}
</style>
