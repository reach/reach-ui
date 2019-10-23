import React from "react";
import "../styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel
} from "../src";
import ExampleForm from "./ExampleForm";

export const name = "No Details Element";

export const Example = () => {
  return (
    <>
      <p>
        By default, Accordion will render the HTML details element with a
        summary element for the trigger. Use itemElement="div" to use a div
        element with a button trigger instead.
      </p>
      <Accordion itemElement="div">
        <AccordionItem>
          <AccordionHeader>You can toggle me</AccordionHeader>
          <AccordionPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader>You can toggle me</AccordionHeader>
          <AccordionPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionHeader>You can also toggle me</AccordionHeader>
          <AccordionPanel>
            <ExampleForm />
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </>
  );
};
