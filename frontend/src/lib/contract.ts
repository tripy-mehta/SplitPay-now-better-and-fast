"use client";

import {
  Contract,
  rpc as SorobanRpc,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "./config";
import { signTransactionXdr } from "./wallet";

export type ExpenseDto = {
  id: bigint;
  description: string;
  amount: bigint;
  payer: string;
  participants: string[];
  settled: boolean;
  createdAt: bigint;
};

export type BalanceDto = { member: string; net: bigint };
export type TransferDto = { from: string; to: string; amount: bigint };

function getServer() {
  return new SorobanRpc.Server(RPC_URL, { allowHttp: RPC_URL.startsWith("http://") });
}

function getContract() {
  if (!CONTRACT_ID) {
    throw new Error(
      "Contract not configured. Set NEXT_PUBLIC_CONTRACT_ID in .env.local after deploying."
    );
  }
  return new Contract(CONTRACT_ID);
}

/**
 * Builds, simulates, signs (via the connected wallet), and submits a
 * contract invocation. Returns the decoded native return value.
 *
 * Read-only calls (get_balances, list_expenses, compute_settlement) are
 * simulated only and never require a signature, since they don't mutate
 * state — this keeps the UI from popping Freighter for plain reads.
 */
export async function invokeContract(
  method: string,
  args: xdr.ScVal[],
  sourcePublicKey: string,
  opts: { readOnly?: boolean } = {}
): Promise<unknown> {
  const server = getServer();
  const contract = getContract();
  const account = await server.getAccount(sourcePublicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const sim = await server.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }

  if (opts.readOnly) {
    const retval = sim.result?.retval;
    return retval ? scValToNative(retval) : null;
  }

  const prepared = await server.prepareTransaction(tx);
  const signedXdr = await signTransactionXdr(prepared.toXDR(), sourcePublicKey);
  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${sendResult.errorResult?.toString()}`);
  }

  // Poll for confirmation.
  let getResult = await server.getTransaction(sendResult.hash);
  const start = Date.now();
  while (getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
    if (Date.now() - start > 30_000) {
      throw new Error("Timed out waiting for transaction confirmation.");
    }
    await new Promise((r) => setTimeout(r, 1500));
    getResult = await server.getTransaction(sendResult.hash);
  }

  if (getResult.status !== SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Transaction failed on-chain: ${getResult.status}`);
  }

  const returnValue = getResult.resultMetaXdr
    ?.v3()
    .sorobanMeta()
    ?.returnValue();
  return returnValue ? scValToNative(returnValue) : null;
}

export async function createGroup(
  creatorPublicKey: string,
  name: string
): Promise<bigint> {
  const result = await invokeContract(
    "create_group",
    [Address.fromString(creatorPublicKey).toScVal(), nativeToScVal(name, { type: "string" })],
    creatorPublicKey
  );
  return BigInt(result as number | bigint);
}

export async function joinGroup(
  groupId: bigint,
  memberPublicKey: string
): Promise<void> {
  await invokeContract(
    "join_group",
    [nativeToScVal(groupId, { type: "u64" }), Address.fromString(memberPublicKey).toScVal()],
    memberPublicKey
  );
}

export async function addExpense(
  groupId: bigint,
  payerPublicKey: string,
  description: string,
  amountStroops: bigint,
  participantAddresses: string[]
): Promise<bigint> {
  const result = await invokeContract(
    "add_expense",
    [
      nativeToScVal(groupId, { type: "u64" }),
      Address.fromString(payerPublicKey).toScVal(),
      nativeToScVal(description, { type: "string" }),
      nativeToScVal(amountStroops, { type: "i128" }),
      nativeToScVal(
        participantAddresses.map((a) => Address.fromString(a).toScVal()),
        { type: "vec" }
      ),
    ],
    payerPublicKey
  );
  return BigInt(result as number | bigint);
}

export async function getBalances(
  groupId: bigint,
  readerPublicKey: string
): Promise<BalanceDto[]> {
  const result = (await invokeContract(
    "get_balances",
    [nativeToScVal(groupId, { type: "u64" })],
    readerPublicKey,
    { readOnly: true }
  )) as Array<{ member: string; net: bigint }>;
  return result.map((b) => ({ member: b.member, net: BigInt(b.net) }));
}

export async function computeSettlement(
  groupId: bigint,
  readerPublicKey: string
): Promise<TransferDto[]> {
  const result = (await invokeContract(
    "compute_settlement",
    [nativeToScVal(groupId, { type: "u64" })],
    readerPublicKey,
    { readOnly: true }
  )) as Array<{ from: string; to: string; amount: bigint }>;
  return result.map((t) => ({ from: t.from, to: t.to, amount: BigInt(t.amount) }));
}

export async function pay(
  groupId: bigint,
  fromPublicKey: string,
  toPublicKey: string,
  amountStroops: bigint
): Promise<void> {
  await invokeContract(
    "pay",
    [
      nativeToScVal(groupId, { type: "u64" }),
      Address.fromString(fromPublicKey).toScVal(),
      Address.fromString(toPublicKey).toScVal(),
      nativeToScVal(amountStroops, { type: "i128" }),
    ],
    fromPublicKey
  );
}

export async function markGroupSettled(
  groupId: bigint,
  callerPublicKey: string
): Promise<void> {
  await invokeContract(
    "mark_group_settled",
    [nativeToScVal(groupId, { type: "u64" }), Address.fromString(callerPublicKey).toScVal()],
    callerPublicKey
  );
}

export async function listExpenses(
  groupId: bigint,
  readerPublicKey: string
): Promise<ExpenseDto[]> {
  const result = (await invokeContract(
    "list_expenses",
    [nativeToScVal(groupId, { type: "u64" })],
    readerPublicKey,
    { readOnly: true }
  )) as Array<{
    id: bigint;
    description: string;
    amount: bigint;
    payer: string;
    participants: string[];
    settled: boolean;
    created_at: bigint;
  }>;
  return result.map((e) => ({
    id: BigInt(e.id),
    description: e.description,
    amount: BigInt(e.amount),
    payer: e.payer,
    participants: e.participants,
    settled: e.settled,
    createdAt: BigInt(e.created_at),
  }));
}
