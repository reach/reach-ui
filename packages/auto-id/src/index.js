import { useMemo } from "react";

// Could use UUID but if we hit 9,007,199,254,740,991 unique components over
// the lifetime of the app before it gets reloaded, I mean ... come on.
// I don't even know what xillion that is.
// /me googles
// Oh duh, quadrillion. Nine quadrillion components. I think we're okay.
let id = 0;

export const useId = () => {
  return useMemo(() => id++, [])
};
