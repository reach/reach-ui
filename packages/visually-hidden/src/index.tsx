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

import * as React from "react";
import PropTypes from "prop-types";

/**
 * VisuallyHidden
 *
 * Provides text for screen readers that is visually hidden.
 * It is the logical opposite of the `aria-hidden` attribute.
 */
const VisuallyHidden = React.forwardRef<any, any>(function VisuallyHidden(
  { as: Comp = "span", style = {}, ...props },
  ref
) {
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
        ...style,
      }}
      {...props}
    />
  );
}) as ForwardRefExoticComponentWithAs<"span", VisuallyHiddenProps>;

/**
 * @see Docs https://reach.tech/visually-hidden#visuallyhidden-props
 */
type VisuallyHiddenProps = {
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

////////////////////////////////////////////////////////////////////////////////
// TODO: These all come from @reach/utils but we don't want to bundle that here
// just for the types. Need to split that up a bit better.

type As<BaseProps = any> = React.ElementType<BaseProps>;

type PropsWithAs<ComponentType extends As, ComponentProps> = ComponentProps &
  Omit<
    React.ComponentPropsWithRef<ComponentType>,
    "as" | keyof ComponentProps
  > & {
    as?: ComponentType;
  };

interface ExoticComponentWithAs<ComponentType extends As, ComponentProps> {
  /**
   * **NOTE**: Exotic components are not callable.
   * Inherited from React.ExoticComponent with modifications to support `as`
   */
  <TT extends As>(
    props: PropsWithAs<TT, ComponentProps>
  ): React.ReactElement | null;
  (
    props: PropsWithAs<ComponentType, ComponentProps>
  ): React.ReactElement | null;

  /**
   * Inherited from React.ExoticComponent
   */
  readonly $$typeof: symbol;
}

interface NamedExoticComponentWithAs<ComponentType extends As, ComponentProps>
  extends ExoticComponentWithAs<ComponentType, ComponentProps> {
  /**
   * Inherited from React.NamedExoticComponent
   */
  displayName?: string;
}

interface ForwardRefExoticComponentWithAs<
  ComponentType extends As,
  ComponentProps
> extends NamedExoticComponentWithAs<ComponentType, ComponentProps> {
  /**
   * Inherited from React.ForwardRefExoticComponent
   * Will show `ForwardRef(${Component.displayName || Component.name})` in devtools by default,
   * but can be given its own specific name
   */
  defaultProps?: Partial<PropsWithAs<ComponentType, ComponentProps>>;
  propTypes?: React.WeakValidationMap<
    PropsWithAs<ComponentType, ComponentProps>
  >;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type { VisuallyHiddenProps };
export { VisuallyHidden };
export default VisuallyHidden;
