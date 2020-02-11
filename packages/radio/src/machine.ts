import React, { useEffect, useRef, useState, useCallback } from "react";
import { DistributiveOmit, isString } from "@reach/utils";
import { Descendant } from "@reach/descendants";
import {
  assign,
  createMachine,
  EventObject as MachineEvent,
  interpret,
  StateMachine,
} from "@xstate/fsm";
import { RadioValue, RadioChangeHandler, RadioDescendantProps } from "./index";

////////////////////////////////////////////////////////////////////////////////
// States

export enum RadioGroupStates {
  Idle = "IDLE",
  Navigating = "NAVIGATING",
}

export type RadioGroupState =
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
  GroupClick = "GROUP_CLICK",
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
        callback: RadioChangeHandler | undefined;
        disabled: boolean | undefined;
        domEvent: MouseEvent;
        node: HTMLElement | null | undefined;
        value: RadioValue;
      }
    | {
        type: RadioGroupEvents.KeyDown;
        callback: RadioChangeHandler | undefined;
        disabled: boolean | undefined;
        domEvent: KeyboardEvent;
        isRTL: boolean;
        key: string;
        options: Descendant<HTMLElement, RadioDescendantProps>[];
        value: RadioValue;
      }
    | {
        type: RadioGroupEvents.SetValue;
        value: RadioValue | null;
        callback?: RadioChangeHandler | undefined;
      }
    | {
        type: RadioGroupEvents.GroupClick;
        eventTarget: EventTarget | null | undefined;
        node: HTMLElement | null | undefined;
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
// Actions and conditions

const setValue = assign({
  value: (data: RadioGroupData, event: any) => {
    event.callback && event.callback(event.value);
    if (event.value !== data.value) {
      event.callback && event.callback(event.value);
    }
    return event.value;
  },
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

    let navOption: Descendant<HTMLElement, RadioDescendantProps> | null = null;
    let currentIndex = options.findIndex(option => option.value === value);
    let first = options[0];
    let last = options[options.length - 1];
    let next =
      currentIndex === options.length - 1 ? first : options[currentIndex + 1];
    let prev = currentIndex === 0 ? last : options[currentIndex - 1];

    switch (key) {
      case " ":
        if (!event.disabled) {
          navOption = options[currentIndex];
        }
        break;
      case "Enter":
        // So this one is a little weird, but here's what we're doing.
        // When a user presses Enter in the context of a form, the form should
        // submit. Now I know you're probably thinking:
        //
        //      "Aha! I've got it!"
        //          > inputNode.form.submit()
        //      ** cracks knuckles ** "Phew. My work here is done."
        //
        // But alas, we are not so lucky. What's really happening when a user
        // presses enter in a normal form field is that the browser looks
        // at the form the input is in, then looks for the first button or input
        // in that form where its type property is `submit`, then it triggers a
        // click event on that button. COOL, CARRY ON.
        //
        // If we were to fire inputNode.form.submit(), this would bypass any
        // onSubmit handler in the form and just do what the browser normally
        // does when you submit a form and trigger a page refresh. No bueno.
        // So we do what the browser does and just go on a duck hunt for the
        // first submit button in the form and we click that sucker.
        if (!event.disabled) {
          navOption = options[currentIndex];
          if (navOption.inputNode && navOption.inputNode.form) {
            let submitButton = navOption.inputNode.form.querySelector(
              "button,[type='submit']"
            );
            submitButton && (submitButton as any).click();
          }
        }
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
      if (navOption.value !== data.value) {
        event.callback && event.callback(navOption.value);
        return navOption.value;
      }
    }

    return data.value;
  },
});

const isNotDisabled = (data: RadioGroupData, event: any) => !event.disabled;

function focusSelected(data: RadioGroupData, event: any) {
  if (event.disabled) {
    return;
  }
  if (event.domEvent) {
    event.domEvent.preventDefault();
  }
  event.node && event.node.focus();
}

////////////////////////////////////////////////////////////////////////////////

const commonEvents = {
  [RadioGroupEvents.SetValue]: {
    actions: [setValue],
  },
  [RadioGroupEvents.Select]: {
    target: RadioGroupStates.Navigating,
    actions: [setValue, focusSelected],
    cond: isNotDisabled,
  },
  [RadioGroupEvents.Blur]: {
    target: RadioGroupStates.Idle,
  },
  [RadioGroupEvents.Focus]: {
    target: RadioGroupStates.Navigating,
  },
  // When a user clicks any item in the group and
  //   - the event target is of type 'radio'
  //   - a matching dom node was passed to the event
  // Then we know the user clicked a `label` wrapping our custom radio button
  // so we can focus the button and go to our navigating state.
  [RadioGroupEvents.GroupClick]: {
    target: RadioGroupStates.Navigating,
    actions: [focusSelected],
    cond: (data: RadioGroupData, event: any) => {
      const shouldFocus =
        !(
          event.eventTarget == null ||
          event.eventTarget.type !== "radio" ||
          event.eventTarget.disabled
        ) && event.node;
      return !event.disabled && shouldFocus;
    },
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
        on: {
          ...commonEvents,
        },
      },
      [RadioGroupStates.Navigating]: {
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
// Types

export interface RadioGroupData {
  isControlled: boolean;
  refs: RadioGroupNodeRefs;
  value: RadioValue | null;
}

export type RadioGroupNodeRefs = {};

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

export function useMachine<
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
