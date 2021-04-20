import { createContext } from "react";
import type * as React from "react";

export function createNamedContext<ContextValueType>(
  name: string,
  defaultValue: ContextValueType
): React.Context<ContextValueType> {
  const Ctx = createContext<ContextValueType>(defaultValue);
  if (__DEV__) {
    Ctx.displayName = name;
  }
  return Ctx;
}
