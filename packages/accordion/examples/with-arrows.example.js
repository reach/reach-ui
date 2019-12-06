import React from "react";
import "@reach/accordion/styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel
} from "@reach/accordion";
import ExampleForm from "./ExampleForm";

export const name = "With Arrows";

export const Example = () => {
  const [activeItem, setActiveItem] = React.useState(null);
  return (
    <Accordion index={activeItem} onChange={index => setActiveItem(index)}>
      <AccordionItem>
        <ArrowHeader active={activeItem === 0}>ABCs</ArrowHeader>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <ArrowHeader active={activeItem === 1}>Easy As</ArrowHeader>
        <AccordionPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <ArrowHeader active={activeItem === 2}>123s</ArrowHeader>
        <AccordionPanel>
          <ExampleForm />
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

function ArrowHeader({ children, active, ...props }) {
  return (
    <AccordionHeader
      as="div"
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <span>{children}</span>
      <ArrowIcon
        aria-hidden
        style={{
          width: 20,
          height: 20,
          transition: "200ms transform",
          transform: `rotate(${active ? "180deg" : "0"})`
        }}
      />
    </AccordionHeader>
  );
}

function ArrowIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 451.847 451.847"
      {...props}
    >
      <path
        d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751
		c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0
		c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
      />
    </svg>
  );
}
