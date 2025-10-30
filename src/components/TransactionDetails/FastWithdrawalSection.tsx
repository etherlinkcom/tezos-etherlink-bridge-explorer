import { DataSection } from './DataSection';
import { DetailField } from './DetailField';

interface FastWithdrawalData {
  hash: string;
  hasHash: boolean;
  address: string;
  hasAddress: boolean;
  status: string;
  amount: string;
  block: string;
  date: string;
}

export const FastWithdrawalSection = ({ data }: { data: FastWithdrawalData }) => {
  return (
    <DataSection title="Fast Withdrawal Information" showDivider>
      <DetailField kind="hash" label="Payout Transaction Hash" value={data.hash} copyable={data.hasHash} monospace />
      <DetailField kind="address" label="Payout Address" value={data.address} copyable={data.hasAddress} monospace />
      <DetailField kind="status" label="Payout Status" value={data.status} />
      <DetailField label="Payout Amount" value={data.amount} bold />
      <DetailField label="Payout Block" value={data.block} />
      <DetailField label="Payout Date" value={data.date} />
    </DataSection>
  );
};
