declare module "@xstate/fsm" {
  export enum InterpreterStatus {
    NotStarted = 0,
    Running = 1,
    Stopped = 2,
  }
  export type SingleOrArray<T> = T[] | T;
  export interface EventObject {
    type: string;
  }
  export type InitEvent = {
    type: "xstate.init";
  };
  export namespace StateMachine {
    type Action<TContext extends object, TEvent extends EventObject> =
      | string
      | AssignActionObject<TContext, TEvent>
      | ActionObject<TContext, TEvent>
      | ActionFunction<TContext, TEvent>;
    type ActionMap<
      TContext extends object,
      TEvent extends EventObject
    > = Record<string, Exclude<Action<TContext, TEvent>, string>>;
    interface ActionObject<
      TContext extends object,
      TEvent extends EventObject
    > {
      type: string;
      exec?: ActionFunction<TContext, TEvent>;
      [key: string]: any;
    }
    type ActionFunction<TContext extends object, TEvent extends EventObject> = (
      context: TContext,
      event: TEvent | InitEvent
    ) => void;
    type AssignAction = "xstate.assign";
    interface AssignActionObject<
      TContext extends object,
      TEvent extends EventObject
    > extends ActionObject<TContext, TEvent> {
      type: AssignAction;
      assignment:
        | Assigner<TContext, TEvent>
        | PropertyAssigner<TContext, TEvent>;
    }
    type Transition<TContext extends object, TEvent extends EventObject> =
      | string
      | {
          target?: string;
          actions?: SingleOrArray<Action<TContext, TEvent>>;
          cond?: (context: TContext, event: TEvent) => boolean;
        };
    interface State<
      TContext extends object,
      TEvent extends EventObject,
      TState extends Typestate<TContext>
    > {
      value: string;
      context: TContext;
      actions: Array<ActionObject<TContext, TEvent>>;
      changed?: boolean | undefined;
      matches: <TSV extends TState["value"]>(
        value: TSV
      ) => this is TState extends {
        value: TSV;
      }
        ? TState
        : never;
    }
    interface Config<
      TContext extends object,
      TEvent extends EventObject,
      TState extends Typestate<TContext> = any
    > {
      id?: string;
      initial: string;
      context?: TContext;
      states: {
        [key in TState["value"]]: {
          on?: {
            [K in TEvent["type"]]?: SingleOrArray<
              Transition<
                TContext,
                TEvent extends {
                  type: K;
                }
                  ? TEvent
                  : never
              >
            >;
          };
          exit?: SingleOrArray<Action<TContext, TEvent>>;
          entry?: SingleOrArray<Action<TContext, TEvent>>;
        };
      };
    }
    interface Machine<
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
    type StateListener<T extends State<any, any, any>> = (state: T) => void;
    interface Service<
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
    type Assigner<TContext extends object, TEvent extends EventObject> = (
      context: TContext,
      event: TEvent
    ) => Partial<TContext>;
    type PropertyAssigner<
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

  export function assign<
    TC extends object,
    TE extends EventObject = EventObject
  >(
    assignment:
      | StateMachine.Assigner<TC, TE>
      | StateMachine.PropertyAssigner<TC, TE>
  ): StateMachine.AssignActionObject<TC, TE>;
  export function createMachine<
    TContext extends object,
    TEvent extends EventObject = EventObject,
    TState extends Typestate<TContext> = any
  >(
    fsmConfig: StateMachine.Config<TContext, TEvent>,
    options?: {
      actions?: StateMachine.ActionMap<TContext, TEvent>;
    }
  ): StateMachine.Machine<TContext, TEvent, TState>;
  export function interpret<
    TContext extends object,
    TEvent extends EventObject = EventObject,
    TState extends Typestate<TContext> = any
  >(
    machine: StateMachine.Machine<TContext, TEvent, TState>
  ): StateMachine.Service<TContext, TEvent, TState>;
}
