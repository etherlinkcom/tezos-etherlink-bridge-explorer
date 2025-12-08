import { observer } from "mobx-react-lite";
import { TransactionCard } from "./TransactionCard";
import { TezosTransaction } from "@/stores/tezosTransactionStore";
import { Box, SxProps, Theme } from "@mui/material";

interface TransactionCardsProps {
  transactions: TezosTransaction[];
  sx?: SxProps<Theme>;
}

export const TransactionCards = observer<TransactionCardsProps>(({ transactions, sx }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.input.id} transaction={transaction} />
      ))}
    </Box>
  );
});