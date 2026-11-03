import React, { Component, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fallbackCoinDetails } from "../fallbackData";
const API_KEY = import.meta.env.VITE_APP_API_KEY;

function CoinDetails() {
  let params = useParams();
  const [fullDetails, setFullDetails] = useState(null);
  useEffect(() => {
    const getCoinDetail = async () => {
      const details = await fetch(
        `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${params.symbol}&tsyms=USD&api_key=` +
          API_KEY
      );
      const description = await fetch(
        `https://min-api.cryptocompare.com/data/all/coinlist?fsym=${params.symbol}&api_key=` +
          API_KEY
      );

      const detailsJson = await details.json();
      const descripJson = await description.json();

      // Empty API responses ({DISPLAY:{}, Data:{}}, e.g. 401 without a key) fall
      // back to the synthetic seed data for known coins.
      const fb = fallbackCoinDetails(params.symbol);
      setFullDetails({
        numbers:
          detailsJson.DISPLAY && Object.keys(detailsJson.DISPLAY).length
            ? detailsJson.DISPLAY
            : fb?.numbers,
        textData:
          descripJson.Data && Object.keys(descripJson.Data).length
            ? descripJson.Data
            : fb?.textData,
      });
    };

    getCoinDetail().catch(console.error);
  }, [params.symbol]);

  return (
    <>
      {fullDetails ? (
        <>
          <h1>{fullDetails.textData[params.symbol].FullName}</h1>
          <img
            className="images"
            src={
              fullDetails.numbers[params.symbol].USD.IMAGEURL.startsWith("http")
                ? fullDetails.numbers[params.symbol].USD.IMAGEURL
                : `https://www.cryptocompare.com${
                    fullDetails.numbers[params.symbol].USD.IMAGEURL
                  }`
            }
            alt={`Small icon for ${params.symbol} crypto coin`}
          />
          <div>{fullDetails.textData[params.symbol].Description}</div>
          <br />
          <div>
            This coin was built with the algorithm{" "}
            {fullDetails.textData[params.symbol].Algorithm}
          </div>
        </>
      ) : (
        <p>Loading...</p> // Display a loading message while data is being fetched
      )}

      <table>
        <tbody>
          <tr>
            <th>Launch Date </th>
            <td> </td>
          </tr>
          <tr>
            <th>Website </th>
            <td> </td>
          </tr>
          <tr>
            <th>Whitepaper </th>
            <td> </td>
          </tr>
          <tr>
            <th>Monetary Symbol </th>
            <td> </td>
          </tr>
          <tr>
            <th>Market </th>
            <td> </td>
          </tr>
          <tr>
            <th>Last Transaction </th>
            <td> </td>
          </tr>
          <tr>
            <th>Last Transaction Value</th>
            <td> </td>
          </tr>
          <tr>
            <th>Volume </th>
            <td> </td>
          </tr>
          <tr>
            <th>Today's Open Price </th>
            <td> </td>
          </tr>
          <tr>
            <th>Highest Price during the Day </th>
            <td> </td>
          </tr>
          <tr>
            <th>Lowest Price during the Day </th>
            <td> </td>
          </tr>
          <tr>
            <th>Change from Previous Day </th>
            <td> </td>
          </tr>
          <tr>
            <th>Market Cap </th>
            <td> </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default CoinDetails;
