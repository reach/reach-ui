import { useRef, useEffect } from "react";
import { noop } from "./noop";
// import type * as React from "react";

let checkedPkgs: { [key: string]: boolean } = {};

/**
 * Just a lil state logger
 *
 * @param state
 * @param DEBUG
 */
let useStateLogger: (state: string, DEBUG: boolean) => void = noop;

/**
 * When in dev mode, checks that styles for a given `@reach` package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example checkStyles("dialog") will check for styles for @reach/dialog
 */
let checkStyles: (packageName: string) => void = noop;

/**
 * When in dev mode, checks that styles for a given `@reach` package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example useCheckStyles("dialog") will check for styles for @reach/dialog
 */
let useCheckStyles: (packageName: string) => void = noop;

/**
 * Logs a warning in dev mode when a component switches from controlled to
 * uncontrolled, or vice versa
 *
 * A single prop should typically be used to determine whether or not a
 * component is controlled or not.
 *
 * @param controlledValue
 * @param controlledPropName
 * @param componentName
 */
let useControlledSwitchWarning: (
  controlledValue: any,
  controlledPropName: string,
  componentName: string
) => void = noop;

if (__DEV__) {
  useStateLogger = function useStateLogger(state, DEBUG = false) {
    let debugRef = useRef(DEBUG);
    useEffect(() => {
      debugRef.current = DEBUG;
    }, [DEBUG]);
    useEffect(() => {
      if (debugRef.current) {
        console.group("State Updated");
        console.log(
          "%c" + state,
          "font-weight: normal; font-size: 120%; font-style: italic;"
        );
        console.groupEnd();
      }
    }, [state]);
  };

  // In CJS files, process.env.NODE_ENV is stripped from our build, but we need
  // it to prevent style checks from clogging up user logs while testing.
  // This is a workaround until we can tweak the build a bit to accommodate.
  let { env } =
    typeof process !== "undefined"
      ? process
      : { env: { NODE_ENV: "development" } };

  checkStyles = function checkStyles(packageName: string) {
    // only check once per package
    if (checkedPkgs[packageName]) return;
    checkedPkgs[packageName] = true;

    if (
      env.NODE_ENV !== "test" &&
      parseInt(
        window
          .getComputedStyle(document.body)
          .getPropertyValue(`--reach-${packageName}`),
        10
      ) !== 1
    ) {
      console.warn(
        `@reach/${packageName} styles not found. If you are using a bundler like webpack or parcel include this in the entry file of your app before any of your own styles:
  
      import "@reach/${packageName}/styles.css";
  
    Otherwise you'll need to include them some other way:
  
      <link rel="stylesheet" type="text/css" href="node_modules/@reach/${packageName}/styles.css" />
  
    For more information visit https://ui.reach.tech/styling.
    `
      );
    }
  };

  useCheckStyles = function useCheckStyles(pkg: string) {
    let name = useRef(pkg);
    useEffect(() => void (name.current = pkg), [pkg]);
    useEffect(() => checkStyles(name.current), []);
  };

  useControlledSwitchWarning = function useControlledSwitchWarning(
    controlledValue,
    controlledPropName,
    componentName
  ) {
    let controlledRef = useRef(controlledValue != null);
    let nameCache = useRef({ componentName, controlledPropName });
    useEffect(() => {
      nameCache.current = { componentName, controlledPropName };
    }, [componentName, controlledPropName]);

    useEffect(() => {
      let { current: wasControlled } = controlledRef;
      let { componentName, controlledPropName } = nameCache.current;
      let isControlled = controlledValue != null;
      if (wasControlled !== isControlled) {
        console.error(
          `A component is changing an ${
            wasControlled ? "" : "un"
          }controlled \`${controlledPropName}\` state of ${componentName} to be ${
            wasControlled ? "un" : ""
          }controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled ${componentName} element for the lifetime of the component.
  More info: https://fb.me/react-controlled-components`
        );
      }
    }, [controlledValue]);
  };
}

export {
  checkStyles,
  useCheckStyles,
  useStateLogger,
  useControlledSwitchWarning,
};
