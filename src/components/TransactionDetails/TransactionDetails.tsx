'use client';

import { 
  Box, 
  Typography, 
  IconButton,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/navigation';
import { transactionDetailsStore } from '@/stores/transactionDetailsStore';
import { DetailField } from './DetailField';
import { DataSection } from './DataSection';
import { formatTransactionData } from '@/utils/transactionFormatter';

export const TransactionDetails = observer(() => {
  const router = useRouter();
  const { selectedTransaction, loading, hasError, error } = transactionDetailsStore;

  const handleBack = (): void => {
    router.push('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" component="h1" sx={{ fontSize: '1.1rem', fontWeight: '500' }}>
          Transaction Details
        </Typography>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
          <CircularProgress size={24} />
          <Typography>Loading transaction details...</Typography>
        </Box>
      ) : hasError ? (
        <Typography color="error" sx={{ py: 4 }}>
          {error}
        </Typography>
      ) : !selectedTransaction ? (
        <Typography sx={{ py: 4 }}>
          Transaction not found
        </Typography>
      ) : (() => {
        const { sections, validation } = formatTransactionData(selectedTransaction);
        return (
          <Card>
            <CardContent sx={{ p: 3 }}>
              {!validation.isValid && (
                <DataSection 
                  title="Data Validation Issues" 
                  showDivider
                >
                  {validation.errors.map((error, index) => (
                    <DetailField
                      key={index}
                      label="Error"
                      value={error}
                    />
                  ))}
                </DataSection>
              )}

              {sections.map((section, index) => (
                <DataSection 
                  key={index}
                  title={section.title}
                  showDivider={index > 0}
                >
                  {section.fields.map((field, fieldIndex) => (
                    <DetailField
                      key={fieldIndex}
                      label={field.label}
                      value={field.value}
                      type={field.type}
                      copyable={field.copyable}
                      monospace={field.monospace}
                      bold={field.bold}
                      tooltip={field.tooltip}
                    />
                  ))}
                </DataSection>
              ))}
            </CardContent>
          </Card>
        );
      })()}
    </Box>
  );
});