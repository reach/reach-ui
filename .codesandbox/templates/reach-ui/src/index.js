import React from "react";
import ReactDOM from "react-dom";
import CurrentState from "./CurrentState";

import "./styles.css";
import "./reach-styles";

function App() {
  return (
    <div className="App">
      <h1>Reach UI Template</h1>
      <div style={{ margin: "1rem 0" }}>{/* Add your code here. */}</div>
      <hr />
      <CurrentState
        {
          ...{
            /* put any props/state here to inspect on the screen */
          }
        }
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
