<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const props = defineProps<{
  prices: number[];
  labels: string[];
  timestamps?: number[];
}>();

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Price (USD)',
      data: props.prices,
      borderColor: '#42a5f5',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4,
      tension: 0.25,
      fill: false,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      callbacks: {
        label(context: any) {
          const value = context.parsed.y;
          return ` $${value}`;
        },
        title(context: any) {
          const idx = context?.[0]?.dataIndex ?? null;
          const ts =
            typeof idx === 'number' && props.timestamps
              ? props.timestamps[idx]
              : null;

          if (typeof ts === 'number') {
            const date = new Date(ts);
            const dateStr = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC',
            });
            const timeStr = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC',
            });
            return `${dateStr}, ${timeStr}`;
          }

          return context[0]?.label ?? '';
        },
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        maxTicksLimit: 10,
        autoSkip: true,
      },
    },
    y: {
      ticks: {
        callback(value: any) {
          return '$' + value;
        },
      },
    },
  },
};
</script>

<template>
  <div :style="{ height: $vuetify.display.smAndUp ? '360px' : '240px' }">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
