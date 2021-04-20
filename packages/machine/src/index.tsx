import * as React from "react";
import {
  assign,
  createMachine,
  interpret,
  InterpreterStatus,
} from "@xstate/fsm";
import { isString } from "@reach/utils/type-check";
import { useConstant } from "@reach/utils/use-constant";

import type { DistributiveOmit } from "@reach/utils/types";
import type {
  EventObject as MachineEvent,
  StateMachine,
  Typestate,
} from "@xstate/fsm";

const getServiceState = <
  TContext extends object,
  TEvent extends MachineEvent = MachineEvent,
  TState extends Typestate<TContext> = any
>(
  service: StateMachine.Service<TContext, TEvent, TState>
): StateMachine.State<TContext, TEvent, TState> => {
  let currentValue: StateMachine.State<TContext, TEvent, TState>;
  service
    .subscribe((state) => {
      currentValue = state;
    })
    .unsubscribe();
  return currentValue!;
};

/**
 * This `useMachine` works very similiarly to what you get from `@xstate/react`
 * with some additions.
 *  - A second argument `refs` is passed to send all of our refs into our
 *    machine's contextual data object.
 *  - We wrap the `send` function so that refs are updated included in all of
 *    our events so we can use their current value (generally DOM nodes)
 *    anywhere in our actions.
 *  - We initialize the machine inside the component rather than throwing an
 *    error if an outside initializer creates a value that doesn't match. This
 *    is useful as some components may need a different initial state or some
 *    initial data based on props. We should *generally* just update the state
 *    with an event via useEffect and depend on a static initial value, but this
 *    is difficult if that initial value matters for SSR or to prevent some
 *    layout jank before the first paint. I don't think there's a problem with
 *    this approach, but we'll see what happens.
 *
 * @param initialMachine
 * @param refs
 */
export function useMachine<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs,
  TS extends Typestate<TC> = any
>(
  initialMachine: StateMachine.Machine<TC, TE, TS>,
  refs: MachineToReactRefMap<TE>,
  DEBUG?: boolean
): [
  Omit<StateMachine.State<TC, TE, TS>, "actions">,
  StateMachine.Service<TC, DistributiveOmit<TE, "refs">>["send"],
  StateMachine.Service<TC, TE>
] {
  // State machine should not change between renders, so let's store it in a
  // ref. This should also help if we need to use a creator function to inject
  // dynamic initial state values based on props.
  let machineRef = React.useRef(initialMachine);
  let service = useConstant(() => interpret(machineRef.current).start());
  let lastEventType = React.useRef<TE["type"] | null>(null);

  let [state, setState] = React.useState(() => getServiceState(service));

  // This function reference will change on every render if we just pass on
  // current.matches, but it shouldn't change unless the current value is
  // updated. This was causing some lagginess when profiling in Listbox but
  // is probably an issue everywhere since the parent components that handle
  // state logic at the top might re-create context on each render as a
  // result of this change.

  // Add refs to every event so we can use them to perform actions.
  let send = React.useCallback(
    (rawEvent: TE["type"] | DistributiveOmit<TE, "refs">) => {
      let event = isString(rawEvent) ? { type: rawEvent } : rawEvent;
      let refValues = unwrapRefs(refs);
      service.send({
        ...event,
        lastEventType: lastEventType.current,
        refs: refValues,
      } as TE);
      lastEventType.current = event.type;

      if (__DEV__) {
        if (DEBUG) {
          console.group("Event Sent");
          console.log("Event:", event);
          console.groupEnd();
        }
      }
    },
    // We can disable the lint warning here. Refs will always be refs
    // (TypeScript enforced!) and should not trigger a re-render. The state
    // machine service persist for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEBUG]
  );

  React.useEffect(() => {
    service.subscribe(function setStateIfChanged(newState) {
      if (newState.changed) {
        setState(newState);
      }
    });
    return () => {
      service.stop();
    };
  }, [service]);

  React.useEffect(() => {
    if (__DEV__) {
      if (DEBUG && state.changed) {
        console.group("State Updated");
        console.log("State:", state);
        console.groupEnd();
      }
    }
  }, [DEBUG, state]);

  // We are going to pass along our state without the actions to avoid excess
  // renders when the reference changes. We haven't really needed them at this
  // point, but if we do we can maybe reconsider this approach.
  const memoizedState = React.useMemo(
    () => ({
      ...state,
      matches: (value: any) => value === state.value,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.changed, state.context, state.value]
  );

  return [memoizedState, send, service];
}

/**
 * Converts an object with React refs into an object with the same keys and
 * the current value of those refs.
 *
 * @param refs
 */
export function unwrapRefs<
  TE extends MachineEventWithRefs = MachineEventWithRefs
>(refs: MachineToReactRefMap<TE>): TE["refs"] {
  return Object.entries(refs).reduce((value, [name, ref]) => {
    (value as any)[name] = ref.current;
    return value;
  }, {} as TE["refs"]);
}

/**
 * Most of the time you want to create a static state machine outside of your
 * component, but in some cases we may need data from props in the first render
 * cycle. We can create our machine in each component IF we only create it once
 * and guarantee that it never changes between renders.
 *
 * This hook can take a machine definition created by a function inline to use
 * values defined in the component, and we never change the machine for the
 * life of the component.
 *
 * @param machineDefinition
 * @param options
 */
export function useCreateMachine<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs,
  TS extends Typestate<TC> = any
>(
  machineDefinition: StateMachine.Config<TC, TE, TS>,
  options?: {
    actions?: StateMachine.ActionMap<TC, TE>;
  }
): StateMachine.Machine<TC, TE, TS> {
  return useConstant(() => createMachine(machineDefinition, options));
}

////////////////////////////////////////////////////////////////////////////////
// Types

/**
 * Events use in our `useMachine` always have a refs object and will inherit
 * this interface.
 */
export interface MachineEventWithRefs extends MachineEvent {
  refs: {
    [key: string]: any;
  };
  lastEventType?: MachineEventWithRefs["type"];
}

export type MachineToReactRefMap<TE extends MachineEventWithRefs> = {
  [K in keyof TE["refs"]]: React.RefObject<TE["refs"][K]>;
};

export type MachineState<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs,
  TS extends Typestate<TC> = any
> = StateMachine.State<TC, TE, TS>;

export type MachineSend<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs
> = StateMachine.Service<TC, DistributiveOmit<TE, "refs">>["send"];

export type MachineService<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs
> = StateMachine.Service<TC, TE>;

// Export types and functions from xstate/fsm
export type { MachineEvent, StateMachine };
export { InterpreterStatus, createMachine, assign, interpret };
