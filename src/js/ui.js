/**
 * js/ui.js
 * Pure UI helpers — no blockchain logic here.
 */

const UI = {
  connectSection: document.getElementById('connect-section'),
  dashboard:      document.getElementById('dashboard'),
  btnConnect:     document.getElementById('btn-connect'),
  btnDisconnect:  document.getElementById('btn-disconnect'),
  btnTransfer:    document.getElementById('btn-transfer'),
  btnMint:        document.getElementById('btn-mint'),
  mintStatus:     document.getElementById('mint-status'),
  networkBadge:   document.getElementById('network-badge'),
  walletAddr:     document.getElementById('wallet-addr'),
  balanceNum:     document.getElementById('balance-num'),
  balanceEth:     document.getElementById('balance-eth'),
  toAddr:         document.getElementById('to-addr'),
  amount:         document.getElementById('amount'),
  iName:          document.getElementById('i-name'),
  iSymbol:        document.getElementById('i-symbol'),
  iDecimals:      document.getElementById('i-decimals'),
  iSupply:        document.getElementById('i-supply'),
  iContract:      document.getElementById('i-contract'),
  txList:         document.getElementById('tx-list'),
  toast:          document.getElementById('toast'),
};

/* ── Toast ── */
let _toastTimer;
function showToast(message, type = '') {
  UI.toast.textContent = message;
  UI.toast.className   = `show ${type}`.trim();
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { UI.toast.className = ''; }, 3800);
}

/* ── Spinner ── */
function spinnerHTML(label = '') {
  return `<span class="spinner" aria-hidden="true"></span>${label}`;
}

/* ── Short address ── */
function shortAddr(addr) {
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

/* ── Format units ── */
function fmtUnits(bigNumber, decimals, fractionDigits = 2) {
  const raw = ethers.utils.formatUnits(bigNumber, decimals);
  return parseFloat(raw).toLocaleString('en-US', { maximumFractionDigits: fractionDigits });
}

/* ── Show dashboard ── */
function showDashboard() {
  UI.connectSection.style.display = 'none';
  UI.dashboard.classList.add('visible');
}

/* ── Show connect screen ── */
function showConnectScreen() {
  UI.dashboard.classList.remove('visible');
  UI.connectSection.style.display = '';
  resetConnectButton();
  UI.networkBadge.textContent = '● Disconnected';
  UI.networkBadge.className   = 'network-badge';
}

/* ── Reset connect button ── */
function resetConnectButton() {
  UI.btnConnect.disabled  = false;
  UI.btnConnect.innerHTML = `
    <svg class="btn-connect__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
      <circle cx="16" cy="12" r="1" fill="currentColor"/>
    </svg>
    Connect MetaMask`;
}

/* ── Render token info ── */
function renderTokenInfo({ name, symbol, decimals, supply, contractAddr }) {
  UI.iName.textContent     = name;
  UI.iSymbol.textContent   = symbol;
  UI.iDecimals.textContent = decimals;
  UI.iSupply.textContent   = `${fmtUnits(supply, decimals)} ${symbol}`;
  UI.iContract.textContent = shortAddr(contractAddr);
}

/* ── Render balance ── */
function renderBalance(balance, decimals, ethBalance) {
  UI.balanceNum.textContent = fmtUnits(balance, decimals);
  UI.balanceEth.textContent = parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(5) + ' ETH';
}

/* ── Render mint status ── */
function renderMintStatus(hasMinted) {
  if (hasMinted) {
    UI.mintStatus.innerHTML = '<span class="dot" style="background:var(--muted);box-shadow:none;animation:none"></span>Already claimed';
    UI.mintStatus.classList.add('claimed');
    UI.btnMint.textContent = 'Already minted';
    UI.btnMint.classList.add('claimed');
  } else {
    UI.mintStatus.innerHTML = '<span class="dot"></span>Available to claim';
    UI.mintStatus.classList.remove('claimed');
    UI.btnMint.textContent = 'Mint tokens →';
    UI.btnMint.classList.remove('claimed');
  }
}

/* ── TX history ── */
const _txHistory = [];

function addTxToHistory({ type, addr, amount, symbol, hash }) {
  _txHistory.unshift({ type, addr, amount, symbol, hash });
  renderTxList();
}

function renderTxList() {
  if (!_txHistory.length) {
    UI.txList.innerHTML = '<p class="empty-state">No activity yet this session</p>';
    return;
  }
  UI.txList.innerHTML = _txHistory.slice(0, 10).map(tx => {
    const icon   = tx.type === 'mint' ? '✦' : tx.type === 'out' ? '↑' : '↓';
    const label  = tx.type === 'mint' ? 'Minted to wallet'
                 : tx.type === 'out'  ? '→ ' + shortAddr(tx.addr)
                 :                      '← ' + shortAddr(tx.addr);
    const amount = tx.type === 'mint' ? `+${tx.amount} ${tx.symbol}`
                 : tx.type === 'out'  ? `-${tx.amount} ${tx.symbol}`
                 :                      `+${tx.amount} ${tx.symbol}`;
    return `
      <div class="tx-item">
        <div class="tx-icon ${tx.type}" aria-hidden="true">${icon}</div>
        <span class="tx-addr">${label}</span>
        <span class="tx-amount ${tx.type}">${amount}</span>
      </div>`;
  }).join('');
}
