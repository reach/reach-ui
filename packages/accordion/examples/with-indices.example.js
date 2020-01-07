import React, { useState } from "react";
import "@reach/accordion/styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel
} from "@reach/accordion";

export const name = "With Indices";

const data = [
  {
    id: 1,
    trigger: `You can toggle me`,
    body: `<p>Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
    pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
    congue gravida malesuada proin scelerisque luctus est convallis.</p>`
  },
  {
    id: 2,
    trigger: `You can't toggle me`,
    body: `<p>Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
    pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
    congue gravida malesuada proin scelerisque luctus est convallis.</p>`,
    props: { disabled: true }
  },
  {
    id: 3,
    trigger: `You can toggle me`,
    body: `<p>Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
    pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
    congue gravida malesuada proin scelerisque luctus est convallis.</p>`
  }
];

export const Example = () => {
  const [activeItems, setActiveItems] = useState([0]);
  function toggleItem(index) {
    if (activeItems.includes(index)) {
      setActiveItems(activeItems.filter(item => item !== index));
    } else {
      setActiveItems([...activeItems, index].sort());
    }
  }

  return (
    <Accordion toggle={true} index={activeItems} onChange={toggleItem}>
      {data.map(({ trigger, body, id, props = {} }, index) => (
        <AccordionItem index={index} key={id} {...props}>
          <AccordionTrigger>{trigger}</AccordionTrigger>
          <AccordionPanel dangerouslySetInnerHTML={{ __html: body }} />
        </AccordionItem>
      ))}
    </Accordion>
  );
};
