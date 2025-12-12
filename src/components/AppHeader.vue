<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { ref } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const drawer = ref(false);

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
  <v-app-bar app elevation="1">
    <v-app-bar-title class="font-weight-bold">
      <RouterLink to="/markets" class="opacity-100">
        <span class="text-primary cursor-pointer">Crypto</span> Dashboard
      </RouterLink>
    </v-app-bar-title>

    <v-spacer class="d-none d-md-flex" />

    <!-- Desktop menu -->
    <div class="d-none d-sm-flex ga-2 align-center">
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
          :class="{
            'nav-link--active': $route.path.startsWith('/portfolio'),
          }"
          >Portfolio</v-btn
        >
      </RouterLink>
    </div>
    <v-btn variant="text" icon @click="toggleTheme">
      <v-icon>
        {{
          theme.global.name.value === 'light'
            ? 'mdi-moon-waning-crescent'
            : 'mdi-white-balance-sunny'
        }}
      </v-icon>
    </v-btn>
    <!-- Mobile compact menu -->
    <v-menu
      v-model="drawer"
      class="d-sm-none"
      offset-y
      location="bottom"
      transition="scale-transition"
      :close-on-content-click="true"
      content-class="mobile-menu"
    >
      <template #activator="{ props: menuProps }">
        <v-btn icon v-bind="menuProps" class="d-sm-none">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </template>

      <v-sheet elevation="6" class="w-100 p-0">
        <v-list density="comfortable">
          <v-list-item to="/markets">
            <v-list-item-title class="d-flex align-center ga-2">
              <v-icon size="25">mdi-chart-line</v-icon>
              <span class="text-h5 py-3 ml-2">Markets</span>
            </v-list-item-title>
          </v-list-item>
          <v-list-item to="/portfolio">
            <v-list-item-title class="d-flex align-center ga-2">
              <v-icon size="25">mdi-briefcase</v-icon>
              <span class="text-h5 py-3 ml-2">Portfolio</span>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-sheet>
    </v-menu>
  </v-app-bar>
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

:deep(.mobile-menu.v-overlay__content) {
  left: 0 !important;
  right: 0 !important;
  width: 100vw !important;
  max-width: 100vw !important;
  transform: none !important;
}
</style>
