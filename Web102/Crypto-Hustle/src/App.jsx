import { useState, useEffect } from "react";
import CoinInfo from "./components/CoinInfo";
import { fallbackCoinList } from "./fallbackData";
import "./App.css";

const API_KEY = import.meta.env.VITE_APP_API_KEY;

function App() {
  const [coinList, setCoinList] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchAllCoinData = async () => {
      // Below we are focusing our query to only 10 coins which have the top trading volume.
      // This will reduce our query burden, thus preventing us from hitting API rate limits.
      let coins = [];
      try {
        const coinData = await fetch(
          "https://min-api.cryptocompare.com/data/top/totaltoptiervol?limit=5&assetClass=ALL&tsym=usd&api_key=" +
            API_KEY
        );
        // The API returns {Data: [coins]} on success, {Data:{}, Err} on failure.
        coins = (await coinData.json()).Data;
      } catch (error) {
        console.error(error);
      }
      if (Array.isArray(coins) && coins.length > 0) {
        setCoinList(coins);
      } else {
        setCoinList(fallbackCoinList);
      }
      // coinList is now set to an array of objects. Example object:
      // { CoinInfo: {
      //    Id:"1182"
      //    Name:"BTC"
      //    FullName:"Bitcoin"
      //    Internal:"BTC"
      //    ImageUrl:"/media/37746251/btc.png"
      //    Url:"/coins/btc/overview"
      //    Algorithm:"SHA-256"
      //    ProofType:"PoW"
      //    Rating:{
      //    Weiss:{}
      // }, ...}
    };
    fetchAllCoinData();
  }, []);

  const searchItems = (searchValue) => {
    setSearchInput(searchValue);
    if (searchValue !== "") {
      const filteredData = coinList.filter((item) => {
        const searchedAttributes = [
          item.CoinInfo.Name,
          item.CoinInfo.FullName,
        ].map((attr) => attr.toLowerCase());
        return searchedAttributes.some((attr) => attr.includes(searchValue));
      });
      setFilteredResults(filteredData);
    } else {
      setFilteredResults(coinList);
    }
  };

  return (
    <div className="whole-page">
      <h1>My Crypto List</h1>
      <input
        type="text"
        placeholder="Search..."
        onChange={(inputString) => searchItems(inputString.target.value)}
      />
      <ul>
        {searchInput.length > 0
          ? filteredResults?.map((coin) => (
              <CoinInfo
                key={coin.CoinInfo.Name}
                image={coin.CoinInfo.ImageUrl}
                name={coin.CoinInfo.FullName}
                symbol={coin.CoinInfo.Name}
              />
            ))
          : coinList?.map((coin) => (
              <CoinInfo
                key={coin.CoinInfo.Name}
                image={coin.CoinInfo.ImageUrl}
                name={coin.CoinInfo.FullName}
                symbol={coin.CoinInfo.Name}
              />
            ))}
      </ul>
    </div>
  );
}

export default App;
