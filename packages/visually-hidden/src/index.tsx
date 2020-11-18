/**
 * Welcome to @reach/visually-hidden!
 *
 * Provides text for screen readers that is visually hidden.
 * It is the logical opposite of the `aria-hidden` attribute.
 *
 * @see https://snook.ca/archives/html_and_css/hiding-content-for-accessibility
 * @see https://a11yproject.com/posts/how-to-hide-content/
 * @see Docs     https://reach.tech/visually-hidden
 * @see Source   https://github.com/reach/reach-ui/tree/main/packages/visually-hidden
 */

import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { forwardRefWithAs } from "@reach/utils";

/**
 * VisuallyHidden
 *
 * Provides text for screen readers that is visually hidden.
 * It is the logical opposite of the `aria-hidden` attribute.
 */
const VisuallyHidden = forwardRefWithAs<VisuallyHiddenProps, "span">(
  function VisuallyHidden({ as: Comp = "span", ...props }, ref) {
    return (
      <Comp
        ref={ref}
        style={{
          border: 0,
          clip: "rect(0 0 0 0)",
          height: "1px",
          margin: "-1px",
          overflow: "hidden",
          padding: 0,
          position: "absolute",
          width: "1px",

          // https://medium.com/@jessebeach/beware-smushed-off-screen-accessible-text-5952a4c2cbfe
          whiteSpace: "nowrap",
          wordWrap: "normal",
        }}
        {...props}
      />
    );
  }
);

/**
 * @see Docs https://reach.tech/visually-hidden#visuallyhidden-props
 */
export type VisuallyHiddenProps = {
  /**
   * @see Docs https://reach.tech/visually-hidden#visuallyhidden-children
   */
  children: React.ReactNode;
};

if (__DEV__) {
  VisuallyHidden.displayName = "VisuallyHidden";
  VisuallyHidden.propTypes = {
    as: PropTypes.any,
    children: PropTypes.node,
  };
}

export default VisuallyHidden;
