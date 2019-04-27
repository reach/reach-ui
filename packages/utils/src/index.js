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

export let wrapEvent = (handler, cb) => event => {
  handler && handler(event);
  if (!event.defaultPrevented) {
    return cb(event);
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

// This suuuuuuuuuuuucks but I can't think of anything better rn, we could use
// a default React Context, but I don't see how that's any different.
//
// If a Tooltip wraps a MenuButton and the menu returns focus to the button it
// triggers the tooltip focus event and pops up the tooltip and that's gross
// and this is a run-on sentence.  So, we've got this kind of global context
// for tooltip to know if it should respond to focus or not.
let ignoreTooltips = false;

export function disableTooltips() {
  ignoreTooltips = true;
}

export function enableTooltips() {
  ignoreTooltips = false;
}

export function shouldIgnoreTooltips() {
  return ignoreTooltips;
}
