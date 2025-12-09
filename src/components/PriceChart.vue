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
}>();

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Price (USD)',
      data: props.prices,
      borderColor: '#42a5f5',
      borderWidth: 2,
      pointRadius: 2,
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
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Time',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Price (USD)',
      },
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
  <div style="height: 260px">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
