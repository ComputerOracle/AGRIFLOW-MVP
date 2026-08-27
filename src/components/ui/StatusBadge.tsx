import React from 'react';
import {
  CheckCircle2, Clock, XCircle, CreditCard, Truck, Package,
  AlertTriangle, Ban, ThumbsUp, MapPin, Navigation
} from 'lucide-react';
import type { TransactionStatus } from '../../types';
import { getStatusLabel, getStatusColor } from '../../services/transactionStateMachine';

const STATUS_ICONS: Record<TransactionStatus, React.ReactNode> = {
  PENDING: <Clock className="w-3 h-3" />,
  PENDING_SUPPLIER_ACCEPTANCE: <Clock className="w-3 h-3" />,
  ACCEPTED: <CheckCircle2 className="w-3 h-3" />,
  REJECTED: <XCircle className="w-3 h-3" />,
  PAYMENT_PENDING: <CreditCard className="w-3 h-3" />,
  PAYMENT_CONFIRMED: <CheckCircle2 className="w-3 h-3" />,
  PAYMENT_FAILED: <XCircle className="w-3 h-3" />,
  PAYMENT_CANCELLED: <Ban className="w-3 h-3" />,
  LOGISTICS_PENDING: <Truck className="w-3 h-3" />,
  LOGISTICS_ASSIGNED: <Truck className="w-3 h-3" />,
  LOGISTICS_ACCEPTED: <ThumbsUp className="w-3 h-3" />,
  LOGISTICS_REJECTED: <XCircle className="w-3 h-3" />,
  READY_FOR_PICKUP: <MapPin className="w-3 h-3" />,
  PICKED_UP: <Package className="w-3 h-3" />,
  IN_TRANSIT: <Navigation className="w-3 h-3" />,
  DELIVERED: <CheckCircle2 className="w-3 h-3" />,
  BUYER_CONFIRMATION_PENDING: <Clock className="w-3 h-3" />,
  DELIVERY_CONFIRMED: <CheckCircle2 className="w-3 h-3" />,
  DELIVERY_FAILED: <AlertTriangle className="w-3 h-3" />,
  COMPLETED: <CheckCircle2 className="w-3 h-3" />,
  CANCELLED: <Ban className="w-3 h-3" />,
  DISPUTED: <AlertTriangle className="w-3 h-3" />,
};

interface Props {
  status: TransactionStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const colorClass = getStatusColor(status) || 'bg-gray-100 text-gray-800 border-gray-200';
  const label = getStatusLabel(status) || status;
  const icon = STATUS_ICONS[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${padding} ${colorClass}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
}
