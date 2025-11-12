'use client';

import { observer } from 'mobx-react-lite';
import { 
  Box, 
  Collapse,
  useTheme
} from '@mui/material';
import { searchStore } from '@/stores/searchStore';
import { SearchInput } from './SearchInput';
import { FilterPanel } from './FilterPanel';

export const SearchBox = observer(() => {
  const theme = useTheme();

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
            boxShadow: searchStore.filtersExpanded
              ? `0px 0px 3px 0px ${theme.palette.custom.shadow.primary}`
              : `0px 0px 12px 0px ${theme.palette.custom.shadow.secondary}`,
            transform: searchStore.filtersExpanded ? 'none' : 'translateY(-1px)',
          },
        }}
      >
        <SearchInput />

        <Collapse in={searchStore.filtersExpanded}>
          <FilterPanel />
        </Collapse>
      </Box>
    </Box>
  );
});
