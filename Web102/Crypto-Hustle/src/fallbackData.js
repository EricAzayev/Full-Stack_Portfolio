// Synthetic seed data mirroring the CryptoCompare min-api response shapes.
// Used when the live API fails or VITE_APP_API_KEY is missing, so the demo
// renders normally instead of an empty screen. Values are plausible, not real.
const COINS = [
  {
    symbol: "BTC",
    id: 1182,
    name: "Bitcoin",
    price: 118742.53,
    algorithm: "SHA-256",
    blurb:
      "Bitcoin is a decentralized digital currency that can be transferred on the peer-to-peer Bitcoin network without an intermediary. Transactions are verified through cryptography and recorded in a public distributed ledger called a blockchain.",
  },
  {
    symbol: "ETH",
    id: 7605,
    name: "Ethereum",
    price: 4218.9,
    algorithm: "Ethash",
    blurb:
      "Ethereum is a decentralized, open-source blockchain platform with smart contract functionality. Ether (ETH) is the native cryptocurrency of the platform and is used to pay for transaction execution.",
  },
  {
    symbol: "SOL",
    id: 130856,
    name: "Solana",
    price: 209.41,
    algorithm: "Proof of History",
    blurb:
      "Solana is a high-performance blockchain supporting fast, low-fee smart contracts and decentralized applications. It uses a proof-of-history clock combined with proof of stake for consensus.",
  },
  {
    symbol: "ADA",
    id: 783734,
    name: "Cardano",
    price: 0.7623,
    algorithm: "Ouroboros",
    blurb:
      "Cardano is a proof-of-stake blockchain platform founded on peer-reviewed research. Its native token, Ada, is named after computing pioneer Ada Lovelace.",
  },
  {
    symbol: "XRP",
    id: 1364,
    name: "XRP",
    price: 2.47,
    algorithm: "XRP Ledger Consensus",
    blurb:
      "XRP is the native digital asset of the XRP Ledger, a blockchain designed for fast, low-cost international payments and settlement between financial institutions.",
  },
  {
    symbol: "USDT",
    id: 25799,
    name: "Tether",
    price: 1.0,
    algorithm: "N/A",
    blurb:
      "Tether (USDT) is a stablecoin pegged to the US dollar, issued as a token on multiple blockchains and widely used for trading and settlement.",
  },
  {
    symbol: "DOGE",
    id: 443,
    name: "Dogecoin",
    price: 0.2418,
    algorithm: "Scrypt",
    blurb:
      "Dogecoin is an open-source peer-to-peer cryptocurrency originally created as a lighthearted meme project that has grown into one of the most traded coins.",
  },
  {
    symbol: "LINK",
    id: 1150925,
    name: "Chainlink",
    price: 25.36,
    algorithm: "N/A",
    blurb:
      "Chainlink is a decentralized oracle network that connects smart contracts to real-world data feeds, events and payment methods across blockchains.",
  },
];

const icon = (symbol) =>
  `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;

// Shape of /data/top/totaltoptiervol?tsym=usd response: array of {CoinInfo, RAW, DISPLAY}
export const fallbackCoinList = COINS.map((coin) => ({
  CoinInfo: {
    Id: String(coin.id),
    Name: coin.symbol,
    FullName: coin.name,
    Internal: coin.symbol,
    ImageUrl: icon(coin.symbol),
    Url: `/coins/${coin.symbol.toLowerCase()}/overview`,
    Algorithm: coin.algorithm,
    ProofType: "PoW",
    Rating: { Weiss: { Rating: 4 } },
  },
  RAW: { USD: { PRICE: coin.price, IMAGEURL: icon(coin.symbol) } },
  DISPLAY: { USD: { PRICE: coin.price.toFixed(2), IMAGEURL: icon(coin.symbol) } },
}));

// Shape of /data/price response: {USD: number}
export const fallbackPrice = (symbol) => {
  const coin = COINS.find((c) => c.symbol === symbol);
  return coin ? { USD: coin.price } : null;
};

// Shape of /data/pricemultifull ({DISPLAY}) + /data/all/coinlist?fsym= ({Data})
export const fallbackCoinDetails = (symbol) => {
  const coin = COINS.find((c) => c.symbol === symbol);
  if (!coin) return null;
  return {
    numbers: {
      [symbol]: {
        USD: { IMAGEURL: icon(symbol), PRICE: coin.price },
      },
    },
    textData: {
      [symbol]: {
        Name: symbol,
        Symbol: symbol,
        FullName: coin.name,
        Algorithm: coin.algorithm,
        Description: coin.blurb,
        ImageUrl: icon(symbol),
        Url: `/coins/${coin.symbol.toLowerCase()}/overview`,
      },
    },
  };
};