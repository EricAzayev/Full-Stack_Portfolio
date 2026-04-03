//Create the top, fixed header unaffected by the Server.
const addHeader = () => {

  const header = document.querySelector("header");
  const headerContainer = document.createElement("div");
  headerContainer.className = "header-container";

  const headerLeft = document.createElement("div");
  headerLeft.className = "header-left";

  const headerLogo = document.createElement("img");
  headerLogo.src = "../world.png";

  const headerTitle = document.createElement("h1");
  headerTitle.textContent = "Global Rising Economies";

  const headerRight = document.createElement("div");
  headerRight.className = "header-right";

  const headerButton = document.createElement("Button");
  headerButton.textContent = "Home";

  headerButton.addEventListener("click", function handleClick(event) {
    window.location = "/";
  });

  headerLeft.appendChild(headerLogo);
  headerLeft.appendChild(headerTitle);
  headerRight.appendChild(headerButton);

  Object.assign(headerLeft.style, {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
  });

  headerContainer.appendChild(headerLeft);
  headerContainer.appendChild(headerRight);

  Object.assign(headerContainer.style, {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  });

  header.appendChild(headerContainer);
}

const lastSegment = window.location.href.split('/').filter(Boolean).pop() || '';
if(lastSegment === '404.html'){
  // do nothing on 404 page
}
else{
  addHeader();
}
