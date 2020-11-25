import * as React from "react";
// import { forwardRefWithAs } from './index';
// import styled from 'styled-components';

type ReactElement = React.ReactElement;

/**
 * React.Ref uses the readonly type `React.RefObject` instead of
 * `React.MutableRefObject`, We pretty much always assume ref objects are
 * mutable (at least when we create them), so this type is a workaround so some
 * of the weird mechanics of using refs with TS.
 */
export type AssignableRef<ValueType> =
  | {
      bivarianceHack(instance: ValueType | null): void;
    }["bivarianceHack"]
  | React.MutableRefObject<ValueType | null>;

/**
 * Type can be either a single `ValueType` or an array of `ValueType`
 */
export type SingleOrArray<ValueType> = ValueType[] | ValueType;

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
 *    type B =
 *      | Omit<{ a: "whatever"; b: number }, "a">
        | Omit<{ a: "whatever"; b: string; c: number }, "a">;
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
export type DistributiveOmit<
  BaseType,
  Key extends PropertyKey
> = BaseType extends any ? Omit<BaseType, Key> : never;

/**
 * Returns the type inferred by a promise's return value.
 *
 * @example
 * async function getThing() {
 *   // return type is a number
 *   let result: number = await fetchValueSomewhere();
 *   return result;
 * }
 *
 * type Thing = ThenArg<ReturnType<typeof getThing>>;
 * // number
 */
export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

////////////////////////////////////////////////////////////////////////////////
// The following types help us deal with the `as` prop.

export type As<BaseProps = any> = React.ElementType<BaseProps>;

export type PropsWithAs<
  ComponentType extends As,
  ComponentProps
> = ComponentProps &
  Omit<
    React.ComponentPropsWithRef<ComponentType>,
    "as" | keyof ComponentProps
  > & {
    as?: ComponentType;
  };

export type PropsFromAs<
  ComponentType extends As,
  ComponentProps
> = (PropsWithAs<ComponentType, ComponentProps> & { as: ComponentType }) &
  PropsWithAs<ComponentType, ComponentProps>;

// TODO: Remove in 1.0
export type ComponentWithForwardedRef<
  ElementType extends React.ElementType,
  ComponentProps
> = React.ForwardRefExoticComponent<
  ComponentProps &
    React.HTMLProps<React.ElementType<ElementType>> &
    React.ComponentPropsWithRef<ElementType>
>;

export interface FunctionComponentWithAs<
  DefaultComponentType extends As,
  ComponentProps
> {
  /**
   * Inherited from React.FunctionComponent with modifications to support `as`
   */
  <ComponentType extends As>(
    props: PropsWithAs<ComponentType, ComponentProps>,
    context?: any
  ): React.ReactElement<any, any> | null;
  (
    props: PropsWithAs<DefaultComponentType, ComponentProps>,
    context?: any
  ): React.ReactElement<any, any> | null;

  /**
   * Inherited from React.FunctionComponent
   */
  displayName?: string;
  propTypes?: React.WeakValidationMap<
    PropsWithAs<DefaultComponentType, ComponentProps>
  >;
  contextTypes?: React.ValidationMap<any>;
  defaultProps?: Partial<PropsWithAs<DefaultComponentType, ComponentProps>>;
}

// TODO: Remove in 1.0
export interface ComponentWithAs<ComponentType extends As, ComponentProps>
  extends FunctionComponentWithAs<ComponentType, ComponentProps> {}

interface ExoticComponentWithAs<
  DefaultComponentType extends As,
  ComponentProps
> {
  /**
   * **NOTE**: Exotic components are not callable.
   * Inherited from React.ExoticComponent with modifications to support `as`
   */
  (
    props: PropsWithAs<DefaultComponentType, ComponentProps>
  ): React.ReactElement | null;
  <ComponentType extends As>(
    props: PropsWithAs<ComponentType, ComponentProps> & {
      as: ComponentType;
    }
  ): React.ReactElement | null;

  /**
   * Inherited from React.ExoticComponent
   */
  readonly $$typeof: symbol;
}

interface NamedExoticComponentWithAs<
  DefaultComponentType extends As,
  ComponentProps
> extends ExoticComponentWithAs<DefaultComponentType, ComponentProps> {
  /**
   * Inherited from React.NamedExoticComponent
   */
  displayName?: string;
}

export interface ForwardRefExoticComponentWithAs<
  DefaultComponentType extends As,
  ComponentProps
> extends NamedExoticComponentWithAs<DefaultComponentType, ComponentProps> {
  /**
   * Inherited from React.ForwardRefExoticComponent
   * Will show `ForwardRef(${Component.displayName || Component.name})` in devtools by default,
   * but can be given its own specific name
   */
  defaultProps?: Partial<PropsWithAs<DefaultComponentType, ComponentProps>>;
  propTypes?: React.WeakValidationMap<
    PropsWithAs<DefaultComponentType, ComponentProps>
  >;
}

export interface MemoExoticComponentWithAs<
  DefaultComponentType extends As,
  ComponentProps
> extends NamedExoticComponentWithAs<DefaultComponentType, ComponentProps> {
  readonly type: DefaultComponentType extends React.ComponentType
    ? DefaultComponentType
    : FunctionComponentWithAs<DefaultComponentType, ComponentProps>;
}

export interface ForwardRefWithAsRenderFunction<
  DefaultComponentType extends As,
  ComponentProps = {}
> {
  (
    props: React.PropsWithChildren<
      PropsFromAs<DefaultComponentType, ComponentProps>
    >,
    ref:
      | ((
          instance:
            | (DefaultComponentType extends keyof ElementTagNameMap
                ? ElementTagNameMap[DefaultComponentType]
                : any)
            | null
        ) => void)
      | React.MutableRefObject<
          | (DefaultComponentType extends keyof ElementTagNameMap
              ? ElementTagNameMap[DefaultComponentType]
              : any)
          | null
        >
      | null
  ): React.ReactElement | null;
  displayName?: string;
  // explicit rejected with `never` required due to
  // https://github.com/microsoft/TypeScript/issues/36826
  /**
   * defaultProps are not supported on render functions
   */
  defaultProps?: never;
  /**
   * propTypes are not supported on render functions
   */
  propTypes?: never;
}

export type ElementTagNameMap = HTMLElementTagNameMap &
  Pick<
    SVGElementTagNameMap,
    Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>
  >;

/*

Test components to make sure our dynamic As prop components work as intended

type PopupProps = {
  lol: string;
  children?: React.ReactNode | ((value?: number) => JSX.Element);
};

export const Popup = forwardRefWithAs<PopupProps, "input">(
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
