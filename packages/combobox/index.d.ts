declare module "@reach/combobox" {
  import * as React from "react";

  export type ComboboxProps = {
    children?: React.ReactNode;
    onSelect?: (value: string) => void;
    openOnFocus?: boolean;
    as?: string;
  } & Omit<React.HTMLProps<HTMLElement>, "onSelect">;

  export type ComboboxInputProps = {
    selectOnClick?: boolean;
    autocomplete?: boolean;
    value?: string;
    as?: string;
  } & React.HTMLProps<HTMLElement>;

  export type ComboboxPopoverProps = {
    portal?: boolean;
  } & React.HTMLProps<HTMLElement>;

  export type ComboboxListProps = {
    persistSelection?: boolean;
    as?: string;
  } & React.HTMLProps<HTMLElement>;

  export type ComboboxOptionProps = {
    children?: React.ReactNode;
    value: string;
  } & React.HTMLProps<HTMLElement>;

  export const Combobox: React.FunctionComponent<ComboboxProps>;
  export const ComboboxInput: React.FunctionComponent<ComboboxInputProps>;
  export const ComboboxPopover: React.FunctionComponent<ComboboxPopoverProps>;
  export const ComboboxList: React.FunctionComponent<ComboboxListProps>;
  export const ComboboxOption: React.FunctionComponent<ComboboxOptionProps>;
  export const ComboboxOptionText: React.FunctionComponent;
}
