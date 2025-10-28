export function toDecimalValue(amount: number, decimals: number): number {
  return amount / Math.pow(10, decimals);
}

export const formatEtherlinkValue = (value: string | undefined): string => {
  if (!value || value === '-') return '-';
  return value.startsWith('0x') ? value : `0x${value}`;
};

export const formatTimeAgo = (date: Date) => {
  const now: Date = new Date();
  const diffInSeconds: number = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

export const formatDateTime = (date: Date | string | number): string => {
  const dateObj: Date = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  // TODO: check locale
  const exact: string = dateObj.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  const relative: string = formatTimeAgo(dateObj);
  return `${exact} (${relative})`;
};

// TODO: check logic for large amounts
export const formatAmount = (amount: string | number, symbol: string): string => {
  const numAmount: number = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return `${amount} ${symbol}`;
  
  if (numAmount >= 1000000000) {
    return `${(numAmount / 1000000000).toFixed(2)}B ${symbol}`;
  } else if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(2)}M ${symbol}`;
  }
  
  if (numAmount >= 1) {
    return `${numAmount.toFixed(2)} ${symbol}`;
  } else if (numAmount > 0) {
    return `${numAmount.toFixed(6)} ${symbol}`;
  }
  
  return `${amount} ${symbol}`;
};