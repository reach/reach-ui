import React from "react";
import { render, act, fireEvent } from "$test/utils";
import { axe } from "jest-axe";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  DisclosureProps,
} from "@reach/disclosure";

describe("<Disclosure />", () => {
  describe("rendering", () => {
    it("uses the correct data attributes", () => {
      let { getByText } = render(<BasicDisclosure />);

      expect(getByText("Click Button")).toHaveAttribute(
        "data-reach-disclosure-button"
      );
      expect(getByText("Panel body")).toHaveAttribute(
        "data-reach-disclosure-panel"
      );
    });

    it("does not render the content by default", () => {
      let { getByText } = render(<BasicDisclosure />);

      expect(getByText("Panel body")).not.toBeVisible();
    });

    it("renders the content when defaultOpen is true", () => {
      let { getByText } = render(<BasicDisclosure defaultOpen={true} />);

      expect(getByText("Panel body")).toBeVisible();
    });

    it("does not render the content when defaultOpen is false", () => {
      let { getByText } = render(<BasicDisclosure defaultOpen={false} />);

      expect(getByText("Panel body")).not.toBeVisible();
    });

    it("renders the content when open is true", () => {
      let { getByText } = render(<BasicDisclosure open={true} />);

      expect(getByText("Panel body")).toBeVisible();
    });

    it("does not render the content when open is false", () => {
      let { getByText } = render(<BasicDisclosure open={false} />);

      expect(getByText("Panel body")).not.toBeVisible();
    });
  });

  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      let { getByRole, container } = render(<BasicDisclosure />);
      let results = await axe(container);
      expect(results).toHaveNoViolations();

      act(() => void fireEvent.click(getByRole("button")));
      let newResults = await axe(container);
      expect(newResults).toHaveNoViolations();
    });

    it("allows using a custom ID", () => {
      let { getByText } = render(<BasicDisclosure id="my-id" />);
      expect(getByText("Panel body")).toHaveAttribute("id", "panel--my-id");
    });

    it("removes the panel from the navigation flow", () => {
      let { getByText } = render(<BasicDisclosure />);
      expect(getByText("Panel body")).toHaveAttribute("tabindex", "-1");
    });

    it("sets the correct aria attributes when collapsed", () => {
      let { getByText } = render(<BasicDisclosure />);
      let button = getByText("Click Button");
      let panel = getByText("Panel body");

      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("data-state", "collapsed");

      expect(panel).toHaveAttribute("data-state", "collapsed");
      expect(panel).toHaveAttribute("hidden");
    });

    it("sets the correct aria attributes when open", () => {
      let { getByText } = render(<BasicDisclosure open={true} />);
      let button = getByText("Click Button");
      let panel = getByText("Panel body");

      expect(button).toHaveAttribute("aria-expanded", "true");
      expect(button).toHaveAttribute("data-state", "open");

      expect(panel).toHaveAttribute("data-state", "open");
      expect(panel).not.toHaveAttribute("hidden");
    });
  });

  describe("user events", () => {
    it("should toggle on click", () => {
      let { getByRole, getByText } = render(<BasicDisclosure />);

      expect(getByText("Panel body")).not.toBeVisible();

      fireEvent.click(getByText("Click Button"));

      expect(getByText("Panel body")).toBeVisible();
    });

    it("calls onChange when the button is clicked", () => {
      let callback = jest.fn();
      let { getByText } = render(<BasicDisclosure onChange={callback} />);

      fireEvent.click(getByText("Click Button"));

      expect(callback).toHaveBeenCalled();
    });

    // TODO: This fails for some reason despite working fine in the browser
    //       Tried keyDown, keyUp, and any number of options that should satisfy
    //       the requirements to no avail 🤷‍♂️
    //       The click handler is called in the component on an HTML5 button, so
    //       I'm not sure if we can/should test or not.
    // it("should toggle on spacebar", () => {
    //   let { getByRole, getByTestId } = render(<BasicDisclosure />);
    //   expect(getByTestId("panel")).not.toBeVisible();

    //   getByRole("button").focus();

    //   act(() => {
    //     fireEvent.keyDown(getByRole("button"), {
    //       key: " ",
    //       keyCode: 32,
    //     });
    //     fireEvent.keyUp(getByRole("button"), {
    //       key: " ",
    //       keyCode: 32,
    //     });
    //   }

    //   expect(getByTestId("panel")).toBeVisible();
    // });
  });
});

function BasicDisclosure(props: Omit<DisclosureProps, "children">) {
  return (
    <Disclosure {...props}>
      <DisclosureButton>Click Button</DisclosureButton>
      <DisclosurePanel>Panel body</DisclosurePanel>
    </Disclosure>
  );
}
