import React from "react";

let id = "reach-skip-nav";

let SkipNavLink = ({ children = "Skip to content", ...props }) => (
  <a {...props} children={children} href={`#${id}`} data-reach-skip-link />
);

let SkipNavContent = props => <div {...props} id={id} />;

export { SkipNavLink, SkipNavContent };
