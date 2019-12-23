import React, { Fragment } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel
} from "@reach/accordion";
import styled from "styled-components";
import "@reach/accordion/styles.css";

export const name = "With Styled Components (TS)";

export function Example() {
  return (
    <Fragment>
      <StyledAccordion>
        <StyledItem>
          <StyledTrigger>You can activate me</StyledTrigger>
          <StyledPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </StyledPanel>
        </StyledItem>
        <StyledItem disabled>
          <StyledTrigger>You can't touch me</StyledTrigger>
          <StyledPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </StyledPanel>
        </StyledItem>
        <StyledItem>
          <StyledTrigger>You can definitely activate me</StyledTrigger>
          <StyledPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </StyledPanel>
        </StyledItem>
        <StyledItem>
          <StyledTrigger>Read me now plz!</StyledTrigger>
          <StyledPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </StyledPanel>
        </StyledItem>
      </StyledAccordion>
    </Fragment>
  );
}

const StyledTrigger = styled(AccordionTrigger)`
  appearance: none;
  background: linear-gradient(to right, #040a84, #0c7ecc);
  border: 0;
  font-size: 16px;
  font-weight: bolder;
  color: white;
  box-shadow: none;
  padding: 0.375em 0.5em;
`;

const StyledPanel = styled(AccordionPanel)`
  padding: 0.75rem;
`;

const StyledItem = styled(AccordionItem)`
  padding: 1px;
  background: #c0c0c0;
  border-width: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  margin-bottom: 0.5rem;
`;

const StyledAccordion = styled(Accordion)``;
