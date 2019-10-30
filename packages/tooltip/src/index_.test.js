import React from "react";
import { LEAVE_TIMEOUT, MOUSE_REST_TIMEOUT } from ".";

function getTooltip(baseElement, trigger) {
  const tooltipId = trigger.getAttribute("aria-describedby");
  const tooltipPortal = baseElement.querySelector(`#${tooltipId}`);

  return tooltipPortal;
}

let Tooltip;
let render, fireEvent, act, cleanup;

describe("Tooltip", () => {
  beforeEach(() => {
    ({ default: Tooltip } = require("."));
    ({ cleanup, render, fireEvent, act } = require("@testing-library/react"));

    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
  });

  it("has correct markup", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = getByText("Trigger");

    fireEvent.mouseOver(trigger);
    act(() => jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));

    expect(baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          <button
            aria-describedby="tooltip-1"
            data-reach-tooltip-trigger=""
          >
            Trigger
          </button>
        </div>
        <reach-portal>
          <div
            data-reach-tooltip="true"
            id="tooltip-1"
            role="tooltip"
            style="left: 0px; top: 8px;"
          >
            Content
          </div>
        </reach-portal>
      </body>
    `);
  });

  it("shows/hides on hover", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button id="asds">Trigger</button>
      </Tooltip>
    );
    const trigger = getByText("Trigger");

    expect(baseElement.querySelector("reach-portal")).not.toBeInTheDocument();

    fireEvent.mouseOver(trigger);
    act(() => jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));

    const tooltip = getTooltip(baseElement, trigger);
    expect(tooltip.textContent).toBe("Content");

    fireEvent.mouseLeave(trigger);
    act(() => jest.advanceTimersByTime(LEAVE_TIMEOUT));
    expect(tooltip).not.toBeInTheDocument();
  });

  it("shows/hides when trigger is activeElement", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = getByText("Trigger");

    fireEvent.focus(trigger);
    const tooltip = getTooltip(baseElement, trigger);
    expect(tooltip.textContent).toBe("Content");

    fireEvent.blur(trigger);
    act(() => jest.advanceTimersByTime(LEAVE_TIMEOUT));
    expect(tooltip).not.toBeInTheDocument();
  });

  it("hides on ESC", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = getByText("Trigger");

    fireEvent.focus(trigger);
    act(() => jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
    const tooltip = getTooltip(baseElement, trigger);
    expect(tooltip).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(tooltip).not.toBeInTheDocument();
  });

  describe("with multiple Tooltips", () => {
    it("is only one tooltip visible at a time", () => {
      const { getAllByRole, getByText } = render(
        <>
          <Tooltip label="First">
            <button>First Trigger</button>
          </Tooltip>
          <Tooltip label="Second">
            <button>Second Trigger</button>
          </Tooltip>
        </>
      );
      const firstTrigger = getByText("First Trigger");
      const secondTrigger = getByText("Second Trigger");

      fireEvent.mouseOver(firstTrigger);
      act(() => jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
      fireEvent.mouseLeave(firstTrigger);
      fireEvent.mouseOver(secondTrigger);

      const tooltips = getAllByRole("tooltip");
      expect(tooltips).toHaveLength(1);
    });

    it("shows without timeout when one tooltip is already visible", () => {
      const { baseElement, getByText } = render(
        <>
          <Tooltip label="First">
            <button>First Trigger</button>
          </Tooltip>
          <Tooltip label="Second">
            <button>Second Trigger</button>
          </Tooltip>
        </>
      );
      const firstTrigger = getByText("First Trigger");
      const secondTrigger = getByText("Second Trigger");

      fireEvent.mouseOver(firstTrigger);
      act(() => jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));

      const firstTooltip = getTooltip(baseElement, firstTrigger);
      expect(firstTooltip.textContent).toBe("First");

      fireEvent.mouseLeave(firstTrigger);
      fireEvent.mouseOver(secondTrigger);

      const secondTooltip = getTooltip(baseElement, secondTrigger);
      expect(secondTooltip.textContent).toBe("Second");
    });
  });
});
