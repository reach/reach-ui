import React from "react";
import { render, fireEvent, act } from "$test/utils";
import Tooltip, { LEAVE_TIMEOUT, MOUSE_REST_TIMEOUT } from "@reach/tooltip";

const { keyDown, mouseOver, mouseLeave, focus, blur } = fireEvent;

describe("rendering tooltip", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it("shows/hides on hover", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = getByText("Trigger");

    expect(baseElement).toMatchSnapshot("not visible");

    mouseOver(trigger);
    act(() => void jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    mouseLeave(trigger);
    act(() => void jest.advanceTimersByTime(LEAVE_TIMEOUT));
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
    mouseOver(trigger);
    act(() => void jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
    const tooltip = getByText("Content");
    expect(tooltip).toBeInstanceOf(HTMLSpanElement);
  });

  it("shows/hides when trigger is activeElement", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );
    const trigger = getByText("Trigger");

    expect(baseElement).toMatchSnapshot("not visible");

    focus(trigger);
    expect(baseElement).toMatchSnapshot("after focus");

    blur(trigger);
    act(() => void jest.advanceTimersByTime(LEAVE_TIMEOUT));
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

    mouseOver(firstTrigger);
    act(() => void jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    mouseLeave(firstTrigger);
    mouseOver(secondTrigger);
    expect(baseElement).toMatchSnapshot("after switch without timeout");
  });

  it("hides on ESC", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = getByText("Trigger");

    focus(trigger);
    act(() => void jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    keyDown(trigger, { key: "Escape" });
    expect(baseElement).toMatchSnapshot("not visible after ESC");
  });
});
