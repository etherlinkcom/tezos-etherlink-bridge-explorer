import { fetchJson } from './fetchJson';
import { toDecimalValue } from './formatters';

interface TzktTransaction {
  id: number;
  amount: number; // mutez
  target?: { address: string };
}

interface TzktTokenTransfer {
  amount: string; // raw token units
  to?: { address: string };
}

const sameAccount = (a: string | undefined, b: string | undefined): boolean =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

/**
 * Sources how much a withdrawal actually delivered on Tezos (L1) from TzKT, a
 * canonical indexer independent of our custom GraphQL indexer. Used as a
 * fallback when the indexer doesn't return `withdrawal.l1_transaction.amount`.
 *
 * A withdrawal settles on L1 as an outbox execution with several internal
 * transactions. We read the payout to the withdrawer (`l1Account`), ignoring
 * unrelated transfers in the operation (e.g. a fixed relayer fee to another
 * address) by matching on the account.
 *
 * The payout kind is decided by the token, NOT by "whichever transfer is found
 * first": native XTZ delivers a mutez transfer, FA tokens deliver a token
 * transfer. Branching on `isNativeXtz` avoids ever returning incidental native
 * XTZ (e.g. dust/refund) sent to an FA-token withdrawer.
 *
 * Returns the received amount as a decimal string (using `decimals`), or null
 * if it can't be determined (not found, or the request failed).
 */
export async function fetchWithdrawalL1ReceivedAmount(
  tezosExplorerApiUrl: string,
  operationHash: string,
  l1Account: string | undefined,
  isNativeXtz: boolean,
  decimals: number
): Promise<string | null> {
  if (!operationHash || !l1Account) return null;

  try {
    const hash: string = encodeURIComponent(operationHash);
    const transactions: TzktTransaction[] = await fetchJson<TzktTransaction[]>(
      `${tezosExplorerApiUrl}/v1/operations/transactions/${hash}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
      3
    );

    if (isNativeXtz) {
      // Native XTZ payout: a positive-mutez transfer to the withdrawer.
      const payout: TzktTransaction | undefined = transactions.find(
        tx => tx.amount > 0 && sameAccount(tx.target?.address, l1Account)
      );
      return payout ? toDecimalValue(String(payout.amount), decimals).toString() : null;
    }

    // FA token payout: a token transfer to the withdrawer within this operation.
    const ids: string = transactions.map(tx => tx.id).join(',');
    if (!ids) return null;

    const transfers: TzktTokenTransfer[] = await fetchJson<TzktTokenTransfer[]>(
      `${tezosExplorerApiUrl}/v1/tokens/transfers?transactionId.in=${ids}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
      3
    );
    const tokenPayout: TzktTokenTransfer | undefined = transfers.find(
      tr => sameAccount(tr.to?.address, l1Account)
    );
    return tokenPayout ? toDecimalValue(tokenPayout.amount, decimals).toString() : null;
  } catch {
    return null;
  }
}
