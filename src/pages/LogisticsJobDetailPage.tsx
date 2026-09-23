import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle2, Package, Truck, ThumbsUp, ThumbsDown } from 'lucide-react';
import { logisticsService } from '../services/logisticsService';
import { transactionService } from '../services/transactionService';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency, formatDate, formatDateTime, formatCommodity } from '../utils/format';
import type { LogisticsJob, Transaction } from '../types';

const NEXT_ACTIONS: Record<string, { label: string; icon: React.ReactNode; to: any; variant?: any }[]> = {
  ASSIGNED: [
    { label: 'Accept Job', icon: <ThumbsUp className="w-4 h-4" />, to: 'ACCEPTED', variant: 'primary' },
    { label: 'Reject Job', icon: <ThumbsDown className="w-4 h-4" />, to: 'REJECTED', variant: 'danger' },
  ],
  ACCEPTED: [
    { label: 'Ready for Pickup', icon: <MapPin className="w-4 h-4" />, to: 'READY_FOR_PICKUP' },
  ],
  READY_FOR_PICKUP: [
    { label: 'Picked Up', icon: <Package className="w-4 h-4" />, to: 'PICKED_UP' },
  ],
  PICKED_UP: [
    { label: 'In Transit', icon: <Truck className="w-4 h-4" />, to: 'IN_TRANSIT' },
  ],
  IN_TRANSIT: [
    { label: 'Mark Delivered', icon: <CheckCircle2 className="w-4 h-4" />, to: 'DELIVERED' },
  ],
};

export function LogisticsJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, refreshNotifications } = useApp();
  const { toast } = useToast();
  const [job, setJob] = useState<LogisticsJob | null>(null);
  const [txn, setTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPodModal, setShowPodModal] = useState(false);
  const [pod, setPod] = useState({ recipientName: '', deliveryNote: '' });

  const refresh = async () => {
    if (!id) return;
    const j = logisticsService.getById(id);
    setJob(j);
    if (j) setTxn(await transactionService.getById(j.transactionId));
  };

  useEffect(() => { refresh(); }, [id]);

  if (!job || !session) return <div className="p-6 text-gray-500">Job not found.</div>;

  const nextActions = NEXT_ACTIONS[job.status] ?? [];

  const handleAction = async (to: string) => {
    if (to === 'DELIVERED') { setShowPodModal(true); return; }
    setLoading(true);
    try {
      await logisticsService.updateJobStatus({
        jobId: job.id, status: to as any,
        providerId: session.userId, providerName: session.name,
      });
      toast('success', `Status updated to ${to.replace(/_/g, ' ')}.`);
      refreshNotifications();
      await refresh();
    } catch (e: any) { toast('error', e.message); }
    finally { setLoading(false); }
  };

  const handleDeliver = async () => {
    if (!pod.recipientName || !pod.deliveryNote) {
      toast('error', 'Please fill in recipient name and delivery note.');
      return;
    }
    setLoading(true);
    try {
      await logisticsService.updateJobStatus({
        jobId: job.id, status: 'DELIVERED',
        providerId: session.userId, providerName: session.name,
        proofOfDelivery: {
          recipientName: pod.recipientName,
          deliveryNote: pod.deliveryNote,
          timestamp: new Date().toISOString(),
          recordedBy: session.name,
        },
      });
      toast('success', 'Shipment marked as delivered. Proof of delivery recorded.');
      setShowPodModal(false);
      refreshNotifications();
      await refresh();
    } catch (e: any) { toast('error', e.message); }
    finally { setLoading(false); }
  };

  const STATUS_COLORS: Record<string, string> = {
    ASSIGNED: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    ACCEPTED: 'bg-blue-50 border-blue-200 text-blue-800',
    READY_FOR_PICKUP: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    PICKED_UP: 'bg-sky-50 border-sky-200 text-sky-800',
    IN_TRANSIT: 'bg-violet-50 border-violet-200 text-violet-800',
    DELIVERED: 'bg-teal-50 border-teal-200 text-teal-800',
    COMPLETED: 'bg-agri-50 border-agri-200 text-agri-800',
    REJECTED: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h1 className="text-xl font-bold text-gray-900 font-mono">{job.id}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[job.status] ?? 'bg-gray-50 border-gray-200 text-gray-700'}`}>
              {job.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-500">{formatCommodity(job.commodity)} · {job.quantity} {job.unit}</p>
        </div>
      </div>

      {/* Action buttons */}
      {nextActions.length > 0 && (
        <div className="mb-6 px-4 py-4 bg-indigo-50 border border-indigo-200 rounded-xl">
          <p className="text-sm font-semibold text-indigo-800 mb-3">Action Required</p>
          <div className="flex flex-wrap gap-2">
            {nextActions.map((a) => (
              <Button
                key={a.label}
                variant={a.variant ?? 'primary'}
                loading={loading}
                icon={a.icon}
                onClick={() => handleAction(a.to)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-800">Shipment Details</h2></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-4 h-4 text-agri-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Pickup</div>
                  <div className="text-sm font-semibold text-gray-800">{job.pickupLocation}</div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="h-8 w-px bg-gray-200 relative">
                  <Truck className="w-4 h-4 text-gray-400 absolute -left-2 top-2" />
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-agri-50 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-agri-600 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Delivery</div>
                  <div className="text-sm font-semibold text-agri-800">{job.deliveryLocation}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div><div className="text-xs text-gray-500 mb-0.5">Commodity</div><div className="text-sm font-medium">{formatCommodity(job.commodity)}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Quantity</div><div className="text-sm font-medium">{job.quantity} {job.unit}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Expected Delivery</div><div className="text-sm font-medium">{formatDate(job.expectedDeliveryDate)}</div></div>
                <div><div className="text-xs text-gray-500 mb-0.5">Logistics Fee</div><div className="text-sm font-semibold text-agri-700">{formatCurrency(job.logisticsCost)}</div></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Transaction ref */}
          {txn && (
            <Card>
              <CardHeader><h2 className="font-semibold text-gray-800">Transaction</h2></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div><div className="text-xs text-gray-500 mb-0.5">Transaction ID</div><div className="text-sm font-mono text-gray-700">{txn.id}</div></div>
                  <div><div className="text-xs text-gray-500 mb-0.5">Buyer</div><div className="text-sm text-gray-700">{txn.buyerName}</div></div>
                  <div><div className="text-xs text-gray-500 mb-0.5">Value</div><div className="text-sm font-bold text-agri-700">{formatCurrency(txn.totalAmount)}</div></div>
                  <div><div className="text-xs text-gray-500 mb-0.5">Status</div><StatusBadge status={txn.status} size="sm" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proof of delivery */}
          {job.proofOfDelivery && (
            <Card>
              <CardHeader><h2 className="font-semibold text-gray-800">Proof of Delivery</h2></CardHeader>
              <CardContent>
                <div className="px-3 py-3 bg-agri-50 border border-agri-200 rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-agri-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Delivery Evidence Recorded
                  </div>
                  <div><span className="text-xs text-gray-500">Received by: </span><span className="text-xs font-medium">{job.proofOfDelivery.recipientName}</span></div>
                  <div><span className="text-xs text-gray-500">Note: </span><span className="text-xs">{job.proofOfDelivery.deliveryNote}</span></div>
                  <div className="text-xs text-gray-400">{formatDateTime(job.proofOfDelivery.timestamp)}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Proof of delivery modal */}
      <Modal open={showPodModal} onClose={() => setShowPodModal(false)} title="Proof of Delivery">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Record delivery details before marking the shipment as delivered.</p>
          <Input
            label="Recipient Name" required
            value={pod.recipientName}
            onChange={(e) => setPod((p) => ({ ...p, recipientName: e.target.value }))}
            placeholder="Name of person who received the goods"
          />
          <Textarea
            label="Delivery Note" required
            value={pod.deliveryNote}
            onChange={(e) => setPod((p) => ({ ...p, deliveryNote: e.target.value }))}
            rows={3}
            placeholder="Condition of goods, any notes on delivery..."
          />
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
            A delivery timestamp will be automatically recorded.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowPodModal(false)}>Cancel</Button>
            <Button loading={loading} icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleDeliver}>
              Mark Delivered
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
