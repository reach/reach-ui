import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";
import styled from "styled-components";
import "@reach/accordion/styles.css";

let name = "With Styled Components (TS)";

function Example() {
  return (
    <React.Fragment>
      <StyledAccordion>
        <StyledItem>
          <StyledHeader>
            <StyledButton>You can activate me</StyledButton>
          </StyledHeader>
          <StyledPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </StyledPanel>
        </StyledItem>
        <StyledItem disabled>
          <StyledHeader>
            <StyledButton>You can't touch me</StyledButton>
          </StyledHeader>
          <StyledPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </StyledPanel>
        </StyledItem>
        <StyledItem>
          <StyledHeader>
            <StyledButton>You can definitely activate me</StyledButton>
          </StyledHeader>
          <StyledPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </StyledPanel>
        </StyledItem>
        <StyledItem>
          <StyledHeader>
            <StyledButton>Read me now plz!</StyledButton>
          </StyledHeader>
          <StyledPanel>
            Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
            consectetur pretium, lacus nunc consequat id viverra facilisi ligula
            eleifend, congue gravida malesuada proin scelerisque luctus est
            convallis.
          </StyledPanel>
        </StyledItem>
      </StyledAccordion>
    </React.Fragment>
  );
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

const StyledHeader = styled.h3`
  margin: 0;
`;

const StyledButton = styled(AccordionButton)`
  display: block;
  width: 100%;
  appearance: none;
  background: linear-gradient(to right, #040a84, #0c7ecc);
  border: 0;
  text-align: inherit;
  font: inherit;
  font-size: 16px;
  font-weight: bolder;
  color: white;
  box-shadow: none;
  padding: 0.375em 0.5em;

  &[disabled] {
    opacity: 0.5;
  }

  &:focus {
    outline: 3px solid #0c7ecc;
    outline-offset: 3px;
  }
`;

const StyledPanel = styled(AccordionPanel)`
  padding: 0.75rem;
`;

const StyledItem = styled(AccordionItem)`
  padding: 1px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  margin-bottom: 0.5rem;
`;

const StyledAccordion = styled(Accordion)``;
