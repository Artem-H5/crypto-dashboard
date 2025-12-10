<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useTheme } from 'vuetify';

const theme = useTheme();

const toggleTheme = () => {
  const current = theme.global.current.value;

  theme.change(current.dark ? 'light' : 'dark');
  localStorage.setItem('theme', current.dark ? 'light' : 'dark');
};

const saved = localStorage.getItem('theme');
if (saved === 'light' || saved === 'dark') {
  theme.change(saved);
}
</script>

<template>
  <v-app>
    <v-app-bar app elevation="1">
      <v-app-bar-title class="font-weight-bold">
        <span class="text-primary">Crypto</span> Dashboard
      </v-app-bar-title>

      <v-spacer />

      <RouterLink to="/markets">
        <v-btn
          variant="text"
          class="mx-2"
          :class="{ 'nav-link--active': $route.path.startsWith('/markets') }"
          >Markets</v-btn
        >
      </RouterLink>

      <RouterLink to="/portfolio">
        <v-btn
          variant="text"
          class="mx-2"
          :class="{ 'nav-link--active': $route.path.startsWith('/portfolio') }"
          >Portfolio</v-btn
        >
      </RouterLink>

      <v-btn variant="text" icon @click="toggleTheme">
        <v-icon>
          {{
            theme.global.name.value === 'light'
              ? 'mdi-moon-waning-crescent'
              : 'mdi-white-balance-sunny'
          }}
        </v-icon>
      </v-btn>
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

.nav-link--active {
  color: #f5b301;
}
</style>
