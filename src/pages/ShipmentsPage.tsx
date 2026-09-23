import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, MapPin } from 'lucide-react';
import { logisticsService } from '../services/logisticsService';
import { transactionService } from '../services/transactionService';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatDate, formatCommodity } from '../utils/format';
import type { LogisticsJob, Transaction } from '../types';

export function ShipmentsPage() {
  const { session } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<LogisticsJob[]>([]);
  const [txnsById, setTxnsById] = useState<Record<string, Transaction>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        let loadedJobs: LogisticsJob[];
        if (session.role === 'logistics') {
          loadedJobs = logisticsService.getForProvider(session.userId);
        } else {
          const txns = await transactionService.getAll();
          loadedJobs = txns
            .map((t) => logisticsService.getForTransaction(t.id))
            .filter((j): j is LogisticsJob => j !== null);
        }
        if (cancelled) return;
        setJobs(loadedJobs);

        const txnEntries = await Promise.all(
          loadedJobs.map(async (j) => [j.transactionId, await transactionService.getById(j.transactionId)] as const)
        );
        if (cancelled) return;
        const map: Record<string, Transaction> = {};
        for (const [txnId, t] of txnEntries) if (t) map[txnId] = t;
        setTxnsById(map);
      } catch (e: unknown) {
        if (!cancelled) toast('error', e instanceof Error ? e.message : 'Failed to load shipments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session, toast]);

  if (!session) return null;

  const sorted = [...jobs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {session.role === 'logistics' ? 'Active Shipments' : 'Shipment Tracking'}
      </h1>

      {loading ? (
        <div className="text-sm text-gray-500 py-12 text-center">Loading shipments...</div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={<Truck className="w-7 h-7" />} title="No shipments" description="Shipments will appear here once a transaction moves to logistics." />
      ) : (
        <div className="space-y-3">
          {sorted.map((j) => {
            const txn = txnsById[j.transactionId];
            return (
              <div
                key={j.id}
                onClick={() => session.role === 'logistics' ? navigate(`/app/jobs/${j.id}`) : navigate(`/app/transactions/${j.transactionId}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-agri-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs font-mono text-gray-400 mb-0.5">{j.id}</div>
                    <h3 className="font-semibold text-gray-900">{formatCommodity(j.commodity)}</h3>
                    <div className="text-sm text-gray-600">{j.quantity} {j.unit}</div>
                  </div>
                  <div className="text-right">
                    {txn && <StatusBadge status={txn.status} size="sm" />}
                    <div className="text-[10px] text-gray-400 mt-1">{j.status.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{j.pickupLocation}</span>
                  <span className="text-gray-400">→</span>
                  <span>{j.deliveryLocation}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Expected: {formatDate(j.expectedDeliveryDate)}</span>
                  {j.providerName && <span>Provider: {j.providerName}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
