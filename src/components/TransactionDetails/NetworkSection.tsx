import { DataSection } from './DataSection';
import { DetailField } from './DetailField';

interface NetworkSectionProps {
  title: string;
  hash: string;
  hasHash: boolean;
  address: string;
  hasAddress: boolean;
  status: string;
  amount: string;
  block: string;
  showDivider?: boolean;
}

export const NetworkSection = ({
  title,
  hash,
  hasHash,
  address,
  hasAddress,
  status,
  amount,
  showDivider = false,
  block,
}: NetworkSectionProps) => {
  return (
    <DataSection title={title} showDivider={showDivider}>
      <DetailField kind="hash" label="Transaction Hash" value={hash} copyable={hasHash} monospace />
      <DetailField kind="address" label="Address" value={address} copyable={hasAddress} monospace />
      <DetailField kind="block" label="Block" value={block} monospace />
      <DetailField kind="status" label="Status" value={status} />
      <DetailField label="Amount" value={amount} bold />
    </DataSection>
  );
};
