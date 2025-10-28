'use client';

import { observer } from 'mobx-react-lite';
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
import { useRouter } from 'next/navigation';
import { searchStore } from '@/stores/searchStore';
import { getValidationMessage } from '@/utils/validation';
import { designTokens } from '@/theme/components';

export const SearchBox = observer(() => {
  const theme = useTheme();
  const router = useRouter();

  const handleSearch = async () => {
    const result = await searchStore.executeSearch();
    if (result?.shouldNavigate) {
      router.push(`/transaction/${result.hash}`);
    }
  };
  
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
            value={searchStore.searchInput}
            onChange={(e) => searchStore.setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for transactions, addresses, blocks, symbols"
            aria-label="Search for transactions, addresses, blocks, or token symbols"
            error={searchStore.validationResult ? !searchStore.validationResult.isValid : false}
            helperText={searchStore.validationResult && !searchStore.validationResult.isValid ? getValidationMessage(searchStore.validationResult) : ''}
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
              value={searchStore.withdrawalType}
              onChange={(e) => searchStore.handleWithdrawalTypeChange(e.target.value as 'all' | 'normal' | 'fast')}
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

          {searchStore.hasActiveFilters && (
            <IconButton
              onClick={searchStore.clearFilters}
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