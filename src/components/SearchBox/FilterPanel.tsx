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
import { filterStore, WithdrawalType } from "@/stores/filterStore";
import { tezosTransactionStore } from "@/stores/tezosTransactionStore";

export const FilterPanel = observer(() => {
  const theme = useTheme();

  const setFiltersAndFetch = async () => {
    const filters = filterStore.buildFiltersFromState();
    filterStore.setActiveFilters(filters);
    await tezosTransactionStore.getTransactions({
      ...filters,
      resetStore: true,
      loadingMode: 'initial'
    });
  };

  const validateAmount = (amount: string): string => {
    const amountValue = Number(amount);
    if (isNaN(amountValue) || !isFinite(amountValue)) return "Must be a valid number";
    if (amountValue < 0) return "Must be greater than or equal to 0";
    return "";
  };

  const validateAmountRange = (): string => {
    const minAmount = filterStore.minAmountValue;
    const maxAmount = filterStore.maxAmountValue;
    
    if (!minAmount && !maxAmount) return "";
    
    if (minAmount) {
      const minError = validateAmount(minAmount);
      if (minError) return minError;
    }
    
    if (maxAmount) {
      const maxError = validateAmount(maxAmount);
      if (maxError) return maxError;
    }
    
    if (minAmount && maxAmount && Number(minAmount) >= Number(maxAmount)) {
      return "Min amount must be less than max amount";
    }
    return "";
  };

  const amountValidationMessage = validateAmountRange();

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
            value={filterStore.withdrawalType}
            onChange={async (e) => {
              filterStore.setWithdrawalType(e.target.value as WithdrawalType);
              await setFiltersAndFetch();
            }}
            displayEmpty
            aria-label="Filter transactions by type"
            MenuProps={{
              PaperProps: {
                className: "FilterMenuStyles",            
              },
            }}
            className= "FilterInputStyles"
          >
            <MenuItem value="all">All Transactions</MenuItem>
            <MenuItem value="normal">Normal Transactions</MenuItem>
            <MenuItem value="fast">Fast Withdrawals</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          value={filterStore.minAmount}
          onChange={(e) => filterStore.setMinAmount(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && amountValidationMessage === "") {
              await setFiltersAndFetch();
            }
          }}
          placeholder="Min amount"
          aria-label="Minimum amount filter"
          type="text"
          inputMode="numeric"
          error={amountValidationMessage !== ""}
          helperText={amountValidationMessage}
          slotProps={{
            htmlInput: {
              pattern: "[0-9.]*",
            },
          }}
        className="FilterTextFieldStyles"
        />

        <TextField
          size="small"
          value={filterStore.maxAmount}
          onChange={(e) => filterStore.setMaxAmount(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && amountValidationMessage === "") {
              await setFiltersAndFetch();
            }
          }}
          placeholder="Max amount"
          aria-label="Maximum amount filter"
          type="text"
          inputMode="numeric"
          error={amountValidationMessage !== ""}
          helperText={amountValidationMessage}
          slotProps={{
            htmlInput: {
              pattern: "[0-9.]*",
            },
          }}
        className="FilterTextFieldStyles"
        />
      </Box>
    </Box>
  );
});
