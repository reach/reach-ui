import React from "react";
import "@reach/accordion/styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel
} from "@reach/accordion";
import ExampleForm from "./ExampleForm";

export const name = "Basic";

export const Example = () => (
  <Accordion>
    <AccordionItem>
      <AccordionTrigger>You can activate me</AccordionTrigger>
      <AccordionPanel>
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem disabled>
      <AccordionTrigger>You can't touch me</AccordionTrigger>
      <AccordionPanel>
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </AccordionPanel>
    </AccordionItem>
    <AccordionItem>
      <AccordionTrigger>You can definitely activate me</AccordionTrigger>
      <AccordionPanel>
        <ExampleForm />
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);
