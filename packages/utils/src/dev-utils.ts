/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useEffect } from "react";

declare const __DEV__: boolean;

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
