import { useRef, useMemo, useEffect } from "react";

let checkedPkgs = {};

let checkStyles = () => {};

if (__DEV__) {
  checkStyles = pkg => {
    // only check once per package
    if (checkedPkgs[pkg]) return;
    checkedPkgs[pkg] = true;

    if (
      parseInt(
        window
          .getComputedStyle(document.body)
          .getPropertyValue(`--reach-${pkg}`),
        10
      ) !== 1
    ) {
      console.warn(
        `@reach/${pkg} styles not found. If you are using a bundler like webpack or parcel include this in the entry file of your app before any of your own styles:

    import "@reach/${pkg}/styles.css";

  Otherwise you'll need to include them some other way:

    <link rel="stylesheet" type="text/css" href="node_modules/@reach/${pkg}/styles.css" />

  For more information visit https://ui.reach.tech/styling.
  `
      );
    }
  };
}

export { checkStyles };

export let wrapEvent = (theirHandler, ourHandler) => event => {
  theirHandler && theirHandler(event);
  if (!event.defaultPrevented) {
    return ourHandler(event);
  }
};

export const assignRef = (ref, value) => {
  if (ref == null) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    try {
      ref.current = value;
    } catch (error) {
      throw new Error(`Cannot assign value "${value}" to ref "${ref}"`);
    }
  }
};

export function useUpdateEffect(effect, deps) {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      effect();
    } else {
      mounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useForkedRef(...refs) {
  return useMemo(() => {
    if (refs.every(ref => ref == null)) {
      return null;
    }
    return node => {
      refs.forEach(ref => {
        assignRef(ref, node);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

export const makeId = (id, index) => `${id}--${index}`;
