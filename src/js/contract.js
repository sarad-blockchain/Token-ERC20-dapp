/**
 * js/contract.js
 * Loads the contract ABI from abi/abi.json at runtime.
 * CONTRACT_ADDRESS comes from config.js (loaded before this script).
 *
 * Exposes a promise: window.contractReady
 * app.js awaits it before doing anything on-chain.
 */

let CONTRACT_ABI = null;

window.contractReady = fetch('./abi/abi.json')
  .then(res => {
    if (!res.ok) throw new Error('Could not load abi.json: ' + res.status);
    return res.json();
  })
  .then(abi => {
    CONTRACT_ABI = abi;
  })
  .catch(err => {
    console.error('[CryptoReal] ABI load failed:', err);
    throw err;
  });
