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

const AccordionContent = () => (
  <>
    <AccordionItem>
      <AccordionButton>Button One</AccordionButton>
      <AccordionPanel>Panel One</AccordionPanel>
    </AccordionItem>
    <AccordionItem>
      <AccordionButton>Button Two</AccordionButton>
      <AccordionPanel>Panel Two</AccordionPanel>
    </AccordionItem>
  </>
);

describe("<Accordion />", () => {
  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      let { container, getByText } = render(
        <Accordion>
          <AccordionContent />
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

  describe("rendering", () => {
    it("should open panel as specified by defaultIndex", () => {
      let { getByText } = render(
        <Accordion defaultIndex={1}>
          <AccordionContent />
        </Accordion>
      );

      expect(getByText("Panel One")).not.toBeVisible();
      expect(getByText("Panel Two")).toBeVisible();
    });
  });

  describe("user events", () => {
    it("should change panel on click", () => {
      let { getByText } = render(
        <Accordion>
          <AccordionContent />
        </Accordion>
      );

      let panelOneContent = getByText("Panel One");

      expect(panelOneContent).toBeVisible();
      fireEvent.click(getByText("Button Two"));
      expect(panelOneContent).not.toBeVisible();
      expect(getByText("Panel Two")).toBeVisible();
    });

    it("should call onChange", () => {
      let mockOnChange = jest.fn();
      let { getByText } = render(
        <Accordion onChange={mockOnChange}>
          <AccordionContent />
        </Accordion>
      );

      fireEvent.click(getByText("Button Two"));
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("should allow collapsing when collapsible", () => {
      let { getByText } = render(
        <Accordion collapsible>
          <AccordionContent />
        </Accordion>
      );

      let panelOneContent = getByText("Panel One");
      let panelOneButton = getByText("Button One");

      expect(panelOneContent).not.toBeVisible();
      fireEvent.click(panelOneButton);
      expect(panelOneContent).toBeVisible();
      fireEvent.click(panelOneButton);
      expect(panelOneContent).not.toBeVisible();
    });

    it("should allow multiple when multiple", () => {
      let { getByText } = render(
        <Accordion multiple>
          <AccordionContent />
        </Accordion>
      );

      let panelOneContent = getByText("Panel One");
      let panelTwoContent = getByText("Panel Two");

      expect(panelOneContent).toBeVisible();
      expect(panelTwoContent).not.toBeVisible();
      fireEvent.click(getByText("Button Two"));
      expect(panelOneContent).toBeVisible();
      expect(panelTwoContent).toBeVisible();
    });
  });
});
