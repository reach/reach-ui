/**
 * Screen-reader-friendly alert messages. In many apps developers add "alert"
 * messages when network events or other things happen. Users with assistive
 * technologies may not know about the message unless you develop for it.
 *
 * The Alert component will announce to assistive technologies whatever you
 * render to the screen. If you don't have a screen reader on you won't notice a
 * difference between rendering `<Alert>` vs. a `<div>`.
 *
 * @see Docs     https://reacttraining.com/reach-ui/alert
 * @see Source   https://github.com/reach/reach-ui/tree/master/packages/alert
 * @see WAI-ARIA https://www.w3.org/TR/wai-aria-practices-1.1/#alert
 */

import * as React from "react";

/**
 * @see Docs https://reacttraining.com/reach-ui/alert#alert-props
 */
export type AlertProps = {
  /**
   * Controls whether the assistive technology should read immediately
   * ("assertive") or wait until the user is idle ("polite").
   *
   * @see Docs https://reacttraining.com/reach-ui/alert#alert-type
   */
  type?: "assertive" | "polite";
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Screen-reader-friendly alert messages. In many apps developers add "alert"
 * messages when network events or other things happen. Users with assistive
 * technologies may not know about the message unless you develop for it.
 *
 * @see Docs https://reacttraining.com/reach-ui/alert
 */
declare const Alert: React.FunctionComponent<AlertProps>;

export default Alert;
