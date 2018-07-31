import React from "react";
import { createPortal } from "react-dom";
import Component from "@reach/component-component";

let Portal = ({ children, type = "reach-portal" }) => (
  <Component
    getRefs={() => ({ node: document.createElement(type) })}
    didMount={({ refs: { node } }) => {
      document.body.appendChild(node);
    }}
    willUnmount={({ refs: { node } }) => {
      document.body.removeChild(node);
    }}
    render={({ refs: { node } }) => {
      return createPortal(children, node);
    }}
  />
);

export default Portal;
