/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useEffect } from "react";

let checkedPkgs: { [key: string]: boolean } = {};

/**
 * Just a lil state logger
 *
 * @param state
 * @param DEBUG
 */
export function useStateLogger(state: string, DEBUG = false): void {
  if (__DEV__) {
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
  }
}

/**
 * When in dev mode, checks that styles for a given `@reach` package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example checkStyles("dialog") will check for styles for @reach/dialog
 */
export function checkStyles(packageName: string): void {
  if (__DEV__) {
    // In CJS files, process.env.NODE_ENV is stripped from our build, but we
    // need it to prevent style checks from clogging up user logs while testing.
    // This is a workaround until we can tweak the build a bit to accommodate.
    let { NODE_ENV: environment } =
      typeof process !== "undefined"
        ? process.env
        : { NODE_ENV: "development" };

    // only check once per package
    if (checkedPkgs[packageName]) return;
    checkedPkgs[packageName] = true;

    if (
      environment === "development" &&
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
  }
}

/**
 * When in dev mode, checks that styles for a given `@reach` package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example useCheckStyles("dialog") will check for styles for @reach/dialog
 */
export function useCheckStyles(packageName: string): void {
  if (__DEV__) {
    let name = useRef(packageName);
    useEffect(() => void (name.current = packageName), [packageName]);
    useEffect(() => checkStyles(name.current), []);
  }
}

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
export function useControlledSwitchWarning(
  controlledValue: any,
  controlledPropName: string,
  componentName: string
): void {
  if (__DEV__) {
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
  }
}
