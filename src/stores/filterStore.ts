import { makeAutoObservable } from 'mobx';
import { QueryFilters } from '@/types/queryFilters';
import { validateInput, type ValidationResult } from '@/utils/validation';

export type WithdrawalType = 'all' | 'normal' | 'fast';

export class FilterStore {
  searchInput = '';
  validationResult: ValidationResult | null = null;
  activeFilters: QueryFilters = {};
  minAmount: number | undefined = undefined;
  minRawAmount: string | undefined = undefined;
  maxAmount: number | undefined = undefined;
  maxRawAmount: string | undefined = undefined;
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

  setMinAmount = (value: number) => {
    this.minAmount = value === 0 ? undefined : value;
  };

  setMaxAmount = (value: number) => {
    this.maxAmount = value === 0 ? undefined : value;
  };

  setWithdrawalType = (value: WithdrawalType) => {
    this.withdrawalType = value;
  };

  setActiveFilters = (filters: QueryFilters) => {
    this.activeFilters = filters;
  };
  setMinRawAmount = (value: string) => {
    this.minRawAmount = value;
  };
  setMaxRawAmount = (value: string) => {
    this.maxRawAmount = value;
  };

  get hasFilterPanelFilters() {
    return this.withdrawalType !== 'all' || this.minAmount || this.maxAmount;
  }

  get hasActiveFilters() {
    return Boolean(this.searchInputValue) || this.hasFilterPanelFilters;
  }

  get currentFilters(): QueryFilters {
    const { limit, offset, since, before, ...filters } = this.activeFilters;
    return filters;
  }

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
    
    if (this.withdrawalType === 'fast') filters.isFastWithdrawal = true;
    if (this.withdrawalType === 'normal') filters.isFastWithdrawal = false;
    
    if (this.searchInputValue && this.validationResult && this.validationResult.type !== 'invalid') {
      filters = this.setSearchFilter(filters, this.searchInputValue, this.validationResult.type);
    }
    
    if (this.minAmount) filters.minAmount = this.minAmount;
    if (this.maxAmount) filters.maxAmount = this.maxAmount;
    
    return filters;
  };

  clearFilters = (): void => {
    this.searchInput = '';
    this.validationResult = null;
    this.minAmount = undefined;
    this.maxAmount = undefined;
    this.minRawAmount = '';
    this.maxRawAmount = '';
    this.withdrawalType = 'all';
    this.activeFilters = {};
  };
}

export const filterStore = new FilterStore();
