import React, { useEffect, useState } from 'react';
import { CreditStatus, formatPrice, startCheckout } from '../utils/credits';

interface CreditsModalProps {
  status: CreditStatus | null;
  notice: string | null;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ status, notice, onClose }) => {
  const [pendingPack, setPendingPack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const handleBuy = async (packId: string) => {
    setError(null);
    setPendingPack(packId);
    const err = await startCheckout(packId).catch(() => 'Could not reach the payment server.');
    if (err) {
      setError(err);
      setPendingPack(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-title"
        className="w-full max-w-lg rounded-xl bg-[#0D111A] border border-[#2A334B] p-5 text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="credits-title" className="text-lg font-bold text-amber-400 font-display">
              Weave Credits
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Each AI-powered Causal Weaver turn costs {status?.costPerWeave ?? 1} credit. When
              you run out, turns fall back to the free deterministic physics compiler.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-xs text-slate-400">Balance</span>
          <span className="text-2xl font-semibold text-cyan-300 font-mono-tabular">
            {status ? status.balance : '—'}
          </span>
        </div>

        {notice && (
          <div className="mt-3 px-3 py-2 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            {notice}
          </div>
        )}

        {!status?.paymentsEnabled ? (
          <p className="mt-4 text-xs text-slate-400">
            Purchases are not enabled on this server (no Stripe key configured).
          </p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {status.packs.map((pack) => (
              <button
                key={pack.id}
                type="button"
                disabled={pendingPack !== null}
                onClick={() => handleBuy(pack.id)}
                className="flex flex-col items-start gap-1 p-3 rounded-lg bg-[#161C2B] hover:bg-[#20283D] border border-[#2A334B] hover:border-amber-500/60 text-left cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              >
                <span className="text-xs text-slate-400">{pack.name}</span>
                <span className="text-lg font-semibold text-amber-300 font-mono-tabular">
                  {pack.credits} credits
                </span>
                <span className="text-sm text-slate-200 font-mono-tabular">
                  {pendingPack === pack.id ? 'Redirecting…' : formatPrice(pack)}
                </span>
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

        <p className="mt-4 text-[11px] text-slate-500">
          Payments are processed securely by Stripe. Credits are tied to this browser.
        </p>
      </div>
    </div>
  );
};
