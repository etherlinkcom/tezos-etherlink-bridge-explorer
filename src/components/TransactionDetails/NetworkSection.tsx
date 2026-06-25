'use client';

import { observer } from 'mobx-react-lite';
import { DataSection } from './DataSection';
import { DetailField } from './DetailField';
import { ExplorerInfo } from '@/utils/explorerInfo';

interface NetworkSectionProps {
  title: string;
  hash: string | undefined;
  address: string | undefined;
  amount: string;
  block: string | undefined;
  showDivider?: boolean;
  hashExplorer?: ExplorerInfo;
  addressExplorer?: ExplorerInfo;
}

export const NetworkSection = observer(({
  title,
  hash,
  address,
  amount,
  showDivider,
  block,
  hashExplorer,
  addressExplorer,
}: NetworkSectionProps) => {
  return (
    <DataSection title={title} showDivider={showDivider}>
      <DetailField label="Transaction Hash" value={hash} explorerOverride={hashExplorer} />
      <DetailField label="Address" value={address} explorerOverride={addressExplorer} />
      <DetailField label="Block" value={block} />
      <DetailField label="Amount" value={amount} />
    </DataSection>
  );
});
