import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { transactionService } from '../services/transactionService';
import { paymentService } from '../services/paymentService';
import type { Transaction } from '../types';

export function CompletePaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useApp();
  const { toast } = useToast();
  const [method, setMethod] = useState<'bank' | 'card' | 'wallet'>('bank');
  const [paying, setPaying] = useState(false);
  const [tx, setTx] = useState<Transaction | null>(null);

  useEffect(() => {
    let cancelled = false;
    transactionService.getById(id || 'TXN-4821').then((transaction) => {
      if (!cancelled && transaction) setTx(transaction);
    });
    return () => { cancelled = true; };
  }, [id]);

  const goodsSubtotal = 5760000;
  const logisticsCost = 185000;
  const platformFee = 57600;
  const totalDue = goodsSubtotal + logisticsCost + platformFee; // 6,002,600

  const handlePay = async () => {
    if (!session) return;
    setPaying(true);
    try {
      // 1. Initiate payment record
      const payment = await paymentService.initiate({
        transactionId: tx?.id || 'TXN-4821',
        payerId: session.userId,
        payerName: session.name,
        amount: totalDue,
        currency: 'NGN',
      });

      // 2. Confirm payment to advance state
      await paymentService.confirm(payment.id, session.userId, session.name);

      toast('success', `Payment of ₦${totalDue.toLocaleString()} confirmed and secured in escrow.`);
      navigate(`/app/transactions/${tx?.id || 'TXN-4821'}/track`);
    } catch (err: unknown) {
      toast('error', err instanceof Error ? err.message : 'Payment processing failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/app/dashboard"
          className="text-xs font-medium text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Complete payment</h1>
        <p className="text-xs text-gray-500 mt-1">
          {tx?.id || 'TXN-4821'} · Supplier accepted · Demand D-1043
        </p>
      </div>

      {/* Stepper */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700 border border-gray-200">
          ✓ ACCEPTED
        </span>
        <span className="text-gray-400">—</span>
        <span className="px-2.5 py-1 rounded-full font-medium bg-gray-900 text-white">
          PAYMENT_PENDING
        </span>
        <span className="text-gray-400">—</span>
        <span className="px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-400">
          LOGISTICS_ASSIGNED
        </span>
        <span className="text-gray-400">—</span>
        <span className="px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-400">
          IN_TRANSIT
        </span>
        <span className="text-gray-400">—</span>
        <span className="px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-400">
          COMPLETED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Payment Method Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
              Payment method
            </h2>

            <div className="space-y-3">
              {/* Bank Transfer */}
              <label
                className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                  method === 'bank'
                    ? 'border-gray-800 bg-gray-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={method === 'bank'}
                      onChange={() => setMethod('bank')}
                      className="mt-0.5 accent-gray-900"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">Bank transfer</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Pay from your bank app or internet banking
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">No fee</span>
                </div>
              </label>

              {/* Debit Card */}
              <label
                className={`block border rounded-lg p-4 cursor-pointer transition-all ${
                  method === 'card'
                    ? 'border-gray-800 bg-gray-50/50 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={method === 'card'}
                      onChange={() => setMethod('card')}
                      className="mt-0.5 accent-gray-900"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">Debit card</div>
                      <div className="text-xs text-gray-500 mt-0.5">Visa, Mastercard or Verve</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500">1.4% fee</span>
                </div>
              </label>

              {/* AgriFlow Wallet */}
              <label className="block border border-gray-200 rounded-lg p-4 opacity-60 cursor-not-allowed bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      disabled
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">AgriFlow wallet</div>
                      <div className="text-xs text-gray-500 mt-0.5">Balance: ₦0.00 — insufficient</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400">Unavailable</span>
                </div>
              </label>
            </div>

            {/* Escrow Guarantee Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-xs text-gray-600 flex items-start gap-2 mt-4">
              <span className="text-gray-700">⚑</span>
              <span>
                Funds are held by AgriFlow and released to the supplier after you confirm receipt.
                Escrow protection is active.
              </span>
            </div>

            <div className="pt-2">
              <Link
                to={`/app/admin/disputes`}
                className="text-xs text-gray-500 hover:text-gray-800 underline"
              >
                Something wrong with this transaction? Report an issue
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Action */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Order summary
            </h2>

            <div>
              <div className="text-sm font-bold text-gray-900">White Maize — Grade A</div>
              <div className="text-xs text-gray-500 mt-0.5">
                12 tonnes · Oyo State → Ikeja, Lagos
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Goods subtotal</span>
                <span className="font-medium text-gray-900">₦{goodsSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Logistics</span>
                <span className="font-medium text-gray-900">₦{logisticsCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform fee</span>
                <span className="font-medium text-gray-900">₦{platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-100">
                <span>Total due</span>
                <span>₦{totalDue.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={paying}
              onClick={handlePay}
              className="w-full mt-2 py-3 px-4 text-xs font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {paying ? 'Securing funds in escrow...' : `Pay ₦${totalDue.toLocaleString()}`}
            </button>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              You will be redirected to your payment provider. Do not close this window until
              payment is confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
