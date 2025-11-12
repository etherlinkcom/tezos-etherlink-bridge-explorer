'use client';

import { observer } from 'mobx-react-lite';
import { 
  Box, 
  TextField, 
  IconButton,
  useTheme,
  alpha,
  Badge,
  Button
} from '@mui/material';
import { 
  Search as SearchIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon
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
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(2),
            minHeight: '72px',
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, marginLeft: 'auto' }}>
        <Badge 
            variant="dot"
            color="primary"
            invisible={!searchStore.hasFilterPanelFilters}
            sx={{
              '& .MuiBadge-dot': {
                width: 8,
                height: 8,
                borderRadius: '50%',
              }
            }}
        >
            <Button
            onClick={searchStore.toggleFiltersExpanded}
            startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
            size="small"
            variant="outlined"
            sx={{
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '20px',
                textTransform: 'none',
                padding: '6px 14px',
                fontSize: '14px',
                minWidth: 'auto',
                height: '36px',
                border: `1px solid ${theme.palette.custom.border.primary}`,
                '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                border: `1px solid ${theme.palette.primary.main}`
                },
                '& .MuiButton-startIcon': {
                marginRight: '6px',
                marginLeft: 0
                }
            }}
            >
            Filters
            </Button>
        </Badge>

        {searchStore.hasActiveFilters && (
            <IconButton
            onClick={searchStore.clearFilters}
            size="small"
            sx={{ 
                color: theme.palette.text.secondary, 
                flexShrink: 0,
                width: 36,
                height: 36,
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
    );
});