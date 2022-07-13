import * as React from "react";
import "@reach/accordion/styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";

let name = "Read Only";

function Example() {
  return (
    <Accordion readOnly defaultIndex={1}>
      <AccordionItem>
        <h3>
          <AccordionButton>Good Luck!</AccordionButton>
        </h3>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h3>
          <AccordionButton>NOPE!</AccordionButton>
        </h3>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <h3>
          <AccordionButton>Sorry, Charlie</AccordionButton>
        </h3>
        <AccordionPanel>
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
