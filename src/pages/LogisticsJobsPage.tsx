import { useNavigate } from 'react-router-dom';
import { Truck, MapPin } from 'lucide-react';
import { logisticsService } from '../services/logisticsService';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, formatDate, formatCommodity } from '../utils/format';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  ASSIGNED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  ACCEPTED: 'bg-blue-50 text-blue-800 border-blue-200',
  REJECTED: 'bg-red-50 text-red-800 border-red-200',
  READY_FOR_PICKUP: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  PICKED_UP: 'bg-sky-50 text-sky-800 border-sky-200',
  IN_TRANSIT: 'bg-violet-50 text-violet-800 border-violet-200',
  DELIVERED: 'bg-teal-50 text-teal-800 border-teal-200',
  COMPLETED: 'bg-agri-50 text-agri-800 border-agri-200',
  FAILED: 'bg-red-50 text-red-800 border-red-200',
};

export function LogisticsJobsPage() {
  const { session } = useApp();
  const navigate = useNavigate();
  if (!session) return null;

  const jobs = logisticsService.getForProvider(session.userId);
  const sorted = [...jobs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const priorityOrder = ['ASSIGNED','ACCEPTED','READY_FOR_PICKUP','PICKED_UP','IN_TRANSIT','DELIVERED','COMPLETED','FAILED'];
  const ordered = [...sorted].sort((a, b) => priorityOrder.indexOf(a.status) - priorityOrder.indexOf(b.status));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Job Queue</h1>

      {ordered.length === 0 ? (
        <EmptyState icon={<Truck className="w-7 h-7" />} title="No jobs assigned" description="Jobs will appear here once the operations team assigns them to you." />
      ) : (
        <div className="space-y-3">
          {ordered.map((j) => (
            <div
              key={j.id}
              onClick={() => navigate(`/app/jobs/${j.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-agri-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs font-mono text-gray-400 mb-0.5">{j.id}</div>
                  <h3 className="font-semibold text-gray-900">{formatCommodity(j.commodity)}</h3>
                  <div className="text-sm text-gray-600">{j.quantity} {j.unit}</div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[j.status] ?? 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  {j.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{j.pickupLocation}</span>
                <span className="text-gray-400">→</span>
                <span>{j.deliveryLocation}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Expected: {formatDate(j.expectedDeliveryDate)}</span>
                <span>Fee: {formatCurrency(j.logisticsCost)}</span>
                <span className="font-mono">TXN: {j.transactionId}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
