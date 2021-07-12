import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionButtonProps,
  useAccordionContext,
  useAccordionItemContext,
} from "@reach/accordion";
import { action } from "@storybook/addon-actions";
import "@reach/accordion/styles.css";

let name = "With context hooks (TS)";

function MyAccordionButton(
  props: AccordionButtonProps & React.ComponentPropsWithoutRef<"button">
) {
  let { id } = useAccordionContext();
  let { isExpanded } = useAccordionItemContext();
  return (
    <h3 style={{ margin: 0 }}>
      <AccordionButton
        {...props}
        data-parentid={id}
        style={{
          border: "2px solid",
          borderColor: isExpanded ? "crimson" : "black",
        }}
      />
    </h3>
  );
}

function Example() {
  return (
    <Accordion onChange={action(`Selecting panel`)}>
      <AccordionItem>
        <MyAccordionButton>You can activate me</MyAccordionButton>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <MyAccordionButton>You can expand me!</MyAccordionButton>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <MyAccordionButton>You can definitely open me</MyAccordionButton>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////
