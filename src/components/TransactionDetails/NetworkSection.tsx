'use client';

import { observer } from 'mobx-react-lite';
import { DataSection } from './DataSection';
import { DetailField } from './DetailField';
import { networkStore } from '@/stores/networkStore';

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
  const explorerInfo: { url: string; name: string } | null = networkStore.getBlockExplorerInfo(hash);
  
  return (
    <DataSection title={title} showDivider={showDivider}>
      <DetailField kind="hash" label="Transaction Hash" value={hash} copyable={hash !== undefined} monospace explorerUrl={explorerInfo?.url} explorerName={explorerInfo?.name}/>
      <DetailField kind="address" label="Address" value={address} copyable={address !== undefined} monospace />
      <DetailField kind="block" label="Block" value={block} monospace />
      <DetailField label="Amount" value={amount} bold />
    </DataSection>
  );
});
