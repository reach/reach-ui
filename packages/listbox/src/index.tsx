import React, { forwardRef } from "react";
import { forwardRefWithAs } from "@reach/utils";

////////////////////////////////////////////////////////////////////////////////

/**
 * Listbox
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listbox-1
 */
export const Listbox = forwardRef<HTMLDivElement, ListboxProps>(
  function Listbox({ ...props }, forwardedRef) {
    return <div {...props} ref={forwardedRef} />;
  }
);

if (__DEV__) {
  Listbox.displayName = "Listbox";
  Listbox.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listbox-props
 */
export type ListboxProps = React.HTMLProps<HTMLDivElement> & {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxInput
 *
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput
 */
export const ListboxInput = forwardRef<HTMLDivElement, ListboxInputProps>(
  function ListboxInput({ ...props }, forwardedRef) {
    return <div {...props} ref={forwardedRef} />;
  }
);

if (__DEV__) {
  ListboxInput.displayName = "ListboxInput";
  ListboxInput.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-props
 */
export type ListboxInputProps = React.HTMLProps<HTMLDivElement> & {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxButton
 */
export const ListboxButton = forwardRefWithAs<ListboxButtonProps, "button">(
  function ListboxButton({ as: Comp = "button", ...props }, forwardedRef) {
    return <Comp {...props} ref={forwardedRef} />;
  }
);

if (__DEV__) {
  ListboxButton.displayName = "ListboxButton";
  ListboxButton.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxbutton-props
 */
export type ListboxButtonProps = {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxPopover
 */
export const ListboxPopover = forwardRef<HTMLDivElement, ListboxPopoverProps>(
  function ListboxPopover({ ...props }, forwardedRef) {
    return <div {...props} ref={forwardedRef} />;
  }
);

if (__DEV__) {
  ListboxPopover.displayName = "ListboxPopover";
  ListboxPopover.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxpopover-props
 */
export type ListboxPopoverProps = React.HTMLProps<HTMLDivElement> & {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxList
 */
export const ListboxList = forwardRef<HTMLDivElement, ListboxListProps>(
  function ListboxList({ ...props }, forwardedRef) {
    return <div {...props} ref={forwardedRef} />;
  }
);

if (__DEV__) {
  ListboxList.displayName = "ListboxList";
  ListboxList.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxlist-props
 */
export type ListboxListProps = React.HTMLProps<HTMLDivElement> & {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxOption
 */
export const ListboxOption = forwardRef<HTMLDivElement, ListboxOptionProps>(
  function ListboxOption({ ...props }, forwardedRef) {
    return <div {...props} ref={forwardedRef} />;
  }
);

if (__DEV__) {
  ListboxOption.displayName = "ListboxOption";
  ListboxOption.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-props
 */
export type ListboxOptionProps = React.HTMLProps<HTMLDivElement> & {};

////////////////////////////////////////////////////////////////////////////////

/**
 * ListboxGroup
 */
export const ListboxGroup = forwardRef<HTMLDivElement, ListboxGroupProps>(
  function ListboxGroup({ ...props }, forwardedRef) {
    return <div {...props} ref={forwardedRef} />;
  }
);

if (__DEV__) {
  ListboxGroup.displayName = "ListboxGroup";
  ListboxGroup.propTypes = {};
}

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupProps = React.HTMLProps<HTMLDivElement> & {};

////////////////////////////////////////////////////////////////////////////////
