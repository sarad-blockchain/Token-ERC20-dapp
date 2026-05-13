# CryptoReal — Token ERC-20  dApp

A custom ERC-20 token deployed on the Ethereum Sepolia testnet, with a browser frontend that connects to it via MetaMask and ethers.js.

Token balance, transfer history, and on-chain metadata are read directly from the contract. Every transfer is a real blockchain transaction signed through MetaMask and visible on Sepolia Etherscan.

[Live demo](https://token-erc-20-dapp.vercel.app/) · [Contract on Etherscan](#)

---

## How it works

```
User clicks Connect
      ↓
ethers.js requests accounts from MetaMask
      ↓
app.js reads name, symbol, decimals, totalSupply, balanceOf in parallel
      ↓
Dashboard renders token info and wallet balances
      ↓
User fills in recipient address + amount and clicks Send
      ↓
ethers.js encodes contract.transfer(to, amount) and sends to MetaMask
      ↓
MetaMask asks the user to sign and pay gas (Sepolia ETH, free)
      ↓
The EVM executes CryptoReal.sol on-chain (OpenZeppelin ERC-20)
      ↓
app.js waits for 1 confirmation, then refreshes balance and logs the tx
```

---

## Project structure

```
cryptoreal/
│
├── index.html                  # App shell — loads fonts, CSS, ethers.js CDN, scripts
│
├── contracts/
│   └── CryptoReal.sol          # The Solidity smart contract (OpenZeppelin ERC-20)
│
├── abi/
│   └── abi.json                # Full ABI exported from Remix
│
├── src/
│   ├── css/
│   │   ├── reset.css           # Normalisation and box-model
│   │   ├── tokens.css          # Custom properties — colours, typography, spacing
│   │   ├── layout.css          # Page structure, grid, canvas layers
│   │   ├── components.css      # All UI components (cards, buttons, inputs, badges)
│   │   └── animations.css      # Keyframes and animation utility classes
│   │
│   └── js/
│       ├── config.js           # CONTRACT_ADDRESS and NETWORK_ID (not committed — see below)
│       ├── config.example.js   # Template for config.js — safe to commit
│       ├── contract.js         # Fetches abi/abi.json and exposes window.contractReady
│       ├── ui.js               # DOM references, toast helper, render functions
│       ├── app.js              # Main logic: connect, transfer, event listeners
│       └── coins/
│           ├── coins-bg.js     # Procedural 3-D coins — background layer (large, slow)
│           └── coins-fg.js     # Procedural 3-D coins — foreground layer (small, fast)
│
├── .gitignore
└── README.md
```

---

## The smart contract

`CryptoReal.sol` inherits OpenZeppelin's battle-tested `ERC20` base and adds nothing custom — the goal is to deploy a real, standards-compliant token with minimal surface area.

```solidity
contract CryptoReal is ERC20 {
    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
    {
        _mint(msg.sender, 1000 * 1e18);
    }
}
```

The constructor mints 1 000 CRT (18 decimals) to the deployer on first deployment. Everything else — `transfer`, `approve`, `transferFrom`, `balanceOf`, `allowance`, events — is inherited unchanged from OpenZeppelin.

---

## Frontend architecture

**One screen, two states.** The connect screen is shown until MetaMask grants access; the dashboard replaces it once a wallet is connected. There is no routing library — a single CSS class toggle drives the transition.

**Module responsibilities**

| File | Role |
|---|---|
| `app.js` | MetaMask connection, contract calls, transfer flow, event listeners |
| `ui.js` | DOM references, toast notifications, balance and token-info renderers |
| `contract.js` | Fetches `abi/abi.json` at runtime and exposes `window.contractReady` — a Promise app.js awaits before connecting |
| `config.js` | Contract address and expected chain ID |
| `coins-bg.js` / `coins-fg.js` | Canvas 2D animation — two independent layers of procedural 3-D coins |

**State model (`app.js`)**

```js
let provider;    // ethers Web3Provider wrapping window.ethereum
let signer;      // connected account signer
let contract;    // ethers.Contract instance
let userAddress; // checksummed wallet address
```

---

## Configuration and deployment

### Why config.js is not committed

`config.js` holds only the public Sepolia contract address — nothing secret. It is still excluded from source control so that the same repository can be deployed to multiple environments (Sepolia, Holesky, mainnet) without code changes, and so that the deployed address is never accidentally committed pointing to a stale contract.

### Local development

```bash
git clone https://github.com/your-username/cryptoreal.git
cd cryptoreal
cp src/js/config.example.js src/js/config.js
# Edit config.js and set CONTRACT_ADDRESS to your deployed address
```

Open `index.html` directly, or start a local server to avoid ES-module restrictions on `file://`:

```bash
npx serve .
# or
python3 -m http.server 8080
```

### Deploy to Vercel

1. Push the repository to GitHub. `config.js` is in `.gitignore` and will not be pushed.
2. Import the repository in [vercel.com](https://vercel.com).
3. Under **Settings → Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_CONTRACT_ADDRESS` | Your deployed contract address |
| `VITE_NETWORK_ID` | `11155111` (Sepolia) or the relevant chain ID |

4. Trigger a deployment. `vercel-build.sh` runs automatically, writes `config.js` from the environment variables, and serves the static files.

### Deploy your own contract

Use [Remix IDE](https://remix.ethereum.org) connected to the Sepolia testnet:

```solidity
// In the Deploy panel, pass constructor arguments:
name_:   "CryptoReal"
symbol_: "CRT"
// Mints 1 000 CRT to your wallet on deployment
```

Free Sepolia ETH is available from the [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia).

---

## Solidity concepts demonstrated

| Concept | Where |
|---|---|
| OpenZeppelin inheritance | `CryptoReal is ERC20` |
| Constructor with `_mint` | 1 000 CRT minted to deployer on deploy |
| ERC-20 standard interface | `transfer`, `approve`, `transferFrom`, `balanceOf`, `allowance` |
| Events | `Transfer` and `Approval` emitted by OpenZeppelin base |
| `uint8` return type | `decimals()` returns 18 |

---

## Tech stack

| Layer | Technology |
|---|---|
| Smart contract | Solidity `^0.8.34` + OpenZeppelin ERC-20 |
| Blockchain | Ethereum Sepolia testnet |
| Wallet | MetaMask |
| Web3 library | ethers.js v5.7 (CDN, no bundler) |
| Frontend | Vanilla HTML / CSS / JS (ES modules) |
| Animation | Canvas 2D API — procedural 3-D coin rendering |
| Fonts | Space Mono + Syne (Google Fonts) |
| Hosting | Vercel |

---

## Getting started

Prerequisites: MetaMask browser extension and Sepolia ETH (free from the [Google Cloud Web3 Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)).

---

## Author

Sara Deleyto — Solidity learning project.
