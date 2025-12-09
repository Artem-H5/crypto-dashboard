<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const symbol = route.params.symbol;
</script>

<template>
  <div>
    <h1>Market: {{ symbol }}</h1>
    <p>Here will be the chart and order form...</p>
  </div>
</template>
