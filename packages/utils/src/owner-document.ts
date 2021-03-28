import { canUseDOM } from "./can-use-dom";

/**
 * Get an element's owner document. Useful when components are used in iframes
 * or other environments like dev tools.
 *
 * @param element
 */
export function getOwnerDocument<T extends Element>(
  element: T | null | undefined
) {
  return canUseDOM() ? (element ? element.ownerDocument : document) : null;
}

/**
 * TODO: Remove in 1.0
 */
export function getOwnerWindow<T extends Element>(
  element: T | null | undefined
) {
  let ownerDocument = getOwnerDocument(element);
  return ownerDocument ? ownerDocument.defaultView || window : null;
}
