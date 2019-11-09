import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  createContext
} from "react";
import { interpret } from "xstate";
import { useId } from "@reach/auto-id";

const MachineContext = createContext();

// 99% of the time people don't care to add IDs to their elements (because we
// can auto generate them for ARIA). But if they do want to add an ID, it gets
// incredibly cumbersome and error-prone for us ( lots of context trickery and
// refs, and the IDs could potentially change and then it's a
// synchronization-through-context mess). So instead, folks can add an "id" to
// the very top component of any Reach package, and then we'll use that (or
// generate our own if empty). So they can still get a custom ID to any
// component in the tree, but this way we don't risk screwing it up and don't
// have to add a bunch of extra code.
const RootIdContext = createContext();

export function createRootProvider(def) {
  return ({ children }) => {
    const reactRefs = Object.keys(def.refs).reduce((reactRefs, name) => {
      reactRefs[name] = useRef(def.refs[name]);
      return reactRefs;
    }, {});

    const rootId = useId();
    const service = useMachine(def.chart, reactRefs);

    return (
      <RootIdContext.Provider value={rootId}>
        <MachineContext.Provider children={children} value={service} />
      </RootIdContext.Provider>
    );
  };
}

export function useRootId() {
  return useContext(RootIdContext);
}

export function useMachineState() {
  return useContext(MachineContext).state.value;
}

export function useMachineContext() {
  return useContext(MachineContext).state.context;
}

export function useMachineSend() {
  return useContext(MachineContext).send;
}

export function useMachineRefs() {
  return useContext(MachineContext).refs;
}

////////////////////////////////////////////////////////////////////////////////
function useMachine(chart, refs, debug = true) {
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
