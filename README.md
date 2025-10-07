# 🌾 AgroTour: NFT-Powered Virtual Farm Tours and Investments

Welcome to AgroTour, a revolutionary Web3 platform built on the Stacks blockchain using Clarity smart contracts! This project addresses real-world challenges in agriculture, such as limited access to farm education and tours, funding shortages for small-scale farmers, and lack of transparency in sustainable farming investments. By leveraging NFTs, users can purchase virtual farm tours for immersive educational experiences, while also investing in real farms through tokenized shares—enabling crowdfunding for eco-friendly practices and earning yields from farm profits.

## ✨ Features

🌍 Virtual farm tours via NFTs: Unlock 360° videos, live streams, and interactive maps of real farms worldwide.
💰 Fractional investments: Buy NFT shares in farms to fund sustainable projects like organic farming or renewable energy.
📈 Staking and rewards: Stake investment tokens to earn a share of farm yields (e.g., crop sales or eco-credits).
🔄 Marketplace trading: Buy, sell, or trade tour NFTs and investment shares.
🗳️ Community governance: Vote on farm projects and platform upgrades using governance tokens.
📊 Transparency dashboard: Verify farm data like yields and sustainability metrics on-chain.
🚫 Fraud prevention: Immutable records to ensure authentic farm registrations and investment payouts.

## 🛠 How It Works

AgroTour uses 8 interconnected Clarity smart contracts to create a secure, decentralized ecosystem. Farms register on-chain, mint NFTs for tours and investments, and distribute rewards based on real-world outcomes (integrated via oracles). Here's a breakdown:

### Smart Contracts Overview
1. **FarmRegistry.clar**: Handles farm onboarding, storing details like location, owner, and sustainability certifications. Prevents duplicates and verifies authenticity.
2. **TourNFT.clar**: Mints and manages NFTs for virtual tours. Each NFT grants access to exclusive content (e.g., VR tours or live Q&A sessions).
3. **InvestmentToken.clar**: A fungible token (similar to SIP-010) for fractional farm investments. Tokens represent shares in farm assets or projects.
4. **StakingPool.clar**: Allows users to stake investment tokens in farm-specific pools, earning rewards proportional to farm performance.
5. **Marketplace.clar**: Enables peer-to-peer trading of NFTs and tokens with built-in royalties for farmers.
6. **GovernanceDAO.clar**: Manages proposals and voting using governance tokens earned from staking or tour purchases.
7. **RewardDistributor.clar**: Distributes yields (e.g., from crop sales) to stakers, using on-chain proofs for fairness.
8. **DataOracle.clar**: Integrates external data feeds (e.g., crop yields or carbon credits) to trigger automated payouts and updates.

**For Farmers**
- Register your farm via FarmRegistry.clar with proof of ownership and sustainability data.
- Mint TourNFTs for virtual experiences and InvestmentTokens for crowdfunding specific projects (e.g., solar panels).
- Use RewardDistributor.clar to upload verified yields and automatically pay out to investors.

Boom! Your farm gains global visibility, funding, and a community of supporters.

**For Tourists/Educators**
- Browse and purchase TourNFTs on the Marketplace.clar to access virtual tours.
- Use TourNFT.clar to verify and unlock content—perfect for schools or eco-enthusiasts.

Instant immersion without travel!

**For Investors**
- Buy InvestmentTokens for a farm project.
- Stake them in StakingPool.clar to earn passive rewards.
- Participate in GovernanceDAO.clar to vote on farm improvements.

Transparent, decentralized investing with real impact.

## 🚀 Getting Started
Deploy the contracts on Stacks testnet using Clarity tools. Interact via the Stacks Wallet or Hiro's developer console. For example:
- Call `register-farm` in FarmRegistry.clar to start.
- Mint NFTs with `mint-tour-nft` in TourNFT.clar.

This project empowers sustainable agriculture by bridging the gap between urban users and rural farms, solving funding and accessibility issues while fostering global education on food systems. Let's grow together! 🌱