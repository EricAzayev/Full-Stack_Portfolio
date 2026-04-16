const renderGift = async () => {
  // const requestedID = parseInt(window.location.href.split("/").pop());
  // //const gift = await fetch(`/api/gifts/${requestedID}`).then(res => res.json());
  // const response = await fetch("/gifts");
  // const data = await response.json();

  // const giftContent = document.getElementById("gift-content");
  // let gift = data.find((gift) => gift.id === requestedID);

  // robustly get the last non-empty path segment
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const idStr = pathParts[pathParts.length - 1] || "";
  const requestedID = Number.parseInt(idStr, 10);

  let response;
  try {
    response = await fetch("/gifts");
  } catch (err) {
    console.error("Fetch failed:", err);
    appendMessage("Failed to load gifts.");
    return;
  }

  if (!response.ok) {
    console.error("Bad response:", response.status);
    appendMessage("Failed to load gifts.");
    return;
  }

  const data = await response.json();

  // handle both string and numeric ids and NaN from parseInt
  const gift = Number.isNaN(requestedID)
    ? data.find((g) => String(g.id) === idStr)
    : data.find((g) => Number(g.id) === requestedID);

  const giftContent = document.getElementById("gift-content");

  if (gift) {
    document.getElementById("image").src = gift.image;
    document.getElementById("name").textContent = gift.name;
    document.getElementById("submittedBy").textContent =
      "Submitted by: " + gift.submittedBy;
    document.getElementById("pricePoint").textContent =
      "Price: " + gift.pricePoint;
    document.getElementById("audience").textContent =
      "Great For: " + gift.audience;
    document.getElementById("description").textContent = gift.description;
    document.title = `UnEarthed - ${gift.name}`;
  } else {
    const message = document.createElement("h2");
    message.textContent = "No Gifts Available 😞";
    giftContent.appendChild(message);
  }

  function appendMessage(text) {
    const message = document.createElement("h2");
    message.textContent = text;
    giftContent.appendChild(message);
  }
};

renderGift();
