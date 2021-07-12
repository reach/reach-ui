import * as React from "react";
import "@reach/accordion/styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";

let name = "Controlled";

function Example() {
  const [activeItems, setActiveItems] = React.useState([0]);
  function toggleItem(index) {
    if (activeItems.includes(index)) {
      setActiveItems(activeItems.filter((item) => item !== index));
    } else {
      setActiveItems([...activeItems, index].sort());
    }
  }

  return (
    <>
      <button onClick={() => toggleItem(0)}>
        {activeItems.includes(0) ? "Close" : "Open"} Numero Uno
      </button>
      <Accordion index={activeItems} onChange={toggleItem}>
        <AccordionItem>
          <h3>
            <AccordionButton>You can toggle me</AccordionButton>
          </h3>
          <AccordionPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem disabled>
          <h3>
            <AccordionButton>You can't toggle me</AccordionButton>
          </h3>
          <AccordionPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <h3>
            <AccordionButton>You can also toggle me</AccordionButton>
          </h3>
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
}

Example.storyName = name;
export { Example };
