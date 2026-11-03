import { useState, useEffect } from "react";
import "./App.css";
import CoinInfo from "./assets/CoinInfo.jsx";
import { fallbackCoinMap } from "./assets/fallbackData.js";

const API_KEY = import.meta.env.VITE_APP_API_KEY;
const url =
  "https://min-api.cryptocompare.com/data/all/coinlist?&api_key" + API_KEY;

function App() {
  const [list, setList] = useState(0);

  useEffect(() => {
    const fetchAllCoinData = async () => {
      console.log("ran fetchAll!");
      // The API returns {Data: {SYMBOL: coin}} on success, {Data:{}, Err} on failure.
      let data;
      try {
        const response = await fetch(url);
        data = (await response.json()).Data;
      } catch (error) {
        console.error(error);
      }
      setList(
        data && Object.keys(data).length ? { Data: data } : { Data: fallbackCoinMap }
      );
    };
    fetchAllCoinData();
  }, []);

  return (
    <>
      <div className="whole-page">
        <h1>My Crypto List</h1>
        <ul>
          {list &&
            Object.entries(list.Data).map(([coin]) =>
              list.Data[coin].PlatformType === "blockchain" ? (
                <CoinInfo
                  image={list.Data[coin].ImageUrl}
                  name={list.Data[coin].FullName}
                  symbol={list.Data[coin].Symbol}
                />
              ) : (
                <h1>BAD</h1>
              )
            )}
          ;
        </ul>
      </div>
    </>
  );
}

export default App;
