import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  createContext
} from "react";
import { interpret } from "xstate";

const Context = createContext();

// send refs on every event
// then every action can focus whatever it needs to!

export function MachineProvider({ chart, refs, children }) {
  const context = useMachine(chart, refs);
  return <Context.Provider children={children} value={context} />;
}

export function useMachineState() {
  return useContext(Context).state.value;
}

export function useMachineContext() {
  return useContext(Context).state.context;
}

export function useMachineSend() {
  return useContext(Context).send;
}

export function useMachineRefs() {
  return useContext(Context).refs;
}

////////////////////////////////////////////////////////////////////////////////
function useMachine(chart, refs, debug = false) {
  const [state, setState] = useState(chart.initialState);

  const serviceRef = useRef(null);
  if (serviceRef.current === null) {
    serviceRef.current = interpret(chart).start();
  }

  // add refs to every event so we can use them to perform actions previous
  // strategy was send an "update" event to the machine whenever we rendered in
  // React, but that got a little unweildy (had to add UPDATE events to every
  // state, caused lots of noise in the service subscription), this seems
  // better.
  const send = rawEvent => {
    const event = typeof rawEvent === "string" ? { type: rawEvent } : rawEvent;
    if (event.refs) throw new Error("refs is a reserved event key");
    const unwrapped = Object.keys(refs).reduce((unwrapped, name) => {
      unwrapped[name] = refs[name].current;
      return unwrapped;
    }, {});
    serviceRef.current.send({ ...event, refs: unwrapped });
  };

  useEffect(() => {
    serviceRef.current.subscribe((state, event) => {
      if (debug) {
        console.groupCollapsed(state.value);
        console.log("event", event);
        console.log("context", state.context);
        console.groupEnd(state.value);
      }
      setState(state);
    });
    return () => {
      serviceRef.current.stop();
      serviceRef.current = null;
    };
  }, [chart, debug]);

  return { state, send, refs };
}
