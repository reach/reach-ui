import React from "react";
import { RadioGroup, Radio } from "@reach/radio";
import "./example-styles.css";

let name = "Basic (TS)";

function Example() {
  return (
    <div>
      <h2>HTML input</h2>
      <h3 id="fave">Which number is your favorite?</h3>
      <fieldset aria-labelledby="fave" style={{ border: 0, padding: 0 }}>
        <input disabled type="radio" id="fave-one" name="faves-1" value="one" />
        <label htmlFor="fave-one">One</label>

        <input type="radio" id="fave-two" name="faves-1" value="two" />
        <label htmlFor="fave-two">Two</label>

        <input type="radio" id="fave-three" name="faves-1" value="three" />
        <label htmlFor="fave-three">Three</label>
      </fieldset>
      <hr style={{ margin: "20px 0" }} />
      <h2>@reach/radio</h2>
      <h3 id="second-fave">Which number is your second favorite?</h3>
      <RadioGroup aria-labelledby="second-fave" name="faves-2">
        <Radio disabled value="one">
          One
        </Radio>
        <Radio value="two">Two</Radio>
        <Radio value="three">Three</Radio>
      </RadioGroup>
    </div>
  );
}

/*

*/

Example.story = { name };
export const Comp = Example;
export default { title: "Radio" };
