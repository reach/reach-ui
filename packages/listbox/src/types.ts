import { Descendant } from "@reach/descendants";
import { DistributiveOmit } from "@reach/utils";
import { PopoverProps } from "@reach/popover";
import { StateMachine } from "@xstate/fsm";
import { ListboxEvent, ListboxState, ListboxStateData } from "./machine";

export type ListboxValue = string;

export interface DescendantProps {
  value: ListboxValue;
  label: string;
}

export type ListboxOption = Descendant<HTMLElement, DescendantProps>;
export type ListboxOptions = ListboxOption[];

export interface IListboxContext {
  buttonId: string;
  buttonRef: ListobxButtonRef;
  disabled: boolean;
  inputRef: ListobxInputRef;
  instanceId: string;
  isExpanded: boolean;
  listboxId: string;
  listboxValue: ListboxValue | null;
  listboxValueLabel: string | null;
  listRef: ListobxListRef;
  mouseMovedRef: React.MutableRefObject<boolean>;
  onValueChange: ((newValue: ListboxValue) => void) | null | undefined;
  popoverRef: ListobxPopoverRef;
  send: StateMachine.Service<
    ListboxStateData,
    DistributiveOmit<ListboxEvent, "refs">
  >["send"];
  state: StateMachine.State<ListboxStateData, ListboxEvent, ListboxState>;
}

export interface IListboxGroupContext {
  labelId: string;
}

export type ListobxInputRef = React.MutableRefObject<HTMLDivElement | null>;
export type ListobxListRef = React.MutableRefObject<HTMLUListElement | null>;
export type ListobxButtonRef = React.MutableRefObject<HTMLButtonElement | null>;
export type ListobxPopoverRef = React.MutableRefObject<HTMLDivElement | null>;
export type ListobxOptionRef = React.MutableRefObject<HTMLDivElement | null>;

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-props
 */
export type ListboxInputProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  // WHY ARE THESE A THING ON A DIV, UGH
  "autoComplete" | "autoFocus" | "form" | "name" | "onChange"
> &
  Pick<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "autoComplete" | "autoFocus" | "form" | "name" | "required"
  > & {
    children:
      | React.ReactNode
      | ((props: {
          value: ListboxValue | null;
          valueLabel: string | null;
        }) => React.ReactNode);
    onChange?(newValue: ListboxValue): void;
    value?: ListboxValue;
    // TODO: Maybe? multiple: boolean
  };

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listbox-props
 */
export type ListboxProps = ListboxInputProps & {
  arrow?: React.ReactNode | boolean;
  button?:
    | React.ReactNode
    | ((props: {
        value: ListboxValue | null;
        label: string | null;
      }) => React.ReactNode);
};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxbutton-props
 */
export type ListboxButtonProps = {
  arrow?: React.ReactNode | boolean;
  children?:
    | React.ReactNode
    | ((props: {
        value: ListboxValue | null;
        label: string;
        isExpanded: boolean;
      }) => React.ReactNode);
};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxarrow-props
 */
export type ListboxArrowProps = React.HTMLProps<HTMLSpanElement> & {
  children?:
    | React.ReactNode
    | ((props: { isExpanded: boolean }) => React.ReactNode);
};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxpopover-props
 */
export type ListboxPopoverProps = React.HTMLProps<HTMLDivElement> & {
  portal?: boolean;
  children: React.ReactNode;
  position?: PopoverProps["position"];
};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxlist-props
 */
export type ListboxListProps = {};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-props
 */
export type ListboxOptionProps = {
  value: ListboxValue;
  label?: string;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupProps = React.HTMLProps<HTMLDivElement> & {};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupLabelProps = {};
