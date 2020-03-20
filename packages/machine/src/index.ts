import { useCallback, useEffect, useRef, useState } from "react";
import {
  assign,
  createMachine,
  EventObject as MachineEvent,
  interpret,
  InterpreterStatus,
  StateMachine,
  Typestate,
} from "@xstate/fsm";
import { DistributiveOmit, isString, useConstant } from "@reach/utils";

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
  refs: MachineToReactRefMap<TE>
): [
  StateMachine.State<TC, TE, TS>,
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
      let refValues = unwrapRefs(refs);
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
 * Wraps useMachine to log events as they are sent in dev mode.
 *
 * @param machineTuple The tuple returned by useMachine (current state, the send
 *                     function, and the machine service object)
 * @param DEBUG        Whether or not to activate logging (we can't call hooks
 *                     conditionally, fam)
 */
export function useMachineLogger<
  TC extends object,
  TE extends MachineEventWithRefs = MachineEventWithRefs
>(
  [current, send, service]: [
    MachineState<TC, TE>,
    MachineSend<TC, TE>,
    MachineService<TC, TE>
  ],
  DEBUG?: boolean
): [MachineState<TC, TE>, MachineSend<TC, TE>, MachineService<TC, TE>] {
  let eventRef = useRef<any>();
  let newSendRef = useRef<MachineSend<TC, TE>>(
    __DEV__ && DEBUG
      ? (event: any) => {
          eventRef.current = event;
          send(event);
        }
      : send
  );

  useEffect(() => {
    if (__DEV__) {
      if (DEBUG) {
        let event = eventRef.current;
        if (event) {
          console.group("Event Sent");
          console.log("Event:", event);
          console.log("State:", current);
          console.groupEnd();
        }
      }
    }
  }, [DEBUG, current]);

  return [current, newSendRef.current, service];
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
export { InterpreterStatus, MachineEvent, StateMachine };
export { createMachine, assign, interpret };
