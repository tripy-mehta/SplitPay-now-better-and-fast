process.env.NEXT_PUBLIC_CONTRACT_ID = 'CAYNYPWTUOSXMBFEUS3YRT4YDSMGQ4YYAVAO4MSOLNWV3R6AZAFDUUON';
process.env.NEXT_PUBLIC_NATIVE_TOKEN_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
process.env.NEXT_PUBLIC_RPC_URL = 'https://soroban-testnet.stellar.org';
process.env.NEXT_PUBLIC_HORIZON_URL = 'https://horizon-testnet.stellar.org';

const { Keypair } = require('@stellar/stellar-sdk');
const { createGroup } = require('./src/lib/contract');
const fetch = require('node-fetch'); // we might need node-fetch or use global fetch

async function main() {
  const pair = Keypair.random();
  const publicKey = pair.publicKey();
  console.log('Testing createGroup with random valid address:', publicKey);
  
  // Fund via Friendbot first
  console.log('Funding address via Friendbot...');
  try {
    const fundRes = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
    if (fundRes.ok) {
      console.log('Funded successfully!');
    } else {
      console.log('Friendbot response code:', fundRes.status);
    }
  } catch (err) {
    console.error('Failed to fund via Friendbot:', err);
  }

  // Now invoke
  try {
    const groupId = await createGroup(publicKey, 'Test Group Name');
    console.log('Success! Group ID created:', groupId);
  } catch (err) {
    console.error('Error invoking createGroup:', err);
  }
}

main();
