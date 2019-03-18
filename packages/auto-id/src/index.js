import React, { createContext, useRef, useCallback, useContext } from "react";

// Most things that we auto-id aren't server rendered, and are rendered into
// portals anyway, so we can get away with random ids in a default context. If
// people need to server render with auto-ids, they can wrap their app in an
// IdProvider
const genId = () =>
  Math.random()
    .toString(32)
    .substring(2);

const Context = createContext(genId);

export const AutoIdProvider = ({ children }) => {
  const ref = useRef(0);
  // could use UUID but if we hit 9,007,199,254,740,991 unique components over
  // the lifetime of the app before it gets reloaded, I mean ... come on.
  // I don't even know what xillion that is.
  // /me googles
  // Oh duh, quadrillion. Nine quadrillion components. I think we're okay.
  const genId = useCallback(() => ++ref.current, []);
  return <Context.Provider value={genId} children={children} />;
};

export const useId = () => {
  const genId = useContext(Context);
  const ref = useRef(genId());
  return ref.current;
};
