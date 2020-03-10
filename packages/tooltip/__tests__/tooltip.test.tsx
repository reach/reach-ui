import React from "react";
import { render, fireEvent, act } from "$test/utils";
import Tooltip, { LEAVE_TIMEOUT, MOUSE_REST_TIMEOUT } from "@reach/tooltip";

const { keyDown, mouseOver, mouseLeave, focus, blur } = fireEvent;

describe("<Tooltip />", () => {
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

    act(() => void mouseOver(trigger));
    act(() => void jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    act(() => void mouseLeave(trigger));
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
    act(() => void mouseOver(trigger));
    act(() => void jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
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

    act(() => void blur(trigger));
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

    act(() => void mouseOver(firstTrigger));
    act(() => void jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    act(() => void mouseLeave(firstTrigger));
    act(() => void mouseOver(secondTrigger));
    expect(baseElement).toMatchSnapshot("after switch without timeout");
  });

  it("hides on ESC", () => {
    const { baseElement, getByText } = render(
      <Tooltip label="Content">
        <button>Trigger</button>
      </Tooltip>
    );

    const trigger = getByText("Trigger");

    act(() => void focus(trigger));
    act(() => void jest.advanceTimersByTime(MOUSE_REST_TIMEOUT));
    expect(baseElement).toMatchSnapshot("after mouse rest timeout");

    act(() => void keyDown(trigger, { key: "Escape" }));
    expect(baseElement).toMatchSnapshot("not visible after ESC");
  });
});
