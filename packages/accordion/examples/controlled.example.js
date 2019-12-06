import React from "react";
import "@reach/accordion/styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel
} from "@reach/accordion";

export const name = "Controlled";

export const Example = () => {
  const [activeItem, setActiveItem] = React.useState(null);
  return (
    <>
      <button onClick={() => setActiveItem(activeItem === 0 ? null : 0)}>
        {activeItem === 0 ? "Close" : "Open"} Numero Uno
      </button>
      <Accordion
        toggle={true}
        index={activeItem}
        onChange={index => setActiveItem(activeItem === index ? null : index)}
      >
        <AccordionItem>
          <AccordionTrigger>You can toggle me</AccordionTrigger>
          <AccordionPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem disabled>
          <AccordionTrigger>You can't toggle me</AccordionTrigger>
          <AccordionPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionTrigger>You can also toggle me</AccordionTrigger>
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
