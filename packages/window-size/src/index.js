import React from "react";
import Component from "@reach/component-component";

let hasWindow = typeof window !== "undefined";

let didMount = ({ refs, setState }) => {
  let resize = () =>
    setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  window.addEventListener("resize", resize);
  refs.removeEvent = () => {
    window.removeEventListener("resize", resize);
  };
};

let willUnmount = ({ refs }) => {
  refs.removeEvent();
};

let WindowSize = ({ children }) => (
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

export default WindowSize;
