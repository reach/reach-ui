import React from "react";
import { createPortal } from "react-dom";
import Component from "@reach/component-component";

let Portal = ({ children, type = "reach-portal" }) => (
  <Component
    getRefs={() => ({ node: null })}
    didMount={({ refs, forceUpdate }) => {
      refs.node = document.createElement(type);
      document.body.appendChild(refs.node);
      forceUpdate();
    }}
    willUnmount={({ refs: { node } }) => {
      document.body.removeChild(node);
    }}
    render={({ refs: { node } }) => {
      return node ? createPortal(children, node) : null;
    }}
  />
);

export default Portal;
