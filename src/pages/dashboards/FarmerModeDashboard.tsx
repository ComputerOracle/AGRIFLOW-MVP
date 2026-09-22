import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, ClipboardList, Truck, Wallet, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import type { TranslationKey } from '../../i18n/translations';

interface ActionTile {
  labelKey: TranslationKey;
  icon: React.ElementType;
  color: string;
  bg: string;
  path: string;
}

const BUYER_TILES: ActionTile[] = [
  { labelKey: 'farmer.buyCrop',  icon: ShoppingCart,  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',   path: '/app/supply' },
  { labelKey: 'farmer.myOrders', icon: ClipboardList,  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  path: '/app/demands' },
  { labelKey: 'farmer.track',    icon: Truck,          color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', path: '/app/deliveries' },
  { labelKey: 'farmer.money',    icon: Wallet,         color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  path: '/app/transactions' },
];

const SUPPLIER_TILES: ActionTile[] = [
  { labelKey: 'farmer.sellCrop', icon: Package,        color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  path: '/app/supply/new' },
  { labelKey: 'farmer.myOrders', icon: ClipboardList,  color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  path: '/app/requests' },
  { labelKey: 'farmer.track',    icon: Truck,          color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200', path: '/app/shipments' },
  { labelKey: 'farmer.money',    icon: Wallet,         color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    path: '/app/transactions' },
];

const COMMODITY_ICONS: { label: string; emoji: string }[] = [
  { label: 'Maize', emoji: '🌽' },
  { label: 'Rice', emoji: '🌾' },
  { label: 'Yam', emoji: '🍠' },
  { label: 'Beans', emoji: '🫘' },
  { label: 'Cassava', emoji: '🪴' },
  { label: 'Groundnut', emoji: '🥜' },
];

export function FarmerModeDashboard() {
  const { session, setFarmerMode } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const tiles = session?.role === 'supplier' ? SUPPLIER_TILES : BUYER_TILES;

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{t('farmer.modeLabel')}</p>
          <h1 className="text-xl font-bold text-gray-900">{t('dashboard.welcome')}, {session?.name.split(' ')[0]}</h1>
        </div>
        <button
          type="button"
          onClick={() => setFarmerMode(false)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50"
          title="Exit Farmer Mode"
        >
          <X className="w-3 h-3" />
          <span>Exit</span>
        </button>
      </div>

      {/* Main action tiles */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.labelKey}
              type="button"
              onClick={() => navigate(tile.path)}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 ${tile.bg} ${tile.color} transition-transform active:scale-95 shadow-sm`}
            >
              <Icon className="w-10 h-10" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-center leading-tight">{t(tile.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Commodity quick-pick row */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {t('supply.commodity')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {COMMODITY_ICONS.map(({ label, emoji }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(session?.role === 'supplier' ? '/app/supply/new' : '/app/supply')}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 hover:border-agri-400 hover:bg-agri-50 transition-colors shadow-sm"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-[11px] text-gray-600 font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { labelKey: 'status.active' as TranslationKey, value: '—', color: 'text-green-700' },
          { labelKey: 'status.pending' as TranslationKey, value: '—', color: 'text-amber-700' },
          { labelKey: 'status.inTransit' as TranslationKey, value: '—', color: 'text-blue-700' },
        ].map(({ labelKey, value, color }) => (
          <div key={labelKey} className="bg-white rounded-xl border border-gray-200 p-3 text-center shadow-sm">
            <p className={`text-lg font-bold ${color}`}>{value}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{t(labelKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
