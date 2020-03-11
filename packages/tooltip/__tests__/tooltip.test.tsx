import React from "react";
import { render, fireEvent, act } from "$test/utils";
//import { axe } from "jest-axe";
import Tooltip, { LEAVE_TIMEOUT, MOUSE_REST_TIMEOUT } from "@reach/tooltip";

const { keyDown, mouseOver, mouseLeave, focus, blur } = fireEvent;

describe("<Tooltip />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  // TODO: See dialog test for notes, similar issues here
  // it("should not have basic a11y issues", async () => {
  //   const { container } = render(
  //     <Tooltip label="Content">
  //       <button>Trigger</button>
  //     </Tooltip>
  //   );
  //   const results = await axe(container);
  //   expect(results).toHaveNoViolations();
  // });

  it("shows/hides on hover", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = getByText("Trigger");

    expect(baseElement).toMatchSnapshot("not visible");

    act(() => {
      mouseOver(trigger);
      jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
    });

    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    act(() => {
      mouseLeave(trigger);
      jest.advanceTimersByTime(LEAVE_TIMEOUT);
    });

    expect(baseElement).toMatchSnapshot("after leave timeout");
  });

  it("renders as any HTML element", () => {
    const { getByText } = render(
      <p>
        <Tooltip as="span" style={{ display: "block" }} label="Content">
          <span>Trigger</span>
        </Tooltip>
      </p>
    );

    const trigger = getByText("Trigger");
    act(() => {
      mouseOver(trigger);
      jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
    });

    const tooltip = getByText("Content");
    expect(tooltip.tagName).toBe("SPAN");
  });

  it("shows/hides when trigger is activeElement", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = getByText("Trigger");

    expect(baseElement).toMatchSnapshot("not visible");

    act(() => void focus(trigger));

    expect(baseElement).toMatchSnapshot("after focus");

    act(() => {
      blur(trigger);
      jest.advanceTimersByTime(LEAVE_TIMEOUT);
    });

    expect(baseElement).toMatchSnapshot("after blur");
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

    act(() => {
      mouseOver(firstTrigger);
      jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
    });
    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    act(() => {
      mouseLeave(firstTrigger);
      mouseOver(secondTrigger);
    });

    expect(baseElement).toMatchSnapshot("after switch without timeout");
  });

  it("hides on ESC", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = getByText("Trigger");

    act(() => {
      focus(trigger);
      jest.advanceTimersByTime(MOUSE_REST_TIMEOUT);
    });

    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    act(() => void keyDown(trigger, { key: "Escape" }));
    expect(baseElement).toMatchSnapshot("not visible after ESC");
  });
});
