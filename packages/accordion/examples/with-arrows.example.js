import * as React from "react";
import "@reach/accordion/styles.css";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";
import styled from "styled-components";

let name = "With Arrows";

function Example() {
  const [activeItem, setActiveItem] = React.useState(null);
  return (
    <StyledAccordion
      index={activeItem}
      onChange={(index) => setActiveItem(index)}
    >
      <StyledItem>
        <ArrowButton active={activeItem === 0}>ABCs</ArrowButton>
        <StyledPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </StyledPanel>
      </StyledItem>
      <StyledItem>
        <ArrowButton active={activeItem === 1}>Easy As</ArrowButton>
        <StyledPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </StyledPanel>
      </StyledItem>
      <StyledItem>
        <ArrowButton active={activeItem === 2}>123s</ArrowButton>
        <StyledPanel>
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </StyledPanel>
      </StyledItem>
    </StyledAccordion>
  );
}

Example.storyName = name;
export { Example };

function ArrowButton({ children, active, ...props }) {
  return (
    <StyledHeader {...props}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <StyledHeading>
          <StyledButton>{children}</StyledButton>
        </StyledHeading>
        <StyledArrowWrapper>
          <StyledIcon active={active} aria-hidden />
        </StyledArrowWrapper>
      </span>
    </StyledHeader>
  );
}

function ArrowIcon({ active, ...props }) {
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

const StyledButton = styled(AccordionButton)`
  display: block;
  width: 100%;
  appearance: none;
  background: 0;
  border: 0;
  text-align: inherit;
  font: inherit;
  font-size: 16px;
  font-weight: bolder;
  color: inherit;
  box-shadow: none;
  padding: 0.675em 0.875em;
`;

const StyledHeader = styled.div`
  width: 100%;
  background: linear-gradient(to bottom, darkslategray, slategray);
  color: white;

  &[data-disabled] {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const StyledPanel = styled(AccordionPanel)`
  padding: 0.875em;
`;

const StyledItem = styled(AccordionItem)`
  background: #ffffff;
  border: 1px solid lightsteelblue;
  margin-bottom: 1rem;
  box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  overflow: hidden;
`;

const StyledAccordion = styled(Accordion)``;

const StyledHeading = styled.h3`
  display: block;
  width: 100%;
  font: inherit;
  margin: 0;
`;

const StyledArrowWrapper = styled.div`
  padding: 0.675em 0.875em;
`;

const StyledIcon = styled(ArrowIcon)`
  width: 1rem;
  height: 1rem;
  transition: ${(props) => (props.active ? "600" : "500")}ms transform ease-out;
  transform: rotate(${(props) => (props.active ? "2.5turn" : "0")});
  fill: #fff;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
