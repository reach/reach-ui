import React from "react";
import PropTypes from "prop-types";
import { act } from "react-dom/test-utils";
import { render as tlRender, MatcherFunction } from "@testing-library/react";
export * from "@testing-library/react";
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
  return (text: string): HTMLElement =>
    query((content: string, node: HTMLElement) => {
      const hasText = (node: HTMLElement) => node.textContent === text;
      const childrenDontHaveText = Array.from(node.children).every(
        child => !hasText(child as HTMLElement)
      );
      return hasText(node) && childrenDontHaveText;
    });
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

  const result = tlRender(element, {
    baseElement,
    wrapper: Wrapper,
  }) as RenderResult<P, T>;

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

type Query = (f: MatcherFunction) => HTMLElement;

export { act, RenderOptions, RenderResult };
