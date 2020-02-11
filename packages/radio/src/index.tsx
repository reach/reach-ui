/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, {
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  Fragment,
  useMemo,
} from "react";
import {
  checkStyles,
  createNamedContext,
  DistributiveOmit,
  forwardRefWithAs,
  getOwnerDocument,
  isFunction,
  isString,
  useIsomorphicLayoutEffect as useLayoutEffect,
  wrapEvent,
  useForkedRef,
  noop,
  makeId,
} from "@reach/utils";
import {
  createDescendantContext,
  Descendant,
  DescendantProvider,
  useDescendant,
  useDescendants,
} from "@reach/descendants";
import {
  assign,
  createMachine,
  EventObject as MachineEvent,
  interpret,
  StateMachine,
} from "@xstate/fsm";
import { useId } from "@reach/auto-id";

const RadioDescendantsContext = createDescendantContext<
  HTMLElement,
  DescendantProps
>("RadioDescendantsContext");
const RadioGroupContext = createNamedContext(
  "RadioGroupContext",
  {} as RadioGroupContextValue
);
const useRadioGroupContext = () => useContext(RadioGroupContext);

////////////////////////////////////////////////////////////////////////////////
// States

export enum RadioGroupStates {
  Idle = "IDLE",
  Navigating = "NAVIGATING",
}

type RadioGroupState =
  | {
      value: RadioGroupStates.Idle;
      context: RadioGroupData;
    }
  | {
      value: RadioGroupStates.Navigating;
      context: RadioGroupData;
    };

////////////////////////////////////////////////////////////////////////////////
// Events

export enum RadioGroupEvents {
  Blur = "BLUR",
  Focus = "FOCUS",
  KeyDown = "KEY_DOWN",
  SetValue = "SET_VALUE",
  Select = "SELECT",
}

/**
 * Shared partial interface for all of our event objects.
 */
interface RadioGroupEventBase extends MachineEventWithRefs {
  refs: RadioGroupNodeRefs;
}

/**
 * Event object for the checkbox state machine.
 */
export type RadioGroupEvent = RadioGroupEventBase &
  (
    | {
        type: RadioGroupEvents.Select;
        value: RadioValue;
        node: HTMLElement | null | undefined;
      }
    | {
        type: RadioGroupEvents.KeyDown;
        domEvent: KeyboardEvent;
        isRTL: boolean;
        key: string;
        options: Descendant<HTMLElement, DescendantProps>[];
        value: RadioValue;
      }
    | {
        type: RadioGroupEvents.SetValue;
        value: RadioValue | null;
      }
    | {
        type: RadioGroupEvents.Focus;
        value: RadioValue;
      }
    | {
        type: RadioGroupEvents.Blur;
      }
  );
////////////////////////////////////////////////////////////////////////////////

/**
 * Assign refs to the machine's context data
 */
const assignRefs = assign((data: RadioGroupData, event: RadioGroupEvent) => {
  return {
    ...data,
    refs: event.refs,
  };
});

const setValue = assign({
  value: (data: RadioGroupData, event: any) => event.value,
});

const navigate = assign<RadioGroupData, RadioGroupEvent>({
  value: (data, event) => {
    if (event.type !== RadioGroupEvents.KeyDown) {
      return data.value;
    }
    let { key, options, value, isRTL, domEvent } = event;

    if (!(key || options || value || domEvent)) {
      return data.value;
    }

    let navOption: Descendant<HTMLElement, DescendantProps>;
    let currentIndex = options.findIndex(option => option.value === value);
    let first = options[0];
    let last = options[options.length - 1];
    let next =
      currentIndex === options.length - 1 ? first : options[currentIndex + 1];
    let prev = currentIndex === 0 ? last : options[currentIndex - 1];

    switch (key) {
      case " ":
        navOption = options[currentIndex];
        break;
      case "ArrowRight":
        navOption = isRTL ? prev : next;
        break;
      case "ArrowLeft":
        navOption = isRTL ? next : prev;
        break;
      case "ArrowDown":
        domEvent.preventDefault();
        navOption = next;
        break;
      case "ArrowUp":
        domEvent.preventDefault();
        navOption = prev;
        break;
      case "Home":
        domEvent.preventDefault();
        navOption = first;
        break;
      case "End":
        domEvent.preventDefault();
        navOption = last;
        break;
      default:
        return data.value;
    }

    if (navOption) {
      navOption.element?.focus();
      return navOption.value;
    }

    return data.value;
  },
});

function focusSelected(data: RadioGroupData, event: any) {
  event.node && event.node.focus();
}

const commonEvents = {
  [RadioGroupEvents.SetValue]: {
    actions: [setValue],
  },
  [RadioGroupEvents.Select]: {
    target: RadioGroupStates.Navigating,
    actions: [setValue, focusSelected],
  },
  [RadioGroupEvents.Blur]: {
    target: RadioGroupStates.Idle,
  },
  [RadioGroupEvents.Focus]: {
    target: RadioGroupStates.Navigating,
  },
};

/**
 * Initializer for our state machine.
 *
 * @param initial
 * @param props
 */
export const createRadioMachine = (props: {
  isControlled: boolean;
  value: RadioValue | null;
}) =>
  createMachine<RadioGroupData, RadioGroupEvent, RadioGroupState>({
    id: "radio-group",
    initial: RadioGroupStates.Idle,
    context: {
      isControlled: props.isControlled,
      value: props.value,
      refs: {},
    },
    states: {
      [RadioGroupStates.Idle]: {
        entry: assignRefs,
        on: {
          ...commonEvents,
        },
      },
      [RadioGroupStates.Navigating]: {
        entry: assignRefs,
        on: {
          ...commonEvents,
          [RadioGroupEvents.KeyDown]: {
            target: RadioGroupStates.Navigating,
            actions: [navigate],
          },
        },
      },
    },
  });

////////////////////////////////////////////////////////////////////////////////

/**
 * RadioGroup
 *
 * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup
 */
export const RadioGroup = forwardRefWithAs<RadioGroupProps, "div">(
  function RadioGroup(
    {
      as: Comp = "div",
      children,
      defaultValue,
      value: valueProp,
      name,
      onChange,
      ...props
    },
    forwardedRef
  ) {
    let { current: isControlled } = useRef(typeof valueProp !== "undefined");
    let [radioOptions, setRadioOptions] = useDescendants<
      HTMLElement,
      DescendantProps
    >();
    let [isRTL, setIsRTL] = useState(false);
    let ownRef = useRef<HTMLElement>(null);
    let ref = useForkedRef(forwardedRef, ownRef);

    let initialValue = isControlled
      ? (valueProp as RadioValue | null)
      : defaultValue || null;

    let [current, send] = useMachine(
      createRadioMachine({
        isControlled,
        value: initialValue,
      }),
      {}
    );

    let context: RadioGroupContextValue = {
      state: current,
      isControlled,
      isRTL,
      name,
      value: current.context.value,
      send,
    };

    if (isControlled && current.context.value !== valueProp) {
      // If the component is controlled, we'll sync state machine with the
      // controlled state from props
      send({
        type: RadioGroupEvents.SetValue,
        value: valueProp as RadioValue | null,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(() => {
      let doc = getOwnerDocument(ownRef.current!)!;
      // TODO: Should probably listen for changes in a mutation observer
      setIsRTL(() => {
        if (
          doc.dir === "rtl" ||
          getStyle(ownRef.current!, "direction") === "rtl"
        ) {
          return true;
        }
        return false;
      });
    }, []);

    useEffect(() => checkStyles("radio"), []);

    return (
      <DescendantProvider
        context={RadioDescendantsContext}
        items={radioOptions}
        set={setRadioOptions}
      >
        <RadioGroupContext.Provider value={context}>
          <Comp
            role="radiogroup"
            {...props}
            ref={ref}
            data-reach-radio-group=""
          >
            {children}
          </Comp>
        </RadioGroupContext.Provider>
      </DescendantProvider>
    );
  }
);

/**
 * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-props
 */
export type RadioGroupProps = {
  /**
   * Like form inputs, a radio group's state can be controlled by the owner.
   * Make sure to include an `onChange` as well, or else the radio group will
   * not be interactive.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-value
   */
  value?: RadioValue;
  /**
   * The default selected value for an uncontrolled radio group component.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-defaultvalue
   */
  defaultValue?: RadioValue;
  /**
   * The `name` attribute passed to a hidden form input.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radiogroup-name
   */
  name?: React.InputHTMLAttributes<HTMLInputElement>["name"];
  /**
   * Calls back with the value whenever the user changes the active radio
   * button.
   *
   * @see Docs https://reacttraining.com/reach-ui/tabs#tabs-props
   */
  onChange?: (value: RadioValue) => void;
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Radio
 *
 * @see Docs https://reacttraining.com/reach-ui/radio#radio-1
 */
export const Radio = forwardRefWithAs<RadioProps, "span">(function Radio(
  {
    as: Comp = "span",
    children,
    onBlur,
    onClick,
    onFocus,
    onKeyDown,
    disabled,
    readOnly,
    value,
    ...props
  },
  forwardedRef
) {
  let { isRTL, value: groupValue, name, send } = useRadioGroupContext();
  let { descendants: radioOptions } = useContext(RadioDescendantsContext);
  let ownRef = useRef<HTMLElement | null>(null);
  let ref = useForkedRef(forwardedRef, ownRef);
  let isSelected = value === groupValue;
  let index = useDescendant({
    element: ownRef.current!,
    context: RadioDescendantsContext,
    disabled: !!disabled,
    value,
  });

  let focusableOptions: Descendant<
    HTMLElement,
    DescendantProps
  >[] = useMemo(() => {
    let nodes = [];
    for (let option of radioOptions) {
      if (option.element && !option.disabled) {
        nodes.push(option);
      }
    }
    return nodes;
  }, [radioOptions]);

  function handleClick() {
    send({
      type: RadioGroupEvents.Select,
      value,
      node: ownRef.current,
    });
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    send({
      type: RadioGroupEvents.KeyDown,
      isRTL,
      key: event.key,
      domEvent: event.nativeEvent,
      options: focusableOptions,
      value,
    });
  }

  function handleBlur() {
    send({ type: RadioGroupEvents.Blur });
  }

  function handleFocus() {
    send({ type: RadioGroupEvents.Focus, value });
  }

  let isTabbable = isSelected || (groupValue === null && index === 0);
  let _id = useId(props.id);
  let id = props.id ?? makeId("radio", value, _id);
  let labelId = makeId("label", id);

  return (
    <Fragment>
      <Comp
        aria-checked={isSelected}
        aria-labelledby={children ? labelId : undefined}
        role="radio"
        {...props}
        data-reach-radio=""
        ref={ref}
        id={id}
        onBlur={wrapEvent(onBlur, handleBlur)}
        onClick={wrapEvent(onClick, handleClick)}
        onFocus={wrapEvent(onFocus, handleFocus)}
        onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
        tabIndex={isTabbable ? 0 : -1}
      />
      {children && (
        <span
          id={labelId}
          data-reach-radio-label=""
          onClick={wrapEvent(onClick, event => {
            event.preventDefault();
            handleClick();
          })}
        >
          {children}
        </span>
      )}
      {name && (
        <input
          checked={isSelected}
          hidden
          name={name}
          type="radio"
          value={value}
        />
      )}
    </Fragment>
  );
});

/**
 * @see Docs https://reacttraining.com/reach-ui/radio#radio-props
 */
export type RadioProps = {
  /**
   * Whether or not the radio button is disabled.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radio-disabled
   */
  disabled?: boolean;
  /**
   * Whether or not the radio button is read-only. The button will still be
   * focusabled but not selectable.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radio-readonly
   */
  readOnly?: boolean;
  /**
   * The `value` attribute for the radio selection.
   *
   * @see Docs https://reacttraining.com/reach-ui/radio#radio-value
   */
  value: RadioValue;
};

////////////////////////////////////////////////////////////////////////////////
// Types

type RadioValue = string;

type DescendantProps = { disabled: boolean; value: RadioValue };

interface RadioGroupData {
  isControlled: boolean;
  refs: RadioGroupNodeRefs;
  value: RadioValue | null;
}

interface RadioGroupContextValue {
  state: StateMachine.State<RadioGroupData, RadioGroupEvent, any>;
  isControlled: boolean;
  isRTL: boolean;
  name: string | undefined;
  value: RadioValue | null;
  send: StateMachine.Service<
    RadioGroupData,
    DistributiveOmit<RadioGroupEvent, "refs">
  >["send"];
}

type RadioGroupNodeRefs = {};

/**
 * Events use in our `useMachine` always have a refs object and will inherit
 * this interface.
 */
export interface MachineEventWithRefs extends MachineEvent {
  refs: {
    [key: string]: any;
  };
}

export type MachineToReactRefMap<TE extends MachineEventWithRefs> = {
  [K in keyof TE["refs"]]: React.RefObject<TE["refs"][K]>;
};

////////////////////////////////////////////////////////////////////////////////

function useMachine<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs
>(
  initialMachine: StateMachine.Machine<TC, TE, any>,
  refs: MachineToReactRefMap<TE>
): [
  StateMachine.State<TC, TE, any>,
  StateMachine.Service<TC, DistributiveOmit<TE, "refs">>["send"],
  StateMachine.Service<TC, TE>
] {
  /*
   * State machine should not change between renders, so let's store it in a
   * ref. This should also help if we need to use a creator function to inject
   * dynamic initial state values based on props.
   */
  let { current: machine } = useRef(initialMachine);
  let service = useConstant(() => interpret(machine).start());
  let [current, setCurrent] = useState(machine.initialState);

  // Add refs to every event so we can use them to perform actions.
  let send = useCallback(
    (rawEvent: TE["type"] | DistributiveOmit<TE, "refs">) => {
      let event = isString(rawEvent) ? { type: rawEvent } : rawEvent;
      let refValues = Object.keys(refs).reduce((value, name) => {
        (value as any)[name] = refs[name].current;
        return value;
      }, {});
      service.send({ ...event, refs: refValues } as TE);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    service.subscribe(setCurrent);
    return () => {
      service.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [current, send, service];
}

function useConstant<T>(fn: () => T): T {
  let ref = React.useRef<{ v: T }>();

  if (!ref.current) {
    ref.current = { v: fn() };
  }

  return ref.current.v;
}

////////////////////////////////////////////////////////////////////////////////

type HTMLElementWithCurrentStyle = HTMLElement & {
  currentStyle?: Record<string, string>;
};

/**
 * Get a computed style value by property, backwards compatible with IE
 * @param element
 * @param styleProp
 */
function getStyle(element: HTMLElementWithCurrentStyle, styleProp: string) {
  let y: string | null = null;
  let doc = getOwnerDocument(element);
  if (element.currentStyle) {
    y = element.currentStyle[styleProp];
  } else if (
    doc &&
    doc.defaultView &&
    isFunction(doc.defaultView.getComputedStyle)
  ) {
    y = doc.defaultView
      .getComputedStyle(element, null)
      .getPropertyValue(styleProp);
  }
  return y;
}
