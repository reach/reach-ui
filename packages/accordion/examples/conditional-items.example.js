import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  AccordionState
} from "@reach/accordion";
import ExampleForm from "./ExampleForm";
import "@reach/accordion/styles.css";

export const name = "Conditional Items";

export function Example() {
  /*
   * Simulate the menu list changing while the user is navigating.
   * This is always super annoying and should be avoided at all costs.
   * However, in the event that it does happen, we should at least ensure that
   * the selected item doesn't change right before the user selects with a
   * keyboard. Not much we can do to prevent mouse clicks from selecting a new
   * or wrong item here, hence why devs should avoid this behavior!
   */
  const [disappearingItem, setDisappearingItem] = useState(false);
  useEffect(() => {
    let interval = window.setInterval(() => {
      setDisappearingItem(!disappearingItem);
    }, 3000);
    return () => void window.clearInterval(interval);
  }, [disappearingItem]);
  return (
    <Accordion>
      <AccordionItem>
        <AccordionTrigger>Hello</AccordionTrigger>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger>How are you?</AccordionTrigger>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      {disappearingItem && (
        <AccordionItem>
          <AccordionTrigger>Whoa! Where did I come from?</AccordionTrigger>
          <AccordionPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
      )}
      <AccordionItem>
        <AccordionTrigger>Have a great day!</AccordionTrigger>
        <AccordionPanel>
          <ExampleForm />
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionState />
    </Accordion>
  );
}
