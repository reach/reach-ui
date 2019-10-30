import React, { forwardRef, useRef } from "react";
// import Portal from "@reach/portal";
// import { useRect } from "@reach/rect";
import { wrapEvent } from "@reach/utils";
import {
  useDescendants,
  DescendantProvider,
  useDescendant
} from "./descendants.js";

import menuButtonMachine from "./machine";
import {
  MachineProvider,
  useMachineSend,
  useMachineState,
  useMachineContext,
  useMachineBridge
} from "./use-machine";

////////////////////////////////////////////////////////////////////////////////
export const MenuProvider = props => {
  return <MachineProvider {...props} machine={menuButtonMachine} />;
};

////////////////////////////////////////////////////////////////////////////////
export const MenuButton = forwardRef(
  (
    { as: Comp = "button", onPointerDown, onKeyDown, ...props },
    forwardedRef
  ) => {
    const ref = forwardedRef || useRef(null);
    const send = useMachineSend();

    useMachineBridge("button", ref);

    const handlePointerDown = wrapEvent(onPointerDown, () =>
      send("POINTER_DOWN")
    );

    const handleKeyDown = wrapEvent(onKeyDown, event => {
      switch (event.key) {
        case " ":
          send("KEYDOWN_SPACE");
          break;
        case "ArrowDown":
          send("ARROW_DOWN");
          break;
        default: {
        }
      }
    });

    return (
      <Comp
        ref={ref}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
MenuButton.displayName = "MenuButton";

////////////////////////////////////////////////////////////////////////////////
export const MenuPopover = forwardRef(
  ({ as: Comp = "div", ...props }, forwardedRef) => {
    return <Comp ref={forwardedRef} {...props} />;
  }
);
MenuPopover.displayName = "MenuPopover";

////////////////////////////////////////////////////////////////////////////////
export const Menu = forwardRef(
  ({ as: Comp = "div", onKeyDown, ...props }, forwardedRef) => {
    const ref = forwardedRef || useRef(null);
    const send = useMachineSend();

    const itemsRef = useDescendants();
    useMachineBridge("menu", ref);
    useMachineBridge("items", itemsRef);

    const state = useMachineState();
    const isVisible = state === "selecting" || state === "searching";

    const handleKeyDown = wrapEvent(onKeyDown, event => {
      send({ type: "KEYDOWN", event });
    });

    return (
      <DescendantProvider descendants={itemsRef}>
        <Comp
          ref={ref}
          hidden={!isVisible}
          tabIndex="-1"
          onKeyDown={handleKeyDown}
          {...props}
        />
      </DescendantProvider>
    );
  }
);
Menu.displayName = "Menu";

////////////////////////////////////////////////////////////////////////////////
export const MenuItem = forwardRef(
  ({ as: Comp = "div", onSelect, ...props }, forwardedRef) => {
    const ref = forwardedRef || useRef(null);
    const index = useDescendant(props.children);
    const mContext = useMachineContext();

    const isActiveDescendant = mContext.highlightIndex === index;

    return (
      <Comp
        ref={ref}
        data-reach-menu-item=""
        data-selected={isActiveDescendant ? "" : undefined}
        {...props}
      />
    );
  }
);
MenuItem.displayName = "MenuItem";
