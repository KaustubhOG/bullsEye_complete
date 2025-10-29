video = https://drive.google.com/file/d/1x5yYv7AY26vB74qkx5d8YeC0We7ItcJS/view?usp=sharing

# 🎯 Accountability as a Service

A decentralized accountability platform built on Solana that helps individuals and teams stay accountable for their goals through financial and social commitment.

---

## 📌 About

**Accountability as a Service** creates a trustless, incentive-driven accountability layer using Solana Blinks. Users lock funds when setting a goal, and these funds can only be reclaimed once their progress is verified by trusted peers.

This creates real stakes — both social and financial — enforced transparently on-chain.

---

## 💡 Problem

Traditional accountability apps fail because they lack:
- Real consequences for not completing goals
- Verifiable trust (self-reporting is easily manipulated)
- Social pressure and community involvement

**What if your commitment had real stakes?**

---

## ⚙️ Solution

We built a Solana-based accountability protocol:

1. **Goal Creation & Fund Locking** → Users set a goal and lock SOL/tokens into a smart contract
2. **Verification Blink** → Designated verifiers confirm completion through a shareable Solana Action link
3. **Claim Blink** → If verified, users reclaim their locked funds
4. **Accountability Enforcement** → Failure to verify leads to funds being sent to a burn address or community pool

---

## 🔐 Verification System (High-Level)

Verification is the heart of trust in this platform. It ensures users can't cheat — they must have their goals verified through consensus.

### How It Works

#### The Two-Yes Rule (Majority Validation)

Every goal requires **2 out of 3 "yes" votes** to be marked as verified:

- **User Chooses One Friend** → When creating a goal, you nominate one trusted friend as a verifier
- **Majority Stake is Neutral** → The other 2 verifiers are chosen from a neutral pool (strangers/trusted network nodes with no personal bias)
- **2 Votes Required** → Even if your friend vouches for you, at least one neutral verifier must also confirm

**This prevents gaming the system:**
- You can't just ask a friend to lie
- Neutral parties prevent collusion
- Multiple perspectives validate your achievement

#### Verification Flow

```
Goal Created → Deadline Reached → Verification Blink Shared
                                          ↓
                    Verifiers Vote (1 Friend + 2 Neutral)
                                          ↓
                         2 Yes Votes Required ✓
                                          ↓
                      Goal Marked as VERIFIED
                                          ↓
                        User Can Claim Funds
```

#### What Happens If Not Verified?

If you don't get 2 yes votes:
- Goal is marked as **FAILED**
- Staked funds are **forfeited**
- Funds sent to burn address/community pool
- **Real accountability through financial consequences**

#### Demo Setup

For the hackathon, all verifiers are simulated within the same environment (company accounts) to demonstrate the complete flow end-to-end.

#### Future Enhancement

Production version will add:
- **Photo/Media Evidence** → Users post proof of completion
- **Private Verification** → Only assigned verifiers can view evidence
- **Vote on Authenticity** → Verifiers review and vote on whether it's genuine

---

## 🌐 Why Solana

- **Speed & Scalability** → Instant verification and fund movement
- **Low Fees** → Affordable for micro-stakes and frequent transactions
- **Solana Blinks** → First-of-its-kind use for social verification via shareable links (no dApp switching needed)
- **Composability** → Easy integration with other Solana apps

---

## 🛠️ Tech Stack

**Frontend:** Next.js, Tailwind CSS, ShadCN  
**Blockchain:** Solana, Rust, Anchor  
**Backend:** Next.js API Routes, Solana Actions  
**Database:** PostgreSQL (Neon.tech)  
**Hosting:** Vercel  

---

## ▶️ How to Run

### Frontend

```bash
cd bullseye
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Smart Contract

```bash
cd Smart_Contract/bullseye
anchor build
```

Deploy to Solana Devnet:

```bash
anchor deploy
```

Run tests:

```bash
anchor test
```

---

## 🏆 Impact & Innovation

✅ First decentralized accountability layer leveraging Solana Blinks  
✅ Frictionless verification via social interactions — no wallet UI needed  
✅ Transparent fund logic ensures zero trust between users and verifiers  
✅ Composable protocol that extends into DAOs, challenges, and productivity apps  

---

## 🚀 Future Roadmap

- Reputation scoring for consistent goal success
- Photo/media evidence system with private verification
- Public goal challenges and leaderboards
- SDK for third-party integration
- DAO governance and community token

---



**Built with ❤️ on Solana**
