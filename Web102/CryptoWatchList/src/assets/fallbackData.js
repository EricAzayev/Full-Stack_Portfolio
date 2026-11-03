// Synthetic seed data mirroring the CryptoCompare min-api response shapes
// (/data/all/coinlist and /data/price). Used when the live API fails or
// VITE_APP_API_KEY is missing. Values are plausible, not real market data.
const COINS = [
  { symbol: "BTC", id: 1182, name: "Bitcoin", price: 118742.53 },
  { symbol: "ETH", id: 7605, name: "Ethereum", price: 4218.9 },
  { symbol: "SOL", id: 130856, name: "Solana", price: 209.41 },
  { symbol: "ADA", id: 783734, name: "Cardano", price: 0.7623 },
  { symbol: "XRP", id: 1364, name: "XRP", price: 2.47 },
  { symbol: "USDT", id: 25799, name: "Tether", price: 1.0 },
  { symbol: "DOGE", id: 443, name: "Dogecoin", price: 0.2418 },
  { symbol: "LINK", id: 1150925, name: "Chainlink", price: 25.36 },
];

const icon = (symbol) =>
  `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;

// Shape of /data/all/coinlist response: {Data: {SYMBOL: {ImageUrl, FullName, Symbol, PlatformType, ...}}}
export const fallbackCoinMap = Object.fromEntries(
  COINS.map((coin) => [
    coin.symbol,
    {
      Id: String(coin.id),
      Symbol: coin.symbol,
      CoinName: coin.name,
      FullName: coin.name,
      SortOrder: String(coin.id),
      ImageUrl: icon(coin.symbol),
      PlatformType: "blockchain",
      Algorithm: "N/A",
      ProofType: "PoW",
    },
  ])
);

// Shape of /data/price response: {USD: number}
export const fallbackPrice = (symbol) => {
  const coin = COINS.find((c) => c.symbol === symbol);
  return coin ? { USD: coin.price } : null;
};