import { validateAddress, ValidationResult as TaquitoValidationResult } from '@taquito/utils';

export type InputType = 
  | 'tezos_address'      // tz1, tz2, tz3, tz4, KT1
  | 'etherlink_address'  // 0x... (40 hex chars)
  | 'tezos_tx_hash'      // op... (51 chars base58)
  | 'etherlink_tx_hash'  // 0x... (64 hex chars)
  | 'block_number'       // numeric
  | 'token_symbol'       // XTZ, USDT, etc.
  | 'invalid';

export interface ValidationResult {
  type: InputType;
  error?: string;
}

export function validateBlockNumber(input: string): ValidationResult {
  if (/^\d+$/.test(input)) {
    return { type: 'block_number' };
  }
  return { type: 'invalid', error: 'Block number must be numeric' };
}

export function validateTezosAddress(input: string): ValidationResult {
  if (!input.startsWith('tz') && !input.startsWith('KT')) {
    return { type: 'invalid', error: 'Not a Tezos address' };
  }
  
  const validationResult = validateAddress(input);
  if (validationResult === TaquitoValidationResult.VALID) {
    return { type: 'tezos_address' };
  }
  
  return { type: 'invalid', error: 'Invalid Tezos address' };
}

export function validateTezosTxHash(input: string): ValidationResult {
  if (!input.startsWith('o')) {
    return { type: 'invalid', error: 'Not a Tezos transaction hash' };
  }
  
  if (/^o[1-9A-HJ-NP-Za-km-z]{50}$/.test(input)) {
    return { type: 'tezos_tx_hash' };
  }
  
  return { type: 'invalid', error: 'Invalid Tezos operation hash format' };
}

export function validateEtherlinkAddress(input: string): ValidationResult {
  if (/^0x[0-9a-fA-F]{40}$/.test(input)) {
    return { type: 'etherlink_address' };
  }
  return { type: 'invalid', error: 'Invalid Etherlink address' };
}

export function validateEtherlinkTxHash(input: string): ValidationResult {
  if (/^0x[0-9a-fA-F]{64}$/.test(input)) {
    return { type: 'etherlink_tx_hash' };
  }
  return { type: 'invalid', error: 'Invalid Etherlink transaction hash' };
}

export function validateTokenSymbol(input: string): ValidationResult {
  // Allow 2-10 alphanumeric characters, case-insensitive
  if (/^[A-Za-z0-9]{2,10}$/.test(input)) {
    return { type: 'token_symbol' };
  }
  return { type: 'invalid', error: 'Invalid token symbol' };
}

export function validateInput(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { type: 'invalid', error: 'Input is empty' };
  }
  
  if (/^\d+$/.test(trimmed)) {
    return validateBlockNumber(trimmed);
  }
  
  if (trimmed.startsWith('tz') || trimmed.startsWith('KT')) {
    return validateTezosAddress(trimmed);
  }
  
  if (trimmed.startsWith('o')) {
    return validateTezosTxHash(trimmed);
  }
  
  if (trimmed.startsWith('0x')) {
    const hex = trimmed.slice(2);
    
    if (hex.length === 40) {
      return validateEtherlinkAddress(trimmed);
    }
    
    if (hex.length === 64) {
      return validateEtherlinkTxHash(trimmed);
    }
    
    return { type: 'invalid', error: 'Invalid length' };
  }
  
  // Token symbols: accept lowercase or uppercase
  if (/^[A-Za-z0-9]{2,10}$/.test(trimmed)) {
    return validateTokenSymbol(trimmed);
  }
  
  return { type: 'invalid', error: 'Unrecognized format' };
}

export function getValidationMessage(result: ValidationResult): string {
  return result.error || '';
}
