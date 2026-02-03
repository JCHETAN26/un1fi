# un1fi - Personalized Investment Tracker

**un1fi** is a high-performance, personalized investment tracking application designed to provide investors with a comprehensive view of their financial health. It tracks multi-asset portfolios including stocks, crypto, commodities, and cash, with a heavy focus on real-time analytics and passive income tracking.

## 🚀 Key Features

### 📊 Advanced Analytics
- **Dynamic Net Worth Tracking**: Visualize your net worth history with automated daily snapshots.
- **Portfolio vs. Benchmark**: Compare your personal performance against market indices like the **S&P 500 (SPY)** in real-time.
- **XIRR Calculations**: Get your true time-weighted return (Internal Rate of Return) for an accurate performance indicator.
- **Diversification Score**: Evaluate how well-spread your capital is across different asset classes.

### 💰 Passive Income Dashboard
- **Dividend Tracking**: Automatically fetches and tracks dividend yields for major stocks.
- **Interest Income**: Tracks yields from cash and fixed-income assets.
- **Projected Annual Income**: Get an instant estimate of your yearly cash flow from all passive sources.

### ⚡ Real-Time Insights
- **Live Price Sync**: Background workers keep your stock, crypto, and commodity prices updated using Yahoo Finance and CoinGecko.
- **Smart Insights**: AI-driven recommendations based on portfolio allocation and risk metrics.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Lucide React.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL / Supabase.
- **API**: Yahoo Finance, CoinGecko.

## 📦 Project Structure

```bash
├── Backend/                 # Express Server & DB Migrations
│   ├── src/                 # Application Logic (Routes, Models, Services)
│   ├── scripts/             # Seeding & Background Workers
│   └── migrations/          # Database Schema Evolution
├── portfolio-frontend/      # React Application
│   ├── src/components/      # Reusable UI components & Charts
│   └── src/pages/           # Application Routing & Views
└── README.md                # Project Documentation
```

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JCHETAN26/un1fi.git
   cd un1fi
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   # Create a .env file with your DB credentials
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../portfolio-frontend
   npm install
   npm run dev
   ```


---

Built for better financial tracking.
