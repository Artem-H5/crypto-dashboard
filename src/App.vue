<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>Crypto Dashboard</v-app-bar-title>

      <v-spacer />

      <RouterLink to="/markets">
        <v-btn variant="text" class="mx-2">Markets</v-btn>
      </RouterLink>

      <RouterLink to="/portfolio">
        <v-btn variant="text" class="mx-2">Portfolio</v-btn>
      </RouterLink>
    </v-app-bar>

    <v-main>
      <v-container class="py-6">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  opacity: 0.7;
}
</style>
