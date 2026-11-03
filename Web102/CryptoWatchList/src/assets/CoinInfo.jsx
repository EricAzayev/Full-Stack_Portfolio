import React, { useEffect, useState } from "react";
import { fallbackPrice } from "./fallbackData.js";
const API_KEY = import.meta.env.VITE_APP_API_KEY;

const CoinInfo = ({ image, name, symbol }) => {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const getCoinPrice = async () => {
      let quote = null;
      try {
        const response = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD&api_key=` +
            API_KEY
        );
        // On success the API returns {USD: price}; on failure {Data:{}, Err} (no USD field).
        const json = await response.json();
        quote = json.USD ? json : fallbackPrice(symbol);
      } catch (error) {
        console.error(error);
        quote = fallbackPrice(symbol);
      }
      setPrice(quote);
    };
    getCoinPrice();
  }, [symbol]);

  return (
    <>
      <div>
        {price ? ( // rendering only if API call actually returned us data
          <div>
            <li className="main-list" key={symbol}>
              <img
                className="icons"
                src={image.startsWith("http") ? image : `https://www.cryptocompare.com${image}`}
                alt={`Small icon for ${name} crypto coin`}
              />
              {name} <span className="tab"></span> ${price.USD} USD
            </li>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default CoinInfo;
