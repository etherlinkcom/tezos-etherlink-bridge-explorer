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

  loadAll = async () => {
    tezosTransactionStore.resetStore();
    await tezosTransactionStore.getTransactions();
  };

  executeSearch = async () => {
    const trimmed = this.searchInput.trim();
    if (!trimmed) return this.loadAll();

    const validation = validateInput(trimmed);
    runInAction(() => {
      this.validationResult = validation;
    });

    if (!validation.isValid) return;

    const filters = this.buildFilters(trimmed, validation.type);
    tezosTransactionStore.resetStore();
    await tezosTransactionStore.getTransactions(filters);
  };

  handleWithdrawalTypeChange = async (newType: WithdrawalType) => {
    this.setWithdrawalType(newType);
    this.searchInput.trim() ? await this.executeSearch() : await this.loadAll();
  };

  clearFilters = () => {
    this.searchInput = '';
    this.withdrawalType = 'all';
    this.validationResult = null;
    this.loadAll();
  };
}

export const searchStore = new SearchStore();
