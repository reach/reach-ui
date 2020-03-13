import React from "react";
import { render, act, fireEvent } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";

describe("<Accordion />", () => {
  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      let { container, getByText } = render(
        <Accordion>
          <AccordionItem>
            <AccordionButton>Button One</AccordionButton>
            <AccordionPanel>Panel One</AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <AccordionButton>Button Two</AccordionButton>
            <AccordionPanel>Panel Two</AccordionPanel>
          </AccordionItem>
        </Accordion>
      );
      let results: AxeResults = null as any;
      await act(async () => {
        results = await axe(container);
      });
      expect(results).toHaveNoViolations();

      act(() => void fireEvent.click(getByText("Button One")));
      await act(async () => {
        results = await axe(container);
      });
      expect(results).toHaveNoViolations();
    });
  });
});
