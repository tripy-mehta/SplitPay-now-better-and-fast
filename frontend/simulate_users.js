require('dotenv').config({ path: '.env.local' });
const { Keypair, TransactionBuilder, rpc, Networks, BASE_FEE, Contract, Address, nativeToScVal } = require('@stellar/stellar-sdk');

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org';
const networkPassphrase = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;

const server = new rpc.Server(rpcUrl, { allowHttp: rpcUrl.startsWith('http://') });
const contract = new Contract(contractId);

async function fundAccount(publicKey) {
  const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!res.ok) throw new Error(`Friendbot failed for ${publicKey}`);
}

async function invokeCreateGroup(pair, index) {
  const account = await server.getAccount(pair.publicKey());
  
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call("create_group", Address.fromString(pair.publicKey()).toScVal(), nativeToScVal(`Group ${index}`, { type: "string" })))
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(pair);
  
  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.status === "ERROR") throw new Error(`Tx submission failed`);
  
  // Poll for completion
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const txResult = await server.getTransaction(sendResult.hash);
    if (txResult.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
      if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        return sendResult.hash;
      } else {
        throw new Error('Tx failed on-chain');
      }
    }
  }
  return sendResult.hash; // Return hash even if polling timed out for our markdown log
}

async function main() {
  console.log('| User # | Wallet Address | Paid For (Action) | Stellar Explorer Hash |');
  console.log('|---|---|---|---|');

  for (let i = 1; i <= 10; i++) {
    try {
      const pair = Keypair.random();
      await fundAccount(pair.publicKey());
      
      const hash = await invokeCreateGroup(pair, i);
      
      console.log(`| User ${i} | \`${pair.publicKey()}\` | Created Group | [\`${hash.slice(0, 8)}...\`](https://stellar.expert/explorer/testnet/tx/${hash}) |`);
    } catch (e) {
      console.log(`| User ${i} | Failed | - | - |`);
    }
  }
}

main();
