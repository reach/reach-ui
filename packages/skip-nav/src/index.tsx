import React, { useEffect } from "react";
import { checkStyles } from "@reach/utils";

let id = "reach-skip-nav";

////////////////////////////////////////////////////////////////////////////////

/**
 * SkipNavLink
 *
 * Renders a link that remains hidden until focused to skip to the main content.
 *
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink
 */
export const SkipNavLink: React.FC<SkipNavLinkProps> = ({
  children = "Skip to content",
  ...props
}) => {
  useEffect(() => checkStyles("skip-nav"), []);
  return (
    <a {...props} href={`#${id}`} data-reach-skip-link>
      {children}
    </a>
  );
};

/**
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink-props
 */
export type SkipNavLinkProps = {
  /**
   * Allows you to change the text for your preferred phrase or localization.
   *
   * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavlink-children
   */
  children?: string | JSX.Element;
} & Omit<React.HTMLAttributes<HTMLAnchorElement>, "href">;

if (__DEV__) {
  SkipNavLink.displayName = "SkipNavLink";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * SkipNavContent
 *
 * Renders a div as the target for the link.
 *
 * @see Docs https://reacttraining.com/reach-ui/skip-nav#skipnavcontent
 */
export const SkipNavContent: React.FC<SkipNavContentProps> = props => (
  <div {...props} id={id} />
);

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

if (__DEV__) {
  SkipNavContent.displayName = "SkipNavContent";
}
