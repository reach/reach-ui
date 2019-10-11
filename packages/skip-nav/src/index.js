import React from "react";

const id = "reach-skip-nav";

const SkipNavLink = ({ children = "Skip to content", ...props }) => (
  <a {...props} href={`#${id}`} data-reach-skip-link>
    {children}
  </a>
);

const SkipNavContent = props => <div {...props} id={id} />;

export { SkipNavLink, SkipNavContent };
