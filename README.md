# Crypto Dashboard (Vue 3 + Vuetify)

A crypto dashboard built with Vue 3: markets list, coin details with chart + metrics, paper trading, and a portfolio overview.

---

## Tech stack

- Vue 3 + Vite, TypeScript
- Vuetify 3 (UI)
- Pinia (portfolio state)
- Chart.js + vue-chartjs (chart)
- CoinGecko API (markets/chart/coin info)

---

## Features

- Markets: table (rank, price, 24h, market cap) + Load more
- Market details: 30d chart + metrics + paper BUY/SELL form
- Portfolio: balances + trades history
- Dark/Light theme
- Responsive UI (mobile-friendly)

---

## Notes (implementation details)

- Markets refresh: periodic refetch implemented in `src/pages/MarketsPage.vue`.
- Portfolio persistence: stored in `localStorage` implemented in `src/stores/trading.ts`. To reset, remove the `portfolio` key.
- Chart tooltip time: displayed in UTC.
- Error handling: API/network error states with user feedback and retry.

---

## Routes

- `/markets`
- `/markets/:symbol`
- `/portfolio`

---

## CoinGecko endpoints used

- `/api/v3/coins/markets` — markets list
- `/api/v3/search` + `/api/v3/coins/{id}` — coin metadata and details
- `/api/v3/coins/{id}/market_chart` — chart data

---

## Getting Started

1. Clone the repo:

```bash
git clone https://github.com/Artem-H5/crypto-dashboard.git
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser.

---

## Possible improvements

- tests (composables and stores)
- additional order types (limit / stop)
- sorting (price / 24h change)
- real-time chart updates (WebSocket)
