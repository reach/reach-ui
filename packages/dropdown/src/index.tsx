import * as React from "react";
import { useId } from "@reach/auto-id";
import { Popover } from "@reach/popover";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendants,
  useDescendantsInit,
  useDescendantKeyDown,
} from "@reach/descendants";
import { isRightClick } from "@reach/utils/is-right-click";
import { usePrevious } from "@reach/utils/use-previous";
import { getOwnerDocument } from "@reach/utils/owner-document";
import { createNamedContext } from "@reach/utils/context";
import { isFunction, isString } from "@reach/utils/type-check";
import { makeId } from "@reach/utils/make-id";
import { useStatefulRefValue } from "@reach/utils/use-stateful-ref-value";
import { useComposedRefs } from "@reach/utils/compose-refs";
import { composeEventHandlers } from "@reach/utils/compose-event-handlers";

import type { Descendant } from "@reach/descendants";
import type { Position } from "@reach/popover";
import type * as Polymorphic from "@reach/utils/polymorphic";

////////////////////////////////////////////////////////////////////////////////
// Actions

const CLEAR_SELECTION_INDEX = "CLEAR_SELECTION_INDEX";
const CLICK_MENU_ITEM = "CLICK_MENU_ITEM";
const CLOSE_MENU = "CLOSE_MENU";
const OPEN_MENU_AT_FIRST_ITEM = "OPEN_MENU_AT_FIRST_ITEM";
const OPEN_MENU_AT_INDEX = "OPEN_MENU_AT_INDEX";
const OPEN_MENU_CLEARED = "OPEN_MENU_CLEARED";
const SEARCH_FOR_ITEM = "SEARCH_FOR_ITEM";
const SELECT_ITEM_AT_INDEX = "SELECT_ITEM_AT_INDEX";
const SET_BUTTON_ID = "SET_BUTTON_ID";

const DropdownDescendantContext = createDescendantContext<DropdownDescendant>(
  "DropdownDescendantContext"
);
const DropdownContext = createNamedContext<InternalDropdownContextValue>(
  "DropdownContext",
  {} as InternalDropdownContextValue
);

const initialState: DropdownState = {
  // The button ID is needed for aria controls and can be set directly and
  // updated for top-level use via context. Otherwise a default is set by useId.
  // TODO: Consider deprecating direct ID in 1.0 in favor of id at the top level
  //       for passing deterministic IDs to descendent components.
  triggerId: null,

  // Whether or not the dropdown is expanded
  isExpanded: false,

  // When a user begins typing a character string, the selection will change if
  // a matching item is found
  typeaheadQuery: "",

  // The index of the current selected item. When the selection is cleared a
  // value of -1 is used.
  selectionIndex: -1,
};

////////////////////////////////////////////////////////////////////////////////

// Dropdown!

const DropdownProvider: React.FC<DropdownProviderProps> = ({
  id,
  children,
}) => {
  let triggerRef = React.useRef(null);
  let dropdownRef = React.useRef(null);
  let popoverRef = React.useRef(null);
  let [descendants, setDescendants] = useDescendantsInit<DropdownDescendant>();
  let _id = useId(id);
  let dropdownId = id || makeId("menu", _id);
  let triggerId = makeId("menu-button", dropdownId);
  let [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    triggerId,
  });

  // We use an event listener attached to the window to capture outside clicks
  // that close the dropdown. We don't want the initial button click to trigger
  // this when a dropdown is closed, so we can track this behavior in a ref for
  // now. We shouldn't need this when we rewrite with state machine logic.
  let triggerClickedRef = React.useRef(false);

  // We will put children callbacks in a ref to avoid triggering endless render
  // loops when using render props if the app code doesn't useCallback
  // https://github.com/reach/reach-ui/issues/523
  let selectCallbacks = React.useRef([]);

  // If the popover's position overlaps with an option when the popover
  // initially opens, the mouseup event will trigger a select. To prevent that,
  // we decide the control is only ready to make a selection if the pointer
  // moves a certain distance OR if the mouse button is pressed for a certain
  // length of time, otherwise the user is just registering the initial button
  // click rather than selecting an item.
  // For context on some implementation details, see https://github.com/reach/reach-ui/issues/563
  let readyToSelect = React.useRef(false);
  let mouseDownStartPosRef = React.useRef({ x: 0, y: 0 });

  // Trying a new approach for splitting up contexts by stable/unstable
  // references. We'll see how it goes!
  let context: InternalDropdownContextValue = {
    dispatch,
    dropdownId,
    dropdownRef,
    mouseDownStartPosRef,
    popoverRef,
    readyToSelect,
    selectCallbacks,
    state,
    triggerClickedRef,
    triggerRef,
  };

  // When the dropdown is open, focus is placed on the dropdown itself so that
  // keyboard navigation is still possible.
  React.useEffect(() => {
    if (state.isExpanded) {
      // @ts-ignore
      window.__REACH_DISABLE_TOOLTIPS = true;
      window.requestAnimationFrame(() => {
        focus(dropdownRef.current);
      });
    } else {
      // We want to ignore the immediate focus of a tooltip so it doesn't pop up
      // again when the dropdown closes, only pops up when focus returns again
      // to the tooltip (like native OS tooltips).
      // @ts-ignore
      window.__REACH_DISABLE_TOOLTIPS = false;
    }
  }, [state.isExpanded]);

  return (
    <DescendantProvider
      context={DropdownDescendantContext}
      items={descendants}
      set={setDescendants}
    >
      <DropdownContext.Provider value={context}>
        {isFunction(children)
          ? children({
              isExpanded: state.isExpanded,
              // TODO: Remove in 1.0
              isOpen: state.isExpanded,
            })
          : children}
      </DropdownContext.Provider>
    </DescendantProvider>
  );
};

interface DropdownProviderProps {
  children:
    | React.ReactNode
    | ((
        props: DropdownContextValue & {
          // TODO: Remove in 1.0
          isOpen: boolean;
        }
      ) => React.ReactNode);
  id?: string;
}

if (__DEV__) {
  DropdownProvider.displayName = "DropdownProvider";
}

////////////////////////////////////////////////////////////////////////////////

function useDropdownTrigger({
  onKeyDown,
  onMouseDown,
  id,
  ref: forwardedRef,
  ...props
}: DropdownTriggerProps &
  React.ComponentPropsWithoutRef<"button"> & {
    ref: React.ForwardedRef<HTMLButtonElement>;
  }) {
  let {
    dispatch,
    dropdownId,
    mouseDownStartPosRef,
    triggerClickedRef,
    triggerRef,
    state: { triggerId, isExpanded },
  } = useDropdownContext();
  let ref = useComposedRefs(triggerRef, forwardedRef);
  let items = useDropdownDescendants();
  let firstNonDisabledIndex = React.useMemo(
    () => items.findIndex((item) => !item.disabled),
    [items]
  );
  React.useEffect(() => {
    if (id != null && id !== triggerId) {
      dispatch({
        type: SET_BUTTON_ID,
        payload: id,
      });
    }
  }, [triggerId, dispatch, id]);

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault(); // prevent scroll
        dispatch({
          type: OPEN_MENU_AT_INDEX,
          payload: { index: firstNonDisabledIndex },
        });
        break;
      case "Enter":
      case " ":
        dispatch({
          type: OPEN_MENU_AT_INDEX,
          payload: { index: firstNonDisabledIndex },
        });
        break;
      default:
        break;
    }
  }

  function handleMouseDown(event: React.MouseEvent) {
    if (isRightClick(event.nativeEvent)) {
      return;
    }

    mouseDownStartPosRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    if (!isExpanded) {
      triggerClickedRef.current = true;
    }
    if (isExpanded) {
      dispatch({ type: CLOSE_MENU });
    } else {
      dispatch({ type: OPEN_MENU_CLEARED });
    }
  }

  return {
    data: {
      isExpanded,
      controls: dropdownId,
    },
    props: {
      ...props,
      ref,
      id: triggerId || undefined,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
      onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
      type: "button" as const,
    },
  };
}

const DropdownTrigger = React.forwardRef(
  ({ as: Comp = "button", ...rest }, forwardedRef) => {
    let { props } = useDropdownTrigger({ ...rest, ref: forwardedRef });
    return <Comp data-reach-dropdown-trigger="" {...props} />;
  }
) as Polymorphic.ForwardRefComponent<"button", DropdownTriggerProps>;

interface DropdownTriggerProps {
  children: React.ReactNode;
}

if (__DEV__) {
  DropdownTrigger.displayName = "DropdownTrigger";
}

////////////////////////////////////////////////////////////////////////////////

function useDropdownItem({
  index: indexProp,
  isLink = false,
  onClick,
  onDragStart,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onMouseUp,
  onSelect,
  disabled,
  onFocus,
  valueText: valueTextProp,
  ref: forwardedRef,
  ...props
}: DropdownItemProps &
  React.ComponentPropsWithoutRef<"div"> & {
    ref: React.ForwardedRef<HTMLDivElement>;
  }) {
  let {
    dispatch,
    dropdownRef,
    mouseDownStartPosRef,
    readyToSelect,
    selectCallbacks,
    triggerRef,
    state: { selectionIndex, isExpanded },
  } = useDropdownContext();
  let ownRef = React.useRef<HTMLElement | null>(null);
  // After the ref is mounted to the DOM node, we check to see if we have an
  // explicit valueText prop before looking for the node's textContent for
  // typeahead functionality.
  let [valueText, setValueText] = React.useState(valueTextProp || "");

  let setValueTextFromDOM = React.useCallback(
    (node: HTMLElement) => {
      if (!valueTextProp && node?.textContent) {
        setValueText(node.textContent);
      }
    },
    [valueTextProp]
  );

  let mouseEventStarted = React.useRef(false);

  let [element, handleRefSet] = useStatefulRefValue<HTMLElement | null>(
    ownRef,
    null
  );
  let descendant = React.useMemo(() => {
    return {
      element,
      key: valueText,
      disabled,
      isLink,
    };
  }, [disabled, element, isLink, valueText]);
  let index = useDescendant(descendant, DropdownDescendantContext, indexProp);
  let isSelected = index === selectionIndex && !disabled;

  let ref = useComposedRefs(forwardedRef, handleRefSet, setValueTextFromDOM);

  // Update the callback ref array on every render
  selectCallbacks.current[index] = onSelect;

  function select() {
    focus(triggerRef.current);
    onSelect && onSelect();
    dispatch({ type: CLICK_MENU_ITEM });
  }

  function handleClick(event: React.MouseEvent) {
    if (isRightClick(event.nativeEvent)) {
      return;
    }

    if (isLink) {
      if (disabled) {
        event.preventDefault();
      } else {
        select();
      }
    }
  }

  function handleDragStart(event: React.MouseEvent) {
    // Because we don't preventDefault on mousedown for links (we need the
    // native click event), clicking and holding on a link triggers a
    // dragstart which we don't want.
    if (isLink) {
      event.preventDefault();
    }
  }

  function handleMouseDown(event: React.MouseEvent) {
    if (isRightClick(event.nativeEvent)) {
      return;
    }

    if (isLink) {
      // Signal that the mouse is down so we can call the right function if the
      // user is clicking on a link.
      mouseEventStarted.current = true;
    } else {
      event.preventDefault();
    }
  }

  function handleMouseEnter(event: React.MouseEvent) {
    let doc = getOwnerDocument(dropdownRef.current)!;
    if (!isSelected && index != null && !disabled) {
      if (
        dropdownRef?.current &&
        dropdownRef.current !== doc.activeElement &&
        ownRef.current !== doc.activeElement
      ) {
        dropdownRef.current.focus();
      }

      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index,
        },
      });
    }
  }

  function handleMouseLeave(event: React.MouseEvent) {
    // Clear out selection when mouse over a non-dropdown-item child.
    dispatch({ type: CLEAR_SELECTION_INDEX });
  }

  function handleMouseMove(event: React.MouseEvent) {
    if (!readyToSelect.current) {
      let threshold = 8;
      let deltaX = Math.abs(event.clientX - mouseDownStartPosRef.current.x);
      let deltaY = Math.abs(event.clientY - mouseDownStartPosRef.current.y);
      if (deltaX > threshold || deltaY > threshold) {
        readyToSelect.current = true;
      }
    }
    if (!isSelected && index != null && !disabled) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index,
          dropdownRef,
        },
      });
    }
  }

  function handleFocus() {
    readyToSelect.current = true;
    if (!isSelected && index != null && !disabled) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index,
        },
      });
    }
  }

  function handleMouseUp(event: React.MouseEvent) {
    if (isRightClick(event.nativeEvent)) {
      return;
    }

    if (!readyToSelect.current) {
      readyToSelect.current = true;
      return;
    }

    if (isLink) {
      // If a mousedown event was initiated on a link item followed by a mouseup
      // event on the same link, we do nothing; a click event will come next and
      // handle selection. Otherwise, we trigger a click event.
      if (mouseEventStarted.current) {
        mouseEventStarted.current = false;
      } else if (ownRef.current) {
        ownRef.current.click();
      }
    } else {
      if (!disabled) {
        select();
      }
    }
  }

  React.useEffect(() => {
    if (isExpanded) {
      // When the dropdown opens, wait for about half a second before enabling
      // selection. This is designed to mirror dropdown menus on macOS, where
      // opening a menu on top of a trigger would otherwise result in an
      // immediate accidental selection once the click trigger is released.
      let id = window.setTimeout(() => {
        readyToSelect.current = true;
      }, 400);
      return () => {
        window.clearTimeout(id);
      };
    } else {
      // When the dropdown closes, reset readyToSelect for the next interaction.
      readyToSelect.current = false;
    }
  }, [isExpanded, readyToSelect]);

  // Any time a mouseup event occurs anywhere in the document, we reset the
  // mouseEventStarted ref so we can check it again when needed.
  React.useEffect(() => {
    let ownerDocument = getOwnerDocument(ownRef.current)!;
    ownerDocument.addEventListener("mouseup", listener);
    return () => {
      ownerDocument.removeEventListener("mouseup", listener);
    };

    function listener() {
      mouseEventStarted.current = false;
    }
  }, []);

  return {
    data: {
      disabled,
    },
    props: {
      id: useItemId(index),
      tabIndex: -1,
      ...props,
      ref,
      "data-disabled": disabled ? "" : undefined,
      "data-selected": isSelected ? "" : undefined,
      "data-valuetext": valueText,
      onClick: composeEventHandlers(onClick, handleClick),
      onDragStart: composeEventHandlers(onDragStart, handleDragStart),
      onMouseDown: composeEventHandlers(onMouseDown, handleMouseDown),
      onMouseEnter: composeEventHandlers(onMouseEnter, handleMouseEnter),
      onMouseLeave: composeEventHandlers(onMouseLeave, handleMouseLeave),
      onMouseMove: composeEventHandlers(onMouseMove, handleMouseMove),
      onFocus: composeEventHandlers(onFocus, handleFocus),
      onMouseUp: composeEventHandlers(onMouseUp, handleMouseUp),
    },
  };
}

/**
 * DropdownItem
 */
const DropdownItem = React.forwardRef(
  ({ as: Comp = "div", ...rest }, forwardedRef) => {
    let { props } = useDropdownItem({ ...rest, ref: forwardedRef });
    return <Comp data-reach-dropdown-item="" {...props} />;
  }
) as Polymorphic.ForwardRefComponent<"div", DropdownItemProps>;

interface DropdownItemProps {
  children: React.ReactNode;
  onSelect(): void;
  index?: number;
  isLink?: boolean;
  valueText?: string;
  disabled?: boolean;
}

if (__DEV__) {
  DropdownItem.displayName = "DropdownItem";
}

////////////////////////////////////////////////////////////////////////////////

function useDropdownItems({
  id,
  onKeyDown,
  ref: forwardedRef,
  ...props
}: DropdownItemsProps &
  React.ComponentPropsWithoutRef<"div"> & {
    ref: React.ForwardedRef<HTMLDivElement>;
  }) {
  let {
    dispatch,
    triggerRef,
    dropdownRef,
    selectCallbacks,
    dropdownId,
    state: { isExpanded, triggerId, selectionIndex, typeaheadQuery },
  } = useDropdownContext();

  let items = useDropdownDescendants();
  let ref = useComposedRefs(dropdownRef, forwardedRef);

  React.useEffect(() => {
    // Respond to user char key input with typeahead
    let match = findItemFromTypeahead(items, typeaheadQuery);
    if (typeaheadQuery && match != null) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index: match,
          dropdownRef,
        },
      });
    }
    let timeout = window.setTimeout(
      () => typeaheadQuery && dispatch({ type: SEARCH_FOR_ITEM, payload: "" }),
      1000
    );
    return () => window.clearTimeout(timeout);
  }, [dispatch, items, typeaheadQuery, dropdownRef]);

  let prevItemsLength = usePrevious(items.length);
  let prevSelected = usePrevious(items[selectionIndex]);
  let prevSelectionIndex = usePrevious(selectionIndex);

  React.useEffect(() => {
    if (selectionIndex > items.length - 1) {
      // If for some reason our selection index is larger than our possible
      // index range (let's say the last item is selected and the list
      // dynamically updates), we need to select the last item in the list.
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index: items.length - 1,
          dropdownRef,
        },
      });
    } else if (
      // Checks if
      //  - item length has changed
      //  - selection index has not changed BUT selected item has changed
      //
      // This prevents any dynamic adding/removing of items from actually
      // changing a user's expected selection.
      prevItemsLength !== items.length &&
      selectionIndex > -1 &&
      prevSelected &&
      prevSelectionIndex === selectionIndex &&
      items[selectionIndex] !== prevSelected
    ) {
      dispatch({
        type: SELECT_ITEM_AT_INDEX,
        payload: {
          index: items.findIndex((i) => i.key === prevSelected?.key),
          dropdownRef,
        },
      });
    }
  }, [
    dropdownRef,
    dispatch,
    items,
    prevItemsLength,
    prevSelected,
    prevSelectionIndex,
    selectionIndex,
  ]);

  let handleKeyDown = composeEventHandlers(
    function handleKeyDown(event: React.KeyboardEvent) {
      let { key } = event;

      if (!isExpanded) {
        return;
      }

      switch (key) {
        case "Enter":
        case " ":
          let selected = items.find((item) => item.index === selectionIndex);
          // For links, the Enter key will trigger a click by default, but for
          // consistent behavior across items we'll trigger a click when the
          // spacebar is pressed.
          if (selected && !selected.disabled) {
            event.preventDefault();
            if (selected.isLink && selected.element) {
              selected.element.click();
            } else {
              // Focus the button first by default when an item is selected.
              // We fire the onSelect callback next so the app can manage
              // focus if needed.
              focus(triggerRef.current);
              selectCallbacks.current[selected.index] &&
                selectCallbacks.current[selected.index]();
              dispatch({ type: CLICK_MENU_ITEM });
            }
          }
          break;
        case "Escape":
          focus(triggerRef.current);
          dispatch({ type: CLOSE_MENU });
          break;
        case "Tab":
          // prevent leaving
          event.preventDefault();
          break;
        default:
          // Check if a user is typing some char keys and respond by setting
          // the query state.
          if (isString(key) && key.length === 1) {
            let query = typeaheadQuery + key.toLowerCase();
            dispatch({
              type: SEARCH_FOR_ITEM,
              payload: query,
            });
          }
          break;
      }
    },
    useDescendantKeyDown(DropdownDescendantContext, {
      currentIndex: selectionIndex,
      orientation: "vertical",
      rotate: false,
      filter: (item) => !item.disabled,
      callback: (index: number) => {
        dispatch({
          type: SELECT_ITEM_AT_INDEX,
          payload: {
            index,
            dropdownRef,
          },
        });
      },
      key: "index",
    })
  );

  return {
    data: {
      activeDescendant: useItemId(selectionIndex) || undefined,
      triggerId,
    },
    props: {
      tabIndex: -1,
      ...props,
      ref,
      id: dropdownId,
      onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    },
  };
}

/**
 * DropdownItem
 */
const DropdownItems = React.forwardRef(
  ({ as: Comp = "div", ...rest }, forwardedRef) => {
    let { props } = useDropdownItems({ ...rest, ref: forwardedRef });
    return <Comp data-reach-dropdown-items="" {...props} />;
  }
) as Polymorphic.ForwardRefComponent<"div", DropdownItemsProps>;

interface DropdownItemsProps {
  children: React.ReactNode;
}

if (__DEV__) {
  DropdownItems.displayName = "DropdownItems";
}

////////////////////////////////////////////////////////////////////////////////

function useDropdownPopover({
  onBlur,
  portal = true,
  position,
  ref: forwardedRef,
  ...props
}: DropdownPopoverProps &
  React.ComponentPropsWithoutRef<"div"> & {
    ref: React.ForwardedRef<HTMLDivElement>;
  }) {
  let {
    triggerRef,
    triggerClickedRef,
    dispatch,
    dropdownRef,
    popoverRef,
    state: { isExpanded },
  } = useDropdownContext();

  let ref = useComposedRefs(popoverRef, forwardedRef);

  React.useEffect(() => {
    if (!isExpanded) {
      return;
    }

    let ownerDocument = getOwnerDocument(popoverRef.current)!;
    function listener(event: MouseEvent | TouchEvent) {
      if (triggerClickedRef.current) {
        triggerClickedRef.current = false;
      } else if (
        !popoverContainsEventTarget(popoverRef.current, event.target)
      ) {
        // We on want to close only if focus rests outside the dropdown
        dispatch({ type: CLOSE_MENU });
      }
    }
    ownerDocument.addEventListener("mousedown", listener);
    // see https://github.com/reach/reach-ui/pull/700#discussion_r530369265
    // ownerDocument.addEventListener("touchstart", listener);
    return () => {
      ownerDocument.removeEventListener("mousedown", listener);
      // ownerDocument.removeEventListener("touchstart", listener);
    };
  }, [
    triggerClickedRef,
    triggerRef,
    dispatch,
    dropdownRef,
    popoverRef,
    isExpanded,
  ]);

  return {
    data: {
      portal,
      position,
      targetRef: triggerRef,
      isExpanded,
    },
    props: {
      ref,
      hidden: !isExpanded,
      onBlur: composeEventHandlers(onBlur, (event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
        dispatch({ type: CLOSE_MENU });
      }),
      ...props,
    },
  };
}

const DropdownPopover = React.forwardRef(
  ({ as: Comp = "div", ...rest }, forwardedRef) => {
    let {
      data: { portal, targetRef, position },
      props,
    } = useDropdownPopover({ ...rest, ref: forwardedRef });
    let sharedProps = {
      "data-reach-dropdown-popover": "",
    };
    return portal ? (
      <Popover
        {...props}
        {...sharedProps}
        as={Comp}
        targetRef={targetRef as any}
        position={position}
      />
    ) : (
      <Comp {...props} {...sharedProps} />
    );
  }
) as Polymorphic.ForwardRefComponent<"div", DropdownPopoverProps>;

interface DropdownPopoverProps {
  children: React.ReactNode;
  portal?: boolean;
  position?: Position;
}

if (__DEV__) {
  DropdownPopover.displayName = "DropdownPopover";
}

////////////////////////////////////////////////////////////////////////////////

/**
 * When a user's typed input matches the string displayed in an item, it is
 * expected that the matching item is selected. This is our matching function.
 */
function findItemFromTypeahead(
  items: DropdownDescendant[],
  string: string = ""
) {
  if (!string) {
    return null;
  }

  let found = items.find((item) => {
    return item.disabled
      ? false
      : item.element?.dataset?.valuetext?.toLowerCase().startsWith(string);
  });
  return found ? items.indexOf(found) : null;
}

function useItemId(index: number | null) {
  let { dropdownId } = React.useContext(DropdownContext);
  return index != null && index > -1
    ? makeId(`option-${index}`, dropdownId)
    : undefined;
}

interface DropdownState {
  isExpanded: boolean;
  selectionIndex: number;
  triggerId: null | string;
  typeaheadQuery: string;
}

type DropdownAction =
  | { type: "CLICK_MENU_ITEM" }
  | { type: "CLOSE_MENU" }
  | { type: "OPEN_MENU_AT_FIRST_ITEM" }
  | { type: "OPEN_MENU_AT_INDEX"; payload: { index: number } }
  | { type: "OPEN_MENU_CLEARED" }
  | {
      type: "SELECT_ITEM_AT_INDEX";
      payload: {
        dropdownRef?: React.RefObject<HTMLElement | null>;
        index: number;
        max?: number;
        min?: number;
      };
    }
  | { type: "CLEAR_SELECTION_INDEX" }
  | { type: "SET_BUTTON_ID"; payload: string }
  | { type: "SEARCH_FOR_ITEM"; payload: string };

function focus<T extends HTMLElement = HTMLElement>(
  element: T | undefined | null
) {
  element && element.focus();
}

function popoverContainsEventTarget(
  popover: HTMLElement | null,
  target: HTMLElement | EventTarget | null
) {
  return !!(popover && popover.contains(target as HTMLElement));
}

function reducer(
  state: DropdownState,
  action: DropdownAction = {} as DropdownAction
): DropdownState {
  switch (action.type) {
    case CLICK_MENU_ITEM:
      return {
        ...state,
        isExpanded: false,
        selectionIndex: -1,
      };
    case CLOSE_MENU:
      return {
        ...state,
        isExpanded: false,
        selectionIndex: -1,
      };
    case OPEN_MENU_AT_FIRST_ITEM:
      return {
        ...state,
        isExpanded: true,
        selectionIndex: 0,
      };
    case OPEN_MENU_AT_INDEX:
      return {
        ...state,
        isExpanded: true,
        selectionIndex: action.payload.index,
      };
    case OPEN_MENU_CLEARED:
      return {
        ...state,
        isExpanded: true,
        selectionIndex: -1,
      };
    case SELECT_ITEM_AT_INDEX: {
      let { dropdownRef = { current: null } } = action.payload;
      if (
        action.payload.index >= 0 &&
        action.payload.index !== state.selectionIndex
      ) {
        if (dropdownRef.current) {
          let doc = getOwnerDocument(dropdownRef.current);
          if (dropdownRef.current !== doc?.activeElement) {
            dropdownRef.current.focus();
          }
        }

        return {
          ...state,
          selectionIndex:
            action.payload.max != null
              ? Math.min(Math.max(action.payload.index, 0), action.payload.max)
              : Math.max(action.payload.index, 0),
        };
      }
      return state;
    }
    case CLEAR_SELECTION_INDEX:
      return {
        ...state,
        selectionIndex: -1,
      };
    case SET_BUTTON_ID:
      return {
        ...state,
        triggerId: action.payload,
      };
    case SEARCH_FOR_ITEM:
      if (typeof action.payload !== "undefined") {
        return {
          ...state,
          typeaheadQuery: action.payload,
        };
      }
      return state;
    default:
      return state;
  }
}

function useDropdownContext() {
  return React.useContext(DropdownContext);
}

function useDropdownDescendants() {
  return useDescendants(DropdownDescendantContext);
}

////////////////////////////////////////////////////////////////////////////////
// Types

type DropdownDescendant = Descendant<HTMLElement> & {
  key: string;
  isLink: boolean;
  disabled?: boolean;
};

type TriggerRef = React.RefObject<null | HTMLElement>;
type DropdownRef = React.RefObject<null | HTMLElement>;
type PopoverRef = React.RefObject<null | HTMLElement>;

interface InternalDropdownContextValue {
  dispatch: React.Dispatch<DropdownAction>;
  dropdownId: string | undefined;
  dropdownRef: DropdownRef;
  mouseDownStartPosRef: React.MutableRefObject<{ x: number; y: number }>;
  popoverRef: PopoverRef;
  readyToSelect: React.MutableRefObject<boolean>;
  selectCallbacks: React.MutableRefObject<(() => void)[]>;
  state: DropdownState;
  triggerClickedRef: React.MutableRefObject<boolean>;
  triggerRef: TriggerRef;
}

interface DropdownContextValue {
  isExpanded: boolean;
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export type {
  DropdownTriggerProps,
  DropdownItemProps,
  DropdownItemsProps,
  DropdownPopoverProps,
  DropdownProviderProps,
};
export {
  DropdownProvider,
  DropdownTrigger,
  DropdownItem,
  DropdownItems,
  DropdownPopover,
  useDropdownTrigger,
  useDropdownItem,
  useDropdownItems,
  useDropdownPopover,
  useDropdownContext,
  useDropdownDescendants,
};
