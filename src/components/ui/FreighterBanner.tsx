import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, Wallet } from 'lucide-react';
import { checkNetwork, getWalletKey } from '../../lib/stellar';
import { getNetworkDetails, isConnected } from '@stellar/freighter-api';

type WalletStatus = 'checking' | 'not-installed' | 'not-connected' | 'wrong-network' | 'connected';

interface Props {
  showConnectedBadge?: boolean;
  className?: string;
}

export function FreighterBanner({ showConnectedBadge = true, className = '' }: Props) {
  const [status, setStatus] = useState<WalletStatus>('checking');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string>('an unknown network');

  const verifyWallet = useCallback(async () => {
    try {
      if (!(await isConnected())) {
        setStatus('not-installed');
        return;
      }

      const key = await getWalletKey();
      if (!key) {
        setStatus('not-connected');
        setPublicKey(null);
        return;
      }

      const onTestnet = await checkNetwork();
      if (!onTestnet) {
        setNetworkName(await currentNetworkName());
        setPublicKey(key);
        setStatus('wrong-network');
        return;
      }

      setPublicKey(key);
      setStatus('connected');
    } catch {
      setStatus('not-installed');
    }
  }, []);

  useEffect(() => {
    verifyWallet();
    window.addEventListener('focus', verifyWallet);
    return () => window.removeEventListener('focus', verifyWallet);
  }, [verifyWallet]);

  if (status === 'checking') return null;

  if (status === 'not-installed') {
    return (
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 ${className}`}>
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">Freighter extension not detected</p>
          <p className="text-amber-800 mt-0.5">
            Install it from{' '}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-2 hover:text-amber-950 inline-flex items-center gap-1"
            >
              freighter.app
              <ExternalLink className="w-3 h-3" />
            </a>{' '}
            to execute Soroban payments.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'not-connected') {
    return (
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 ${className}`}>
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">Freighter wallet not authorized</p>
          <p className="text-amber-800 mt-0.5">
            Open the Freighter extension and approve access to connect your wallet.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'wrong-network') {
    return (
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-red-50 border-red-200 text-red-900 ${className}`}>
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">Wrong network detected</p>
          <p className="text-red-800 mt-0.5">
            Freighter is on {networkName}. Please switch your wallet network to Testnet.
          </p>
        </div>
      </div>
    );
  }

  if (!showConnectedBadge) return null;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-green-50 border-green-200 text-green-800 text-xs font-medium ${className}`}>
      <Wallet className="w-3.5 h-3.5" />
      {publicKey ? (
        <>
          <span className="font-mono">{truncateKey(publicKey)}</span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Testnet Connected
          </span>
        </>
      ) : (
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Testnet Connected
        </span>
      )}
    </div>
  );
}

function truncateKey(key: string): string {
  if (key.length <= 10) return key;
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

async function currentNetworkName(): Promise<string> {
  try {
    const details = await getNetworkDetails();
    return details.network || details.networkPassphrase || 'an unknown network';
  } catch {
    return 'an unknown network';
  }
}