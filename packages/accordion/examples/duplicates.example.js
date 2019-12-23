import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel
} from "@reach/accordion";
import "@reach/accordion/styles.css";

export const name = "With Duplicates";

/*
 * Elements with duplicate text content need a unique identifier for keyboard
 * interactions to work. Not in love with this but it works for now, and use-
 * cases should really be extremely rare. Seriously, why would you have multiple
 * descendants with dupe content on production for most components? What the
 * heck, give us some good content!
 */

export function Example() {
  return (
    <Accordion>
      <AccordionItem index="Duplicate">
        <AccordionTrigger>I hate when people copy what I say</AccordionTrigger>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem index="Duplicate 2">
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
