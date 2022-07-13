import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";
import "@reach/accordion/styles.css";

let name = "Allow multiple panels";

/*
 * In this example, you should be able to open at many panels as you'd like at
 * once, but all panels cannot be collapsed.
 *
 * Avoid using the region role in circumstances that create landmark
 * region proliferation, e.g., in an accordion that contains more than
 * approximately 6 panels that can be expanded at the same time.
 * We should override the default behavior with `role="presentation"` on the
 * AccordionPanel component.
 */

function Example() {
  return (
    <Accordion multiple>
      <AccordionItem>
        <AccordionButton>Here's some important context</AccordionButton>
        <AccordionPanel role="presentation">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>You don't want to miss this</AccordionButton>
        <AccordionPanel role="presentation">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>Really cool teaser here!</AccordionButton>
        <AccordionPanel role="presentation">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>Don't forget me!</AccordionButton>
        <AccordionPanel role="presentation">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>What about me?</AccordionButton>
        <AccordionPanel role="presentation">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton>Bye for now!</AccordionButton>
        <AccordionPanel role="presentation">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

Example.storyName = name;
export { Example };
