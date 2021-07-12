import * as React from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";

let name = "Basic";

function Example() {
  return (
    <Disclosure>
      <DisclosureButton>I have a secret</DisclosureButton>
      <DisclosurePanel>
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </DisclosurePanel>
    </Disclosure>
  );
}

Example.storyName = name;
export { Example };
