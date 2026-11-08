import fs from 'fs';
import path from 'path';
import express, { type Express, type Request, type Response } from 'express';
import Stripe from 'stripe';

/**
 * Credit packs sold through Stripe Checkout. Prices are defined server-side only,
 * so the client can never choose its own price.
 */
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  currency: string;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'spark', name: 'Spark of Creation', credits: 25, priceCents: 299, currency: 'usd' },
  { id: 'nebula', name: 'Nebula Bundle', credits: 100, priceCents: 999, currency: 'usd' },
  { id: 'cosmos', name: 'Cosmic Reservoir', credits: 300, priceCents: 2499, currency: 'usd' },
];

/** Credits granted to a brand-new player so they can try the AI weaver. */
export const STARTER_CREDITS = Number(process.env.STARTER_CREDITS ?? 5);
/** Credits consumed per Gemini-powered weave turn. */
export const CREDITS_PER_WEAVE = Number(process.env.CREDITS_PER_WEAVE ?? 1);

interface LedgerAccount {
  balance: number;
  createdAt: string;
  updatedAt: string;
}

interface LedgerFile {
  accounts: Record<string, LedgerAccount>;
  /** Stripe Checkout session IDs already credited (idempotency guard). */
  fulfilledSessions: Record<string, { playerId: string; credits: number; at: string }>;
}

const DATA_DIR = process.env.CREDITS_DATA_DIR ?? path.join(process.cwd(), 'data');
const LEDGER_PATH = path.join(DATA_DIR, 'credits.json');

/**
 * Minimal JSON-file ledger. All mutations run synchronously inside one Node tick,
 * so they cannot interleave. Swap for a real database before running multiple
 * server instances.
 */
class CreditLedger {
  private data: LedgerFile;

  constructor() {
    this.data = this.load();
  }

  private load(): LedgerFile {
    try {
      const raw = fs.readFileSync(LEDGER_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Partial<LedgerFile>;
      return {
        accounts: parsed.accounts ?? {},
        fulfilledSessions: parsed.fulfilledSessions ?? {},
      };
    } catch {
      return { accounts: {}, fulfilledSessions: {} };
    }
  }

  private persist() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${LEDGER_PATH}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, LEDGER_PATH);
  }

  private ensure(playerId: string): LedgerAccount {
    let acct = this.data.accounts[playerId];
    if (!acct) {
      const now = new Date().toISOString();
      acct = { balance: STARTER_CREDITS, createdAt: now, updatedAt: now };
      this.data.accounts[playerId] = acct;
      this.persist();
    }
    return acct;
  }

  balance(playerId: string): number {
    return this.ensure(playerId).balance;
  }

  /** Atomically deduct credits. Returns false if the balance is insufficient. */
  spend(playerId: string, amount: number): boolean {
    const acct = this.ensure(playerId);
    if (acct.balance < amount) return false;
    acct.balance -= amount;
    acct.updatedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  refund(playerId: string, amount: number) {
    const acct = this.ensure(playerId);
    acct.balance += amount;
    acct.updatedAt = new Date().toISOString();
    this.persist();
  }

  /** Credit a paid Checkout session exactly once. Returns true if newly applied. */
  fulfill(sessionId: string, playerId: string, credits: number): boolean {
    if (this.data.fulfilledSessions[sessionId]) return false;
    const acct = this.ensure(playerId);
    acct.balance += credits;
    acct.updatedAt = new Date().toISOString();
    this.data.fulfilledSessions[sessionId] = {
      playerId,
      credits,
      at: acct.updatedAt,
    };
    this.persist();
    return true;
  }
}

export const ledger = new CreditLedger();

const PLAYER_ID_RE = /^[a-zA-Z0-9-]{16,64}$/;

/** Reads and validates the anonymous player ID sent by the client. */
export function getPlayerId(req: Request): string | null {
  const id = req.header('x-player-id');
  return id && PLAYER_ID_RE.test(id) ? id : null;
}

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'MY_STRIPE_SECRET_KEY') return null;
  return new Stripe(key);
}

function appBaseUrl(req: Request): string {
  const configured = process.env.APP_URL;
  if (configured && configured !== 'MY_APP_URL') return configured.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

/** Grants credits for a Checkout session if, and only if, Stripe reports it paid. */
function fulfillSession(session: Stripe.Checkout.Session): { applied: boolean; credits: number } {
  if (session.payment_status !== 'paid') return { applied: false, credits: 0 };
  const playerId = session.metadata?.playerId;
  const packId = session.metadata?.packId;
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!playerId || !PLAYER_ID_RE.test(playerId) || !pack) {
    console.error(`Checkout session ${session.id} has invalid credit metadata`);
    return { applied: false, credits: 0 };
  }
  return { applied: ledger.fulfill(session.id, playerId, pack.credits), credits: pack.credits };
}

/**
 * The Stripe webhook needs the raw request body for signature verification,
 * so this must be registered BEFORE express.json().
 */
export function registerStripeWebhook(app: Express) {
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    (req: Request, res: Response) => {
      const stripe = getStripe();
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripe || !secret) {
        return res.status(503).json({ error: 'PAYMENTS_NOT_CONFIGURED' });
      }
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          req.header('stripe-signature') ?? '',
          secret
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'bad signature';
        return res.status(400).send(`Webhook Error: ${message}`);
      }

      if (
        event.type === 'checkout.session.completed' ||
        event.type === 'checkout.session.async_payment_succeeded'
      ) {
        fulfillSession(event.data.object as Stripe.Checkout.Session);
      }
      return res.json({ received: true });
    }
  );
}

export function registerCreditRoutes(app: Express) {
  app.get('/api/credits', (req, res) => {
    const playerId = getPlayerId(req);
    if (!playerId) return res.status(400).json({ error: 'INVALID_PLAYER_ID' });
    return res.json({
      balance: ledger.balance(playerId),
      costPerWeave: CREDITS_PER_WEAVE,
      paymentsEnabled: getStripe() !== null,
      packs: CREDIT_PACKS,
    });
  });

  app.post('/api/credits/checkout', async (req, res) => {
    const playerId = getPlayerId(req);
    if (!playerId) return res.status(400).json({ error: 'INVALID_PLAYER_ID' });
    const pack = CREDIT_PACKS.find((p) => p.id === req.body?.packId);
    if (!pack) return res.status(400).json({ error: 'UNKNOWN_PACK' });

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        error: 'PAYMENTS_NOT_CONFIGURED',
        message: 'Set STRIPE_SECRET_KEY on the server to enable credit purchases.',
      });
    }

    try {
      const base = appBaseUrl(req);
      const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: pack.currency,
                unit_amount: pack.priceCents,
                product_data: {
                  name: `${pack.name} — ${pack.credits} Weave Credits`,
                  description: 'Credits for AI-powered Causal Weaver turns in Aethelgard.',
                },
              },
            },
          ],
          client_reference_id: playerId,
          metadata: { playerId, packId: pack.id },
          success_url: `${base}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/?checkout=cancelled`,
      });
      return res.json({ url: session.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stripe error';
      console.error('Error creating checkout session:', message);
      return res.status(502).json({ error: 'CHECKOUT_FAILED', message });
    }
  });

  /**
   * Called by the client after redirect back from Stripe. Re-fetches the session
   * from Stripe (never trusts the client), so credits are granted even when the
   * webhook is not configured. Idempotent with the webhook path.
   */
  app.post('/api/credits/confirm', async (req, res) => {
    const playerId = getPlayerId(req);
    if (!playerId) return res.status(400).json({ error: 'INVALID_PLAYER_ID' });
    const sessionId = req.body?.sessionId;
    if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
      return res.status(400).json({ error: 'INVALID_SESSION' });
    }
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: 'PAYMENTS_NOT_CONFIGURED' });

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.playerId !== playerId) {
        return res.status(403).json({ error: 'SESSION_PLAYER_MISMATCH' });
      }
      const { applied, credits } = fulfillSession(session);
      return res.json({
        status: session.payment_status,
        applied,
        credits,
        balance: ledger.balance(playerId),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stripe error';
      return res.status(502).json({ error: 'CONFIRM_FAILED', message });
    }
  });
}
