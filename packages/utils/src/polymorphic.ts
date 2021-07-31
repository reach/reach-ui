// adapted from https://github.com/radix-ui/primitives/blob/2f139a832ba0cdfd445c937ebf63c2e79e0ef7ed/packages/react/polymorphic/src/polymorphic.ts
// Would have liked to use it directly instead of copying but they are
// (rightfully) treating it as an internal utility, so copy/paste it is to
// prevent any needless churn if they make breaking changes. Big thanks to Jenna
// for the heavy lifting! https://github.com/jjenzz

import type * as React from "react";

type Merge<P1 = {}, P2 = {}> = Omit<P1, keyof P2> & P2;

/**
 * Infers the OwnProps if E is a ForwardRefExoticComponentWithAs
 */
type OwnProps<E> = E extends ForwardRefComponent<any, infer P> ? P : {};

/**
 * Infers the JSX.IntrinsicElement if E is a ForwardRefExoticComponentWithAs
 */
type IntrinsicElement<E> = E extends ForwardRefComponent<infer I, any>
  ? I
  : never;

type ForwardRefExoticComponent<E, OwnProps> = React.ForwardRefExoticComponent<
  Merge<
    E extends React.ElementType ? React.ComponentPropsWithRef<E> : never,
    OwnProps & { as?: E }
  >
>;

interface ForwardRefComponent<
  IntrinsicElementString,
  OwnProps = {}
  /*
   * Extends original type to ensure built in React types play nice with
   * polymorphic components still e.g. `React.ElementRef` etc.
   */
> extends ForwardRefExoticComponent<IntrinsicElementString, OwnProps> {
  /*
   * When `as` prop is passed, use this overload. Merges original own props
   * (without DOM props) and the inferred props from `as` element with the own
   * props taking precendence.
   *
   * We explicitly avoid `React.ElementType` and manually narrow the prop types
   * so that events are typed when using JSX.IntrinsicElements.
   */
  <As = IntrinsicElementString>(
    props: As extends ""
      ? { as: keyof JSX.IntrinsicElements }
      : As extends React.ComponentType<infer P>
      ? Merge<P, OwnProps & { as: As }>
      : As extends keyof JSX.IntrinsicElements
      ? Merge<JSX.IntrinsicElements[As], OwnProps & { as: As }>
      : never
  ): React.ReactElement | null;
}

interface MemoComponent<IntrinsicElementString, OwnProps = {}>
  extends React.MemoExoticComponent<
    ForwardRefComponent<IntrinsicElementString, OwnProps>
  > {
  <As = IntrinsicElementString>(
    props: As extends ""
      ? { as: keyof JSX.IntrinsicElements }
      : As extends React.ComponentType<infer P>
      ? Merge<P, OwnProps & { as: As }>
      : As extends keyof JSX.IntrinsicElements
      ? Merge<JSX.IntrinsicElements[As], OwnProps & { as: As }>
      : never
  ): React.ReactElement | null;
}

export type {
  ForwardRefComponent,
  IntrinsicElement,
  MemoComponent,
  Merge,
  OwnProps,
};
export default {};
