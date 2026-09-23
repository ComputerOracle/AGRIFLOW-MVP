import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { AgriFlowLogo } from '../components/ui/AgriFlowLogo';

export function LoginPage() {
  const [email, setEmail] = useState('buyer@kolafarms.com');
  const [password, setPassword] = useState('agriflow123');
  const [loading, setLoading] = useState(false);

  const { login } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('error', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast('success', 'Signed in successfully.');
      navigate('/app/dashboard');
    } catch (err: unknown) {
      toast('error', err instanceof Error ? err.message : 'Sign in failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('agriflow123');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 border border-gray-200 rounded-xl shadow-xs">
          {/* Brand Logo */}
          <div className="mb-6">
            <AgriFlowLogo size="md" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Enter your email and password to access the trade platform.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-agri-700 focus:border-agri-700 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-700">Password</label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-agri-700 focus:border-agri-700 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-agri-700 hover:bg-agri-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Quick Account Fill for easy testing */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
              Select Test Account
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCredentials('buyer@kolafarms.com')}
                className="p-2 border border-gray-200 hover:border-gray-300 rounded-md text-left transition-colors hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">Buyer</div>
                <div className="text-[10px] text-gray-500 truncate">Kola Farms Ltd</div>
              </button>
              <button
                type="button"
                onClick={() => setCredentials('supplier@adeyemi.com')}
                className="p-2 border border-gray-200 hover:border-gray-300 rounded-md text-left transition-colors hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">Supplier</div>
                <div className="text-[10px] text-gray-500 truncate">Adeyemi Produce</div>
              </button>
              <button
                type="button"
                onClick={() => setCredentials('logistics@swifthaul.com')}
                className="p-2 border border-gray-200 hover:border-gray-300 rounded-md text-left transition-colors hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">Logistics</div>
                <div className="text-[10px] text-gray-500 truncate">SwiftHaul Logistics</div>
              </button>
              <button
                type="button"
                onClick={() => setCredentials('admin@agriflow.ng')}
                className="p-2 border border-gray-200 hover:border-gray-300 rounded-md text-left transition-colors hover:bg-gray-50"
              >
                <div className="font-medium text-gray-900">Operations</div>
                <div className="text-[10px] text-gray-500 truncate">AgriFlow Admin</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-agri-700 hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
