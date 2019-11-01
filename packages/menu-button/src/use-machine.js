import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  createContext
} from "react";
import { interpret } from "xstate";

const Context = createContext();

export function MachineProvider({ machine, refs, children }) {
  const context = { service: useMachine(machine), refs };
  return <Context.Provider children={children} value={context} />;
}

export function useMachineState() {
  return useContext(Context).service[0].value;
}

export function useMachineContext() {
  return useContext(Context).service[0].context;
}

export function useMachineSend() {
  return useContext(Context).service[1];
}

export function useMachineBridge(key, refOrGetValue) {
  const bridge = useContext(Context).service[2];
  // every render assign the ref to the machine
  useEffect(() => {
    const value =
      typeof refOrGetValue === "function"
        ? refOrGetValue()
        : refOrGetValue.current;
    bridge(key, value);
  });
}

// maybe doesn't belong with "machine" code but don't really want to create two
// providers every time.
export function useMachineRefs() {
  return useContext(Context).refs;
}

////////////////////////////////////////////////////////////////////////////////
function useMachine(machine, { debug } = { debug: true }) {
  const [state, setState] = useState(machine.initialState);

  const ref = useRef(null);
  if (ref.current === null) {
    ref.current = interpret(machine).start();
  }

  const bridge = useBridgeProvider(ref.current.send);

  useEffect(() => {
    ref.current.subscribe((state, event) => {
      if (debug) {
        // console.group("[machine]");
        console.log("state", state.value, event);
        // console.log("context", state.context);
        // console.log("event", event);
        // console.groupEnd("[machine]");
      }

      // don't want infinite update loop
      if (event.type !== "UPDATE") {
        setState(state);
      }
    });
    return () => {
      ref.current.stop();
      ref.current = null;
    };
  }, [machine, debug]);

  return [state, ref.current.send, bridge];
}

////////////////////////////////////////////////////////////////////////////////
// This is really abstract :| and I don't love the string key/value
// indirection but it does make it pretty easy to bridge react to the
// machine
function useBridgeProvider(send) {
  const ref = useRef({});

  const set = useCallback((key, value) => {
    ref.current[key] = value;
  }, []);

  // if the provider's element props change, we bridge the gap from react
  // to the machine again, otherwise we don't worry about it.
  useEffect(() => {
    send({ type: "UPDATE", ...ref.current });
  });

  return set;
}
