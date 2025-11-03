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
      <DetailField kind="hash" label="Payout Transaction Hash" value={data.hash} copyable={data.hash !== undefined} monospace />
      <DetailField kind="address" label="Payout Address" value={data.address} copyable={data.address !== undefined} monospace />
      <DetailField label="Payout Amount" value={data.amount} bold />
      <DetailField label="Payout Block" value={data.block} />
      <DetailField label="Payout Date" value={data.date} />
    </DataSection>
  );
};
