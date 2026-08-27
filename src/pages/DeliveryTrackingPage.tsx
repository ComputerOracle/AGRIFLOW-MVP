import { useParams, Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';

export function DeliveryTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/app/deliveries"
          className="text-xs font-medium text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"
        >
          ← Back to Deliveries
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delivery tracking</h1>
          <p className="text-xs text-gray-500 mt-1">
            {id || 'TXN-4821'} · White Maize · 12 tonnes · JOB-8871
          </p>
        </div>
        <div>
          <span className="status-pill status-pill-blue">IN_TRANSIT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Live location & Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Live Location Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-900">Live location</span>
              <span className="text-gray-500">Updated 4 minutes ago</span>
            </div>

            {/* Map Placeholder Graphic */}
            <div className="h-48 bg-gray-100/70 border border-gray-200 rounded-lg relative overflow-hidden flex items-center justify-center">
              <div className="w-full px-8">
                <div className="relative flex items-center justify-between">
                  <div className="text-center z-10">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-700 mx-auto" />
                    <div className="text-[11px] font-semibold text-gray-900 mt-1">Ogbomoso</div>
                    <div className="text-[9px] text-gray-500">Pickup 09:24</div>
                  </div>

                  <div className="absolute inset-x-12 top-1.5 h-1 bg-gray-200">
                    <div className="h-full bg-agri-600 w-3/5" />
                  </div>

                  {/* Moving truck indicator */}
                  <div className="text-center z-10 ml-12">
                    <div className="w-6 h-6 rounded-full bg-agri-700 text-white flex items-center justify-center text-[10px] font-bold shadow-sm mx-auto">
                      🚚
                    </div>
                    <div className="text-[11px] font-bold text-agri-800 mt-0.5">Ibadan</div>
                    <div className="text-[9px] text-gray-500">In Transit</div>
                  </div>

                  <div className="text-center z-10">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-700 bg-white mx-auto" />
                    <div className="text-[11px] font-semibold text-gray-900 mt-1">Ikeja</div>
                    <div className="text-[9px] text-gray-500">Destination</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50">
              <span className="font-medium text-gray-800">Currently near Ibadan, Oyo State</span>
              <span className="font-semibold text-agri-800">ETA: 31 Aug, ~16:00</span>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Timeline
            </h2>

            <div className="space-y-4 text-xs">
              {/* Event 1 */}
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-800 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">
                    PAYMENT_CONFIRMED <span className="font-normal text-gray-500 ml-2">27 Aug, 14:32</span>
                  </div>
                  <div className="text-gray-500 mt-0.5">Payment received and held by AgriFlow</div>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-800 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">
                    LOGISTICS_ACCEPTED <span className="font-normal text-gray-500 ml-2">27 Aug, 16:10</span>
                  </div>
                  <div className="text-gray-500 mt-0.5">SwiftHaul Logistics accepted JOB-8871</div>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-800 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">
                    PICKED_UP <span className="font-normal text-gray-500 ml-2">29 Aug, 09:24</span>
                  </div>
                  <div className="text-gray-500 mt-0.5">Goods collected from Ogbomoso</div>
                </div>
              </div>

              {/* Event 4 */}
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-agri-700 ring-4 ring-agri-100 mt-1 shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">
                    IN_TRANSIT <span className="font-normal text-gray-500 ml-2">29 Aug, 09:30</span>
                  </div>
                  <div className="text-gray-600 mt-0.5 font-medium">En route to Ikeja, Lagos</div>
                </div>
              </div>

              {/* Event 5 */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="w-2.5 h-2.5 rounded-full border border-gray-400 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-gray-700">
                    DELIVERED <span className="font-normal text-gray-400 ml-2">Expected 31 Aug</span>
                  </div>
                  <div className="text-gray-500 mt-0.5">Awaiting delivery confirmation</div>
                </div>
              </div>

              {/* Event 6 */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="w-2.5 h-2.5 rounded-full border border-gray-400 mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-gray-700">COMPLETED</div>
                  <div className="text-gray-500 mt-0.5">Awaiting your receipt confirmation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Carrier, Shipment, Actions */}
        <div className="space-y-4">
          {/* Carrier Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Carrier
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-700">
                S
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">SwiftHaul Logistics</div>
                <div className="text-[11px] text-gray-500">Covered truck · LAG-448-XA</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast('info', 'Connecting to driver (+234 803 456 7890)...')}
              className="w-full mt-2 py-2 px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
            >
              Contact carrier
            </button>
          </div>

          {/* Shipment Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Shipment
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">From</span>
                <span className="font-medium text-gray-900">Ogbomoso, Oyo State</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">To</span>
                <span className="font-medium text-gray-900">Ikeja, Lagos</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Distance remaining</span>
                <span className="font-medium text-gray-900">78 km</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Payment status</span>
                <span className="font-semibold text-agri-800">Held by AgriFlow</span>
              </div>
            </div>
          </div>

          {/* Problem with delivery */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-2.5">
            <h3 className="text-xs font-semibold text-gray-900">Problem with this delivery?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              If goods are delayed or an incident occurs on route, notify operations.
            </p>
            <button
              type="button"
              onClick={() => toast('info', 'Opening incident support ticket...')}
              className="w-full py-2 px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
            >
              Report an issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
