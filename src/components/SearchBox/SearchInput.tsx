'use client';

import { observer } from 'mobx-react-lite';
import { 
  Box, 
  TextField, 
  useTheme
} from '@mui/material';
import { 
  Search as SearchIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { filterStore } from '@/stores/filterStore';
import { tezosTransactionStore } from '@/stores/tezosTransactionStore';

export const SearchInput = observer(() => {
    const theme = useTheme();
    const router = useRouter();

    const handleSearch = async () => {
        const input: string = filterStore.searchInputValue;
        
        if (!input) return;

        if (filterStore.validationResult?.type === 'invalid') {
            return;
        }

        if (filterStore.validationResult?.type === 'tezos_tx_hash' || filterStore.validationResult?.type === 'etherlink_tx_hash') {
            router.push(`/transaction/${input}`);
            return;
        }

        const filters = filterStore.buildFiltersFromState();
        filterStore.setActiveFilters(filters);
        await tezosTransactionStore.getTransactions({
            ...filters,
            resetStore: true,
            loadingMode: 'initial'
        });
    };

    return (
        <Box 
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(2),
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
        <SearchIcon 
        sx={{ 
            color: theme.palette.primary.main, 
            fontSize: 24, 
            flexShrink: 0, 
            width: 24,
            height: 24
        }} 
        />

        <TextField
        fullWidth
        value={filterStore.searchInput}
        onChange={(e) => {
            filterStore.setSearchInput(e.target.value);
            filterStore.setValidationResult();
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search for transactions, addresses, blocks, or symbols..."
        aria-label="Search for transactions, addresses, blocks, or symbols"
        error={filterStore.validationResult?.type === 'invalid'}
        helperText={filterStore.validationResult?.type === 'invalid' ? filterStore.validationResult.error : ''}
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

        </Box>
    );
});