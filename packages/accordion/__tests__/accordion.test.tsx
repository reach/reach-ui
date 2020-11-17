import * as React from "react";
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

    it("accepts a custom ID", () => {
      let { getByTestId } = render(
        <Accordion data-testid="wrapper" id="test-id">
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

      expect(getByTestId("wrapper")).toHaveAttribute("id", "test-id");
    });

    it("sets the correct state-related aria attributes on toggle", () => {
      let { getByText } = render(
        <Accordion defaultIndex={0}>
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

      expect(getByText("Button One")).toHaveAttribute("aria-expanded", "true");
      expect(getByText("Panel One")).toHaveAttribute("data-state", "open");

      expect(getByText("Button Two")).toHaveAttribute("aria-expanded", "false");
      expect(getByText("Panel Two")).toHaveAttribute("data-state", "collapsed");
      expect(getByText("Panel Two")).toHaveAttribute("hidden");
    });
  });

  describe("rendering", () => {
    it("should open the first panel by default", () => {
      let { getByText } = render(
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

      expect(getByText("Panel One")).toBeVisible();
      expect(getByText("Panel Two")).not.toBeVisible();
    });

    it("should not open any panels by default when using collapsed", () => {
      let { getByText } = render(
        <Accordion collapsible={true}>
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

      expect(getByText("Panel One")).not.toBeVisible();
      expect(getByText("Panel Two")).not.toBeVisible();
    });

    it("should open panel as specified by defaultIndex", () => {
      let { getByText } = render(
        <Accordion defaultIndex={1}>
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

      expect(getByText("Panel One")).not.toBeVisible();
      expect(getByText("Panel Two")).toBeVisible();
    });

    it("assigns the correct @reach data attributes", () => {
      let { getByTestId, getByText } = render(
        <Accordion data-testid="wrapper">
          <AccordionItem data-testid="item1">
            <AccordionButton>Button One</AccordionButton>
            <AccordionPanel>Panel One</AccordionPanel>
          </AccordionItem>
        </Accordion>
      );
      expect(getByTestId("wrapper")).toHaveAttribute("data-reach-accordion");
      expect(getByTestId("item1")).toHaveAttribute("data-reach-accordion-item");
      expect(getByText("Button One")).toHaveAttribute(
        "data-reach-accordion-button"
      );
      expect(getByText("Panel One")).toHaveAttribute(
        "data-reach-accordion-panel"
      );
    });
  });

  describe("user events", () => {
    it("should change panel on click", () => {
      let { getByText } = render(
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

      fireEvent.click(getByText("Button Two"));
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it("should allow collapsing when collapsible", () => {
      let { getByText } = render(
        <Accordion collapsible>
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
