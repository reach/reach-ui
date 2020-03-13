import React from "react";
import { render, fireEvent, act, screen } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import Tooltip, { LEAVE_TIMEOUT, MOUSE_REST_TIMEOUT } from "@reach/tooltip";

describe("<Tooltip />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  describe("rendering", () => {
    it("renders as any HTML element", () => {
      let tooltipText = "Look at me";
      let { getByText } = render(
        <p>
          <Tooltip as="span" style={{ display: "block" }} label={tooltipText}>
            <span>Trigger</span>
          </Tooltip>
        </p>
      );

      let trigger = getByText("Trigger");
      act(() => {
        fireEvent.mouseOver(trigger);
        jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
      });

      let tooltip = getByText(tooltipText);
      expect(tooltip.tagName).toBe("SPAN");

      act(() => void leaveTooltip(trigger));
    });
  });

  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      let { container, getByText } = render(
        <div data-testid="tooltip">
          <Tooltip label="Content">
            <button>Trigger</button>
          </Tooltip>
        </div>
      );

      let trigger = getByText("Trigger");

      // We need to use real timers to stop axe from timing out, then revert
      // back to fake timers to continue our tests.
      jest.useRealTimers();
      let results: AxeResults = null as any;
      await act(async () => {
        results = await axe(container);
      });
      expect(results).toHaveNoViolations();
      jest.useFakeTimers();

      act(() => {
        fireEvent.mouseOver(trigger);
        jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
      });

      jest.useRealTimers();
      await act(async () => {
        results = await axe(container);
      });
      expect(results).toHaveNoViolations();
      jest.useFakeTimers();

      act(() => void leaveTooltip(trigger));
    });
  });

  describe("user events", () => {
    it("shows/hides on hover", () => {
      let tooltipText = "Look at me";

      let { getByText, queryByText } = render(
        <Tooltip label={tooltipText}>
          <button>Trigger</button>
        </Tooltip>
      );

      let trigger = getByText("Trigger");
      expect(queryByText(tooltipText)).toBeFalsy();

      act(() => {
        fireEvent.mouseOver(trigger);
        jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
      });

      expect(queryByText(tooltipText)).toBeTruthy();

      act(() => void leaveTooltip(trigger));

      expect(queryByText(tooltipText)).toBeFalsy();
    });

    it("shows/hides when trigger is focused/blurred", () => {
      let tooltipText = "Look at me";
      let { getByText, queryByText } = render(
        <Tooltip label={tooltipText}>
          <button>Trigger</button>
        </Tooltip>
      );

      let trigger = getByText("Trigger");
      expect(queryByText(tooltipText)).toBeFalsy();

      act(() => void fireEvent.focus(trigger));
      expect(queryByText(tooltipText)).toBeTruthy();

      act(() => void blurTooltip(trigger));
      expect(queryByText(tooltipText)).toBeFalsy();
    });

    it("shows without timeout when one tooltip is already visible", () => {
      let { getByText } = render(
        <>
          <Tooltip label="First">
            <button>First Trigger</button>
          </Tooltip>
          <Tooltip label="Second">
            <button>Second Trigger</button>
          </Tooltip>
        </>
      );

      let firstTrigger = getByText("First Trigger");
      let secondTrigger = getByText("Second Trigger");

      act(() => {
        fireEvent.mouseOver(firstTrigger);
        jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
      });

      expect(screen.queryByText("First Trigger")).toBeTruthy();

      act(() => {
        fireEvent.mouseLeave(firstTrigger);
        fireEvent.mouseOver(secondTrigger);
      });

      expect(screen.queryByText("Second Trigger")).toBeTruthy();

      act(() => void leaveTooltip(secondTrigger));
    });

    it("hides on ESC", () => {
      let tooltipText = "Look at me";
      let { getByText, queryByText } = render(
        <Tooltip label={tooltipText}>
          <button>Trigger</button>
        </Tooltip>
      );

      let trigger = getByText("Trigger");

      act(() => {
        fireEvent.focus(trigger);
        jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
      });
      expect(queryByText(tooltipText)).toBeTruthy();

      act(() => void fireEvent.keyDown(trigger, { key: "Escape" }));
      expect(queryByText(tooltipText)).toBeFalsy();

      act(() => void leaveTooltip(trigger));
    });
  });
});

function leaveTooltip(element: HTMLElement) {
  fireEvent.mouseLeave(element);
  jest.advanceTimersByTime(LEAVE_TIMEOUT);
}

function blurTooltip(element: HTMLElement) {
  fireEvent.blur(element);
  jest.advanceTimersByTime(LEAVE_TIMEOUT);
}
