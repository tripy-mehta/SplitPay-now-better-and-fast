import StellarSdkPkg from '@stellar/stellar-sdk';
const {
  rpc: SorobanRpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
  Keypair,
} = StellarSdkPkg;
import nodeFetch from 'node-fetch';

const SERVER = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const CONTRACT_ID = 'CAYNYPWTUOSXMBFEUS3YRT4YDSMGQ4YYAVAO4MSOLNWV3R6AZAFDUUON';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

async function diagnose() {
  const pair = Keypair.random();
  const pubKey = pair.publicKey();
  
  console.log('\n=== STEP 1: Fund address via Friendbot ===');
  console.log('Address:', pubKey);
  const fundRes = await nodeFetch(`https://friendbot.stellar.org?addr=${pubKey}`);
  console.log('Friendbot status:', fundRes.status, fundRes.statusText);
  if (!fundRes.ok) {
    const body = await fundRes.text();
    console.log('Friendbot body:', body.slice(0, 300));
  }
  await new Promise(r => setTimeout(r, 3000));

  console.log('\n=== STEP 2: Load account ===');
  let account;
  try {
    account = await SERVER.getAccount(pubKey);
    console.log('Account loaded OK. Sequence:', account.sequenceNumber());
  } catch(e) {
    console.error('Account load FAILED:', e.message || e);
    return;
  }

  console.log('\n=== STEP 3: Build & simulate transaction ===');
  const contract = new Contract(CONTRACT_ID);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(
      'create_group',
      Address.fromString(pubKey).toScVal(),
      nativeToScVal('Diagnostic Group', { type: 'string' })
    ))
    .setTimeout(60)
    .build();

  let sim;
  try {
    sim = await SERVER.simulateTransaction(tx);
  } catch(e) {
    console.error('simulateTransaction threw:', e.message || e);
    return;
  }

  if (SorobanRpc.Api.isSimulationError(sim)) {
    console.error('SIMULATION FAILED:', sim.error);
    return;
  }
  console.log('Simulation OK');

  console.log('\n=== STEP 4: prepareTransaction ===');
  let prepared;
  try {
    prepared = await SERVER.prepareTransaction(tx);
    console.log('prepareTransaction OK');
  } catch(e) {
    console.error('prepareTransaction FAILED:', e.message || e);
    return;
  }

  console.log('\n=== STEP 5: Sign & submit ===');
  prepared.sign(pair);
  let sendResult;
  try {
    sendResult = await SERVER.sendTransaction(prepared);
    console.log('sendTransaction status:', sendResult.status);
    if (sendResult.status === 'ERROR') {
      console.error('SEND ERROR:', sendResult.errorResult?.toString?.() || JSON.stringify(sendResult));
      return;
    }
    console.log('TX Hash:', sendResult.hash);
  } catch(e) {
    console.error('sendTransaction threw:', e.message || e);
    return;
  }

  console.log('\n=== STEP 6: Poll for result ===');
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const txResult = await SERVER.getTransaction(sendResult.hash);
    console.log(`  Attempt ${i+1}: status = ${txResult.status}`);

    if (txResult.status !== SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      console.log('\nFinal status:', txResult.status);
      console.log('Result keys:', Object.keys(txResult));
      if (txResult.status === 'SUCCESS') {
        console.log('returnValue field:', txResult.returnValue);
        if (txResult.returnValue) {
          try {
            console.log('Decoded return value:', scValToNative(txResult.returnValue));
          } catch(e) {
            console.log('scValToNative failed:', e.message);
          }
        }
      } else {
        console.error('Transaction FAILED result:', JSON.stringify(txResult, null, 2));
      }
      return;
    }
  }
  console.error('TIMEOUT: transaction not confirmed after 30s');
}

diagnose().catch(err => console.error('Unhandled error:', err));
