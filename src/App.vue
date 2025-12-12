<script setup lang="ts">
import { RouterView } from 'vue-router';

import AppHeader from './components/AppHeader.vue';
</script>

<template>
  <v-app>
    <AppHeader />
    <v-main>
      <v-container class="py-6">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>
