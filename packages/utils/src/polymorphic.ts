// adapted from https://github.com/radix-ui/primitives/blob/2f139a832ba0cdfd445c937ebf63c2e79e0ef7ed/packages/react/polymorphic/src/polymorphic.ts
// Would have liked to use it directly instead of copying but they are
// (rightfully) treating it as an internal utility, so copy/paste it is to
// prevent any needless churn if they make breaking changes.
// Big thanks to Jenna for the heavy lifting! https://github.com/jjenzz

import type * as React from "react";

type Merge<P1 = {}, P2 = {}> = Omit<P1, keyof P2> & P2;

type MergeProps<E, P = {}> = P &
  Merge<
    E extends React.ElementType ? React.ComponentPropsWithRef<E> : never,
    P
  >;

/**
 * Infers `OwnProps` if E is a ForwardRefComponent
 */
type OwnProps<E> = E extends ForwardRefComponent<any, infer P> ? P : {};

/**
 * Infers the JSX.IntrinsicElement if E is a ForwardRefComponent
 */
type IntrinsicElement<E> = E extends ForwardRefComponent<infer I, any>
  ? I
  : never;

type NarrowIntrinsic<E> = E extends keyof JSX.IntrinsicElements ? E : never;

/**
 * Extends original type to ensure built in React types play nice with
 * polymorphic components still e.g. `React.ElementRef` etc.
 */
interface ForwardRefComponent<IntrinsicElementString, OwnProps = {}>
  extends React.ForwardRefExoticComponent<
    MergeProps<
      IntrinsicElementString,
      OwnProps & { as?: IntrinsicElementString }
    >
  > {
  /*
   * When passing an `as` prop as a string, use this overload. Merges original
   * own props (without DOM props) and the inferred props from `as` element with
   * the own props taking precendence.
   *
   * We explicitly define a `JSX.IntrinsicElements` overload so that events are
   * typed for consumers.
   */
  <
    As extends keyof JSX.IntrinsicElements = NarrowIntrinsic<
      IntrinsicElementString
    >
  >(
    props: MergeProps<As, OwnProps & { as: As }>
  ): React.ReactElement | null;

  /**
   * When passing an `as` prop as a component, use this overload. Merges
   * original own props (without DOM props) and the inferred props from `as`
   * element with the own props taking precendence.
   *
   * We don't use `React.ComponentType` here as we get type errors when
   * consumers try to do inline `as` components.
   */
  <As extends React.ElementType>(
    props: MergeProps<As, OwnProps & { as: As }>
  ): React.ReactElement | null;
}
interface MemoComponent<IntrinsicElementString, OwnProps = {}>
  extends React.MemoExoticComponent<
    ForwardRefComponent<
      MergeProps<
        IntrinsicElementString,
        OwnProps & { as?: IntrinsicElementString }
      >
    >
  > {
  /*
   * When passing an `as` prop as a string, use this overload. Merges original
   * own props (without DOM props) and the inferred props from `as` element with
   * the own props taking precendence.
   *
   * We explicitly define a `JSX.IntrinsicElements` overload so that events are
   * typed for consumers.
   */
  <
    As extends keyof JSX.IntrinsicElements = NarrowIntrinsic<
      IntrinsicElementString
    >
  >(
    props: MergeProps<As, OwnProps & { as?: As }>
  ): React.ReactElement | null;

  /**
   * When passing an `as` prop as a component, use this overload. Merges
   * original own props (without DOM props) and the inferred props from `as`
   * element with the own props taking precendence.
   *
   * We don't use `React.ComponentType` here as we get type errors when
   * consumers try to do inline `as` components.
   */
  <As extends React.ElementType>(
    props: MergeProps<As, OwnProps & { as?: As }>
  ): React.ReactElement | null;
}

export type {
  ForwardRefComponent,
  MemoComponent,
  OwnProps,
  IntrinsicElement,
  Merge,
};
export default {};
