import { makeAutoObservable } from 'mobx';
import { QueryFilters } from '@/types/queryFilters';
import { validateInput, type ValidationResult } from '@/utils/validation';

export type WithdrawalType = 'all' | 'normal' | 'fast';

export class FilterStore {
  searchInput = '';
  validationResult: ValidationResult | null = null;
  activeFilters: QueryFilters = {};
  minAmount = '';
  maxAmount = '';
  withdrawalType: WithdrawalType = 'all';

  constructor() {
    makeAutoObservable(this);
  }

  setSearchInput = (value: string) => {
    this.searchInput = value;
  };

  get searchInputValue(): string {
    return this.searchInput.trim();
  }

  setValidationResult = () => {
    this.validationResult = this.searchInputValue ? validateInput(this.searchInputValue) : null;
  };

  setMinAmount = (value: string) => {
    this.minAmount = value;
  };

  setMaxAmount = (value: string) => {
    this.maxAmount = value;
  };

  get minAmountValue(): string {
    return this.minAmount.trim();
  }

  get maxAmountValue(): string {
    return this.maxAmount.trim();
  }

  setWithdrawalType = (value: WithdrawalType) => {
    this.withdrawalType = value;
  };

  setActiveFilters = (filters: QueryFilters) => {
    this.activeFilters = filters;
  };

  get hasFilterPanelFilters() {
    return this.withdrawalType !== 'all' || Boolean(this.minAmountValue) || Boolean(this.maxAmountValue);
  }

  get hasActiveFilters() {
    return Boolean(this.searchInputValue) || this.hasFilterPanelFilters;
  }

  get currentFilters(): QueryFilters {
    const { limit, offset, since, before, ...filters } = this.activeFilters;
    return filters;
  }

  private setWithdrawalFilter = (filters: QueryFilters): QueryFilters => {
    if (this.withdrawalType === 'fast') filters.isFastWithdrawal = true;
    if (this.withdrawalType === 'normal') filters.isFastWithdrawal = false;
    return filters;
  };

  private setSearchFilter = (filters: QueryFilters, searchValue: string, inputType: string): QueryFilters => {
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
    return filters;
  };

  buildFiltersFromState = (): QueryFilters => {
    let filters: QueryFilters = {};
    
    filters = this.setWithdrawalFilter(filters);
    
    if (this.searchInputValue && this.validationResult && this.validationResult.type !== 'invalid') {
      filters = this.setSearchFilter(filters, this.searchInputValue, this.validationResult.type);
    }
    
    if (this.minAmountValue) {
      filters.minAmount = Number(this.minAmountValue);
    }
    
    if (this.maxAmountValue) {
      filters.maxAmount = Number(this.maxAmountValue);
    }
    return filters;
  };

  clearFilters = (): QueryFilters => {
    this.searchInput = '';
    this.validationResult = null;
    this.minAmount = '';
    this.maxAmount = '';
    this.withdrawalType = 'all';
    this.activeFilters = {};
    return {};
  };
}

export const filterStore = new FilterStore();
