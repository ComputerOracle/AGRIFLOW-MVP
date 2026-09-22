import { useEffect, useState } from 'react';
import { isConnected, getNetworkDetails } from '@stellar/freighter-api';

export function FreighterBanner() {
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const connected = await isConnected();
        if (!connected) {
          if (isMounted) setWarning('Freighter wallet not detected. Install it from freighter.app to pay on-chain.');
          return;
        }
        const net = await getNetworkDetails();
        if (net && net.network !== 'TESTNET') {
          if (isMounted) setWarning('Switch Freighter to Testnet to use on-chain payments.');
        }
      } catch {
        // Fallback / ignore when Freighter extension is not available
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!warning) return null;
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-4">
      {warning}
    </div>
  );
}
