import * as React from "react";
import { Validator } from "prop-types";
// import styled from 'styled-components';

export type AssignableRef<T = any> = React.Ref<T | null>;

/**
 * The built-in utility type `Omit` does not distribute over unions. So if you
 * have:
 *
 *    type A = { a: 'whatever' }
 *
 * and you want to do a union with:
 *
 *    type B = A & { b: number } | { b: string; c: number }
 *
 * you might expect `Omit<B, 'a'>` to give you:
 *
 *    Omit<{ a: 'whatever'; b: number }, 'a'> | Omit<{ a: 'whatever'; b: string; c: number }, 'a'>
 *
 * This is not the case, unfortunately, so we need to create our own version of
 * `Omit` that distributes over unions with a distributive conditional type. If
 * you have a generic type parameter `T`, then the construct
 * `T extends any ? F<T> : never` will end up distributing the `F<>` operation
 * over `T` when `T` is a union type.
 *
 * @link https://stackoverflow.com/a/59796484/1792019
 * @link http://www.typescriptlang.org/docs/handbook/advanced-types.html#distributive-conditional-types
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends any
  ? Omit<T, K>
  : never;

////////////////////////////////////////////////////////////////////////////////
// The following types help us deal with the `as` prop.
// I kind of hacked around until I got this to work using some other projects,
// as a rough guide, but it does seem to work so, err, that's cool? Yay TS! 🙃
// P = additional props
// T = type of component to render

export type As<P = any> = React.ElementType<P>;

export type PropsWithAs<T extends As, P> = P &
  Omit<React.ComponentPropsWithRef<T>, "as" | keyof P> & {
    as?: T;
  };

export type PropsFromAs<T extends As, P> = (PropsWithAs<T, P> & { as: T }) &
  PropsWithAs<T, P>;

export type ComponentWithForwardedRef<
  T extends React.ElementType,
  P
> = React.ForwardRefExoticComponent<
  P & React.HTMLProps<React.ElementType<T>> & React.ComponentPropsWithRef<T>
  // React.RefAttributes<React.ElementType<T>>
>;

export interface ComponentWithAs<T extends As, P> {
  <TT extends As>(props: PropsWithAs<TT, P>): JSX.Element;
  (props: PropsWithAs<T, P>): JSX.Element;
  displayName?: string;
  propTypes?: {
    [key: string]: Validator<any>;
  };
}

/*

Test components to make sure our dynamic As prop components work as intended

type PopupProps = {
  lol: string;
  children?: React.ReactNode | ((value?: number) => JSX.Element);
};

export const Popup = forwardRefWithAs<"input", PopupProps>(
  ({ as: Comp = "input", lol, className, children, ...props }, ref) => {
    return (
      <Comp ref={ref} {...props}>
        {typeof children === "function" ? children(56) : children}
      </Comp>
    );
  }
);

export const TryMe1: React.FC = () => {
  return <Popup as="input" lol="lol" name="me" />;
};

export const TryMe2: React.FC = () => {
  let ref = React.useRef(null);
  return <Popup ref={ref} as="div" lol="lol" />;
};

export const TryMe3: React.FC = () => {
  return <Popup as={Cool} lol="lol" name="me" test="123" />;
};

export const TryMe4: React.FC = () => {
  return <Popup as={Whoa} lol="lol" name="me" test="123" />;
};

export const Whoa: React.FC<{
  help?: boolean;
  lol: string;
  name: string;
  test: string;
}> = props => {
  return <input {...props} />;
};

let Cool = styled(Whoa)`
  padding: 10px;
`
*/
