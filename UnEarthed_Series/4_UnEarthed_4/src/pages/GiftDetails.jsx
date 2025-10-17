import React, { useState, useEffect } from "react";
import "./GiftDetails.css";
import { useParams } from "react-router-dom";

const GiftDetails = ({ data }) => {
  const [gift, setGift] = useState({
    id: 0,
    name: "",
    pricepoint: "",
    audience: "",
    image: "",
    description: "",
    submittedby: "",
    submittedon: "",
  });
  const { id } = useParams();

  useEffect(() => {
    const loadGift = async () => {
      try {
        // Prefer the client-side `data` (passed from App) when available
        if (data && Array.isArray(data) && data.length > 0) {
          const found = data.find((g) => String(g.id) === String(id));
          if (found) {
            setGift(found);
            return;
          }
        }

        // Fallback: fetch the full gifts list and find by id
        const response = await fetch("/gifts");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        // Response should be JSON (GET /gifts returns JSON);
        const list = await response.json();
        const found = list.find((g) => String(g.id) === String(id));
        if (found) setGift(found);
      } catch (err) {
        console.error("Failed to load gift:", err);
      }
    };

    loadGift();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, id]);

  return (
    <div className="GiftDetails">
      <main id="gift-content" className="gift-info">
        <div className="image-container">
          <img id="image" src={gift.image} alt={gift.name || "Gift image"} />
        </div>
        <div className="gift-details">
          <h2 id="name">{gift.name}</h2>
          <p id="submittedBy">{"Submitted By: " + gift.submittedby}</p>
          <p id="pricePoint">{"Price: " + gift.pricepoint}</p>
          <p id="audience">{"Great For: " + gift.audience}</p>
          <p id="description">{gift.description}</p>
        </div>
      </main>
    </div>
  );
};

export default GiftDetails;
