<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->

# Tezos-Etherlink Bridge Explorer

A web application to explore bridge transactions between Tezos and Etherlink, built with [Next.js](https://nextjs.org), [MobX](https://mobx.js.org/), [React](https://react.dev/), and [Material-UI](https://mui.com/).

## Features

- **Transaction List**: View recent bridge transactions (deposits and withdrawals) between Tezos and Etherlink
- **Transaction Details**: Detailed view of individual transactions with comprehensive data sections
- **Advanced Search**: Search transactions by hash, Tezos address, Etherlink address, or token symbol

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm, yarn, pnpm, or bun
- Modern browser with ES6+ support

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/tezos-etherlink-bridge-explorer.git
   cd tezos-etherlink-bridge-explorer
   ```

2. Install dependencies:

   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

### Running the Development Server

```sh
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The development server uses Turbopack for faster builds and hot reloading.

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Building for Production

```sh
npm run build
npm start
```

## Project Structure

- `src/app/` – Next.js app directory (pages, layout, global styles)
  - `transaction/[txHash]/` – Dynamic transaction detail pages
- `src/components/` – React components
  - `TransactionTable/` – Transaction list components
  - `TransactionDetails/` – Transaction detail page components
  - `shared/` – Reusable UI components
  - `layouts/` – Layout components
- `src/stores/` – MobX stores
- `src/hooks/` – Custom React hooks
- `src/theme/` – Material-UI theme configuration
- `src/utils/` – Utility functions
- `src/types/` – TypeScript type definitions
- `public/` – Static assets

## Environment Configuration

The application supports different networks through environment variables. Create a `.env.local` file in the root directory:

```bash
# GraphQL Endpoint
# Mainnet (default)
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://bridge.indexer.etherlink.com/v1/graphql

# Shadownet
# NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://shadownet.bridge.indexer.etherlink.com/v1/graphql

# Etherlink Network Configuration (for wallet connections)
# Mainnet (default)
NEXT_PUBLIC_ETHERLINK_CHAIN_ID=42793
NEXT_PUBLIC_ETHERLINK_RPC_URL=https://node.mainnet.etherlink.com
NEXT_PUBLIC_ETHERLINK_NETWORK_NAME=Etherlink Mainnet
NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL=https://explorer.etherlink.com

# Shadownet
# NEXT_PUBLIC_ETHERLINK_CHAIN_ID=127823
# NEXT_PUBLIC_ETHERLINK_RPC_URL=https://node.shadownet.etherlink.com
# NEXT_PUBLIC_ETHERLINK_NETWORK_NAME=Etherlink Shadownet Testnet
# NEXT_PUBLIC_ETHERLINK_BLOCK_EXPLORER_URL=https://shadownet.explorer.etherlink.com
```

If no environment variables are set, the application defaults to mainnet endpoints.

## Data Source

Transactions are fetched from the configured GraphQL endpoint (see Environment Configuration above).

## MobX Stores

### TezosTransactionStore

Main store for managing transaction data, pagination, and fetching from the GraphQL API. Handles transaction loading states and auto-refresh functionality.

### TransactionDetailsStore

Store for individual transaction detail pages. Manages loading and displaying detailed information for a specific transaction.

### SearchStore

Handles search functionality including input validation, filtering by withdrawal type, and building query filters for different search criteria.

## Key Components

- **TransactionTable**: Main component for displaying the list of transactions with search and pagination
- **TransactionDetails**: Comprehensive transaction detail view with multiple data sections
- **SearchBox**: Advanced search component supporting multiple search criteria

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Build Tool**: Turbopack for fast development builds
- **UI Library**: Material-UI (MUI) v7 with custom theming
- **State Management**: MobX with MobX React Lite
- **Language**: TypeScript
- **Styling**: Emotion (CSS-in-JS) with MUI
- **Icons**: Material-UI Icons
- **Notifications**: React Hot Toast