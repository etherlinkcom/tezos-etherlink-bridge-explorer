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

  const getAmountError = (amount: string): string => {
    const trimmed = amount.trim();
    if (!trimmed) return "";
    const amountValue = Number(trimmed);
    if (isNaN(amountValue) || !isFinite(amountValue)) return "Must be a valid number";
    if (amountValue < 0) return "Must be greater than or equal to 0";
    return "";
  };

  const getAmountErrorText = (): string => {
    const minTrimmed = searchStore.minAmountInput.trim();
    const maxTrimmed = searchStore.maxAmountInput.trim();
    
    if (!minTrimmed && !maxTrimmed) return "";
    
    if (minTrimmed) {
      const minError = getAmountError(minTrimmed);
      if (minError) return minError;
    }
    
    if (maxTrimmed) {
      const maxError = getAmountError(maxTrimmed);
      if (maxError) return maxError;
    }
    
    if (minTrimmed && maxTrimmed && Number(minTrimmed) >= Number(maxTrimmed)) {
      return "Min amount must be less than max amount";
    }
    return "";
  };

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
          error={getAmountErrorText() !== ""}
          helperText={getAmountErrorText()}
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
          error={getAmountErrorText() !== ""}
          helperText={getAmountErrorText()}
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
