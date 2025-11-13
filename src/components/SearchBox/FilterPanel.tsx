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
import { searchStore, WithdrawalType } from "@/stores/searchStore";
import { tezosTransactionStore } from "@/stores/tezosTransactionStore";

export const FilterPanel = observer(() => {
  const theme = useTheme();

  const applyFiltersAndFetch = async () => {
    const filters = searchStore.buildFiltersFromState();
    searchStore.setActiveFilters(filters);
    await tezosTransactionStore.getTransactions({
      ...filters,
      resetStore: true,
      loadingMode: 'initial'
    });
  };

  const handleWithdrawalTypeChange = async (newType: WithdrawalType) => {
    searchStore.setWithdrawalType(newType);
    await applyFiltersAndFetch();
  };

  const validateAmount = (amount: string): string => {
    const amountValue = Number(amount);
    if (isNaN(amountValue) || !isFinite(amountValue)) return "Must be a valid number";
    if (amountValue < 0) return "Must be greater than or equal to 0";
    return "";
  };

  const validateAmountRange = (): string => {
    const minAmount = searchStore.minAmount.trim();
    const maxAmount = searchStore.maxAmount.trim();
    
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
            onChange={async (e) => {
              await handleWithdrawalTypeChange(e.target.value as WithdrawalType);
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
          value={searchStore.minAmount}
          onChange={(e) => searchStore.setMinAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && validateAmountRange() === "") {
              applyFiltersAndFetch();
            }
          }}
          placeholder="Min amount"
          aria-label="Minimum amount filter"
          type="number"
          error={validateAmountRange() !== ""}
          helperText={validateAmountRange()}
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
          value={searchStore.maxAmount}
          onChange={(e) => searchStore.setMaxAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && validateAmountRange() === "") {
              applyFiltersAndFetch();
            }
          }}
          placeholder="Max amount"
          aria-label="Maximum amount filter"
          type="number"
          error={validateAmountRange() !== ""}
          helperText={validateAmountRange()}
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
