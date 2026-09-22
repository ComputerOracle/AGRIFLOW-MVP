import {
  BASE_FEE,
  Contract,
  Networks,
  rpc,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';
import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from '@stellar/freighter-api';

export const CONTRACT_ID: string = (import.meta.env.VITE_CONTRACT_ID as string | undefined) ?? '';
export const USDC_CONTRACT: string = (import.meta.env.VITE_USDC_CONTRACT as string | undefined) ?? '';
export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK = Networks.TESTNET;
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export interface InvokeContractOptions {
  maxAttempts?: number;
  pollIntervalMs?: number;
}

export function stellarExpertLink(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

function assertNoFreighterError<T>(res: T, label: string): void {
  if (
    res &&
    typeof res === 'object' &&
    'error' in res &&
    (res as { error?: unknown }).error
  ) {
    throw new Error(`${label}: ${String((res as { error?: unknown }).error)}`);
  }
}

export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res = await isConnected();
    if (typeof res === 'boolean') return res;
    assertNoFreighterError(res, 'Freighter not responding');
    return Boolean((res as { isConnected?: boolean }).isConnected);
  } catch {
    return false;
  }
}

export async function connectWallet(): Promise<string> {
  if (!(await isFreighterInstalled())) {
    throw new Error('Freighter extension not detected in browser.');
  }
  try {
    const res = await requestAccess();
    assertNoFreighterError(res, 'Freighter connection request denied');
    if (res.address) return res.address;
    throw new Error('Unable to read public key from Freighter response.');
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error('Connection request denied in Freighter. Approve the request to continue.');
  }
}

export async function getWalletKey(): Promise<string | null> {
  try {
    if (!(await isFreighterInstalled())) return null;
    const res = await getAddress();
    if (res && typeof res === 'object' && 'error' in res && res.error) return null;
    return res.address ?? null;
  } catch {
    return null;
  }
}

export async function checkNetwork(): Promise<boolean> {
  try {
    const details = await getNetworkDetails();
    return details.network === 'TESTNET';
  } catch {
    return false;
  }
}

export async function txIdToScVal(txId: string): Promise<xdr.ScVal> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txId));
  return xdr.ScVal.scvBytes(Buffer.from(digest));
}

export async function invokeContract(
  functionName: string,
  args: xdr.ScVal[],
  signerPublicKey: string,
  options: InvokeContractOptions = {},
): Promise<string> {
  if (!CONTRACT_ID) {
    throw new Error(
      'Contract not configured. Set VITE_CONTRACT_ID in the project .env.local file before invoking contracts.',
    );
  }

  const maxAttempts = options.maxAttempts ?? 25;
  const pollIntervalMs = options.pollIntervalMs ?? 1500;

  const server = new rpc.Server(RPC_URL);

  const account = await server.getAccount(signerPublicKey);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .setTimeout(60)
    .addOperation(contract.call(functionName, ...args))
    .build();

  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulation Failed: ${simulation.error}`);
  }

  const prepared = rpc.assembleTransaction(tx, simulation).build();

  const signRes = await signTransaction(prepared.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  const signedXdr =
    signRes && typeof signRes === 'object' && 'signedTxXdr' in signRes
      ? signRes.signedTxXdr
      : (signRes as unknown as string);

  const sendResponse = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, NETWORK));
  if (sendResponse.status === 'ERROR') {
    const detail = 'errorResult' in sendResponse ? String(sendResponse.errorResult) : '';
    throw new Error(
      `Transaction submission failed. Hash: ${sendResponse.hash}.` +
        (detail ? ` Result XDR: ${detail}` : ' See Freighter / Soroban RPC error logs for details.'),
    );
  }

  return pollTransactionStatus(server, sendResponse.hash, maxAttempts, pollIntervalMs);
}

async function pollTransactionStatus(
  server: rpc.Server,
  hash: string,
  maxAttempts: number,
  pollIntervalMs: number,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(Math.min(pollIntervalMs * Math.pow(2, attempt), 30_000));

    const result = await server.getTransaction(hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return hash;
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed on-chain. ${stellarExpertLink(hash)}`);
    }
  }

  throw new Error(
    `Transaction did not finalize within ${maxAttempts} polling attempts. ${stellarExpertLink(hash)}`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}