import * as React from "react";

/**
 * When in dev mode, checks that styles for a given @reach package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example checkStyles("dialog") will check for styles for @reach/dialog
 */
export function checkStyles(packageName: string): void;

/**
 * Assigns a given value to a variable ref.
 *
 * @param ref
 * @param value
 */
export function assignRef<T = any>(ref: React.Ref<T>, value: any): void;

/**
 * Get the scrollbar offset distance.
 */
export function getScrollbarOffset(): number;

/**
 * Appends a given index to a ID for easy ID formatting.
 *
 * @param id
 * @param index
 */
export function makeId(id: string | number, index: string | number): string;

/**
 * Assigns multiple refs to the same value (typically a DOM node).
 * Useful for dealing with components that need an explicit ref
 * for DOM calculations but also accept user-passed refs.
 *
 * @param refs Refs to fork
 */
export function useForkedRef<T = any>(...refs: React.Ref<T>[]): void;

/**
 * Returns the most recent previous value of a given value
 * before an update.
 *
 * @param value
 */
export function usePrevious<T>(value: T): T;

/**
 * Call an effect only after a component has mounted.
 *
 * @param effect Effect to call
 * @param deps Effect dependency list
 */
export function useUpdateEffect(effect: () => any, deps?: any[]): void;

/**
 * Wraps a lib-defined event handler and a user-defined event handler,
 * returning a single handler that allows a user to prevent lib-defined
 * handlers from firing.
 *
 * @param theirHandler User-supplied event handler
 * @param ourHandler Library-supplied event handler
 */
export function wrapEvent<
  E extends React.SyntheticEvent = React.SyntheticEvent
>(theirHandler: (event: E) => any, ourHandler: (event: E) => any): void;
