import React from "react";
import "@reach/accordion/styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel
} from "@reach/accordion";
import ExampleForm from "./ExampleForm";

export const name = "Basic";

export const Example = () => (
  <Accordion>
    <AccordionItem>
      <AccordionHeader>You can activate me</AccordionHeader>
      <AccordionPanel>
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem disabled>
      <AccordionHeader>You can't touch me</AccordionHeader>
      <AccordionPanel>
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem>
      <AccordionHeader>You can definitely activate me</AccordionHeader>
      <AccordionPanel>
        <ExampleForm />
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);
