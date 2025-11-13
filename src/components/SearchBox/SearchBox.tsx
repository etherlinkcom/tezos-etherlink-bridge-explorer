'use client';

import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { 
  Box, 
  Collapse,
  useTheme,
  alpha,
  Badge,
  Button,
  IconButton
} from '@mui/material';
import { FilterList as FilterListIcon, Close as CloseIcon } from '@mui/icons-material';
import { filterStore } from '@/stores/filterStore';
import { tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { SearchInput } from './SearchInput';
import { FilterPanel } from './FilterPanel';

export const SearchBox = observer(() => {
  const theme = useTheme();
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          background: theme.palette.background.default,
          borderRadius: '25px',
          border: `1px solid ${theme.palette.custom.border.primary}`,
          opacity: 1,
          position: 'relative',
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `${theme.palette.custom.shadow.primary}`,
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: filtersExpanded
              ? `0px 0px 3px 0px ${theme.palette.custom.shadow.primary}`
              : `0px 0px 12px 0px ${theme.palette.custom.shadow.secondary}`,
            transform: filtersExpanded ? 'none' : 'translateY(-1px)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', padding: '16px', gap: theme.spacing(2) }}>
          <SearchInput />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, marginLeft: 'auto' }}>
            <Badge 
              variant="dot"
              color="primary"
              invisible={!filterStore.hasFilterPanelFilters}
              sx={{
                '& .MuiBadge-dot': {
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                }
              }}
            >
              <Button
                onClick={() => setFiltersExpanded(prev => !prev)}
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

            {filterStore.hasActiveFilters && (
              <IconButton
                onClick={async () => {
                  const filters = filterStore.clearFilters();
                  await tezosTransactionStore.getTransactions({
                    ...filters,
                    resetStore: true,
                    loadingMode: 'initial'
                  });
                }}
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

        <Collapse in={filtersExpanded}>
          <FilterPanel />
        </Collapse>
      </Box>
    </Box>
  );
});
