import React from "react";

let id = "reach-skip-nav";

let SkipNavLink = ({ children = "Skip to content", ...props }) => (
  <a {...props} href={`#${id}`} data-reach-skip-link>
    {children}
  </a>
);

let SkipNavContent = props => <div {...props} id={id} />;

export { SkipNavLink, SkipNavContent };
