import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, formatDateTime, formatCommodity } from '../utils/format';

export function TransactionsPage() {
  const { session } = useApp();
  const navigate = useNavigate();
  if (!session) return null;

  let txns = [];
  if (session.role === 'buyer') txns = transactionService.getForBuyer(session.userId);
  else if (session.role === 'supplier') txns = transactionService.getForSupplier(session.userId);
  else txns = transactionService.getAll();

  const sorted = [...txns].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {session.role === 'buyer' ? 'My Transactions' : session.role === 'supplier' ? 'Transaction Requests' : 'All Transactions'}
      </h1>

      {sorted.length === 0 ? (
        <EmptyState icon={<ArrowRightLeft className="w-7 h-7" />} title="No transactions yet" description={session.role === 'buyer' ? 'Browse available supply to initiate your first transaction.' : 'Transaction requests will appear here.'} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Commodity</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">{session.role === 'buyer' ? 'Supplier' : 'Buyer'}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Qty</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Value</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/app/transactions/${t.id}`)} className="border-b border-gray-50 hover:bg-agri-50/50 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{t.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{formatCommodity(t.commodity)}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{session.role === 'buyer' ? t.supplierName : t.buyerName}</td>
                    <td className="px-5 py-3.5 text-gray-700">{t.quantity} {t.unit}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{formatCurrency(t.totalAmount)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={t.status} size="sm" /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{formatDateTime(t.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
