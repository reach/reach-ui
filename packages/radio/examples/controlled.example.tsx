import React, { useState } from "react";
import { RadioGroup, Radio } from "@reach/radio";
import "@reach/radio/styles.css";

let name = "Controlled (TS)";

function Example() {
  let [value, setValue] = useState("one");
  return (
    <div>
      <h3 id="second-fave">Which number is your second favorite?</h3>
      <RadioGroup
        value={value}
        onChange={setValue}
        aria-labelledby="second-fave"
        name="faves-2"
      >
        <Radio value="one">One</Radio>
        <Radio disabled value="two">
          Two
        </Radio>
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
