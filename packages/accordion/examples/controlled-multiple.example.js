import React from "react";
import "../styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel
} from "../src";

export const name = "Controlled (multiple indices)";

export const Example = () => {
  const [activeItems, setActiveItems] = React.useState([]);
  const toggleAllItems = () => {
    if (activeItems.length) {
      setActiveItems([]);
      return;
    }
    setActiveItems([0, 1, 2]);
  };
  const handleAccordionChange = index => {
    if (activeItems.includes(index)) {
      setActiveItems(activeItems.filter(item => item !== index));
    } else {
      setActiveItems([...activeItems, index].sort());
    }
  };
  return (
    <>
      <button onClick={toggleAllItems}>Toggle Items</button>
      <Accordion index={activeItems} onChange={handleAccordionChange}>
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
