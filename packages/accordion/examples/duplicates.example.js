import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel
} from "@reach/accordion";
import "@reach/accordion/styles.css";

export const name = "With Duplicates";

export function Example() {
  return (
    <Accordion>
      <AccordionItem>
        <AccordionTrigger>I hate when people copy what I say</AccordionTrigger>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger>I hate when people copy what I say</AccordionTrigger>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger>I like to be different</AccordionTrigger>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
