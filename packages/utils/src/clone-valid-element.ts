import { cloneElement, isValidElement } from "react";
import type * as React from "react";

/**
 * Type-safe clone element
 *
 * @param element
 * @param props
 * @param children
 */
export function cloneValidElement<Props>(
  element: React.ReactElement<Props> | React.ReactNode,
  props?: Partial<Props> & React.Attributes,
  ...children: React.ReactNode[]
): React.ReactElement<Props> | React.ReactNode {
  return isValidElement(element)
    ? cloneElement(element, props, ...children)
    : element;
}
