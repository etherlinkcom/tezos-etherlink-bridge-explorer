'use client';

import { observer } from 'mobx-react-lite';
import { 
  Box, 
  useTheme,
  Collapse
} from '@mui/material';
import { searchStore } from '@/stores/searchStore';
import { designTokens } from '@/theme/components';
import { SearchInput } from './SearchInput';
import { FilterPanel } from './FilterPanel';

export const SearchBox = observer(() => {
  const theme = useTheme();

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          background: theme.palette.background.default,
          boxShadow: searchStore.filtersExpanded
            ? `${designTokens.searchBox.shadow.expanded} ${theme.palette.custom.shadow.primary}`
            : `${designTokens.searchBox.shadow.collapsed} ${theme.palette.custom.shadow.primary}`,
          borderRadius: `${designTokens.searchBox.expandedBorderRadius}px`,
          border: `1px solid ${theme.palette.custom.border.primary}`,
          opacity: 1,
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: searchStore.filtersExpanded
              ? `${designTokens.searchBox.shadow.expanded} ${theme.palette.custom.shadow.primary}`
              : `${designTokens.searchBox.shadow.hover} ${theme.palette.custom.shadow.secondary}`,
            transform: searchStore.filtersExpanded ? 'none' : 'translateY(-1px)',
          }
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
