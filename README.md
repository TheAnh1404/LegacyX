# LegacyX

> Stellar-powered digital asset inheritance platform built on Soroban smart contracts.

## Architecture

```
LegacyX/
├── contracts/legacyx/      # Soroban Rust smart contract
├── backend/                # NestJS + Prisma backend API
├── src/                    # React + TypeScript + Vite frontend
│   ├── lib/                # Integration helpers (Stellar, Soroban, Freighter, API)
│   ├── pages/              # Route-level screens
│   ├── components/         # UI components
│   └── mock/               # App state store (with real + mock modes)
└── public/                 # Static assets
```

---

## Level 1 — Wallet Connection & Real Transactions

### Features
- ✅ Connect Freighter wallet (with mock fallback for demos)
- ✅ Verify Stellar Testnet network
- ✅ Display wallet address
- ✅ Display wallet XLM balance
- ✅ Perform real Stellar Testnet transactions
- ✅ Generate real txHash from on-chain submissions
- ✅ Provide Stellar Expert links: `https://stellar.expert/explorer/testnet/tx/<TX_HASH>`

### Prerequisites
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Switch Freighter to **Stellar Testnet**
- Fund your Testnet account via [Friendbot](https://friendbot.stellar.org/?addr=YOUR_ADDRESS)

---

## Level 2 — Soroban Smart Contract

### Contract Functions
| Function | Description |
|---|---|
| `initialize` | One-time admin setup |
| `create_will` | Lock tokens, create inheritance will |
| `heartbeat` | Owner confirms activity, extends unlock time |
| `claim_inheritance` | Beneficiary withdraws after timeout |
| `cancel_will` | Owner revokes and reclaims tokens |
| `change_beneficiary` | Owner updates heir address |
| `get_will` | Read will data by ID |
| `get_will_count` | Get total will count |

### Contract Address
```
TODO — Deploy the contract and paste the address here
```

### Stellar Expert Contract Link
```
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ADDRESS>
```

---

## Quick Start

### 1. Frontend

```bash
npm install
npm run dev
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL connection string
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

### 3. Smart Contract

#### Build
```bash
cd contracts/legacyx
stellar contract build
```

#### Deploy to Testnet
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/legacyx.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet
```

#### Initialize
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_SECRET_KEY> \
  --network testnet \
  -- initialize \
  --admin <YOUR_PUBLIC_KEY>
```

#### Run Tests
```bash
cd contracts/legacyx
cargo test
```

---

## Environment Variables

### Frontend (`.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_CONTRACT_ID` | Deployed Soroban contract address |
| `VITE_STELLAR_RPC_URL` | Soroban RPC endpoint |
| `VITE_STELLAR_NETWORK_PASSPHRASE` | Stellar network passphrase |
| `VITE_STELLAR_EXPERT_TX_URL` | Stellar Expert transaction base URL |

### Backend (`.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API server port (default: 3000) |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/users/profile` | Create/update user profile |
| GET | `/users/me?walletAddress=` | Get user by wallet |
| PATCH | `/users/me?walletAddress=` | Update profile |
| POST | `/wallets/link` | Link wallet to user |
| GET | `/wallets/:walletAddress` | Get wallet info |
| POST | `/wills` | Create will record |
| GET | `/wills` | List all wills |
| GET | `/wills/:id` | Get will by ID |
| GET | `/wills/owner/:walletAddress` | Get wills by owner |
| GET | `/wills/beneficiary/:walletAddress` | Get wills by beneficiary |
| PATCH | `/wills/:id/onchain` | Update on-chain data |
| PATCH | `/wills/:id/heartbeat` | Record heartbeat tx |
| PATCH | `/wills/:id/claim` | Record claim tx |
| PATCH | `/wills/:id/cancel` | Record cancel tx |
| PATCH | `/wills/:id/beneficiary` | Record beneficiary change |
| POST | `/transactions` | Create transaction record |
| GET | `/transactions/wallet/:walletAddress` | Get txs by wallet |
| GET | `/transactions/will/:willId` | Get txs by will |
| POST | `/reminders` | Create reminder |
| GET | `/reminders/wallet/:walletAddress` | Get reminders by wallet |

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Blockchain**: Stellar Testnet, Soroban, Freighter Wallet
- **Backend**: NestJS, Prisma, PostgreSQL
- **Contract**: Rust, soroban-sdk

---

## License

© 2026 LegacyX Platform. Built on Stellar Soroban.
