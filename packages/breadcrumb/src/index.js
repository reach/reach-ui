import React from "react";
import { node } from "prop-types";

let Breadcrumb = props => {
  const Separator = (
    <span aria-hidden="true" data-breadcrumb-separator="">
      {props.separator}
    </span>
  );

  const children = React.Children.map(props.children, function(child, index) {
    const isLast = index === props.children.length - 1;

    return (
      <li data-reach-breadcrumb-item="" aria-current={isLast ? "page" : null}>
        {React.cloneElement(child, { isLast })}
        {isLast ? null : Separator}
      </li>
    );
  });

  return (
    <nav {...props} data-reach-breadcrumb="" aria-label="breadcrumb">
      <ol>{children}</ol>
    </nav>
  );
};

Breadcrumb.propTypes = {
  separator: node
};

Breadcrumb.defaultProps = {
  separator: "/"
};

export default Breadcrumb;
