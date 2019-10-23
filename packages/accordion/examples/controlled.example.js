import React from "react";
import "../styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel
} from "../src";

export const name = "Controlled";

export const Example = () => {
  const [activeItem, setActiveItem] = React.useState(null);
  const handleAccordionChange = index =>
    setActiveItem(activeItem === index ? null : index);
  return (
    <>
      <button onClick={() => setActiveItem(activeItem === 0 ? null : 0)}>
        {activeItem === 0 ? "Close" : "Open"} Numero Uno
      </button>
      <Accordion index={activeItem} onChange={handleAccordionChange}>
        <AccordionItem>
          <AccordionHeader>You can toggle me</AccordionHeader>
          <AccordionPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem disabled>
          <AccordionHeader>You can't toggle me</AccordionHeader>
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
