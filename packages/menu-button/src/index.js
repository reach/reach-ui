import React, { forwardRef, useRef, useEffect } from "react";
import { wrapEvent } from "@reach/utils";
import { DescendantProvider, useDescendant } from "./descendants.js";

import {
  createRootProvider,
  useMachineSend,
  useMachineState,
  useMachineContext,
  useMachineRefs,
  useRootId
} from "./use-machine";
import Popover from "@reach/popover";
import { container, button, popover, menu, item } from "./defs";

////////////////////////////////////////////////////////////////////////////////
export const MenuProvider = adapt(container);
export const MenuButton = adapt(button);
export const MenuPopover = adapt(popover);
export const Menu = adapt(menu);
export const MenuItem = adapt(item, {
  registerChild: ({ children, onSelect }) => ({ name: children, onSelect })
});
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function adapt(def, options) {
  let C = null;

  switch (def.type) {
    case "root-provider":
      C = createRootProvider(def);
      break;
    case "root-component":
      C = createRootComponent(def);
      break;
    case "popover":
      C = createPopoverComponent(def);
      break;
    case "indexed-parent":
      C = withDescendants(def.descendants, createComponent(def));
      break;
    case "indexed-child":
      C = asDescendant(options.registerChild, createComponent(def));
      break;
    default:
      C = createComponent(def);
  }

  C.displayName = def.displayName;
  return C;
}

////////////////////////////////////////////////////////////////////////////////
function createRootComponent() {}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function withDescendants(refName, Comp) {
  const C = props => {
    const { [refName]: items } = useMachineRefs();
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
function asDescendant(register, Comp) {
  const C = props => {
    const index = useDescendant(register(props));
    return <Comp {...props} index={index} />;
  };
  C.displayName = "IndexedChild";
  return C;
}

////////////////////////////////////////////////////////////////////////////////
function createComponent(def) {
  return forwardRef(
    (
      {
        as: Comp = def.tagName,
        // Don't love that `index` is build into this, but it's
        // so common I think it's fine
        index,
        ...props
      },
      forwardedRef
    ) => {
      // TODO: useForkedRef
      let ref = useMachineRefs()[def.ref] || forwardedRef;
      let send = useMachineSend();
      let state = useMachineState();
      let ctx = useMachineContext();
      let rootId = useRootId();

      if (def.setup) {
        // safe in a conditional cause def's are static
        useEffect(() => {
          return def.setup(send);
        }, [send]);
      }

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
function createPopoverComponent(def) {
  return forwardRef(({ as = "div", portal = true, ...props }, forwardedRef) => {
    const Comp = portal ? Popover : as;
    const { [def.targetRef]: targetRef } = useMachineRefs();
    const popupProps = portal ? { targetRef } : {};
    return <Comp ref={forwardedRef} {...popupProps} {...props} />;
  });
}
