// Quick test script for price APIs - no database needed
import axios from 'axios';

async function testPrices() {
  console.log('\n🧪 Testing Price APIs...\n');

  // Test Yahoo Finance for stocks
  console.log('📈 Testing Stock (AAPL)...');
  try {
    const response = await axios.get(
      'https://query1.finance.yahoo.com/v8/finance/chart/AAPL',
      {
        params: { interval: '1d', range: '1d' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000,
      }
    );
    const meta = response.data.chart?.result?.[0]?.meta;
    console.log(`   ✅ AAPL: $${meta.regularMarketPrice.toFixed(2)}`);
  } catch (e: any) {
    console.log(`   ❌ Failed: ${e.message}`);
  }

  // Test Gold
  console.log('\n🥇 Testing Gold (GC=F)...');
  try {
    const response = await axios.get(
      'https://query1.finance.yahoo.com/v8/finance/chart/GC=F',
      {
        params: { interval: '1d', range: '1d' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000,
      }
    );
    const meta = response.data.chart?.result?.[0]?.meta;
    console.log(`   ✅ Gold: $${meta.regularMarketPrice.toFixed(2)}/oz`);
  } catch (e: any) {
    console.log(`   ❌ Failed: ${e.message}`);
  }

  // Test Silver
  console.log('\n🥈 Testing Silver (SI=F)...');
  try {
    const response = await axios.get(
      'https://query1.finance.yahoo.com/v8/finance/chart/SI=F',
      {
        params: { interval: '1d', range: '1d' },
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000,
      }
    );
    const meta = response.data.chart?.result?.[0]?.meta;
    console.log(`   ✅ Silver: $${meta.regularMarketPrice.toFixed(2)}/oz`);
  } catch (e: any) {
    console.log(`   ❌ Failed: ${e.message}`);
  }

  // Test CoinGecko for crypto
  console.log('\n🪙 Testing Crypto (Bitcoin, Ethereum)...');
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'bitcoin,ethereum',
          vs_currencies: 'usd',
          include_24hr_change: true,
        },
        timeout: 10000,
      }
    );
    console.log(`   ✅ Bitcoin: $${response.data.bitcoin.usd.toLocaleString()} (${response.data.bitcoin.usd_24h_change?.toFixed(2)}%)`);
    console.log(`   ✅ Ethereum: $${response.data.ethereum.usd.toLocaleString()} (${response.data.ethereum.usd_24h_change?.toFixed(2)}%)`);
  } catch (e: any) {
    console.log(`   ❌ Failed: ${e.message}`);
  }

  console.log('\n✨ Price API test complete!\n');
}

testPrices();
