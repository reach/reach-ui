import { Descendant } from "@reach/descendants";
import { DistributiveOmit } from "@reach/utils";
import { PopoverProps } from "@reach/popover";
import { StateMachine, MachineEvent } from "@reach/machine";
import { ListboxEvents, ListboxStates } from "./machine";

export type ListboxValue = string;

export interface ListboxDescendantProps {
  value: ListboxValue;
  label: string;
  disabled: boolean;
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
        type: ListboxEvents.OutsideMouseDown;
        relatedTarget: EventTarget | null;
      }
    | {
        type: ListboxEvents.GetDerivedData;
        data: Omit<Partial<ListboxStateData>, "refs"> & {
          refs?: Partial<ListboxStateData["refs"]>;
        };
      }
    | {
        type: ListboxEvents.ButtonMouseDown;
      }
    | {
        type: ListboxEvents.ButtonMouseUp;
      }
    | {
        type: ListboxEvents.ClearNavSelection;
      }
    | {
        type: ListboxEvents.Navigate;
        value: ListboxValue;
        disabled: boolean;
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
        disabled: boolean;
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

////////////////////////////////////////////////////////////////////////////////
// Component props

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-props
 */
export type ListboxInputProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  // WHY ARE THESE A THING ON A DIV, UGH
  "autoComplete" | "autoFocus" | "form" | "name" | "onChange" | "defaultValue"
> &
  Pick<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "autoComplete" | "autoFocus" | "form" | "name" | "required"
  > & {
    /**
     * The composed listbox expects to receive `ListboxButton` and
     * `ListboxPopover` as children. You can also pass in arbitrary wrapper
     * elements if desired.
     *
     * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-children
     */
    children:
      | React.ReactNode
      | ((props: {
          value: ListboxValue | null;
          valueLabel: string | null;
        }) => React.ReactNode);
    /**
     * The callback that fires when the listbox value changes.
     *
     * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-onchange
     * @param newValue
     */
    onChange?(newValue: ListboxValue): void;
    /**
     * The current value of the listbox.
     *
     * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-value
     */
    value?: ListboxValue;
    /**
     * The default value of an uncontrolled listbox.
     *
     * @see Docs https://reacttraining.com/reach-ui/listbox#listboxinput-defaultvalue
     */
    defaultValue?: ListboxValue;
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
  /**
   * The option's value. This will be passed into a hidden input field for use
   * in forms.
   *
   * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-value
   */
  value: ListboxValue;
  /**
   * The option's human-readable label. This prop is optional but highly
   * encouraged if your option has multiple text nodes that may or may not
   * correlate with the intended value. It is also ueful if the inner text node
   * begins with a character other than a readable letter (like an emoji or
   * symbol) so that typeahead works as expected for the user.
   *
   * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-label
   */
  label?: string;
  /**
   * Whether or not the option is disabled from selection and navigation.
   *
   * @see Docs https://reacttraining.com/reach-ui/listbox#listboxoption-disabled
   */
  disabled?: boolean;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupProps = Omit<
  React.HTMLProps<HTMLDivElement>,
  "label"
> & {
  /**
   * The text label to use for the listbox group. This can be omitted if a
   * group contains a `ListboxGroupLabel` component. The label should always
   * be human-readable.
   *
   * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-label
   */
  label?: string;
};

/**
 * @see Docs https://reacttraining.com/reach-ui/listbox#listboxgroup-props
 */
export type ListboxGroupLabelProps = {};
