import React from "react";
import { RadioGroup, Radio } from "@reach/radio";
import "./example-styles.css";

let name = "Pill Style (TS)";

function Example() {
  return (
    <div>
      <span id="second-fave">Which number is your second favorite?</span>
      <RadioGroup
        className="pill-style"
        aria-labelledby="second-fave"
        name="faves-2"
      >
        <Radio value="one">One</Radio>
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
