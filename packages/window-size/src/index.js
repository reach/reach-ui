import React from "react";
import Component from "@reach/component-component";
import { func } from "prop-types";

const hasWindow = typeof window !== "undefined";

const didMount = ({ refs, setState }) => {
  const resize = () =>
    setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  window.addEventListener("resize", resize);
  refs.removeEvent = () => {
    window.removeEventListener("resize", resize);
  };
};

const willUnmount = ({ refs }) => {
  refs.removeEvent();
};

const WindowSize = ({ children }) => (
  <Component
    refs={{ removeEvent: null }}
    initialState={{
      width: hasWindow && window.innerWidth,
      height: hasWindow && window.innerHeight
    }}
    didMount={didMount}
    willUnmount={willUnmount}
    render={({ state }) => children(state)}
  />
);

if (__DEV__) {
  WindowSize.propTypes = {
    children: func.isRequired
  };
}

export default WindowSize;
