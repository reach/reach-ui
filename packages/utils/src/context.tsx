import * as React from "react";

/** @deprecated */
export function createNamedContext<ContextValueType>(
  name: string,
  defaultValue: ContextValueType
): React.Context<ContextValueType> {
  let Ctx = React.createContext<ContextValueType>(defaultValue);
  if (__DEV__) {
    Ctx.displayName = name;
  }
  return Ctx;
}

////////////////////////////////////////////////////////////////////////////////

type ContextProvider<T> = React.FC<React.PropsWithChildren<T>>;

export function createContext<ContextValueType extends object | null>(
  rootName: string,
  defaultContext?: ContextValueType
): [
  ContextProvider<ContextValueType>,
  (childName: string) => ContextValueType
] {
  let Ctx = React.createContext<ContextValueType | undefined>(defaultContext);

  function Provider(props: React.PropsWithChildren<ContextValueType>) {
    let { children, ...context } = props;
    let value = React.useMemo(
      () => context,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(context)
    ) as ContextValueType;
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  function useContext(childName: string) {
    let context = React.useContext(Ctx);
    if (context) {
      return context;
    }
    if (defaultContext) {
      return defaultContext;
    }
    throw Error(
      `${childName} must be rendered inside of a ${rootName} component.`
    );
  }

  if (__DEV__) {
    Ctx.displayName = `${rootName}Context`;
    Provider.displayName = `${rootName}Provider`;
  }

  return [Provider, useContext];
}
