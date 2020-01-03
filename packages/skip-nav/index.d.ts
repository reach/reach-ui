/**
 * An accessible dropdown menu for the common dropdown menu button design
 * pattern.
 *
 * @see Docs   https://reacttraining.com/reach-ui/skip-nav
 * @see Source https://github.com/reach/reach-ui/tree/master/packages/skip-nav
 * @see WebAIM https://webaim.org/techniques/skipnav/
 */

import * as React from "react";

/**
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink-props
 */
export type SkipNavProps = {
  /**
   * Allows you to change the text for your preferred phrase or localization.
   *
   * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink-children
   */
  children?: string | JSX.Element;
} & Omit<React.HTMLAttributes<HTMLAnchorElement>, "href">;

/**
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavcontent-props
 */
export type SkipNavContentProps = {
  /**
   * You can place the `SkipNavContent` element as a sibling to your main
   * content or as a wrapper.
   *
   * Keep in mind it renders a `div`, so it may mess with your CSS depending on
   * where it’s placed.
   *
   * @example
   *   <SkipNavContent />
   *   <YourMainContent />
   *   // vs.
   *   <SkipNavContent>
   *     <YourMainContent/>
   *   </SkipNavContent>
   *
   * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink-children
   */
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "id">;

/**
 * Renders a link that remains hidden until focused to skip to the main content.
 *
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink
 */
export const SkipNavLink: React.FunctionComponent<SkipNavProps>;

/**
 * Renders a div as the target for the link.
 *
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavcontent
 */
export const SkipNavContent: React.FunctionComponent<SkipNavContentProps>;
