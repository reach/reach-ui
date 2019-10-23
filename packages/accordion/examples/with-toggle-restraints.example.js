import React from "react";
import "../styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel
} from "../src";
import ExampleForm from "./ExampleForm";

export const name = "With Toggle Restraints";

export const Example = () => (
  <Accordion allowMultiple={false} allowToggle={false}>
    <AccordionItem>
      <AccordionHeader>You can open me</AccordionHeader>
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
      <AccordionHeader>
        You can only close me by opening another
      </AccordionHeader>
      <AccordionPanel>
        <ExampleForm />
        Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
        pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
        congue gravida malesuada proin scelerisque luctus est convallis.
      </AccordionPanel>
    </AccordionItem>
  </Accordion>
);
