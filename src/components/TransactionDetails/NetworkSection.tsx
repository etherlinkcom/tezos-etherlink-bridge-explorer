'use client';

import { observer } from 'mobx-react-lite';
import { DataSection } from './DataSection';
import { DetailField } from './DetailField';

interface NetworkSectionProps {
  title: string;
  hash: string | undefined;
  address: string | undefined;
  amount: string;
  block: string;
  showDivider?: boolean;
}

export const NetworkSection = observer(({
  title,
  hash,
  address,
  amount,
  showDivider,
  block,
}: NetworkSectionProps) => {
  return (
    <DataSection title={title} showDivider={showDivider}>
      <DetailField label="Transaction Hash" value={hash} />
      <DetailField label="Address" value={address} />
      <DetailField label="Block" value={block} />
      <DetailField label="Amount" value={amount} />
    </DataSection>
  );
});
