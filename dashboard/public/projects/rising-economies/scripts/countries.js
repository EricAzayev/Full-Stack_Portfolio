// Renders country cards to the #main-content element.
// Expected country object shape:
// {
//   name: "United States",
//   population_growth: 0.5,         // percent (e.g. 0.5 means 0.5%)
//   middle_class_growth: 1.5,       // percent
//   urbanization_rate: 82,          // percent
//   education_index: 90,            // percent (0-100)
//   economic_openness: 78           // percent (0-100)
// }
const weights = {
  population_growth: 0.25,
  middle_class_growth: 0.3,
  urbanization_rate: 0.15,
  education_index: 0.15,
  economic_openness: 0.15,
};

// Normalize a value to 0–100 given min and max
const normalize = (val, min, max) => {
  if (max === min) return 50; // avoid divide-by-zero
  return ((val - min) / (max - min)) * 100;
};

const renderCountries = async () => {
  const response = await fetch("/countries");
  const data = await response.json();
  const mainContent = document.getElementById("main-content");

  if (data && Array.isArray(data) && data.length > 0) {
    // Compute min and max for normalization across dataset
    const mins = {};
    const maxs = {};
    Object.keys(weights).forEach((key) => {
      mins[key] = Math.min(...data.map((c) => c[key]));
      maxs[key] = Math.max(...data.map((c) => c[key]));
    });

    // Compute score for each country
    data.forEach((country) => {
      let score = 0;
      Object.keys(weights).forEach((key) => {
        const normVal = normalize(country[key], mins[key], maxs[key]);
        score += normVal * weights[key];
      });
      country.rising_score = Math.round(score * 100) / 100; // 2 decimals
    });

    // Sort descending by rising_score
    data.sort((a, b) => b.rising_score - a.rising_score);

    // Render each country card
    data.forEach((country) => {
      const card = document.createElement("div");
      card.className = "country-card";

      const name = document.createElement("h2");
      name.textContent = country.name || "(Unknown)";

      const score = document.createElement("p");
      score.textContent = `Rising Score: ${country.rising_score}`;

      const popGrow = document.createElement("p");
      popGrow.textContent = `Population growth: ${country.population_growth}%`;

      const middleGrow = document.createElement("p");
      middleGrow.textContent = `Middle class growth: ${country.middle_class_growth}%`;

      const urban = document.createElement("p");
      urban.textContent = `Urbanization rate: ${country.urbanization_rate}%`;

      const education = document.createElement("p");
      education.textContent = `Education index: ${country.education_index}%`;

      const openness = document.createElement("p");
      openness.textContent = `Economic openness: ${country.economic_openness}%`;

      // Append elements to card
      card.appendChild(name);
      card.appendChild(score);
      card.appendChild(popGrow);
      card.appendChild(middleGrow);
      card.appendChild(urban);
      card.appendChild(education);
      card.appendChild(openness);

      Object.assign(card.style, {
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

      const link = document.createElement("a");
      link.href = `/countries/${encodeURIComponent(country.name)}`;
      link.style.textDecoration = "none"; // remove underline
      link.style.color = "inherit"; // keep text colors

      link.appendChild(card);

      mainContent.appendChild(link);
    });
  } else {
    const sorry = document.createElement("h2");
    sorry.textContent = "No countries available 😞";
    mainContent.appendChild(sorry);
  }
};

const countriesLastSegment =
  window.location.pathname.split("/").filter(Boolean).pop() || "";

if (countriesLastSegment && countriesLastSegment !== "404.html") {
  window.location.href = "/404.html";
} else if (countriesLastSegment !== "404.html") {
  renderCountries();
}
