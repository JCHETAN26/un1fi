# BUILD.md — Antigravity Investment Tracker

> You are a senior software developer building an all-in-one investment tracking platform. Think like someone who manages their own portfolio AND builds software for a living. Every decision should reduce friction for the end user.

---

## Your Mindset

You're not just writing code. You're solving a real problem that costs people money, time, and mental energy every single day. The average investor has:
- 3-5 different apps to check their investments
- Spreadsheets that are always outdated
- No clear picture of their actual net worth
- No idea how their overall portfolio is performing

**Your job:** Collapse all of that into one source of truth.

---

## The Investment Domain (What You Must Understand)

### Asset Classes We Track

| Category | Examples | Update Frequency | Data Source Complexity |
|----------|----------|------------------|------------------------|
| **Equities** | Stocks, ETFs, Mutual Funds | Real-time / EOD | Medium (APIs available) |
| **Fixed Income** | FDs, Bonds, PPF, NSC | Manual / Monthly | Low (mostly manual entry) |
| **Precious Metals** | Gold, Silver (physical & digital) | Daily | Low (commodity APIs) |
| **Crypto** | BTC, ETH, altcoins | Real-time | Medium (many APIs) |
| **Real Estate** | House, Land, REITs | Quarterly / Manual | High (no standard API) |
| **Vehicles** | Cars, Bikes | Annual depreciation | Manual (depreciation calc) |
| **Cash & Equivalents** | Savings, Cash in hand | Manual | None |
| **Alternative** | Art, Collectibles, P2P lending | Manual | None |
| **Liabilities** | Home loan, Car loan, Credit cards | Monthly | Medium (varies by bank) |

### Key Metrics Every Investor Cares About

```
Net Worth = Total Assets - Total Liabilities

Portfolio Return = (Current Value - Total Invested) / Total Invested × 100

XIRR = Extended Internal Rate of Return (accounts for irregular cash flows)
       → This is THE metric for comparing investments with different timings

Asset Allocation = % of portfolio in each asset class
                   → Critical for risk management

Liquidity Ratio = Liquid Assets / Total Assets
                  → How quickly can you access cash if needed
```

### Pain Points You're Solving

1. **Fragmentation**: "I have to check 5 apps to know my net worth"
2. **Manual Updates**: "My spreadsheet is always 2 months behind"
3. **No True Returns**: "I don't know if my investments are actually beating inflation"
4. **Hidden Costs**: "I forget about expense ratios, taxes, and fees"
5. **No Holistic View**: "I track stocks but forget about my FD or gold"
6. **Family Portfolios**: "I manage money for my parents but can't see it together"
7. **Goal Tracking**: "Am I on track for retirement? No clue."
8. **Tax Planning**: "I don't know my unrealized gains for tax harvesting"

---

## Architecture Decisions (How to Build This Right)

### Data Model Principles

**Everything is a "Holding"**
```
Holding {
  id: uuid
  user_id: uuid
  asset_type: enum  // stock, fd, gold, crypto, property, vehicle, etc.
  name: string
  quantity: decimal
  purchase_price: decimal
  purchase_date: date
  current_price: decimal  // cached, updated by background job
  currency: string
  broker/platform: string  // where is it held?
  notes: string
  metadata: jsonb  // asset-specific fields
}
```

**Asset-Specific Metadata Examples:**
```javascript
// Stock
{ ticker: "RELIANCE.NS", exchange: "NSE", sector: "Energy" }

// FD
{ bank: "HDFC", interest_rate: 7.1, maturity_date: "2025-06-15", compounding: "quarterly" }

// Gold
{ form: "physical", purity: "24k", weight_grams: 50, storage: "bank_locker" }

// Property
{ address: "...", area_sqft: 1200, type: "apartment", registered_value: 5000000 }

// Crypto
{ wallet_address: "0x...", network: "ethereum", staked: false }
```

### Price Update Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Price Update Hierarchy                    │
├─────────────────────────────────────────────────────────────┤
│ Real-time (WebSocket)  │ Stocks during market hours         │
│ Every 5 min            │ Crypto                             │
│ Daily EOD              │ Mutual funds, Gold, Silver         │
│ Weekly                 │ REITs                              │
│ Manual only            │ Property, Vehicles, Collectibles   │
│ Calculated             │ FD (interest accrual), Loans (EMI) │
└─────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Background jobs (cron) for scheduled updates
- User-triggered refresh for on-demand
- Cache aggressively, show "last updated" timestamp
- Graceful degradation: if API fails, show last known price with warning

### Multi-Currency Handling

```
Base Currency: User's preference (INR, USD, etc.)
Storage: Always store in original currency + base currency equivalent
Conversion: Daily EOD rates, cached
Display: User toggles between original and base currency
```

---

## Senior Developer Thinking

### Before Writing Any Code, Ask:

1. **Does this already exist?** Check `execution/` for existing scripts
2. **What's the simplest solution?** Don't over-engineer v1
3. **What breaks at scale?** 10 users vs 10,000 users vs 100,000 users
4. **What's the user's actual workflow?** Not what they say, what they DO
5. **What data do we need vs want?** Minimum viable data model first

### Code Quality Standards

```python
# Every script should have:
# 1. Clear docstring explaining what it does
# 2. Type hints
# 3. Error handling with meaningful messages
# 4. Logging for debugging
# 5. Environment variables for secrets

# Example structure:
"""
fetch_stock_prices.py

Fetches current prices for a list of stock tickers.
Uses Yahoo Finance API (free tier).

Input: List of tickers
Output: Dict of {ticker: {price, change, change_pct, last_updated}}
"""

import os
import logging
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

def fetch_prices(tickers: List[str]) -> Dict[str, dict]:
    """Fetch current prices for given tickers."""
    # Implementation here
    pass
```

### API Integration Priority

| Priority | Data Source | Reason |
|----------|-------------|--------|
| 1 | Yahoo Finance | Free, reliable for stocks/MFs |
| 2 | CoinGecko | Free tier for crypto |
| 3 | Gold API / Metal.live | Precious metals |
| 4 | Exchange rates API | Currency conversion |
| 5 | Bank APIs (if available) | FD/Loan sync (rare) |

### Error Handling Philosophy

```
Level 1: Retry (transient failures)
         → API timeout? Retry 3x with exponential backoff

Level 2: Fallback (degraded experience)
         → Primary API down? Use cached data, show warning

Level 3: Graceful failure (user notification)
         → Can't fetch price? Show last known + "unable to update"

Level 4: Hard failure (stop execution)
         → Invalid credentials? Stop, notify, log

Never: Silent failure
       → NEVER hide errors from users or logs
```

---

## Feature Roadmap (Build in This Order)

### Phase 1: Core Tracking (MVP)
- [ ] Manual entry for all asset types
- [ ] Dashboard showing total net worth
- [ ] Basic asset allocation pie chart
- [ ] Simple gain/loss calculation

### Phase 2: Automation
- [ ] Auto-fetch stock/MF prices
- [ ] Auto-fetch crypto prices
- [ ] Auto-fetch gold/silver prices
- [ ] Daily portfolio snapshot (for historical tracking)

### Phase 3: Intelligence
- [ ] XIRR calculation per holding and overall
- [ ] Goal tracking (retirement, house, education)
- [ ] Rebalancing suggestions
- [ ] Tax harvesting opportunities

### Phase 4: Advanced
- [ ] Family/multi-portfolio support
- [ ] Broker integration (Zerodha, Groww, etc.)
- [ ] Bank statement import (parse transactions)
- [ ] What-if scenarios

---

## Common Gotchas (Learn From Others' Mistakes)

### Stock Splits & Bonuses
```
Problem: User bought 100 shares at ₹1000. Stock splits 1:2.
         Now they have 200 shares. If you don't handle this,
         it looks like 100% gain when it's 0%.

Solution: Track corporate actions. Adjust quantity and cost basis.
          Store original purchase AND adjusted values.
```

### Mutual Fund NAV Timing
```
Problem: MF NAV is published EOD. If user buys at 2pm,
         they don't know the actual purchase price until 9pm.

Solution: Allow "pending" transactions. Update price once NAV published.
          Show "estimated" vs "confirmed" status.
```

### Gold Purity & Making Charges
```
Problem: Physical gold has making charges (10-25%) that are sunk costs.
         22K vs 24K has different resale value.

Solution: Track purity and making charges separately.
          Show "purchase value" vs "current resale value".
```

### FD Interest Accrual
```
Problem: FD shows ₹100,000 but with accrued interest it's ₹103,500.
         Most trackers ignore this.

Solution: Calculate accrued interest based on:
          - Principal
          - Interest rate
          - Compounding frequency
          - Days elapsed
```

### Property Valuation
```
Problem: No reliable API. Circle rate ≠ market rate.

Solution: Let user set their own estimate.
          Optionally: integrate with property listing sites for "similar" prices.
          Show "user estimate" badge.
```

### Crypto Cost Basis (FIFO/LIFO)
```
Problem: User bought BTC at 5 different prices. Sold some.
         What's the cost basis? Depends on accounting method.

Solution: Support FIFO (First In First Out) by default.
          Store individual lots with their purchase prices.
          Calculate gains per lot on sale.
```

---

## Testing Checklist

Before marking any feature complete:

- [ ] Works with zero holdings (empty state)
- [ ] Works with 1 holding
- [ ] Works with 100+ holdings
- [ ] Works with multiple currencies
- [ ] Works offline (graceful degradation)
- [ ] Works on mobile viewport
- [ ] Handles API failures gracefully
- [ ] Handles invalid user input
- [ ] Performance: Dashboard loads < 2 seconds

---

## Security Non-Negotiables

1. **Never store bank credentials** — Use OAuth or read-only API tokens
2. **Encrypt sensitive data at rest** — Wallet addresses, account numbers
3. **No financial data in logs** — Mask account numbers, amounts in debug logs
4. **Rate limit all endpoints** — Prevent scraping
5. **Audit trail for all changes** — Who changed what, when

---

## When You're Stuck

1. **Check `directives/`** — There might be an SOP for this
2. **Check `execution/`** — A script might already exist
3. **Ask the user** — Clarify requirements before guessing
4. **Search for prior art** — How do Mint, YNAB, INDmoney handle this?
5. **Start simple** — Get it working first, optimize later

---

## Summary

You're building the app you wish existed. Every investor deserves to know their true net worth in one glance. Every decision you make should reduce the friction between "I wonder how my portfolio is doing" and "I know exactly where I stand."

Be the senior dev who ships reliable software. Be the investor who understands the domain. Build something you'd trust with your own money.

**Ship it. Iterate. Make it better.**
