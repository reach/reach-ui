/**
 * Welcome to @reach/machine!
 *
 * This is a fork of @xstate/fsm with some tweaks.
 *
 * First, the API should match the API of XState to the degree that we should be
 * able to drop our machine definitions into the XState visualizer and see
 * charts. We will actually remove some of the flexibility provided by
 * @xstate/fsm to save a few bytes and (hopefully) give us some flexibility on
 * features.
 *
 * The desired outcome is a FSM tool that grants us everything we get from
 * @xstate/fsm, plus:
 *   - TODO: Delayed transitions: https://xstate.js.org/docs/guides/delays.html#delayed-transitions
 *   - TODO: Final states: https://xstate.js.org/docs/guides/final.html
 *   - TODO: Hierarchal states (maybe): https://xstate.js.org/docs/guides/hierarchical.html
 *
 * Limitations vs. XState API:
 *   - Actions should always be an array, even if only sending 1
 *      - actions: [{ type: 'doAThing', exec: () => {} }]
 *      - entry: [{ type: 'handleEntry', exec: () => {} }]
 *      - exit: [{ type: 'handleExit', exec: () => {} }]
 *   - Individual actions should be defined as object,
 *       e.g. { name: 'func', exec: () => {} }
 *   - Transitions must be defined as objects,
 *       e.g. { target: STATE, actions: [], cond: () => {} }
 *   - Delayed transitions defined as arrays of objects:
 *       e.g.
 *         after: [
 *           { delay: 1000, target: STATE, cond: () => {} },
 *           { delay: 1500, target: OTHER_STATE }
 *         ]
 *
 * We also have a `useMachine` hook that uses the state machine's interpreter
 * to give us a little more power. We can create machines exactly once inside
 * the body of a component with a machine creator function so we can get data
 * from props without needing to send any immediate transitions in an effect.
 */

import { SingleOrArray, DistributiveOmit } from "@reach/utils";
import { useRef, useState, useCallback, useEffect } from "react";

export enum InterpreterStatus {
  NotStarted = 0,
  Running = 1,
  Stopped = 2
}

const INIT_EVENT: InitEvent = { type: "reach.init" };
const ASSIGN_ACTION: StateMachine.AssignAction = "reach.assign";

////////////////////////////////////////////////////////////////////////////////

export function assign<TC extends object, TE extends EventObject = EventObject>(
  assignment: StateMachine.PropertyAssigner<TC, TE>
): StateMachine.AssignActionObject<TC, TE> {
  return {
    type: ASSIGN_ACTION,
    assignment
  };
}

export function createMachine<
  TContext extends object,
  TEvent extends EventObject = EventObject,
  TState extends Typestate<TContext> = any
>(
  fsmConfig: StateMachine.Config<TContext, TEvent>
): StateMachine.Machine<TContext, TEvent, TState> {
  const machine = {
    config: fsmConfig,
    initialState: {
      value: fsmConfig.initial,
      actions: fsmConfig.states[fsmConfig.initial].entry || [],
      context: fsmConfig.context!,
      matches: createMatcher(fsmConfig.initial)
    },
    transition: (
      currentState:
        | StateMachine.State<TContext, TEvent, TState>["value"]
        | StateMachine.State<TContext, TEvent, TState>,
      event: TEvent["type"] | TEvent
    ): StateMachine.State<TContext, TEvent, TState> => {
      /*
       * Get our current state value and context from the passed state or state
       * object
       */
      let { value: currentStateValue, context } =
        typeof currentState === "string"
          ? { value: currentState, context: fsmConfig.context! }
          : currentState;

      // Convert possible event string to event object
      let eventObject = toEventObject(event);

      // Get our state config and throw in dev mode if it doesn't exist
      let stateConfig = fsmConfig.states[currentStateValue];
      if (__DEV__) {
        if (!stateConfig) {
          throw new Error(
            `State '${currentStateValue}' not found on machine${
              fsmConfig.id ? ` '${fsmConfig.id}'` : ""
            }.`
          );
        }
      }

      let unchangedState: StateMachine.State<TContext, TEvent, TState> = {
        value: currentStateValue,
        context,
        actions: [],
        changed: false,
        matches: createMatcher(currentStateValue)
      };

      if (!stateConfig.on) {
        return unchangedState;
      }

      let transitions = toArray<StateMachine.Transition<TContext, TEvent>>(
        (stateConfig as any).on[eventObject.type]
      );

      for (let transition of transitions) {
        if (transition === undefined) {
          return unchangedState;
        }

        let {
          target = currentStateValue,
          actions = [],
          cond = () => true
        } = transition;

        // Verify conditions are met before continuing
        if (!cond(context, eventObject)) {
          return unchangedState;
        }

        let nextContext = context;
        let nextStateConfig = fsmConfig.states[target];
        let assigned = false;

        let allActions = [
          ...(stateConfig.exit || []),
          ...actions,
          ...(nextStateConfig.entry || [])
        ].filter(action => {
          // Execute assignments and then filter from our actions object
          if (action.type === ASSIGN_ACTION) {
            assigned = true;
            let tmpContext = { ...nextContext };

            for (let key of Object.keys(action.assignment)) {
              (tmpContext as any)[key] =
                typeof action.assignment[key] === "function"
                  ? action.assignment[key](nextContext, eventObject)
                  : action.assignment[key];
            }

            nextContext = tmpContext;
            return false;
          }
          return true;
        });

        return {
          value: target,
          context: nextContext,
          actions: allActions,
          changed:
            target !== currentStateValue || allActions.length > 0 || assigned,
          matches: createMatcher(target)
        };
      }

      // No transitions match
      return unchangedState;
    }
  };
  return machine;
}

export function interpret<
  TContext extends object,
  TEvent extends EventObject = EventObject,
  TState extends Typestate<TContext> = any
>(
  machine: StateMachine.Machine<TContext, TEvent, TState>
): StateMachine.Service<TContext, TEvent, TState> {
  let state = machine.initialState;
  let status = InterpreterStatus.NotStarted;
  let listeners = new Set<StateMachine.StateListener<typeof state>>();

  let service = {
    _machine: machine,
    send(event: TEvent | TEvent["type"]) {
      if (status !== InterpreterStatus.Running) {
        return;
      }
      let eventObject = toEventObject(event);
      state = machine.transition(state, event);
      executeStateActions(state, eventObject);
      listeners.forEach(listener => listener(state));
    },
    subscribe(listener: StateMachine.StateListener<typeof state>) {
      listeners.add(listener);
      listener(state);

      return {
        unsubscribe() {
          listeners.delete(listener);
        }
      };
    },
    start() {
      status = InterpreterStatus.Running;
      executeStateActions(state, INIT_EVENT);
      return service;
    },
    stop() {
      status = InterpreterStatus.Stopped;
      listeners.forEach(listener => listeners.delete(listener));
      return service;
    },
    get status() {
      return status;
    }
  };
  return service;
}

////////////////////////////////////////////////////////////////////////////////
// Utilities

/**
 * Create a matcher function to determine if a value matches a passed state
 * @param value Value to check against in the matcher
 */
function createMatcher(value: string) {
  return (stateValue: any) => value === stateValue;
}

/**
 * Loop over actions in a given state and executes them.
 *
 * @param state
 * @param event
 */
function executeStateActions<
  TContext extends object,
  TEvent extends EventObject = any,
  TState extends Typestate<TContext> = any
>(
  state: StateMachine.State<TContext, TEvent, TState>,
  event: TEvent | InitEvent
) {
  for (let action of state.actions) {
    action.exec && action.exec(state.context, event);
  }
}

/**
 * Converts any value to an array of the same value
 * @param item Value to convert
 */
function toArray<T>(item: T | T[] | undefined): T[] {
  return item == null ? [] : ([] as T[]).concat(item);
}

/**
 * Transform a possible event string or event object to an event object.
 * @param event Possible event string or object
 * @returns Event object
 */
function toEventObject<TEvent extends EventObject>(
  event: TEvent["type"] | TEvent
): TEvent {
  return (typeof event === "string" ? { type: event } : event) as TEvent;
}

////////////////////////////////////////////////////////////////////////////////
// useMachine hook

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
 *    is difficuly if that initial value matters for SSR or to prevent some
 *    layout jank on the first paint. I don't think there's with this approach,
 *    but we'll see what happens.
 *
 * @param initialMachine
 * @param refs
 */
export function useMachine<
  TContext extends object,
  TEvent extends MachineEventWithRefs = MachineEventWithRefs
>(
  initialMachine: StateMachine.Machine<TContext, TEvent, any>,
  refs: MachineToReactRefMap<TEvent>
): [
  StateMachine.State<TContext, TEvent, any>,
  StateMachine.Service<TContext, DistributiveOmit<TEvent, "refs">>["send"],
  StateMachine.Service<TContext, TEvent>
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
    (rawEvent: TEvent["type"] | DistributiveOmit<TEvent, "refs">) => {
      let event = typeof rawEvent === "string" ? { type: rawEvent } : rawEvent;
      let refValues = Object.keys(refs).reduce((value, name) => {
        (value as any)[name] = refs[name].current;
        return value;
      }, {});
      service.send({ ...event, refs: refValues } as TEvent);
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
  let ref = useRef<{ v: T }>();

  if (!ref.current) {
    ref.current = { v: fn() };
  }

  return ref.current.v;
}

////////////////////////////////////////////////////////////////////////////////
// Types

/**
 * Events use in our `useMachine` always have a refs object and will inherit
 * this interface.
 */
export interface MachineEventWithRefs extends EventObject {
  refs: {
    [key: string]: any;
  };
}

export type MachineToReactRefMap<TE extends MachineEventWithRefs> = {
  [K in keyof TE["refs"]]: React.RefObject<TE["refs"][K]>;
};

export interface EventObject {
  type: string;
}

export type InitEvent = { type: "reach.init" };

export namespace StateMachine {
  export type Action<TContext extends object, TEvent extends EventObject> =
    | AssignActionObject<TContext, TEvent>
    | ActionObject<TContext, TEvent>;

  export interface ActionObject<
    TContext extends object,
    TEvent extends EventObject
  > {
    type: string;
    exec?: (context: TContext, event: TEvent | InitEvent) => void;
    [key: string]: any;
  }

  export type AssignAction = "reach.assign";

  export interface AssignActionObject<
    TContext extends object,
    TEvent extends EventObject
  > extends ActionObject<TContext, TEvent> {
    type: AssignAction;
    assignment: PropertyAssigner<TContext, TEvent>;
  }

  export type Transition<
    TContext extends object,
    TEvent extends EventObject
  > = {
    target?: string;
    actions?: Action<TContext, TEvent>[];
    cond?: (context: TContext, event: TEvent) => boolean;
  };

  export interface State<
    TContext extends object,
    TEvent extends EventObject,
    TState extends Typestate<TContext>
  > {
    value: string;
    context: TContext;
    actions: ActionObject<TContext, TEvent>[];
    changed?: boolean | undefined;
    matches: <TSV extends TState["value"]>(
      value: TSV
    ) => this is TState extends { value: TSV } ? TState : never;
  }

  export interface Config<TContext extends object, TEvent extends EventObject> {
    id?: string;
    initial: string;
    context?: TContext;
    states: {
      [key: string]: {
        on?: {
          [K in TEvent["type"]]?: SingleOrArray<
            Transition<TContext, TEvent extends { type: K } ? TEvent : never>
          >;
        };
        exit?: Action<TContext, TEvent>[];
        entry?: Action<TContext, TEvent>[];
      };
    };
  }

  export interface Machine<
    TContext extends object,
    TEvent extends EventObject,
    TState extends Typestate<TContext>
  > {
    config: StateMachine.Config<TContext, TEvent>;
    initialState: State<TContext, TEvent, TState>;
    transition: (
      state: string | State<TContext, TEvent, TState>,
      event: TEvent["type"] | TEvent
    ) => State<TContext, TEvent, TState>;
  }

  export type StateListener<T extends State<any, any, any>> = (
    state: T
  ) => void;

  export interface Service<
    TContext extends object,
    TEvent extends EventObject,
    TState extends Typestate<TContext> = any
  > {
    send: (event: TEvent | TEvent["type"]) => void;
    subscribe: (
      listener: StateListener<State<TContext, TEvent, TState>>
    ) => {
      unsubscribe: () => void;
    };
    start: () => Service<TContext, TEvent, TState>;
    stop: () => Service<TContext, TEvent, TState>;
    readonly status: InterpreterStatus;
  }

  export type PropertyAssigner<
    TContext extends object,
    TEvent extends EventObject
  > = {
    [K in keyof TContext]?:
      | ((context: TContext, event: TEvent) => TContext[K])
      | TContext[K];
  };
}

export interface Typestate<TContext extends object> {
  value: string;
  context: TContext;
}
