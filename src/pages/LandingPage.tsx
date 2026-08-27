import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Truck, CreditCard, Search, ArrowRightLeft, Package, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AgriFlowLogo } from '../components/ui/AgriFlowLogo';

const STEPS = [
  { icon: <Search className="w-4 h-4" />, label: 'Discover', desc: 'Buyers post demand; suppliers publish verified supply listings.' },
  { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Match', desc: 'AgriFlow matches demand to supply using compatibility scoring.' },
  { icon: <ArrowRightLeft className="w-4 h-4" />, label: 'Transact', desc: 'Buyer initiates a transaction; supplier accepts the terms.' },
  { icon: <CreditCard className="w-4 h-4" />, label: 'Escrow Pay', desc: 'Buyer secures payment. Confirmation triggers logistics coordination.' },
  { icon: <Truck className="w-4 h-4" />, label: 'Logistics', desc: 'Operations assigns a logistics carrier. Provider accepts and transports.' },
  { icon: <Package className="w-4 h-4" />, label: 'Tracking', desc: 'Carrier updates shipment status in real-time through delivery.' },
  { icon: <ShieldCheck className="w-4 h-4" />, label: 'Confirm & Payout', desc: 'Buyer confirms delivery. Escrow funds released to supplier and carrier.' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AgriFlowLogo size="md" />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-gray-900 text-xs font-medium"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate('/register')}
              className="bg-agri-700 hover:bg-agri-800 border-transparent text-white text-xs font-medium px-4 py-2 rounded-lg shadow-xs"
            >
              Create Account
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-agri-50 border border-agri-200 rounded-full text-agri-800 text-xs font-medium">
          <div className="w-1.5 h-1.5 bg-agri-600 rounded-full" />
          Agricultural Commerce &amp; Secured Escrow Logistics
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
          Move agricultural commerce<br />
          <span className="text-agri-700">from fragmented to connected.</span>
        </h1>

        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          AgriFlow coordinates the complete transaction between buyers, suppliers, logistics
          carriers, and operations — from commodity discovery to verified delivery and automated escrow payout.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-agri-700 hover:bg-agri-800 text-white font-medium text-sm px-6 py-3 rounded-lg transition-colors shadow-xs"
          >
            <span>Access Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto inline-flex items-center justify-center text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 font-medium text-sm px-6 py-3 rounded-lg transition-colors"
          >
            Create New Account
          </button>
        </div>
      </section>

      {/* Workflow loop */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            One Complete Agricultural Transaction Loop
          </h2>
          <p className="text-gray-500 text-xs max-w-xl mx-auto">
            Every transaction is verified, escrow-secured, tracked, and confirmed end to end.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {STEPS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center text-center p-4 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-gray-300 transition-colors"
            >
              <div className="w-9 h-9 bg-agri-50 border border-agri-200 rounded-lg flex items-center justify-center text-agri-700 mb-3">
                {s.icon}
              </div>
              <div className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                {s.label}
              </div>
              <div className="text-[11px] text-gray-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2026 AgriFlow. All rights reserved. Trade securely across agricultural value chains.
      </footer>
    </div>
  );
}
