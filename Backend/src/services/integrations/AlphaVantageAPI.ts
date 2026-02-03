import axios from 'axios';

export class AlphaVantageAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getQuote(symbol: string) {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.apiKey,
        },
      });
      return response.data['Global Quote'];
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      return null;
    }
  }

  async getIntraday(symbol: string, interval: string = '60min') {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol,
          interval,
          apikey: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      return null;
    }
  }
}
