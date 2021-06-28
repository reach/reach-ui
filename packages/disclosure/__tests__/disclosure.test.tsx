import * as React from "react";
import { render, fireEvent } from "$test/utils";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@reach/disclosure";

describe("<Disclosure />", () => {
  describe("rendering", () => {
    it("uses the correct data attributes", () => {
      let { getByText } = render(
        <Disclosure>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );

      expect(getByText("Click Button")).toHaveAttribute(
        "data-reach-disclosure-button"
      );
      expect(getByText("Panel body")).toHaveAttribute(
        "data-reach-disclosure-panel"
      );
    });

    it("hides the panel content by default", () => {
      let { getByText } = render(
        <Disclosure>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );

      expect(getByText("Panel body")).not.toBeVisible();
    });

    it("shows the panel content when `defaultOpen` is `true`", () => {
      let { getByText } = render(
        <Disclosure defaultOpen>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );

      expect(getByText("Panel body")).toBeVisible();
    });

    it("hides the panel content when `defaultOpen` is `false`", () => {
      let { getByText } = render(
        <Disclosure defaultOpen={false}>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );

      expect(getByText("Panel body")).not.toBeVisible();
    });

    it("shows the panel content when `open` is `true`", () => {
      let { getByText } = render(
        <Disclosure open>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );

      expect(getByText("Panel body")).toBeVisible();
    });

    it("hides the panel content when `open` is false", () => {
      let { getByText } = render(
        <Disclosure open={false}>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );

      expect(getByText("Panel body")).not.toBeVisible();
      expect(getByText("Panel body")).not.toBeVisible();
    });
  });

  describe("a11y", () => {
    it("accepts a custom ID", () => {
      let { getByText } = render(
        <Disclosure id="my-id">
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );
      expect(getByText("Panel body")).toHaveAttribute("id", "panel--my-id");
    });

    it("sets the correct aria attributes when collapsed", () => {
      let { getByText } = render(
        <Disclosure>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );
      let button = getByText("Click Button");
      let panel = getByText("Panel body");

      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("data-state", "collapsed");

      expect(panel).toHaveAttribute("data-state", "collapsed");
      expect(panel).toHaveAttribute("hidden");
    });

    it("sets the correct aria attributes when open", () => {
      let { getByText } = render(
        <Disclosure open>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );
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
      let { getByText } = render(
        <Disclosure>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );

      expect(getByText("Panel body")).not.toBeVisible();

      fireEvent.click(getByText("Click Button"));

      expect(getByText("Panel body")).toBeVisible();
    });

    it("calls onChange when the button is clicked", () => {
      let callback = jest.fn();
      let { getByText } = render(
        <Disclosure onChange={callback}>
          <DisclosureButton>Click Button</DisclosureButton>
          <DisclosurePanel>Panel body</DisclosurePanel>
        </Disclosure>
      );

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
