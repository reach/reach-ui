import React from "react";
import {
  Disclosure,
  DisclosureTrigger,
  DisclosurePanel
} from "@reach/disclosure";
import "@reach/disclosure/styles.css";

export const name = "Basic";

export const Example = () => (
  <Disclosure>
    <DisclosureTrigger>I have a secret</DisclosureTrigger>
    <DisclosurePanel>
      Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
      pretium, lacus nunc consequat id viverra facilisi ligula eleifend, congue
      gravida malesuada proin scelerisque luctus est convallis.
    </DisclosurePanel>
  </Disclosure>
);
