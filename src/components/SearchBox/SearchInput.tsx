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
import { searchStore } from '@/stores/searchStore';
import { tezosTransactionStore } from '@/stores/tezosTransactionStore';

export const SearchInput = observer(() => {
    const theme = useTheme();
    const router = useRouter();

    const handleSearch = async () => {
        const input: string = searchStore.searchInput;
        
        if (!input) return;

        if (searchStore.validationResult?.type === 'invalid') {
            return;
        }

        if (searchStore.validationResult?.type === 'tezos_tx_hash' || searchStore.validationResult?.type === 'etherlink_tx_hash') {
            router.push(`/transaction/${input}`);
            return;
        }

        const filters = searchStore.buildFiltersFromState();
        searchStore.setActiveFilters(filters);
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
        value={searchStore.searchInput}
        onChange={(e) => {
            searchStore.setSearchInput(e.target.value);
            searchStore.setValidationResult();
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search for transactions, addresses, blocks, or symbols..."
        aria-label="Search for transactions, addresses, blocks, or symbols"
        error={searchStore.validationResult?.type === 'invalid'}
        helperText={searchStore.validationResult?.type === 'invalid' ? searchStore.validationResult.error : ''}
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