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
  - `TransactionTable.tsx` – Main transaction list component
  - `TransactionTableRow.tsx` – Individual transaction row component
  - `TransactionDetails/` – Transaction detail page components
  - `shared/` – Reusable UI components (CopyButton, EllipsisBox, StatusChip)
  - `layouts/` – Layout components
- `src/stores/` – MobX stores
  - `tezosTransactionStore.ts` – Main transaction data store
  - `transactionDetailsStore.ts` – Transaction detail page store
  - `searchStore.ts` – Search functionality store
- `src/theme/` – Material-UI theme configuration
- `src/utils/` – Utility functions (formatters, validation, etc.)
- `src/types/` – TypeScript type definitions
- `public/` – Static assets (SVGs, etc.)

## Environment Configuration

The application supports different networks through environment variables. Create a `.env.local` file in the root directory:

```bash
# Mainnet (default)
GRAPHQL_ENDPOINT=https://bridge.indexer.etherlink.com/v1/graphql

# Testnet
GRAPHQL_ENDPOINT=https://testnet.bridge.indexer.etherlink.com/v1/graphql
```

If no environment variable is set, it defaults to the mainnet endpoint.

## Data Source

Transactions are fetched from the configured GraphQL endpoint (see Environment Configuration above).

## MobX Stores

### TezosTransactionStore

The main store for transaction data management ([`tezosTransactionStore.ts`](src/stores/tezosTransactionStore.ts)):

#### Properties
- `transactions: TezosTransaction[]` – All loaded transactions
- `loadingState: 'idle' | 'initial' | 'page' | 'refresh'` – Detailed loading states
- `error: string | null` – Error message, if any
- `currentPage: number` – Current page for pagination
- `pageSize: number` – Number of transactions per page (default: 50)
- `batchSize: number` – API batch size for fetching (default: 1000)

#### Computed Getters
- `loading` – General loading state (true if not idle)
- `loadingInitial` – True when loading initial data
- `loadingMore` – True when loading more pages
- `loadingRefresh` – True when auto-refreshing
- `currentTransactions` – Transactions for current page
- `totalPages` – Total number of pages
- `hasNextPage` – Whether more pages are available
- `hasPreviousPage` – Whether previous pages exist

#### Actions
- `getTransactions(options?: GetTransactionsOptions)` – Fetch transactions with optional filters
- `setLoadingState(state)` – Set loading state
- `clearStore()` – Clear all transaction data
- `startAutoRefresh()` – Start automatic refresh every 5 minutes
- `stopAutoRefresh()` – Stop automatic refresh

### TransactionDetailsStore

Store for individual transaction detail pages ([`transactionDetailsStore.ts`](src/stores/transactionDetailsStore.ts)):

#### Properties
- `transaction: TezosTransaction | null` – Current transaction data
- `loading: boolean` – Loading state
- `error: string | null` – Error message, if any

#### Actions
- `fetchTransaction(txHash: string)` – Fetch specific transaction by hash
- `clearTransaction()` – Clear current transaction data

### SearchStore

Dedicated store for search functionality ([`searchStore.ts`](src/stores/searchStore.ts)):

#### Properties
- `searchInput: string` – Current search input
- `validationResult: ValidationResult | null` – Input validation result
- `withdrawalType: WithdrawalType` – Filter for withdrawal types ('all', 'normal', 'fast')

#### Computed Getters
- `hasActiveFilters` – Whether any filters are currently active

#### Actions
- `setSearchInput(value: string)` – Update search input and validate
- `setWithdrawalType(type: WithdrawalType)` – Set withdrawal type filter
- `executeSearch()` – Execute search with current filters
- `buildFilters(searchValue, inputType)` – Build query filters based on input type
- `handleWithdrawalTypeChange(type)` – Handle withdrawal type changes
- `clearFilters()` – Clear all search filters

### Transaction Model

Each transaction is an instance of `TezosTransaction`, which includes:

- `type` – "deposit" or "withdrawal"
- `sendingAmount`, `receivingAmount`
- `symbol`, `decimals`
- `chainId`
- `expectedDate`, `submittedDate`
- `txHash`
- `status`
- `completed`
- `explorerLink`
- ...and more

## Key Components

### TransactionTable
Main component displaying the list of transactions with search and pagination functionality.

### TransactionDetails
Comprehensive transaction detail view with multiple data sections:
- **DetailField**: Reusable component for displaying transaction data fields
- **DataSection**: Organized sections for different types of transaction data
- **TransactionDetails**: Main container component

### SearchBox
Advanced search component supporting multiple search criteria and real-time filtering.

### Shared Components
- **CopyButton**: One-click copying of transaction hashes and addresses
- **EllipsisBox**: Text truncation with expand/collapse functionality
- **StatusChip**: Visual status indicators for transaction states

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Build Tool**: Turbopack for fast development builds
- **UI Library**: Material-UI (MUI) v7 with custom theming
- **State Management**: MobX with MobX React Lite
- **Language**: TypeScript
- **Styling**: Emotion (CSS-in-JS) with MUI
- **Icons**: Material-UI Icons
- **Notifications**: React Hot Toast