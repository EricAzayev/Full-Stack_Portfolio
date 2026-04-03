const renderGifts = async () => {
  const response = await fetch("/gifts");
  const data = await response.json();
  const mainContent = document.getElementById("main-content");
  if (data) {
    data.map((gift) => {
      const giftCard = document.createElement("div");
      giftCard.className = "gift-card";

      const giftName = document.createElement("h2");
      giftName.textContent = gift.name;

      const giftImage = document.createElement("img");
      giftImage.src = gift.image;
      giftImage.alt = gift.name;
      giftImage.style.width = "100%";
      giftImage.style.maxHeight = "200px";
      giftImage.style.objectFit = "cover";

      const giftPrice = document.createElement("p");
      giftPrice.textContent = `Price: $${gift.pricePoint}`;

      const giftAudience = document.createElement("p");
      giftAudience.textContent = `Audience: ${gift.audience}`;

      const giftDescription = document.createElement("p");
      giftDescription.textContent = gift.description;

      const giftSubmittedBy = document.createElement("p");
      giftSubmittedBy.textContent = `Submitted By: ${
        gift.submittedBy
      } on ${new Date(gift.submittedOn).toLocaleDateString()}`;

      const link = document.createElement("a");
      link.textContent = "Read More ->";
      link.setAttribute("role", "button");
      link.href = `/gifts/${gift.id}`;

      // Append all elements to the card
      giftCard.appendChild(giftImage);
      giftCard.appendChild(giftName);
      giftCard.appendChild(giftPrice);
      giftCard.appendChild(giftAudience);
      giftCard.appendChild(giftDescription);
      giftCard.appendChild(giftSubmittedBy);
      giftCard.appendChild(link);

      Object.assign(giftCard.style, {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        margin: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        maxWidth: "300px",
        background: "#fff",
        display: "inline-block",
        verticalAlign: "top",
      });

      mainContent.appendChild(giftCard);
    });
  } else {
    const sorry = document.createElement("h2");
    sorry.textContent = "No Gifts Available 😞";
    mainContent.appendChild(sorry);
  }
};

const giftsLastSegment = window.location.pathname.split('/').filter(Boolean).pop() || '';

if (giftsLastSegment && giftsLastSegment !== "404.html") {
  window.location.href = "/404.html";
}
else if(giftsLastSegment !== "404.html"){
  renderGifts();
}

// requestedURL = window.location.href.split('/').pop();
// if (requestedURL) {
//   window.location.href = "../404.html";
// }
// else{
//   renderGifts();
// }
