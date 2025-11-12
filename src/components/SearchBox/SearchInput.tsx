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
import { getValidationMessage } from '@/utils/validation';

export const SearchInput = observer(() => {
    const theme = useTheme();
    const router = useRouter();

    const handleSearch = async () => {
        const result = await searchStore.executeSearch();
        if (result?.shouldNavigate) {
            router.push(`/transaction/${result.hash}`);
        }
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
        onChange={(e) => searchStore.setSearchInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search for transactions, addresses, blocks, or symbols..."
        aria-label="Search for transactions, addresses, blocks, or symbols"
        error={searchStore.validationResult ? searchStore.validationResult.type === 'invalid' : false}
        helperText={searchStore.validationResult && searchStore.validationResult.type === 'invalid' ? getValidationMessage(searchStore.validationResult) : ''}
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