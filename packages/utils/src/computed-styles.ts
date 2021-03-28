import { getOwnerWindow } from "./owner-document";

/**
 * Get computed style properties of a DOM element.
 *
 * @param element
 * @param styleProp
 */
export function getComputedStyles(
  element: Element
): CSSStyleDeclaration | null {
  let ownerWindow = getOwnerWindow(element);
  if (ownerWindow) {
    return ownerWindow.getComputedStyle(element, null);
  }
  return null;
}

/**
 * Get a computed style value by property.
 *
 * @param element
 * @param styleProp
 */
export function getComputedStyle(element: Element, styleProp: string) {
  return getComputedStyles(element)?.getPropertyValue(styleProp) || null;
}
