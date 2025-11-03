import { DataSection } from './DataSection';
import { DetailField } from './DetailField';

interface NetworkSectionProps {
  title: string;
  hash: string | undefined;
  address: string | undefined;
  status: string;
  amount: string;
  block: string;
  showDivider?: boolean;
}

export const NetworkSection = ({
  title,
  hash,
  address,
  status,
  amount,
  showDivider,
  block,
}: NetworkSectionProps) => {
  return (
    <DataSection title={title} showDivider={showDivider}>
      <DetailField kind="hash" label="Transaction Hash" value={hash} copyable={hash !== undefined} monospace />
      <DetailField kind="address" label="Address" value={address} copyable={address !== undefined} monospace />
      <DetailField kind="block" label="Block" value={block} monospace />
      <DetailField kind="status" label="Status" value={status} />
      <DetailField label="Amount" value={amount} bold />
    </DataSection>
  );
};
