<script setup lang="ts">
import { useRouter } from 'vue-router';
import { markets } from '../mock/markets';

const router = useRouter();

function goToMarket(symbol: string) {
  router.push(`/markets/${symbol}`);
}
</script>

<template>
  <div>
    <h1 class="mb-4">Markets</h1>

    <v-table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Name</th>
          <th>Price</th>
          <th>24h</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="m in markets"
          :key="m.id"
          @click="goToMarket(m.symbol)"
          style="cursor: pointer"
        >
          <td>{{ m.symbol }}</td>
          <td>{{ m.name }}</td>
          <td>${{ m.price.toLocaleString() }}</td>
          <td :style="{ color: m.change24h >= 0 ? 'green' : 'red' }">
            {{ m.change24h }}%
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
