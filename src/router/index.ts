import { createRouter, createWebHistory } from 'vue-router';
import MarketsPage from '../pages/MarketsPage.vue';
import PortfolioPage from '../pages/PortfolioPage.vue';
import MarketDetailsPage from '../pages/MarketDetailsPage.vue';

const routes = [
  { path: '/', redirect: '/markets' },
  { path: '/markets', component: MarketsPage },
  { path: '/portfolio', component: PortfolioPage },
  { path: '/markets/:symbol', component: MarketDetailsPage },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
