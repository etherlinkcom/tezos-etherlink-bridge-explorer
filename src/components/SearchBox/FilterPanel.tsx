"use client";

import { observer } from "mobx-react-lite";
import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import { searchStore } from "@/stores/searchStore";

export const FilterPanel = observer(() => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderTop: `1px solid ${alpha(theme.palette.custom.border.primary, 0.3)}`,
        padding: '12px',
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2.5,
          width: "100%",
          marginBottom: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: "100%" }}>
          <Select
            value={searchStore.withdrawalType}
            onChange={(e) =>
              searchStore.handleWithdrawalTypeChange(
                e.target.value as "all" | "normal" | "fast"
              )
            }
            displayEmpty
            aria-label="Filter transactions by type"
            MenuProps={{
              PaperProps: {
                className: "FilterMenuStyles",            
              },
            }}
            className="FilterInputStyles"
          >
            <MenuItem value="all">All Transactions</MenuItem>
            <MenuItem value="normal">Normal Transactions</MenuItem>
            <MenuItem value="fast">Fast Withdrawals</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          value={searchStore.minAmountInput}
          onChange={(e) => searchStore.setMinAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchStore.applyAmountFilters();
            }
          }}
          placeholder="Min amount"
          aria-label="Minimum amount filter"
          type="number"
          error={!!searchStore.minAmountError}
          helperText={searchStore.minAmountError || ''}
          slotProps={{
            htmlInput: {
              step: "any",
              min: 0,
            },
          }}
        className="FilterTextFieldStyles"
        />

        <TextField
          size="small"
          value={searchStore.maxAmountInput}
          onChange={(e) => searchStore.setMaxAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchStore.applyAmountFilters();
            }
          }}
          placeholder="Max amount"
          aria-label="Maximum amount filter"
          type="number"
          error={!!searchStore.maxAmountError}
          helperText={searchStore.maxAmountError || ''}
          slotProps={{
            htmlInput: {
              step: "any",
              min: 0,
            },
          }}
        className="FilterTextFieldStyles"
        />
      </Box>
    </Box>
  );
});
