import * as React from "react";
import { Validator } from "prop-types";
// import styled from 'styled-components';

export type AssignableRef<T = any> = React.Ref<T | null>;

export type SingleOrArray<T> = T[] | T;

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
