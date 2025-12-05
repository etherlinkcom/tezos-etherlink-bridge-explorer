import { TezosTransaction } from "@/stores/tezosTransactionStore";
import { QueryFilters } from "./queryFilters";

export type Confirmation = { txHash: string; chainId: number };
export type TezosTransactionType = "withdrawal" | "deposit";
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface GetTransactionsOptions extends QueryFilters {
  resetStore?: boolean;
  autoRefresh?: boolean;
  loadingMode?: 'initial' | 'page' | 'refresh';
}

export type TezosTransactionKind =
  "fast_withdrawal" |
  "fast_withdrawal_service_provider" |
  "fast_withdrawal_payed_out" |
  "fast_withdrawal_payed_out_expired" |
  "fast_withdrawal_payed_out_reward" | null

export interface GraphQLResponse {
  id: string;
  created_at: string;
  updated_at: string;
  l1_account: string;
  l2_account: string;
  status: GraphTokenStatus;
  is_successful: boolean;
  is_completed: boolean;
  type: TezosTransactionType;
  kind: TezosTransactionKind;
  deposit: {
    l2_transaction: {
      token_id: string;
      amount: string;
      transaction_hash: string;
      level: number | null;
      l2_token: {
        decimals: number;
        name: string;
        symbol: string;
      };
      ticket: {
        token: {
          decimals: number;
          name: string;
          symbol: string;
        };
      };
    };
    l1_transaction: {
      amount: string;
      operation_hash: string;
      level: number;
      ticket: {
        token: {
          decimals: number;
          name: string;
          symbol: string;
        };
      };
    };
  };
  withdrawal: {
    l2_transaction: {
      token_id: string;
      amount: string;
      transaction_hash: string;
      level: number | null;
      l2_token: {
        decimals: number;
        name: string;
        symbol: string;
      };
      ticket: {
        token: {
          decimals: number;
          name: string;
          symbol: string;
        };
      };
    };
    l1_transaction: {
      amount: string;
      operation_hash: string;
      level: number;
    };
  };
}

export enum GraphTokenStatus {
  Pending = "PENDING",
  Created = "CREATED",
  Sealed = "SEALED",
  Finished = "FINISHED",
  Failed = "FAILED",
}


export interface TransactionProps<Input> {
  type: TezosTransactionType;
  input: Input;
  sendingAmount: string;
  receivingAmount: string | undefined;
  symbol: string;
  chainId: number;
  expectedDate?: number;
  submittedDate: number;
  completedDate?: number;
  error: string | null;
  l1TxHash: string;
  l2TxHash: string;
  kind: TezosTransactionKind | null;
  confirmation: Confirmation | undefined;
  completed: boolean;
  status: GraphTokenStatus;
  isFastWithdrawal?: boolean;
  l1Block?: number;
  l2Block?: number;
  fastWithdrawalPayOut?: TezosTransaction;
  depositNonce?: bigint | null;
}
export type TransactionConstructorProps<Input> = Optional<
  TransactionProps<Input>,
  "confirmation" | "error"
>;