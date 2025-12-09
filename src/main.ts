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
});

const pinia = createPinia();

createApp(App).use(router).use(pinia).use(vuetify).mount('#app');
