import * as React from "react";
import CurrentState from "./CurrentState";

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

export default App;
