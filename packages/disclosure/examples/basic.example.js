import React from "react";
import Disclosure from "../src/index";
import "../styles.css";

export let name = "Basic";

export let Example = () => (
  <Disclosure buttonLabel={"Friendly message"}>
    <p>
      Here is a friendly message that was hidden away by the disclosure
      component.
    </p>
    <a href="https://reach.tech/ui">
      Here is a link back to the Reach UI site homepage.
    </a>
  </Disclosure>
);
