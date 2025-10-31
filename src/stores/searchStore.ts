import { makeAutoObservable, runInAction } from 'mobx';
import { tezosTransactionStore } from './tezosTransactionStore';
import { validateInput, type ValidationResult } from '@/utils/validation';

export type WithdrawalType = 'all' | 'normal' | 'fast';

export class SearchStore {
  searchInput = '';
  validationResult: ValidationResult | null = null;
  withdrawalType: WithdrawalType = 'all';

  constructor() {
    makeAutoObservable(this);
  }

  setSearchInput = (value: string) => {
    this.searchInput = value;
    this.validationResult = value.trim() ? validateInput(value) : null;
  };

  setWithdrawalType = (type: WithdrawalType) => {
    this.withdrawalType = type;
  };

  get hasActiveFilters() {
    return Boolean(this.searchInput) || this.withdrawalType !== 'all';
  }

  buildFilters = (searchValue: string, inputType: string) => {
    const filters: Record<string, unknown> = {};
    
    switch (inputType) {
      case 'tezos_address':
      case 'etherlink_address':
        filters.address = searchValue;
        break;
      case 'tezos_tx_hash':
      case 'etherlink_tx_hash':
        filters.txHash = searchValue;
        break;
      case 'block_number':
        filters.level = parseInt(searchValue);
        break;
      case 'token_symbol':
        filters.tokenSymbol = searchValue;
        break;
    }
    
    if (this.withdrawalType === 'fast') filters.isFastWithdrawal = true;
    if (this.withdrawalType === 'normal') filters.isFastWithdrawal = false;
    
    return filters;
  };

  executeSearch = async () => {
    const trimmed: string = this.searchInput.trim();
    
    if (!trimmed) {
      await tezosTransactionStore.getTransactions({ resetStore: true });
      return;
    }

    const validation: ValidationResult = validateInput(trimmed);
    runInAction(() => {
      this.validationResult = validation;
    });

    if (validation.type === 'invalid') return;

    if (validation.type === 'tezos_tx_hash' || validation.type === 'etherlink_tx_hash') {
      return { shouldNavigate: true, hash: trimmed };
    }
    
    const filters: Record<string, unknown> = this.buildFilters(trimmed, validation.type);
    await tezosTransactionStore.getTransactions({ ...filters, resetStore: true });
  };

  handleWithdrawalTypeChange = async (newType: WithdrawalType) => {
    this.setWithdrawalType(newType);
    await this.executeSearch();
  };

  clearFilters = () => {
    this.searchInput = '';
    this.withdrawalType = 'all';
    this.validationResult = null;
    this.executeSearch();
  };
}

export const searchStore = new SearchStore();
