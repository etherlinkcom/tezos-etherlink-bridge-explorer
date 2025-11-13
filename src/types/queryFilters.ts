export interface QueryFilters {
  limit?: number;
  offset?: number;
  txHash?: string;
  address?: string;
  level?: number;
  since?: string;  // ISO timestamp for fetching new transactions
  before?: string; // ISO timestamp for pagination
  tokenSymbol?: string;
  isFastWithdrawal?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

