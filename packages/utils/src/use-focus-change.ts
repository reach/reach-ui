import { useRef, useEffect } from "react";

/**
 * Detect when focus changes in our document.
 *
 * @param handleChange
 * @param when
 * @param ownerDocument
 */
export function useFocusChange(
	handleChange: (
		activeElement: Element | null,
		previousActiveElement: Element | null,
		event?: FocusEvent
	) => void = console.log,
	when: "focus" | "blur" = "focus",
	ownerDocument: Document = document
) {
	let lastActiveElement = useRef(ownerDocument.activeElement);

	useEffect(() => {
		lastActiveElement.current = ownerDocument.activeElement;

		function onChange(event: FocusEvent) {
			if (
				when === "focus" &&
				lastActiveElement.current === ownerDocument.activeElement
			) {
				return;
			}
			handleChange(
				ownerDocument.activeElement,
				lastActiveElement.current,
				event
			);
			lastActiveElement.current = ownerDocument.activeElement;
		}

		ownerDocument.addEventListener(when, onChange, true);

		return () => {
			ownerDocument.removeEventListener(when, onChange, true);
		};
	}, [when, handleChange, ownerDocument]);
}
