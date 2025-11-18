export function toDecimalValue(amount: string, decimals: number): number {
  let formatted: string = amount;
  if (formatted.length > decimals) {
    formatted = formatted.substring(0, formatted.length - decimals) + '.' + formatted.substring(formatted.length - decimals);
  } else {
    formatted = '0.' + '0'.repeat(decimals - formatted.length) + formatted;
  }
  
  return Number(formatted);
}

export const formatEtherlinkValue = (value: string | undefined): string => {
  if (!value || value === '-') return '-';
  return value.startsWith('0x') ? value : `0x${value}`;
};

export const formatRelativeTime = (date: Date) => {
  const now: Date = new Date();
  const diffInSeconds: number = Math.floor((now.getTime() - date.getTime()) / 1000);
  const isFuture: boolean = diffInSeconds < 0;
  const absDiffInSeconds: number = Math.abs(diffInSeconds);
  
  let timeString: string;
  if (absDiffInSeconds < 60) {
    timeString = `${absDiffInSeconds} second${absDiffInSeconds !== 1 ? 's' : ''}`;
  } else if (absDiffInSeconds < 3600) {
    const minutes = Math.floor(absDiffInSeconds / 60);
    timeString = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (absDiffInSeconds < 86400) {
    const hours = Math.floor(absDiffInSeconds / 3600);
    timeString = `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(absDiffInSeconds / 86400);
    timeString = `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  return isFuture ? `in ${timeString}` : `${timeString} ago`;
};

export const formatDateTime = (date: Date | string | number): string => {
  const dateObj: Date = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

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

  const relative: string = formatRelativeTime(dateObj);
  return `${exact} (${relative})`;
};

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