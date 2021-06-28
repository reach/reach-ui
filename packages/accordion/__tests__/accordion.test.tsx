import * as React from "react";
import { render, fireEvent } from "$test/utils";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";

describe("<Accordion />", () => {
  describe("a11y", () => {
    describe("ARIA attributes", () => {
      let buttons: HTMLElement[];
      let panels: HTMLElement[];
      beforeEach(() => {
        let rendered = renderTestAccordion((props) => (
          <Accordion defaultIndex={0} {...props} />
        ));
        buttons = rendered.buttons;
        panels = rendered.panels;
      });

      it("`role` is set to `region` for panel elements", () => {
        expect(panels[0]).toHaveAttribute("role", "region");
        expect(panels[1]).toHaveAttribute("role", "region");
      });

      it("`aria-controls` for button elements points to the corresponding panel element id", () => {
        for (let i = 0; i < panels.length; i++) {
          let id = panels[i].getAttribute("id");
          expect(buttons[i]).toHaveAttribute("aria-controls", id);
        }
      });

      it("`aria-labelledby` for panel elements points to the corresponding button element id", () => {
        for (let i = 0; i < panels.length; i++) {
          let id = buttons[i].getAttribute("id");
          expect(panels[i]).toHaveAttribute("aria-labelledby", id);
        }
      });

      it("`aria-expanded` is true for the active button element", () => {
        expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
      });

      it("`aria-expanded` is false for the inactive button element", () => {
        expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
      });
    });
  });

  describe("rendering", () => {
    it("passes DOM props to the wrapper", () => {
      let { wrapper } = renderTestAccordion((props) => (
        <Accordion id="test-id" {...props} />
      ));
      expect(wrapper).toHaveAttribute("id", "test-id");
    });

    it("should show the first panel by default", () => {
      let { panels } = renderTestAccordion();
      expect(panels[0]).toBeVisible();
      expect(panels[1]).not.toBeVisible();
    });

    it("should not show any panels by default when using `collapsed` prop", () => {
      let { panels } = renderTestAccordion((props) => (
        <Accordion collapsible {...props} />
      ));
      expect(panels[0]).not.toBeVisible();
      expect(panels[1]).not.toBeVisible();
    });

    it("should show panel specified by defaultIndex", () => {
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

    describe("Internal DOM attributes", () => {
      let wrapper: HTMLElement;
      let items: HTMLElement[];
      let buttons: HTMLElement[];
      let panels: HTMLElement[];
      beforeEach(() => {
        let rendered = renderTestAccordion((props) => (
          <Accordion defaultIndex={0} {...props} />
        ));
        wrapper = rendered.wrapper;
        items = rendered.items;
        buttons = rendered.buttons;
        panels = rendered.panels;
      });

      it("`data-reach-accordion` is present on the wrapper element", () => {
        expect(wrapper).toHaveAttribute("data-reach-accordion");
      });

      it("`data-reach-accordion-item` is present on the item elements", () => {
        for (let item of items) {
          expect(item).toHaveAttribute("data-reach-accordion-item");
        }
      });

      it("`data-reach-accordion-button` is present on the button elements", () => {
        for (let button of buttons) {
          expect(button).toHaveAttribute("data-reach-accordion-button");
        }
      });

      it("`data-reach-accordion-panel` is present on the panel elements", () => {
        for (let panel of panels) {
          expect(panel).toHaveAttribute("data-reach-accordion-panel");
        }
      });

      it("`data-state` is `open` for the active button element", () => {
        expect(buttons[0]).toHaveAttribute("data-state", "open");
      });

      it("`data-state` is `collapsed` for the inactive button element", () => {
        expect(buttons[1]).toHaveAttribute("data-state", "collapsed");
      });

      it("`data-state` is `open` for the active panel element", () => {
        expect(panels[0]).toHaveAttribute("data-state", "open");
      });

      it("`data-state` is `collapsed` for the inactive panel element", () => {
        expect(panels[1]).toHaveAttribute("data-state", "collapsed");
      });

      it("`hidden` is not present for the active panel element", () => {
        expect(panels[0]).not.toHaveAttribute("hidden");
      });

      it("`hidden` is present for the inactive panel element", () => {
        expect(panels[1]).toHaveAttribute("hidden");
      });
    });
  });

  describe("user events", () => {
    describe("when clicking an inactive button", () => {
      it("should change the visible panel", () => {
        let { panels, buttons } = renderTestAccordion();

        expect(panels[1]).not.toBeVisible();
        expect(panels[0]).toBeVisible();

        fireEvent.click(buttons[1]);
        expect(panels[0]).not.toBeVisible();
        expect(panels[1]).toBeVisible();
      });

      it("should call `onChange`", () => {
        let mockOnChange = jest.fn();
        let { buttons } = renderTestAccordion((props) => (
          <Accordion {...props} onChange={mockOnChange} />
        ));

        fireEvent.click(buttons[1]);
        expect(mockOnChange).toHaveBeenCalledTimes(1);
      });
    });

    describe("when navigating between focused buttons", () => {
      // let panels: HTMLElement[];
      let buttons: HTMLElement[];
      beforeEach(() => {
        let rendered = renderTestAccordion();
        // panels = rendered.panels;
        buttons = rendered.buttons;
      });

      it("should move focus to the next focusable button on `ArrowDown` press", () => {
        buttons[0].focus();
        fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
        expect(buttons[1]).toHaveFocus();
      });

      it("should move focus to the previous focusable button on `ArrowUp` press", () => {
        buttons[1].focus();
        fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
        expect(buttons[0]).toHaveFocus();
      });

      it("should move focus to the first focusable button on `Home` press", () => {
        buttons[1].focus();
        fireEvent.keyDown(document.activeElement!, { key: "Home" });
        expect(buttons[0]).toHaveFocus();
      });

      it("should move focus to the last focusable button on `End` press", () => {
        buttons[0].focus();
        fireEvent.keyDown(document.activeElement!, { key: "End" });
        expect(buttons[buttons.length - 1]).toHaveFocus();
      });
    });

    describe("with a fully collapsible accordion", () => {
      it("should allow collapsing the open panel", () => {
        let { panels, buttons } = renderTestAccordion((props) => (
          <Accordion {...props} defaultIndex={0} collapsible />
        ));
        fireEvent.click(buttons[0]);
        expect(panels[0]).not.toBeVisible();
      });
    });

    describe("with a multi-select accordion", () => {
      it("should allow multiple visible panels", () => {
        let { panels, buttons } = renderTestAccordion((props) => (
          <Accordion {...props} defaultIndex={0} multiple />
        ));

        fireEvent.click(buttons[1]);
        expect(panels[0]).toBeVisible();
        expect(panels[1]).toBeVisible();
      });
    });
  });
});

function renderTestAccordion(wrapper?: React.ComponentType<any>) {
  let Outer = wrapper || Accordion;
  let { getByText, getByTestId, container } = render(
    <Outer data-testid="wrapper">
      <AccordionItem data-testid="item1">
        <AccordionButton>Button One</AccordionButton>
        <AccordionPanel>Panel One</AccordionPanel>
      </AccordionItem>
      <AccordionItem data-testid="item2">
        <AccordionButton>Button Two</AccordionButton>
        <AccordionPanel>Panel Two</AccordionPanel>
      </AccordionItem>
      <AccordionItem data-testid="item3">
        <AccordionButton>Button Three</AccordionButton>
        <AccordionPanel>Panel Three</AccordionPanel>
      </AccordionItem>
    </Outer>
  );
  return {
    container,
    wrapper: getByTestId("wrapper"),
    items: [getByTestId("item1"), getByTestId("item2"), getByTestId("item3")],
    buttons: [
      getByText("Button One"),
      getByText("Button Two"),
      getByText("Button Three"),
    ],
    panels: [
      getByText("Panel One"),
      getByText("Panel Two"),
      getByText("Panel Three"),
    ],
  };
}
