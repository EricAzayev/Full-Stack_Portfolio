import { useState } from "react";
import "./App.css";
import Question from "./assets/Question";
import drinkJson from "./assets/drinks.json";

function App() {
  const [count, setCount] = useState(0);

  const [currentDrink, setCurrentDrink] = useState("");

  const [trueRecipe, setTrueRecipe] = useState({});

  const [correct_temp, setCheckedTemperature] = useState("");
  const [correct_syrup, setCheckedSyrup] = useState("");
  const [correct_milk, setCheckedMilk] = useState("");
  const [correct_blended, setCheckedBlended] = useState("");

  const onNewDrink = () => {
    setCheckedTemperature("");
    setCheckedSyrup("");
    setCheckedMilk("");
    setCheckedBlended("");

    setCount((prevCount) => prevCount + 1);
    const drink = drinkJson[count % drinkJson.length];
    setCurrentDrink(drink.name); // the name must be rendered, not the object itself
    setTrueRecipe(drink.recipe);
  };
  const onCheckAnswer = () => {
    const userRecipe = {
      temperature: inputs.temperature,
      syrup: inputs.syrup,
      milk: inputs.milk,
      blended: inputs.blended,
    };

    if (trueRecipe.temp != inputs["temperature"]) {
      setCheckedTemperature("wrong");
    } else {
      setCheckedTemperature("correct");
    }
    if (trueRecipe.syrup != inputs["syrup"]) {
      setCheckedSyrup("wrong");
    } else {
      setCheckedSyrup("correct");
    }
    if (trueRecipe.milk != inputs["milk"]) {
      setCheckedMilk("wrong");
    } else {
      setCheckedMilk("correct");
    }
    if (trueRecipe.blended != inputs["blended"]) {
      setCheckedBlended("wrong");
    } else {
      setCheckedBlended("correct");
    }
    console.log(trueRecipe);
    console.log(userRecipe);
  };

  const buttonStyle = {
    backgroundColor: "orange",
    color: "white",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  };

  const [inputs, setInputs] = useState({
    temperature: "",
    milk: "",
    syrup: "",
    blended: "",
  });

  const ingredients = {
    temperature: ["hot", "lukewarm", "cold"],
    syrup: ["mocha", "vanilla", "toffee", "maple", "caramel", "other", "none"],
    milk: ["cow", "oat", "goat", "almond", "none"],
    blended: ["yes", "turbo", "no"],
  };

  return (
    <>
      <h2>Hi, I'd like to order a: </h2>
      <div id="drink">
        <h3>{currentDrink}</h3>
        <span className="decorated-bar"></span>
        <button
          type="new-drink-button"
          onClick={onNewDrink}
          style={buttonStyle}
        >
          {"->"}
        </button>
      </div>

      <div id="questions">
        <Question
          handleChange={(e) =>
            setInputs((prevState) => ({
              ...prevState,
              [e.target.name]: e.target.value,
            }))
          }
          label="temperature"
          choices={ingredients["temperature"]}
          checked={inputs["temperature"]}
        />
        <Question
          handleChange={(e) =>
            setInputs((prevState) => ({
              ...prevState,
              [e.target.name]: e.target.value,
            }))
          }
          label="syrup"
          choices={ingredients["syrup"]}
          checked={inputs["syrup"]}
        />
        <Question
          handleChange={(e) =>
            setInputs((prevState) => ({
              ...prevState,
              [e.target.name]: e.target.value,
            }))
          }
          label="milk"
          choices={ingredients["milk"]}
          checked={inputs["milk"]}
        />
        <Question
          handleChange={(e) =>
            setInputs((prevState) => ({
              ...prevState,
              [e.target.name]: e.target.value,
            }))
          }
          label="blended"
          choices={ingredients["blended"]}
          checked={inputs["blended"]}
        />
      </div>
      <button style={buttonStyle} onClick={onCheckAnswer}>
        Check Answer
      </button>
    </>
  );
}

export default App;
