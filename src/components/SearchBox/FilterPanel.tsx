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
import { useState } from "react";

export const FilterPanel = observer(() => {
  const theme = useTheme();

  const [minHelperText, setMinHelperText] = useState<string | undefined>(undefined);
  const [maxHelperText, setMaxHelperText] = useState<string | undefined>(undefined);

  const setMinAmount = (value: string) => {
    try {
      const numberValue: number = Number(value.trim());
      const helperMessage: string | null = validateAmount(numberValue);
      if (helperMessage) {
        setMinHelperText(helperMessage);
        return;
      }
      if (filterStore.maxAmount && numberValue >= filterStore.maxAmount) {
        setMinHelperText("Min amount must be less than max amount");
        return;
      }
      filterStore.setMinAmount(numberValue);
      setMinHelperText(undefined);
    } catch (error) {
      setMinHelperText("Invalid amount");
    }
  }

  const setMaxAmount = (value: string) => {
    try {
      const numberValue: number = Number(value.trim());
      const helperMessage: string | null = validateAmount(numberValue);
      if (helperMessage) {
        setMaxHelperText(helperMessage);
        return;
      }
      console.log("1");
      if (filterStore.minAmount && numberValue <= filterStore.minAmount) {
        setMaxHelperText("Max amount must be greater than min amount");
        return;
      }
      console.log(numberValue);
      filterStore.setMaxAmount(numberValue);
      console.log("3");
      setMaxHelperText(undefined);
    } catch (error) {
      console.log(error);
      setMaxHelperText("Invalid amount");
    }
  }

  const setFiltersAndFetch = async () => {
    const filters = filterStore.buildFiltersFromState();
    filterStore.setActiveFilters(filters);
    await tezosTransactionStore.getTransactions({
      ...filters,
      resetStore: true,
      loadingMode: 'initial'
    });
  };

  const validateAmount = (amount: number): string | null => {
    if (isNaN(amount) || !isFinite(amount)) return "Must be a valid number";
    if (amount < 0) return "Must be greater than or equal to 0";
    return null;
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
          onChange={(e) => setMinAmount(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && minHelperText) {
              await setFiltersAndFetch();
            }
          }}
          placeholder="Min amount"
          aria-label="Minimum amount filter"
          type="text"
          inputMode="numeric"
          error={!!minHelperText}
          helperText={minHelperText}
          slotProps={{
            htmlInput: {
              pattern: "[0-9.]*",
            },
          }}
        className="FilterTextFieldStyles"
        />

        <TextField
          size="small"
          onChange={(e) => setMaxAmount(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && maxHelperText) {
              await setFiltersAndFetch();
            }
          }}
          placeholder="Max amount"
          aria-label="Maximum amount filter"
          type="text"
          inputMode="numeric"
          error={!!maxHelperText}
          helperText={maxHelperText}
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
