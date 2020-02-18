import { Descendant } from "@reach/descendants";
import { DistributiveOmit } from "@reach/utils";
import { PopoverProps } from "@reach/popover";
import { StateMachine, EventObject as MachineEvent } from "@xstate/fsm";
import { ListboxEvents, ListboxStates } from "./machine";

export type ListboxValue = string;

export interface ListboxDescendantProps {
  value: ListboxValue;
  label: string;
}

export type ListboxOption = Descendant<HTMLElement, ListboxDescendantProps>;
export type ListboxOptions = ListboxOption[];

export interface ListboxContextValue {
  buttonId: string;
  buttonRef: ListobxButtonRef;
  disabled: boolean;
  expanded: boolean;
  inputRef: ListobxInputRef;
  instanceId: string;
  listboxId: string;
  listboxValue: ListboxValue | null;
  listboxValueLabel: string | null;
  listRef: ListobxListRef;
  mouseEventStartedRef: React.MutableRefObject<boolean>;
  mouseMovedRef: React.MutableRefObject<boolean>;
  onValueChange: ((newValue: ListboxValue) => void) | null | undefined;
  popoverRef: ListobxPopoverRef;
  send: StateMachine.Service<
    ListboxStateData,
    DistributiveOmit<ListboxEvent, "refs">
  >["send"];
  state: StateMachine.State<ListboxStateData, ListboxEvent, ListboxState>;
}

export interface ListboxGroupContextValue {
  labelId: string;
}

export type ListobxInputRef = React.MutableRefObject<HTMLDivElement | null>;
export type ListobxListRef = React.MutableRefObject<HTMLUListElement | null>;
export type ListobxButtonRef = React.MutableRefObject<HTMLButtonElement | null>;
export type ListobxPopoverRef = React.MutableRefObject<HTMLDivElement | null>;
export type ListobxOptionRef = React.MutableRefObject<HTMLDivElement | null>;

///

/**
 * Shared partial interface for all of our event objects.
 */
export interface ListboxEventBase extends MachineEventWithRefs {
  refs: ListboxNodeRefs;
}

/**
 * Event object for the checkbox state machine.
 */
export type ListboxEvent = ListboxEventBase &
  (
    | {
        type: ListboxEvents.Blur;
        relatedTarget: EventTarget | null;
      }
    | {
        type: ListboxEvents.GetDerivedData;
        data: Omit<Partial<ListboxStateData>, "refs"> & {
          refs?: Partial<ListboxStateData["refs"]>;
        };
      }
    | {
        type: ListboxEvents.ButtonPointerDown;
      }
    | {
        type: ListboxEvents.ButtonFinishClick;
      }
    | {
        type: ListboxEvents.ClearNavSelection;
      }
    | {
        type: ListboxEvents.Navigate;
        value: ListboxValue;
      }
    | {
        type: ListboxEvents.ValueChange;
        value: ListboxValue;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.KeyDownNavigate;
        value: ListboxValue | null;
        shouldManageFocus?: boolean;
        resetManagedFocus?(): void;
      }
    | {
        type: ListboxEvents.KeyDownSearch;
        query: string;
      }
    | {
        type: ListboxEvents.KeyDownEscape;
      }
    | {
        type: ListboxEvents.KeyDownEnter;
        value?: ListboxValue | null | undefined;
        disabled?: boolean;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.KeyDownSpace;
        value?: ListboxValue | null | undefined;
        disabled?: boolean;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.OptionStartClick;
      }
    | {
        type: ListboxEvents.OptionFinishClick;
        value: ListboxValue | null | undefined;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.KeyDownTab;
      }
    | {
        type: ListboxEvents.KeyDownShiftTab;
      }
    | {
        type: ListboxEvents.UpdateAfterTypeahead;
        query: string;
        callback?: ((newValue: ListboxValue) => void) | null | undefined;
      }
    | {
        type: ListboxEvents.ClearTypeahead;
      }
  );

/**
 * State object for the checkbox state machine.
 */
export type ListboxState = {
  value: ListboxStates;
  context: ListboxStateData;
};

export interface MachineEventWithRefs extends MachineEvent {
  refs: {
    [key: string]: any;
  };
}

export type MachineToReactRefMap<TE extends MachineEventWithRefs> = {
  [K in keyof TE["refs"]]: React.RefObject<TE["refs"][K]>;
};

/**
 * DOM nodes for all of the refs used in the listbox state machine.
 */
export type ListboxNodeRefs = {
  button: HTMLButtonElement | null;
  input: HTMLDivElement | null;
  list: HTMLUListElement | null;
  popover: HTMLDivElement | null;
};

export type ListboxStateData = {
  navigationValue: ListboxValue | null;
  refs: ListboxNodeRefs;
  typeaheadQuery: string | null;
  value: ListboxValue | null;
  options: ListboxOptions;
};

///////
// Component props

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
