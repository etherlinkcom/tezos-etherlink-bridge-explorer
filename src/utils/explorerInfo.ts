import { validateInput, ValidationResult } from './validation';
import { NetworkConfig } from '@/stores/networkStore';

export interface ExplorerInfo {
  url: string;
  name: string;
}

export const getExplorerInfo = (
  value: string | undefined,
  config: NetworkConfig
): ExplorerInfo | null => {
  if (!value || value === '-') return null;
  
  const trimmed: string = value.trim();
  const validation: ValidationResult = validateInput(trimmed);
  
  if (validation.type === 'tezos_tx_hash' || validation.type === 'tezos_address') {
    return {
      url: `${config.tezosExplorerUrl}/${trimmed}`,
      name: 'TzKT Explorer'
    };
  }
  
  if (validation.type === 'etherlink_tx_hash') {
    return {
      url: `${config.etherlinkExplorerUrl}/tx/${trimmed}`,
      name: 'Etherlink Explorer'
    };
  }
  
  if (validation.type === 'etherlink_address') {
    return {
      url: `${config.etherlinkExplorerUrl}/address/${trimmed}`,
      name: 'Etherlink Explorer'
    };
  }
  
  return null;
};
