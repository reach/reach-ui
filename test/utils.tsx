import React from "react";
import PropTypes from "prop-types";
import { render as tlRender } from "@testing-library/react";
export * from "@testing-library/react";
import { RenderOptions, RenderResult } from "./types";

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

export { RenderOptions, RenderResult };
