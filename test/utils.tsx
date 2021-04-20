import * as React from "react";
import PropTypes from "prop-types";
import { act } from "react-dom/test-utils";
import {
  render as tlRender,
  MatcherFunction,
  fireEvent,
} from "@testing-library/react";
import { fireEvent as fireDomEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { RenderOptions, RenderResult } from "./types";

/**
 * This function is useful if you want to query a DOM element by its text
 * string, but the text is split up by nested DOM elements.
 *
 * @example
 *   it('tests foo and bar', () => {
 *     const { getByText } = render(<App />)
 *     const getByTextWithMarkup = withMarkup(getByText)
 *     let node = getByTextWithMarkup('Hello, world');
 *     expect(node).toBeInTheDocument()
 *   });
 *
 *   function App() {
 *     return <span>Hello, <span>world</span></span>
 *   }
 *
 * @param query The getter function returned from RTL's render method
 */
export function withMarkup(query: Query) {
  return (text: string): HTMLElement | null =>
    query((content, node) => {
      if (!node) {
        return false;
      }
      const hasText = (node: Element) => node.textContent === text;
      const childrenDontHaveText = Array.from(node.children).every(
        (child) => !hasText(child as HTMLElement)
      );
      return hasText(node) && childrenDontHaveText;
    });
}

/**
 * Fire keydown followed immediately by keyup
 * @param element
 * @param key
 */
export function keyType(element: HTMLElement | Document, key: string) {
  fireEvent.keyDown(element, { key });
  fireEvent.keyUp(element, { key });
}

export function render<
  P extends React.HTMLAttributes<T>,
  T extends HTMLElement
>(
  element: React.ReactElement<any>,
  options: RenderOptions = {}
): RenderResult<P, T> {
  const {
    baseElement,
    strict = false,
    wrapper: InnerWrapper = React.Fragment,
  } = options;

  const Mode = strict ? React.StrictMode : React.Fragment;

  const Wrapper: React.FC = ({ children }) => {
    return (
      <Mode>
        <InnerWrapper>{children}</InnerWrapper>
      </Mode>
    );
  };
  Wrapper.propTypes = { children: PropTypes.node };

  const result = (tlRender(element, {
    baseElement,
    wrapper: Wrapper,
  }) as unknown) as RenderResult<P, T>;

  // These handy functions courtesy of https://github.com/mui-org/material-ui
  result.setProps = function setProps(props: P) {
    result.rerender(React.cloneElement(element, props));
    return result;
  } as any;

  result.forceUpdate = function forceUpdate() {
    result.rerender(
      React.cloneElement(element, {
        "data-force-update": String(Math.random()),
      })
    );
    return result;
  };

  return result;
}

export async function wait(time: number) {
  return await new Promise<void>((res) => setTimeout(res, time));
}

/**
 * When a user clicks with a mouse, mousedown, mouseup and then click events
 * are fired. Some packages rely on mousedown and mouseup events where click
 * might be assumed by most consumers. This helper fires all three events in
 * order to make testing a bit more predictable.
 * @see https://testing-library.com/docs/guide-events#interactions-vs-events
 * @param element
 */
export function simulateMouseClick(element: HTMLElement) {
  fireEvent.pointerDown(element, { pointerType: "mouse" });
  fireEvent.mouseDown(element);
  fireEvent.pointerUp(element, { pointerType: "mouse" });
  fireEvent.mouseUp(element);
  fireEvent.click(element);
}

export function simulateSpaceKeyClick(
  element: HTMLElement,
  opts?: { fireClick?: boolean }
) {
  let { fireClick } = opts || {};
  fireEvent.keyDown(element, { key: " " });
  fireEvent.keyUp(element, { key: " " });
  if (fireClick) {
    fireEvent.click(element);
  }
}

export function simulateEnterKeyClick(
  element: HTMLElement,
  opts?: { fireClick?: boolean }
) {
  let { fireClick } = opts || {};
  fireEvent.keyDown(element, { key: "Enter" });
  fireEvent.keyUp(element, { key: "Enter" });
  if (fireClick) {
    fireEvent.click(element);
  }
}

type Query = (f: MatcherFunction) => HTMLElement | null;

export * from "@testing-library/react";
export { act, userEvent, fireDomEvent, RenderOptions, RenderResult };
