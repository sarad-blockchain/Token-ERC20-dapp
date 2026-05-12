/**
 * js/app.js
 * Main application logic.
 * Depends on: ethers (CDN), config.js, contract.js, ui.js
 *
 * CONTRACT_ADDRESS — injected by config.js
 * CONTRACT_ABI     — loaded async by contract.js (window.contractReady)
 */
(function () {
  'use strict';

  let provider, signer, contract, userAddress;

  /* ─────────────────────────────────────────
   *  CONNECT
   * ───────────────────────────────────────── */
  UI.btnConnect.addEventListener('click', async () => {
    if (!window.ethereum) {
      showToast('MetaMask not detected. Install it first.', 'error');
      return;
    }
    try {
      UI.btnConnect.disabled  = true;
      UI.btnConnect.innerHTML = spinnerHTML('Connecting…');

      // Wait for ABI to be ready before doing anything on-chain
      await window.contractReady;

      provider    = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      signer      = provider.getSigner();
      userAddress = await signer.getAddress();
      contract    = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      UI.walletAddr.textContent = shortAddr(userAddress);

      const network = await provider.getNetwork();
      UI.networkBadge.textContent = '● ' + (
        network.name === 'unknown' ? 'Chain ' + network.chainId : network.name
      );
      UI.networkBadge.className = 'network-badge connected';

      await loadContractData();
      showDashboard();
      showToast('Wallet connected', 'success');

      window.ethereum.on('accountsChanged', () => location.reload());
      window.ethereum.on('chainChanged',    () => location.reload());

    } catch (err) {
      showToast('Connection error: ' + _errMsg(err), 'error');
      resetConnectButton();
    }
  });

  /* ─────────────────────────────────────────
   *  DISCONNECT
   * ───────────────────────────────────────── */
  UI.btnDisconnect.addEventListener('click', () => {
    provider = signer = contract = userAddress = null;
    showConnectScreen();
    showToast('Wallet disconnected');
  });

  /* ─────────────────────────────────────────
   *  LOAD CONTRACT DATA
   * ───────────────────────────────────────── */
  async function loadContractData() {
    try {
      const [name, symbol, decimalsRaw, supply, balance, ethBal, minted] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply(),
        contract.balanceOf(userAddress),
        provider.getBalance(userAddress),
        contract.hasMinted(userAddress),
      ]);

      const decimals = Number(decimalsRaw);
      renderTokenInfo({ name, symbol, decimals, supply, contractAddr: CONTRACT_ADDRESS });
      renderBalance(balance, decimals, ethBal);
      renderMintStatus(minted);

    } catch (err) {
      UI.iName.textContent = '⚠ Check contract address';
      showToast('Could not load contract data', 'error');
      console.error('[CryptoReal] loadContractData error:', err);
    }
  }

  /* ─────────────────────────────────────────
   *  MINT
   * ───────────────────────────────────────── */
  UI.btnMint.addEventListener('click', async () => {
    try {
      UI.btnMint.disabled  = true;
      UI.btnMint.innerHTML = spinnerHTML('Confirm in MetaMask…');

      const tx = await contract.mint();
      UI.btnMint.innerHTML = spinnerHTML('Processing…');
      showToast('Tx sent: ' + tx.hash.slice(0, 10) + '…');

      await tx.wait(1);

      const [newBalance, ethBal, decimalsRaw, symbol] = await Promise.all([
        contract.balanceOf(userAddress),
        provider.getBalance(userAddress),
        contract.decimals(),
        contract.symbol(),
      ]);
      const decimals = Number(decimalsRaw);
      renderBalance(newBalance, decimals, ethBal);
      renderMintStatus(true);
      addTxToHistory({ type: 'mint', addr: userAddress, amount: '1,000', symbol, hash: tx.hash });
      showToast('1,000 CRT minted to your wallet', 'gold');

    } catch (err) {
      showToast('Mint error: ' + _errMsg(err).slice(0, 72), 'error');
      console.error('[CryptoReal] mint error:', err);
      const stillClaimed = await contract.hasMinted(userAddress).catch(() => false);
      if (!stillClaimed) {
        UI.btnMint.disabled   = false;
        UI.btnMint.textContent = 'Mint tokens →';
      }
    }
  });

  /* ─────────────────────────────────────────
   *  TRANSFER
   * ───────────────────────────────────────── */
  UI.btnTransfer.addEventListener('click', async () => {
    const toAddr = UI.toAddr.value.trim();
    const amtStr = UI.amount.value.trim();

    if (!ethers.utils.isAddress(toAddr)) {
      showToast('Invalid recipient address', 'error'); return;
    }
    if (!amtStr || isNaN(amtStr) || parseFloat(amtStr) <= 0) {
      showToast('Enter a valid amount', 'error'); return;
    }

    try {
      UI.btnTransfer.disabled  = true;
      UI.btnTransfer.innerHTML = spinnerHTML('Confirm in MetaMask…');

      const decimals = await contract.decimals();
      const amount   = ethers.utils.parseUnits(amtStr, decimals);
      const tx       = await contract.transfer(toAddr, amount);

      UI.btnTransfer.innerHTML = spinnerHTML('Processing…');
      showToast('Tx sent: ' + tx.hash.slice(0, 10) + '…');

      await tx.wait(1);

      const [newBalance, ethBal] = await Promise.all([
        contract.balanceOf(userAddress),
        provider.getBalance(userAddress),
      ]);
      renderBalance(newBalance, Number(decimals), ethBal);

      const symbol = await contract.symbol();
      addTxToHistory({ type: 'out', addr: toAddr, amount: amtStr, symbol, hash: tx.hash });

      UI.toAddr.value = '';
      UI.amount.value = '';
      showToast('Transfer complete', 'success');

    } catch (err) {
      showToast('Error: ' + _errMsg(err).slice(0, 72), 'error');
      console.error('[CryptoReal] transfer error:', err);
    } finally {
      UI.btnTransfer.disabled   = false;
      UI.btnTransfer.textContent = 'Send →';
    }
  });

  /* ── Util ── */
  function _errMsg(err) {
    return err?.reason || err?.data?.message || err?.message || String(err);
  }

})();
