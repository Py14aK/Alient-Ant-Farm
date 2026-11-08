export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  currency: string;
}

export interface CreditStatus {
  balance: number;
  costPerWeave: number;
  paymentsEnabled: boolean;
  packs: CreditPack[];
}

const PLAYER_ID_KEY = 'aethelgard.playerId';
let cachedPlayerId: string | null = null;

/**
 * Anonymous, device-local player identity used to key the credit balance.
 * Falls back to an in-memory ID when storage is unavailable.
 */
export function getPlayerId(): string {
  if (cachedPlayerId) return cachedPlayerId;
  let id: string | null = null;
  try {
    id = window.localStorage.getItem(PLAYER_ID_KEY);
  } catch {
    // storage blocked
  }
  if (!id || !/^[a-zA-Z0-9-]{16,64}$/.test(id)) {
    id = crypto.randomUUID();
    try {
      window.localStorage.setItem(PLAYER_ID_KEY, id);
    } catch {
      // storage blocked; ID lives for this tab only
    }
  }
  cachedPlayerId = id;
  return id;
}

export function playerHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { 'X-Player-Id': getPlayerId(), ...extra };
}

export async function fetchCreditStatus(): Promise<CreditStatus | null> {
  try {
    const res = await fetch('/api/credits', { headers: playerHeaders() });
    if (!res.ok) return null;
    return (await res.json()) as CreditStatus;
  } catch {
    return null;
  }
}

/** Creates a Stripe Checkout session and redirects the browser to it. */
export async function startCheckout(packId: string): Promise<string | null> {
  const res = await fetch('/api/credits/checkout', {
    method: 'POST',
    headers: playerHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ packId }),
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!res.ok || !body.url) {
    return body.message ?? 'Could not start checkout.';
  }
  window.location.assign(body.url);
  return null;
}

export async function confirmCheckout(
  sessionId: string
): Promise<{ applied: boolean; credits: number; balance: number; status: string } | null> {
  try {
    const res = await fetch('/api/credits/confirm', {
      method: 'POST',
      headers: playerHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function formatPrice(pack: CreditPack): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: pack.currency.toUpperCase(),
  }).format(pack.priceCents / 100);
}
