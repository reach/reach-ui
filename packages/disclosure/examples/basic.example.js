import React from "react";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosurePanel
} from "@reach/disclosure";

let name = "Basic";

function Example() {
  return (
    <Disclosure>
      <DisclosureTrigger>I have a secret</DisclosureTrigger>
      <DisclosurePanel>
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </DisclosurePanel>
    </Disclosure>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "Disclosure" };
