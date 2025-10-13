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
  isValid: boolean;
  type: InputType;
  error?: string;
}

export function validateBlockNumber(input: string): ValidationResult {
  if (/^\d+$/.test(input)) {
    return { isValid: true, type: 'block_number' };
  }
  return { isValid: false, type: 'invalid', error: 'Block number must be numeric' };
}

export function validateTezosAddress(input: string): ValidationResult {
  if (!input.startsWith('tz') && !input.startsWith('KT')) {
    return { isValid: false, type: 'invalid', error: 'Not a Tezos address' };
  }
  
  const validationResult = validateAddress(input);
  if (validationResult === TaquitoValidationResult.VALID) {
    return { isValid: true, type: 'tezos_address' };
  }
  
  return { isValid: false, type: 'invalid', error: 'Invalid Tezos address' };
}

export function validateTezosTxHash(input: string): ValidationResult {
  if (!input.startsWith('o')) {
    return { isValid: false, type: 'invalid', error: 'Not a Tezos transaction hash' };
  }
  
  if (/^o[1-9A-HJ-NP-Za-km-z]{50}$/.test(input)) {
    return { isValid: true, type: 'tezos_tx_hash' };
  }
  
  return { isValid: false, type: 'invalid', error: 'Invalid Tezos operation hash format' };
}

export function validateEtherlinkAddress(input: string): ValidationResult {
  if (/^0x[0-9a-fA-F]{40}$/.test(input)) {
    return { isValid: true, type: 'etherlink_address' };
  }
  return { isValid: false, type: 'invalid', error: 'Invalid Etherlink address' };
}

export function validateEtherlinkTxHash(input: string): ValidationResult {
  if (/^0x[0-9a-fA-F]{64}$/.test(input)) {
    return { isValid: true, type: 'etherlink_tx_hash' };
  }
  return { isValid: false, type: 'invalid', error: 'Invalid Etherlink transaction hash' };
}

export function validateTokenSymbol(input: string): ValidationResult {
  if (/^[A-Z0-9]{2,10}$/.test(input)) {
    return { isValid: true, type: 'token_symbol' };
  }
  return { isValid: false, type: 'invalid', error: 'Invalid token symbol' };
}

export function validateInput(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, type: 'invalid', error: 'Input is empty' };
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
    
    return { isValid: false, type: 'invalid', error: 'Invalid length' };
  }
  
  if (/^[A-Z0-9]{2,10}$/.test(trimmed)) {
    return validateTokenSymbol(trimmed);
  }
  
  return { isValid: false, type: 'invalid', error: 'Unrecognized format' };
}

export function getValidationMessage(result: ValidationResult): string {
  return result.error || '';
}
