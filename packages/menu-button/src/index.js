import React, { Fragment, forwardRef, useRef, useEffect } from "react";
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
  useMachineBridge,
  useMachineRefs
} from "./use-machine";
import Popover from "@reach/popover";

////////////////////////////////////////////////////////////////////////////////
export const MenuProvider = props => {
  const buttonRef = useRef(null);
  return (
    <MachineProvider
      {...props}
      machine={menuButtonMachine}
      refs={{ buttonRef }}
    />
  );
};

////////////////////////////////////////////////////////////////////////////////
export const MenuButton = forwardRef((
  {
    as: Comp = "button",
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onPointerLeave,
    onKeyDown,
    ...props
  },
  forwardRef // eslint-disable-line
  // need to useForkedRef
) => {
  const { buttonRef } = useMachineRefs();
  const send = useMachineSend();

  useMachineBridge("button", buttonRef);

  // Can we do this in the state machine instead with enter/leave?
  useEffect(() => {
    const up = () => send("DOC_POINTER_UP");
    document.addEventListener("pointerup", up);
    return () => document.removeEventListener("pointerup", up);
  }, [send]);

  const handlePointerDown = wrapEvent(onPointerDown, () => {
    send("BUTTON_POINTER_DOWN");
  });

  const handlePointerMove = wrapEvent(onPointerMove, () => {
    send({ type: "BUTTON_POINTER_MOVE" });
  });

  const handlePointerUp = wrapEvent(onPointerDown, () => {
    send({ type: "BUTTON_POINTER_UP" });
  });

  const handlePointerLeave = wrapEvent(onPointerLeave, () => {
    send({ type: "BUTTON_POINTER_LEAVE" });
  });

  const handleKeyDown = wrapEvent(onKeyDown, event => {
    switch (event.key) {
      case " ":
        send("KEYDOWN_SPACE");
        break;
      case "Enter":
        document.activeElement.blur();
        send("KEYDOWN_ENTER");
        break;
      case "ArrowDown":
        send("ARROW_DOWN");
        break;
      case "ArrowUp":
        send("ARROW_UP");
        break;
      default: {
      }
    }
  });

  return (
    <Comp
      ref={buttonRef}
      data-reach-menu-button=""
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
});
MenuButton.displayName = "MenuButton";

////////////////////////////////////////////////////////////////////////////////
export const MenuPopover = forwardRef(
  ({ as = "div", portal = true, ...props }, forwardedRef) => {
    const Comp = portal ? Popover : as;
    const { buttonRef } = useMachineRefs();
    const popupProps = portal ? { targetRef: buttonRef } : {};
    return (
      <Comp
        ref={forwardedRef}
        data-reach-menu-popover=""
        {...popupProps}
        {...props}
      />
    );
  }
);
MenuPopover.displayName = "MenuPopover";

////////////////////////////////////////////////////////////////////////////////
export const Menu = forwardRef(
  (
    {
      as: Comp = "div",
      onKeyDown,
      onKeyPress,
      onBlur,
      onPointerUp,
      onPointerLeave,
      ...props
    },
    forwardedRef
  ) => {
    const ref = forwardedRef || useRef(null);
    const send = useMachineSend();

    const itemsRef = useDescendants();
    useMachineBridge("menu", ref);
    useMachineBridge("items", () =>
      itemsRef.current.map(({ ref, onSelect }) => ({
        innerText: ref.current.innerText,
        onSelect
      }))
    );

    const handleKeyDown = wrapEvent(onKeyDown, event => {
      switch (event.key) {
        case "Tab":
          event.preventDefault();
          break;
        case "Escape":
          send("KEY_ESCAPE");
          break;
        case "ArrowDown":
          send("KEY_ARROW_DOWN");
          break;
        case "ArrowUp":
          send("KEY_ARROW_UP");
          break;
        case "Enter": {
          send("KEY_ENTER");
          break;
        }
        case " ": {
          send("KEY_SPACE");
          break;
        }
        case "Home": {
          send("HOME");
          break;
        }
        case "End": {
          send("END");
          break;
        }
        default: {
        }
      }
    });

    const handleBlur = wrapEvent(onBlur, event => {
      send("BLUR");
    });

    const handlePointerLeave = wrapEvent(onPointerLeave, event => {
      send("POINTER_LEAVE_MENU");
    });

    const handleKeyPress = wrapEvent(onKeyPress, event => {
      send({ type: "KEY_PRESS", key: event.key });
    });

    const state = useMachineState();
    const isVisible = state.startsWith("open");

    return (
      <DescendantProvider items={itemsRef}>
        <Comp
          ref={ref}
          data-reach-menu=""
          data-closed={!isVisible ? "" : undefined}
          tabIndex="-1"
          onKeyDown={handleKeyDown}
          onKeyPress={handleKeyPress}
          onBlur={handleBlur}
          onPointerLeave={handlePointerLeave}
          {...props}
        />
      </DescendantProvider>
    );
  }
);
Menu.displayName = "Menu";

////////////////////////////////////////////////////////////////////////////////
export const MenuItem = forwardRef(
  (
    {
      as: Comp = "div",
      onSelect,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerEnter,
      ...props
    },
    forwardedRef
  ) => {
    const ref = forwardedRef || useRef(null);
    const index = useDescendant({ name: props.children, ref, onSelect });

    const mContext = useMachineContext();
    const send = useMachineSend();
    const state = useMachineState();

    const isActiveDescendant = mContext.activeIndex === index;

    const handlePointerDown = wrapEvent(onPointerDown, () => {
      send({ type: "ITEM_POINTER_DOWN" });
    });

    const handlePointerUp = wrapEvent(onPointerUp, () => {
      send({ type: "ITEM_POINTER_UP" });
    });

    const handlePointerEnter = wrapEvent(onPointerEnter, () => {
      send({ type: "ITEM_POINTER_ENTER", index });
    });

    const handlePointerLeave = wrapEvent(onPointerLeave, () => {
      send({ type: "ITEM_POINTER_LEAVE" });
    });

    const confirming = state.startsWith("open:confirming");
    let selected = undefined;
    if (isActiveDescendant && confirming) {
      if (
        state === "open:confirming:highlighted" ||
        state === "open:confirming:final"
      ) {
        selected = "";
      }
    } else if (isActiveDescendant) {
      selected = "";
    }

    return (
      <Comp
        ref={ref}
        data-reach-menu-item=""
        data-selected={selected}
        data-confirming={confirming ? "" : undefined}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerEnter={handlePointerEnter}
        {...props}
      />
    );
  }
);

MenuItem.displayName = "MenuItem";
