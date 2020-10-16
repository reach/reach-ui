import React from "react";
import VisuallyHidden from "@reach/visually-hidden";

let name = "As a div (TS)";

function Example() {
  return <VisuallyHidden as="div">Hidden Message</VisuallyHidden>;
}

Example.story = { name };
export const Comp = Example;
export default { title: "VisuallyHidden" };
