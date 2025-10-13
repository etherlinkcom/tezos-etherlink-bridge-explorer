'use client';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { tezosTransactionStore } from '@/stores/tezosTransactionStore';
import { validateInput, getValidationMessage, type ValidationResult } from '@/utils/validation';

const SearchBar = observer(() => {
  const [searchInput, setSearchInput] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleInputChange = (value: string) => {
    setSearchInput(value);
    
    if (value.trim()) {
      const result = validateInput(value);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  };

  const handleSearch = async () => {
    const filters: any = {};
    
    if (searchInput.trim()) {
      const validation = validateInput(searchInput);
      
      if (!validation.isValid) {
        setValidationResult(validation);
        return;
      }
      
      switch (validation.type) {
        case 'tezos_address':
        case 'etherlink_address':
          filters.address = searchInput.trim();
          break;
        case 'tezos_tx_hash':
        case 'etherlink_tx_hash':
          filters.txHash = searchInput.trim();
          break;
        case 'block_number':
          filters.level = parseInt(searchInput.trim());
          break;
      }
    }
    tezosTransactionStore.resetStore();
    await tezosTransactionStore.getTransactions(filters);
  };

  const handleClear = async () => {
    setSearchInput('');
    setValidationResult(null);
    await tezosTransactionStore.getTransactions();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{ 
      marginBottom: '30px', 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Search & Filter Transactions</h3>
      
      {/* Search Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
          Search:
        </label>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter tx hash, address (tz1..., KT1..., 0x...), or block number"
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            border: validationResult && !validationResult.isValid
              ? '2px solid #dc3545'
              : '1px solid #ced4da',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
        {validationResult && !validationResult.isValid && (
          <div style={{ 
            marginTop: '5px', 
            fontSize: '13px', 
            color: '#dc3545',
            fontWeight: 500
          }}>
            {getValidationMessage(validationResult)}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔍 Search
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;

