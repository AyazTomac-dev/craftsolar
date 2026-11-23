# CraftSolar Towny

Responsive React and Vite website for CraftSolar. Pages include Towny, the joining guide, store, staff applications, support, player account, orders, and a private admin route. Store entries have no prices and checkout only records a delivery request; it does not charge money.

## Local development

1. Run `npm install`.
2. Copy `.env.example` to `.env` and set `ADMIN_PASSWORD` to a private value of at least 20 characters and `SESSION_SECRET` to a random value of at least 32 characters.
3. Run `npm run dev` to start Netlify Dev. The app and API will be at `http://localhost:8888`.
4. Run `npm run build` to create the production build.

The ignored `.env` file is only for local development. Do not commit it.

## Netlify setup

Connect the repository to Netlify and use the included build settings. In the Netlify site environment variables, set `ADMIN_PASSWORD` and `SESSION_SECRET` for Functions and deploy a fresh build. Use different production secrets from any values used locally. Netlify Blobs backs account records, staff applications, support tickets, and orders so submissions can be read across devices.

The admin page route is `/#/cs-yonetim-f38a76d9-92b4-4c86-9f2d-2a47c06bb841`. Access also requires the `ADMIN_PASSWORD` environment variable. Frontend bundles are always visible in browser developer tools; the route is obscured from navigation, while admin data and mutations are protected by server-side checks.

## Accounts and submissions

Minecraft nicknames are required as usernames. Passwords are stored as scrypt hashes. Session cookies are HTTP-only, signed, and expire after eight hours. Applications, support tickets, and store requests require an account. Users can view their own records; admins can see all records and update their status.

The site does not take payments or show prices.
