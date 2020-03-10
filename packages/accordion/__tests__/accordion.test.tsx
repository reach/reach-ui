import React from "react";
import { render, act, fireEvent } from "$test/utils";
import { axe } from "jest-axe";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionProps,
} from "@reach/accordion";

describe("<Accordion />", () => {
  it("should not have basic a11y issues", async () => {
    let { container, getByTestId } = render(<BasicAccordion />);
    let results = await axe(container);
    expect(results).toHaveNoViolations();

    act(() => void fireEvent.click(getByTestId("button-1")));
    let newResults = await axe(container);
    expect(newResults).toHaveNoViolations();
  });
});

function BasicAccordion(props: Partial<Omit<AccordionProps, "ref">>) {
  return (
    <Accordion {...props}>
      <AccordionItem>
        <AccordionButton data-testid="button-1">
          You can activate me
        </AccordionButton>
        <AccordionPanel data-testid="panel-1">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem disabled>
        <AccordionButton data-testid="button-2">
          You can't touch me
        </AccordionButton>
        <AccordionPanel data-testid="panel-2">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
      <AccordionItem>
        <AccordionButton data-testid="button-3">
          You can definitely activate me
        </AccordionButton>
        <AccordionPanel data-testid="panel-3">
          Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
          pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
          congue gravida malesuada proin scelerisque luctus est convallis.
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
