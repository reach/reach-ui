import { forwardRef, memo } from "react";
import type * as React from "react";
import type {
  As,
  ForwardRefExoticComponentWithAs,
  ForwardRefWithAsRenderFunction,
  FunctionComponentWithAs,
  MemoExoticComponentWithAs,
} from "./types";

/**
 * This is a hack for sure. The thing is, getting a component to intelligently
 * infer props based on a component or JSX string passed into an `as` prop is
 * kind of a huge pain. Getting it to work and satisfy the constraints of
 * `forwardRef` seems dang near impossible. To avoid needing to do this awkward
 * type song-and-dance every time we want to forward a ref into a component
 * that accepts an `as` prop, we abstract all of that mess to this function for
 * the time time being.
 */
export function forwardRefWithAs<
  Props,
  DefaultComponentType extends As = "div"
>(render: ForwardRefWithAsRenderFunction<DefaultComponentType, Props>) {
  return forwardRef(render) as ForwardRefExoticComponentWithAs<
    DefaultComponentType,
    Props
  >;
}

export function memoWithAs<Props, DefaultComponentType extends As = "div">(
  Component: FunctionComponentWithAs<DefaultComponentType, Props>,
  propsAreEqual?: (
    prevProps: Readonly<React.PropsWithChildren<Props>>,
    nextProps: Readonly<React.PropsWithChildren<Props>>
  ) => boolean
) {
  return memo(Component, propsAreEqual) as MemoExoticComponentWithAs<
    DefaultComponentType,
    Props
  >;
}
