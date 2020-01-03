/**
 * Provides text for screen readers that is visually hidden.
 * It is the logical opposite of the `aria-hidden` attribute.
 *
 * @see https://snook.ca/archives/html_and_css/hiding-content-for-accessibility
 * @see https://a11yproject.com/posts/how-to-hide-content/
 * @see Docs     https://reacttraining.com/reach-ui/visually-hidden
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/visually-hidden
 */

import * as React from "react";

/**
 * Provides text for screen readers that is visually hidden.
 * It is the logical opposite of the `aria-hidden` attribute.
 */
declare const VisuallyHidden: React.FunctionComponent<React.HTMLAttributes<
  HTMLSpanElement
>>;

export default VisuallyHidden;
