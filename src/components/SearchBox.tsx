'use client';

import { observer } from 'mobx-react-lite';
import { useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  FormControl, 
  Select, 
  MenuItem,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { validateInput, getValidationMessage, type ValidationResult } from '@/utils/validation';
import { designTokens } from '@/theme/tokens';


type WithdrawalType = 'all' | 'normal' | 'fast';

export const SearchBox = observer(() => {
  const theme = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [withdrawalType, setWithdrawalType] = useState<WithdrawalType>('all');

  const buildFilters = (searchValue: string, inputType: string) => {
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
    
    if (withdrawalType === 'fast') filters.isFastWithdrawal = true;
    if (withdrawalType === 'normal') filters.isFastWithdrawal = false;
    
    return filters;
  };

  const hasActiveFilters = useMemo(
    () => Boolean(searchInput) || withdrawalType !== 'all',
    [searchInput, withdrawalType]
  );

  const loadAll = useCallback(async () => {
    tezosTransactionStore.resetStore();
    await tezosTransactionStore.getTransactions();
  }, []);

  const executeSearch = useCallback(async () => {
    const trimmed = searchInput.trim();
    if (!trimmed) return loadAll();

    const validation = validateInput(trimmed);
    setValidationResult(validation);

    if (!validation.isValid) return;

    const filters = buildFilters(trimmed, validation.type);
    tezosTransactionStore.resetStore();
    await tezosTransactionStore.getTransactions(filters);
  }, [searchInput, withdrawalType, loadAll]);

  const handleInputChange = useCallback((value: string) => {
    setSearchInput(value);
    setValidationResult(value.trim() ? validateInput(value) : null);
  }, []);

  const handleWithdrawalTypeChange = useCallback(async (newType: WithdrawalType) => {
    setWithdrawalType(newType);
    if (searchInput.trim()) {
      await executeSearch();
    } else {
      await loadAll();
    }
  }, [searchInput, executeSearch, loadAll]);

  const handleClear = useCallback(async () => {
    setSearchInput('');
    setWithdrawalType('all');
    setValidationResult(null);
    await loadAll();
  }, [loadAll]);
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          background: theme.palette.background.default,
          boxShadow: `0px 0px 6px 0px ${theme.palette.custom.shadow.primary}`,
          padding: `${designTokens.searchBox.padding}px`,
          gap: `${designTokens.searchBox.gap}px`,
          height: designTokens.searchBox.height,
          borderRadius: designTokens.searchBox.borderRadius,
          opacity: 1,
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0px 0px 12px 0px ${theme.palette.custom.shadow.secondary}`,
            transform: 'translateY(-1px)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '100%', width: '100%' }}>

          <SearchIcon sx={{ color: theme.palette.primary.main, fontSize: 24, flexShrink: 0 }} />
          
          <TextField
            fullWidth
            value={searchInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
            placeholder="Search for transactions, addresses, blocks, symbols"
            aria-label="Search for transactions, addresses, blocks, or token symbols"
            error={validationResult ? !validationResult.isValid : false}
            helperText={validationResult && !validationResult.isValid ? getValidationMessage(validationResult) : ''}
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  color: theme.palette.text.primary,
                  fontSize: '16px',
                  '&::placeholder': {
                    color: theme.palette.text.secondary,
                    opacity: 1
                  }
                }
              }
            }}
          />

          <FormControl size="small" sx={{ minWidth: 140, flexShrink: 0 }}>
            <Select
              value={withdrawalType}
              onChange={(e) => handleWithdrawalTypeChange(e.target.value as 'all' | 'normal' | 'fast')}
              displayEmpty
              aria-label="Filter transactions by type"
              sx={{
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '20px',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: `1px solid ${theme.palette.custom.border.primary}`,
                  borderRadius: '20px'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: `1px solid ${theme.palette.primary.main}`
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: `1px solid ${theme.palette.primary.main}`
                },
                '& .MuiSelect-icon': {
                  color: theme.palette.primary.main
                }
              }}
            >
              <MenuItem value="all">All Transactions</MenuItem>
              <MenuItem value="normal">Normal Withdrawals</MenuItem>
              <MenuItem value="fast">Fast Withdrawals</MenuItem>
            </Select>
          </FormControl>

          {(searchInput || withdrawalType !== 'all') && (
            <IconButton
              onClick={handleClear}
              size="small"
              sx={{ 
                color: theme.palette.text.secondary, 
                flexShrink: 0,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
              title="Clear all filters"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

      </Box>
    </Box>
  );
});