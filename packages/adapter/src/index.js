import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  createContext,
  forwardRef
} from "react";
import { interpret } from "xstate";
import { useId } from "@reach/auto-id";
import { wrapEvent } from "@reach/utils";
import Popover from "@reach/popover";
import { DescendantProvider, useDescendant } from "./descendants.js";

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
const MachineContext = createContext();

////////////////////////////////////////////////////////////////////////////////
// This function adapts any component definition into an actual React
// component.  There are a few basic types of components, each case has an
// explanation of the type.
export default function adapt(def, options = {}) {
  let C = null;

  switch (def.type) {
    case "ROOT_PROVIDER":
      // Root Providers don't actually render an element, but we still need to
      // create the context and the state machine service. @reach/menu-button
      // is an example of this. The MenuButtonContainer doesn't render any
      // actual UI, it just provides context for both MenuButton and Menu
      //
      // def config:
      //
      // - chart: this is the state chart
      // - refs: these are dom elements that need to be sent with every
      //   action so the machine can use them when performing actions.
      // - setup: a setup function to call when initially rendered, good for
      //   adding doc/window event listeners.
      C = createRootProvider(def);
      break;
    case "ROOT_COMPONENT":
      // A Root Component is like a Root Provider except it actually renders an
      // element. @reach/tabs is an example of this. It actually renders a div
      // and at the same time provides the context for all the other components
      //
      // def config:
      //
      // - chart: this is the state chart
      // - refs: these are dom elements that need to be sent with every
      //   action so the machine can use them when performing actions.
      // - setup: a setup function to call when initially rendered, good for
      //   adding doc/window event listeners.
      C = createRootComponent(def);
      break;
    case "POPOVER":
      // A Popover is an element that pops up and positions itself by a target.
      // It doesn't need any other HTML attributes or styles, it simply serves
      // as a way to position itself by another element.  All popovers take a
      // `portal=false` prop to render inline instead of at the document root
      // in a portal. Devs may want to do this when scrolling performance of
      // our positioning isn't sufficient, or they know they don't have CSS
      // constraints on the popover.
      //
      // def config:
      //
      // - targetRef: the target element ref (defined in the root def) to
      //   position by
      // - attrs: the html attributes for the element
      C = createPopoverComponent(def);
      break;
    case "INDEXED_PARENT":
      // Indexed parents tell the descendants what their index is and send the
      // value the descendant provides to the state chart's actions.
      //
      // def config:
      //
      // - descendants: the root ref that tracks the descendants
      //
      C = withDescendants(def.descendants, createComponent(def));
      break;
    case "INDEXED_CHILD":
      // Indexed children receive their index from the indexed parent, and
      // provide a value to the parent that is then sent to the chart's
      // actions. The index is made available to `attrs` and `events`.
      C = asDescendant(
        options.registerDescendant || (() => {}),
        createComponent(def)
      );
      break;
    default:
      // Everything else is just a component.
      //
      // def config:
      //
      // - tagName
      // - ref
      // - attrs
      // - events
      C = createComponent(def);
  }

  C.displayName = def.displayName;
  return C;
}

////////////////////////////////////////////////////////////////////////////////
export function createRootProvider(def) {
  return ({ children }) => {
    const reactRefs = Object.keys(def.refs).reduce((reactRefs, name) => {
      reactRefs[name] = useRef(def.refs[name]);
      return reactRefs;
    }, {});

    const rootId = useId();
    const service = useMachineService(def.chart, reactRefs);

    if (def.setup) {
      // safe in a conditional cause def's are static
      useEffect(() => {
        return def.setup(service.send);
      }, [service.send]);
    }

    return (
      <RootIdContext.Provider value={rootId}>
        <MachineContext.Provider children={children} value={service} />
      </RootIdContext.Provider>
    );
  };
}

////////////////////////////////////////////////////////////////////////////////
export function createRootComponent(def) {
  const Comp = createComponent(def);
  const Provider = createRootProvider(def);
  return props => (
    <Provider>
      <Comp {...props} />
    </Provider>
  );
}

////////////////////////////////////////////////////////////////////////////////
export function withDescendants(refName, Comp) {
  const C = props => {
    const { [refName]: items } = useMachine().refs;
    return (
      <DescendantProvider items={items}>
        <Comp {...props} />
      </DescendantProvider>
    );
  };
  C.displayName = "IndexedParent";
  return C;
}

////////////////////////////////////////////////////////////////////////////////
export function asDescendant(register, Comp) {
  const C = props => {
    const index = useDescendant(register(props));
    return <Comp {...props} index={index} />;
  };
  C.displayName = "IndexedChild";
  return C;
}

////////////////////////////////////////////////////////////////////////////////
export function createComponent(def) {
  return forwardRef(
    ({ as: Comp = def.tagName, index, ...props }, forwardedRef) => {
      let rootId = useRootId();
      let service = useMachine();

      // TODO: useForkedRef
      let ref = service.refs[def.ref] || forwardedRef;
      let { send } = service;
      let { value: state, context: ctx } = service.state;

      // copy cause we remove the events from props in the forEach below
      let rest = { ...props };

      let events = {};
      Object.keys(def.events).forEach(key => {
        let appEvent = rest[key];
        delete rest[key];
        events[key] = wrapEvent(appEvent, event => {
          const handler = def.events[key];
          if (typeof handler === "string") {
            send(handler);
          } else {
            handler(event, send, index);
          }
        });
      });

      let attrs =
        typeof def.attrs === "function"
          ? def.attrs(state, ctx, rootId)
          : Object.keys(def.attrs).reduce((attrs, key) => {
              if (typeof def.attrs[key] === "function") {
                attrs[key] = def.attrs[key](state, ctx, rootId, index);
              } else {
                attrs[key] = def.attrs[key];
              }
              return attrs;
            }, {});

      return <Comp ref={ref} {...events} {...attrs} {...rest} />;
    }
  );
}

////////////////////////////////////////////////////////////////////////////////
export function createPopoverComponent(def) {
  return forwardRef(({ as = "div", portal = true, ...props }, forwardedRef) => {
    const Comp = portal ? Popover : as;
    const { [def.targetRef]: targetRef } = useMachine().refs;
    const popupProps = portal ? { targetRef } : {};
    return <Comp ref={forwardedRef} {...popupProps} {...props} />;
  });
}

////////////////////////////////////////////////////////////////////////////////
function useMachineService(chart, refs, debug = true) {
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

////////////////////////////////////////////////////////////////////////////////
function useRootId() {
  return useContext(RootIdContext);
}

function useMachine() {
  return useContext(MachineContext);
}
