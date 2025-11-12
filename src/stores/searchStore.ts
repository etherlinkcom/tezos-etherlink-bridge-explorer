import { makeAutoObservable, runInAction } from 'mobx';
import { QueryFilters, tezosTransactionStore } from './tezosTransactionStore';
import { validateInput, type ValidationResult } from '@/utils/validation';

export type WithdrawalType = 'all' | 'normal' | 'fast';

export class SearchStore {
  searchInput = '';
  validationResult: ValidationResult | null = null;
  activeFilters: QueryFilters = {};
  minAmountInput = '';
  maxAmountInput = '';

  constructor() {
    makeAutoObservable(this);
  }

  setSearchInput = (value: string) => {
    this.searchInput = value;
    this.validationResult = value.trim() ? validateInput(value) : null;
  };

  setMinAmount = (value: string) => {
    this.minAmountInput = value;
  };

  setMaxAmount = (value: string) => {
    this.maxAmountInput = value;
  };

  get withdrawalType(): WithdrawalType {
    if (this.activeFilters.isFastWithdrawal === true) return 'fast';
    if (this.activeFilters.isFastWithdrawal === false) return 'normal';
    return 'all';
  }

  get hasActiveFilters() {
    return Boolean(this.searchInput) || this.withdrawalType !== 'all' || Boolean(this.minAmountInput) || Boolean(this.maxAmountInput);
  }

  get hasFilterPanelFilters() {
    return this.withdrawalType !== 'all' || Boolean(this.minAmountInput.trim()) || Boolean(this.maxAmountInput.trim());
  }

  get currentFilters(): QueryFilters {
    const { limit, offset, since, before, ...filters } = this.activeFilters;
    return filters;
  }

  private applyWithdrawalFilter = (filters: QueryFilters, withdrawalType: WithdrawalType): void => {
    if (withdrawalType === 'fast') filters.isFastWithdrawal = true;
    if (withdrawalType === 'normal') filters.isFastWithdrawal = false;
  };

  private applySearchFilter = (filters: QueryFilters, searchValue: string, inputType: string): void => {
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
  };

  private buildFiltersFromState = (withdrawalType: WithdrawalType): QueryFilters => {
    const filters: QueryFilters = {};
    
    this.applyWithdrawalFilter(filters, withdrawalType);
    
    const trimmed = this.searchInput.trim();
    if (trimmed && this.validationResult && this.validationResult.type !== 'invalid') {
      this.applySearchFilter(filters, trimmed, this.validationResult.type);
    }
    
    const minTrimmed = this.minAmountInput.trim();
    const maxTrimmed = this.maxAmountInput.trim();
    
    if (minTrimmed) {
      filters.minAmount = Number(minTrimmed);
    }
    
    if (maxTrimmed) {
      filters.maxAmount = Number(maxTrimmed);
    }
    
    return filters;
  };

  private applyFilters = (filters: QueryFilters) => {
    this.activeFilters = filters;
    tezosTransactionStore.getTransactions({
      ...filters,
      resetStore: true,
      loadingMode: 'initial'
    });
  };

  executeSearch = async () => {
    const trimmed: string = this.searchInput.trim();
    
    if (trimmed) {
      const validation: ValidationResult = validateInput(trimmed);
      
      runInAction(() => {
        this.validationResult = validation;
      });

      if (validation.type === 'invalid') return;

      if (validation.type === 'tezos_tx_hash' || validation.type === 'etherlink_tx_hash') {
        return { shouldNavigate: true, hash: trimmed };
      }
    } else {
      this.validationResult = null;
    }

    const filters = this.buildFiltersFromState(this.withdrawalType);
    this.applyFilters(filters);
  };

  applyAmountFilters = () => {
    const filters = this.buildFiltersFromState(this.withdrawalType);
    this.applyFilters(filters);
  };

  handleWithdrawalTypeChange = async (newType: WithdrawalType) => {
    const filters = this.buildFiltersFromState(newType);
    this.applyFilters(filters);
  };

  clearFilters = () => {
    this.searchInput = '';
    this.validationResult = null;
    this.minAmountInput = '';
    this.maxAmountInput = '';
    this.activeFilters = {};
    this.applyFilters({});
  };
}

export const searchStore = new SearchStore();
