import { validateAddress, ValidationResult as TaquitoValidationResult } from '@taquito/utils';

export type InputType = 
  | 'tezos_address'      // tz1, tz2, tz3, tz4, KT1
  | 'etherlink_address'  // 0x... (40 hex chars)
  | 'tezos_tx_hash'      // op... (51 chars base58)
  | 'etherlink_tx_hash'  // 0x... (64 hex chars)
  | 'block_number'       // numeric
  | 'invalid';

export interface ValidationResult {
  isValid: boolean;
  type: InputType;
  error?: string;
}

export function validateBlockNumber(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, type: 'invalid', error: 'Input is empty' };
  }
  
  if (/^\d+$/.test(trimmed)) {
    return { isValid: true, type: 'block_number' };
  }
  
  return { isValid: false, type: 'invalid', error: 'Block number must be numeric' };
}

export function validateTezosAddress(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, type: 'invalid', error: 'Input is empty' };
  }
  
  if (!trimmed.startsWith('tz') && !trimmed.startsWith('KT')) {
    return { isValid: false, type: 'invalid', error: 'Not a Tezos address' };
  }
  
  const validationResult = validateAddress(trimmed);
  if (validationResult === TaquitoValidationResult.VALID) {
    return { isValid: true, type: 'tezos_address' };
  }
  
  return { 
    isValid: false, 
    type: 'invalid', 
    error: 'Invalid Tezos address' 
  };
}

export function validateTezosTxHash(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, type: 'invalid', error: 'Input is empty' };
  }
  
  if (!trimmed.startsWith('o')) {
    return { isValid: false, type: 'invalid', error: 'Not a Tezos transaction hash' };
  }
  
  if (/^o[1-9A-HJ-NP-Za-km-z]{50}$/.test(trimmed)) {
    return { isValid: true, type: 'tezos_tx_hash' };
  }
  
  return { isValid: false, type: 'invalid', error: 'Invalid Tezos operation hash format' };
}

export function validateEtherlinkAddress(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, type: 'invalid', error: 'Input is empty' };
  }
  
  if (!trimmed.startsWith('0x')) {
    return { isValid: false, type: 'invalid', error: 'Not an Etherlink address' };
  }
  
  const hex = trimmed.slice(2);
  
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    return { isValid: false, type: 'invalid', error: 'Invalid hexadecimal characters' };
  }
  
  if (hex.length === 40) {
    return { isValid: true, type: 'etherlink_address' };
  }
  
  return { 
    isValid: false, 
    type: 'invalid', 
    error: `Invalid address length: expected 40 hex chars, got ${hex.length}` 
  };
}

export function validateEtherlinkTxHash(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, type: 'invalid', error: 'Input is empty' };
  }
  
  if (!trimmed.startsWith('0x')) {
    return { isValid: false, type: 'invalid', error: 'Not an Etherlink transaction hash' };
  }
  
  const hex = trimmed.slice(2);
  
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    return { isValid: false, type: 'invalid', error: 'Invalid hexadecimal characters' };
  }
  
  if (hex.length === 64) {
    return { isValid: true, type: 'etherlink_tx_hash' };
  }
  
  return { 
    isValid: false, 
    type: 'invalid', 
    error: `Invalid tx hash length: expected 64 hex chars, got ${hex.length}` 
  };
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
    
    return { 
      isValid: false, 
      type: 'invalid', 
      error: `Invalid length` 
    };
  }
  
  return { 
    isValid: false, 
    type: 'invalid', 
    error: 'Unrecognized format' 
  };
}

export function getValidationMessage(result: ValidationResult): string {
  if (!result.isValid) {
    return result.error || 'Invalid input';
  }
  else {
    return '';
  }
}

