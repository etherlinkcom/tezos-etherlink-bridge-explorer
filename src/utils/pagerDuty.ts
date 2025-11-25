interface PagerDutyResponse {
  status?: string;
  message?: string;
  dedup_key?: string;
  [key: string]: unknown;
}

const PAGERDUTY_EVENTS_API_URL: string = 'https://events.pagerduty.com/v2/enqueue';

export async function createPagerDutyIncident(transactionHash: string, additionalDetails?: Record<string, unknown>): Promise<PagerDutyResponse | null> {
  const routingKey: string | undefined = process.env.PAGER_DUTY_ROUTING_KEY;

  if (!routingKey) {
    console.warn('PagerDuty routing key not configured. Skipping incident creation.');
    return null;
  }

  const summary: string = 'Unclaimed Fast Withdrawal';
  const severity: string = 'critical';
  const source: string = 'Bridge Explorer';

  const customDetails: Record<string, unknown> = {
    transaction_hash: transactionHash,
    issue_type: 'unclaimed_fast_withdrawal',
    timestamp: new Date().toISOString(),
    ...additionalDetails,
  };

  const requestBody: string = JSON.stringify({
    payload: {
      summary: summary,
      severity: severity,
      source: source,
      custom_details: customDetails,
    },
    routing_key: routingKey,
    event_action: 'trigger',
    dedup_key: transactionHash,
  });
  try {
    const response: Response = await fetch(PAGERDUTY_EVENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    if (!response.ok) {
      const errorData: unknown = await response.json().catch(() => ({}));
      console.error('PagerDuty API error:', response.status, response.statusText, JSON.stringify(errorData));
      return null;
    }

    const responseData: PagerDutyResponse = await response.json();
  
    return responseData;
  } catch (error: unknown) {
    console.error('Error creating PagerDuty incident:', error);
    return null;
  }
}
