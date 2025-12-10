import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

import 'vuetify/lib/styles/main.css';
import '@mdi/font/css/materialdesignicons.css';

import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import { createPinia } from 'pinia';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#f5f5f5',
          primary: '#F5B301',
          surface: '#ffffff',
          success: '#22c55e',
          error: '#ef4444',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#F5B301',
          success: '#22c55e',
          error: '#ef4444',
        },
      },
    },
  },
});

const pinia = createPinia();

createApp(App).use(router).use(pinia).use(vuetify).mount('#app');
