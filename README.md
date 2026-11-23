# CraftSolar Towny

React and Vite frontend for the CraftSolar Minecraft Towny server.

The interface has separate pages for the home page, Towny, the joining guide, the store, help, and the player account.

## Development

Install dependencies with `npm install`, then start the local server with `npm run dev`.

Create a production build with `npm run build`. Netlify uses the included `netlify.toml` to publish the `dist` directory.

Accounts, cart contents, and simulated orders are stored in the current browser's local storage. No real payment is processed. Since this prototype has no backend, its accounts, orders, admin view, and simulated turnover are not shared across devices and are not secure for real customer data.
