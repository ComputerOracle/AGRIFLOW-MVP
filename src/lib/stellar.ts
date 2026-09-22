import {
  Contract,
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
} from '@stellar/stellar-sdk';
import {
  requestAccess,
  signTransaction,
  isConnected,
  getAddress,
} from '@stellar/freighter-api';
import { Buffer } from 'buffer';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK = Networks.TESTNET;
const server = new rpc.Server(RPC_URL);

// ── Contract addresses from environment variables ─────────────
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID ?? '';
export const USDC_CONTRACT = import.meta.env.VITE_USDC_CONTRACT ?? '';
// ─────────────────────────────────────────────────────────────

/** Connect Freighter and return the public key */
export async function connectWallet(): Promise<string> {
  const connected = await isConnected();
  if (!connected) {
    throw new Error('Freighter not installed. Get it at freighter.app');
  }
  const res = await requestAccess();
  if (res && 'error' in res && res.error) {
    throw new Error(String(res.error));
  }
  if (res && 'address' in res && res.address) {
    return res.address;
  }
  throw new Error('Could not get address from Freighter');
}

/** Return currently connected public key without prompting */
export async function getWalletKey(): Promise<string | null> {
  const connected = await isConnected();
  if (!connected) return null;
  try {
    const res = await getAddress();
    if (res && 'address' in res && res.address) {
      return res.address;
    }
    return null;
  } catch {
    return null;
  }
}

/** Convert our string txId (e.g. "TXN-4821") to a 32-byte ScVal for Soroban */
export async function txIdToScVal(txId: string): Promise<xdr.ScVal> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txId));
  return xdr.ScVal.scvBytes(Buffer.from(buf));
}

/** Build → simulate → sign → submit a contract call */
export async function invokeContract(
  functionName: string,
  args: xdr.ScVal[],
  signerPublicKey: string,
): Promise<string> {
  if (!CONTRACT_ID) {
    throw new Error('Contract ID not configured. Please set VITE_CONTRACT_ID in .env.local');
  }

  const account = await server.getAccount(signerPublicKey);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK,
  })
    .addOperation(contract.call(functionName, ...args))
    .setTimeout(60)
    .build();

  // Simulate so Soroban can compute auth entries + resource fees
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  const preparedTx = rpc.assembleTransaction(tx, sim).build();

  // Sign with Freighter
  const signRes = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK,
  });

  if (signRes && 'error' in signRes && signRes.error) {
    throw new Error(`Signing rejected: ${signRes.error}`);
  }

  const signedXdr = signRes && 'signedTxXdr' in signRes ? signRes.signedTxXdr : (signRes as unknown as string);

  // Submit
  const result = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedXdr, NETWORK)
  );

  if (result.status === 'ERROR') {
    throw new Error(`Submit failed: ${JSON.stringify(result)}`);
  }

  // Poll until confirmed
  const hash = result.hash;
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const status = await server.getTransaction(hash);
    if (status.status === rpc.Api.GetTransactionStatus.SUCCESS) return hash;
    if (status.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Transaction failed on-chain');
    }
  }
  throw new Error('Transaction timed out');
}

export const stellarExpertLink = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;
