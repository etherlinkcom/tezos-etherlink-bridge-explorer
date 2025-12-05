import { DataSection } from './DataSection';
import { DetailField } from './DetailField';

interface FastWithdrawalData {
  hash: string | undefined;
  address: string | undefined;
  amount: string;
  block: string;
  date: string;
}

export const FastWithdrawalSection = ({ data }: { data: FastWithdrawalData }) => {
  return (
    <DataSection title="Payout Fast Withdrawal Information" showDivider>
      <DetailField label="Transaction Hash" value={data.hash} />
      <DetailField label="Address" value={data.address} />
      <DetailField label="Amount" value={data.amount} />
      <DetailField label="Block" value={data.block} />
      <DetailField label="Date" value={data.date} />
    </DataSection>
  );
};
