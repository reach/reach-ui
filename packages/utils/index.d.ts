import * as React from "react";

/**
 * When in dev mode, checks that styles for a given @reach package are loaded.
 *
 * @param packageName Name of the package to check.
 * @example checkStyles("dialog") will check for styles for @reach/dialog
 */
export function checkStyles(packageName: string): void;

/**
 * Passes or assigns an arbitrary value to a ref function or object.
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
 * Joins strings to format IDs for compound components.
 *
 * @param args
 */
export function makeId(...args: (string | number)[]): string;

/**
 * No-op function.
 */
export function noop(): void;

/**
 * Passes or assigns a value to multiple refs (typically a DOM node). Useful for
 * dealing with components that need an explicit ref for DOM calculations but
 * also forwards refs assigned by an app.
 *
 * @param refs Refs to fork
 */
export function useForkedRef<T = any>(...refs: React.Ref<T>[]): void;

/**
 * Returns the previous value of a reference after a component update.
 *
 * @param value
 */
export function usePrevious<T>(value: T): T;

/**
 * Call an effect after a component update, skipping the initial mount.
 *
 * @param effect Effect to call
 * @param deps Effect dependency list
 */
export function useUpdateEffect(effect: () => any, deps?: any[]): void;

/**
 * Wraps a lib-defined event handler and a user-defined event handler, returning
 * a single handler that allows a user to prevent lib-defined handlers from
 * firing.
 *
 * @param theirHandler User-supplied event handler
 * @param ourHandler Library-supplied event handler
 */
export function wrapEvent<
  E extends React.SyntheticEvent = React.SyntheticEvent
>(theirHandler: (event: E) => any, ourHandler: (event: E) => any): void;
