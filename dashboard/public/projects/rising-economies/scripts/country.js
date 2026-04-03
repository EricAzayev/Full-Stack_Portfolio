// Renders a single country's attributes onto the country page.
// Expected country object shape:
// {
//   id: 1,
//   name: "United States",
//   population_growth: 0.5,
//   middle_class_growth: 1.5,
//   urbanization_rate: 82,
//   education_index: 90,
//   economic_openness: 78,
//   image: "...optional image url..."
// }

// Function to determine color based on score
function getScoreColor(score) {
  if (score >= 41) return "green";
  if (score >= 37) return "orange";
  return "red";
}

const renderCountry = async () => {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const idStr = pathParts[pathParts.length - 1] || "";

  const countryContent = document.getElementById("country-content");

  function appendMessage(text) {
    const message = document.createElement("h2");
    message.textContent = text;
    if (countryContent) countryContent.appendChild(message);
  }

  let response;
  try {
    response = await fetch("/countries");
  } catch (err) {
    console.error("Fetch failed:", err);
    appendMessage("Failed to load countries.");
    return;
  }

  if (!response.ok) {
    console.error("Bad response:", response.status);
    appendMessage("Failed to load countries.");
    return;
  }

  const data = await response.json();

  const country = data.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, "-") === idStr.toLowerCase()
  );

  function fmtPercent(v) {
    if (v === null || v === undefined || v === "") return "N/A";
    return `${v}%`;
  }

  if (!country) {
    appendMessage("No Country Found 😞");
    return;
  }

  // Image
  const imgEl = document.getElementById("image");
  if (imgEl) {
    if (country.image) {
      imgEl.src = country.image;
      imgEl.alt = country.name || "country image";
      imgEl.style.display = "block";
    } else {
      imgEl.style.display = "none";
    }
  }

  // Country details
  const nameEl = document.getElementById("name");
  if (nameEl) nameEl.textContent = country.name || "(Unknown)";

  const populationEl = document.getElementById("populationGrowth");
  if (populationEl)
    populationEl.textContent =
      "Population growth: " + fmtPercent(country.population_growth);

  const middleClassEl = document.getElementById("middleClassGrowth");
  if (middleClassEl)
    middleClassEl.textContent =
      "Middle class growth: " + fmtPercent(country.middle_class_growth);

  const urbanEl = document.getElementById("urbanizationRate");
  if (urbanEl)
    urbanEl.textContent =
      "Urbanization rate: " + fmtPercent(country.urbanization_rate);

  const educationEl = document.getElementById("educationIndex");
  if (educationEl)
    educationEl.textContent =
      "Education index: " + fmtPercent(country.education_index);

  const opennessEl = document.getElementById("economicOpenness");
  if (opennessEl)
    opennessEl.textContent =
      "Economic openness: " + fmtPercent(country.economic_openness);

  // ✅ Add score
  const score =
    Math.round(
      (country.population_growth * 0.25 +
        country.middle_class_growth * 0.3 +
        country.urbanization_rate * 0.15 +
        country.education_index * 0.15 +
        country.economic_openness * 0.15) *
        100
    ) / 100;

  const scoreEl = document.createElement("p");
  scoreEl.textContent = `Rising Score: ${score}`;
  scoreEl.style.fontWeight = "bold";
  scoreEl.style.color = getScoreColor(score);

  const detailsDiv = document.querySelector(".country-details");
  if (detailsDiv) detailsDiv.appendChild(scoreEl);

  document.title = country.name || "Country";
};

renderCountry();
