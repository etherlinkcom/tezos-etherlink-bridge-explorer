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
    <DataSection title="Fast Withdrawal Information" showDivider>
      <DetailField label="Payout Transaction Hash" value={data.hash} />
      <DetailField label="Payout Address" value={data.address} />
      <DetailField label="Payout Amount" value={data.amount} />
      <DetailField label="Payout Block" value={data.block} />
      <DetailField label="Payout Date" value={data.date} />
    </DataSection>
  );
};
