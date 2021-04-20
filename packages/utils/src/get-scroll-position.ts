import { getOwnerWindow } from "./owner-document";

/**
 * Get the scoll position of the global window object relative to a given node.
 *
 * @param element
 */
export function getScrollPosition(element?: HTMLElement | null | undefined) {
  let ownerWindow = getOwnerWindow(element);
  if (!ownerWindow) {
    return {
      scrollX: 0,
      scrollY: 0,
    };
  }

  return {
    scrollX: ownerWindow.scrollX,
    scrollY: ownerWindow.scrollY,
  };
}
