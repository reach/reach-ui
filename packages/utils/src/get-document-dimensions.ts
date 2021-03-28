import { getOwnerDocument } from "./owner-document";

/**
 * Get the size of the working document minus the scrollbar offset.
 *
 * @param element
 */
export function getDocumentDimensions(
  element?: HTMLElement | null | undefined
) {
  let ownerDocument = getOwnerDocument(element)!;
  let ownerWindow = ownerDocument.defaultView || window;
  if (!ownerDocument) {
    return {
      width: 0,
      height: 0,
    };
  }

  return {
    width: ownerDocument.documentElement.clientWidth ?? ownerWindow.innerWidth,
    height:
      ownerDocument.documentElement.clientHeight ?? ownerWindow.innerHeight,
  };
}
