import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // for the link to detail view
import { fallbackPrice } from "../fallbackData";
import "./CoinInfo.css";

const API_KEY = import.meta.env.VITE_APP_API_KEY;

function CoinInfo({ image, name, symbol }) {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const getCoinPrice = async () => {
      let quote = null;
      try {
        let response = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD&api_key=${API_KEY}`
        );
        // On success the API returns {USD: price}; on failure {Data:{}, Err} (no USD field).
        const responseJson = await response.json();
        quote = responseJson.USD ? responseJson : fallbackPrice(symbol);
      } catch (error) {
        console.error(error);
        quote = fallbackPrice(symbol);
      }
      setPrice(quote);
    };
    getCoinPrice();
  }, []);

  return (
    <div>
      {price && (
        <div className="main-list" key={symbol}>
          <img
            className="icons"
            src={image.startsWith("http") ? image : `https://www.cryptocompare.com${image}`}
            alt={`Small icon for ${name} crypto coin`}
          />
          {`${name} (${symbol})`}
          <span className="tab">${price.USD} USD</span>
          <Link
            style={{ color: "Blue" }}
            to={`/coinDetails/${symbol}`}
            key={symbol}
          >
            {name} <span className="tab"></span> ${price.USD} USD
          </Link>
        </div>
      )}
    </div>
  );
}

export default CoinInfo;
